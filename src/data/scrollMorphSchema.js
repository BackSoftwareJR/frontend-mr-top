/**
 * Scroll-linked morph companion schema
 * ------------------------------------
 * Maps document scroll progress (0 → 1) to position, shape, and tint.
 *
 * Segments (full page scroll, start→end):
 *   0–25%   top-right    shape A  coral  (#E07A5F)
 *   25–50%  center-left  shape B  violet (#9B8EC4)
 *   50–75%  bottom-right shape C  teal   (#5CB8A8)
 *   75–100% top-center   shape D  amber  (#E9A84A)
 *
 * Tune: edit `keyframes` arrays below — x/y are viewport % (fixed layer),
 * scale/rotate add organic drift, pathIndex selects morph target (0–3).
 */

/** Four compatible organic blobs (M + 4×C + Z) for path interpolation */
export const BLOB_PATHS = [
  // A — compact round (hero / top-right)
  'M300,80 C380,20 480,60 500,160 C520,260 440,360 300,350 C160,340 100,260 120,160 C140,60 220,140 300,80 Z',
  // B — wide horizontal (center-left)
  'M180,140 C280,60 420,80 480,180 C540,280 460,360 320,370 C180,380 80,300 100,200 C120,100 80,220 180,140 Z',
  // C — tall vertical (bottom-right)
  'M320,60 C440,80 520,160 510,260 C500,360 400,390 280,370 C160,350 90,280 110,180 C130,80 200,40 320,60 Z',
  // D — soft peak (top-center / footer)
  'M300,70 C400,50 500,110 490,210 C480,310 380,380 280,360 C180,340 110,290 130,190 C150,90 200,90 300,70 Z',
]

export const SCROLL_MORPH_KEYFRAMES = [
  { progress: 0, x: 82, y: 18, scale: 1, rotate: -8, pathIndex: 0, color: '#E07A5F', opacity: 0.38 },
  { progress: 0.25, x: 18, y: 50, scale: 1.12, rotate: 12, pathIndex: 1, color: '#9B8EC4', opacity: 0.4 },
  { progress: 0.5, x: 78, y: 82, scale: 0.92, rotate: -6, pathIndex: 2, color: '#5CB8A8', opacity: 0.36 },
  { progress: 0.75, x: 50, y: 22, scale: 1.06, rotate: 8, pathIndex: 3, color: '#E9A84A', opacity: 0.38 },
  { progress: 1, x: 50, y: 22, scale: 1, rotate: 0, pathIndex: 3, color: '#E9A84A', opacity: 0.38 },
]

/** Framer Motion spring — lower stiffness = smoother lag */
export const MORPH_SPRING = {
  stiffness: 72,
  damping: 28,
  mass: 0.85,
}

export function keyframeInputs(keyframes) {
  return keyframes.map((k) => k.progress)
}

export function keyframeOutputs(keyframes, key) {
  if (key === 'path') {
    return keyframes.map((k) => BLOB_PATHS[k.pathIndex])
  }
  return keyframes.map((k) => k[key])
}
