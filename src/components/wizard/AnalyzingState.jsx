import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import AuroraBackground from '../layout/AuroraBackground'

const MESSAGES = [
  'Analizzando le necessità...',
  'Cercando le opzioni nella tua zona...',
  'Preparando il tuo piano personalizzato...',
]

const MESSAGE_DURATION = 833
const TOTAL_DURATION = 2500
const REDUCED_MOTION_TOTAL = 1200

const springTransition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
}

const containerSpring = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
  mass: 0.9,
}

const instantTransition = { duration: 0 }

export default function AnalyzingState({ onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const totalDuration = prefersReducedMotion ? REDUCED_MOTION_TOTAL : TOTAL_DURATION
    const messageDuration = prefersReducedMotion
      ? Math.floor(totalDuration / MESSAGES.length)
      : MESSAGE_DURATION

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev))
    }, messageDuration)

    const timeout = setTimeout(() => {
      onCompleteRef.current?.()
    }, totalDuration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [prefersReducedMotion])

  const messageTransition = prefersReducedMotion ? instantTransition : springTransition
  const containerTransition = prefersReducedMotion ? instantTransition : containerSpring

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analisi in corso"
    >
      <AuroraBackground />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={containerTransition}
        className="relative z-10 flex flex-col items-center rounded-3xl border border-white/30 bg-white/60 px-10 py-12 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-14 sm:py-14"
        style={{ willChange: prefersReducedMotion ? undefined : 'transform, opacity' }}
      >
        <div className="relative mb-8 h-16 w-16" aria-hidden="true">
          {prefersReducedMotion ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-teal-800 shadow-[0_0_12px_rgba(17,94,89,0.35)]" />
            </div>
          ) : (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-teal-800/10"
                animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                style={{ willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-teal-800/12"
                animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.15, 0.55] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: [0.45, 0, 0.55, 1],
                  delay: 0.35,
                }}
                style={{ willChange: 'transform, opacity' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="h-3 w-3 rounded-full bg-teal-800 shadow-[0_0_12px_rgba(17,94,89,0.35)]"
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                  style={{ willChange: 'transform' }}
                />
              </div>
            </>
          )}
        </div>

        <div className="relative h-7 w-full max-w-xs overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={messageIndex}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
              transition={messageTransition}
              className="absolute inset-x-0 text-sm font-medium tracking-tight text-slate-800 sm:text-base"
              style={{ willChange: prefersReducedMotion ? undefined : 'transform, opacity' }}
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
