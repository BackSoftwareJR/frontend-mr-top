import { useEffect } from 'react'
import { isMobileViewport } from '../utils/performanceTier'
import { prefetchMobileCriticalRoutes } from '../utils/routePrefetch'

/** Warm critical lazy routes immediately on mobile after mount. */
export function useMobileRouteWarmup() {
  useEffect(() => {
    if (!isMobileViewport()) return undefined

    prefetchMobileCriticalRoutes()

    return undefined
  }, [])
}
