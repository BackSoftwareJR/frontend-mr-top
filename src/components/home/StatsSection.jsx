import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import StatsSectionStatic from './StatsSectionStatic'

const StatsSectionDesktop = lazy(() => import('./StatsSectionDesktop'))

export default function StatsSection() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <StatsSectionStatic />
  }

  return (
    <Suspense fallback={<StatsSectionStatic />}>
      <StatsSectionDesktop />
    </Suspense>
  )
}
