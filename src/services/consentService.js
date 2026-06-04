import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'
import { buildAnalyticsCookieConsent } from '../constants/cookieBannerConsent'
import { buildPreferencePayload } from '../constants/privacyPreferences'
import { buildApiConsents } from '../constants/wizardConsent'

const SESSION_KEY = 'wenando-consent-session'

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/**
 * POST /consents — registers one or more consent records.
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean, marketing?: boolean }} wizardConsents
 */
export async function recordWizardConsents(wizardConsents) {
  const sessionId = getSessionId()
  const consents = buildApiConsents(wizardConsents, sessionId)

  if (consents.length === 0) {
    throw new Error('Nessun consenso obbligatorio registrato.')
  }

  try {
    const response = await apiClient.post('/consents', { consents })
    return unwrapApiData(response)
  } catch (error) {
    if (!isApiConfigured()) {
      console.warn('[Wenando] Consent API unavailable — skipping offline:', error)
      return { skipped: true, _mock: true }
    }
    throw error
  }
}

/**
 * POST /consents — registers analytics_cookies preference from the cookie banner.
 * @param {boolean} analyticsEnabled
 */
export async function recordAnalyticsCookieConsent(analyticsEnabled) {
  const sessionId = getSessionId()
  const consents = [buildAnalyticsCookieConsent(analyticsEnabled, sessionId)]

  try {
    const response = await apiClient.post('/consents', { consents })
    return unwrapApiData(response)
  } catch (error) {
    if (!isApiConfigured()) {
      console.warn('[Wenando] Cookie consent API unavailable — skipping offline:', error)
      return { skipped: true, _mock: true }
    }
    throw error
  }
}

/**
 * GET /consents/me — latest consent state for authenticated user.
 */
export async function fetchMyConsents() {
  const response = await apiClient.get('/consents/me')
  return unwrapApiData(response)
}

/**
 * PATCH /consents/me — append preference rows (marketing / analytics_cookies).
 * @param {Array<{ consent_type: string, consent_given: boolean, consent_text_hash: string, policy_version: string }>} preferences
 */
export async function updateConsentPreferences(preferences) {
  const response = await apiClient.patch('/consents/me', { preferences })
  return unwrapApiData(response)
}

/**
 * @param {'marketing' | 'analytics_cookies'} consentType
 * @param {boolean} enabled
 */
export async function setConsentPreference(consentType, enabled) {
  return updateConsentPreferences([buildPreferencePayload(consentType, enabled)])
}
