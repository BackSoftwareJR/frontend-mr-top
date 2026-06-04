import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'
import { wizardOfflineLocations } from '../data/wizardConfig'

const MIN_QUERY_LENGTH = 2

function slugifyCity(city, province) {
  const normalized = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  return `${normalized}-${province.toLowerCase()}`
}

function mapSuggestion(suggestion) {
  return {
    label: suggestion.label,
    value: slugifyCity(suggestion.city, suggestion.province),
    city: suggestion.city,
    province: suggestion.province,
    region: suggestion.region,
    lat: suggestion.lat ?? null,
    lng: suggestion.lng ?? null,
    type: suggestion.type ?? 'comune',
    meta: suggestion.meta ?? {},
  }
}

function mapGeoResult(result) {
  const meta = result.meta ?? {}
  const city = meta.city ?? result.label?.split(',')[0]?.trim() ?? result.label
  const province = meta.province ?? 'IT'

  return {
    label: result.label,
    value: slugifyCity(city, province),
    city,
    province,
    region: meta.region ?? '',
    lat: result.lat,
    lng: result.lng,
    type: result.type ?? 'comune',
    meta,
  }
}

function filterOfflineLocations(query) {
  const normalized = query.trim().toLowerCase()

  if (normalized.length < MIN_QUERY_LENGTH) {
    return []
  }

  return wizardOfflineLocations.filter((loc) =>
    loc.label.toLowerCase().includes(normalized),
  )
}

/**
 * GET /geo/search — structured geo search for wizard map step.
 * @param {string} query
 * @param {{ limit?: number, country?: string }} [options]
 */
export async function searchGeoPlaces(query, options = {}) {
  const trimmed = query.trim()

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return []
  }

  if (!isApiConfigured()) {
    return filterOfflineLocations(trimmed)
  }

  const response = await apiClient.get('/geo/search', {
    params: {
      q: trimmed,
      limit: options.limit ?? 10,
      country: options.country ?? 'it',
    },
  })
  const data = unwrapApiData(response)
  const results = Array.isArray(data?.results) ? data.results : []

  return results.map(mapGeoResult)
}

/**
 * GET /geo/reverse — reverse geocode coordinates to label.
 */
export async function reverseGeocode(lat, lng) {
  if (!isApiConfigured()) {
    return { label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng, meta: {} }
  }

  const response = await apiClient.get('/geo/reverse', {
    params: { lat, lng },
  })
  return unwrapApiData(response)
}

/**
 * GET /b2c/locations/autocomplete — legacy prefix search.
 * @param {string} query
 */
export async function searchLocations(query) {
  const trimmed = query.trim()

  if (trimmed.length < MIN_QUERY_LENGTH) {
    return []
  }

  if (!isApiConfigured()) {
    return filterOfflineLocations(trimmed)
  }

  const response = await apiClient.get('/b2c/locations/autocomplete', {
    params: { q: trimmed },
  })
  const data = unwrapApiData(response)
  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : []

  return suggestions.map(mapSuggestion)
}

export const DEFAULT_INTEREST_RADIUS_KM = 15

export function createCircleArea({ lat, lng, label = '', radiusKm = DEFAULT_INTEREST_RADIUS_KM }) {
  return {
    id: crypto.randomUUID(),
    type: 'circle',
    centerLat: lat,
    centerLng: lng,
    radiusKm,
    label,
  }
}

export function interestAreasToPayload(areas) {
  return areas.map((area) => {
    if (area.type === 'polygon') {
      return {
        type: 'polygon',
        geometry: area.geometry,
        center_lat: area.centerLat ?? null,
        center_lng: area.centerLng ?? null,
        label: area.label || null,
      }
    }

    return {
      type: 'circle',
      center_lat: area.centerLat,
      center_lng: area.centerLng,
      radius_km: area.radiusKm ?? DEFAULT_INTEREST_RADIUS_KM,
      label: area.label || null,
    }
  })
}
