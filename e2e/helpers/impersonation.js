import {
  IMPERSONATION_ACTIVE_KEY,
  IMPERSONATION_SESSION_KEY,
  IMPERSONATION_TOKEN_KEY,
} from '../../src/services/impersonationService.js'

/**
 * Build `/pro/impersonate#…` hash from admin impersonate API payload.
 * @param {{ token: string, expiresAt?: string, partner?: { email?: string, organizationName?: string, organization_name?: string } }} payload
 */
export function buildImpersonationHash(payload) {
  const params = new URLSearchParams()
  params.set('t', payload.token)
  if (payload.expiresAt) params.set('exp', payload.expiresAt)
  const partner = payload.partner ?? {}
  const email = partner.email ?? 'partner@care.it'
  const name =
    partner.organizationName ??
    partner.organization_name ??
    'Care Partner Italia'
  params.set('email', email)
  params.set('name', name)
  return params.toString()
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function expectImpersonationCleared(page) {
  const active = await page.evaluate((key) => sessionStorage.getItem(key), IMPERSONATION_ACTIVE_KEY)
  const token = await page.evaluate((key) => sessionStorage.getItem(key), IMPERSONATION_TOKEN_KEY)
  const session = await page.evaluate((key) => sessionStorage.getItem(key), IMPERSONATION_SESSION_KEY)
  if (active !== null || token !== null || session !== null) {
    throw new Error(
      `Impersonation sessionStorage not cleared (active=${active}, token=${token ? 'set' : 'null'})`,
    )
  }
}
