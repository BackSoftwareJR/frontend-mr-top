import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Calendar, ChevronDown, Clock, MessageCircle, User } from 'lucide-react'
import BookingSheet from '../../components/results/BookingSheet'
import UserLoadError from '../../components/user/UserLoadError'
import { fetchAdvisorBookingsWithFallback, fetchAdvisorWithFallback, cancelAdvisorBooking } from '../../services/advisorService'
import { ApiError, isApiConfigured } from '../../services/apiClient'
import { mockAdvisor } from '../../data/mockMatches'

const spring = { type: 'spring', stiffness: 380, damping: 30 }
const softSpring = { type: 'spring', stiffness: 320, damping: 32 }

const QUICK_QUESTIONS = [
  {
    question: 'Come funziona il servizio?',
    answer:
      'Compili un breve questionario sulla situazione di chi ami. Analizziamo le risposte e selezioniamo le strutture più adatte nella zona indicata. Puoi parlare con un consulente pari in qualsiasi momento, senza impegno.',
  },
  {
    question: 'È davvero gratuito?',
    answer:
      "Sì, per le famiglie l'analisi e l'accompagnamento sono completamente gratuiti. Il nostro compenso arriva dalle strutture partner, solo se decidete di procedere con una di esse.",
  },
  {
    question: 'Come annullo una richiesta?',
    answer:
      'Puoi annullare in qualsiasi momento scrivendo a supporto@wenando.it o parlando con il tuo consulente personale. Non ci sono penali né costi nascosti.',
  },
]

const pageEnter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function ConciergeAvatar() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...softSpring, delay: 0.12 }}
      className="relative mx-auto"
      aria-hidden
    >
      <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-teal-800/10 via-amber-100/30 to-rose-100/20 blur-xl" />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-white/95 via-[#FDFBF7] to-teal-800/[0.04] shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] backdrop-blur-xl sm:h-32 sm:w-32">
        <User className="h-12 w-12 text-teal-800/45 sm:h-14 sm:w-14" strokeWidth={1.25} />
      </div>
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FDFBF7] bg-emerald-500/90 shadow-md"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </motion.span>
    </motion.div>
  )
}

