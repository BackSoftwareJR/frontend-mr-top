import { Eye, X } from 'lucide-react'
import {
  clearImpersonation,
  getImpersonationSession,
  isImpersonating,
} from '../../services/impersonationService'

export default function ImpersonationBanner() {
  if (!isImpersonating()) return null

  const session = getImpersonationSession()
  const partnerLabel = session?.name ?? session?.email ?? 'partner'

  const handleEnd = () => {
    clearImpersonation()
    try {
      window.close()
    } catch {
      // ignore — popup blockers or non-script-opened tabs
    }
    window.location.assign('/pro/accedi')
  }

  return (
    <div
      data-testid="impersonation-banner"
      role="status"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-300/50 bg-cyan-50/90 px-4 py-3 text-sm text-cyan-950 backdrop-blur-md"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Eye className="h-4 w-4 shrink-0 text-cyan-700" aria-hidden />
        <span>
          <span className="font-semibold">Modalità impersonation</span>
          {' — '}
          stai visualizzando il portale come{' '}
          <span className="font-medium">{partnerLabel}</span>
          {session?.email ? (
            <span className="text-cyan-800/80"> ({session.email})</span>
          ) : null}
        </span>
      </div>
      <button
        type="button"
        onClick={handleEnd}
        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-600/30 bg-white/80 px-3 py-1 text-xs font-semibold text-cyan-900 transition-colors hover:bg-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Termina impersonation
      </button>
    </div>
  )
}
