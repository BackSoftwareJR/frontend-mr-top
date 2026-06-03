import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  buildProgressLookup,
  buildReadingPathD,
  clampPointToViewport,
  computeCtaGlowRanges,
  CTA_GLOW_SEGMENTS,
  documentToViewport,
  interpolateProgressLookup,
  measureReadingPathPoints,
} from '../../data/readingPathSchema'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-hidden'

const STROKE_OPACITY = 0.62
const VIEWPORT_MARGIN = 22
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

function CtaGlowOverlays({ scrollYProgress, glowRanges, ctaRects }) {
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
          />
        )
      })}
    </>
  )
}

function CtaGlowRing({ scrollYProgress, range, cx, cy, size }) {
  const glowOpacity = useTransform(scrollYProgress, (p) => {
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
}) {
  const measurePathRef = useRef(null)
  const lookupRef = useRef({ totalLength: 0, samples: [] })
  const viewportRef = useRef(viewport)
  const [pathD, setPathD] = useState('')
  const [pathLength, setPathLength] = useState(0)
  const [glowRanges, setGlowRanges] = useState([])
  const [points, setPoints] = useState([])

  const remeasurePath = useCallback(() => {
    const nextPoints = measureReadingPathPoints()
    setPoints(nextPoints)
    setPathD(buildReadingPathD(nextPoints))
  }, [])

  useDebouncedRemeasure(remeasurePath)

  useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

  useEffect(() => {
    const pathEl = measurePathRef.current
    if (!pathEl || !pathD) {
      lookupRef.current = { totalLength: 0, samples: [] }
      setPathLength(0)
      setGlowRanges([])
      return undefined
    }

    const lookup = buildProgressLookup(pathEl)
    lookupRef.current = lookup
    setPathLength(lookup.totalLength)
    setGlowRanges(computeCtaGlowRanges(pathEl, points))
    return undefined
  }, [pathD, points])

  const pathYOffset = useTransform(scrollY, (y) => -y)

  const strokeDashoffset = useTransform(scrollYProgress, (p) => {
    const len = lookupRef.current.totalLength || pathLength
    if (!len || p <= 0) return len
    return len * (1 - p)
  })

  const cursorOpacity = useTransform(scrollYProgress, (p) => (p > 0 ? 1 : 0))

  const cursorLeft = useTransform(
    [scrollYProgress, scrollY],
    ([p, scrollOffset]) => {
      if (p <= 0) return 0
      const pt = interpolateProgressLookup(lookupRef.current, p)
      const view = documentToViewport(pt, scrollOffset)
      return clampPointToViewport(view, viewportRef.current, VIEWPORT_MARGIN).x - 6
    },
  )

  const cursorTop = useTransform(
    [scrollYProgress, scrollY],
    ([p, scrollOffset]) => {
      if (p <= 0) return 0
      const pt = interpolateProgressLookup(lookupRef.current, p)
      const view = documentToViewport(pt, scrollOffset)
      return clampPointToViewport(view, viewportRef.current, VIEWPORT_MARGIN).y - 6
    },
  )

  return (
    <>
      {pathD ? (
        <svg
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
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
              <motion.g style={{ y: pathYOffset }}>
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#wenando-reading-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={STROKE_OPACITY}
                  style={{
                    strokeDasharray: pathLength,
                    strokeDashoffset,
                    willChange: 'stroke-dashoffset',
                  }}
                />
              </motion.g>
            </g>
          </svg>

          {showCursor ? (
            <motion.div
              className="pointer-events-none absolute h-3 w-3 rounded-full"
              style={{
                left: cursorLeft,
                top: cursorTop,
                opacity: cursorOpacity,
                background:
                  'linear-gradient(180deg, #E07A5F 0%, #9B8EC4 45%, #5CB8A8 100%)',
                boxShadow: '0 0 10px rgba(224,122,95,0.35)',
                willChange: 'left, top, opacity',
              }}
              aria-hidden="true"
            />
          ) : null}

          {showCursor ? (
            <CtaGlowOverlays
              scrollYProgress={scrollYProgress}
              glowRanges={glowRanges}
              ctaRects={ctaRects}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
}

function ReadingLineLayer({ reducedMotion }) {
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
      />
    </div>
  )

  return createPortal(layer, document.body)
}

export default function ScrollReadingLine() {
  const prefersReducedMotion = useReducedMotion()
  return <ReadingLineLayer reducedMotion={!!prefersReducedMotion} />
}
