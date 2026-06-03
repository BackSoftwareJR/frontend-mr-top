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
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-[#F5F5F0]/95 backdrop-blur-sm"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A4D2E] text-white">
            <HeartHandshake className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            CareAdvisor
          </span>
        </Link>

        <a
          href="/#come-funziona"
          onClick={handleHashClick}
          className="hidden text-sm font-semibold text-zinc-600 transition-colors hover:text-[#1A4D2E] md:block"
        >
          Come funziona
        </a>

        <Link to="/wizard">
          <Button className="hidden px-5 py-2.5 text-xs sm:inline-flex sm:text-sm">
            Consulenza gratuita
          </Button>
        </Link>
      </nav>
    </motion.header>
  )
}
