/**
 * Scroll reading line — document-space path through section anchors.
 * Hero dot → hero CTA orbit → bento → stats → … → final CTA orbit.
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

const ORBIT_SEGMENTS = 4

/** Center of an element in document coordinates */
export function measureDocumentPoint(el) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  }
}

/**
 * Smooth circuit around a CTA — bezier-friendly samples on an ellipse
 * offset so the line loops the button without cutting through cards.
 */
export function buildCtaOrbitPoints(ctaEl, entryPoint, options = {}) {
  const { variant = 'hero' } = options
  const rect = ctaEl.getBoundingClientRect()
  const cx = rect.left + rect.width / 2 + window.scrollX
  const cy = rect.top + rect.height / 2 + window.scrollY

  const scale = variant === 'final' ? 0.58 : 0.62
  const pad = variant === 'final' ? 44 : 40
  const rx = Math.max(rect.width, rect.height) * scale + pad
  const ry = rx * (variant === 'final' ? 0.68 : 0.7)

  const entryAngle = Math.atan2(entryPoint.y - cy, entryPoint.x - cx)
  const arcSpan = variant === 'final' ? Math.PI * 1.25 : Math.PI * 1.35
  const startAngle =
    entryAngle - (variant === 'final' ? Math.PI * 0.5 : Math.PI * 0.55)

  const points = []
  for (let i = 1; i <= ORBIT_SEGMENTS; i += 1) {
    const t = i / (ORBIT_SEGMENTS + 1)
    const angle = startAngle + t * arcSpan
    points.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
      synthetic: true,
      glowSegment: variant === 'final' ? 'cta-final' : 'hero-cta',
    })
  }

  const exitAngle = startAngle + arcSpan
  const exitYOffset = variant === 'final' ? 24 : 18
  const exitShrink = variant === 'final' ? 0.88 : 0.92
  points.push({
    x: cx + Math.cos(exitAngle) * rx * exitShrink,
    y: cy + Math.sin(exitAngle) * ry * exitShrink + exitYOffset,
    synthetic: true,
    glowSegment: variant === 'final' ? 'cta-final' : 'hero-cta',
  })

  return points
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

  const samples = Math.min(600, Math.max(80, Math.ceil(total / 1.5)))
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

/** Measure ordered waypoints in document space, with CTA orbits after hero/final CTAs */
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
