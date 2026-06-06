import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
  EDITORIAL_CONTENT_STATUSES,
  EDITORIAL_CONTENT_TYPES,
  getMetrics,
} from '../../../services/adminEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../../components/admin/adminStyles'

function StatCard({ label, value, hint }) {
  return (
    <div className={`${adminGlassCard} p-4 sm:p-5`}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  )
}

function HistogramBar({ bucket, maxCount }) {
  const width = maxCount > 0 ? Math.max(4, (bucket.count / maxCount) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">{bucket.label}</span>
        <span className="tabular-nums text-zinc-500">{bucket.count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-accent-coral transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function typeLabel(type) {
  return EDITORIAL_CONTENT_TYPES.find((entry) => entry.value === type)?.label ?? type
}

function statusLabel(status) {
  return EDITORIAL_CONTENT_STATUSES.find((entry) => entry.value === status)?.label ?? status
}

export default function EditorialMetricsPage() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come admin.',
  )
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    getMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError ? err.message : 'Impossibile caricare le metriche editoriali.',
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

  const histogramMax = metrics?.seoScoreHistogram?.reduce(
    (max, bucket) => Math.max(max, bucket.count ?? 0),
    0,
  ) ?? 0

  const pipelineTotal = metrics
    ? Object.values(metrics.contentsByStatus).reduce((sum, count) => sum + count, 0)
    : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className={adminPageTitle}>Metriche editoriali</h1>
        <p className={adminPageSubtitle}>
          Pipeline di pubblicazione, SEO, code di moderazione e indicizzazione
        </p>
      </header>

      <EditorialSubNav />

      {loadError ? (
        <AdminLoadError message={loadError} onRetry={() => {
          setLoadError(null)
          setLoading(true)
          setRetryCount((c) => c + 1)
        }} />
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="sr-only">Caricamento metriche…</span>
        </div>
      ) : null}

      {!loading && metrics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pubblicati (30 gg)"
              value={metrics.publishedLast30Days}
              hint="Contenuti pubblicati nell'ultimo mese"
            />
            <StatCard
              label="Moderazione in coda"
              value={metrics.moderationBacklog}
              hint="Pending + in revisione"
            />
            <StatCard
              label="Indice in attesa"
              value={metrics.indexQueuePending}
              hint="Job indexer pending"
            />
            <StatCard
              label="Contenuti totali"
              value={pipelineTotal}
              hint="Tutti gli stati pipeline"
            />
            <StatCard
              label="Views magazine (30 gg)"
              value={metrics.totalViews30d}
              hint="Visualizzazioni HTML piattaforma"
            />
          </div>

          <section className={`${adminGlassCard} flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6`}>
            <div>
              <h2 className="text-sm font-semibold text-white">Analytics piattaforma</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Trend giornaliero, visitatori unici, bot e top articoli
              </p>
            </div>
            <Link
              to="/admin/editorial/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/20"
            >
              Apri analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={`${adminGlassCard} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold text-white">Pipeline per stato</h2>
              <ul className="mt-4 space-y-2">
                {EDITORIAL_CONTENT_STATUSES.map(({ value }) => (
                  <li
                    key={value}
                    className="flex items-center justify-between rounded-lg bg-zinc-950/40 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-300">{statusLabel(value)}</span>
                    <span className="font-semibold tabular-nums text-white">
                      {metrics.contentsByStatus[value] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${adminGlassCard} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold text-white">Distribuzione SEO score</h2>
              <p className="mt-1 text-xs text-zinc-500">Ultima generazione per contenuto</p>
              <div className="mt-4 space-y-3">
                {metrics.seoScoreHistogram.map((bucket) => (
                  <HistogramBar key={bucket.label} bucket={bucket} maxCount={histogramMax} />
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={`${adminGlassCard} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold text-white">Pubblicati per tipo</h2>
              {metrics.topPublishedByType.length ? (
                <ul className="mt-4 space-y-2">
                  {metrics.topPublishedByType.map((row) => (
                    <li
                      key={row.type}
                      className="flex items-center justify-between rounded-lg bg-zinc-950/40 px-3 py-2 text-sm"
                    >
                      <span className="text-zinc-300">{typeLabel(row.type)}</span>
                      <span className="font-semibold tabular-nums text-white">{row.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">Nessun contenuto pubblicato.</p>
              )}
            </section>

            <section className={`${adminGlassCard} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold text-white">Piattaforma (stub)</h2>
              <p className="mt-1 text-xs text-zinc-500">Lead e ricerche dal database principale</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatCard label="Ricerche (lead)" value={metrics.searchesCount} />
                <StatCard label="Lead con email" value={metrics.leadsWithEmail} />
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
