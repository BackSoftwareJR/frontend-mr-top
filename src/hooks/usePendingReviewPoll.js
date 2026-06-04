import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isApiConfigured } from '../services/apiClient'
import { getSession } from '../services/authService'
import { fetchOnboardingStatusAsync } from '../services/b2bOnboardingService'

/** Poll interval while partner sees PendingReview (API mode only). */
export const PENDING_REVIEW_POLL_MS = 30_000

/**
 * Poll onboarding status while pending_review; navigate when approved.
 * @param {boolean} enabled
 */
export function usePendingReviewPoll(enabled) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled || !isApiConfigured() || !getSession()?.token) return

    let cancelled = false

    const check = async () => {
      try {
        const payload = await fetchOnboardingStatusAsync()
        if (cancelled) return
        if (payload.status === 'approved' && payload.redirectTo) {
          navigate(payload.redirectTo, { replace: true })
        }
      } catch {
        /* next poll */
      }
    }

    void check()
    const id = setInterval(() => {
      void check()
    }, PENDING_REVIEW_POLL_MS)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [enabled, navigate])
}
