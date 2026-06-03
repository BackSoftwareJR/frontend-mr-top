import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  BLOB_PATHS,
  keyframeInputs,
  keyframeOutputs,
  MORPH_SPRING,
  SCROLL_MORPH_KEYFRAMES,
} from '../../data/scrollMorphSchema'

const INPUT = keyframeInputs(SCROLL_MORPH_KEYFRAMES)
const MAX_TRAIL_POINTS = 180
const TRAIL_SAMPLE_MS = 48

const COMPANION_LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-visible'

function useMorphMotion(scrollYProgress) {
  const x = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'x')),
    MORPH_SPRING,
  )
  const y = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'y')),
    MORPH_SPRING,
  )
  const scale = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'scale')),
    MORPH_SPRING,
  )
  const rotate = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'rotate')),
    MORPH_SPRING,
  )
  const pathD = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'path')),
    MORPH_SPRING,
  )
  const fill = useTransform(
    scrollYProgress,
    INPUT,
    keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'color'),
  )
  const fillOpacity = useSpring(
    useTransform(scrollYProgress, INPUT, keyframeOutputs(SCROLL_MORPH_KEYFRAMES, 'opacity')),
    MORPH_SPRING,
  )

  const left = useTransform(x, (v) => `${v}%`)
  const top = useTransform(y, (v) => `${v}%`)

  return { x, y, left, top, scale, rotate, pathD, fill, fillOpacity }
}

function buildTrailPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i += 1) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`
  }
  return d
}

function ScrollTrail({ points }) {
  const pathD = buildTrailPath(points)
  if (!pathD) return null

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      overflow="visible"
    >
      <defs>
        <linearGradient id="scroll-trail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#9B8EC4" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#5CB8A8" stopOpacity="0.65" />
        </linearGradient>
        <filter id="scroll-trail-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="url(#scroll-trail-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
        filter="url(#scroll-trail-glow)"
      />
      <path
        d={pathD}
        fill="none"
        stroke="url(#scroll-trail-gradient)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  )
}

function StaticCompanion() {
  const [center, setCenter] = useState(null)

  useEffect(() => {
    setCenter({
      x: window.innerWidth * 0.82,
      y: window.innerHeight * 0.18,
    })
  }, [])

  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
      {center ? <ScrollTrail points={[center]} /> : null}
      <div
        className="absolute will-change-transform"
        style={{
          left: '82%',
          top: '18%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg
          viewBox="0 0 600 400"
          className="h-[min(52vw,380px)] w-[min(52vw,380px)]"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          <defs>
            <filter id="scroll-morph-blur-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>
          <path
            d={BLOB_PATHS[0]}
            fill="#E07A5F"
            opacity={0.38}
            filter="url(#scroll-morph-blur-static)"
          />
        </svg>
      </div>
    </div>
  )
}

function MorphCompanion() {
  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })

  const { x, y, left, top, scale, rotate, pathD, fill, fillOpacity } =
    useMorphMotion(scrollYProgress)

  const [trailPoints, setTrailPoints] = useState([])
  const lastSampleRef = useRef(0)
  const seededRef = useRef(false)

  const sampleTrailPoint = useCallback(() => {
    const px = (x.get() / 100) * window.innerWidth
    const py = (y.get() / 100) * window.innerHeight

    setTrailPoints((prev) => {
      const last = prev[prev.length - 1]
      if (last && Math.hypot(last.x - px, last.y - py) < 6) return prev
      const next = [...prev, { x: px, y: py }]
      return next.length > MAX_TRAIL_POINTS ? next.slice(-MAX_TRAIL_POINTS) : next
    })
  }, [x, y])

  useEffect(() => {
    if (seededRef.current) return undefined
    seededRef.current = true
    sampleTrailPoint()
    return undefined
  }, [sampleTrailPoint])

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const now = performance.now()
    if (now - lastSampleRef.current < TRAIL_SAMPLE_MS) return
    lastSampleRef.current = now
    sampleTrailPoint()
  })

  useMotionValueEvent(x, 'change', () => {
    const now = performance.now()
    if (now - lastSampleRef.current < TRAIL_SAMPLE_MS) return
    lastSampleRef.current = now
    sampleTrailPoint()
  })

  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
      <ScrollTrail points={trailPoints} />
      <motion.div
        className="absolute will-change-transform"
        style={{
          left,
          top,
          x: '-50%',
          y: '-50%',
          scale,
          rotate,
        }}
      >
        <svg
          viewBox="0 0 600 400"
          className="h-[min(52vw,380px)] w-[min(52vw,380px)]"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          <defs>
            <filter id="scroll-morph-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>
          <motion.path
            d={pathD}
            fill={fill}
            style={{ fillOpacity }}
            filter="url(#scroll-morph-blur)"
          />
        </svg>
      </motion.div>
    </div>
  )
}

export default function ScrollMorphCompanion() {
  const prefersReducedMotion = useReducedMotion()

  return prefersReducedMotion ? <StaticCompanion /> : <MorphCompanion />
}
