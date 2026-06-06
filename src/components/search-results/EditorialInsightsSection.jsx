import { ArrowUpRight, Clock, Mic, BookOpen, Heart } from 'lucide-react'
import { MotionSection, MotionArticle } from '../../utils/motionProxy'

const SECTION_META = {
  article: {
    title: 'Articoli e guide',
    icon: BookOpen,
    accent: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-800',
  },
  story: {
    title: 'Storie di famiglie',
    icon: Heart,
    accent: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-800',
  },
  interview: {
    title: 'Interviste',
    icon: Mic,
    accent: 'text-violet-700',
    badge: 'bg-violet-50 text-violet-800',
  },
}

function ContentCard({ item, index, animate, size = 'default' }) {
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.04, duration: 0.35 },
      }
    : {}

  const isLarge = size === 'large'

  return (
    <MotionArticle
      {...motionProps}
      className={`group overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isLarge ? 'sm:flex sm:flex-row' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          isLarge ? 'aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-[180px]' : 'aspect-[16/10]'
        }`}
      >
        <img
          src={item.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className={`flex flex-col p-4 ${isLarge ? 'sm:flex-1 sm:p-5' : ''}`}>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SECTION_META[item.type]?.badge ?? 'bg-slate-100 text-slate-700'}`}
          >
            {item.category}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {item.readMinutes} min
          </span>
        </div>
        <h3
          className={`font-semibold leading-snug text-slate-800 ${isLarge ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
        >
          <a href={item.url} className="hover:text-[#E07A5F]">
            {item.title}
          </a>
        </h3>
        <p className={`mt-1.5 flex-1 text-slate-600 ${isLarge ? 'text-sm' : 'text-xs sm:text-sm line-clamp-2'}`}>
          {item.description ?? item.summary}
        </p>
        {item.relevanceReason ? (
          <p className="mt-2 text-xs italic text-violet-700/90">{item.relevanceReason}</p>
        ) : null}
        <a
          href={item.url}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#c96a52] hover:text-[#E07A5F] sm:text-sm"
        >
          Leggi
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </MotionArticle>
  )
}

function ContentSection({ type, items, animate, startIndex = 0 }) {
  const meta = SECTION_META[type]
  const Icon = meta.icon
  if (!items.length) return null

  const [lead, ...rest] = items

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${meta.accent}`} strokeWidth={2} />
        <h3 className={`text-base font-bold ${meta.accent}`}>{meta.title}</h3>
        <span className="text-xs text-slate-400">({items.length})</span>
      </div>
      <ContentCard item={lead} index={startIndex} animate={animate} size="large" />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5">
        {rest.map((item, i) => (
          <ContentCard key={item.id} item={item} index={startIndex + i + 1} animate={animate} />
        ))}
      </div>
    </section>
  )
}

export default function EditorialInsightsSection({
  articles,
  animate = true,
  className = '',
  highlighted = false,
  contextLabel = null,
}) {
  if (!articles?.length) return null

  const byType = {
    article: articles.filter((a) => a.type === 'article'),
    story: articles.filter((a) => a.type === 'story'),
    interview: articles.filter((a) => a.type === 'interview'),
  }

  return (
    <MotionSection
      id="editorial-insights"
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45 }}
      className={`scroll-mt-24 rounded-3xl p-1 transition-all duration-300 sm:p-2 ${
        highlighted
          ? 'explore-editorial-highlight ring-2 ring-[#E07A5F]/30 ring-offset-2 ring-offset-[#FDFBF7]'
          : ''
      } ${className}`}
    >
      <div className={highlighted ? 'rounded-2xl p-4 sm:p-6' : ''}>
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <p className="explore-section-label mb-2">Per approfondire</p>
          {contextLabel ? (
            <p className="mb-2 text-xs font-medium text-violet-700/90 sm:text-sm">{contextLabel}</p>
          ) : null}
          <h2 className="explore-section-title text-[1.75rem] sm:text-3xl lg:text-[2rem]">
            Articoli, storie e interviste
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Contenuti verificati dal team Wenando — guide pratiche, esperienze reali e
            conversazioni con esperti.
          </p>
        </header>

        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          <ContentSection type="article" items={byType.article} animate={animate} startIndex={0} />
          <ContentSection type="story" items={byType.story} animate={animate} startIndex={4} />
          <ContentSection
            type="interview"
            items={byType.interview}
            animate={animate}
            startIndex={8}
          />
        </div>
      </div>
    </MotionSection>
  )
}
