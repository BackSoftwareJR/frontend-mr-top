import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import AnalyzingStateStatic from './AnalyzingStateStatic'

const AnalyzingStateMotion = lazy(() => import('./AnalyzingStateMotion'))

export default function AnalyzingState(props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <AnalyzingStateStatic {...props} />
  }

  return (
    <Suspense fallback={<AnalyzingStateStatic {...props} />}>
      <AnalyzingStateMotion {...props} />
    </Suspense>
  )
}
