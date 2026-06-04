import { useEffect, useState } from 'react'
import { MapPinned } from 'lucide-react'
import CoverageMapEditor from '../../maps/CoverageMapEditor'
import { obGlassCard } from '../onboardingStyles'
import {
  fetchCoverageZone,
  getDefaultCoverageZone,
  isCoverageZoneComplete,
} from '../../../services/coverageZoneService'

export default function StepCoverageZone({ value, onChange }) {
  const [zone, setZone] = useState(() => value ?? getDefaultCoverageZone())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchCoverageZone()
      .then((loaded) => {
        if (cancelled) return
        const next = loaded ?? getDefaultCoverageZone()
        setZone(next)
        onChange?.(next)
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = value ?? getDefaultCoverageZone()
          setZone(fallback)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [onChange, value])

  const handleChange = (nextZone) => {
    setZone(nextZone)
    onChange?.(nextZone)
  }

  return (
    <div className="space-y-4">
      <div className={obGlassCard}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal-dark">
            <MapPinned className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Dove operi?</h3>
            <p className="mt-1 text-sm leading-relaxed text-charcoal-muted">
              Definisci l&apos;area geografica in cui la struttura può accettare richieste. Puoi
              impostare un solo cerchio di copertura, con raggio massimo di 80 km.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-black/5 bg-white/70 px-6 py-16 text-center text-sm text-charcoal-muted">
          Caricamento mappa…
        </div>
      ) : (
        <CoverageMapEditor
          key={`${zone.centerLat}-${zone.centerLng}-${zone.radiusKm}-${zone.label || 'zone'}`}
          value={zone}
          onChange={handleChange}
        />
      )}

      {!loading && !isCoverageZoneComplete(zone) && (
        <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          Seleziona il centro sulla mappa e imposta un raggio valido per continuare.
        </p>
      )}
    </div>
  )
}
