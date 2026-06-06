/** @param {number | null | undefined} score */
export function getSeoScoreBadgeClass(score) {
  if (score == null) return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
  if (score >= 85) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  if (score >= 70) return 'bg-amber-500/15 text-amber-400 border-amber-500/25'
  return 'bg-red-500/15 text-red-400 border-red-500/25'
}

/** @param {number | null | undefined} score */
export function getSeoScoreTextClass(score) {
  if (score == null) return 'text-zinc-600'
  if (score >= 85) return 'text-emerald-400'
  if (score >= 70) return 'text-amber-400'
  return 'text-red-400'
}

export const SEO_MIN_SCORE = 70

/** @param {Record<string, unknown>} pack */
export function isSeoApproved(pack) {
  return Boolean(pack?.approved)
}

/** Human-readable labels for seo_score_breakdown keys */
export const SEO_BREAKDOWN_LABELS = {
  title_length: 'Lunghezza titolo',
  description_length: 'Lunghezza description',
  keyword_in_title: 'Keyword nel titolo',
  heading_structure: 'Struttura heading',
  internal_links: 'Link interni',
  faq_present: 'FAQ presente',
  ymyl_disclaimer: 'Disclaimer YMYL',
  readability: 'Leggibilità',
  geo_excerpt_quality: 'Qualità excerpt GEO',
}
