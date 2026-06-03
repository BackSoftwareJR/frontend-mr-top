import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import MagneticButton from '../ui/MagneticButton'
import MulticolorHeading from '../ui/MulticolorHeading'
import WenandoLogo from '../ui/WenandoLogo'

export function WizardComplete() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <GlassCard hover={false} className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#E9A84A]">
            <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <MulticolorHeading
            as="h2"
            words="Grazie di cuore"
            className="mb-3 text-2xl font-extrabold tracking-tight"
            startIndex={0}
            trigger="mount"
          />
          <p className="mb-8 leading-relaxed text-slate-600">
            Stiamo analizzando le vostre risposte. Riceverete presto le soluzioni
            più adatte.
          </p>
          <MagneticButton to="/" variant="secondary">
            Torna alla home
          </MagneticButton>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export function WizardHeader({ progress, onClose }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <WenandoLogo size="sm" />
        <Link
          to="/"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
          aria-label="Chiudi"
        >
          ✕
        </Link>
      </div>
      <div className="h-1 bg-slate-100">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E07A5F] via-[#E9A84A] to-[#9B8EC4]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </header>
  )
}
