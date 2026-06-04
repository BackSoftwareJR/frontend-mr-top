import { useMemo } from 'react'
import { bootstrapImpersonationFromHash } from '../../services/impersonationService'

/**
 * One-shot bootstrap: reads impersonation token from URL hash into sessionStorage,
 * then hard-redirects to B2B dashboard (full reload so AuthContext picks up tab-local session).
 */
export default function ImpersonateBootstrap() {
  const bootstrapped = useMemo(() => bootstrapImpersonationFromHash(), [])

  if (bootstrapped) {
    window.location.replace('/pro/dashboard')
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        Apertura portale partner…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
      Link di impersonation non valido o scaduto.
    </div>
  )
}
