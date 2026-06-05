import { useEffect, useState } from 'react'

const HERO_SELECTOR = '#hero'
const HERO_SEARCH_SELECTOR = '[data-scroll-anchor="hero-cta"]'

/** Nav offset aligned to fixed header (5.5rem desktop, 4.75rem mobile). */
const NAV_TOP_REM = { desktop: 5.5, mobile: 4.75 }

/** Pixels over which hero → sticky crossfades (larger = smoother handoff). */
const MORPH_ZONE_PX = 120

function resolveNavTopPx() {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize || '16',
  )
  const rem = window.matchMedia('(min-width: 769px)').matches
    ? NAV_TOP_REM.desktop
    : NAV_TOP_REM.mobile
  return Math.round(rem * rootFontSize)
}

function resolveRootMargin() {
  const topPx = resolveNavTopPx()
  return `-${topPx}px 0px 0px 0px`
}

function resolveObserveTarget() {
  return (
    document.querySelector(HERO_SEARCH_SELECTOR) ??
    document.querySelector(HERO_SELECTOR)
  )
}

/** Smooth 0→1 easing for scroll-linked morph. */
function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/**
 * 0 = hero search fully visible, 1 = sticky header search fully visible.
 * Crossfades over MORPH_ZONE_PX as the pill scrolls toward the nav band.
 */
function resolveMorphProgress(target) {
  if (!target) return 0
  const rect = target.getBoundingClientRect()
  const navTop = resolveNavTopPx()
  const morphStart = navTop + MORPH_ZONE_PX
  const morphEnd = navTop - 8
  const raw = (morphStart - rect.bottom) / (morphStart - morphEnd)
  return smoothstep(raw)
}

/**
 * Scroll-linked morph progress for hero → sticky search bar transition.
 * Returns { progress: 0..1, isPastHero: progress >= 0.92 }.
 */
export function useHeroStickySearch(enabled = true) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    const target = resolveObserveTarget()
    if (!target) return undefined

    let rafId = 0

    const sync = () => {
      rafId = 0
      const el = resolveObserveTarget()
      if (!el) return
      setProgress(resolveMorphProgress(el))
    }

    const scheduleSync = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(sync)
    }

    sync()

    let observer = new IntersectionObserver(
      () => scheduleSync(),
      {
        root: null,
        rootMargin: resolveRootMargin(),
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    observer.observe(target)

    const media = window.matchMedia('(min-width: 769px)')
    const onBreakpointChange = () => {
      observer.disconnect()
      const nextTarget = resolveObserveTarget()
      if (!nextTarget) return

      observer = new IntersectionObserver(
        () => scheduleSync(),
        {
          root: null,
          rootMargin: resolveRootMargin(),
          threshold: [0, 0.25, 0.5, 0.75, 1],
        },
      )
      observer.observe(nextTarget)
      scheduleSync()
    }

    media.addEventListener('change', onBreakpointChange)
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync, { passive: true })

    return () => {
      observer.disconnect()
      media.removeEventListener('change', onBreakpointChange)
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) {
    return { progress: 0, isPastHero: false }
  }

  return {
    progress,
    isPastHero: progress >= 0.92,
  }
}
