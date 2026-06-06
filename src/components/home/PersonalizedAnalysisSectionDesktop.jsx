import { motion } from 'framer-motion'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import MagneticButton from '../ui/MagneticButton'
import { HOME_AUDIENCE, HOME_CTA } from '../../constants/siteCopy'

export default function PersonalizedAnalysisSectionDesktop() {
  return (
    <section
      id="personalized"
      data-scroll-anchor="personalized"
      data-scroll-label="A chi serve"
      className="section-deferred relative overflow-x-clip px-6 py-20 sm:py-28"
    >
      <SectionBlob variant="violet" shape="blob" position="top-left" />
      <SectionBlob variant="rose" shape="circle" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <MulticolorHeading
            as="h2"
            words={HOME_AUDIENCE.label}
            className="mb-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            startIndex={0}
          />

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            {HOME_AUDIENCE.text}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-10"
            data-scroll-anchor="personalized-cta"
            data-scroll-label="CTA A chi serve"
          >
            <MagneticButton to="/wizard" variant="outline-coral" readingLineCta>
              {HOME_CTA.label} →
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
