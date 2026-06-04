/**
 * Prefer first Laravel field message from VALIDATION_FAILED details.
 * @param {import('../services/apiClient').ApiError | Error | unknown} error
 * @param {string} [fallback]
 */
export function formatApiErrorMessage(error, fallback = 'Invio non riuscito. Riprova tra poco.') {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const details = error.details
  if (details && typeof details === 'object') {
    for (const messages of Object.values(details)) {
      if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
        return messages[0]
      }
    }
  }

  if (typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message
  }

  return fallback
}
