import { useRef } from 'react'
import { motion } from 'framer-motion'
import { HomePageContent } from '../components/home/HeroSection'
import ScrollMorphCompanion from '../components/layout/ScrollMorphCompanion'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function Home() {
  const pageRef = useRef(null)

  return (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative min-h-screen"
    >
      <ScrollMorphCompanion scrollRef={pageRef} />
      <HomePageContent />
    </motion.div>
  )
}
