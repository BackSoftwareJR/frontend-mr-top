import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  buildReadingPathD,
  measureReadingPathPoints,
} from '../../data/readingPathSchema'

const LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-visible'

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

function ReadingPathSvg({ points, width, height, scrollYProgress, showCursor }) {
  const ghostRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  const pathD = useMemo(() => buildReadingPathD(points), [points])

  useEffect(() => {
    if (!ghostRef.current || !pathD) return undefined
    setPathLength(ghostRef.current.getTotalLength())
    return undefined
  }, [pathD, width, height])

  const dashOffset = useTransform(scrollYProgress, (p) =>
    pathLength > 0 ? pathLength * (1 - p) : 0,
  )

  const cursorX = useTransform(scrollYProgress, (p) => {
    if (!ghostRef.current || pathLength <= 0) return 0
    return ghostRef.current.getPointAtLength(pathLength * p).x
  })

  const cursorY = useTransform(scrollYProgress, (p) => {
    if (!ghostRef.current || pathLength <= 0) return 0
    return ghostRef.current.getPointAtLength(pathLength * p).y
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
          <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#9B8EC4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5CB8A8" stopOpacity="0.85" />
        </linearGradient>
        <filter id="wenando-reading-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        ref={ghostRef}
        d={pathD}
        fill="none"
        stroke="url(#wenando-reading-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.1"
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
          opacity: 0.48,
        }}
      />

      {showCursor && pathLength > 0 ? (
        <motion.g
          style={{ transform: cursorTransform }}
          transform="translate(-5, -5)"
        >
          <circle cx="5" cy="5" r="5" fill="#E07A5F" opacity="0.9" />
          <circle cx="5" cy="5" r="9" fill="#E07A5F" opacity="0.18" />
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
  const scrollOffsetY = useTransform(scrollY, (y) => -y)

  const points = useReadingPathPoints()
  const { width, height } = useDocumentMetrics()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') return null

  const layer = (
    <div className={LAYER_CLASS} aria-hidden="true">
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
          showCursor={!reducedMotion}
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
