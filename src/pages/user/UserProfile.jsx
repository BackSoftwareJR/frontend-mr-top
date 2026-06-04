import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getLatestSearch } from '../../data/mockUserSearches'
import UserLoadError from '../../components/user/UserLoadError'
import { updateUserProfile, requestDataErasure, fetchUserProfile } from '../../services/userService'
import { ApiError, getBearerToken, isApiConfigured } from '../../services/apiClient'
import { patchSession } from '../../services/authService'
import { fetchMyConsents, setConsentPreference } from '../../services/consentService'
import {
  mirrorAnalyticsCookieToLocal,
  syncAnalyticsCookiePreference,
} from '../../utils/analyticsCookieSync'

const spring = { type: 'spring', stiffness: 400, damping: 28 }

const PROFILE_ROWS = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Telefono' },
]

function ProfileRow({ label, value, isLast }) {
  return (
    <div
      className={`flex min-h-[3rem] items-center justify-between gap-4 px-5 py-4 sm:px-6 ${
        !isLast ? 'border-b border-black/[0.06]' : ''
      }`}
    >
      <span className="text-base text-slate-600">{label}</span>
      <span className="text-right text-base font-medium text-slate-800">{value}</span>
    </div>
  )
}

function ProfileField({ id, label, value, onChange, type = 'text', isLast, readOnly = false }) {
  return (
    <div
      className={`px-5 py-4 sm:px-6 ${!isLast ? 'border-b border-black/[0.06]' : ''}`}
    >
      <label htmlFor={id} className="block text-base text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-base text-slate-800 outline-none transition-colors ${
          readOnly
            ? 'cursor-default border-transparent bg-transparent px-0 py-0 font-medium'
            : 'border-black/[0.08] bg-white/90 focus:border-teal-800/30 focus:ring-2 focus:ring-teal-800/15'
        }`}
      />
    </div>
  )
}

function PreferenceToggle({ id, label, description, checked, disabled, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-[3rem] items-start justify-between gap-4 px-5 py-4 sm:px-6 ${
        disabled ? 'opacity-60' : 'cursor-pointer'
      }`}
    >
      <span>
        <span className="block text-base text-slate-800">{label}</span>
        {description ? (
          <span className="mt-1 block text-sm text-slate-500">{description}</span>
        ) : null}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-800/20"
      />
    </label>
  )
}

