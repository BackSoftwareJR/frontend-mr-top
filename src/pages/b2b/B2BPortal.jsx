import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PrefetchRouteLink from '../../components/ui/PrefetchRouteLink'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, LogIn, UserPlus } from 'lucide-react'
import { WenandoMark } from '../../components/ui/WenandoLogo'
import B2BOnboardingShell from '../../components/b2b/B2BOnboardingShell'
import { useAuth } from '../../context/AuthContext'
import {
  clearAutoDemo,
  fetchOnboardingStatusAsync,
  getB2BRedirectPathAsync,
} from '../../services/b2bOnboardingService'
import {
  obBadge,
  obCard,
  obHeading,
  obLink,
  obSubheading,
} from '../../components/b2b/onboardingStyles'

export default function B2BPortal() {
  const navigate = useNavigate()
  const { isAuthenticated, userType, userEmail } = useAuth()

  useEffect(() => {
    clearAutoDemo()
  }, [])

  useEffect(() => {
    if (!isAuthenticated || userType !== 'b2b') return

    let cancelled = false

    getB2BRedirectPathAsync().then((target) => {
      if (!cancelled && target === '/pro/dashboard') {
        navigate(target, { replace: true })
      }
    })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, navigate, userType])

  const [onboardingStatus, setOnboardingStatus] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || userType !== 'b2b') return

    let cancelled = false

    fetchOnboardingStatusAsync(userEmail).then((payload) => {
      if (!cancelled) setOnboardingStatus(payload.status)
    })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userEmail, userType])
  const canResumeOnboarding =
    isAuthenticated &&
    userType === 'b2b' &&
    (onboardingStatus === 'in_progress' || onboardingStatus === 'pending_review')

  return (
    <B2BOnboardingShell className="flex min-h-screen flex-col">
      <header className="border-b border-black/5 bg-white/60 px-4 py-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <WenandoMark className="h-9 w-9" />
            <span className="text-sm font-semibold text-charcoal">Wenando Pro</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-charcoal-muted transition-colors hover:text-accent-coral"
          >
            Torna al sito
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className={obBadge}>
            <Building2 className="h-3.5 w-3.5 text-accent-coral" />
            Area Partner B2B
          </span>
          <h1 className={`${obHeading} mt-6`}>
            <span className="text-gradient-multicolor">Partner</span> Wenando Pro
          </h1>
          <p className={obSubheading}>
            Scegli come entrare: nuova registrazione (poi onboarding guidato) oppure accesso per
            partner già verificati.
          </p>
        </motion.div>

        <div className="mt-10 grid w-full max-w-lg gap-4">
          {canResumeOnboarding && (
            <PrefetchRouteLink
              to="/pro/onboarding"
              className={`${obCard} group block border-accent-coral/20 text-left transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal-dark ring-1 ring-accent-teal/20">
                  <ArrowRight className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-charcoal">Continua onboarding</p>
                  <p className="mt-1 text-sm text-charcoal-muted">
                    Riprendi da dove avevi lasciato (navigazione manuale tra gli step).
                  </p>
                </div>
              </div>
            </PrefetchRouteLink>
          )}

          <PrefetchRouteLink
            to="/pro/registrati"
            className={`${obCard} group block text-left transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-coral/15 text-accent-coral ring-1 ring-accent-coral/20">
                <UserPlus className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-charcoal">Registrati come Partner</p>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Crea l&apos;account, poi completa Identità, Operatività e Trust Test.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-coral group-hover:text-accent-coral-dark">
                  Inizia registrazione
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </PrefetchRouteLink>

          <PrefetchRouteLink
            to="/pro/accedi"
            className={`${obCard} group block text-left transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet-dark ring-1 ring-accent-violet/20">
                <LogIn className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-charcoal">Accedi</p>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Accedi con l&apos;email aziendale del partner già registrato.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-charcoal-muted group-hover:text-charcoal">
                  Vai al login
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </PrefetchRouteLink>
        </div>

        <p className="mt-10 text-center text-xs text-charcoal-muted">
          Utente privato?{' '}
          <Link to="/accedi" className={obLink}>
            Area personale
          </Link>
        </p>
      </main>
    </B2BOnboardingShell>
  )
}
