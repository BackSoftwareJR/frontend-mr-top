import { test, expect } from '@playwright/test'
import { loginAdminViaApi, seedAdminLocalStorage } from './helpers/adminAuth.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

test.describe('Admin global search (API)', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('superadmin search returns partner and lead hits and spotlight navigates', async ({
    page,
    request,
  }) => {
    const adminLogin = await loginAdminViaApi(request, apiUrl)
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` }

    const partnerSearch = await request.get(`${apiUrl}/admin/search?q=Care`, {
      headers: adminHeaders,
    })
    expect(partnerSearch.ok()).toBeTruthy()
    const partnerBody = await partnerSearch.json()
    expect(partnerBody?.data?.partners?.length).toBeGreaterThan(0)
    expect(partnerBody.data.partners.some((p) => p.label?.includes('Care Partner Italia'))).toBe(
      true,
    )

    const leadSearch = await request.get(`${apiUrl}/admin/search?q=Giulia`, {
      headers: adminHeaders,
    })
    expect(leadSearch.ok()).toBeTruthy()
    const leadBody = await leadSearch.json()
    expect(leadBody?.data?.leads?.length).toBeGreaterThan(0)

    await seedAdminLocalStorage(page, adminLogin)
    await page.goto('/admin')

    const spotlight = page.locator('#admin-spotlight')
    await spotlight.click()
    await spotlight.fill('Care')

    const firstOption = page.getByRole('option').first()
    await expect(firstOption).toBeVisible({ timeout: 15_000 })

    await spotlight.press('ArrowDown')
    await expect(page.locator('[aria-selected="true"]')).toBeVisible()

    await page.getByRole('option', { name: /^partner Care Partner Italia/i }).click()
    await expect(page).toHaveURL(/\/admin\/partners/)
  })
})
