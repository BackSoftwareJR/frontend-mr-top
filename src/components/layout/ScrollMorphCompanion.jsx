import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  BLOB_PATHS,
  buildReadingPathD,
  interpolateReadingPath,
  keyframeInputs,
  keyframeOutputs,
  measureReadingWaypoints,
  MORPH_SPRING,
  READING_PATH_WAYPOINTS,
  SCROLL_MORPH_KEYFRAMES,
} from '../../data/scrollMorphSchema'

const INPUT = keyframeInputs(SCROLL_MORPH_KEYFRAMES)

const COMPANION_LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[5] overflow-visible'

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}

function useReadingWaypoints() {
  const [waypoints, setWaypoints] = useState(READING_PATH_WAYPOINTS)

  const remeasure = useCallback(() => {
    setWaypoints(measureReadingWaypoints())
  }, [])

  useEffect(() => {
    remeasure()
    const t1 = window.setTimeout(remeasure, 120)
    const t2 = window.setTimeout(remeasure, 600)

    window.addEventListener('resize', remeasure, { passive: true })
    window.addEventListener('load', remeasure, { passive: true })

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('load', remeasure)
    }
  }, [remeasure])

  return waypoints
}

function useMorphMotion(scrollYProgress, waypoints) {
  const waypointsRef = useRef(waypoints)
  waypointsRef.current = waypoints

  const pathX = useTransform(scrollYProgress, (p) =>
    interpolateReadingPath(waypointsRef.current, p).xPercent,
  )
  const pathY = useTransform(scrollYProgress, (p) =>
    interpolateReadingPath(waypointsRef.current, p).yPercent,
  )

  const x = useSpring(pathX, MORPH_SPRING)
  const y = useSpring(pathY, MORPH_SPRING)
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

  return { left, top, scale, rotate, pathD, fill, fillOpacity }
}

function ReadingPathTrail({ waypoints, width, height, progress }) {
  const ghostRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  const pathD = useMemo(() => {
    if (!width || !height) return ''
    return buildReadingPathD(waypoints, width, height)
  }, [waypoints, width, height])

  useEffect(() => {
    if (!ghostRef.current || !pathD) return undefined
    const len = ghostRef.current.getTotalLength()
    setPathLength(len)
    return undefined
  }, [pathD, width, height])

  const dashOffset = useMotionValue(pathLength)
  const smoothOffset = useSpring(dashOffset, { stiffness: 90, damping: 32, mass: 0.6 })

  useMotionValueEvent(progress, 'change', (p) => {
    dashOffset.set(pathLength * (1 - p))
  })

  useEffect(() => {
    dashOffset.set(pathLength * (1 - progress.get()))
  }, [pathLength, dashOffset, progress])

  if (!pathD) return null

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      overflow="visible"
    >
      <defs>
        <linearGradient id="reading-path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#9B8EC4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5CB8A8" stopOpacity="0.8" />
        </linearGradient>
        <filter id="reading-path-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ghost guide — full reading path */}
      <path
        ref={ghostRef}
        d={pathD}
        fill="none"
        stroke="url(#reading-path-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.12"
      />

      {/* Active segment — drawn as user scrolls */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#reading-path-gradient)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#reading-path-glow)"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: smoothOffset,
          opacity: 0.55,
        }}
      />

      {/* Bright leading edge */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#reading-path-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: smoothOffset,
          opacity: 0.85,
        }}
      />
    </svg>
  )
}

function StaticCompanion() {
  const { width, height } = useViewportSize()
  const pathD = useMemo(
    () => (width && height ? buildReadingPathD(READING_PATH_WAYPOINTS, width, height) : ''),
    [width, height],
  )

  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
      {pathD ? (
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true" overflow="visible">
          <path
            d={pathD}
            fill="none"
            stroke="#E07A5F"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.12"
          />
        </svg>
      ) : null}
      <div
        className="absolute will-change-transform"
        style={{
          left: '78%',
          top: '14%',
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
            opacity={0.34}
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

  const waypoints = useReadingWaypoints()
  const { width, height } = useViewportSize()
  const { left, top, scale, rotate, pathD, fill, fillOpacity } =
    useMorphMotion(scrollYProgress, waypoints)

  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
      <ReadingPathTrail
        waypoints={waypoints}
        width={width}
        height={height}
        progress={scrollYProgress}
      />
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
