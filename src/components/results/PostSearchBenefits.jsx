import { motion, useReducedMotion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { POST_SEARCH_BENEFITS } from '../../constants/consumerJourney'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const accentRing = {
  teal: 'from-teal-800/15 to-teal-100/40 ring-teal-800/20',
  coral: 'from-accent-coral/15 to-rose-50/50 ring-accent-coral/25',
  violet: 'from-violet-200/30 to-white/50 ring-violet-300/30',
  emerald: 'from-emerald-200/25 to-white/50 ring-emerald-300/25',
}

export default function PostSearchBenefits() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section aria-labelledby="post-search-benefits-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-800">
          Perché Wenando
        </p>
        <h2
          id="post-search-benefits-heading"
          className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl"
        >
          Cosa ottieni da questo momento in poi
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
          Non solo etichette: ogni vantaggio ha un motivo concreto per la tua famiglia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {POST_SEARCH_BENEFITS.map((benefit, index) => (
          <motion.div
            key={benefit.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ ...spring, delay: prefersReducedMotion ? 0 : index * 0.06 }}
          >
            <GlassCard
              hover={false}
              className="h-full border-white/30 bg-white/65 p-5 shadow-none sm:p-6"
            >
              <div
                className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br px-3 py-2 ring-1 ${accentRing[benefit.accent] ?? accentRing.teal}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Vantaggio
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-800">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                <span className="font-medium text-teal-900">Perché conta: </span>
                {benefit.why}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
