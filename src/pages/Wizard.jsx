import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { wizardConfig } from '../data/wizardConfig'
import AuroraBackground from '../components/layout/AuroraBackground'
import { WizardHeader } from '../components/wizard/WizardShell'
import AnalyzingState from '../components/wizard/AnalyzingState'
import MulticolorHeading from '../components/ui/MulticolorHeading'
import SectionBlob from '../components/ui/SectionBlob'
import AutonomyStep, {
  LocationStep,
  BudgetStep,
  ContactStep,
  isContactSubmitReady,
} from '../components/wizard/WizardSteps'
import { buildWizardConsentPayload } from '../constants/wizardConsent'
import { ApiError, isApiConfigured } from '../services/apiClient'
import { submitLead } from '../services/leadService'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

export default function Wizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState({})
  const [analyzing, setAnalyzing] = useState(false)
  const [wizardConsents, setWizardConsents] = useState({
    privacy: false,
    terms: false,
    partnerContact: false,
    marketing: false,
  })
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
    }
  }

  const handleContactSubmit = async (consents) => {
    const contactStep = steps.find((s) => s.type === 'contact-form')
    if (!contactStep || !isContactSubmitReady(contactStep, answers[contactStep.id], consents)) {
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    const consentPayload = buildWizardConsentPayload(consents, answers)

    try {
      const result = await submitLead({ answers, consents })
      setAnswers((prev) => ({
        ...prev,
        _consents: consents,
        _consentPayload: consentPayload,
        _leadUuid: result.lead?.uuid,
        _leadPublicRef: result.lead?.public_ref,
        _leadMock: Boolean(result._mock),
      }))
      setAnalyzing(true)
    } catch (error) {
      console.error('[Wenando] Wizard lead submit failed:', error)
      if (isApiConfigured()) {
        const message =
          error instanceof ApiError
            ? error.message
            : (error?.message ?? 'Invio non riuscito. Riprova tra poco.')
        setSubmitError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnalysisComplete = useCallback(() => {
    navigate('/results', {
      state: {
        answers,
        leadUuid: answers._leadUuid,
      },
      replace: true,
    })
  }, [navigate, answers])

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }

  const handleAutoAdvance = (stepId, value) => {
    updateAnswer(stepId, value)
    setTimeout(() => {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }, 280)
  }

  const renderStepContent = () => {
    switch (step.type) {
      case 'cards':
        return (
          <AutonomyStep
            step={step}
            onSelect={(value) => handleAutoAdvance(step.id, value)}
          />
        )
      case 'autocomplete':
        return (
          <LocationStep
            step={step}
            value={answers[step.id]}
            onSelect={(loc) => handleAutoAdvance(step.id, loc)}
          />
        )
      case 'range-slider':
        return (
          <BudgetStep
            step={step}
            value={answers[step.id]}
            onChange={(v) => updateAnswer(step.id, v)}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'contact-form':
        return (
          <ContactStep
            step={step}
            value={answers[step.id]}
            onChange={(v) => updateAnswer(step.id, v)}
            onSubmit={handleContactSubmit}
            onBack={goBack}
            consents={wizardConsents}
            onConsentsChange={setWizardConsents}
            canSubmit={isContactSubmitReady(step, answers[step.id], wizardConsents) && !submitting}
          />
        )
      default:
        return null
    }
  }

  if (analyzing) {
    return <AnalyzingState onComplete={handleAnalysisComplete} />
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <AuroraBackground />
      <SectionBlob variant="violet" shape="blob" position="top-left" />
      <SectionBlob variant="amber" shape="ring" position="bottom-right" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <WizardHeader progress={progress} />

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-28 sm:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-xl"
            >
              <MulticolorHeading
                as="h2"
                words={step.question}
                className="mb-8 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
                startIndex={currentStep}
                trigger="mount"
              />
              {renderStepContent()}
              {isApiConfigured() && submitError ? (
                <p
                  className="mt-4 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="pb-8 text-center text-sm font-medium text-slate-400">
          {currentStep + 1} / {steps.length}
        </footer>
      </div>
    </div>
  )
}
