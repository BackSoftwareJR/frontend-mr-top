import { motion } from 'framer-motion'
import SectionBlob from '../ui/SectionBlob'
import { cardClassName, CTASectionContent } from './CTASectionStatic'

export default function CTASectionDesktop() {
  return (
    <section
      id="cta"
      className="section-deferred relative overflow-x-clip px-6 py-20 sm:py-24"
    >
      <SectionBlob variant="coral" shape="wave" position="bottom-left" />
      <SectionBlob variant="amber" shape="ring" position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className={cardClassName}
        data-scroll-anchor="cta-final"
        data-scroll-label="CTA finale"
      >
        <CTASectionContent />
      </motion.div>
    </section>
  )
}
