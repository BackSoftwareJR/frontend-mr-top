import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PrefetchRouteLink from '../../components/ui/PrefetchRouteLink'
import { ArrowLeft, Building2, KeyRound, Loader2, Mail } from 'lucide-react'
import { WenandoMark } from '../../components/ui/WenandoLogo'
import CodeInput from '../../components/auth/CodeInput'
import HumanVerification from '../../components/auth/HumanVerification'
import { b2bInputFocus, b2bLink, b2bPrimaryBtn } from '../../components/b2b/b2bStyles'
import { useAuth } from '../../context/AuthContext'
import {
  buildCaptchaPayload,
  getResendCooldown,
  resolveOtpRequestError,
  validateEmailForPortal,
} from '../../services/authService'
import { loginB2B } from '../../services/b2bAuthService'
import { getB2BRedirectPathAsync } from '../../services/b2bOnboardingService'
import { ApiError, isApiConfigured } from '../../services/apiClient'

const STEPS = { EMAIL: 'email', CAPTCHA: 'captcha', CODE: 'code' }
const MODES = { OTP: 'otp', PASSWORD: 'password' }

function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'•'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

export default function ProAccedi() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, userType, requestCode, login, establishSession, logout } = useAuth()

  const [authMode, setAuthMode] = useState(MODES.OTP)
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [captchaPayload, setCaptchaPayload] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [rateLimitRetry, setRateLimitRetry] = useState(0)
  const otpRequestInFlight = useRef(false)

  const redirectTarget = location.state?.from

  useEffect(() => {
    if (!isAuthenticated || userType !== 'b2b') return

    let cancelled = false

    getB2BRedirectPathAsync({ deepLink: redirectTarget })
      .then((target) => {
        if (!cancelled) navigate(target, { replace: true })
      })
      .catch(async (err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          await logout()
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, logout, navigate, redirectTarget, userType])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (rateLimitRetry <= 0) return
    const timer = setInterval(() => {
      setRateLimitRetry((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [rateLimitRetry])

  const applyOtpRequestFailure = (result) => {
    const errInfo = resolveOtpRequestError(result)
    if (errInfo?.retryAfterSeconds) {
      setRateLimitRetry(errInfo.retryAfterSeconds)
    }
    setError(errInfo?.message ?? result.error ?? 'Errore di connessione. Riprova.')
  }

  const navigateAfterLogin = async (session, apiRedirectTo) => {
    const target = await getB2BRedirectPathAsync({
      session,
      deepLink: apiRedirectTo ?? redirectTarget,
    })
    navigate(target, { replace: true })
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError('')
    const normalized = email.trim().toLowerCase()
    if (!normalized || !password) {
      setError('Inserisci email e password.')
      return
    }

    setLoading(true)
    try {
      const result = await loginB2B({ email: normalized, password })
      establishSession(result.session)
      await navigateAfterLogin(result.session, result.redirectTo)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[Wenando Pro] Password login failed:', err)
        setError('Login password non disponibile. Usa il codice OTP.')
      } else {
        setError(err.message ?? 'Credenziali non valide.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setError('')
    const normalized = email.trim().toLowerCase()
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Inserisci un indirizzo email valido.')
      return
    }
    const portalCheck = validateEmailForPortal(normalized, 'partner')
    if (!portalCheck.ok) {
      setError(portalCheck.error)
      return
    }
    setEmail(normalized)
    if (authMode === MODES.PASSWORD) return
    setStep(STEPS.CAPTCHA)
  }

  const handleCaptchaVerified = async (payload) => {
    if (otpRequestInFlight.current || loading || rateLimitRetry > 0) return
    otpRequestInFlight.current = true
    setCaptchaPayload(payload)
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(document.getElementById('pro-auth-form'))
      const result = await requestCode(email, buildCaptchaPayload(formData, payload), 'partner')

      if (!result.ok) {
        applyOtpRequestFailure(result)
        return
      }

      const cooldownMs = await getResendCooldown(result.email)
      setResendCooldown(Math.ceil(cooldownMs / 1000) || 60)
      setStep(STEPS.CODE)
    } catch (err) {
      if (isApiConfigured()) {
        if (err instanceof ApiError && err.code === 'RATE_LIMITED' && err.retryAfterSeconds) {
          setRateLimitRetry(err.retryAfterSeconds)
          setError(`Troppe richieste. Riprova tra ${err.retryAfterSeconds} secondi.`)
        } else {
          setError(err instanceof ApiError ? err.message : 'Errore di connessione. Riprova.')
        }
      } else {
        throw err
      }
    } finally {
      otpRequestInFlight.current = false
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

      if (result.session?.type !== 'b2b') {
        setError('Questa email non è associata a un account partner.')
        return
      }

      await navigateAfterLogin(result.session, result.redirectTo)
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
    if (resendCooldown > 0 || !captchaPayload || loading || rateLimitRetry > 0 || otpRequestInFlight.current) {
      return
    }
    otpRequestInFlight.current = true
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(document.getElementById('pro-auth-form'))
      const result = await requestCode(email, buildCaptchaPayload(formData, captchaPayload), 'partner')

      if (!result.ok) {
        applyOtpRequestFailure(result)
        return
      }

      setCode('')
      const cooldownMs = await getResendCooldown(result.email)
      setResendCooldown(Math.ceil(cooldownMs / 1000) || 60)
    } catch (err) {
      if (isApiConfigured()) {
        if (err instanceof ApiError && err.code === 'RATE_LIMITED' && err.retryAfterSeconds) {
          setRateLimitRetry(err.retryAfterSeconds)
          setError(`Troppe richieste. Riprova tra ${err.retryAfterSeconds} secondi.`)
        } else {
          setError(err instanceof ApiError ? err.message : 'Errore di connessione. Riprova.')
        }
      } else {
        throw err
      }
    } finally {
      otpRequestInFlight.current = false
      setLoading(false)
    }
  }

  const handleChallengeReady = useCallback((payload) => {
    setCaptchaPayload(payload)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-warm-cream">
      <div className="aurora-bg" aria-hidden="true">
        <span className="aurora-orb aurora-orb--coral" />
        <span className="aurora-orb aurora-orb--violet" />
        <span className="aurora-orb aurora-orb--amber" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Link to="/" aria-label="Torna alla home">
            <WenandoMark className="h-10 w-10" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium text-charcoal-muted shadow-sm backdrop-blur-md">
            <Building2 className="h-3.5 w-3.5 text-accent-coral" />
            Wenando Pro · Area Partner
          </span>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/75 p-6 shadow-lg backdrop-blur-2xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-charcoal">Accedi Area Partner</h1>
            <p className="mt-1.5 text-sm text-charcoal-muted">
              {step === STEPS.CODE
                ? `Codice inviato a ${maskEmail(email)}`
                : 'Email aziendale del partner per accedere alla dashboard B2B.'}
            </p>
          </div>

          <div className="mb-4 flex rounded-xl border border-black/5 bg-white/50 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode(MODES.OTP)
                setStep(STEPS.EMAIL)
                setError('')
              }}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                authMode === MODES.OTP ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-muted'
              }`}
            >
              Codice email
            </button>
            {isApiConfigured() && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode(MODES.PASSWORD)
                  setStep(STEPS.EMAIL)
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2 transition-colors ${
                  authMode === MODES.PASSWORD
                    ? 'bg-white text-charcoal shadow-sm'
                    : 'text-charcoal-muted'
                }`}
              >
                Password
              </button>
            )}
          </div>

          <form
            id="pro-auth-form"
            onSubmit={
              step === STEPS.CODE
                ? handleVerifyCode
                : authMode === MODES.PASSWORD
                  ? handlePasswordLogin
                  : handleEmailSubmit
            }
          >
            {step === STEPS.EMAIL && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="pro-email" className="mb-1.5 block text-xs font-medium text-charcoal-muted">
                    Email partner
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                    <input
                      id="pro-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="referente@struttura.it"
                      className={`w-full rounded-xl border border-black/5 bg-white/90 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/50 ${b2bInputFocus}`}
                    />
                  </div>
                </div>

                {authMode === MODES.PASSWORD && (
                  <div>
                    <label htmlFor="pro-password" className="mb-1.5 block text-xs font-medium text-charcoal-muted">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                      <input
                        id="pro-password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full rounded-xl border border-black/5 bg-white/90 py-3 pl-10 pr-4 text-sm text-charcoal ${b2bInputFocus}`}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className={`flex w-full items-center justify-center gap-2 ${b2bPrimaryBtn}`}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {authMode === MODES.PASSWORD ? 'Accedi' : 'Continua'}
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
                    disabled={loading || rateLimitRetry > 0}
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

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className={`flex w-full items-center justify-center gap-2 ${b2bPrimaryBtn}`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Accedi alla dashboard
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className={`text-sm ${b2bLink} disabled:cursor-not-allowed disabled:text-charcoal-muted`}
                  >
                    {resendCooldown > 0
                      ? `Reinvia codice tra ${resendCooldown}s`
                      : 'Reinvia codice'}
                  </button>
                  <p className="mt-2 text-xs text-charcoal-muted">Il codice scade tra 10 minuti</p>
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

        <p className="mt-6 text-center text-xs text-charcoal-muted">
          Nuovo partner?{' '}
          <PrefetchRouteLink to="/pro/registrati" className={b2bLink}>
            Registrati
          </PrefetchRouteLink>
          {' · '}
          Sei un utente?{' '}
          <Link to="/accedi" className={b2bLink}>
            Accedi qui
          </Link>
        </p>
      </div>
    </div>
  )
}
