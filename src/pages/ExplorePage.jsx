import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import AuroraBackground from '../components/layout/AuroraBackground'
import SectionBlob from '../components/ui/SectionBlob'
import UnsupportedTopicMessage from '../components/explore/UnsupportedTopicMessage'
import ExploreLoadingSkeleton from '../components/explore/ExploreLoadingSkeleton'
import ActionNoticeModal from '../components/explore/ActionNoticeModal'
import AutonomyLevelModal from '../components/explore/AutonomyLevelModal'
import ContactIntentModal from '../components/explore/ContactIntentModal'
import ContactMatchResultsModal from '../components/explore/ContactMatchResultsModal'
import SearchResultsNav from '../components/search-results/SearchResultsNav'
import SearchAssistantIntegrated from '../components/search-results/SearchAssistantIntegrated'
import SearchAssistantMobile from '../components/search-results/SearchAssistantMobile'
import SolutionPostItGrid from '../components/search-results/SolutionPostItGrid'
import EditorialInsightsSection from '../components/search-results/EditorialInsightsSection'
import {
  AUTONOMY_TO_CARE,
  getPendingRefinementKeys,
  getRefinementQuestion,
  isStructurePath,
  REFINEMENT_CHIP_META,
} from '../constants/pathRefinement'
import { CONTACT_INTENT_COPY } from '../constants/siteCopy'
import { MOCK_BLOG_RESULTS } from '../constants/searchResultsData'
import { useNandoGuide } from '../hooks/useNandoGuide'
import { useSearchOrchestration } from '../hooks/useSearchOrchestration'
import { submitContactIntent } from '../services/searchService'
import { ApiError } from '../services/apiClient'
import {
  createSearchSession,
  getRefinementFrame,
  getSearchSessionById,
  goBackRefinementTrail,
  goForwardRefinementTrail,
  pushRefinementStep,
} from '../utils/searchSessionStorage'
import { useIsMobile } from '../utils/performanceTier'

