import { ArrowRight, MapPin, Star } from 'lucide-react'
import { MotionArticle, MotionButton } from '../../utils/motionProxy'

function SolutionPostItCard({ solution, index, animate, onAction }) {
  const style = solution.postIt
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
      }
    : {}

  return (
    <MotionArticle
      {...motionProps}
      className="overflow-visible px-1 py-2"
    >
      <div
        className={`group relative flex h-full flex-col border ${style.postItBorder} ${style.postItBg} rounded-sm overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
        style={{
          rotate: `${style.rotate}deg`,
          boxShadow: style.postItShadow,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = style.postItShadowHover
          e.currentTarget.style.rotate = '0deg'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = style.postItShadow
          e.currentTarget.style.rotate = `${style.rotate}deg`
        }}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute right-3 top-2 select-none text-5xl font-black leading-none ${style.watermark}`}
        >
          0{solution.rank}
        </span>

        <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
          <img
            src={solution.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {solution.isBest ? (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#E07A5F] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <Star className="h-3 w-3 fill-current" strokeWidth={0} />
              Top
            </span>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <p className={`mb-2 text-xs font-bold uppercase tracking-wide sm:text-sm ${style.accentColor}`}>
            {style.tagline}
          </p>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800/80">
            {solution.type}
          </p>
          <h3 className="mb-2 text-lg font-bold text-slate-800">{solution.name}</h3>
          {solution.location ? (
            <div className="mb-2 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3 w-3" strokeWidth={2} />
              {solution.location}
              {solution.compatibility ? (
                <span className="text-emerald-700"> · {solution.compatibility}%</span>
              ) : null}
            </div>
          ) : null}
          <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-700/90">
            {solution.summary}
          </p>
          <MotionButton
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction?.(solution)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-[#c96a52]"
          >
            Scopri di più
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </MotionButton>
        </div>
      </div>
    </MotionArticle>
  )
}

export default function SolutionPostItGrid({ solutions, animate = true, onSolutionAction }) {
  if (!solutions?.length) return null

  return (
    <section aria-label="Soluzioni consigliate">
      <header className="mb-6 text-center sm:mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#E07A5F]">
          Le tue proposte
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          Tre percorsi pensati per voi
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
          Si affinano ad ogni risposta — tornando indietro ritrovi esattamente le proposte di
          prima.
        </p>
      </header>

      <div className="grid gap-6 overflow-visible sm:grid-cols-3 sm:gap-8">
        {solutions.map((solution, index) => (
          <SolutionPostItCard
            key={solution.id}
            solution={solution}
            index={index}
            animate={animate}
            onAction={onSolutionAction}
          />
        ))}
      </div>
    </section>
  )
}
