import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  buildProgressLookup,
  buildReadingPathD,
  buildScrollPathRemap,
  computeCtaGlowRanges,
  computeReadingFill,
  computeStatCardGlowRanges,
  computeReadingPathZoneConfig,
  CTA_GLOW_SEGMENTS,
  DOT_SIZE,
  getPathTipPosition,
  HERO_SCROLL_ZONE_END,
  pathVisibleLength,
  READING_STROKE_WIDTH,
  MOBILE_USE_VIEWPORT_REMAP,
  resolveReadingPathProgress,
  measureReadingPathPoints,
} from '../../data/readingPathSchema'

const MOBILE_MEDIA_QUERY = '(max-width: 768px)'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-hidden'

const STROKE_OPACITY = 1
const RESIZE_DEBOUNCE_MS = 150

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_MEDIA_QUERY).matches
      : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA_QUERY)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}

function useDebouncedRemeasure(onRemeasure, delayMs = RESIZE_DEBOUNCE_MS) {
  const timerRef = useRef(null)

  const schedule = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(onRemeasure, delayMs)
  }, [onRemeasure, delayMs])

  useEffect(() => {
    onRemeasure()

    const t1 = window.setTimeout(onRemeasure, 120)
    const t2 = window.setTimeout(onRemeasure, 600)

    window.addEventListener('load', onRemeasure, { passive: true })

    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)

    return () => {
      window.clearTimeout(timerRef.current)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('load', onRemeasure)
      observer.disconnect()
    }
  }, [onRemeasure, schedule])
}

function useCtaAnchorRects() {
  const [rects, setRects] = useState({})

  const remeasure = useCallback(() => {
    const next = {}
    for (const id of CTA_GLOW_SEGMENTS) {
      const el = document.querySelector(`[data-scroll-anchor="${id}"]`)
      if (!el) continue
      const r = el.getBoundingClientRect()
      next[id] = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      }
    }
    setRects(next)
  }, [])

  useDebouncedRemeasure(remeasure)

  return rects
}

function resetReadingCta(btn) {
  btn.style.setProperty('--reading-fill', '0')
  btn.dataset.readingActive = 'false'
  btn.dataset.readingLocked = 'false'
}

function CtaFillSync({ scrollYProgress, glowRanges, remapTableRef, zoneConfigRef, isMobile }) {
  const maxFillRef = useRef({})
  const passedRef = useRef({})

  useEffect(() => {
    if (!glowRanges.length) return undefined

    for (const range of glowRanges) {
      const wrap = document.querySelector(`[data-scroll-anchor="${range.id}"]`)
      const btn = wrap?.querySelector('.reading-line-cta')
      if (btn) resetReadingCta(btn)
    }

    const applyFill = (rawProgress) => {
      const progress = resolveReadingPathProgress(
        rawProgress,
        remapTableRef.current,
        zoneConfigRef.current,
        { isMobile },
      )

      for (const range of glowRanges) {
        const wrap = document.querySelector(`[data-scroll-anchor="${range.id}"]`)
        const btn = wrap?.querySelector('.reading-line-cta')
        if (!btn) continue

        const isReversible =
          range.id === 'hero-cta' || range.id === 'personalized-cta'

        if (isReversible) {
          const fill = computeReadingFill(progress, range)
          btn.style.setProperty('--reading-fill', fill.toFixed(3))
          btn.dataset.readingActive = fill > 0.08 ? 'true' : 'false'
          btn.dataset.readingLocked = fill >= 1 ? 'true' : 'false'
          continue
        }

        const fillEnd = Math.max(range.fillEnd ?? range.end, 0.02)
        const hasPassed =
          passedRef.current[range.id] || progress >= fillEnd

        if (passedRef.current[range.id] || btn.dataset.readingLocked === 'true') {
          passedRef.current[range.id] = true
          maxFillRef.current[range.id] = 1
          btn.dataset.readingLocked = 'true'
          btn.style.setProperty('--reading-fill', '1')
          btn.dataset.readingActive = 'true'
          continue
        }

        if (hasPassed) {
          passedRef.current[range.id] = true
          maxFillRef.current[range.id] = 1
          btn.dataset.readingLocked = 'true'
          btn.style.setProperty('--reading-fill', '1')
          btn.dataset.readingActive = 'true'
          continue
        }

        const instant = computeReadingFill(progress, range)
        const prev = maxFillRef.current[range.id] ?? 0
        const fill = Math.min(1, Math.max(prev, instant))
        maxFillRef.current[range.id] = fill

        btn.style.setProperty('--reading-fill', fill.toFixed(3))
        btn.dataset.readingActive = 'false'
      }
    }

    applyFill(scrollYProgress.get())
    return scrollYProgress.on('change', applyFill)
  }, [scrollYProgress, glowRanges, remapTableRef, zoneConfigRef, isMobile])

  return null
}

