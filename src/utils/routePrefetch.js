/** Lazy route loaders warmed on hover/touch/focus, idle, or mobile bootstrap. */
const ROUTE_LOADERS = {
  '/': () => import('../pages/Home.jsx'),
  '/wizard': () => import('../pages/Wizard.jsx'),
  '/results': () => import('../pages/ResultsPage.jsx'),
  '/accedi': () => import('../pages/Accedi.jsx'),
  '/pro': () => import('../pages/b2b/B2BPortal.jsx'),
  '/pro/registrati': () => import('../pages/b2b/Register.jsx'),
  '/pro/onboarding': () => import('../pages/b2b/Onboarding.jsx'),
  '/pro/accedi': () => import('../pages/b2b/ProAccedi.jsx'),
}

const MOBILE_CRITICAL_PATHS = [
  '/wizard',
  '/results',
  '/accedi',
  '/pro/registrati',
  '/pro/onboarding',
  '/pro/accedi',
  '/pro',
]

const inflight = new Map()

/**
 * @param {string} path — pathname only (e.g. `/pro/registrati`)
 */
export function prefetchRoute(path) {
  if (typeof path !== 'string' || !path) return

  const key = path.split('?')[0].split('#')[0]
  const load = ROUTE_LOADERS[key]
  if (!load || inflight.has(key)) return

  inflight.set(
    key,
    load().catch(() => {
      inflight.delete(key)
    }),
  )
}

/** Parallel warm of consumer + B2B entry routes on mobile — run right after first paint. */
export function prefetchMobileCriticalRoutes() {
  if (typeof window === 'undefined') return
  for (const path of MOBILE_CRITICAL_PATHS) {
    prefetchRoute(path)
  }
}

export { MOBILE_CRITICAL_PATHS }
