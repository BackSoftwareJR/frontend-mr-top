import { motion } from 'framer-motion'
import { Award, ShieldCheck, Target, Heart } from 'lucide-react'
import Card from '../ui/Card'

const pillars = [
  {
    icon: Award,
    title: 'Solo partner verificati',
    description:
      'Selezioniamo strutture che rispettano i nostri standard di qualità.',
  },
  {
    icon: Target,
    title: 'Abbinamento su misura',
    description:
      'Solo ciò che ha senso per autonomia, zona e budget.',
  },
  {
    icon: ShieldCheck,
    title: 'Trasparenza totale',
    description:
      'Orientamento gratuito. Nessun costo nascosto.',
  },
  {
    icon: Heart,
    title: 'Empatia al centro',
    description:
      'Vi ascoltiamo con calma, senza fretta e senza pressioni.',
  },
]

export default function WhyUs() {
  return (
    <section className="border-t border-zinc-200 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1A4D2E]">
            Perché CareAdvisor
          </p>
          <h2 className="mb-4 text-3xl font-bold text-zinc-900 sm:text-4xl">
            Autorità, fiducia, calma
          </h2>
          <p className="text-lg leading-relaxed text-zinc-600">
            Non siamo un elenco telefonico. Siamo un filtro di qualità che vi
            connette solo con partner verificati.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Card className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-[#F5F5F0] text-[#1A4D2E]">
                  <pillar.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-zinc-900">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600">
                  {pillar.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
