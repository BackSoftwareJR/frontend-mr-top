import axios from 'axios'

/** Align with authService session storage — Bearer PAT when present. */
export const AUTH_SESSION_KEY = 'wenando-auth-session'
export const AUTH_TOKEN_KEY = 'wenando-auth-token'

const baseURL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  '/api/v1'

/** True when a real backend URL is configured (not the Vite proxy default). */
export function isApiConfigured() {
  return Boolean(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)
}

export class ApiError extends Error {
  constructor(message, { code, status, details, traceId } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code ?? 'API_ERROR'
    this.status = status
    this.details = details
    this.traceId = traceId
  }
}

export function getBearerToken() {
  try {
    const direct = localStorage.getItem(AUTH_TOKEN_KEY)
    if (direct) return direct

    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null

    const session = JSON.parse(raw)
    return session?.token ?? null
  } catch {
    return null
  }
}

function resolveLoginPath() {
  const path = window.location.pathname

  if (path.startsWith('/pro')) {
    return '/pro/accedi'
  }

  if (path.startsWith('/admin')) {
    return '/admin/login'
  }

  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (raw) {
      const session = JSON.parse(raw)
      if (session?.type === 'b2b') {
        return '/pro/accedi'
      }
    }
  } catch {
    // ignore malformed session
  }

  return '/accedi'
}

function parseApiError(data, status) {
  if (data?.success === false && data?.error) {
    return new ApiError(data.error.message ?? 'Richiesta non riuscita.', {
      code: data.error.code,
      status,
      details: data.error.details,
      traceId: data.trace_id,
    })
  }

  return new ApiError(data?.message ?? `HTTP ${status}`, { status })
}

/**
 * Unwrap Laravel ApiEnvelope `{ success, data, meta }`.
 * @template T
 * @param {import('axios').AxiosResponse} response
 * @returns {T}
 */
export function unwrapApiData(response) {
  const body = response.data

  if (body?.success === true) {
    return body.data
  }

  throw parseApiError(body, response.status)
}

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getBearerToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401 && typeof window !== 'undefined') {
      const loginPath = resolveLoginPath()
      if (!window.location.pathname.startsWith(loginPath)) {
        window.location.assign(loginPath)
      }
    }

    if (data) {
      return Promise.reject(parseApiError(data, status ?? 0))
    }

    return Promise.reject(
      new ApiError(error.message ?? 'Errore di rete.', {
        code: 'NETWORK_ERROR',
        status: status ?? 0,
      }),
    )
  },
)

/**
 * Run API call; in dev when API is configured but unreachable, use mock fallback.
 * @template T
 * @param {() => Promise<T>} apiFn
 * @param {() => T | Promise<T>} mockFn
 * @param {string} [label]
 */
export async function withDevMockFallback(apiFn, mockFn, label = 'API') {
  try {
    return await apiFn()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[Wenando] ${label} unavailable — using mock fallback:`, error)
      return mockFn()
    }
    throw error
  }
}

export default apiClient
