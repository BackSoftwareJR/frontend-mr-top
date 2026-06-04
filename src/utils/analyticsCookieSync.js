import { readCookieConsent, writeCookieConsent } from '../constants/cookieConsent'
import { recordAnalyticsCookieConsent, setConsentPreference } from '../services/consentService'

/** @typedef {'banner' | 'profile'} AnalyticsCookieSource */

/**
 * Read analytics flag from localStorage (client runtime source for Plausible).
 * @returns {boolean | null} null when no stored choice yet
 */
export function readAnalyticsCookieEnabled() {
  const stored = readCookieConsent()
  if (stored === null) return null
  return stored.analytics === true
}

/**
 * Single entry point for analytics_cookies — keeps localStorage and API aligned.
 * Skips redundant writes when the value is unchanged (loop-safe).
 *
 * @param {boolean} analyticsEnabled
 * @param {{ source: AnalyticsCookieSource, skipLocal?: boolean, skipApi?: boolean }} [options]
 */
export async function syncAnalyticsCookiePreference(
  analyticsEnabled,
  { source, skipLocal = false, skipApi = false } = {},
) {
  const currentLocal = readCookieConsent()?.analytics

  if (!skipLocal && currentLocal !== analyticsEnabled) {
    writeCookieConsent(analyticsEnabled)
  }

  if (skipApi) return

  if (source === 'banner') {
    await recordAnalyticsCookieConsent(analyticsEnabled)
  } else if (source === 'profile') {
    await setConsentPreference('analytics_cookies', analyticsEnabled)
  }
}

/**
 * Align localStorage with server-side preference without API round-trip.
 * @param {boolean} analyticsEnabled
 */
export function mirrorAnalyticsCookieToLocal(analyticsEnabled) {
  void syncAnalyticsCookiePreference(analyticsEnabled, {
    source: 'profile',
    skipApi: true,
  })
}
