import { useEffect, useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Loader2, X as XIcon } from 'lucide-react'
import AuroraBackground from '../components/layout/AuroraBackground'
import SectionBlob from '../components/ui/SectionBlob'
import GlassCard from '../components/ui/GlassCard'
import MatchCard from '../components/results/MatchCard'
import MatchDetailsDrawer from '../components/results/MatchDetailsDrawer'
import AdvisorCard from '../components/results/AdvisorCard'
import BookingSheet from '../components/results/BookingSheet'
import PersonalAreaCta from '../components/results/PersonalAreaCta'
import PostSearchBenefits from '../components/results/PostSearchBenefits'
import PostSearchJourney from '../components/results/PostSearchJourney'
import { WenandoMark } from '../components/ui/WenandoLogo'
import { useAuth } from '../context/AuthContext'
import { PERSONAL_AREA_HOME } from '../constants/consumerJourney'
import {
  getDiagnosis,
  careComparison,
  autonomyLabels,
} from '../data/autonomyInfo'
import { getMatchesForLocation, mockAdvisor } from '../data/mockMatches'
import { fetchLeadResultsWithFallback } from '../services/leadService'
import {
  fetchSavedMatchIdsWithFallback,
  toggleSavedMatchWithFallback,
} from '../services/userService'
import { ApiError, getBearerToken, isApiConfigured } from '../services/apiClient'
import UserLoadError from '../components/user/UserLoadError'
import { getSavedMatchIds, isMatchSaved, toggleSavedMatch } from '../utils/savedMatches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
}

function ComparisonTable({ primaryColumn }) {
  const { domiciliare, rsa } = careComparison
  const highlightDomiciliare = primaryColumn === 'domiciliare'
  const highlightRsa = primaryColumn === 'rsa'

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/40" role="region" aria-label="Confronto assistenza domiciliare e RSA">
      <div className="grid grid-cols-2 border-b border-slate-200/50" role="row">
        <div
          role="columnheader"
          className={`px-4 py-3.5 sm:px-5 ${
            highlightDomiciliare ? 'bg-teal-800/[0.04]' : 'bg-slate-50/60'
          }`}
        >
          <span className="text-xs font-semibold tracking-wide text-teal-800">
            {domiciliare.label}
          </span>
          {highlightDomiciliare && (
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-teal-800/70">
              Consigliato
            </span>
          )}
        </div>
        <div
          role="columnheader"
          className={`border-l border-slate-200/50 px-4 py-3.5 sm:px-5 ${
            highlightRsa ? 'bg-teal-800/[0.04]' : 'bg-slate-50/60'
          }`}
        >
          <span className="text-xs font-semibold tracking-wide text-slate-600">
            {rsa.label}
          </span>
          {highlightRsa && (
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-teal-800/70">
              Consigliato
            </span>
          )}
        </div>
      </div>

      <ComparisonBlock
        label="Vantaggi"
        left={domiciliare.pros}
        right={rsa.pros}
        positive
      />
      <ComparisonBlock
        label="Da considerare"
        left={domiciliare.cons}
        right={rsa.cons}
      />
    </div>
  )
}

function ComparisonBlock({ label, left, right, positive = false }) {
  const Icon = positive ? Check : XIcon
  const iconClass = positive ? 'text-emerald-500' : 'text-slate-400'

  return (
    <div className="border-t border-slate-200/50">
      <div className="bg-slate-50/40 px-4 py-2 sm:px-5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <ComparisonCell items={left} Icon={Icon} iconClass={iconClass} />
        <ComparisonCell items={right} Icon={Icon} iconClass={iconClass} bordered />
      </div>
    </div>
  )
}

