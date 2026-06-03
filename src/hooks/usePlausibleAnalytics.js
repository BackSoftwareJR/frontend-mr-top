import { useEffect } from 'react'
import { useCookieConsent } from './useCookieConsent'

const PLAUSIBLE_STUB_FLAG = '__wenando_plausible_stub__'

/**
 * Loads Plausible Analytics only when the user has consented to analytics cookies.
 * Stub implementation until production domain/script is configured.
 */
export function usePlausibleAnalytics() {
  const { consent, hasConsent } = useCookieConsent()

  useEffect(() => {
    if (!hasConsent || !consent?.analytics) return

    if (typeof window === 'undefined' || window[PLAUSIBLE_STUB_FLAG]) return

    window[PLAUSIBLE_STUB_FLAG] = true

    // Production: inject script, e.g. data-domain="wenando.com"
    // const s = document.createElement('script')
    // s.defer = true
    // s.dataset.domain = 'wenando.com'
    // s.src = 'https://plausible.io/js/script.js'
    // document.head.appendChild(s)

    console.info('[Wenando] Plausible analytics enabled (consent granted, stub)')
  }, [hasConsent, consent?.analytics])
}
