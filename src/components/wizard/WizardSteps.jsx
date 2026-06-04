import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MotionButton, MotionInput, MotionP } from '../../utils/motionProxy'
import BudgetRangeSlider from './BudgetRangeSlider'
import InfoDrawer, { InfoHelpButton } from '../ui/InfoDrawer'
import MapEditorFallback from '../maps/MapEditorFallback'

const InterestAreaMapEditor = lazy(() => import('../maps/InterestAreaMapEditor'))
import { autonomyInfo } from '../../data/autonomyInfo'
import { WIZARD_CONSENT_LABELS, WIZARD_CONSENT_UI } from '../../constants/wizardConsent'

const stepEase = [0.25, 0.46, 0.45, 0.94]

const glassInputClass =
  'w-full rounded-2xl border border-slate-200/50 bg-white/70 px-5 py-3.5 text-base font-medium text-slate-800 placeholder:text-slate-400 shadow-sm backdrop-blur-xl transition-colors focus:border-teal-800/30 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-800/15'

function StepNav({
  onBack,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  primaryTestId,
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <MotionButton
        type="button"
        onClick={onBack}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-700"
      >
        Indietro
      </MotionButton>
      <MotionButton
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        data-testid={primaryTestId}
        whileTap={primaryDisabled ? undefined : { scale: 0.97 }}
        className="inline-flex items-center rounded-xl border border-teal-800/20 bg-teal-800/[0.06] px-5 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/30 hover:bg-teal-800/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {primaryLabel}
      </MotionButton>
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
          <MotionButton
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
          </MotionButton>
        ))}
      </div>
    </>
  )
}

export function LocationStep({ step, value, onChange, onNext, onBack }) {
  const initialAreas = value?.interestAreas ?? value?.areas ?? []
  const [areas, setAreas] = useState(initialAreas)

  useEffect(() => {
    if (value?.interestAreas || value?.areas) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync wizard answer from navigation
      setAreas(value.interestAreas ?? value.areas ?? [])
    }
  }, [value])

  const buildLocationValue = (nextAreas) => {
    const primary = nextAreas[0]
    const label = primary?.label || nextAreas.map((area) => area.label).filter(Boolean).join(' · ') || step.placeholder

    const city = primary?.label?.split(',')[0]?.trim() || 'area'
    const slug = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    return {
      label,
      value: `${slug || 'area'}-${nextAreas.length}`,
      interestAreas: nextAreas,
    }
  }

  const handleAreasChange = (nextAreas) => {
    setAreas(nextAreas)
    onChange(buildLocationValue(nextAreas))
  }

  const canContinue = areas.length > 0

  const handleContinue = () => {
    if (!canContinue) return
    onChange(buildLocationValue(areas))
    onNext?.()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Cerca una località o disegna una o più aree sulla mappa
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]" data-testid="wizard-location-step">
        <Suspense fallback={<MapEditorFallback label="Caricamento mappa aree…" />}>
          <InterestAreaMapEditor areas={areas} onChange={handleAreasChange} />
        </Suspense>

        <div className="hidden rounded-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-xl lg:block">
          <p className="text-sm font-semibold text-slate-800">Come funziona</p>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
            <li>Cerca un comune per aggiungere un cerchio di circa 15 km.</li>
            <li>Usa la modalità cerchio o poligono per aree personalizzate.</li>
            <li>Puoi selezionare più zone di interesse.</li>
          </ul>
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onPrimary={handleContinue}
        primaryLabel="Continua"
        primaryDisabled={!canContinue}
        primaryTestId="wizard-location-continue"
      />
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
      <MotionP
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: stepEase }}
        className="mb-8 text-center text-base font-medium tracking-tight text-slate-700 sm:mb-10 sm:text-lg"
      >
        Da{' '}
        <span className="font-semibold text-teal-800">{formatEuro(minVal)} €</span>
        {' '}a{' '}
        <span className="font-semibold text-teal-800/80">{formatEuro(maxVal)} €</span>
      </MotionP>

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
          <MotionInput
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
