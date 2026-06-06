import SectionBlob from '../ui/SectionBlob'
import MagneticButton from '../ui/MagneticButton'
import { HOME_CTA } from '../../constants/siteCopy'

export const cardClassName =
  'relative z-10 mx-auto max-w-3xl rounded-3xl border border-[#E07A5F]/20 bg-gradient-to-br from-[#E07A5F]/8 via-white/90 to-[#E9A84A]/8 px-8 py-14 text-center shadow-sm backdrop-blur-sm sm:px-12 sm:py-16'

export function CTASectionContent() {
  return (
    <MagneticButton to="/wizard" variant="outline-coral" readingLineCta>
      {HOME_CTA.label} →
    </MagneticButton>
  )
}

export default function CTASectionStatic() {
  return (
    <section
      id="cta"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="coral" shape="wave" position="bottom-left" />
      <SectionBlob variant="amber" shape="ring" position="top-right" />

      <div
        className={cardClassName}
        data-scroll-anchor="cta-final"
        data-scroll-label="CTA finale"
      >
        <CTASectionContent />
      </div>
    </section>
  )
}
