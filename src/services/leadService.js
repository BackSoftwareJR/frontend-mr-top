import apiClient, { getBearerToken, isApiConfigured, unwrapApiData } from './apiClient'
import { cachedRequest, invalidateRequestCache } from '../lib/requestCache'
import { userWithOfflineMock } from './userApiUtils'
import { getDiagnosis } from '../data/autonomyInfo'
import { getMatchesForLocation, mockAdvisor } from '../data/mockMatches'
import { mapAdvisor } from './advisorService'
import { getSession } from './authService'
import { recordWizardConsents, getSessionId } from './consentService'
import { CONSENT_TEXT_HASH } from '../constants/wizardConsent'
import { LEGAL_VERSION } from '../constants/legalVersions'
import { wizardConfig } from '../data/wizardConfig'
import { interestAreasToPayload } from './locationService'

/** localStorage key for wizard lead awaiting consumer login attach */
export const PENDING_LEAD_KEY = 'wenando-pending-lead-uuid'

/** Dispatched after POST /user/leads succeeds; detail = attach API payload */
export const LEAD_ATTACHED_EVENT = 'wenando:lead-attached'

function notifyLeadAttached(data) {
  if (!data?.user || typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LEAD_ATTACHED_EVENT, { detail: data }))
}

export function storePendingLeadUuid(uuid) {
  if (!uuid) return
  localStorage.setItem(PENDING_LEAD_KEY, uuid)
}

export function getPendingLeadUuid() {
  try {
    return localStorage.getItem(PENDING_LEAD_KEY)
  } catch {
    return null
  }
}

export function clearPendingLeadUuid() {
  localStorage.removeItem(PENDING_LEAD_KEY)
}

function isConsumerAuthenticated() {
  const session = getSession()
  return session?.type === 'consumer' && Boolean(getBearerToken())
}

/**
 * POST /user/leads — link anonymous wizard lead to authenticated consumer.
 * @returns {Promise<{ lead: { uuid: string, status: string }, user?: { name: string, phone: string|null, email: string } }|null>}
 */
export async function attachPendingLead() {
  const leadUuid = getPendingLeadUuid()
  if (!leadUuid || !isApiConfigured()) {
    return null
  }

  try {
    const response = await apiClient.post('/user/leads', { lead_uuid: leadUuid })
    const data = unwrapApiData(response)
    clearPendingLeadUuid()
    invalidateRequestCache('user:')
    notifyLeadAttached(data)
    return data
  } catch (error) {
    console.warn('[Wenando] Pending lead attach failed:', error)
    return null
  }
}

/** @param {Record<string, unknown>} apiMatch */
export function mapLeadMatch(apiMatch) {
  return {
    id: String(apiMatch.id ?? apiMatch.company_id ?? ''),
    name: apiMatch.name ?? '',
    type: apiMatch.type ?? '',
    location: apiMatch.location ?? '',
    compatibility: apiMatch.compatibility ?? 0,
    image: apiMatch.image_url ?? apiMatch.image ?? '',
    tagline: apiMatch.tagline ?? '',
    description: apiMatch.description ?? '',
    pros: Array.isArray(apiMatch.pros) ? apiMatch.pros : [],
    contactHint: apiMatch.contact_hint ?? apiMatch.contactHint ?? '',
    companyId: apiMatch.company_id ?? null,
    coversZone: apiMatch.covers_zone ?? apiMatch.coversZone ?? false,
    spatialMatch: apiMatch.spatial_match ?? apiMatch.spatialMatch ?? false,
    distanceKm: apiMatch.distance_km ?? apiMatch.distanceKm ?? null,
  }
}

/**
 * Map wizard answers to POST /b2c/leads body (StoreLeadRequest).
 * Contact is nested under payload.contact; backend denormalizes to contact_name / contact_phone / contact_email.
 *
 * @param {Record<string, unknown>} answers
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean, marketing?: boolean }} consents
 */
function resolveWizardBudget(answers) {
  const raw = answers.budget
  const min = raw?.min != null ? Number(raw.min) : null
  const max = raw?.max != null ? Number(raw.max) : null
  if (Number.isFinite(min) && Number.isFinite(max)) {
    return { min, max }
  }

  const budgetStep = wizardConfig.steps.find((s) => s.id === 'budget')
  if (budgetStep?.defaultMin != null && budgetStep?.defaultMax != null) {
    return { min: budgetStep.defaultMin, max: budgetStep.defaultMax }
  }

  return undefined
}

export function mapWizardToLeadPayload(answers, consents) {
  const contact = { ...answers.contact }
  const email = typeof contact.email === 'string' ? contact.email.trim() : ''
  if (email) {
    contact.email = email
  } else {
    delete contact.email
  }

  const budget = resolveWizardBudget(answers)
  const interestAreas = answers.location?.interestAreas ?? answers.location?.areas ?? []

  return {
    sector_slug: 'senior-care',
    payload: {
      autonomy: answers.autonomy,
      location: answers.location,
      interest_areas: interestAreas.length > 0 ? interestAreasToPayload(interestAreas) : undefined,
      budget,
      contact,
    },
    consent: {
      privacy_accepted: consents.privacy === true,
      terms_accepted: consents.terms === true,
      lead_sharing_accepted: consents.partnerContact === true,
      marketing_accepted: consents.marketing === true,
    },
    session_id: getSessionId(),
    policy_version: LEGAL_VERSION,
    consent_text_hash: CONSENT_TEXT_HASH.privacy_policy,
  }
}

