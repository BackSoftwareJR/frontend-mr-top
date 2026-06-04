import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import AuroraBackground from '../components/layout/AuroraBackground'
import { WenandoMark } from '../components/ui/WenandoLogo'
import CodeInput from '../components/auth/CodeInput'
import HumanVerification from '../components/auth/HumanVerification'
import { b2bInputFocus, b2bLink, b2bPrimaryBtn } from '../components/b2b/b2bStyles'
import { useAuth } from '../context/AuthContext'
import { shouldShowOtpDevHint } from '../services/authApiUtils'
import { ApiError, isApiConfigured } from '../services/apiClient'
import {
  buildCaptchaPayload,
  getResendCooldown,
  validateEmailForPortal,
} from '../services/authService'

const STEPS = { EMAIL: 'email', CAPTCHA: 'captcha', CODE: 'code' }

function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'•'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

export default function Accedi() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, userType, requestCode, login } = useAuth()

  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [captchaPayload, setCaptchaPayload] = useState(null)
  const [devCode, setDevCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const redirectTarget = location.state?.from || '/area-personale'

  useEffect(() => {
    if (isAuthenticated && userType === 'consumer') {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTarget, userType])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setError('')
    const normalized = email.trim().toLowerCase()
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Inserisci un indirizzo email valido.')
      return
    }
    const portalCheck = validateEmailForPortal(normalized, 'consumer')
    if (!portalCheck.ok) {
      setError(portalCheck.error)
      return
    }
    setEmail(normalized)
    setStep(STEPS.CAPTCHA)
  }

  const handleCaptchaVerified = async (payload) => {
    setCaptchaPayload(payload)
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(document.getElementById('auth-form'))
      const result = await requestCode(email, buildCaptchaPayload(formData, payload))

      if (!result.ok) {
        setError(result.error)
        return
      }

      setDevCode(result.devCode ?? null)
      const cooldownMs = await getResendCooldown(result.email)
      setResendCooldown(Math.ceil(cooldownMs / 1000) || 60)
      setStep(STEPS.CODE)
    } catch (err) {
      if (isApiConfigured()) {
        setError(err instanceof ApiError ? err.message : 'Errore di connessione. Riprova.')
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Inserisci il codice a 6 cifre.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await login(email, code)

      if (!result.ok) {
        setError(result.error)
        return
      }

      navigate(result.redirectTo || redirectTarget, { replace: true })
    } catch (err) {
      if (isApiConfigured()) {
        setError(err instanceof ApiError ? err.message : 'Errore di connessione. Riprova.')
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !captchaPayload) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(document.getElementById('auth-form'))
      const result = await requestCode(email, buildCaptchaPayload(formData, captchaPayload))

      if (!result.ok) {
        setError(result.error)
        return
      }

      setDevCode(result.devCode ?? null)
      setCode('')
      const cooldownMs = await getResendCooldown(result.email)
      setResendCooldown(Math.ceil(cooldownMs / 1000) || 60)
    } catch (err) {
      if (isApiConfigured()) {
        setError(err instanceof ApiError ? err.message : 'Errore di connessione. Riprova.')
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChallengeReady = useCallback((payload) => {
    setCaptchaPayload(payload)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" aria-label="Torna alla home">
            <WenandoMark className="h-12 w-12" />
          </Link>
        </div>

        <div className="glass-strong w-full max-w-md rounded-3xl p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Accedi</h1>
            <p className="mt-1.5 text-sm text-charcoal-muted">
              {step === STEPS.CODE
                ? `Ti abbiamo inviato un codice a ${maskEmail(email)}`
                : 'Inserisci la tua email per ricevere un codice di accesso.'}
            </p>
            {step === STEPS.CODE && (
              <p className="mt-2 text-xs text-charcoal-muted/80">
                Non trovi l&apos;email? Controlla spam o promozioni, poi usa &quot;Reinvia codice&quot;.
              </p>
            )}
          </div>

          <form id="auth-form" onSubmit={step === STEPS.CODE ? handleVerifyCode : handleEmailSubmit}>
            {step === STEPS.EMAIL && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-charcoal-muted">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@esempio.it"
                      className={`w-full rounded-xl bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-charcoal ring-1 ring-black/5 transition-shadow placeholder:text-slate-400 ${b2bInputFocus}`}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className={`w-full ${b2bPrimaryBtn}`}>
                  Continua
                </button>
              </div>
            )}

            {step === STEPS.CAPTCHA && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-accent-coral" />
                  </div>
                ) : (
                  <HumanVerification
                    onVerified={handleCaptchaVerified}
                    onChallengeReady={handleChallengeReady}
                  />
                )}
                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === STEPS.CODE && (
              <div className="space-y-6">
                <CodeInput value={code} onChange={setCode} disabled={loading} error={error} />

                {shouldShowOtpDevHint(devCode) && (
                  <div className="rounded-2xl bg-accent-coral/10 px-4 py-3 text-center ring-1 ring-accent-coral/20">
                    <p className="text-xs font-medium text-accent-coral-dark">
                      Modalità sviluppo — codice:{' '}
                      <span className="font-mono text-sm font-bold">{devCode}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className={`flex w-full items-center justify-center gap-2 ${b2bPrimaryBtn}`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Accedi
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className={`text-sm ${b2bLink} disabled:cursor-not-allowed disabled:text-charcoal-muted/50`}
                  >
                    {resendCooldown > 0
                      ? `Reinvia codice tra ${resendCooldown}s`
                      : 'Reinvia codice'}
                  </button>
                  <p className="mt-2 text-xs text-charcoal-muted/70">
                    Il codice scade tra 10 minuti. Controlla anche la cartella spam.
                  </p>
                </div>
              </div>
            )}
          </form>

          {step !== STEPS.EMAIL && (
            <button
              type="button"
              onClick={() => {
                setStep(STEPS.EMAIL)
                setError('')
                setCode('')
              }}
              className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-accent-coral"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cambia email
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-charcoal-muted/70">
          Demo utente: <span className="font-medium text-charcoal-muted">user@example.com</span>
        </p>
      </div>
    </div>
  )
}
