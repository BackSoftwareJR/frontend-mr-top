import { motion } from 'framer-motion'
import { Mail, ShieldOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { obLink, obSecondaryBtn } from '../onboardingStyles'

export default function SuspendedReview({ email }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-2 text-center">
      <motion.div
        className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-200/70 bg-white/80 shadow-lg backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <ShieldOff className="relative h-10 w-10 text-amber-700" />
      </motion.div>

      <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
        Account partner sospeso
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-charcoal-muted">
        L&apos;accesso al marketplace e alle funzionalità Pro è temporaneamente bloccato.
        Per ripristinare il profilo o ricevere chiarimenti, contatta il supporto Wenando Pro.
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

      <Link to="/" className={`mt-8 ${obSecondaryBtn} !w-auto px-8`}>
        Torna alla home
      </Link>
      <p className="mt-4 text-xs text-charcoal-muted">
        Supporto partner:{' '}
        <a href="mailto:partner@wenando.it" className={obLink}>
          partner@wenando.it
        </a>
      </p>
    </div>
  )
}
