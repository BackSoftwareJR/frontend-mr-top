import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminGlassCard } from '../admin/adminStyles'
import { b2bCard, b2bEmptyState, b2bPrimaryBtn } from '../b2b/b2bStyles'

const variants = {
  admin: {
    wrap: adminGlassCard,
    inner: 'flex flex-col items-center justify-center px-6 py-16 text-center',
    iconWrap: 'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]',
    icon: 'h-8 w-8 text-zinc-500',
    title: 'text-sm font-medium text-zinc-300',
    description: 'mt-1 max-w-sm text-sm text-zinc-500',
    cta: 'mt-6 inline-flex items-center gap-2 rounded-xl border border-accent-coral/30 bg-accent-coral/15 px-4 py-2 text-sm font-medium text-accent-coral transition-colors hover:bg-accent-coral/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40',
  },
  b2b: {
    wrap: b2bCard,
    inner: b2bEmptyState,
    iconWrap: 'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/5 bg-white/80 shadow-sm',
    icon: 'h-8 w-8 text-charcoal-muted',
    title: 'text-sm font-semibold text-charcoal',
    description: 'mt-1 max-w-sm text-sm text-charcoal-muted',
    cta: `mt-6 inline-flex items-center gap-2 ${b2bPrimaryBtn}`,
  },
}

export default function EditorialEmptyState({
  variant = 'admin',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  const styles = variants[variant] ?? variants.admin

  const actionContent = (
    <>
      <Plus className="h-4 w-4" aria-hidden="true" />
      {actionLabel}
    </>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.iconWrap} aria-hidden="true">
          <FileText className={styles.icon} />
        </div>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
        {actionLabel && actionTo ? (
          <Link to={actionTo} className={styles.cta}>
            {actionContent}
          </Link>
        ) : null}
        {actionLabel && onAction && !actionTo ? (
          <button type="button" onClick={onAction} className={styles.cta}>
            {actionContent}
          </button>
        ) : null}
      </div>
    </div>
  )
}
