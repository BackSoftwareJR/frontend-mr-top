import { motion } from 'framer-motion'
import { Brain, Sparkles, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const STEPS = [
  {
    icon: Brain,
    step: '01',
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    iconBg: 'bg-[#E07A5F]/12',
    iconColor: 'text-[#E07A5F]',
    borderAccent: 'border-[#E07A5F]/15 hover:border-[#E07A5F]/35',
    cardTint: 'bg-[#E07A5F]/[0.03]',
    topBar: 'bg-[#E07A5F]',
    stagger: 'sm:translate-y-0',
    dotColor: 'bg-[#E07A5F]',
  },
  {
    icon: Target,
    step: '02',
    title: 'Valutazione',
    description:
      'Studiamo la vostra situazione nel dettaglio — non un catalogo, ma un match pensato per voi.',
    iconBg: 'bg-[#9B8EC4]/12',
    iconColor: 'text-[#9B8EC4]',
    borderAccent: 'border-[#9B8EC4]/15 hover:border-[#9B8EC4]/35',
    cardTint: 'bg-[#9B8EC4]/[0.04]',
    topBar: 'bg-[#9B8EC4]',
    stagger: 'sm:translate-y-5',
    dotColor: 'bg-[#9B8EC4]',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Soluzione',
    description:
      "Solo dopo l'analisi, proposte personalizzate con trasparenza su costi e servizi.",
    iconBg: 'bg-[#E879A0]/12',
    iconColor: 'text-[#E879A0]',
    borderAccent: 'border-[#E879A0]/15 hover:border-[#E879A0]/35',
    cardTint: 'bg-[#E879A0]/[0.03]',
    topBar: 'bg-[#E879A0]',
    stagger: 'sm:translate-y-2.5',
    dotColor: 'bg-[#E879A0]',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function BentoSteps() {
  return (
    <section
      id="bento"
      data-scroll-anchor="bento"
      data-scroll-label="Come funziona"
      className="relative overflow-x-clip px-6 py-20 sm:py-28"
    >
      <div className="relative mx-auto w-full max-w-6xl overflow-visible">
        <SectionBlob variant="teal" shape="wave" position="center" className="-z-10" />
        <SectionBlob
          variant="violet"
          shape="blob"
          position="top-left"
          className="-z-10 opacity-60"
        />

        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={cardVariants} className="mb-12 text-center sm:mb-14">
            <p className="mb-3 text-sm font-semibold tracking-widest text-slate-400 uppercase">
              Come funziona
            </p>
            <MulticolorHeading
              as="h2"
              words="Tre passi con cura"
              className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
              startIndex={1}
            />
          </motion.div>

          <div className="relative">
            <div
              className="pointer-events-none absolute top-[3.75rem] right-[18%] left-[18%] hidden h-px sm:block"
              aria-hidden="true"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-[#E07A5F]/25 via-[#9B8EC4]/25 to-[#E879A0]/25" />
            </div>

            <div className="relative z-10 grid gap-6 sm:grid-cols-3 sm:gap-5">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    variants={cardVariants}
                    data-scroll-anchor={`bento-${step.title.toLowerCase()}`}
                    data-scroll-label={step.title}
                    className={`relative transition-transform duration-500 ${step.stagger}`}
                  >
                    <div
                      className={`absolute -top-3 left-1/2 z-20 hidden size-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm sm:flex ${step.dotColor}`}
                      aria-hidden="true"
                    >
                      <span className="size-2 rounded-full bg-white/90" />
                    </div>

                    <GlassCard
                      className={`group relative flex h-full min-h-[220px] flex-col overflow-visible border ${step.borderAccent} ${step.cardTint} p-6 text-left transition-all duration-300 sm:p-8`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${step.topBar} opacity-70`}
                      />
                      <span
                        className={`absolute top-5 right-5 text-3xl font-black leading-none ${step.iconColor} opacity-[0.07]`}
                        aria-hidden="true"
                      >
                        {step.step}
                      </span>
                      <div
                        className={`relative mb-5 inline-flex size-14 shrink-0 items-center justify-center overflow-visible rounded-2xl ${step.iconBg} p-3.5 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon
                          className={`size-6 shrink-0 ${step.iconColor}`}
                          strokeWidth={1.75}
                        />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-slate-800">{step.title}</h3>
                      <p className="flex-1 text-sm leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                      {index < STEPS.length - 1 && (
                        <div
                          className="mt-5 flex items-center gap-2 sm:hidden"
                          aria-hidden="true"
                        >
                          <span className={`size-1.5 rounded-full ${step.dotColor}`} />
                          <span className="h-px flex-1 bg-gradient-to-r from-current/20 to-transparent text-slate-300" />
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
