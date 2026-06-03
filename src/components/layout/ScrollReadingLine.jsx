import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  buildReadingPathD,
  computeCtaGlowRanges,
  CTA_GLOW_SEGMENTS,
  measureReadingPathPoints,
} from '../../data/readingPathSchema'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-visible'

const CURSOR_SPRING = { stiffness: 420, damping: 42, mass: 0.35 }

const STROKE_OPACITY = 0.62

function useDocumentMetrics() {
  const [metrics, setMetrics] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      setMetrics({
        width: document.documentElement.clientWidth,
        height: document.documentElement.scrollHeight,
      })
    }
    update()

    const ro = new ResizeObserver(update)
    ro.observe(document.documentElement)
    window.addEventListener('resize', update, { passive: true })
    window.addEventListener('load', update, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('load', update)
    }
  }, [])

  return metrics
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
        const size = Math.max(rect.width, rect.height) * 1.35 + 48

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
    if (p < range.start || p > range.end) return 0
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
  width,
  height,
  scrollYProgress,
  smoothProgress,
  showCursor,
  onGlowRanges,
}) {
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  const pathD = useMemo(() => buildReadingPathD(points), [points])

  useEffect(() => {
    if (!pathRef.current || !pathD) return undefined
    const len = pathRef.current.getTotalLength()
    setPathLength(len)
    onGlowRanges?.(computeCtaGlowRanges(pathRef.current, points))
    return undefined
  }, [pathD, width, height, points, onGlowRanges])

  const dashOffset = useTransform(scrollYProgress, (p) =>
    pathLength > 0 ? pathLength * (1 - p) : pathLength,
  )

  const cursorX = useTransform(smoothProgress, (p) => {
    if (!pathRef.current || pathLength <= 0) return 0
    return pathRef.current.getPointAtLength(pathLength * p).x
  })

  const cursorY = useTransform(smoothProgress, (p) => {
    if (!pathRef.current || pathLength <= 0) return 0
    return pathRef.current.getPointAtLength(pathLength * p).y
  })

  const cursorTransform = useMotionTemplate`translate(${cursorX}px, ${cursorY}px)`

  if (!pathD || !width || !height) return null

  return (
    <svg
      className="absolute left-0 top-0 overflow-visible"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
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

      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="none"
        visibility="hidden"
      />

      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#wenando-reading-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#wenando-reading-glow)"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: dashOffset,
          opacity: STROKE_OPACITY,
        }}
      />

      {showCursor && pathLength > 0 ? (
        <motion.g
          style={{ transform: cursorTransform }}
          transform="translate(-6, -6)"
        >
          <circle cx="6" cy="6" r="6" fill="url(#wenando-reading-gradient)" opacity="0.95" />
          <circle cx="6" cy="6" r="11" fill="#E07A5F" opacity="0.22" />
        </motion.g>
      ) : null}
    </svg>
  )
}

function ReadingLineLayer({ reducedMotion }) {
  const { scrollY, scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })
  const staticProgress = useMotionValue(1)
  const progress = reducedMotion ? staticProgress : scrollYProgress
  const smoothProgress = useSpring(progress, CURSOR_SPRING)
  const scrollOffsetY = useTransform(scrollY, (y) => -y)

  const points = useReadingPathPoints()
  const { width, height } = useDocumentMetrics()
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
      <motion.div
        className="absolute left-0 top-0 w-full will-change-transform"
        style={{
          height: height || '100%',
          y: scrollOffsetY,
        }}
      >
        <ReadingPathSvg
          points={points}
          width={width}
          height={height}
          scrollYProgress={progress}
          smoothProgress={reducedMotion ? progress : smoothProgress}
          showCursor={!reducedMotion}
          onGlowRanges={handleGlowRanges}
        />
      </motion.div>
    </div>
  )

  return createPortal(layer, document.body)
}

export default function ScrollReadingLine() {
  const prefersReducedMotion = useReducedMotion()
  return <ReadingLineLayer reducedMotion={!!prefersReducedMotion} />
}
