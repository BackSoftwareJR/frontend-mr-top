import AnimatedText from '../ui/AnimatedText'
import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import MagneticButton from '../ui/MagneticButton'

const POINTS = [
  {
    tagline: 'Prima ascoltiamo',
    title: 'Ascoltiamo prima di consigliare',
    description:
      'Ogni famiglia vive una storia unica. Non partiamo da un catalogo, ma dalle vostre esigenze reali.',
    image: '/images/personalized/ascolto.jpg',
    imageAlt: 'Due persone in conversazione, ascolto attento',
    accentColor: 'text-[#2F6B52]',
    cardBg: 'bg-[#E8F3ED]',
    backLayer: 'bg-[#D4E8DC]',
    border: 'border-[#2F6B52]/10',
    tape: 'bg-[#5CB8A8]/75',
    shadow: '4px 6px 0 rgba(47, 107, 82, 0.13)',
    photoRotate: 2,
    rotate: -1.2,
    backRotate: 2.5,
  },
  {
    tagline: 'Caso per caso',
    title: 'Analisi caso per caso',
    description:
      'Studiamo autonomia, budget, zone e tempistiche prima di proporti qualsiasi soluzione concreta.',
    image: '/images/personalized/analisi.jpg',
    imageAlt: 'Persone che analizzano insieme una situazione',
    accentColor: 'text-[#3D5A80]',
    cardBg: 'bg-[#E6EEF8]',
    backLayer: 'bg-[#D2E0F2]',
    border: 'border-[#3D5A80]/10',
    tape: 'bg-[#7BA7D9]/75',
    shadow: '4px 6px 0 rgba(61, 90, 128, 0.13)',
    photoRotate: -1.6,
    rotate: 1.1,
    backRotate: -2,
  },
  {
    tagline: 'Con trasparenza',
    title: 'Solo dopo, le raccomandazioni',
    description:
      'Le proposte arrivano solo quando abbiamo capito davvero la vostra situazione — con trasparenza e cura.',
    image: '/images/personalized/raccomandazioni.jpg',
    imageAlt: 'Persona anziana sorridente, momento di fiducia',
    accentColor: 'text-[#9A4D2E]',
    cardBg: 'bg-[#FAEDE4]',
    backLayer: 'bg-[#F2DDD0]',
    border: 'border-[#9A4D2E]/10',
    tape: 'bg-[#E9A84A]/80',
    shadow: '4px 6px 0 rgba(154, 77, 46, 0.12)',
    photoRotate: 1.4,
    rotate: -0.9,
    backRotate: 1.8,
  },
]

export default function PersonalizedAnalysisSectionStatic() {
  return (
    <section
      id="personalized"
      data-scroll-anchor="personalized"
      data-scroll-label="Analisi personalizzata"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="violet" shape="blob" position="top-left" />
      <SectionBlob variant="rose" shape="circle" position="bottom-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-[#9B8EC4]/25 bg-[#9B8EC4]/8 px-4 py-1.5">
            <span className="text-xs font-semibold tracking-wide text-[#9B8EC4] uppercase">
              Analisi personalizzata
            </span>
          </div>

          <MulticolorHeading
            as="h2"
            words="Ogni famiglia è diversa"
            className="mb-4 text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-3xl"
            startIndex={0}
          />

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Non mostriamo un elenco di strutture. Ogni situazione è unica e merita
            un&apos;analisi individuale prima di qualsiasi raccomandazione — con
            empatia, ascolto e zero pressione.
          </p>
        </div>

        <div className="grid gap-7 overflow-visible sm:grid-cols-3 sm:gap-9">
          {POINTS.map((point) => (
            <div key={point.title} className="relative overflow-visible px-1 py-3">
              <div
                aria-hidden
                className={`absolute inset-x-2 -bottom-1 top-2 rounded-sm ${point.backLayer} border ${point.border}`}
                style={{ rotate: point.backRotate }}
              />

              <div
                className={`relative h-full border ${point.border} ${point.cardBg} rounded-sm p-5 sm:p-6`}
                style={{
                  rotate: point.rotate,
                  boxShadow: point.shadow,
                }}
              >
                <div className="relative mb-5">
                  <span
                    aria-hidden
                    className={`absolute -top-2 left-1/2 z-10 h-5 w-14 -translate-x-1/2 rounded-sm ${point.tape} shadow-sm`}
                  />

                  <div
                    className="overflow-hidden border border-black/[0.06] bg-white px-2 pt-2 pb-6 shadow-[2px_4px_0_rgba(15,23,42,0.07)]"
                    style={{ rotate: point.photoRotate }}
                  >
                    <img
                      src={point.image}
                      alt={point.imageAlt}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <AnimatedText
                  text={point.tagline}
                  as="p"
                  className={`mb-2 text-xs font-bold tracking-[0.12em] uppercase ${point.accentColor}`}
                />

                <h3 className="mb-2.5 text-lg font-bold leading-snug text-slate-800">
                  {point.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-700/80">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-14 text-center"
          data-scroll-anchor="personalized-cta"
          data-scroll-label="CTA Analisi"
        >
          <MagneticButton to="/wizard" variant="outline-coral" readingLineCta>
            Raccontaci la vostra situazione
          </MagneticButton>
          <p className="mt-4 text-sm text-slate-500">
            Gratuito, confidenziale, senza impegno.
          </p>
        </div>
      </div>
    </section>
  )
}
