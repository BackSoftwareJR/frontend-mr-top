import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { WenandoMark } from '../ui/WenandoLogo'

export function WizardHeader({ progress, onClose }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" onClick={onClose} aria-label="Wenando home">
          <WenandoMark className="h-8 w-8" />
        </Link>
        <motion.div whileTap={{ scale: 0.94 }}>
          <Link
            to="/"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/50 bg-white/70 text-slate-400 shadow-sm backdrop-blur-xl transition-colors hover:border-slate-300/60 hover:text-slate-600"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </Link>
        </motion.div>
      </div>
      <div className="h-0.5 bg-slate-100/80">
        <motion.div
          className="h-full bg-teal-800"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ willChange: 'width' }}
        />
      </div>
    </header>
  )
}
