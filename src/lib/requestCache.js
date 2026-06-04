/** @typedef {{ data: unknown, freshUntil: number, staleUntil: number }} CacheEntry */

const cache = new Map()
const inFlight = new Map()

/**
 * Drop cached GET entries. Pass a key prefix (e.g. `user:`) or omit to clear all.
 * @param {string} [keyOrPrefix]
 */
export function invalidateRequestCache(keyOrPrefix) {
  if (!keyOrPrefix) {
    cache.clear()
    inFlight.clear()
    return
  }

  for (const key of [...cache.keys(), ...inFlight.keys()]) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      cache.delete(key)
      inFlight.delete(key)
    }
  }
}

/**
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @param {{ ttlMs?: number, staleMs?: number }} [options]
 * @returns {Promise<T>}
 * @template T
 */
export async function cachedRequest(key, fetcher, options = {}) {
  const ttlMs = options.ttlMs ?? 30_000
  const staleMs = options.staleMs ?? ttlMs * 4
  const now = Date.now()
  const entry = /** @type {CacheEntry|undefined} */ (cache.get(key))

  if (entry) {
    if (now < entry.freshUntil) {
      return /** @type {T} */ (entry.data)
    }
    if (now < entry.staleUntil) {
      revalidateInBackground(key, fetcher, ttlMs, staleMs)
      return /** @type {T} */ (entry.data)
    }
    cache.delete(key)
  }

  const pending = inFlight.get(key)
  if (pending) {
    return /** @type {Promise<T>} */ (pending)
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, {
        data,
        freshUntil: Date.now() + ttlMs,
        staleUntil: Date.now() + staleMs,
      })
      return data
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return /** @type {Promise<T>} */ (promise)
}

/**
 * @param {string} key
 * @param {() => Promise<unknown>} fetcher
 * @param {number} ttlMs
 * @param {number} staleMs
 */
function revalidateInBackground(key, fetcher, ttlMs, staleMs) {
  if (inFlight.has(key)) return

  const promise = fetcher()
    .then((data) => {
      cache.set(key, {
        data,
        freshUntil: Date.now() + ttlMs,
        staleUntil: Date.now() + staleMs,
      })
      return data
    })
    .catch(() => {
      // Keep serving stale data on background refresh failure.
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
}
