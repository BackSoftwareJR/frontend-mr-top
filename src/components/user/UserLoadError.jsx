import { AlertCircle, RefreshCw } from 'lucide-react'

const glassCard =
  'rounded-[2rem] border border-white/50 bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-xl'

/**
 * Shown when B2C user data fetch fails while API is configured (strict mode — no mock fallback).
 */
export default function UserLoadError({ message, onRetry }) {
  return (
    <div
      className={`${glassCard} flex flex-col items-center gap-4 px-6 py-12 text-center sm:flex-row sm:text-left`}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 shrink-0 text-rose-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">Impossibile caricare i dati</p>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-2 rounded-[1.25rem] border border-teal-800/20 bg-teal-800/10 px-4 py-2 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-800/15"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Riprova
      </button>
    </div>
  )
}
