import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import MeshGradientBackground from '../ui/MeshGradientBackground'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function Layout() {
  const location = useLocation()
  const isWizard = location.pathname === '/wizard'

  if (isWizard) {
    return <Outlet />
  }

  return (
    <MeshGradientBackground className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </MeshGradientBackground>
  )
}
