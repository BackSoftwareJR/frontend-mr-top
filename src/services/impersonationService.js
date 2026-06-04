/**
 * Tab-scoped impersonation — keeps admin localStorage session intact in the opener tab.
 * Token lives in sessionStorage only (per-tab), not shared with God Mode.
 */

export const IMPERSONATION_ACTIVE_KEY = 'wenando-impersonation-active'
export const IMPERSONATION_TOKEN_KEY = 'wenando-impersonation-token'
export const IMPERSONATION_SESSION_KEY = 'wenando-impersonation-session'

export function isImpersonating() {
  try {
    return sessionStorage.getItem(IMPERSONATION_ACTIVE_KEY) === '1'
  } catch {
    return false
  }
}

export function getImpersonationSession() {
  try {
    if (!isImpersonating()) return null
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getImpersonationToken() {
  try {
    if (!isImpersonating()) return null
    return sessionStorage.getItem(IMPERSONATION_TOKEN_KEY)
  } catch {
    return null
  }
}

/**
 * @param {{ token: string, expiresAt: string, partner: { email?: string, organization_name?: string } }} payload
 */
export function openPartnerImpersonationTab(payload) {
  const params = new URLSearchParams()
  params.set('t', payload.token)
  if (payload.expiresAt) params.set('exp', payload.expiresAt)
  if (payload.partner?.email) params.set('email', payload.partner.email)
  if (payload.partner?.organization_name) params.set('name', payload.partner.organization_name)

  const url = `${window.location.origin}/pro/impersonate#${params.toString()}`
  const tab = window.open(url, '_blank', 'noopener,noreferrer')

  if (!tab) {
    throw new Error('Consenti i popup per aprire il portale partner.')
  }
}

/**
 * Called from ImpersonateBootstrap — consumes URL hash and stores tab-local session.
 */
export function bootstrapImpersonationFromHash() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return false

  const params = new URLSearchParams(hash)
  const token = params.get('t')
  if (!token) return false

  const email = params.get('email') ?? 'partner@wenando.it'
  const name = params.get('name') ?? 'Partner'
  const expiresAt = params.get('exp') ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()

  sessionStorage.setItem(IMPERSONATION_ACTIVE_KEY, '1')
  sessionStorage.setItem(IMPERSONATION_TOKEN_KEY, token)
  sessionStorage.setItem(
    IMPERSONATION_SESSION_KEY,
    JSON.stringify({
      email,
      name,
      type: 'b2b',
      onboardingStatus: 'approved',
      impersonating: true,
      expiresAt,
      authenticatedAt: Date.now(),
    }),
  )

  window.history.replaceState(null, '', '/pro/impersonate')
  return true
}

export function clearImpersonation() {
  try {
    sessionStorage.removeItem(IMPERSONATION_ACTIVE_KEY)
    sessionStorage.removeItem(IMPERSONATION_TOKEN_KEY)
    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY)
  } catch {
    // ignore
  }
}
