import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Info, Loader2, Save, Send } from 'lucide-react'
import B2BLoadError from '../../../components/b2b/B2BLoadError'
import {
  b2bCard,
  b2bGhostBtn,
  b2bInput,
  b2bInputFocus,
  b2bPrimaryBtn,
} from '../../../components/b2b/b2bStyles'
import { createStarterArticleBlocks } from '../../../components/admin/editorial/blockUtils'
import TileEditor from '../../../components/admin/editorial/TileEditor'
import { useB2B } from '../../../context/B2BContext'
import { fetchEditorialRubrics } from '../../../services/editorialService'
import {
  B2B_EDITORIAL_CONTENT_TYPES,
  B2B_STRUCTURE_DISCLAIMER_FALLBACK,
  createB2bContent,
  getB2bContent,
  submitB2bContent,
  updateB2bContent,
} from '../../../services/b2bEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialContentStatusPill from '../../../components/editorial/EditorialContentStatusPill'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'
import EditorialSaveStatus from '../../../components/editorial/EditorialSaveStatus'

const inputClass = `${b2bInput} ${b2bInputFocus}`

function serializeB2bPayload({ contentType, title, subtitle, rubricId, bodyBlocks }) {
  return JSON.stringify({
    type: contentType,
    title: title.trim(),
    subtitle: subtitle.trim() || null,
    rubric_id: Number(rubricId),
    body_blocks: bodyBlocks.map((block) => ({
      id: block.id,
      type: block.type,
      data: block.data ?? {},
    })),
  })
}

function StructureDisclaimerBanner({ text }) {
  return (
    <div
      role="note"
      aria-live="polite"
      className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div>
        <p className="font-medium text-amber-950">Disclaimer struttura</p>
        <p className="mt-1 text-amber-900/90">{text}</p>
        <p className="mt-2 text-xs text-amber-800/80">
          Questo avviso viene mostrato sui contenuti della struttura e non può essere rimosso.
        </p>
      </div>
    </div>
  )
}

