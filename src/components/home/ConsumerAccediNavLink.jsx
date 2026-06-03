import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const linkClassName =
  'inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium tracking-tight text-slate-600 transition-colors hover:text-teal-700'

export default function ConsumerAccediNavLink() {
  const { isAuthenticated, userType } = useAuth()
  const to =
    isAuthenticated && userType === 'consumer' ? '/user' : '/accedi'

  return (
    <Link to={to} className={linkClassName}>
      Accedi
    </Link>
  )
}
