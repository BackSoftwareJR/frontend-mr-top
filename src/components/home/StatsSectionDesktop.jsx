import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import {
  StatMark,
  STATS,
  statsContainerVariants,
  statsItemVariants,
} from './statsShared'

export default function StatsSectionDesktop() {
  return (
    <section
      id="stats"
      data-scroll-anchor="stats"
      data-scroll-label="Numeri"
      className="section-deferred relative overflow-x-clip px-6 py-20 sm:py-24"
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
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={statsItemVariants}
              data-scroll-anchor={stat.anchor}
              data-scroll-label={stat.label}
            >
              <GlassCard
                hover={false}
                className={`reading-line-stat relative flex min-h-[11.5rem] flex-col overflow-hidden rounded-3xl border ${stat.border} ${stat.cardTint} px-6 pt-7 pb-6 shadow-sm`}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
                  style={{
                    background: `linear-gradient(90deg, var(${stat.accentVar}) 0%, color-mix(in srgb, var(${stat.accentVar}) 35%, transparent) 55%, transparent 100%)`,
                  }}
                  aria-hidden
                />

                <p
                  className={`mb-3 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase ${stat.labelColor}`}
                >
                  {stat.label}
                </p>

                <p
                  className={`text-[2.75rem] leading-none font-extrabold tracking-tight sm:text-5xl ${stat.valueColor}`}
                >
                  {stat.value}
                </p>

                <div className={`mt-auto pt-5 ${stat.markColor}`}>
                  <StatMark variant={stat.mark} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
