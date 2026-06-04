import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'

const DEFAULT_ZONE = {
  centerLat: 41.9028,
  centerLng: 12.4964,
  radiusKm: 15,
  label: '',
  geocodePlaceId: null,
  geocodeMeta: null,
}

/** @param {Record<string, unknown>|null} zone */
export function mapCoverageZone(zone) {
  if (!zone) {
    return null
  }

  return {
    centerLat: Number(zone.center_lat ?? zone.centerLat ?? DEFAULT_ZONE.centerLat),
    centerLng: Number(zone.center_lng ?? zone.centerLng ?? DEFAULT_ZONE.centerLng),
    radiusKm: Number(zone.radius_km ?? zone.radiusKm ?? DEFAULT_ZONE.radiusKm),
    label: zone.label ?? '',
    geocodePlaceId: zone.geocode_place_id ?? zone.geocodePlaceId ?? null,
    geocodeMeta: zone.geocode_meta ?? zone.geocodeMeta ?? null,
  }
}

/** @param {Record<string, unknown>|null|undefined} zone */
export function coverageZoneToApi(zone) {
  if (!zone) {
    return null
  }

  return {
    center_lat: zone.centerLat ?? zone.center_lat,
    center_lng: zone.centerLng ?? zone.center_lng,
    radius_km: zone.radiusKm ?? zone.radius_km,
    label: zone.label || null,
    geocode_place_id: zone.geocodePlaceId ?? zone.geocode_place_id ?? null,
    geocode_meta: zone.geocodeMeta ?? zone.geocode_meta ?? null,
  }
}

export function isCoverageZoneComplete(zone) {
  if (!zone) return false
  const lat = Number(zone.centerLat ?? zone.center_lat)
  const lng = Number(zone.centerLng ?? zone.center_lng)
  const radius = Number(zone.radiusKm ?? zone.radius_km)
  return Number.isFinite(lat) && Number.isFinite(lng) && radius >= 0.5 && radius <= 80
}

export async function fetchCoverageZone() {
  if (!isApiConfigured()) {
    return mapCoverageZone(DEFAULT_ZONE)
  }

  const response = await apiClient.get('/b2b/coverage-zone')
  const data = unwrapApiData(response)
  return mapCoverageZone(data.coverage_zone)
}

export async function saveCoverageZone(zone) {
  const body = coverageZoneToApi(zone)

  if (!isApiConfigured()) {
    return mapCoverageZone(body)
  }

  const response = await apiClient.put('/b2b/coverage-zone', body)
  const data = unwrapApiData(response)
  return mapCoverageZone(data.coverage_zone)
}

export async function deleteCoverageZone() {
  if (!isApiConfigured()) {
    return true
  }

  const response = await apiClient.delete('/b2b/coverage-zone')
  unwrapApiData(response)
  return true
}

export function getDefaultCoverageZone() {
  return { ...DEFAULT_ZONE }
}

export function getMapStyleUrl() {
  return import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty'
}
