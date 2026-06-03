import { motion } from 'framer-motion'
import { Clock, Heart, Shield, Users } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const STATS = [
  {
    icon: Users,
    value: '500+',
    label: 'Famiglie aiutate',
    iconBg: 'bg-[#E07A5F]/12',
    iconColor: 'text-[#E07A5F]',
    valueColor: 'text-[#E07A5F]',
    cardTint: 'bg-[#E07A5F]/[0.03]',
    border: 'border-[#E07A5F]/12',
  },
  {
    icon: Clock,
    value: '48h',
    label: 'Risposta media',
    iconBg: 'bg-[#E9A84A]/12',
    iconColor: 'text-[#E9A84A]',
    valueColor: 'text-[#E9A84A]',
    cardTint: 'bg-[#E9A84A]/[0.04]',
    border: 'border-[#E9A84A]/12',
  },
  {
    icon: Shield,
    value: '120+',
    label: 'Strutture verificate',
    iconBg: 'bg-[#9B8EC4]/12',
    iconColor: 'text-[#9B8EC4]',
    valueColor: 'text-[#9B8EC4]',
    cardTint: 'bg-[#9B8EC4]/[0.04]',
    border: 'border-[#9B8EC4]/12',
  },
  {
    icon: Heart,
    value: '4.9',
    label: 'Soddisfazione media',
    iconBg: 'bg-[#E879A0]/12',
    iconColor: 'text-[#E879A0]',
    valueColor: 'text-[#E879A0]',
    cardTint: 'bg-[#E879A0]/[0.03]',
    border: 'border-[#E879A0]/12',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function StatsSection() {
  return (
    <section
      id="stats"
      data-scroll-anchor="stats"
      data-scroll-label="Numeri"
      className="relative overflow-x-clip px-6 py-20 sm:py-24"
    >
      <SectionBlob variant="amber" shape="ring" position="top-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <MulticolorHeading
            as="h2"
            words="Numeri che contano davvero"
            className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
            startIndex={2}
          />
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={itemVariants}>
                <GlassCard
                  hover={false}
                  className={`border ${stat.border} ${stat.cardTint} p-6 text-center`}
                >
                  <div
                    className={`mx-auto mb-4 inline-flex size-14 items-center justify-center overflow-visible rounded-2xl ${stat.iconBg} p-3.5`}
                  >
                    <Icon className={`size-6 shrink-0 ${stat.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <p className={`text-3xl font-extrabold ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
