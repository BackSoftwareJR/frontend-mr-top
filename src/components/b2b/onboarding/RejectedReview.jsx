import { motion } from 'framer-motion'
import { Mail, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { obLink, obSecondaryBtn } from '../onboardingStyles'

export default function RejectedReview({ email, rejectionReason }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-2 text-center">
      <motion.div
        className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-red-200/60 bg-white/80 shadow-lg backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <XCircle className="relative h-10 w-10 text-red-600" />
      </motion.div>

      <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
        Candidatura non approvata
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-muted">
        Al momento non possiamo attivare il profilo partner con i dati inviati.
        {rejectionReason
          ? ' Di seguito il motivo indicato dal team di revisione.'
          : ' Riceverai i dettagli via email; per chiarimenti contatta il team Wenando Pro.'}
      </p>

      {rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 max-w-md rounded-2xl border border-red-200/50 bg-red-50/80 px-5 py-4 text-left text-sm leading-relaxed text-charcoal shadow-sm backdrop-blur-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700/80">
            Motivo della decisione
          </p>
          <p className="mt-2 whitespace-pre-wrap">{rejectionReason}</p>
        </motion.div>
      )}

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
