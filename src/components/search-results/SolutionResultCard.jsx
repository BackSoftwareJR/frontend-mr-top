import { ArrowRight, MapPin, Star } from 'lucide-react'
import { MotionArticle, MotionButton } from '../../utils/motionProxy'

export default function SolutionResultCard({
  solution,
  index = 0,
  animate = true,
  onAction,
}) {
  const isStructure = solution.kind === 'structure'
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.06 + index * 0.06, duration: 0.38 },
      }
    : {}

  return (
    <MotionArticle
      {...motionProps}
      className={`overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md ${
        solution.isBest
          ? 'border-[#E07A5F]/25 shadow-[0_4px_20px_rgba(224,122,95,0.08)]'
          : 'border-black/[0.06] shadow-sm'
      }`}
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-24">
          <img
            src={solution.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {solution.isBest ? (
            <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-md bg-[#E07A5F] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
              Top
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
            {solution.type}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-800 sm:text-base">
            {solution.name}
          </h3>
          {isStructure && solution.location ? (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
              <span className="truncate">{solution.location}</span>
              {solution.compatibility ? (
                <span className="ml-1 text-emerald-700">· {solution.compatibility}%</span>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {solution.summary}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-2 sm:px-4">
        <MotionButton
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction?.(solution)}
          className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-[#c96a52] hover:text-[#E07A5F] sm:text-sm"
        >
          {isStructure ? 'Scopri di più' : 'Approfondisci percorso'}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </MotionButton>
      </div>
    </MotionArticle>
  )
}
