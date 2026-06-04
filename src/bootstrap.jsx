import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initSentry } from './services/sentryService'
import App from './App.jsx'

initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
