import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'

export default function Hero() {
  return (
    <section className="px-4 pb-28 pt-28 sm:px-6 sm:pt-36">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-[#1A4D2E]">
            Consulenza gratuita
          </p>

          <h1 className="mb-8 text-4xl font-bold leading-[1.12] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            La soluzione di assistenza giusta, con la precisione di un concierge.
          </h1>

          <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-zinc-600">
            Quattro domande. Opzioni selezionate per voi. Nessuna pressione.
          </p>

          <Link to="/wizard">
            <Button className="px-10 py-4 text-base">
              Inizia l&apos;analisi
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
