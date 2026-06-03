import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  BLOB_PATHS,
  keyframeInputs,
  keyframeOutputs,
  MORPH_SPRING,
  SCROLL_MORPH_KEYFRAMES,
} from '../../data/scrollMorphSchema'

const INPUT = keyframeInputs(SCROLL_MORPH_KEYFRAMES)

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

  return { left, top, scale, rotate, pathD, fill, fillOpacity }
}

const COMPANION_LAYER_CLASS =
  'pointer-events-none fixed inset-0 z-[1] overflow-visible'

function StaticCompanion() {
  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
      <div
        className="absolute will-change-transform"
        style={{
          left: '50%',
          top: '22%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg
          viewBox="0 0 600 400"
          className="h-[min(42vw,400px)] w-[min(42vw,400px)]"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          <path
            d={BLOB_PATHS[0]}
            fill="#E07A5F"
            opacity={0.15}
            filter="url(#scroll-morph-blur-static)"
          />
          <defs>
            <filter id="scroll-morph-blur-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function MorphCompanion() {
  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end end'],
  })

  const { left, top, scale, rotate, pathD, fill, fillOpacity } =
    useMorphMotion(scrollYProgress)

  return (
    <div className={COMPANION_LAYER_CLASS} aria-hidden="true">
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
          className="h-[min(45vw,420px)] w-[min(45vw,420px)]"
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
        >
          <defs>
            <filter id="scroll-morph-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const content = prefersReducedMotion ? <StaticCompanion /> : <MorphCompanion />

  return createPortal(content, document.body)
}
