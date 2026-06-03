import { motion } from 'framer-motion'

export const ACCENT_PALETTE = [
  'text-[#E07A5F]',
  'text-[#E9A84A]',
  'text-[#9B8EC4]',
  'text-[#5CB8A8]',
  'text-[#E879A0]',
]

const TAG_MAP = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const wordVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

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

export default function MulticolorHeading({
  words,
  className = '',
  as = 'h2',
  animate = true,
  trigger = 'viewport',
  startIndex = 0,
  neutralWords = [],
  trailingAnchorRef = null,
  trailingAnchorProps = {},
}) {
  const MotionTag = TAG_MAP[as] || motion.h2
  const wordList = normalizeWords(words)

  const motionProps = animate
    ? trigger === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, amount: 0.6 },
        }
    : {}

  return (
    <MotionTag
      className={className}
      variants={animate ? containerVariants : undefined}
      {...motionProps}
    >
      {wordList.map((word, index) => {
        const isLast = index === wordList.length - 1
        const isNeutral = neutralWords.includes(index)
        const colorClass = isNeutral
          ? 'text-slate-800'
          : ACCENT_PALETTE[(startIndex + index) % ACCENT_PALETTE.length]
        const { text, period } =
          isLast && trailingAnchorRef ? splitTrailingPeriod(word) : { text: word, period: null }
        const displayWord = period ? text : word
        const Tag = animate ? motion.span : 'span'
        const tagProps = animate ? { variants: wordVariants } : {}

        return (
          <Tag
            key={`${word}-${index}`}
            {...tagProps}
            className={`inline-block mr-[0.25em] ${colorClass}`}
          >
            {displayWord}
            {period ? (
              <span
                ref={trailingAnchorRef}
                className="inline-block"
                {...trailingAnchorProps}
              >
                {period}
              </span>
            ) : null}
          </Tag>
        )
      })}
    </MotionTag>
  )
}
