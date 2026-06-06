import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import {
  getIndexQueue,
  getIndexRules,
  patchIndexRule,
  postReindex,
} from '../../../services/adminEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import { adminGlassCard } from '../../../components/admin/adminStyles'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialContentStatusPill from '../../../components/editorial/EditorialContentStatusPill'
import { EditorialTableSkeleton } from '../../../components/editorial/EditorialListSkeleton'
import EditorialEmptyState from '../../../components/editorial/EditorialEmptyState'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-white/5 py-3 first:border-t-0 first:pt-0">
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-zinc-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-zinc-950 text-accent-coral focus:ring-2 focus:ring-accent-coral/30 disabled:opacity-50"
      />
    </label>
  )
}

const QUEUE_STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  processing: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  failed: 'bg-red-500/15 text-red-400 border-red-500/25',
}

const QUEUE_STATUS_LABELS = {
  pending: 'In attesa',
  processing: 'In elaborazione',
  completed: 'Completato',
  failed: 'Fallito',
}

const ACTION_LABELS = {
  index: 'Indicizza',
  reindex: 'Reindex',
  remove: 'Rimuovi',
}

function QueueStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
        QUEUE_STATUS_STYLES[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
      }`}
    >
      {QUEUE_STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function EditorialIndexingPage() {
  const [rules, setRules] = useState([])
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [reindexing, setReindexing] = useState(false)
  const [patchingId, setPatchingId] = useState(null)
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come admin.',
  )
  const [retryCount, setRetryCount] = useState(0)
  const [reindexResult, setReindexResult] = useState(null)

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    Promise.all([getIndexRules(), getIndexQueue()])
      .then(([rulesData, queueData]) => {
        if (!cancelled) {
          setRules(rulesData)
          setQueue(queueData)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare le regole di indicizzazione.',
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

  const handleToggle = async (rule, field, value) => {
    setPatchingId(rule.id)

    try {
      const updated = await patchIndexRule(rule.id, { [field]: value })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)))
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Aggiornamento regola non riuscito.',
      )
    } finally {
      setPatchingId(null)
    }
  }

  const handleReindexAll = async () => {
    setReindexing(true)
    setReindexResult(null)

    try {
      const result = await postReindex({})
      setReindexResult(result)
      const queueData = await getIndexQueue()
      setQueue(queueData)
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Reindex non riuscito.',
      )
    } finally {
      setReindexing(false)
    }
  }

  return (
    <EditorialPageMotion className="mx-auto max-w-6xl space-y-6">
      <EditorialPageHeader
        variant="admin"
        title="Indicizzazione"
        subtitle="Regole sitemap/ricerca interna e coda job di reindex"
        actions={
          <button
            type="button"
            onClick={handleReindexAll}
            disabled={reindexing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 disabled:opacity-50"
          >
            {reindexing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Reindex tutti i pubblicati
          </button>
        }
      />

      <EditorialSubNav />

      {reindexResult ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400"
        >
          {reindexResult.queued ?? 0} job accodati
        </div>
      ) : null}

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
        <div className="space-y-6">
          <EditorialTableSkeleton variant="admin" rows={2} columns={2} />
          <EditorialTableSkeleton variant="admin" rows={6} columns={5} />
        </div>
      ) : loadError ? null : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Regole indicizzazione</h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {rules.map((rule) => (
                <div key={rule.id} className={`${adminGlassCard} p-4 sm:p-5`}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {rule.scope === 'global'
                        ? 'Globale'
                        : rule.rubricSlug ?? `Rubrica #${rule.id}`}
                    </h3>
                    {patchingId === rule.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent-coral" aria-label="Salvataggio" />
                    ) : null}
                  </div>
                  <ToggleRow
                    label="In sitemap"
                    description="Include i contenuti pubblicati nella sitemap XML"
                    checked={rule.includeInSitemap}
                    disabled={patchingId === rule.id}
                    onChange={(v) => handleToggle(rule, 'includeInSitemap', v)}
                  />
                  <ToggleRow
                    label="Ricerca interna"
                    description="Indicizza per Nando e /esplora"
                    checked={rule.includeInInternalSearch}
                    disabled={patchingId === rule.id}
                    onChange={(v) => handleToggle(rule, 'includeInInternalSearch', v)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">Coda indicizzazione</h2>
              <span className="text-xs text-zinc-500">{queue.length} job in coda</span>
            </div>
            {queue.length === 0 ? (
              <EditorialEmptyState
                variant="admin"
                title="Coda vuota"
                description="Tutti i job di indicizzazione sono stati elaborati. Usa “Reindex tutti i pubblicati” per ricostruire l’indice."
              />
            ) : (
            <div className={`${adminGlassCard} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950/30 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium">Contenuto</th>
                      <th className="px-4 py-3 font-medium">Azione</th>
                      <th className="px-4 py-3 font-medium">Stato</th>
                      <th className="px-4 py-3 font-medium">Schedulato</th>
                      <th className="px-4 py-3 font-medium">Elaborato</th>
                    </tr>
                  </thead>
                  <tbody>
                      {queue.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="max-w-[220px] px-4 py-3">
                            <p className="truncate font-medium text-white">
                              {entry.content?.title ?? '—'}
                            </p>
                            {entry.content?.status ? (
                              <div className="mt-1">
                                <EditorialContentStatusPill
                                  status={entry.content.status}
                                  variant="admin"
                                />
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {ACTION_LABELS[entry.action] ?? entry.action}
                          </td>
                          <td className="px-4 py-3">
                            <QueueStatusBadge status={entry.status} />
                          </td>
                          <td className="px-4 py-3 text-xs tabular-nums text-zinc-500">
                            {entry.scheduledAt
                              ? new Intl.DateTimeFormat('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(new Date(entry.scheduledAt))
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs tabular-nums text-zinc-500">
                            {entry.processedAt
                              ? new Intl.DateTimeFormat('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(new Date(entry.processedAt))
                              : entry.errorMessage ? (
                                  <span className="text-red-400" title={entry.errorMessage}>
                                    Errore
                                  </span>
                                ) : (
                                  '—'
                                )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </section>
        </>
      )}
    </EditorialPageMotion>
  )
}
