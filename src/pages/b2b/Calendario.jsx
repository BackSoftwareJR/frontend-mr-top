import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  Unlink,
  X,
} from 'lucide-react'
import ScheduleVisitModal from '../../components/b2b/ScheduleVisitModal'
import {
  b2bCard,
  b2bIconAccent,
  b2bInputFocus,
  b2bLink,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
  b2bSecondaryBtn,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
} from '../../components/b2b/b2bStyles'
import { useB2B } from '../../context/B2BContext'
import { isApiConfigured } from '../../services/apiClient'
import { updateAppointment } from '../../services/b2bAppointmentsService'
import {
  disconnectGoogleCalendar,
  fetchGoogleCalendarConnectUrl,
  fetchGoogleCalendarStatus,
  syncGoogleCalendar,
} from '../../services/b2bGoogleCalendarService'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

const inputClass = `rounded-xl border border-black/5 bg-white/90 px-2 py-1.5 text-xs ${b2bInputFocus}`

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

function formatTimeForInput(time) {
  if (!time) return '10:00'
  return time.slice(0, 5)
}

function GoogleSyncBadge({ synced }) {
  if (!synced) return null

  return (
    <span
      title="Sincronizzato con Google Calendar"
      className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80"
    >
      <Link2 className="mr-0.5 h-2.5 w-2.5" />
      Google
    </span>
  )
}

