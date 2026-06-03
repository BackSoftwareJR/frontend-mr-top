import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
  buildMobileScrollFrameTable,
  buildScrollPathRemap,
  computeCtaGlowRanges,
  computeReadingFill,
  computeStatCardGlowRanges,
  computeReadingPathZoneConfig,
  CTA_GLOW_SEGMENTS,
  DOT_SIZE,
  getPathTipFromLookup,
  HERO_SCROLL_ZONE_END,
  applyMobileScrollFrame,
  MOBILE_SCROLL_REMAP_SAMPLES,
  pathVisibleLength,
  READING_STROKE_WIDTH,
  resolveMobileScrollFrameSampleCount,
  resolveProgressLookupSampleCount,
  resolveReadingPathProgress,
  SCROLL_REMAP_SAMPLES,
  measureReadingPathPoints,
} from '../../data/readingPathSchema'
import { useConstrainedDevice, useIsMobile, useLowCoreDevice } from '../../utils/performanceTier'
import {
  cancelScheduledIdle,
  scheduleIdle,
  supportsScrollTimeline,
} from '../../utils/scheduleIdle'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-hidden [contain:layout]'

const MOBILE_LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-hidden [contain:strict] [transform:translate3d(0,0,0)] [-webkit-transform:translate3d(0,0,0)]'

const STROKE_OPACITY = 1
const RESIZE_DEBOUNCE_MS = 300
const MOBILE_FILL_POLL_MS = 66
const MOBILE_LERP_FACTOR = 0.35
const SCROLL_WILL_CHANGE_IDLE_MS = 150

function lerpMobileFrame(current, target, factor = MOBILE_LERP_FACTOR) {
  current.pathProgress += (target.pathProgress - current.pathProgress) * factor
  current.strokeDashoffset +=
    (target.strokeDashoffset - current.strokeDashoffset) * factor
  current.dotX += (target.dotX - current.dotX) * factor
  current.dotY += (target.dotY - current.dotY) * factor
  current.dotOpacity +=
    (target.dotOpacity - current.dotOpacity) * factor
  return current
}

const MOBILE_FRAME_OUT = {
  pathProgress: 0,
  strokeDashoffset: 0,
  dotX: 0,
  dotY: 0,
  dotOpacity: 0,
}

let cachedScrollMax = 1

function refreshDocumentScrollMax() {
  cachedScrollMax = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  )
}

function getDocumentScrollYProgress() {
  return Math.min(1, Math.max(0, window.scrollY / cachedScrollMax))
}

/** Pause mobile rAF when narrative anchors are off-screen */
function useReadingAnchorsVisible(enabled) {
  const visibleRef = useRef(true)

  useEffect(() => {
    if (!enabled) {
      visibleRef.current = true
      return undefined
    }

    const targets = [
      document.querySelector('[data-scroll-anchor="hero-dot"]'),
      document.querySelector('[data-scroll-anchor="cta-final"]'),
    ].filter(Boolean)

    if (!targets.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((entry) => entry.isIntersecting)
      },
      { root: null, rootMargin: '20% 0px', threshold: 0 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [enabled])

  return visibleRef
}

function useMobileReadingScrollFrame({
  enabled,
  anchorsVisibleRef,
  scrollGroupRef,
  visiblePathRef,
  dotGroupRef,
  dotCircleRef,
  pathProgressRef,
  frameTableRef,
  skipStrokePaint = false,
}) {
  const rafRef = useRef(null)
  const scrollIdleTimerRef = useRef(null)
  const targetRef = useRef({ ...MOBILE_FRAME_OUT })
  const smoothRef = useRef({ ...MOBILE_FRAME_OUT })

  useEffect(() => {
    if (!enabled) return undefined

    refreshDocumentScrollMax()
    const onScrollMaxChange = () => refreshDocumentScrollMax()
    window.addEventListener('resize', onScrollMaxChange, { passive: true })
    window.addEventListener('load', onScrollMaxChange, { passive: true })

    const setDotWillChange = (active) => {
      const dotGroup = dotGroupRef.current
      if (!dotGroup) return
      dotGroup.style.willChange = active ? 'transform' : ''
    }

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)

      if (!anchorsVisibleRef.current) return

      const table = frameTableRef.current
      if (!table.length) return

      const rawP = getDocumentScrollYProgress()
      applyMobileScrollFrame(table, rawP, targetRef.current)
      lerpMobileFrame(smoothRef.current, targetRef.current)
      const frame = smoothRef.current
      const scrollY = window.scrollY

      const group = scrollGroupRef.current
      if (group) {
        group.style.transform = `translate3d(0, ${-scrollY}px, 0)`
      }

      if (!skipStrokePaint) {
        const path = visiblePathRef.current
        if (path) {
          path.style.strokeDashoffset = String(frame.strokeDashoffset)
        }
      }

      const dotGroup = dotGroupRef.current
      const dot = dotCircleRef.current
      if (dotGroup && dot) {
        dotGroup.style.transform = `translate3d(${frame.dotX}px, ${frame.dotY}px, 0)`
        dot.style.opacity = frame.dotOpacity > 0.35 ? '1' : '0'
      }

      pathProgressRef.current = frame.pathProgress
    }

    const onScroll = () => {
      setDotWillChange(true)
      window.clearTimeout(scrollIdleTimerRef.current)
      scrollIdleTimerRef.current = window.setTimeout(() => {
        setDotWillChange(false)
      }, SCROLL_WILL_CHANGE_IDLE_MS)
    }

    rafRef.current = requestAnimationFrame(tick)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(scrollIdleTimerRef.current)
      setDotWillChange(false)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [
    enabled,
    anchorsVisibleRef,
    scrollGroupRef,
    visiblePathRef,
    dotGroupRef,
    dotCircleRef,
    pathProgressRef,
    frameTableRef,
    skipStrokePaint,
  ])
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const timerRef = useRef(null)

  useEffect(() => {
    const commit = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    commit()

    const schedule = () => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(commit, RESIZE_DEBOUNCE_MS)
    }

    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.clearTimeout(timerRef.current)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return size
}

/** Remeasure path when content-visibility sections enter the viewport */
function useDeferredSectionRemeasure(onRemeasure, enabled) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined

    const sections = document.querySelectorAll('.section-deferred')
    if (!sections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onRemeasure()
        }
      },
      { root: null, rootMargin: '12% 0px', threshold: 0 },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [onRemeasure, enabled])
}

