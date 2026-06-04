import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Mail } from 'lucide-react'
import { WenandoMark } from '../../components/ui/WenandoLogo'
import B2BOnboardingShell from '../../components/b2b/B2BOnboardingShell'
import {
  obBadge,
  obGlassPanel,
  obHeading,
  obInput,
  obLabel,
  obLink,
  obPrimaryBtn,
  obSubheading,
} from '../../components/b2b/onboardingStyles'
import {
  B2B_PRIVACY_CONSENT_UI,
  buildB2bRegisterPayload,
} from '../../constants/b2bConsent'
import { ApiError } from '../../services/apiClient'
import {
  clearAutoDemo,
  DEMO_ONBOARDING_DATA,
  getB2BRedirectPathAsync,
  registerB2BPartnerAsync,
  restartAutoDemoTour,
  saveOnboardingData,
} from '../../services/b2bOnboardingService'

export default function Register() {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const [email, setEmail] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalized = email.trim().toLowerCase()
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Inserisci un indirizzo email valido.')
      return
    }
    if (!organizationName.trim() || !legalName.trim()) {
      setError('Compila tutti i campi.')
      return
    }
    if (!privacyAccepted) {
      setError('Devi accettare l\'Informativa sulla Privacy per registrarti.')
      return
    }

    setLoading(true)
    clearAutoDemo()
    restartAutoDemoTour()

    try {
      const session = await registerB2BPartnerAsync({
        email: normalized,
        organizationName,
        legalName,
        ...buildB2bRegisterPayload(),
      })
      saveOnboardingData(normalized, DEMO_ONBOARDING_DATA)
      establishSession(session)
      const target = await getB2BRedirectPathAsync({ session })
      navigate(target, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : (err?.message ?? 'Registrazione non riuscita.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <B2BOnboardingShell className="flex flex-col">
      <header className="border-b border-black/5 bg-white/60 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            to="/pro"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-accent-coral"
          >
            <ArrowLeft className="h-4 w-4" />
            Indietro
          </Link>
          <WenandoMark className="h-9 w-9" />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <motion.div
          className={`${obGlassPanel} w-full max-w-md p-6 sm:p-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 text-center">
            <span className={obBadge}>
              <Building2 className="h-3.5 w-3.5 text-accent-coral" />
              Wenando Pro · Partner
            </span>
            <h1 className={`${obHeading} mt-4 text-xl sm:text-2xl`}>Registrazione partner</h1>
            <p className={obSubheading}>
              Clicca <strong className="font-semibold text-charcoal">Continua</strong> per creare
              l&apos;account e aprire subito l&apos;onboarding guidato.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className={obLabel}>
                Email aziendale
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="referente@struttura.it"
                  className={`${obInput} pl-11`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-org" className={obLabel}>
                Nome Struttura
              </label>
              <input
                id="reg-org"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="es. Casa Serena"
                className={obInput}
              />
            </div>

            <div>
              <label htmlFor="reg-legal" className={obLabel}>
                Ragione Sociale
              </label>
              <input
                id="reg-legal"
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="es. Casa Serena S.r.l."
                className={obInput}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-800/20"
              />
              <span className="text-sm text-charcoal">
                {B2B_PRIVACY_CONSENT_UI.prefix}
                <Link
                  to={B2B_PRIVACY_CONSENT_UI.link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-800 underline-offset-2 hover:underline"
                >
                  {B2B_PRIVACY_CONSENT_UI.link.text}
                </Link>
                {B2B_PRIVACY_CONSENT_UI.suffix}
              </span>
            </label>

            {error && (
              <p
                className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !privacyAccepted} className={obPrimaryBtn}>
              {loading ? (
                'Apertura onboarding…'
              ) : (
                <>
                  Continua
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-muted">
            Hai già un account?{' '}
            <Link to="/pro/accedi" className={obLink}>
              Accedi
            </Link>
          </p>
        </motion.div>
      </main>
    </B2BOnboardingShell>
  )
}
