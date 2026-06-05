import { Link } from 'react-router-dom'

/** B2C guest/family login (email OTP). B2B uses footer → /pro only. */
export const CONSUMER_ACCESS_PATH = '/accedi'

const linkClassName =
  'inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium tracking-tight text-slate-600 transition-colors hover:text-teal-700'

export default function ConsumerAccediNavLink({ className = '' }) {
  return (
    <Link to={CONSUMER_ACCESS_PATH} className={`${linkClassName} ${className}`.trim()}>
      Accedi
    </Link>
  )
}
