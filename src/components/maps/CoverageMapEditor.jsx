import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Loader2, MapPin, Search } from 'lucide-react'
import { obGlassCardSm, obInput, obLabel } from '../b2b/onboardingStyles'
import { getDefaultCoverageZone, getMapStyleUrl } from '../../services/coverageZoneService'
import { searchGeoPlaces } from '../../services/locationService'
import {
  createCenterPointGeoJSON,
  createCircleGeoJSON,
  fitMapToCircle,
} from '../../utils/mapCircleGeoJson'

const ITALY_CENTER = { lng: 12.5, lat: 41.9 }
const DEFAULT_ZOOM = 6
const MIN_RADIUS = 0.5
const MAX_RADIUS = 80

const CIRCLE_SOURCE = 'coverage-circle'
const CENTER_SOURCE = 'coverage-center'

function normalizeValue(value) {
  if (!value) {
    return getDefaultCoverageZone()
  }

  return {
    centerLat: Number(value.centerLat ?? value.center_lat ?? ITALY_CENTER.lat),
    centerLng: Number(value.centerLng ?? value.center_lng ?? ITALY_CENTER.lng),
    radiusKm: Number(value.radiusKm ?? value.radius_km ?? 15),
    label: value.label ?? '',
    geocodePlaceId: value.geocodePlaceId ?? value.geocode_place_id ?? null,
    geocodeMeta: value.geocodeMeta ?? value.geocode_meta ?? null,
  }
}

