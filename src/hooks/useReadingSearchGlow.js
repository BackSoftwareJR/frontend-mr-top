import { useEffect, useRef } from 'react'
import { computeReadingFill, HERO_SCROLL_ZONE_END } from '../data/readingPathSchema'
import { useIsMobile } from '../utils/performanceTier'

/** Approximate hero pass range when ScrollReadingLine is not mounted (mobile). */
const MOBILE_HERO_GLOW_RANGE = {
  start: 0,
  end: HERO_SCROLL_ZONE_END,
  fillStart: HERO_SCROLL_ZONE_END * 0.12,
  fillEnd: HERO_SCROLL_ZONE_END * 0.9,
}

/**
 * Syncs reading-line data attributes on the hero search pill from scroll when
 * the reading line layer is absent (mobile). Border visibility is always-on;
 * desktop uses ScrollReadingLine CtaFillSync for the same data attributes.
 */
export function useReadingSearchGlow() {
  const pillRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) return undefined

    const el = pillRef.current
    if (!el) return undefined

    let rafId = 0

    const apply = () => {
      rafId = 0
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      const progress = window.scrollY / maxScroll
      const fill = computeReadingFill(progress, MOBILE_HERO_GLOW_RANGE)

      el.dataset.readingActive = fill > 0.08 ? 'true' : 'false'
      el.dataset.readingLocked = fill >= 1 ? 'true' : 'false'
    }

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  return pillRef
}
