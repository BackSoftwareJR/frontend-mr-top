import { AUTH_TOKEN_KEY, AUTH_SESSION_KEY } from './b2bAuth.js'
import { seedCookieConsent } from './browserFixtures.js'

export { AUTH_TOKEN_KEY, AUTH_SESSION_KEY }

const DEFAULT_ADMIN = {
  email: 'admin@wenando.test',
}

const E2E_CAPTCHA = {
  honeypot: '',
  human_confirmed: true,
  form_started_at: Date.now() - 5000,
  challenge_answer: '1234',
  expected_challenge: '1234',
}

/**
 * OTP login for seeded superadmin (requires local API + DevUsersSeeder).
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl e.g. http://127.0.0.1:8000/api/v1
 */
export async function loginAdminViaApi(
  request,
  apiBaseUrl,
  { email = DEFAULT_ADMIN.email } = {},
) {
  const base = apiBaseUrl.replace(/\/$/, '')

  const otpResponse = await request.post(`${base}/auth/otp/request`, {
    data: {
      email,
      portal: 'admin',
      captcha: E2E_CAPTCHA,
    },
  })

  if (!otpResponse.ok()) {
    const text = await otpResponse.text()
    throw new Error(`Admin OTP request failed (${otpResponse.status()}): ${text}`)
  }

  const otpBody = await otpResponse.json()
  const code = otpBody?.data?.dev_code
  if (!code) {
    throw new Error(`Admin OTP missing dev_code (is APP_ENV=local?): ${JSON.stringify(otpBody)}`)
  }

  const verifyResponse = await request.post(`${base}/auth/otp/verify`, {
    data: { email, code: String(code), device_name: 'playwright-e2e' },
  })

  if (!verifyResponse.ok()) {
    const text = await verifyResponse.text()
    throw new Error(`Admin OTP verify failed (${verifyResponse.status()}): ${text}`)
  }

  const body = await verifyResponse.json()
  if (!body?.success || !body?.data?.token) {
    throw new Error(`Admin OTP envelope invalid: ${JSON.stringify(body)}`)
  }

  return body.data
}

/**
 * Inject Sanctum token + admin session before navigation (AuthContext reads on load).
 * @param {import('@playwright/test').Page} page
 * @param {object} loginData unwrapApiData shape from OTP verify
 */
export async function seedAdminLocalStorage(
  page,
  loginData,
  email = DEFAULT_ADMIN.email,
) {
  const token = loginData.token
  const user = loginData.user ?? {}
  const session = {
    email: user.email ?? email,
    type: 'superadmin',
    name: user.name ?? 'Super Admin',
    token,
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
