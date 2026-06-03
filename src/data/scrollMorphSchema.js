/**
 * Scroll-linked morph companion schema
 * ------------------------------------
 * Maps document scroll progress (0 → 1) to position, shape, and tint.
 * The reading path weaves through section anchors (hero → bento cards → CTA).
 */

/** Four compatible organic blobs (M + 4×C + Z) for path interpolation */
export const BLOB_PATHS = [
  'M300,80 C380,20 480,60 500,160 C520,260 440,360 300,350 C160,340 100,260 120,160 C140,60 220,140 300,80 Z',
  'M180,140 C280,60 420,80 480,180 C540,280 460,360 320,370 C180,380 80,300 100,200 C120,100 80,220 180,140 Z',
  'M320,60 C440,80 520,160 510,260 C500,360 400,390 280,370 C160,350 90,280 110,180 C130,80 200,40 320,60 Z',
  'M300,70 C400,50 500,110 490,210 C480,310 380,380 280,360 C180,340 110,290 130,190 C150,90 200,90 300,70 Z',
]

/**
 * Fallback reading-path waypoints when DOM anchors are not yet measured.
 * progress 0→1, x/y in viewport % — narrative: hero → bento cards → footer CTA.
 */
export const READING_PATH_WAYPOINTS = [
  { progress: 0, xPercent: 78, yPercent: 14, sectionId: 'hero', label: 'Hero' },
  { progress: 0.06, xPercent: 52, yPercent: 20, sectionId: 'bento', label: 'Come funziona' },
  { progress: 0.12, xPercent: 22, yPercent: 26, sectionId: 'bento-analisi', label: 'Analisi' },
  { progress: 0.18, xPercent: 50, yPercent: 32, sectionId: 'bento-valutazione', label: 'Valutazione' },
  { progress: 0.24, xPercent: 78, yPercent: 38, sectionId: 'bento-soluzione', label: 'Soluzione' },
  { progress: 0.34, xPercent: 28, yPercent: 46, sectionId: 'stats', label: 'Numeri' },
  { progress: 0.46, xPercent: 72, yPercent: 54, sectionId: 'personalized', label: 'Analisi personalizzata' },
  { progress: 0.58, xPercent: 24, yPercent: 62, sectionId: 'testimonials', label: 'Testimonianze' },
  { progress: 0.68, xPercent: 58, yPercent: 70, sectionId: 'trust', label: 'Partner' },
  { progress: 0.80, xPercent: 76, yPercent: 78, sectionId: 'faq', label: 'FAQ' },
  { progress: 0.92, xPercent: 50, yPercent: 86, sectionId: 'cta', label: 'Inizia ora' },
  { progress: 1, xPercent: 50, yPercent: 88, sectionId: 'cta', label: 'Inizia ora' },
]

/** Morph keyframes aligned to major reading sections */
export const SCROLL_MORPH_KEYFRAMES = [
  { progress: 0, x: 78, y: 14, scale: 1, rotate: -8, pathIndex: 0, color: '#E07A5F', opacity: 0.34 },
  { progress: 0.18, x: 50, y: 32, scale: 1.08, rotate: 6, pathIndex: 1, color: '#9B8EC4', opacity: 0.35 },
  { progress: 0.34, x: 28, y: 46, scale: 1.02, rotate: -4, pathIndex: 2, color: '#5CB8A8', opacity: 0.33 },
  { progress: 0.46, x: 72, y: 54, scale: 1.06, rotate: 8, pathIndex: 1, color: '#9B8EC4', opacity: 0.35 },
  { progress: 0.58, x: 24, y: 62, scale: 0.98, rotate: -6, pathIndex: 2, color: '#E879A0', opacity: 0.33 },
  { progress: 0.68, x: 58, y: 70, scale: 1.04, rotate: 4, pathIndex: 3, color: '#E9A84A', opacity: 0.34 },
  { progress: 0.80, x: 76, y: 78, scale: 1, rotate: -2, pathIndex: 1, color: '#9B8EC4', opacity: 0.33 },
  { progress: 1, x: 50, y: 88, scale: 1, rotate: 0, pathIndex: 0, color: '#E07A5F', opacity: 0.34 },
]

