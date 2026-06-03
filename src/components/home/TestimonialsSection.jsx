import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const TESTIMONIALS = [
  {
    quote:
      'Dopo mesi di ricerche stressanti, in 48 ore avevamo tre proposte perfette per mia madre. Un sollievo enorme.',
    author: 'Laura M.',
    role: 'Figlia — Milano',
    accent: 'border-l-[#E07A5F]',
    iconColor: 'text-[#E07A5F]',
    iconBg: 'bg-[#E07A5F]/10',
  },
  {
    quote:
      'Il team ci ha ascoltati davvero. Non ci hanno spinto verso la struttura più cara, ma quella più giusta.',
    author: 'Marco e Giulia T.',
    role: 'Nipoti — Roma',
    accent: 'border-l-[#9B8EC4]',
    iconColor: 'text-[#9B8EC4]',
    iconBg: 'bg-[#9B8EC4]/10',
  },
  {
    quote:
      'Papà si è ambientato in una settimana. La struttura scelta aveva esattamente le attività che gli servivano.',
    author: 'Elena R.',
    role: 'Figlia — Torino',
    accent: 'border-l-[#5CB8A8]',
    iconColor: 'text-[#5CB8A8]',
    iconBg: 'bg-[#5CB8A8]/10',
  },
  {
    quote:
      'Trasparenza totale sui costi nascosti. Finalmente qualcuno che parla chiaro in un momento così difficile.',
    author: 'Antonio B.',
    role: 'Figlio — Bologna',
    accent: 'border-l-[#E9A84A]',
    iconColor: 'text-[#E9A84A]',
    iconBg: 'bg-[#E9A84A]/10',
  },
]

export default function TestimonialsSection() {
  const [[index, direction], setSlide] = useState([0, 0])

  const paginate = useCallback((dir) => {
    setSlide(([prev]) => {
      const next = (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length
      return [next, dir]
    })
  }, [])

  const t = TESTIMONIALS[index]

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-slate-400 uppercase">
            Storie di famiglie
          </p>
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Non siamo noi a dirlo
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <GlassCard
                hover={false}
                className={`border-l-4 ${t.accent} p-8 sm:p-10`}
              >
                <div className={`mb-6 inline-flex rounded-2xl ${t.iconBg} p-3`}>
                  <Quote className={`h-6 w-6 ${t.iconColor}`} strokeWidth={1.75} />
                </div>
                <blockquote className="mb-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer>
                  <p className="font-bold text-slate-800">{t.author}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </footer>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-[#E07A5F]/40 hover:text-[#E07A5F]"
              aria-label="Testimonianza precedente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide([i, i > index ? 1 : -1])}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-[#E07A5F]' : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Testimonianza ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => paginate(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-[#E07A5F]/40 hover:text-[#E07A5F]"
              aria-label="Testimonianza successiva"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
