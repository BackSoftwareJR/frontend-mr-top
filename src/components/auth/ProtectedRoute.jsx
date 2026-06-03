import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getB2BRedirectPath, getOnboardingStatus } from '../../services/b2bOnboardingService'

export function B2BProtectedRoute({ children }) {
  const { isAuthenticated, userType, userEmail } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/pro" state={{ from: location.pathname }} replace />
  }

  if (userType !== 'b2b') {
    return <Navigate to="/user" replace />
  }

  const status = getOnboardingStatus(userEmail)
  if (status !== 'approved') {
    return <Navigate to="/pro/onboarding" replace />
  }

  return children
}

export function ConsumerProtectedRoute({ children }) {
  const { isAuthenticated, userType } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/accedi" state={{ from: location.pathname }} replace />
  }

  if (userType === 'b2b') {
    return <Navigate to={getB2BRedirectPath()} replace />
  }

  return children
}
