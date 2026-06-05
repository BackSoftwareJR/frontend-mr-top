import { ArrowRight, Clock } from 'lucide-react'
import { MotionSection, MotionArticle } from '../../utils/motionProxy'

function BlogSerpRow({ article, index, animate }) {
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.08 + index * 0.05, duration: 0.35 },
      }
    : {}

  return (
    <MotionArticle
      {...motionProps}
      className="group flex gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:gap-4 sm:py-5"
    >
      <div className="h-[72px] w-[96px] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-[120px]">
        <img
          src={article.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" strokeWidth={2} />
            {article.readMinutes} min
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-slate-800 sm:text-base">
          <a href={article.url} className="hover:text-[#E07A5F]">
            {article.title}
          </a>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
          {article.description}
        </p>
        <a
          href={article.url}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#c96a52] hover:text-[#E07A5F] sm:text-sm"
        >
          Leggi di più
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </a>
      </div>
    </MotionArticle>
  )
}

export default function BlogSerpSection({ articles, animate = true, className = '' }) {
  if (!articles?.length) return null

  return (
    <MotionSection
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45 }}
      className={`rounded-2xl border border-black/[0.06] bg-white/80 px-4 py-2 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:px-6 sm:py-3 ${className}`}
    >
      <header className="border-b border-slate-100 py-4">
        <h2 className="text-lg font-bold text-slate-800">Guide, articoli e storie</h2>
        <p className="mt-1 text-sm text-slate-500">
          Contenuti verificati dal team Wenando per orientarti con serenità.
        </p>
      </header>

      <div>
        {articles.map((article, index) => (
          <BlogSerpRow key={article.id} article={article} index={index} animate={animate} />
        ))}
      </div>
    </MotionSection>
  )
}
