/**
 * B2B partner registration & onboarding state (localStorage mock).
 */

import { normalizeEmail, saveSession, getSession } from './authService'

const REGISTRATION_KEY = 'wenando-b2b-registration'
const ONBOARDING_KEY = 'wenando-b2b-onboarding'

export const ONBOARDING_STEP_IDS = ['legal', 'operations', 'trust', 'review']

export const ONBOARDING_STEP_LABELS = [
  { id: 'legal', label: 'Identità', description: 'Dati legali e documenti' },
  { id: 'operations', label: 'Operatività', description: 'Orari e servizi' },
  { id: 'trust', label: 'Trust Test', description: 'Standard di qualità' },
  { id: 'review', label: 'Revisione', description: 'Invio per approvazione' },
]

const APPROVED_EMAILS = new Set(['partner@care.it'])

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getOnboardingStatus(email) {
  const session = getSession()
  const normalized = normalizeEmail(email || session?.email || '')
  if (!normalized) return null

  if (APPROVED_EMAILS.has(normalized)) return 'approved'

  const store = readJson(ONBOARDING_KEY, {})
  const entry = store[normalized]
  return entry?.status ?? (session?.onboardingStatus || null)
}

export function getB2BRedirectPath(session = getSession()) {
  if (!session || session.type !== 'b2b') return '/pro'

  const status = getOnboardingStatus(session.email)
  if (status === 'approved') return '/pro/dashboard'
  if (status === 'pending_review') return '/pro/onboarding'
  return '/pro/onboarding'
}

export function saveRegistration({ email, organizationName, legalName }) {
  const normalized = normalizeEmail(email)
  const data = {
    email: normalized,
    organizationName: organizationName.trim(),
    legalName: legalName.trim(),
    createdAt: Date.now(),
  }
  writeJson(REGISTRATION_KEY, data)
  return data
}

export function getRegistration() {
  return readJson(REGISTRATION_KEY, null)
}

export function getOnboardingData(email) {
  const normalized = normalizeEmail(email)
  const store = readJson(ONBOARDING_KEY, {})
  return store[normalized]?.data ?? {}
}

export function saveOnboardingData(email, patch) {
  const normalized = normalizeEmail(email)
  const store = readJson(ONBOARDING_KEY, {})
  const existing = store[normalized] ?? { status: 'in_progress', data: {} }
  store[normalized] = {
    ...existing,
    data: { ...existing.data, ...patch },
    updatedAt: Date.now(),
  }
  writeJson(ONBOARDING_KEY, store)
  return store[normalized]
}

export function setOnboardingStatus(email, status) {
  const normalized = normalizeEmail(email)
  const store = readJson(ONBOARDING_KEY, {})
  const existing = store[normalized] ?? { data: {} }
  store[normalized] = { ...existing, status, updatedAt: Date.now() }
  writeJson(ONBOARDING_KEY, store)
}

export function registerB2BPartner({ email, organizationName, legalName }) {
  const normalized = normalizeEmail(email)
  saveRegistration({ email: normalized, organizationName, legalName })
  setOnboardingStatus(normalized, 'in_progress')

  const session = saveSession({
    email: normalized,
    type: 'b2b',
    name: organizationName.trim(),
    onboardingStatus: 'in_progress',
  })

  return session
}

export function submitOnboardingForReview(email) {
  const normalized = normalizeEmail(email)
  setOnboardingStatus(normalized, 'pending_review')

  const session = getSession()
  if (session?.email === normalized) {
    saveSession({
      email: normalized,
      type: 'b2b',
      name: session.name,
      onboardingStatus: 'pending_review',
    })
  }
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}
