import { AlertCircle, RefreshCw } from 'lucide-react'
import { adminGlassCard } from './adminStyles'

/**
 * Shown when admin data fetch fails while API is configured (strict mode — no mock fallback).
 */
export default function AdminLoadError({ message, onRetry }) {
  return (
    <div
      className={`${adminGlassCard} flex flex-col items-center gap-4 px-6 py-12 text-center sm:flex-row sm:text-left`}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 shrink-0 text-red-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">Impossibile caricare i dati</p>
        <p className="mt-1 text-sm text-zinc-400">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Riprova
      </button>
    </div>
  )
}
