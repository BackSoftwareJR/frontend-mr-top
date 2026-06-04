import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import RouteLoadingFallback from '../ui/RouteLoadingFallback'
import { getSession } from '../../services/authService'
import {
  fetchOnboardingStatusAsync,
  getB2BRedirectPath,
  getB2BRedirectPathAsync,
  getOnboardingStatus,
} from '../../services/b2bOnboardingService'
import { ApiError } from '../../services/apiClient'

export function B2BProtectedRoute({ children }) {
  const { isAuthenticated, userType, userEmail } = useAuth()
  const location = useLocation()
  const gateKey = `${isAuthenticated}-${userType}-${userEmail}`
  const [gate, setGate] = useState({ loading: true, redirect: null })
  const [gateKeySeen, setGateKeySeen] = useState(gateKey)

  if (gateKey !== gateKeySeen) {
    setGateKeySeen(gateKey)
    setGate({ loading: isAuthenticated && userType === 'b2b', redirect: null })
  }

  useEffect(() => {
    if (!isAuthenticated || userType !== 'b2b') return

    let cancelled = false

    fetchOnboardingStatusAsync(userEmail)
      .then((payload) => {
        if (cancelled) return
        const needsOnboarding =
          !payload.onboardingComplete ||
          payload.status === 'suspended' ||
          payload.status === 'rejected'
        setGate({
          loading: false,
          redirect: needsOnboarding ? (payload.redirectTo ?? '/pro/onboarding') : null,
        })
      })
      .catch((err) => {
        if (cancelled) return
        setGate({
          loading: false,
          redirect:
            err instanceof ApiError && err.status === 401
              ? null
              : (getB2BRedirectPath(getSession()) ?? '/pro/onboarding'),
        })
      })

    return () => {
      cancelled = true
    }
  }, [gateKey, isAuthenticated, userEmail, userType])

  if (!isAuthenticated) {
    return <Navigate to="/pro" state={{ from: location.pathname }} replace />
  }

  if (userType !== 'b2b') {
    return <Navigate to="/area-personale" replace />
  }

  if (gate.loading) {
    return (
      <div className="relative min-h-[100dvh] bg-warm-cream">
        <div className="aurora-bg" aria-hidden="true">
          <span className="aurora-orb aurora-orb--coral" />
          <span className="aurora-orb aurora-orb--violet" />
          <span className="aurora-orb aurora-orb--amber" />
        </div>
        <RouteLoadingFallback inline label="Verifico profilo partner…" />
      </div>
    )
  }

  if (gate.redirect) {
    return <Navigate to={gate.redirect} replace />
  }

  return children
}

export function ConsumerProtectedRoute({ children }) {
  const { isAuthenticated, userType } = useAuth()
  const location = useLocation()
  const [b2bRedirect, setB2bRedirect] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || userType !== 'b2b') return

    let cancelled = false

    getB2BRedirectPathAsync()
      .then((path) => {
        if (!cancelled) setB2bRedirect(path)
      })
      .catch(() => {
        if (!cancelled) setB2bRedirect(getB2BRedirectPath(getSession()) ?? '/pro/dashboard')
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, userType])

  if (!isAuthenticated) {
    return <Navigate to="/accedi" state={{ from: location.pathname }} replace />
  }

  if (userType === 'b2b') {
    if (!b2bRedirect) {
      return <RouteLoadingFallback label="Reindirizzamento area partner…" />
    }
    return <Navigate to={b2bRedirect} replace />
  }

  return children
}

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
