import { motion } from 'framer-motion'
import { Brain, Sparkles, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const STEPS = [
  {
    icon: Brain,
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    gradient: 'from-purple-500/30 to-pink-500/20',
    delay: 0,
  },
  {
    icon: Target,
    title: 'Match',
    description:
      'Il motore confronta centinaia di strutture verificate e seleziona le più compatibili.',
    gradient: 'from-teal-400/30 to-cyan-500/20',
    delay: 0.1,
  },
  {
    icon: Sparkles,
    title: 'Soluzione',
    description:
      'Ricevi proposte personalizzate con trasparenza su costi, servizi e disponibilità.',
    gradient: 'from-rose-400/30 to-orange-500/20',
    delay: 0.2,
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
        className="mb-8 text-sm font-semibold tracking-widest text-white/40 uppercase"
      >
        Come funziona
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <motion.div key={step.title} variants={cardVariants}>
              <GlassCard className="group h-full p-6 text-left sm:p-8">
                <div
                  className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${step.gradient} p-3`}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">
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
