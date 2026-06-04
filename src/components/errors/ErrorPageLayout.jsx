import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AuroraBackground from '../layout/AuroraBackground'
import MagneticButton from '../ui/MagneticButton'
import WenandoLogo from '../ui/WenandoLogo'

export default function ErrorPageLayout({ children, showLegalLinks = true }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Torna alla home
          </Link>
          <Link to="/" className="opacity-90 transition-opacity hover:opacity-100">
            <WenandoLogo size="sm" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/50 bg-white/80 p-8 shadow-sm backdrop-blur-xl sm:p-10">
          {children}
        </div>

        {showLegalLinks && (
          <nav
            className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-charcoal-muted"
            aria-label="Collegamenti utili"
          >
            <Link to="/wizard" className="hover:text-teal-800">
              Avvia ricerca
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link to="/accedi" className="hover:text-teal-800">
              Accedi
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link to="/privacy" className="hover:text-teal-800">
              Privacy
            </Link>
          </nav>
        )}
      </div>
    </div>
  )
}

export function ErrorPageActions({ onRetry, retryLabel = 'Riprova' }) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <MagneticButton to="/" variant="outline-coral" className="w-full sm:w-auto">
        Torna alla home
      </MagneticButton>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-full border border-slate-200/80 bg-white/90 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-teal-200 hover:text-teal-800 sm:w-auto"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
