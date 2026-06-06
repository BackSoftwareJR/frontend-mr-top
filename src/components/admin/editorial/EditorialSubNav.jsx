import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { fetchEditorialNotifications } from '../../../services/adminEditorialService'

const TABS = [
  { to: '/admin/editorial', label: 'Contenuti', end: true },
  { to: '/admin/editorial/review', label: 'Revisione' },
  { to: '/admin/editorial/indexing', label: 'Indicizzazione' },
  { to: '/admin/editorial/metrics', label: 'Metriche' },
  { to: '/admin/editorial/analytics', label: 'Analytics' },
]

export default function EditorialSubNav() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetchEditorialNotifications()
      .then(({ unreadCount: count }) => {
        if (!cancelled) {
          setUnreadCount(count)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUnreadCount(0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <nav
      className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4"
      aria-label="Sezioni editoriale"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-coral/15 text-accent-coral ring-1 ring-accent-coral/25'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
      {unreadCount > 0 ? (
        <span
          className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-accent-coral px-2 py-0.5 text-xs font-semibold text-white"
          title={`${unreadCount} notifiche non lette`}
          aria-label={`${unreadCount} notifiche editoriali non lette`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </nav>
  )
}
