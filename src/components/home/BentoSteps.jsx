import { motion } from 'framer-motion'
import { Brain, Sparkles, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const STEPS = [
  {
    icon: Brain,
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    iconBg: 'bg-[#E07A5F]/12',
    iconColor: 'text-[#E07A5F]',
    borderAccent: 'border-[#E07A5F]/15 hover:border-[#E07A5F]/35',
    cardTint: 'bg-[#E07A5F]/[0.03]',
    topBar: 'bg-[#E07A5F]',
  },
  {
    icon: Target,
    title: 'Valutazione',
    description:
      'Studiamo la vostra situazione nel dettaglio — non un catalogo, ma un match pensato per voi.',
    iconBg: 'bg-[#9B8EC4]/12',
    iconColor: 'text-[#9B8EC4]',
    borderAccent: 'border-[#9B8EC4]/15 hover:border-[#9B8EC4]/35',
    cardTint: 'bg-[#9B8EC4]/[0.04]',
    topBar: 'bg-[#9B8EC4]',
  },
  {
    icon: Sparkles,
    title: 'Soluzione',
    description:
      "Solo dopo l'analisi, proposte personalizzate con trasparenza su costi e servizi.",
    iconBg: 'bg-[#E879A0]/12',
    iconColor: 'text-[#E879A0]',
    borderAccent: 'border-[#E879A0]/15 hover:border-[#E879A0]/35',
    cardTint: 'bg-[#E879A0]/[0.03]',
    topBar: 'bg-[#E879A0]',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function BentoSteps() {
  return (
    <motion.div
      className="relative mt-28 w-full max-w-6xl overflow-hidden rounded-3xl px-2 py-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <SectionBlob variant="teal" shape="wave" position="center" />

      <motion.div variants={cardVariants} className="relative z-10 mb-10 text-center">
        <p className="mb-3 text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Come funziona
        </p>
        <MulticolorHeading
          as="h2"
          words="Tre passi con cura"
          className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
          startIndex={1}
        />
      </motion.div>

      <div className="relative z-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <motion.div key={step.title} variants={cardVariants}>
              <GlassCard
                className={`group relative h-full overflow-hidden border ${step.borderAccent} ${step.cardTint} p-6 text-left transition-colors sm:p-8`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${step.topBar} opacity-70`} />
                <div
                  className={`mb-5 inline-flex rounded-2xl ${step.iconBg} p-3 transition-transform group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${step.iconColor}`} strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-800">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
