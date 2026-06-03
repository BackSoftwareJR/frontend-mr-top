import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getLatestSearch } from '../../data/mockUserSearches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const PROFILE_ROWS = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Telefono' },
]

function ProfileRow({ label, value, isLast }) {
  return (
    <div
      className={`flex min-h-[3rem] items-center justify-between gap-4 px-5 py-4 sm:px-6 ${
        !isLast ? 'border-b border-black/[0.06]' : ''
      }`}
    >
      <span className="text-base text-slate-600">{label}</span>
      <span className="text-right text-base font-medium text-slate-800">{value}</span>
    </div>
  )
}

export default function UserProfile() {
  const { userName, userEmail, logout } = useAuth()
  const latest = getLatestSearch()
  const phone = latest?.answers?.contact?.telefono
  const prefersReducedMotion = useReducedMotion()

  const displayName = userName || latest?.answers?.contact?.nome || '—'
  const displayEmail = userEmail || '—'

  const values = {
    nome: displayName,
    email: displayEmail,
    telefono: phone,
  }

  const visibleRows = PROFILE_ROWS.filter((row) => row.key !== 'telefono' || phone)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Profilo
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          I tuoi dati e le impostazioni dell&apos;account.
        </p>
      </header>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col items-center gap-5"
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-black/[0.06] bg-gradient-to-br from-teal-800/[0.06] to-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          aria-hidden
        >
          <User className="h-9 w-9 text-teal-800/50" strokeWidth={1.5} />
        </div>
        <p className="text-lg font-semibold text-slate-800">{displayName}</p>
      </motion.div>

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Account
        </h2>
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          {visibleRows.map((row, index) => (
            <ProfileRow
              key={row.key}
              label={row.label}
              value={values[row.key] || '—'}
              isLast={index === visibleRows.length - 1}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Supporto
        </h2>
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <Link
            to="/user/aiuto"
            className="group flex min-h-[3rem] items-center justify-between gap-4 px-5 py-4 text-base text-slate-800 transition-colors hover:bg-stone-50/60 sm:px-6"
          >
            <span>Centro assistenza</span>
            <ChevronRight
              className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>
      </section>

      <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }} transition={spring}>
        <Link
          to="/accedi"
          onClick={logout}
          className="inline-flex min-h-[3rem] items-center gap-2 rounded-xl px-1 py-3 text-sm font-medium text-rose-600/90 transition-colors hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Esci dall&apos;account
        </Link>
      </motion.div>
    </div>
  )
}
