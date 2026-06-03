import { motion } from 'framer-motion'
import { Brain, Sparkles, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const STEPS = [
  {
    icon: Brain,
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    iconBg: 'bg-[#E07A5F]/10',
    iconColor: 'text-[#E07A5F]',
    borderAccent: 'hover:border-[#E07A5F]/40',
    topBar: 'bg-[#E07A5F]',
  },
  {
    icon: Target,
    title: 'Match',
    description:
      'Il motore confronta centinaia di strutture verificate e seleziona le più compatibili.',
    iconBg: 'bg-[#9B8EC4]/10',
    iconColor: 'text-[#9B8EC4]',
    borderAccent: 'hover:border-[#9B8EC4]/40',
    topBar: 'bg-[#9B8EC4]',
  },
  {
    icon: Sparkles,
    title: 'Soluzione',
    description:
      'Ricevi proposte personalizzate con trasparenza su costi, servizi e disponibilità.',
    iconBg: 'bg-[#5CB8A8]/10',
    iconColor: 'text-[#5CB8A8]',
    borderAccent: 'hover:border-[#5CB8A8]/40',
    topBar: 'bg-[#5CB8A8]',
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
      className="mt-24 w-full max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.p
        variants={cardVariants}
        className="mb-8 text-sm font-semibold tracking-widest text-slate-400 uppercase"
      >
        Come funziona
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <motion.div key={step.title} variants={cardVariants}>
              <GlassCard
                className={`group relative h-full overflow-hidden p-6 text-left transition-colors sm:p-8 ${step.borderAccent}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${step.topBar} opacity-60`} />
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
