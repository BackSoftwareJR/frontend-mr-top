const STORAGE_KEY = 'wenando-saved-matches'

export function getSavedMatchIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isMatchSaved(id) {
  return getSavedMatchIds().includes(id)
}

export function toggleSavedMatch(id) {
  const ids = getSavedMatchIds()
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next.includes(id)
}
