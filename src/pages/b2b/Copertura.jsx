import { useCallback, useEffect, useState } from 'react'
import { Loader2, MapPinned, Save } from 'lucide-react'
import CoverageMapEditor from '../../components/maps/CoverageMapEditor'
import {
  b2bCard,
  b2bIconAccent,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
} from '../../components/b2b/b2bStyles'
import { isApiConfigured } from '../../services/apiClient'
import {
  fetchCoverageZone,
  getDefaultCoverageZone,
  isCoverageZoneComplete,
  saveCoverageZone,
} from '../../services/coverageZoneService'
import { useB2B } from '../../context/B2BContext'

export default function Copertura() {
  const { showToast } = useB2B()
  const [zone, setZone] = useState(getDefaultCoverageZone())
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchCoverageZone()
      .then((loaded) => {
        if (!cancelled && loaded) {
          setZone(loaded)
        }
      })
      .catch(() => {
        if (!cancelled) showToast('Impossibile caricare la zona di copertura.', 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [showToast])

  const handleSave = useCallback(async () => {
    if (!isCoverageZoneComplete(zone) || saving) return

    setSaving(true)
    try {
      const saved = await saveCoverageZone(zone)
      setZone(saved)
      showToast('Zona di copertura aggiornata.', 'success')
    } catch (err) {
      showToast(err?.message ?? 'Salvataggio non riuscito.', 'error')
    } finally {
      setSaving(false)
    }
  }, [zone, saving, showToast])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className={b2bIconAccent}>
            <MapPinned className="h-5 w-5" />
          </span>
          <div>
            <h1 className={b2bPageTitle}>Zona di copertura</h1>
            <p className={b2bPageSubtitle}>
              Aggiorna l&apos;area operativa della struttura per il matching geografico dei lead.
            </p>
          </div>
        </div>
      </div>

      <div className={b2bCard}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-charcoal-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Caricamento mappa…
          </div>
        ) : (
          <CoverageMapEditor
          key={`${zone.centerLat}-${zone.centerLng}-${zone.radiusKm}-${zone.label || 'zone'}`}
          value={zone}
          onChange={setZone}
        />
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving || !isCoverageZoneComplete(zone)}
          className={`${b2bPrimaryBtn} sm:!w-auto sm:min-w-[180px] disabled:opacity-60`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvataggio…' : 'Salva zona'}
        </button>
      </div>
    </div>
  )
}