export default function Calendario() {
  const {
    appointments,
    setAppointments,
    crmClients,
    scheduleVisit,
    showToast,
    loading,
  } = useB2B()
  const [searchParams, setSearchParams] = useSearchParams()
  const today = new Date()
  const [view, setView] = useState('month')
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [savingChecklist, setSavingChecklist] = useState(null)
  const [savingReschedule, setSavingReschedule] = useState(null)
  const [editingAppointmentId, setEditingAppointmentId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [newChecklistLabel, setNewChecklistLabel] = useState('')
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleInitialDate, setScheduleInitialDate] = useState('')
  const [googleStatus, setGoogleStatus] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleSyncing, setGoogleSyncing] = useState(false)
  const [googleMessage, setGoogleMessage] = useState('')
  const [draggingAppointmentId, setDraggingAppointmentId] = useState(null)

  const canEditChecklist = isApiConfigured()
  const apiEnabled = isApiConfigured()

  useEffect(() => {
    const google = searchParams.get('google')
    if (!google) return

    if (google === 'connected') {
      showToast('Google Calendar collegato con successo.', 'success')
      if (apiEnabled) {
        fetchGoogleCalendarStatus()
          .then(setGoogleStatus)
          .catch(() => setGoogleStatus({ connected: true, syncEnabled: true }))
      }
    } else if (google === 'error') {
      showToast(
        searchParams.get('message') || 'Connessione Google Calendar non riuscita.',
        'error',
      )
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('google')
    nextParams.delete('message')
    setSearchParams(nextParams, { replace: true })
  }, [apiEnabled, searchParams, setSearchParams, showToast])

  useEffect(() => {
    if (!apiEnabled) return

    let cancelled = false

    async function loadGoogleStatus() {
      setGoogleLoading(true)
      try {
        const status = await fetchGoogleCalendarStatus()
        if (!cancelled) {
          setGoogleStatus(status)
        }
      } catch {
        if (!cancelled) {
          setGoogleStatus({ connected: false, syncEnabled: false })
        }
      } finally {
        if (!cancelled) {
          setGoogleLoading(false)
        }
      }
    }

    loadGoogleStatus()

    return () => {
      cancelled = true
    }
  }, [apiEnabled])

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

  function openScheduleModal(dateKey = selectedDateKey) {
    setScheduleInitialDate(dateKey)
    setScheduleModalOpen(true)
  }

  function handleDayClick(day) {
    setSelectedDay(day)
  }

  function handleDayDoubleClick(day) {
    setSelectedDay(day)
    openScheduleModal(toDateKey(year, month, day))
  }

  async function persistAppointmentUpdate(apt, payload) {
    if (!canEditChecklist) return null

    try {
      const updated = await updateAppointment(apt.id, payload)
      if (updated) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === apt.id ? { ...a, ...updated } : a)),
        )
      }
      return updated
    } catch (error) {
      showToast(error.message ?? 'Aggiornamento non riuscito.', 'error')
      return null
    }
  }

  async function toggleChecklistItem(apt, itemId) {
    if (!canEditChecklist) return

    const checklist = (apt.checklist ?? []).map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    )

    setSavingChecklist(apt.id)
    try {
      await persistAppointmentUpdate(apt, { checklist })
    } finally {
      setSavingChecklist(null)
    }
  }

  async function addChecklistItem(apt) {
    const label = newChecklistLabel.trim()
    if (!canEditChecklist || !label) return

    const checklist = [
      ...(apt.checklist ?? []),
      { id: `task-${Date.now()}`, label, done: false },
    ]

    setSavingChecklist(apt.id)
    try {
      const updated = await persistAppointmentUpdate(apt, { checklist })
      if (updated) {
        setNewChecklistLabel('')
      }
    } finally {
      setSavingChecklist(null)
    }
  }

  async function removeChecklistItem(apt, itemId) {
    if (!canEditChecklist) return

    const checklist = (apt.checklist ?? []).filter((item) => item.id !== itemId)

    setSavingChecklist(apt.id)
    try {
      await persistAppointmentUpdate(apt, { checklist })
    } finally {
      setSavingChecklist(null)
    }
  }

  function startReschedule(apt) {
    setEditingAppointmentId(apt.id)
    setEditDate(apt.date)
    setEditTime(formatTimeForInput(apt.time))
  }

  function cancelReschedule() {
    setEditingAppointmentId(null)
    setEditDate('')
    setEditTime('')
  }

  async function saveReschedule(apt) {
    if (!canEditChecklist || !editDate || !editTime) return

    setSavingReschedule(apt.id)
    try {
      const updated = await persistAppointmentUpdate(apt, {
        date: editDate,
        time: editTime.length === 5 ? `${editTime}:00` : editTime,
      })
      if (updated) {
        cancelReschedule()
        showToast('Visita riprogrammata.', 'success')
      }
    } finally {
      setSavingReschedule(null)
    }
  }

  async function handleDropOnDate(apt, dateKey) {
    if (!canEditChecklist || !apt || apt.date === dateKey) return

    setSavingReschedule(apt.id)
    try {
      const updated = await persistAppointmentUpdate(apt, { date: dateKey })
      if (updated) {
        showToast('Visita spostata.', 'success')
      }
    } finally {
      setSavingReschedule(null)
      setDraggingAppointmentId(null)
    }
  }

  async function handleConnectGoogle() {
    if (!apiEnabled) return

    setGoogleLoading(true)
    setGoogleMessage('')
    try {
      const { authorizationUrl } = await fetchGoogleCalendarConnectUrl()
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      }
    } catch (error) {
      setGoogleMessage(error.message ?? 'Connessione Google Calendar non riuscita.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleDisconnectGoogle() {
    if (!apiEnabled) return

    setGoogleLoading(true)
    setGoogleMessage('')
    try {
      await disconnectGoogleCalendar()
      setGoogleStatus({ connected: false, syncEnabled: false })
    } catch (error) {
      setGoogleMessage(error.message ?? 'Disconnessione non riuscita.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSyncGoogle() {
    if (!apiEnabled || !googleStatus?.connected) return

    setGoogleSyncing(true)
    setGoogleMessage('')
    try {
      const result = await syncGoogleCalendar()
      setGoogleMessage(`Sincronizzati ${result.pulled} eventi da Google Calendar.`)
    } catch (error) {
      setGoogleMessage(error.message ?? 'Sincronizzazione non riuscita.')
    } finally {
      setGoogleSyncing(false)
    }
  }

  const appointmentCountLabel = loading && apiEnabled
    ? 'Caricamento visite…'
    : `${appointments.length} visite programmate`

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={b2bPageTitle}>Calendario</h1>
          <p className={b2bPageSubtitle}>{appointmentCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => openScheduleModal()}
          className={`inline-flex items-center justify-center gap-2 ${b2bPrimaryBtn}`}
        >
          <Plus className="h-4 w-4" />
          Nuova visita
        </button>
      </div>

      {apiEnabled && (
        <div className={`${b2bCard} mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-sm font-semibold text-charcoal">Google Calendar</p>
            <p className="text-xs text-charcoal-muted">
              {googleLoading
                ? 'Caricamento stato integrazione…'
                : googleStatus?.connected
                  ? `Collegato${googleStatus.calendarId ? ` · ${googleStatus.calendarId}` : ''}`
                  : 'Collega il calendario aziendale per sincronizzare le visite.'}
            </p>
            {googleMessage && (
              <p className="mt-1 text-xs text-charcoal-muted">{googleMessage}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {googleStatus?.connected ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncGoogle}
                  disabled={googleSyncing || googleLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:bg-black/[0.03] disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${googleSyncing ? 'animate-spin' : ''}`} />
                  {googleSyncing ? 'Sincronizzazione…' : 'Sincronizza'}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  disabled={googleLoading || googleSyncing}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:bg-black/[0.03] disabled:opacity-60"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Disconnetti
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={googleLoading}
                className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}
              >
                <Link2 className="h-4 w-4" />
                {googleLoading ? 'Connessione…' : 'Collega Google Calendar'}
              </button>
            )}
          </div>
        </div>
      )}

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
                    const isDropTarget = draggingAppointmentId !== null

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        onDoubleClick={() => handleDayDoubleClick(day)}
                        onDragOver={(e) => {
                          if (!draggingAppointmentId) return
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const apt = appointments.find((a) => a.id === draggingAppointmentId)
                          handleDropOnDate(apt, dateKey)
                        }}
                        className={`relative flex aspect-square flex-col items-center justify-start rounded-2xl p-1 text-sm transition-all ${
                          isSelected
                            ? 'bg-accent-coral text-white shadow-sm glow-coral'
                            : isToday
                              ? 'bg-accent-coral/10 text-accent-coral-dark ring-1 ring-accent-coral/25'
                              : isDropTarget
                                ? 'text-charcoal ring-1 ring-dashed ring-accent-coral/40 hover:bg-accent-coral/5'
                                : 'text-charcoal hover:bg-black/[0.03]'
                        }`}
                        title="Doppio clic per nuova visita"
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
                      onDragOver={(e) => {
                        if (!draggingAppointmentId) return
                        e.preventDefault()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const apt = appointments.find((a) => a.id === draggingAppointmentId)
                        handleDropOnDate(apt, dateKey)
                      }}
                    >
                      <p className="mb-2 text-xs font-semibold text-charcoal-muted">
                        {WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}{' '}
                        {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
                      </p>
                      {dayAppts.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openScheduleModal(dateKey)}
                          className={`text-xs ${b2bLink}`}
                        >
                          Nessun appuntamento · Clicca per pianificare
                        </button>
                      ) : (
                        <ul className="space-y-1.5">
                          {dayAppts.map((apt) => (
                            <li
                              key={apt.id}
                              draggable={canEditChecklist}
                              onDragStart={() => setDraggingAppointmentId(apt.id)}
                              onDragEnd={() => setDraggingAppointmentId(null)}
                              className="flex items-center gap-2 rounded-xl border border-black/5 bg-white/80 px-2 py-1.5 text-xs"
                            >
                              <Clock className={`h-3 w-3 ${b2bIconAccent}`} />
                              <span className="font-medium text-charcoal">{formatTimeForInput(apt.time)}</span>
                              <span className="text-charcoal-muted">{apt.cliente}</span>
                              <GoogleSyncBadge synced={apt.googleSynced} />
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

          {loading && apiEnabled ? (
            <div className="py-8 text-center">
              <p className="text-sm text-charcoal-muted">Caricamento appuntamenti…</p>
            </div>
          ) : selectedAppointments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-charcoal-muted">Nessun appuntamento in questo giorno</p>
              <button
                type="button"
                onClick={() => openScheduleModal()}
                className={`mt-3 inline-flex text-sm ${b2bLink}`}
              >
                Pianifica una visita →
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedAppointments.map((apt) => (
                <li
                  key={apt.id}
                  draggable={canEditChecklist}
                  onDragStart={() => setDraggingAppointmentId(apt.id)}
                  onDragEnd={() => setDraggingAppointmentId(null)}
                  className="rounded-2xl border border-black/5 bg-white/60 p-3 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-charcoal">
                      <Clock className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
                      {editingAppointmentId === apt.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className={inputClass}
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      ) : (
                        <>
                          <span>{formatTimeForInput(apt.time)}</span>
                          <span>· {apt.cliente}</span>
                        </>
                      )}
                      <GoogleSyncBadge synced={apt.googleSynced} />
                    </div>
                    {canEditChecklist && (
                      <div className="flex shrink-0 gap-1">
                        {editingAppointmentId === apt.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveReschedule(apt)}
                              disabled={savingReschedule === apt.id}
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${b2bPrimaryBtn}`}
                            >
                              Salva
                            </button>
                            <button
                              type="button"
                              onClick={cancelReschedule}
                              className="rounded-full p-1 text-charcoal-muted hover:bg-black/5"
                              aria-label="Annulla modifica"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startReschedule(apt)}
                            className="rounded-full p-1 text-charcoal-muted hover:bg-black/5"
                            aria-label="Modifica orario"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {apt.note && <p className="mt-1 text-xs text-charcoal-muted">{apt.note}</p>}
                  {(Array.isArray(apt.checklist) && apt.checklist.length > 0) || canEditChecklist ? (
                    <ul className="mt-2 space-y-1 border-t border-black/5 pt-2">
                      {(apt.checklist ?? []).map((item) => (
                        <li key={item.id} className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={!canEditChecklist || savingChecklist === apt.id}
                            onClick={() => toggleChecklistItem(apt, item.id)}
                            className="flex flex-1 items-center gap-2 text-left text-xs text-charcoal-muted disabled:opacity-60"
                          >
                            {item.done ? (
                              <CheckSquare className="h-3.5 w-3.5 text-accent-coral" />
                            ) : (
                              <Square className="h-3.5 w-3.5" />
                            )}
                            <span className={item.done ? 'line-through opacity-70' : ''}>
                              {item.label}
                            </span>
                          </button>
                          {canEditChecklist && (
                            <button
                              type="button"
                              disabled={savingChecklist === apt.id}
                              onClick={() => removeChecklistItem(apt, item.id)}
                              className="rounded p-1 text-charcoal-muted hover:bg-black/5 hover:text-accent-coral disabled:opacity-60"
                              aria-label="Rimuovi voce"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </li>
                      ))}
                      {canEditChecklist && (
                        <li className="flex items-center gap-1 pt-1">
                          <input
                            type="text"
                            value={newChecklistLabel}
                            onChange={(e) => setNewChecklistLabel(e.target.value)}
                            placeholder="Nuova voce checklist"
                            className={`flex-1 ${inputClass}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addChecklistItem(apt)
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={!newChecklistLabel.trim() || savingChecklist === apt.id}
                            onClick={() => addChecklistItem(apt)}
                            className={`shrink-0 ${b2bSecondaryBtn} px-2 py-1 text-[10px]`}
                          >
                            Aggiungi
                          </button>
                        </li>
                      )}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ScheduleVisitModal
        key={`${scheduleModalOpen}-${scheduleInitialDate}`}
        clients={crmClients}
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={scheduleVisit}
        initialDate={scheduleInitialDate}
      />
    </div>
  )
}
