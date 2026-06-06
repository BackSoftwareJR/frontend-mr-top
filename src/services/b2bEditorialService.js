import apiClient, { unwrapApiData } from './apiClient'

/** @param {Record<string, unknown>} item */
function mapContentSlim(item) {
  return {
    uuid: item.uuid,
    contentType: item.content_type ?? item.contentType ?? 'story',
    status: item.status ?? 'draft',
    title: item.title ?? '',
    excerpt: item.excerpt ?? '',
    rubricId: item.rubric_id ?? item.rubricId ?? null,
    rubricSlug: item.rubric_slug ?? item.rubricSlug ?? null,
    authorType: item.author_type ?? item.authorType ?? 'company',
    readMinutes: item.read_minutes ?? item.readMinutes ?? null,
    updatedAt: item.updated_at ?? item.updatedAt ?? null,
    rubric: item.rubric ?? null,
    isStructureContent: Boolean(item.is_structure_content ?? item.isStructureContent),
    authorBadge: item.author_badge ?? item.authorBadge ?? null,
    structureDisclaimer: item.structure_disclaimer ?? item.structureDisclaimer ?? null,
  }
}

/** @param {Record<string, unknown>} item */
function mapContentFull(item) {
  return {
    ...mapContentSlim(item),
    slug: item.slug ?? '',
    subtitle: item.subtitle ?? '',
    bodyBlocks: Array.isArray(item.body_blocks) ? item.body_blocks : (item.bodyBlocks ?? []),
    tags: item.tags ?? [],
    createdAt: item.created_at ?? item.createdAt ?? null,
  }
}

/**
 * @param {{ status?: string, type?: string, rubricId?: number, page?: number, perPage?: number }} filters
 */
export async function listB2bContents(filters = {}) {
  const params = {}

  if (filters.status) params.status = filters.status
  if (filters.type) params.type = filters.type
  if (filters.rubricId) params.rubric_id = filters.rubricId
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage

  const response = await apiClient.get('/b2b/editorial/contents', { params })
  const data = unwrapApiData(response)
  const contents = Array.isArray(data.contents) ? data.contents : []

  return {
    contents: contents.map(mapContentSlim),
    meta: response.data?.meta ?? {},
  }
}

export async function getB2bContent(uuid) {
  const response = await apiClient.get(`/b2b/editorial/contents/${encodeURIComponent(uuid)}`)
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function createB2bContent(payload) {
  const response = await apiClient.post('/b2b/editorial/contents', payload)
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function updateB2bContent(uuid, payload, { updatedAt } = {}) {
  const body = { ...payload }

  if (updatedAt) {
    body.updated_at = updatedAt
  }

  const response = await apiClient.patch(
    `/b2b/editorial/contents/${encodeURIComponent(uuid)}`,
    body,
  )
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function submitB2bContent(uuid, { note, updatedAt } = {}) {
  const body = {}

  if (note) body.note = note
  if (updatedAt) body.updated_at = updatedAt

  const response = await apiClient.post(
    `/b2b/editorial/contents/${encodeURIComponent(uuid)}/submit`,
    Object.keys(body).length > 0 ? body : undefined,
  )
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export const B2B_EDITORIAL_CONTENT_TYPES = [
  { value: 'story', label: 'Storia' },
  { value: 'article', label: 'Articolo' },
]

export const B2B_EDITORIAL_CONTENT_STATUSES = [
  { value: 'draft', label: 'Bozza' },
  { value: 'pending_review', label: 'In revisione' },
  { value: 'published', label: 'Pubblicato' },
  { value: 'rejected', label: 'Rifiutato' },
]

export const B2B_EDITORIAL_STATUS_COLORS = {
  draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export const B2B_STRUCTURE_DISCLAIMER_FALLBACK =
  'Contenuto redatto dalla struttura. Wenando non garantisce l\'accuratezza delle informazioni e non sostituisce consulenza medica o professionale.'

export const B2B_ALLOWED_BLOCK_TYPES = ['heading', 'paragraph', 'image']

/**
 * @param {{ from?: string, to?: string }} range ISO date strings (YYYY-MM-DD)
 */
export async function fetchB2bEditorialAnalytics({ from, to } = {}) {
  const params = {}

  if (from) params.from = from
  if (to) params.to = to

  const response = await apiClient.get('/b2b/editorial/analytics', { params })
  const data = unwrapApiData(response)

  return {
    viewsByDay: (Array.isArray(data.views_by_day) ? data.views_by_day : []).map((row) => ({
      date: row.date,
      views: row.views ?? 0,
      uniques: row.uniques ?? 0,
      botViews: row.bot_views ?? 0,
    })),
    totals: {
      pageViews: data.totals?.page_views ?? 0,
      uniqueVisitors: data.totals?.unique_visitors ?? 0,
      botViews: data.totals?.bot_views ?? 0,
    },
    topArticles: (Array.isArray(data.top_articles) ? data.top_articles : []).map((item) => ({
      uuid: item.uuid,
      title: item.title ?? '',
      slug: item.slug ?? '',
      rubricSlug: item.rubric_slug ?? null,
      contentType: item.content_type ?? 'article',
      pageViews: item.page_views ?? 0,
      uniqueVisitors: item.unique_visitors ?? 0,
    })),
  }
}
