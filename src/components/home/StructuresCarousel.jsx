import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import ImageCarousel from '../ui/ImageCarousel'

const STRUCTURES = [
  {
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
    title: 'Residenza Aurora — Milano',
    description: 'Struttura verificata con assistenza 24h e giardino terapeutico.',
    tag: 'Verificata',
  },
  {
    image: 'https://images.unsplash.com/photo-1576765608535-5f04a832e717?w=1200&q=80',
    title: 'Casa del Benessere — Roma',
    description: 'Ambiente familiare con programmi di riabilitazione personalizzati.',
    tag: 'Top rated',
  },
  {
    image: 'https://images.unsplash.com/photo-1581579438749-659c99c064b6?w=1200&q=80',
    title: 'Villa Serenità — Torino',
    description: 'Spazi luminosi, cucina casalinga e attività sociali quotidiane.',
    tag: 'Verificata',
  },
  {
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80',
    title: 'Centro Vita Attiva — Bologna',
    description: 'Specializzato in demenza e Alzheimer con staff medico dedicato.',
    tag: 'Specialistica',
  },
]

export default function StructuresCarousel() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E07A5F]/20 bg-[#E07A5F]/5 px-4 py-1.5">
            <Building2 className="h-4 w-4 text-[#E07A5F]" />
            <span className="text-xs font-semibold tracking-wide text-[#E07A5F] uppercase">
              Strutture verificate
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Luoghi dove{' '}
            <span className="text-gradient-multicolor">sentirsi a casa</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Ogni struttura è visitata e valutata dal nostro team. Solo le migliori
            entrano nel nostro network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ImageCarousel items={STRUCTURES} />
        </motion.div>
      </div>
    </section>
  )
}
