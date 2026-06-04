import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'
import {
  adminMetrics,
  adminNotifications,
  adminPartnersList,
  leadFlowChartData,
  mockAdminAdvisorBookings,
  mockAdminLeads,
  mockAdminSectors,
  mockPartnerRegistrations,
  mockPendingBankTransfers,
  mockPlatformSettings,
  mockWebhookEvents,
  portfolioAllocation,
  portfolioPartners,
  portfolioSummary,
  revenueTimelineData,
  riskIndicators,
  transactionVolumeSummary,
  transactions,
} from '../data/mockAdmin'

function formatEuroFromCents(cents) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100)
}

function formatEuro(amount) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

/**
 * Admin *WithFallback: mock only when VITE_API_URL is unset (offline dev).
 * When API is configured, call apiFn only — 4xx/5xx/network errors propagate (no mock).
 * @template T
 * @param {() => Promise<T>} apiFn
 * @param {T | (() => T)} mockData
 * @returns {Promise<T>}
 */
function adminWithOfflineMock(apiFn, mockData) {
  if (!isApiConfigured()) {
    const data = typeof mockData === 'function' ? mockData() : mockData
    return Promise.resolve(data)
  }
  return apiFn()
}

/** @param {Record<string, unknown>} stats */
function mapDashboardStatsToMetrics(stats) {
  const mrrCents = stats.mrr_cents ?? stats.wallet_recharge_revenue_cents
  const mrrToday = stats.mrr_today_cents ?? stats.wallet_recharge_revenue_today_cents

  return {
    mrr: {
      value: mrrCents != null ? formatEuroFromCents(mrrCents) : adminMetrics.mrr.value,
      change:
        mrrToday != null
          ? `${formatEuroFromCents(mrrToday)} oggi`
          : adminMetrics.mrr.change,
      positive: (mrrToday ?? 0) > 0,
    },
    activeLeadsToday: {
      value: String(stats.active_leads_today ?? stats.leads_today ?? 0),
      change: stats.leads_today_change ?? 'oggi',
      positive: (stats.active_leads_today ?? stats.leads_today ?? 0) > 0,
    },
    activePartners: {
      value: String(stats.active_partners ?? adminMetrics.activePartners.value),
      change: stats.active_partners_change ?? adminMetrics.activePartners.change,
      positive: stats.active_partners_positive ?? true,
    },
    pendingApprovals: {
      value: String(
        stats.pending_approvals ?? stats.companies_pending_approval ?? 0,
      ),
      change:
        (stats.pending_approvals ?? stats.companies_pending_approval ?? 0) > 0
          ? 'in coda'
          : 'nessuna',
      positive: (stats.pending_approvals ?? stats.companies_pending_approval ?? 0) === 0,
    },
    pendingBankTransfers: {
      value: String(
        stats.pending_bank_transfers_count ?? adminMetrics.pendingBankTransfers.value,
      ),
      change:
        (stats.pending_bank_transfers_count ?? 0) > 0
          ? 'da verificare'
          : 'nessuno',
      positive: (stats.pending_bank_transfers_count ?? 0) === 0,
    },
    churn: {
      value: stats.churn ?? adminMetrics.churn.value,
      change: stats.churn_change ?? adminMetrics.churn.change,
      positive: stats.churn_positive ?? adminMetrics.churn.positive,
    },
    conversionRate: {
      value: stats.conversion_rate ?? adminMetrics.conversionRate.value,
      change: stats.conversion_rate_change ?? adminMetrics.conversionRate.change,
      positive: stats.conversion_rate_positive ?? true,
    },
    avgDealSize: {
      value: stats.avg_deal_size ?? adminMetrics.avgDealSize.value,
      change: stats.avg_deal_size_change ?? adminMetrics.avgDealSize.change,
      positive: stats.avg_deal_size_positive ?? true,
    },
    raw: stats,
  }
}

/**
 * GET /admin/metrics or /admin/dashboard/stats
 */
export async function fetchDashboardStats() {
  try {
    const response = await apiClient.get('/admin/metrics')
    return mapDashboardStatsToMetrics(unwrapApiData(response))
  } catch {
    const response = await apiClient.get('/admin/dashboard/stats')
    return mapDashboardStatsToMetrics(unwrapApiData(response))
  }
}

