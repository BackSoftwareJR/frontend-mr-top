import { motion, useReducedMotion } from 'framer-motion'
import { ACCENT_PALETTE } from './MulticolorHeadingStatic'
import MulticolorHeadingStatic from './MulticolorHeadingStatic'

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

export default function MulticolorHeadingMotion({
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
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion || !animate) {
    return (
      <MulticolorHeadingStatic
        words={words}
        className={className}
        as={as}
        startIndex={startIndex}
        neutralWords={neutralWords}
        trailingAnchorRef={trailingAnchorRef}
        trailingAnchorProps={trailingAnchorProps}
      />
    )
  }

  const MotionTag = TAG_MAP[as] || motion.h2
  const motionProps =
    trigger === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, amount: 0.6 },
        }

  const wordList = normalizeWords(words)

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
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

        return (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
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
          </motion.span>
        )
      })}
    </MotionTag>
  )
}
