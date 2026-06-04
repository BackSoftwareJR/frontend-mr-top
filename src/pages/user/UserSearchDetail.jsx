import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
} from 'lucide-react'
import MatchCard from '../../components/results/MatchCard'
import MatchDetailsDrawer from '../../components/results/MatchDetailsDrawer'
import SearchTitleInlineEdit from '../../components/user/SearchTitleInlineEdit'
import UserLoadError from '../../components/user/UserLoadError'
import {
  fetchSavedMatchIdsWithFallback,
  fetchUserSearchWithFallback,
  toggleSavedMatchWithFallback,
} from '../../services/userService'
import { ApiError, getBearerToken, isApiConfigured } from '../../services/apiClient'
import { getMatchesForLocation } from '../../data/mockMatches'
import { getSavedMatchIds, isMatchSaved, toggleSavedMatch } from '../../utils/savedMatches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

export default function UserSearchDetail() {
  const { ref } = useParams()
  const prefersReducedMotion = useReducedMotion()
  const [search, setSearch] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [saveError, setSaveError] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [savedIds, setSavedIds] = useState(() => getSavedMatchIds())

  useEffect(() => {
    if (!ref) return

    let cancelled = false
    async function load() {
      if (isApiConfigured()) {
        setLoading(true)
        setLoadError(null)
      }
      try {
        const { search: data, matches: apiMatches } = await fetchUserSearchWithFallback(ref)
        if (cancelled) return
        setSearch(data)
        if (apiMatches?.length) {
          setMatches(apiMatches)
        } else if (!isApiConfigured() && data?.status === 'completed' && data?.answers) {
          setMatches(
            getMatchesForLocation(data.location || data.answers?.location?.label || 'la tua zona').slice(
              0,
              data.matchCount || 3,
            ),
          )
        } else {
          setMatches([])
        }
      } catch (err) {
        if (!cancelled && isApiConfigured()) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare la ricerca. Verifica la connessione e riprova.',
          )
        } else if (!cancelled) {
          setLoadError('Impossibile caricare la ricerca.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ref, retryCount])

  useEffect(() => {
    if (!isApiConfigured() || !getBearerToken()) return
    fetchSavedMatchIdsWithFallback().then(setSavedIds).catch(() => {})
  }, [])

  if (!ref) {
    return <Navigate to="/area-personale/ricerche" replace />
  }

  const isProcessing = search?.status === 'processing'

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

  return (
    <div className="space-y-8">
      <header>
        <Link
          to="/area-personale/ricerche"
          className="mb-4 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Le mie ricerche
        </Link>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-800" aria-hidden />
            <span className="text-sm">Caricamento…</span>
          </div>
        ) : loadError ? (
          <UserLoadError message={loadError} onRetry={() => setRetryCount((n) => n + 1)} />
        ) : search ? (
          <>
            <SearchTitleInlineEdit
              search={search}
              titleClassName="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl"
              onRenamed={(updated) => setSearch((current) => (current ? { ...current, ...updated } : current))}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {search.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden />
                  {search.location}
                </span>
              ) : null}
              {search.date ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden />
                  {search.date}
                </span>
              ) : null}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  isProcessing
                    ? 'bg-amber-500/[0.1] text-amber-900 ring-amber-500/20'
                    : 'bg-emerald-500/[0.1] text-emerald-800 ring-emerald-500/20'
                }`}
              >
                {isProcessing ? (
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                )}
                {isProcessing ? 'In elaborazione' : 'Risultati pronti'}
              </span>
            </div>
          </>
        ) : null}
      </header>

      {!loading && !loadError && search ? (
        isProcessing ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="rounded-3xl border border-black/[0.06] bg-white/75 px-6 py-10 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl"
          >
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-800" aria-hidden />
            <p className="mt-4 text-base font-medium text-slate-800">
              Stiamo analizzando le tue risposte
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Ti avviseremo quando le strutture consigliate saranno disponibili.
            </p>
          </motion.div>
        ) : matches.length === 0 ? (
          <p className="rounded-3xl border border-black/[0.06] bg-white/75 px-6 py-8 text-center text-sm text-slate-600">
            Nessuna struttura disponibile per questa ricerca.
          </p>
        ) : (
          <section>
            {saveError ? (
              <p
                className="mb-4 rounded-xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm leading-relaxed text-red-950"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {matches.length}{' '}
              {matches.length === 1 ? 'struttura consigliata' : 'strutture consigliate'}
            </h2>
            <div
              className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
              role="list"
            >
              {matches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  onDetails={(item) => {
                    setSelectedMatch(item)
                    setDetailsOpen(true)
                  }}
                  onSave={handleSaveMatch}
                  initialSaved={savedIds.includes(String(match.id)) || isMatchSaved(match.id)}
                />
              ))}
            </div>
          </section>
        )
      ) : null}

      <MatchDetailsDrawer
        match={selectedMatch}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  )
}
