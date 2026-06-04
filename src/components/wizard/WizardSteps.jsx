import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BudgetRangeSlider from './BudgetRangeSlider'
import InfoDrawer, { InfoHelpButton } from '../ui/InfoDrawer'
import { autonomyInfo } from '../../data/autonomyInfo'
import { WIZARD_CONSENT_LABELS, WIZARD_CONSENT_UI } from '../../constants/wizardConsent'
import { searchLocations } from '../../services/locationService'

const LOCATION_DEBOUNCE_MS = 300

const stepEase = [0.25, 0.46, 0.45, 0.94]

const glassInputClass =
  'w-full rounded-2xl border border-slate-200/50 bg-white/70 px-5 py-3.5 text-base font-medium text-slate-800 placeholder:text-slate-400 shadow-sm backdrop-blur-xl transition-colors focus:border-teal-800/30 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-800/15'

function StepNav({ onBack, onPrimary, primaryLabel, primaryDisabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <motion.button
        type="button"
        onClick={onBack}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-700"
      >
        Indietro
      </motion.button>
      <motion.button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        whileTap={primaryDisabled ? undefined : { scale: 0.97 }}
        className="inline-flex items-center rounded-xl border border-teal-800/20 bg-teal-800/[0.06] px-5 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/30 hover:bg-teal-800/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {primaryLabel}
      </motion.button>
    </div>
  )
}

export default function AutonomyStep({ step, onSelect }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Scegli il livello più vicino alla situazione</p>
        <InfoHelpButton onClick={() => setDrawerOpen(true)} />
      </div>

      <InfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={autonomyInfo.title}
      >
        <p className="mb-5 text-sm leading-relaxed text-slate-600">{autonomyInfo.intro}</p>
        <div className="space-y-3">
          {autonomyInfo.levels.map((level) => (
            <div
              key={level.value}
              className="rounded-xl border border-slate-200/50 bg-white/70 p-4 backdrop-blur-xl"
            >
              <h3 className="mb-1 text-sm font-semibold text-teal-800">{level.label}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{level.description}</p>
            </div>
          ))}
        </div>
      </InfoDrawer>

      <div className="grid gap-2.5">
        {step.options.map((option, index) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: stepEase }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl border border-slate-200/50 bg-white/70 px-5 py-4 text-left shadow-sm backdrop-blur-xl transition-colors hover:border-teal-800/25 hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-800/20"
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="text-base font-semibold text-slate-800">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </>
  )
}