export default function EditorialEditorPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const { showToast } = useB2B()
  const isNew = !uuid

  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(!isNew && isApiConfigured())
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come partner.',
  )
  const [updatedAt, setUpdatedAt] = useState(null)
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [status, setStatus] = useState('draft')
  const [structureDisclaimer, setStructureDisclaimer] = useState(B2B_STRUCTURE_DISCLAIMER_FALLBACK)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [contentType, setContentType] = useState('story')
  const [rubricId, setRubricId] = useState('')
  const [bodyBlocks, setBodyBlocks] = useState(createStarterArticleBlocks())

  const isEditable = status === 'draft' || status === 'rejected'

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    fetchEditorialRubrics()
      .then((data) => {
        setRubrics(data)
        if (isNew && data.length > 0) {
          setRubricId(String(data[0].id))
        }
      })
      .catch(() => setRubrics([]))

    return undefined
  }, [isNew])

  const buildPayload = useCallback(
    () => ({
      type: contentType,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      rubric_id: Number(rubricId),
      body_blocks: bodyBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        data: block.data ?? {},
      })),
    }),
    [contentType, title, subtitle, rubricId, bodyBlocks],
  )

  const currentSnapshot = useMemo(
    () => JSON.stringify(buildPayload()),
    [buildPayload],
  )

  const isDirty = savedSnapshot !== null && currentSnapshot !== savedSnapshot

  useEffect(() => {
    if (isNew || !uuid || !isApiConfigured()) return undefined

    let cancelled = false

    getB2bContent(uuid)
      .then((content) => {
        if (cancelled) return
        setTitle(content.title ?? '')
        setSubtitle(content.subtitle ?? '')
        setContentType(content.contentType ?? 'story')
        setRubricId(content.rubricId ? String(content.rubricId) : '')
        setBodyBlocks(
          content.bodyBlocks?.length > 0
            ? content.bodyBlocks
            : createStarterArticleBlocks(),
        )
        setUpdatedAt(content.updatedAt)
        setStatus(content.status ?? 'draft')
        setStructureDisclaimer(content.structureDisclaimer ?? B2B_STRUCTURE_DISCLAIMER_FALLBACK)
        setSavedSnapshot(
          serializeB2bPayload({
            contentType: content.contentType ?? 'story',
            title: content.title ?? '',
            subtitle: content.subtitle ?? '',
            rubricId: content.rubricId ? String(content.rubricId) : '',
            bodyBlocks:
              content.bodyBlocks?.length > 0
                ? content.bodyBlocks
                : createStarterArticleBlocks(),
          }),
        )
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : 'Impossibile caricare il contenuto.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isNew, uuid])

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Il titolo è obbligatorio', 'error')
      return
    }

    if (!rubricId) {
      showToast('Seleziona una rubrica', 'error')
      return
    }

    setSaving(true)

    try {
      const payload = buildPayload()

      if (isNew) {
        const created = await createB2bContent(payload)
        showToast('Bozza salvata', 'success')
        navigate(`/pro/editoriale/${created.uuid}/edit`, { replace: true })
      } else {
        const updated = await updateB2bContent(uuid, payload, { updatedAt })
        setUpdatedAt(updated.updatedAt)
        setStatus(updated.status ?? status)
        setSavedSnapshot(currentSnapshot)
        showToast('Modifiche salvate', 'success')
      }
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Errore durante il salvataggio',
        'error',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async () => {
    if (isNew) {
      showToast('Salva la bozza prima di inviare in revisione', 'error')
      return
    }

    setSubmitting(true)

    try {
      await updateB2bContent(uuid, buildPayload(), { updatedAt })
      const updated = await submitB2bContent(uuid, { updatedAt })
      setUpdatedAt(updated.updatedAt)
      setStatus(updated.status ?? 'pending_review')
      setSavedSnapshot(currentSnapshot)
      showToast('Inviato in revisione', 'success')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Errore durante l’invio',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const reloadContent = () => {
    if (isNew || !uuid) return
    setLoading(true)
    setLoadError(null)
    getB2bContent(uuid)
      .then((content) => {
        setTitle(content.title ?? '')
        setSubtitle(content.subtitle ?? '')
        setContentType(content.contentType ?? 'story')
        setRubricId(content.rubricId ? String(content.rubricId) : '')
        setBodyBlocks(
          content.bodyBlocks?.length > 0
            ? content.bodyBlocks
            : createStarterArticleBlocks(),
        )
        setUpdatedAt(content.updatedAt)
        setStatus(content.status ?? 'draft')
        setStructureDisclaimer(content.structureDisclaimer ?? B2B_STRUCTURE_DISCLAIMER_FALLBACK)
        setSavedSnapshot(
          serializeB2bPayload({
            contentType: content.contentType ?? 'story',
            title: content.title ?? '',
            subtitle: content.subtitle ?? '',
            rubricId: content.rubricId ? String(content.rubricId) : '',
            bodyBlocks:
              content.bodyBlocks?.length > 0
                ? content.bodyBlocks
                : createStarterArticleBlocks(),
          }),
        )
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : 'Impossibile caricare il contenuto.',
        )
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return (
      <div className={`${b2bCard} mx-auto flex max-w-5xl items-center justify-center py-24`}>
        <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link to="/pro/editoriale" className={`inline-flex items-center gap-1.5 ${b2bGhostBtn}`}>
          Torna alla lista
        </Link>
        <B2BLoadError message={loadError} onRetry={reloadContent} />
      </div>
    )
  }

  return (
    <EditorialPageMotion className="mx-auto max-w-5xl space-y-6">
      <EditorialPageHeader
        variant="b2b"
        title={isNew ? 'Nuovo contenuto' : 'Modifica contenuto'}
        subtitle={
          isNew
            ? 'Scrivi una storia o un articolo per la tua struttura'
            : isEditable
              ? 'Aggiorna titolo, rubrica e corpo del contenuto'
              : 'Contenuto in sola lettura finché non viene approvato o rifiutato'
        }
        backTo="/pro/editoriale"
        backLabel="Editoriale"
        badge={
          <>
            {!isNew ? <EditorialContentStatusPill status={status} variant="b2b" /> : null}
            {!isNew && isEditable ? (
              <EditorialSaveStatus isDirty={isDirty} variant="b2b" />
            ) : null}
          </>
        }
        actions={
          isEditable ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || submitting}
                className={`inline-flex items-center gap-2 ${b2bGhostBtn}`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salva bozza
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={saving || submitting || isNew || status !== 'draft'}
                className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Invia in revisione
              </button>
            </>
          ) : null
        }
      />

      <StructureDisclaimerBanner text={structureDisclaimer} />

      {!isEditable && !isNew ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            {status === 'pending_review'
              ? 'Il contenuto è in revisione dalla redazione Wenando. Potrai modificarlo di nuovo se verrà rifiutato.'
              : status === 'published'
                ? 'Contenuto pubblicato. Contatta la redazione per eventuali aggiornamenti.'
                : 'Questo contenuto non è modificabile nello stato attuale.'}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${b2bCard} space-y-4 p-4 sm:p-5`}>
            <div>
              <label htmlFor="b2b-editorial-title" className="mb-1 block text-xs font-medium text-charcoal-muted">
                Titolo
              </label>
              <input
                id="b2b-editorial-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isEditable}
                placeholder="Titolo del contenuto"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="b2b-editorial-subtitle" className="mb-1 block text-xs font-medium text-charcoal-muted">
                Sottotitolo
              </label>
              <input
                id="b2b-editorial-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                disabled={!isEditable}
                placeholder="Opzionale"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="b2b-editorial-type" className="mb-1 block text-xs font-medium text-charcoal-muted">
                  Tipo
                </label>
                <select
                  id="b2b-editorial-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  disabled={!isEditable}
                  className={inputClass}
                >
                  {B2B_EDITORIAL_CONTENT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="b2b-editorial-rubric" className="mb-1 block text-xs font-medium text-charcoal-muted">
                  Rubrica
                </label>
                <select
                  id="b2b-editorial-rubric"
                  value={rubricId}
                  onChange={(e) => setRubricId(e.target.value)}
                  disabled={!isEditable}
                  className={inputClass}
                >
                  {rubrics.length === 0 ? (
                    <option value="">Nessuna rubrica disponibile</option>
                  ) : (
                    rubrics.map((rubric) => (
                      <option key={rubric.id} value={rubric.id}>
                        {rubric.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-charcoal">Corpo del contenuto</h2>
            <p className="mb-4 text-xs text-charcoal-muted">
              Blocchi disponibili: titolo, paragrafo e immagine. FAQ e schede struttura non sono
              consentiti per i contenuti partner.
            </p>
            <TileEditor blocks={bodyBlocks} onChange={setBodyBlocks} disabled={!isEditable} b2bMode />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className={`${b2bCard} p-4 sm:p-5`}>
            <h3 className="text-sm font-semibold text-charcoal">Pubblicazione</h3>
            <p className="mt-1 text-xs text-charcoal-muted">
              Dopo l’invio in revisione, la redazione Wenando approverà o rifiuterà il contenuto.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-charcoal-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-coral" aria-hidden="true" />
                Salva la bozza prima di inviare
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-coral" aria-hidden="true" />
                Il disclaimer struttura è obbligatorio
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-coral" aria-hidden="true" />
                Tempo medio di revisione: 1–2 giorni lavorativi
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </EditorialPageMotion>
  )
}
