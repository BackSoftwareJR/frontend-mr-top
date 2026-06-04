import { useEffect, useState } from 'react'

export const MOBILE_MEDIA = '(max-width: 768px)'

export function isMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA).matches
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => isMobileViewport())

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}

export function isLowCoreDevice() {
  if (typeof window === 'undefined') return false
  return (navigator.hardwareConcurrency ?? 4) <= 2
}

export function useLowCoreDevice() {
  return isLowCoreDevice()
}

/** Heuristic for low-end phones — invisible to the user, reduces path math only */
export function isConstrainedDevice() {
  if (typeof window === 'undefined') return false

  const mobile = window.matchMedia(MOBILE_MEDIA).matches
  if (!mobile) return false

  const cores = navigator.hardwareConcurrency ?? 4
  const saveData = navigator.connection?.saveData === true
  const slowNet =
    navigator.connection?.effectiveType === '2g' ||
    navigator.connection?.effectiveType === 'slow-2g'

  return saveData || slowNet || cores <= 4 || isLowCoreDevice()
}

export function useConstrainedDevice() {
  const [constrained, setConstrained] = useState(() => isConstrainedDevice())

  useEffect(() => {
    const update = () => setConstrained(isConstrainedDevice())
    const media = window.matchMedia(MOBILE_MEDIA)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return constrained
}
