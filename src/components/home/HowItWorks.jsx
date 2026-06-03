import { motion } from 'framer-motion'
import { MessageCircle, Search, Handshake } from 'lucide-react'
import Card from '../ui/Card'
import MeshGradientBackground from '../ui/MeshGradientBackground'

const steps = [
  {
    icon: MessageCircle,
    title: 'Rispondi alle domande',
    description:
      'Quattro domande semplici sulle vostre esigenze. Ci vogliono meno di 3 minuti.',
    cardVariant: 'warm',
    iconBg: 'from-coral to-coral-deep',
  },
  {
    icon: Search,
    title: 'Analizziamo le necessità',
    description:
      'Il nostro motore di analisi valuta autonomia, zona, budget e preferenze con attenzione.',
    cardVariant: 'sunny',
    iconBg: 'from-sunny to-coral',
  },
  {
    icon: Handshake,
    title: 'Ti colleghiamo solo con le strutture ideali',
    description:
      'Niente liste infinite: solo partner verificati che corrispondono davvero a ciò che cercate.',
    cardVariant: 'teal',
    iconBg: 'from-teal-warm to-teal-deep',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function HowItWorks() {
  return (
    <section id="come-funziona">
    <MeshGradientBackground className="px-4 py-24 sm:px-6" intensity="subtle">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-extrabold text-warm-text sm:text-4xl">
            Come funziona
          </h2>
          <p className="mx-auto max-w-xl text-lg font-medium text-warm-muted">
            Un percorso semplice, pensato per accompagnarvi con calma in ogni passo.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={item}>
              <Card variant={step.cardVariant} className="group h-full">
                <span className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-sm font-extrabold text-coral shadow-peach">
                  {index + 1}
                </span>
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${step.iconBg} text-white shadow-coral transition-transform group-hover:scale-110`}
                >
                  <step.icon className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-warm-text">{step.title}</h3>
                <p className="font-medium leading-relaxed text-warm-muted">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MeshGradientBackground>
    </section>
  )
}
