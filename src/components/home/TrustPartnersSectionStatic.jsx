import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'

const PARTNERS = [
  'Regione Lombardia',
  'ANASTE',
  'Federanziani',
  'Quality Care',
  'Salute Italia',
  'CNA Senior',
]

export default function TrustPartnersSectionStatic() {
  return (
    <section
      id="trust"
      data-scroll-anchor="trust"
      data-scroll-label="Partner"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="amber" shape="ring" position="center" className="opacity-35" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Chi ci affida la propria fiducia
          </p>
          <MulticolorHeading
            as="h2"
            words="Partner e riconoscimenti"
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
            startIndex={1}
          />
        </div>

        <div className="border-y border-slate-200/70 py-8 sm:py-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-center sm:gap-x-3">
            {PARTNERS.map((name, index) => (
              <li key={name} className="inline-flex items-center">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="mx-3 hidden text-slate-300 sm:inline sm:mx-4"
                  >
                    ·
                  </span>
                )}
                <span className="text-sm font-semibold tracking-tight text-slate-600 transition-colors hover:text-slate-900 sm:text-base">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
