import { mockCRMClients, mockMarketplaceLeads } from '../data/mockB2B'
import apiClient, { unwrapApiData } from './apiClient'
import { b2bWithOfflineMock } from './b2bApiUtils'

function getMockMarketplaceLeads() {
  return mockMarketplaceLeads.map((lead) => ({
    ...lead,
    unlocked: mockCRMClients.some((c) => c.marketplaceId === lead.id),
  }))
}

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
 * @param {string} [idempotencyKey]
 */
export function fetchMarketplaceLeadsWithOfflineMock(params = {}) {
  return b2bWithOfflineMock(() => fetchMarketplaceLeads(params), getMockMarketplaceLeads)
}

export async function unlockMarketplaceLead(leadId, idempotencyKey = crypto.randomUUID()) {
  const response = await apiClient.post(`/b2b/marketplace/leads/${leadId}/unlock`, {}, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
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
