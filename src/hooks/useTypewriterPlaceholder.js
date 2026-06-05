import { useEffect, useState } from 'react'

const DEFAULT_EXAMPLES = [
  'RSA Milano',
  'RSA con convenzione ASL',
  'Costi badante a domicilio',
  'Badante convivente h24',
  'Aiuto per mamma anziana',
  'Assistenza domiciliare Roma',
  'Casa di riposo Torino',
  'Centro diurno per anziani',
  'Quanto costa una RSA?',
  'Come scegliere una badante',
  'Evitare truffe badanti',
  'Infermiere a domicilio',
  'Patto di non autolesionismo',
  'Struttura per Alzheimer',
]

const TYPING_MS = 62
const ERASING_MS = 34
const PAUSE_TYPED_MS = 2200
const PAUSE_ERASED_MS = 420

/**
 * Cycles placeholder text letter-by-letter; respects prefers-reduced-motion.
 */
export function useTypewriterPlaceholder(examples = DEFAULT_EXAMPLES) {
  const [text, setText] = useState(() => {
    if (typeof window === 'undefined') return examples[0] ?? ''
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return examples[0] ?? ''
    }
    return ''
  })

  useEffect(() => {
    if (!examples.length) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return undefined

    let exampleIndex = 0
    let charIndex = 0
    let erasing = false
    let timerId = null

    const schedule = (delay, fn) => {
      timerId = window.setTimeout(fn, delay)
    }

    const tick = () => {
      const current = examples[exampleIndex] ?? ''

      if (!erasing) {
        charIndex += 1
        setText(current.slice(0, charIndex))

        if (charIndex >= current.length) {
          schedule(PAUSE_TYPED_MS, () => {
            erasing = true
            tick()
          })
          return
        }

        schedule(TYPING_MS, tick)
        return
      }

      charIndex -= 1
      setText(current.slice(0, charIndex))

      if (charIndex <= 0) {
        erasing = false
        exampleIndex = (exampleIndex + 1) % examples.length
        schedule(PAUSE_ERASED_MS, tick)
        return
      }

      schedule(ERASING_MS, tick)
    }

    charIndex = 0
    erasing = false
    exampleIndex = 0
    schedule(PAUSE_ERASED_MS, tick)

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        window.clearTimeout(timerId)
        setText(examples[0])
      }
    }

    reducedMotion.addEventListener('change', onMotionChange)

    return () => {
      window.clearTimeout(timerId)
      reducedMotion.removeEventListener('change', onMotionChange)
    }
  }, [examples])

  return text
}
