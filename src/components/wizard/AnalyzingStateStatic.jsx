import { useEffect, useRef, useState } from 'react'
import AuroraBackground from '../layout/AuroraBackground'

const MESSAGES = [
  'Analizzando le necessità...',
  'Cercando le opzioni nella tua zona...',
  'Preparando il tuo piano personalizzato...',
]

const TOTAL_DURATION = 2500

/** Mobile / lightweight analyzing screen — no framer-motion on the critical path. */
export default function AnalyzingStateStatic({ onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const messageDuration = Math.floor(TOTAL_DURATION / MESSAGES.length)

    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev))
    }, messageDuration)

    const timeout = window.setTimeout(() => {
      onCompleteRef.current?.()
    }, TOTAL_DURATION)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analisi in corso"
    >
      <AuroraBackground />

      <div className="relative z-10 flex flex-col items-center rounded-3xl border border-white/30 bg-white/60 px-10 py-12 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-14 sm:py-14">
        <div className="relative mb-8 flex h-16 w-16 items-center justify-center" aria-hidden="true">
          <span className="absolute h-12 w-12 animate-ping rounded-full bg-teal-800/10" />
          <span className="h-3 w-3 rounded-full bg-teal-800 shadow-[0_0_12px_rgba(17,94,89,0.35)]" />
        </div>

        <p className="min-h-7 text-sm font-medium tracking-tight text-slate-800 sm:text-base">
          {MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  )
}
