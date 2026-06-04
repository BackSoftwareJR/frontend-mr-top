import { useEffect, useState } from 'react'
import { getSession } from '../services/authService'
import { fetchOnboardingStatusAsync, getOnboardingStatus } from '../services/b2bOnboardingService'

/** Sync vetting gate for onboarding page (non-dashboard routes). */
export function useB2BOnboardingGate(email, refreshKey = 0) {
  const [state, setState] = useState(() => ({
    loading: true,
    status: getSession()?.onboardingStatus ?? getOnboardingStatus(email),
    redirectTo: null,
    rejectionReason: null,
    error: null,
  }))

  useEffect(() => {
    let cancelled = false

    fetchOnboardingStatusAsync(email)
      .then((payload) => {
        if (cancelled) return
        setState({
          loading: false,
          status: payload.status,
          redirectTo: payload.redirectTo,
          rejectionReason: payload.rejectionReason ?? null,
          error: null,
        })
      })
      .catch((err) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message ?? 'Impossibile caricare lo stato onboarding.',
        }))
      })

    return () => {
      cancelled = true
    }
  }, [email, refreshKey])

  return state
}
