import { motion } from 'framer-motion'
import { Clock, Heart, Shield, Users } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const STATS = [
  {
    icon: Users,
    value: '500+',
    label: 'Famiglie aiutate',
    iconBg: 'bg-[#E07A5F]/10',
    iconColor: 'text-[#E07A5F]',
    valueColor: 'text-[#E07A5F]',
  },
  {
    icon: Clock,
    value: '48h',
    label: 'Risposta media',
    iconBg: 'bg-[#E9A84A]/10',
    iconColor: 'text-[#E9A84A]',
    valueColor: 'text-[#E9A84A]',
  },
  {
    icon: Shield,
    value: '120+',
    label: 'Strutture verificate',
    iconBg: 'bg-[#9B8EC4]/10',
    iconColor: 'text-[#9B8EC4]',
    valueColor: 'text-[#9B8EC4]',
  },
  {
    icon: Heart,
    value: '4.9',
    label: 'Soddisfazione media',
    iconBg: 'bg-[#5CB8A8]/10',
    iconColor: 'text-[#5CB8A8]',
    valueColor: 'text-[#5CB8A8]',
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
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
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
                <GlassCard className="p-6 text-center">
                  <div
                    className={`mx-auto mb-4 inline-flex rounded-2xl ${stat.iconBg} p-3`}
                  >
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} strokeWidth={1.75} />
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
