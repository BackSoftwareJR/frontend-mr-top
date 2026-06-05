import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { MotionButton } from '../../utils/motionProxy'

export default function SearchAssistantPanel({
  question,
  customNotes = '',
  canGoBack = false,
  canGoForward = false,
  loading = false,
  error = null,
  onBack,
  onForward,
  onSelectOption,
  onCustomSubmit,
  onMinimize,
  onClose,
  showWindowChrome = false,
  className = '',
}) {
  const [draft, setDraft] = useState('')
  const handleClose = onClose ?? onMinimize

  const handleCustomSubmit = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onCustomSubmit?.(text)
    setDraft('')
  }

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
            <p className="truncate text-xs font-semibold text-slate-700">Nando</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Nando</p>
            <p className="text-xs text-slate-500">Ti guido passo passo.</p>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={onBack}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              aria-label="Indietro"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={onForward}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
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
            Nando sta pensando…
          </p>
        ) : null}

        {error && !loading ? (
          <p className="mb-3 text-xs text-amber-700" aria-live="polite">
            Connessione lenta — uso le domande standard.
          </p>
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
                  className="min-h-[40px] rounded-lg border border-slate-200/80 bg-[#FDFBF7] px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50/40 disabled:opacity-50 sm:text-sm"
                >
                  {option.label}
                </MotionButton>
              ))}
            </div>
          </>
        ) : !loading ? (
          <div className="mb-3 rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-3 py-2.5 text-xs text-emerald-800">
            Ho abbastanza info per ora — scrivimi se vuoi aggiungere dettagli.
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
              placeholder="Scrivi… zona, budget, esigenze"
              disabled={loading}
              className="min-h-[36px] flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!draft.trim() || loading}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E07A5F] text-white hover:bg-[#c96a52] disabled:opacity-40"
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
