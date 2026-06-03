import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import TrustPartnersSectionStatic from './TrustPartnersSectionStatic'

const TrustPartnersSectionDesktop = lazy(() => import('./TrustPartnersSectionDesktop'))

export default function TrustPartnersSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <TrustPartnersSectionStatic />
  }

  return (
    <Suspense fallback={<TrustPartnersSectionStatic />}>
      <TrustPartnersSectionDesktop />
    </Suspense>
  )
}
