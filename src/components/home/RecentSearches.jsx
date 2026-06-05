import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MoreHorizontal, Search } from 'lucide-react'
import { getSearchSessions } from '../../utils/searchSessionStorage'

const VISIBLE_COUNT = 3

export default function RecentSearches({ className = '' }) {
  const navigate = useNavigate()
  const sessions = getSearchSessions()
  const [expanded, setExpanded] = useState(false)

  if (sessions.length === 0) return null

  const visible = expanded ? sessions : sessions.slice(0, VISIBLE_COUNT)
  const hasMore = sessions.length > VISIBLE_COUNT

  const resumeSession = (sessionId) => {
    navigate(`/esplora?session=${sessionId}&started=1`)
  }

  return (
    <div className={`text-left ${className}`}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        Ricerche recenti
      </p>
      <ul className="flex flex-col gap-1.5">
        {visible.map((session) => (
          <li key={session.id}>
            <button
              type="button"
              onClick={() => resumeSession(session.id)}
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100/90 text-slate-500 group-hover:bg-[#E07A5F]/10 group-hover:text-[#E07A5F]">
                {session.supported ? (
                  <Search className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600 group-hover:text-slate-800">
                {session.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {hasMore && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-700"
          aria-label="Mostra tutte le ricerche recenti"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
          Altre {sessions.length - VISIBLE_COUNT} ricerche
        </button>
      ) : null}

      {expanded && hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-700"
        >
          Mostra meno
        </button>
      ) : null}
    </div>
  )
}
