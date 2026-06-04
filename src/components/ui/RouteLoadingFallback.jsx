import { Loader2 } from 'lucide-react'

/**
 * Branded loading shell for route lazy chunks and async gates — avoids blank white screens.
 */
export default function RouteLoadingFallback({
  label = 'Caricamento…',
  inline = false,
  className = '',
}) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${inline ? 'py-16' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-teal-800" aria-hidden />
      <p className="text-sm font-medium text-charcoal-muted">{label}</p>
    </div>
  )

  if (inline) {
    return <div className={className}>{content}</div>
  }

  return (
    <div className={`relative min-h-screen bg-warm-cream ${className}`}>
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-orb aurora-orb--coral" />
        <span className="aurora-orb aurora-orb--violet" />
        <span className="aurora-orb aurora-orb--amber" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">{content}</div>
    </div>
  )
}
