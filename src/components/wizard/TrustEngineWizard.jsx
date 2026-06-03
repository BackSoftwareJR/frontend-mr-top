import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, HeartHandshake, CheckCircle2 } from 'lucide-react'
import { wizardConfig } from '../../data/wizardConfig'
import WizardStep from './WizardStep'

function isStepComplete(step, value) {
  if (!value) return false

  switch (step.type) {
    case 'icon-cards':
    case 'pill-toggle':
      return Boolean(value)
    case 'text-input':
      return value.trim().length >= 2
    case 'contact-form':
      return step.fields.every((field) => {
        if (!field.required) return true
        const fieldValue = value[field.name]
        return fieldValue && fieldValue.trim().length > 0
      })
    default:
      return false
  }
}

export default function TrustEngineWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)

  const steps = wizardConfig.steps
  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const updateAnswer = (stepId, value) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }))
  }

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    } else {
      setCompleted(true)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl shadow-slate-200/60"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          >
            <CheckCircle2 className="h-10 w-10" strokeWidth={1.75} />
          </motion.div>
          <h2 className="mb-3 text-2xl font-bold text-slate-900">Grazie!</h2>
          <p className="mb-8 leading-relaxed text-slate-600">
            Stiamo analizzando le vostre risposte. Riceverete presto le soluzioni
            più adatte, selezionate con cura per voi.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-colors hover:bg-teal-900"
          >
            Torna alla home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-900">CareAdvisor</span>
          </div>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="h-1 bg-slate-100">
          <motion.div
            className="h-full bg-teal-700"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-28 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <WizardStep
            key={step.id}
            step={step}
            direction={direction}
            value={answers[step.id]}
            onChange={(v) => updateAnswer(step.id, v)}
            onNext={goNext}
            onBack={goBack}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
            canProceed={isStepComplete(step, answers[step.id])}
          />
        </AnimatePresence>
      </div>

      <footer className="pb-8 text-center text-sm text-slate-500">
        Domanda {currentStep + 1} di {steps.length}
      </footer>
    </div>
  )
}
