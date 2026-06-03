import { useMemo, useState } from 'react'
import {
  Download,
  FileText,
  Receipt,
  TrendingDown,
  Wallet,
  Clock,
  Table2,
  List,
} from 'lucide-react'
import {
  b2bCard,
  b2bEmptyState,
  b2bHeroStat,
  b2bIconAccent,
  b2bPageSubtitle,
  b2bPageTitle,
  b2bPrimaryBtn,
  b2bSegmented,
  b2bSegmentedActive,
  b2bSegmentedInactive,
  b2bStatusPaid,
  b2bStatusPending,
} from '../../components/b2b/b2bStyles'
import { formatDateIT } from '../../data/mockB2B'
import { useB2B } from '../../context/B2BContext'

const PERIOD_FILTERS = [
  { id: '1m', label: 'Ultimo mese', days: 31 },
  { id: '3m', label: '3 mesi', days: 92 },
  { id: 'all', label: 'Tutto', days: null },
]

function InvoiceStatusBadge({ status }) {
  const isPaid = status === 'Pagata'
  return (
    <span className={isPaid ? b2bStatusPaid : b2bStatusPending}>
      {status}
    </span>
  )
}

function filterByPeriod(invoices, periodId) {
  const period = PERIOD_FILTERS.find((p) => p.id === periodId)
  if (!period?.days) return invoices
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - period.days)
  return invoices.filter((inv) => new Date(inv.date) >= cutoff)
}

function PdfDownloadButton({ disabled = true }) {
  return (
    <button
      type="button"
      disabled={disabled}
      title="Download PDF non disponibile nella demo"
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-muted transition-colors enabled:hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download className="h-3.5 w-3.5" />
      Scarica PDF
    </button>
  )
}

function InvoiceTable({ invoices, formatCurrency }) {
  if (invoices.length === 0) {
    return (
      <div className={b2bEmptyState}>
        <Receipt className="mb-3 h-10 w-10 text-charcoal-muted/40" />
        <p className="text-sm font-medium text-charcoal">Nessuna fattura nel periodo</p>
        <p className="mt-1 text-sm text-charcoal-muted">Modifica il filtro o ricarica il wallet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs font-semibold tracking-wide text-charcoal-muted uppercase">
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Descrizione</th>
              <th className="px-5 py-3">Importo</th>
              <th className="px-5 py-3">Stato</th>
              <th className="w-32 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-t border-black/5 transition-colors hover:bg-black/[0.02]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-charcoal-muted">
                  {formatDateIT(inv.date)}
                </td>
                <td className="px-5 py-3.5 text-charcoal">{inv.description}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-base font-semibold tracking-tight text-charcoal">
                  {formatCurrency(inv.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
                <td className="px-5 py-3.5">
                  <PdfDownloadButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 md:hidden">
        {invoices.map((inv) => (
          <li key={inv.id} className="px-4 py-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-charcoal">{inv.description}</p>
                <p className="text-xs text-charcoal-muted">{formatDateIT(inv.date)}</p>
              </div>
              <InvoiceStatusBadge status={inv.status} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-charcoal">{formatCurrency(inv.amount)}</p>
              <PdfDownloadButton />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function PaymentTimeline({ invoices, formatCurrency }) {
  if (invoices.length === 0) {
    return (
      <div className={b2bEmptyState}>
        <Clock className="mb-3 h-10 w-10 text-charcoal-muted/40" />
        <p className="text-sm font-medium text-charcoal">Nessun movimento</p>
      </div>
    )
  }

  return (
    <ul className="space-y-0">
      {invoices.map((inv, i) => (
        <li key={inv.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < invoices.length - 1 && (
            <span
              className="absolute left-[11px] top-6 bottom-0 w-px bg-black/10"
              aria-hidden="true"
            />
          )}
          <span className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-coral/15 ring-2 ring-white">
            <span className="h-2 w-2 rounded-full bg-accent-coral" />
          </span>
          <div className="min-w-0 flex-1 rounded-2xl border border-black/5 bg-white/60 p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-charcoal">{inv.description}</p>
                <p className="text-xs text-charcoal-muted">{formatDateIT(inv.date)} · {inv.id}</p>
              </div>
              <InvoiceStatusBadge status={inv.status} />
            </div>
            <p className="mt-2 text-lg font-semibold text-charcoal">{formatCurrency(inv.amount)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Fatturazione() {
  const { invoices, walletBalance, totalSpent, formatCurrency, openRechargeModal } = useB2B()
  const [period, setPeriod] = useState('3m')
  const [viewMode, setViewMode] = useState('table')

  const filteredInvoices = useMemo(
    () => filterByPeriod(invoices, period),
    [invoices, period]
  )

  const pendingCount = useMemo(
    () => filteredInvoices.filter((i) => i.status === 'In attesa').length,
    [filteredInvoices]
  )

  const monthSpent = useMemo(() => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 31)
    return filteredInvoices
      .filter(
        (i) =>
          i.status === 'Pagata' &&
          !i.description.toLowerCase().includes('ricarica') &&
          new Date(i.date) >= oneMonthAgo
      )
      .reduce((sum, i) => sum + i.amount, 0)
  }, [filteredInvoices])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={b2bPageTitle}>Fatturazione</h1>
          <p className={b2bPageSubtitle}>Storico pagamenti, fatture e ricariche wallet</p>
        </div>
        <button
          type="button"
          onClick={openRechargeModal}
          className={`inline-flex items-center gap-2 ${b2bPrimaryBtn}`}
        >
          <Wallet className="h-4 w-4" />
          Ricarica wallet
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className={`${b2bHeroStat} sm:col-span-1`}>
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-muted">
            <Wallet className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
            Credito residuo
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-accent-coral">
            {formatCurrency(walletBalance)}
          </p>
        </div>
        <div className={b2bHeroStat}>
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-muted">
            <TrendingDown className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
            Totale speso (mese)
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">
            {formatCurrency(monthSpent)}
          </p>
        </div>
        <div className={b2bHeroStat}>
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-muted">
            <FileText className={`h-3.5 w-3.5 ${b2bIconAccent}`} />
            Fatture pendenti
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">
            {pendingCount}
          </p>
          <p className="mt-0.5 text-xs text-charcoal-muted">
            Spesa totale: {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className={b2bSegmented}>
          {PERIOD_FILTERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={period === p.id ? b2bSegmentedActive : b2bSegmentedInactive}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={b2bSegmented}>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1 ${viewMode === 'table' ? b2bSegmentedActive : b2bSegmentedInactive}`}
          >
            <Table2 className="h-3 w-3" />
            Tabella
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`inline-flex items-center gap-1 ${viewMode === 'timeline' ? b2bSegmentedActive : b2bSegmentedInactive}`}
          >
            <List className="h-3 w-3" />
            Timeline
          </button>
        </div>
      </div>

      <div className={`overflow-hidden ${b2bCard}`}>
        {viewMode === 'table' ? (
          <InvoiceTable invoices={filteredInvoices} formatCurrency={formatCurrency} />
        ) : (
          <div className="p-5">
            <PaymentTimeline invoices={filteredInvoices} formatCurrency={formatCurrency} />
          </div>
        )}
      </div>
    </div>
  )
}
