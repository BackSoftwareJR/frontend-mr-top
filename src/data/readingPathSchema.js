/**
 * Scroll reading line — document-space path through section anchors.
 * Hero dot → hero CTA pass-through (L→R) → vertical descent → stats pass-through → … → final CTA pass-through.
 */

/** Nav morph spring (shared with sticky header) */
export const MORPH_SPRING = {
  stiffness: 72,
  damping: 28,
  mass: 0.85,
}

/** Narrative order for DOM anchors (pass-through / orbit points injected after CTAs) */
export const ANCHOR_ORDER = [
  'hero-dot',
  'hero-cta',
  'stats',
  'personalized',
  'testimonials',
  'trust',
  'faq',
  'cta-final',
]

/** Stat cards in left→right reading order (horizontal pass-through) */
export const STAT_CARD_ANCHORS = [
  'stats-famiglie',
  'stats-risposta',
  'stats-strutture',
  'stats-soddisfazione',
]

export const CTA_GLOW_SEGMENTS = ['hero-cta', 'personalized-cta', 'cta-final']

/** Precomputed samples along path for cursor interpolation (no per-frame getPointAtLength) */
export const PROGRESS_LOOKUP_SAMPLES = 192

/** Vertical drop from hero period anchor toward the hero CTA (~5rem) */
export const HERO_VERTICAL_DROP = 80

/** CTA orbit geometry — final CTA uses elliptical arc */
export const CTA_ORBIT_SIDE_PAD = 20
export const CTA_ORBIT_DEPTH = 14
export const CTA_ORBIT_CENTER_DIP = 4

/** Hero pass-through: horizontal pad beyond pill left/right edges */
export const HERO_PASS_SIDE_PAD = CTA_ORBIT_SIDE_PAD

/** Stats row pass-through: horizontal pad beyond outer card edges */
export const STATS_PASS_SIDE_PAD = CTA_ORBIT_SIDE_PAD

/** Dot stays inside viewport with this margin (~5rem / 80px) */
export const DOT_VIEWPORT_MARGIN = 80
export const DOT_SIZE = 12

/** Stroke width on the reading path (must match ScrollReadingLine) */
export const READING_STROKE_WIDTH = 2.5

/** Nudge dot back along path so fill overlaps round stroke cap (px) */
export const PATH_TIP_OVERLAP = 2.5

/** Distance above line-box bottom for period center, in em units */
export const PERIOD_ANCHOR_Y_RATIO = 0.38
export const PERIOD_ANCHOR_X_OFFSET = 0

/** Scroll → path remap table resolution */
export const SCROLL_REMAP_SAMPLES = 96

/** Scroll → path progress shaping (fallback only when remap table is empty) */
export const PATH_REVEAL_CURVE = [0, 0, 1, 1]
export const PATH_REVEAL_PROGRESS = [0, 0, 1, 1]

/** Scroll fraction to complete hero CTA pass — tight coupling to wheel */
export const HERO_SCROLL_ZONE_END = 0.1

/** Blend scroll band after hero before next linear band / viewport remap */
export const HERO_SCROLL_BLEND = 0.03

/** Blend after bento vertical descent before viewport remap */
export const DESCENT_SCROLL_BLEND = 0.025

/** Mobile breakpoint — matches ScrollReadingLine matchMedia query */
export const MOBILE_BREAKPOINT = 768

/** Mobile: hero linear band — keep tight so descent starts early */
export const MOBILE_HERO_SCROLL_ZONE_END = 0.1

/** Mobile: cap for descent linear band (anchor measurement may go lower) */
export const MOBILE_DESCENT_SCROLL_ZONE_MAX = 0.64

/** Mobile: lighter blend after descent before tail / optional remap */
export const MOBILE_DESCENT_SCROLL_BLEND = 0.012

/** Mobile: skip viewport-constrained remap that stalls pathIdx while scrollY advances */
export const MOBILE_USE_VIEWPORT_REMAP = false

/** Mobile: scale scroll progress so path keeps pace with finger scroll */
export const MOBILE_SCROLL_PROGRESS_MULTIPLIER = 1.38

/** Mobile tail: power < 1 advances path faster early in the post-descent band */
export const MOBILE_TAIL_PROGRESS_POWER = 0.72

/** Horizontal sway for wavy vertical descent (px, ±) */
export const WAVY_VERTICAL_AMPLITUDE = 64

/** Vertical sway for wavy horizontal pass-through (px, ±) */
export const WAVY_HORIZONTAL_AMPLITUDE = 26

/** Cubic segments along a wavy vertical drop (2–3) */
export const WAVY_VERTICAL_SEGMENTS = 3

/** Fallback document-space points when anchors are not yet measured */
export const FALLBACK_PATH_POINTS = [
  { x: 0.72, y: 0.12, normalized: true },
  { x: 0.5, y: 0.18, normalized: true },
  { x: 0.5, y: 0.22, normalized: true },
  { x: 0.62, y: 0.24, normalized: true },
  { x: 0.68, y: 0.28, normalized: true },
  { x: 0.5, y: 0.32, normalized: true },
  { x: 0.22, y: 0.38, normalized: true },
  { x: 0.5, y: 0.44, normalized: true },
  { x: 0.78, y: 0.5, normalized: true },
  { x: 0.28, y: 0.58, normalized: true },
  { x: 0.72, y: 0.66, normalized: true },
  { x: 0.24, y: 0.74, normalized: true },
  { x: 0.58, y: 0.82, normalized: true },
  { x: 0.76, y: 0.9, normalized: true },
  { x: 0.5, y: 0.96, normalized: true },
]

/** Actual pill button inside a CTA anchor wrapper */
export function resolveCtaButtonEl(wrapEl) {
  if (!wrapEl) return null
  return (
    wrapEl.querySelector('.reading-line-cta') ??
    wrapEl.querySelector('a, button') ??
    wrapEl
  )
}

/** Optical center of the trailing period glyph (not the line box) */
export function measurePeriodAnchor(el) {
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const range = document.createRange()

  try {
    const textNode =
      el.firstChild?.nodeType === Node.TEXT_NODE ? el.firstChild : null

    if (textNode?.length) {
      const last = textNode.length - 1
      range.setStart(textNode, last)
      range.setEnd(textNode, textNode.length)
    } else {
      range.selectNodeContents(el)
    }

    const rects = range.getClientRects()
    const rect = rects[rects.length - 1] ?? range.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      const style = window.getComputedStyle(el)
      const fontSize = Number.parseFloat(style.fontSize) || rect.height
      // Client rect is often full line-box height; anchor near baseline, not box center.
      const baselineY = rect.bottom - fontSize * PERIOD_ANCHOR_Y_RATIO
      return {
        x: rect.left + rect.width / 2 + scrollX + PERIOD_ANCHOR_X_OFFSET,
        y: baselineY + scrollY,
      }
    }
  } catch {
    /* fallback below */
  }

  const rect = el.getBoundingClientRect()
  const style = window.getComputedStyle(el)
  const fontSize = Number.parseFloat(style.fontSize) || rect.height
  return {
    x: rect.left + rect.width / 2 + scrollX + PERIOD_ANCHOR_X_OFFSET,
    y: rect.bottom - fontSize * PERIOD_ANCHOR_Y_RATIO + scrollY,
  }
}

/** Center of an element in document coordinates */
export function measureDocumentPoint(el, options = {}) {
  const { align = 'center' } = options
  if (align === 'period-anchor') {
    return measurePeriodAnchor(el)
  }

  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  }
}

/**
 * CTA pass-through — enter left (vertical center), exit right.
 * Bridge ends at entry; fill syncs to horizontal segment.
 */
