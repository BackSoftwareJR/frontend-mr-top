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
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../../components/admin/adminStyles'

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-zinc-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-zinc-950 text-accent-coral focus:ring-accent-coral/30 disabled:opacity-50"
      />
    </label>
  )
}

const QUEUE_STATUS_COLORS = {
  pending: 'text-amber-400',
  processing: 'text-cyan-400',
  completed: 'text-emerald-400',
  failed: 'text-red-400',
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={adminPageTitle}>Indicizzazione</h1>
          <p className={adminPageSubtitle}>
            Regole sitemap/ricerca interna e coda job di reindex
          </p>
        </div>
        <button
          type="button"
          onClick={handleReindexAll}
          disabled={reindexing || loading}
          className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25 disabled:opacity-50"
        >
          {reindexing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Reindex tutti i pubblicati
        </button>
      </div>

      <EditorialSubNav />

      {reindexResult ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
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
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
        </div>
      ) : loadError ? null : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Regole indicizzazione</h2>
            <div className="grid gap-3 lg:grid-cols-2">
              {rules.map((rule) => (
                <div key={rule.id} className={`${adminGlassCard} p-4`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {rule.scope === 'global'
                        ? 'Globale'
                        : rule.rubricSlug ?? `Rubrica #${rule.id}`}
                    </h3>
                    {patchingId === rule.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-accent-coral" />
                    ) : null}
                  </div>
                  <ToggleRow
                    label="In sitemap"
                    checked={rule.includeInSitemap}
                    disabled={patchingId === rule.id}
                    onChange={(v) => handleToggle(rule, 'includeInSitemap', v)}
                  />
                  <ToggleRow
                    label="Ricerca interna"
                    checked={rule.includeInInternalSearch}
                    disabled={patchingId === rule.id}
                    onChange={(v) => handleToggle(rule, 'includeInInternalSearch', v)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Coda indicizzazione</h2>
            <div className={`${adminGlassCard} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium">Contenuto</th>
                      <th className="px-4 py-3 font-medium">Azione</th>
                      <th className="px-4 py-3 font-medium">Stato</th>
                      <th className="px-4 py-3 font-medium">Schedulato</th>
                      <th className="px-4 py-3 font-medium">Elaborato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                          Coda vuota
                        </td>
                      </tr>
                    ) : (
                      queue.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="max-w-[200px] truncate px-4 py-3 text-white">
                            {entry.content?.title ?? '—'}
                          </td>
                          <td className="px-4 py-3 capitalize text-zinc-400">{entry.action}</td>
                          <td
                            className={`px-4 py-3 capitalize ${
                              QUEUE_STATUS_COLORS[entry.status] ?? 'text-zinc-400'
                            }`}
                          >
                            {entry.status}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {entry.scheduledAt
                              ? new Intl.DateTimeFormat('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(new Date(entry.scheduledAt))
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
