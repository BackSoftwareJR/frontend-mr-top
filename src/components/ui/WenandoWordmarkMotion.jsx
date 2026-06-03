import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ACCENT_PALETTE } from './MulticolorHeadingStatic'
import WenandoWordmarkStatic from './WenandoWordmarkStatic'

const EASE = [0.25, 0.46, 0.45, 0.94]
const BRAND_FONT = 'font-brand font-medium tracking-normal'
const WE_CLASS = 'text-slate-800'

const SIZE_STYLES = {
  nav: { word: 'text-2xl sm:text-3xl' },
  sm: { word: 'text-sm tracking-tight' },
  md: { word: 'text-base tracking-tight' },
  lg: { word: 'text-2xl sm:text-3xl tracking-tight' },
}

const MIDDLE = ['a', 'v', 'i', 'g']
const ANDO = ['a', 'n', 'd', 'o']

const CYCLE_MS = {
  wenandoHold: 2400,
  expand: 650,
  navigandoHold: 3000,
  collapse: 650,
}

function fisherYatesShuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function randomLetterColors(count) {
  const pool = []
  while (pool.length < count) {
    pool.push(...ACCENT_PALETTE)
  }
  return fisherYatesShuffle(pool.slice(0, count))
}

function ColoredLetter({ className, children }) {
  return <span className={`inline-block ${className}`}>{children}</span>
}

export default function WenandoWordmarkMotion({ size = 'md', className = '' }) {
  const prefersReducedMotion = useReducedMotion()
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const [expanded, setExpanded] = useState(false)

  const letterColors = useMemo(
    () => randomLetterColors(1 + MIDDLE.length + ANDO.length),
    [],
  )
  const nColor = letterColors[0]
  const middleColors = letterColors.slice(1, 1 + MIDDLE.length)
  const andoColors = letterColors.slice(1 + MIDDLE.length)

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    let cancelled = false
    let timer

    const run = (isExpanded) => {
      if (cancelled) return
      setExpanded(isExpanded)
      const delay = isExpanded ? CYCLE_MS.navigandoHold : CYCLE_MS.wenandoHold
      const transitionMs = isExpanded ? CYCLE_MS.collapse : CYCLE_MS.expand
      timer = window.setTimeout(() => run(!isExpanded), delay + transitionMs)
    }

    timer = window.setTimeout(() => run(true), CYCLE_MS.wenandoHold)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return <WenandoWordmarkStatic size={size} className={className} />
  }

  const wordClass = `inline-flex items-baseline overflow-visible pb-0.5 leading-[1.2] ${BRAND_FONT} ${styles.word} ${className}`
  const middleStagger = 0.07
  const middleBaseDelay = expanded ? 0.08 : 0
  const collapseStagger = 0.05

  return (
    <span className={wordClass} aria-hidden="true">
      <motion.span layout className="inline-flex">
        <span className={`inline-block ${WE_CLASS}`}>w</span>
        <span className={`inline-block ${WE_CLASS}`}>e</span>
      </motion.span>

      <motion.span layout className="inline-block">
        <ColoredLetter className={nColor}>n</ColoredLetter>
      </motion.span>

      <motion.span
        layout
        className="inline-flex overflow-x-hidden overflow-y-visible whitespace-nowrap pb-0.5"
        initial={false}
        animate={{
          maxWidth: expanded ? '4.5ch' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{
          maxWidth: { duration: CYCLE_MS.expand / 1000, ease: EASE },
          opacity: { duration: 0.25, ease: EASE },
        }}
      >
        <span className="inline-flex">
          <AnimatePresence initial={false}>
            {expanded &&
              MIDDLE.map((letter, index) => (
                <motion.span
                  key={letter}
                  initial={{ opacity: 0, y: 6, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.85,
                    transition: {
                      duration: 0.22,
                      delay: (MIDDLE.length - 1 - index) * collapseStagger,
                    },
                  }}
                  transition={{
                    duration: 0.32,
                    delay: middleBaseDelay + index * middleStagger,
                    ease: EASE,
                  }}
                  className={`inline-block ${middleColors[index]}`}
                >
                  {letter}
                </motion.span>
              ))}
          </AnimatePresence>
        </span>
      </motion.span>

      <motion.span layout className="inline-flex">
        {ANDO.map((letter, index) => (
          <ColoredLetter key={`ando-${letter}-${index}`} className={andoColors[index]}>
            {letter}
          </ColoredLetter>
        ))}
      </motion.span>
    </span>
  )
}
