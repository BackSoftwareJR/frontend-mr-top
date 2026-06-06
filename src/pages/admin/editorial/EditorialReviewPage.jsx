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
import { adminGlassCard } from '../../../components/admin/adminStyles'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialContentStatusPill from '../../../components/editorial/EditorialContentStatusPill'
import EditorialListSkeleton from '../../../components/editorial/EditorialListSkeleton'
import EditorialEmptyState from '../../../components/editorial/EditorialEmptyState'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'

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
    <EditorialPageMotion className="mx-auto max-w-6xl space-y-6">
      <EditorialPageHeader
        variant="admin"
        title="Coda revisione"
        subtitle={
          <>
            Contenuti in attesa di approvazione editoriale
            {' · '}
            <Link to="/admin/partners" className="text-accent-coral hover:underline">
              Vetting partner
            </Link>
          </>
        }
      />

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
        <EditorialListSkeleton variant="admin" rows={4} />
      ) : loadError ? null : items.length === 0 ? (
        <EditorialEmptyState
          variant="admin"
          title="Nessun contenuto in coda"
          description="Quando un partner o un redattore invia un contenuto in revisione, apparirà qui."
        />
      ) : (
        <div className="space-y-4">
          {items.map(({ content, moderation }) => {
            const typeLabel =
              EDITORIAL_CONTENT_TYPES.find((t) => t.value === content.contentType)?.label ??
              content.contentType
            const previewText =
              content.excerpt?.trim() ||
              'Anteprima non disponibile — apri l’editor o l’anteprima per leggere il contenuto.'

            return (
              <article key={content.uuid} className={`${adminGlassCard} overflow-hidden`}>
                <div className="border-b border-white/5 bg-zinc-950/20 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{content.title}</h3>
                        <EditorialContentStatusPill status={content.status} variant="admin" />
                      </div>
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
                  </div>
                </div>

                <div className="border-b border-white/5 px-4 py-4 sm:px-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Anteprima</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-300">{previewText}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
                  <Link
                    to={`/admin/editorial/${content.uuid}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-accent-coral/30 hover:text-accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Modifica
                  </Link>
                  <button
                    type="button"
                    onClick={() => handlePreview(content.uuid)}
                    disabled={previewLoading === content.uuid}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-3 py-1.5 text-xs font-medium text-accent-coral transition-colors hover:bg-accent-coral/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 disabled:opacity-50"
                  >
                    {previewLoading === content.uuid ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Anteprima live
                  </button>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(content.uuid, 'published', content.updatedAt)
                      }
                      disabled={actionLoading === `${content.uuid}-published`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-50"
                    >
                      {actionLoading === `${content.uuid}-published` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Approva
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(content.uuid, 'rejected', content.updatedAt)
                      }
                      disabled={actionLoading === `${content.uuid}-rejected`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50"
                    >
                      {actionLoading === `${content.uuid}-rejected` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
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
    </EditorialPageMotion>
  )
}
