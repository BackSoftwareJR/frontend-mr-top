import { lazy, Suspense } from 'react'
import { HomePageContent } from '../components/home/HeroSection'
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle'
import { useIsMobile } from '../utils/performanceTier'

const HomeDesktop = lazy(() => import('./HomeDesktop'))

export default function Home() {
  const isMobile = useIsMobile()

  usePrefetchOnIdle(['/wizard'])

  if (isMobile) {
    return (
      <div className="relative min-h-screen">
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
