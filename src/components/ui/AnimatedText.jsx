import { motion } from 'framer-motion'
import { useIsMobile } from '../../utils/performanceTier'

const TAG_MAP = {
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function AnimatedText({
  text,
  className = '',
  as = 'span',
  once = true,
  trigger = 'viewport',
}) {
  const isMobile = useIsMobile()
  const Tag = as
  const words = text.split(' ')

  if (isMobile) {
    return (
      <Tag className={className}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block mr-[0.25em]">
            {word}
          </span>
        ))}
      </Tag>
    )
  }

  const MotionTag = TAG_MAP[as] || motion.span
  const motionProps =
    trigger === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: { once, amount: 0.5 } }

  return (
    <MotionTag className={className} variants={containerVariants} {...motionProps}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  )
}
