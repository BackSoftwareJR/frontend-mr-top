import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { adminGlassCard } from './adminStyles'

function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
}

export default function AdminRevenueTimeline({ data, compact = false }) {
  const [hovered, setHovered] = useState(null)
  const width = compact ? 320 : 480
  const height = compact ? 120 : 160
  const padding = { top: 12, right: 12, bottom: 24, left: 12 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - (d.amount / maxAmount) * chartHeight
    return { x, y, ...d }
  })

  const linePath = smoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className={`${adminGlassCard} p-4 sm:p-5`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Cashflow</h3>
          <p className="text-xs text-zinc-500">Incassi giornalieri — ultimi 7 giorni</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-cyan-400">
            € {total.toLocaleString('it-IT')}
          </p>
          <p className="flex items-center justify-end gap-0.5 text-[10px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +9,2%
          </p>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Timeline incassi">
          <defs>
            <linearGradient id="cashflowArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cashflowLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#cashflowArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="url(#cashflowLine)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="drop-shadow(0 0 4px rgba(34,211,238,0.4))"
          />
          {points.map((p, i) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 4 : 2.5}
              fill={hovered === i ? '#22d3ee' : '#09090b'}
              stroke="#22d3ee"
              strokeWidth="1.5"
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        {hovered !== null && points[hovered] && (
          <div
            className={`pointer-events-none absolute ${adminGlassCard} px-2 py-1 text-[10px] shadow-lg`}
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: '0',
              transform: 'translate(-50%, 0)',
            }}
          >
            <p className="font-medium text-white">{points[hovered].day}</p>
            <p className="text-cyan-400">€ {points[hovered].amount.toLocaleString('it-IT')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