export function LocationStep({ step, value, onSelect }) {
  const [query, setQuery] = useState(value?.label || '')
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      return undefined
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const timer = window.setTimeout(async () => {
      setLoading(true)

      try {
        const results = await searchLocations(trimmed)

        if (requestIdRef.current !== requestId) {
          return
        }

        setSuggestions(results)
      } catch (error) {
        console.error('[Wenando] Location autocomplete failed:', error)

        if (requestIdRef.current === requestId) {
          setSuggestions([])
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false)
        }
      }
    }, LOCATION_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query])

  const visibleSuggestions = query.trim().length >= 2 ? suggestions : []

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-3 text-sm text-slate-500">Inizia a digitare il comune o la città</p>

      <motion.input
        type="text"
        value={query}
        onChange={(e) => {
          const nextQuery = e.target.value
          setQuery(nextQuery)
          setOpen(true)
          if (nextQuery.trim().length < 2) {
            setSuggestions([])
            setLoading(false)
          }
        }}
        onFocus={() => setOpen(true)}
        placeholder={step.placeholder}
        className={glassInputClass}
        autoComplete="off"
        whileFocus={{ scale: 1.005 }}
        transition={{ duration: 0.2, ease: stepEase }}
      />

      {open && loading && visibleSuggestions.length === 0 ? (
        <p className="mt-2 px-1 text-sm text-slate-500">Ricerca in corso…</p>
      ) : null}

      {open && visibleSuggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: stepEase }}
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 shadow-lg backdrop-blur-xl"
          style={{ willChange: 'transform, opacity' }}
        >
          {visibleSuggestions.map((loc, index) => (
            <li key={loc.value}>
              <motion.button
                type="button"
                onClick={() => {
                  setQuery(loc.label)
                  setOpen(false)
                  onSelect(loc)
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-5 py-3 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-teal-800/[0.04] focus:outline-none focus-visible:bg-teal-800/[0.06]"
              >
                {loc.label}
              </motion.button>
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

export function BudgetStep({ step, value, onChange, onNext, onBack }) {
  const budgetMin = step.min
  const budgetMax = step.max
  const budgetStep = step.step

  const [minVal, setMinVal] = useState(value?.min ?? step.defaultMin)
  const [maxVal, setMaxVal] = useState(value?.max ?? step.defaultMax)

  useEffect(() => {
    if (value?.min != null && value?.max != null) return
    onChange({ min: step.defaultMin, max: step.defaultMax })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync defaults once per step mount
  }, [])

  const persistBudget = () => onChange({ min: minVal, max: maxVal })

  const handleContinue = () => {
    persistBudget()
    onNext()
  }

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

  return (
    <div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: stepEase }}
        className="mb-8 text-center text-base font-medium tracking-tight text-slate-700 sm:mb-10 sm:text-lg"
      >
        Da{' '}
        <span className="font-semibold text-teal-800">{formatEuro(minVal)} €</span>
        {' '}a{' '}
        <span className="font-semibold text-teal-800/80">{formatEuro(maxVal)} €</span>
      </motion.p>

      <div className="mb-10">
        <BudgetRangeSlider
          min={budgetMin}
          max={budgetMax}
          step={budgetStep}
          minVal={minVal}
          maxVal={maxVal}
          onMinChange={handleMinChange}
          onMaxChange={handleMaxChange}
        />
      </div>

      <StepNav onBack={onBack} onPrimary={handleContinue} primaryLabel="Continua" />
    </div>
  )
}

const consentCheckboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-800 focus:ring-teal-800/20'

const consentLinkClass =
  'font-semibold text-teal-800 underline-offset-2 hover:underline'

function ConsentCheckbox({ id, checked, onChange, children }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/50 bg-white/60 px-4 py-3 text-sm leading-snug text-slate-700 backdrop-blur-xl transition-colors hover:bg-white/80"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={consentCheckboxClass}
      />
      <span>{children}</span>
    </label>
  )
}

export function ContactStep({
  step,
  value,
  onChange,
  onSubmit,
  onBack,
  canSubmit,
  consents,
  onConsentsChange,
}) {
  const formData = value || {}

  const updateField = (name, fieldValue) => {
    onChange({ ...formData, [name]: fieldValue })
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(consents)
  }

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">Ti contatteremo solo con le opzioni più adatte</p>

      <div className="mb-6 space-y-3">
        {step.fields.map((field, index) => (
          <motion.input
            key={field.name}
            id={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={glassInputClass}
            aria-label={field.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: stepEase }}
          />
        ))}
      </div>

      <fieldset className="mb-8 space-y-2.5">
        <legend className="sr-only">Consensi obbligatori e facoltativi</legend>
        <ConsentCheckbox
          id="consent-privacy"
          checked={consents.privacy}
          onChange={(v) => onConsentsChange({ ...consents, privacy: v })}
        >
          {WIZARD_CONSENT_UI.privacy_policy.prefix}
          <Link
            to={WIZARD_CONSENT_UI.privacy_policy.link.to}
            target="_blank"
            rel="noopener noreferrer"
            className={consentLinkClass}
          >
            {WIZARD_CONSENT_UI.privacy_policy.link.text}
          </Link>
          {WIZARD_CONSENT_UI.privacy_policy.suffix}
        </ConsentCheckbox>
        <ConsentCheckbox
          id="consent-terms"
          checked={consents.terms}
          onChange={(v) => onConsentsChange({ ...consents, terms: v })}
        >
          {WIZARD_CONSENT_UI.terms_b2c.prefix}
          <Link
            to={WIZARD_CONSENT_UI.terms_b2c.link.to}
            target="_blank"
            rel="noopener noreferrer"
            className={consentLinkClass}
          >
            {WIZARD_CONSENT_UI.terms_b2c.link.text}
          </Link>
          {WIZARD_CONSENT_UI.terms_b2c.suffix}
        </ConsentCheckbox>
        <ConsentCheckbox
          id="consent-partner"
          checked={consents.partnerContact}
          onChange={(v) => onConsentsChange({ ...consents, partnerContact: v })}
        >
          {WIZARD_CONSENT_LABELS.lead_sharing}
        </ConsentCheckbox>
        <ConsentCheckbox
          id="consent-marketing"
          checked={consents.marketing}
          onChange={(v) => onConsentsChange({ ...consents, marketing: v })}
        >
          {WIZARD_CONSENT_LABELS.marketing}
        </ConsentCheckbox>
      </fieldset>

      <StepNav
        onBack={onBack}
        onPrimary={handleSubmit}
        primaryLabel={step.submitLabel}
        primaryDisabled={!canSubmit}
      />
    </div>
  )
}

export function isContactFieldsComplete(step, value) {
  if (!value) return false
  return step.fields.every((field) => {
    if (!field.required) return true
    const fieldValue = value[field.name]
    return fieldValue && fieldValue.trim().length > 0
  })
}

export function isContactSubmitReady(step, value, consents) {
  return (
    isContactFieldsComplete(step, value) &&
    consents?.privacy === true &&
    consents?.terms === true
  )
}
