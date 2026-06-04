import { lazy, Suspense, useEffect, useState } from 'react'

const CookieBanner = lazy(() => import('./CookieBanner'))

/**
 * Cookie banner deferred until idle — keeps first navigation off the critical path.
 */
export default function DeferredCookieBanner() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const show = () => setReady(true)

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(show, { timeout: 3500 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(show, 1800)
    return () => window.clearTimeout(timer)
  }, [])

  if (!ready) return null

  return (
    <Suspense fallback={null}>
      <CookieBanner />
    </Suspense>
  )
}
