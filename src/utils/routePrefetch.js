/** Lazy route loaders warmed on hover/touch/focus or idle — pairs with App.jsx lazyRoute paths. */
const ROUTE_LOADERS = {
  '/pro/registrati': () => import('../pages/b2b/Register.jsx'),
  '/pro/onboarding': () => import('../pages/b2b/Onboarding.jsx'),
  '/pro/accedi': () => import('../pages/b2b/ProAccedi.jsx'),
  '/pro': () => import('../pages/b2b/B2BPortal.jsx'),
  '/wizard': () => import('../pages/Wizard.jsx'),
}

const inflight = new Map()

/**
 * @param {string} path — pathname only (e.g. `/pro/registrati`)
 */
export function prefetchRoute(path) {
  if (typeof path !== 'string' || !path) return

  const key = path.split('?')[0].split('#')[0]
  const load = ROUTE_LOADERS[key]
  if (!load || inflight.has(key)) return

  inflight.set(key, load().catch(() => inflight.delete(key)))
}