function useDebouncedRemeasure(onRemeasure, delayMs = RESIZE_DEBOUNCE_MS, deferInitial = false) {
  const timerRef = useRef(null)
  const idleRef = useRef(null)

  const schedule = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(onRemeasure, delayMs)
  }, [onRemeasure, delayMs])

  useEffect(() => {
    if (deferInitial) {
      idleRef.current = scheduleIdle(onRemeasure, { timeout: 900 })
    } else {
      onRemeasure()
    }

    const t1 = window.setTimeout(onRemeasure, deferInitial ? 400 : 120)
    const t2 = window.setTimeout(onRemeasure, deferInitial ? 900 : 600)

    window.addEventListener('load', onRemeasure, { passive: true })

    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)

    return () => {
      if (idleRef.current !== null) cancelScheduledIdle(idleRef.current)
      window.clearTimeout(timerRef.current)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('load', onRemeasure)
      observer.disconnect()
    }
  }, [onRemeasure, schedule, deferInitial])

  return schedule
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

  useDebouncedRemeasure(remeasure, RESIZE_DEBOUNCE_MS)

  return rects
}

function resetReadingCta(btn) {
  btn.style.setProperty('--reading-fill', '0')
  btn.dataset.readingActive = 'false'
  btn.dataset.readingLocked = 'false'
}

