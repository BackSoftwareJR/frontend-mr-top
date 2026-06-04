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
 * GET /b2c/locations/autocomplete — prefix search for wizard location step.
 * @param {string} query
 * @returns {Promise<Array<{ label: string, value: string, city: string, province: string, region: string }>>}
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
