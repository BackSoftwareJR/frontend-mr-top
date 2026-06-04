import { test, expect } from '@playwright/test'
import { loginAdminViaApi, seedAdminLocalStorage } from './helpers/adminAuth.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

test.describe('Admin lead assign (API)', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('superadmin assigns seeded consumer lead to Care Partner via API', async ({
    request,
  }) => {
    const adminLogin = await loginAdminViaApi(request, apiUrl)
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` }

    const leadsResponse = await request.get(`${apiUrl}/admin/leads`, {
      headers: adminHeaders,
    })
    expect(leadsResponse.ok()).toBeTruthy()
    const leadsBody = await leadsResponse.json()
    const giuliaLead = (leadsBody?.data?.leads ?? []).find((l) =>
      l.utente?.includes('Giulia'),
    )
    expect(giuliaLead?.id).toBeTruthy()

    const partnersResponse = await request.get(`${apiUrl}/admin/partners`, {
      headers: adminHeaders,
      params: { stato: 'Active' },
    })
    expect(partnersResponse.ok()).toBeTruthy()
    const partnersBody = await partnersResponse.json()
    const carePartner = (partnersBody?.data?.partners ?? []).find((p) =>
      p.nome_struttura?.includes('Care Partner Italia'),
    )
    expect(carePartner?.id).toBeTruthy()

    const assignResponse = await request.patch(
      `${apiUrl}/admin/leads/${giuliaLead.id}/assign`,
      {
        headers: adminHeaders,
        data: { partner_id: carePartner.id },
      },
    )
    expect(assignResponse.ok()).toBeTruthy()
    const assignBody = await assignResponse.json()
    expect(assignBody?.success).toBe(true)
    expect(assignBody?.data?.lead?.status).toBe('assigned')
    expect(assignBody?.data?.assignment?.company_id).toBeTruthy()

    const detailResponse = await request.get(`${apiUrl}/admin/leads/${giuliaLead.id}`, {
      headers: adminHeaders,
    })
    expect(detailResponse.ok()).toBeTruthy()
    const detailBody = await detailResponse.json()
    expect(detailBody?.data?.lead?.admin_status).toBe('Assegnato')
  })

  test('Lead Router UI assigns lead to Care Partner', async ({ page, request }) => {
    const adminLogin = await loginAdminViaApi(request, apiUrl)
    await seedAdminLocalStorage(page, adminLogin)
    await page.goto('/admin/leads')

    const giuliaRow = page.getByRole('row').filter({ hasText: 'Giulia' })
    await expect(giuliaRow).toBeVisible({ timeout: 15_000 })
    await giuliaRow.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.locator('#partner-override').selectOption({ label: 'Care Partner Italia' })
    await page.getByRole('button', { name: /Salva assegnazione/i }).click()

    await expect(page.getByTestId('lead-assign-success-toast')).toBeVisible({
      timeout: 10_000,
    })
    await expect(giuliaRow).toContainText(/Assegnato/i)
  })
})
