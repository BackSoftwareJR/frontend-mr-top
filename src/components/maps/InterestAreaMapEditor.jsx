import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ChevronUp, Circle, Hexagon, Loader2, MapPin, Search, Trash2, X } from 'lucide-react'
import { MotionDiv } from '../../utils/motionProxy'
import { getMapStyleUrl } from '../../services/coverageZoneService'
import { searchGeoPlaces, DEFAULT_INTEREST_RADIUS_KM } from '../../services/locationService'
import {
  createCircleGeoJSON,
  fitMapToCircle,
} from '../../utils/mapCircleGeoJson'

const ITALY_CENTER = { lng: 12.5, lat: 41.9 }
const DEFAULT_ZOOM = 6
const MIN_RADIUS = 1
const MAX_RADIUS = 80

const AREAS_SOURCE = 'interest-areas'
const DRAFT_SOURCE = 'interest-draft'

function normalizeAreas(areas) {
  if (!Array.isArray(areas)) return []
  return areas.map((area) => ({
    id: area.id ?? crypto.randomUUID(),
    type: area.type ?? 'circle',
    centerLat: Number(area.centerLat ?? area.center_lat ?? ITALY_CENTER.lat),
    centerLng: Number(area.centerLng ?? area.center_lng ?? ITALY_CENTER.lng),
    radiusKm: Number(area.radiusKm ?? area.radius_km ?? DEFAULT_INTEREST_RADIUS_KM),
    label: area.label ?? '',
    geometry: area.geometry ?? area.geometry_json ?? null,
  }))
}

function buildAreasFeatureCollection(areas) {
  const features = []

  areas.forEach((area, index) => {
    if (area.type === 'polygon' && area.geometry) {
      features.push({
        type: 'Feature',
        geometry: area.geometry,
        properties: { id: area.id, index, kind: 'polygon' },
      })
      return
    }

    features.push({
      ...createCircleGeoJSON(area.centerLng, area.centerLat, area.radiusKm),
      properties: { id: area.id, index, kind: 'circle' },
    })
  })

  return { type: 'FeatureCollection', features }
}

function polygonCentroid(ring) {
  if (!Array.isArray(ring) || ring.length === 0) {
    return ITALY_CENTER
  }

  let lat = 0
  let lng = 0

  ring.forEach(([x, y]) => {
    lng += x
    lat += y
  })

  return { lng: lng / ring.length, lat: lat / ring.length }
}

function closePolygonRing(points) {
  if (points.length < 3) return null

  const ring = points.map(([lng, lat]) => [lng, lat])
  const first = ring[0]
  const last = ring[ring.length - 1]

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first])
  }

  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

