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
- `WenandoMark` uses **`/wenando-logo.png`** (multicolor ribbon) — preloaded in `index.html` with `fetchPriority="high"` on mobile hero LCP mark
- `decoding="async"` on mark image
- Vite `manualChunks` for framer-motion, react, router, lucide
- Google Fonts CSS preloaded; Vite injects `modulepreload` for vendor + main chunks on build

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
- **Open:** Faster first paint — smaller initial JS on `/`, logo PNG preloaded for LCP
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
| **E. Throttle fill sync** | `CtaFillSync` / `StatCardFillSync`: skip when Δprogress < 0.002 **and** not every 3rd frame; same rule for `pathProgress` motion sync |

### Round 3 (logo revert + precomputed scroll table)

| Strategy | Implementation |
|----------|----------------|
| **F. Precomputed scroll frame table** | `buildMobileScrollFrameTable` — on path measure, bake scroll→stroke/dot values (64 samples); mobile rAF only `interpolateMobileScrollFrame` + batched DOM writes |
| **G. Dynamic will-change** | `will-change: transform` on dot group only while scrolling (+ 150 ms idle clear) |
| **H. Lighter samples** | Path lookup: 32 mobile / 24 constrained; wavy vertical: 2 mobile / 1 reduced-motion |
| **I. Skip mobile glow overlays** | `CtaGlowOverlays` disabled on mobile (Framer opacity rings removed from hot path) |
| **J. content-visibility** | `.section-deferred` on below-fold sections; `IntersectionObserver` triggers path remeasure when sections paint |
| **K. Mobile animation diet** | Hero copy/CTA → CSS keyframes; nav morph off on mobile; Bento/Stats/MulticolorHeading skip blur/stagger; page fade skipped on mobile |
| **L. Idle prefetch** | `usePrefetchOnIdle(['/wizard'])` on home |
| **M. Float32 frame table** | `buildMobileScrollFrameTable` packs stroke/dot into `Float32Array`; `applyMobileScrollFrame` mutates reusable out object — zero GC in scroll rAF |
| **N. startTransition fill sync** | CTA/stat `pathProgress` updates wrapped in `startTransition` so scroll paint stays urgent |

### Mobile round 4 backlog

1. **Lift shared scroll provider** — single `useScroll` for `HomeNav` morph + reading line; remove duplicate Framer subscriptions on mobile.
2. **Logo asset diet** — generate ~96 px WebP/AVIF from `wenando-logo.png` (233 KB) with `<picture>`; keep PNG fallback.
3. **Batch CTA/stat style writes** — one `requestAnimationFrame` pass for all `--reading-fill` updates instead of per-button loops when throttled.
4. **Self-host Fredoka subset** — drop Google Fonts round-trip for hero wordmark if LCP still regresses on 3G.
5. **Real-device scroll profile** — record Performance traces on iPhone SE / Galaxy A13 at 430px; tune `MOBILE_SCROLL_FRAME_SAMPLES` vs jank before lowering further.

### Before / after (mobile scroll path)

| | Before (first pass) | After (aggressive) |
|--|---------------------|-------------------|
| Scroll → line | Framer `useTransform` every frame | Native scroll listener → single rAF → DOM only |
| Dot position | `setAttribute('cx'/'cy')` via motion event | `translate3d(x, y, 0)` on group |
| React re-render on scroll | None intended; motion subscriptions still ran | Motion scroll inputs stubbed; re-render only on path remeasure |
| Lookup samples | 96 / 64 | 32 / 24 |
| Scroll hot path | Per-frame progress + tip lookup | Precomputed frame table index + lerp |
| Remap table | Skipped at runtime; could still build | Never built when `isMobile` |
| CTA glow rings | Framer on mobile | Skipped on mobile |
| `getPointAtLength` in hot path | None (lookup) | None (unchanged) |

### Files (mobile pass)

| File | Change |
|------|--------|
| `ScrollReadingLine.jsx` | Mobile rAF driver, IO pause, stub scroll MVs, GPU dot, throttled fill sync |
| `readingPathSchema.js` | Sample counts, `resolveWavyVerticalSegmentCount`, mobile path `d` |
| `performanceTier.js` | Unchanged (still gates 32-sample lookup) |

### Round 5 (ultra-minimal mobile — decouple fill, lighter frames, LCP)

