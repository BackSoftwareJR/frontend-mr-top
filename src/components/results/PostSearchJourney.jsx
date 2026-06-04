import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ChevronRight, LayoutDashboard, X } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import { CONSUMER_JOURNEY_STEPS } from '../../constants/consumerJourney'
import {
  isPostResultsJourneyComplete,
  markPostResultsJourneyComplete,
} from '../../utils/consumerJourneyStorage'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

export default function PostSearchJourney({ personalAreaTo, personalAreaState }) {
  const prefersReducedMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState(() => isPostResultsJourneyComplete())
  const [activeIndex, setActiveIndex] = useState(0)

  if (dismissed) return null

  const steps = [
    {
      id: 'area',
      icon: LayoutDashboard,
      title: 'Area personale',
      description:
        'Qui ritrovi ricerche, preferiti e il riepilogo del piano: è il punto di partenza dopo questa pagina.',
      ctaLabel: 'Visualizza la tua area personale',
      ctaTo: personalAreaTo,
      ctaState: personalAreaState,
      highlight: true,
    },
    ...CONSUMER_JOURNEY_STEPS,
  ]

  const active = steps[activeIndex]
  const ActiveIcon = active.icon
  const progress = ((activeIndex + 1) / steps.length) * 100

  const handleDismiss = () => {
    markPostResultsJourneyComplete()
    setDismissed(true)
  }

  const goNext = () => {
    if (activeIndex < steps.length - 1) {
      setActiveIndex((i) => i + 1)
      return
    }
    handleDismiss()
  }

  return (
    <section aria-labelledby="post-search-journey-heading" className="relative">
      <GlassCard
        hover={false}
        className="overflow-hidden border-teal-800/15 bg-gradient-to-br from-white/80 via-white/70 to-teal-50/30 p-5 shadow-[0_24px_60px_rgba(17,94,89,0.08)] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-800">
              Percorso guidato
            </p>
            <h2
              id="post-search-journey-heading"
              className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl"
            >
              I prossimi passi, uno alla volta
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Step {activeIndex + 1} di {steps.length}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100/80 hover:text-slate-600"
            aria-label="Chiudi guida"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div
          className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200/70"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avanzamento guida"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-800 to-accent-coral"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : spring}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Passi del percorso">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === activeIndex
            const isDone = index < activeIndex

            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="post-search-journey-panel"
                onClick={() => setActiveIndex(index)}
                className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-[0_8px_24px_rgba(17,94,89,0.25)]'
                    : isDone
                      ? 'bg-teal-800/10 text-teal-900'
                      : 'bg-white/70 text-slate-500 ring-1 ring-slate-200/80'
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                )}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            id="post-search-journey-panel"
            role="tabpanel"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
            transition={prefersReducedMotion ? { duration: 0 } : spring}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                  active.highlight
                    ? 'bg-accent-coral/15 ring-accent-coral/30'
                    : 'bg-teal-800/10 ring-teal-800/20'
                }`}
              >
                <ActiveIcon
                  className={`h-7 w-7 ${active.highlight ? 'text-accent-coral' : 'text-teal-800'}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-slate-800 sm:text-lg">{active.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{active.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {active.ctaTo ? (
                <Link
                  to={active.ctaTo}
                  state={active.ctaState}
                  onClick={handleDismiss}
                  className={`inline-flex min-h-[3rem] items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-[box-shadow,background-color] ${
                    active.highlight
                      ? 'bg-accent-coral text-white shadow-[0_8px_28px_rgba(224,122,95,0.35)] hover:bg-[#c96a52]'
                      : 'bg-teal-800 text-white shadow-[0_8px_28px_rgba(17,94,89,0.3)] hover:bg-teal-900'
                  }`}
                >
                  {active.ctaLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </Link>
              ) : null}

              <button
                type="button"
                onClick={goNext}
                className="inline-flex min-h-[3rem] items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/90 hover:text-teal-800"
              >
                {activeIndex < steps.length - 1 ? (
                  <>
                    Avanti
                    <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </>
                ) : (
                  'Ho capito, grazie'
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </section>
  )
}
