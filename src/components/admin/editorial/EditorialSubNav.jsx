import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin/editorial', label: 'Contenuti', end: true },
  { to: '/admin/editorial/review', label: 'Revisione' },
  { to: '/admin/editorial/indexing', label: 'Indicizzazione' },
  { to: '/admin/editorial/metrics', label: 'Metriche' },
]

export default function EditorialSubNav() {
  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
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
    </nav>
  )
}
