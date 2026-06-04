import { useCallback, useEffect, useReducer, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import B2BLoadError from '../../components/b2b/B2BLoadError'
import OnboardingLayout from '../../components/b2b/OnboardingLayout'
import RouteLoadingFallback from '../../components/ui/RouteLoadingFallback'
import StepLegal from '../../components/b2b/onboarding/StepLegal'
import StepOperations from '../../components/b2b/onboarding/StepOperations'
import StepCoverageZone from '../../components/b2b/onboarding/StepCoverageZone'
import StepTrustTest from '../../components/b2b/onboarding/StepTrustTest'
import PendingReview from '../../components/b2b/onboarding/PendingReview'
import RejectedReview from '../../components/b2b/onboarding/RejectedReview'
import SuspendedReview from '../../components/b2b/onboarding/SuspendedReview'
import { obGlassCard, obPrimaryBtn, obSecondaryBtn } from '../../components/b2b/onboardingStyles'
import { getSession } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useB2BOnboardingGate } from '../../components/auth/ProtectedRoute'
import {
  B2B_TERMS_CONSENT_UI,
  buildB2bOnboardingSubmitPayload,
} from '../../constants/b2bConsent'
import { isApiConfigured } from '../../services/apiClient'
import {
  clearAutoDemo,
  getOnboardingData,
  getRegistration,
  loadOnboardingDataAsync,
  saveOnboardingDataAsync,
  submitOnboardingForReviewAsync,
  uploadOnboardingDocumentAsync,
} from '../../services/b2bOnboardingService'
import { ApiError } from '../../services/apiClient'
import { trustQuestionsComplete } from '../../utils/b2bTrustQuestions'
import {
  isCoverageZoneComplete,
  saveCoverageZone,
} from '../../services/coverageZoneService'

const STEP_META = [
  {
    title: 'Identità legale',
    subtitle: 'Partita IVA, SDI e documenti ufficiali per la verifica partner.',
  },
  {
    title: 'Operatività',
    subtitle: 'Configura orari, slot e parametri specifici del tuo settore.',
  },
  {
    title: 'Zona di copertura',
    subtitle: 'Indica l\'area geografica in cui la struttura può operare.',
  },
  {
    title: 'Trust Test',
    subtitle: 'Questionario su standard di qualità e procedure operative.',
  },
  {
    title: 'Revisione',
    subtitle: 'Controlla i dati e invia il profilo per approvazione.',
  },
]

const SECTOR_LABELS = {
  rsa: 'RSA / Residenza',
  adi: 'Assistenza domiciliare',
  centro: 'Centro diurno',
  clinica: 'Clinica / Ambulatorio',
}

