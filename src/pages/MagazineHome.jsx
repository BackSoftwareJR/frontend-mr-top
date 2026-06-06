import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, Clock, Heart, Mic, Sparkles } from 'lucide-react'
import WenandoLogo from '../components/ui/WenandoLogo'
import { MOCK_BLOG_RESULTS } from '../fixtures/editorialMocks'
import {
  fetchEditorialContents,
  fetchEditorialRubrics,
  isEditorialApiEnabled,
  resolveEditorialArticleUrl,
} from '../services/editorialService'

const RUBRIC_RAILS = [
  { slug: 'guide', label: 'Guide', icon: BookOpen, accent: 'text-amber-700', badge: 'bg-amber-50 text-amber-800' },
  { slug: 'storie', label: 'Storie di famiglie', icon: Heart, accent: 'text-rose-700', badge: 'bg-rose-50 text-rose-800' },
  { slug: 'interviste', label: 'Interviste', icon: Mic, accent: 'text-violet-700', badge: 'bg-violet-50 text-violet-800' },
  { slug: 'eventi', label: 'Eventi', icon: Calendar, accent: 'text-teal-700', badge: 'bg-teal-50 text-teal-800' },
]

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop'

function MagazineCard({ item, size = 'default' }) {
  const href = resolveEditorialArticleUrl(item.url)
  const isLarge = size === 'large'

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isLarge ? 'sm:flex sm:flex-row' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          isLarge ? 'aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-[200px]' : 'aspect-[16/10]'
        }`}
      >
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className={`flex flex-col p-4 ${isLarge ? 'sm:flex-1 sm:p-6' : ''}`}>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              RUBRIC_RAILS.find((r) => r.label === item.category)?.badge ??
              'bg-slate-100 text-slate-700'
            }`}
          >
            {item.category}
          </span>
          {item.readMinutes ? (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" strokeWidth={2} />
              {item.readMinutes} min
            </span>
          ) : null}
        </div>
        <h3
          className={`font-semibold leading-snug text-slate-800 ${
            isLarge ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'
          }`}
        >
          <a href={href} className="hover:text-[#E07A5F]">
            {item.title}
          </a>
        </h3>
        {item.description ? (
          <p
            className={`mt-2 flex-1 text-slate-600 ${
              isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm line-clamp-2'
            }`}
          >
            {item.description}
          </p>
        ) : null}
        <a
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#c96a52] hover:text-[#E07A5F] sm:text-sm"
        >
          Leggi
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </article>
  )
}

function RubricRail({ rail, items }) {
  const Icon = rail.icon

  if (!items.length) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${rail.accent}`} strokeWidth={2} />
        <h2 className={`text-lg font-bold sm:text-xl ${rail.accent}`}>{rail.label}</h2>
        <span className="text-xs text-slate-400">({items.length})</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MagazineCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function buildFixtureRails() {
  const byRubric = {}

  RUBRIC_RAILS.forEach((rail) => {
    byRubric[rail.slug] = MOCK_BLOG_RESULTS.filter((item) => {
      const category = item.category?.toLowerCase() ?? ''
      if (rail.slug === 'guide') return item.type === 'article'
      if (rail.slug === 'storie') return item.type === 'story'
      if (rail.slug === 'interviste') return item.type === 'interview'
      if (rail.slug === 'eventi') return category.includes('event')
      return false
    }).slice(0, 3)
  })

  return byRubric
}

function buildFixtureFeatured() {
  const featuredItems = MOCK_BLOG_RESULTS.filter((item) => item.featured)
  return featuredItems.length ? featuredItems : MOCK_BLOG_RESULTS.slice(0, 2)
}

export default function MagazineHome() {
  const apiEnabled = isEditorialApiEnabled()
  const fixtureFeatured = useMemo(() => (apiEnabled ? [] : buildFixtureFeatured()), [apiEnabled])
  const fixtureRails = useMemo(() => (apiEnabled ? {} : buildFixtureRails()), [apiEnabled])
  const [featured, setFeatured] = useState(fixtureFeatured)
  const [rails, setRails] = useState(fixtureRails)
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Magazine | Wenando'
  }, [])

  useEffect(() => {
    if (!apiEnabled) return undefined

    let cancelled = false

    void (async () => {
      setLoading(true)
      setError(null)

      try {
        const [featuredItems, rubricList, ...railResults] = await Promise.all([
          fetchEditorialContents({ featured: true, limit: 4 }),
          fetchEditorialRubrics(),
          ...RUBRIC_RAILS.map((rail) =>
            fetchEditorialContents({ rubric: rail.slug, limit: 6 }),
          ),
        ])

        if (cancelled) return

        const railMap = {}
        RUBRIC_RAILS.forEach((rail, index) => {
          railMap[rail.slug] = railResults[index] ?? []
        })

        setFeatured(featuredItems)
        setRubrics(rubricList)
        setRails(railMap)
      } catch {
        if (!cancelled) {
          setError('Impossibile caricare i contenuti del magazine.')
          setFeatured(MOCK_BLOG_RESULTS.filter((item) => item.featured))
          setRails({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const rubricDescriptions = useMemo(() => {
    const map = {}
    rubrics.forEach((rubric) => {
      map[rubric.slug] = rubric.description
    })
    return map
  }, [rubrics])

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#FDFBF7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Torna alla home"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Wenando Magazine
            </p>
            <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
              Guide, storie e approfondimenti
            </p>
          </div>
          <Link to="/" className="opacity-90 transition-opacity hover:opacity-100">
            <WenandoLogo size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="mb-12 text-center sm:mb-16">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#E07A5F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#c96a52]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            Magazine Wenando
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Informazioni verificate per famiglie e caregiver
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Articoli, storie reali, interviste con esperti ed eventi — tutto curato dal team
            Wenando per aiutarti a scegliere con serenità.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/esplora"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E07A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c96a52]"
            >
              Esplora servizi
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <a
              href={resolveEditorialArticleUrl('/magazine')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#E07A5F]/30 hover:text-[#c96a52]"
            >
              Versione HTML completa
            </a>
          </div>
        </section>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((key) => (
              <div key={key} className="animate-pulse space-y-4">
                <div className="h-6 w-48 rounded-lg bg-slate-200/70" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((card) => (
                    <div key={card} className="aspect-[16/10] rounded-2xl bg-slate-200/60" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {error ? (
              <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </p>
            ) : null}

            {featured.length ? (
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#E07A5F]" strokeWidth={2} />
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">In evidenza</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {featured.slice(0, 2).map((item) => (
                    <MagazineCard key={item.id} item={item} size="large" />
                  ))}
                </div>
              </section>
            ) : null}

            {RUBRIC_RAILS.map((rail) => (
              <div key={rail.slug}>
                {rubricDescriptions[rail.slug] ? (
                  <p className="-mt-2 mb-4 text-sm text-slate-500">{rubricDescriptions[rail.slug]}</p>
                ) : null}
                <RubricRail rail={rail} items={rails[rail.slug] ?? []} />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-black/5 px-6 py-10 text-center">
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-[#E07A5F]"
        >
          ← Torna alla home Wenando
        </Link>
      </footer>
    </div>
  )
}
