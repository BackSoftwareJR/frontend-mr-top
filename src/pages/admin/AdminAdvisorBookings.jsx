import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { fetchAdminAdvisorBookingsWithFallback } from '../../services/adminService'
import { isApiConfigured } from '../../services/apiClient'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

const FILTER_OPTIONS = [
  { value: 'upcoming', label: 'In programma' },
  { value: 'past', label: 'Passate' },
]

function formatScheduledLabel(booking) {
  if (booking.scheduledAt) {
    const date = new Date(booking.scheduledAt)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }
  }

  if (booking.scheduledDate && booking.scheduledTime) {
    const date = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }
  }

  return '—'
}

export default function AdminAdvisorBookings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('upcoming')
  const search = searchParams.get('q') ?? ''
  const [bookings, setBookings] = useState({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(() => isApiConfigured())

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) setLoading(true)
      try {
        const data = await fetchAdminAdvisorBookingsWithFallback()
        if (!cancelled) setBookings(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    const list = filter === 'upcoming' ? bookings.upcoming : bookings.past
    const query = search.trim().toLowerCase()
    if (!query) return list

    return list.filter((booking) => {
      const haystack = [
        booking.consumerName,
        booking.consumerEmail,
        booking.leadTitle,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [bookings, filter, search])

  const counts = {
    upcoming: bookings.upcoming.length,
    past: bookings.past.length,
  }

  function handleSearchChange(event) {
    const value = event.target.value
    const next = new URLSearchParams(searchParams)

    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }

    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminPageTitle}>Coda consulenze advisor</h1>
        <p className={adminPageSubtitle}>
          Appuntamenti B2C con il peer advisor — in programma e passati.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                filter === option.value
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/15 hover:text-white'
              }`}
            >
              {option.label}
              <span className="ml-1.5 text-xs text-zinc-500">({counts[option.value]})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cerca per nome, email o lead…"
            className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <div className={`${adminGlassCard} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            Caricamento appuntamenti…
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">
            {search.trim()
              ? 'Nessun appuntamento corrisponde alla ricerca.'
              : filter === 'upcoming'
                ? 'Nessuna consulenza in programma.'
                : 'Nessuna consulenza passata.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Consumatore</th>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Data e ora</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{booking.consumerName || '—'}</p>
                      {booking.consumerEmail ? (
                        <p className="text-xs text-zinc-500">{booking.consumerEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {booking.leadTitle ?? (
                        <span className="text-zinc-600">Senza lead collegato</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{formatScheduledLabel(booking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
