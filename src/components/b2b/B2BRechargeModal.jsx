import { useState } from 'react'
import { CheckCircle2, CreditCard, Landmark } from 'lucide-react'
import B2BModal from './B2BModal'
import {
  b2bInputFocus,
  b2bPrimaryBtn,
  b2bSecondaryBtn,
} from './b2bStyles'
import { proGlassCardSm } from './proDesignTokens'
import { useB2B } from '../../context/B2BContext'

const PRESET_AMOUNTS = [50, 100, 200]

const PAYMENT_METHODS = [
  { id: 'card', label: 'Carta', icon: CreditCard, hint: 'Disponibile a breve' },
  { id: 'transfer', label: 'Bonifico', icon: Landmark, hint: 'Disponibile a breve' },
]

export default function B2BRechargeModal() {
  const { rechargeModalOpen, closeRechargeModal, rechargeWallet, formatCurrency } = useB2B()
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const handleConfirm = () => {
    setLoading(true)
    const ok = rechargeWallet(effectiveAmount)
    setLoading(false)
    if (ok) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setCustomAmount('')
        setSelectedAmount(100)
        closeRechargeModal()
      }, 1400)
    }
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
          {PAYMENT_METHODS.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              type="button"
              disabled
              title={hint}
              onClick={() => setPaymentMethod(id)}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition-all ${
                paymentMethod === id
                  ? 'border-accent-coral/40 bg-accent-coral/5 opacity-100'
                  : 'border-black/5 bg-white/60 opacity-60'
              }`}
            >
              <Icon className="h-4 w-4 text-accent-coral" />
              <span className="text-sm font-semibold text-charcoal">{label}</span>
              <span className="text-[10px] text-charcoal-muted">{hint}</span>
            </button>
          ))}
        </div>
      </div>

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
          disabled={loading || !Number.isFinite(effectiveAmount) || effectiveAmount <= 0}
          className={b2bPrimaryBtn}
        >
          Conferma ricarica
        </button>
      </div>
    </B2BModal>
  )
}
