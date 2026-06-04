import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Calendar, Clock, Loader2 } from 'lucide-react'
import InfoDrawer from '../ui/InfoDrawer'
import { createAdvisorBooking, rescheduleAdvisorBooking } from '../../services/advisorService'
import { getBearerToken, isApiConfigured } from '../../services/apiClient'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const TIME_SLOTS = ['09:00', '10:30', '14:00', '16:30']

function getNextDays(count = 5) {
  const days = []
  const formatter = new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  for (let i = 1; i <= count; i += 1) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    days.push({
      value: date.toISOString().slice(0, 10),
      label: formatter.format(date),
    })
  }
  return days
}

const inputClass =
  'w-full rounded-xl border border-slate-200/60 bg-white/60 px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:border-teal-800/30 focus:outline-none focus:ring-2 focus:ring-teal-800/10'

export default function BookingSheet({
  open,
  onClose,
  defaultName = '',
  advisorName = 'Marco',
  leadUuid,
  onSuccess,
  mode = 'create',
  bookingId,
  defaultDate = '',
  defaultTime = '',
}) {
  const isReschedule = mode === 'reschedule'
  const [step, setStep] = useState('form')
  const [name, setName] = useState(defaultName)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const days = useMemo(() => getNextDays(), [])
  const [date, setDate] = useState(() => defaultDate || days[0]?.value || '')
  const [time, setTime] = useState(() => defaultTime || TIME_SLOTS[1])
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setStep('form')
      setName(defaultName)
      setDate(defaultDate || days[0]?.value || '')
      setTime(defaultTime || TIME_SLOTS[1])
      setSubmitting(false)
      setSubmitError('')
    }
  }

  const selectedDay = days.find((d) => d.value === date)
  const needsLogin = isApiConfigured() && !getBearerToken()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!isReschedule && !name.trim()) || !date || !time || submitting) return

    if (needsLogin) {
      setSubmitError('Accedi al tuo account per prenotare una chiamata con il consulente.')
      return
    }

    const canUseApi = isApiConfigured() && getBearerToken()

    if (canUseApi) {
      setSubmitting(true)
      setSubmitError('')
      try {
        if (isReschedule) {
          await rescheduleAdvisorBooking({
            bookingId,
            scheduledDate: date,
            scheduledTime: time,
          })
        } else {
          await createAdvisorBooking({
            name: name.trim(),
            scheduledDate: date,
            scheduledTime: time,
            leadUuid,
          })
        }
        onSuccess?.()
        setStep('success')
      } catch {
        setSubmitError(
          isReschedule
            ? 'Non siamo riusciti a spostare la consulenza. Riprova tra poco.'
            : 'Non siamo riusciti a confermare la prenotazione. Riprova tra poco.',
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    setStep('success')
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => setStep('form'), 300)
  }

  return (
    <InfoDrawer
      open={open}
      onClose={handleClose}
      title={isReschedule ? 'Sposta consulenza' : 'Prenota chiamata'}
    >
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-600">
            {isReschedule
              ? `Scegli un nuovo orario per la chiamata con ${advisorName}.`
              : `Scegli un momento per parlare con ${advisorName}. Chiamata gratuita, 15 minuti, senza impegno.`}
          </p>

          {needsLogin && !isReschedule ? (
            <p
              className="rounded-xl border border-amber-200/70 bg-amber-50/90 px-3.5 py-2.5 text-sm leading-relaxed text-amber-950"
              role="status"
            >
              <Link to="/accedi" className="font-semibold text-teal-800 underline underline-offset-2">
                Accedi
              </Link>{' '}
              al tuo account per prenotare una chiamata con il consulente.
            </p>
          ) : null}

          {!isReschedule ? (
            <div>
              <label htmlFor="booking-name" className="mb-1.5 block text-xs font-medium text-slate-500">
                Il tuo nome
              </label>
              <input
                id="booking-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
                required
                className={inputClass}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="booking-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
              Data
            </label>
            <select
              id="booking-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            >
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="booking-time" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
              Orario
            </label>
            <select
              id="booking-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className={inputClass}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {submitError ? (
            <p className="text-sm text-rose-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <motion.button
            type="submit"
            disabled={submitting || needsLogin}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
            transition={spring}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-800/20 bg-teal-800/[0.06] px-4 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/30 hover:bg-teal-800/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
                Invio in corso…
              </>
            ) : (
              isReschedule ? 'Conferma nuovo orario' : 'Conferma prenotazione'
            )}
          </motion.button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="space-y-5 py-2 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/60 bg-emerald-50/80">
            <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="mb-1.5 text-base font-semibold text-slate-800">
              {isReschedule ? 'Orario aggiornato' : 'Prenotazione confermata'}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {advisorName} ti chiamerà il{' '}
              <span className="font-medium text-slate-700">{selectedDay?.label}</span> alle{' '}
              <span className="font-medium text-slate-700">{time}</span>.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={handleClose}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
          >
            Chiudi
          </motion.button>
        </motion.div>
      )}
    </InfoDrawer>
  )
}
