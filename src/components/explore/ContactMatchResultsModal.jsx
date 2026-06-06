import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, X } from 'lucide-react'
import MatchCard from '../results/MatchCard'
import MatchDetailsDrawer from '../results/MatchDetailsDrawer'
import { CONTACT_INTENT_COPY } from '../../constants/siteCopy'

const DEFAULT_MATCH_IMAGE =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop&q=80'

function normalizeMatch(match) {
  return {
    ...match,
    image: match.image || DEFAULT_MATCH_IMAGE,
  }
}

/**
 * Matched structures after explicit contact intent — real API data only.
 */
export default function ContactMatchResultsModal({
  open,
  matches = [],
  zoneLabel = '',
  loading = false,
  error = null,
  offline = false,
  onClose,
  onBroadenZone,
}) {
  const closeRef = useRef(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setSelectedMatch(null)
    setDetailsOpen(false)
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

  if (!open) return null

  const normalizedMatches = matches.map(normalizeMatch)
  const hasMatches = normalizedMatches.length > 0

  const openDetails = (match) => {
    setSelectedMatch(match)
    setDetailsOpen(true)
  }

  return (
    <>
      <div
        className="explore-modal-shell fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-results-title"
      >
        <button
          type="button"
          className="explore-modal-backdrop absolute inset-0"
          aria-label="Chiudi"
        onClick={handleClose}
      />

      <div className="explore-modal-panel relative flex max-h-[min(92dvh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span className="explore-modal-handle" aria-hidden />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800/80">
              {CONTACT_INTENT_COPY.resultsTitle}
            </p>
            <h2 id="contact-results-title" className="text-lg font-semibold text-slate-800 sm:text-xl">
              {zoneLabel ? `Opzioni vicino a ${zoneLabel}` : 'Strutture compatibili'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {CONTACT_INTENT_COPY.resultsSubtitle}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
              className="explore-touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:h-8 sm:w-8 sm:rounded-lg"
              aria-label="Chiudi"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-teal-800" />
                <p className="text-sm">{CONTACT_INTENT_COPY.submitting}</p>
              </div>
            ) : error ? (
              <p className="rounded-xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm text-red-950" role="alert">
                {error}
              </p>
            ) : offline ? (
              <p className="rounded-xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-sm text-amber-950" role="status">
                {CONTACT_INTENT_COPY.offlineNotice}
              </p>
            ) : hasMatches ? (
              <div
                className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
                role="list"
                aria-label={`${normalizedMatches.length} strutture trovate`}
              >
                {normalizedMatches.map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    index={index}
                    onDetails={openDetails}
                    onSave={undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 px-5 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-slate-800">{CONTACT_INTENT_COPY.emptyTitle}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                  {CONTACT_INTENT_COPY.emptyBody}
                </p>
                {onBroadenZone ? (
                  <button
                    type="button"
                    onClick={onBroadenZone}
                    className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-900"
                  >
                    {CONTACT_INTENT_COPY.emptyAction}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="explore-modal-panel__footer shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {CONTACT_INTENT_COPY.closeResults}
            </button>
          </div>
        </div>
      </div>

      <MatchDetailsDrawer match={selectedMatch} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  )
}
