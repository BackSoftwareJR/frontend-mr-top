import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AuroraBackground from '../layout/AuroraBackground'
import WenandoLogo from '../ui/WenandoLogo'

export default function LegalLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
        <div className="rounded-2xl border border-slate-200/50 bg-white/75 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          {children}
        </div>
        <nav
          className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-charcoal-muted"
          aria-label="Collegamenti legali"
        >
          <Link to="/privacy" className="hover:text-teal-800">
            Privacy
          </Link>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <Link to="/cookies" className="hover:text-teal-800">
            Cookie
          </Link>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <Link to="/terms" className="hover:text-teal-800">
            Termini B2C
          </Link>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <Link to="/terms-partners" className="hover:text-teal-800">
            Termini Partner
          </Link>
        </nav>
      </div>
    </div>
  )
}
