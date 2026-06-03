import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import IconCardOption from './IconCardOption'
import PillToggle from './PillToggle'
import Button from '../ui/Button'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    y: direction > 0 ? 24 : -24,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -100 : 100,
    y: direction > 0 ? -24 : 24,
    opacity: 0,
    scale: 0.96,
  }),
}

const inputClass =
  'w-full rounded-[2rem] border-2 border-peach/40 bg-glass py-4 text-warm-text shadow-peach placeholder:text-warm-muted/60 backdrop-blur-sm focus:border-teal-warm focus:outline-none focus:ring-4 focus:ring-teal-warm/20'

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
          <div className="grid gap-4">
            {step.options.map((option) => (
              <IconCardOption
                key={option.value}
                option={option}
                selected={value === option.value}
                onSelect={(v) => {
                  onChange(v)
                  setTimeout(onNext, 380)
                }}
              />
            ))}
          </div>
        )

      case 'text-input':
        return (
          <div className="space-y-3">
            <label htmlFor={step.id} className="block text-sm font-bold text-warm-text">
              {step.inputLabel}
            </label>
            <div className="relative">
              {StepIcon && (
                <StepIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-warm" />
              )}
              <input
                id={step.id}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={step.placeholder}
                className={`${inputClass} pl-14 pr-5`}
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
                  className="mb-1.5 block text-sm font-bold text-warm-text"
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
                  className={`${inputClass} px-5 py-3.5`}
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
      transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-xl"
    >
      <div className="mb-8">
        {StepIcon && step.type !== 'text-input' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-sunny to-peach text-coral shadow-peach"
          >
            <StepIcon className="h-7 w-7" strokeWidth={2} />
          </motion.div>
        )}
        <h2 className="mb-2 text-2xl font-extrabold text-warm-text sm:text-3xl">
          {step.question}
        </h2>
        <p className="font-medium text-warm-muted">{step.subtitle}</p>
      </div>

      {renderInput()}

      {showNavButtons && (
        <div className="mt-10 flex items-center justify-between gap-4">
          {!isFirst ? (
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-warm-muted transition-colors hover:bg-peach-soft hover:text-warm-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </motion.button>
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
