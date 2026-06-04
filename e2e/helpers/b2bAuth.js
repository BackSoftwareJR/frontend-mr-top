import { seedCookieConsent } from './browserFixtures.js'

/** Mirrors `src/services/apiClient.js` session keys for Playwright bootstrap. */
export const AUTH_TOKEN_KEY = 'wenando-auth-token'
export const AUTH_SESSION_KEY = 'wenando-auth-session'

const DEFAULT_PARTNER = {
  email: 'partner@care.it',
  password: 'password',
}

/**
 * POST /b2b/auth/login against a running Laravel API (seeded partner).
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl e.g. http://127.0.0.1:8000/api/v1
 */
export async function loginPartnerViaApi(
  request,
  apiBaseUrl,
  { email = DEFAULT_PARTNER.email, password = DEFAULT_PARTNER.password } = {},
) {
  const base = apiBaseUrl.replace(/\/$/, '')
  const response = await request.post(`${base}/b2b/auth/login`, {
    data: {
      email,
      password,
      device_name: 'playwright-e2e',
    },
  })

  if (!response.ok()) {
    const text = await response.text()
    throw new Error(`B2B login failed (${response.status()}): ${text}`)
  }

  const body = await response.json()
  if (!body?.success || !body?.data?.token) {
    throw new Error(`B2B login envelope invalid: ${JSON.stringify(body)}`)
  }

  return body.data
}

/**
 * Inject Sanctum token + B2B session before navigation (AuthContext reads on load).
 * @param {import('@playwright/test').Page} page
 * @param {object} loginData unwrapApiData shape from login
 */
export async function seedPartnerLocalStorage(
  page,
  loginData,
  email = DEFAULT_PARTNER.email,
) {
  const token = loginData.token
  const session = {
    email: loginData.user?.email ?? email,
    type: 'b2b',
    name:
      loginData.company?.organization_name ??
      loginData.user?.name ??
      email.split('@')[0],
    token,
    companyId: loginData.company?.id ?? null,
    onboardingStatus: loginData.company?.vetting_status ?? 'approved',
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }

  await seedCookieConsent(page)
  await page.addInitScript(
    ({ tokenKey, sessionKey, token, session }) => {
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(sessionKey, JSON.stringify(session))
    },
    {
      tokenKey: AUTH_TOKEN_KEY,
      sessionKey: AUTH_SESSION_KEY,
      token,
      session,
    },
  )
}
