import { AlertCircle, RefreshCw } from 'lucide-react'
import { b2bCard, b2bPrimaryBtn } from './b2bStyles'

/**
 * Shown when B2B data fetch fails while API is configured (strict mode — no mock fallback).
 */
export default function B2BLoadError({ message, onRetry }) {
  return (
    <div
      className={`${b2bCard} flex flex-col items-center gap-4 px-6 py-12 text-center sm:flex-row sm:text-left`}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 shrink-0 text-accent-coral" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-charcoal">Impossibile caricare i dati</p>
        <p className="mt-1 text-sm text-charcoal-muted">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={`inline-flex shrink-0 items-center gap-2 ${b2bPrimaryBtn}`}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Riprova
      </button>
    </div>
  )
}
