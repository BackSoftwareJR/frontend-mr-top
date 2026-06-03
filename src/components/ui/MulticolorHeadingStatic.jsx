export const ACCENT_PALETTE = [
  'text-[#E07A5F]',
  'text-[#E9A84A]',
  'text-[#9B8EC4]',
  'text-[#5CB8A8]',
  'text-[#E879A0]',
]

function normalizeWords(words) {
  if (typeof words === 'string') {
    return words.split(/\s+/).filter(Boolean)
  }
  return words
}

function splitTrailingPeriod(word) {
  if (word.endsWith('.')) {
    return { text: word.slice(0, -1), period: '.' }
  }
  return { text: word, period: null }
}

export default function MulticolorHeadingStatic({
  words,
  className = '',
  as: Tag = 'h2',
  startIndex = 0,
  neutralWords = [],
  trailingAnchorRef = null,
  trailingAnchorProps = {},
}) {
  const wordList = normalizeWords(words)

  return (
    <Tag className={className}>
      {wordList.map((word, index) => {
        const isLast = index === wordList.length - 1
        const isNeutral = neutralWords.includes(index)
        const colorClass = isNeutral
          ? 'text-slate-800'
          : ACCENT_PALETTE[(startIndex + index) % ACCENT_PALETTE.length]
        const { text, period } =
          isLast && trailingAnchorRef ? splitTrailingPeriod(word) : { text: word, period: null }
        const displayWord = period ? text : word

        return (
          <span
            key={`${word}-${index}`}
            className={`inline-block mr-[0.25em] ${colorClass}`}
          >
            {displayWord}
            {period ? (
              <span
                ref={trailingAnchorRef}
                className="inline-block w-[0.28em] text-center align-baseline leading-none"
                {...trailingAnchorProps}
              >
                {period}
              </span>
            ) : null}
          </span>
        )
      })}
    </Tag>
  )
}
