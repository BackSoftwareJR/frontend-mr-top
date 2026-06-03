import { motion } from 'framer-motion'
import { Award, BadgeCheck, Handshake, Landmark } from 'lucide-react'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

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
  'text-[#E879A0]',
  'text-[#5CB8A8]',
  'text-[#E07A5F]',
]

const BADGE_BGS = [
  'bg-[#E07A5F]/8',
  'bg-[#E9A84A]/8',
  'bg-[#9B8EC4]/8',
  'bg-[#E879A0]/8',
  'bg-[#5CB8A8]/8',
  'bg-[#E07A5F]/8',
]

export default function TrustPartnersSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200/50 bg-gradient-to-b from-white/60 via-[#E9A84A]/[0.03] to-white/60 px-6 py-20 backdrop-blur-sm">
      <SectionBlob variant="amber" shape="ring" position="center" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <MulticolorHeading
            as="h2"
            words="Partner e riconoscimenti"
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
            startIndex={1}
          />
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
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
                className={`flex items-center gap-2.5 rounded-full px-4 py-2 ${BADGE_BGS[index % BADGE_BGS.length]} opacity-80 transition-opacity hover:opacity-100`}
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
