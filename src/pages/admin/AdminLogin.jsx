import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Shield } from 'lucide-react'
import { WenandoMark } from '../../components/ui/WenandoLogo'
import CodeInput from '../../components/auth/CodeInput'
import HumanVerification from '../../components/auth/HumanVerification'
import { useAuth } from '../../context/AuthContext'
import {
  buildCaptchaPayload,
  getResendCooldown,
  validateEmailForPortal,
} from '../../services/authService'
import { getBearerToken } from '../../services/apiClient'

const STEPS = { EMAIL: 'email', CAPTCHA: 'captcha', CODE: 'code' }

function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'•'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

export default function AdminLogin() {
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

  const redirectTarget = location.state?.from || '/admin'

  useEffect(() => {
    if (isAuthenticated && userType === 'superadmin' && getBearerToken()) {
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
    const portalCheck = validateEmailForPortal(normalized, 'admin')
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

    const formData = new FormData(document.getElementById('admin-auth-form'))
    const result = await requestCode(email, buildCaptchaPayload(formData, payload), 'admin')

    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDevCode(result.devCode ?? null)
    setResendCooldown(Math.ceil((await getResendCooldown(result.email)) / 1000) || 60)
    setStep(STEPS.CODE)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Inserisci il codice a 6 cifre.')
      return
    }

    setLoading(true)
    setError('')
    const result = await login(email, code)
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (result.session?.type !== 'superadmin') {
      setError('Accesso riservato agli amministratori.')
      return
    }

    navigate(redirectTarget, { replace: true })
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !captchaPayload) return
    setLoading(true)
    setError('')
    const formData = new FormData(document.getElementById('admin-auth-form'))
    const result = await requestCode(email, buildCaptchaPayload(formData, captchaPayload), 'admin')
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setDevCode(result.devCode ?? null)
    setCode('')
    setResendCooldown(60)
  }

  const handleChallengeReady = useCallback((payload) => {
    setCaptchaPayload(payload)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Link to="/" aria-label="Torna alla home">
            <WenandoMark className="h-10 w-10" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
            <Shield className="h-3.5 w-3.5" />
            God Mode · Super Admin
          </span>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Accesso amministratore</h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              {step === STEPS.CODE
                ? `Codice inviato a ${maskEmail(email)}`
                : 'Email autorizzata per la console God Mode.'}
            </p>
          </div>

          <form
            id="admin-auth-form"
            onSubmit={step === STEPS.CODE ? handleVerifyCode : handleEmailSubmit}
          >
            {step === STEPS.EMAIL && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Email admin
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@wenando.it"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-400" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Continua
                </button>
              </div>
            )}

            {step === STEPS.CAPTCHA && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  </div>
                ) : (
                  <HumanVerification
                    onVerified={handleCaptchaVerified}
                    onChallengeReady={handleChallengeReady}
                  />
                )}
                {error && (
                  <p className="text-sm font-medium text-red-400" role="alert">
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === STEPS.CODE && (
              <div className="space-y-6">
                <CodeInput value={code} onChange={setCode} disabled={loading} error={error} />

                {import.meta.env.DEV && devCode && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-center">
                    <p className="text-xs font-medium text-cyan-400">
                      Sviluppo — codice:{' '}
                      <span className="font-mono text-sm font-bold">{devCode}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Accedi a God Mode
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm text-cyan-400 disabled:text-zinc-600"
                  >
                    {resendCooldown > 0
                      ? `Reinvia codice tra ${resendCooldown}s`
                      : 'Reinvia codice'}
                  </button>
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
              className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cambia email
            </button>
          )}
        </div>

        {import.meta.env.DEV && (
          <p className="mt-6 text-center text-xs text-zinc-500">
            Demo: <span className="text-zinc-300">admin@wenando.it</span>
          </p>
        )}
      </div>
    </div>
  )
}
