import apiClient, { unwrapApiData } from './apiClient'

/** @param {Record<string, unknown>} apiClient */
export function mapCrmClient(apiClientRow) {
  return {
    id: apiClientRow.id,
    cliente: apiClientRow.cliente ?? '',
    stato: apiClientRow.stato ?? 'Nuovo',
    esigenza: apiClientRow.esigenza ?? '',
    budget: apiClientRow.budget ?? '',
    ultimaAzione: apiClientRow.ultima_azione ?? '—',
    phone: apiClientRow.phone ?? '',
    email: apiClientRow.email ?? '',
    location: apiClientRow.location ?? '',
    marketplaceId: apiClientRow.marketplace_id ?? null,
  }
}

/**
 * GET /b2b/crm/clients
 * @param {{ stato?: string }} [params]
 */
export async function fetchCrmClients(params = {}) {
  const response = await apiClient.get('/b2b/crm/clients', {
    params: params.stato ? { stato: params.stato } : undefined,
  })

  const data = unwrapApiData(response)
  const clients = Array.isArray(data.clients) ? data.clients : []

  return clients.map(mapCrmClient)
}

/**
 * PATCH /b2b/crm/clients/{id}
 * @param {string} clientId
 * @param {string} stato
 */
export async function updateCrmClientStatus(clientId, stato) {
  const response = await apiClient.patch(`/b2b/crm/clients/${clientId}`, { stato })
  const data = unwrapApiData(response)

  return mapCrmClient(data.client)
}