export function buildCtaPassThroughPoints(ctaEl, glowSegment, sidePad = HERO_PASS_SIDE_PAD) {
  const btn = resolveCtaButtonEl(ctaEl) ?? ctaEl
  const rect = btn.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const left = rect.left + scrollX
  const right = rect.right + scrollX
  const top = rect.top + scrollY
  const bottom = rect.bottom + scrollY
  const cy = (top + bottom) / 2
  const passMeta = { synthetic: true, glowSegment, passThrough: true }

  return [
    { ...passMeta, passRole: 'entry', x: left - sidePad, y: cy },
    { ...passMeta, passRole: 'exit', x: right + sidePad, y: cy },
  ]
}

/** Hero CTA pass-through (alias) */
export function buildHeroCtaPassThroughPoints(ctaEl) {
  return buildCtaPassThroughPoints(ctaEl, 'hero-cta', HERO_PASS_SIDE_PAD)
}

/**
 * Vertical descent from hero CTA exit to stats row entry (left edge, row center).
 * SVG uses a monotonic bridge (drop then glide) — no horizontal backtrack.
 */
export function buildVerticalDescentPoints(fromExit, statsEntry) {
  return [
    {
      synthetic: true,
      bridge: 'vertical-descent',
      x: statsEntry.x,
      y: statsEntry.y,
    },
  ]
}

/**
 * Stats row pass-through — enter left (vertical center), exit right.
 * Per-card fill ranges are computed from card DOM rects.
 */
export function buildStatsPassThroughPoints(statCardEls) {
  if (!statCardEls.length) return []

  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const rects = statCardEls.map((el) => el.getBoundingClientRect())
  const tops = rects.map((r) => r.top + scrollY)
  const bottoms = rects.map((r) => r.bottom + scrollY)
  const cy = (Math.min(...tops) + Math.max(...bottoms)) / 2
  const left = Math.min(...rects.map((r) => r.left + scrollX))
  const right = Math.max(...rects.map((r) => r.right + scrollX))
  const pad = STATS_PASS_SIDE_PAD
  const passMeta = { synthetic: true, glowSegment: 'stats-pass', passThrough: true }

  const points = [
    { ...passMeta, passRole: 'entry', x: left - pad, y: cy },
  ]

  statCardEls.forEach((el, index) => {
    const rect = el.getBoundingClientRect()
    points.push({
      ...passMeta,
      passRole: 'card',
      cardAnchor: STAT_CARD_ANCHORS[index],
      x: rect.right + scrollX,
      y: cy,
    })
  })

  points.push({ ...passMeta, passRole: 'exit', x: right + pad, y: cy })
  return points
}

/** Bridge ends at pass-through entry (left of pill, vertical center) */
function computeHeroPassThroughEntry(ctaEl) {
  return buildHeroCtaPassThroughPoints(ctaEl)[0]
}

/** Final CTA orbit entry — bridge ends here, arc begins here */
function computeCtaOrbitEntry(ctaEl, entryPoint, variant = 'final') {
  const btn = resolveCtaButtonEl(ctaEl) ?? ctaEl
  const rect = btn.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const left = rect.left + scrollX
  const right = rect.right + scrollX
  const top = rect.top + scrollY
  const bottom = rect.bottom + scrollY
  const cx = (left + right) / 2
  const btnW = right - left
  const btnH = bottom - top
  const pad = CTA_ORBIT_SIDE_PAD + 6

  const entryX = entryPoint?.x ?? cx - btnW * 0.18
  const entryY = entryPoint?.y ?? top + btnH * 0.55

  return {
    x: Math.max(left - pad * 0.28, Math.min(entryX, cx - btnW * 0.12)),
    y: Math.max(top + btnH * 0.48, Math.min(entryY, top + btnH * 0.72)),
  }
}

/** Point on an axis-aligned ellipse in document space */
function ellipsePoint(cx, cy, rx, ry, theta) {
  return {
    x: cx + rx * Math.cos(theta),
    y: cy + ry * Math.sin(theta),
  }
}

/** Elliptical arc under the final CTA pill */
export function buildCtaOrbitPoints(ctaEl, entryPoint) {
  const btn = resolveCtaButtonEl(ctaEl) ?? ctaEl
  const rect = btn.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const left = rect.left + scrollX
  const right = rect.right + scrollX
  const top = rect.top + scrollY
  const bottom = rect.bottom + scrollY
  const cx = (left + right) / 2
  const btnW = right - left
  const btnH = bottom - top

  const pad = CTA_ORBIT_SIDE_PAD + 6
  const depth = CTA_ORBIT_DEPTH + 8
  const glowSegment = 'cta-final'
  const orbitMeta = { synthetic: true, glowSegment, orbit: true }

  const rx = btnW / 2 + pad
  const ry = depth + btnH * 0.14 + CTA_ORBIT_CENTER_DIP
  const orbitCY = bottom + ry * 0.42

  const entryAngle = Math.PI * 1.06
  const leftAngle = Math.PI * 0.74
  const dipAngle = Math.PI * 0.5
  const rightAngle = Math.PI * 0.26
  const exitAngle = -Math.PI * 0.06

  const onEllipseEntry = ellipsePoint(cx, orbitCY, rx, ry, entryAngle)
  const entry = { x: onEllipseEntry.x, y: onEllipseEntry.y }

  const dip = ellipsePoint(cx, orbitCY, rx, ry, dipAngle)
  dip.y = Math.max(dip.y, bottom + depth * 0.65)

  const exit = ellipsePoint(cx, orbitCY, rx, ry * 0.92, exitAngle)
  exit.x += pad * 0.32
  exit.y += depth * 0.18

  const orbitGeom = {
    cx,
    cy: orbitCY,
    rx,
    ry,
    entryAngle,
    leftAngle,
    dipAngle,
    rightAngle,
    exitAngle,
  }

  return [
    { ...orbitMeta, orbitRole: 'entry', orbitGeom, x: entry.x, y: entry.y },
    {
      ...orbitMeta,
      orbitRole: 'left',
      orbitGeom,
      ...ellipsePoint(cx, orbitCY, rx, ry, leftAngle),
    },
    {
      ...orbitMeta,
      orbitRole: 'dip',
      orbitGeom,
      ...ellipsePoint(cx, orbitCY, rx, ry, dipAngle),
    },
    {
      ...orbitMeta,
      orbitRole: 'right',
      orbitGeom,
      ...ellipsePoint(cx, orbitCY, rx, ry, rightAngle),
    },
    { ...orbitMeta, orbitRole: 'exit', orbitGeom, x: exit.x, y: exit.y },
  ]
}

/** Hero bridge end marker (SVG built via explicit cubics, not polyline waypoints) */
export function buildHeroBridgePoints(periodPoint, ctaEl, passEntryPoint) {
  const passEntry = passEntryPoint ?? computeHeroPassThroughEntry(ctaEl)
  const bridgeMeta = { synthetic: true, bridge: 'hero-drop' }

  return [
    {
      ...bridgeMeta,
      x: passEntry.x,
      y: passEntry.y,
    },
  ]
}

function shouldSkipSectionBridge(curr, next) {
  if (curr.synthetic || next.synthetic) return true
  if (curr.glowSegment || next.glowSegment) return true
  if (curr.orbit || next.orbit) return true
  if (curr.passThrough || next.passThrough) return true
  if (curr.bridge === 'hero-drop' || next.bridge === 'hero-drop') return true
  if (curr.bridge === 'vertical-descent' || next.bridge === 'vertical-descent') return true
  if (curr.anchorId === 'hero-dot' || next.anchorId === 'hero-cta') return true
  if (curr.glowSegment === 'hero-cta' || next.glowSegment === 'hero-cta') return true
  if (curr.glowSegment === 'stats-pass' || next.glowSegment === 'stats-pass') return true
  if (curr.glowSegment === 'personalized-cta' || next.glowSegment === 'personalized-cta') return true
  if (curr.glowSegment === 'cta-final' || next.glowSegment === 'cta-final') return true
  if (curr.anchorId && next.anchorId) return true
  return false
}

