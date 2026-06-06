import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileText, Pencil, Users } from 'lucide-react'
import B2BLoadError from '../../../components/b2b/B2BLoadError'
import B2bEditorialSubNav from '../../../components/b2b/editorial/B2bEditorialSubNav'
import EditorialViewsTrendChart from '../../../components/editorial/EditorialViewsTrendChart'
import {
  b2bCard,
  b2bGhostBtn,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
} from '../../../components/b2b/b2bStyles'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import {
  fetchB2bEditorialAnalytics,
  listB2bContents,
} from '../../../services/b2bEditorialService'
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
  const [publishedCount, setPublishedCount] = useState(0)
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(() =>
    isApiConfigured() ? null : 'Configura VITE_API_URL e accedi come partner.',
  )
  const [retryCount, setRetryCount] = useState(0)

  const periodLabel = PERIOD_OPTIONS.find((option) => option.id === periodDays)?.label ?? `${periodDays} giorni`

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false
    const range = dateRangeForDays(periodDays)

    Promise.all([
      fetchB2bEditorialAnalytics(range),
      listB2bContents({ status: 'published', perPage: 1 }),
    ])
      .then(([analyticsResult, contentsResult]) => {
        if (cancelled) return

        setAnalytics(analyticsResult)
        setPublishedCount(contentsResult.meta?.total ?? 0)
        setLoadError(null)
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

  return (
    <EditorialPageMotion className="mx-auto max-w-5xl space-y-6">
      <EditorialPageHeader
        variant="b2b"
        title="Statistiche editoriali"
        subtitle="Monitora le visualizzazioni dei contenuti pubblicati dalla tua struttura."
      />

      <B2bEditorialSubNav />

      <div className={`${b2bCard} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <p className="text-sm font-medium text-charcoal-muted">Periodo</p>
        <div className={b2bSegmented}>
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePeriodChange(option.id)}
              className={periodDays === option.id ? b2bSegmentedActive : b2bSegmentedInactive}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <EditorialKpiSkeleton variant="b2b" count={3} />
          <EditorialTableSkeleton variant="b2b" rows={5} columns={4} />
        </div>
      ) : loadError ? (
        <B2BLoadError message={loadError} onRetry={handleRetry} />
      ) : analytics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <EditorialKpiCard
              variant="b2b"
              label="Visualizzazioni pagina"
              value={formatNumber(analytics.totals.pageViews)}
              icon={Eye}
              hint={`Totale nel periodo · ${periodLabel}`}
            />
            <EditorialKpiCard
              variant="b2b"
              label="Visitatori unici"
              value={formatNumber(analytics.totals.uniqueVisitors)}
              icon={Users}
              hint="Utenti distinti nel periodo"
            />
            <EditorialKpiCard
              variant="b2b"
              label="Articoli pubblicati"
              value={formatNumber(publishedCount)}
              icon={FileText}
              hint="Contenuti live della struttura"
            />
          </div>

          <EditorialViewsTrendChart
            data={analytics.viewsByDay}
            periodLabel={periodLabel}
            variant="b2b"
          />

          <div className={`${b2bCard} overflow-hidden`}>
            <div className="border-b border-black/5 px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-charcoal">Articoli più letti</h2>
              <p className="mt-0.5 text-xs text-charcoal-muted">
                Classifica per visualizzazioni nel periodo selezionato
              </p>
            </div>

            {analytics.topArticles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-charcoal-muted">
                  Nessuna visualizzazione registrata nel periodo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-white/40 text-left text-xs uppercase tracking-wide text-charcoal-muted">
                      <th className="px-4 py-3 font-medium sm:px-5">Titolo</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Visualizzazioni</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Unici</th>
                      <th className="px-4 py-3 font-medium sm:px-5">
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {analytics.topArticles.map((article) => (
                      <tr key={article.uuid} className="text-charcoal">
                        <td className="px-4 py-4 sm:px-5">
                          <p className="max-w-md truncate font-medium">{article.title || 'Senza titolo'}</p>
                        </td>
                        <td className="px-4 py-4 tabular-nums sm:px-5">
                          {formatNumber(article.pageViews)}
                        </td>
                        <td className="px-4 py-4 tabular-nums sm:px-5">
                          {formatNumber(article.uniqueVisitors)}
                        </td>
                        <td className="px-4 py-4 sm:px-5">
                          <Link
                            to={`/pro/editoriale/${article.uuid}/edit`}
                            className={`inline-flex items-center gap-1.5 ${b2bGhostBtn}`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Modifica
                          </Link>
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
