import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { DASHBOARD_GUIDE_STEPS } from '../../constants/consumerJourney'
import {
  isDashboardGuideComplete,
  markDashboardGuideComplete,
} from '../../utils/consumerJourneyStorage'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const glassCard =
  'rounded-[2rem] border border-white/50 bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-xl'

export default function ConsumerDashboardGuide({ hasRecentSearch = false }) {
  const prefersReducedMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState(() => isDashboardGuideComplete())

  if (dismissed || !hasRecentSearch) return null

  const handleDismiss = () => {
    markDashboardGuideComplete()
    setDismissed(true)
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      aria-labelledby="dashboard-guide-heading"
      className={`${glassCard} overflow-hidden p-6 sm:p-8`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-800/10 ring-1 ring-teal-800/15">
            <Sparkles className="h-6 w-6 text-teal-800" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-800">
              Benvenuto nell’area personale
            </p>
            <h2 id="dashboard-guide-heading" className="mt-1 text-lg font-semibold text-slate-800">
              Ecco come muoverti da qui
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Una guida rapida ai passi più utili dopo la tua ricerca.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/80 hover:text-slate-600"
          aria-label="Chiudi guida area personale"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <ol className="space-y-3">
        {DASHBOARD_GUIDE_STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <li
              key={step.id}
              className="flex gap-3 rounded-2xl border border-white/60 bg-white/50 px-4 py-3.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-800/10 text-xs font-bold text-teal-900"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-teal-800/80" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-semibold text-slate-800">{step.title}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                {step.ctaTo ? (
                  <Link
                    to={step.ctaTo}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-900"
                  >
                    {step.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        onClick={handleDismiss}
        className="mt-5 inline-flex min-h-[3rem] items-center rounded-2xl bg-teal-800 px-6 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(17,94,89,0.28)] transition-colors hover:bg-teal-900"
      >
        Ho capito, inizia a esplorare
      </button>
    </motion.section>
  )
}
