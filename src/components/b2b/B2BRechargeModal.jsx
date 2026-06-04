import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { CheckCircle2, Copy, CreditCard, Landmark, Loader2 } from 'lucide-react'
import B2BModal from './B2BModal'
import {
  b2bInputFocus,
  b2bPrimaryBtn,
  b2bSecondaryBtn,
} from './b2bStyles'
import { proGlassCardSm } from './proDesignTokens'
import { useB2B } from '../../context/B2BContext'
import { getStripePromise, isStripeEnabled } from '../../lib/stripe'
import {
  fetchRechargeStatus,
  pollRechargeUntilSettled,
  rechargeWalletApi,
} from '../../services/b2bWalletService'

const PRESET_AMOUNTS = [50, 100, 200]

const PAYMENT_METHODS = [
  { id: 'card', label: 'Carta', icon: CreditCard },
  { id: 'transfer', label: 'Bonifico', icon: Landmark },
]

/**
 * @param {{
 *   onAmountCentsChange?: (cents: number) => void,
 *   stripe?: import('@stripe/stripe-js').Stripe | null,
 *   elements?: import('@stripe/react-stripe-js').StripeElements | null,
 *   stripeCheckout?: boolean,
 * }} props
 */
function B2BRechargeModalContent({
  onAmountCentsChange,
  stripe = null,
  elements = null,
  stripeCheckout: stripeCheckoutProp,
}) {
  const {
    rechargeModalOpen,
    closeRechargeModal,
    rechargeWallet,
    finalizeRecharge,
    formatCurrency,
    showToast,
    useApi: useApiEnabled,
  } = useB2B()
  const stripeCheckout =
    stripeCheckoutProp ?? (isStripeEnabled() && useApiEnabled)

  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [transferIntentId, setTransferIntentId] = useState(null)
  const [bankTransfer, setBankTransfer] = useState(null)
  const [pollingTransfer, setPollingTransfer] = useState(false)
  const transferPollActiveRef = useRef(false)

  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount
  const showStripeElement = stripeCheckout && paymentMethod === 'card'

  useEffect(() => {
    if (!onAmountCentsChange) return
    const cents = Number.isFinite(effectiveAmount) && effectiveAmount > 0
      ? Math.round(effectiveAmount * 100)
      : 10000
    onAmountCentsChange(cents)
  }, [effectiveAmount, onAmountCentsChange])

  const resetModalState = useCallback(() => {
    setSuccess(false)
    setPending(false)
    setTransferIntentId(null)
    setBankTransfer(null)
    setPollingTransfer(false)
    setCustomAmount('')
    setSelectedAmount(100)
  }, [])

  const startTransferPolling = useCallback(async (paymentIntentId) => {
    if (transferPollActiveRef.current) return
    transferPollActiveRef.current = true
    setPollingTransfer(true)

    try {
      const settled = await pollRechargeUntilSettled(paymentIntentId, {
        maxAttempts: import.meta.env.DEV ? 30 : 60,
        intervalMs: import.meta.env.DEV ? 2000 : 5000,
      })
      finalizeRecharge(
        effectiveAmount,
        settled.wallet,
        settled.transaction,
      )
      setSuccess(true)
      setTransferIntentId(null)
      setBankTransfer(null)
      setTimeout(() => {
        resetModalState()
        closeRechargeModal()
      }, 1400)
    } catch {
      // User can close; ops complete via webhook/admin.
    } finally {
      transferPollActiveRef.current = false
      setPollingTransfer(false)
    }
  }, [effectiveAmount, finalizeRecharge, closeRechargeModal, resetModalState])

  const copyToClipboard = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      showToast(`${label} copiato`, 'success')
    } catch {
      showToast('Copia non riuscita', 'error')
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    setPending(false)

    try {
      if (stripeCheckout && paymentMethod === 'card') {
        if (!stripe || !elements) {
          showToast('Pagamento non pronto. Riprova.', 'error')
          return
        }

        const created = await rechargeWalletApi({
          amount: effectiveAmount,
          paymentMethod: 'card',
        })

        if (!created.clientSecret || !created.paymentIntentId) {
          showToast('Impossibile avviare il pagamento.', 'error')
          return
        }

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret: created.clientSecret,
          redirect: 'if_required',
        })

        if (error) {
          showToast(error.message ?? 'Pagamento non riuscito.', 'error')
          return
        }

        const settled = await pollRechargeUntilSettled(created.paymentIntentId, {
          maxAttempts: import.meta.env.DEV ? 15 : 30,
          intervalMs: import.meta.env.DEV ? 1000 : 2000,
        })

        finalizeRecharge(
          effectiveAmount,
          settled.wallet,
          settled.transaction,
        )
        setSuccess(true)
        setTimeout(() => {
          resetModalState()
          closeRechargeModal()
        }, 1400)
        return
      }

      if (useApiEnabled && paymentMethod === 'transfer') {
        const created = await rechargeWalletApi({
          amount: effectiveAmount,
          paymentMethod: 'transfer',
        })

        if (!created.paymentIntentId) {
          showToast('Impossibile avviare il bonifico.', 'error')
          return
        }

        const instructions = created.bankTransfer
          ?? (await fetchRechargeStatus(created.paymentIntentId)).bankTransfer

        if (!instructions?.iban) {
          showToast('Istruzioni bonifico non disponibili.', 'error')
          return
        }

        setTransferIntentId(created.paymentIntentId)
        setBankTransfer(instructions)
        showToast('Effettua il bonifico con la causale indicata', 'info')
        void startTransferPolling(created.paymentIntentId)
        return
      }

      const outcome = await rechargeWallet(effectiveAmount, paymentMethod)
      if (outcome === 'pending') {
        setPending(true)
        return
      }
      if (outcome === true) {
        setSuccess(true)
        setTimeout(() => {
          resetModalState()
          closeRechargeModal()
        }, 1400)
      }
    } catch (error) {
      showToast(error?.message ?? 'Ricarica non riuscita.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (bankTransfer && transferIntentId) {
    return (
      <B2BModal open={rechargeModalOpen} onClose={closeRechargeModal} title="Bonifico bancario">
        <p className="mb-4 text-sm text-charcoal-muted">
          Effettua un bonifico per {formatCurrency(bankTransfer.amount || effectiveAmount)}.
          Inserisci la causale esattamente come indicata.
        </p>

        <div className={`mb-4 space-y-3 ${proGlassCardSm} !p-4`}>
          <div>
            <p className="text-xs font-medium text-charcoal-muted">Beneficiario</p>
            <p className="text-sm font-semibold text-charcoal">{bankTransfer.beneficiary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-charcoal-muted">IBAN</p>
            <div className="flex items-center justify-between gap-2">
              <p className="break-all text-sm font-semibold text-charcoal">{bankTransfer.iban}</p>
              <button
                type="button"
                className={b2bSecondaryBtn}
                onClick={() => copyToClipboard('IBAN', bankTransfer.iban)}
                aria-label="Copia IBAN"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-charcoal-muted">Causale</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-charcoal">{bankTransfer.reference}</p>
              <button
                type="button"
                className={b2bSecondaryBtn}
                onClick={() => copyToClipboard('Causale', bankTransfer.reference)}
                aria-label="Copia causale"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-charcoal-muted">Importo</p>
            <p className="text-sm font-semibold text-charcoal">
              {formatCurrency(bankTransfer.amount || effectiveAmount)}
            </p>
          </div>
        </div>

        {pollingTransfer ? (
          <p className="mb-4 flex items-center gap-2 text-sm text-charcoal-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            In attesa della conferma del bonifico…
          </p>
        ) : (
          <p className="mb-4 text-sm text-charcoal-muted">
            Dopo il bonifico i crediti verranno accreditati automaticamente (solitamente 1–2 giorni lavorativi).
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setTransferIntentId(null)
              setBankTransfer(null)
              closeRechargeModal()
            }}
            className={b2bSecondaryBtn}
          >
            Chiudi
          </button>
        </div>
      </B2BModal>
    )
  }

  if (pending) {
    return (
      <B2BModal open={rechargeModalOpen} onClose={closeRechargeModal} title="Pagamento in attesa">
        <div className="py-4 text-center">
          <p className="text-sm font-semibold text-charcoal">In attesa</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            La ricarica verrà accreditata dopo la conferma del pagamento.
          </p>
          <button type="button" onClick={closeRechargeModal} className={`${b2bSecondaryBtn} mt-6`}>
            Chiudi
          </button>
        </div>
      </B2BModal>
    )
  }

  if (success) {
    return (
      <B2BModal open={rechargeModalOpen} onClose={closeRechargeModal} title="Ricarica completata">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/60">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-charcoal">Credito aggiornato</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            +{formatCurrency(effectiveAmount)} sul wallet
          </p>
        </div>
      </B2BModal>
    )
  }

  return (
    <B2BModal open={rechargeModalOpen} onClose={closeRechargeModal} title="Ricarica credito">
      <p className="mb-4 text-sm text-charcoal-muted">
        Scegli un importo predefinito o inserisci un valore personalizzato.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {PRESET_AMOUNTS.map((amount) => {
          const selected = !customAmount && selectedAmount === amount
          return (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount)
                setCustomAmount('')
              }}
              className={`rounded-2xl px-3 py-4 text-sm font-semibold transition-all ${
                selected
                  ? 'border-2 border-accent-coral bg-accent-coral/8 text-accent-coral-dark ring-1 ring-accent-coral/20'
                  : 'border border-black/5 bg-white/80 text-charcoal hover:border-accent-coral/30'
              }`}
            >
              € {amount}
            </button>
          )
        })}
      </div>

      <div className="mb-5">
        <label htmlFor="custom-amount" className="mb-1.5 block text-xs font-medium text-charcoal-muted">
          Importo personalizzato
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-charcoal-muted">€</span>
          <input
            id="custom-amount"
            type="number"
            min="1"
            step="1"
            placeholder="Es. 75"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={`w-full rounded-xl border border-black/5 bg-white/90 py-3 pl-9 pr-4 text-sm text-charcoal ${b2bInputFocus}`}
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-charcoal-muted">Metodo di pagamento</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPaymentMethod(id)}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition-all ${
                paymentMethod === id
                  ? 'border-accent-coral/40 bg-accent-coral/5'
                  : 'border-black/5 bg-white/60 hover:border-accent-coral/20'
              }`}
            >
              <Icon className="h-4 w-4 text-accent-coral" />
              <span className="text-sm font-semibold text-charcoal">{label}</span>
              <span className="text-[10px] text-charcoal-muted">
                {id === 'transfer' ? 'Bonifico SEPA' : 'Pagamento sicuro'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showStripeElement && (
        <div className="mb-5 rounded-2xl border border-black/5 bg-white/90 p-4">
          <p className="mb-3 text-xs font-medium text-charcoal-muted">Dati carta</p>
          <PaymentElement />
        </div>
      )}

      {paymentMethod === 'transfer' && useApiEnabled && (
        <p className="mb-4 text-xs text-charcoal-muted">
          Riceverai IBAN, beneficiario e causale dopo la conferma. I crediti si attivano al ricevimento del bonifico.
        </p>
      )}

      <div className={`mb-5 ${proGlassCardSm} !p-3`}>
        <p className="text-xs text-charcoal-muted">Totale da addebitare</p>
        <p className="text-xl font-semibold tracking-tight text-charcoal">
          {Number.isFinite(effectiveAmount) ? formatCurrency(effectiveAmount) : '—'}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={closeRechargeModal} className={b2bSecondaryBtn}>
          Annulla
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={
            loading
            || !Number.isFinite(effectiveAmount)
            || effectiveAmount <= 0
            || (showStripeElement && (!stripe || !elements))
          }
          className={b2bPrimaryBtn}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Elaborazione…
            </span>
          ) : paymentMethod === 'transfer' ? (
            'Continua con bonifico'
          ) : (
            'Conferma ricarica'
          )}
        </button>
      </div>
    </B2BModal>
  )
}

function B2BRechargeModalWithStripe(props) {
  const stripe = useStripe()
  const elements = useElements()

  return (
    <B2BRechargeModalContent
      {...props}
      stripe={stripe}
      elements={elements}
      stripeCheckout
    />
  )
}

export default function B2BRechargeModal() {
  const { useApi: useApiEnabled } = useB2B()
  const stripeCheckout = isStripeEnabled() && useApiEnabled
  const stripePromise = useMemo(() => getStripePromise(), [])
  const [amountCents, setAmountCents] = useState(10000)

  const elementsOptions = useMemo(
    () => ({
      mode: 'payment',
      amount: amountCents,
      currency: 'eur',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#e07a5f',
          borderRadius: '12px',
        },
      },
    }),
    [amountCents],
  )

  if (stripeCheckout && stripePromise) {
    return (
      <Elements key={amountCents} stripe={stripePromise} options={elementsOptions}>
        <B2BRechargeModalWithStripe onAmountCentsChange={setAmountCents} />
      </Elements>
    )
  }

  return <B2BRechargeModalContent stripeCheckout={false} />
}