/** Insert easing midpoints between anchors to avoid long straight vertical segments */
export function injectSectionBridges(pathPoints) {
  if (pathPoints.length < 2) return pathPoints

  const bridged = [pathPoints[0]]

  for (let i = 0; i < pathPoints.length - 1; i += 1) {
    const curr = pathPoints[i]
    const next = pathPoints[i + 1]

    if (!shouldSkipSectionBridge(curr, next)) {
      const dx = next.x - curr.x
      const dy = next.y - curr.y
      const dist = Math.hypot(dx, dy)

      if (dist > 48) {
        const verticalRatio = Math.abs(dy) / (dist || 1)

        if (verticalRatio > 0.72) {
          bridged.push(
            {
              x: curr.x + dx * 0.18,
              y: curr.y + dy * 0.34,
              synthetic: true,
              bridge: 'vertical-ease',
            },
            {
              x: curr.x + dx * 0.82,
              y: curr.y + dy * 0.66,
              synthetic: true,
              bridge: 'vertical-ease',
            },
          )
        } else if (dist > 140) {
          const perpX = (-dy / dist) * Math.min(56, dist * 0.14)
          const perpY = (dx / dist) * Math.min(56, dist * 0.14)
          bridged.push({
            x: (curr.x + next.x) / 2 + perpX,
            y: (curr.y + next.y) / 2 + perpY,
            synthetic: true,
            bridge: 'arc-mid',
          })
        }
      }
    }

    bridged.push(next)
  }

  return bridged
}

function smoothstep(t) {
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u)
}

/** Map raw scroll progress to path progress with smooth ease at start/end */
export function mapScrollToPathProgress(scrollProgress) {
  if (scrollProgress <= 0) return 0
  if (scrollProgress >= 1) return 1

  const [s0, s1, s2, s3] = PATH_REVEAL_CURVE
  const [p0, p1, p2, p3] = PATH_REVEAL_PROGRESS

  if (scrollProgress <= s1) {
    const t = smoothstep((scrollProgress - s0) / (s1 - s0 || 1))
    return p0 + (p1 - p0) * t
  }
  if (scrollProgress <= s2) {
    const t = smoothstep((scrollProgress - s1) / (s2 - s1 || 1))
    return p1 + (p2 - p1) * t
  }
  const t = smoothstep((scrollProgress - s2) / (s3 - s2 || 1))
  return p2 + (p3 - p2) * t
}

/**
 * Build scroll → path remap so the dot (on the path) stays inside the viewport.
 * Returns monotonic samples: [{ scrollProgress, pathProgress }].
 */
export function buildScrollPathRemap(lookup, viewportHeight, margin = DOT_VIEWPORT_MARGIN) {
  const { samples } = lookup
  if (!samples.length || !viewportHeight) return []

  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    1,
  )
  const safeTop = margin
  const safeBottom = viewportHeight - margin
  const remap = [{ scrollProgress: 0, pathProgress: 0 }]
  let pathIdx = 0

  for (let i = 1; i <= SCROLL_REMAP_SAMPLES; i += 1) {
    const scrollProgress = i / SCROLL_REMAP_SAMPLES
    const scrollY = scrollProgress * maxScroll

    let bestIdx = pathIdx
    for (let j = pathIdx; j < samples.length; j += 1) {
      const vpY = samples[j].y - scrollY
      if (vpY >= safeTop && vpY <= safeBottom) {
        bestIdx = j
      } else if (vpY > safeBottom) {
        break
      }
    }

    if (bestIdx === pathIdx && pathIdx < samples.length - 1) {
      let closestIdx = pathIdx
      let closestDist = Infinity
      const targetY = (safeTop + safeBottom) / 2

      for (let j = pathIdx; j < samples.length; j += 1) {
        const vpY = samples[j].y - scrollY
        const dist = Math.abs(vpY - targetY)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = j
        }
        if (samples[j].y - scrollY < safeTop - margin) break
      }

      bestIdx = Math.max(pathIdx, closestIdx)
    }

    pathIdx = Math.max(pathIdx, bestIdx)

    let pathProgress = samples[pathIdx].t
    if (pathIdx > 0 && pathIdx < samples.length - 1) {
      const prev = samples[pathIdx - 1]
      const curr = samples[pathIdx]
      const prevVpY = prev.y - scrollY
      const currVpY = curr.y - scrollY
      const targetY = (safeTop + safeBottom) / 2
      const span = currVpY - prevVpY

      if (Math.abs(span) > 1) {
        const u = smoothstep((targetY - prevVpY) / span)
        pathProgress = prev.t + (curr.t - prev.t) * u
      }
    }

    remap.push({
      scrollProgress,
      pathProgress: Math.max(remap[remap.length - 1].pathProgress, pathProgress),
    })
  }

  remap[remap.length - 1].pathProgress = 1
  return remap
}

/** Interpolate viewport-aware path progress from precomputed remap table */
export function applyScrollPathRemap(scrollProgress, remapTable) {
  if (!remapTable?.length) return scrollProgress
  if (scrollProgress <= 0) return 0
  if (scrollProgress >= 1) return 1

  let lo = 0
  let hi = remapTable.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (remapTable[mid].scrollProgress <= scrollProgress) lo = mid
    else hi = mid
  }

  const a = remapTable[lo]
  const b = remapTable[hi]
  const span = b.scrollProgress - a.scrollProgress || 1
  const u = (scrollProgress - a.scrollProgress) / span
  const eased = u * u * (3 - 2 * u)

  return a.pathProgress + (b.pathProgress - a.pathProgress) * eased
}

/**
 * Desktop scroll → path progress (unchanged).
 * Hero + bento descent use 1:1 scroll→path; remainder uses viewport remap (raw scroll, no ease).
 */
function resolveDesktopReadingPathProgress(scrollProgress, remapTable, zoneConfig) {
  const heroEnd = zoneConfig?.pathEnd ?? 0
  const heroScrollEnd = zoneConfig?.scrollEnd ?? HERO_SCROLL_ZONE_END
  const descentEnd = zoneConfig?.descentPathEnd ?? 0
  const descentScrollEnd = zoneConfig?.descentScrollEnd ?? 0
  const descentBlendEnd =
    descentScrollEnd + (zoneConfig?.descentScrollBlend ?? DESCENT_SCROLL_BLEND)

  let pathProgress

  if (heroEnd > 0 && scrollProgress <= heroScrollEnd) {
    const t = scrollProgress / (heroScrollEnd || 1)
    pathProgress = Math.min(heroEnd, t * heroEnd)
  } else if (
    descentEnd > heroEnd &&
    descentScrollEnd > heroScrollEnd &&
    scrollProgress <= descentScrollEnd
  ) {
    const span = descentScrollEnd - heroScrollEnd || 1
    const t = (scrollProgress - heroScrollEnd) / span
    pathProgress = heroEnd + t * (descentEnd - heroEnd)
  } else {
    const remapped = applyScrollPathRemap(scrollProgress, remapTable)

    if (
      descentEnd > heroEnd &&
      descentScrollEnd > heroScrollEnd &&
      scrollProgress <= descentBlendEnd
    ) {
      const t = smoothstep(
        (scrollProgress - descentScrollEnd) / (descentBlendEnd - descentScrollEnd || 1),
      )
      pathProgress = descentEnd + Math.max(0, remapped - descentEnd) * t
    } else {
      pathProgress = remapped
    }
  }

  if (heroEnd > 0 && scrollProgress > heroScrollEnd) {
    pathProgress = Math.max(pathProgress, heroEnd)
  }
  if (descentEnd > heroEnd && scrollProgress > descentScrollEnd) {
    pathProgress = Math.max(pathProgress, descentEnd)
  }

  return pathProgress
}

