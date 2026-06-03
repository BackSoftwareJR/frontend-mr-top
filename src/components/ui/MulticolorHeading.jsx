import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import MulticolorHeadingStatic from './MulticolorHeadingStatic'

const MulticolorHeadingMotion = lazy(() => import('./MulticolorHeadingMotion'))

export { ACCENT_PALETTE } from './MulticolorHeadingStatic'

export default function MulticolorHeading(props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MulticolorHeadingStatic {...props} />
  }

  return (
    <Suspense fallback={<MulticolorHeadingStatic {...props} />}>
      <MulticolorHeadingMotion {...props} />
    </Suspense>
  )
}
