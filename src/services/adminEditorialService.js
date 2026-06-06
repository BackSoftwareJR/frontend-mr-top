import apiClient, { unwrapApiData } from './apiClient'

/** @param {Record<string, unknown>} item */
function mapContentSlim(item) {
  return {
    uuid: item.uuid,
    contentType: item.content_type ?? item.contentType ?? 'article',
    status: item.status ?? 'draft',
    title: item.title ?? '',
    excerpt: item.excerpt ?? '',
    rubricId: item.rubric_id ?? item.rubricId ?? null,
    rubricSlug: item.rubric_slug ?? item.rubricSlug ?? null,
    authorType: item.author_type ?? item.authorType ?? null,
    readMinutes: item.read_minutes ?? item.readMinutes ?? null,
    featured: Boolean(item.featured),
    seoScore: item.seo_score ?? item.seoScore ?? item.seo_pack?.seo_score ?? null,
    updatedAt: item.updated_at ?? item.updatedAt ?? null,
    rubric: item.rubric ?? null,
  }
}

/** @param {Record<string, unknown>} item */
function mapContentFull(item) {
  return {
    ...mapContentSlim(item),
    slug: item.slug ?? '',
    subtitle: item.subtitle ?? '',
    bodyBlocks: Array.isArray(item.body_blocks) ? item.body_blocks : (item.bodyBlocks ?? []),
    seoPack: item.seo_pack ?? item.seoPack ?? null,
    tags: item.tags ?? [],
    noindex: Boolean(item.noindex),
    publishedAt: item.published_at ?? item.publishedAt ?? null,
    createdAt: item.created_at ?? item.createdAt ?? null,
  }
}

/** @param {Record<string, unknown>} item */
function mapReviewQueueItem(item) {
  const content = item.content ?? {}
  const moderation = item.moderation ?? null

  return {
    content: mapContentSlim(content),
    moderation: moderation
      ? {
          id: moderation.id,
          status: moderation.status,
          companyId: moderation.company_id ?? moderation.companyId ?? null,
          submittedAt: moderation.submitted_at ?? moderation.submittedAt ?? null,
          assignedReviewerId:
            moderation.assigned_reviewer_id ?? moderation.assignedReviewerId ?? null,
        }
      : null,
  }
}

/** @param {Record<string, unknown>} rule */
function mapIndexRule(rule) {
  return {
    id: rule.id,
    rubricSlug: rule.rubric_slug ?? rule.rubricSlug ?? null,
    scope: rule.scope ?? (rule.rubric_slug == null ? 'global' : 'rubric'),
    includeInSitemap: Boolean(rule.include_in_sitemap ?? rule.includeInSitemap),
    includeInInternalSearch: Boolean(
      rule.include_in_internal_search ?? rule.includeInInternalSearch,
    ),
    noindexDefault: Boolean(rule.noindex_default ?? rule.noindexDefault),
    excludeFromCrawl: Boolean(rule.exclude_from_crawl ?? rule.excludeFromCrawl),
    isActive: Boolean(rule.is_active ?? rule.isActive ?? true),
    notes: rule.notes ?? '',
    updatedAt: rule.updated_at ?? rule.updatedAt ?? null,
  }
}

/** @param {Record<string, unknown>} item */
function mapIndexQueueItem(item) {
  const content = item.content ?? null

  return {
    id: item.id,
    action: item.action ?? '',
    status: item.status ?? '',
    scheduledAt: item.scheduled_at ?? item.scheduledAt ?? null,
    processedAt: item.processed_at ?? item.processedAt ?? null,
    errorMessage: item.error_message ?? item.errorMessage ?? null,
    content: content
      ? {
          uuid: content.uuid,
          title: content.title ?? '',
          slug: content.slug ?? '',
          status: content.status ?? '',
        }
      : null,
  }
}

/** @param {Record<string, unknown>} item */
function mapSuggestedLink(item) {
  return {
    targetUuid: item.target_uuid ?? item.targetUuid ?? '',
    title: item.title ?? '',
    slug: item.slug ?? '',
    rubricSlug: item.rubric_slug ?? item.rubricSlug ?? null,
    score: item.score ?? 0,
    anchorText: item.anchor_text ?? item.anchorText ?? null,
    linkType: item.link_type ?? item.linkType ?? 'suggested',
  }
}