export default function ExplorePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const sessionIdParam = searchParams.get('session')
  const queryParam = searchParams.get('q')
  const startedParam = searchParams.get('started') === '1'

  const [sessionCache, setSessionCache] = useState({})
  const [actionNotice, setActionNotice] = useState(null)
  const [expandedWhyId, setExpandedWhyId] = useState(null)
  const [activePathId, setActivePathId] = useState(null)
  const [showPathRationale, setShowPathRationale] = useState(false)
  const [autonomyModalOpen, setAutonomyModalOpen] = useState(false)
  const [activeRefinementKey, setActiveRefinementKey] = useState(null)
  const [contactIntentPath, setContactIntentPath] = useState(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactResultsOpen, setContactResultsOpen] = useState(false)
  const [contactMatches, setContactMatches] = useState([])
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactError, setContactError] = useState(null)
  const [contactOffline, setContactOffline] = useState(false)
  const [contactZoneLabel, setContactZoneLabel] = useState('')

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

  const { pageTitle: nandoPageTitle, question: refinementQuestion, loading: nandoLoading, error: nandoError } =
    useNandoGuide(session)

  const {
    pageTitle: orchestratorPageTitle,
    paths,
    editorial,
    nando: orchestratorNando,
    loading: orchestrationLoading,
    error: orchestrationError,
  } = useSearchOrchestration(session)

  const pageTitle = orchestratorPageTitle || nandoPageTitle
  const editorialArticles = editorial?.length ? editorial : MOCK_BLOG_RESULTS

  const activePath = useMemo(
    () => paths.find((path) => path.id === activePathId) ?? null,
    [paths, activePathId],
  )

  const isEditorialPathActive =
    activePath?.pathType === 'editorial' || activePath?.type === 'editorial'

  const currentSelections = useMemo(() => {
    if (!session) return {}
    const { frame } = getRefinementFrame(session)
    return frame?.selections ?? session.selections ?? {}
  }, [session])

  const pendingRefinementKeys = useMemo(
    () => getPendingRefinementKeys(activePath, currentSelections, session?.query ?? ''),
    [activePath, currentSelections, session?.query],
  )

  const refinementChips = useMemo(() => {
    if (!activePath || !pendingRefinementKeys.length) return []
    const pathType = activePath.pathType ?? activePath.type ?? 'service'
    return pendingRefinementKeys.map((key) => ({
      key,
      label: REFINEMENT_CHIP_META[key]?.label,
      question: getRefinementQuestion(key, pathType),
    }))
  }, [activePath, pendingRefinementKeys])

  const nandoActions = useMemo(() => {
    const base = orchestratorNando?.actions ?? []
    const hasAutonomyAction = base.some(
      (action) => action.id === 'discover_autonomy' || action.id === 'refine_autonomy',
    )
    if (!hasAutonomyAction && pendingRefinementKeys.includes('autonomy')) {
      return [...base, { id: 'discover_autonomy', label: 'Scopri il livello' }]
    }
    return base
  }, [orchestratorNando?.actions, pendingRefinementKeys])

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
      setActiveRefinementKey(null)
    },
    [session, syncSession],
  )

  const handleAutonomySelect = useCallback(
    ({ value, label }) => {
      if (!session) return
      const careValue = AUTONOMY_TO_CARE[value] ?? 'moderate'
      const updated = pushRefinementStep(session.id, {
        questionId: 'refinement_care',
        answerId: careValue,
        answerLabel: label,
      })
      syncSession(updated)
      setActiveRefinementKey(null)
    },
    [session, syncSession],
  )

  const handleRefinementChipClick = useCallback((key) => {
    if (key === 'autonomy') {
      setAutonomyModalOpen(true)
      return
    }
    setActiveRefinementKey((prev) => (prev === key ? null : key))
  }, [])

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

  const revealPathRationale = useCallback((pathId) => {
    if (!pathId) return
    setActivePathId(pathId)
    setShowPathRationale(true)
    setExpandedWhyId(null)
    document.getElementById('nando-companion')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleSolutionAction = useCallback((solution) => {
    const label = solution.name ?? solution.title
    if (isStructurePath(solution)) {
      revealPathRationale(solution.id)
      setContactIntentPath(solution)
      setContactError(null)
      setContactModalOpen(true)
      return
    }
    if (solution.kind === 'editorial' || solution.pathType === 'editorial') {
      revealPathRationale(solution.id)
      document.getElementById('editorial-insights')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setActionNotice({
      title: label,
      message: 'Approfondimento del percorso collegato — esplorazione guidata in fase 2.',
    })
  }, [revealPathRationale])

  const openContactIntent = useCallback(
    (path) => {
      if (!path?.id) return
      revealPathRationale(path.id)
      setContactIntentPath(path)
      setContactError(null)
      setContactModalOpen(true)
    },
    [revealPathRationale],
  )

  const handleContactSubmit = useCallback(
    async ({ contact, consents }) => {
      if (!session || !contactIntentPath) return

      setContactSubmitting(true)
      setContactError(null)

      try {
        const result = await submitContactIntent({
          session: {
            id: session.id,
            query: session.query,
            selections: currentSelections,
            refinementTrail: session.refinementTrail,
          },
          activePathId: contactIntentPath.id,
          contact,
          consents,
        })

        const zoneFrame = [...(session.refinementTrail ?? [])]
          .reverse()
          .find((frame) => frame.questionId === 'refinement_zone')
        setContactZoneLabel(zoneFrame?.label ?? session.query)
        setContactMatches(result.matches ?? [])
        setContactOffline(Boolean(result._offline))
        setContactModalOpen(false)
        setContactResultsOpen(true)
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : (error?.message ?? CONTACT_INTENT_COPY.errorGeneric)
        setContactError(message)
      } finally {
        setContactSubmitting(false)
      }
    },
    [session, contactIntentPath, currentSelections],
  )

  const handleBroadenZone = useCallback(() => {
    setContactResultsOpen(false)
    setActiveRefinementKey('zone')
    document.getElementById('nando-companion')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handlePathSelect = useCallback(
    (path) => {
      if (!path?.id) return
      revealPathRationale(path.id)
    },
    [revealPathRationale],
  )

  const handleDiscoverAutonomy = useCallback(
    (path) => {
      if (path?.id) {
        revealPathRationale(path.id)
      }
      setAutonomyModalOpen(true)
    },
    [revealPathRationale],
  )

  const handleNandoAction = useCallback(
    (action) => {
      if (action.id === 'explain_why') {
        const targetId = activePathId ?? paths[0]?.id
        if (targetId) {
          revealPathRationale(targetId)
        }
        return
      }
      if (action.id === 'discover_autonomy' || action.id === 'refine_autonomy') {
        setAutonomyModalOpen(true)
        return
      }
      if (action.refinementKey) {
        handleRefinementChipClick(action.refinementKey)
        return
      }
      setActionNotice({
        title: action.label,
        message: 'Funzione in arrivo — nel frattempo usa i percorsi suggeriti sopra.',
      })
    },
    [activePathId, paths, revealPathRationale, handleRefinementChipClick],
  )

  const handleNewSearch = useCallback(() => {
    navigate('/')
  }, [navigate])

  const assistantPanelProps = {
    question: refinementQuestion,
    customNotes: session?.customNotes ?? '',
    actions: nandoActions,
    refinementChips,
    activeRefinementKey,
    onRefinementChipClick: handleRefinementChipClick,
    onRefinementAnswer: handleRefinementSelect,
    onRefinementDismiss: () => setActiveRefinementKey(null),
    microPrompt: orchestratorNando?.microPrompt,
    activePath: activePath
      ? {
          id: activePath.id,
          name: activePath.name ?? activePath.title,
          whyRecommended: activePath.whyRecommended,
        }
      : null,
    showRationale: showPathRationale && Boolean(activePath),
    canGoBack,
    canGoForward,
    onBack: handleBack,
    onForward: handleForward,
    onSelectOption: handleRefinementSelect,
    onCustomSubmit: handleCustomSubmit,
    onActionClick: handleNandoAction,
    loading: nandoLoading || orchestrationLoading,
    error: nandoError || orchestrationError,
  }

  if (!sessionIdParam && queryParam?.trim()) {
    return <ExploreLoadingSkeleton />
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
            articles={editorialArticles.slice(0, 3)}
            animate={shouldAnimate}
            className="mt-10"
            highlighted={isEditorialPathActive}
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

      <main className="relative z-10 mx-auto max-w-6xl overflow-x-hidden px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 lg:px-8">
        <SectionBlob variant="coral" shape="circle" position="top-right" />
        <SectionBlob variant="violet" shape="blob" position="bottom-left" />

        <div className="relative z-10 space-y-10 sm:space-y-14 lg:space-y-16">
          {!isMobile ? (
            <SearchAssistantIntegrated
              panelProps={assistantPanelProps}
              defaultExpanded={startedParam}
            />
          ) : null}

          <SolutionPostItGrid
            solutions={paths}
            animate={shouldAnimate}
            onSolutionAction={handleSolutionAction}
            onPathSelect={handlePathSelect}
            onDiscoverAutonomy={handleDiscoverAutonomy}
            onContactStructures={openContactIntent}
            answeredSelections={currentSelections}
            query={session.query}
            activePathId={activePathId}
            expandedWhyId={expandedWhyId}
            onToggleWhy={(id) => setExpandedWhyId((prev) => (prev === id ? null : id))}
          />

          {isMobile ? <SearchAssistantMobile panelProps={assistantPanelProps} /> : null}

          <EditorialInsightsSection
            articles={editorialArticles}
            animate={shouldAnimate}
            highlighted={isEditorialPathActive}
          />
        </div>
      </main>

      <ActionNoticeModal
        open={Boolean(actionNotice)}
        title={actionNotice?.title ?? ''}
        message={actionNotice?.message ?? ''}
        onClose={() => setActionNotice(null)}
      />

      <AutonomyLevelModal
        open={autonomyModalOpen}
        pathName={activePath?.name ?? activePath?.title ?? ''}
        onClose={() => setAutonomyModalOpen(false)}
        onSelect={handleAutonomySelect}
      />

      <ContactIntentModal
        open={contactModalOpen}
        path={contactIntentPath}
        session={session}
        selections={currentSelections}
        loading={contactSubmitting}
        error={contactError}
        onClose={() => {
          if (contactSubmitting) return
          setContactModalOpen(false)
          setContactError(null)
        }}
        onSubmit={handleContactSubmit}
      />

      <ContactMatchResultsModal
        open={contactResultsOpen}
        matches={contactMatches}
        zoneLabel={contactZoneLabel}
        loading={contactSubmitting}
        error={contactError}
        offline={contactOffline}
        onClose={() => {
          setContactResultsOpen(false)
          setContactMatches([])
          setContactOffline(false)
        }}
        onBroadenZone={handleBroadenZone}
      />
    </div>
  )
}
