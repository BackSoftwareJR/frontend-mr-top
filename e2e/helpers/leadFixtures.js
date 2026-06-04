/** Valid consent hashes from `ConsentStoreTest` / `LeadSubmissionTest`. */
export const E2E_PRIVACY_CONSENT_HASH =
  '2215df58adb1f22c6ebabdd592c36ca5f58ab26c8c199d48fe617b0af61dcf00'

export const E2E_TERMS_CONSENT_HASH =
  'e4b21b8bb3965045dd22f39980a48d814a8da11b37c2b4c230808de9ea09a134'

export const E2E_LEAD_SHARING_CONSENT_HASH =
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'

export const E2E_POLICY_VERSION = '1.0.0'

export const E2E_WIZARD_SESSION_ID = 'e2e-playwright'

/**
 * POST /consents — required before POST /b2c/leads (privacy + terms + lead sharing).
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} apiBaseUrl
 * @param {string} [sessionId]
 */
export async function seedWizardConsentsViaApi(
  request,
  apiBaseUrl,
  sessionId = E2E_WIZARD_SESSION_ID,
) {
  const base = apiBaseUrl.replace(/\/$/, '')
  const response = await request.post(`${base}/consents`, {
    data: {
      consents: [
        {
          consent_type: 'privacy_policy',
          policy_version: E2E_POLICY_VERSION,
          consent_given: true,
          consent_text_hash: E2E_PRIVACY_CONSENT_HASH,
          session_id: sessionId,
        },
        {
          consent_type: 'terms_b2c',
          policy_version: E2E_POLICY_VERSION,
          consent_given: true,
          consent_text_hash: E2E_TERMS_CONSENT_HASH,
          session_id: sessionId,
        },
        {
          consent_type: 'lead_sharing',
          policy_version: E2E_POLICY_VERSION,
          consent_given: true,
          consent_text_hash: E2E_LEAD_SHARING_CONSENT_HASH,
          session_id: sessionId,
        },
      ],
    },
  })

  if (!response.ok()) {
    const text = await response.text()
    throw new Error(`Wizard consents failed (${response.status()}): ${text}`)
  }
}
