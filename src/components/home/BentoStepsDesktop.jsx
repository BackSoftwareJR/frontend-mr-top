import { motion } from 'framer-motion'
import AnimatedText from '../ui/AnimatedText'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import {
  BENTO_STEPS,
  bentoCardVariants,
  bentoContainerVariants,
} from './bentoShared'

export default function BentoStepsDesktop() {
  return (
    <section
      id="bento"
      data-scroll-anchor="bento"
      data-scroll-label="Come funziona"
      className="section-deferred relative overflow-x-clip px-6 py-20 sm:py-28"
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
          variants={bentoContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={bentoCardVariants} className="mb-12 text-center sm:mb-14">
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
            {BENTO_STEPS.map((step) => (
              <motion.div
                key={step.title}
                variants={bentoCardVariants}
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
