import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import {
  obGlassCard,
  obInput,
  obPrimaryBtn,
  obProgressFill,
  obProgressTrack,
  obSecondaryBtn,
} from '../onboardingStyles'

export const TRUST_QUESTIONS = [
  {
    id: 'emergency',
    title: 'Emergenza medica notturna',
    prompt: 'Qual è la procedura in caso di emergenza medica notturna?',
    type: 'textarea',
    placeholder:
      'Descrivi escalation, contatti medici, tempi di intervento e protocollo con familiari…',
  },
  {
    id: 'fall',
    title: 'Caduta ospite',
    prompt: 'Un ospite cade in corridoio alle 02:00. Quali sono i primi 3 passi obbligatori?',
    type: 'textarea',
    placeholder: 'Valutazione, assistenza, documentazione…',
  },
  {
    id: 'family',
    title: 'Comunicazione familiari',
    prompt: 'Come gestite una richiesta urgente da un familiare fuori orario?',
    type: 'textarea',
    placeholder: 'Canali, SLA, referente…',
  },
  {
    id: 'quality',
    title: 'Standard qualità',
    prompt: 'Quale metrica usate per misurare la qualità del servizio erogato?',
    type: 'text',
    placeholder: 'es. NPS familiari, audit interni mensili…',
  },
]

export default function StepTrustTest({ answers, onChange }) {
  const [index, setIndex] = useState(0)
  const question = TRUST_QUESTIONS[index]
  const value = answers[question.id] ?? ''
  const progress = ((index + 1) / TRUST_QUESTIONS.length) * 100

  const goNext = () => setIndex((i) => Math.min(i + 1, TRUST_QUESTIONS.length - 1))
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
          {index + 1} / {TRUST_QUESTIONS.length}
        </span>
      </div>

      <div className={obProgressTrack}>
        <motion.div
          className={obProgressFill}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className={obGlassCard}>
        <AnimatePresence mode="wait">
          <motion.div
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

            {question.type === 'textarea' ? (
              <textarea
                className={`${obInput} mt-4 min-h-[140px] resize-y`}
                value={value}
                onChange={(e) => onChange({ [question.id]: e.target.value })}
                placeholder={question.placeholder}
              />
            ) : (
              <input
                type="text"
                className={`${obInput} mt-4`}
                value={value}
                onChange={(e) => onChange({ [question.id]: e.target.value })}
                placeholder={question.placeholder}
              />
            )}
          </motion.div>
        </AnimatePresence>
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
        {index < TRUST_QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!value.trim()}
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
