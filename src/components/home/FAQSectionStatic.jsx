import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import { FAQ_ITEMS } from '../../constants/siteCopy'

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

        <span
          className={`mt-1 shrink-0 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isOpen ? faq.accent : undefined }}
        >
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

      {isOpen ? (
        <div className="overflow-hidden">
          <div className="flex gap-4 pb-6 sm:gap-6 sm:pb-7">
            <span aria-hidden className="w-6 shrink-0 sm:w-8" />
            <p
              className="border-l-2 pl-5 text-sm leading-relaxed text-slate-600 sm:pl-6 sm:text-base"
              style={{ borderColor: `${faq.accent}55` }}
            >
              {faq.answer}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function FAQSectionStatic() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      id="faq"
      data-scroll-anchor="faq"
      data-scroll-label="FAQ"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="violet" shape="circle" position="top-left" />
      <SectionBlob variant="rose" shape="wave" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16 xl:gap-24">
          <div className="text-center lg:sticky lg:top-28 lg:text-left">
            <MulticolorHeading
              as="h2"
              words="Domande frequenti"
              className="text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-3xl"
              startIndex={0}
            />
          </div>

          <div className="border-t border-slate-200/80">
            {FAQ_ITEMS.map((faq, index) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
