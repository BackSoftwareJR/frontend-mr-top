import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'

export default function AutoDemoBanner({
  label = 'Demo automatica in corso…',
  stepLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex items-center gap-3 rounded-2xl border border-accent-coral/20 bg-gradient-to-r from-accent-coral/10 via-accent-violet/10 to-accent-teal/10 px-4 py-3.5 text-sm text-charcoal shadow-sm backdrop-blur-md"
      role="status"
    >
      <motion.span
        animate={{ rotate: [0, 12, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="h-4 w-4 shrink-0 text-accent-coral" />
      </motion.span>
      <span className="flex-1 font-semibold">
        {label}
        {stepLabel ? (
          <span className="mt-0.5 block text-xs font-medium text-charcoal-muted">
            {stepLabel}
          </span>
        ) : null}
      </span>
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-coral" />
    </motion.div>
  )
}