function createMockLeadResponse() {
  return {
    lead: {
      uuid: crypto.randomUUID(),
      public_ref: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'processing',
    },
    job_id: crypto.randomUUID(),
    _mock: true,
  }
}

/**
 * Submit wizard lead — records consents then POST /b2c/leads.
 * Mock fallback only when VITE_API_URL is unset (offline dev).
 *
 * @param {{ answers: Record<string, unknown>, consents: { privacy: boolean, terms: boolean, partnerContact: boolean, marketing?: boolean } }} params
 * @returns {Promise<{ lead: { uuid: string, public_ref: string, status: string }, job_id: string, _mock?: boolean }>}
 */
export async function submitLead({ answers, consents }) {
  await recordWizardConsents(consents)

  const body = mapWizardToLeadPayload(answers, consents)

  try {
    const response = await apiClient.post('/b2c/leads', body)
    const data = unwrapApiData(response)
    if (data.lead?.uuid && !data._mock) {
      storePendingLeadUuid(data.lead.uuid)
      if (isConsumerAuthenticated()) {
        await attachPendingLead()
      }
    }
    return data
  } catch (error) {
    if (!isApiConfigured()) {
      console.warn('[Wenando] Lead API unavailable — using mock fallback:', error)
      return createMockLeadResponse()
    }
    throw error
  }
}

function createMockLeadResults(answers) {
  const locationLabel = answers?.location?.label || 'la tua zona'
  return {
    diagnosis: getDiagnosis(answers?.autonomy),
    matches: getMatchesForLocation(locationLabel),
    advisor: mockAdvisor,
    _mock: true,
  }
}

/**
 * GET /b2c/leads/{uuid}/results
 * @param {string} leadUuid
 * @param {Record<string, unknown>} [answers] — for dev mock fallback
 */
export async function fetchLeadResults(leadUuid, answers) {
  return cachedRequest(
    `b2c:lead-results:${leadUuid}`,
    async () => {
      const response = await apiClient.get(`/b2c/leads/${leadUuid}/results`)
      const data = unwrapApiData(response)

      return {
        diagnosis: data.diagnosis ?? getDiagnosis(answers?.autonomy),
        matches: Array.isArray(data.matches) ? data.matches.map(mapLeadMatch) : [],
        advisor: mapAdvisor(data.advisor),
      }
    },
    { ttlMs: 10 * 60_000, staleMs: 30 * 60_000 },
  )
}

/**
 * GET /b2c/leads/{uuid}/status
 * @param {string} leadUuid
 */
export async function fetchLeadStatus(leadUuid) {
  const response = await apiClient.get(`/b2c/leads/${leadUuid}/status`)
  return unwrapApiData(response)
}

/** Backend LeadStatus values that mean matching finished (not processing/draft). */
const TERMINAL_LEAD_STATUSES = new Set(['routed', 'assigned', 'closed', 'cancelled'])

/**
 * Poll GET /b2c/leads/{uuid}/status until terminal state.
 * Mock only when VITE_API_URL is unset (offline dev).
 *
 * @param {string} leadUuid
 * @param {{ intervalMs?: number, maxAttempts?: number }} [options]
 */
export function pollLeadStatus(leadUuid, options = {}) {
  const { intervalMs = 1500, maxAttempts = 40 } = options
  const mockStatus = () => ({ status: 'routed', _mock: true })

  if (!leadUuid) {
    return Promise.resolve(mockStatus())
  }

  return userWithOfflineMock(
    () => pollLeadStatusStrict(leadUuid, { intervalMs, maxAttempts }),
    mockStatus,
  )
}

/**
 * @param {string} leadUuid
 * @param {{ intervalMs: number, maxAttempts: number }} options
 */
function isTerminalLeadStatus(status) {
  if (!status) return false
  if (TERMINAL_LEAD_STATUSES.has(status)) return true
  return status !== 'processing' && status !== 'draft'
}

async function pollLeadStatusStrict(leadUuid, { intervalMs, maxAttempts }) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const data = await fetchLeadStatus(leadUuid)
    const status = data?.status ?? data?.lead?.status
    if (isTerminalLeadStatus(status)) {
      return data
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }
  throw new Error('Timeout in attesa dei risultati. Riprova tra poco.')
}

export function fetchLeadResultsWithFallback(leadUuid, answers) {
  if (!leadUuid) {
    return Promise.resolve(createMockLeadResults(answers))
  }
  return userWithOfflineMock(
    () => fetchLeadResults(leadUuid, answers),
    () => createMockLeadResults(answers),
  )
}

/** @deprecated Use submitLead */
export const submitWizardLead = submitLead
