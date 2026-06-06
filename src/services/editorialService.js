import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'

export const EDITORIAL_SITE_URL =
  import.meta.env.VITE_EDITORIAL_SITE_URL ?? 'https://wenando.com'

/**
 * True when editorial CMS API is enabled and a backend URL is configured.
 */
export function isEditorialApiEnabled() {
  return import.meta.env.VITE_EDITORIAL_API === 'true' && isApiConfigured()
}

/**
 * Resolve a magazine article URL — API returns relative paths like /magazine/{rubric}/{slug}.
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function resolveEditorialArticleUrl(url) {
  if (!url) return EDITORIAL_SITE_URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const base = EDITORIAL_SITE_URL.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`

  return `${base}${path}`
}

/**
 * @param {{ type?: string, rubric?: string, featured?: boolean, limit?: number, page?: number }} params
 * @returns {Promise<Array<{ id: string, type: string, title: string, description: string, category: string, readMinutes: number, url: string, image: string | null, featured?: boolean }>>}
 */
export async function fetchEditorialContents({ type, rubric, featured, limit, page } = {}) {
  const params = {}

  if (type) params.type = type
  if (rubric) params.rubric = rubric
  if (featured !== undefined) params.featured = featured
  if (limit !== undefined) params.limit = limit
  if (page !== undefined) params.page = page

  const response = await apiClient.get('/b2c/editorial/contents', { params })
  const data = unwrapApiData(response)

  return Array.isArray(data.contents) ? data.contents : []
}

/**
 * @returns {Promise<Array<{ id: number, slug: string, name: string, description: string | null, published_count: number }>>}
 */
export async function fetchEditorialRubrics() {
  const response = await apiClient.get('/b2c/editorial/rubrics')
  const data = unwrapApiData(response)

  return Array.isArray(data.rubrics) ? data.rubrics : []
}

/**
 * @param {string} slug
 * @returns {Promise<object>}
 */
export async function fetchEditorialContent(slug) {
  const response = await apiClient.get(`/b2c/editorial/contents/${encodeURIComponent(slug)}`)
  const data = unwrapApiData(response)

  return data.content ?? data
}

/**
 * Fetch editorial articles ranked for an explore search query.
 * @param {string} query
 * @param {{ limit?: number, type?: string, rubric?: string }} [options]
 * @returns {Promise<Array<{ id: string, type: string, title: string, description: string, category: string, readMinutes: number, url: string, image: string | null, featured?: boolean }>>}
 */
export async function fetchEditorialForQuery(query, { limit = 10, type, rubric } = {}) {
  const params = { q: query, limit }

  if (type) params.type = type
  if (rubric) params.rubric = rubric

  const response = await apiClient.get('/b2c/search/editorial', { params })
  const data = unwrapApiData(response)

  return Array.isArray(data.items) ? data.items : []
}
