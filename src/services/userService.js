import apiClient, { isApiConfigured, unwrapApiData, withDevMockFallback } from './apiClient'
import {
  getLatestSearch as getMockLatestSearch,
  getUserDisplayName as getMockDisplayName,
  getUserSearches as getMockUserSearches,
} from '../data/mockUserSearches'
import { getSavedMatchIds } from '../utils/savedMatches'

/** @param {Record<string, unknown>} apiSearch */
function mapSearch(apiSearch) {
  return {
    id: apiSearch.id,
    leadUuid: apiSearch.lead_uuid ?? apiSearch.leadUuid ?? null,
    title: apiSearch.title ?? 'Ricerca',
    location: apiSearch.location ?? '',
    date: apiSearch.date ?? '',
    status: apiSearch.status ?? 'processing',
    matchCount: apiSearch.match_count ?? apiSearch.matchCount ?? 0,
    answers: apiSearch.answers ?? apiSearch.payload ?? null,
  }
}

/** @param {Record<string, unknown>} user */
function mapUser(user) {
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
  }
}

/** @param {Record<string, unknown>} apiMatch */
export function mapApiMatch(apiMatch) {
  return {
    id: String(apiMatch.id ?? apiMatch.company_id ?? ''),
    name: apiMatch.name ?? '',
    type: apiMatch.type ?? '',
    location: apiMatch.location ?? '',
    compatibility: apiMatch.compatibility ?? 0,
    image: apiMatch.image_url ?? apiMatch.image ?? '',
    description: apiMatch.description ?? '',
    pros: Array.isArray(apiMatch.pros) ? apiMatch.pros : [],
    contactHint: apiMatch.contact_hint ?? apiMatch.contactHint ?? '',
    companyId: apiMatch.company_id ?? null,
  }
}

export async function fetchUserHome() {
  const response = await apiClient.get('/user/home')
  const data = unwrapApiData(response)
  return {
    displayName: data.display_name ?? data.displayName ?? getMockDisplayName(),
    latestSearch: data.latest_search ? mapSearch(data.latest_search) : null,
  }
}

export async function fetchUserSearches(page = 1) {
  const response = await apiClient.get('/user/searches', { params: { page } })
  const data = unwrapApiData(response)
  const searches = Array.isArray(data.searches) ? data.searches : []
  return searches.map(mapSearch)
}

export async function fetchUserSearch(id) {
  const response = await apiClient.get(`/user/searches/${id}`)
  const data = unwrapApiData(response)
  return {
    search: data.search ? mapSearch(data.search) : null,
    matches: Array.isArray(data.matches) ? data.matches.map(mapApiMatch) : [],
  }
}

export async function updateUserProfile({ name, phone }) {
  const response = await apiClient.patch('/user/profile', { name, phone })
  const data = unwrapApiData(response)
  return mapUser(data.user ?? data)
}

export async function fetchSavedMatchIds() {
  const response = await apiClient.get('/user/saved-matches')
  const data = unwrapApiData(response)
  const ids = data.ids ?? data.saved_ids ?? []
  return Array.isArray(ids) ? ids.map(String) : []
}

export async function toggleSavedMatchApi({ companyId, leadMatchId }) {
  const response = await apiClient.post('/user/saved-matches', {
    company_id: companyId ?? undefined,
    lead_match_id: leadMatchId ?? undefined,
  })
  const data = unwrapApiData(response)
  return Boolean(data.saved)
}

export function fetchUserHomeWithFallback() {
  if (!isApiConfigured()) {
    return Promise.resolve({
      displayName: getMockDisplayName(),
      latestSearch: getMockLatestSearch(),
    })
  }
  return withDevMockFallback(
    fetchUserHome,
    () => ({
      displayName: getMockDisplayName(),
      latestSearch: getMockLatestSearch(),
    }),
    'User home',
  )
}

export function fetchUserSearchesWithFallback() {
  if (!isApiConfigured()) {
    return Promise.resolve(getMockUserSearches())
  }
  return withDevMockFallback(fetchUserSearches, () => getMockUserSearches(), 'User searches')
}

export function fetchSavedMatchIdsWithFallback() {
  if (!isApiConfigured()) {
    return Promise.resolve(getSavedMatchIds())
  }
  return withDevMockFallback(fetchSavedMatchIds, () => getSavedMatchIds(), 'Saved matches')
}
