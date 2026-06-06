import { Check, Circle } from 'lucide-react'

const variants = {
  admin: {
    saved: 'text-emerald-400',
    dirty: 'text-amber-400',
    wrap: 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/60 px-3 py-1 text-xs font-medium',
  },
  b2b: {
    saved: 'text-emerald-700',
    dirty: 'text-amber-700',
    wrap: 'inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-semibold text-charcoal',
  },
}

export default function EditorialSaveStatus({ isDirty, variant = 'admin' }) {
  const styles = variants[variant] ?? variants.admin

  if (isDirty) {
    return (
      <span className={styles.wrap} role="status" aria-live="polite">
        <Circle className={`h-2 w-2 fill-current ${styles.dirty}`} aria-hidden="true" />
        <span className={styles.dirty}>Modifiche non salvate</span>
      </span>
    )
  }

  return (
    <span className={styles.wrap} role="status" aria-live="polite">
      <Check className={`h-3.5 w-3.5 ${styles.saved}`} aria-hidden="true" />
      <span className={styles.saved}>Salvato</span>
    </span>
  )
}
