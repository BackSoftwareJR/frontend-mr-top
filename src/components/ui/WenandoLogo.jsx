import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94]

const SIZE_STYLES = {
  sm: {
    word: 'text-sm',
    we: 'text-sm',
    tag: 'text-[9px] tracking-[0.22em]',
  },
  md: {
    word: 'text-base',
    we: 'text-base',
    tag: 'text-[10px] tracking-[0.25em]',
  },
  lg: {
    word: 'text-2xl sm:text-3xl',
    we: 'text-2xl sm:text-3xl',
    tag: 'text-xs tracking-[0.28em]',
  },
  hero: {
    word: 'text-4xl sm:text-5xl md:text-6xl',
    we: 'text-4xl sm:text-5xl md:text-6xl',
    tag: 'text-xs sm:text-sm tracking-[0.32em]',
  },
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

export default function WenandoLogo({
  size = 'md',
  showTagline = false,
  className = '',
  align = 'start',
}) {
  const prefersReducedMotion = useReducedMotion()
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const alignClass =
    align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'

  const instant = prefersReducedMotion

  return (
    <div
      className={`inline-flex flex-col ${alignClass} ${className}`}
      aria-label="Wenando"
      role="img"
    >
      <span
        className={`inline-flex items-baseline font-extrabold leading-none ${styles.word}`}
      >
        <motion.span
          initial={instant ? false : { maxWidth: 0, opacity: 0 }}
          animate={{ maxWidth: '2.75em', opacity: 1 }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: 0.65, delay: 0.55, ease: EASE }
          }
          className="inline-block overflow-hidden align-baseline will-change-[max-width]"
        >
          <span
            className={`inline-block origin-left whitespace-nowrap will-change-transform ${styles.we}`}
            style={{ transformOrigin: '0% 50%' }}
          >
            <span className="bg-gradient-to-r from-[#E07A5F] via-[#E9A84A] to-[#E07A5F] bg-clip-text text-transparent">
              We
            </span>
          </span>
        </motion.span>

        <motion.span
          initial={instant ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={
            instant ? { duration: 0 } : { duration: 0.45, delay: 0.05, ease: EASE }
          }
          className="text-slate-800 will-change-transform"
        >
          nando
        </motion.span>
      </span>

      {showTagline && (
        <motion.span
          initial={instant ? false : { opacity: 0, y: 8, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.18em' }}
          transition={
            instant
              ? { duration: 0 }
              : { duration: 0.7, delay: 1.15, ease: EASE }
          }
          className={`mt-2 font-semibold text-slate-400 uppercase ${styles.tag}`}
        >
          navigando
        </motion.span>
      )}
    </div>
  )
}