function QuestionAccordion({ item, index, isOpen, onToggle }) {
  const prefersReducedMotion = useReducedMotion()
  const accordionTransition = prefersReducedMotion ? { duration: 0 } : softSpring

  return (
    <motion.div
      layout
      variants={fadeUp}
      className={`overflow-hidden rounded-[2rem] border transition-shadow duration-300 ${
        isOpen
          ? 'border-teal-800/12 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.07)]'
          : 'border-black/[0.05] bg-white/60 shadow-[0_4px_20px_rgba(15,23,42,0.03)]'
      } backdrop-blur-xl`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-[3.5rem] w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${
            isOpen
              ? 'bg-teal-800/[0.1] text-teal-800'
              : 'bg-stone-100/80 text-slate-500'
          }`}
        >
          {index + 1}
        </span>
        <span className="flex-1 text-base font-semibold leading-snug text-slate-800">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={accordionTransition}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            isOpen ? 'bg-teal-800/[0.08] text-teal-800' : 'bg-stone-100/70 text-slate-400'
          }`}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={accordionTransition}
            className="overflow-hidden"
          >
            <motion.p
              initial={prefersReducedMotion ? false : { y: -6 }}
              animate={{ y: 0 }}
              transition={accordionTransition}
              className="border-t border-black/[0.04] px-5 pb-6 pt-1 text-base leading-relaxed text-slate-600 sm:px-6"
            >
              {item.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function formatBookingDate(dateValue) {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function BookingList({ title, emptyMessage, bookings, showActions = false, onReschedule, onCancel, actionBusyId }) {
  return (
    <div className="space-y-3">
      <h3 className="px-1 text-sm font-semibold text-slate-700">{title}</h3>
      {bookings.length === 0 ? (
        <p className="rounded-[1.5rem] border border-black/[0.04] bg-white/50 px-5 py-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-start gap-3 rounded-[1.5rem] border border-black/[0.05] bg-white/70 px-5 py-4 shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-teal-800/[0.08] text-teal-800">
                <Calendar className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {formatBookingDate(booking.scheduledDate)} alle {booking.scheduledTime}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  Chiamata con consulente — {booking.name}
                </p>
                {booking.leadTitle ? (
                  <p className="mt-1 text-xs text-slate-500">Ricerca: {booking.leadTitle}</p>
                ) : null}
                {showActions ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onReschedule?.(booking)}
                      disabled={actionBusyId === booking.id}
                      className="rounded-full border border-teal-800/15 bg-teal-800/[0.06] px-3 py-1.5 text-xs font-medium text-teal-800 transition-colors hover:bg-teal-800/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Sposta
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancel?.(booking)}
                      disabled={actionBusyId === booking.id}
                      className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionBusyId === booking.id ? 'Annullamento…' : 'Annulla'}
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function UserHelp() {
  const [openIndex, setOpenIndex] = useState(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [advisor, setAdvisor] = useState(mockAdvisor)
  const [bookings, setBookings] = useState({ upcoming: [], past: [] })
  const [bookingsLoading, setBookingsLoading] = useState(() => isApiConfigured())
  const [bookingsLoadError, setBookingsLoadError] = useState(null)
  const [bookingsRetryCount, setBookingsRetryCount] = useState(0)
  const [advisorLoadError, setAdvisorLoadError] = useState(null)
  const [advisorRetryCount, setAdvisorRetryCount] = useState(0)
  const [bookingActionBusyId, setBookingActionBusyId] = useState(null)
  const [rescheduleBooking, setRescheduleBooking] = useState(null)
  const prefersReducedMotion = useReducedMotion()

  const refreshBookings = () => setBookingsRetryCount((n) => n + 1)

  useEffect(() => {
    let cancelled = false

    async function loadAdvisor() {
      if (isApiConfigured()) setAdvisorLoadError(null)
      try {
        const profile = await fetchAdvisorWithFallback()
        if (!cancelled) setAdvisor(profile)
      } catch (err) {
        if (!cancelled && isApiConfigured()) {
          setAdvisorLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare il consulente. Verifica la connessione e riprova.',
          )
        }
      }
    }

    loadAdvisor()
    return () => {
      cancelled = true
    }
  }, [advisorRetryCount])

  useEffect(() => {
    if (!isApiConfigured()) return undefined

    let cancelled = false

    async function load() {
      setBookingsLoading(true)
      setBookingsLoadError(null)
      try {
        const data = await fetchAdvisorBookingsWithFallback()
        if (!cancelled) setBookings(data)
      } catch (err) {
        if (!cancelled) {
          setBookingsLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare le consulenze. Verifica la connessione e riprova.',
          )
        }
      } finally {
        if (!cancelled) setBookingsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [bookingsRetryCount])

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Annullare la consulenza del ${formatBookingDate(booking.scheduledDate)} alle ${booking.scheduledTime}?`,
    )
    if (!confirmed) return

    setBookingActionBusyId(booking.id)
    try {
      await cancelAdvisorBooking(booking.id)
      refreshBookings()
    } catch {
      window.alert('Non siamo riusciti ad annullare la consulenza. Riprova tra poco.')
    } finally {
      setBookingActionBusyId(null)
    }
  }

  const handleRescheduleBooking = (booking) => {
    setRescheduleBooking(booking)
  }

  const motionVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : pageEnter
  const childVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : fadeUp
  const listVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : stagger

  return (
    <motion.div
      className="space-y-10"
      variants={motionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={childVariants}>
        <div className="flex items-center gap-2.5 text-teal-800/80">
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span className="text-sm font-medium tracking-wide">Human Concierge</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Parla con Noi
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
          Una persona reale, non un bot. Siamo qui per ascoltarti con calma.
        </p>
      </motion.header>

      {advisorLoadError ? (
        <UserLoadError
          message={advisorLoadError}
          onRetry={() => setAdvisorRetryCount((n) => n + 1)}
        />
      ) : null}

      <motion.section variants={childVariants} className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white/70 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-8">
          <ConciergeAvatar />

          <div className="mt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800/75">
              {advisor.role}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 sm:text-[1.65rem]">
              Il tuo Consulente Personale
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
              Non sei solo in questa scelta. {advisor.name} ha affrontato la stessa situazione l&apos;anno
              scorso. Prenota una chiamata gratuita per farti consigliare.
            </p>
          </div>

          <motion.div
            className="mt-8 flex justify-center"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={spring}
          >
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center gap-2.5 rounded-[2rem] bg-teal-800 px-6 py-3.5 text-base font-semibold text-white shadow-[0_8px_28px_rgba(13,94,89,0.28)] transition-shadow hover:shadow-[0_12px_36px_rgba(13,94,89,0.32)] sm:w-auto sm:min-w-[16rem]"
            >
              <Calendar className="h-5 w-5" strokeWidth={2} aria-hidden />
              Scegli Orario (15 min)
            </button>
          </motion.div>
        </div>
      </motion.section>

      {isApiConfigured() ? (
        <motion.section variants={childVariants} className="space-y-5">
          <div className="px-1">
            <h2 className="text-lg font-semibold text-slate-800">Le tue consulenze</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Chiamate prenotate con il consulente personale.
            </p>
          </div>

          {bookingsLoadError && !bookingsLoading ? (
            <UserLoadError
              message={bookingsLoadError}
              onRetry={() => setBookingsRetryCount((n) => n + 1)}
            />
          ) : bookingsLoading ? (
            <p className="rounded-[1.5rem] border border-black/[0.04] bg-white/50 px-5 py-4 text-sm text-slate-500">
              Caricamento appuntamenti…
            </p>
          ) : (
            <div className="space-y-6">
              <BookingList
                title="Prossime"
                emptyMessage="Nessuna consulenza in programma."
                bookings={bookings.upcoming}
                showActions
                actionBusyId={bookingActionBusyId}
                onReschedule={handleRescheduleBooking}
                onCancel={handleCancelBooking}
              />
              {bookings.past.length > 0 ? (
                <BookingList
                  title="Passate"
                  emptyMessage="Nessuna consulenza passata."
                  bookings={bookings.past}
                />
              ) : null}
            </div>
          )}
        </motion.section>
      ) : null}

      <motion.section variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={childVariants} className="px-1">
          <h2 className="text-lg font-semibold text-slate-800">Domande veloci</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Risposte brevi, senza formalismi. Per tutto il resto, parla con {advisor.name}.
          </p>
        </motion.div>

        <div className="space-y-3">
          {QUICK_QUESTIONS.map((item, index) => (
            <QuestionAccordion
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </motion.section>

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        advisorName={advisor.name}
        onSuccess={refreshBookings}
      />

      <BookingSheet
        open={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        advisorName={advisor.name}
        mode="reschedule"
        bookingId={rescheduleBooking?.id}
        defaultDate={rescheduleBooking?.scheduledDate ?? ''}
        defaultTime={rescheduleBooking?.scheduledTime ?? ''}
        onSuccess={() => {
          setRescheduleBooking(null)
          refreshBookings()
        }}
      />
    </motion.div>
  )
}
