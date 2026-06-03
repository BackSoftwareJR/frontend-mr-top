import { useEffect, useState } from 'react'

/**
 * Defer heavy work until idle, load+delay, or first scroll — whichever comes first.
 */
export function useDeferUntilReady({ loadDelayMs = 100, scrollTrigger = true } = {}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return undefined

    let done = false
    const activate = () => {
      if (done) return
      done = true
      setReady(true)
    }

    const onScroll = () => activate()

    if (document.readyState === 'complete') {
      window.setTimeout(activate, loadDelayMs)
    } else {
      window.addEventListener('load', () => window.setTimeout(activate, loadDelayMs), {
        once: true,
      })
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(activate, { timeout: loadDelayMs + 300 })
    } else {
      window.setTimeout(activate, loadDelayMs + 50)
    }

    if (scrollTrigger) {
      window.addEventListener('scroll', onScroll, { once: true, passive: true })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [ready, loadDelayMs, scrollTrigger])

  return ready
}
