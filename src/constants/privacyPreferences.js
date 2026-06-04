import { COOKIE_BANNER_CONSENT_HASH } from './cookieBannerConsent'
import { COOKIE_CONSENT_VERSION } from './cookieConsent'
import { LEGAL_VERSION } from './legalVersions'

/**
 * Canonical label for marketing opt-in/out — SHA-256 source for consent_text_hash.
 */
export const MARKETING_CONSENT_LABEL =
  'Acconsento a ricevere comunicazioni marketing da Wenando.'

/** Precomputed SHA-256 of MARKETING_CONSENT_LABEL. */
export const MARKETING_CONSENT_HASH =
  'dee45a0f20974a87843a01602a48b0c4e90aa7fdbdf4c2c791049e507d3f24e5'

/**
 * @param {'marketing' | 'analytics_cookies'} consentType
 * @param {boolean} consentGiven
 */
export function buildPreferencePayload(consentType, consentGiven) {
  if (consentType === 'marketing') {
    return {
      consent_type: 'marketing',
      consent_given: consentGiven,
      consent_text_hash: MARKETING_CONSENT_HASH,
      policy_version: LEGAL_VERSION,
    }
  }

  return {
    consent_type: 'analytics_cookies',
    consent_given: consentGiven,
    consent_text_hash: COOKIE_BANNER_CONSENT_HASH,
    policy_version: COOKIE_CONSENT_VERSION,
  }
}