export async function fetchRevenueTimeline(days = 7) {
  const response = await apiClient.get('/admin/revenue/timeline', { params: { days } })
  const data = unwrapApiData(response)
  const points = Array.isArray(data.points) ? data.points : []
  return points.map((p) => ({
    day: p.day,
    amount: p.amount ?? 0,
  }))
}

export async function fetchLeadFlow(days = 14) {
  const response = await apiClient.get('/admin/leads/flow', { params: { days } })
  const data = unwrapApiData(response)
  const points = Array.isArray(data.points) ? data.points : []
  return points.map((p) => ({
    day: p.day,
    leads: p.leads ?? 0,
    revenue: p.revenue ?? 0,
  }))
}

export async function fetchPortfolioSummary() {
  const response = await apiClient.get('/admin/portfolio/summary')
  const data = unwrapApiData(response)
  return {
    totalAum: data.total_aum ?? portfolioSummary.totalAum,
    revenueUnderManagement: data.revenue_under_management ?? portfolioSummary.revenueUnderManagement,
    monthlyGrowth: data.monthly_growth ?? portfolioSummary.monthlyGrowth,
    activeContracts: data.active_contracts ?? portfolioSummary.activeContracts,
    avgExposure: data.avg_exposure ?? portfolioSummary.avgExposure,
  }
}

function mapAllocationSegments(items) {
  return (items ?? []).map((item) => ({
    label: item.label,
    percent: item.percent ?? 0,
    color: item.color ?? '#22d3ee',
  }))
}

export async function fetchPortfolioAllocation() {
  const response = await apiClient.get('/admin/portfolio/allocation')
  const data = unwrapApiData(response)
  return {
    bySector: mapAllocationSegments(data.by_sector ?? data.bySector),
    byRegion: mapAllocationSegments(data.by_region ?? data.byRegion),
    byTier: mapAllocationSegments(data.by_tier ?? data.byTier),
  }
}

export async function fetchPortfolioPartners() {
  const response = await apiClient.get('/admin/portfolio/partners')
  const data = unwrapApiData(response)
  const partners = Array.isArray(data.partners) ? data.partners : []
  return partners.map((p) => ({
    id: p.id,
    nome: p.nome ?? p.name ?? '',
    tier: p.tier ?? 'Starter',
    aum: p.aum ?? '',
    revenueShare: p.revenue_share ?? p.revenueShare ?? 0,
    trend: p.trend ?? [],
    risk: p.risk ?? 'Medio',
    exposure: p.exposure ?? p.aum ?? '',
    citta: p.citta ?? p.city ?? '',
  }))
}

export async function fetchRiskIndicators() {
  const response = await apiClient.get('/admin/risk-indicators')
  const data = unwrapApiData(response)
  const indicators = Array.isArray(data.indicators) ? data.indicators : []
  return indicators.map((i) => ({
    label: i.label,
    value: i.value,
    detail: i.detail ?? '',
    status: i.status === 'warning' ? 'warn' : (i.status ?? 'ok'),
  }))
}

export async function fetchAdminTransactions(params = {}) {
  const response = await apiClient.get('/admin/transactions', {
    params: {
      status: params.status,
      page: params.page,
    },
  })
  const data = unwrapApiData(response)
  const summary = data.summary ?? {}
  const txList = Array.isArray(data.transactions) ? data.transactions : []

  return {
    summary: {
      today: {
        value: summary.today?.value ?? transactionVolumeSummary.today.value,
        count: summary.today?.count ?? transactionVolumeSummary.today.count,
      },
      week: {
        value: summary.week?.value ?? transactionVolumeSummary.week.value,
        count: summary.week?.count ?? transactionVolumeSummary.week.count,
      },
      month: {
        value: summary.month?.value ?? transactionVolumeSummary.month.value,
        count: summary.month?.count ?? transactionVolumeSummary.month.count,
      },
    },
    transactions: txList.map((tx) => ({
      id: tx.id,
      partner: tx.partner ?? '',
      importo: tx.importo ?? tx.amount ?? 0,
      stato: tx.stato ?? tx.status ?? 'Completata',
      data: tx.data ?? tx.date ?? '',
      tipo: tx.tipo ?? tx.type ?? '',
      metodo: tx.metodo ?? tx.method ?? '',
      riferimento: tx.riferimento ?? tx.reference ?? '',
      note: tx.note ?? '',
    })),
  }
}

