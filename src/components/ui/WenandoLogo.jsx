import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ACCENT_PALETTE } from './MulticolorHeading'

const EASE = [0.25, 0.46, 0.45, 0.94]

const BRAND_FONT = 'font-brand font-medium tracking-normal'

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

/** ms — hold Wenando → expand avig → hold navigando → collapse → loop */
const CYCLE_MS = {
  wenandoHold: 2400,
  expand: 650,
  navigandoHold: 3000,
  collapse: 650,
}

function shufflePalette() {
  const shuffled = [...ACCENT_PALETTE]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function WenandoWordmark({ size = 'md', className = '', colors }) {
  const prefersReducedMotion = useReducedMotion()
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const [expanded, setExpanded] = useState(false)

  const colorAt = (index) => colors[index % colors.length]

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
    const letters = 'Wenando'.split('')
    return (
      <span className={wordClass} aria-hidden="true">
        {letters.map((char, i) => (
          <span key={`${char}-${i}`} className={`inline-block ${colorAt(i)}`}>
            {char}
          </span>
        ))}
      </span>
    )
  }

  const middleStagger = 0.07
  const middleBaseDelay = expanded ? 0.08 : 0
  const collapseStagger = 0.05

  return (
    <span className={wordClass} aria-hidden="true">
      {/* We — always visible */}
      <motion.span layout className="inline-flex">
        <span className={`inline-block ${colorAt(0)}`}>W</span>
        <span className={`inline-block ${colorAt(1)}`}>e</span>
      </motion.span>

      {/* n — always visible */}
      <motion.span layout className="inline-block">
        <span className={colorAt(2)}>n</span>
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
                  className={`inline-block ${colorAt(3 + index)}`}
                >
                  {letter}
                </motion.span>
              ))}
          </AnimatePresence>
        </span>
      </motion.span>

      {/* ando — always visible; per-letter when expanded */}
      <motion.span layout className="inline-flex">
        {expanded ? (
          <>
            <span className={colorAt(7)}>a</span>
            <span className={colorAt(8)}>n</span>
            <span className={colorAt(9)}>d</span>
            <span className={colorAt(10)}>o</span>
          </>
        ) : (
          <>
            <span className={colorAt(3)}>a</span>
            <span className={colorAt(4)}>n</span>
            <span className={colorAt(5)}>d</span>
            <span className={colorAt(6)}>o</span>
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
  const colors = useMemo(() => shufflePalette(), [])
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const alignClass =
    align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'

  return (
    <div
      className={`inline-flex min-w-0 overflow-visible ${alignClass} ${className}`}
      aria-label="Wenando"
      role="img"
    >
      <WenandoWordmark size={size} colors={colors} />
    </div>
  )
}