const CtaFillSync = memo(function CtaFillSync({
  pathProgress,
  pathProgressRef,
  glowRanges,
  pollIntervalMs = 0,
}) {
  const buttonsRef = useRef(new Map())
  const maxFillRef = useRef({})
  const passedRef = useRef({})

  useEffect(() => {
    if (!glowRanges.length) return undefined

    const buttons = new Map()
    for (const range of glowRanges) {
      const wrap = document.querySelector(`[data-scroll-anchor="${range.id}"]`)
      const btn = wrap?.querySelector('.reading-line-cta')
      if (btn) {
        buttons.set(range.id, btn)
        resetReadingCta(btn)
      }
    }
    buttonsRef.current = buttons
    maxFillRef.current = {}
    passedRef.current = {}

    const applyFill = (progress) => {
      for (const range of glowRanges) {
        const btn = buttonsRef.current.get(range.id)
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

    if (pollIntervalMs > 0 && pathProgressRef) {
      applyFill(pathProgressRef.current ?? 0)
      const timerId = window.setInterval(() => {
        applyFill(pathProgressRef.current ?? 0)
      }, pollIntervalMs)
      return () => window.clearInterval(timerId)
    }

    applyFill(pathProgress.get())
    return pathProgress.on('change', applyFill)
  }, [pathProgress, pathProgressRef, glowRanges, pollIntervalMs])

  return null
})

function resetReadingStat(card) {
  card.style.setProperty('--reading-fill', '0')
  card.dataset.readingActive = 'false'
  card.dataset.readingLocked = 'false'
}

/** Stat cards: fill sweeps on pass, reverses when scrolling back up */
const StatCardFillSync = memo(function StatCardFillSync({
  pathProgress,
  pathProgressRef,
  statRanges,
  pollIntervalMs = 0,
}) {
  const cardsRef = useRef(new Map())

  useEffect(() => {
    if (!statRanges.length) return undefined

    const cards = new Map()
    for (const range of statRanges) {
      const wrap = document.querySelector(`[data-scroll-anchor="${range.id}"]`)
      const card = wrap?.querySelector('.reading-line-stat') ?? wrap
      if (card) {
        cards.set(range.id, card)
        resetReadingStat(card)
      }
    }
    cardsRef.current = cards

    const applyFill = (progress) => {
      for (const range of statRanges) {
        const card = cardsRef.current.get(range.id)
        if (!card) continue

        const fill = computeReadingFill(progress, range)
        card.style.setProperty('--reading-fill', fill.toFixed(3))
        card.dataset.readingActive = fill > 0.08 ? 'true' : 'false'
        card.dataset.readingLocked = 'false'
      }
    }

    if (pollIntervalMs > 0 && pathProgressRef) {
      applyFill(pathProgressRef.current ?? 0)
      const timerId = window.setInterval(() => {
        applyFill(pathProgressRef.current ?? 0)
      }, pollIntervalMs)
      return () => window.clearInterval(timerId)
    }

    applyFill(pathProgress.get())
    return pathProgress.on('change', applyFill)
  }, [pathProgress, pathProgressRef, statRanges, pollIntervalMs])

  return null
})

const CtaGlowOverlays = memo(function CtaGlowOverlays({
  pathProgress,
  glowRanges,
  ctaRects,
}) {
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
            pathProgress={pathProgress}
            range={range}
            cx={cx}
            cy={cy}
            size={size}
          />
        )
      })}
    </>
  )
})

const CtaGlowRing = memo(function CtaGlowRing({
  pathProgress,
  range,
  cx,
  cy,
  size,
}) {
  const glowOpacity = useTransform(pathProgress, (p) => {
    if (p <= 0 || p < range.start || p > range.end) return 0
    const mid = (range.start + range.end) / 2
    const half = (range.end - range.start) / 2 || 0.01
    const t = 1 - Math.min(1, Math.abs(p - mid) / half)
    return t * 0.55
  })

  return (
    <motion.div
      className="pointer-events-none fixed rounded-full"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        opacity: glowOpacity,
        background:
          'radial-gradient(circle, rgba(224,122,95,0.28) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)',
        willChange: 'opacity',
      }}
      aria-hidden="true"
    />
  )
})

