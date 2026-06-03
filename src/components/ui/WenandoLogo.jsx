import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ACCENT_PALETTE } from './MulticolorHeading'

const EASE = [0.25, 0.46, 0.45, 0.94]

const BRAND_FONT = 'font-brand font-medium tracking-normal'

/** Matches hero neutral copy — only "we" stays dark */
const WE_CLASS = 'text-slate-800'

const SIZE_STYLES = {
  nav: {
    word: 'text-2xl sm:text-3xl',
    mark: 'h-14 w-14 sm:h-16 sm:w-16',
  },
  sm: { word: 'text-sm tracking-tight', mark: 'h-9 w-9' },
  md: { word: 'text-base tracking-tight', mark: 'h-9 w-9' },
  lg: { word: 'text-2xl sm:text-3xl tracking-tight', mark: 'h-10 w-10' },
}

const MIDDLE = ['a', 'v', 'i', 'g']
const ANDO = ['a', 'n', 'd', 'o']

/** ms — hold wenando → expand avig → hold navigando → collapse → loop */
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

/** One random accent class per letter, stable for the session (page load). */
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

function WenandoWordmark({ size = 'md', className = '' }) {
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
      timer = window.setTimeout(
        () => run(!isExpanded),
        delay + transitionMs,
      )
    }

    timer = window.setTimeout(() => run(true), CYCLE_MS.wenandoHold)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [prefersReducedMotion])

  const wordClass = `inline-flex items-baseline overflow-visible pb-0.5 leading-[1.2] ${BRAND_FONT} ${styles.word} ${className}`

  if (prefersReducedMotion) {
    return (
      <span className={wordClass} aria-hidden="true">
        <span className={`inline-block ${WE_CLASS}`}>w</span>
        <span className={`inline-block ${WE_CLASS}`}>e</span>
        <ColoredLetter className={nColor}>n</ColoredLetter>
        {ANDO.map((letter, index) => (
          <ColoredLetter key={`ando-${letter}-${index}`} className={andoColors[index]}>
            {letter}
          </ColoredLetter>
        ))}
      </span>
    )
  }

  const middleStagger = 0.07
  const middleBaseDelay = expanded ? 0.08 : 0
  const collapseStagger = 0.05

  return (
    <span className={wordClass} aria-hidden="true">
      {/* we — always dark, never accent */}
      <motion.span layout className="inline-flex">
        <span className={`inline-block ${WE_CLASS}`}>w</span>
        <span className={`inline-block ${WE_CLASS}`}>e</span>
      </motion.span>

      {/* n — start of nando / navigando */}
      <motion.span layout className="inline-block">
        <ColoredLetter className={nColor}>n</ColoredLetter>
      </motion.span>

      {/* avig — animates in/out for navigando moment */}
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

      {/* ando — always visible */}
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

export function WenandoMark({ className }) {
  return (
    <img
      src="/wenando-logo.png"
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${className || 'h-9 w-9'}`}
    />
  )
}

export default function WenandoLogo({
  size = 'md',
  className = '',
  align = 'start',
}) {
  const alignClass =
    align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'

  return (
    <div
      className={`inline-flex min-w-0 overflow-visible ${alignClass} ${className}`}
      aria-label="wenando"
      role="img"
    >
      <WenandoWordmark size={size} />
    </div>
  )
}
