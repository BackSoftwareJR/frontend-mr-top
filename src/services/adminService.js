import apiClient, { unwrapApiData } from './apiClient'

function formatEuroFromCents(cents) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100)
}

/**
 * GET /admin/dashboard/stats — map to AdminMetricCard-friendly shape.
 */
export async function fetchDashboardStats() {
  const response = await apiClient.get('/admin/dashboard/stats')
  const stats = unwrapApiData(response)

  return {
    mrr: {
      value: formatEuroFromCents(stats.wallet_recharge_revenue_cents),
      change: formatEuroFromCents(stats.wallet_recharge_revenue_today_cents) + ' oggi',
      positive: (stats.wallet_recharge_revenue_today_cents ?? 0) > 0,
    },
    activeLeadsToday: {
      value: String(stats.leads_today ?? 0),
      change: 'oggi',
      positive: (stats.leads_today ?? 0) > 0,
    },
    pendingApprovals: {
      value: String(stats.companies_pending_approval ?? 0),
      change: stats.companies_pending_approval > 0 ? 'in coda' : 'nessuna',
      positive: stats.companies_pending_approval === 0,
    },
    raw: stats,
  }
}

/**
 * POST /admin/partners/{companyId}/approve
 * @param {string} companyId — company UUID
 */
export async function approvePartner(companyId) {
  const response = await apiClient.post(`/admin/partners/${companyId}/approve`)
  return unwrapApiData(response)
}

/**
 * POST /admin/partners/{companyId}/reject
 * @param {string} companyId
 * @param {string} [reason]
 */
export async function rejectPartner(companyId, reason) {
  const response = await apiClient.post(`/admin/partners/${companyId}/reject`, {
    reason: reason ?? null,
  })
  return unwrapApiData(response)
}
