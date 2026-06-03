import { adminStatusColors } from './adminStyles'

export default function TransactionStatusBadge({ stato }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        adminStatusColors[stato] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
      }`}
    >
      {stato}
    </span>
  )
}
