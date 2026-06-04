import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import {
  b2bCard,
  b2bIconAccent,
  b2bLink,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
} from '../../components/b2b/b2bStyles'
import { useB2B } from '../../context/B2BContext'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days = []
  for (let i = 0; i < startOffset; i++) {
    days.push(null)
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(d)
  }
  return days
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function Calendario() {
  const { appointments } = useB2B()
  const today = new Date(2026, 5, 3)
  const [view, setView] = useState('month')
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const appointmentsByDate = useMemo(() => {
    const map = {}
    appointments.forEach((apt) => {
      if (!map[apt.date]) map[apt.date] = []
      map[apt.date].push(apt)
    })
    return map
  }, [appointments])

  const calendarDays = getCalendarDays(year, month)
  const selectedDateKey = toDateKey(year, month, selectedDay)
  const selectedAppointments = appointmentsByDate[selectedDateKey] || []

  const weekDayIndex = new Date(year, month, selectedDay).getDay()
  const weekStartDiff = weekDayIndex === 0 ? -6 : 1 - weekDayIndex
  const weekStartMs = new Date(year, month, selectedDay + weekStartDiff).getTime()
  const weekStartDate = new Date(weekStartMs)
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + i),
  )

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={b2bPageTitle}>Calendario</h1>
          <p className={b2bPageSubtitle}>
            {appointments.length} visite programmate
          </p>
        </div>
        <Link to="/pro/crm" className={`inline-flex items-center justify-center gap-2 ${b2bPrimaryBtn}`}>
          <Plus className="h-4 w-4" />
          Nuova visita
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className={`${b2bCard} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-black/5"
                  aria-label="Mese precedente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-semibold text-charcoal">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-full p-2 text-charcoal-muted transition-colors hover:bg-black/5"
                  aria-label="Mese successivo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className={b2bSegmented}>
                <button
                  type="button"
                  onClick={() => setView('month')}
                  className={view === 'month' ? b2bSegmentedActive : b2bSegmentedInactive}
                >
                  Mese
                </button>
                <button
                  type="button"
                  onClick={() => setView('week')}
                  className={view === 'week' ? b2bSegmentedActive : b2bSegmentedInactive}
                >
                  Settimana
                </button>
              </div>
            </div>

            {view === 'month' ? (
              <>
                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-charcoal-muted"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="aspect-square" />
                    }
                    const dateKey = toDateKey(year, month, day)
                    const dayAppts = appointmentsByDate[dateKey] || []
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear()
                    const isSelected = day === selectedDay

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`relative flex aspect-square flex-col items-center justify-start rounded-2xl p-1 text-sm transition-all ${
                          isSelected
                            ? 'bg-accent-coral text-white shadow-sm glow-coral'
                            : isToday
                              ? 'bg-accent-coral/10 text-accent-coral-dark ring-1 ring-accent-coral/25'
                              : 'text-charcoal hover:bg-black/[0.03]'
                        }`}
                      >
                        <span className="font-medium">{day}</span>
                        {dayAppts.length > 0 && (
                          <span
                            className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-accent-coral'
                            }`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {weekDays.map((d) => {
                  const dateKey = toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
                  const dayAppts = appointmentsByDate[dateKey] || []
                  const isToday =
                    d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear()

                  return (
                    <div
                      key={dateKey}
                      className={`rounded-2xl border p-3 ${
                        isToday
                          ? 'border-accent-coral/30 bg-accent-coral/5'
                          : 'border-black/5 bg-white/60'
                      }`}
                    >
                      <p className="mb-2 text-xs font-semibold text-charcoal-muted">
                        {WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}{' '}
                        {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
                      </p>
                      {dayAppts.length === 0 ? (
                        <p className="text-xs text-charcoal-muted">Nessun appuntamento</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {dayAppts.map((apt) => (
                            <li
                              key={apt.id}
                              className="flex items-center gap-2 rounded-xl border border-black/5 bg-white/80 px-2 py-1.5 text-xs"
                            >
                              <Clock className={`h-3 w-3 ${b2bIconAccent}`} />
                              <span className="font-medium text-charcoal">{apt.time}</span>
                              <span className="text-charcoal-muted">{apt.cliente}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className={`${b2bCard} p-5`}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Calendar className={`h-4 w-4 ${b2bIconAccent}`} />
            {selectedDay} {MONTHS[month]}
          </h3>

          {selectedAppointments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-charcoal-muted">Nessun appuntamento in questo giorno</p>
              <Link to="/pro/crm" className={`mt-3 inline-flex text-sm ${b2bLink}`}>
                Pianifica una visita →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="rounded-2xl border border-black/5 bg-white/60 p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                    <Clock className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
                    {apt.time} · {apt.cliente}
                  </div>
                  {apt.note && <p className="mt-1 text-xs text-charcoal-muted">{apt.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
