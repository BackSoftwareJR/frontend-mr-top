import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isMobileViewport } from './utils/performanceTier'
import { prefetchMobileCriticalRoutes } from './utils/routePrefetch'

const rootEl = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (rootEl?.hasAttribute('data-prerendered')) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}

if (isMobileViewport()) {
  prefetchMobileCriticalRoutes()
}

function scheduleDeferredInit() {
  const run = () => {
    void import('./services/sentryService').then(({ initSentry }) => initSentry())
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 5000 })
    return
  }

  window.setTimeout(run, 1500)
}

scheduleDeferredInit()
