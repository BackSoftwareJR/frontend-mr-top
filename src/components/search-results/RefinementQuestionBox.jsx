import { Sparkles } from 'lucide-react'
import { MotionDiv, MotionButton } from '../../utils/motionProxy'

export default function RefinementQuestionBox({
  question,
  onSelect,
  animate = true,
  className = '',
}) {
  if (!question) return null

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {}

  return (
    <MotionDiv
      {...motionProps}
      className={`rounded-2xl border border-black/[0.06] bg-white/90 p-4 shadow-[0_4px_24px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-5 ${className}`}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700/80">
            Affina la ricerca
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-800 sm:text-lg">
            {question.question}
          </h2>
          {question.hint ? (
            <p className="mt-1 text-sm text-slate-500">{question.hint}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {question.options.map((option) => (
          <MotionButton
            key={option.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect?.(question.id, option)}
            className="min-h-[44px] rounded-xl border border-slate-200/80 bg-[#FDFBF7] px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-violet-300/60 hover:bg-violet-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30"
          >
            {option.label}
          </MotionButton>
        ))}
      </div>
    </MotionDiv>
  )
}
