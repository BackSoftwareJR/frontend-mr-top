import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Eye, FileText, Loader2, Pencil, Users } from 'lucide-react'
import B2BLoadError from '../../../components/b2b/B2BLoadError'
import B2bEditorialSubNav from '../../../components/b2b/editorial/B2bEditorialSubNav'
import {
  b2bCard,
  b2bGhostBtn,
  b2bIconAccent,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
} from '../../../components/b2b/b2bStyles'
import { ApiError, isApiConfigured } from '../../../services/apiClient'
import {
  fetchB2bEditorialAnalytics,
  listB2bContents,
} from '../../../services/b2bEditorialService'

const CORAL = '#e07a5f'

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

function formatChartDate(value) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  })
}

function KpiCard({ label, value, icon: Icon, hint }) {
  return (
    <div className={`${b2bCard} p-5`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-coral/10">
        <Icon className={`h-4 w-4 ${b2bIconAccent}`} />
      </div>
      <p className="text-xs font-medium text-charcoal-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-charcoal">
        {formatNumber(value)}
      </p>
      {hint ? <p className="mt-1 text-xs text-charcoal-muted">{hint}</p> : null}
    </div>
  )
}

function ViewsTrendChart({ data, periodLabel }) {
  const [hovered, setHovered] = useState(null)

  const width = 560
  const height = 200
  const padding = { top: 16, right: 16, bottom: 28, left: 36 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxViews = Math.max(...data.map((entry) => entry.views), 1)

  const points = data.map((entry, index) => {
    const x =
      data.length > 1
        ? padding.left + (index / (data.length - 1)) * chartWidth
        : padding.left + chartWidth / 2
    const y =
      padding.top + chartHeight - (entry.views / maxViews) * chartHeight

    return { x, y, ...entry }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
      : ''

  const xLabelIndexes = useMemo(() => {
    if (data.length <= 1) return [0]

    const maxLabels = 6
    const step = Math.max(1, Math.ceil((data.length - 1) / (maxLabels - 1)))

    return Array.from({ length: maxLabels }, (_, index) =>
      Math.min(index * step, data.length - 1),
    ).filter((value, index, array) => index === 0 || value !== array[index - 1])
  }, [data.length])

  if (data.length === 0) {
    return (
      <div className={`${b2bCard} p-5`}>
        <h2 className="text-sm font-semibold text-charcoal">Visualizzazioni per giorno</h2>
        <p className="mt-4 text-sm text-charcoal-muted">Nessun dato nel periodo selezionato.</p>
      </div>
    )
  }

  return (
    <div className={`${b2bCard} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-charcoal">Visualizzazioni per giorno</h2>
          <p className="text-xs text-charcoal-muted">Periodo: {periodLabel}</p>
        </div>
        <BarChart3 className={`h-4 w-4 shrink-0 ${b2bIconAccent}`} />
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`Grafico visualizzazioni editoriali ${periodLabel}`}
        >
          <defs>
            <linearGradient id="b2bEditorialAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity="0.2" />
              <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio)
            const value = Math.round(maxViews * ratio)

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgb(0 0 0 / 0.06)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-charcoal-muted text-[10px]"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {areaPath ? <path d={areaPath} fill="url(#b2bEditorialAreaGradient)" /> : null}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke={CORAL}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((point, index) => (
            <g key={point.date}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hovered === index ? 6 : 3.5}
                fill={hovered === index ? CORAL : '#fff'}
                stroke={CORAL}
                strokeWidth="2"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={point.x - 12}
                y={padding.top}
                width={24}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}

          {xLabelIndexes.map((index) => {
            const point = points[index]
            if (!point) return null

            return (
              <text
                key={point.date}
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-charcoal-muted text-[10px]"
              >
                {formatChartDate(point.date)}
              </text>
            )
          })}
        </svg>

        {hovered !== null && points[hovered] ? (
          <div
            className="pointer-events-none absolute rounded-2xl border border-black/5 bg-white/90 px-3 py-2 text-xs shadow-lg backdrop-blur-md"
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <p className="font-medium text-charcoal">{formatChartDate(points[hovered].date)}</p>
            <p className="text-accent-coral">{formatNumber(points[hovered].views)} visualizzazioni</p>
            <p className="text-charcoal-muted">
              {formatNumber(points[hovered].uniques)} visitatori unici
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className={b2bPageTitle}>Statistiche editoriali</h1>
        <p className={b2bPageSubtitle}>
          Monitora le visualizzazioni dei contenuti pubblicati dalla tua struttura.
        </p>
      </div>

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
        <div className={`${b2bCard} flex items-center justify-center py-16`}>
          <Loader2 className="h-6 w-6 animate-spin text-accent-coral" aria-label="Caricamento" />
        </div>
      ) : loadError ? (
        <B2BLoadError message={loadError} onRetry={handleRetry} />
      ) : analytics ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              label="Visualizzazioni pagina"
              value={analytics.totals.pageViews}
              icon={Eye}
              hint={`Totale nel periodo · ${periodLabel}`}
            />
            <KpiCard
              label="Visitatori unici"
              value={analytics.totals.uniqueVisitors}
              icon={Users}
              hint="Utenti distinti nel periodo"
            />
            <KpiCard
              label="Articoli pubblicati"
              value={publishedCount}
              icon={FileText}
              hint="Contenuti live della struttura"
            />
          </div>

          <ViewsTrendChart data={analytics.viewsByDay} periodLabel={periodLabel} />

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
                            <Pencil className="h-3.5 w-3.5" />
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
    </div>
  )
}