/** Linear tail after hero/descent bands when viewport remap is off (mobile) */
function resolveMobileLinearTail(scrollProgress, zoneConfig) {
  const heroEnd = zoneConfig?.pathEnd ?? 0
  const heroScrollEnd = zoneConfig?.scrollEnd ?? MOBILE_HERO_SCROLL_ZONE_END
  const descentEnd = zoneConfig?.descentPathEnd ?? 0
  const descentScrollEnd = zoneConfig?.descentScrollEnd ?? 0

  const tailScrollStart =
    descentScrollEnd > heroScrollEnd ? descentScrollEnd : heroScrollEnd
  const tailPathStart = descentEnd > heroEnd ? descentEnd : heroEnd

  if (scrollProgress <= tailScrollStart) {
    return tailPathStart
  }

  const span = 1 - tailScrollStart || 1
  const t = (scrollProgress - tailScrollStart) / span
  const eased = Math.pow(Math.max(0, Math.min(1, t)), MOBILE_TAIL_PROGRESS_POWER)
  return tailPathStart + eased * (1 - tailPathStart)
}

/**
 * Mobile scroll → path progress.
 * Extended 1:1 hero + descent bands; optional lighter remap or linear tail.
 */
function resolveMobileReadingPathProgress(scrollProgress, remapTable, zoneConfig) {
  const heroEnd = zoneConfig?.pathEnd ?? 0
  const heroScrollEnd = zoneConfig?.scrollEnd ?? MOBILE_HERO_SCROLL_ZONE_END
  const descentEnd = zoneConfig?.descentPathEnd ?? 0
  const descentScrollEnd = zoneConfig?.descentScrollEnd ?? 0
  const descentBlendEnd =
    descentScrollEnd + (zoneConfig?.descentScrollBlend ?? MOBILE_DESCENT_SCROLL_BLEND)
  const useViewportRemap = zoneConfig?.useViewportRemap ?? MOBILE_USE_VIEWPORT_REMAP

  let pathProgress

  if (heroEnd > 0 && scrollProgress <= heroScrollEnd) {
    const t = scrollProgress / (heroScrollEnd || 1)
    pathProgress = Math.min(heroEnd, t * heroEnd)
  } else if (
    descentEnd > heroEnd &&
    descentScrollEnd > heroScrollEnd &&
    scrollProgress <= descentScrollEnd
  ) {
    const span = descentScrollEnd - heroScrollEnd || 1
    const t = (scrollProgress - heroScrollEnd) / span
    pathProgress = heroEnd + t * (descentEnd - heroEnd)
  } else if (useViewportRemap && remapTable?.length) {
    const remapped = applyScrollPathRemap(scrollProgress, remapTable)

    if (
      descentEnd > heroEnd &&
      descentScrollEnd > heroScrollEnd &&
      scrollProgress <= descentBlendEnd
    ) {
      const t = smoothstep(
        (scrollProgress - descentScrollEnd) / (descentBlendEnd - descentScrollEnd || 1),
      )
      pathProgress = descentEnd + Math.max(0, remapped - descentEnd) * t
    } else {
      pathProgress = remapped
    }
  } else {
    pathProgress = resolveMobileLinearTail(scrollProgress, zoneConfig)
  }

  if (heroEnd > 0 && scrollProgress > heroScrollEnd) {
    pathProgress = Math.max(pathProgress, heroEnd)
  }
  if (descentEnd > heroEnd && scrollProgress > descentScrollEnd) {
    pathProgress = Math.max(pathProgress, descentEnd)
  }

  return pathProgress
}

/**
 * Combined scroll → path progress.
 * Desktop: hero + descent 1:1, then viewport remap.
 * Mobile: extended linear bands; remap disabled by default.
 */
export function resolveReadingPathProgress(
  scrollProgress,
  remapTable,
  zoneConfig,
  { isMobile = false } = {},
) {
  if (!isMobile) {
    return resolveDesktopReadingPathProgress(scrollProgress, remapTable, zoneConfig)
  }
  const adjusted = Math.min(
    1,
    scrollProgress * MOBILE_SCROLL_PROGRESS_MULTIPLIER,
  )
  return resolveMobileReadingPathProgress(adjusted, remapTable, zoneConfig)
}

/** Hero + bento descent scroll zones from measured path waypoints */
export function computeReadingPathZoneConfig(
  pathEl,
  points,
  viewportHeight,
  { isMobile = false } = {},
) {
  const heroScrollEnd = isMobile ? MOBILE_HERO_SCROLL_ZONE_END : HERO_SCROLL_ZONE_END
  const scrollBlend = isMobile ? MOBILE_DESCENT_SCROLL_BLEND : HERO_SCROLL_BLEND
  const descentScrollBlend = isMobile ? MOBILE_DESCENT_SCROLL_BLEND : DESCENT_SCROLL_BLEND
  const descentScrollMax = isMobile ? MOBILE_DESCENT_SCROLL_ZONE_MAX : 0.38
  const descentScrollMinGap = isMobile ? 0.06 : 0.05
  const statsViewportRatio = isMobile ? 0.28 : 0.46

  const total = pathEl?.getTotalLength?.() ?? 0
  if (!total || !viewportHeight || typeof document === 'undefined') {
    return {
      pathEnd: 0,
      scrollEnd: heroScrollEnd,
      scrollBlend,
      isMobile,
      useViewportRemap: isMobile ? MOBILE_USE_VIEWPORT_REMAP : true,
    }
  }

  const glowRanges = computeCtaGlowRanges(pathEl, points)
  const heroRange = glowRanges.find((r) => r.id === 'hero-cta')
  const heroEnd = heroRange?.end ?? 0

  const statsEntryIdx = points.findIndex(
    (p) => p.glowSegment === 'stats-pass' && p.passRole === 'entry',
  )
  if (statsEntryIdx < 0) {
    return {
      pathEnd: heroEnd,
      scrollEnd: heroScrollEnd,
      scrollBlend,
      isMobile,
      useViewportRemap: isMobile ? MOBILE_USE_VIEWPORT_REMAP : true,
    }
  }

  const waypointLengths = measureWaypointLengths(pathEl, points)
  const descentPathEnd = (waypointLengths[statsEntryIdx] ?? 0) / total
  const statsEntryY = points[statsEntryIdx].y
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    1,
  )

  let scrollYTarget = statsEntryY - viewportHeight * statsViewportRatio
  if (isMobile && typeof document !== 'undefined') {
    const bentoEl = document.querySelector('[data-scroll-anchor="bento"]')
    if (bentoEl) {
      const bentoTop = bentoEl.getBoundingClientRect().top + window.scrollY
      scrollYTarget = Math.min(
        scrollYTarget,
        bentoTop - viewportHeight * 0.14,
      )
    }
  }

  const descentScrollEnd = Math.min(
    descentScrollMax,
    Math.max(heroScrollEnd + descentScrollMinGap, scrollYTarget / maxScroll),
  )

  return {
    pathEnd: heroEnd,
    scrollEnd: heroScrollEnd,
    scrollBlend,
    descentPathEnd,
    descentScrollEnd,
    descentScrollBlend,
    isMobile,
    useViewportRemap: isMobile ? MOBILE_USE_VIEWPORT_REMAP : true,
  }
}

/** Fill amount 0…1 while the reading line sweeps a CTA segment */
export function computeReadingFill(progress, range) {
  const fillStart = range.fillStart ?? range.start
  const fillEnd = range.fillEnd ?? range.end

  if (progress <= 0 || progress < fillStart) return 0
  if (progress >= fillEnd) return 1
  return (progress - fillStart) / (fillEnd - fillStart || 1)
}

function fmt(n) {
  return n.toFixed(1)
}

