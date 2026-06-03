import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import CTASectionStatic from './CTASectionStatic'

const CTASectionDesktop = lazy(() => import('./CTASectionDesktop'))

export default function CTASection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <CTASectionStatic />
  }

  return (
    <Suspense fallback={<CTASectionStatic />}>
      <CTASectionDesktop />
    </Suspense>
  )
}
