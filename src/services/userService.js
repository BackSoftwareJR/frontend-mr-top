import apiClient, { unwrapApiData } from './apiClient'
import { userWithOfflineMock } from './userApiUtils'
import { mapLeadMatch } from './leadService'
import {
  getLatestSearch as getMockLatestSearch,
  getUserDisplayName as getMockDisplayName,
  getUserSearches as getMockUserSearches,
} from '../data/mockUserSearches'
import { getSavedMatchIds, toggleSavedMatch } from '../utils/savedMatches'

/** @param {Record<string, unknown>} apiSearch */
function mapSearch(apiSearch) {
  return {
    id: apiSearch.id,
    leadUuid: apiSearch.lead_uuid ?? apiSearch.leadUuid ?? null,
    publicRef: apiSearch.public_ref ?? apiSearch.publicRef ?? null,
    title: apiSearch.title ?? apiSearch.need_summary ?? 'Ricerca assistenza',
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
  return mapLeadMatch(apiMatch)
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
  const body = response.data
  const data = unwrapApiData(response)
  const searches = Array.isArray(data.searches) ? data.searches : []
  const meta = body?.meta ?? {}
  return {
    searches: searches.map(mapSearch),
    meta: {
      page: meta.page ?? page,
      perPage: meta.per_page ?? meta.perPage ?? 20,
      total: meta.total ?? searches.length,
      lastPage: meta.last_page ?? meta.lastPage ?? 1,
    },
  }
}

export async function fetchUserSearch(id) {
  const response = await apiClient.get(`/user/searches/${id}`)
  const data = unwrapApiData(response)
  return {
    search: data.search ? mapSearch(data.search) : null,
    matches: Array.isArray(data.matches) ? data.matches.map(mapApiMatch) : [],
  }
}

export async function fetchUserProfile() {
  const response = await apiClient.get('/user/profile')
  const data = unwrapApiData(response)
  return mapUser(data.user ?? data)
}

/** @param {string|number} leadRef — lead uuid or public_ref */
export async function updateUserSearchTitle(leadRef, title) {
  const response = await apiClient.patch(`/user/searches/${leadRef}`, { title })
  const data = unwrapApiData(response)
  return data.search ? mapSearch(data.search) : null
}

export async function updateUserProfile({ name, phone }) {
  const response = await apiClient.patch('/user/profile', { name, phone })
  const data = unwrapApiData(response)
  return mapUser(data.user ?? data)
}

/**
 * POST /user/privacy/erase-request — GDPR Art. 17 erasure request.
 * @param {{ reason?: string }} [params]
 */
export async function requestDataErasure({ reason } = {}) {
  const response = await apiClient.post('/user/privacy/erase-request', {
    confirmed: true,
    reason: reason ?? undefined,
  })
  return unwrapApiData(response)
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

/** @param {{ companyId?: string|number, leadMatchId?: string|number, matchId: string|number }} params */
export function toggleSavedMatchWithFallback({ companyId, leadMatchId, matchId }) {
  return userWithOfflineMock(
    () => toggleSavedMatchApi({ companyId, leadMatchId }),
    () => toggleSavedMatch(String(matchId)),
  )
}

export function fetchUserHomeWithFallback() {
  return userWithOfflineMock(fetchUserHome, () => ({
    displayName: getMockDisplayName(),
    latestSearch: getMockLatestSearch(),
  }))
}

export function fetchUserSearchesWithFallback(page = 1) {
  return userWithOfflineMock(
    () => fetchUserSearches(page),
    () => {
      const searches = getMockUserSearches()
      return {
        searches,
        meta: { page: 1, perPage: 20, total: searches.length, lastPage: 1 },
      }
    },
  )
}

function findMockSearch(ref) {
  const searches = getMockUserSearches()
  return searches.find(
    (search) =>
      String(search.id) === String(ref) ||
      String(search.publicRef ?? '') === String(ref) ||
      String(search.leadUuid ?? '') === String(ref),
  )
}

export function fetchUserSearchWithFallback(ref) {
  return userWithOfflineMock(
    () => fetchUserSearch(ref),
    () => {
      const search = findMockSearch(ref)
      if (!search) {
        return Promise.reject(new Error('Ricerca non trovata.'))
      }
      return { search, matches: [] }
    },
  )
}

export function fetchSavedMatchIdsWithFallback() {
  return userWithOfflineMock(fetchSavedMatchIds, () => getSavedMatchIds())
}
