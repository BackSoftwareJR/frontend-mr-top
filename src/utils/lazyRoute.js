import { lazy } from 'react'

const CHUNK_RETRY_DELAY_MS = 400

function isChunkLoadError(err) {
  const message = err?.message ?? ''
  return (
    err?.name === 'ChunkLoadError' ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')
  )
}

/**
 * Lazy route import with one retry — helps after deploys when cached HTML references stale chunks.
 */
export function lazyRoute(importFn, retries = 2) {
  return lazy(async () => {
    let lastError

    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        return await importFn()
      } catch (err) {
        lastError = err
        if (!isChunkLoadError(err) || attempt >= retries - 1) {
          throw err
        }
        await new Promise((resolve) => {
          setTimeout(resolve, CHUNK_RETRY_DELAY_MS)
        })
      }
    }

    throw lastError
  })
}
