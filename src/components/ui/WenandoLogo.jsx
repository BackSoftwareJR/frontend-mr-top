import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ACCENT_PALETTE } from './MulticolorHeading'

const EASE = [0.25, 0.46, 0.45, 0.94]

const SIZE_STYLES = {
  nav: {
    word: 'text-base sm:text-lg tracking-tight',
    mark: 'h-11 w-11 sm:h-12 sm:w-12',
  },
  sm: { word: 'text-sm tracking-tight', mark: 'h-9 w-9' },
  md: { word: 'text-base tracking-tight', mark: 'h-9 w-9' },
  lg: { word: 'text-2xl sm:text-3xl tracking-tight', mark: 'h-10 w-10' },
}

const MIDDLE = ['a', 'v', 'i', 'g']

/** ms — Phase 1 nando → 2 expand → 3 hold navigando → 4 collapse → loop */
const CYCLE_MS = {
  nandoHold: 1200,
  expand: 650,
  navigandoHold: 3000,
  collapse: 650,
}

function colorClass(index) {
  return ACCENT_PALETTE[index % ACCENT_PALETTE.length]
}

function StaticNavigandoWordmark({ styles, className }) {
  const letters = 'navigando'.split('')
  return (
    <span
      className={`inline-flex items-baseline font-extrabold leading-none ${styles.word} ${className}`}
      aria-hidden="true"
    >
      {letters.map((char, i) => (
        <span key={`${char}-${i}`} className={`inline-block ${colorClass(i)}`}>
          {char}
        </span>
      ))}
    </span>
  )
}

function NavigandoWordmark({ size = 'md', className = '' }) {
  const prefersReducedMotion = useReducedMotion()
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    let cancelled = false
    let timer

    const run = (isExpanded) => {
      if (cancelled) return
      setExpanded(isExpanded)
      const delay = isExpanded ? CYCLE_MS.navigandoHold : CYCLE_MS.nandoHold
      const transitionMs = isExpanded ? CYCLE_MS.collapse : CYCLE_MS.expand
      timer = window.setTimeout(
        () => run(!isExpanded),
        delay + transitionMs,
      )
    }

    timer = window.setTimeout(() => run(true), CYCLE_MS.nandoHold)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return <StaticNavigandoWordmark styles={styles} className={className} />
  }

  const middleStagger = 0.07
  const middleBaseDelay = expanded ? 0.08 : 0
  const collapseStagger = 0.05

  return (
    <span
      className={`inline-flex items-baseline font-extrabold leading-none ${styles.word} ${className}`}
      aria-hidden="true"
    >
      {/* n — coral */}
      <motion.span layout className="inline-block">
        <span className={colorClass(0)}>n</span>
      </motion.span>

      {/* avig — width collapses to 0 so n meets an with no gap */}
      <motion.span
        layout
        className="inline-flex overflow-hidden whitespace-nowrap"
        initial={false}
        animate={{
          maxWidth: expanded ? '5ch' : 0,
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
                  className={`inline-block ${colorClass(1 + index)}`}
                >
                  {letter}
                </motion.span>
              ))}
          </AnimatePresence>
        </span>
      </motion.span>

      {/* ando — syllable colors when collapsed, per-letter when expanded */}
      <motion.span layout className="inline-flex">
        {expanded ? (
          <>
            <span className={colorClass(5)}>a</span>
            <span className={colorClass(6)}>n</span>
            <span className={colorClass(7)}>d</span>
            <span className={colorClass(8)}>o</span>
          </>
        ) : (
          <>
            <span className={colorClass(1)}>an</span>
            <span className={colorClass(2)}>do</span>
          </>
        )}
      </motion.span>
    </span>
  )
}

export function WenandoMark({ className }) {
  return (
    <picture>
      <source srcSet="/wenando-logo.png" type="image/png" />
      <img
        src="/wenando-logo.svg"
        alt=""
        aria-hidden="true"
        className={`shrink-0 object-contain ${className || 'h-9 w-9'}`}
      />
    </picture>
  )
}

export default function WenandoLogo({
  size = 'md',
  className = '',
  align = 'start',
}) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const alignClass =
    align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'

  return (
    <div
      className={`inline-flex min-w-0 overflow-visible ${alignClass} ${className}`}
      aria-label="Wenando navigando"
      role="img"
    >
      <NavigandoWordmark size={size} />
    </div>
  )
}
