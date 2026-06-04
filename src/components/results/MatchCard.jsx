import { useState } from 'react'
import { Heart, MapPin, ChevronRight } from 'lucide-react'
import { MotionArticle, MotionButton } from '../../utils/motionProxy'
import { isMatchSaved, toggleSavedMatch } from '../../utils/savedMatches'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

export default function MatchCard({ match, index = 0, onSave, onDetails, initialSaved }) {
  const [saved, setSaved] = useState(() =>
    initialSaved !== undefined ? initialSaved : isMatchSaved(match.id),
  )

  const handleSave = async () => {
    if (onSave) {
      const nextSaved = !saved
      setSaved(nextSaved)
      await onSave(match, nextSaved)
      return
    }
    const isSaved = toggleSavedMatch(match.id)
    setSaved(isSaved)
  }

  return (
    <MotionArticle
      data-testid="match-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.08 }}
      whileTap={{ scale: 0.97 }}
      className="group flex w-[272px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:w-auto"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={match.image}
          alt={match.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full border border-emerald-200/50 bg-emerald-50/95 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-700 backdrop-blur-sm">
          {match.compatibility}% Compatibilità
        </span>
        {match.coversZone ? (
          <span
            className="absolute left-3 top-3 rounded-full border border-teal-200/60 bg-teal-50/95 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-teal-800 backdrop-blur-sm"
            data-testid="match-covers-zone-badge"
          >
            {match.distanceKm != null
              ? `Zona coperta · ~${Math.round(match.distanceKm)} km`
              : 'Zona coperta'}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-teal-800">
          {match.type}
        </p>
        <h3 className="mb-2 text-base font-semibold leading-snug text-slate-800">
          {match.name}
        </h3>

        <div className="mb-5 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
          <span>{match.location}</span>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <MotionButton
            type="button"
            onClick={handleSave}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            aria-pressed={saved}
            aria-label={saved ? 'Rimuovi dai salvati' : 'Salva'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              saved
                ? 'border-rose-200/80 bg-rose-50/80 text-rose-600'
                : 'border-slate-200/60 bg-white/60 text-slate-600 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`}
              strokeWidth={2}
            />
            Salva
          </MotionButton>

          <MotionButton
            type="button"
            onClick={() => onDetails?.(match)}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="inline-flex flex-1 items-center justify-center gap-0.5 rounded-lg border border-slate-200/60 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-800/25 hover:text-teal-800"
          >
            Dettagli
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </MotionButton>
        </div>
      </div>
    </MotionArticle>
  )
}
