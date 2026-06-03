/**
 * Scroll reading line — document-space path through section anchors.
 * Hero dot → hero CTA arc → bento → stats → … → final CTA arc.
 */

/** Nav morph spring (shared with sticky header) */
export const MORPH_SPRING = {
  stiffness: 72,
  damping: 28,
  mass: 0.85,
}

/** Narrative order for DOM anchors (orbit points injected after CTAs) */
export const ANCHOR_ORDER = [
  'hero-dot',
  'hero-cta',
  'bento',
  'bento-analisi',
  'bento-valutazione',
  'bento-soluzione',
  'stats',
  'personalized',
  'testimonials',
  'trust',
  'faq',
  'cta-final',
]

export const CTA_GLOW_SEGMENTS = ['hero-cta', 'cta-final']

/** Precomputed samples along path for cursor interpolation (no per-frame getPointAtLength) */
export const PROGRESS_LOOKUP_SAMPLES = 20

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

/** Center of an element in document coordinates */
export function measureDocumentPoint(el) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  }
}

/**
 * Tight arc under a CTA — left edge → midpoint under center → right edge.
 * Points sit near the button bottom for precise alignment.
 */
export function buildCtaOrbitPoints(ctaEl, _entryPoint, options = {}) {
  const { variant = 'hero' } = options
  const rect = ctaEl.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const left = rect.left + scrollX
  const right = rect.right + scrollX
  const bottom = rect.bottom + scrollY
  const cx = (left + right) / 2
  const gap = variant === 'final' ? 10 : 8

  const glowSegment = variant === 'final' ? 'cta-final' : 'hero-cta'

  return [
    {
      x: left - 2,
      y: bottom + gap,
      synthetic: true,
      glowSegment,
    },
    {
      x: cx,
      y: bottom + gap + (variant === 'final' ? 14 : 12),
      synthetic: true,
      glowSegment,
    },
    {
      x: right + 2,
      y: bottom + gap,
      synthetic: true,
      glowSegment,
    },
  ]
}

/** Catmull-Rom → cubic-bezier SVG path through pixel points */
export function buildCatmullRomPath(points) {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

export function buildReadingPathD(points) {
  if (!points.length) return ''
  return buildCatmullRomPath(points)
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

/** Keep the reading head inside the viewport when it would leave the screen */
export function clampPointToViewport(point, viewport, margin = 22) {
  const { width, height } = viewport
  if (!width || !height) return point

  const inView =
    point.x >= margin &&
    point.x <= width - margin &&
    point.y >= margin &&
    point.y <= height - margin

  if (inView) return point

  return {
    x: Math.max(margin, Math.min(width - margin, point.x)),
    y: Math.max(margin, Math.min(height - margin, point.y)),
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

    const startLen = Math.min(...indices.map((i) => waypointLengths[i] ?? 0))
    const endLen = Math.max(...indices.map((i) => waypointLengths[i] ?? 0))
    const pad = total * 0.018

    ranges.push({
      id: segmentId,
      start: Math.max(0, (startLen - pad) / total),
      end: Math.min(1, (endLen + pad) / total),
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

    const point = measureDocumentPoint(el)
    pathPoints.push({ ...point, anchorId })

    if (anchorId === 'hero-cta') {
      const entry = pathPoints[pathPoints.length - 2] ?? point
      const orbit = buildCtaOrbitPoints(el, entry, { variant: 'hero' })
      pathPoints.push(...orbit)
    }

    if (anchorId === 'cta-final') {
      const entry = pathPoints[pathPoints.length - 2] ?? point
      const orbit = buildCtaOrbitPoints(el, entry, { variant: 'final' })
      pathPoints.push(...orbit)
    }
  }

  if (pathPoints.length < 2) {
    return denormalizeFallback(docWidth, docHeight)
  }

  return pathPoints
}
