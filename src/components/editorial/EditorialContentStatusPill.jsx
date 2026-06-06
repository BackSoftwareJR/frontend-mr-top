import {
  EDITORIAL_CONTENT_STATUSES,
  EDITORIAL_STATUS_COLORS,
} from '../../services/adminEditorialService'
import {
  B2B_EDITORIAL_CONTENT_STATUSES,
  B2B_EDITORIAL_STATUS_COLORS,
} from '../../services/b2bEditorialService'

const config = {
  admin: {
    statuses: EDITORIAL_CONTENT_STATUSES,
    colors: EDITORIAL_STATUS_COLORS,
    fallback: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  },
  b2b: {
    statuses: B2B_EDITORIAL_CONTENT_STATUSES,
    colors: B2B_EDITORIAL_STATUS_COLORS,
    fallback: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
}

export default function EditorialContentStatusPill({ status, variant = 'admin', size = 'sm' }) {
  const { statuses, colors, fallback } = config[variant] ?? config.admin
  const label = statuses.find((entry) => entry.value === status)?.label ?? status
  const colorClass = colors[status] ?? fallback
  const sizeClass =
    size === 'md'
      ? 'px-3 py-1 text-xs'
      : 'px-2.5 py-0.5 text-[11px]'

  return (
    <span
      className={`inline-flex rounded-full border font-medium uppercase tracking-wide ${sizeClass} ${colorClass}`}
    >
      {label}
    </span>
  )
}