/** Gentle cubic from orbit exit to the next anchor — controls stay monotonic downward */
function buildSectionConnector(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y

  return (
    ` C ${fmt(from.x + dx * 0.06)} ${fmt(from.y + dy * 0.28)}, ${fmt(to.x - dx * 0.04)} ${fmt(from.y + dy * 0.62)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** Clamp x between endpoints so bridge control points never backtrack horizontally */
function clampMonotonicBridgeX(fromX, toX, x) {
  const lo = Math.min(fromX, toX)
  const hi = Math.max(fromX, toX)
  return Math.max(lo, Math.min(hi, x))
}

const clampHeroBridgeX = clampMonotonicBridgeX

/**
 * Two cubics: period → hero CTA pass entry.
 * Drops vertically on the period column (avoids looping behind headline copy),
 * then glides left with monotonic X and a horizontal tangent into the left entry.
 */
function buildHeroBridgeBezierSuffix(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const spanX = Math.abs(dx)
  const drop = Math.max(HERO_VERTICAL_DROP * 0.42, Math.abs(dy) * 0.14, 28)
  const lead = Math.min(36, Math.max(14, spanX * 0.1))

  const midDrop = { x: from.x, y: from.y + dy * 0.52 }
  const cp1 = { x: from.x, y: from.y + drop * 0.38 }
  const cp2 = { x: from.x, y: midDrop.y - Math.abs(dy) * 0.06 }

  const cp3 = {
    x: clampHeroBridgeX(from.x, to.x, from.x + dx * 0.58),
    y: from.y + dy * 0.82,
  }
  const cp4 = {
    x: clampHeroBridgeX(from.x, to.x, to.x + Math.sign(dx || -1) * lead * 0.28),
    y: to.y,
  }

  return (
    ` C ${fmt(cp1.x)} ${fmt(cp1.y)}, ${fmt(cp2.x)} ${fmt(cp2.y)}, ${fmt(midDrop.x)} ${fmt(midDrop.y)}` +
    ` C ${fmt(cp3.x)} ${fmt(cp3.y)}, ${fmt(cp4.x)} ${fmt(cp4.y)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** Single flat horizontal cubic — L→R pass, no interior waypoints */
function buildFlatHorizontalPassSuffix(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return ''

  return (
    ` C ${fmt(from.x + dx * 0.33)} ${fmt(from.y)}, ${fmt(from.x + dx * 0.67)} ${fmt(to.y)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** CTA pass-through — wavy approach + flat horizontal sweep */
function buildCtaPassThroughSuffix(passPoints, fromPoint, horizontalAmp = WAVY_HORIZONTAL_AMPLITUDE * 0.38) {
  const entry = passPoints.find((p) => p.passRole === 'entry') ?? passPoints[0]
  const exit = passPoints.find((p) => p.passRole === 'exit') ?? passPoints[passPoints.length - 1]
  let d = ''

  if (
    fromPoint &&
    entry &&
    Math.hypot(fromPoint.x - entry.x, fromPoint.y - entry.y) > 2
  ) {
    d += buildWavyConnectorSuffix(fromPoint, entry)
  }

  if (!exit) return d

  const from = { x: entry?.x ?? exit.x, y: entry?.y ?? exit.y }
  return d + buildWavyHorizontalSuffix(from, exit, horizontalAmp)
}

/** Hero CTA pass-through — one flat horizontal cubic (entry → exit) */
function buildHeroPassThroughSuffix(passPoints) {
  const entry = passPoints.find((p) => p.passRole === 'entry') ?? passPoints[0]
  const exit = passPoints.find((p) => p.passRole === 'exit') ?? passPoints[passPoints.length - 1]
  if (!entry || !exit) return ''

  return buildFlatHorizontalPassSuffix(
    { x: entry.x, y: entry.y },
    { x: exit.x, y: exit.y },
  )
}

/** Order stats pass waypoints: entry → cards (L→R) → exit */
function orderStatsPassPoints(passPoints) {
  const entry = passPoints.find((p) => p.passRole === 'entry') ?? passPoints[0]
  const exit = passPoints.find((p) => p.passRole === 'exit') ?? passPoints[passPoints.length - 1]
  const cards = passPoints
    .filter((p) => p.passRole === 'card')
    .sort((a, b) => a.x - b.x)

  return [entry, ...cards, exit].filter(Boolean)
}

/**
 * Two cubics: hero exit → stats row entry.
 * Drops vertically on the hero column, then glides with monotonic X into the left entry.
 */
function buildStatsBridgeBezierSuffix(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const spanX = Math.abs(dx)
  const drop = Math.max(HERO_VERTICAL_DROP * 0.42, Math.abs(dy) * 0.14, 28)
  const lead = Math.min(36, Math.max(14, spanX * 0.1))

  const midDrop = { x: from.x, y: from.y + dy * 0.52 }
  const cp1 = { x: from.x, y: from.y + drop * 0.38 }
  const cp2 = { x: from.x, y: midDrop.y - Math.abs(dy) * 0.06 }

  const cp3 = {
    x: clampMonotonicBridgeX(from.x, to.x, from.x + dx * 0.58),
    y: from.y + dy * 0.82,
  }
  const cp4 = {
    x: clampMonotonicBridgeX(from.x, to.x, to.x + Math.sign(dx || -1) * lead * 0.28),
    y: to.y,
  }

  return (
    ` C ${fmt(cp1.x)} ${fmt(cp1.y)}, ${fmt(cp2.x)} ${fmt(cp2.y)}, ${fmt(midDrop.x)} ${fmt(midDrop.y)}` +
    ` C ${fmt(cp3.x)} ${fmt(cp3.y)}, ${fmt(cp4.x)} ${fmt(cp4.y)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** Stats row pass-through — flat horizontal sweep, one card segment at a time */
function buildStatsPassThroughSuffix(passPoints, fromPoint) {
  const ordered = orderStatsPassPoints(passPoints)
  const entry = ordered[0]
  let d = ''

  if (
    fromPoint &&
    entry &&
    Math.hypot(fromPoint.x - entry.x, fromPoint.y - entry.y) > 2
  ) {
    if (Math.abs(fromPoint.y - entry.y) < 12) {
      d += buildFlatHorizontalPassSuffix(fromPoint, entry)
    } else {
      d += buildStatsBridgeBezierSuffix(fromPoint, entry)
    }
  }

  for (let i = 0; i < ordered.length - 1; i += 1) {
    d += buildFlatHorizontalPassSuffix(ordered[i], ordered[i + 1])
  }

  return d
}

/**
 * Wavy vertical drop — chained cubics with alternating horizontal sway (no axis-aligned L).
 */
export function buildWavyVerticalSuffix(from, to, amplitude = WAVY_VERTICAL_AMPLITUDE) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dy) < 2 && Math.abs(dx) < 2) return ''

  const amp = Math.min(
    amplitude,
    Math.max(40, Math.abs(dy) * 0.1),
    Math.abs(dx) * 0.42 + amplitude * 0.55,
  )
  const segments =
    Math.abs(dy) > 360
      ? WAVY_VERTICAL_SEGMENTS
      : Math.max(2, WAVY_VERTICAL_SEGMENTS - 1)

  let d = ''
  let px = from.x
  let py = from.y

  for (let s = 0; s < segments; s += 1) {
    const ex = from.x + dx * ((s + 1) / segments)
    const ey = from.y + dy * ((s + 1) / segments)
    const sway = amp * (s % 2 === 0 ? 1 : -1)
    const cp1x = px + (ex - px) * 0.14 + sway * 0.42
    const cp1y = py + (ey - py) * 0.36
    const cp2x = ex - (ex - px) * 0.14 + sway * 0.68
    const cp2y = ey - (ey - py) * 0.36
    d += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(ex)} ${fmt(ey)}`
    px = ex
    py = ey
  }

  return d
}

/**
 * Wavy horizontal pass — flat cubic chain with subtle vertical undulation (no L).
 */
export function buildWavyHorizontalSuffix(from, to, amplitude = WAVY_HORIZONTAL_AMPLITUDE) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return ''

  if (Math.abs(dx) < 2) {
    return (
      ` C ${fmt(from.x)} ${fmt(from.y + dy * 0.38)}, ${fmt(to.x)} ${fmt(to.y - dy * 0.38)}, ${fmt(to.x)} ${fmt(to.y)}`
    )
  }

  const amp = Math.min(amplitude, Math.abs(dx) * 0.07, Math.max(8, Math.abs(dy) + amplitude))
  const midX = from.x + dx * 0.5
  const midY = from.y + dy * 0.5

  return (
    ` C ${fmt(from.x + dx * 0.22)} ${fmt(from.y + amp)}, ${fmt(midX - dx * 0.12)} ${fmt(midY + amp * 0.55)}, ${fmt(midX)} ${fmt(midY)}` +
    ` C ${fmt(midX + dx * 0.12)} ${fmt(midY - amp * 0.55)}, ${fmt(from.x + dx * 0.78)} ${fmt(to.y - amp)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** Smooth connector between descent end and stats entry — S-curve, no 90° corner */
function buildWavyConnectorSuffix(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.hypot(dx, dy) < 2) return ''

  const verticalBias = Math.abs(dy) / (Math.hypot(dx, dy) || 1)
  if (verticalBias > 0.55) {
    return buildWavyVerticalSuffix(from, to, WAVY_VERTICAL_AMPLITUDE * 0.72)
  }

  const amp = Math.min(WAVY_HORIZONTAL_AMPLITUDE, Math.abs(dx) * 0.06)
  return (
    ` C ${fmt(from.x + dx * 0.22)} ${fmt(from.y + dy * 0.18 + amp)}, ${fmt(to.x - dx * 0.28)} ${fmt(from.y + dy * 0.72 - amp * 0.5)}, ${fmt(to.x)} ${fmt(to.y)}`
  )
}

/** Vertical drop from hero exit toward stats row — wavy S-curve descent */
function buildVerticalDescentSuffix(from, to) {
  return buildWavyVerticalSuffix(from, to)
}

/** Single cubic segment on an ellipse arc (no straight L segments) */
function buildEllipseArcCubic(cx, cy, rx, ry, t0, t1) {
  const dt = t1 - t0
  if (Math.abs(dt) < 1e-5) return ''

  const alpha = (4 / 3) * Math.tan(dt / 4)
  const cos0 = Math.cos(t0)
  const sin0 = Math.sin(t0)
  const cos1 = Math.cos(t1)
  const sin1 = Math.sin(t1)
  const x0 = cx + rx * cos0
  const y0 = cy + ry * sin0
  const x1 = cx + rx * cos1
  const y1 = cy + ry * sin1
  const cp1x = x0 - alpha * rx * sin0
  const cp1y = y0 + alpha * ry * cos0
  const cp2x = x1 + alpha * rx * sin1
  const cp2y = y1 - alpha * ry * cos1

  return ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(x1)} ${fmt(y1)}`
}

/** Short cubic from ellipse rim to padded exit waypoint (no L) */
function buildOrbitExitTail(orbitPoints) {
  const exit = orbitPoints.find((p) => p.orbitRole === 'exit')
  const geom = exit?.orbitGeom
  if (!exit || !geom) return ''

  const exitRy = geom.ry * 0.92
  const onEllipse = ellipsePoint(geom.cx, geom.cy, geom.rx, exitRy, geom.exitAngle)
  const dx = exit.x - onEllipse.x
  const dy = exit.y - onEllipse.y
  if (Math.hypot(dx, dy) < 2) return ''

  return (
    ` C ${fmt(onEllipse.x + dx * 0.42)} ${fmt(onEllipse.y + dy * 0.32)}, ${fmt(exit.x - dx * 0.18)} ${fmt(exit.y - dy * 0.22)}, ${fmt(exit.x)} ${fmt(exit.y)}`
  )
}

/** Wavy cubic chain between section anchors (tangent-continuous, no sharp Catmull corners) */
function buildSmoothSectionSuffix(points, startIndex = 0) {
  if (points.length < startIndex + 2) return ''

  let d = ''
  for (let i = startIndex; i < points.length - 1; i += 1) {
    const from = points[i]
    const to = points[i + 1]
    const span = Math.hypot(to.x - from.x, to.y - from.y)
    if (span < 2) continue

    const verticalBias = Math.abs(to.y - from.y) / span
    if (verticalBias > 0.58) {
      d += buildWavyVerticalSuffix(from, to, WAVY_VERTICAL_AMPLITUDE * 0.88)
    } else {
      d += buildWavyConnectorSuffix(from, to)
    }
  }

  return d
}

/** Catmull-Rom suffix (continues an open path) */
function buildCatmullRomSuffix(points, startIndex = 0) {
  if (points.length < startIndex + 2) return ''

  let d = ''
  for (let i = startIndex; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`
  }

  return d
}

/** Catmull-Rom → cubic-bezier SVG path through pixel points */
export function buildCatmullRomPath(points) {
  if (points.length < 2) return ''
  if (points.length === 2) {
    const a = points[0]
    const b = points[1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    return (
      `M ${fmt(a.x)} ${fmt(a.y)}` +
      ` C ${fmt(a.x + dx / 3)} ${fmt(a.y + dy / 3)}, ${fmt(b.x - dx / 3)} ${fmt(b.y - dy / 3)}, ${fmt(b.x)} ${fmt(b.y)}`
    )
  }

  return `M ${fmt(points[0].x)} ${fmt(points[0].y)}${buildCatmullRomSuffix(points, 0)}`
}

/** Cubic between two orbit waypoints with tangent-consistent handles */
function orbitCubicSegment(from, to, prev, next, tension = 0.42) {
  const inDx = to.x - (prev?.x ?? from.x)
  const inDy = to.y - (prev?.y ?? from.y)
  const outDx = (next?.x ?? to.x) - from.x
  const outDy = (next?.y ?? to.y) - from.y

  const cp1 = {
    x: from.x + inDx * tension,
    y: from.y + inDy * tension,
  }
  const cp2 = {
    x: to.x - outDx * tension,
    y: to.y - outDy * tension,
  }

  return ` C ${fmt(cp1.x)} ${fmt(cp1.y)}, ${fmt(cp2.x)} ${fmt(cp2.y)}, ${fmt(to.x)} ${fmt(to.y)}`
}

/** Final CTA orbit — ellipse arc cubics when geometry is available */
function buildFinalOrbitSuffix(orbitPoints) {
  const geom = orbitPoints[0]?.orbitGeom
  if (!geom) return buildOrbitBezierSuffix(orbitPoints, null)

  const { cx, cy, rx, ry, entryAngle, leftAngle, dipAngle, rightAngle, exitAngle } =
    geom

  const exitRy = ry * 0.92

  return (
    buildEllipseArcCubic(cx, cy, rx, ry, entryAngle, leftAngle) +
    buildEllipseArcCubic(cx, cy, rx, ry, leftAngle, dipAngle) +
    buildEllipseArcCubic(cx, cy, rx, ry, dipAngle, rightAngle) +
    buildEllipseArcCubic(cx, cy, rx, exitRy, rightAngle, exitAngle) +
    buildOrbitExitTail(orbitPoints)
  )
}

/** Smooth chain along orbit waypoints; optional bridge connector into entry */
function buildOrbitBezierSuffix(orbitPoints, fromPoint) {
  if (orbitPoints.length < 2) return ''

  if (orbitPoints.length === 2) {
    const a = orbitPoints[0]
    const b = orbitPoints[1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    return ` C ${fmt(a.x + dx * 0.35)} ${fmt(a.y + dy * 0.35)}, ${fmt(b.x - dx * 0.35)} ${fmt(b.y - dy * 0.35)}, ${fmt(b.x)} ${fmt(b.y)}`
  }

  const entry = orbitPoints[0]
  let d = ''

  const atEntry =
    fromPoint &&
    Math.hypot(fromPoint.x - entry.x, fromPoint.y - entry.y) < 2

  if (fromPoint && !atEntry) {
    const dx = entry.x - fromPoint.x
    const dy = entry.y - fromPoint.y
    d += ` C ${fmt(fromPoint.x + dx * 0.2)} ${fmt(fromPoint.y + dy * 0.35)}, ${fmt(entry.x - dx * 0.15)} ${fmt(entry.y - dy * 0.2)}, ${fmt(entry.x)} ${fmt(entry.y)}`
  }

  for (let i = 0; i < orbitPoints.length - 1; i += 1) {
    const from = orbitPoints[i]
    const to = orbitPoints[i + 1]
    const prev = orbitPoints[Math.max(i - 1, 0)]
    const next = orbitPoints[Math.min(i + 2, orbitPoints.length - 1)]
    d += orbitCubicSegment(from, to, prev, next)
  }

  return d
}

/** Build SVG path: hero pass-through + final CTA orbit, Catmull-Rom elsewhere */
export function buildReadingPathD(points) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${fmt(points[0].x)} ${fmt(points[0].y)}`

  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`
  let i = 1

  while (i < points.length) {
    if (points[i].bridge === 'hero-drop') {
      let end = i
      while (end < points.length && points[end].bridge === 'hero-drop') {
        end += 1
      }
      const entry = points[end - 1]
      d += buildHeroBridgeBezierSuffix(points[0], entry)
      i = end
      continue
    }

    if (
      points[i].passThrough &&
      CTA_GLOW_SEGMENTS.includes(points[i].glowSegment)
    ) {
      const glowSegment = points[i].glowSegment
      const passPoints = []
      while (
        i < points.length &&
        points[i].glowSegment === glowSegment &&
        points[i].passThrough
      ) {
        passPoints.push(points[i])
        i += 1
      }
      const fromPoint =
        i - passPoints.length - 1 >= 0 ? points[i - passPoints.length - 1] : null

      if (glowSegment === 'hero-cta') {
        d += buildHeroPassThroughSuffix(passPoints)
      } else {
        d += buildCtaPassThroughSuffix(passPoints, fromPoint)
      }
      continue
    }

    if (points[i].bridge === 'vertical-descent') {
      const from = points[i - 1]
      const to = points[i]
      if (from && to) {
        if (Math.abs(from.x - to.x) > 8) {
          d += buildStatsBridgeBezierSuffix(from, to)
        } else {
          d += buildVerticalDescentSuffix(from, to)
        }
      }
      i += 1
      continue
    }

    if (points[i].passThrough && points[i].glowSegment === 'stats-pass') {
      const passPoints = []
      while (
        i < points.length &&
        points[i].glowSegment === 'stats-pass' &&
        points[i].passThrough
      ) {
        passPoints.push(points[i])
        i += 1
      }
      const fromPoint = passPoints.length && i - passPoints.length - 1 >= 0
        ? points[i - passPoints.length - 1]
        : null
      d += buildStatsPassThroughSuffix(passPoints, fromPoint)
      continue
    }

    if (points[i].orbit) {
      const orbitStart = i
      const orbitPoints = []
      const glowSegment = points[i].glowSegment
      while (i < points.length && points[i].glowSegment === glowSegment && points[i].orbit) {
        orbitPoints.push(points[i])
        i += 1
      }
      const fromPoint = orbitStart > 0 ? points[orbitStart - 1] : null

      if (glowSegment === 'cta-final') {
        d += buildFinalOrbitSuffix(orbitPoints)
      } else {
        d += buildOrbitBezierSuffix(orbitPoints, fromPoint)
      }
      continue
    }

    const chunkStart = i - 1
    let chunkEnd = i
    while (
      chunkEnd < points.length &&
      !points[chunkEnd].orbit &&
      !points[chunkEnd].passThrough &&
      points[chunkEnd].bridge !== 'hero-drop' &&
      points[chunkEnd].bridge !== 'vertical-descent'
    ) {
      chunkEnd += 1
    }
    const chunk = points.slice(chunkStart, chunkEnd)

    if (chunk.length >= 2 && chunk[0].orbit) {
      d += buildSectionConnector(chunk[0], chunk[1])
      if (chunk.length > 2) {
        d += buildSmoothSectionSuffix(chunk.slice(1), 0)
      }
    } else {
      d += buildSmoothSectionSuffix(chunk, 0)
    }

    i = chunkEnd
  }

  return d
}

/** Build a fixed lookup table for progress → document point (computed once per path) */
export function buildProgressLookup(pathEl, sampleCount = PROGRESS_LOOKUP_SAMPLES) {
  const totalLength = pathEl.getTotalLength()
  if (!totalLength) {
    return { totalLength: 0, samples: [] }
  }

  const samples = []
  for (let i = 0; i <= sampleCount; i += 1) {
    const t = i / sampleCount
    const len = t * totalLength
    const pt = pathEl.getPointAtLength(len)
    samples.push({ t, x: pt.x, y: pt.y })
  }

  return { totalLength, samples }
}

/**
 * Dot position at path progress — same visible length as stroke dash reveal.
 * Offsets center back along tangent so the circle meets the round cap (no white gap).
 */
export function getPathTipPosition(
  pathEl,
  totalLength,
  progress,
  {
    strokeWidth = READING_STROKE_WIDTH,
    dotRadius = DOT_SIZE / 2,
    overlap = PATH_TIP_OVERLAP,
  } = {},
) {
  if (!pathEl || !totalLength) {
    return { x: -9999, y: -9999 }
  }

  const p = Math.max(0, Math.min(1, progress))
  if (p <= 0) {
    return pathEl.getPointAtLength(0)
  }

  const tipLen = pathTipCenterLength(totalLength, p, dotRadius, overlap)
  return pathEl.getPointAtLength(tipLen)
}

/** Arc length at path progress — shared by dash reveal and getPointAtLength */
export function pathTipCenterLength(
  totalLength,
  progress,
  _dotRadius = DOT_SIZE / 2,
  _overlap = PATH_TIP_OVERLAP,
) {
  if (!totalLength || progress <= 0) return 0
  return Math.min(totalLength, totalLength * Math.max(0, Math.min(1, progress)))
}

/**
 * Stroke dash reveal — extends past pathTipCenterLength so the round cap sits under the dot.
 */
export function pathVisibleLength(
  totalLength,
  progress,
  strokeWidth = READING_STROKE_WIDTH,
  dotRadius = DOT_SIZE / 2,
  overlap = PATH_TIP_OVERLAP,
) {
  if (!totalLength || progress <= 0) return 0
  const center = pathTipCenterLength(totalLength, progress)
  return Math.min(totalLength, center + dotRadius * 0.85 + strokeWidth * 0.5)
}

/** Interpolate document point from precomputed lookup at progress 0…1 */
export function interpolateProgressLookup(lookup, progress) {
  const { samples } = lookup
  if (!samples.length || progress <= 0) {
    return samples[0] ?? { x: 0, y: 0 }
  }
  if (progress >= 1) {
    return samples[samples.length - 1] ?? { x: 0, y: 0 }
  }

  let lo = 0
  let hi = samples.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].t <= progress) lo = mid
    else hi = mid
  }

  const a = samples[lo]
  const b = samples[hi]
  const span = b.t - a.t || 1
  const u = (progress - a.t) / span

  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
  }
}

