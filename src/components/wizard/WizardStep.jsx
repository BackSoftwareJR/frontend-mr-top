import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import IconCardOption from './IconCardOption'
import PillToggle from './PillToggle'
import Button from '../ui/Button'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    y: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    y: direction > 0 ? -20 : 20,
    opacity: 0,
  }),
}

export default function WizardStep({
  step,
  direction,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  canProceed,
}) {
  const StepIcon = step.icon

  const renderInput = () => {
    switch (step.type) {
      case 'icon-cards':
        return (
          <div className="grid gap-4 sm:grid-cols-1">
            {step.options.map((option) => (
              <IconCardOption
                key={option.value}
                option={option}
                selected={value === option.value}
                onSelect={(v) => {
                  onChange(v)
                  setTimeout(onNext, 350)
                }}
              />
            ))}
          </div>
        )

      case 'text-input':
        return (
          <div className="space-y-3">
            <label htmlFor={step.id} className="block text-sm font-medium text-slate-700">
              {step.inputLabel}
            </label>
            <div className="relative">
              {StepIcon && (
                <StepIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700" />
              )}
              <input
                id={step.id}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={step.placeholder}
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-md shadow-slate-200/40 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        )

      case 'pill-toggle':
        return (
          <PillToggle
            options={step.options}
            selected={value}
            onSelect={onChange}
          />
        )

      case 'contact-form': {
        const formData = value || {}
        const updateField = (name, fieldValue) => {
          onChange({ ...formData, [name]: fieldValue })
        }

        return (
          <div className="space-y-4">
            {step.fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-md shadow-slate-200/40 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            ))}
          </div>
        )
      }

      default:
        return null
    }
  }

  const showNavButtons = step.type !== 'icon-cards'

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-xl"
    >
      <div className="mb-8">
        {StepIcon && step.type !== 'text-input' && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <StepIcon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        )}
        <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">{step.question}</h2>
        <p className="text-slate-600">{step.subtitle}</p>
      </div>

      {renderInput()}

      {showNavButtons && (
        <div className="mt-10 flex items-center justify-between gap-4">
          {!isFirst ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </button>
          ) : (
            <div />
          )}

          {isLast ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step.submitLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continua
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
