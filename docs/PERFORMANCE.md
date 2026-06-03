# Performance optimization plan — Wenando landing

Deep audit and fixes for scroll jank on low-end mobile devices. **No visual, UX, or feature changes** — same reading line, CTA fill, stat glow, colors, layout.

---

## Executive summary

The main bottleneck on old phones is **main-thread work during scroll**: SVG `getPointAtLength` every frame, repeated DOM queries in fill-sync listeners, and heavy path remeasurement triggered too often. Secondary wins: initial JS payload (single bundle), logo PNG weight, and uncached viewport resize re-renders.

---

## Root causes (prioritized)

### P0 — Reading line scroll path (biggest win)

| Issue | Impact | Root cause |
|-------|--------|------------|
| `getPointAtLength` × 2 per frame | High CPU on scroll | Dot `cx`/`cy` used live SVG geometry instead of precomputed lookup |
| Path remeasure on resize storms | Layout thrashing | `ResizeObserver` + resize fired full `measureReadingPathPoints()` (192 samples, many `getBoundingClientRect`) |
| Duplicate progress resolution | Extra math per listener | CTA/stat sync and glow each re-ran `resolveReadingPathProgress` from raw scroll |

**Fixes applied:**
- Dot position via `getPathTipFromLookup()` + direct DOM `setAttribute` (no Framer `motion.circle` transforms)
- Path remeasure **only** on debounced resize/load (150 ms), never on scroll
- Single `pathProgress` motion value shared by stroke, dot, glow, CTA/stat fill
- Adaptive lookup samples: 192 desktop → 48 mobile → 32 constrained device (aggressive mobile pass)
- `contain: layout` on reading-line SVG layer

### P1 — CTA / stat fill sync DOM queries

| Issue | Impact |
|-------|--------|
| `querySelector` every scroll frame | Main-thread DOM walks × N CTAs × 60 fps |

**Fix applied:** Cache button/card element refs when `glowRanges` / `statRanges` update (path remeasure only).

### P2 — React re-renders

| Issue | Impact |
|-------|--------|
| Viewport resize → immediate state | Full `ReadingPathLayer` re-render on every px |
| Unmemoized sync components | Avoidable child reconciliation |

**Fixes applied:**
- Debounced viewport size (150 ms)
- `memo()` on `CtaFillSync`, `StatCardFillSync`, `CtaGlowOverlays`, `CtaGlowRing`
- Route-level code splitting (`/wizard`, `/dashboard`)

**Not applied:** Lazy below-fold home sections — deferred mounting breaks reading-line anchor measurement until remeasure; route split is safer.

### P3 — Assets & loading

| Issue | Impact |
|-------|--------|
| `wenando-logo.png` 233 KB for ~64 px display | Slow decode on old GPUs |
| Google Fonts blocking | Render delay |
| Single 449 KB JS chunk | Long TTI on 3G |

**Fixes applied:**
- `WenandoMark` uses inline SVG asset (550 B) — identical at display size
- `decoding="async"` on mark image
- Vite `manualChunks` for framer-motion, react, router, lucide

**Not changed (recommendations):**
- Self-host font subset or `font-display: swap` only (already `display=swap` in URL)
- Generate WebP/AVIF for any future hero photography
- `preload` only Fredoka 500 for brand wordmark if LCP regresses

### P4 — Build / bundle

**Before:** 449 KB JS (141 KB gzip), single chunk  
**After (home `/`):** ~422 KB total JS (~135 KB gzip) split across cacheable vendor chunks; Wizard (~11 KB) and Dashboard (~7 KB) not loaded on landing.

| Chunk | Size (gzip) |
|-------|-------------|
| `index` (app + home) | 65 KB → 19 KB |
| `vendor-react` | 182 KB → 57 KB |
| `vendor-motion` | 135 KB → 44 KB |
| `vendor-router` | 40 KB → 14 KB |

---

## Low-end device strategy (invisible)

`src/utils/performanceTier.js` detects constrained mobile:

- `(max-width: 768px)` **and**
- `hardwareConcurrency ≤ 4` **or** `navigator.connection.saveData` **or** slow 2G

Effect: fewer path lookup samples (32 vs 48/192). **Same animation appearance** at screen scale.

`prefers-reduced-motion`: unchanged — reading line cursor hidden, static progress (existing behavior).

---

## What the user should feel (old phone)

- **Scroll:** Smoother finger tracking; reading line dot and stroke stay locked to scroll without micro-stutters
- **Open:** Faster first paint — smaller initial JS on `/`, SVG logo decodes instantly
- **CTA/stat fill:** Same sweep timing, less lag when line passes buttons
- **Desktop:** Unchanged

---

## Mobile reading line (aggressive pass)

