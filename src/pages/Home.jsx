import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HomePageContent } from '../components/home/HeroSection'
import ScrollReadingLine from '../components/layout/ScrollReadingLine'
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle'
import { useIsMobile } from '../utils/performanceTier'
import { prefetchRoute } from '../utils/routePrefetch'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function Home() {
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  usePrefetchOnIdle(['/wizard'])

  useEffect(() => {
    if (!isMobile) return undefined

    const warm = () => {
      prefetchRoute('/pro/registrati')
      prefetchRoute('/wizard')
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timer)
  }, [isMobile])

  if (isMobile) {
    return (
      <div className="relative min-h-screen">
        <HomePageContent />
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial={prefersReducedMotion ? false : 'initial'}
      animate={prefersReducedMotion ? undefined : 'animate'}
      exit={prefersReducedMotion ? undefined : 'exit'}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative min-h-screen"
    >
      <ScrollReadingLine />
      <HomePageContent />
    </motion.div>
  )
}
