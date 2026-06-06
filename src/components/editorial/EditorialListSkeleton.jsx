import { adminGlassCard } from '../admin/adminStyles'
import { b2bCard } from '../b2b/b2bStyles'

const variants = {
  admin: {
    card: adminGlassCard,
    bar: 'bg-white/10',
    barMuted: 'bg-white/5',
    pill: 'bg-white/10',
  },
  b2b: {
    card: b2bCard,
    bar: 'bg-black/5',
    barMuted: 'bg-black/[0.03]',
    pill: 'bg-black/5',
  },
}

function SkeletonBar({ className = '', tone = 'default', styles }) {
  const toneClass = tone === 'muted' ? styles.barMuted : styles.bar

  return (
    <div
      className={`animate-pulse rounded-lg ${toneClass} ${className}`}
      aria-hidden="true"
    />
  )
}

export default function EditorialListSkeleton({ variant = 'admin', rows = 6 }) {
  const styles = variants[variant] ?? variants.admin

  return (
    <div className={`${styles.card} overflow-hidden`} role="status" aria-label="Caricamento contenuti">
      <div className="divide-y divide-black/5 border-b border-white/5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-4 w-2/3 max-w-xs" styles={styles} />
              <SkeletonBar className="h-3 w-1/3 max-w-[140px]" tone="muted" styles={styles} />
            </div>
            <SkeletonBar className="h-6 w-20 rounded-full" styles={styles} />
            <SkeletonBar className="h-8 w-8 rounded-lg" tone="muted" styles={styles} />
          </div>
        ))}
      </div>
      <span className="sr-only">Caricamento in corso…</span>
    </div>
  )
}

export function EditorialTableSkeleton({ variant = 'admin', rows = 5, columns = 6 }) {
  const styles = variants[variant] ?? variants.admin

  return (
    <div className={`${styles.card} overflow-hidden p-4`} role="status" aria-label="Caricamento tabella">
      <div className="mb-4 flex gap-3">
        {Array.from({ length: columns }, (_, index) => (
          <SkeletonBar key={index} className="h-3 flex-1" tone="muted" styles={styles} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonBar key={index} className="h-10 w-full" styles={styles} />
        ))}
      </div>
      <span className="sr-only">Caricamento in corso…</span>
    </div>
  )
}

export function EditorialKpiSkeleton({ variant = 'admin', count = 3 }) {
  const styles = variants[variant] ?? variants.admin

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Caricamento metriche">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${styles.card} space-y-3 p-5`}>
          <SkeletonBar className="h-10 w-10 rounded-2xl" tone="muted" styles={styles} />
          <SkeletonBar className="h-3 w-24" tone="muted" styles={styles} />
          <SkeletonBar className="h-8 w-16" styles={styles} />
        </div>
      ))}
      <span className="sr-only">Caricamento in corso…</span>
    </div>
  )
}
