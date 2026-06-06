import { createDefaultSlots, getLayoutTemplate } from './layouts/registry'

export function createBlockId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** @param {string} templateId */
export function createLayoutBlock(templateId) {
  const template = getLayoutTemplate(templateId)
  if (!template) {
    return createLayoutBlock('prose-block')
  }

  return {
    id: createBlockId(),
    type: 'layout',
    data: {
      template_id: templateId,
      slots: createDefaultSlots(templateId),
    },
  }
}

/** Starter blocks for new articles — Wix-style hero + prose + highlight */
export function createStarterArticleBlocks() {
  return createStarterBlocksForContentType('article')
}

/**
 * Smart starter layouts per content type (and optional rubric).
 * @param {string} contentType — article | story | interview | event
 * @param {string} [rubricSlug]
 */
export function createStarterBlocksForContentType(contentType, rubricSlug) {
  if (rubricSlug === 'anti-truffe' || rubricSlug === 'guide') {
    return [
      createLayoutBlock('hero-coral'),
      createLayoutBlock('prose-block'),
      createLayoutBlock('checklist-band'),
      createLayoutBlock('faq-band'),
    ]
  }

  switch (contentType) {
    case 'interview':
      return [createLayoutBlock('interview-qa'), createLayoutBlock('prose-block')]
    case 'event':
      return [createLayoutBlock('event-card'), createLayoutBlock('prose-block')]
    case 'story':
      return [
        createLayoutBlock('hero-coral'),
        createLayoutBlock('prose-block'),
        createLayoutBlock('quote-spotlight'),
      ]
    case 'article':
    default:
      return [
        createLayoutBlock('hero-coral'),
        createLayoutBlock('prose-block'),
        createLayoutBlock('highlight-band'),
      ]
  }
}

/** @param {'heading'|'paragraph'|'image'|'callout'} type */
export function createEmptyBlock(type) {
  const id = createBlockId()

  switch (type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        data: { level: 2, text: '', anchor: '' },
      }
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        data: { text: '' },
      }
    case 'image':
      return {
        id,
        type: 'image',
        data: { url: '', alt: '', caption: '', credit: '' },
      }
    case 'callout':
      return {
        id,
        type: 'callout',
        data: { variant: 'info', title: '', text: '' },
      }
    case 'layout':
      return createLayoutBlock('prose-block')
    default:
      return createLayoutBlock('prose-block')
  }
}

export const BLOCK_TYPE_OPTIONS = [
  { type: 'layout', label: 'Sezione layout' },
  { type: 'heading', label: 'Titolo (H2/H3)' },
  { type: 'paragraph', label: 'Paragrafo' },
  { type: 'image', label: 'Immagine' },
  { type: 'callout', label: 'Callout' },
]
