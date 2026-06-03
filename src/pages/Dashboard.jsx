import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  HeartHandshake,
  Home,
  Inbox,
  Settings,
  Users,
} from 'lucide-react'
import AuroraBackground from '../components/layout/AuroraBackground'
import GlassCard from '../components/ui/GlassCard'
import { mockLeads, statusStyles } from '../data/mockLeads'

const NAV_ITEMS = [
  { icon: Home, label: 'Overview', to: '/dashboard' },
  { icon: Inbox, label: 'Lead in arrivo', to: '/dashboard', active: true },
  { icon: Users, label: 'Clienti', to: '/dashboard' },
  { icon: BarChart3, label: 'Analytics', to: '/dashboard' },
  { icon: Settings, label: 'Impostazioni', to: '/dashboard' },
]

function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.Contacted
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${style.className}`}
    >
      {status}
    </span>
  )
}

function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/8 bg-black/20 backdrop-blur-2xl lg:flex">
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
          <HeartHandshake className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">CareAdvisor</p>
          <p className="text-xs text-white/40">Area B2B</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/6 hover:text-white/80'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/8 p-4">
        <Link
          to="/"
          className="flex items-center justify-center rounded-xl border border-white/12 px-4 py-2.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/6 hover:text-white"
        >
          Torna al sito
        </Link>
      </div>
    </aside>
  )
}

function LeadsGrid() {
  return (
    <GlassCard hover={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs font-semibold tracking-wider text-white/40 uppercase">
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Zona</th>
              <th className="px-6 py-4">Budget</th>
              <th className="px-6 py-4">Autonomia</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data</th>
            </tr>
          </thead>
          <tbody>
            {mockLeads.map((lead, index) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="border-b border-white/6 transition-colors hover:bg-white/4"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-white/35">{lead.id}</p>
                </td>
                <td className="px-6 py-4 text-white/70">{lead.location}</td>
                <td className="px-6 py-4 font-medium text-teal-300">{lead.budget}</td>
                <td className="px-6 py-4 text-white/60">{lead.autonomy}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-pink-300">{lead.score}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 text-white/40">{lead.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const location = useLocation()
  const hotCount = mockLeads.filter((l) => l.status === 'Hot Match').length

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen"
    >
      <AuroraBackground />
      <div className="relative z-10 flex w-full">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
                Lead in arrivo
              </h1>
              <p className="mt-1 text-white/50">
                {mockLeads.length} lead attivi · {hotCount} hot match
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/6 px-4 py-2.5 text-xs font-semibold text-white/70 backdrop-blur-xl transition-colors hover:text-white lg:hidden"
            >
              Torna al sito
            </Link>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Hot Match', value: hotCount, color: 'text-pink-300' },
              { label: 'Warm Lead', value: mockLeads.filter((l) => l.status === 'Warm Lead').length, color: 'text-teal-300' },
              { label: 'Nuovi oggi', value: 2, color: 'text-purple-300' },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-5">
                <p className="text-xs font-semibold tracking-wider text-white/40 uppercase">
                  {stat.label}
                </p>
                <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          <LeadsGrid />
        </main>
      </div>
    </motion.div>
  )
}
