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

import { getLayoutTemplate } from './layouts/registry'

/** @param {string} value @param {string} [defaultValue] */
function isFilledSlot(value, defaultValue) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (defaultValue != null && trimmed === String(defaultValue).trim()) return false
  return true
}

/** @param {string} text */
function countWords(text) {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** @param {string} html */
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Extract plain text from body blocks for SEO analysis.
 * @param {Array<{ type: string, data?: Record<string, unknown> }>} blocks
 */
export function extractTextFromBlocks(blocks) {
  const parts = []

  for (const block of blocks ?? []) {
    if (!block?.type) continue
    const data = block.data ?? {}

    if (block.type === 'heading') {
      parts.push(String(data.text ?? ''))
    } else if (block.type === 'paragraph') {
      parts.push(stripHtml(String(data.html ?? data.text ?? '')))
    } else if (block.type === 'layout') {
      const template = getLayoutTemplate(String(data.template_id ?? ''))
      const slots = { ...template?.defaultSlots, ...(data.slots ?? {}) }
      for (const value of Object.values(slots)) {
        if (typeof value === 'string' && value.trim()) {
          parts.push(value)
        }
      }
    } else if (block.type === 'faq') {
      for (const item of data.items ?? []) {
        parts.push(String(item?.question ?? ''), String(item?.answer ?? ''))
      }
    }
  }

  return parts.join(' ')
}

/**
 * SEO checklist derived from body blocks.
 * @param {Array<{ type: string, data?: Record<string, unknown> }>} blocks
 * @param {{ contentType?: string, rubricSlug?: string }} [ctx]
 */
export function buildBlockSeoChecklist(blocks, ctx = {}) {
  const safeBlocks = Array.isArray(blocks) ? blocks : []
  const fullText = extractTextFromBlocks(safeBlocks)
  const wordCount = countWords(fullText)

  let h2Count = 0
  let hasFaq = false
  let hasCta = false

  for (const block of safeBlocks) {
    if (block.type === 'heading' && Number(block.data?.level) === 2) {
      h2Count += 1
    }

    if (block.type === 'layout') {
      const templateId = String(block.data?.template_id ?? '')
      const template = getLayoutTemplate(templateId)
      const slots = { ...template?.defaultSlots, ...(block.data?.slots ?? {}) }

      if (templateId === 'faq-band') {
        hasFaq = ['q1', 'q2', 'q3'].some(
          (k) =>
            isFilledSlot(String(slots[k] ?? ''), template?.defaultSlots?.[k]) &&
            isFilledSlot(String(slots[`a${k.slice(1)}`] ?? ''), template?.defaultSlots?.[`a${k.slice(1)}`]),
        )
      }
      if (templateId === 'cta-coral' || templateId === 'event-card') {
        const ctaKey = templateId === 'event-card' ? 'cta_label' : 'button_label'
        hasCta = isFilledSlot(String(slots[ctaKey] ?? ''), template?.defaultSlots?.[ctaKey])
      }
      if (['hero-coral', 'interview-qa', 'event-card', 'split-text-image'].includes(templateId)) {
        const titleField = template?.fields?.find((f) => f.seo === 'h2')
        if (titleField && isFilledSlot(String(slots[titleField.key] ?? ''), template?.defaultSlots?.[titleField.key])) {
          h2Count += 1
        }
      }
    }

    if (block.type === 'faq') {
      hasFaq = (block.data?.items ?? []).some(
        (item) => isFilledSlot(String(item?.question ?? '')) && isFilledSlot(String(item?.answer ?? '')),
      )
    }
  }

  const needsFaq =
    ctx.contentType === 'article' ||
    ctx.rubricSlug === 'guide' ||
    ctx.rubricSlug === 'anti-truffe'

  return [
    {
      id: 'h2',
      label: 'Almeno un titolo H2',
      ok: h2Count >= 1,
      detail: h2Count >= 1 ? `${h2Count} sezioni` : 'Aggiungi hero, intervista o titolo H2',
    },
    {
      id: 'faq',
      label: 'Sezione FAQ compilata',
      ok: hasFaq || !needsFaq,
      detail: hasFaq ? 'FAQ presente' : needsFaq ? 'Consigliata per guide e articoli SEO' : 'Opzionale per questo tipo',
      warn: needsFaq && !hasFaq,
    },
    {
      id: 'words',
      label: 'Lunghezza testo (≥ 300 parole)',
      ok: wordCount >= 300,
      detail: `~${wordCount} parole`,
    },
    {
      id: 'cta',
      label: 'Invito all’azione (CTA)',
      ok: hasCta,
      detail: hasCta ? 'CTA presente' : 'Aggiungi event-card o invito all’azione',
    },
  ]
}

/**
 * Layout blocks with empty or placeholder slots.
 * @param {Array<{ type: string, data?: Record<string, unknown> }>} blocks
 */
export function findLayoutBlocksWithMissingSlots(blocks) {
  const issues = []

  for (const block of blocks ?? []) {
    if (block.type !== 'layout') continue

    const templateId = String(block.data?.template_id ?? '')
    const template = getLayoutTemplate(templateId)
    if (!template) continue

    const slots = { ...template.defaultSlots, ...(block.data?.slots ?? {}) }
    const missing = []

    for (const field of template.fields) {
      const value = String(slots[field.key] ?? '')
      if (!isFilledSlot(value, template.defaultSlots[field.key])) {
        missing.push(field.label)
      }
    }

    if (missing.length > 0) {
      issues.push({ templateId, templateLabel: template.label, missing })
    }
  }

  return issues
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
