import apiClient, { unwrapApiData } from './apiClient'
import { recordWizardConsents, getSessionId } from './consentService'
import { CONSENT_TEXT_HASH } from '../constants/wizardConsent'
import { LEGAL_VERSION } from '../constants/legalVersions'

/**
 * Map wizard answers to POST /b2c/leads body (StoreLeadRequest).
 * Contact is nested under payload.contact; backend denormalizes to contact_name / contact_phone.
 *
 * @param {Record<string, unknown>} answers
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean }} consents
 */
export function mapWizardToLeadPayload(answers, consents) {
  return {
    sector_slug: 'senior-care',
    payload: {
      autonomy: answers.autonomy,
      location: answers.location,
      budget: answers.budget,
      contact: answers.contact,
    },
    consent: {
      privacy_accepted: consents.privacy === true,
      terms_accepted: consents.terms === true,
      marketing_accepted: false,
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
 * Falls back to mock response in dev when the API is unavailable.
 *
 * @param {{ answers: Record<string, unknown>, consents: { privacy: boolean, terms: boolean, partnerContact: boolean } }} params
 * @returns {Promise<{ lead: { uuid: string, public_ref: string, status: string }, job_id: string, _mock?: boolean }>}
 */
export async function submitLead({ answers, consents }) {
  await recordWizardConsents(consents)

  const body = mapWizardToLeadPayload(answers, consents)

  try {
    const response = await apiClient.post('/b2c/leads', body)
    return unwrapApiData(response)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Wenando] Lead API unavailable — using mock fallback:', error)
      return createMockLeadResponse()
    }
    throw error
  }
}

/** @deprecated Use submitLead */
export const submitWizardLead = submitLead
