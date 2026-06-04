import {
  INITIAL_WALLET_BALANCE,
  mockInvoices,
} from '../data/mockB2B'
import { isStripeEnabled } from '../lib/stripe'
import apiClient, { unwrapApiData } from './apiClient'
import { b2bWithOfflineMock } from './b2bApiUtils'
import { mapWallet } from './b2bMarketplaceService'

const MOCK_WALLET = {
  balanceCredits: INITIAL_WALLET_BALANCE,
  totalSpent: 705,
  currency: 'EUR',
}

const TRANSACTION_STATUS_LABELS = {
  completed: 'Pagata',
  pending: 'In attesa',
  failed: 'Fallita',
  void: 'Annullata',
}

/** @returns {boolean} */
export function isWalletInstantRechargeEnv() {
  return import.meta.env.VITE_WALLET_INSTANT_RECHARGE === 'true'
}

function mapTransactionStatus(status) {
  if (!status) return 'Pagata'
  const key = String(status).toLowerCase()
  return TRANSACTION_STATUS_LABELS[key] ?? status
}

/**
 * GET /b2b/wallet
 */
export async function fetchWallet() {
  const response = await apiClient.get('/b2b/wallet')
  const data = unwrapApiData(response)
  return mapWallet(data.wallet ?? data)
}

/**
 * GET /b2b/wallet/recharge/{id}
 * @param {string} paymentIntentId
 */
function mapBankTransfer(bankTransfer) {
  if (!bankTransfer) return null
  return {
    iban: bankTransfer.iban ?? '',
    beneficiary: bankTransfer.beneficiary ?? '',
    reference: bankTransfer.reference ?? '',
    amount: bankTransfer.amount ?? 0,
    currency: bankTransfer.currency ?? 'EUR',
  }
}

export async function fetchRechargeStatus(paymentIntentId) {
  const response = await apiClient.get(`/b2b/wallet/recharge/${paymentIntentId}`)
  const data = unwrapApiData(response)

  return {
    paymentIntent: data.payment_intent ?? null,
    wallet: data.wallet ? mapWallet(data.wallet) : null,
    transaction: data.transaction ?? null,
    bankTransfer: mapBankTransfer(data.bank_transfer),
  }
}

/**
 * Poll until payment intent completes or fails.
 * @param {string} paymentIntentId
 * @param {{ maxAttempts?: number, intervalMs?: number }} [options]
 */
export async function pollRechargeUntilSettled(paymentIntentId, options = {}) {
  const { maxAttempts = 30, intervalMs = 2000 } = options

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await fetchRechargeStatus(paymentIntentId)
    const intentStatus = status.paymentIntent?.status

    if (intentStatus === 'completed') {
      return status
    }

    if (intentStatus === 'failed') {
      throw new Error('Il pagamento non è andato a buon fine.')
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, intervalMs)
      })
    }
  }

  throw new Error('Pagamento in attesa — controlla lo stato tra qualche minuto.')
}

/**
 * POST /b2b/wallet/recharge
 * @param {{ amount: number, paymentMethod?: 'card' | 'transfer', idempotencyKey?: string }} params
 */
export async function rechargeWalletApi({ amount, paymentMethod = 'card', idempotencyKey = crypto.randomUUID() }) {
  const response = await apiClient.post('/b2b/wallet/recharge', {
    amount,
    payment_method: paymentMethod,
  }, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  const data = unwrapApiData(response)

  const paymentIntent = data.payment_intent ?? null
  const isPending = paymentIntent?.status === 'pending'
  const paymentIntentId = data.payment_intent_id ?? paymentIntent?.id ?? null

  let wallet = data.wallet ? mapWallet(data.wallet) : null
  let transaction = data.transaction ?? null

  if (isPending && paymentIntentId && isWalletInstantRechargeEnv()) {
    wallet = wallet ?? (data.wallet ? mapWallet(data.wallet) : null)
  } else if (isPending && paymentIntentId && !isStripeEnabled() && paymentMethod !== 'transfer') {
    try {
      const settled = await pollRechargeUntilSettled(paymentIntentId, {
        maxAttempts: import.meta.env.DEV ? 5 : 30,
        intervalMs: import.meta.env.DEV ? 1000 : 2000,
      })
      wallet = settled.wallet ?? wallet
      transaction = settled.transaction ?? transaction
    } catch {
      return {
        transaction: null,
        wallet,
        paymentIntent,
        paymentIntentId,
        clientSecret: data.client_secret ?? paymentIntent?.client_secret ?? null,
        pending: true,
      }
    }
  }

  return {
    transaction,
    wallet,
    paymentIntent,
    paymentIntentId,
    clientSecret: data.client_secret ?? paymentIntent?.client_secret ?? null,
    bankTransfer: mapBankTransfer(data.bank_transfer),
    pending: isPending && !transaction,
  }
}

/**
 * GET /b2b/invoices
 */
export async function fetchB2bInvoices() {
  const response = await apiClient.get('/b2b/invoices')
  const data = unwrapApiData(response)
  const invoices = Array.isArray(data.invoices) ? data.invoices : []

  return invoices.map((inv) => ({
    id: inv.id,
    date: inv.date ?? '',
    description: inv.description ?? '',
    amount: inv.amount ?? 0,
    status: mapTransactionStatus(inv.status),
  }))
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
    status: mapTransactionStatus(tx.status),
  }))
}

export function fetchWalletWithOfflineMock() {
  return b2bWithOfflineMock(fetchWallet, MOCK_WALLET)
}

export function fetchB2bInvoicesWithOfflineMock() {
  return b2bWithOfflineMock(fetchB2bInvoices, mockInvoices)
}

export function fetchWalletTransactionsWithOfflineMock(page = 1) {
  return b2bWithOfflineMock(() => fetchWalletTransactions(page), mockInvoices)
}
