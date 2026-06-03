import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  buildCatmullRomPath,
  buildReadingPathD,
  clampPointToViewport,
  computeCtaGlowRanges,
  CTA_GLOW_SEGMENTS,
  documentToViewport,
  measureReadingPathPoints,
  samplePathToLength,
} from '../../data/readingPathSchema'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-hidden'

const STROKE_OPACITY = 0.62
const PROGRESS_EPSILON = 0.0005
const VIEWPORT_MARGIN = 22

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

function useReadingPathPoints() {
  const [points, setPoints] = useState([])

  const remeasure = useCallback(() => {
    setPoints(measureReadingPathPoints())
  }, [])

  useEffect(() => {
    remeasure()
    const t1 = window.setTimeout(remeasure, 120)
    const t2 = window.setTimeout(remeasure, 600)
    const t3 = window.setTimeout(remeasure, 1400)

    window.addEventListener('resize', remeasure, { passive: true })
    window.addEventListener('load', remeasure, { passive: true })

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('load', remeasure)
    }
  }, [remeasure])

  return points
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

  useEffect(() => {
    remeasure()
    window.addEventListener('resize', remeasure, { passive: true })
    window.addEventListener('scroll', remeasure, { passive: true })
    window.addEventListener('load', remeasure, { passive: true })
    const t = window.setTimeout(remeasure, 400)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', remeasure)
      window.removeEventListener('load', remeasure)
    }
  }, [remeasure])

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
        const size = Math.max(rect.width, rect.height) * 1.2 + 36

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
    if (p <= PROGRESS_EPSILON || p < range.start || p > range.end) return 0
    const mid = (range.start + range.end) / 2
    const half = (range.end - range.start) / 2 || 0.01
    const t = 1 - Math.min(1, Math.abs(p - mid) / half)
    return t * t * 0.95
  })

  const ringScale = useTransform(glowOpacity, (o) => 0.88 + o * 0.14)

  return (
    <motion.div
      className="pointer-events-none fixed rounded-full"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        opacity: glowOpacity,
        scale: ringScale,
        background:
          'radial-gradient(circle, rgba(224,122,95,0.42) 0%, rgba(255,255,255,0.2) 32%, transparent 68%)',
        boxShadow:
          '0 0 48px rgba(224,122,95,0.35), 0 0 96px rgba(155,142,196,0.18), inset 0 0 32px rgba(255,255,255,0.12)',
      }}
      aria-hidden="true"
    />
  )
}

function ReadingPathSvg({
  points,
  scrollY,
  scrollYProgress,
  viewport,
  showCursor,
  onGlowRanges,
}) {
  const measurePathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [visiblePathD, setVisiblePathD] = useState('')
  const [cursorPos, setCursorPos] = useState(null)

  const pathD = useMemo(() => buildReadingPathD(points), [points])

  useEffect(() => {
    if (!measurePathRef.current || !pathD) return undefined
    const len = measurePathRef.current.getTotalLength()
    setPathLength(len)
    onGlowRanges?.(computeCtaGlowRanges(measurePathRef.current, points))
    return undefined
  }, [pathD, points, onGlowRanges])

  const updateVisiblePath = useCallback(
    (progress, scrollOffset) => {
      const pathEl = measurePathRef.current
      if (!pathEl || pathLength <= 0 || progress <= PROGRESS_EPSILON) {
        setVisiblePathD('')
        setCursorPos(null)
        return
      }

      const activeLength = pathLength * progress
      const docSamples = samplePathToLength(pathEl, activeLength)
      if (docSamples.length < 2) {
        setVisiblePathD('')
        setCursorPos(null)
        return
      }

      const viewportPoints = docSamples.map((pt) =>
        documentToViewport(pt, scrollOffset),
      )
      setVisiblePathD(buildCatmullRomPath(viewportPoints))

      const headDoc = pathEl.getPointAtLength(activeLength)
      const headView = documentToViewport(headDoc, scrollOffset)
      setCursorPos(
        clampPointToViewport(headView, viewport, VIEWPORT_MARGIN),
      )
    },
    [pathLength, viewport],
  )

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    updateVisiblePath(p, scrollY.get())
  })

  useMotionValueEvent(scrollY, 'change', (y) => {
    updateVisiblePath(scrollYProgress.get(), y)
  })

  useEffect(() => {
    updateVisiblePath(scrollYProgress.get(), scrollY.get())
  }, [pathLength, pathD, viewport, scrollY, scrollYProgress, updateVisiblePath])

  if (!pathD || !viewport.width || !viewport.height) return null

  const showStroke = visiblePathD.length > 0

  return (
    <>
      <svg
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <path ref={measurePathRef} d={pathD} fill="none" />
      </svg>

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
          <filter id="wenando-reading-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath="url(#wenando-reading-viewport-clip)">
          {showStroke ? (
            <path
              d={visiblePathD}
              fill="none"
              stroke="url(#wenando-reading-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#wenando-reading-glow)"
              opacity={STROKE_OPACITY}
            />
          ) : null}

          {showCursor && cursorPos ? (
            <g transform={`translate(${cursorPos.x - 6}, ${cursorPos.y - 6})`}>
              <circle cx="6" cy="6" r="6" fill="url(#wenando-reading-gradient)" opacity="0.95" />
              <circle cx="6" cy="6" r="11" fill="#E07A5F" opacity="0.22" />
            </g>
          ) : null}
        </g>
      </svg>
    </>
  )
}

function ReadingLineLayer({ reducedMotion }) {
  const { scrollY, scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })
  const staticProgress = useMotionValue(0)
  const progress = reducedMotion ? staticProgress : scrollYProgress

  const points = useReadingPathPoints()
  const viewport = useViewportSize()
  const ctaRects = useCtaAnchorRects()
  const [glowRanges, setGlowRanges] = useState([])
  const [mounted, setMounted] = useState(false)

  const handleGlowRanges = useCallback((ranges) => {
    setGlowRanges(ranges)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') return null

  const layer = (
    <div className={LAYER_CLASS} aria-hidden="true">
      {!reducedMotion ? (
        <CtaGlowOverlays
          scrollYProgress={progress}
          glowRanges={glowRanges}
          ctaRects={ctaRects}
        />
      ) : null}
      <ReadingPathSvg
        points={points}
        scrollY={scrollY}
        scrollYProgress={progress}
        viewport={viewport}
        showCursor={!reducedMotion}
        onGlowRanges={handleGlowRanges}
      />
    </div>
  )

  return createPortal(layer, document.body)
}

export default function ScrollReadingLine() {
  const prefersReducedMotion = useReducedMotion()
  return <ReadingLineLayer reducedMotion={!!prefersReducedMotion} />
}
