import apiClient, {
  AUTH_SESSION_KEY,
  AUTH_TOKEN_KEY,
  unwrapApiData,
} from './apiClient'

/**
 * POST /b2b/auth/login — Sanctum token + partner session.
 *
 * @param {{ email: string, password: string, deviceName?: string }} params
 */
export async function loginB2B({ email, password, deviceName = 'wenando-pro' }) {
  const response = await apiClient.post('/b2b/auth/login', {
    email: email.trim().toLowerCase(),
    password,
    device_name: deviceName,
  })

  const data = unwrapApiData(response)
  const token = data.token

  localStorage.setItem(AUTH_TOKEN_KEY, token)

  const session = {
    email: data.user?.email ?? email.trim().toLowerCase(),
    type: 'b2b',
    name: data.company?.organization_name ?? data.user?.name ?? email.split('@')[0],
    token,
    companyId: data.company?.id ?? null,
    vettingStatus: data.company?.vetting_status ?? null,
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))

  return { ok: true, session, user: data.user, company: data.company }
}

export function clearB2BAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_SESSION_KEY)
}
