import { motion } from 'framer-motion'
import { Award, BadgeCheck, Handshake, Landmark } from 'lucide-react'

const PARTNERS = [
  { name: 'Regione Lombardia', icon: Landmark },
  { name: 'ANASTE', icon: Handshake },
  { name: 'Federanziani', icon: BadgeCheck },
  { name: 'Quality Care', icon: Award },
  { name: 'Salute Italia', icon: BadgeCheck },
  { name: 'CNA Senior', icon: Handshake },
]

const ACCENT_COLORS = [
  'text-[#E07A5F]',
  'text-[#E9A84A]',
  'text-[#9B8EC4]',
  'text-[#5CB8A8]',
  'text-[#E07A5F]',
  'text-[#9B8EC4]',
]

export default function TrustPartnersSection() {
  return (
    <section className="border-y border-slate-200/60 bg-white/50 px-6 py-16 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-sm font-semibold tracking-widest text-slate-400 uppercase"
        >
          Partner e riconoscimenti
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {PARTNERS.map((partner, index) => {
            const Icon = partner.icon
            return (
              <div
                key={partner.name}
                className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100"
              >
                <Icon
                  className={`h-5 w-5 ${ACCENT_COLORS[index % ACCENT_COLORS.length]}`}
                  strokeWidth={1.75}
                />
                <span className="text-sm font-semibold text-slate-600">{partner.name}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
