import { useEffect, useState } from 'react'
import { MaybeAnimatePresence, MotionDiv } from '../../../utils/motionProxy'
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import {
  obGlassCard,
  obPrimaryBtn,
  obProgressFill,
  obProgressTrack,
  obSecondaryBtn,
} from '../onboardingStyles'
import { fetchTrustQuestionsAsync } from '../../../services/b2bOnboardingService'

function QuestionOptions({ question, value, onSelect }) {
  if (question.type === 'select') {
    return (
      <select
        className="mt-4 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm text-charcoal focus:border-teal-800/40 focus:outline-none focus:ring-2 focus:ring-teal-800/15"
        value={value}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Seleziona una risposta…</option>
        {question.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <fieldset className="mt-4 space-y-2">
      <legend className="sr-only">{question.prompt}</legend>
      {question.options.map((opt) => {
        const checked = value === opt.value
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${
              checked
                ? 'border-teal-800/30 bg-teal-800/5 text-charcoal'
                : 'border-black/5 bg-white/70 text-charcoal-muted hover:border-teal-800/15'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={opt.value}
              checked={checked}
              onChange={() => onSelect(opt.value)}
              className="mt-0.5 h-4 w-4 border-slate-300 text-teal-800 focus:ring-teal-800/20"
            />
            <span>{opt.label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default function StepTrustTest({ sector, answers, onChange, onQuestionsLoaded }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!sector) return undefined

    let cancelled = false

    fetchTrustQuestionsAsync(sector)
      .then((payload) => {
        if (cancelled) return
        const loaded = payload.questions ?? []
        setQuestions(loaded)
        setLoading(false)
        onQuestionsLoaded?.(loaded)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err?.message ?? 'Impossibile caricare le domande.')
        setLoading(false)
        onQuestionsLoaded?.([])
      })

    return () => {
      cancelled = true
    }
  }, [sector, onQuestionsLoaded])

  if (!sector) {
    return (
      <p className="text-sm text-charcoal-muted">
        Seleziona prima il settore operativo nel passo precedente.
      </p>
    )
  }

  if (loading) {
    return (
      <p className="text-sm text-charcoal-muted" aria-live="polite">
        Caricamento questionario Trust Test…
      </p>
    )
  }

  if (loadError || questions.length === 0) {
    return (
      <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
        {loadError ?? 'Nessuna domanda disponibile per questo settore.'}
      </p>
    )
  }

  const question = questions[index]
  const value = answers[question.id] ?? ''
  const progress = ((index + 1) / questions.length) * 100

  const goNext = () => setIndex((i) => Math.min(i + 1, questions.length - 1))
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber-dark">
            <Shield className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-charcoal">Trust Test</span>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-charcoal-muted ring-1 ring-black/5">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className={obProgressTrack}>
        <MotionDiv
          className={obProgressFill}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className={obGlassCard}>
        <MaybeAnimatePresence mode="wait">
          <MotionDiv
            key={question.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-accent-amber-dark">
              {question.title}
            </p>
            <p className="mt-2 text-base font-medium text-charcoal">{question.prompt}</p>
            <QuestionOptions
              question={question}
              value={value}
              onSelect={(next) => onChange({ [question.id]: next })}
            />
          </MotionDiv>
        </MaybeAnimatePresence>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className={`${obSecondaryBtn} !w-auto flex-1 sm:flex-none sm:px-6`}
        >
          <ChevronLeft className="h-4 w-4" />
          Indietro
        </button>
        {index < questions.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!value}
            className={`${obPrimaryBtn} !w-auto flex-1 sm:flex-none sm:px-6`}
          >
            Avanti
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
