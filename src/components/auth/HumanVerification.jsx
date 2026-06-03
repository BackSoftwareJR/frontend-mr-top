import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import {
  b2bIconAccent,
  b2bInputFocus,
  b2bLink,
  b2bPrimaryBtn,
} from '../b2b/b2bStyles'

/**
 * Human verification step.
 *
 * DEV / no env keys: honeypot + visual 4-digit challenge + minimum form timing.
 * PRODUCTION: set VITE_HCAPTCHA_SITE_KEY or VITE_RECAPTCHA_SITE_KEY in .env
 * and replace the inline challenge with the provider widget + server-side verify.
 */
const HCAPTCHA_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY
const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

function generateChallenge() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function HumanVerification({ onVerified, onChallengeReady }) {
  const [challenge, setChallenge] = useState(() => generateChallenge())
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [formStartedAt] = useState(() => Date.now())

  const hasExternalCaptcha = Boolean(HCAPTCHA_KEY || RECAPTCHA_KEY)

  const payload = useMemo(
    () => ({
      honeypot: '',
      challengeAnswer: answer,
      expectedChallenge: challenge,
      formStartedAt,
      humanConfirmed: checked,
    }),
    [answer, challenge, checked, formStartedAt]
  )

  useEffect(() => {
    onChallengeReady?.(payload)
  }, [onChallengeReady, payload])

  const refreshChallenge = () => {
    setChallenge(generateChallenge())
    setAnswer('')
    setError('')
  }

  const handleVerify = () => {
    setError('')

    if (!checked) {
      setError('Conferma di non essere un robot.')
      return
    }

    if (answer.trim() !== challenge) {
      setError('Codice di verifica errato.')
      return
    }

    onVerified(payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium tracking-tight text-charcoal">
        <ShieldCheck className={`h-4 w-4 ${b2bIconAccent}`} />
        Verifica umana
      </div>

      {hasExternalCaptcha ? (
        <div className="rounded-2xl bg-warm-cream/80 px-4 py-6 text-center ring-1 ring-black/5">
          <p className="text-sm text-charcoal-muted">
            Captcha esterno configurato — integrare widget hCaptcha/reCAPTCHA qui usando{' '}
            <code className={`text-xs ${b2bLink}`}>
              {HCAPTCHA_KEY ? 'VITE_HCAPTCHA_SITE_KEY' : 'VITE_RECAPTCHA_SITE_KEY'}
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-warm-cream/90 to-white px-5 py-4 ring-1 ring-black/5">
          <p className="mb-3 text-xs font-medium text-charcoal-muted">Inserisci il codice mostrato sotto</p>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div
              className="flex-1 select-none rounded-xl bg-white px-4 py-3 text-center font-mono text-2xl font-semibold tracking-[0.35em] text-accent-coral-dark ring-1 ring-black/5"
              aria-hidden="true"
            >
              {challenge.split('').join(' ')}
            </div>
            <button
              type="button"
              onClick={refreshChallenge}
              className="rounded-full p-2.5 text-charcoal-muted ring-1 ring-black/5 transition-colors hover:bg-white hover:text-accent-coral"
              aria-label="Nuovo codice"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
            placeholder="0000"
            className={`w-full rounded-xl bg-white px-4 py-3 text-center text-lg font-medium tracking-widest text-charcoal ring-1 ring-black/5 transition-shadow placeholder:text-slate-300 ${b2bInputFocus}`}
            aria-label="Codice di verifica umana"
          />
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent-coral focus:ring-accent-coral/25"
        />
        <span className="text-sm text-charcoal-muted">
          Confermo di essere una persona e accetto l&apos;invio del codice di accesso.
        </span>
      </label>

      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
        onChange={() => {}}
      />

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <button type="button" onClick={handleVerify} className={`w-full ${b2bPrimaryBtn}`}>
        Continua
      </button>
    </div>
  )
}
