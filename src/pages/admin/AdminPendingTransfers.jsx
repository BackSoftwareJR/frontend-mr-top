import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import {
  completeAdminBankTransfer,
  fetchAdminPendingBankTransfersWithFallback,
  formatEuro,
} from '../../services/adminService'
import { ApiError, isApiConfigured } from '../../services/apiClient'
import AdminLoadError from '../../components/admin/AdminLoadError'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

function formatCreatedAt(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function AdminPendingTransfers() {
  const [transfers, setTransfers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [completingId, setCompletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) {
        setLoading(true)
        setLoadError(null)
      }

      try {
        const data = await fetchAdminPendingBankTransfersWithFallback()
        if (!cancelled) setTransfers(data)
      } catch (err) {
        if (!cancelled && isApiConfigured()) {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare i bonifici in attesa. Verifica la connessione e riprova.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [retryCount])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return transfers

    return transfers.filter((transfer) =>
      [transfer.id, transfer.companyName, transfer.reference]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [search, transfers])

  const handleComplete = async (transfer) => {
    setActionError(null)
    setCompletingId(transfer.id)

    try {
      const identifier = transfer.reference || transfer.id

      if (isApiConfigured()) {
        await completeAdminBankTransfer(identifier)
      }

      setTransfers((prev) => prev.filter((item) => item.id !== transfer.id))
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Impossibile segnare il bonifico come ricevuto.',
      )
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className={adminPageTitle}>Bonifici in attesa</h1>
        <p className={adminPageSubtitle}>
          Payment intent bonifico in attesa di accredito — verifica la causale WEN e segna come ricevuto
        </p>
      </div>

      {loadError && !loading ? (
        <AdminLoadError message={loadError} onRetry={() => setRetryCount((n) => n + 1)} />
      ) : null}

      {actionError ? (
        <div
          className={`${adminGlassCard} border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300`}
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-label="Caricamento bonifici" />
        </div>
      ) : loadError ? null : (
        <>
          <div className={`${adminGlassCard} p-4`}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca partner, causale WEN, ID…"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className={`${adminGlassCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 sm:px-5">Partner</th>
                    <th className="px-4 py-3">Crediti</th>
                    <th className="px-4 py-3">Importo</th>
                    <th className="px-4 py-3">Causale</th>
                    <th className="px-4 py-3">Richiesto il</th>
                    <th className="px-4 py-3 sm:pr-5">Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-zinc-500">
                        Nessun bonifico in attesa
                      </td>
                    </tr>
                  ) : (
                    filtered.map((transfer) => {
                      const isCompleting = completingId === transfer.id

                      return (
                        <tr
                          key={transfer.id}
                          className="border-b border-white/5 transition-colors last:border-0 hover:bg-cyan-500/5"
                        >
                          <td className="px-4 py-3 text-white sm:px-5">{transfer.companyName}</td>
                          <td className="px-4 py-3 font-medium text-white">{transfer.credits}</td>
                          <td className="px-4 py-3 text-zinc-300">
                            {formatEuro(transfer.amountCents / 100)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-cyan-400">
                            {transfer.reference || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {formatCreatedAt(transfer.createdAt)}
                          </td>
                          <td className="px-4 py-3 sm:pr-5">
                            <button
                              type="button"
                              disabled={isCompleting}
                              onClick={() => handleComplete(transfer)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isCompleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                              ) : (
                                <Check className="h-3.5 w-3.5" aria-hidden />
                              )}
                              Segna come ricevuto
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-white/5 px-4 py-2 text-xs text-zinc-500 sm:px-5">
              {filtered.length} di {transfers.length} bonifici in attesa
            </p>
          </div>
        </>
      )}
    </div>
  )
}