/**
 * @param {{ status?: string, type?: string, rubricId?: number, q?: string, page?: number, perPage?: number }} filters
 */
export async function listContents(filters = {}) {
  const params = {}

  if (filters.status) params.status = filters.status
  if (filters.type) params.type = filters.type
  if (filters.rubricId) params.rubric_id = filters.rubricId
  if (filters.q) params.q = filters.q
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage

  const response = await apiClient.get('/admin/editorial/contents', { params })
  const data = unwrapApiData(response)
  const contents = Array.isArray(data.contents) ? data.contents : []

  return {
    contents: contents.map(mapContentSlim),
    meta: response.data?.meta ?? {},
  }
}

export async function getContent(uuid) {
  const response = await apiClient.get(`/admin/editorial/contents/${encodeURIComponent(uuid)}`)
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function createContent(payload) {
  const response = await apiClient.post('/admin/editorial/contents', payload)
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function updateContent(uuid, payload, { updatedAt } = {}) {
  const body = { ...payload }

  if (updatedAt) {
    body.updated_at = updatedAt
  }

  const response = await apiClient.patch(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}`,
    body,
  )
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function deleteContent(uuid) {
  const response = await apiClient.delete(`/admin/editorial/contents/${encodeURIComponent(uuid)}`)
  return unwrapApiData(response)
}

export async function transitionContent(uuid, toStatus, { note, updatedAt } = {}) {
  const body = { to_status: toStatus }

  if (note) body.note = note
  if (updatedAt) body.updated_at = updatedAt

  const response = await apiClient.post(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/transition`,
    body,
  )
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return mapContentFull(content)
}

export async function getReviewQueue(params = {}) {
  const response = await apiClient.get('/admin/editorial/review-queue', { params })
  const data = unwrapApiData(response)
  const items = Array.isArray(data.items) ? data.items : []

  return {
    items: items.map(mapReviewQueueItem),
    meta: response.data?.meta ?? {},
  }
}

export async function getIndexRules() {
  const response = await apiClient.get('/admin/editorial/index-rules')
  const data = unwrapApiData(response)
  const rules = Array.isArray(data.rules) ? data.rules : []

  return rules.map(mapIndexRule)
}

export async function patchIndexRule(id, patch) {
  const body = {}

  if (patch.includeInSitemap !== undefined) body.include_in_sitemap = patch.includeInSitemap
  if (patch.includeInInternalSearch !== undefined) {
    body.include_in_internal_search = patch.includeInInternalSearch
  }
  if (patch.noindexDefault !== undefined) body.noindex_default = patch.noindexDefault
  if (patch.excludeFromCrawl !== undefined) body.exclude_from_crawl = patch.excludeFromCrawl
  if (patch.isActive !== undefined) body.is_active = patch.isActive
  if (patch.notes !== undefined) body.notes = patch.notes

  const response = await apiClient.patch(`/admin/editorial/index-rules/${id}`, body)
  const data = unwrapApiData(response)
  const rule = data.rule ?? data

  return mapIndexRule(rule)
}

export async function postReindex(body = {}) {
  const payload = {}

  if (body.contentUuid) payload.content_uuid = body.contentUuid
  if (body.rubricSlug) payload.rubric_slug = body.rubricSlug

  const response = await apiClient.post('/admin/editorial/reindex', payload)
  return unwrapApiData(response)
}

export async function getIndexQueue(limit = 25) {
  const response = await apiClient.get('/admin/editorial/index-queue', { params: { limit } })
  const data = unwrapApiData(response)
  const items = Array.isArray(data.items) ? data.items : []

  return items.map(mapIndexQueueItem)
}

export async function getSuggestedLinks(uuid) {
  const response = await apiClient.get(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/suggested-links`,
  )
  const data = unwrapApiData(response)
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []

  return suggestions.map(mapSuggestedLink)
}

export async function generatePreviewToken(uuid) {
  const response = await apiClient.post(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/preview-token`,
  )
  const data = unwrapApiData(response)

  return {
    previewUrl: data.preview_url ?? data.previewUrl ?? '',
    expiresAt: data.expires_at ?? data.expiresAt ?? null,
  }
}

/** @param {Record<string, unknown>} generation */
function mapSeoGeneration(generation) {
  return {
    id: generation.id,
    contentId: generation.content_id ?? generation.contentId ?? null,
    seoPack: generation.seo_pack ?? generation.seoPack ?? null,
    score: generation.score ?? generation.seo_pack?.seo_score ?? generation.seoPack?.seo_score ?? null,
    status: generation.status ?? null,
    groqModel: generation.groq_model ?? generation.groqModel ?? null,
    promptVersion: generation.prompt_version ?? generation.promptVersion ?? null,
    latencyMs: generation.latency_ms ?? generation.latencyMs ?? null,
    errorMessage: generation.error_message ?? generation.errorMessage ?? null,
    reviewedByUserId: generation.reviewed_by_user_id ?? generation.reviewedByUserId ?? null,
    reviewedAt: generation.reviewed_at ?? generation.reviewedAt ?? null,
    createdAt: generation.created_at ?? generation.createdAt ?? null,
  }
}

/** @param {import('axios').AxiosResponse} response */
function mapSeoShowResponse(response) {
  const data = unwrapApiData(response)
  const latest = data.latest ?? null
  const history = Array.isArray(data.history) ? data.history : []

  return {
    latest: latest ? mapSeoGeneration(latest) : null,
    history: history.map(mapSeoGeneration),
    historyCount: history.length,
    contentSeoPack: data.content_seo_pack ?? data.contentSeoPack ?? null,
    groqConfigured: Boolean(data.groq_configured ?? data.groqConfigured),
  }
}

export async function getSeo(uuid) {
  const response = await apiClient.get(`/admin/editorial/contents/${encodeURIComponent(uuid)}/seo`)
  return mapSeoShowResponse(response)
}

export async function regenerateSeo(uuid) {
  const response = await apiClient.post(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/seo/regenerate`,
  )
  const data = unwrapApiData(response)
  const generation = data.generation ?? data

  return {
    generation: generation ? mapSeoGeneration(generation) : null,
  }
}

/**
 * @param {string} uuid
 * @param {{ generationId?: number, manualOverrides?: Record<string, unknown>, seoPack?: Record<string, unknown> }} [options]
 */
export async function approveSeo(uuid, options = {}) {
  const body = {}

  if (options.generationId) body.generation_id = options.generationId
  if (options.manualOverrides) body.manual_overrides = options.manualOverrides
  if (options.seoPack) body.seo_pack = options.seoPack

  const response = await apiClient.post(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/seo/approve`,
    Object.keys(body).length > 0 ? body : undefined,
  )
  const data = unwrapApiData(response)
  const content = data.content ?? data

  return {
    content: content ? mapContentFull(content) : null,
  }
}

/**
 * @param {string} uuid
 * @param {{ note?: string | null, generationId?: number }} [options]
 */
export async function rejectSeo(uuid, options = {}) {
  const body = {}

  if (options.note) body.note = options.note
  if (options.generationId) body.generation_id = options.generationId

  const response = await apiClient.post(
    `/admin/editorial/contents/${encodeURIComponent(uuid)}/seo/reject`,
    Object.keys(body).length > 0 ? body : undefined,
  )
  const data = unwrapApiData(response)
  const generation = data.generation ?? data

  return {
    generation: generation ? mapSeoGeneration(generation) : null,
  }
}

export const EDITORIAL_CONTENT_TYPES = [
  { value: 'article', label: 'Articolo' },
  { value: 'story', label: 'Storia' },
  { value: 'interview', label: 'Intervista' },
  { value: 'event', label: 'Evento' },
]

export const EDITORIAL_CONTENT_STATUSES = [
  { value: 'draft', label: 'Bozza' },
  { value: 'pending_review', label: 'In revisione' },
  { value: 'scheduled', label: 'Programmato' },
  { value: 'published', label: 'Pubblicato' },
  { value: 'archived', label: 'Archiviato' },
  { value: 'rejected', label: 'Rifiutato' },
]

export const EDITORIAL_STATUS_COLORS = {
  draft: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  pending_review: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  archived: 'bg-zinc-600/15 text-zinc-500 border-zinc-600/25',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/25',
}
