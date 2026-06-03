import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function B2BProtectedRoute({ children }) {
  const { isAuthenticated, userType } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/pro/accedi" state={{ from: location.pathname }} replace />
  }

  if (userType !== 'b2b') {
    return <Navigate to="/user" replace />
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
    return <Navigate to="/pro/dashboard" replace />
  }

  return children
}
