import { motion } from 'framer-motion'
import { Lock, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePendingReviewPoll } from '../../../hooks/usePendingReviewPoll'
import { obLink, obSecondaryBtn } from '../onboardingStyles'

export default function PendingReview({ email }) {
  usePendingReviewPoll(true)
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-2 text-center">
      <motion.div
        className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-black/5 bg-white/80 shadow-lg backdrop-blur-xl"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="absolute inset-0 rounded-3xl border-2 border-accent-violet/30"
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute inset-2 rounded-2xl border border-accent-coral/20"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <Lock className="relative h-10 w-10 text-accent-violet-dark" />
      </motion.div>

      <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
        <span className="text-gradient-multicolor">Profilo</span> in revisione
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-muted">
        Il nostro team sta analizzando il tuo Trust Test e i documenti caricati.
        Riceverai l&apos;esito a breve sull&apos;email registrata.
      </p>

      {email && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-5 py-2.5 text-sm font-medium text-charcoal shadow-sm backdrop-blur-md"
        >
          <Mail className="h-4 w-4 text-accent-coral" />
          {email}
        </motion.p>
      )}

      <p className="mt-6 text-xs text-charcoal-muted">
        Tempo medio di revisione: 24–48 ore lavorative (demo: pochi secondi)
      </p>

      <Link to="/" className={`mt-8 ${obSecondaryBtn} !w-auto px-8`}>
        Torna alla home
      </Link>
      <p className="mt-4 text-xs text-charcoal-muted">
        Domande?{' '}
        <a href="mailto:partner@wenando.it" className={obLink}>
          partner@wenando.it
        </a>
      </p>
    </div>
  )
}
