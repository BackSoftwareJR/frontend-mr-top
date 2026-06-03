import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Calendar, Clock } from 'lucide-react'
import InfoDrawer from '../ui/InfoDrawer'

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

export default function BookingSheet({ open, onClose, defaultName = '', advisorName = 'Marco' }) {
  const [step, setStep] = useState('form')
  const [name, setName] = useState(defaultName)
  const days = useMemo(() => getNextDays(), [])
  const [date, setDate] = useState(() => days[0]?.value ?? '')
  const [time, setTime] = useState(TIME_SLOTS[1])

  useEffect(() => {
    if (open) {
      setStep('form')
      setName(defaultName)
      setDate(days[0]?.value ?? '')
      setTime(TIME_SLOTS[1])
    }
  }, [open, defaultName, days])

  const selectedDay = days.find((d) => d.value === date)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !date || !time) return
    setStep('success')
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => setStep('form'), 300)
  }

  return (
    <InfoDrawer open={open} onClose={handleClose} title="Prenota chiamata">
      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-600">
            Scegli un momento per parlare con {advisorName}. Chiamata gratuita, 15 minuti, senza impegno.
          </p>

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

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="w-full rounded-xl border border-teal-800/20 bg-teal-800/[0.06] px-4 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/30 hover:bg-teal-800/[0.1]"
          >
            Conferma prenotazione
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
            <h3 className="mb-1.5 text-base font-semibold text-slate-800">Prenotazione confermata</h3>
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
