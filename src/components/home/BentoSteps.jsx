import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import BentoStepsStatic from './BentoStepsStatic'

const BentoStepsDesktop = lazy(() => import('./BentoStepsDesktop'))

export default function BentoSteps() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <BentoStepsStatic />
  }

  return (
    <Suspense fallback={<BentoStepsStatic />}>
      <BentoStepsDesktop />
    </Suspense>
  )
}
