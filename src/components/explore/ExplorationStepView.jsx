import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MotionButton, MotionDiv } from '../../utils/motionProxy'
import DisambiguationChips from './DisambiguationChips'
import StructureExplorationCard from './StructureExplorationCard'
import UnsupportedTopicMessage from './UnsupportedTopicMessage'
import { MOCK_EXPLORATION_STRUCTURES } from '../../constants/guidedSearch'

export default function ExplorationStepView({
  step,
  session,
  animate = true,
  onChipSelect,
  onNext,
  onStructureAction,
}) {
  if (!step) return null

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {}

  switch (step.type) {
    case 'disambiguation':
      return (
        <DisambiguationChips step={step} onSelect={onChipSelect} animate={animate} />
      )

    case 'editorial':
      return (
        <MotionDiv {...motionProps} className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
              {step.headline}
            </h2>
            {step.showQueryEcho && session?.query ? (
              <p className="mt-2 text-sm font-medium text-[#E07A5F]">
                Ricerca: «{session.query}»
              </p>
            ) : null}
            <p className="mt-3 text-base leading-relaxed text-slate-600">{step.body}</p>
            {step.editorialNote ? (
              <p className="mt-3 rounded-xl border border-slate-200/60 bg-[#FDFBF7] px-4 py-3 text-sm text-slate-600">
                {step.editorialNote}
              </p>
            ) : null}
          </div>

          {step.chips?.length ? (
            <div className="flex flex-col gap-2">
              {step.chips.map((chip) => (
                <MotionButton
                  key={chip.id}
                  type="button"
                  onClick={() => onChipSelect(chip)}
                  whileTap={{ scale: 0.98 }}
                  className="min-h-[48px] rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-[#E07A5F]/30"
                >
                  {chip.label}
                </MotionButton>
              ))}
            </div>
          ) : null}

          {step.nextStepId ? (
            <MotionButton
              type="button"
              onClick={() => onNext(step.nextStepId)}
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 self-start rounded-2xl bg-[#E07A5F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c96a52]"
            >
              {step.nextLabel ?? 'Continua'}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </MotionButton>
          ) : null}
        </MotionDiv>
      )

    case 'structures':
      return (
        <MotionDiv {...motionProps} className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
              {step.headline}
            </h2>
            {step.subheadline ? (
              <p className="mt-2 text-base text-slate-600">{step.subheadline}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            {MOCK_EXPLORATION_STRUCTURES.map((structure, index) => (
              <StructureExplorationCard
                key={structure.id}
                structure={structure}
                index={index}
                animate={animate}
                onAction={onStructureAction}
              />
            ))}
          </div>
        </MotionDiv>
      )

    case 'unsupported':
      return <UnsupportedTopicMessage topic={step.topic} animate={animate} />

    default:
      return (
        <UnsupportedTopicMessage
          topic={null}
          animate={animate}
        />
      )
  }
}

export function ExplorationNavBar({ query, canGoBack, onBack }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#FDFBF7]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Torna alla home"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {query || 'Esplorazione guidata'}
          </p>
          <p className="text-xs text-slate-500">Percorso editoriale · non chat</p>
        </div>
      </div>
    </header>
  )
}
