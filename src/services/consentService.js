import apiClient, { unwrapApiData } from './apiClient'
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
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean }} wizardConsents
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
    if (import.meta.env.DEV) {
      console.warn('[Wenando] Consent API unavailable — skipping in dev:', error)
      return { skipped: true, _mock: true }
    }
    throw error
  }
}
