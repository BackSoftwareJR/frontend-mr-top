import { useCallback, useEffect, useState } from 'react'
import { readCookieConsent } from '../constants/cookieConsent'

export function useCookieConsent() {
  const [consent, setConsent] = useState(() => readCookieConsent())

  useEffect(() => {
    const sync = () => setConsent(readCookieConsent())
    window.addEventListener('wenando:cookie-consent', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('wenando:cookie-consent', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const refresh = useCallback(() => setConsent(readCookieConsent()), [])

  return {
    consent,
    hasConsent: consent !== null,
    refresh,
  }
}
