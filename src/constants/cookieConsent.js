export const COOKIE_CONSENT_KEY = 'wenando_cookie_consent'
export const COOKIE_CONSENT_VERSION = '1.0.0'

/** @typedef {{ necessary: true, analytics: boolean, timestamp: string, version: string }} CookieConsent */

/** @returns {CookieConsent | null} */
export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.necessary !== true || typeof parsed.analytics !== 'boolean') return null
    return parsed
  } catch {
    return null
  }
}

/** @param {boolean} analytics */
export function writeCookieConsent(analytics) {
  /** @type {CookieConsent} */
  const payload = {
    necessary: true,
    analytics,
    timestamp: new Date().toISOString(),
    version: COOKIE_CONSENT_VERSION,
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent('wenando:cookie-consent', { detail: payload }))
  return payload
}

export function hasCookieConsentChoice() {
  return readCookieConsent() !== null
}