function ReadingPathLayer({
  scrollY,
  scrollYProgress,
  viewport,
  showCursor,
  ctaRects,
  isMobile,
  isConstrained,
  isLowCore,
  simplifiedPath,
}) {
  const measurePathRef = useRef(null)
  const lookupRef = useRef({ totalLength: 0, samples: [] })
  const frameTableRef = useRef(new Float32Array(0))
  const pathProgressRef = useRef(0)
  const mobileFrameOutRef = useRef({ ...MOBILE_FRAME_OUT })
  const remapTableRef = useRef([])
  const zoneConfigRef = useRef({ pathEnd: 0, scrollEnd: HERO_SCROLL_ZONE_END })
  const [pathD, setPathD] = useState('')
  const [pathLength, setPathLength] = useState(0)
  const [pathRevision, setPathRevision] = useState(0)
  const [glowRanges, setGlowRanges] = useState([])
  const [statRanges, setStatRanges] = useState([])
  const [points, setPoints] = useState([])
  const useScrollTimelineStroke = isMobile && supportsScrollTimeline()

  const remeasurePath = useCallback(() => {
    const nextPoints = measureReadingPathPoints()
    setPoints(nextPoints)
    setPathD(buildReadingPathD(nextPoints, { isMobile, simplifiedPath, isConstrained }))
    setPathRevision((revision) => revision + 1)
  }, [isMobile, simplifiedPath, isConstrained])

  useDebouncedRemeasure(remeasurePath, RESIZE_DEBOUNCE_MS, isMobile)
  useDeferredSectionRemeasure(remeasurePath, isMobile)

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

    const sampleCount = resolveProgressLookupSampleCount({ isMobile, isConstrained })
    const lookup = buildProgressLookup(pathEl, sampleCount)
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

    if (!isMobile && viewport.height) {
      remapTableRef.current = buildScrollPathRemap(
        lookup,
        viewport.height,
        undefined,
        isConstrained ? MOBILE_SCROLL_REMAP_SAMPLES : SCROLL_REMAP_SAMPLES,
      )
    } else {
      remapTableRef.current = []
    }

    if (isMobile) {
      frameTableRef.current = buildMobileScrollFrameTable(
        lookup,
        lookup.totalLength,
        remapTableRef.current,
        zoneConfigRef.current,
        resolveMobileScrollFrameSampleCount({ isMobile, isConstrained }),
      )
    } else {
      frameTableRef.current = new Float32Array(0)
    }

    return undefined
  }, [pathRevision, viewport.height, isMobile, isConstrained, pathD, points])

  const pathProgressMobile = useMotionValue(0)
  const pathProgressDesktop = useTransform(scrollYProgress, (rawP) =>
    resolveReadingPathProgress(rawP, remapTableRef.current, zoneConfigRef.current, {
      isMobile: false,
    }),
  )
  const pathProgress = isMobile ? pathProgressMobile : pathProgressDesktop

  const strokeDashoffset = useTransform(pathProgressDesktop, (p) => {
    const len = lookupRef.current.totalLength || pathLength
    if (!len || p <= 0) return len
    return len - pathVisibleLength(len, p, READING_STROKE_WIDTH)
  })

  /** Path lives in document space; shift by scroll so it tracks the page (desktop) */
  const pathScrollOffset = useTransform(scrollY, (sy) => -sy)

  const visiblePathRef = useRef(null)
  const scrollGroupRef = useRef(null)
  const dotGroupRef = useRef(null)
  const dotCircleRef = useRef(null)
  const anchorsVisibleRef = useReadingAnchorsVisible(isMobile && showCursor)

  useMobileReadingScrollFrame({
    enabled: isMobile && showCursor && pathLength > 0 && frameTableRef.current.length > 0,
    anchorsVisibleRef,
    scrollGroupRef,
    visiblePathRef,
    dotGroupRef,
    dotCircleRef,
    pathProgressRef,
    frameTableRef,
    skipStrokePaint: useScrollTimelineStroke,
  })

  useMotionValueEvent(strokeDashoffset, 'change', (value) => {
    if (isMobile) return
    if (visiblePathRef.current) {
      visiblePathRef.current.style.strokeDashoffset = String(value)
    }
  })

  useMotionValueEvent(pathProgressDesktop, 'change', (p) => {
    if (isMobile) return
    const dot = dotCircleRef.current
    if (!dot) return
    const tip = getPathTipFromLookup(lookupRef.current, p)
    dot.setAttribute('cx', String(tip.x))
    dot.setAttribute('cy', String(tip.y))
    dot.setAttribute('opacity', p > 0.001 ? '1' : '0')
  })

  useEffect(() => {
    if (!visiblePathRef.current) return
    visiblePathRef.current.setAttribute('d', pathD)
    if (!pathLength) return

    visiblePathRef.current.style.strokeDasharray = String(pathLength)

    if (isMobile) {
      const rawP = getDocumentScrollYProgress()
      const frame = applyMobileScrollFrame(
        frameTableRef.current,
        rawP,
        mobileFrameOutRef.current,
      )
      if (!useScrollTimelineStroke) {
        visiblePathRef.current.style.strokeDashoffset = String(frame.strokeDashoffset)
      }

      if (scrollGroupRef.current) {
        scrollGroupRef.current.style.transform = `translate3d(0, ${-window.scrollY}px, 0)`
      }

      const dotGroup = dotGroupRef.current
      const dot = dotCircleRef.current
      if (dotGroup && dot) {
        dotGroup.style.transform = `translate3d(${frame.dotX}px, ${frame.dotY}px, 0)`
        dot.style.opacity = frame.dotOpacity > 0 ? '1' : '0'
      }
      pathProgressRef.current = frame.pathProgress
      pathProgressMobile.set(frame.pathProgress)
      return
    }

    visiblePathRef.current.style.strokeDashoffset = String(strokeDashoffset.get())

    if (dotCircleRef.current) {
      const p = pathProgressDesktop.get()
      const tip = getPathTipFromLookup(lookupRef.current, p)
      dotCircleRef.current.setAttribute('cx', String(tip.x))
      dotCircleRef.current.setAttribute('cy', String(tip.y))
      dotCircleRef.current.setAttribute('opacity', p > 0.001 ? '1' : '0')
    }
  }, [
    pathRevision,
    pathLength,
    pathD,
    isMobile,
    pathProgressMobile,
    pathProgressDesktop,
    strokeDashoffset,
    useScrollTimelineStroke,
  ])

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
            style={{ contain: isMobile ? 'strict' : 'layout' }}
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
              {isMobile ? (
                <g ref={scrollGroupRef}>
                  <path
                    ref={visiblePathRef}
                    d={pathD}
                    fill="none"
                    stroke="url(#wenando-reading-gradient)"
                    strokeWidth={READING_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={STROKE_OPACITY}
                    className={useScrollTimelineStroke ? 'reading-path-scroll-driven' : undefined}
                    style={
                      useScrollTimelineStroke
                        ? { '--reading-path-length': String(pathLength) }
                        : undefined
                    }
                  />
                  {showCursor ? (
                    <g ref={dotGroupRef}>
                      <circle
                        ref={dotCircleRef}
                        cx={0}
                        cy={0}
                        r={DOT_SIZE / 2 + 0.5}
                        fill="url(#wenando-reading-gradient)"
                        opacity={0}
                      />
                    </g>
                  ) : null}
                </g>
              ) : (
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
                    <circle
                      ref={dotCircleRef}
                      r={DOT_SIZE / 2 + 0.5}
                      fill="url(#wenando-reading-gradient)"
                      opacity={0}
                      style={{ willChange: 'opacity' }}
                    />
                  ) : null}
                </motion.g>
              )}
            </g>
          </svg>

          {showCursor ? (
            <>
              {!isMobile ? (
                <CtaGlowOverlays
                  pathProgress={pathProgress}
                  glowRanges={glowRanges}
                  ctaRects={ctaRects}
                />
              ) : null}
              <CtaFillSync
                pathProgress={pathProgress}
                pathProgressRef={pathProgressRef}
                glowRanges={glowRanges}
                pollIntervalMs={isMobile ? MOBILE_FILL_POLL_MS : 0}
              />
              <StatCardFillSync
                pathProgress={pathProgress}
                pathProgressRef={pathProgressRef}
                statRanges={statRanges}
                pollIntervalMs={isMobile ? MOBILE_FILL_POLL_MS : 0}
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

function DesktopReadingLineLayer({ reducedMotion, isConstrained }) {
  const { scrollY, scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })
  const staticProgress = useMotionValue(0)
  const progress = reducedMotion ? staticProgress : scrollYProgress
  const simplifiedPath = reducedMotion
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
        isMobile={false}
        isConstrained={isConstrained}
        isLowCore={false}
        simplifiedPath={simplifiedPath}
      />
    </div>
  )

  return createPortal(layer, document.body)
}