/** @param {Record<string, unknown>} tx */
function mapAdminTransactionDetail(tx) {
  return {
    id: tx.id,
    partner: tx.partner ?? '',
    importo: tx.importo ?? tx.amount ?? 0,
    stato: tx.stato ?? tx.status ?? 'Completata',
    data: tx.data ?? tx.date ?? '',
    tipo: tx.tipo ?? tx.type ?? '',
    metodo: tx.metodo ?? tx.method ?? '',
    riferimento: tx.riferimento ?? tx.reference ?? '',
    note: tx.note ?? tx.description ?? '',
  }
}

export async function fetchAdminTransactionDetail(id) {
  const response = await apiClient.get(`/admin/transactions/${id}`)
  const data = unwrapApiData(response)
  return mapAdminTransactionDetail(data)
}

export function fetchAdminTransactionDetailWithFallback(id, rowFallback = null) {
  return adminWithOfflineMock(
    () => fetchAdminTransactionDetail(id),
    () => {
      const mock = transactions.find((t) => t.id === id) ?? rowFallback
      return mock ? mapAdminTransactionDetail(mock) : null
    },
  )
}

/** @param {Record<string, unknown>} p */
function mapPartnerRegistration(p) {
  return {
    id: p.id,
    companyId: p.company_id ?? p.companyId ?? p.id,
    nomeStruttura: p.nome_struttura ?? p.nomeStruttura ?? p.name ?? '',
    partitaIva: p.partita_iva ?? p.partitaIva ?? '',
    stato: p.stato ?? p.status ?? 'Pending',
    citta: p.citta ?? p.city ?? '',
    submittedAt: p.submitted_at ?? p.submittedAt ?? '',
  }
}

export async function fetchAdminPartners(params = {}) {
  const response = await apiClient.get('/admin/partners', {
    params: params.stato ? { stato: params.stato } : undefined,
  })
  const data = unwrapApiData(response)
  const partners = Array.isArray(data.partners) ? data.partners : []
  return partners.map(mapPartnerRegistration)
}

export async function approvePartner(companyId) {
  const response = await apiClient.post(`/admin/partners/${companyId}/approve`)
  return unwrapApiData(response)
}

export async function rejectPartner(companyId, reason) {
  const response = await apiClient.post(`/admin/partners/${companyId}/reject`, {
    reason: reason ?? null,
  })
  return unwrapApiData(response)
}

export async function suspendPartner(companyId, reason) {
  const response = await apiClient.post(`/admin/partners/${companyId}/suspend`, {
    reason: reason ?? null,
  })
  return unwrapApiData(response)
}

export async function impersonatePartner(companyId) {
  const response = await apiClient.post(`/admin/partners/${companyId}/impersonate`)
  const data = unwrapApiData(response)
  return {
    token: data.impersonation_token,
    expiresAt: data.expires_at,
    partner: {
      id: data.partner?.id,
      email: data.partner?.email,
      organizationName: data.partner?.organization_name,
    },
  }
}

/** @param {Record<string, unknown>} item */
function mapSearchResult(item) {
  return {
    type: item.type,
    id: item.id,
    label: item.label ?? '',
    subtitle: item.subtitle ?? '',
  }
}

function searchMockData(query) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) {
    return { partners: [], leads: [], transactions: [], advisor_bookings: [] }
  }

  const match = (value) => String(value ?? '').toLowerCase().includes(q)

  return {
    partners: mockPartnerRegistrations
      .filter(
        (p) =>
          match(p.nomeStruttura) ||
          match(p.partitaIva) ||
          match(p.citta) ||
          match(p.id),
      )
      .slice(0, 5)
      .map((p) => ({
        type: 'partner',
        id: p.id,
        label: p.nomeStruttura,
        subtitle: [p.citta, p.partitaIva ? `P.IVA ${p.partitaIva}` : ''].filter(Boolean).join(' · '),
      })),
    leads: mockAdminLeads
      .filter((l) => match(l.id) || match(l.utente) || match(l.esigenza))
      .slice(0, 5)
      .map((l) => ({
        type: 'lead',
        id: l.id,
        label: l.utente,
        subtitle: l.id,
      })),
    transactions: transactions
      .filter((t) => match(t.id) || match(t.partner) || match(t.riferimento))
      .slice(0, 5)
      .map((t) => ({
        type: 'transaction',
        id: t.id,
        label: t.id,
        subtitle: t.partner,
      })),
    advisor_bookings: mockAdminAdvisorBookings.upcoming
      .concat(mockAdminAdvisorBookings.past)
      .filter(
        (b) =>
          match(b.consumerName) ||
          match(b.consumerEmail) ||
          match(b.leadTitle),
      )
      .slice(0, 5)
      .map((b) => ({
        type: 'advisor_booking',
        id: String(b.id),
        label: b.consumerName,
        subtitle: b.leadTitle ?? '',
      })),
  }
}

