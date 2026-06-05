import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import AuroraBackground from '../components/layout/AuroraBackground'
import SectionBlob from '../components/ui/SectionBlob'
import UnsupportedTopicMessage from '../components/explore/UnsupportedTopicMessage'
import SearchResultsNav from '../components/search-results/SearchResultsNav'
import SearchAssistantDesktop from '../components/search-results/SearchAssistantDesktop'
import SearchAssistantMobile from '../components/search-results/SearchAssistantMobile'
import SolutionPostItGrid from '../components/search-results/SolutionPostItGrid'
import EditorialInsightsSection from '../components/search-results/EditorialInsightsSection'
import { MOCK_BLOG_RESULTS } from '../constants/searchResultsData'
import { useNandoGuide } from '../hooks/useNandoGuide'
import {
  createSearchSession,
  getSearchSessionById,
  getCurrentSolutions,
  goBackRefinementTrail,
  goForwardRefinementTrail,
  pushRefinementStep,
} from '../utils/searchSessionStorage'
import { useIsMobile, isMobileViewport } from '../utils/performanceTier'

export default function ExplorePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const sessionIdParam = searchParams.get('session')
  const queryParam = searchParams.get('q')
  const startedParam = searchParams.get('started') === '1'

  const [sessionCache, setSessionCache] = useState({})
  const [assistantOpen, setAssistantOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return !isMobileViewport() && params.get('started') === '1'
  })

  useEffect(() => {
    if (sessionIdParam || !queryParam?.trim()) return
    const nextSession = createSearchSession(queryParam.trim())
    navigate(`/esplora?session=${nextSession.id}&started=1`, { replace: true })
  }, [sessionIdParam, queryParam, navigate])

  const session = useMemo(() => {
    if (!sessionIdParam) return null
    if (sessionCache[sessionIdParam]) return sessionCache[sessionIdParam]
    return getSearchSessionById(sessionIdParam)
  }, [sessionIdParam, sessionCache])

  const shouldAnimate = startedParam && !prefersReducedMotion

  const { pageTitle, question: refinementQuestion, loading: nandoLoading, error: nandoError } =
    useNandoGuide(session)

  const solutions = useMemo(
    () => (session?.supported ? getCurrentSolutions(session) : []),
    [session],
  )

  const { canGoBack, canGoForward } = useMemo(() => {
    if (!session?.refinementTrail) {
      return { canGoBack: false, canGoForward: false }
    }
    const cursor = session.refinementCursor ?? 0
    const trail = session.refinementTrail
    return {
      canGoBack: cursor > 0,
      canGoForward: cursor < trail.length - 1,
    }
  }, [session])

  const syncSession = useCallback((updated) => {
    if (!updated) return
    setSessionCache((prev) => ({ ...prev, [updated.id]: updated }))
  }, [])

  const handleRefinementSelect = useCallback(
    (questionId, option) => {
      if (!session) return
      const updated = pushRefinementStep(session.id, {
        questionId,
        answerId: option.id,
        answerLabel: option.label,
      })
      syncSession(updated)
    },
    [session, syncSession],
  )

  const handleCustomSubmit = useCallback(
    (text) => {
      if (!session) return
      const updated = pushRefinementStep(session.id, {
        questionId: 'refinement_custom',
        answerId: `custom-${Date.now()}`,
        answerLabel: text,
        customText: text,
      })
      syncSession(updated)
    },
    [session, syncSession],
  )

  const handleBack = useCallback(() => {
    if (!session) return
    syncSession(goBackRefinementTrail(session.id))
  }, [session, syncSession])

  const handleForward = useCallback(() => {
    if (!session) return
    syncSession(goForwardRefinementTrail(session.id))
  }, [session, syncSession])

  const handleSolutionAction = useCallback((solution) => {
    if (solution.kind === 'structure') {
      window.alert(
        `${solution.name}: scheda completa in arrivo. I contatti restano nascosti finché non li scegli tu.`,
      )
      return
    }
    window.alert(`${solution.name}: approfondimento collegato — integrazione Groq in fase 2.`)
  }, [])

  const handleNewSearch = useCallback(() => {
    navigate('/')
  }, [navigate])

  const assistantPanelProps = {
    question: refinementQuestion,
    customNotes: session?.customNotes ?? '',
    canGoBack,
    canGoForward,
    onBack: handleBack,
    onForward: handleForward,
    onSelectOption: handleRefinementSelect,
    onCustomSubmit: handleCustomSubmit,
    loading: nandoLoading,
    error: nandoError,
  }

  if (!sessionIdParam && queryParam?.trim()) {
    return <div className="min-h-screen bg-[#FDFBF7]" aria-busy="true" />
  }

  if (!session) {
    return (
      <div className="relative min-h-screen bg-[#FDFBF7] text-slate-800">
        <AuroraBackground />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-2xl font-bold">Ricerca non trovata</h1>
          <p className="mb-6 text-slate-600">Avvia una nuova ricerca dalla home.</p>
          <Link
            to="/"
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-[#E07A5F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c96a52]"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  if (!session.supported) {
    return (
      <div className="relative min-h-screen bg-[#FDFBF7] text-slate-800">
        {shouldAnimate ? <AuroraBackground /> : null}
        <SearchResultsNav
          query={session.query}
          pageTitle={pageTitle}
          onNewSearch={handleNewSearch}
        />
        <main className="relative z-10 mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <UnsupportedTopicMessage topic={session.query} />
          <EditorialInsightsSection
            articles={MOCK_BLOG_RESULTS.slice(0, 3)}
            animate={shouldAnimate}
            className="mt-10"
          />
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-slate-800 antialiased">
      {shouldAnimate ? <AuroraBackground /> : null}

      <SearchResultsNav
        query={session.query}
        pageTitle={pageTitle}
        onNewSearch={handleNewSearch}
      />

      <SearchAssistantDesktop
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        panelProps={assistantPanelProps}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:pr-8">
        <SectionBlob variant="coral" shape="circle" position="top-right" />
        <SectionBlob variant="violet" shape="blob" position="bottom-left" />

        <div className="relative z-10 space-y-12 sm:space-y-16">
          {isMobile ? (
            <SearchAssistantMobile panelProps={assistantPanelProps} />
          ) : !assistantOpen ? (
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-50/80 via-white to-rose-50/60 px-4 py-3.5 text-left shadow-sm transition-colors hover:border-violet-300/80 max-md:hidden"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Affina la ricerca con Nando
                </p>
                <p className="text-xs text-slate-500">
                  Rispondi a qualche domanda per risultati più precisi
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#E07A5F] px-3 py-1.5 text-xs font-semibold text-white">
                Apri
              </span>
            </button>
          ) : null}

          <SolutionPostItGrid
            solutions={solutions}
            animate={shouldAnimate}
            onSolutionAction={handleSolutionAction}
          />

          <EditorialInsightsSection
            articles={MOCK_BLOG_RESULTS}
            animate={shouldAnimate}
          />
        </div>
      </main>
    </div>
  )
}
