import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ExternalLink, Loader2, Pencil, X } from 'lucide-react'
import {
  EDITORIAL_CONTENT_TYPES,
  generatePreviewToken,
  getReviewQueue,
  transitionContent,
} from '../../../services/adminEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../../components/admin/adminStyles'

export default function EditorialReviewPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come admin.',
  )
  const [retryCount, setRetryCount] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(null)

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    getReviewQueue()
      .then((result) => {
        if (!cancelled) setItems(result.items)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : 'Impossibile caricare la coda di revisione.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [retryCount])

  const handleAction = async (uuid, toStatus, updatedAt) => {
    setActionLoading(`${uuid}-${toStatus}`)

    try {
      await transitionContent(uuid, toStatus, { updatedAt })
      setItems((prev) => prev.filter((item) => item.content.uuid !== uuid))
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Azione non riuscita. Riprova.',
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handlePreview = async (uuid) => {
    setPreviewLoading(uuid)
    try {
      const { previewUrl } = await generatePreviewToken(uuid)
      if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Impossibile generare l’anteprima.',
      )
    } finally {
      setPreviewLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Coda revisione</h1>
        <p className={adminPageSubtitle}>
          Contenuti in attesa di approvazione editoriale
          {' · '}
          <Link to="/admin/partners" className="text-accent-coral hover:underline">
            Vetting partner
          </Link>
        </p>
      </div>

      <EditorialSubNav />

      {loadError && !loading ? (
        <AdminLoadError
          message={loadError}
          onRetry={() => {
            setLoading(true)
            setLoadError(null)
            setRetryCount((n) => n + 1)
          }}
        />
      ) : null}

      {loading ? (
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
        </div>
      ) : loadError ? null : items.length === 0 ? (
        <div className={`${adminGlassCard} px-6 py-16 text-center text-sm text-zinc-500`}>
          Nessun contenuto in coda di revisione
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ content, moderation }) => {
            const typeLabel =
              EDITORIAL_CONTENT_TYPES.find((t) => t.value === content.contentType)?.label ??
              content.contentType

            return (
              <article key={content.uuid} className={`${adminGlassCard} p-4 sm:p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white">{content.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {typeLabel}
                      {content.rubricSlug ? ` · ${content.rubricSlug}` : ''}
                      {moderation?.submittedAt
                        ? ` · inviato ${new Intl.DateTimeFormat('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(moderation.submittedAt))}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/editorial/${content.uuid}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-accent-coral/30 hover:text-accent-coral"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifica
                    </Link>
                    <button
                      type="button"
                      onClick={() => handlePreview(content.uuid)}
                      disabled={previewLoading === content.uuid}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-accent-coral/30 hover:text-accent-coral disabled:opacity-50"
                    >
                      {previewLoading === content.uuid ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      Anteprima
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(content.uuid, 'published', content.updatedAt)
                      }
                      disabled={actionLoading === `${content.uuid}-published`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading === `${content.uuid}-published` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Approva
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(content.uuid, 'rejected', content.updatedAt)
                      }
                      disabled={actionLoading === `${content.uuid}-rejected`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {actionLoading === `${content.uuid}-rejected` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Rifiuta
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
