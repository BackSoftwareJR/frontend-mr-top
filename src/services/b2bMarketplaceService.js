import apiClient, { unwrapApiData } from './apiClient'

/** @param {Record<string, unknown>} apiLead */
export function mapMarketplaceLead(apiLead) {
  return {
    id: apiLead.id,
    matchScore: apiLead.match_score ?? 0,
    budget: apiLead.budget ?? '',
    location: apiLead.location ?? '',
    name: apiLead.name ?? '',
    phone: apiLead.phone ?? '',
    email: apiLead.email ?? '',
    need: apiLead.need ?? '',
    unlockCost: apiLead.unlock_cost ?? 0,
    unlocked: Boolean(apiLead.unlocked),
  }
}

/** @param {Record<string, unknown>} wallet */
export function mapWallet(wallet) {
  return {
    balanceCredits: wallet.balance_credits ?? 0,
    totalSpent: wallet.total_spent ?? 0,
    currency: wallet.currency ?? 'EUR',
  }
}

/**
 * GET /b2b/marketplace/leads
 * @param {{ unlockedOnly?: boolean }} [params]
 */
export async function fetchMarketplaceLeads(params = {}) {
  const response = await apiClient.get('/b2b/marketplace/leads', {
    params: params.unlockedOnly ? { unlocked_only: true } : undefined,
  })

  const data = unwrapApiData(response)
  const leads = Array.isArray(data.leads) ? data.leads : []

  return leads.map(mapMarketplaceLead)
}

/**
 * POST /b2b/marketplace/leads/{id}/unlock
 * @param {string} leadId
 */
export async function unlockMarketplaceLead(leadId) {
  const response = await apiClient.post(`/b2b/marketplace/leads/${leadId}/unlock`)
  const data = unwrapApiData(response)

  return {
    lead: mapMarketplaceLead(data.lead),
    wallet: data.wallet ? mapWallet(data.wallet) : null,
    crmClient: data.crm_client ? mapCrmClientFromUnlock(data.crm_client) : null,
  }
}

/** @param {Record<string, unknown>} apiClient */
function mapCrmClientFromUnlock(apiClientRow) {
  return {
    id: apiClientRow.id,
    cliente: apiClientRow.cliente ?? '',
    stato: apiClientRow.stato ?? 'Nuovo',
    esigenza: apiClientRow.esigenza ?? '',
    budget: apiClientRow.budget ?? '',
    ultimaAzione: 'Lead sbloccato',
    phone: apiClientRow.phone ?? '',
    email: apiClientRow.email ?? '',
    location: apiClientRow.location ?? '',
    marketplaceId: apiClientRow.marketplace_id ?? null,
  }
}
