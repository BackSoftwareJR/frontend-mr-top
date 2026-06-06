import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Loader2, Save, Send } from 'lucide-react'
import {
  createContent,
  getContent,
  getSuggestedLinks,
  transitionContent,
  updateContent,
} from '../../../services/adminEditorialService'
import { fetchEditorialRubrics } from '../../../services/editorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import BlockEditor from '../../../components/admin/editorial/BlockEditor'
import SeoReviewPanel from '../../../components/admin/editorial/SeoReviewPanel'
import { createEmptyBlock } from '../../../components/admin/editorial/blockUtils'
import { isSeoApproved } from '../../../components/admin/editorial/seoUtils'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../../components/admin/adminStyles'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent-coral/40 focus:outline-none focus:ring-1 focus:ring-accent-coral/20'

const EDITORIAL_TYPES = [
  { value: 'article', label: 'Articolo' },
  { value: 'story', label: 'Storia' },
  { value: 'interview', label: 'Intervista' },
  { value: 'event', label: 'Evento' },
]

function SuggestedLinksPanel({ uuid }) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(Boolean(uuid && isApiConfigured()))

  useEffect(() => {
    if (!uuid || !isApiConfigured()) return undefined

    let cancelled = false

    getSuggestedLinks(uuid)
      .then((data) => {
        if (!cancelled) setLinks(data)
      })
      .catch(() => {
        if (!cancelled) setLinks([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [uuid])

  return (
    <div className={`${adminGlassCard} p-4`}>
      <h3 className="text-sm font-semibold text-white">Link interni suggeriti</h3>
      <p className="mt-0.5 text-xs text-zinc-500">Fino a 5 articoli correlati dal motore di ricerca</p>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-accent-coral" />
        </div>
      ) : links.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Nessun suggerimento disponibile</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {links.map((link) => (
            <li
              key={link.targetUuid}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
            >
              <p className="truncate text-sm font-medium text-white">{link.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Score {(link.score * 100).toFixed(0)}%
                {link.rubricSlug ? ` · ${link.rubricSlug}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function EditorialEditorPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const isNew = !uuid

  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(!isNew && isApiConfigured())
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come admin.',
  )
  const [toast, setToast] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [seoPack, setSeoPack] = useState(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [contentType, setContentType] = useState('article')
  const [rubricId, setRubricId] = useState('')
  const [featured, setFeatured] = useState(false)
  const [bodyBlocks, setBodyBlocks] = useState([
    createEmptyBlock('heading'),
    createEmptyBlock('paragraph'),
  ])

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

  useEffect(() => {
    if (isNew || !uuid || !isApiConfigured()) return undefined

    let cancelled = false

    getContent(uuid)
      .then((content) => {
        if (cancelled) return
        setTitle(content.title ?? '')
        setSubtitle(content.subtitle ?? '')
        setContentType(content.contentType ?? 'article')
        setRubricId(content.rubricId ? String(content.rubricId) : '')
        setFeatured(Boolean(content.featured))
        setBodyBlocks(
          content.bodyBlocks?.length > 0
            ? content.bodyBlocks
            : [createEmptyBlock('heading'), createEmptyBlock('paragraph')],
        )
        setUpdatedAt(content.updatedAt)
        setSeoPack(content.seoPack ?? null)
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

  const applyContent = (content) => {
    setTitle(content.title ?? '')
    setSubtitle(content.subtitle ?? '')
    setContentType(content.contentType ?? 'article')
    setRubricId(content.rubricId ? String(content.rubricId) : '')
    setFeatured(Boolean(content.featured))
    setBodyBlocks(
      content.bodyBlocks?.length > 0
        ? content.bodyBlocks
        : [createEmptyBlock('heading'), createEmptyBlock('paragraph')],
    )
    setUpdatedAt(content.updatedAt)
    setSeoPack(content.seoPack ?? null)
  }

  const reloadContent = () => {
    if (isNew || !uuid) return
    setLoading(true)
    setLoadError(null)
    getContent(uuid)
      .then((content) => {
        applyContent(content)
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : 'Impossibile caricare il contenuto.',
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const buildPayload = () => ({
    title: title.trim(),
    subtitle: subtitle.trim() || null,
    content_type: contentType,
    rubric_id: Number(rubricId),
    featured,
    body_blocks: bodyBlocks.map((block) => ({
      id: block.id,
      type: block.type,
      data: block.data ?? {},
    })),
  })

  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ type: 'error', message: 'Il titolo è obbligatorio' })
      return
    }

    if (!rubricId) {
      setToast({ type: 'error', message: 'Seleziona una rubrica' })
      return
    }

    setSaving(true)

    try {
      const payload = buildPayload()

      if (isNew) {
        const created = await createContent(payload)
        setToast({ type: 'success', message: 'Bozza salvata' })
        navigate(`/admin/editorial/${created.uuid}/edit`, { replace: true })
      } else {
        const updated = await updateContent(uuid, payload, { updatedAt })
        setUpdatedAt(updated.updatedAt)
        setToast({ type: 'success', message: 'Modifiche salvate' })
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Errore durante il salvataggio',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async () => {
    if (isNew) {
      setToast({ type: 'error', message: 'Salva la bozza prima di inviare in revisione' })
      return
    }

    setSubmitting(true)

    try {
      await updateContent(uuid, buildPayload(), { updatedAt })
      const updated = await transitionContent(uuid, 'pending_review', { updatedAt })
      setUpdatedAt(updated.updatedAt)
      setToast({ type: 'success', message: 'Inviato in revisione' })
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Errore durante l’invio',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={`${adminGlassCard} mx-auto flex max-w-6xl items-center justify-center py-24`}>
        <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Link
          to="/admin/editorial"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla lista
        </Link>
        <AdminLoadError message={loadError} onRetry={reloadContent} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/admin/editorial"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Editoriale
          </Link>
          <h1 className={adminPageTitle}>{isNew ? 'Nuovo contenuto' : 'Modifica contenuto'}</h1>
          <p className={adminPageSubtitle}>
            {isNew ? 'Crea una bozza con blocchi heading e paragrafo' : 'Aggiorna titolo, rubrica e corpo'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salva bozza
          </button>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={saving || submitting || isNew}
            className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Invia in revisione
          </button>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className={`rounded-xl border px-4 py-2 text-sm ${
            toast.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {!isNew && !isSeoApproved(seoPack) ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            SEO non ancora approvato. Rigenera e approva il pacchetto SEO nel pannello a destra
            prima di pubblicare.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={`${adminGlassCard} space-y-4 p-4 sm:p-5`}>
            <div>
              <label htmlFor="editorial-title" className="mb-1 block text-xs font-medium text-zinc-500">
                Titolo
              </label>
              <input
                id="editorial-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo dell’articolo"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="editorial-subtitle" className="mb-1 block text-xs font-medium text-zinc-500">
                Sottotitolo
              </label>
              <input
                id="editorial-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Sottotitolo (opzionale)"
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="editorial-type" className="mb-1 block text-xs font-medium text-zinc-500">
                  Tipo
                </label>
                <select
                  id="editorial-type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className={inputClass}
                >
                  {EDITORIAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="editorial-rubric" className="mb-1 block text-xs font-medium text-zinc-500">
                  Rubrica
                </label>
                <select
                  id="editorial-rubric"
                  value={rubricId}
                  onChange={(e) => setRubricId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleziona rubrica</option>
                  {rubrics.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-zinc-950 text-accent-coral focus:ring-accent-coral/30"
              />
              In evidenza (featured)
            </label>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">Corpo articolo</h2>
            <BlockEditor blocks={bodyBlocks} onChange={setBodyBlocks} />
          </div>
        </div>

        <aside className="space-y-4">
          <SeoReviewPanel
            uuid={isNew ? null : uuid}
            contentSeoPack={seoPack}
            onApproved={(content) => {
              applyContent(content)
              setToast({ type: 'success', message: 'SEO approvato' })
            }}
          />
          {!isNew ? <SuggestedLinksPanel uuid={uuid} /> : null}
        </aside>
      </div>
    </div>
  )
}
