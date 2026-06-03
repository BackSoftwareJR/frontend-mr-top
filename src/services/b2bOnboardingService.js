/**
 * B2B partner registration & onboarding — API when configured, localStorage mock fallback in dev.
 */

import apiClient, {
  AUTH_TOKEN_KEY,
  isApiConfigured,
  unwrapApiData,
  withDevMockFallback,
} from './apiClient'
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

function mapOnboardingDataFromApi(data) {
  if (!data) return {}
  return {
    vat: data.vat,
    sdi: data.sdi,
    visura: data.visura,
    identityDoc: data.identity_doc ?? data.identityDoc,
    dynamic: data.dynamic ?? {},
    schedule: data.schedule ?? {},
    trustAnswers: data.trust_answers ?? data.trustAnswers ?? {},
  }
}

function mapOnboardingDataToApi(patch) {
  return {
    vat: patch.vat,
    sdi: patch.sdi,
    visura: patch.visura,
    identity_doc: patch.identityDoc,
    dynamic: patch.dynamic,
    schedule: patch.schedule,
    trust_answers: patch.trustAnswers,
  }
}

async function fetchOnboardingFromApi() {
  const response = await apiClient.get('/b2b/onboarding')
  const data = unwrapApiData(response)
  return {
    status: data.status ?? 'in_progress',
    step: data.step,
    data: mapOnboardingDataFromApi(data.data),
  }
}

async function patchOnboardingToApi(patch) {
  const response = await apiClient.patch('/b2b/onboarding', {
    data: mapOnboardingDataToApi(patch),
  })
  const data = unwrapApiData(response)
  return {
    status: data.status,
    data: mapOnboardingDataFromApi(data.data),
  }
}

async function submitOnboardingToApi() {
  const response = await apiClient.post('/b2b/onboarding/submit')
  return unwrapApiData(response)
}

async function fetchOnboardingStatusFromApi() {
  const response = await apiClient.get('/b2b/onboarding/status')
  const data = unwrapApiData(response)
  return data.status ?? null
}

async function registerB2BPartnerApi({ email, organizationName, legalName }) {
  const response = await apiClient.post('/b2b/register', {
    email: email.trim().toLowerCase(),
    organization_name: organizationName.trim(),
    legal_name: legalName.trim(),
  })
  const data = unwrapApiData(response)
  const token = data.token ?? data.session?.token
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  const session = saveSession({
    email: data.user?.email ?? email.trim().toLowerCase(),
    type: 'b2b',
    name: data.company?.organization_name ?? organizationName.trim(),
    token,
    onboardingStatus: data.company?.vetting_status ?? 'in_progress',
    userId: data.user?.id,
  })

  return session
}

export async function registerB2BPartnerAsync(params) {
  if (!isApiConfigured()) {
    return registerB2BPartner(params)
  }
  return withDevMockFallback(
    () => registerB2BPartnerApi(params),
    () => registerB2BPartner(params),
    'B2B register',
  )
}

export async function getOnboardingStatusAsync(email) {
  const session = getSession()
  const normalized = normalizeEmail(email || session?.email || '')

  if (isApiConfigured() && getSession()?.token) {
    try {
      const status = await fetchOnboardingStatusFromApi()
      if (status) return status
    } catch (error) {
      if (!import.meta.env.DEV) throw error
      console.warn('[Wenando B2B] Onboarding status API — mock fallback:', error)
    }
  }

  return getOnboardingStatus(normalized)
}

export async function loadOnboardingDataAsync(email) {
  const normalized = normalizeEmail(email || getSession()?.email || '')

  if (isApiConfigured() && getSession()?.token) {
    try {
      const result = await fetchOnboardingFromApi()
      if (result.data && Object.keys(result.data).length > 0) {
        saveOnboardingData(normalized, result.data)
        if (result.status) setOnboardingStatus(normalized, result.status)
        return result.data
      }
    } catch (error) {
      if (!import.meta.env.DEV) throw error
      console.warn('[Wenando B2B] Onboarding load API — mock fallback:', error)
    }
  }

  return getOnboardingData(normalized)
}

export async function saveOnboardingDataAsync(email, patch) {
  const normalized = normalizeEmail(email || getSession()?.email || '')
  saveOnboardingData(normalized, patch)

  if (isApiConfigured() && getSession()?.token) {
    try {
      await patchOnboardingToApi(patch)
    } catch (error) {
      if (!import.meta.env.DEV) throw error
      console.warn('[Wenando B2B] Onboarding save API — mock fallback:', error)
    }
  }

  return getOnboardingData(normalized)
}

export async function submitOnboardingForReviewAsync(email) {
  const normalized = normalizeEmail(email || getSession()?.email || '')

  if (isApiConfigured() && getSession()?.token) {
    try {
      await submitOnboardingToApi()
    } catch (error) {
      if (!import.meta.env.DEV) throw error
      console.warn('[Wenando B2B] Onboarding submit API — mock fallback:', error)
    }
  }

  submitOnboardingForReview(normalized)
}