/** Convert document-space point to viewport coordinates */
export function documentToViewport(point, scrollY) {
  return {
    x: point.x,
    y: point.y - scrollY,
  }
}

function denormalizeFallback(docWidth, docHeight) {
  return FALLBACK_PATH_POINTS.map((p) => ({
    x: p.x * docWidth,
    y: p.y * docHeight,
  }))
}

/** Map each waypoint to its closest length along an SVG path (0…totalLength) */
export function measureWaypointLengths(pathEl, points) {
  const total = pathEl.getTotalLength()
  if (!total || !points.length) return []

  const samples = Math.min(120, Math.max(40, Math.ceil(total / 4)))
  const lengths = []

  for (const pt of points) {
    let bestLen = 0
    let bestDist = Infinity
    for (let s = 0; s <= samples; s += 1) {
      const len = (s / samples) * total
      const p = pathEl.getPointAtLength(len)
      const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2
      if (d < bestDist) {
        bestDist = d
        bestLen = len
      }
    }
    lengths.push(bestLen)
  }

  return lengths
}

/** Progress ranges (0–1) where the scroll line visits each CTA orbit */
export function computeCtaGlowRanges(pathEl, points) {
  const total = pathEl?.getTotalLength?.() ?? 0
  if (!total || !points.length) return []

  const waypointLengths = measureWaypointLengths(pathEl, points)
  const ranges = []

  for (const segmentId of CTA_GLOW_SEGMENTS) {
    const indices = points
      .map((p, i) =>
        p.anchorId === segmentId || p.glowSegment === segmentId ? i : -1,
      )
      .filter((i) => i >= 0)

    if (!indices.length) continue

    const segmentIndices = points
      .map((p, i) =>
        p.glowSegment === segmentId && (p.orbit || p.passThrough) ? i : -1,
      )
      .filter((i) => i >= 0)

    const roleLen = (role) => {
      const idx = points.findIndex(
        (p) =>
          p.glowSegment === segmentId &&
          (p.orbitRole === role || p.passRole === role),
      )
      return idx >= 0 ? waypointLengths[idx] ?? 0 : null
    }

    const entryLen = roleLen('entry')
    const exitLen = roleLen('exit')

    const startLen = Math.min(...indices.map((i) => waypointLengths[i] ?? 0))
    const endLen = Math.max(...indices.map((i) => waypointLengths[i] ?? 0))
    const pad = total * 0.018
    const fillPad = total * 0.006

    const fillStartLen =
      entryLen ??
      (segmentIndices.length
        ? Math.min(...segmentIndices.map((i) => waypointLengths[i] ?? 0))
        : startLen)
    const fillEndLen =
      exitLen ??
      (segmentIndices.length
        ? Math.max(...segmentIndices.map((i) => waypointLengths[i] ?? 0))
        : endLen)

    ranges.push({
      id: segmentId,
      start: Math.max(0, (startLen - pad) / total),
      end: Math.min(1, (endLen + pad) / total),
      fillStart: Math.max(0, (fillStartLen - fillPad) / total),
      fillEnd: Math.min(1, (fillEndLen + fillPad) / total),
    })
  }

  return ranges
}

