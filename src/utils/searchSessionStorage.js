import {
  SEARCH_SESSIONS_STORAGE_KEY,
  buildSessionLabel,
  classifySearchQuery,
} from '../constants/guidedSearch'
import {
  buildTopSolutions,
  createInitialRefinementTrail,
} from '../constants/searchResultsData'

const MAX_STORED_SESSIONS = 20

function readAll() {
  try {
    const raw = localStorage.getItem(SEARCH_SESSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(sessions) {
  try {
    localStorage.setItem(SEARCH_SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    /* ignore quota / private mode */
  }
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * @typedef {Object} SearchSession
 * @property {string} id
 * @property {string} query
 * @property {string} label
 * @property {string|null} sectorId
 * @property {string} currentStepId
 * @property {string[]} stepHistory
 * @property {Record<string, string>} selections
 * @property {boolean} supported
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** @returns {SearchSession[]} */
export function getSearchSessions() {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

/** @param {number} [limit] */
export function getRecentSearchSessions(limit = 3) {
  return getSearchSessions().slice(0, limit)
}

/** @param {string} id */
export function getSearchSessionById(id) {
  if (!id) return null
  return getSearchSessions().find((s) => s.id === id) ?? null
}

/**
 * @param {string} query
 * @returns {SearchSession}
 */
export function createSearchSession(query) {
  const trimmed = String(query ?? '').trim()
  const classification = classifySearchQuery(trimmed)
  const now = new Date().toISOString()

  const session = {
    id: newSessionId(),
    query: trimmed,
    label: buildSessionLabel(trimmed),
    sectorId: classification.supported ? classification.sectorId : null,
    currentStepId: classification.supported
      ? classification.entryStepId
      : 'unsupported_topic',
    stepHistory: classification.supported
      ? [classification.entryStepId]
      : ['unsupported_topic'],
    selections: {},
    customNotes: '',
    refinementTrail: null,
    refinementCursor: 0,
    supported: classification.supported,
    createdAt: now,
    updatedAt: now,
  }

  if (classification.supported) {
    session.refinementTrail = createInitialRefinementTrail(session)
  }

  const sessions = readAll()
  sessions.unshift(session)
  writeAll(sessions.slice(0, MAX_STORED_SESSIONS))
  return session
}

/**
 * @param {string} id
 * @param {Partial<SearchSession>} patch
 */
export function updateSearchSession(id, patch) {
  const sessions = readAll()
  const index = sessions.findIndex((s) => s.id === id)
  if (index === -1) return null

  const updated = {
    ...sessions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  sessions[index] = updated
  writeAll(sessions)
  return updated
}

/**
 * Navigate to a step, recording history for back navigation.
 * @param {string} id
 * @param {string} nextStepId
 * @param {{ chipId?: string, appendHistory?: boolean }} [options]
 */
export function advanceSearchSession(id, nextStepId, options = {}) {
  const session = getSearchSessionById(id)
  if (!session) return null

  const { chipId, appendHistory = true } = options
  const selections = chipId
    ? { ...session.selections, [session.currentStepId]: chipId }
    : session.selections

  const stepHistory = appendHistory
    ? [...session.stepHistory, nextStepId]
    : session.stepHistory

  return updateSearchSession(id, {
    currentStepId: nextStepId,
    stepHistory,
    selections,
  })
}

/** @param {string} id */
export function goBackSearchSession(id) {
  const session = getSearchSessionById(id)
  if (!session || session.stepHistory.length <= 1) return session

  const nextHistory = session.stepHistory.slice(0, -1)
  const previousStepId = nextHistory[nextHistory.length - 1]

  return updateSearchSession(id, {
    currentStepId: previousStepId,
    stepHistory: nextHistory,
  })
}

function normalizeTrail(session) {
  if (session.refinementTrail?.length) return session
  return {
    ...session,
    refinementTrail: createInitialRefinementTrail(session),
    refinementCursor: 0,
  }
}

/** @returns {{ session, frame }} */
function getRefinementFrame(session) {
  const normalized = normalizeTrail(session)
  const cursor = normalized.refinementCursor ?? 0
  const trail = normalized.refinementTrail ?? []
  return {
    session: normalized,
    frame: trail[cursor] ?? trail[0] ?? null,
  }
}

/**
 * Push a refinement answer — snapshots solutions for exact restore on back.
 * @param {string} id
 * @param {{ questionId: string, answerId: string, answerLabel: string, customText?: string }} payload
 */
export function pushRefinementStep(id, payload) {
  const session = getSearchSessionById(id)
  if (!session) return null

  const normalized = normalizeTrail(session)
  const cursor = normalized.refinementCursor ?? 0
  const trail = normalized.refinementTrail ?? []
  const baseSelections = trail[cursor]?.selections ?? normalized.selections ?? {}

  const newSelections = {
    ...baseSelections,
    [payload.questionId]: payload.answerId,
  }

  let customNotes = normalized.customNotes ?? ''
  if (payload.customText?.trim()) {
    customNotes = payload.customText.trim()
  }

  const draft = {
    ...normalized,
    selections: newSelections,
    customNotes,
  }

  const newFrame = {
    id: `step-${Date.now()}`,
    label: payload.answerLabel,
    selections: newSelections,
    solutions: buildTopSolutions(draft),
    customNotes,
    questionId: payload.questionId,
  }

  const nextTrail = [...trail.slice(0, cursor + 1), newFrame]

  return updateSearchSession(id, {
    selections: newSelections,
    customNotes,
    refinementTrail: nextTrail,
    refinementCursor: nextTrail.length - 1,
  })
}

/** @param {string} id */
export function goBackRefinementTrail(id) {
  const session = getSearchSessionById(id)
  if (!session) return null

  const normalized = normalizeTrail(session)
  const cursor = normalized.refinementCursor ?? 0
  if (cursor <= 0) return normalized

  const nextCursor = cursor - 1
  const frame = normalized.refinementTrail[nextCursor]

  return updateSearchSession(id, {
    refinementCursor: nextCursor,
    selections: frame?.selections ?? {},
    customNotes: frame?.customNotes ?? '',
  })
}

/** @param {string} id */
export function goForwardRefinementTrail(id) {
  const session = getSearchSessionById(id)
  if (!session) return null

  const normalized = normalizeTrail(session)
  const cursor = normalized.refinementCursor ?? 0
  const trail = normalized.refinementTrail ?? []
  if (cursor >= trail.length - 1) return normalized

  const nextCursor = cursor + 1
  const frame = trail[nextCursor]

  return updateSearchSession(id, {
    refinementCursor: nextCursor,
    selections: frame?.selections ?? {},
    customNotes: frame?.customNotes ?? '',
  })
}

/** Current solutions from trail snapshot (exact restore). */
export function getCurrentSolutions(session) {
  const { frame } = getRefinementFrame(session)
  return frame?.solutions ?? buildTopSolutions(session)
}

export { getRefinementFrame }
