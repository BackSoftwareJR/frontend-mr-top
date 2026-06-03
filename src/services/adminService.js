import apiClient, { isApiConfigured, unwrapApiData, withDevMockFallback } from './apiClient'
import {
  adminMetrics,
  adminNotifications,
  adminPartnersList,
  leadFlowChartData,
  mockAdminLeads,
  mockPartnerRegistrations,
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
    status: i.status ?? 'ok',
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

export async function fetchAdminTransactionDetail(id) {
  const response = await apiClient.get(`/admin/transactions/${id}`)
  return unwrapApiData(response)
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
  return Array.isArray(data.notifications) ? data.notifications : []
}

export function fetchDashboardStatsWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(mapDashboardStatsToMetrics({}))
  return withDevMockFallback(
    fetchDashboardStats,
    () => mapDashboardStatsToMetrics({}),
    'Admin metrics',
  )
}

export function fetchAdminPartnersWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(mockPartnerRegistrations)
  return withDevMockFallback(fetchAdminPartners, () => mockPartnerRegistrations, 'Admin partners')
}

export function fetchAdminLeadsWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(mockAdminLeads)
  return withDevMockFallback(fetchAdminLeads, () => mockAdminLeads, 'Admin leads')
}

export function fetchAdminTransactionsWithFallback() {
  if (!isApiConfigured()) {
    return Promise.resolve({
      summary: transactionVolumeSummary,
      transactions,
    })
  }
  return withDevMockFallback(
    fetchAdminTransactions,
    () => ({ summary: transactionVolumeSummary, transactions }),
    'Admin transactions',
  )
}

export function fetchRevenueTimelineWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(revenueTimelineData)
  return withDevMockFallback(fetchRevenueTimeline, () => revenueTimelineData, 'Revenue timeline')
}

export function fetchLeadFlowWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(leadFlowChartData)
  return withDevMockFallback(fetchLeadFlow, () => leadFlowChartData, 'Lead flow')
}

export function fetchPortfolioAllocationWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(portfolioAllocation)
  return withDevMockFallback(
    fetchPortfolioAllocation,
    () => portfolioAllocation,
    'Portfolio allocation',
  )
}

export function fetchPortfolioPartnersWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(portfolioPartners)
  return withDevMockFallback(fetchPortfolioPartners, () => portfolioPartners, 'Portfolio partners')
}

export function fetchPortfolioSummaryWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(portfolioSummary)
  return withDevMockFallback(fetchPortfolioSummary, () => portfolioSummary, 'Portfolio summary')
}

export function fetchRiskIndicatorsWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(riskIndicators)
  return withDevMockFallback(fetchRiskIndicators, () => riskIndicators, 'Risk indicators')
}

export function fetchAdminNotificationsWithFallback() {
  if (!isApiConfigured()) return Promise.resolve(adminNotifications)
  return withDevMockFallback(fetchAdminNotifications, () => adminNotifications, 'Admin notifications')
}

export { adminPartnersList, formatEuro }
