import { motion } from 'framer-motion'
import { HomePageContent } from '../components/home/HeroSection'
import ScrollReadingLine from '../components/layout/ScrollReadingLine'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative min-h-screen"
    >
      <ScrollReadingLine />
      <HomePageContent />
    </motion.div>
  )
}
