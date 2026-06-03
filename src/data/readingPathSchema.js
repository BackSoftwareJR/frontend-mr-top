/**
 * Scroll reading line — document-space path through section anchors.
 * Hero dot → hero CTA orbit → bento → stats → … → final CTA.
 */

/** Nav morph spring (shared with sticky header) */
export const MORPH_SPRING = {
  stiffness: 72,
  damping: 28,
  mass: 0.85,
}

/** Narrative order for DOM anchors (orbit points injected after hero-cta) */
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
 * Smooth circuit around the hero CTA — 4 bezier-friendly samples on an ellipse
 * offset to the right/below so the line visibly loops the button.
 */
export function buildCtaOrbitPoints(ctaEl, entryPoint) {
  const rect = ctaEl.getBoundingClientRect()
  const cx = rect.left + rect.width / 2 + window.scrollX
  const cy = rect.top + rect.height / 2 + window.scrollY
  const rx = Math.max(rect.width, rect.height) * 0.62 + 36
  const ry = rx * 0.72

  const entryAngle = Math.atan2(entryPoint.y - cy, entryPoint.x - cx)
  const startAngle = entryAngle - Math.PI * 0.55

  const points = []
  for (let i = 1; i <= ORBIT_SEGMENTS; i += 1) {
    const t = i / (ORBIT_SEGMENTS + 1)
    const angle = startAngle + t * Math.PI * 1.35
    points.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
      synthetic: true,
    })
  }

  const exitAngle = startAngle + Math.PI * 1.35
  points.push({
    x: cx + Math.cos(exitAngle) * rx * 0.92,
    y: cy + Math.sin(exitAngle) * ry * 0.92 + 18,
    synthetic: true,
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

/** Measure ordered waypoints in document space, with CTA orbit after hero-cta */
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
      const orbit = buildCtaOrbitPoints(el, entry)
      pathPoints.push(...orbit)
    }
  }

  if (pathPoints.length < 2) {
    return denormalizeFallback(docWidth, docHeight)
  }

  return pathPoints
}
