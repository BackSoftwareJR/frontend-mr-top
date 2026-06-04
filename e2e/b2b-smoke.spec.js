import { test, expect } from '@playwright/test'

/**
 * Smoke tests run without VITE_API_URL (mock/localStorage mode).
 * No seeded backend — suitable for CI and local `npm run test:e2e`.
 */
test.describe('B2B smoke (no API)', () => {
  test('partner portal landing loads', async ({ page }) => {
    await page.goto('/pro')
    await expect(page.getByText('Area Partner B2B')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Wenando Pro' }).first()).toBeVisible()
  })

  test('partner login page loads', async ({ page }) => {
    await page.goto('/pro/accedi')
    await expect(
      page.getByRole('heading', { name: 'Accedi Area Partner' }),
    ).toBeVisible()
  })

  test('marketplace route is guarded without session', async ({ page }) => {
    await page.goto('/pro/marketplace')
    await expect(page).toHaveURL(/\/pro\/?$/)
  })
})
