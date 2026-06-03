import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import MagneticButton from '../ui/MagneticButton'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <SectionBlob variant="coral" shape="wave" position="bottom-left" />
      <SectionBlob variant="amber" shape="ring" position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-[#E07A5F]/20 bg-gradient-to-br from-[#E07A5F]/8 via-white/90 to-[#E9A84A]/8 px-8 py-14 text-center shadow-sm backdrop-blur-sm sm:px-12 sm:py-16"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E07A5F]/25 bg-white/80 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-[#E9A84A]" strokeWidth={2} />
          <span className="text-xs font-semibold tracking-wide text-[#E07A5F] uppercase">
            Pronti ad aiutarvi
          </span>
        </div>

        <MulticolorHeading
          as="h2"
          words="Iniziamo dal vostro caso"
          className="mb-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
          startIndex={1}
        />

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-600">
          Raccontateci la vostra situazione. Analizzeremo ogni dettaglio con cura
          prima di suggerirvi la strada giusta — senza cataloghi, senza fretta.
        </p>

        <MagneticButton to="/wizard">Inizia l&apos;analisi gratuita</MagneticButton>
      </motion.div>
    </section>
  )
}
