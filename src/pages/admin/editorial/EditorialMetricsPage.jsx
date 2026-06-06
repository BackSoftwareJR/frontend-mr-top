import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Eye, FileText, Layers, Search } from 'lucide-react'
import {
  EDITORIAL_CONTENT_STATUSES,
  EDITORIAL_CONTENT_TYPES,
  getMetrics,
} from '../../../services/adminEditorialService'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import { adminGlassCard } from '../../../components/admin/adminStyles'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialKpiCard from '../../../components/editorial/EditorialKpiCard'
import { EditorialKpiSkeleton } from '../../../components/editorial/EditorialListSkeleton'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'

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

function formatNumber(value) {
  return new Intl.NumberFormat('it-IT').format(value ?? 0)
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
    <EditorialPageMotion className="space-y-6">
      <EditorialPageHeader
        variant="admin"
        title="Metriche editoriali"
        subtitle="Pipeline di pubblicazione, SEO, code di moderazione e indicizzazione"
      />

      <EditorialSubNav />

      {loadError ? (
        <AdminLoadError
          message={loadError}
          onRetry={() => {
            setLoadError(null)
            setLoading(true)
            setRetryCount((c) => c + 1)
          }}
        />
      ) : null}

      {loading ? <EditorialKpiSkeleton variant="admin" count={5} /> : null}

      {!loading && metrics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <EditorialKpiCard
              variant="admin"
              label="Pubblicati (30 gg)"
              value={formatNumber(metrics.publishedLast30Days)}
              hint="Contenuti pubblicati nell'ultimo mese"
              icon={FileText}
            />
            <EditorialKpiCard
              variant="admin"
              label="Moderazione in coda"
              value={formatNumber(metrics.moderationBacklog)}
              hint="Pending + in revisione"
              icon={Layers}
            />
            <EditorialKpiCard
              variant="admin"
              label="Indice in attesa"
              value={formatNumber(metrics.indexQueuePending)}
              hint="Job indexer pending"
              icon={Search}
            />
            <EditorialKpiCard
              variant="admin"
              label="Contenuti totali"
              value={formatNumber(pipelineTotal)}
              hint="Tutti gli stati pipeline"
              icon={BarChart3}
            />
            <EditorialKpiCard
              variant="admin"
              label="Views magazine (30 gg)"
              value={formatNumber(metrics.totalViews30d)}
              hint="Visualizzazioni HTML piattaforma"
              icon={Eye}
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
              className="inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40"
            >
              Apri analytics
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                <EditorialKpiCard
                  variant="admin"
                  label="Ricerche (lead)"
                  value={formatNumber(metrics.searchesCount)}
                />
                <EditorialKpiCard
                  variant="admin"
                  label="Lead con email"
                  value={formatNumber(metrics.leadsWithEmail)}
                />
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </EditorialPageMotion>
  )
}
