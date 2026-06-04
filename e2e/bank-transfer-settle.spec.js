import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { loginPartnerViaApi } from './helpers/b2bAuth.js'
import { loginAdminViaApi } from './helpers/adminAuth.js'

const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

const RECHARGE_AMOUNT = 25

test.describe('Bank transfer settle (API)', () => {
  test.skip(!apiUrl, 'Set E2E_API_URL (e.g. http://127.0.0.1:8000/api/v1) to run')

  test('partner bank transfer recharge is settled by superadmin and credits wallet', async ({
    request,
  }) => {
    const partnerLogin = await loginPartnerViaApi(request, apiUrl)
    const partnerToken = partnerLogin.token
    const partnerHeaders = { Authorization: `Bearer ${partnerToken}` }

    const walletBefore = await request.get(`${apiUrl}/b2b/wallet`, {
      headers: partnerHeaders,
    })
    expect(walletBefore.ok()).toBeTruthy()
    const walletBeforeBody = await walletBefore.json()
    const initialCredits =
      walletBeforeBody?.data?.wallet?.balance_credits ??
      walletBeforeBody?.data?.balance_credits ??
      0

    const rechargeResponse = await request.post(`${apiUrl}/b2b/wallet/recharge`, {
      headers: {
        ...partnerHeaders,
        'Idempotency-Key': randomUUID(),
      },
      data: {
        amount: RECHARGE_AMOUNT,
        payment_method: 'bank_transfer',
      },
    })

    expect(rechargeResponse.ok()).toBeTruthy()
    const rechargeBody = await rechargeResponse.json()
    expect(rechargeBody?.data?.payment_intent?.status).toBe('pending')
    expect(rechargeBody?.data?.bank_transfer?.reference).toMatch(/^WEN-\d+$/)

    const wenReference = rechargeBody.data.bank_transfer.reference
    const intentId = rechargeBody?.data?.payment_intent?.id
    expect(intentId).toBeTruthy()

    const walletAfterRecharge = await request.get(`${apiUrl}/b2b/wallet`, {
      headers: partnerHeaders,
    })
    expect(walletAfterRecharge.ok()).toBeTruthy()
    const walletAfterRechargeBody = await walletAfterRecharge.json()
    const creditsAfterRecharge =
      walletAfterRechargeBody?.data?.wallet?.balance_credits ??
      walletAfterRechargeBody?.data?.balance_credits
    expect(creditsAfterRecharge).toBe(initialCredits)

    const adminLogin = await loginAdminViaApi(request, apiUrl)
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` }

    const pendingResponse = await request.get(`${apiUrl}/admin/wallet/pending-transfers`, {
      headers: adminHeaders,
    })
    expect(pendingResponse.ok()).toBeTruthy()
    const pendingBody = await pendingResponse.json()
    const pending = pendingBody?.data?.pending_transfers ?? []
    const match = pending.find(
      (row) => row.id === intentId || row.reference === wenReference,
    )
    expect(match).toBeTruthy()
    expect(match.credits).toBe(RECHARGE_AMOUNT)

    const completeResponse = await request.post(`${apiUrl}/admin/wallet/complete-transfer`, {
      headers: adminHeaders,
      data: { payment_intent_id: wenReference },
    })
    expect(completeResponse.ok()).toBeTruthy()
    const completeBody = await completeResponse.json()
    expect(completeBody?.data?.payment_intent?.status).toBe('completed')
    expect(completeBody?.data?.wallet?.balance_credits).toBe(
      initialCredits + RECHARGE_AMOUNT,
    )

    const walletAfterSettle = await request.get(`${apiUrl}/b2b/wallet`, {
      headers: partnerHeaders,
    })
    expect(walletAfterSettle.ok()).toBeTruthy()
    const walletAfterSettleBody = await walletAfterSettle.json()
    const finalCredits =
      walletAfterSettleBody?.data?.wallet?.balance_credits ??
      walletAfterSettleBody?.data?.balance_credits
    expect(finalCredits).toBe(initialCredits + RECHARGE_AMOUNT)
  })
})
