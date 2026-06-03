import { motion } from 'framer-motion'
import AnimatedText from '../ui/AnimatedText'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const STEPS = [
  {
    step: '01',
    tagline: 'Ascolto e cura',
    title: 'Analisi',
    description:
      'Raccogliamo le esigenze reali con un percorso guidato, empatico e senza stress.',
    accentColor: 'text-[#B45309]',
    postItBg: 'bg-[#FFF4B8]',
    postItBorder: 'border-amber-900/8',
    postItShadow: '3px 5px 0 rgba(180, 83, 9, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(180, 83, 9, 0.16)',
    stepWatermark: 'text-amber-900/12',
    rotate: -1.8,
  },
  {
    step: '02',
    tagline: 'Match su misura',
    title: 'Valutazione',
    description:
      'Studiamo la vostra situazione nel dettaglio — non un catalogo, ma un match pensato per voi.',
    accentColor: 'text-[#6D5B9E]',
    postItBg: 'bg-[#E8E0F5]',
    postItBorder: 'border-violet-900/8',
    postItShadow: '3px 5px 0 rgba(109, 91, 158, 0.14)',
    postItShadowHover: '5px 8px 0 rgba(109, 91, 158, 0.16)',
    stepWatermark: 'text-violet-900/12',
    rotate: 1.6,
  },
  {
    step: '03',
    tagline: 'Proposte chiare',
    title: 'Soluzione',
    description:
      "Solo dopo l'analisi, proposte personalizzate con trasparenza su costi e servizi.",
    accentColor: 'text-[#BE185D]',
    postItBg: 'bg-[#FDE4EC]',
    postItBorder: 'border-rose-900/8',
    postItShadow: '3px 5px 0 rgba(190, 24, 93, 0.12)',
    postItShadowHover: '5px 8px 0 rgba(190, 24, 93, 0.14)',
    stepWatermark: 'text-rose-900/12',
    rotate: -1.2,
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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

          <div className="grid gap-6 overflow-visible sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <motion.div
                key={step.title}
                variants={cardVariants}
                className="overflow-visible px-1 py-2"
                data-scroll-anchor={`bento-${step.title.toLowerCase()}`}
                data-scroll-label={step.title}
              >
                <motion.div
                  className={`group relative h-full border ${step.postItBorder} ${step.postItBg} rounded-sm p-6 sm:p-7`}
                  style={{
                    rotate: step.rotate,
                    boxShadow: step.postItShadow,
                  }}
                  whileHover={{
                    y: -5,
                    rotate: 0,
                    boxShadow: step.postItShadowHover,
                  }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-3 right-4 select-none text-5xl font-black leading-none sm:text-6xl ${step.stepWatermark}`}
                  >
                    {step.step}
                  </span>

                  <div className="relative">
                    <AnimatedText
                      text={step.tagline}
                      as="p"
                      className={`mb-4 text-sm font-bold tracking-wide sm:text-base ${step.accentColor}`}
                    />

                    <h3 className="mb-2 text-lg font-bold text-slate-800">
                      {step.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-700/85">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
