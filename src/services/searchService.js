import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'
import { recordWizardConsents, getSessionId } from './consentService'
import { CONSENT_TEXT_HASH } from '../constants/wizardConsent'
import { LEGAL_VERSION } from '../constants/legalVersions'
import { interestAreasToPayload } from './locationService'
import { mapLeadMatch, storePendingLeadUuid } from './leadService'

/**
 * @param {{ query: string, selections?: Record<string, string>, customNotes?: string, refinementHistory?: Array<{ questionId: string, answerLabel: string }> }} params
 * @returns {Promise<{
 *   pageTitle: string,
 *   supported: boolean,
 *   paths: Array<object>,
 *   editorial: Array<object>,
 *   nando: { microPrompt: string, actions: Array<{ id: string, label: string }>, question: object | null },
 *   source: 'groq' | 'fallback'
 * }>}
 */
export async function orchestrateSearch({
  query,
  selections = {},
  customNotes = '',
  refinementHistory = [],
}) {
  const response = await apiClient.post('/b2c/search/orchestrate', {
    query,
    selections,
    customNotes,
    refinementHistory,
  })

  const data = unwrapApiData(response)
  const source = response.data?.meta?.source === 'groq' ? 'groq' : 'fallback'

  return {
    pageTitle: data.pageTitle,
    supported: data.supported ?? true,
    paths: data.paths ?? [],
    editorial: data.editorial ?? [],
    nando: data.nando ?? { microPrompt: '', actions: [], question: null },
    source,
  }
}

/**
 * Fetch query-aware editorial articles from the editorial search index.
 * @param {{ q?: string, sector?: string, limit?: number }} params
 * @returns {Promise<Array<{ id: string, title: string, summary: string, url: string, relevanceReason: string, sector: string }>>}
 */
export async function fetchEditorialResults({ q = '', sector = 'elder_care', limit = 6 } = {}) {
  if (!isApiConfigured()) {
    return []
  }

  try {
    const response = await apiClient.get('/b2c/search/editorial', {
      params: { q, sector, limit },
    })
    const data = unwrapApiData(response)

    return Array.isArray(data.items) ? data.items : []
  } catch (error) {
    console.warn('[Wenando] Editorial search unavailable — using orchestrator/mock fallback:', error)
    return []
  }
}

/**
 * Build refinement history payload from explore session trail.
 * @param {{ refinementTrail?: Array<{ questionId?: string, label?: string, selections?: Record<string, string> }> } | null} session
 */
export function buildRefinementHistory(session) {
  const trail = session?.refinementTrail ?? []

  return trail
    .filter((frame) => frame?.questionId)
    .map((frame) => ({
      questionId: frame.questionId,
      answerId: frame.selections?.[frame.questionId] ?? null,
      answerLabel: frame.label ?? null,
    }))
}

/**
 * Submit explore contact intent — creates lead + returns geo-matched structures.
 * @param {{
 *   session: { id: string, query: string, selections?: Record<string, string>, refinementTrail?: Array<object> },
 *   activePathId?: string | null,
 *   contact: { nome: string, telefono: string, email?: string },
 *   consents: { privacy: boolean, terms: boolean, partnerContact: boolean, marketing?: boolean },
 *   interestAreas?: Array<object>,
 * }} params
 */
export async function submitContactIntent({
  session,
  activePathId = null,
  contact,
  consents,
  interestAreas = [],
}) {
  await recordWizardConsents(consents)

  const body = {
    query: session.query,
    selections: session.selections ?? {},
    refinementHistory: buildRefinementHistory(session),
    activePathId,
    contact: {
      nome: contact.nome.trim(),
      telefono: contact.telefono.trim(),
      ...(contact.email?.trim() ? { email: contact.email.trim() } : {}),
    },
    interest_areas:
      interestAreas.length > 0 ? interestAreasToPayload(interestAreas) : undefined,
    consent: {
      privacy_accepted: consents.privacy === true,
      terms_accepted: consents.terms === true,
      lead_sharing_accepted: consents.partnerContact === true,
      marketing_accepted: consents.marketing === true,
    },
    consent_text_hash: CONSENT_TEXT_HASH.privacy_policy,
    terms_text_hash: CONSENT_TEXT_HASH.terms_b2c,
    lead_sharing_text_hash: CONSENT_TEXT_HASH.lead_sharing,
    policy_version: LEGAL_VERSION,
    session_id: getSessionId(),
    explore_session_id: session.id,
  }

  try {
    const response = await apiClient.post('/b2c/search/contact-intent', body)
    const data = unwrapApiData(response)

    if (data.lead?.uuid) {
      storePendingLeadUuid(data.lead.uuid)
    }

    return {
      lead: data.lead,
      matches: Array.isArray(data.matches) ? data.matches.map(mapLeadMatch) : [],
      matchCount: data.match_count ?? 0,
    }
  } catch (error) {
    if (!isApiConfigured()) {
      console.warn('[Wenando] Contact intent API unavailable — offline fallback:', error)
      return {
        lead: null,
        matches: [],
        matchCount: 0,
        _mock: true,
        _offline: true,
      }
    }
    throw error
  }
}
