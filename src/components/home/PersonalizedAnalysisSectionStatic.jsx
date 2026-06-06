import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import MagneticButton from '../ui/MagneticButton'
import { HOME_AUDIENCE, HOME_CTA } from '../../constants/siteCopy'

export default function PersonalizedAnalysisSectionStatic() {
  return (
    <section
      id="personalized"
      data-scroll-anchor="personalized"
      data-scroll-label="A chi serve"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="violet" shape="blob" position="top-left" />
      <SectionBlob variant="rose" shape="circle" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <MulticolorHeading
          as="h2"
          words={HOME_AUDIENCE.label}
          className="mb-6 text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-3xl"
          startIndex={0}
        />

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
          {HOME_AUDIENCE.text}
        </p>

        <div
          className="mt-10"
          data-scroll-anchor="personalized-cta"
          data-scroll-label="CTA A chi serve"
        >
          <MagneticButton to="/wizard" variant="outline-coral" readingLineCta>
            {HOME_CTA.label} →
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