function resetReadingStat(card) {
  card.style.setProperty('--reading-fill', '0')
  card.dataset.readingActive = 'false'
  card.dataset.readingLocked = 'false'
}

function resolveStatCard(anchorId) {
  const wrap = document.querySelector(`[data-scroll-anchor="${anchorId}"]`)
  return wrap?.querySelector('.reading-line-stat') ?? wrap
}

/** Stat cards: fill sweeps on pass, reverses when scrolling back up */
function StatCardFillSync({ scrollYProgress, statRanges, remapTableRef, zoneConfigRef, isMobile }) {
  useEffect(() => {
    if (!statRanges.length) return undefined

    for (const range of statRanges) {
      const card = resolveStatCard(range.id)
      if (card) resetReadingStat(card)
    }

    const applyFill = (rawProgress) => {
      const progress = resolveReadingPathProgress(
        rawProgress,
        remapTableRef.current,
        zoneConfigRef.current,
        { isMobile },
      )

      for (const range of statRanges) {
        const card = resolveStatCard(range.id)
        if (!card) continue

        const fill = computeReadingFill(progress, range)
        card.style.setProperty('--reading-fill', fill.toFixed(3))
        card.dataset.readingActive = fill > 0.08 ? 'true' : 'false'
        card.dataset.readingLocked = 'false'
      }
    }

    applyFill(scrollYProgress.get())
    return scrollYProgress.on('change', applyFill)
  }, [scrollYProgress, statRanges, remapTableRef, zoneConfigRef, isMobile])

  return null
}

function CtaGlowOverlays({ scrollYProgress, glowRanges, ctaRects, remapTableRef, zoneConfigRef, isMobile }) {
  if (!glowRanges.length) return null

  return (
    <>
      {glowRanges.map((range) => {
        const rect = ctaRects[range.id]
        if (!rect) return null

        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const size = Math.max(rect.width, rect.height) * 1.05 + 24

        return (
          <CtaGlowRing
            key={range.id}
            scrollYProgress={scrollYProgress}
            range={range}
            cx={cx}
            cy={cy}
            size={size}
            remapTableRef={remapTableRef}
            zoneConfigRef={zoneConfigRef}
            isMobile={isMobile}
          />
        )
      })}
    </>
  )
}

