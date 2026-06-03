import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import TransactionStatusBadge from './TransactionStatusBadge'
import { adminGlassCard } from './adminStyles'

export default function AdminRecentTransactions({ transactions, limit = 6 }) {
  const rows = transactions.slice(0, limit)

  return (
    <div className={`${adminGlassCard} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-white sm:text-base">Transazioni recenti</h3>
          <p className="text-xs text-zinc-500">Ultimi movimenti piattaforma</p>
        </div>
        <Link
          to="/admin/transactions"
          className="flex items-center gap-1 text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Vedi tutte
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2.5 sm:px-5">ID</th>
              <th className="px-4 py-2.5">Partner</th>
              <th className="px-4 py-2.5">Importo</th>
              <th className="px-4 py-2.5">Stato</th>
              <th className="px-4 py-2.5 sm:pr-5">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