export async function fetchAdminSearch(query) {
  const response = await apiClient.get('/admin/search', { params: { q: query } })
  const data = unwrapApiData(response)
  return {
    partners: (data.partners ?? []).map(mapSearchResult),
    leads: (data.leads ?? []).map(mapSearchResult),
    transactions: (data.transactions ?? []).map(mapSearchResult),
    advisor_bookings: (data.advisor_bookings ?? []).map(mapSearchResult),
  }
}

export function fetchAdminSearchWithFallback(query) {
  return adminWithOfflineMock(() => fetchAdminSearch(query), () => searchMockData(query))
}

/** @param {Record<string, unknown>} lead */
function mapAdminLead(lead) {
  return {
    id: lead.id,
    utente: lead.utente ?? lead.user_name ?? '',
    esigenza: lead.esigenza ?? lead.need ?? '',
    aiMatch: lead.ai_match ?? lead.aiMatch ?? '',
    stato: lead.stato ?? lead.status ?? 'In routing',
    email: lead.email ?? '',
    telefono: lead.telefono ?? lead.phone ?? '',
    partnerAssegnato: lead.partner_assegnato ?? lead.partnerAssegnato ?? '',
    note: lead.note ?? '',
    createdAt: lead.created_at ?? lead.createdAt ?? '',
  }
}

export async function fetchAdminLeads(params = {}) {
  const response = await apiClient.get('/admin/leads', {
    params: {
      stato: params.stato,
      page: params.page,
    },
  })
  const data = unwrapApiData(response)
  const leads = Array.isArray(data.leads) ? data.leads : []
  return leads.map(mapAdminLead)
}

export async function assignAdminLead(leadId, partnerId) {
  const response = await apiClient.patch(`/admin/leads/${leadId}/assign`, {
    partner_id: partnerId,
  })
  return unwrapApiData(response)
}

export async function rerouteAdminLead(leadId) {
  const response = await apiClient.post(`/admin/leads/${leadId}/reroute`)
  return unwrapApiData(response)
}

export async function fetchAdminNotifications() {
  const response = await apiClient.get('/admin/notifications')
  const data = unwrapApiData(response)
  const notifications = Array.isArray(data.notifications) ? data.notifications : []
  return notifications.map(mapAdminNotification)
}

/** @param {Record<string, unknown>} n */
function mapAdminNotification(n) {
  const data = typeof n.data === 'object' && n.data !== null ? n.data : {}

  return {
    id: n.id,
    title: data.title ?? n.title ?? 'Notifica',
    message: data.message ?? data.body ?? n.message ?? '',
    time: formatAdminNotificationTime(
      data.time ?? data.created_at ?? n.created_at ?? n.time ?? '',
    ),
    read: Boolean(n.read_at ?? n.read),
    href: data.href ?? n.href ?? null,
  }
}

