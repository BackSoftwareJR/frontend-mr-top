import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { adminGlassCard } from './adminStyles'

export default function AdminMetricCard({ label, value, change, positive, to }) {
  const ChangeIcon = positive ? ArrowUpRight : ArrowDownRight

  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      {change && (
        <p
          className={`mt-1.5 flex items-center gap-0.5 text-xs font-medium ${
            positive ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          <ChangeIcon className="h-3 w-3" />
          {change}
        </p>
      )}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={`${adminGlassCard} block p-4 transition hover:border-cyan-500/30 hover:bg-white/[0.03] sm:p-5`}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={`${adminGlassCard} p-4 sm:p-5`}>
      {content}
    </div>
  )
}
