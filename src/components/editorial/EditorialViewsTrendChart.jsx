import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { adminGlassCard } from '../admin/adminStyles'
import { b2bCard, b2bIconAccent } from '../b2b/b2bStyles'

const CORAL = '#e07a5f'

const THEMES = {
  b2b: {
    card: b2bCard,
    title: 'text-sm font-semibold text-charcoal',
    subtitle: 'text-xs text-charcoal-muted',
    icon: b2bIconAccent,
    gridStroke: 'rgb(0 0 0 / 0.06)',
    axisLabel: 'fill-charcoal-muted text-[10px]',
    gradientId: 'editorialAreaGradientB2b',
    tooltip:
      'pointer-events-none absolute rounded-2xl border border-black/5 bg-white/90 px-3 py-2 text-xs shadow-lg backdrop-blur-md',
    tooltipTitle: 'font-medium text-charcoal',
    tooltipViews: 'text-accent-coral',
    tooltipUniques: 'text-charcoal-muted',
    emptyText: 'text-sm text-charcoal-muted',
  },
  admin: {
    card: adminGlassCard,
    title: 'text-sm font-semibold text-white',
    subtitle: 'text-xs text-zinc-500',
    icon: 'text-accent-coral',
    gridStroke: 'rgb(255 255 255 / 0.06)',
    axisLabel: 'fill-zinc-500 text-[10px]',
    gradientId: 'editorialAreaGradientAdmin',
    tooltip:
      'pointer-events-none absolute rounded-2xl border border-white/10 bg-zinc-900/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md',
    tooltipTitle: 'font-medium text-white',
    tooltipViews: 'text-accent-coral',
    tooltipUniques: 'text-zinc-400',
    emptyText: 'text-sm text-zinc-500',
  },
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

export default function EditorialViewsTrendChart({ data, periodLabel, variant = 'b2b' }) {
  const [hovered, setHovered] = useState(null)
  const theme = THEMES[variant] ?? THEMES.b2b

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
    const y = padding.top + chartHeight - (entry.views / maxViews) * chartHeight

    return { x, y, ...entry }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
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
      <div className={`${theme.card} p-5`}>
        <h2 className={theme.title}>Visualizzazioni per giorno</h2>
        <p className={`mt-4 ${theme.emptyText}`}>Nessun dato nel periodo selezionato.</p>
      </div>
    )
  }

  return (
    <div className={`${theme.card} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className={theme.title}>Visualizzazioni per giorno</h2>
          <p className={theme.subtitle}>Periodo: {periodLabel}</p>
        </div>
        <BarChart3 className={`h-4 w-4 shrink-0 ${theme.icon}`} />
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`Grafico visualizzazioni editoriali ${periodLabel}`}
        >
          <defs>
            <linearGradient id={theme.gradientId} x1="0" y1="0" x2="0" y2="1">
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
                  stroke={theme.gridStroke}
                  strokeWidth="1"
                />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" className={theme.axisLabel}>
                  {value}
                </text>
              </g>
            )
          })}

          {areaPath ? <path d={areaPath} fill={`url(#${theme.gradientId})`} /> : null}
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
                fill={hovered === index ? CORAL : variant === 'admin' ? '#18181b' : '#fff'}
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
                className={theme.axisLabel}
              >
                {formatChartDate(point.date)}
              </text>
            )
          })}
        </svg>

        {hovered !== null && points[hovered] ? (
          <div
            className={theme.tooltip}
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <p className={theme.tooltipTitle}>{formatChartDate(points[hovered].date)}</p>
            <p className={theme.tooltipViews}>
              {formatNumber(points[hovered].views)} visualizzazioni
            </p>
            <p className={theme.tooltipUniques}>
              {formatNumber(points[hovered].uniques)} visitatori unici
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
