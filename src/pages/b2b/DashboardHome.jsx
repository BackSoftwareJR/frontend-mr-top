import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Table2,
  TrendingUp,
  Unlock,
  Users,
} from 'lucide-react'
import {
  b2bCard,
  b2bGhostBtn,
  b2bIconAccent,
  b2bLink,
  b2bListGroup,
  b2bListItem,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
} from '../../components/b2b/b2bStyles'
import { leadsTrendData } from '../../data/mockB2B'
import { useB2B } from '../../context/B2BContext'

const CORAL = '#e07a5f'
const VIOLET = '#9b8ec4'

function SummaryCard({ label, value, change, positive, icon: Icon }) {
  const ChangeIcon = positive ? ArrowUpRight : ArrowDownRight

  return (
    <div className={`${b2bCard} p-5`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-coral/10">
        {Icon && <Icon className={`h-4 w-4 ${b2bIconAccent}`} />}
      </div>
      <p className="text-xs font-medium text-charcoal-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-charcoal">{value}</p>
      {change && (
        <p
          className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}
        >
          <ChangeIcon className="h-3 w-3" />
          {change}
        </p>
      )}
    </div>
  )
}

const ACTIVITY_ICONS = {
  unlock: Unlock,
  status: Users,
  visit: TrendingUp,
  recharge: ShoppingBag,
}

function ActivityFeed({ items }) {
  return (
    <div className={b2bCard}>
      <h2 className="mb-3 px-1 text-sm font-semibold text-charcoal">Attività recente</h2>
      <ul className={b2bListGroup}>
        {items.slice(0, 4).map((item) => {
          const Icon = ACTIVITY_ICONS[item.type] || TrendingUp
          return (
            <li key={item.id} className={b2bListItem}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-violet/15">
                <Icon className="h-3.5 w-3.5 text-accent-violet-dark" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-charcoal">{item.text}</p>
                <p className="text-xs text-charcoal-muted">{item.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LeadsTrendChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const width = 560
  const height = 200
  const padding = { top: 16, right: 16, bottom: 28, left: 36 }

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxLeads = Math.max(...data.map((d) => d.leads), 1)
  const minLeads = 0

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth
    const y =
      padding.top +
      chartHeight -
      ((d.leads - minLeads) / (maxLeads - minLeads)) * chartHeight
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className={`${b2bCard} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-charcoal">Andamento Lead · 30 giorni</h2>
          <p className="text-xs text-charcoal-muted">Lead sbloccati per giorno</p>
        </div>
        <TrendingUp className={`h-4 w-4 ${b2bIconAccent}`} />
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Grafico andamento lead ultimi 30 giorni"
        >
          <defs>
            <linearGradient id="areaGradientCoral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity="0.2" />
              <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio)
            const value = Math.round(minLeads + (maxLeads - minLeads) * ratio)
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
                <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-charcoal-muted text-[10px]">
                  {value}
                </text>
              </g>
            )
          })}

          <path d={areaPath} fill="url(#areaGradientCoral)" />
          <path
            d={linePath}
            fill="none"
            stroke={CORAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={p.day}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hovered === i ? 6 : 3.5}
                fill={hovered === i ? CORAL : '#fff'}
                stroke={hovered === i ? VIOLET : CORAL}
                strokeWidth="2"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={p.x - 12}
                y={padding.top}
                width={24}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>

        {hovered !== null && points[hovered] && (
          <div
            className="pointer-events-none absolute rounded-2xl border border-black/5 bg-white/90 px-3 py-2 text-xs shadow-lg backdrop-blur-md"
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100 - 12}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-semibold text-charcoal">Giorno {points[hovered].day}</p>
            <p className="text-accent-coral">{points[hovered].leads} lead sbloccati</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { activityFeed, marketplaceLeads, crmClients, totalSpent, formatCurrency } = useB2B()

  const stats = useMemo(() => {
    const unlockedCount = marketplaceLeads.filter((l) => l.unlocked).length
    const closedCount = crmClients.filter((c) => c.stato === 'Chiuso').length
    const conversionRate =
      crmClients.length > 0 ? `${Math.round((closedCount / crmClients.length) * 100)}%` : '0%'

    return {
      leadsSbloccati: unlockedCount,
      tassoConversione: conversionRate,
      spesaMensile: formatCurrency(totalSpent),
    }
  }, [marketplaceLeads, crmClients, totalSpent, formatCurrency])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={b2bPageTitle}>Dashboard</h1>
          <p className={b2bPageSubtitle}>Sintesi rapida del tuo account partner</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/pro/marketplace"
            className={`inline-flex items-center gap-2 ${b2bGhostBtn}`}
          >
            <ShoppingBag className="h-4 w-4" />
            Marketplace Lead
          </Link>
          <Link to="/pro/crm" className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}>
            <Table2 className="h-4 w-4" />
            Il Mio CRM
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Leads Sbloccati"
          value={stats.leadsSbloccati}
          change="+12% vs mese scorso"
          positive
          icon={Unlock}
        />
        <SummaryCard
          label="Tasso di Conversione"
          value={stats.tassoConversione}
          change="+4% vs mese scorso"
          positive
          icon={Users}
        />
        <SummaryCard
          label="Spesa Mensile"
          value={stats.spesaMensile}
          change="-8% vs mese scorso"
          positive={false}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsTrendChart data={leadsTrendData} />
        </div>
        <ActivityFeed items={activityFeed} />
      </div>

      <p className="mt-6 text-center text-xs text-charcoal-muted">
        Per lavorare ogni giorno usa{' '}
        <Link to="/pro/marketplace" className={b2bLink}>
          Marketplace Lead
        </Link>{' '}
        e{' '}
        <Link to="/pro/crm" className={b2bLink}>
          Il Mio CRM
        </Link>
        .
      </p>
    </div>
  )
}
