import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import OnboardingLayout from '../../components/b2b/OnboardingLayout'
import StepLegal from '../../components/b2b/onboarding/StepLegal'
import StepOperations from '../../components/b2b/onboarding/StepOperations'
import StepTrustTest, { TRUST_QUESTIONS } from '../../components/b2b/onboarding/StepTrustTest'
import PendingReview from '../../components/b2b/onboarding/PendingReview'
import { obGlassCard, obPrimaryBtn, obSecondaryBtn } from '../../components/b2b/onboardingStyles'
import { getSession } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import {
  clearAutoDemo,
  getOnboardingData,
  getOnboardingStatus,
  getRegistration,
  saveOnboardingData,
  submitOnboardingForReview,
} from '../../services/b2bOnboardingService'

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

function canProceed(stepIndex, data) {
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
    return TRUST_QUESTIONS.every((q) => data.trustAnswers?.[q.id]?.trim())
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
  const [statusTick, bumpStatus] = useReducer((n) => n + 1, 0)

  const status = useMemo(() => getOnboardingStatus(email), [email, statusTick])

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
    if (email) {
      setData(getOnboardingData(email))
    }
  }, [email])

  const persist = useCallback(
    (patch) => {
      if (!email) return
      const next = { ...data, ...patch }
      setData(next)
      saveOnboardingData(email, next)
    },
    [data, email]
  )

  const session = getSession()
  const hasB2BAccess =
    (isAuthenticated && userType === 'b2b') || session?.type === 'b2b'

  if (!hasB2BAccess) {
    return null
  }

  if (status === 'approved') {
    return <Navigate to="/pro/dashboard" replace />
  }

  if (status === 'pending_review') {
    return (
      <OnboardingLayout currentStepIndex={3} title="" subtitle="">
        <PendingReview email={email} />
      </OnboardingLayout>
    )
  }

  const meta = STEP_META[stepIndex]

  const handleSubmitReview = () => {
    submitOnboardingForReview(email)
    bumpStatus()
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

      {stepIndex < 3 ? (
        <button
          type="button"
          disabled={!canProceed(stepIndex, data)}
          onClick={() => setStepIndex((i) => i + 1)}
          className={`${obPrimaryBtn} sm:!w-auto sm:min-w-[160px]`}
        >
          Continua
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmitReview}
          className={`${obPrimaryBtn} sm:!w-auto sm:min-w-[200px]`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Invia per revisione
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
          onFilesChange={(files) => persist(files)}
        />
      )}
      {stepIndex === 1 && <StepOperations data={data} onChange={persist} />}
      {stepIndex === 2 && (
        <StepTrustTest
          answers={data.trustAnswers ?? {}}
          onChange={(patch) =>
            persist({ trustAnswers: { ...(data.trustAnswers ?? {}), ...patch } })
          }
        />
      )}
      {stepIndex === 3 && (
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
                <span className="font-medium text-charcoal">Trust Test</span>
                <span>{TRUST_QUESTIONS.length} risposte</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-charcoal-muted">
            Cliccando &quot;Invia per revisione&quot; il profilo passerà in attesa di approvazione
            dal team Wenando.
          </p>
        </div>
      )}
    </OnboardingLayout>
  )
}
