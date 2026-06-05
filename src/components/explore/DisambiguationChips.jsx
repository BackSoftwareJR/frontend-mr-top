import {
  BookOpen,
  Building2,
  Euro,
  Heart,
  Shuffle,
} from 'lucide-react'
import { MotionButton } from '../../utils/motionProxy'

const ICON_MAP = {
  heart: Heart,
  building: Building2,
  book: BookOpen,
  shuffle: Shuffle,
  euro: Euro,
}

export default function DisambiguationChips({ step, onSelect, animate = true }) {
  if (!step?.chips?.length) return null

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
          {step.headline}
        </h2>
        {step.subheadline ? (
          <p className="mt-2 text-base leading-relaxed text-slate-600">{step.subheadline}</p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-2.5">
        {step.chips.map((chip, index) => {
          const Icon = ICON_MAP[chip.icon] ?? Heart
          const motionProps = animate
            ? {
                initial: { opacity: 0, y: 12 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.08 + index * 0.06, duration: 0.4 },
              }
            : {}

          return (
            <MotionButton
              key={chip.id}
              type="button"
              onClick={() => onSelect(chip)}
              {...motionProps}
              whileTap={{ scale: 0.98 }}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 text-left shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-colors hover:border-[#E07A5F]/30 hover:bg-[#FDFBF7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E07A5F]/10 text-[#E07A5F]">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="text-[0.9375rem] font-medium leading-snug text-slate-700 sm:text-base">
                {chip.label}
              </span>
            </MotionButton>
          )
        })}
      </div>
    </div>
  )
}