| Strategy | Implementation |
|----------|----------------|
| **M. Fewer frame-table samples** | 24 mobile / 16 constrained (was 64); `resolveMobileScrollFrameSampleCount` |
| **N. Fill fully decoupled from scroll rAF** | Mobile scroll handler only writes `translate3d` + `strokeDashoffset`; CTA/stat `--reading-fill` via `setInterval(66ms)` reading `pathProgressRef` — no `pathProgressMv.set` / React transitions during scroll |
| **O. 30 fps scroll paint cap** | Mobile rAF coalesces to ~30 fps; frame-table lerp keeps motion smooth between samples |
| **P. Constrained path geometry** | `isConstrained`: `buildMinimalConnectorSuffix` (vertical+horizontal elbow, no wavy cubics) |
| **Q. GPU layer** | Mobile reading layer `[transform:translateZ(0)]`; dot/path already `translate3d` |
| **R. LCP logo** | `wenando-logo-96.webp` (7.4 KB) + `wenando-logo-96.png` (14 KB) at 192×192; preload WebP; hero `<picture>` |
| **S. Motion diet** | `LazyMotion` + `domAnimation` on mobile; Home page wrapper plain `<div>`; Wenando wordmark static on mobile |

### Before / after (Round 5 mobile scroll path)

| | Round 3–4 | Round 5 |
|--|-----------|---------|
| Frame table samples | 64 | 24 / 16 constrained |
| Fill updates during scroll | Throttled `pathProgress.on('change')` (~every 3 rAF) | Independent 15 fps timer (66 ms) |
| Scroll rAF work | stroke + dot + motion value sync | stroke + dot only |
| Scroll paint rate | Uncapped (~60 fps irregular) | Capped 30 fps + table lerp |
| Logo LCP | 233 KB PNG | 7.4 KB WebP (192 px) |
| `getPointAtLength` in scroll handler | None | None (unchanged) |
| `querySelector` in scroll handler | None | None (unchanged; fill sync queries only at mount) |

### Files (Round 5)

| File | Change |
|------|--------|
| `ScrollReadingLine.jsx` | 30 fps cap, fill poll timer, no motion sync on scroll, GPU layer |
| `readingPathSchema.js` | 24/16 frame samples, constrained minimal connectors |
| `WenandoLogo.jsx` | WebP/PNG picture, static wordmark on mobile |
| `index.html` | Preload `wenando-logo-96.webp` |
| `App.jsx` | `LazyMotion` + `domAnimation` on mobile |
| `Home.jsx` | Plain div wrapper on mobile |
| `public/wenando-logo-96.webp/png` | Optimized 192×192 assets |

### Round 7 (static hero LCP, smooth line lerp, drop motion from mobile critical path)

| Strategy | Implementation |
|----------|----------------|
| **AB. Static mobile hero / headings** | `HeroSection.jsx`, `MulticolorHeadingStatic`, `AnimatedTextStatic`, `MagneticButtonStatic`, `WenandoWordmarkStatic` — zero `framer-motion` import on ≤768px; desktop motion in lazy `*Desktop.jsx` / `*Motion.jsx` chunks |
| **AC. Bundle: JSX from React, not motion** | Removed `framer-motion` from Vite `manualChunks` — Rolldown was re-exporting JSX via the motion chunk, forcing ~135 KB sync load on bootstrap; motion now lazy in `proxy-*.js` (~121 KB gzip 39 KB) only when desktop sections or deferred reading line load |
| **AD. ~~Deferred lazy reading line (mobile)~~** | **Final:** no reading line on mobile (choppy on real devices). Round 7 tried `DeferredMobileReadingLine`; reverted — `Home.jsx` mobile path is `HomePageContent` only. Desktop: `HomeDesktop.jsx` eager `ScrollReadingLine`. |
| **AE. Perceptually smooth scroll line** | `MOBILE_SCROLL_FRAME_SAMPLES = 40`; continuous rAF (no fps cap); `lerpMobileFrame` with factor **0.35** on dot/stroke/pathProgress — silk between table samples, no stepped motion on slow scroll |
| **AF. Touch / compositor** | `overscroll-behavior-y: none` on `html, body` ≤768px; reading layer `translate3d(0,0,0)` + `-webkit-transform` |
| **AG. Load hygiene** | `main.jsx` → dynamic `bootstrap.jsx`; Home lazy; preconnect limited to Google Fonts (essential) |

Desktop path unchanged: `HomeDesktop.jsx` eager `ScrollReadingLine`, full Framer sections, CTA fill sync, stat glow.

### Round 6 (defer critical path, zero mobile scroll listeners, 20 fps low-core)