function formatAdminNotificationTime(value) {
  if (!value) return ''
  if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return 'Adesso'
  if (diffMin < 60) return `${diffMin} min fa`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} ore fa`

  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(date)
}

export function fetchDashboardStatsWithFallback() {
  return adminWithOfflineMock(fetchDashboardStats, () =>
    mapDashboardStatsToMetrics({
      pending_bank_transfers_count: mockPendingBankTransfers.length,
    }),
  )
}

export function fetchAdminPartnersWithFallback() {
  return adminWithOfflineMock(fetchAdminPartners, mockPartnerRegistrations)
}

export function fetchAdminLeadsWithFallback() {
  return adminWithOfflineMock(fetchAdminLeads, mockAdminLeads)
}

/** @param {Record<string, unknown>} booking */
function mapAdminAdvisorBooking(booking) {
  return {
    id: booking.id,
    consumerName: booking.consumer_name ?? booking.consumerName ?? '',
    consumerEmail: booking.consumer_email ?? booking.consumerEmail ?? '',
    leadTitle: booking.lead_title ?? booking.leadTitle ?? null,
    scheduledAt: booking.scheduled_at ?? booking.scheduledAt ?? '',
    scheduledDate: booking.scheduled_date ?? booking.scheduledDate ?? '',
    scheduledTime: booking.scheduled_time ?? booking.scheduledTime ?? '',
  }
}

export async function fetchAdminAdvisorBookings() {
  const response = await apiClient.get('/admin/advisor-bookings')
  const data = unwrapApiData(response)
  return {
    upcoming: (Array.isArray(data.upcoming) ? data.upcoming : []).map(mapAdminAdvisorBooking),
    past: (Array.isArray(data.past) ? data.past : []).map(mapAdminAdvisorBooking),
  }
}

export function fetchAdminAdvisorBookingsWithFallback() {
  return adminWithOfflineMock(fetchAdminAdvisorBookings, mockAdminAdvisorBookings)
}

export function fetchAdminTransactionsWithFallback() {
  return adminWithOfflineMock(fetchAdminTransactions, {
    summary: transactionVolumeSummary,
    transactions,
  })
}

export function fetchRevenueTimelineWithFallback() {
  return adminWithOfflineMock(fetchRevenueTimeline, revenueTimelineData)
}

export function fetchLeadFlowWithFallback() {
  return adminWithOfflineMock(fetchLeadFlow, leadFlowChartData)
}

export function fetchPortfolioAllocationWithFallback() {
  return adminWithOfflineMock(fetchPortfolioAllocation, portfolioAllocation)
}

export function fetchPortfolioPartnersWithFallback() {
  return adminWithOfflineMock(fetchPortfolioPartners, portfolioPartners)
}

export function fetchPortfolioSummaryWithFallback() {
  return adminWithOfflineMock(fetchPortfolioSummary, portfolioSummary)
}

export function fetchRiskIndicatorsWithFallback() {
  return adminWithOfflineMock(fetchRiskIndicators, riskIndicators)
}

export function fetchAdminNotificationsWithFallback() {
  return adminWithOfflineMock(fetchAdminNotifications, adminNotifications)
}

/** @param {Record<string, unknown>} data */
function mapPlatformSettings(data) {
  const security = typeof data.security === 'object' && data.security !== null ? data.security : {}
  const automations = typeof data.automations === 'object' && data.automations !== null ? data.automations : {}
  const notifications =
    typeof data.notifications === 'object' && data.notifications !== null ? data.notifications : {}

  return {
    security: {
      otpTtlMinutes: security.otp_ttl_minutes ?? mockPlatformSettings.security.otpTtlMinutes,
    },
    automations: {
      autoMatchOnLead: automations.auto_match_on_lead ?? mockPlatformSettings.automations.autoMatchOnLead,
    },
    notifications: {
      adminEmail: notifications.admin_email ?? mockPlatformSettings.notifications.adminEmail,
    },
  }
}

/** @param {ReturnType<typeof mapPlatformSettings>} settings */
function toPlatformSettingsPayload(settings) {
  return {
    security: { otp_ttl_minutes: settings.security.otpTtlMinutes },
    automations: { auto_match_on_lead: settings.automations.autoMatchOnLead },
    notifications: { admin_email: settings.notifications.adminEmail },
  }
}

export async function fetchAdminSettings() {
  const response = await apiClient.get('/admin/settings')
  return mapPlatformSettings(unwrapApiData(response))
}

export async function patchAdminSettings(settings) {
  const response = await apiClient.patch('/admin/settings', toPlatformSettingsPayload(settings))
  const data = unwrapApiData(response)
  return mapPlatformSettings(data.settings ?? data)
}

/** @param {Record<string, unknown>} sector */
function mapAdminSector(sector) {
  return {
    id: sector.id,
    slug: sector.slug ?? '',
    name: sector.name ?? '',
    isActive: sector.is_active ?? true,
  }
}

export async function fetchAdminSectors() {
  const response = await apiClient.get('/admin/sectors')
  const data = unwrapApiData(response)
  const sectors = Array.isArray(data.sectors) ? data.sectors : []
  return sectors.map(mapAdminSector)
}

export async function patchAdminSector(id, payload) {
  const body = {}
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  if (payload.wizardSchema !== undefined) body.wizard_schema = payload.wizardSchema
  if (payload.matchingRules !== undefined) body.matching_rules = payload.matchingRules

  const response = await apiClient.patch(`/admin/sectors/${id}`, body)
  const data = unwrapApiData(response)
  return mapAdminSector(data.sector ?? data)
}

export function fetchAdminSettingsWithFallback() {
  return adminWithOfflineMock(fetchAdminSettings, mockPlatformSettings)
}

export function fetchAdminSectorsWithFallback() {
  return adminWithOfflineMock(fetchAdminSectors, mockAdminSectors)
}

/** @param {Record<string, unknown>} item */
function mapErasureRequest(item) {
  const user = typeof item.user === 'object' && item.user !== null ? item.user : {}

  return {
    id: item.id,
    status: item.status ?? 'pending',
    reason: item.reason ?? '',
    requestedAt: item.requested_at ?? item.requestedAt ?? '',
    processedAt: item.processed_at ?? item.processedAt ?? null,
    metadata: item.metadata ?? {},
    user: {
      id: user.id ?? '',
      email: user.email ?? '',
      name: user.name ?? '',
    },
  }
}

export async function fetchAdminErasureRequests(params = {}) {
  const response = await apiClient.get('/admin/privacy/erasure-requests', {
    params: { per_page: params.perPage },
  })
  const data = unwrapApiData(response)
  const requests = Array.isArray(data.erasure_requests) ? data.erasure_requests : []

  return {
    pendingCount: data.pending_count ?? 0,
    processingCount: data.processing_count ?? 0,
    erasureRequests: requests.map(mapErasureRequest),
  }
}

export async function patchAdminErasureRequest(id, payload) {
  const response = await apiClient.patch(`/admin/privacy/erasure-requests/${id}`, {
    action: payload.action,
    notes: payload.notes ?? null,
  })
  const data = unwrapApiData(response)
  const item = data.erasure_request ?? data

  return mapErasureRequest(item)
}

export function fetchAdminErasureRequestsWithFallback() {
  return adminWithOfflineMock(fetchAdminErasureRequests, {
    pendingCount: 0,
    processingCount: 0,
    erasureRequests: [],
  })
}

/** @param {Record<string, unknown>} item */
function mapPendingBankTransfer(item) {
  return {
    id: item.id ?? '',
    companyName: item.company_name ?? item.companyName ?? '',
    credits: item.credits ?? 0,
    amountCents: item.amount_cents ?? item.amountCents ?? 0,
    reference: item.reference ?? '',
    createdAt: item.created_at ?? item.createdAt ?? '',
  }
}

export async function fetchAdminPendingBankTransfers() {
  const response = await apiClient.get('/admin/wallet/pending-transfers')
  const data = unwrapApiData(response)
  const transfers = Array.isArray(data.pending_transfers) ? data.pending_transfers : []

  return transfers.map(mapPendingBankTransfer)
}

export async function completeAdminBankTransfer(paymentIntentId) {
  const response = await apiClient.post('/admin/wallet/complete-transfer', {
    payment_intent_id: paymentIntentId,
  })

  return unwrapApiData(response)
}

export function fetchAdminPendingBankTransfersWithFallback() {
  return adminWithOfflineMock(fetchAdminPendingBankTransfers, mockPendingBankTransfers)
}

/** @param {Record<string, unknown>} item */
function mapWebhookEvent(item) {
  return {
    id: item.id ?? 0,
    provider: item.provider ?? '',
    eventType: item.event_type ?? item.eventType ?? '',
    status: item.status ?? '',
    paymentIntentId: item.payment_intent_id ?? item.paymentIntentId ?? null,
    payload: item.payload ?? {},
    createdAt: item.created_at ?? item.createdAt ?? '',
  }
}

export async function fetchAdminWebhookEvents(params = {}) {
  const response = await apiClient.get('/admin/webhooks/events', { params })
  const data = unwrapApiData(response)
  const events = Array.isArray(data.events) ? data.events : []

  return {
    events: events.map(mapWebhookEvent),
    meta: response.data?.meta ?? {},
  }
}

export function fetchAdminWebhookEventsWithFallback(params = {}) {
  return adminWithOfflineMock(
    () => fetchAdminWebhookEvents(params),
    () => ({
      events: mockWebhookEvents,
      meta: { page: 1, per_page: 50, total: mockWebhookEvents.length, last_page: 1 },
    }),
  )
}

export { adminPartnersList, formatEuro }
