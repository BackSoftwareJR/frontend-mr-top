import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Download, Loader2, Search } from 'lucide-react'
import { fetchAdminTransactionsWithFallback } from '../../services/adminService'
import { isApiConfigured } from '../../services/apiClient'
import TransactionDetailDrawer from '../../components/admin/TransactionDetailDrawer'
import TransactionStatusBadge from '../../components/admin/TransactionStatusBadge'
import { adminGlassCard, adminPageSubtitle, adminPageTitle } from '../../components/admin/adminStyles'

const STATUS_OPTIONS = ['Tutti', 'Completata', 'In attesa', 'Fallita']

const CSV_HEADERS = [
  'ID',
  'Partner',
  'Importo',
  'Stato',
  'Data',
  'Tipo',
  'Metodo di pagamento',
  'Riferimento fattura',
  'Note',
]

function escapeCsvField(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function downloadTransactionsCsv(rows) {
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((tx) =>
      [
        tx.id,
        tx.partner,
        tx.importo,
        tx.stato,
        tx.data,
        tx.tipo ?? '',
        tx.metodo ?? '',
        tx.riferimento ?? '',
        tx.note ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    ),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transazioni-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const EMPTY_VOLUME_SUMMARY = {
  today: { value: '—', count: 0 },
  week: { value: '—', count: 0 },
  month: { value: '—', count: 0 },
}

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return null
  return sortDir === 'asc' ? (
    <ArrowUp className="inline h-3 w-3" />
  ) : (
    <ArrowDown className="inline h-3 w-3" />
  )
}

function VolumeStrip({ summary }) {
  const items = [
    { label: 'Oggi', ...summary.today },
    { label: 'Settimana', ...summary.week },
    { label: 'Mese', ...summary.month },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className={`${adminGlassCard} p-4`}>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Volume {item.label.toLowerCase()}
          </p>
          <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">{item.value}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{item.count} transazioni</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminTransactions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const openTxId = searchParams.get('open')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tutti')
  const [sortKey, setSortKey] = useState('data')
  const [sortDir, setSortDir] = useState('desc')
  const [manualTx, setManualTx] = useState(null)
  const [txList, setTxList] = useState([])
  const [volumeSummary, setVolumeSummary] = useState(EMPTY_VOLUME_SUMMARY)
  const [loading, setLoading] = useState(() => isApiConfigured())

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (isApiConfigured()) setLoading(true)
      try {
        const data = await fetchAdminTransactionsWithFallback()
        if (cancelled) return
        setTxList(data.transactions)
        setVolumeSummary(data.summary)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const urlTx = useMemo(() => {
    if (!openTxId || txList.length === 0) return null
    return txList.find((t) => t.id === openTxId) ?? null
  }, [openTxId, txList])

  if (urlTx && manualTx?.id !== urlTx.id) {
    setManualTx(urlTx)
  }

  useEffect(() => {
    if (!urlTx) return
    setSearchParams({}, { replace: true })
  }, [urlTx, setSearchParams])

  const selectedTx = manualTx ?? urlTx

  const filtered = useMemo(() => {
    let list = [...txList]

    if (statusFilter !== 'Tutti') {
      list = list.filter((tx) => tx.stato === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.partner.toLowerCase().includes(q) ||
          tx.riferimento.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      let cmp
      if (sortKey === 'importo') {
        cmp = a.importo - b.importo
      } else if (sortKey === 'partner') {
        cmp = a.partner.localeCompare(b.partner, 'it')
      } else if (sortKey === 'stato') {
        cmp = a.stato.localeCompare(b.stato, 'it')
      } else {
        cmp = a.id.localeCompare(b.id)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [search, statusFilter, sortKey, sortDir, txList])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={adminPageTitle}>Transazioni</h1>
          <p className={adminPageSubtitle}>
            Registro completo movimenti — filtri, ricerca e dettaglio
          </p>
        </div>
        <button
          type="button"
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => downloadTransactionsCsv(filtered)}
        >
          <Download className="h-4 w-4" />
          Esporta CSV
        </button>
      </div>

      {loading ? (
        <div className={`${adminGlassCard} flex items-center justify-center py-24`}>
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" aria-label="Caricamento transazioni" />
        </div>
      ) : (
        <>
          <VolumeStrip summary={volumeSummary} />

          <div className={`${adminGlassCard} p-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca ID, partner, fattura…"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-white focus:border-cyan-500/40 focus:outline-none"
                aria-label="Filtra per stato"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-zinc-900">
                    {opt === 'Tutti' ? 'Tutti gli stati' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`${adminGlassCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 sm:px-5">
                      <button type="button" onClick={() => toggleSort('id')} className="hover:text-white">
                        ID <SortIcon column="id" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('partner')}
                        className="hover:text-white"
                      >
                        Partner <SortIcon column="partner" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('importo')}
                        className="hover:text-white"
                      >
                        Importo <SortIcon column="importo" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('stato')}
                        className="hover:text-white"
                      >
                        Stato <SortIcon column="stato" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3 sm:pr-5">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-500">
                        Nessuna transazione trovata
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx) => (
                      <tr
                        key={tx.id}
                        className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-cyan-500/5"
                        onClick={() => setManualTx(tx)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400 sm:px-5">{tx.id}</td>
                        <td className="px-4 py-3 text-white">{tx.partner}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          € {tx.importo.toLocaleString('it-IT')}
                        </td>
                        <td className="px-4 py-3">
                          <TransactionStatusBadge stato={tx.stato} />
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 sm:pr-5">{tx.data}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-white/5 px-4 py-2 text-xs text-zinc-500 sm:px-5">
              {filtered.length} di {txList.length} transazioni
            </p>
          </div>
        </>
      )}

      <TransactionDetailDrawer transaction={selectedTx} onClose={() => setManualTx(null)} />
    </div>
  )
}
