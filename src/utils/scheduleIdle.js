export function scheduleIdle(callback, { timeout = 800 } = {}) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  }
  return window.setTimeout(callback, 120)
}

export function cancelScheduledIdle(handle) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle)
    return
  }
  window.clearTimeout(handle)
}

export function supportsScrollTimeline() {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')
}
