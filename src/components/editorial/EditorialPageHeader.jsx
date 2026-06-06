import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { adminPageSubtitle, adminPageTitle } from '../admin/adminStyles'
import { b2bPageSubtitle, b2bPageTitle } from '../b2b/b2bStyles'

const variants = {
  admin: {
    title: adminPageTitle,
    subtitle: adminPageSubtitle,
    backLink:
      'mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-md',
  },
  b2b: {
    title: b2bPageTitle,
    subtitle: b2bPageSubtitle,
    backLink:
      'mb-2 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-charcoal-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/30 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-cream',
  },
}

export default function EditorialPageHeader({
  variant = 'admin',
  title,
  subtitle,
  backTo,
  backLabel = 'Indietro',
  badge,
  actions,
  className = '',
}) {
  const styles = variants[variant] ?? variants.admin

  return (
    <header className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        {backTo ? (
          <Link to={backTo} className={styles.backLink}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={styles.title}>{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
