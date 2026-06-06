import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { NANDO_COPY } from '../../constants/siteCopy'
import SearchAssistantPanel from './SearchAssistantPanel'

export default function SearchAssistantIntegrated({
  panelProps,
  defaultExpanded = false,
}) {
  const [manualExpanded, setManualExpanded] = useState(null)
  const {
    microPrompt,
    loading,
    showRationale,
    activePath,
    question,
  } = panelProps ?? {}

  const autoExpanded = showRationale && Boolean(activePath)
  const expanded =
    manualExpanded !== null ? manualExpanded : defaultExpanded || autoExpanded

  const summary = loading
    ? NANDO_COPY.loading
    : showRationale && activePath
      ? `${NANDO_COPY.rationaleHeading}: ${activePath.name}`
      : question?.question
        ? question.question
        : microPrompt || NANDO_COPY.microPromptDefault

  return (
    <section
      id="nando-companion"
      aria-label="Nando — guida ricerca"
      className="max-md:hidden"
    >
      <div className="explore-nando-strip overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => setManualExpanded((prev) => !(prev !== null ? prev : expanded))}
          aria-expanded={expanded}
          className="flex w-full min-h-[52px] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-violet-50/30 sm:px-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#7c6ba8] shadow-sm">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-800">
              {NANDO_COPY.name}
            </span>
            <span className="mt-0.5 block truncate text-xs leading-relaxed text-slate-500">
              {summary}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {expanded ? (
          <div className="border-t border-violet-100/60">
            <SearchAssistantPanel
              {...panelProps}
              variant="integrated"
              hideHeader
              className="px-1 pb-1 pt-0"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
