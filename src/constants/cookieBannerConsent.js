import { COOKIE_CONSENT_VERSION } from './cookieConsent'

/**
 * Legal snapshot shown in CookieBanner — SHA-256 source for analytics_cookies consent_text_hash.
 * Align with COOKIE_POLICY.md § 9.4 and CookieBanner.jsx description paragraph.
 */
export const COOKIE_BANNER_CONSENT_TEXT =
  'Usiamo cookie strettamente necessari per il funzionamento del sito e, solo con il tuo consenso, analytics aggregati (Plausible, senza profilazione marketing).'

/** Precomputed SHA-256 of COOKIE_BANNER_CONSENT_TEXT — Cookie Policy v1.0.0. */
export const COOKIE_BANNER_CONSENT_HASH =
  'b034d1ab94502c9f98e9a478bd25acd4bdf129794d3e0e9533edab92a3ddc6b1'

/**
 * @param {boolean} analyticsEnabled
 * @param {string} sessionId
 */
export function buildAnalyticsCookieConsent(analyticsEnabled, sessionId) {
  return {
    consent_type: 'analytics_cookies',
    policy_version: COOKIE_CONSENT_VERSION,
    consent_given: analyticsEnabled,
    consent_text_hash: COOKIE_BANNER_CONSENT_HASH,
    session_id: sessionId,
  }
}
