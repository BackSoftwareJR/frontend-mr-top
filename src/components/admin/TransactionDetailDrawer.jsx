import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CreditCard, FileText, Loader2, X } from 'lucide-react'
import { fetchAdminTransactionDetailWithFallback } from '../../services/adminService'
import { isApiConfigured } from '../../services/apiClient'
import TransactionStatusBadge from './TransactionStatusBadge'
import { adminGlassCard } from './adminStyles'

export default function TransactionDetailDrawer({ transaction, onClose }) {
  const prefersReducedMotion = useReducedMotion()
  const panelRef = useRef(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const transition = prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 34, stiffness: 400 }

  useEffect(() => {
    if (!transaction) return

    let cancelled = false

    async function load() {
      if (isApiConfigured()) setLoading(true)
      try {
        const data = await fetchAdminTransactionDetailWithFallback(transaction.id, transaction)
        if (!cancelled) setDetail(data ?? transaction)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [transaction])

  useEffect(() => {
    if (!transaction) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [transaction, onClose])

  const tx = detail ?? transaction

  return (
    <AnimatePresence>
      {transaction && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex justify-end">
            <motion.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tx-drawer-title"
              aria-busy={loading}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={transition}
              className="pointer-events-auto absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h2 id="tx-drawer-title" className="font-mono text-base font-semibold text-white">
                    {transaction.id}
                  </h2>
                  <p className="text-xs text-zinc-500">{tx?.partner ?? transaction.partner}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Chiudi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto px-5 py-5">
                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <Loader2
                      className="h-6 w-6 animate-spin text-cyan-400"
                      aria-label="Caricamento dettaglio transazione"
                    />
                  </div>
                ) : tx ? (
                  <div className="space-y-5">
                    <div className={`${adminGlassCard} p-4 text-center`}>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                        Importo
                      </p>
                      <p className="mt-1 text-3xl font-semibold text-white">
                        € {tx.importo.toLocaleString('it-IT')}
                      </p>
                      <div className="mt-3 flex justify-center">
                        <TransactionStatusBadge stato={tx.stato} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Tipo
                        </p>
                        <p className="mt-1 text-sm text-white">{tx.tipo}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Data
                        </p>
                        <p className="mt-1 text-sm text-white">{tx.data}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Metodo di pagamento
                        </p>
                        <p className="mt-0.5 text-sm text-white">{tx.metodo || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Riferimento fattura
                        </p>
                        <p className="mt-0.5 font-mono text-sm text-white">{tx.riferimento || '—'}</p>
                      </div>
                    </div>

                    {tx.note && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Note
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">{tx.note}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