| Strategy | Implementation |
|----------|----------------|
| **T. Deferred reading line mount** | Mobile: lazy + `useDeferUntilReady` (Round 7) — off LCP path |
| **U. No `useScroll` on mobile** | Split `DesktopReadingLineLayer` / `MobileReadingLineLayer`; mobile uses stub motion values only |
| **V. Idle path measure** | `requestIdleCallback` initial `measureReadingPathPoints`; 300ms debounced resize remeasure |
| **W. 20 fps on ≤2 cores** | `useLowCoreDevice` → 50ms paint cap; 30 fps otherwise |
| **X. CSS scroll-timeline stroke** | `.reading-path-scroll-driven` on Chrome mobile when supported; rAF skips stroke paint |
| **Y. Font diet mobile** | Fredoka dropped on ≤768px; Plus Jakarta only (400/600/700/800); `--font-brand` → sans |
| **Z. Motion purge mobile home** | Static `MagneticButton`, `AnimatedText`, section wrappers (CTA, trust, stats, bento, FAQ, testimonials) |
| **AA. Home code-split** | `HomeDesktop.jsx` lazy on desktop; mobile `Home.jsx` has zero framer import |

### Before / after (Round 6 mobile load + scroll)

| | Round 5 | Round 6 |
|--|---------|---------|
| Reading line on mobile | Lazy chunk after idle/scroll | **None** (final) — no `ScrollReadingLine` chunk on mobile |
| Framer `useScroll` on mobile | 1 subscriber (reading line) | **0** (no reading line chunk) |
| Path measure on mount | Sync + delayed timeouts | Idle-first + 300ms resize debounce |
| Scroll paint (2-core phone) | 30 fps | 20 fps |
| Stroke paint (Chrome mobile) | rAF only | scroll-timeline when supported |
| Fredoka font download | Always | Desktop only |
| Home section motion listeners | Partial light-motion | Static DOM on mobile |

### Files (Round 6)

| File | Change |
|------|--------|
| `Home.jsx` | Lazy reading line + deferred mount on mobile; static wrapper; no framer on mobile |
| `HomeDesktop.jsx` | Desktop-only motion wrapper (lazy chunk) |
| `ScrollReadingLine.jsx` | Split layers, idle measure, scroll-timeline, 20fps low-core |
| `useDeferUntilReady.js` | Idle / load / scroll activation hook |
| `scheduleIdle.js` | `requestIdleCallback` helper + scroll-timeline detect |
| `performanceTier.js` | `useLowCoreDevice` (≤2 cores) |
| `index.html` | Media-split font loading |
| `globals.css` | Mobile brand font fallback + scroll-timeline keyframes |
| `MagneticButton.jsx`, `AnimatedText.jsx` | Static mobile path |
| Home sections | Static wrappers on mobile (CTA, trust, stats, bento, FAQ, testimonials) |
| `WenandoLogo.jsx` | WebP source gated with `media="(max-width: 768px)"` |

### Before / after (Round 7 mobile LCP + scroll)

| | Round 6 | Round 7 |
|--|---------|---------|
| `vendor-motion` / `proxy` on bootstrap | Sync ~135 KB (JSX via motion chunk) | **None** — JSX from `vendor-react` only |
| Hero / headings on mobile | Partial static | Fully static; motion lazy on desktop |
| Reading line mount | Removed (interim) | Tried deferred lazy; **reverted** — none on mobile (final) |
| Scroll paint | 20 fps cap (low-core) | Continuous rAF + 0.35 lerp |
| Frame table samples | 24 | **40** |

### Files (Round 7)

| File | Change |
|------|--------|
| `Home.jsx` | Mobile: static `HomePageContent` only (no reading line); desktop lazy `HomeDesktop` |
| `HeroSection.jsx`, `*Static.jsx`, `*Desktop.jsx`, `*Motion.jsx` | Mobile/desktop split for all home motion |
| `ScrollReadingLine.jsx` | `MOBILE_LERP_FACTOR = 0.35`, continuous rAF, GPU layer classes |
| `readingPathSchema.js` | `MOBILE_SCROLL_FRAME_SAMPLES = 40` |
| `vite.config.js` | Drop `framer-motion` manualChunk (fixes JSX dedupe bug) |
| `globals.css` | `overscroll-behavior-y: none` mobile |
| `main.jsx` / `bootstrap.jsx` | Thin entry split |
| `PERFORMANCE.md` | Round 7 documentation |

### Mobile reading line — final decision

| | Round 7 experiment | Final |
|--|-------------------|-------|
| Mobile line | Deferred lazy + 40-sample lerp rAF | **Disabled** — too choppy on real devices |
| Round 7 load wins | — | **Retained:** static hero/headings, `vendor-react` bootstrap without sync motion chunk, `MagneticButtonStatic`, `StatsSectionStatic`, `HomeDesktop` lazy on desktop only |
| Desktop | Full `ScrollReadingLine` + motion lazy chunks | Unchanged |

| File | Change |
|------|--------|
| `Home.jsx` | No `ScrollReadingLine` / `useDeferUntilReady` on mobile |
| `MagneticButtonStatic.jsx` | Static `outline-coral` on mobile |
| `StatsSectionStatic.jsx` | Removed `reading-line-stat` class from stat cards |
| `PERFORMANCE.md` | Mobile = no reading line; Round 7 bundle splits retained |

