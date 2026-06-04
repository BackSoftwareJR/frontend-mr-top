/** Matches `src/constants/cookieConsent.js` — suppresses cookie banner in UI specs. */
export const COOKIE_CONSENT_KEY = 'wenando_cookie_consent'

/**
 * Pre-seed cookie consent before navigation (call before page.goto).
 * @param {import('@playwright/test').Page} page
 */
export async function seedCookieConsent(page) {
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        necessary: true,
        analytics: false,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      }),
    )
  }, COOKIE_CONSENT_KEY)
}
