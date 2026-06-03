import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, HeartHandshake, X } from 'lucide-react'
import { wizardConfig } from '../../data/wizardConfig'
import Button from '../ui/Button'
import Card from '../ui/Card'

const MOCK_LOCATIONS = [
  { label: 'Milano (MI)', value: 'milano-mi' },
  { label: 'Milazzo (ME)', value: 'milazzo-me' },
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
}

function formatEuro(value) {
  return new Intl.NumberFormat('it-IT').format(value)
}

function AutonomyStep({ step, onSelect }) {
  return (
    <div className="grid gap-3">
      {step.options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-5 text-left transition-colors hover:border-[#1A4D2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4D2E]/25"
        >
          <span className="text-lg font-bold text-zinc-900">{option.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

function LocationStep({ step, value, onSelect }) {
  const [query, setQuery] = useState(value?.label || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const suggestions = query.length >= 2
    ? MOCK_LOCATIONS.filter((loc) =>
        loc.label.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={step.placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-lg font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[#1A4D2E] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/15"
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white"
        >
          {suggestions.map((loc) => (
            <li key={loc.value}>
              <button
                type="button"
                onClick={() => {
                  setQuery(loc.label)
                  setOpen(false)
                  onSelect(loc)
                }}
                className="w-full px-5 py-3.5 text-left text-base font-medium text-zinc-900 transition-colors hover:bg-[#F5F5F0] focus:outline-none focus-visible:bg-[#F5F5F0]"
              >
                {loc.label}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}

function BudgetStep({ step, value, onChange, onNext, onBack }) {
  const budgetMin = step.min
  const budgetMax = step.max
  const budgetStep = step.step

  const [minVal, setMinVal] = useState(value?.min ?? step.defaultMin)
  const [maxVal, setMaxVal] = useState(value?.max ?? step.defaultMax)

  const handleMinChange = (nextMin) => {
    const clamped = Math.min(nextMin, maxVal - budgetStep)
    setMinVal(clamped)
    onChange({ min: clamped, max: maxVal })
  }

  const handleMaxChange = (nextMax) => {
    const clamped = Math.max(nextMax, minVal + budgetStep)
    setMaxVal(clamped)
    onChange({ min: minVal, max: clamped })
  }

  const fillLeft = ((minVal - budgetMin) / (budgetMax - budgetMin)) * 100
  const fillWidth = ((maxVal - minVal) / (budgetMax - budgetMin)) * 100

  return (
    <div>
      <p className="mb-10 text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
        Da {formatEuro(minVal)}€ a {formatEuro(maxVal)}€
      </p>

      <div className="relative mb-4 h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#1A4D2E]"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        <input
          type="range"
          min={budgetMin}
          max={budgetMax}
          step={budgetStep}
          value={minVal}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="range-overlay z-20"
          aria-label="Budget minimo"
        />
        <input
          type="range"
          min={budgetMin}
          max={budgetMax}
          step={budgetStep}
          value={maxVal}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="range-overlay z-30"
          aria-label="Budget massimo"
        />
      </div>

      <div className="mb-10 flex justify-between text-sm font-medium text-zinc-500">
        <span>{formatEuro(budgetMin)}€</span>
        <span>{formatEuro(budgetMax)}€</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </button>
        <Button type="button" onClick={onNext}>
          Continua
        </Button>
      </div>
    </div>
  )
}

function ContactStep({ step, value, onChange, onSubmit, onBack, canSubmit }) {
  const formData = value || {}

  const updateField = (name, fieldValue) => {
    onChange({ ...formData, [name]: fieldValue })
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1A4D2E] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/15'

  return (
    <div>
      <div className="mb-8 space-y-4">
        {step.fields.map((field) => (
          <input
            key={field.name}
            id={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={inputClass}
            aria-label={field.label}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </button>
        <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
          {step.submitLabel}
        </Button>
      </div>
    </div>
  )
}

function isContactComplete(step, value) {
  if (!value) return false
  return step.fields.every((field) => {
    if (!field.required) return true
    const fieldValue = value[field.name]
    return fieldValue && fieldValue.trim().length > 0
  })
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
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F0] px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <Card hover={false} className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A4D2E] text-white">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900">Grazie</h2>
            <p className="mb-8 leading-relaxed text-zinc-600">
              Stiamo analizzando le vostre risposte. Riceverete presto le soluzioni
              più adatte.
            </p>
            <Link to="/">
              <Button variant="secondary">Torna alla home</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F5F5F0]">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-[#F5F5F0]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A4D2E] text-white">
              <HeartHandshake className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="font-bold text-zinc-900">CareAdvisor</span>
          </div>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="h-1 bg-zinc-200">
          <motion.div
            className="h-full bg-[#1A4D2E]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-28 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-xl"
          >
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 sm:text-3xl">
              {step.question}
            </h2>
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="pb-8 text-center text-sm font-medium text-zinc-500">
        {currentStep + 1} / {steps.length}
      </footer>
    </div>
  )
}
