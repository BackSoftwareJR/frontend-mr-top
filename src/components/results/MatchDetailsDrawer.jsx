import { Check, MapPin, Phone } from 'lucide-react'
import InfoDrawer from '../ui/InfoDrawer'

export default function MatchDetailsDrawer({ match, open, onClose }) {
  if (!match) return null

  return (
    <InfoDrawer open={open} onClose={onClose} title={match.name}>
      <div className="space-y-6">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-teal-800">
            {match.type}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
            <span>{match.location}</span>
          </div>
          {(match.coversZone || match.spatialMatch) && (
            <p className="mt-2 rounded-xl border border-teal-800/15 bg-teal-800/[0.05] px-3 py-2 text-xs font-medium text-teal-900">
              {match.distanceKm != null
                ? `Questa struttura copre la tua zona di interesse (circa ${Math.round(match.distanceKm)} km dal centro dell'area).`
                : 'Questa struttura copre la tua zona di interesse.'}
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{match.description}</p>

        {match.pros?.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Punti di forza
            </h3>
            <ul className="space-y-2.5">
              {match.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.contactHint && (
          <div className="rounded-xl border border-teal-800/10 bg-teal-800/[0.04] px-4 py-3.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-teal-800">
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
              Come contattare
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{match.contactHint}</p>
          </div>
        )}
      </div>
    </InfoDrawer>
  )
}
