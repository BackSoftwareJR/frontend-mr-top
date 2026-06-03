import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import Button from '../ui/Button'

export default function Navbar() {
  const location = useLocation()

  const navLinks = [
    { to: '/#come-funziona', label: 'Come Funziona', isHash: true },
    { to: '/blog', label: 'Blog / Guide', isHash: false },
  ]

  const handleHashClick = (e, to) => {
    if (location.pathname !== '/') {
      return
    }
    e.preventDefault()
    const id = to.split('#')[1]
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-lg shadow-slate-200/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md shadow-teal-900/20"
          >
            <HeartHandshake className="h-5 w-5" strokeWidth={2} />
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-800 transition-colors">
            CareAdvisor
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.isHash ? (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleHashClick(e, link.to)}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        <Link to="/wizard">
          <Button pulse className="hidden sm:inline-flex px-5 py-2.5 text-xs sm:text-sm">
            Ricevi un Consiglio Gratuito
          </Button>
        </Link>
      </nav>
    </motion.header>
  )
}
