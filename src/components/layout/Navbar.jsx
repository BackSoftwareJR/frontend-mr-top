import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav className="flex w-full max-w-xl items-center justify-between gap-4 rounded-full border border-white/60 bg-white/50 px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E07A5F] text-white">
            <HeartHandshake className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800">
            CareAdvisor
          </span>
        </Link>

        <Link
          to="/wizard"
          className="shrink-0 rounded-full bg-[#E07A5F] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c96a52]"
        >
          Inizia ora
        </Link>
      </nav>
    </motion.header>
  )
}
