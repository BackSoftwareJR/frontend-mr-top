const STORAGE_KEY = 'wenando-user-searches'

export const MOCK_USER_SEARCHES = [
  {
    id: 'search-1',
    title: 'Ricerca per la Mamma',
    location: 'Milano',
    date: '12 Ottobre',
    status: 'completed',
    matchCount: 3,
    answers: {
      autonomy: 'parziale',
      location: { label: 'Milano', value: 'milano' },
      budget: { min: 1500, max: 2500 },
      contact: { nome: 'Mario', telefono: '+39 333 123 4567' },
    },
  },
  {
    id: 'search-2',
    title: 'Ricerca per Papà',
    location: 'Roma',
    date: '28 Settembre',
    status: 'processing',
    matchCount: 0,
    answers: {
      autonomy: 'non-autosufficiente',
      location: { label: 'Roma', value: 'roma' },
      budget: { min: 2000, max: 3500 },
      contact: { nome: 'Mario', telefono: '+39 333 123 4567' },
    },
  },
]

function readStoredSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveUserSearch(search) {
  const stored = readStoredSearches()
  const next = [{ ...search, id: search.id || `search-${Date.now()}` }, ...stored]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function getUserSearches() {
  const stored = readStoredSearches()
  if (stored.length === 0) return MOCK_USER_SEARCHES
  return stored
}

export function getLatestSearch() {
  const searches = getUserSearches()
  return searches[0] ?? null
}

export function getUserDisplayName(fallback = 'amico') {
  try {
    const session = JSON.parse(localStorage.getItem('wenando-auth-session') || 'null')
    if (session?.name) {
      const first = session.name.split(' ')[0]
      if (first) return first
    }
  } catch {
    /* ignore */
  }

  const latest = getLatestSearch()
  const contactName = latest?.answers?.contact?.nome
  if (contactName) return contactName.split(' ')[0]

  return fallback
}
