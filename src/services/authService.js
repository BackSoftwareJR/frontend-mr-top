/**
 * Auth — OTP via API when VITE_API_URL is set; localStorage mock when API is not configured.
 */

import { ApiError, AUTH_TOKEN_KEY, isApiConfigured } from './apiClient'
import { getImpersonationSession } from './impersonationService'
import {
  clearAuthStorage,
  fetchResendCooldown,
  logoutApi,
  requestOtpWithFallback,
  verifyOtpWithFallback,
} from './authApiService'

export const SESSION_KEY = 'wenando-auth-session'

const OTP_STORE_KEY = 'wenando-auth-otp'
const RATE_LIMIT_KEY = 'wenando-auth-rate-limit'

const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const MAX_SEND_ATTEMPTS = 10
const MIN_FORM_DURATION_MS = 2000

export const MOCK_USERS = {
  'partner@care.it': { type: 'b2b', name: 'Care Partner S.r.l.', phone: null },
  'user@example.com': { type: 'consumer', name: 'Mario Rossi', phone: '+39 333 111 2222' },
  'admin@wenando.it': { type: 'superadmin', name: 'Super Admin', phone: null },
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getRateLimitEntry(email) {
  const store = readJson(RATE_LIMIT_KEY, {})
  const entry = store[email]
  if (!entry) return { attempts: 0, windowStart: Date.now() }

  if (Date.now() - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    return { attempts: 0, windowStart: Date.now() }
  }
  return entry
}

function recordSendAttempt(email) {
  const store = readJson(RATE_LIMIT_KEY, {})
  const entry = getRateLimitEntry(email)
  store[email] = {
    attempts: entry.attempts + 1,
    windowStart: entry.windowStart,
  }
  writeJson(RATE_LIMIT_KEY, store)
}

export function getRedirectForUserType(type) {
  if (type === 'superadmin') return '/admin'
  return type === 'b2b' ? '/pro/dashboard' : '/area-personale'
}

/**
 * Offline portal routing (MOCK_USERS + email heuristics).
 * When VITE_API_URL is set, portal eligibility is enforced by POST /auth/otp/request.
 */
export function validateEmailForPortal(email, portal) {
  if (isApiConfigured()) {
    return { ok: true }
  }

  const normalized = normalizeEmail(email)
  const profile = resolveUserType(normalized)

  if (portal === 'admin' && profile.type !== 'superadmin') {
    return {
      ok: false,
      error: 'Accesso riservato agli amministratori della piattaforma.',
    }
  }

  if (portal === 'partner' && profile.type !== 'b2b') {
    return {
      ok: false,
      error:
        'Email non associata a un account partner. Contatta il supporto Wenando Pro o usa Accedi in alto per l\'area utenti.',
    }
  }

  if (portal === 'consumer' && (profile.type === 'b2b' || profile.type === 'superadmin')) {
    return {
      ok: false,
      error:
        profile.type === 'b2b'
          ? 'Questa email è registrata come partner. Accedi tramite l\'area B2B (/pro).'
          : 'Questa email è riservata all\'area amministrativa.',
    }
  }

  return { ok: true }
}

export function getSession() {
  const impersonationSession = getImpersonationSession()
  if (impersonationSession) {
    if (impersonationSession.expiresAt && Date.now() > new Date(impersonationSession.expiresAt).getTime()) {
      return null
    }
    return impersonationSession
  }

  const session = readJson(SESSION_KEY, null)
  if (!session) return null
  if (session.expiresAt && Date.now() > session.expiresAt) {
    clearSession()
    return null
  }
  return session
}

export function clearSession() {
  clearAuthStorage()
}

export function saveSession({ email, type, name, phone, token, onboardingStatus, userId }) {
  const session = {
    email,
    type,
    name,
    phone: phone ?? null,
    token: token ?? null,
    userId: userId ?? null,
    onboardingStatus: onboardingStatus ?? null,
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
  writeJson(SESSION_KEY, session)
  return session
}

export function patchSession(updates) {
  const session = getSession()
  if (!session) return null
  const next = { ...session, ...updates }
  writeJson(SESSION_KEY, next)
  return next
}

export function resolveUserType(email) {
  const normalized = normalizeEmail(email)
  const known = MOCK_USERS[normalized]
  if (known) return known

  if (normalized.endsWith('@wenando.it') || normalized.includes('admin')) {
    return { type: 'superadmin', name: 'Admin' }
  }
  if (normalized.endsWith('@care.it') || normalized.includes('partner')) {
    return { type: 'b2b', name: normalized.split('@')[0] }
  }
  return { type: 'consumer', name: normalized.split('@')[0] }
}

export function buildCaptchaPayload(formData, challengePayload) {
  return {
    honeypot: formData.get('company_website') || '',
    challengeAnswer: challengePayload?.challengeAnswer ?? '',
    expectedChallenge: challengePayload?.expectedChallenge ?? '',
    formStartedAt: challengePayload?.formStartedAt ?? Date.now(),
    humanConfirmed: challengePayload?.humanConfirmed ?? false,
    captchaToken: challengePayload?.captchaToken,
  }
}

export function validateCaptcha({ honeypot, challengeAnswer, expectedChallenge, formStartedAt, humanConfirmed }) {
  if (honeypot) {
    return { ok: false, error: 'Verifica non superata.' }
  }

  if (!humanConfirmed) {
    return { ok: false, error: 'Conferma di non essere un robot.' }
  }

  if (Date.now() - formStartedAt < MIN_FORM_DURATION_MS) {
    return { ok: false, error: 'Attendi un momento e riprova.' }
  }

  if (!challengeAnswer || challengeAnswer.trim() !== expectedChallenge) {
    return { ok: false, error: 'Codice di verifica errato.' }
  }

  return { ok: true }
}

function mockSendLoginCode(email, captchaPayload) {
  const normalized = normalizeEmail(email)
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: 'Inserisci un indirizzo email valido.' }
  }

  const captchaResult = validateCaptcha(captchaPayload)
  if (!captchaResult.ok) return captchaResult

  const rateEntry = getRateLimitEntry(normalized)
  if (rateEntry.attempts >= MAX_SEND_ATTEMPTS) {
    const minutesLeft = Math.ceil(
      (RATE_LIMIT_WINDOW_MS - (Date.now() - rateEntry.windowStart)) / 60000,
    )
    return {
      ok: false,
      error: `Troppi tentativi. Riprova tra ${minutesLeft} min.`,
    }
  }

  recordSendAttempt(normalized)

  const code = generateCode()
  const otpStore = readJson(OTP_STORE_KEY, {})
  otpStore[normalized] = {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    lastSentAt: Date.now(),
  }
  writeJson(OTP_STORE_KEY, otpStore)

  if (import.meta.env.DEV) {
    console.info(`[Wenando Auth DEV] Codice per ${normalized}: ${code}`)
  }

  return {
    ok: true,
    email: normalized,
    devCode: import.meta.env.DEV ? code : undefined,
    expiresInMs: CODE_TTL_MS,
  }
}

