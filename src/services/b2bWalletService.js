import apiClient, { unwrapApiData } from './apiClient'
import { mapWallet } from './b2bMarketplaceService'

/**
 * GET /b2b/wallet
 */
export async function fetchWallet() {
  const response = await apiClient.get('/b2b/wallet')
  const data = unwrapApiData(response)
  return mapWallet(data.wallet ?? data)
}

/**
 * POST /b2b/wallet/recharge
 * @param {{ amount: number, paymentMethod?: 'card' | 'transfer' }} params
 */
export async function rechargeWalletApi({ amount, paymentMethod = 'card' }) {
  const response = await apiClient.post('/b2b/wallet/recharge', {
    amount,
    payment_method: paymentMethod,
  })
  const data = unwrapApiData(response)

  return {
    transaction: data.transaction ?? null,
    wallet: data.wallet ? mapWallet(data.wallet) : null,
  }
}

/**
 * GET /b2b/wallet/transactions
 */
export async function fetchWalletTransactions(page = 1) {
  const response = await apiClient.get('/b2b/wallet/transactions', { params: { page } })
  const data = unwrapApiData(response)
  const transactions = Array.isArray(data.transactions) ? data.transactions : []

  return transactions.map((tx) => ({
    id: tx.id,
    date: tx.date ?? '',
    description: tx.description ?? '',
    amount: tx.amount ?? 0,
    status: tx.status ?? 'Pagata',
  }))
}
