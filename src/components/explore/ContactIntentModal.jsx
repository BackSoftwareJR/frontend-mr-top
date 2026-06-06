import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MapPin, ShieldCheck, X } from 'lucide-react'
import { CONTACT_INTENT_COPY } from '../../constants/siteCopy'
import {
  WIZARD_CONSENT_LABELS,
  WIZARD_CONSENT_UI,
} from '../../constants/wizardConsent'
import { REFINEMENT_CHIP_META } from '../../constants/pathRefinement'
import { MotionButton } from '../../utils/motionProxy'

const glassInputClass =
  'search-bar-input w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-100'

function ConsentCheckbox({ id, checked, onChange, children }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 text-xs leading-relaxed text-slate-600"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-700 focus:ring-violet-200"
      />
      <span>{children}</span>
    </label>
  )
}

function getZoneLabel(session, selections) {
  const trail = session?.refinementTrail ?? []
  const zoneFrame = [...trail].reverse().find((frame) => frame.questionId === 'refinement_zone')
  if (zoneFrame?.label) return zoneFrame.label

  const zoneId = selections?.refinement_zone
  if (zoneId === 'milano') return 'Milano e hinterland'
  if (zoneId === 'lombardia') return 'Altra zona in Lombardia'
  if (zoneId === 'altra') return 'Altra città o regione'
  if (zoneId) return zoneId.replace(/-/g, ' ')

  return 'Da definire'
}

function getAutonomyLabel(selections) {
  const care = selections?.refinement_care
  if (care === 'partial') return 'Autosufficiente'
  if (care === 'moderate') return 'Parziale'
  if (care === 'intensive') return 'Non autosufficiente'
  return 'Non indicato'
}

function getBudgetLabel(selections) {
  const budget = selections?.refinement_budget
  if (budget === 'under1500') return 'Fino a 1.500 €'
  if (budget === 'high') return 'Oltre 2.500 €'
  if (budget === 'mid') return '1.500 – 2.500 €'
  return 'Non indicato'
}

/**
 * Contact intent modal — explicit user choice before structure matching.
 */
export default function ContactIntentModal({
  open,
  path,
  session,
  selections = {},
  loading = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const closeRef = useRef(null)
  const [contact, setContact] = useState({ nome: '', telefono: '', email: '' })
  const [consents, setConsents] = useState({
    privacy: false,
    terms: false,
    partnerContact: false,
    marketing: false,
  })

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, loading])

  const summary = useMemo(
    () => ({
      zone: getZoneLabel(session, selections),
      autonomy: getAutonomyLabel(selections),
      budget: getBudgetLabel(selections),
    }),
    [session, selections],
  )

  const canSubmit =
    contact.nome.trim().length > 0 &&
    contact.telefono.trim().length >= 8 &&
    consents.privacy &&
    consents.terms &&
    consents.partnerContact &&
    !loading

  if (!open) return null

  const pathName = path?.name ?? path?.title ?? 'Percorso struttura'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit?.({ contact, consents })
  }

  return (
    <div
      className="explore-modal-shell fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-intent-title"
    >
      <button
        type="button"
        className="explore-modal-backdrop absolute inset-0"
        aria-label="Chiudi"
        onClick={loading ? undefined : onClose}
        disabled={loading}
      />

      <div className="explore-modal-panel relative flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span className="explore-modal-handle" aria-hidden />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#E07A5F]/90">
              {CONTACT_INTENT_COPY.modalTitle}
            </p>
            <h2 id="contact-intent-title" className="text-lg font-semibold text-slate-800 sm:text-xl">
              {pathName}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {CONTACT_INTENT_COPY.modalSubtitle}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="explore-touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 sm:h-8 sm:w-8 sm:rounded-lg"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <div className="rounded-xl border border-teal-800/10 bg-teal-800/[0.04] px-3.5 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-teal-900">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                {CONTACT_INTENT_COPY.antiFraud}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {CONTACT_INTENT_COPY.summaryHeading}
              </p>
              <dl className="grid gap-2 text-sm">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2">
                  <dt className="text-slate-500">{CONTACT_INTENT_COPY.zoneLabel}</dt>
                  <dd className="flex items-center gap-1 font-medium text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                    {summary.zone}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2">
                  <dt className="text-slate-500">{CONTACT_INTENT_COPY.autonomyLabel}</dt>
                  <dd className="font-medium text-slate-800">{summary.autonomy}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2">
                  <dt className="text-slate-500">{CONTACT_INTENT_COPY.budgetLabel}</dt>
                  <dd className="font-medium text-slate-800">{summary.budget}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {CONTACT_INTENT_COPY.contactHeading}
              </p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={contact.nome}
                  onChange={(event) => setContact((prev) => ({ ...prev, nome: event.target.value }))}
                  placeholder={CONTACT_INTENT_COPY.nomePlaceholder}
                  className={glassInputClass}
                  autoComplete="name"
                  required
                />
                <input
                  type="tel"
                  value={contact.telefono}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, telefono: event.target.value }))
                  }
                  placeholder={CONTACT_INTENT_COPY.telefonoPlaceholder}
                  className={glassInputClass}
                  autoComplete="tel"
                  required
                />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder={CONTACT_INTENT_COPY.emailPlaceholder}
                  className={glassInputClass}
                  autoComplete="email"
                />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {CONTACT_INTENT_COPY.consentIntro}
              </legend>
              <ConsentCheckbox
                id="explore-consent-privacy"
                checked={consents.privacy}
                onChange={(value) => setConsents((prev) => ({ ...prev, privacy: value }))}
              >
                {WIZARD_CONSENT_UI.privacy_policy.prefix}
                <Link
                  to={WIZARD_CONSENT_UI.privacy_policy.link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-800 underline-offset-2 hover:underline"
                >
                  {WIZARD_CONSENT_UI.privacy_policy.link.text}
                </Link>
                {WIZARD_CONSENT_UI.privacy_policy.suffix}
              </ConsentCheckbox>
              <ConsentCheckbox
                id="explore-consent-terms"
                checked={consents.terms}
                onChange={(value) => setConsents((prev) => ({ ...prev, terms: value }))}
              >
                {WIZARD_CONSENT_UI.terms_b2c.prefix}
                <Link
                  to={WIZARD_CONSENT_UI.terms_b2c.link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-800 underline-offset-2 hover:underline"
                >
                  {WIZARD_CONSENT_UI.terms_b2c.link.text}
                </Link>
                {WIZARD_CONSENT_UI.terms_b2c.suffix}
              </ConsentCheckbox>
              <ConsentCheckbox
                id="explore-consent-sharing"
                checked={consents.partnerContact}
                onChange={(value) => setConsents((prev) => ({ ...prev, partnerContact: value }))}
              >
                {WIZARD_CONSENT_LABELS.lead_sharing}
              </ConsentCheckbox>
            </fieldset>

            {error ? (
              <p className="rounded-xl border border-red-200/70 bg-red-50/90 px-3 py-2.5 text-sm text-red-950" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="explore-modal-panel__footer shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <MotionButton
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {CONTACT_INTENT_COPY.cancel}
              </MotionButton>
              <MotionButton
                type="submit"
                disabled={!canSubmit}
                whileTap={{ scale: 0.99 }}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#E07A5F] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#c96a52] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {CONTACT_INTENT_COPY.submitting}
                  </>
                ) : (
                  CONTACT_INTENT_COPY.submit
                )}
              </MotionButton>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              {REFINEMENT_CHIP_META.zone?.label ?? 'Zona'} · {summary.zone}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