/** Closest path length to a document-space point */
function closestPathLength(pathEl, x, y, samples = 80) {
  const total = pathEl.getTotalLength()
  if (!total) return 0

  let bestLen = 0
  let bestDist = Infinity
  for (let s = 0; s <= samples; s += 1) {
    const len = (s / samples) * total
    const p = pathEl.getPointAtLength(len)
    const d = (p.x - x) ** 2 + (p.y - y) ** 2
    if (d < bestDist) {
      bestDist = d
      bestLen = len
    }
  }
  return bestLen
}

/** Per-card fill ranges along the stats horizontal pass (reversible on scroll up) */
export function computeStatCardGlowRanges(pathEl) {
  const total = pathEl?.getTotalLength?.() ?? 0
  if (!total || typeof document === 'undefined') return []

  const ranges = []
  const fillPad = total * 0.004

  for (const id of STAT_CARD_ANCHORS) {
    const el = document.querySelector(`[data-scroll-anchor="${id}"]`)
    if (!el) continue

    const rect = el.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const cy = rect.top + rect.height / 2 + scrollY
    const left = rect.left + scrollX
    const right = rect.right + scrollX

    const fillStartLen = closestPathLength(pathEl, left, cy)
    const fillEndLen = closestPathLength(pathEl, right, cy)

    ranges.push({
      id,
      fillStart: Math.max(0, (Math.min(fillStartLen, fillEndLen) - fillPad) / total),
      fillEnd: Math.min(1, (Math.max(fillStartLen, fillEndLen) + fillPad) / total),
    })
  }

  return ranges
}