function ComparisonCell({ items, Icon, iconClass, bordered = false }) {
  return (
    <ul
      className={`space-y-2.5 px-4 py-4 sm:px-5 ${
        bordered ? 'border-l border-slate-200/50' : ''
      }`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconClass}`} strokeWidth={2.5} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const { isAuthenticated, userType } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const answers = location.state?.answers
  const isConsumerLoggedIn = isAuthenticated && userType === 'consumer'
  const personalAreaTo = isConsumerLoggedIn ? PERSONAL_AREA_HOME : '/accedi'
  const personalAreaState = isConsumerLoggedIn ? undefined : { from: PERSONAL_AREA_HOME }
  const leadUuid = location.state?.leadUuid ?? answers?._leadUuid

  const [selectedMatch, setSelectedMatch] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loading, setLoading] = useState(Boolean(leadUuid))
  const [diagnosis, setDiagnosis] = useState(null)
  const [matches, setMatches] = useState([])
  const [advisor, setAdvisor] = useState(mockAdvisor)
  const [savedIds, setSavedIds] = useState(() => getSavedMatchIds())
  const [bookingNotice, setBookingNotice] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!answers?.autonomy) return

    let cancelled = false

    async function loadResults() {
      setLoading(true)
      setLoadError(null)
      try {
        const result = await fetchLeadResultsWithFallback(leadUuid, answers)
        if (cancelled) return
        setDiagnosis(result.diagnosis ?? getDiagnosis(answers.autonomy))
        const useMockMatches = !isApiConfigured() || result._mock
        setMatches(
          result.matches?.length
            ? result.matches
            : useMockMatches
              ? getMatchesForLocation(answers.location?.label || 'la tua zona')
              : [],
        )
        setAdvisor(result.advisor ?? mockAdvisor)
      } catch (error) {
        if (cancelled) return
        console.error('[Wenando] Results load failed:', error)
        if (isApiConfigured()) {
          const message =
            error instanceof ApiError
              ? error.message
              : (error?.message ?? 'Impossibile caricare i risultati.')
          setLoadError(message)
          return
        }
        setDiagnosis(getDiagnosis(answers.autonomy))
        setMatches(getMatchesForLocation(answers.location?.label || 'la tua zona'))
        setAdvisor(mockAdvisor)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadResults()
    return () => {
      cancelled = true
    }
  }, [answers, leadUuid, retryCount])

  useEffect(() => {
    if (!isApiConfigured() || !getBearerToken()) return
    fetchSavedMatchIdsWithFallback().then(setSavedIds).catch(() => {})
  }, [])

  if (!answers?.autonomy) {
    return <Navigate to="/wizard" replace />
  }

  const resolvedDiagnosis = diagnosis ?? getDiagnosis(answers.autonomy)
  const autonomyLabel = autonomyLabels[answers.autonomy] || answers.autonomy
  const locationLabel = answers.location?.label || 'la tua zona'
  const primaryColumn =
    resolvedDiagnosis.primary === 'RSA' ? 'rsa' : 'domiciliare'
  const userName = answers.contact?.nome || ''

  const handleSaveMatch = async (match) => {
    const matchId = String(match.id)
    if (isApiConfigured() && getBearerToken()) {
      try {
        const saved = await toggleSavedMatchWithFallback({
          companyId: match.companyId ?? match.id,
          leadMatchId: match.id,
          matchId,
        })
        setSavedIds((prev) =>
          saved
            ? [...new Set([...prev, matchId])]
            : prev.filter((id) => id !== matchId),
        )
        setSaveError(null)
        return
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Impossibile salvare la struttura. Riprova.'
        setSaveError(message)
        return
      }
    }
    toggleSavedMatch(match.id)
    setSavedIds(getSavedMatchIds())
  }

  const openDetails = (match) => {
    setSelectedMatch(match)
    setDetailsOpen(true)
  }

  const closeDetails = () => {
    setDetailsOpen(false)
  }

  const motionContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants

  const motionSectionVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : sectionVariants

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <SectionBlob variant="coral" shape="circle" position="top-right" />
      <SectionBlob variant="violet" shape="blob" position="bottom-left" />

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#FDFBF7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link
            to={isConsumerLoggedIn ? '/area-personale/ricerche' : '/wizard'}
            className="inline-flex min-h-[3rem] items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">
              {isConsumerLoggedIn ? 'Le tue ricerche' : 'Indietro'}
            </span>
          </Link>
          <Link to="/area-personale/home" aria-label="Area personale Wenando" className="shrink-0">
            <WenandoMark className="h-8 w-8" />
          </Link>
          <Link
            to="/wizard"
            className="inline-flex min-h-[3rem] items-center px-1 text-sm font-medium text-slate-500 transition-colors hover:text-teal-800"
          >
            Modifica
          </Link>
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 ${
          !loading && !loadError ? 'pb-28 sm:pb-16' : ''
        }`}
      >
        {leadUuid && (
          <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Rif. {leadUuid.slice(0, 8)}…
          </p>
        )}

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : spring}
          className="mb-14 sm:mb-16"
        >
          <p className="mb-2 text-sm font-medium tracking-wide text-teal-800">
            Piano personalizzato · {locationLabel}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-[2rem] sm:leading-tight">
            Ecco il piano per te.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Salva le strutture che ti interessano, poi continua nell&apos;area personale per
            confrontarle con calma e avviare una nuova ricerca quando vuoi.
          </p>
          {!loading && !loadError ? (
            <div className="mt-6">
              <PersonalAreaCta isAuthenticated={isConsumerLoggedIn} />
            </div>
          ) : null}
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-teal-800" />
            <p className="text-sm">Caricamento risultati…</p>
          </div>
        ) : loadError && isApiConfigured() ? (
          <UserLoadError
            message={loadError}
            onRetry={() => setRetryCount((n) => n + 1)}
          />
        ) : (
          <motion.div
            variants={motionContainerVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            className="space-y-16 sm:space-y-20"
          >
            <motion.section variants={motionSectionVariants}>
              <PostSearchJourney
                personalAreaTo={personalAreaTo}
                personalAreaState={personalAreaState}
              />
            </motion.section>

            <motion.section variants={motionSectionVariants}>
              <PostSearchBenefits />
            </motion.section>

            <motion.section variants={motionSectionVariants}>
              <GlassCard
                hover={false}
                className="border-white/20 bg-white/70 p-6 shadow-none sm:p-9"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-800">
                  La nostra analisi
                </div>
                <h2 className="mb-4 max-w-2xl text-lg font-semibold leading-snug text-slate-800 sm:text-xl">
                  Per un&apos;autonomia {autonomyLabel.toLowerCase()}, consigliamo{' '}
                  <span className="text-teal-800">{resolvedDiagnosis.recommendation}</span>.
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                  {resolvedDiagnosis.summary}
                </p>

                <ComparisonTable primaryColumn={primaryColumn} />

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-teal-800/20 bg-teal-800/[0.06] px-3 py-1 text-xs font-medium text-teal-800">
                    Consigliato: {resolvedDiagnosis.primary}
                  </span>
                  <span className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1 text-xs font-medium text-slate-500">
                    Alternativa: {resolvedDiagnosis.secondary}
                  </span>
                </div>
              </GlassCard>
            </motion.section>

            <motion.section variants={motionSectionVariants}>
              {saveError ? (
                <p
                  className="mb-4 rounded-xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm leading-relaxed text-red-950"
                  role="alert"
                >
                  {saveError}
                </p>
              ) : null}

              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                    Le migliori opzioni
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Selezionate in base alle tue risposte
                  </p>
                </div>
                <span className="hidden shrink-0 text-xs font-medium text-slate-400 sm:block">
                  Top {matches.length}
                </span>
              </div>

              <div
                className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
                role="list"
                aria-label={`${matches.length} opzioni consigliate`}
              >
                {matches.map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    index={index}
                    onDetails={openDetails}
                    onSave={handleSaveMatch}
                    initialSaved={savedIds.includes(String(match.id)) || isMatchSaved(match.id)}
                  />
                ))}
              </div>
            </motion.section>

            <motion.section variants={motionSectionVariants}>
              <div className="mb-7">
                <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                  Un consulente che capisce
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Parla con qualcuno che ha già affrontato questa scelta.
                </p>
              </div>

              {bookingNotice ? (
                <p
                  className="mb-4 rounded-xl border border-emerald-200/70 bg-emerald-50/90 px-4 py-3 text-sm leading-relaxed text-emerald-950"
                  role="status"
                >
                  {bookingNotice}
                </p>
              ) : null}

              <AdvisorCard
                advisor={advisor}
                onBookCall={() => setBookingOpen(true)}
              />
            </motion.section>

            <motion.section variants={motionSectionVariants}>
              <GlassCard
                hover={false}
                className="border-teal-800/10 bg-gradient-to-br from-teal-800/[0.06] to-white/70 p-6 text-center sm:p-9"
              >
                <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                  Pronto a continuare?
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                  {isConsumerLoggedIn
                    ? 'Apri l’area personale per ritrovare questa ricerca, i preferiti e i prossimi passi.'
                    : 'Accedi con la tua email per salvare tutto in un unico posto — ci vogliono pochi secondi.'}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <PersonalAreaCta isAuthenticated={isConsumerLoggedIn} />
                  <Link
                    to="/wizard"
                    className="inline-flex min-h-[3rem] items-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-teal-800 ring-1 ring-teal-800/25 transition-colors hover:bg-teal-800/[0.06]"
                  >
                    Nuova ricerca
                  </Link>
                </div>
              </GlassCard>
            </motion.section>
          </motion.div>
        )}
      </main>

      {!loading && !loadError ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-[#FDFBF7]/90 px-4 py-3 backdrop-blur-xl sm:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <PersonalAreaCta isAuthenticated={isConsumerLoggedIn} className="!w-full !justify-center" />
        </div>
      ) : null}

      <MatchDetailsDrawer
        match={selectedMatch}
        open={detailsOpen}
        onClose={closeDetails}
      />

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultName={userName}
        advisorName={advisor.name}
        leadUuid={leadUuid}
        onSuccess={() => {
          setBookingNotice('Prenotazione confermata. Riceverai un riepilogo via email.')
        }}
      />
    </div>
  )
}