function MobileReadingLineLayer({ reducedMotion, isConstrained, isLowCore }) {
  const mobileScrollStubY = useMotionValue(0)
  const mobileScrollStubProgress = useMotionValue(0)
  const simplifiedPath = reducedMotion
  const viewport = useViewportSize()
  const ctaRects = useCtaAnchorRects()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') return null

  const layer = (
    <div className={MOBILE_LAYER_CLASS} aria-hidden="true">
      <ReadingPathLayer
        scrollY={mobileScrollStubY}
        scrollYProgress={mobileScrollStubProgress}
        viewport={viewport}
        showCursor={!reducedMotion}
        ctaRects={ctaRects}
        isMobile
        isConstrained={isConstrained}
        isLowCore={isLowCore}
        simplifiedPath={simplifiedPath}
      />
    </div>
  )

  return createPortal(layer, document.body)
}

function ReadingLineLayer({ reducedMotion, isMobile, isConstrained, isLowCore }) {
  if (isMobile) {
    return (
      <MobileReadingLineLayer
        reducedMotion={reducedMotion}
        isConstrained={isConstrained}
        isLowCore={isLowCore}
      />
    )
  }

  return (
    <DesktopReadingLineLayer
      reducedMotion={reducedMotion}
      isConstrained={isConstrained}
    />
  )
}

export default function ScrollReadingLine() {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const isConstrained = useConstrainedDevice()
  const isLowCore = useLowCoreDevice()
  return (
    <ReadingLineLayer
      reducedMotion={!!prefersReducedMotion}
      isMobile={isMobile}
      isConstrained={isConstrained}
      isLowCore={isLowCore}
    />
  )
}
