import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '../ui/Button'

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-teal-800 shadow-md shadow-slate-200/40 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Guida gratuita e personalizzata
          </span>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Trova la soluzione di assistenza perfetta per chi ami,{' '}
            <span className="text-teal-800">senza stress.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Rispondi a 4 semplici domande e ricevi una guida gratuita, pensata
            per le vostre esigenze. Nessuna pressione, solo chiarezza e cura.
          </p>

          <Link to="/wizard">
            <Button className="px-8 py-4 text-base">
              Inizia il percorso gratuito
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
