import { MapPin, Phone, Sparkles, GitBranch } from 'lucide-react'
import { MotionArticle, MotionButton } from '../../utils/motionProxy'

export default function StructureExplorationCard({
  structure,
  index = 0,
  animate = true,
  onAction,
}) {
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 + index * 0.08, duration: 0.45 },
      }
    : {}

  const actions = [
    { id: 'similar', label: 'Alternative simili', icon: GitBranch, variant: 'soft' },
    { id: 'different', label: 'Alternative diverse', icon: Sparkles, variant: 'soft' },
    { id: 'tell_me', label: 'Raccontami di questa struttura', icon: null, variant: 'primary' },
    { id: 'call', label: 'Chiama', icon: Phone, variant: 'ghost' },
  ]

  return (
    <MotionArticle
      {...motionProps}
      className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={structure.image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full border border-emerald-200/50 bg-emerald-50/95 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm">
          {structure.compatibility}% compatibilità
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-teal-800">
          {structure.type}
        </p>
        <h3 className="mb-1.5 text-lg font-semibold text-slate-800">{structure.name}</h3>
        <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{structure.location}</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{structure.summary}</p>

        <div className="flex flex-col gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            const base =
              'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/30'

            const variantClass =
              action.variant === 'primary'
                ? 'bg-[#E07A5F]/10 text-[#c96a52] hover:bg-[#E07A5F]/15'
                : action.variant === 'ghost'
                  ? 'border border-slate-200/60 bg-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  : 'border border-slate-200/70 bg-[#FDFBF7] text-slate-700 hover:border-[#E07A5F]/25'

            return (
              <MotionButton
                key={action.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onAction?.(structure, action.id)}
                className={`${base} ${variantClass}`}
              >
                {Icon ? <Icon className="h-4 w-4" strokeWidth={2} /> : null}
                {action.label}
              </MotionButton>
            )
          })}
        </div>
      </div>
    </MotionArticle>
  )
}
