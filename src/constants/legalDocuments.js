/** Public markdown paths for lawyer-grade legal documents (synced from backend/docs/legal/). */
export const legalMarkdownFiles = {
  privacy: '/legal/PRIVACY_POLICY.md',
  cookies: '/legal/COOKIE_POLICY.md',
  terms: '/legal/TERMS_B2C.md',
  termsPartners: '/legal/TERMS_B2B_PARTNERS.md',
}

const LEGAL_ROUTES = {
  'PRIVACY_POLICY.md': '/privacy',
  'COOKIE_POLICY.md': '/cookies',
  'TERMS_B2C.md': '/terms',
  'TERMS_B2B_PARTNERS.md': '/terms-partners',
}

/** Map relative .md cross-links in legal docs to SPA routes. */
export function resolveLegalHref(href) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:')) {
    return null
  }

  if (href.startsWith('#')) {
    return href
  }

  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''
  const filename = pathPart.replace(/^\.\//, '').split('/').pop()
  const route = LEGAL_ROUTES[filename]

  return route ? `${route}${hash}` : null
}