function mockVerifyLoginCode(email, code) {
  const normalized = normalizeEmail(email)
  const otpStore = readJson(OTP_STORE_KEY, {})
  const entry = otpStore[normalized]

  if (!entry) {
    return { ok: false, error: 'Nessun codice attivo. Richiedine uno nuovo.' }
  }

  if (Date.now() > entry.expiresAt) {
    delete otpStore[normalized]
    writeJson(OTP_STORE_KEY, otpStore)
    return { ok: false, error: 'Codice scaduto. Richiedine uno nuovo.' }
  }

  if (entry.code !== code.trim()) {
    return { ok: false, error: 'Codice non valido. Controlla e riprova.' }
  }

  delete otpStore[normalized]
  writeJson(OTP_STORE_KEY, otpStore)

  const profile = resolveUserType(normalized)
  const devToken = import.meta.env.DEV ? `dev-mock-${profile.type}-${normalized}` : null
  if (devToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, devToken)
  }
  const session = saveSession({
    email: normalized,
    type: profile.type,
    name: profile.name,
    phone: profile.phone ?? null,
    token: devToken,
  })

  return {
    ok: true,
    session,
    redirectTo: getRedirectForUserType(profile.type),
  }
}

/**
 * @param {string} email
 * @param {Record<string, unknown>} captchaPayload
 * @param {'consumer' | 'partner' | 'admin'} [portal='consumer']
 */
export function resolveOtpRequestError(result) {
  if (result.ok) return null

  if (result.code === 'RATE_LIMITED' && result.retryAfterSeconds) {
    return {
      message: `Troppe richieste. Riprova tra ${result.retryAfterSeconds} secondi.`,
      retryAfterSeconds: result.retryAfterSeconds,
    }
  }

  return { message: result.error, retryAfterSeconds: undefined }
}

function authApiErrorResult(error) {
  const message =
    error instanceof ApiError
      ? error.message
      : (error?.message ?? 'Errore di connessione. Riprova tra poco.')
  return {
    ok: false,
    error: message,
    code: error instanceof ApiError ? error.code : undefined,
    retryAfterSeconds: error instanceof ApiError ? error.retryAfterSeconds : undefined,
  }
}

export async function sendLoginCode(email, captchaPayload, portal = 'consumer') {
  try {
    return await requestOtpWithFallback(email, portal, captchaPayload, () =>
      mockSendLoginCode(email, captchaPayload),
    )
  } catch (error) {
    if (isApiConfigured()) return authApiErrorResult(error)
    throw error
  }
}

export async function getResendCooldown(email) {
  if (isApiConfigured()) {
    try {
      return await fetchResendCooldown(email)
    } catch {
      // fall through to local store
    }
  }

  const normalized = normalizeEmail(email)
  const otpStore = readJson(OTP_STORE_KEY, {})
  const entry = otpStore[normalized]
  if (!entry?.lastSentAt) return 0
  const elapsed = Date.now() - entry.lastSentAt
  return Math.max(0, RESEND_COOLDOWN_MS - elapsed)
}

export async function verifyLoginCode(email, code) {
  try {
    return await verifyOtpWithFallback(email, code, () => mockVerifyLoginCode(email, code))
  } catch (error) {
    if (isApiConfigured()) return authApiErrorResult(error)
    throw error
  }
}

export async function logoutSession() {
  await logoutApi()
  clearSession()
}
