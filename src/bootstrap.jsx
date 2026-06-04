import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isMobileViewport } from './utils/performanceTier'
import { prefetchMobileCriticalRoutes } from './utils/routePrefetch'

const rootEl = document.getElementById('root')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

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
