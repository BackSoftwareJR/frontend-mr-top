import { useState } from 'react'
import { ArrowRight, ChevronDown, MapPin, Star } from 'lucide-react'
import { CONTACT_INTENT_COPY } from '../../constants/siteCopy'
import {
  canRequestStructureContact,
  isRefinementAnswered,
  isStructurePath,
} from '../../constants/pathRefinement'
import { MotionArticle, MotionButton } from '../../utils/motionProxy'

function SolutionPostItCard({
  solution,
  index,
  animate,
  onAction,
  onPathSelect,
  activePathId,
  expandedWhy,
  onToggleWhy,
  onDiscoverAutonomy,
  answeredSelections = {},
  query = '',
  onContactStructures,
}) {
  const style = solution.postIt
  const showCompatibility =
    solution.pathType === 'structure' && typeof solution.compatibility === 'number'
  const showWhy = Boolean(solution.whyRecommended)
  const isWhyExpanded = expandedWhy === solution.id
  const isSelected = activePathId === solution.id
  const showAutonomyCta =
    onDiscoverAutonomy &&
    Array.isArray(solution.refinementNeeded) &&
    solution.refinementNeeded.includes('autonomy') &&
    !isRefinementAnswered('autonomy', answeredSelections)
  const isStructure = isStructurePath(solution)
  const showContactCta =
    isStructure &&
    onContactStructures &&
    canRequestStructureContact(answeredSelections, query)

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
      }
    : {}

  return (
    <MotionArticle
      {...motionProps}
      className="overflow-visible px-0.5 py-1.5 sm:px-1 sm:py-2"
      id={solution.rank === 1 ? 'top-solution-card' : undefined}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => onPathSelect?.(solution)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onPathSelect?.(solution)
          }
        }}
        className={`explore-postit-card group relative flex h-full cursor-pointer flex-col overflow-hidden border ${style.postItBorder} ${style.postItBg} ${isSelected ? 'explore-postit-card--selected ring-2 ring-[#9b8ec4]/50 ring-offset-2 ring-offset-[#FDFBF7]' : ''}`}
        style={{
          rotate: isSelected ? '0deg' : `${style.rotate}deg`,
          boxShadow: isSelected ? style.postItShadowHover : style.postItShadow,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = style.postItShadowHover
          e.currentTarget.style.rotate = '0deg'
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.boxShadow = style.postItShadow
            e.currentTarget.style.rotate = `${style.rotate}deg`
          }
        }}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute right-3 top-3 select-none text-4xl font-black leading-none opacity-40 sm:text-5xl ${style.watermark}`}
        >
          0{solution.rank}
        </span>

        <span
          className={`explore-rank-badge absolute left-3 top-3 z-10 rounded-md px-2 py-1 shadow-sm ${style.accentColor} bg-white/90 backdrop-blur-sm`}
        >
          {style.tagline}
        </span>

        <div className="relative aspect-[16/10] overflow-hidden bg-black/[0.04]">
          <img
            src={solution.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {solution.isBest ? (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-[#E07A5F]/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" strokeWidth={0} />
              Top
            </span>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-teal-800/75">
            {solution.typeBadge ?? solution.type}
          </p>
          <h3 className="explore-section-title mb-2 text-xl text-slate-800 sm:text-[1.35rem]">
            {solution.name}
          </h3>
          {solution.location ? (
            <div className="mb-2 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3 w-3" strokeWidth={2} />
              {solution.location}
              {showCompatibility ? (
                <span className="text-emerald-700"> · {solution.compatibility}%</span>
              ) : null}
            </div>
          ) : null}
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-700/90">
            {solution.summary}
          </p>

          {showWhy ? (
            <div className="mb-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleWhy?.(solution.id)
                }}
                aria-expanded={isWhyExpanded}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-[#c96a52]"
              >
                Scopri perché
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isWhyExpanded ? 'rotate-180' : ''}`}
                  strokeWidth={2.5}
                />
              </button>
              {isWhyExpanded ? (
                <div
                  className="mt-2 rounded-lg border border-black/[0.06] bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-slate-700"
                  role="region"
                  aria-label="Motivazione del consiglio"
                >
                  {solution.whyRecommended}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {showContactCta ? (
              <MotionButton
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={(event) => {
                  event.stopPropagation()
                  onContactStructures?.(solution)
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-900"
              >
                {CONTACT_INTENT_COPY.contattaCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </MotionButton>
            ) : null}
            {showAutonomyCta ? (
              <MotionButton
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={(event) => {
                  event.stopPropagation()
                  onDiscoverAutonomy?.(solution)
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-violet-800 transition-colors hover:bg-violet-50 hover:text-violet-950"
              >
                Scopri il livello
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </MotionButton>
            ) : null}
            <MotionButton
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={(event) => {
                event.stopPropagation()
                onAction?.(solution)
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:text-[#c96a52]"
            >
              {isStructure ? CONTACT_INTENT_COPY.scopriDiPiu : 'Scopri di più'}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </MotionButton>
          </div>
        </div>
      </div>
    </MotionArticle>
  )
}

export default function SolutionPostItGrid({
  solutions,
  animate = true,
  onSolutionAction,
  onPathSelect,
  activePathId = null,
  expandedWhyId = null,
  onToggleWhy,
  onDiscoverAutonomy,
  answeredSelections,
  query = '',
  onContactStructures,
}) {
  const [localExpandedWhy, setLocalExpandedWhy] = useState(null)
  const expandedWhy = expandedWhyId ?? localExpandedWhy

  const handleToggleWhy = (id) => {
    if (onToggleWhy) {
      onToggleWhy(id)
      return
    }
    setLocalExpandedWhy((prev) => (prev === id ? null : id))
  }

  if (!solutions?.length) return null

  return (
    <section aria-label="Soluzioni consigliate" id="solution-paths">
      <header className="mb-6 text-center sm:mb-8 lg:mb-10">
        <p className="explore-section-label mb-2">Le tue proposte</p>
        <h2 className="explore-section-title text-[1.75rem] sm:text-3xl lg:text-[2rem]">
          Tre percorsi pensati per voi
        </h2>
        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Si affinano ad ogni risposta — tornando indietro ritrovi esattamente le proposte di
          prima.
        </p>
      </header>

      <div className="explore-path-grid grid gap-5 overflow-visible sm:grid-cols-3 sm:gap-6">
        {solutions.map((solution, index) => (
          <SolutionPostItCard
            key={solution.id}
            solution={solution}
            index={index}
            animate={animate}
            onAction={onSolutionAction}
            onPathSelect={onPathSelect}
            activePathId={activePathId}
            expandedWhy={expandedWhy}
            onToggleWhy={handleToggleWhy}
            onDiscoverAutonomy={onDiscoverAutonomy}
            answeredSelections={answeredSelections}
            query={query}
            onContactStructures={onContactStructures}
          />
        ))}
      </div>
    </section>
  )
}
