import { test, expect } from '@playwright/test'

const GEO_FIXTURES = [
  {
    type: 'comune',
    label: 'Milano (MI)',
    lat: 45.4642,
    lng: 9.19,
    meta: { city: 'Milano', province: 'MI', region: 'Lombardia' },
  },
  {
    type: 'comune',
    label: 'Roma (RM)',
    lat: 41.9028,
    lng: 12.4964,
    meta: { city: 'Roma', province: 'RM', region: 'Lazio' },
  },
]

const MOCK_LEAD_UUID = 'e2e-geo-lead-uuid'

const MOCK_MATCH = {
  id: '101',
  name: 'Casa Serenità',
  type: 'Assistenza Domiciliare',
  location: 'Milano, Zona Navigli',
  compatibility: 95,
  image_url:
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80',
  description: 'Assistenza personalizzata con operatori qualificati.',
  pros: ['Operatori fissi', 'Orari su misura'],
  contact_hint: 'Richiedi un sopralluogo gratuito.',
  covers_zone: true,
  distance_km: 6.5,
}

test.beforeEach(async ({ page }) => {
  await page.route('**/sanctum/csrf-cookie**', async (route) => {
    await route.fulfill({ status: 204, body: '' })
  })

  await page.route('**/geo/search**', async (route) => {
    const url = new URL(route.request().url())
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const results = GEO_FIXTURES.filter((item) => item.label.toLowerCase().includes(q))

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { results } }),
    })
  })

  await page.route('**/consents**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { recorded: true } }),
    })
  })

  await page.route('**/b2c/leads**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (method === 'POST' && !url.includes(MOCK_LEAD_UUID)) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            lead: { uuid: MOCK_LEAD_UUID, public_ref: 'E2E-GEO', status: 'routed' },
            job_id: 'e2e-job',
          },
        }),
      })
      return
    }

    if (url.includes('/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { status: 'routed' } }),
      })
      return
    }

    if (url.includes('/results')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            matches: [MOCK_MATCH],
            advisor: { name: 'Marco', role: 'Consulente', story: 'E2E', cta_label: 'Prenota' },
          },
        }),
      })
      return
    }

    await route.continue()
  })
})

async function dismissCookieBanner(page) {
  const accept = page.getByRole('button', { name: 'Accetta tutti' })
  if (await accept.isVisible().catch(() => false)) {
    await accept.click()
  }
}

async function advanceToLocationStep(page) {
  await page.goto('/wizard')
  await dismissCookieBanner(page)
  await page.getByRole('button', { name: 'Parziale' }).click()
  await expect(page.getByTestId('wizard-location-step')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('interest-area-search')).toBeVisible({ timeout: 20_000 })
}

async function selectFirstSearchResult(page, query) {
  const search = page.getByTestId('interest-area-search')
  await search.fill(query)
  const result = page.getByTestId('interest-area-search-result').first()
  await expect(result).toBeVisible({ timeout: 15_000 })
  await result.click()
}

test.describe('B2C wizard geographic coverage', () => {
  test('location step: search a place and continue', async ({ page }) => {
    await advanceToLocationStep(page)

    await selectFirstSearchResult(page, 'Milano')

    const continueBtn = page.getByTestId('wizard-location-continue')
    await expect(continueBtn).toBeEnabled()
    await continueBtn.click()

    await expect(
      page.getByRole('heading', { name: 'Qual è il tuo budget mensile?' }),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('location step: add interest area via search', async ({ page }) => {
    await advanceToLocationStep(page)

    await selectFirstSearchResult(page, 'Roma')

    await expect(page.getByRole('button', { name: /Roma \(RM\)/ })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('results page shows match cards after mock wizard submit', async ({ page }) => {
    await advanceToLocationStep(page)
    await selectFirstSearchResult(page, 'Milano')
    await page.getByTestId('wizard-location-continue').click()
    await page.getByRole('button', { name: 'Continua' }).click()
    await page.getByLabel('Nome').fill('E2E Geo')
    await page.getByLabel('Telefono').fill('+39 333 000 1111')
    await page.locator('#consent-privacy').check()
    await page.locator('#consent-terms').check()
    await dismissCookieBanner(page)
    await page.getByRole('button', { name: 'Mostrami le opzioni' }).click()
    await expect(page.getByTestId('match-results-list')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId('match-card').first()).toBeVisible()
  })
})