---

## Round 8 (mobile navigation pass — route speed)

Targets **4–5s felt latency on every mobile route change** (wizard, results, accedi, B2B onboarding).

### Before / after (production build, gzip)

| Chunk | Before | After |
|-------|--------|-------|
| `index` (app shell) | 82.7 kB | **24.2 kB** |
| `vendor-react` | (in index) | **57.2 kB** (cacheable) |
| `vendor-router` | (in index) | **15.1 kB** (cacheable) |
| `vendor-motion` | 44.2 kB | 44.2 kB — **not loaded on mobile consumer/B2B onboarding paths** |
| `Wizard` | 9.2 kB | **6.6 kB** (no sync motion) |
| `ResultsPage` | 6.5 kB | **6.6 kB** (no sync motion) |
| `vendor-maps` | 273 kB | unchanged — only `/wizard` location step + B2B copertura |

**First-visit mobile JS (home):** ~96 kB gzip parallel (`index` + `vendor-react` + `vendor-router`) vs ~135 kB monolith before.

### Strategies

| Area | Change |
|------|--------|
| **A. Route warm-up** | `prefetchMobileCriticalRoutes()` on bootstrap + `useMobileRouteWarmup`; expanded `routePrefetch.js` (`/wizard`, `/results`, `/accedi`, `/pro/*`) |
| **B. Mobile motion diet** | `motionProxy.jsx` — lazy `vendor-motion` on desktop only; static DOM on ≤768px for wizard, results, onboarding, cookie banner |
| **C. Analyzing screen** | `AnalyzingStateStatic.jsx` on mobile; `AnalyzingStateMotion.jsx` lazy on desktop |
| **D. Deferred non-critical UI** | `DeferredCookieBanner` (idle); no CookieBanner on critical path |
| **E. API gates** | B2B protected route + onboarding show branded shell + inline skeleton (not blank/full-page swap) while API resolves |
| **F. Build** | `vendor-react` + `vendor-router` manualChunks; `preconnect`/`dns-prefetch` → `api.wenando.com` |
| **G. Desktop unchanged** | `DesktopRouteTransitions` still desktop-only; motion lazy-loaded via proxy |

### Realistic mobile target

On **4G + mid-range phone**: FCP **&lt;2s**, route change to prefetched chunk **&lt;1s** after first visit. Maps step and hCaptcha login remain heavier (~+1–2s) — fundamental network/JS limits.

### Files (Round 8)

| File | Change |
|------|--------|
| `motionProxy.jsx`, `motionLazyBundle.jsx` | Desktop-only framer-motion |
| `bootstrap.jsx`, `routePrefetch.js`, `useMobileRouteWarmup.js` | Immediate mobile prefetch |
| `DeferredCookieBanner.jsx`, `App.jsx` | Idle cookie banner |
| `Wizard.jsx`, `WizardSteps.jsx`, `AnalyzingState*.jsx` | Mobile static path |
| `ResultsPage.jsx`, `MatchCard.jsx`, `AdvisorCard.jsx`, `PostSearch*.jsx` | Motion proxy |
| `OnboardingLayout.jsx`, `B2BOnboardingShell.jsx`, onboarding steps | Motion proxy |
| `ProtectedRoute.jsx`, `Onboarding.jsx` | Shell-first loading |
| `vite.config.js`, `index.html` | Vendor splits + API preconnect |

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
5. **`content-visibility: auto` on sections** — enabled via `.section-deferred` with remeasure hook; monitor anchor drift on oldest test devices.

---

## Files changed (this session)

| File | Change |
|------|--------|
| `ScrollReadingLine.jsx` | Precomputed mobile frame table, dynamic will-change, IO remeasure, skip glow on mobile |
| `readingPathSchema.js` | `buildMobileScrollFrameTable`, 32/24 lookup samples, simplified reduced-motion path |
| `WenandoLogo.jsx` | **PNG ribbon logo** + `fetchPriority` prop |
| `HeroSection.jsx` | Mobile LCP mark priority, CSS hero fades, static nav on mobile |
| `index.html` | Preload logo PNG + Google Fonts CSS |
| `globals.css` | `.section-deferred`, mobile hero fade keyframes |
| `performanceTier.js` | Shared `useIsMobile` |
| `StatsSection.jsx`, `BentoSteps.jsx`, `MulticolorHeading.jsx`, `Home.jsx` | Mobile light-motion path |
| `usePrefetchOnIdle.js` | Idle prefetch hook |
| Below-fold sections | `section-deferred` for paint skipping + remeasure |
| `vite.config.js` | Vendor chunks + `modulePreload` polyfill |
