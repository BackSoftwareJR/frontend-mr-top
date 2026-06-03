import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, MapPin } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import { getUserSearches } from '../../data/mockUserSearches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

function StatusBadge({ search }) {
  if (search.status === 'completed') {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/[0.08] px-3 py-1 text-xs font-medium text-emerald-800/90 ring-1 ring-emerald-600/10">
        {search.matchCount} strutture trovate
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-amber-500/[0.08] px-3 py-1 text-xs font-medium text-amber-900/80 ring-1 ring-amber-600/10">
      In elaborazione
    </span>
  )
}

function SearchRow({ search, onOpen, isLast }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(search)}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={spring}
      className={`group flex w-full min-h-[3rem] items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-stone-50/60 sm:px-6 ${
        !isLast ? 'border-b border-black/[0.06]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold text-slate-800">{search.title}</h2>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          {search.location} · {search.date}
        </p>
        <div className="mt-3">
          <StatusBadge search={search} />
        </div>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-active:translate-x-0.5 group-hover:text-slate-400"
        strokeWidth={2}
        aria-hidden
      />
    </motion.button>
  )
}

export default function UserSearches() {
  const navigate = useNavigate()
  const searches = getUserSearches()
  const prefersReducedMotion = useReducedMotion()

  const handleOpen = (search) => {
    if (search.status === 'completed' && search.answers) {
      navigate('/results', { state: { answers: search.answers } })
      return
    }
    navigate('/user/home')
  }

  return (
    <div className="space-y-6">
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Le tue ricerche
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Tutte le analisi che hai avviato, in un unico posto.
        </p>
      </motion.header>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <GlassCard
          hover={false}
          className="overflow-hidden rounded-3xl border-black/[0.06] bg-white/75 p-0 shadow-[0_4px_24px_rgba(15,23,42,0.04)]"
        >
          {searches.map((search, index) => (
            <SearchRow
              key={search.id}
              search={search}
              onOpen={handleOpen}
              isLast={index === searches.length - 1}
            />
          ))}
        </GlassCard>
      </motion.div>
    </div>
  )
}
