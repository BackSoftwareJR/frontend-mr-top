import { lazy, Suspense } from 'react'
import { useIsMobile } from '../../utils/performanceTier'
import AnimatedTextStatic from './AnimatedTextStatic'

const AnimatedTextMotion = lazy(() => import('./AnimatedTextMotion'))

export default function AnimatedText(props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <AnimatedTextStatic {...props} />
  }

  return (
    <Suspense fallback={<AnimatedTextStatic {...props} />}>
      <AnimatedTextMotion {...props} />
    </Suspense>
  )
}
