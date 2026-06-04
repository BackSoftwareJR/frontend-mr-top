import apiClient, {
  AUTH_SESSION_KEY,
  AUTH_TOKEN_KEY,
  isApiConfigured,
  unwrapApiData,
} from './apiClient'
import { authWithOfflineMock } from './authApiUtils'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** @param {Record<string, unknown>} captchaPayload */
export function mapCaptchaToApi(captchaPayload) {
  return {
    honeypot: captchaPayload?.honeypot ?? '',
    challenge_answer: captchaPayload?.challengeAnswer ?? '',
    expected_challenge: captchaPayload?.expectedChallenge ?? '',
    form_started_at: captchaPayload?.formStartedAt ?? Date.now(),
    human_confirmed: Boolean(captchaPayload?.humanConfirmed),
  }
}

/**
 * @param {'consumer' | 'partner' | 'admin'} portal
 */
export async function requestOtp(email, portal, captchaPayload) {
  const body = {
    email: email.trim().toLowerCase(),
    portal,
    captcha: mapCaptchaToApi(captchaPayload),
  }

  if (captchaPayload?.captchaToken) {
    body.captcha_token = captchaPayload.captchaToken
  }

  const response = await apiClient.post('/auth/otp/request', body)
  const data = unwrapApiData(response)
  return {
    ok: true,
    email: data.email ?? email.trim().toLowerCase(),
    expiresInMs: data.expires_in_ms ?? 600000,
    devCode: data.dev_code,
  }
}

export async function verifyOtp(email, code) {
  const response = await apiClient.post('/auth/otp/verify', {
    email: email.trim().toLowerCase(),
    code: code.trim(),
  })
  const data = unwrapApiData(response)
  const user = data.user ?? {}
  const userType = user.user_type ?? 'consumer'

  const sessionType =
    userType === 'superadmin' ? 'superadmin' : userType === 'b2b' ? 'b2b' : 'consumer'

  const token = data.token ?? data.access_token ?? null
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  const session = {
    email: user.email ?? email.trim().toLowerCase(),
    type: sessionType,
    name: user.name ?? email.split('@')[0],
    phone: user.phone ?? null,
    userId: user.id ?? null,
    onboardingStatus: user.onboarding_status ?? null,
    token,
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))

  return {
    ok: true,
    session,
    redirectTo: data.redirect_to ?? null,
    user,
  }
}

export async function fetchResendCooldown(email) {
  const response = await apiClient.get('/auth/resend-cooldown', {
    params: { email: email.trim().toLowerCase() },
  })
  const data = unwrapApiData(response)
  return (data.cooldown_seconds ?? 0) * 1000
}

export async function logoutApi() {
  if (!isApiConfigured() || !localStorage.getItem(AUTH_TOKEN_KEY)) return
  try {
    await apiClient.post('/auth/logout')
  } catch {
    // ignore logout errors
  }
}

export async function fetchAuthMe() {
  const response = await apiClient.get('/auth/me')
  return unwrapApiData(response)
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_SESSION_KEY)
}

/**
 * OTP via API when configured; offline mock when VITE_API_URL is unset.
 * @param {'consumer' | 'partner' | 'admin'} portal
 */
export async function requestOtpWithFallback(email, portal, captchaPayload, mockFn) {
  return authWithOfflineMock(
    () => requestOtp(email, portal, captchaPayload),
    mockFn,
  )
}

export async function verifyOtpWithFallback(email, code, mockFn) {
  return authWithOfflineMock(() => verifyOtp(email, code), mockFn)
}
