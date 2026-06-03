import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

/** Minimal SVG marks — not icon tiles; paired with top accent bar per card */
function StatMark({ variant, className = '' }) {
  const shared = `block ${className}`
  switch (variant) {
    case 'famiglie':
      return (
        <svg
          className={shared}
          width="28"
          height="8"
          viewBox="0 0 28 8"
          fill="none"
          aria-hidden
        >
          <circle cx="4" cy="4" r="3" fill="currentColor" opacity="0.55" />
          <circle cx="14" cy="4" r="3" fill="currentColor" opacity="0.85" />
          <circle cx="24" cy="4" r="3" fill="currentColor" opacity="0.4" />
        </svg>
      )
    case 'risposta':
      return (
        <svg
          className={shared}
          width="32"
          height="8"
          viewBox="0 0 32 8"
          fill="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="4"
            x2="24"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle cx="28" cy="4" r="3" fill="currentColor" />
        </svg>
      )
    case 'strutture':
      return (
        <svg
          className={shared}
          width="24"
          height="10"
          viewBox="0 0 24 10"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 1L3 4v4.5c0 .8 3.6 2.5 9 2.5s9-1.7 9-2.5V4L12 1z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path
            d="M9 7.5l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'soddisfazione':
      return (
        <svg
          className={shared}
          width="36"
          height="8"
          viewBox="0 0 36 8"
          fill="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="4"
            x2="12"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle cx="18" cy="4" r="2.5" fill="currentColor" opacity="0.65" />
          <line
            x1="24"
            y1="4"
            x2="36"
            y2="4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      )
    default:
      return null
  }
}

const STATS = [
  {
    anchor: 'stats-famiglie',
    mark: 'famiglie',
    value: '500+',
    label: 'Famiglie aiutate',
    accentVar: '--color-accent-coral',
    cardTint: 'bg-[color:var(--color-accent-coral)]/[0.035]',
    border: 'border-[color:var(--color-accent-coral)]/10',
    markColor: 'text-[color:var(--color-accent-coral)]',
    valueColor: 'text-[color:var(--color-accent-coral)]',
    labelColor: 'text-[color:var(--color-accent-coral)]/75',
  },
  {
    anchor: 'stats-risposta',
    mark: 'risposta',
    value: '48h',
    label: 'Risposta media',
    accentVar: '--color-accent-amber',
    cardTint: 'bg-[color:var(--color-accent-amber)]/[0.04]',
    border: 'border-[color:var(--color-accent-amber)]/10',
    markColor: 'text-[color:var(--color-accent-amber)]',
    valueColor: 'text-[color:var(--color-accent-amber-dark)]',
    labelColor: 'text-[color:var(--color-accent-amber-dark)]/80',
  },
  {
    anchor: 'stats-strutture',
    mark: 'strutture',
    value: '120+',
    label: 'Strutture verificate',
    accentVar: '--color-accent-violet',
    cardTint: 'bg-[color:var(--color-accent-violet)]/[0.04]',
    border: 'border-[color:var(--color-accent-violet)]/10',
    markColor: 'text-[color:var(--color-accent-violet)]',
    valueColor: 'text-[color:var(--color-accent-violet-dark)]',
    labelColor: 'text-[color:var(--color-accent-violet-dark)]/75',
  },
  {
    anchor: 'stats-soddisfazione',
    mark: 'soddisfazione',
    value: '4.9',
    label: 'Soddisfazione media',
    accentVar: '--color-accent-rose',
    cardTint: 'bg-[color:var(--color-accent-rose)]/[0.035]',
    border: 'border-[color:var(--color-accent-rose)]/10',
    markColor: 'text-[color:var(--color-accent-rose)]',
    valueColor: 'text-[color:var(--color-accent-rose-dark)]',
    labelColor: 'text-[color:var(--color-accent-rose-dark)]/75',
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
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
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
