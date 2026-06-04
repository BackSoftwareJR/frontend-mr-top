import { lazy, Suspense, useEffect } from 'react'
import { HomePageContent } from '../components/home/HeroSection'
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle'
import { useIsMobile } from '../utils/performanceTier'
import { prefetchRoute } from '../utils/routePrefetch'

const HomeDesktop = lazy(() => import('./HomeDesktop'))

export default function Home() {
  const isMobile = useIsMobile()

  usePrefetchOnIdle(['/wizard'])

  useEffect(() => {
    if (!isMobile) return undefined

    const warm = () => {
      prefetchRoute('/pro/registrati')
      prefetchRoute('/wizard')
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timer)
  }, [isMobile])

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
