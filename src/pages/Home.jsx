import { lazy, Suspense } from 'react'
import { HomePageContent } from '../components/home/HeroSection'
import { useDeferUntilReady } from '../hooks/useDeferUntilReady'
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle'
import { useIsMobile } from '../utils/performanceTier'

const HomeDesktop = lazy(() => import('./HomeDesktop'))
const ScrollReadingLineLazy = lazy(() => import('../components/layout/ScrollReadingLine'))

function DeferredMobileReadingLine() {
  const ready = useDeferUntilReady({ loadDelayMs: 120, scrollTrigger: true })
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <ScrollReadingLineLazy />
    </Suspense>
  )
}

export default function Home() {
  const isMobile = useIsMobile()

  usePrefetchOnIdle(['/wizard'])

  if (isMobile) {
    return (
      <div className="relative min-h-screen">
        <DeferredMobileReadingLine />
        <HomePageContent />
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="relative min-h-screen">
        <HomePageContent />
      </div>
    }>
      <HomeDesktop />
    </Suspense>
  )
}
