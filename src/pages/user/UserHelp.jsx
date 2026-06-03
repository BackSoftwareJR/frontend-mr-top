import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, User } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import BookingSheet from '../../components/results/BookingSheet'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const ELENA = {
  name: 'Elena',
  role: 'Consulente pari',
}

const FAQS = [
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

function FAQItem({ faq, isOpen, onToggle }) {
  const prefersReducedMotion = useReducedMotion()
  const accordionTransition = prefersReducedMotion ? { duration: 0 } : spring

  return (
    <div className="border-b border-black/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-[3rem] w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span className="text-base font-semibold text-slate-800">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={accordionTransition}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={accordionTransition}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-base leading-relaxed text-slate-600 sm:px-6">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function UserHelp() {
  const [openIndex, setOpenIndex] = useState(0)
  const [bookingOpen, setBookingOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Aiuto
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Siamo qui per accompagnarti, passo dopo passo.
        </p>
      </header>

      <GlassCard
        hover={false}
        className="overflow-hidden rounded-3xl border-black/[0.06] bg-white/70 p-0 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row">
          <div
            className="flex items-center justify-center bg-gradient-to-br from-teal-800/[0.04] via-teal-800/[0.07] to-stone-100/40 px-8 py-10 sm:w-40 sm:shrink-0"
            aria-hidden
          >
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-[0_4px_16px_rgba(15,23,42,0.06)] backdrop-blur-md">
              <User className="h-8 w-8 text-teal-800/55" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-6 py-6 sm:px-8 sm:py-8">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-teal-800/90">
              {ELENA.role} · {ELENA.name}
            </p>
            <p className="mb-6 max-w-lg text-base leading-relaxed text-slate-800">
              Non sei solo. Parla con chi ci è già passato. Prenota una chiamata gratuita di 15
              minuti con il tuo consulente personale.
            </p>
            <motion.button
              type="button"
              onClick={() => setBookingOpen(true)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={spring}
              className="inline-flex min-h-[3rem] w-fit items-center rounded-full border border-teal-800/15 bg-teal-800/[0.06] px-5 py-3 text-sm font-medium text-teal-800 transition-colors hover:border-teal-800/25 hover:bg-teal-800/[0.1]"
            >
              Scegli orario
            </motion.button>
          </div>
        </div>
      </GlassCard>

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Domande frequenti
        </h2>
        <GlassCard
          hover={false}
          className="overflow-hidden rounded-3xl border-black/[0.06] bg-white/75 p-0 shadow-[0_4px_24px_rgba(15,23,42,0.04)]"
        >
          {FAQS.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </GlassCard>
      </section>

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        advisorName={ELENA.name}
      />
    </div>
  )
}
