import { motion, useReducedMotion } from 'framer-motion'
import { HomePageContent } from '../components/home/HeroSection'
import ScrollReadingLine from '../components/layout/ScrollReadingLine'
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle'
import { useIsMobile } from '../utils/performanceTier'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function Home() {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()
  const lightMotion = isMobile || prefersReducedMotion

  usePrefetchOnIdle(['/wizard'])

  return (
    <motion.div
      variants={pageVariants}
      initial={lightMotion ? false : 'initial'}
      animate={lightMotion ? undefined : 'animate'}
      exit={lightMotion ? undefined : 'exit'}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative min-h-screen"
    >
      <ScrollReadingLine />
      <HomePageContent />
    </motion.div>
  )
}
