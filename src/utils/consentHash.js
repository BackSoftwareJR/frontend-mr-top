/**
 * SHA-256 hex digest for consent label text (GDPR audit trail).
 * Production uses precomputed values in constants/wizardConsent.js (CONSENT_TEXT_HASH).
 * Run this when policy copy changes to regenerate hashes for StoreLeadRequest.consent_text_hash.
 *
 * @param {string} text Canonical checkbox label (must match visible UI copy)
 * @returns {Promise<string>} 64-char lowercase hex digest
 */
export async function sha256ConsentText(text) {
  const encoded = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
