import { LEGAL_VERSION } from './legalVersions'

/**
 * Canonical checkbox labels — SHA-256 source for consent_text_hash.
 * Must match TERMS_B2C.md Art. 8.3–8.5 and visible copy in WizardSteps.
 */
export const WIZARD_CONSENT_LABELS = {
  privacy_policy:
    "Ho letto e accetto l'Informativa sulla Privacy. Acconsento al trattamento dei miei dati personali, inclusi eventuali dati relativi al livello di autonomia e alle esigenze assistenziali (dati che possono rivelare informazioni sulla salute), per le finalità di orientamento, matching e gestione della mia richiesta, come descritto nell'Informativa.",
  terms_b2c:
    'Ho letto e accetto le Condizioni Generali di Utilizzo per Utenti Consumatori (B2C).',
  lead_sharing:
    'Acconsento che Wenando condivida i miei dati con strutture partner selezionate per essere ricontattato/a in merito alla mia richiesta.',
}

/** Structured UI fragments — concatenated link text must equal WIZARD_CONSENT_LABELS. */
export const WIZARD_CONSENT_UI = {
  privacy_policy: {
    prefix: "Ho letto e accetto l'",
    link: { to: '/privacy', text: 'Informativa sulla Privacy' },
    suffix:
      '. Acconsento al trattamento dei miei dati personali, inclusi eventuali dati relativi al livello di autonomia e alle esigenze assistenziali (dati che possono rivelare informazioni sulla salute), per le finalità di orientamento, matching e gestione della mia richiesta, come descritto nell\'Informativa.',
  },
  terms_b2c: {
    prefix: 'Ho letto e accetto le ',
    link: {
      to: '/terms',
      text: 'Condizioni Generali di Utilizzo per Utenti Consumatori (B2C)',
    },
    suffix: '.',
  },
}

/** Precomputed SHA-256 of WIZARD_CONSENT_LABELS — align with TERMS_B2C Art. 8.3–8.5 v1.0.0. */
export const CONSENT_TEXT_HASH = {
  privacy_policy: '2215df58adb1f22c6ebabdd592c36ca5f58ab26c8c199d48fe617b0af61dcf00',
  terms_b2c: 'e4b21b8bb3965045dd22f39980a48d814a8da11b37c2b4c230808de9ea09a134',
  lead_sharing: 'dc48a91ab1050762047e42d985f3545596aa1c4d2f72cb8a2c003f6172d90905',
}

/**
 * Builds payload for POST /api/v1/consents.
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean }} consents
 * @param {string} sessionId
 */
export function buildApiConsents(consents, sessionId) {
  /** @type {Array<{ consent_type: string, policy_version: string, consent_given: boolean, consent_text_hash: string, session_id: string }>} */
  const entries = []

  if (consents.privacy) {
    entries.push({
      consent_type: 'privacy_policy',
      policy_version: LEGAL_VERSION,
      consent_given: true,
      consent_text_hash: CONSENT_TEXT_HASH.privacy_policy,
      session_id: sessionId,
    })
  }

  if (consents.terms) {
    entries.push({
      consent_type: 'terms_b2c',
      policy_version: LEGAL_VERSION,
      consent_given: true,
      consent_text_hash: CONSENT_TEXT_HASH.terms_b2c,
      session_id: sessionId,
    })
  }

  if (consents.partnerContact) {
    entries.push({
      consent_type: 'lead_sharing',
      policy_version: LEGAL_VERSION,
      consent_given: true,
      consent_text_hash: CONSENT_TEXT_HASH.lead_sharing,
      session_id: sessionId,
    })
  }

  return entries
}

/**
 * Local audit payload retained in wizard state (mock lead pipeline / debugging).
 * @param {{ privacy: boolean, terms: boolean, partnerContact: boolean }} consents
 * @param {Record<string, unknown>} answers
 */
export function buildWizardConsentPayload(consents, answers) {
  const now = new Date().toISOString()
  return {
    submitted_at: now,
    wizard_id: 'wenando-intake-v3',
    policy_version: LEGAL_VERSION,
    answers,
    consents: {
      privacy_policy: {
        accepted: consents.privacy,
        version: LEGAL_VERSION,
        consent_text_hash: CONSENT_TEXT_HASH.privacy_policy,
        label: WIZARD_CONSENT_LABELS.privacy_policy,
        timestamp: now,
      },
      terms_b2c: {
        accepted: consents.terms,
        version: LEGAL_VERSION,
        consent_text_hash: CONSENT_TEXT_HASH.terms_b2c,
        label: WIZARD_CONSENT_LABELS.terms_b2c,
        timestamp: now,
      },
      lead_sharing: {
        accepted: consents.partnerContact,
        version: LEGAL_VERSION,
        consent_text_hash: CONSENT_TEXT_HASH.lead_sharing,
        label: WIZARD_CONSENT_LABELS.lead_sharing,
        timestamp: now,
      },
    },
  }
}
