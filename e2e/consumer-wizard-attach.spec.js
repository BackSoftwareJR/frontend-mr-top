import { test, expect } from '@playwright/test'
import {
  AUTH_TOKEN_KEY,
  loginConsumerViaApi,
  seedConsumerLocalStorage,
} from './helpers/b2cAuth.js'
import {
  E2E_LEAD_SHARING_CONSENT_HASH,
  E2E_POLICY_VERSION,
  E2E_PRIVACY_CONSENT_HASH,
  E2E_TERMS_CONSENT_HASH,
  E2E_WIZARD_SESSION_ID,
  seedWizardConsentsViaApi,
} from './helpers/leadFixtures.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

test.describe('B2C consumer attach', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('seeded consumer login shows searches list item', async ({ page, request }) => {
    const loginData = await loginConsumerViaApi(request, apiUrl)
    expect(loginData.token).toBeTruthy()
    expect(loginData.redirect_to).toBe('/user')

    await seedConsumerLocalStorage(page, loginData)
    await page.goto('/area-personale/ricerche')

    await expect(
      page.getByText('Senior Care · Assistenza per autonomia parziale'),
    ).toBeVisible({ timeout: 15_000 })

    const storedToken = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    )
    expect(storedToken).toBe(loginData.token)
  })

  test('attach orphan lead via API hydrates session fields', async ({ page, request }) => {
    await seedWizardConsentsViaApi(request, apiUrl)
    const attachEmail = 'e2e-attach-user@wenando.test'
    const loginData = await loginConsumerViaApi(request, apiUrl, { email: attachEmail })
    const token = loginData.token
    const headers = { Authorization: `Bearer ${token}` }

    const leadResponse = await request.post(`${apiUrl}/b2c/leads`, {
      data: {
        sector_slug: 'senior-care',
        payload: {
          autonomy: 'parziale',
          location: { label: 'Roma (RM)', value: 'roma-rm' },
          budget: { min: 1500, max: 2500 },
          contact: {
            nome: 'E2E Attach',
            telefono: '+39 340 111 2222',
            email: 'e2e-attach@wenando.test',
          },
        },
        consent: {
          privacy_accepted: true,
          terms_accepted: true,
          lead_sharing_accepted: true,
          marketing_accepted: false,
        },
        session_id: E2E_WIZARD_SESSION_ID,
        policy_version: E2E_POLICY_VERSION,
        consent_text_hash: E2E_PRIVACY_CONSENT_HASH,
        terms_text_hash: E2E_TERMS_CONSENT_HASH,
        lead_sharing_text_hash: E2E_LEAD_SHARING_CONSENT_HASH,
      },
    })

    expect(leadResponse.ok()).toBeTruthy()
    const leadBody = await leadResponse.json()
    const leadUuid = leadBody?.data?.lead?.uuid
    expect(leadUuid).toBeTruthy()

    const attachResponse = await request.post(`${apiUrl}/user/leads`, {
      headers,
      data: { lead_uuid: leadUuid },
    })

    expect(attachResponse.ok()).toBeTruthy()
    const attachBody = await attachResponse.json()
    expect(attachBody?.data?.user?.name).toBe('E2E Attach')
    expect(attachBody?.data?.user?.phone).toBe('+39 340 111 2222')

    await seedConsumerLocalStorage(page, {
      ...loginData,
      user: {
        ...loginData.user,
        name: attachBody.data.user.name,
        phone: attachBody.data.user.phone,
      },
    })
    await page.goto('/area-personale/profilo')

    await expect(page.getByLabel('Nome')).toHaveValue('E2E Attach', { timeout: 15_000 })
    await expect(page.getByLabel('Telefono')).toHaveValue('+39 340 111 2222')
  })
})
