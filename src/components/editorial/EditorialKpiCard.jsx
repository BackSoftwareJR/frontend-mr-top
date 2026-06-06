import { adminGlassCard } from '../admin/adminStyles'
import { b2bCard, b2bIconAccent } from '../b2b/b2bStyles'

const variants = {
  admin: {
    card: adminGlassCard,
    label: 'text-xs font-medium uppercase tracking-wide text-zinc-500',
    value: 'mt-1 text-2xl font-bold tabular-nums text-white sm:text-3xl',
    hint: 'mt-1 text-xs text-zinc-500',
    iconWrap: 'mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-coral/10',
    icon: 'h-4 w-4 text-accent-coral',
  },
  b2b: {
    card: b2bCard,
    label: 'text-xs font-medium text-charcoal-muted',
    value: 'mt-1 text-2xl font-semibold tabular-nums tracking-tight text-charcoal',
    hint: 'mt-1 text-xs text-charcoal-muted',
    iconWrap: 'mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-coral/10',
    icon: `h-4 w-4 ${b2bIconAccent}`,
  },
}

export default function EditorialKpiCard({
  variant = 'admin',
  label,
  value,
  hint,
  icon: Icon,
}) {
  const styles = variants[variant] ?? variants.admin

  return (
    <div className={`${styles.card} p-4 sm:p-5`}>
      {Icon ? (
        <div className={styles.iconWrap}>
          <Icon className={styles.icon} aria-hidden="true" />
        </div>
      ) : null}
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}
