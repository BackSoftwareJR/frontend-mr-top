import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, HeartHandshake, CheckCircle2, PartyPopper } from 'lucide-react'
import { wizardConfig } from '../../data/wizardConfig'
import WizardStep from './WizardStep'
import MeshGradientBackground from '../ui/MeshGradientBackground'
import Card from '../ui/Card'
import Button from '../ui/Button'

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
      <MeshGradientBackground className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <Card hover={false} className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, delay: 0.15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sunny to-peach text-teal-warm shadow-peach"
            >
              <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <PartyPopper className="mx-auto mb-3 h-8 w-8 text-coral" />
              <h2 className="mb-3 text-2xl font-extrabold text-warm-text">Grazie!</h2>
              <p className="mb-8 font-medium leading-relaxed text-warm-muted">
                Stiamo analizzando le vostre risposte. Riceverete presto le soluzioni
                più adatte, selezionate con cura per voi.
              </p>
              <Link to="/">
                <Button variant="teal">Torna alla home</Button>
              </Link>
            </motion.div>
          </Card>
        </motion.div>
      </MeshGradientBackground>
    )
  }

  return (
    <MeshGradientBackground className="relative flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-glass backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-coral to-coral-deep text-white shadow-coral">
              <HeartHandshake className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="font-extrabold text-warm-text">CareAdvisor</span>
          </div>
          <Link
            to="/"
            className="flex h-11 w-11 items-center justify-center rounded-full text-warm-muted transition-colors hover:bg-peach-soft hover:text-warm-text"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="h-1.5 bg-peach-soft/80">
          <motion.div
            className="h-full rounded-r-full bg-gradient-to-r from-coral via-teal-warm to-teal-deep"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      <footer className="pb-8 text-center text-sm font-semibold text-warm-muted">
        Domanda {currentStep + 1} di {steps.length}
      </footer>
    </MeshGradientBackground>
  )
}
