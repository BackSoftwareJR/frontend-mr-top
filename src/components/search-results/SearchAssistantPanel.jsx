import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { NANDO_COPY } from '../../constants/siteCopy'
import { REFINEMENT_CHIP_META } from '../../constants/pathRefinement'
import { MotionButton } from '../../utils/motionProxy'
import ZoneRefinementInput from './ZoneRefinementInput'

export default function SearchAssistantPanel({
  question,
  customNotes = '',
  actions = [],
  microPrompt,
  activePath = null,
  showRationale = false,
  canGoBack = false,
  canGoForward = false,
  loading = false,
  error = null,
  onBack,
  onForward,
  onSelectOption,
  onCustomSubmit,
  onActionClick,
  refinementChips = [],
  activeRefinementKey = null,
  onRefinementChipClick,
  onRefinementAnswer,
  onRefinementDismiss,
  onMinimize,
  onClose,
  showWindowChrome = false,
  hideHeader = false,
  variant = 'default',
  className = '',
}) {
  const [draft, setDraft] = useState('')
  const handleClose = onClose ?? onMinimize
  const isIntegrated = variant === 'integrated'
  const rationaleText =
    activePath?.whyRecommended ?? NANDO_COPY.rationaleFallback

  const handleCustomSubmit = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onCustomSubmit?.(text)
    setDraft('')
  }

  const activeRefinementChip = refinementChips.find((chip) => chip.key === activeRefinementKey)
  const activeRefinementQuestion = activeRefinementChip?.question

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      {showWindowChrome ? (
        <div className="assistant-drag-handle flex shrink-0 cursor-grab items-center gap-3 border-b border-slate-100 bg-[#FAFAF8] px-3 py-2.5 active:cursor-grabbing">
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleClose}
              className="group inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] hover:brightness-95"
              aria-label="Chiudi"
              title="Chiudi"
            >
              <X className="h-2 w-2 text-[#820005] opacity-0 group-hover:opacity-100" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={onMinimize}
              className="group inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#FEBC2E] hover:brightness-95"
              aria-label="Minimizza"
              title="Minimizza"
            >
              <Minus className="h-2 w-2 text-[#995700] opacity-0 group-hover:opacity-100" strokeWidth={3} />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-600" strokeWidth={2} />
            <p className="truncate text-xs font-semibold text-slate-700">{NANDO_COPY.name}</p>
          </div>
        </div>
      ) : hideHeader ? null : (
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{NANDO_COPY.name}</p>
            <p className="text-xs text-slate-500">{NANDO_COPY.tagline}</p>
          </div>
        </div>
      )}

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 sm:p-4 ${isIntegrated ? 'max-h-[min(420px,50vh)]' : ''}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={onBack}
              className="explore-touch-target inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/90 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded-lg"
              aria-label="Indietro"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={onForward}
              className="explore-touch-target inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/90 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded-lg"
              aria-label="Avanti"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
          {customNotes ? (
            <p className="truncate text-[10px] text-slate-400">Nota: {customNotes}</p>
          ) : null}
        </div>

        {loading ? (
          <p className="mb-3 text-xs text-slate-400" aria-live="polite">
            {NANDO_COPY.loading}
          </p>
        ) : null}

        {error && !loading ? (
          <p className="mb-3 text-xs text-amber-700" aria-live="polite">
            Connessione lenta — uso le domande standard.
          </p>
        ) : null}

        {actions.length > 0 && !loading ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {actions.map((action) => (
              <MotionButton
                key={action.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => onActionClick?.(action)}
                className="explore-action-pill explore-touch-target"
              >
                {action.label}
              </MotionButton>
            ))}
          </div>
        ) : null}

        {showRationale && activePath && !loading ? (
          <div
            className="explore-rationale-block mb-3 rounded-xl px-3.5 py-3.5 sm:px-4"
            role="region"
            aria-label={NANDO_COPY.rationaleHeading}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#7c6ba8]">
              {NANDO_COPY.rationaleHeading}
            </p>
            <p className="explore-section-title mb-1.5 text-base text-slate-800 sm:text-lg">
              {activePath.name}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">{rationaleText}</p>
          </div>
        ) : null}

        {refinementChips.length > 0 && !loading ? (
          <div className="mb-3" role="region" aria-label={NANDO_COPY.refineHeading}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {NANDO_COPY.refineHeading}
            </p>
            <p className="mb-2 text-xs text-slate-500">{NANDO_COPY.refineHint}</p>
            <div className="flex flex-wrap gap-2">
              {refinementChips.map((chip) => {
                const meta = REFINEMENT_CHIP_META[chip.key] ?? chip
                const isActive = activeRefinementKey === chip.key
                return (
                  <MotionButton
                    key={chip.key}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onRefinementChipClick?.(chip.key)}
                    aria-pressed={isActive}
                    className={`explore-touch-target min-h-[2.25rem] rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
                      isActive
                        ? 'border-[#9b8ec4] bg-[#9b8ec4]/15 text-violet-900'
                        : 'border-slate-200/80 bg-white/90 text-slate-700 hover:border-violet-200 hover:bg-violet-50/50'
                    }`}
                  >
                    {meta.label ?? chip.label}
                  </MotionButton>
                )
              })}
            </div>
          </div>
        ) : null}

        {activeRefinementKey && activeRefinementKey !== 'autonomy' && activeRefinementQuestion && !loading ? (
          <div className="mb-3 rounded-xl border border-slate-200/60 bg-white/60 px-3.5 py-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-slate-800">
                {activeRefinementQuestion.question}
              </h3>
              <button
                type="button"
                onClick={() => onRefinementDismiss?.()}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Chiudi affinamento"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
            {activeRefinementQuestion.hint ? (
              <p className="mb-3 text-xs text-slate-500">{activeRefinementQuestion.hint}</p>
            ) : null}

            {activeRefinementKey === 'zone' || activeRefinementQuestion.useGeoAutocomplete ? (
              <ZoneRefinementInput
                disabled={loading}
                onSelect={(option) => {
                  onRefinementAnswer?.(activeRefinementQuestion.id ?? 'refinement_zone', option)
                }}
              />
            ) : (
              <div className="grid gap-1.5">
                {(activeRefinementQuestion.options ?? []).map((option) => (
                  <MotionButton
                    key={option.id}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    onClick={() => onRefinementAnswer?.(activeRefinementQuestion.id, option)}
                    className="explore-touch-target min-h-[44px] rounded-xl border border-slate-200/80 bg-[#FDFBF7] px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50/40 disabled:opacity-50 sm:min-h-[40px] sm:py-2 sm:text-sm"
                  >
                    {option.label}
                  </MotionButton>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {!showRationale && microPrompt && !loading && !question ? (
          <p className="mb-3 text-xs text-slate-500">{microPrompt}</p>
        ) : null}

        {question ? (
          <>
            <h2 className="mb-1 text-sm font-semibold leading-snug text-slate-800">
              {question.question}
            </h2>
            {question.hint ? (
              <p className="mb-3 text-xs text-slate-500">{question.hint}</p>
            ) : null}

            <div className="mb-3 grid gap-1.5">
              {question.options.map((option) => (
                <MotionButton
                  key={option.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={() => onSelectOption?.(question.id, option)}
                  className="explore-touch-target min-h-[44px] rounded-xl border border-slate-200/80 bg-[#FDFBF7] px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50/40 disabled:opacity-50 sm:min-h-[40px] sm:py-2 sm:text-sm"
                >
                  {option.label}
                </MotionButton>
              ))}
            </div>
          </>
        ) : !loading && !showRationale ? (
          <div className="mb-3 rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-3 py-2.5 text-xs text-emerald-800">
            {NANDO_COPY.complete}
          </div>
        ) : null}

        <form onSubmit={handleCustomSubmit} className="mt-auto pt-2">
          <label htmlFor="nando-custom-input" className="sr-only">
            Scrivi un dettaglio
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 focus-within:border-violet-300/60 focus-within:ring-2 focus-within:ring-violet-100">
            <input
              id="nando-custom-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={NANDO_COPY.inputPlaceholder}
              disabled={loading}
              className="min-h-[36px] flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!draft.trim() || loading}
              className="explore-touch-target inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E07A5F] text-white transition-colors hover:bg-[#c96a52] disabled:opacity-40"
              aria-label="Invia"
            >
              <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
