import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  adminMetrics,
  leadFlowChartData,
  portfolioAllocation,
  revenueTimelineData,
  transactions,
} from '../../data/mockAdmin'
import AdminMetricCard from '../../components/admin/AdminMetricCard'
import AdminDonutChart from '../../components/admin/AdminDonutChart'
import AdminRecentTransactions from '../../components/admin/AdminRecentTransactions'
import AdminRevenueTimeline from '../../components/admin/AdminRevenueTimeline'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

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

function LeadFlowChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const width = 640
  const height = 240
  const padding = { top: 20, right: 20, bottom: 32, left: 44 }

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxLeads = Math.max(...data.map((d) => d.leads), 1)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  const leadPoints = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - (d.leads / maxLeads) * chartHeight
    return { x, y, ...d }
  })

  const revenuePoints = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - (d.revenue / maxRevenue) * chartHeight
    return { x, y, ...d }
  })

  const leadPath = smoothPath(leadPoints)
  const revenuePath = smoothPath(revenuePoints)
  const leadArea = `${leadPath} L ${leadPoints[leadPoints.length - 1].x} ${padding.top + chartHeight} L ${leadPoints[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className={`${adminGlassCard} p-4 sm:p-6`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">Lead Flow vs Revenue</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Ultimi 14 giorni — flusso lead e fatturato</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-0.5 w-4 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
            Lead
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-0.5 w-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
            Revenue
          </span>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Grafico Lead Flow vs Revenue"
        >
          <defs>
            <linearGradient id="leadAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="leadStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="revenueStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio)
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            )
          })}

          <path d={leadArea} fill="url(#leadAreaGrad)" />
          <path
            d={leadPath}
            fill="none"
            stroke="url(#leadStrokeGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0 0 4px rgba(34,211,238,0.5))"
          />
          <path
            d={revenuePath}
            fill="none"
            stroke="url(#revenueStrokeGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            filter="drop-shadow(0 0 4px rgba(168,85,247,0.5))"
          />

          {leadPoints.map((p, i) => (
            <g key={`${p.day}-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 5 : 3}
                fill={hovered === i ? '#22d3ee' : '#09090b'}
                stroke="#22d3ee"
                strokeWidth="2"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={p.x - 14}
                y={padding.top}
                width={28}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}

          {data.filter((_, i) => i % 2 === 0).map((d, idx) => {
            const i = idx * 2
            const x = padding.left + (i / (data.length - 1)) * chartWidth
            return (
              <text
                key={d.day + i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-zinc-500 text-[10px]"
              >
                {d.day}
              </text>
            )
          })}
        </svg>

        {hovered !== null && leadPoints[hovered] && (
          <div
            className={`pointer-events-none absolute ${adminGlassCard} px-3 py-2 text-xs shadow-xl`}
            style={{
              left: `${(leadPoints[hovered].x / width) * 100}%`,
              top: `${(leadPoints[hovered].y / height) * 100 - 14}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-semibold text-white">{leadPoints[hovered].day}</p>
            <p className="text-cyan-400">{leadPoints[hovered].leads} lead</p>
            <p className="text-purple-400">€ {leadPoints[hovered].revenue.toLocaleString('it-IT')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminHome() {
  const {
    mrr,
    activeLeadsToday,
    activePartners,
    pendingApprovals,
    churn,
    conversionRate,
    avgDealSize,
  } = adminMetrics

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>God Mode Dashboard</h1>
        <p className={adminPageSubtitle}>
          Panoramica piattaforma Wenando — metriche, portafoglio e transazioni
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <AdminMetricCard label="MRR (Fatturato)" {...mrr} />
        <AdminMetricCard label="Lead Attivi (Oggi)" {...activeLeadsToday} />
        <AdminMetricCard label="Partner Attivi" {...activePartners} />
        <AdminMetricCard label="Da Approvare" {...pendingApprovals} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Churn Rate" {...churn} />
        <AdminMetricCard label="Tasso Conversione" {...conversionRate} />
        <AdminMetricCard label="Deal Medio" {...avgDealSize} />
      </div>

      <section aria-labelledby="portafoglio-heading">
        <h2 id="portafoglio-heading" className="mb-3 text-sm font-semibold text-white">
          Portafoglio
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <AdminDonutChart
            title="Per settore"
            subtitle="Allocazione revenue B2B"
            segments={portfolioAllocation.bySector}
          />
          <AdminDonutChart
            title="Per regione"
            subtitle="Distribuzione geografica"
            segments={portfolioAllocation.byRegion}
          />
          <AdminDonutChart
            title="Per tier partner"
            subtitle="Enterprise · Growth · Starter"
            segments={portfolioAllocation.byTier}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadFlowChart data={leadFlowChartData} />
        </div>
        <AdminRevenueTimeline data={revenueTimelineData} />
      </div>

      <AdminRecentTransactions transactions={transactions} />
    </div>
  )
}
