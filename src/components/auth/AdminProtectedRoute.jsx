import { Navigate, useLocation } from 'react-router-dom'
import { getBearerToken, isApiConfigured } from '../../services/apiClient'
import { getSession } from '../../services/authService'

export default function AdminProtectedRoute({ children }) {
  const location = useLocation()
  const session = getSession()
  const needsToken = isApiConfigured()
  const hasToken = Boolean(getBearerToken())

  if (!session || session.type !== 'superadmin' || (needsToken && !hasToken)) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return children
}
