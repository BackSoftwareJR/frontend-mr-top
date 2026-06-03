import { motion } from 'framer-motion'
import { Heart, Search, UserCheck } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import GlassCard from '../ui/GlassCard'
import MagneticButton from '../ui/MagneticButton'

const POINTS = [
  {
    icon: Heart,
    title: 'Ascoltiamo prima di consigliare',
    description:
      'Ogni famiglia vive una storia unica. Non partiamo da un catalogo, ma dalle vostre esigenze reali.',
    iconBg: 'bg-[#E07A5F]/12',
    iconColor: 'text-[#E07A5F]',
    cardTint: 'bg-[#E07A5F]/[0.03]',
    border: 'border-[#E07A5F]/15',
  },
  {
    icon: Search,
    title: 'Analisi caso per caso',
    description:
      'Studiamo autonomia, budget, zone e tempistiche prima di proporti qualsiasi soluzione concreta.',
    iconBg: 'bg-[#9B8EC4]/12',
    iconColor: 'text-[#9B8EC4]',
    cardTint: 'bg-[#9B8EC4]/[0.04]',
    border: 'border-[#9B8EC4]/15',
  },
  {
    icon: UserCheck,
    title: 'Solo dopo, le raccomandazioni',
    description:
      'Le proposte arrivano solo quando abbiamo capito davvero la vostra situazione — con trasparenza e cura.',
    iconBg: 'bg-[#E879A0]/12',
    iconColor: 'text-[#E879A0]',
    cardTint: 'bg-[#E879A0]/[0.03]',
    border: 'border-[#E879A0]/15',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function PersonalizedAnalysisSection() {
  return (
    <section className="relative overflow-x-clip px-6 py-20 sm:py-28">
      <SectionBlob variant="violet" shape="blob" position="top-left" />
      <SectionBlob variant="rose" shape="circle" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9B8EC4]/25 bg-[#9B8EC4]/8 px-4 py-1.5">
            <Heart className="h-4 w-4 text-[#9B8EC4]" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wide text-[#9B8EC4] uppercase">
              Analisi personalizzata
            </span>
          </div>

          <MulticolorHeading
            as="h2"
            words="Ogni famiglia è diversa"
            className="mb-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            startIndex={0}
          />

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Non mostriamo un elenco di strutture. Ogni situazione è unica e merita
            un&apos;analisi individuale prima di qualsiasi raccomandazione — con
            empatia, ascolto e zero pressione.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-5 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {POINTS.map((point) => {
            const Icon = point.icon
            return (
              <motion.div key={point.title} variants={itemVariants}>
                <GlassCard
                  hover={false}
                  className={`h-full border ${point.border} ${point.cardTint} p-7 sm:p-8`}
                >
                  <div
                    className={`mb-5 inline-flex size-14 items-center justify-center overflow-visible rounded-2xl ${point.iconBg} p-3.5`}
                  >
                    <Icon className={`size-6 shrink-0 ${point.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-800">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {point.description}
                  </p>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-14 text-center"
        >
          <MagneticButton to="/wizard">
            Raccontaci la vostra situazione
          </MagneticButton>
          <p className="mt-4 text-sm text-slate-500">
            Gratuito, confidenziale, senza impegno.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
