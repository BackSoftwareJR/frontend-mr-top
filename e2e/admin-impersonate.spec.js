import { test, expect } from '@playwright/test'
import { loginAdminViaApi, seedAdminLocalStorage } from './helpers/adminAuth.js'
import { seedCookieConsent } from './helpers/browserFixtures.js'
import {
  buildImpersonationHash,
  expectImpersonationCleared,
} from './helpers/impersonation.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

test.describe('Admin impersonation (API)', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('superadmin impersonates Care Partner via API, lands on dashboard with banner, ends session', async ({
    browser,
    request,
  }) => {
    const adminLogin = await loginAdminViaApi(request, apiUrl)
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` }

    const searchResponse = await request.get(`${apiUrl}/admin/search?q=Care`, {
      headers: adminHeaders,
    })
    expect(searchResponse.ok()).toBeTruthy()
    const searchBody = await searchResponse.json()
    const careHit = (searchBody?.data?.partners ?? []).find((p) =>
      p.label?.includes('Care Partner Italia'),
    )
    expect(careHit?.id).toBeTruthy()

    const impersonateResponse = await request.post(
      `${apiUrl}/admin/partners/${careHit.id}/impersonate`,
      { headers: adminHeaders },
    )
    expect(impersonateResponse.ok()).toBeTruthy()
    const impersonateBody = await impersonateResponse.json()
    const token = impersonateBody?.data?.impersonation_token
    const expiresAt = impersonateBody?.data?.expires_at
    const partner = impersonateBody?.data?.partner
    expect(token).toBeTruthy()
    expect(partner?.email).toBe('partner@care.it')

    const walletResponse = await request.get(`${apiUrl}/b2b/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(walletResponse.ok()).toBeTruthy()

    const partnerContext = await browser.newContext()
    const partnerPage = await partnerContext.newPage()
    await seedCookieConsent(partnerPage)
    const hash = buildImpersonationHash({
      token,
      expiresAt,
      partner: {
        email: partner.email,
        organization_name: partner.organization_name,
      },
    })

    await partnerPage.goto(`/pro/impersonate#${hash}`)
    await expect(partnerPage).toHaveURL(/\/pro\/dashboard/, { timeout: 20_000 })

    const banner = partnerPage.getByTestId('impersonation-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText(/partner@care\.it/i)
    await expect(banner).toContainText(/Care Partner/i)

    await partnerPage.getByRole('button', { name: /Termina impersonation/i }).click()
    await expect(partnerPage).toHaveURL(/\/pro\/accedi/)
    await expectImpersonationCleared(partnerPage)

    await partnerContext.close()
  })

  test('ManagePartners impersonate opens partner tab (UI)', async ({ page, request }) => {
    const adminLogin = await loginAdminViaApi(request, apiUrl)
    await seedAdminLocalStorage(page, adminLogin)
    await page.goto('/admin/partners')

    const careCard = page.locator('article').filter({ hasText: 'Care Partner Italia' })
    await expect(careCard).toBeVisible({ timeout: 15_000 })

    await careCard.hover()
    const popupPromise = page.waitForEvent('popup')
    await careCard.getByTitle('Impersonate').click()
    const partnerPage = await popupPromise
    await expect(partnerPage).toHaveURL(/\/pro\/(impersonate|dashboard)/, { timeout: 20_000 })
    await expect(partnerPage).toHaveURL(/\/pro\/dashboard/, { timeout: 20_000 })

    const banner = partnerPage.getByTestId('impersonation-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText(/partner@care\.it/i)

    await partnerPage.close()
  })
})
