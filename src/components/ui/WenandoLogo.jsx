import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94]

const SIZE_STYLES = {
  nav: { word: 'text-[15px] sm:text-base' },
  sm: { word: 'text-sm' },
  md: { word: 'text-base' },
  lg: { word: 'text-2xl sm:text-3xl' },
}

const MIDDLE_LETTERS = ['a', 'v', 'i', 'g']

const TIMING = {
  hold: 0.2,
  splitDuration: 0.6,
  letterStagger: 0.08,
  letterDelay: 0.55,
  letterDuration: 0.38,
}

export function WenandoMark({ className = 'h-9 w-9' }) {
  return (
    <picture>
      <source srcSet="/wenando-logo.png" type="image/png" />
      <img
        src="/wenando-logo.svg"
        alt=""
        aria-hidden="true"
        className={`shrink-0 object-contain ${className}`}
      />
    </picture>
  )
}

function NavigandoWordmark({ size = 'md', className = '' }) {
  const prefersReducedMotion = useReducedMotion()
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md

  if (prefersReducedMotion) {
    return (
      <span
        className={`inline-block font-extrabold leading-none text-slate-800 ${styles.word} ${className}`}
      >
        navigando
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-baseline font-extrabold leading-none ${styles.word} ${className}`}
    >
      <motion.span
        initial={{ x: 6 }}
        animate={{ x: -5 }}
        transition={{
          duration: TIMING.splitDuration,
          delay: TIMING.hold,
          ease: EASE,
        }}
        className="inline-block will-change-transform"
      >
        <span className="bg-gradient-to-r from-[#E07A5F] via-[#E9A84A] to-[#E07A5F] bg-clip-text text-transparent">
          n
        </span>
      </motion.span>

      <motion.span
        className="inline-flex items-baseline overflow-visible"
        initial={{ width: '0.35em' }}
        animate={{ width: 'auto' }}
        transition={{
          duration: TIMING.splitDuration,
          delay: TIMING.hold,
          ease: EASE,
        }}
      >
        {MIDDLE_LETTERS.map((letter, index) => (
          <motion.span
            key={letter}
            initial={{ opacity: 0, y: 8, scale: 0.75, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{
              duration: TIMING.letterDuration,
              delay: TIMING.letterDelay + index * TIMING.letterStagger,
              ease: EASE,
            }}
            className="inline-block text-slate-800 will-change-transform"
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>

      <motion.span
        initial={{ x: -6 }}
        animate={{ x: 5 }}
        transition={{
          duration: TIMING.splitDuration,
          delay: TIMING.hold,
          ease: EASE,
        }}
        className="inline-block text-slate-800 will-change-transform"
      >
        ando
      </motion.span>
    </span>
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
      aria-label="Wenando navigando"
      role="img"
    >
      <NavigandoWordmark size={size} />
    </div>
  )
}
