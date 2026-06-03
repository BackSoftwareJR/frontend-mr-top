import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const FAQS = [
  {
    question: 'Quanto costa il servizio Wenando?',
    answer:
      'L\'analisi iniziale è completamente gratuita per le famiglie. Il nostro compenso arriva dalle strutture partner, solo se decidete di procedere con una di esse.',
    accent: 'border-[#E07A5F]/25',
    bg: 'bg-[#E07A5F]/[0.02]',
  },
  {
    question: 'Quanto tempo ci vuole per ricevere le proposte?',
    answer:
      'In media entro 48 ore lavorative. Per situazioni urgenti, segnalatecelo nel modulo e attiviamo la priorità.',
    accent: 'border-[#E9A84A]/25',
    bg: 'bg-[#E9A84A]/[0.03]',
  },
  {
    question: 'Perché non mostrate un catalogo di strutture?',
    answer:
      'Ogni famiglia ha esigenze diverse. Preferiamo analizzare la vostra situazione nel dettaglio prima di consigliare qualsiasi soluzione — così le proposte sono davvero pertinenti.',
    accent: 'border-[#9B8EC4]/25',
    bg: 'bg-[#9B8EC4]/[0.03]',
  },
  {
    question: 'Posso cambiare struttura se non siamo soddisfatti?',
    answer:
      'Assolutamente sì. Vi accompagniamo anche dopo la scelta, senza costi aggiuntivi, finché non trovate la soluzione giusta.',
    accent: 'border-[#E879A0]/25',
    bg: 'bg-[#E879A0]/[0.02]',
  },
]

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white/80 shadow-sm ${faq.accent} ${faq.bg}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/60"
      >
        <span className="font-semibold text-slate-800">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-slate-400"
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
          >
            <p className="border-t border-slate-100/80 px-6 py-4 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section
      id="faq"
      data-scroll-anchor="faq"
      data-scroll-label="FAQ"
      className="relative overflow-x-clip px-6 py-20 sm:py-28"
    >
      <SectionBlob variant="violet" shape="circle" position="top-left" />
      <SectionBlob variant="rose" shape="wave" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9B8EC4]/25 bg-[#9B8EC4]/8 px-4 py-1.5">
            <HelpCircle className="h-4 w-4 text-[#9B8EC4]" />
            <span className="text-xs font-semibold tracking-wide text-[#9B8EC4] uppercase">
              Domande frequenti
            </span>
          </div>
          <MulticolorHeading
            as="h2"
            words="Siamo qui per chiarire ogni dubbio"
            className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
            startIndex={0}
          />
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {FAQS.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