Second pass targets **scroll jank on phones only** (`max-width: 768px`). Desktop path is unchanged (Framer `useScroll` → `useTransform` → `useMotionValueEvent`).

### Bottleneck (still felt on mobile after first pass)

| Issue | Why it hurt on mobile |
|-------|------------------------|
| Framer scroll pipeline every frame | `useTransform` + `useMotionValueEvent` on `scrollYProgress` kept main-thread work in the motion/React subscription path |
| Lookup + fill sync at 64–96 samples | Still heavy when combined with CTA/stat DOM style writes × 60 fps |
| Scroll remap table build | Disabled for scroll (`MOBILE_USE_VIEWPORT_REMAP = false`) but code could still build on resize |
| Wavy path cubics | 3-segment vertical chains = more SVG tessellation / longer `d` |
| Fixed full-screen layer always updating | No pause when narrative anchors are off-screen |

### Mobile-only fixes

| Strategy | Implementation |
|----------|----------------|
| **A. Decouple from React scroll render** | Stub motion values fed to Framer on mobile; real scroll handled by one coalesced `requestAnimationFrame` loop (`useMobileReadingScrollFrame`) that imperatively sets `strokeDashoffset`, `translate3d` on dot group, and path `translate3d` for scroll offset |
| **B. Cheaper geometry** | Lookup samples: **48** mobile / **32** constrained (was 96 / 64); **no** scroll remap table on mobile; `buildReadingPathD(..., { isMobile })` uses **2** wavy-vertical cubics (desktop: 3) |
| **C. Pause off-screen** | `IntersectionObserver` on `hero-dot` + `cta-final` — skip rAF work when neither anchor intersects (20% root margin) |
| **D. GPU-friendly paint** | Dot via `translate3d` on wrapper `<g>`; `[contain:strict]` on layer + SVG `contain: strict` on mobile |
| **E. Throttle fill sync** | `CtaFillSync` / `StatCardFillSync`: `throttleMobile` — skip when Δprogress < 0.002 **and** odd frame; `pathProgress` motion value updated on same rule |

### Before / after (mobile scroll path)

| | Before (first pass) | After (aggressive) |
|--|---------------------|-------------------|
| Scroll → line | Framer `useTransform` every frame | Native scroll listener → single rAF → DOM only |
| Dot position | `setAttribute('cx'/'cy')` via motion event | `translate3d(x, y, 0)` on group |
| React re-render on scroll | None intended; motion subscriptions still ran | Motion scroll inputs stubbed; re-render only on path remeasure |
| Lookup samples | 96 / 64 | 48 / 32 |
| Remap table | Skipped at runtime; could still build | Never built when `isMobile` |
| `getPointAtLength` in hot path | None (lookup) | None (unchanged) |

### Files (mobile pass)

| File | Change |
|------|--------|
| `ScrollReadingLine.jsx` | Mobile rAF driver, IO pause, stub scroll MVs, GPU dot, throttled fill sync |
| `readingPathSchema.js` | Sample counts, `resolveWavyVerticalSegmentCount`, mobile path `d` |
| `performanceTier.js` | Unchanged (still gates 32-sample lookup) |

---

## Verification

```bash
npm run build   # must pass
npm run preview # manual scroll test on throttled CPU + mobile viewport
```

Chrome DevTools: Performance → 6× CPU slowdown, **430px** viewport, record scroll through hero → CTA → stats → footer. Desktop **1280px** — confirm line/dot/CTA fills match prior behavior.

---

## Remaining recommendations (not implemented)

1. **Consolidate `useScroll` listeners** — `HomeNav` and `ScrollReadingLine` each subscribe; could lift one provider (small win).
2. **IntersectionObserver for below-fold sections** — defer chunk mount until near viewport; must trigger `remeasurePath` when anchors appear (coordinate with reading line).
3. **rollup-plugin-visualizer** — add dev dependency for ongoing bundle audits.
4. **Service worker / precache** — only if offline or repeat-visit latency becomes a product goal.
5. **`content-visibility: auto` on sections** — can help paint; test for scroll-anchor drift with reading line before enabling.

---

## Files changed (this session)

| File | Change |
|------|--------|
| `ScrollReadingLine.jsx` | Lookup-based dot, cached DOM refs, shared `pathProgress`, debounced viewport, memo, contain; **+ mobile rAF driver** |
| `readingPathSchema.js` | `getPathTipFromLookup`, adaptive sample counts, remap sample param; **+ mobile wavy segment count** |
| `performanceTier.js` | Constrained device heuristic |
| `HeroSection.jsx` | *(reverted)* section lazy — conflicts with reading-line anchors |
| `App.jsx` | Lazy wizard/dashboard routes |
| `WenandoLogo.jsx` | SVG mark instead of PNG |
| `vite.config.js` | Manual vendor chunks |
