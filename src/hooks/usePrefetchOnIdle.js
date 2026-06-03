import { useEffect } from 'react'

/** Prefetch assets when the main thread is idle — safe for below-fold images/routes */
export function usePrefetchOnIdle(urls = []) {
  useEffect(() => {
    if (!urls.length || typeof window === 'undefined') return undefined

    const prefetch = () => {
      for (const href of urls) {
        if (!href || document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
          continue
        }
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = href
        link.as = href.match(/\.(woff2?|ttf|otf)$/i) ? 'font' : 'fetch'
        if (link.as === 'font') link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }

    const timer = window.setTimeout(prefetch, 1800)
    return () => window.clearTimeout(timer)
  }, [urls])
}
