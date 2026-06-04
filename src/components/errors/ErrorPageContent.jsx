import { AlertTriangle, Clock, Compass, ShieldAlert } from 'lucide-react'
import { resolveErrorPage } from '../../constants/errorPages'
import ErrorPageLayout, { ErrorPageActions } from './ErrorPageLayout'

const ICONS = {
  compass: Compass,
  shield: ShieldAlert,
  alert: AlertTriangle,
  clock: Clock,
}

export default function ErrorPageContent({ code, onRetry }) {
  const page = resolveErrorPage(code)
  const Icon = ICONS[page.icon] ?? Compass

  return (
    <ErrorPageLayout>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-coral">
          Errore {page.code}
        </p>
        <div
          className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 ring-1 ring-teal-100"
          aria-hidden
        >
          <Icon className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-muted sm:text-base">{page.message}</p>
        <ErrorPageActions onRetry={onRetry} />
      </div>
    </ErrorPageLayout>
  )
}
