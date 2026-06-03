import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import MagneticButtonStatic from './MagneticButtonStatic'

const MagneticButtonMotion = lazy(() => import('./MagneticButtonMotion'))

export default function MagneticButton(props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MagneticButtonStatic {...props} />
  }

  return (
    <Suspense fallback={<MagneticButtonStatic {...props} />}>
      <MagneticButtonMotion {...props} />
    </Suspense>
  )
}