function CtaGlowRing({ scrollYProgress, range, cx, cy, size, remapTableRef, zoneConfigRef, isMobile }) {
  const glowOpacity = useTransform(scrollYProgress, (rawP) => {
    const p = resolveReadingPathProgress(
      rawP,
      remapTableRef.current,
      zoneConfigRef.current,
      { isMobile },
    )
    if (p <= 0 || p < range.start || p > range.end) return 0
    const mid = (range.start + range.end) / 2
    const half = (range.end - range.start) / 2 || 0.01
    const t = 1 - Math.min(1, Math.abs(p - mid) / half)
    return t * 0.55
  })

  return (
    <motion.div
      className="pointer-events-none fixed rounded-full transition-opacity duration-150"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        opacity: glowOpacity,
        background:
          'radial-gradient(circle, rgba(224,122,95,0.28) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  )
}

function ReadingPathLayer({
  scrollY,
  scrollYProgress,
  viewport,
  showCursor,
  ctaRects,
  isMobile,
}) {
  const measurePathRef = useRef(null)
  const lookupRef = useRef({ totalLength: 0, samples: [] })
  const remapTableRef = useRef([])
  const zoneConfigRef = useRef({ pathEnd: 0, scrollEnd: HERO_SCROLL_ZONE_END })
  const [pathD, setPathD] = useState('')
  const [pathLength, setPathLength] = useState(0)
  const [pathRevision, setPathRevision] = useState(0)
  const [glowRanges, setGlowRanges] = useState([])
  const [statRanges, setStatRanges] = useState([])
  const [points, setPoints] = useState([])

  const remeasurePath = useCallback(() => {
    const nextPoints = measureReadingPathPoints()
    setPoints(nextPoints)
    setPathD(buildReadingPathD(nextPoints))
    setPathRevision((revision) => revision + 1)
  }, [])

  useDebouncedRemeasure(remeasurePath)

  useEffect(() => {
    const pathEl = measurePathRef.current
    if (!pathEl || !pathD) {
      lookupRef.current = { totalLength: 0, samples: [] }
      remapTableRef.current = []
      setPathLength(0)
      setGlowRanges([])
      setStatRanges([])
      return undefined
    }

    const lookup = buildProgressLookup(pathEl)
    lookupRef.current = lookup
    setPathLength(lookup.totalLength)
    const ranges = computeCtaGlowRanges(pathEl, points)
    setGlowRanges(ranges)
    setStatRanges(computeStatCardGlowRanges(pathEl))

    const heroRange = ranges.find((r) => r.id === 'hero-cta')
    zoneConfigRef.current = computeReadingPathZoneConfig(
      pathEl,
      points,
      viewport.height,
      { isMobile },
    )
    if (!zoneConfigRef.current.pathEnd && heroRange) {
      zoneConfigRef.current.pathEnd = heroRange.end ?? 0
    }

    const useViewportRemap = isMobile ? MOBILE_USE_VIEWPORT_REMAP : true
    if (viewport.height && useViewportRemap) {
      remapTableRef.current = buildScrollPathRemap(lookup, viewport.height)
    } else {
      remapTableRef.current = []
    }

    return undefined
  }, [pathRevision, viewport.height, isMobile])

  const pathProgress = useTransform(scrollYProgress, (rawP) =>
    resolveReadingPathProgress(rawP, remapTableRef.current, zoneConfigRef.current, {
      isMobile,
    }),
  )

  const strokeDashoffset = useTransform(pathProgress, (p) => {
    const len = lookupRef.current.totalLength || pathLength
    if (!len || p <= 0) return len
    return len - pathVisibleLength(len, p, READING_STROKE_WIDTH)
  })

  const dotOpacity = useTransform(pathProgress, (p) => (p > 0.001 ? 1 : 0))

  /** Path lives in document space; shift by scroll so it tracks the page */
  const pathScrollOffset = useTransform(scrollY, (sy) => -sy)

  const dotCx = useTransform(pathProgress, (p) => {
    const pathEl = measurePathRef.current
    const len = lookupRef.current.totalLength || pathLength
    return getPathTipPosition(pathEl, len, p).x
  })

  const dotCy = useTransform(pathProgress, (p) => {
    const pathEl = measurePathRef.current
    const len = lookupRef.current.totalLength || pathLength
    return getPathTipPosition(pathEl, len, p).y
  })

  const visiblePathRef = useRef(null)

  useMotionValueEvent(strokeDashoffset, 'change', (value) => {
    if (visiblePathRef.current) {
      visiblePathRef.current.style.strokeDashoffset = String(value)
    }
  })

  useEffect(() => {
    if (!visiblePathRef.current) return
    visiblePathRef.current.setAttribute('d', pathD)
    if (pathLength) {
      visiblePathRef.current.style.strokeDasharray = String(pathLength)
      visiblePathRef.current.style.strokeDashoffset = String(
        strokeDashoffset.get(),
      )
    }
  }, [pathRevision, pathLength])

  return (
    <>
      {pathD ? (
        <svg
          className="pointer-events-none absolute left-0 top-0 overflow-visible opacity-0"
          width="1"
          height="1"
          aria-hidden="true"
        >
          <path ref={measurePathRef} d={pathD} fill="none" />
        </svg>
      ) : null}

      {pathD && viewport.width && viewport.height && pathLength > 0 ? (
        <>
          <svg
            className="absolute inset-0 h-full w-full"
            width={viewport.width}
            height={viewport.height}
            aria-hidden="true"
          >
            <defs>
              <clipPath id="wenando-reading-viewport-clip">
                <rect x="0" y="0" width={viewport.width} height={viewport.height} />
              </clipPath>
              <linearGradient id="wenando-reading-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E07A5F" stopOpacity="1" />
                <stop offset="45%" stopColor="#9B8EC4" stopOpacity="1" />
                <stop offset="100%" stopColor="#5CB8A8" stopOpacity="1" />
              </linearGradient>
            </defs>

            <g clipPath="url(#wenando-reading-viewport-clip)">
              <motion.g
                style={{
                  y: pathScrollOffset,
                  willChange: 'transform',
                }}
              >
                <path
                  ref={visiblePathRef}
                  d={pathD}
                  fill="none"
                  stroke="url(#wenando-reading-gradient)"
                  strokeWidth={READING_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={STROKE_OPACITY}
                />
                {showCursor ? (
                  <motion.circle
                    cx={dotCx}
                    cy={dotCy}
                    r={DOT_SIZE / 2 + 0.5}
                    fill="url(#wenando-reading-gradient)"
                    style={{
                      opacity: dotOpacity,
                      willChange: 'cx, cy, opacity',
                    }}
                  />
                ) : null}
              </motion.g>
            </g>
          </svg>

          {showCursor ? (
            <>
              <CtaGlowOverlays
                scrollYProgress={scrollYProgress}
                glowRanges={glowRanges}
                ctaRects={ctaRects}
                remapTableRef={remapTableRef}
                zoneConfigRef={zoneConfigRef}
                isMobile={isMobile}
              />
              <CtaFillSync
                scrollYProgress={scrollYProgress}
                glowRanges={glowRanges}
                remapTableRef={remapTableRef}
                zoneConfigRef={zoneConfigRef}
                isMobile={isMobile}
              />
              <StatCardFillSync
                scrollYProgress={scrollYProgress}
                statRanges={statRanges}
                remapTableRef={remapTableRef}
                zoneConfigRef={zoneConfigRef}
                isMobile={isMobile}
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

function ReadingLineLayer({ reducedMotion, isMobile }) {
  const { scrollY, scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })
  const staticProgress = useMotionValue(0)
  const progress = reducedMotion ? staticProgress : scrollYProgress

  const viewport = useViewportSize()
  const ctaRects = useCtaAnchorRects()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') return null

  const layer = (
    <div className={LAYER_CLASS} aria-hidden="true">
      <ReadingPathLayer
        scrollY={scrollY}
        scrollYProgress={progress}
        viewport={viewport}
        showCursor={!reducedMotion}
        ctaRects={ctaRects}
        isMobile={isMobile}
      />
    </div>
  )

  return createPortal(layer, document.body)
}

export default function ScrollReadingLine() {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  return <ReadingLineLayer reducedMotion={!!prefersReducedMotion} isMobile={isMobile} />
}
