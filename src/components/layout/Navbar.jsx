import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import Button from '../ui/Button'

export default function Navbar() {
  const location = useLocation()

  const handleHashClick = (e) => {
    if (location.pathname !== '/') {
      return
    }
    e.preventDefault()
    document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-glass-border bg-glass px-5 py-3 shadow-peach backdrop-blur-xl">
        <Link to="/" className="group flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            transition={{ duration: 0.45 }}
            className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-coral to-coral-deep text-white shadow-coral"
          >
            <HeartHandshake className="h-5 w-5" strokeWidth={2.25} />
          </motion.div>
          <span className="text-lg font-extrabold tracking-tight text-warm-text transition-colors group-hover:text-coral">
            CareAdvisor
          </span>
        </Link>

        <a
          href="/#come-funziona"
          onClick={handleHashClick}
          className="hidden text-sm font-semibold text-warm-muted transition-colors hover:text-teal-warm md:block"
        >
          Come Funziona
        </a>

        <Link to="/wizard">
          <Button pulse className="hidden px-5 py-2.5 text-xs sm:inline-flex sm:text-sm">
            Ricevi un Consiglio Gratuito
          </Button>
        </Link>
      </nav>
    </motion.header>
  )
}