export default function InterestAreaMapEditor({ areas = [], onChange, className = '' }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const areasRef = useRef(normalizeAreas(areas))
  const searchRef = useRef(null)
  const searchTimerRef = useRef(null)
  const draftPointsRef = useRef([])
  const modeRef = useRef('search')
  const draftRadiusRef = useRef(DEFAULT_INTEREST_RADIUS_KM)

  const [localAreas, setLocalAreas] = useState(() => normalizeAreas(areas))
  const [mode, setMode] = useState('search')
  const [activeAreaId, setActiveAreaId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [draftRadius, setDraftRadius] = useState(DEFAULT_INTEREST_RADIUS_KM)
  const [draftPoints, setDraftPoints] = useState([])
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const emitChange = useCallback(
    (nextAreas) => {
      areasRef.current = nextAreas
      setLocalAreas(nextAreas)
      onChange?.(nextAreas)
    },
    [onChange],
  )

  const refreshMapData = useCallback((nextAreas, draft = draftPointsRef.current) => {
    const map = mapRef.current
    if (!map?.getSource(AREAS_SOURCE)) return

    map.getSource(AREAS_SOURCE).setData(buildAreasFeatureCollection(nextAreas))

    const draftFeatures = []

    if (draft.length > 0) {
      draftFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: draft,
        },
        properties: { kind: 'draft-line' },
      })

      draft.forEach(([lng, lat]) => {
        draftFeatures.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { kind: 'draft-point' },
        })
      })
    }

    map.getSource(DRAFT_SOURCE).setData({
      type: 'FeatureCollection',
      features: draftFeatures,
    })
  }, [])

  useEffect(() => {
    areasRef.current = normalizeAreas(areas)
    // Sync controlled prop into local editor state when parent updates.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled map editor mirror
    setLocalAreas(normalizeAreas(areas))
  }, [areas])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    draftRadiusRef.current = draftRadius
  }, [draftRadius])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleUrl(),
      center: [ITALY_CENTER.lng, ITALY_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      maxBounds: [[-11, 34], [25, 72]],
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      map.addSource(AREAS_SOURCE, {
        type: 'geojson',
        data: buildAreasFeatureCollection(areasRef.current),
      })
      map.addSource(DRAFT_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      map.addLayer({
        id: 'interest-areas-fill',
        type: 'fill',
        source: AREAS_SOURCE,
        paint: {
          'fill-color': '#0d9488',
          'fill-opacity': 0.16,
        },
      })
      map.addLayer({
        id: 'interest-areas-outline',
        type: 'line',
        source: AREAS_SOURCE,
        paint: {
          'line-color': '#0d9488',
          'line-width': 2,
        },
      })
      map.addLayer({
        id: 'interest-draft-line',
        type: 'line',
        source: DRAFT_SOURCE,
        filter: ['==', ['get', 'kind'], 'draft-line'],
        paint: {
          'line-color': '#115e59',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      })
      map.addLayer({
        id: 'interest-draft-points',
        type: 'circle',
        source: DRAFT_SOURCE,
        filter: ['==', ['get', 'kind'], 'draft-point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#115e59',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })
    })

    map.doubleClickZoom.disable()

    map.on('dblclick', (event) => {
      event.preventDefault()
      if (modeRef.current !== 'polygon' || draftPointsRef.current.length < 3) {
        return
      }

      const geometry = closePolygonRing(draftPointsRef.current)
      if (!geometry) return

      const centroid = polygonCentroid(geometry.coordinates[0])
      const nextArea = {
        id: crypto.randomUUID(),
        type: 'polygon',
        centerLat: centroid.lat,
        centerLng: centroid.lng,
        radiusKm: DEFAULT_INTEREST_RADIUS_KM,
        label: 'Area personalizzata',
        geometry,
      }

      const nextAreas = [...areasRef.current, nextArea]
      emitChange(nextAreas)
      draftPointsRef.current = []
      setDraftPoints([])
      setMode('search')
      refreshMapData(nextAreas, [])
    })

    map.on('click', (event) => {
      const { lat, lng } = event.lngLat
      const currentMode = modeRef.current

      if (currentMode === 'circle') {
        const nextArea = {
          id: crypto.randomUUID(),
          type: 'circle',
          centerLat: lat,
          centerLng: lng,
          radiusKm: draftRadiusRef.current,
          label: '',
        }
        const nextAreas = [...areasRef.current, nextArea]
        emitChange(nextAreas)
        refreshMapData(nextAreas)
        fitMapToCircle(map, lng, lat, draftRadiusRef.current)
        return
      }

      if (currentMode === 'polygon') {
        const nextPoints = [...draftPointsRef.current, [lng, lat]]
        draftPointsRef.current = nextPoints
        setDraftPoints(nextPoints)
        refreshMapData(areasRef.current, nextPoints)
      }
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [emitChange, draftRadius, refreshMapData])

  useEffect(() => {
    refreshMapData(localAreas, draftPoints)
  }, [localAreas, draftPoints, refreshMapData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchInput = (event) => {
    const query = event.target.value
    setSearchQuery(query)

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }

    if (query.trim().length < 2) {
      setSearchResults([])
      setSearchLoading(false)
      setSearchOpen(false)
      return
    }

    searchTimerRef.current = window.setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchGeoPlaces(query.trim())
        setSearchResults(results)
        setSearchOpen(results.length > 0)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  const handleSelectSearchResult = (result) => {
    const nextArea = {
      id: crypto.randomUUID(),
      type: 'circle',
      centerLat: result.lat,
      centerLng: result.lng,
      radiusKm: DEFAULT_INTEREST_RADIUS_KM,
      label: result.label,
    }

    const nextAreas = [...areasRef.current, nextArea]
    emitChange(nextAreas)
    setSearchQuery('')
    setSearchOpen(false)
    setSearchResults([])

    if (mapRef.current) {
      fitMapToCircle(mapRef.current, result.lng, result.lat, DEFAULT_INTEREST_RADIUS_KM)
    }
  }

  const removeArea = (areaId) => {
    const nextAreas = areasRef.current.filter((area) => area.id !== areaId)
    emitChange(nextAreas)
    if (activeAreaId === areaId) {
      setActiveAreaId(null)
    }
  }

  const finishPolygon = useCallback(() => {
    const geometry = closePolygonRing(draftPointsRef.current)

    if (!geometry) return

    const centroid = polygonCentroid(geometry.coordinates[0])
    const nextArea = {
      id: crypto.randomUUID(),
      type: 'polygon',
      centerLat: centroid.lat,
      centerLng: centroid.lng,
      radiusKm: DEFAULT_INTEREST_RADIUS_KM,
      label: 'Area personalizzata',
      geometry,
    }

    const nextAreas = [...areasRef.current, nextArea]
    emitChange(nextAreas)
    draftPointsRef.current = []
    setDraftPoints([])
    setMode('search')
    refreshMapData(nextAreas, [])
  }, [emitChange, refreshMapData])

  const cancelPolygon = () => {
    draftPointsRef.current = []
    setDraftPoints([])
    refreshMapData(areasRef.current, [])
  }

  const activeArea = localAreas.find((area) => area.id === activeAreaId)

  const updateActiveRadius = (radiusKm) => {
    if (!activeArea || activeArea.type !== 'circle') return

    const nextAreas = localAreas.map((area) =>
      area.id === activeArea.id
        ? { ...area, radiusKm: Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Number(radiusKm))) }
        : area,
    )
    emitChange(nextAreas)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div ref={searchRef} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-teal-800">
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
        <input
          type="search"
          data-testid="interest-area-search"
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
          placeholder="Cerca comune, provincia o CAP…"
          className="w-full rounded-2xl border border-slate-200/50 bg-white/70 py-3.5 pl-11 pr-4 text-base font-medium text-slate-800 shadow-sm backdrop-blur-xl transition-colors placeholder:text-slate-400 focus:border-teal-800/30 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-800/15"
          aria-label="Cerca località"
        />

        {searchOpen && searchResults.length > 0 && (
          <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-200/50 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
            {searchResults.map((result) => (
              <li key={`${result.type}-${result.label}-${result.lat}`}>
                <button
                  type="button"
                  data-testid="interest-area-search-result"
                  onClick={() => handleSelectSearchResult(result)}
                  className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition-colors hover:bg-teal-800/[0.04]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-800" />
                  <span>
                    <span className="block font-medium">{result.label}</span>
                    <span className="text-xs capitalize text-slate-500">{result.type}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'search', label: 'Cerca', icon: Search },
          { id: 'circle', label: 'Cerchio', icon: Circle },
          { id: 'polygon', label: 'Poligono', icon: Hexagon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id)
              if (id !== 'polygon') {
                cancelPolygon()
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === id
                ? 'border-teal-800/25 bg-teal-800/[0.08] text-teal-800'
                : 'border-slate-200/60 bg-white/70 text-slate-600 hover:border-teal-800/20'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'circle' && (
        <div className="rounded-2xl border border-slate-200/50 bg-white/60 px-4 py-3 text-sm text-slate-600 backdrop-blur-xl">
          <p className="font-medium text-slate-800">Modalità cerchio</p>
          <p className="mt-1 text-xs">Clicca sulla mappa per aggiungere un&apos;area circolare.</p>
          <label htmlFor="draft-radius" className="mt-3 block text-xs font-medium text-slate-700">
            Raggio nuove aree: {draftRadius.toFixed(1)} km
          </label>
          <input
            id="draft-radius"
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step="0.5"
            value={draftRadius}
            onChange={(event) => setDraftRadius(Number(event.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-teal-800/15 accent-teal-800"
          />
        </div>
      )}

      {mode === 'polygon' && (
        <div className="rounded-2xl border border-slate-200/50 bg-white/60 px-4 py-3 backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-800">Modalità poligono</p>
          <p className="mt-1 text-xs text-slate-600">
            Clicca per aggiungere vertici ({draftPoints.length} punti). Doppio clic o
            &quot;Completa area&quot; per chiudere il poligono (minimo 3 punti).
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={finishPolygon}
              disabled={draftPoints.length < 3}
              className="rounded-xl border border-teal-800/20 bg-teal-800/[0.06] px-3 py-1.5 text-xs font-semibold text-teal-800 disabled:opacity-40"
            >
              Completa area
            </button>
            <button
              type="button"
              onClick={cancelPolygon}
              className="rounded-xl border border-slate-200/60 px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/50 shadow-sm">
        <div
          ref={mapContainerRef}
          className="h-[280px] w-full sm:h-[360px] lg:h-[420px]"
          aria-label="Mappa aree di interesse"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Aree selezionate</p>
          <span className="text-xs text-slate-500">{localAreas.length}</span>
        </div>

        {localAreas.length === 0 ? (
          <MotionDiv
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-slate-200/70 bg-white/50 px-4 py-6 text-center text-sm text-slate-500"
          >
            <p className="font-medium text-slate-700">Nessuna area ancora</p>
            <p className="mt-1 text-xs leading-relaxed">
              Cerca un comune, oppure disegna un cerchio o un poligono sulla mappa.
            </p>
          </MotionDiv>
        ) : (
          <div className="flex flex-wrap gap-2">
            {localAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveAreaId(area.id === activeAreaId ? null : area.id)}
                className={`group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
                  activeAreaId === area.id
                    ? 'border-teal-800/30 bg-teal-800/[0.08] text-teal-900'
                    : 'border-slate-200/60 bg-white/70 text-slate-700 hover:border-teal-800/20'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {area.label || (area.type === 'polygon' ? 'Poligono' : `${area.radiusKm} km`)}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    removeArea(area.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.stopPropagation()
                      removeArea(area.id)
                    }
                  }}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Rimuovi area"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}

        {activeArea?.type === 'circle' && (
          <div className="rounded-2xl border border-slate-200/50 bg-white/60 px-4 py-3 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-700">
              Raggio area selezionata: {activeArea.radiusKm.toFixed(1)} km
            </p>
            <input
              type="range"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step="0.5"
              value={activeArea.radiusKm}
              onChange={(event) => updateActiveRadius(event.target.value)}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-teal-800/15 accent-teal-800"
            />
          </div>
        )}
      </div>

      {localAreas.length > 0 && (
        <MotionDiv
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-slate-200/60 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden"
          data-testid="interest-area-mobile-sheet"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => setMobileSheetOpen((open) => !open)}
            aria-expanded={mobileSheetOpen}
          >
            <span className="text-xs font-semibold text-slate-700">
              {localAreas.length} {localAreas.length === 1 ? 'area selezionata' : 'aree selezionate'}
            </span>
            <ChevronUp
              className={`h-4 w-4 text-slate-500 transition-transform ${mobileSheetOpen ? '' : 'rotate-180'}`}
            />
          </button>
          {mobileSheetOpen && (
            <div className="max-h-36 space-y-2 overflow-y-auto px-4 pb-4">
              {localAreas.map((area) => (
                <div
                  key={`mobile-${area.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-teal-800/[0.04] px-3 py-2 text-xs text-teal-900"
                >
                  <span className="truncate">{area.label || (area.type === 'polygon' ? 'Poligono' : `${area.radiusKm} km`)}</span>
                  <button type="button" onClick={() => removeArea(area.id)} aria-label="Rimuovi">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </MotionDiv>
      )}
    </div>
  )
}
