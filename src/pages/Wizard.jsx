import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { wizardConfig } from '../data/wizardConfig'
import AuroraBackground from '../components/layout/AuroraBackground'
import { WizardHeader, WizardComplete } from '../components/wizard/WizardShell'
import MulticolorHeading from '../components/ui/MulticolorHeading'
import SectionBlob from '../components/ui/SectionBlob'
import AutonomyStep, {
  LocationStep,
  BudgetStep,
  ContactStep,
  isContactComplete,
} from '../components/wizard/WizardSteps'

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
            onSubmit={goNext}
            onBack={goBack}
            canSubmit={isContactComplete(step, answers[step.id])}
          />
        )
      default:
        return null
    }
  }

  if (completed) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AuroraBackground />
        <SectionBlob variant="coral" shape="circle" position="top-right" />
        <SectionBlob variant="violet" shape="blob" position="bottom-left" />
        <div className="relative z-10">
          <WizardComplete />
        </div>
      </div>
    )
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
