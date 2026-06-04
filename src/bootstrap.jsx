import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

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
