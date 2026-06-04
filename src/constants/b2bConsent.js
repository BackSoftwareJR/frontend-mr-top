import { LEGAL_VERSION } from './legalVersions'

/**
 * Canonical checkbox label for B2B registration — SHA-256 source for consent_text_hash.
 * Must match visible copy on Register.jsx (PRIVACY_POLICY.md).
 */
export const B2B_PRIVACY_CONSENT_LABEL = "Ho letto e accetto l'Informativa sulla Privacy."

export const B2B_PRIVACY_CONSENT_UI = {
  prefix: "Ho letto e accetto l'",
  link: { to: '/privacy', text: 'Informativa sulla Privacy' },
  suffix: '.',
}

/** Precomputed SHA-256 of B2B_PRIVACY_CONSENT_LABEL — PRIVACY_POLICY v1.0.0. */
export const B2B_PRIVACY_TEXT_HASH =
  'ba8597379922b6fe4154e6448474495391e40e7fa2cd8688f51cf159f7252006'

/**
 * @returns {{ privacy_policy_accepted: boolean, consent_text_hash: string, policy_version: string }}
 */
export function buildB2bRegisterPayload() {
  return {
    privacy_policy_accepted: true,
    consent_text_hash: B2B_PRIVACY_TEXT_HASH,
    policy_version: LEGAL_VERSION,
  }
}

/**
 * Canonical checkbox label for B2B onboarding submit — SHA-256 source for terms_text_hash.
 * Must match visible copy on Onboarding review step (TERMS_B2B_PARTNERS.md Art. 22.10).
 */
export const B2B_TERMS_CONSENT_LABEL =
  'Ho letto e accetto le Condizioni Generali di Piattaforma Partner B2B.'

export const B2B_TERMS_CONSENT_UI = {
  prefix: 'Ho letto e accetto le ',
  link: {
    to: '/terms-partners',
    text: 'Condizioni Generali di Piattaforma Partner B2B',
  },
  suffix: '.',
}

/** Precomputed SHA-256 of B2B_TERMS_CONSENT_LABEL — TERMS_B2B_PARTNERS v1.0.0. */
export const B2B_TERMS_TEXT_HASH =
  '3660d5b1e1b49d528e87bf7d844abd9eee72dec18dd798bee1d097bd3d1ce008'

/**
 * @returns {{ terms_b2b_accepted: boolean, terms_text_hash: string, policy_version: string }}
 */
export function buildB2bOnboardingSubmitPayload() {
  return {
    terms_b2b_accepted: true,
    terms_text_hash: B2B_TERMS_TEXT_HASH,
    policy_version: LEGAL_VERSION,
  }
}
