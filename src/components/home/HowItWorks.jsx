import { motion } from 'framer-motion'
import { MessageCircle, Search, Handshake } from 'lucide-react'
import Card from '../ui/Card'

const steps = [
  {
    icon: MessageCircle,
    title: 'Rispondi alle domande',
    description: 'Quattro domande essenziali. Meno di tre minuti.',
  },
  {
    icon: Search,
    title: 'Analizziamo le necessità',
    description: 'Autonomia, zona e budget valutati con rigore.',
  },
  {
    icon: Handshake,
    title: 'Solo strutture ideali',
    description: 'Partner verificati, abbinati alle vostre esigenze.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function HowItWorks() {
  return (
    <section id="come-funziona" className="border-t border-zinc-200 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            Come funziona
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={item}>
              <Card className="h-full">
                <span className="mb-6 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold text-[#1A4D2E]">
                  {index + 1}
                </span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A4D2E] text-white">
                  <step.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900">{step.title}</h3>
                <p className="leading-relaxed text-zinc-600">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
