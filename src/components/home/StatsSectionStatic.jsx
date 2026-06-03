import MulticolorHeading from '../ui/MulticolorHeading'
import SectionBlob from '../ui/SectionBlob'
import { StatMark, STATS } from './statsShared'

export default function StatsSectionStatic() {
  return (
    <section
      id="stats"
      data-scroll-anchor="stats"
      data-scroll-label="Numeri"
      className="section-deferred relative overflow-x-clip px-6 py-16 sm:py-20"
    >
      <SectionBlob variant="amber" shape="ring" position="top-right" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <MulticolorHeading
            as="h2"
            words="Numeri che contano davvero"
            className="text-xl font-extrabold leading-[1.1] tracking-tight sm:text-2xl"
            startIndex={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              data-scroll-anchor={stat.anchor}
              data-scroll-label={stat.label}
            >
              <div
                className={`relative flex min-h-[11.5rem] flex-col overflow-hidden rounded-3xl border ${stat.border} ${stat.cardTint} px-6 pt-7 pb-6 shadow-sm`}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
