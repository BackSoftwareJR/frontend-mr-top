export function createBlockId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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
    default:
      return {
        id,
        type: 'paragraph',
        data: { text: '' },
      }
  }
}

export const BLOCK_TYPE_OPTIONS = [
  { type: 'heading', label: 'Titolo (H2/H3)' },
  { type: 'paragraph', label: 'Paragrafo' },
  { type: 'image', label: 'Immagine' },
  { type: 'callout', label: 'Callout' },
]
