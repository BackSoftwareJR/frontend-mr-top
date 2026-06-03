import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const FAQS = [
  {
    question: 'Quanto costa il servizio Wenando?',
    answer:
      "L'analisi iniziale è completamente gratuita per le famiglie. Il nostro compenso arriva dalle strutture partner, solo se decidete di procedere con una di esse.",
    accent: '#E07A5F',
  },
  {
    question: 'Quanto tempo ci vuole per ricevere le proposte?',
    answer:
      'In media entro 48 ore lavorative. Per situazioni urgenti, segnalatecelo nel modulo e attiviamo la priorità.',
    accent: '#E9A84A',
  },
  {
    question: 'Perché non mostrate un catalogo di strutture?',
    answer:
      'Ogni famiglia ha esigenze diverse. Preferiamo analizzare la vostra situazione nel dettaglio prima di consigliare qualsiasi soluzione — così le proposte sono davvero pertinenti.',
    accent: '#9B8EC4',
  },
  {
    question: 'Posso cambiare struttura se non siamo soddisfatti?',
    answer:
      'Assolutamente sì. Vi accompagniamo anche dopo la scelta, senza costi aggiuntivi, finché non trovate la soluzione giusta.',
    accent: '#E879A0',
  },
]

function FAQItem({ faq, index, isOpen, onToggle }) {
  const step = String(index + 1).padStart(2, '0')

  return (
    <div className="group border-b border-slate-200/80 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 py-6 text-left transition-colors sm:gap-6 sm:py-7"
      >
        <span
          className="mt-0.5 shrink-0 text-xs font-bold tracking-widest tabular-nums transition-colors sm:text-sm"
          style={{ color: isOpen ? faq.accent : '#94a3b8' }}
        >
          {step}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-base font-semibold leading-snug transition-colors sm:text-lg ${
              isOpen ? 'text-slate-900' : 'text-slate-800 group-hover:text-slate-900'
            }`}
          >
            {faq.question}
          </span>
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 shrink-0 text-slate-400"
          style={{ color: isOpen ? faq.accent : undefined }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 pb-6 sm:gap-6 sm:pb-7">
              <span aria-hidden className="w-6 shrink-0 sm:w-8" />
              <p
                className="border-l-2 pl-5 text-sm leading-relaxed text-slate-600 sm:pl-6 sm:text-base"
                style={{ borderColor: `${faq.accent}55` }}
              >
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      id="faq"
      data-scroll-anchor="faq"
      data-scroll-label="FAQ"
      className="relative overflow-x-clip px-6 py-20 sm:py-28"
    >
      <SectionBlob variant="violet" shape="circle" position="top-left" />
      <SectionBlob variant="rose" shape="wave" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16 xl:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:sticky lg:top-28 lg:text-left"
          >
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Domande frequenti
            </p>
            <MulticolorHeading
              as="h2"
              words="Siamo qui per chiarire ogni dubbio"
              className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
              startIndex={0}
            />
            <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-slate-600 lg:mx-0">
              Risposte dirette, senza tecnicismi. Se non trovi quello che cerchi,
              scrivici — rispondiamo sempre.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="border-t border-slate-200/80">
              {FAQS.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
