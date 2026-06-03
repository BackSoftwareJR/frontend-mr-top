import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function Layout() {
  const location = useLocation()
  const isWizard = location.pathname === '/wizard'
  const isHome = location.pathname === '/'

  if (isWizard) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {!isHome && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
