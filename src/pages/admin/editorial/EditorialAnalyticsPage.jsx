import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, ExternalLink, Eye, Loader2, Pencil, Users } from 'lucide-react'
import AdminLoadError from '../../../components/admin/AdminLoadError'
import EditorialSubNav from '../../../components/admin/editorial/EditorialSubNav'
import EditorialViewsTrendChart from '../../../components/editorial/EditorialViewsTrendChart'
import { adminGlassCard } from '../../../components/admin/adminStyles'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import {
  fetchAdminEditorialAnalytics,
  generatePreviewToken,
} from '../../../services/adminEditorialService'
import EditorialPageHeader from '../../../components/editorial/EditorialPageHeader'
import EditorialKpiCard from '../../../components/editorial/EditorialKpiCard'
import { EditorialKpiSkeleton, EditorialTableSkeleton } from '../../../components/editorial/EditorialListSkeleton'
import EditorialPageMotion from '../../../components/editorial/EditorialPageMotion'

const PERIOD_OPTIONS = [
  { id: 7, label: '7 giorni' },
  { id: 30, label: '30 giorni' },
  { id: 90, label: '90 giorni' },
]

function formatDateParam(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function dateRangeForDays(days) {
  const to = new Date()
  const from = new Date()

  from.setDate(from.getDate() - (days - 1))

  return {
    from: formatDateParam(from),
    to: formatDateParam(to),
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('it-IT').format(value ?? 0)
}

export default function EditorialAnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(30)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come admin.',
  )
  const [retryCount, setRetryCount] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(null)

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.id === periodDays)?.label ?? `${periodDays} giorni`

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false
    const range = dateRangeForDays(periodDays)

    fetchAdminEditorialAnalytics(range)
      .then((result) => {
        if (!cancelled) {
          setAnalytics(result)
          setLoadError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare le statistiche editoriali.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [periodDays, retryCount])

  const handlePeriodChange = (days) => {
    setPeriodDays(days)
    setLoading(true)
    setLoadError(null)
  }

  const handleRetry = () => {
    setLoading(true)
    setLoadError(null)
    setRetryCount((count) => count + 1)
  }

  const handlePreview = async (uuid) => {
    setPreviewLoading(uuid)
    try {
      const { previewUrl } = await generatePreviewToken(uuid)
      if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setPreviewLoading(null)
    }
  }

  return (
    <EditorialPageMotion className="space-y-6">
      <EditorialPageHeader
        variant="admin"
        title="Analytics editoriali"
        subtitle="Visualizzazioni piattaforma, trend giornaliero e articoli più letti su Wenando Magazine."
      />

      <EditorialSubNav />

      <div className={`${adminGlassCard} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <p className="text-sm font-medium text-zinc-400">Periodo</p>
        <div className="flex gap-1 rounded-full bg-zinc-950/60 p-1 ring-1 ring-white/10">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePeriodChange(option.id)}
              className={
                periodDays === option.id
                  ? 'rounded-full bg-accent-coral/15 px-3 py-1.5 text-xs font-semibold text-accent-coral ring-1 ring-accent-coral/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40'
                  : 'rounded-full px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40'
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <EditorialKpiSkeleton variant="admin" count={3} />
          <EditorialTableSkeleton variant="admin" rows={5} />
        </div>
      ) : loadError ? (
        <AdminLoadError message={loadError} onRetry={handleRetry} />
      ) : analytics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <EditorialKpiCard
              variant="admin"
              label="Visualizzazioni pagina"
              value={formatNumber(analytics.totals.pageViews)}
              icon={Eye}
              hint={`Totale nel periodo · ${periodLabel}`}
            />
            <EditorialKpiCard
              variant="admin"
              label="Visitatori unici"
              value={formatNumber(analytics.totals.uniqueVisitors)}
              icon={Users}
              hint="Utenti distinti nel periodo"
            />
            <EditorialKpiCard
              variant="admin"
              label="Visualizzazioni bot"
              value={formatNumber(analytics.totals.botViews)}
              icon={Bot}
              hint="Crawler e bot rilevati"
            />
          </div>

          <EditorialViewsTrendChart
            data={analytics.viewsByDay}
            periodLabel={periodLabel}
            variant="admin"
          />

          <div className={`${adminGlassCard} overflow-hidden`}>
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-white">Top 10 articoli</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Classifica per visualizzazioni nel periodo selezionato
              </p>
            </div>

            {analytics.topArticles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-zinc-500">
                  Nessuna visualizzazione registrata nel periodo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3 font-medium sm:px-5">#</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Titolo</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Visualizzazioni</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Unici</th>
                      <th className="px-4 py-3 font-medium sm:px-5">
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {analytics.topArticles.map((article, index) => (
                      <tr key={article.uuid} className="text-zinc-200 transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-4 tabular-nums text-zinc-500 sm:px-5">{index + 1}</td>
                        <td className="px-4 py-4 sm:px-5">
                          <p className="max-w-md truncate font-medium text-white">
                            {article.title || 'Senza titolo'}
                          </p>
                        </td>
                        <td className="px-4 py-4 tabular-nums sm:px-5">
                          {formatNumber(article.pageViews)}
                        </td>
                        <td className="px-4 py-4 tabular-nums sm:px-5">
                          {formatNumber(article.uniqueVisitors)}
                        </td>
                        <td className="px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/admin/editorial/${article.uuid}/edit`}
                              className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40"
                              title="Modifica"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handlePreview(article.uuid)}
                              disabled={previewLoading === article.uuid}
                              className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition-colors hover:border-accent-coral/30 hover:text-accent-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 disabled:opacity-50"
                              title="Anteprima"
                            >
                              {previewLoading === article.uuid ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ExternalLink className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </EditorialPageMotion>
  )
}