export default function UserProfile() {
  const { userName, userEmail, userPhone, logout, refreshSession } = useAuth()
  const latest = getLatestSearch()
  const prefersReducedMotion = useReducedMotion()
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const canLoadPrefs = isApiConfigured() && Boolean(getBearerToken())
  const canEditProfile = canLoadPrefs
  const [prefsLoading, setPrefsLoading] = useState(canLoadPrefs)
  const [prefsSaving, setPrefsSaving] = useState(null)
  const [profileLoading, setProfileLoading] = useState(canEditProfile)
  const [profileLoadError, setProfileLoadError] = useState(null)
  const [profileRetryCount, setProfileRetryCount] = useState(0)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)
  const [name, setName] = useState(userName || latest?.answers?.contact?.nome || '')
  const [phone, setPhone] = useState(userPhone || latest?.answers?.contact?.telefono || '')
  const [eraseLoading, setEraseLoading] = useState(false)

  useEffect(() => {
    if (userName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync session name into editable field
      setName(userName)
    }
  }, [userName])

  useEffect(() => {
    if (userPhone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync session phone into editable field
      setPhone(userPhone)
    }
  }, [userPhone])
  const [eraseMessage, setEraseMessage] = useState(null)

  useEffect(() => {
    if (!canEditProfile) return undefined

    let cancelled = false

    async function load() {
      setProfileLoading(true)
      setProfileLoadError(null)
      try {
        const profile = await fetchUserProfile()
        if (cancelled) return
        if (profile.name) setName(profile.name)
        if (profile.phone) setPhone(profile.phone)
      } catch (err) {
        if (!cancelled) {
          setProfileLoadError(
            err instanceof ApiError
              ? err.message
              : 'Impossibile caricare il profilo. Verifica la connessione e riprova.',
          )
        }
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [canEditProfile, profileRetryCount])

  useEffect(() => {
    if (!canLoadPrefs) return

    let cancelled = false

    fetchMyConsents()
      .then((data) => {
        if (cancelled) return
        const apiAnalytics =
          data.latest_by_type?.analytics_cookies?.consent_given === true
        setAnalyticsEnabled(apiAnalytics)
        mirrorAnalyticsCookieToLocal(apiAnalytics)
        setMarketingEnabled(data.latest_by_type?.marketing?.consent_given === true)
      })
      .catch(() => {
        // preferences are optional in profile view
      })
      .finally(() => {
        if (!cancelled) setPrefsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [canLoadPrefs])

  useEffect(() => {
    const onCookieConsent = (event) => {
      setAnalyticsEnabled(event.detail?.analytics === true)
    }
    window.addEventListener('wenando:cookie-consent', onCookieConsent)
    return () => window.removeEventListener('wenando:cookie-consent', onCookieConsent)
  }, [])

  const handlePreferenceChange = async (consentType, enabled, setter) => {
    if (!isApiConfigured()) return

    setter(enabled)
    setPrefsSaving(consentType)

    try {
      if (consentType === 'analytics_cookies') {
        await syncAnalyticsCookiePreference(enabled, { source: 'profile' })
      } else {
        await setConsentPreference(consentType, enabled)
      }
    } catch {
      setter(!enabled)
    } finally {
      setPrefsSaving(null)
    }
  }

  const handleSaveProfile = async () => {
    if (!canEditProfile || profileSaving) return

    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const updated = await updateUserProfile({
        name: name.trim(),
        phone: phone.trim() || null,
      })
      if (updated.name) setName(updated.name)
      setPhone(updated.phone ?? '')
      patchSession({
        name: updated.name || name.trim(),
        phone: updated.phone ?? (phone.trim() || null),
      })
      refreshSession()
      setProfileMessage('Profilo aggiornato.')
    } catch {
      setProfileMessage('Impossibile salvare il profilo. Riprova.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleEraseRequest = async () => {
    if (!isApiConfigured() || eraseLoading) return

    const confirmed = window.confirm(
      'Vuoi richiedere la cancellazione dei tuoi dati personali? Ti contatteremo entro 30 giorni a hola@wenando.com.',
    )
    if (!confirmed) return

    setEraseLoading(true)
    setEraseMessage(null)

    try {
      const data = await requestDataErasure()
      setEraseMessage(
        data.erasure_request?.message ??
          'Richiesta registrata. Ti contatteremo entro 30 giorni.',
      )
    } catch {
      setEraseMessage('Impossibile inviare la richiesta. Riprova o scrivi a hola@wenando.com.')
    } finally {
      setEraseLoading(false)
    }
  }

  const displayName = name || userName || latest?.answers?.contact?.nome || '—'
  const displayEmail = userEmail || '—'

  const values = {
    nome: displayName,
    email: displayEmail,
    telefono: phone || '—',
  }

  const visibleRows = PROFILE_ROWS.filter((row) => row.key !== 'telefono' || phone)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
          Profilo
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          I tuoi dati e le impostazioni dell&apos;account.
        </p>
      </header>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex flex-col items-center gap-5"
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-black/[0.06] bg-gradient-to-br from-teal-800/[0.06] to-white/90 shadow-[0_4px_20px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          aria-hidden
        >
          <User className="h-9 w-9 text-teal-800/50" strokeWidth={1.5} />
        </div>
        <p className="text-lg font-semibold text-slate-800">{displayName}</p>
      </motion.div>

      {profileLoadError && !profileLoading ? (
        <UserLoadError
          message={profileLoadError}
          onRetry={() => setProfileRetryCount((n) => n + 1)}
        />
      ) : null}

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Account
        </h2>
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          {canEditProfile && !profileLoadError ? (
            <>
              <ProfileField
                id="profile-name"
                label="Nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <ProfileField
                id="profile-email"
                label="Email"
                value={displayEmail}
                readOnly
              />
              <ProfileField
                id="profile-phone"
                label="Telefono"
                value={phone}
                type="tel"
                isLast
                onChange={(event) => setPhone(event.target.value)}
              />
              <div className="border-t border-black/[0.06] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={profileLoading || profileSaving}
                  className="inline-flex min-h-[2.75rem] items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-900 disabled:opacity-60"
                >
                  {profileSaving ? 'Salvataggio…' : 'Salva modifiche'}
                </button>
                {profileMessage ? (
                  <p className="mt-3 text-sm text-slate-600" role="status">
                    {profileMessage}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            visibleRows.map((row, index) => (
              <ProfileRow
                key={row.key}
                label={row.label}
                value={values[row.key] || '—'}
                isLast={index === visibleRows.length - 1}
              />
            ))
          )}
        </div>
      </section>

      {isApiConfigured() ? (
        <section>
          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Privacy
          </h2>
          <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
            <div className="divide-y divide-black/[0.06]">
              <PreferenceToggle
                id="pref-analytics"
                label="Cookie analytics"
                description="Statistiche aggregate senza profilazione marketing."
                checked={analyticsEnabled}
                disabled={prefsLoading || prefsSaving === 'analytics_cookies'}
                onChange={(enabled) =>
                  handlePreferenceChange('analytics_cookies', enabled, setAnalyticsEnabled)
                }
              />
              <PreferenceToggle
                id="pref-marketing"
                label="Comunicazioni marketing"
                description="Newsletter e aggiornamenti promozionali Wenando."
                checked={marketingEnabled}
                disabled={prefsLoading || prefsSaving === 'marketing'}
                onChange={(enabled) =>
                  handlePreferenceChange('marketing', enabled, setMarketingEnabled)
                }
              />
              <div className="px-5 py-4 sm:px-6">
                <p className="text-base text-slate-800">Cancellazione dati personali</p>
                <p className="mt-1 text-sm text-slate-500">
                  Richiedi l&apos;esercizio del diritto all&apos;oblio (Art. 17 GDPR). Rispondiamo
                  entro 30 giorni.
                </p>
                <button
                  type="button"
                  onClick={handleEraseRequest}
                  disabled={eraseLoading}
                  className="mt-3 inline-flex min-h-[2.75rem] items-center rounded-xl border border-rose-200 bg-rose-50/80 px-4 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100/80 disabled:opacity-60"
                >
                  {eraseLoading ? 'Invio in corso…' : 'Richiedi cancellazione'}
                </button>
                {eraseMessage ? (
                  <p className="mt-3 text-sm text-slate-600" role="status">
                    {eraseMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Supporto
        </h2>
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/75 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <Link
            to="/area-personale/aiuto"
            className="group flex min-h-[3rem] items-center justify-between gap-4 px-5 py-4 text-base text-slate-800 transition-colors hover:bg-stone-50/60 sm:px-6"
          >
            <span>Centro assistenza</span>
            <ChevronRight
              className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>
      </section>

      <motion.div whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }} transition={spring}>
        <Link
          to="/accedi"
          onClick={async () => {
            await logout()
          }}
          className="inline-flex min-h-[3rem] items-center gap-2 rounded-xl px-1 py-3 text-sm font-medium text-rose-600/90 transition-colors hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Esci dall&apos;account
        </Link>
      </motion.div>
    </div>
  )
}
