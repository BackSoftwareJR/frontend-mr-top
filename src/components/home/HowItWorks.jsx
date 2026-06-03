import { motion } from 'framer-motion'
import { MessageCircle, Search, Handshake } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    title: 'Rispondi alle domande',
    description:
      'Quattro domande semplici sulle vostre esigenze. Ci vogliono meno di 3 minuti.',
  },
  {
    icon: Search,
    title: 'Analizziamo le necessità',
    description:
      'Il nostro motore di analisi valuta autonomia, zona, budget e preferenze con attenzione.',
  },
  {
    icon: Handshake,
    title: 'Ti colleghiamo solo con le strutture ideali',
    description:
      'Niente liste infinite: solo partner verificati che corrispondono davvero a ciò che cercate.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function HowItWorks() {
  return (
    <section id="come-funziona" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Come funziona
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
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
            <motion.div
              key={step.title}
              variants={item}
              className="group relative rounded-3xl bg-white/80 p-8 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
            >
              <span className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-800">
                {index + 1}
              </span>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md shadow-teal-900/20 transition-transform group-hover:scale-105">
                <step.icon className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="leading-relaxed text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
