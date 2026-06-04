import { isApiConfigured } from './apiClient'

/**
 * Auth OTP *WithFallback: mock only when VITE_API_URL is unset (offline dev).
 * When API is configured, call apiFn only — 4xx/5xx/network errors propagate (no mock).
 * @template T
 * @param {() => Promise<T>} apiFn
 * @param {T | (() => T | Promise<T>)} mockData
 * @returns {Promise<T>}
 */
export function authWithOfflineMock(apiFn, mockData) {
  if (!isApiConfigured()) {
    const data = typeof mockData === 'function' ? mockData() : mockData
    return Promise.resolve(data)
  }
  return apiFn()
}

