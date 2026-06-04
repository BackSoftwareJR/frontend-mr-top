import { motion, useReducedMotion } from 'framer-motion'
import { Phone, User } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

export default function AdvisorCard({ advisor, onBookCall }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { ...spring, delay: 0.2 }}
    >
      <GlassCard
        hover={false}
        className="overflow-hidden rounded-3xl border-black/[0.06] bg-white/75 p-0 shadow-[0_4px_24px_rgba(15,23,42,0.05)]"
      >
        <div className="flex flex-col sm:flex-row">
          <div
            className="flex items-center justify-center bg-gradient-to-br from-teal-800/[0.03] to-teal-800/[0.08] px-8 py-9 sm:w-40 sm:shrink-0 sm:py-10"
            aria-hidden
          >
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full border border-teal-800/10 bg-white/80 shadow-sm backdrop-blur-sm">
              {advisor.avatarUrl ? (
                <img
                  src={advisor.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-teal-800/60" strokeWidth={1.5} />
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-800">
              {advisor.role}
            </p>
            <p className="mb-6 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-[1.65]">
              {advisor.story}
            </p>

            <motion.button
              type="button"
              onClick={onBookCall}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={spring}
              aria-label={advisor.ctaLabel}
              className={`group inline-flex min-h-[3rem] w-fit items-center gap-2 rounded-full border border-teal-800/15 bg-teal-800/[0.06] px-5 py-3 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/25 hover:bg-teal-800/[0.1] ${
                prefersReducedMotion ? '' : '[&_svg]:transition-transform [&_svg]:group-hover:scale-105'
              }`}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {advisor.ctaLabel}
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