function canProceed(stepIndex, data, trustQuestions) {
  if (stepIndex === 0) {
    return Boolean(data.vat?.trim() && data.sdi?.trim() && data.visura && data.identityDoc)
  }
  if (stepIndex === 1) {
    const dyn = data.dynamic ?? {}
    const hasSector = Boolean(dyn.sector)
    const hasSchedule = Object.values(data.schedule ?? {}).some((d) => d.open && d.slots?.trim())
    return hasSector && hasSchedule
  }
  if (stepIndex === 2) {
    return isCoverageZoneComplete(data.coverageZone)
  }
  if (stepIndex === 3) {
    return trustQuestionsComplete(trustQuestions, data.trustAnswers)
  }
  return true
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { isAuthenticated, userType, userEmail } = useAuth()
  const registration = getRegistration()
  const email = userEmail || registration?.email

  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState(() => (email ? getOnboardingData(email) : {}))
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [statusTick, bumpStatus] = useReducer((n) => n + 1, 0)
  const [loadRetry, bumpLoadRetry] = useReducer((n) => n + 1, 0)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [stepSaving, setStepSaving] = useState(false)
  const [stepError, setStepError] = useState(null)
  const [retrySeconds, setRetrySeconds] = useState(null)
  const [trustQuestions, setTrustQuestions] = useState([])
  const [documentUpload, setDocumentUpload] = useState({
    visura: { loading: false, progress: 0, error: null },
    identityDoc: { loading: false, progress: 0, error: null },
  })

  const onboardingGate = useB2BOnboardingGate(email, statusTick)
  const status = onboardingGate.status

  useEffect(() => {
    clearAutoDemo()
  }, [])

  useEffect(() => {
    const session = getSession()
    const hasB2BAccess =
      (isAuthenticated && userType === 'b2b') || session?.type === 'b2b'

    if (!hasB2BAccess) {
      navigate('/pro', { replace: true })
    }
  }, [isAuthenticated, navigate, userType])

  useEffect(() => {
    if (!email) return
    let cancelled = false
    loadOnboardingDataAsync(email)
      .then((loaded) => {
        if (!cancelled) {
          if (loaded) setData(loaded)
          setLoadError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.message ?? 'Impossibile caricare i dati onboarding.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, loadRetry])

  useEffect(() => {
    if (!retrySeconds || retrySeconds <= 0) return undefined
    const timer = setTimeout(() => {
      setRetrySeconds((seconds) => (seconds !== null && seconds > 1 ? seconds - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [retrySeconds])

  const handleTrustQuestionsLoaded = useCallback((questions) => {
    setTrustQuestions(questions)
  }, [])

  const persist = useCallback(
    (patch) => {
      if (!email) return
      const next = { ...data, ...patch }
      setData(next)
      saveOnboardingDataAsync(email, next)
    },
    [data, email]
  )

  const handleDocumentUpload = useCallback(
    async (field, file) => {
      if (!email) return

      if (!file) {
        const patch = { [field]: null }
        setData((prev) => ({ ...prev, ...patch }))
        saveOnboardingDataAsync(email, { ...data, ...patch })
        setDocumentUpload((prev) => ({
          ...prev,
          [field]: { loading: false, progress: 0, error: null },
        }))
        return
      }

      setDocumentUpload((prev) => ({
        ...prev,
        [field]: { loading: true, progress: 0, error: null },
      }))

      try {
        await uploadOnboardingDocumentAsync(email, field, file, {
          onProgress: (progress) => {
            setDocumentUpload((prev) => ({
              ...prev,
              [field]: { ...prev[field], progress },
            }))
          },
        })
        const loaded = await loadOnboardingDataAsync(email)
        if (loaded) setData(loaded)
        setDocumentUpload((prev) => ({
          ...prev,
          [field]: { loading: false, progress: 100, error: null },
        }))
      } catch (err) {
        const message =
          err?.message ?? 'Caricamento non riuscito. Verifica formato (PDF/JPG/PNG) e dimensione (max 10 MB).'
        setDocumentUpload((prev) => ({
          ...prev,
          [field]: { loading: false, progress: 0, error: message },
        }))
      }
    },
    [data, email],
  )

  const session = getSession()
  const hasB2BAccess =
    (isAuthenticated && userType === 'b2b') || session?.type === 'b2b'

  if (!hasB2BAccess) {
    return (
      <OnboardingLayout currentStepIndex={0} title="" subtitle="">
        <RouteLoadingFallback inline label="Verifica accesso partner…" />
      </OnboardingLayout>
    )
  }

  if (onboardingGate.loading) {
    return (
      <OnboardingLayout currentStepIndex={0} title="" subtitle="">
        <RouteLoadingFallback inline label="Caricamento onboarding…" />
      </OnboardingLayout>
    )
  }

  const gateError = isApiConfigured() ? onboardingGate.error : null
  const dataLoadError = isApiConfigured() ? loadError : null

  if (gateError || dataLoadError) {
    const message = gateError ?? dataLoadError
    const retry = () => {
      setLoadError(null)
      bumpStatus()
      bumpLoadRetry()
    }
    return (
      <OnboardingLayout currentStepIndex={0} title="" subtitle="">
        <B2BLoadError message={message} onRetry={retry} />
      </OnboardingLayout>
    )
  }

  if (status === 'approved') {
    return <Navigate to={onboardingGate.redirectTo ?? '/pro/dashboard'} replace />
  }

  if (status === 'pending_review') {
    return (
      <OnboardingLayout currentStepIndex={4} title="" subtitle="">
        <PendingReview email={email} />
      </OnboardingLayout>
    )
  }

  if (status === 'rejected') {
    return (
      <OnboardingLayout currentStepIndex={4} title="" subtitle="">
        <RejectedReview email={email} rejectionReason={onboardingGate.rejectionReason} />
      </OnboardingLayout>
    )
  }

  if (status === 'suspended') {
    return (
      <OnboardingLayout currentStepIndex={4} title="" subtitle="">
        <SuspendedReview email={email} />
      </OnboardingLayout>
    )
  }

  const meta = STEP_META[stepIndex]

  const handleContinue = async () => {
    if (!canProceed(stepIndex, data, trustQuestions) || stepSaving) return

    if (stepIndex === 2 && data.coverageZone) {
      setStepError(null)
      setStepSaving(true)
      try {
        const saved = await saveCoverageZone(data.coverageZone)
        persist({ coverageZone: saved })
        setStepIndex((index) => index + 1)
      } catch (err) {
        setStepError(err?.message ?? 'Impossibile salvare la zona di copertura.')
      } finally {
        setStepSaving(false)
      }
      return
    }

    setStepIndex((index) => index + 1)
  }

  const handleSubmitReview = async () => {
    if (!termsAccepted || submitting || retrySeconds) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await submitOnboardingForReviewAsync(email, buildB2bOnboardingSubmitPayload())
      bumpStatus()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'RATE_LIMITED' && err.retryAfterSeconds) {
        setRetrySeconds(err.retryAfterSeconds)
        setSubmitError(`Troppe richieste. Riprova tra ${err.retryAfterSeconds} secondi.`)
      } else if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Invio non riuscito. Riprova.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={() => (stepIndex > 0 ? setStepIndex((i) => i - 1) : navigate('/pro'))}
        className={`${obSecondaryBtn} sm:!w-auto sm:min-w-[140px]`}
      >
        <ArrowLeft className="h-4 w-4" />
        {stepIndex === 0 ? 'Esci' : 'Indietro'}
      </button>

      {stepIndex < 4 ? (
        <button
          type="button"
          disabled={!canProceed(stepIndex, data, trustQuestions) || stepSaving}
          onClick={handleContinue}
          className={`${obPrimaryBtn} sm:!w-auto sm:min-w-[160px]`}
        >
          {stepSaving ? 'Salvataggio…' : 'Continua'}
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={!termsAccepted || submitting || Boolean(retrySeconds)}
          onClick={handleSubmitReview}
          className={`${obPrimaryBtn} sm:!w-auto sm:min-w-[200px] disabled:opacity-60`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {submitting
            ? 'Invio in corso…'
            : retrySeconds
              ? `Attendi ${retrySeconds}s`
              : 'Invia per revisione'}
        </button>
      )}
    </div>
  )

  return (
    <OnboardingLayout
      currentStepIndex={stepIndex}
      title={meta.title}
      subtitle={meta.subtitle}
      footer={footer}
    >
      {stepIndex === 0 && (
        <StepLegal
          data={data}
          onChange={persist}
          onDocumentUpload={handleDocumentUpload}
          documentUpload={documentUpload}
        />
      )}
      {stepIndex === 1 && <StepOperations data={data} onChange={persist} />}
      {stepIndex === 2 && (
        <StepCoverageZone
          value={data.coverageZone}
          onChange={(coverageZone) => persist({ coverageZone })}
        />
      )}
      {stepIndex === 3 && (
        <StepTrustTest
          key={data.dynamic?.sector ?? 'none'}
          sector={data.dynamic?.sector}
          answers={data.trustAnswers ?? {}}
          onQuestionsLoaded={handleTrustQuestionsLoaded}
          onChange={(patch) =>
            persist({ trustAnswers: { ...(data.trustAnswers ?? {}), ...patch } })
          }
        />
      )}
      {stepIndex === 4 && (
        <div className="space-y-4">
          <div className={obGlassCard}>
            <h3 className="text-sm font-semibold text-charcoal">Riepilogo invio</h3>
            <ul className="mt-4 space-y-3 text-sm text-charcoal-muted">
              <li className="flex justify-between gap-4 rounded-xl bg-warm-cream/80 px-3 py-2">
                <span className="font-medium text-charcoal">P.IVA</span>
                <span>{data.vat || '—'}</span>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-warm-cream/80 px-3 py-2">
                <span className="font-medium text-charcoal">SDI</span>
                <span>{data.sdi || '—'}</span>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-warm-cream/80 px-3 py-2">
                <span className="font-medium text-charcoal">Settore</span>
                <span>{SECTOR_LABELS[data.dynamic?.sector] ?? data.dynamic?.sector ?? '—'}</span>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-warm-cream/80 px-3 py-2">
                <span className="font-medium text-charcoal">Zona di copertura</span>
                <span>
                  {data.coverageZone?.label ||
                    (data.coverageZone?.radiusKm
                      ? `${Number(data.coverageZone.radiusKm).toFixed(1)} km`
                      : '—')}
                </span>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-warm-cream/80 px-3 py-2">
                <span className="font-medium text-charcoal">Trust Test</span>
                <span>{trustQuestions.length || '—'} risposte</span>
              </li>
            </ul>
          </div>
          {stepError && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {stepError}
            </p>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-800/20"
            />
            <span className="text-sm text-charcoal">
              {B2B_TERMS_CONSENT_UI.prefix}
              <Link
                to={B2B_TERMS_CONSENT_UI.link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-800 underline-offset-2 hover:underline"
              >
                {B2B_TERMS_CONSENT_UI.link.text}
              </Link>
              {B2B_TERMS_CONSENT_UI.suffix}
            </span>
          </label>
          <p className="text-xs text-charcoal-muted">
            Cliccando &quot;Invia per revisione&quot; il profilo passerà in attesa di approvazione
            dal team Wenando.
          </p>
          {isApiConfigured() && submitError && (
            <p
              className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          )}
        </div>
      )}
    </OnboardingLayout>
  )
}
