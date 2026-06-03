import { useMemo } from 'react'
import { ACCENT_PALETTE } from './MulticolorHeadingStatic'

const BRAND_FONT = 'font-brand font-medium tracking-normal'
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

const ANDO = ['a', 'n', 'd', 'o']

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

export default function WenandoWordmarkStatic({ size = 'md', className = '' }) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const letterColors = useMemo(() => randomLetterColors(1 + ANDO.length), [])
  const nColor = letterColors[0]
  const andoColors = letterColors.slice(1)

  const wordClass = `inline-flex items-baseline overflow-visible pb-0.5 leading-[1.2] ${BRAND_FONT} ${styles.word} ${className}`

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
