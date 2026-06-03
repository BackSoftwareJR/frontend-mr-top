/**
 * B2B partner registration & onboarding state (localStorage mock).
 */

import { saveSession, getSession } from './authService'

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

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

export const AUTO_DEMO_FLAG = 'wenando-b2b-run-autodemo'

export const DEMO_REGISTRATION = {
  email: 'demo.partner@wenando.it',
  organizationName: 'Casa Serena Demo',
  legalName: 'Casa Serena S.r.l.',
}

export const DEMO_ONBOARDING_DATA = {
  vat: 'IT12345678901',
  sdi: 'ABC1234',
  visura: 'visura-camerale-demo.pdf',
  identityDoc: 'documento-identita-demo.pdf',
  dynamic: {
    sector: 'rsa',
    capacity: '24',
    nonSelfSufficient: true,
    nightStaff: true,
    notes: 'Struttura dimostrativa — dati precompilati per il tour onboarding.',
  },
  schedule: {
    mon: { open: true, slots: '09:00-12:00, 15:00-18:00' },
    tue: { open: true, slots: '09:00-12:00, 15:00-18:00' },
    wed: { open: true, slots: '09:00-12:00, 15:00-18:00' },
    thu: { open: true, slots: '09:00-18:00' },
    fri: { open: true, slots: '09:00-17:00' },
    sat: { open: false, slots: '' },
    sun: { open: false, slots: '' },
  },
  trustAnswers: {
    emergency:
      'Allerta personale notturno, valutazione parametri vitali, contatto medico di turno e familiari entro 15 minuti. Documentazione su registro eventi avversi.',
    fall:
      '1) Non spostare fino a valutazione 2) Infermiere responsabile + medico 3) Compilazione scheda incidente e comunicazione familiari.',
    family:
      'Linea dedicata H24 con escalation al coordinatore; risposta entro 30 minuti per urgenze certificate.',
    quality:
      'Audit mensili interni, NPS familiari trimestrale, KPI su tempi risposta emergenze.',
  },
}

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
  if (entry?.status === 'approved') return 'approved'
  return entry?.status ?? (session?.onboardingStatus || null)
}

export function enableAutoDemo() {
  localStorage.setItem(AUTO_DEMO_FLAG, '1')
}

export function restartAutoDemoTour() {
  try {
    sessionStorage.removeItem('wenando-b2b-tour-step')
  } catch {
    /* ignore */
  }
}

export function isAutoDemoEnabled() {
  return localStorage.getItem(AUTO_DEMO_FLAG) === '1'
}

export function clearAutoDemo() {
  localStorage.removeItem(AUTO_DEMO_FLAG)
}

export function seedDemoOnboardingData(email) {
  const normalized = normalizeEmail(email)
  saveOnboardingData(normalized, DEMO_ONBOARDING_DATA)
  setOnboardingStatus(normalized, 'in_progress')
  return DEMO_ONBOARDING_DATA
}

export function approvePartner(email) {
  const normalized = normalizeEmail(email)
  APPROVED_EMAILS.add(normalized)
  setOnboardingStatus(normalized, 'approved')

  const session = getSession()
  if (session?.email === normalized) {
    saveSession({
      email: normalized,
      type: 'b2b',
      name: session.name,
      onboardingStatus: 'approved',
    })
  }
}

/** Registra partner demo, precompila onboarding e avvia tour automatico (da zero). */
export function startAutoDemoPartner() {
  const { email, organizationName, legalName } = DEMO_REGISTRATION
  registerB2BPartner({ email, organizationName, legalName })
  seedDemoOnboardingData(email)
  enableAutoDemo()
  restartAutoDemoTour()
  return normalizeEmail(email)
}

/** Riprende demo dopo refresh: mantiene step e sessione se presenti. */
export function resumeAutoDemoPartner(email) {
  const normalized = normalizeEmail(email || getSession()?.email || DEMO_REGISTRATION.email)
  const session = getSession()

  if (!session || session.type !== 'b2b') {
    return startAutoDemoPartner()
  }

  const status = getOnboardingStatus(normalized)
  if (status === 'approved') {
    return { email: normalized, status: 'approved' }
  }

  enableAutoDemo()
  if (!getOnboardingData(normalized).vat) {
    seedDemoOnboardingData(normalized)
  }
  if (status !== 'pending_review') {
    setOnboardingStatus(normalized, 'in_progress')
  }

  return { email: normalized, status: status || 'in_progress' }
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
