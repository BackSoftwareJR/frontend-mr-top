import { motion } from 'framer-motion'
import { Award, ShieldCheck, Target, Heart, Star } from 'lucide-react'
import MeshGradientBackground from '../ui/MeshGradientBackground'

const pillars = [
  {
    icon: Award,
    title: 'Solo partner verificati',
    description:
      "Come una guida Michelin per l'assistenza: selezioniamo solo strutture che rispettano i nostri standard di qualità.",
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
    <MeshGradientBackground className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-peach/30 bg-gradient-to-br from-coral via-coral-deep to-teal-warm p-8 shadow-[0_24px_60px_-16px_rgb(255_107_74/0.45)] sm:p-12 lg:p-16"
        >
          <div className="mb-12 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
              <Star className="h-4 w-4 fill-sunny text-sunny" />
              Perché CareAdvisor
            </span>
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
              La guida Michelin dell&apos;assistenza
            </h2>
            <p className="text-lg font-medium leading-relaxed text-white/90">
              Non siamo un elenco telefonico di strutture. Siamo un filtro di qualità
              che vi connette solo con partner verificati, abbinati alle vostre
              necessità reali — autonomia, zona, budget e molto altro.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-[2rem] border border-white/20 bg-white/15 p-6 backdrop-blur-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-sunny/90 text-coral-deep shadow-[0_8px_20px_-4px_rgb(255_233_168/0.6)]">
                  <pillar.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{pillar.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-white/85">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MeshGradientBackground>
  )
}
