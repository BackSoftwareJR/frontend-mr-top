import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/pro/editoriale', label: 'Contenuti', end: true },
  { to: '/pro/editoriale/analytics', label: 'Statistiche' },
]

export default function B2bEditorialSubNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Sezioni editoriale">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-coral/10 text-accent-coral ring-1 ring-accent-coral/20'
                : 'text-charcoal-muted hover:bg-white/60 hover:text-charcoal'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
