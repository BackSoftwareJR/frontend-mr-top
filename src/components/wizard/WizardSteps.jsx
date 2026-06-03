import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const MOCK_LOCATIONS = [
  { label: 'Milano (MI)', value: 'milano-mi' },
  { label: 'Milazzo (ME)', value: 'milazzo-me' },
  { label: 'Roma (RM)', value: 'roma-rm' },
  { label: 'Torino (TO)', value: 'torino-to' },
]

export default function AutonomyStep({ step, onSelect }) {
  return (
    <div className="grid gap-3">
      {step.options.map((option, index) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(91,138,114,0.4)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left shadow-sm transition-colors hover:border-[#5B8A72]/40 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8A72]/30"
        >
          <span className="text-lg font-bold text-slate-800">{option.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

export function LocationStep({ step, value, onSelect }) {
  const [query, setQuery] = useState(value?.label || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const suggestions =
    query.length >= 2
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
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-[#5B8A72]/50 focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/20"
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
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
                className="w-full px-5 py-3.5 text-left text-base font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none"
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

function formatEuro(value) {
  return new Intl.NumberFormat('it-IT').format(value)
}

function ThumbLabel({ value, percent }) {
  return (
    <div
      className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#5B8A72] shadow-sm"
      style={{ left: `${percent}%` }}
    >
      {formatEuro(value)}€
    </div>
  )
}

export function BudgetStep({ step, value, onChange, onNext, onBack }) {
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

  const minPercent = ((minVal - budgetMin) / (budgetMax - budgetMin)) * 100
  const maxPercent = ((maxVal - budgetMin) / (budgetMax - budgetMin)) * 100
  const fillLeft = minPercent
  const fillWidth = maxPercent - minPercent

  return (
    <div>
      <p className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
        Da {formatEuro(minVal)}€ a {formatEuro(maxVal)}€
      </p>

      <div className="relative mb-4 h-14">
        <ThumbLabel value={minVal} percent={minPercent} />
        <ThumbLabel value={maxVal} percent={maxPercent} />

        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#5B8A72]"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        <input
          type="range"
          min={budgetMin}
          max={budgetMax}
          step={budgetStep}
          value={minVal}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="glass-range range-overlay z-20"
          aria-label="Budget minimo"
        />
        <input
          type="range"
          min={budgetMin}
          max={budgetMax}
          step={budgetStep}
          value={maxVal}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="glass-range range-overlay z-30"
          aria-label="Budget massimo"
        />
      </div>

      <div className="mb-10 flex justify-between text-sm font-medium text-slate-400">
        <span>{formatEuro(budgetMin)}€</span>
        <span>{formatEuro(budgetMax)}€</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          Indietro
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl bg-[#5B8A72] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#4A7360]"
        >
          Continua
        </button>
      </div>
    </div>
  )
}

export function ContactStep({ step, value, onChange, onSubmit, onBack, canSubmit }) {
  const formData = value || {}

  const updateField = (name, fieldValue) => {
    onChange({ ...formData, [name]: fieldValue })
  }

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-[#5B8A72]/50 focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/20'

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
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          Indietro
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="rounded-2xl bg-[#5B8A72] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#4A7360] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step.submitLabel}
        </button>
      </div>
    </div>
  )
}

export function isContactComplete(step, value) {
  if (!value) return false
  return step.fields.every((field) => {
    if (!field.required) return true
    const fieldValue = value[field.name]
    return fieldValue && fieldValue.trim().length > 0
  })
}