/** Framer Motion spring — lower stiffness = smoother lag */
export const MORPH_SPRING = {
  stiffness: 72,
  damping: 28,
  mass: 0.85,
}

export const READING_FOCUS_Y = 0.38
export const PATH_Y_MIN = 12
export const PATH_Y_SPAN = 76

export function keyframeInputs(keyframes) {
  return keyframes.map((k) => k.progress)
}

export function keyframeOutputs(keyframes, key) {
  if (key === 'path') {
    return keyframes.map((k) => BLOB_PATHS[k.pathIndex])
  }
  return keyframes.map((k) => k[key])
}

/** Smoothstep easing for segment interpolation */
function smoothstep(t) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

/** Interpolate x/y along reading waypoints at scroll progress t (0→1) */
export function interpolateReadingPath(waypoints, t) {
  if (!waypoints?.length) return { xPercent: 50, yPercent: 50 }

  const clamped = Math.min(1, Math.max(0, t))
  let i = 0
  while (i < waypoints.length - 1 && waypoints[i + 1].progress < clamped) i += 1

  if (i >= waypoints.length - 1) {
    const last = waypoints[waypoints.length - 1]
    return { xPercent: last.xPercent, yPercent: last.yPercent }
  }

  const a = waypoints[i]
  const b = waypoints[i + 1]
  const span = b.progress - a.progress || 1
  const local = smoothstep((clamped - a.progress) / span)

  return {
    xPercent: a.xPercent + (b.xPercent - a.xPercent) * local,
    yPercent: a.yPercent + (b.yPercent - a.yPercent) * local,
  }
}

/** Convert viewport-% waypoints to pixel points for SVG */
export function waypointsToPixels(waypoints, width, height) {
  return waypoints.map((wp) => ({
    x: (wp.xPercent / 100) * width,
    y: (wp.yPercent / 100) * height,
    progress: wp.progress,
    sectionId: wp.sectionId,
    label: wp.label,
  }))
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

/** Dense sample along reading path for precise dash animation */
export function sampleReadingPath(waypoints, width, height, samples = 120) {
  const pts = []
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const { xPercent, yPercent } = interpolateReadingPath(waypoints, t)
    pts.push({ x: (xPercent / 100) * width, y: (yPercent / 100) * height, t })
  }
  return pts
}

/** Build smooth SVG path from dense samples (extra smoothness pass) */
export function buildReadingPathD(waypoints, width, height) {
  const samples = sampleReadingPath(waypoints, width, height, 48)
  return buildCatmullRomPath(samples)
}

/** Measure DOM anchors into reading waypoints (Option A) */
export function measureReadingWaypoints(fallback = READING_PATH_WAYPOINTS) {
  if (typeof document === 'undefined') return fallback

  const anchors = [...document.querySelectorAll('[data-scroll-anchor]')]
  if (!anchors.length) return fallback

  const sorted = anchors.sort((a, b) => a.offsetTop - b.offsetTop)
  const docH = document.documentElement.scrollHeight
  const vh = window.innerHeight
  const scrollRange = Math.max(docH - vh, 1)

  const measured = sorted.map((el) => {
    const rect = el.getBoundingClientRect()
    const centerDocY = el.offsetTop + el.offsetHeight / 2
    const progress = Math.min(1, Math.max(0, (centerDocY - vh * READING_FOCUS_Y) / scrollRange))
    const xPercent = Math.min(90, Math.max(10, ((rect.left + rect.width / 2) / window.innerWidth) * 100))
    const yPercent = PATH_Y_MIN + progress * PATH_Y_SPAN

    return {
      progress,
      xPercent,
      yPercent,
      sectionId: el.dataset.scrollAnchor ?? '',
      label: el.dataset.scrollLabel ?? el.dataset.scrollAnchor ?? '',
    }
  })

  if (measured.length < 2) return fallback

  measured[0].progress = 0
  measured[measured.length - 1].progress = 1

  return measured
}
