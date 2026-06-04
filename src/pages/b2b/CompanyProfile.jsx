import { useCallback, useEffect, useState } from 'react'
import { Building2, Loader2, Save } from 'lucide-react'
import {
  b2bCard,
  b2bInput,
  b2bInputFocus,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bIconAccent,
  b2bPrimaryBtn,
} from '../../components/b2b/b2bStyles'
import { isApiConfigured } from '../../services/apiClient'
import { loadB2bCompanyProfile, saveB2bCompanyProfile } from '../../services/b2bCompanyProfileService'
import { useB2B } from '../../context/B2BContext'

const EMPTY_FORM = {
  displayName: '',
  tagline: '',
  description: '',
  prosText: '',
  imageUrl: '',
  locationLabel: '',
  contactHint: '',
}

function prosToText(pros) {
  return Array.isArray(pros) ? pros.join('\n') : ''
}

function textToPros(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function CompanyProfile() {
  const { showToast } = useB2B()
  const [form, setForm] = useState(EMPTY_FORM)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadB2bCompanyProfile()
      .then(({ company, profile }) => {
        if (cancelled) return
        setCompanyName(company?.organizationName ?? '')
        if (profile) {
          setForm({
            displayName: profile.displayName ?? '',
            tagline: profile.tagline ?? '',
            description: profile.description ?? '',
            prosText: prosToText(profile.pros),
            imageUrl: profile.imageUrl ?? '',
            locationLabel: profile.locationLabel ?? '',
            contactHint: profile.contactHint ?? '',
          })
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Impossibile caricare il profilo azienda.', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [showToast])

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const result = await saveB2bCompanyProfile({
        displayName: form.displayName.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        pros: textToPros(form.prosText),
        imageUrl: form.imageUrl.trim() || null,
        locationLabel: form.locationLabel.trim() || null,
        contactHint: form.contactHint.trim() || null,
      })

      if (result.profile) {
        setForm({
          displayName: result.profile.displayName ?? '',
          tagline: result.profile.tagline ?? '',
          description: result.profile.description ?? '',
          prosText: prosToText(result.profile.pros),
          imageUrl: result.profile.imageUrl ?? '',
          locationLabel: result.profile.locationLabel ?? '',
          contactHint: result.profile.contactHint ?? '',
        })
      }

      showToast('Profilo azienda aggiornato.', 'success')
    } catch {
      showToast('Salvataggio non riuscito. Riprova.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-charcoal-muted">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Caricamento profilo…</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className={b2bPageTitle}>Profilo Azienda</h1>
        <p className={b2bPageSubtitle}>
          Testo e immagini mostrati ai familiari nelle card match B2C
          {companyName ? ` — ${companyName}` : ''}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${b2bCard} space-y-5 p-6`}>
        <div className="flex items-center gap-3 border-b border-black/5 pb-4">
          <div className={b2bIconAccent}>
            <Building2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">Scheda pubblica</p>
            <p className="text-xs text-charcoal-muted">
              I campi non compilati usano i fallback operativi della struttura.
            </p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Nome visualizzato</span>
          <input
            type="text"
            required
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full`}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Tagline</span>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => updateField('tagline', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full`}
            placeholder="Frase breve sotto il nome"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Descrizione</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full resize-y`}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Punti di forza</span>
          <span className="block text-xs text-charcoal-muted">Un punto per riga (max 20)</span>
          <textarea
            rows={4}
            value={form.prosText}
            onChange={(e) => updateField('prosText', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full resize-y`}
            placeholder={'Operatori qualificati\nOrari flessibili'}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">URL immagine</span>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full`}
            placeholder="https://…"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Etichetta zona</span>
          <input
            type="text"
            value={form.locationLabel}
            onChange={(e) => updateField('locationLabel', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full`}
            placeholder="Milano, Zona Navigli"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-charcoal">Suggerimento contatto</span>
          <textarea
            rows={2}
            value={form.contactHint}
            onChange={(e) => updateField('contactHint', e.target.value)}
            className={`${b2bInput} ${b2bInputFocus} w-full resize-y`}
            placeholder="Come e quando contattare la struttura"
          />
        </label>

        <div className="flex justify-end border-t border-black/5 pt-4">
          <button type="submit" disabled={saving} className={b2bPrimaryBtn}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Salva profilo
          </button>
        </div>
      </form>
    </div>
  )
}