function ensureMapLayers(map) {
  if (!map.getSource(CIRCLE_SOURCE)) {
    map.addSource(CIRCLE_SOURCE, {
      type: 'geojson',
      data: createCircleGeoJSON(ITALY_CENTER.lng, ITALY_CENTER.lat, 15),
    })
    map.addLayer({
      id: 'coverage-circle-fill',
      type: 'fill',
      source: CIRCLE_SOURCE,
      paint: {
        'fill-color': '#0d9488',
        'fill-opacity': 0.18,
      },
    })
    map.addLayer({
      id: 'coverage-circle-outline',
      type: 'line',
      source: CIRCLE_SOURCE,
      paint: {
        'line-color': '#0d9488',
        'line-width': 2,
      },
    })
  }

  if (!map.getSource(CENTER_SOURCE)) {
    map.addSource(CENTER_SOURCE, {
      type: 'geojson',
      data: createCenterPointGeoJSON(ITALY_CENTER.lng, ITALY_CENTER.lat),
    })
    map.addLayer({
      id: 'coverage-center-point',
      type: 'circle',
      source: CENTER_SOURCE,
      paint: {
        'circle-radius': 7,
        'circle-color': '#0d9488',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    })
  }
}

function updateMapGeometry(map, zone) {
  if (!map?.getSource(CIRCLE_SOURCE)) return

  map.getSource(CIRCLE_SOURCE).setData(
    createCircleGeoJSON(zone.centerLng, zone.centerLat, zone.radiusKm),
  )
  map.getSource(CENTER_SOURCE).setData(
    createCenterPointGeoJSON(zone.centerLng, zone.centerLat),
  )
}

export default function CoverageMapEditor({ value, onChange, readOnly = false, className = '' }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const zoneRef = useRef(normalizeValue(value))
  const searchRef = useRef(null)
  const searchTimerRef = useRef(null)

  const [zone, setZone] = useState(() => normalizeValue(value))
  const [searchQuery, setSearchQuery] = useState(zone.label || '')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const emitChange = useCallback(
    (nextZone) => {
      zoneRef.current = nextZone
      setZone(nextZone)
      onChange?.(nextZone)
    },
    [onChange],
  )

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleUrl(),
      center: [zoneRef.current.centerLng, zoneRef.current.centerLat],
      zoom: zoneRef.current.label ? 9 : DEFAULT_ZOOM,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      ensureMapLayers(map)
      updateMapGeometry(map, zoneRef.current)
      if (zoneRef.current.label) {
        fitMapToCircle(map, zoneRef.current.centerLng, zoneRef.current.centerLat, zoneRef.current.radiusKm)
      }
    })

    if (!readOnly) {
      map.on('click', (event) => {
        const nextZone = {
          ...zoneRef.current,
          centerLat: event.lngLat.lat,
          centerLng: event.lngLat.lng,
        }
        updateMapGeometry(map, nextZone)
        emitChange(nextZone)
      })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [emitChange, readOnly])

  useEffect(() => {
    if (readOnly) return undefined

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [readOnly])

  const handleSearchInput = (event) => {
    const query = event.target.value
    setSearchQuery(query)
    setSearchOpen(false)

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }

    if (query.trim().length < 2) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    searchTimerRef.current = window.setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchGeoPlaces(query.trim(), { limit: 6 })
        setSearchResults(results)
        setSearchOpen(results.length > 0)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  const handleRadiusChange = (radiusKm) => {
    const nextZone = {
      ...zoneRef.current,
      radiusKm: Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Number(radiusKm))),
    }
    if (mapRef.current) {
      updateMapGeometry(mapRef.current, nextZone)
    }
    emitChange(nextZone)
  }

  const handleSelectResult = (result) => {
    const nextZone = {
      ...zoneRef.current,
      centerLat: result.lat,
      centerLng: result.lng,
      label: result.label,
      geocodePlaceId: result.meta?.osm_id ? String(result.meta.osm_id) : null,
      geocodeMeta: result.meta ?? null,
    }

    setSearchQuery(result.label)
    setSearchOpen(false)
    setSearchResults([])

    if (mapRef.current) {
      updateMapGeometry(mapRef.current, nextZone)
      fitMapToCircle(mapRef.current, result.lng, result.lat, nextZone.radiusKm)
    }

    emitChange(nextZone)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!readOnly && (
        <div ref={searchRef} className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-accent-teal-dark">
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            placeholder="Cerca comune, provincia, CAP o indirizzo…"
            className={`${obInput} pl-11 shadow-sm backdrop-blur-xl`}
            aria-label="Cerca località"
          />

          {searchOpen && searchResults.length > 0 && (
            <ul className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-black/5 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
              {searchResults.map((result) => (
                <li key={`${result.type}-${result.label}-${result.lat}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-charcoal transition-colors hover:bg-accent-teal/10"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-teal-dark" />
                    <span>
                      <span className="block font-medium">{result.label}</span>
                      <span className="text-xs capitalize text-charcoal-muted">{result.type}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-black/5 shadow-sm">
        <div ref={mapContainerRef} className="h-[320px] w-full sm:h-[420px]" aria-label="Mappa zona di copertura" />
      </div>

      <div className={obGlassCardSm}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-charcoal">Raggio di copertura</p>
            <p className="text-xs text-charcoal-muted">
              {readOnly
                ? 'Area operativa configurata per la struttura.'
                : 'Cerca un comune o clicca sulla mappa per spostare il centro della zona.'}
            </p>
          </div>
          <span className="rounded-full bg-accent-teal/10 px-3 py-1 text-sm font-semibold text-accent-teal-dark">
            {zone.radiusKm.toFixed(1)} km
          </span>
        </div>

        {!readOnly && (
          <div className="mt-4">
            <label htmlFor="coverage-radius" className={obLabel}>
              Regola il raggio (max {MAX_RADIUS} km)
            </label>
            <input
              id="coverage-radius"
              type="range"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step="0.5"
              value={zone.radiusKm}
              onChange={(event) => handleRadiusChange(event.target.value)}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-accent-teal/15 accent-accent-teal-dark"
            />
            <div className="mt-1 flex justify-between text-[11px] text-charcoal-muted">
              <span>{MIN_RADIUS} km</span>
              <span>{MAX_RADIUS} km</span>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-2 rounded-2xl bg-warm-cream/80 px-3 py-3 text-xs text-charcoal-muted sm:grid-cols-3">
          <div>
            <span className="font-medium text-charcoal">Centro</span>
            <p>{zone.centerLat.toFixed(5)}, {zone.centerLng.toFixed(5)}</p>
          </div>
          <div>
            <span className="font-medium text-charcoal">Etichetta</span>
            <p>{zone.label || 'Non impostata'}</p>
          </div>
          <div>
            <span className="font-medium text-charcoal">Raggio</span>
            <p>{zone.radiusKm.toFixed(1)} km</p>
          </div>
        </div>
      </div>
    </div>
  )
}
