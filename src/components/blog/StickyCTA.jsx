import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function StickyCTA() {
  return (
    <>
      {/* Desktop sidebar card */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="hidden lg:block"
      >
        <div className="sticky top-28 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-800 to-teal-900 p-8 shadow-xl shadow-teal-900/20">
          <Sparkles className="mb-4 h-8 w-8 text-emerald-300" />
          <h3 className="mb-3 text-xl font-bold text-white">
            Non sei sicuro di quale sia la scelta giusta?
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-teal-100">
            Non impazzire tra le ricerche. Fai il test gratuito e ricevi una
            guida personalizzata in pochi minuti.
          </p>
          <Link
            to="/wizard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-900 shadow-lg transition-transform hover:scale-[1.02]"
          >
            Fai il test gratuito
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.aside>

      {/* Mobile sticky bottom banner */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-teal-100 bg-white/90 p-4 shadow-2xl shadow-slate-300/30 backdrop-blur-md lg:hidden"
      >
        <p className="mb-3 text-center text-sm font-medium text-slate-800">
          Non impazzire tra le ricerche.{' '}
          <span className="text-teal-800">Fai il test gratuito.</span>
        </p>
        <Link
          to="/wizard"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20"
        >
          Inizia ora
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </>
  )
}
