import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import MeshGradientBackground from '../ui/MeshGradientBackground'

export default function Hero() {
  return (
    <MeshGradientBackground className="px-4 pb-28 pt-32 sm:px-6 sm:pt-44">
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-sunny/60 bg-sunny-soft/90 px-5 py-2.5 text-sm font-bold text-warm-text shadow-[0_8px_24px_-6px_rgb(255_233_168/0.6)]"
          >
            <Sparkles className="h-4 w-4 text-coral" />
            Guida gratuita e personalizzata
          </motion.span>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-warm-text sm:text-5xl lg:text-6xl">
            Trova la soluzione di assistenza perfetta per chi ami,{' '}
            <span className="bg-gradient-to-r from-coral to-teal-warm bg-clip-text text-transparent">
              senza stress.
            </span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-warm-muted sm:text-xl">
            Rispondi a 4 semplici domande e ricevi una guida gratuita, pensata
            per le vostre esigenze. Nessuna pressione, solo chiarezza e un abbraccio
            di supporto.
          </p>

          <Link to="/wizard">
            <Button className="px-10 py-4 text-base">
              Inizia il percorso gratuito
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </MeshGradientBackground>
  )
}
