import { motion } from 'framer-motion'
import { Award, ShieldCheck, Target, Heart } from 'lucide-react'

const pillars = [
  {
    icon: Award,
    title: 'Solo partner verificati',
    description:
      'Come una guida Michelin per l\'assistenza: selezioniamo solo strutture che rispettano i nostri standard di qualità.',
  },
  {
    icon: Target,
    title: 'Abbinamento su misura',
    description:
      'Non vi proponiamo tutto ciò che esiste, ma solo ciò che ha senso per la vostra situazione specifica.',
  },
  {
    icon: ShieldCheck,
    title: 'Trasparenza totale',
    description:
      'Nessun costo nascosto per voi. Il nostro servizio di orientamento è completamente gratuito.',
  },
  {
    icon: Heart,
    title: 'Empatia al centro',
    description:
      'Sappiamo che state affrontando un momento delicato. Vi ascoltiamo, senza fretta e senza pressioni.',
  },
]

export default function WhyUs() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 to-teal-900 p-8 shadow-xl shadow-teal-900/20 sm:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 max-w-2xl"
          >
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-200">
              Perché CareAdvisor
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              La guida Michelin dell&apos;assistenza
            </h2>
            <p className="text-lg leading-relaxed text-teal-100">
              Non siamo un elenco telefonico di strutture. Siamo un filtro di qualità
              che vi connette solo con partner verificati, abbinati alle vostre
              necessità reali — autonomia, zona, budget e molto altro.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                  <pillar.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-teal-100/90">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