/** Measure ordered waypoints in document space, with CTA arcs after hero/final CTAs */
export function measureReadingPathPoints(fallback = FALLBACK_PATH_POINTS) {
  if (typeof document === 'undefined') return []

  const docWidth = document.documentElement.clientWidth
  const docHeight = document.documentElement.scrollHeight

  const byId = new Map()
  document.querySelectorAll('[data-scroll-anchor]').forEach((el) => {
    const id = el.dataset.scrollAnchor
    if (id && !byId.has(id)) byId.set(id, el)
  })

  if (!byId.has('hero-dot') && !byId.size) {
    return denormalizeFallback(docWidth, docHeight)
  }

  const pathPoints = []

  for (const anchorId of ANCHOR_ORDER) {
    const el = byId.get(anchorId)
    if (!el) continue

    if (anchorId === 'hero-cta') {
      const pass = buildHeroCtaPassThroughPoints(el)
      const lastBridge = pathPoints[pathPoints.length - 1]
      if (lastBridge?.bridge === 'hero-drop' && pass[0]) {
        lastBridge.x = pass[0].x
        lastBridge.y = pass[0].y
      }
      pathPoints.push(...pass)
      continue
    }

    if (anchorId === 'cta-final') {
      pathPoints.push(...buildCtaPassThroughPoints(el, 'cta-final'))
      continue
    }

    if (anchorId === 'stats') {
      const statEls = STAT_CARD_ANCHORS.map((id) => byId.get(id)).filter(Boolean)
      const lastPoint = pathPoints[pathPoints.length - 1]

      if (statEls.length && lastPoint) {
        const statsPass = buildStatsPassThroughPoints(statEls)
        if (statsPass[0]) {
          pathPoints.push(...buildVerticalDescentPoints(lastPoint, statsPass[0]))
        }
        pathPoints.push(...statsPass)
      } else {
        pathPoints.push({ ...measureDocumentPoint(el), anchorId })
      }
      continue
    }

    if (anchorId === 'hero-dot') {
      const point = measurePeriodAnchor(el)
      pathPoints.push({ ...point, anchorId })
      const ctaWrap = byId.get('hero-cta')
      if (ctaWrap) {
        const passPreview = buildHeroCtaPassThroughPoints(ctaWrap)
        const bridgeEnd = { ...passPreview[0] }
        pathPoints.push(...buildHeroBridgePoints(point, ctaWrap, bridgeEnd))
      }
      continue
    }

    if (anchorId === 'personalized') {
      const ctaWrap = byId.get('personalized-cta')
      const lastPoint = pathPoints[pathPoints.length - 1]

      if (ctaWrap && lastPoint) {
        const pass = buildCtaPassThroughPoints(ctaWrap, 'personalized-cta')
        if (pass[0] && Math.hypot(lastPoint.x - pass[0].x, lastPoint.y - pass[0].y) > 64) {
          const guide = measureDocumentPoint(el)
          pathPoints.push({
            ...guide,
            anchorId: 'personalized',
            synthetic: true,
            bridge: 'section-guide',
          })
        }
        pathPoints.push(...pass)
      } else {
        pathPoints.push({ ...measureDocumentPoint(el), anchorId })
      }
      continue
    }

    const point = measureDocumentPoint(el)
    pathPoints.push({ ...point, anchorId })
  }

  if (pathPoints.length < 2) {
    return denormalizeFallback(docWidth, docHeight)
  }

  return injectSectionBridges(pathPoints)
}
