import { useEffect, useState } from 'react'

const MOBILE_MEDIA = '(max-width: 768px)'

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

  return saveData || slowNet || cores <= 4
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
