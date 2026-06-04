import { test, expect } from '@playwright/test'
import {
  AUTH_TOKEN_KEY,
  loginPartnerViaApi,
  seedPartnerLocalStorage,
} from './helpers/b2bAuth.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

test.describe('B2B API smoke', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('seeded partner login reaches dashboard with API session', async ({
    page,
    request,
  }) => {
    const loginData = await loginPartnerViaApi(request, apiUrl)
    expect(loginData.token).toBeTruthy()
    expect(loginData.redirect_to).toBe('/pro/dashboard')
    expect(loginData.company?.organization_name).toBe('Care Partner Italia')

    await seedPartnerLocalStorage(page, loginData)
    await page.goto('/pro/dashboard')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByText('Sintesi rapida del tuo account partner'),
    ).toBeVisible()

    const storedToken = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    )
    expect(storedToken).toBe(loginData.token)
  })
})
