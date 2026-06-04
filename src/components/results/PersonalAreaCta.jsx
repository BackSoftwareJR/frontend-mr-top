import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import { PERSONAL_AREA_HOME } from '../../constants/consumerJourney'

/**
 * Primary CTA from results → consumer dashboard (auth-aware).
 */
export default function PersonalAreaCta({ isAuthenticated, className = '' }) {
  const label = 'Visualizza la tua area personale'

  if (isAuthenticated) {
    return (
      <MagneticButton to={PERSONAL_AREA_HOME} variant="primary" className={className}>
        <LayoutDashboard className="h-5 w-5" strokeWidth={2} aria-hidden />
        {label}
      </MagneticButton>
    )
  }

  return (
    <Link
      to="/accedi"
      state={{ from: PERSONAL_AREA_HOME }}
      className={`relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#E07A5F] px-9 py-3 text-base font-bold tracking-tight text-white shadow-[0_6px_20px_rgba(224,122,95,0.35)] transition-shadow duration-300 hover:bg-[#c96a52] hover:shadow-[0_8px_28px_rgba(224,122,95,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40 ${className}`}
    >
      <LayoutDashboard className="h-5 w-5" strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </Link>
  )
}
