import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'
import { getRegistration } from './b2bOnboardingService'

/** @param {Record<string, unknown>|null} profile */
export function mapCompanyProfile(profile) {
  if (!profile) {
    return null
  }

  return {
    displayName: profile.display_name ?? profile.displayName ?? '',
    serviceType: profile.service_type ?? profile.serviceType ?? '',
    tagline: profile.tagline ?? '',
    description: profile.description ?? '',
    pros: Array.isArray(profile.pros) ? profile.pros : [],
    imageUrl: profile.image_url ?? profile.imageUrl ?? '',
    locationLabel: profile.location_label ?? profile.locationLabel ?? '',
    contactHint: profile.contact_hint ?? profile.contactHint ?? '',
  }
}

/** @param {Record<string, unknown>} company */
export function mapCompanySummary(company) {
  if (!company) return null

  return {
    id: company.id,
    organizationName: company.organization_name ?? company.organizationName ?? '',
    legalName: company.legal_name ?? company.legalName ?? '',
    vettingStatus: company.vetting_status ?? company.vettingStatus ?? '',
    tier: company.tier ?? null,
    city: company.city ?? '',
    approvedAt: company.approved_at ?? company.approvedAt ?? null,
  }
}

function getMockCompanyProfile() {
  const reg = getRegistration()

  return {
    company: {
      id: 'mock-company',
      organizationName: reg?.organizationName ?? 'Casa Serena Demo',
      legalName: reg?.legalName ?? 'Casa Serena S.r.l.',
      vettingStatus: 'approved',
      tier: null,
      city: 'Milano',
      approvedAt: null,
    },
    profile: {
      displayName: reg?.organizationName ?? 'Casa Serena Demo',
      serviceType: 'Assistenza Domiciliare',
      tagline: 'Assistenza personalizzata con operatori qualificati',
      description: 'Profilo dimostrativo — collega VITE_API_URL per salvare sul backend.',
      pros: ['Operatori qualificati', 'Orari flessibili'],
      imageUrl: '',
      locationLabel: 'Milano',
      contactHint: 'Richiedi un sopralluogo gratuito.',
    },
  }
}

/**
 * GET /b2b/company/profile
 */
export async function fetchB2bCompanyProfile() {
  if (!isApiConfigured()) {
    return getMockCompanyProfile()
  }

  const response = await apiClient.get('/b2b/company/profile')
  const data = unwrapApiData(response)

  return {
    company: mapCompanySummary(data.company),
    profile: mapCompanyProfile(data.profile),
  }
}

/**
 * PATCH /b2b/company/profile
 * @param {Record<string, unknown>} patch
 */
export async function updateB2bCompanyProfile(patch) {
  const body = {
    display_name: patch.displayName ?? patch.display_name,
    tagline: patch.tagline,
    description: patch.description,
    pros: patch.pros,
    image_url: patch.imageUrl ?? patch.image_url,
    location_label: patch.locationLabel ?? patch.location_label,
    contact_hint: patch.contactHint ?? patch.contact_hint,
  }

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) {
      delete body[key]
    }
  })

  if (!isApiConfigured()) {
    const mock = getMockCompanyProfile()
    return {
      company: mock.company,
      profile: { ...mock.profile, ...mapCompanyProfile(body) },
    }
  }

  const response = await apiClient.patch('/b2b/company/profile', body)
  const data = unwrapApiData(response)

  return {
    company: mapCompanySummary(data.company),
    profile: mapCompanyProfile(data.profile),
  }
}

export function loadB2bCompanyProfile() {
  return fetchB2bCompanyProfile()
}

export function saveB2bCompanyProfile(patch) {
  return updateB2bCompanyProfile(patch)
}
