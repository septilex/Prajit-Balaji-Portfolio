# Portfolio Performance Audit — Investigation Log

> **Status:** COMPLETE (2026-11-02). Stages 0–14 are logged below in order; the consolidated **ULTIMATE PORTFOLIO PERFORMANCE AUDIT REPORT** (sections 1–23, issue register, roadmap, Phase 2 fix list) follows the stage log. No fixes implemented.
> **Scope:** Phase 1 (investigation only). No application source, configuration, dependency, or existing project file is modified.
> **Auditor:** Claude (Opus 5.5) via Claude Code, on behalf of the repository owner.
> **Started:** 2026-11-02

Legend for evidence labels used throughout:

| Label | Meaning |
|---|---|
| **[MEASURED]** | Obtained by actually executing something (build, browser run, CDP trace, network request). |
| **[STATIC]** | Determined by reading source / build output; mechanism is certain from code, magnitude not measured. |
| **[ESTIMATE]** | Arithmetic derived from measured or static facts; labelled with its inputs. |
| **[HYPOTHESIS]** | Plausible mechanism that has not been confirmed; needs profiling. |
| **[NOT TESTED]** | Could not be performed; reason given. |

---

## STAGE 0 — Repository Safety Baseline ✅ COMPLETE

### 0.1 Initial Git state (recorded before any other action) [MEASURED]

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD | `cd1d9a3eda6c1e89be4cab69cf1658ac35d9db48` — "feat: enhance ProjectWheel3D interactions, update DinoRunner sprites, and optimize production build" (2026-10-16 11:29 +0530) |
| Staged changes | none |
| Untracked (non-ignored) files | none |
| Stashes | none |
| Modified, unstaged (9) | `app/globals.css`, `app/page.tsx`, `components/About.tsx`, `components/BackgroundTypography.tsx`, `components/Credentials.tsx`, `components/Expertise.tsx`, `components/HireMeModal.tsx`, `components/ui/AnimatedHeroHeading.tsx`, `components/ui/ProjectWheel3D.tsx` (+82 / −47 lines) |

Nature of the uncommitted changes (from `git diff`): almost entirely responsive Tailwind class tweaks (smaller mobile font sizes/paddings, smaller hero blur orbs on mobile, mobile wheel card width), an Escape-key handler in `page.tsx`, and a block of mobile/reduced-motion CSS appended to `globals.css`. **Consequence for this audit:** the local working tree is *not* identical to commit `cd1d9a3`, and the deployed site may correspond to neither. Local and deployed measurements are therefore reported separately.

### 0.2 Integrity snapshot method [MEASURED]

Before investigating, SHA-1 hashes of **every file outside `node_modules/`, `.git/`, `.next/`** (125 files, including git-ignored files such as `.env.local`, `scratch/`, `*.py`) plus `git status --porcelain -uall` and the full `git diff` were saved to the session scratchpad (outside the repo). These are re-checked at the end of the audit.

### 0.3 Rules adopted to keep the repo untouched

- The existing `.next/` directory (build from 2026-10-16 + dev cache, ~1.96 GB) is **not** touched. The production build for this audit is executed in an **isolated copy** of the sources in the session scratchpad (`app/ components/ lib/ public/` + config files copied; `node_modules` attached by an NTFS junction, read-only use). `.env.local` was deliberately **not** copied (it holds a `NEXT_PUBLIC_` form key; only affects the contact-form submit request).
- No `npm install`, `npx <download>`, formatter, linter `--fix`, or git write command is run.
- The only file created inside the repository is this report (`docs/reports/` did not previously exist).

---

## STAGE 1 — Project Reconnaissance & Architecture ✅ COMPLETE

### 1.1 Technology inventory (actually present) [STATIC]

| Area | Technology / version (from `node_modules/*/package.json`) | Where used |
|---|---|---|
| Framework | **Next.js 16.2.6**, App Router, `build` script forces **webpack** (`next build --webpack`) | `app/layout.tsx`, `app/page.tsx` |
| UI runtime | React 19.2.4 / react-dom 19.2.4 | everywhere |
| Language | TypeScript 5 (strict) | everywhere |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`, `shadcn/tailwind.css`, large hand-written `app/globals.css` (1 011 lines) + several runtime `<style>` blocks injected by components | global |
| Animation | **framer-motion 12.39.0** (dominant), **GSAP 3.15.0** (hero title only), CSS keyframes, hand-written `requestAnimationFrame` loops | most components |
| Smooth scroll | **Lenis 1.3.23** (`components/SmoothScroll.tsx`) | root layout |
| 3D / WebGL | **three 0.186.1**, **@react-three/fiber 9.8.1**, **@react-three/drei 10.7.9** | `components/GithubGraph3D.tsx` only (rendered) |
| WebGL (other) | **genie-web 0.1.3** (WebGL mesh-warp modal transition), **html-to-image 1.11.13** (DOM→canvas snapshot) | `components/HireMeModal.tsx` |
| 2D canvas | hand-written | `components/DinoRunner.tsx` |
| CSS 3D | hand-written `preserve-3d` carousel | `components/ui/ProjectWheel3D.tsx` |
| Icons | lucide-react 1.16 | many |
| Class merging | `cn` 0.4.0 (shadcn's compiled clsx+tailwind-merge replacement) via `lib/utils.ts` | `glow.tsx`, `button.tsx`, layout |
| Other deps present | `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `shadcn` (CLI, listed under *dependencies*), `geist` | see Stage 8 |
| Fonts | `next/font/google` ×6 (Geist, Inter, Space Grotesk, Instrument Serif, Montserrat, Syne), `geist/font` ×2 (GeistSans, GeistMono), `next/font/local` ×1 (Researcher .ttf), **plus 4 runtime CSS `@import url()`** (fontshare Cabinet Grotesk + Switzer, Google Montenegrin Gothic One, Anton, Archivo + Space Mono) | `app/layout.tsx`, `app/globals.css:1-4` |
| Data | Server Action (`'use server'` + `unstable_cache`) scraping `github.com/users/<u>/contributions` HTML | `lib/githubContributions.ts` |
| Forms | `fetch('https://api.web3forms.com/submit')` | `app/page.tsx:434` |
| Zustand | **not present** | — |
| GLSL | inline shaders only (genie-web, `GithubGraph3D` `onBeforeCompile`, unused `liquid-glass-carousel.tsx`) | — |
| Deployment | Vercel (`vercel.json` only sets `name`); `next.config.ts` is empty (defaults) | — |
| Tooling | scripts: `dev`, `build` (webpack), `start`, `lint`. **No tests, no Lighthouse, no bundle analyzer, no Playwright/Puppeteer** in `node_modules`. | — |

Environment: Windows 11 Home 10.0.26300, Node v24.18.0, npm 11.16.0, Chrome 156.0.8078.74 and Edge 156.0.4314.58 installed.

### 1.2 Routes [STATIC + MEASURED from build]

| Route | Type | Notes |
|---|---|---|
| `/` | `○ Static` (prerendered) | The entire portfolio. Single page with in-page `#anchor` navigation. |
| `/_not-found` | Static | Next default. |

There is no multi-route navigation, no route transitions, no dynamic routes, no API routes. "Navigation" = in-page anchor scrolling through Lenis/native smooth scroll.

### 1.3 Rendering architecture [STATIC — confirmed by build output in Stage 2]

```
app/layout.tsx  (Server Component)
 ├─ <CustomCursor/>   client  — rAF-throttled mousemove → transform
 ├─ <CursorGlow/>     client  — rAF-throttled mousemove → transform
 └─ <SmoothScroll>    client  — Lenis + permanent rAF loop
      └─ app/page.tsx  ("use client" — the WHOLE page is one Client Component)
           if (!mounted) return <spinner/>          ← page.tsx:471-477
           after mount (2nd render):
           ├─ IntroPreloader (fixed z-9999 overlay, 2.3 s + 0.85 s exit)
           ├─ ScrollProgressBar (useScroll + useSpring)
           ├─ inline <style> (glass button CSS)
           ├─ Social dock (4× Magnetic)          fixed
           ├─ Static glow orb (filter: blur(40px)) fixed
           ├─ .grid-overlay / .grain / .vignette  fixed full-viewport layers
           ├─ <nav> (backdrop-blur-xl, MagneticNavGroup, TimePill 1 Hz)  fixed
           ├─ HIRE ME button (Magnetic)            fixed
           ├─ HireMeModal  (hidden pre-capture copy + Genie WebGL wrapper)
           ├─ #hero: BackgroundTypography (4 stroked marquee rows), 3 blur orbs,
           │         DinoRunner (full-hero 2D canvas, rAF forever),
           │         ElasticHeroTitle (GSAP letter loop forever) inside
           │         ScrollReveal → motion.div(scroll-linked scale/opacity/y) → Magnetic,
           │         TypewriterTitle, StatsCard (backdrop-filter)
           ├─ BottomTicker (fixed, CSS marquee forever, mask-image)
           ├─ #about (intro + portrait next/image priority, mask + multiply blend)
           ├─ StatsMarquee (24 count-up rAF loops)
           ├─ About (component — ALSO id="about")
           ├─ Expertise (#stack — 24 animated SVG icon cells)
           ├─ #projects: ProjectWheel3D (CSS-3D carousel, rAF auto-rotate)
           ├─ #github: ScrollReveal(triggerOnce=false) → GithubContributions
           │         → GithubGraph3D (R3F <Canvas>, frameloop "always")
           ├─ Credentials (marquee ticker + AnimatePresence blur crossfade)
           ├─ #journey: JourneyTimeline (useScroll scaleY line)
           └─ #contact: form + GlowButton (spinning conic glow) + footer
```

Key architectural facts:

1. **Client/Server boundary** [STATIC]: only `app/layout.tsx` is a Server Component. `app/page.tsx` starts with `"use client"` (`page.tsx:1`) and statically imports every section, so **every section component, and every library they import (three, R3F, drei, framer-motion, GSAP, genie-web, html-to-image, lucide), is part of the initial client bundle for `/`**.
2. **SSR yields an empty shell** [STATIC]: `page.tsx:471-477` returns only a `Loader2` spinner while `mounted === false`; `mounted` flips in a `useEffect` (`page.tsx:392-393`). Server HTML therefore contains no content; all content is produced by a second client render after hydration.
3. **No dynamic imports** [STATIC]: `grep` finds no `next/dynamic` / `React.lazy` anywhere in `app/`, `components/`.
4. **Imported but not rendered** [STATIC]: `LiquidGlassCarousel` (`page.tsx:19`), `TechnologyArsenal` (`page.tsx:30`), `ProjectsShowcase`/`ProjectCard` (defined `page.tsx:87-232`, never used), `hoveredPillar`, `buildPillars`, `capabilities`, `isFinePointer` (dead state/data). Unreferenced component files: `MeshText.tsx`, `AnimatedDock.tsx`, `GlowButtonDemo.tsx`, `GlassButton.tsx`, `spiral-3d-slider.tsx`, `ExpertiseHoverItem.tsx`, `TechPill.tsx`. (Whether they reach the bundle is checked in Stage 8.)
5. **Continuous per-frame workloads that exist simultaneously** [STATIC] (each verified by reading the loop code; none of them is globally coordinated):

| # | Source | File:line | Stops when off-screen? |
|---|---|---|---|
| 1 | Lenis rAF loop | `SmoothScroll.tsx:17-23` | No (always running; cheap when idle — measured later) |
| 2 | DinoRunner canvas redraw | `DinoRunner.tsx:577-1201` | **No visibility check at all** |
| 3 | ElasticHeroTitle GSAP scheduler + tweens | `ElasticHeroTitle.tsx:130-236` | **No** |
| 4 | BackgroundTypography 4 CSS marquees | `BackgroundTypography.tsx:34-41, 70-76` | Yes (IntersectionObserver) |
| 5 | BottomTicker CSS marquee | `BottomTicker.tsx:73-80` | No (fixed element is always intersecting) |
| 6 | ProjectWheel3D rAF (style.transform + visibility per card) | `ProjectWheel3D.tsx:608-699` | Partially — loop keeps scheduling rAF; does work only while visible |
| 7 | GithubGraph3D R3F render loop (`frameloop` default `"always"`) + `useFrame` physics over ~365 instances | `GithubGraph3D.tsx:272-403, 551` | **No** — `isInView` prop defaults to `true` and is never passed (`GithubContributions.tsx:55`) |
| 8 | drei `ContactShadows` (re-renders scene into a render target + blur each frame by default) | `GithubGraph3D.tsx:588-595` | **No** |
| 9 | Expertise framer-motion `repeat: Infinity` SVG attribute animations (38 code sites, multiplied by `.map` loops) | `Expertise.tsx:110-790` | **No** — the `.expertise-paused` class (`Expertise.tsx:1167`) only pauses CSS animations |
| 10 | Expertise CSS animations (float/pulse/spin on 24 cells, blurred pulse circles) | `Expertise.tsx:944-958` | Yes (class toggle, rootMargin 200px) |
| 11 | StatsMarquee / Credentials CSS marquees | `StatsMarquee.tsx:72-79`, `Credentials.tsx:120-126` | Yes (IntersectionObserver) |
| 12 | GlowButton `glow-spin` (blurred rotating conic gradient) | `glow.tsx:68-84`, used `page.tsx:1301` | No |
| 13 | TypewriterTitle timers + cursor blink (framer, infinite) | `TypewriterTitle.tsx:19-70` | No |
| 14 | TimePill 1 Hz `setState` | `TimePill.tsx:30` | No (cheap) |
| 15 | Tailwind `animate-ping` / `animate-pulse` / `animate-bounce` / `animate-spin` decorations | various | No (CSS, compositor) |

6. **Global event listeners** [STATIC]: `mousemove` ×2 (cursor, glow), `pointermove`/`pointerup` on window (GithubGraph3D), `resize` ×2 (DinoRunner, ProjectWheel3D), `keydown` ×2 (page, modal), Lenis wheel/touch, Lenis/R3F scroll listeners (react-use-measure `scroll: true`), 7+ IntersectionObservers. All examined listeners have cleanup.

### 1.4 Asset architecture (summary — full inventory in Stage 7) [MEASURED file sizes / dimensions]

- `public/` holds 49 files. Largest: `reference/hero-effect.mp4.mp4` 21.5 MB (unreferenced), `portrait/My Portrait White Shirt.png` 5.2 MB 2048×2048 (via `next/image` priority), `velari-preview.png` 3.5 MB 1920×1080 (used **raw as CSS `background-image`** in ProjectWheel3D), `10_individual_dinos_no_overlap.zip` 2.9 MB (unreferenced), 7 unreferenced 1.2–1.9 MB dino sprite PNGs.
- 18 public files are not referenced by any source file (list in Stage 7).

### 1.5 Initial dependency map (who pulls what) [STATIC]

| Heavy library | Pulled in by (rendered) | Needed for first paint? |
|---|---|---|
| three + @react-three/fiber + @react-three/drei | `GithubGraph3D` (section 6, far below fold) | No |
| genie-web + html-to-image | `HireMeModal` (only on "Hire Me" click) | No |
| gsap | `ElasticHeroTitle` (hero) | Only for the letter loop (starts ≥0.5 s after mount) |
| framer-motion | ~25 components | Yes (ScrollReveal wraps hero content) |
| lenis | `SmoothScroll` (layout) | Yes |

### 1.6 Open questions after Stage 1

- Q1: Is the SSR-empty shell + intro preloader the main LCP driver? → Stage 2 measurement.
- Q2: What is the per-frame main-thread cost of the simultaneous loops listed in 1.3.5 at idle (hero) vs. mid-page? → Stage 2/5/6 tracing.
- Q3: Does the hidden HireMeModal `<iframe src=…Resume.pdf>` load at page start? (genie-web keeps children mounted with `visibility:hidden` — `node_modules/genie-web/dist/chunk-5FUC6FK5.js` `R()` sets `visibility:hidden !important`) → network log.
- Q4: Is the `html-to-image` pre-capture (`HireMeModal.tsx:247-261`, 600 ms after mount, `skipFonts:false`) producing a long task during the intro? → trace.
- Q5: Are the global `* { transition-property…; transition-duration: 0s }` rules in **unlayered** CSS (`globals.css:888-891`) overriding Tailwind v4 `@layer utilities` transition utilities? (Unlayered declarations beat layered ones regardless of specificity.) → computed-style check.

---

## STAGE 2 — Performance Baseline ✅ COMPLETE

### 2.1 Test environment [MEASURED]

| Item | Value |
|---|---|
| Machine | Windows 11 Home 10.0.26300 laptop; GPUs present: Intel UHD Graphics (0x9A68) + NVIDIA RTX 3050 Laptop |
| Browser | Chrome 156.0.8078.74, `--headless=new`, driven by a hand-written CDP client (scratchpad, no installed tools) |
| WebGL / compositing | `ANGLE (Intel UHD Graphics, Direct3D11)` — hardware GPU compositing + rasterization enabled (verified via `SystemInfo.getInfo`). **i.e. the integrated GPU — representative of typical laptops, not of a discrete-GPU desktop.** |
| Display frame-rate ceiling in this harness | **~127 fps (8.0 ms frames)** measured on `about:blank` (renderer 3.8 % CPU, GPU-process 2.1 % CPU). All fps figures below should be read against this ceiling. |
| Node / npm | v24.18.0 / 11.16.0 |
| Local server | `next start -p 3123` on the isolated **production** build (webpack) of the current working tree |
| Desktop profile | 1440×900, DPR 1, no throttling, cache cleared before each run (cache enabled during run) |
| Mobile profile | 390×844, DPR 3, touch emulation (`pointer: coarse` = true verified), Android UA, **Slow-4G-like DevTools throttling** (150 ms RTT, 1.6 Mbps down, 750 kbps up) **+ 4× CPU throttling** |
| Lighthouse | **[NOT TESTED]** — not installed; installing it is outside the rules. Metrics were collected with the same browser APIs Lighthouse uses (PerformanceObserver: paint, LCP, layout-shift, longtask, long-animation-frame, event timing). No Lighthouse "score" is reported. |
| Runs | 3 per desktop scenario, 2 local-mobile, 1 deployed-mobile (medians reported) |

**Environment contamination found and controlled:** the machine runs **AdGuard** (system-level filter). It injects two scripts into *every* page — a 65.5 KB content script and a **2,289 KB** "AdGuard Assistant / In-Page Side Assistant (Gemini Edition)" userscript bundle — plus a hidden `https://gemini.google.com/` iframe. Run 1 (unblocked) showed them; all subsequent runs block `*local.adguard.org*` and `*gemini.google.com*` via `Network.setBlockedURLs`. **This is not part of the portfolio**, but it means the owner's *own* experience of the site on this laptop carries ~2.35 MB of extra JS per page load that visitors do not pay.

**Local-build artifact:** in the isolated build, `.next/server/next-font-manifest.json` came out empty (`"app":{}`), so the local HTML has **no `<link rel=preload as=font>`**, whereas the deployed HTML has 10 font preloads. Cause is most likely the junctioned `node_modules` used to keep the repo's `.next` untouched. Therefore: **loading metrics are taken from the current production deployment; the local build is used for runtime/steady-state behaviour** (identical code paths).

### 2.2 Which deployment is "production"? [MEASURED — 2026-11-02 05:27 UTC]

| URL | `Age` header (edge cache) | Implied deploy date | Bundler | Content |
|---|---|---|---|---|
| `https://prajit-balaji-portfolio.vercel.app/` (URL given in the brief) | 12,747,789 s | ≈ **2026-06-07** | Turbopack | An old June version: 17 requests, 330 KB, 533 DOM elements, no preloader / 3D graph / wheel / dino. |
| `https://prajith-balaji-portfolio.vercel.app/` (project name in local `.vercel/project.json`) | 1,466,253 s | ≈ **2026-10-16** | webpack | Matches **HEAD `cd1d9a3`** (committed state; e.g. hero `<h1>` still has `whitespace-nowrap` removed only in the uncommitted diff). |

**Finding D-1:** the URL supplied as the "deployment reference" is a ~5-month-old build. The code under audit is live on the `prajith-…` domain. All "production" numbers below use the `prajith-…` deployment. (Whether the `prajit-…` project still receives deploys cannot be checked without Vercel access.)

### 2.3 Load metrics — medians [MEASURED]

| Scenario | TTFB | FCP | LCP | CLS | TBT (FCP→+12 s) | Long tasks | Content mounted | Intro overlay gone | Requests | Transferred |
|---|---|---|---|---|---|---|---|---|---|---|
| **Production (current), desktop** ×3 | 134 ms | 1,168 ms (range 700–5,984) | **2,920 ms** (1,840–6,692) | 0.055 | **1,956 ms** | 12 | 1,403 ms | **5,349 ms** | 124 | 11.3 MB |
| **Production (current), mobile Slow-4G + 4× CPU** ×1 | 158 ms | 3,124 ms | **9,032 ms** | 0.014 | **6,289 ms** | 15 | 6,302 ms | **12,665 ms** | 128 | ≥2.2 MB (window ended before large PNGs finished) |
| Local prod build, desktop ×3 | 20 ms | 784 ms | 2,400 ms | **0.792** | 2,571 ms | 13 | 889 ms | 5,966 ms | 119 | 11.2 MB |
| Local prod build, mobile Slow-4G + 4× CPU ×2 | 19 ms | 1,490 ms | 6,598 ms | 0.185 | 6,641 ms | 17 | 4,382 ms | 11,497 ms | 121 | ≥2.4 MB |
| Old June deployment, desktop ×3 (reference only) | 261 ms | 616 ms | 2,824 ms | 0 | 116 ms | 1 | 840 ms | — | 17 | 0.33 MB |

Reference thresholds: LCP ≤ 2.5 s, CLS ≤ 0.1, TBT (lab proxy for INP) ideally < 200 ms. **Production fails LCP on desktop (median 2.92 s) and badly on mobile (9.0 s); TBT is 10–30× the target.** Note that FCP/LCP elements are misleading here: FCP is the *spinner* (SSR shell) and LCP is the faint 6 %-opacity background marquee text (`SPAN.block.px-8` in `BackgroundTypography`), painted underneath the intro overlay. What a visitor actually *sees* first is the intro overlay; real content becomes visible only when the overlay leaves (**5.3 s desktop / 12.7 s mobile**, against a coded duration of 3.15 s after mount — `IntroPreloader.tsx:16-24` + 0.85 s exit).

Production desktop run 1 had FCP **5,984 ms** with TTFB 114 ms: the render-blocking `@import url('https://api.fontshare.com/…')` (`globals.css:1`) took **5.6 s** (295 → 5,882 ms) on that run. Nothing (not even the spinner) paints until all four imported third-party stylesheets arrive.

### 2.4 What the network actually carries (production, desktop, median run) [MEASURED]

| Type | Count | KB | Notes |
|---|---|---|---|
| Script | 13 | 555 | 12 first-party chunks, all on the initial load (no lazy chunks used by `/`) |
| Image | 13 | **8,044** | `velari-preview.png` **3,552 KB**, `pets-strip.png` 1,164, `postgresql.png` 748, `devmentor` 740, `cardiovanta` 731, `kadence` 620, `01_astronaut_dino` 286 … all raw PNG except portrait/logo (`next/image`, 45 KB + 0.7 KB) |
| Fetch | **74** | **2,240** | **`html-to-image` font embedding** (re-fetches 4 remote CSS + every font file in every format, including unused Anton/Archivo/Space Mono and fontshare `.woff`/`.ttf`; next/font files fetched up to 6× each) — started by `HireMeModal.tsx:247-261` |
| Fetch (HDR) | 1 | **1,507** | `raw.githubusercontent.com/pmndrs/drei-assets/…/potsdamer_platz_1k.hdr` (drei `<Environment preset="city">`), `cache-control: max-age=300` |
| Font | 14 | 459 | 10 next/font preloads + Montenegrin Gothic + 3 Cabinet Grotesk |
| Document | 3 | — | page, **`/Prajit_Balaji_Resume.pdf` (hidden iframe, loaded at startup) + Chrome PDF-viewer extension** |
| POST `/` | 1 | 3 | Server Action `getGithubContributions` — 289 ms on prod (edge-cached), **3.7 s** cold on local |

Cache headers [MEASURED]: hashed `/_next/static/*` = `public,max-age=31536000,immutable` (good, brotli). **`/public` images = `public, max-age=0, must-revalidate`** → every repeat visit revalidates ~8 MB of PNGs (304s, but one round-trip each). HTML = `max-age=0, must-revalidate`, `x-vercel-cache: HIT`.

### 2.5 Long-task attribution during load (Long Animation Frames API, script attribution mapped to source) [MEASURED]

Positions inside minified chunks were mapped back to code by reading the chunk text at the reported character offset.

| LoAF (local desktop run 2) | Duration (blocking) | Script → source |
|---|---|---|
| t=1,203 ms | 1,259 ms (1,190) | React scheduler `performWorkUntilDeadline` (`616-*.js@181918`) — **the second client render that mounts the whole page** after `mounted=true` (`page.tsx:471`) |
| t=5,224 ms | 1,408 ms (1,305) | R3F global loop `eq` (`dc1647ae-*.js@156441`, `requestAnimationFrame(eq)`) — **first GitHub-graph frame: shader compile/link + PMREM of the HDR environment** |
| t=743 ms | 448 ms (374) | framer-motion frame batch `y` (`766-*.js@20236`) — **294 ms of forced style/layout** (first full layout of the page forced by a framer read) |
| t=2,988 ms | 374 ms (270) | `IMG[src="/pets-strip.png"].onload` 281 ms + `01_astronaut_dino.png.onload` 72 ms — `DinoRunner.tsx:332-475` `getImageData` pixel loops over a 2170×725 image |
| t=2,646 ms | 307 ms (211) | Lenis `Dimensions` debounced `resize()` (`layout-*.js@1956`) — **221 ms forced layout** |
| t=3,368 ms | 251 ms (179) | `HireMeModal` 600 ms timer → `html-to-image toCanvas` clone (`page-*.js@131328`) |
| t=4,335 / 4,773 ms | 312 / 270 ms | `FileReader.onloadend` in html-to-image `fetchAsDataURL` (`766-*.js@201222`) — base64-encoding the fetched fonts |
| t=5,055 ms | 154 ms | three.js `Response.arrayBuffer.then` — HDR (RGBE) decode |

On mobile (4× CPU) the same items scale up: framer forced layout **1,444 ms**, React mount 666 + 871 ms, html-to-image timer 964 ms, a 2,259 ms frame dominated by `FileReader.onloadend`.

### 2.6 CLS root cause [MEASURED]

All shifting nodes are `#text` inside `BackgroundTypography`'s `SPAN.block.px-8` (4 rows × 4 copies of 12 rem stroked text). Shift rects (local run 2, t=2,953 ms, score 0.7914): e.g. `[0,620,1434,170] → [0,620,134,170]` — the text runs re-flow horizontally at the moment the **fontshare Cabinet Grotesk** (`font-display` utility → `'Cabinet Grotesk'`, loaded through the CSS `@import`, `display=swap`, *no metric-adjusted fallback*) finishes loading. Because the rows cover ~75 % of the viewport, one swap scores ~0.79. Whether it happens is a **race** between font arrival and the second client render: 0.79 locally (fonts late), 0.055 / 0.014 in production (fonts usually earlier). The shift is under the intro overlay and at 6 % opacity, so it is barely visible — but it is counted by Core Web Vitals field data.

### 2.7 Idle steady state — the core "lag" signal [MEASURED]

Method: load, wait 20 s (all one-off load work done), scroll instantly to a section, wait 3 s, then sample 4–5 s windows with **no input at all**. Collected: rAF frame intervals, `Performance.getMetrics` deltas (main-thread task/script/style/layout time and counts), per-process CPU (`SystemInfo.getProcessInfo`).

**Baseline, desktop (local prod build):**

| Position | fps (ceiling 127) | p95 frame | main-thread busy | style recalcs / layouts per 5 s | renderer CPU | GPU-process CPU |
|---|---|---|---|---|---|---|
| hero | 44.7–58 | 32–39 ms | 72–75 % | ~220 / ~220 (one per frame) | 102–109 % | 97–104 % |
| about | 74 | 24 ms | 92 % | 375 / 373 | 129 % | 89 % |
| stack (Expertise) | 48–51 | 32 ms | **91–94 %** | ~205 / ~205 | 151–160 % | 105–109 % |
| projects (wheel) | 38–43 | 32–41 ms | 48–59 % | ~160 / ~160 | 89–116 % | 110–123 % |
| github (3D graph) | 35–41 | 32–41 ms | 73–76 % | ~160 / ~160 | 122–130 % | **129–139 %** |
| contact | 70 | 25 ms | 67 % | 351 / 351 | 92 % | 107 % |

For comparison a blank page: 127 fps, 1.7 % main-thread busy, renderer 3.8 %, GPU 2.1 %.

**Interpretation:** with zero user input the page keeps the main thread 50–94 % busy, recomputes style **and layout on every frame**, and keeps the GPU process at ≥ 1 full core. Any scroll or click must compete with this, which is the measured mechanism behind "heavy lag".

**rAF loops that run at every scroll position** (per-callback timing via an in-browser `requestAnimationFrame` wrapper — JS time only):

| Loop | Source | JS ms/frame (all positions) |
|---|---|---|
| framer-motion frame batch | framer-motion (Expertise SVG loops, springs, scroll values …) | 0.7–1.3 |
| R3F `eq` | `GithubGraph3D` Canvas | 0.45–0.81 (**even at the hero, ~9,000 px away**) |
| DinoRunner `frame` | `DinoRunner.tsx:577` | 0.37–0.50 (**even when the hero is off-screen**) |
| GSAP ticker | `ElasticHeroTitle` | 0.13–0.25 (**even off-screen**) |
| ProjectWheel `tick` | `ProjectWheel3D.tsx:624` | 0.01 off-screen / 0.07 visible |
| Lenis | `SmoothScroll.tsx:18` | ≤ 0.01 (negligible) |

JS is only ~3 ms of each frame; the rest of the busy time is style recalc, layout, paint and compositing triggered by these loops.

### 2.8 Reversible A-B-A ablation (attribution of the idle cost) [MEASURED]

Same page instance, same position; each condition measured for 4 s and sandwiched between baseline windows. "Paused" rAF loops are kept alive but not executed (fully reversible). "CSS paused" injects `*{animation-play-state:paused!important}` at runtime. *No source file was modified — all ablation is done inside the browser.* Because removing work raises fps (and therefore compositor work per second), GPU cost is also given **per frame** (GPU-process CPU ms ÷ frames).

| Position | Condition | fps | p95 | >33 ms frames /4 s | main busy | layouts /4 s | GPU-proc CPU | GPU ms/frame |
|---|---|---|---|---|---|---|---|---|
| hero | **baseline** (5×) | 54–57 | 32–39 | 4–13 | 73–77 % | 207–233 | 97–112 % | ~18 |
| hero | framer loop paused | **68** | 24 | 1 | **54 %** | **33** | 92 % | ~13.5 |
| hero | DinoRunner paused | 63 | 24 | 0 | 81 % | 255 | 108 % | ~17 |
| hero | GSAP paused | 54 | 33 | 9 | 72 % | 217 | 99 % | ~18 |
| hero | CSS animations paused (2×) | 66–69 | 24–31 | 1–7 | 73 % | 268–278 | 84–90 % | ~13 |
| hero | **everything paused** (2×) | **126–127** | **8.1** | 0 | **27–29 %** | 37–44 | **17–24 %** | ~1.6 |
| github | **baseline** (7×) | 37–41 | 32–41 | 8–26 | 73–76 % | 152–170 | 129–135 % | ~33 |
| github | R3F loop paused (2×) | 47–51 | 32 | 0–4 | 85–86 % | 189–206 | 135–138 % | ~28 |
| github | framer paused | 49 | 32 | 7 | 59 % | 36 | 123 % | ~25 |
| github | **DinoRunner paused** | 51 | 32 | 1 | 78 % | 208 | **84.5 %** | **~17** |
| github | **CSS animations paused** | 58 | 31.5 | 0 | 84 % | 235 | **86.7 %** | **~15** |
| github | everything paused | 126 | 8.1 | 0 | 57 % | 38 | 2.8 % | ~0.2 |
| projects | baseline (5×) | 38–43 | 32–41 | 6–13 | 48–59 % | 152–175 | 110–123 % | ~29 |
| projects | wheel loop paused (2×) | 46–47 | 32–39 | 1–11 | 54–57 % | 186–192 | 103–110 % | ~23 |
| projects | everything paused | 128 | 8.1 | 0 | 48 % | 34 | 2.9 % | ~0.2 |
| stack | baseline (5×) | 50–51 | 32 | 2–6 | **91–94 %** | 203–208 | 105–110 % | ~21 |
| stack | framer paused (2×) | 55–56 | 32 | 1–6 | 88–90 % | 224–229 | 99 % | ~18 |
| stack | **CSS animations paused** | **92** | **16.1** | 0 | 93 % | 370 | 75 % | ~8 |
| stack | everything paused | 127 | 8.1 | 0 | 16 % | 41 | 18 % | ~1.4 |

**Conclusions from the ablation (high confidence, reproduced):**
1. **When all always-on animation loops are paused, every tested section runs at the display ceiling (126–128 fps, p95 8.1 ms).** The idle lag is therefore caused by continuously running animation work, not by DOM size, images or static CSS.
2. There is **no single culprit**. Costs stack: framer-motion's loop forces **a layout on every frame** (layouts drop from ~220 to ~33 per 4 s when it is paused); **DinoRunner's full-viewport canvas costs ~45 GPU-process points even when the hero is not visible**; CSS infinite animations dominate at the Expertise section (fps 51 → 92 when paused) and cost ~40–45 GPU points at the GitHub section; R3F rendering is the main frame-drop source when the graph is on screen.
3. Even with everything paused, main-thread busy stays at **48–57 %** at the projects/github positions (vs 16–29 % elsewhere), which points to a large per-frame layer-tree/commit cost from the ~60 `preserve-3d` facet layers of `ProjectWheel3D` → investigated in Stage 6/9.
4. Anomaly (unresolved): at the hero, pausing the R3F loop *raised* GPU-process CPU (142–145 % vs ~100 %, 3/3 repeats) without raising fps. Not explained; flagged for a GPU trace in Phase 2.

### 2.9 Metrics not obtained in Stage 2

| Metric | Status |
|---|---|
| INP | Lab interactions are measured in Stage 3. No field INP data (no RUM/CrUX access). |
| Speed Index | **[NOT TESTED]** — requires filmstrip capture + Speed Index computation (Lighthouse/WebPageTest); not available without installing tools. |
| Real-device mobile | **[NOT TESTED]** — only emulation (viewport, DPR 3, touch, 4× CPU, network throttling). Real mobile GPUs were not available. |
| Discrete-GPU numbers | **[NOT TESTED]** — Chrome selected the Intel iGPU; the RTX 3050 was not forced. |

---

## STAGE 3 — The Visitor Experience (loading, scrolling, navigation, interactions, responsive) ✅ COMPLETE

### 3.1 Initial loading — what the visitor sees [MEASURED + STATIC]

Sequence (production, desktop median): 0–1.2 s blank → dark `#0a0807` full-screen spinner (`page.tsx:471-477`; the site itself is cream `#f2ece1`, so this is also a dark→light flash) → at ~1.4 s the page mounts behind a cream intro overlay → overlay leaves at **~5.3 s** (mobile: content 6.3 s, overlay gone **12.7 s**). The overlay's own timers (`IntroPreloader.tsx:16-24`: outro at 1.8 s, removal at 2.3 s, 0.85 s exit) are stretched by the long tasks in §2.5 because they share the main thread with the full-page mount, the html-to-image capture, the DinoRunner pixel loops and the first R3F frame. Images for content far below the fold (6 project PNGs = 5.8 MB, postgresql 748 KB, dino sprites 1.45 MB) start downloading at ~1.6 s, competing with fonts/JS on slow links.

### 3.2 Scrolling [MEASURED]

Desktop: real wheel events (100 px notches every 40 ms, in bursts) dispatched through CDP → handled by Lenis, 14 s from the top. Mobile: raw touch drags (synthesized touch gestures did not scroll in this harness; raw `Input.dispatchTouchEvent` did — verified separately).

| Scenario | fps (ceiling 127) | p50 | p95 | p99 | max | frames > 33 ms | frames > 50 ms | main busy |
|---|---|---|---|---|---|---|---|---|
| Desktop wheel, run 1 | 38.8 | 24 ms | 40.6 ms | 71 ms | 183 ms | 70 / 543 | 15 | 79 % |
| Desktop wheel, run 2 | 39.2 | 24 ms | 47.4 ms | 64 ms | 174 ms | 64 / 549 | 19 | 79 % |
| Desktop wheel, R3F + Dino + GSAP + wheel loops and CSS animations paused (framer kept running) | 58.6 | 16 ms | 31.6 ms | 64 ms | 443 ms | 21 / 821 | 10 | 82 % |
| Mobile touch drag, 1× CPU | 43.8 | 24 ms | 32 ms | 48 ms | 72 ms | 22 / 614 | 5 | 57 % |
| **Mobile touch drag, 4× CPU** | **16.5** | **56 ms** | **79 ms** | 96 ms | 127 ms | 232 / 232 | **200** | 95 % |
| Mobile touch drag, 4× CPU, loops paused | 19.5 | 48 ms | 64 ms | 104 ms | 461 ms | 254 / 274 | 101 | 89 % |
| Mobile *idle* (no input), 4× CPU (hero) | 14.1 | 64 ms | 105 ms | 159 ms | 185 ms | 198 / 198 | 186 | ~100 % |

Observations:
- On desktop, even with the always-on loops paused, scrolling shows 69–85 ms frames attributed to React (`MessagePort.onmessage`, scheduler). Mechanism [STATIC]: the scroll-spy IntersectionObserver calls `setActiveSection` (`page.tsx:398-404`), which re-renders the **entire `Home` component** (all sections are rendered inline in one component; nothing is memoised), every time the active section changes during a scroll. Other per-section `setInView` observers (`BackgroundTypography`, `BottomTicker`, `StatsMarquee`, `Credentials`) re-render their own subtrees.
- Long frames without script attribution (150–440 ms) occur when large sections first scroll into view — rendering work (style/layout/paint/raster of large layers and image decode of the raw multi-MB PNGs) rather than JS. [MEASURED that they have no script; mechanism HYPOTHESIS, needs a full trace in Phase 2].
- On a 4×-slower CPU the page cannot reach 20 fps whether idle or scrolling, and pausing the loops helps little: the floor there is per-frame style + layout over ~3,100 elements (style ≈ 2.0–2.5 s and layout ≈ 0.4–1.1 s per 14 s window) driven by framer-motion and CSS animations.

### 3.3 Navigation [MEASURED]

- **Lenis anchor handling is dead.** `DOMDebugger.getEventListeners` on `nav a[href="#projects"]` returns **no listeners**; the click is not `defaultPrevented`; the scroll is the browser's native `scroll-behavior: smooth` (`globals.css:319`). Mechanism [STATIC]: `SmoothScroll.tsx:42` runs `querySelectorAll('a[href^="#"]')` once in its mount effect — at that moment `page.tsx` is still rendering only the spinner (`mounted === false`), so it finds zero anchors.
- During the anchor-driven travel to `#projects` (≈9,000 px), frames were **p95 341 ms / max 388 ms** (fps 15.2) at 1× CPU — the page renders every section it passes through.
- There are no routes or route transitions (single page). Mobile menu open/close was not separately timed (it is a CSS `max-height` transition; per Q5 below its Tailwind transition is in fact disabled).
- **Duplicate `id="about"`** [MEASURED: `document.querySelectorAll('#about').length === 2`]: `page.tsx:1011` and `components/About.tsx:10`. The "About" nav item and scroll spy can only ever target the first one.

### 3.4 Hover / click / keyboard interactions — Event Timing [MEASURED]

Desktop 1440×900. "INP candidate" = longest event duration within the interaction (input delay + processing + presentation).

| Interaction | 1× CPU | 4× CPU | Main cost (LoAF attribution at 4×) |
|---|---|---|---|
| Click **HIRE ME** (open modal) | 272 ms (presentation 256) | **9,832 ms** | `#document.onclick` 8,711 ms, of which **5,845 ms forced style/layout** |
| **Escape** (close modal) | **416 ms** (processing 230) | **4,592 ms** | page `onkeydown` 3,799 ms (2,724 ms forced layout) |
| Type a character in contact "Name" (12 keys) | ≤112 ms/key | **≤1,560 ms/key** | `#document.oninput` 842 ms — full `Home` re-render per keystroke (form state lives in `page.tsx:382-384`) |
| Nav click → `#projects` | 120 ms | 1,152 ms | framer frame + pointer events |
| Project wheel: focus a card | 208 ms | 744 ms | React click + 63 facet animations |
| Project wheel: background unfocus | 64 ms | 432 ms | |
| GitHub "2025" toggle | 96 ms | 824 ms | |
| Expertise: hover 6 cells | (no discrete interaction) frames p95 71 ms | frames p95 528 ms | row-level `setActiveSkill` re-renders 6 complex SVG cells |
| Credentials ticker: hover 4 items | worst frame **668 ms** | frames p95 611 ms | `setActiveId` → `AnimatePresence` blur crossfade + new `next/image` |

**Lab INP (max over 19 interactions): 416 ms at 1× CPU, 9,832 ms at 4× CPU** (target ≤ 200 ms). Mechanism for the modal (static, consistent with the forced-layout attribution): `setHireMeOpen(true)` re-renders all of `Home`; then the modal effect (`HireMeModal.tsx:274-316`) reads `window.innerWidth - document.documentElement.clientWidth` (forced layout), writes `body.style.paddingRight`/`overflow:hidden` and a margin on the fixed container (full-page relayout at a new width), and genie-web's `show()` reads `getBoundingClientRect()` on target and origin. React flushes effects from discrete input synchronously, so all of it lands inside the click task.

### 3.5 Q5 resolved — Tailwind transitions are globally disabled [MEASURED]

`getComputedStyle` on elements carrying Tailwind transition utilities (`nav.fixed` with `transition-all duration-700`, any `.transition-opacity`, `.transition-colors`, `.transition-all`) returns `transition-property: background-color, border-color, color, fill, stroke, box-shadow; transition-duration: 0s`. The unlayered rule `*, *::before, *::after { transition-property: …; transition-duration: 0s; }` (`globals.css:888-891`) beats every Tailwind v4 utility (which lives in `@layer utilities`). Hand-written unlayered classes (`.cursor-ring`, `.glass-icon-btn`) keep their transitions. **Consequence:** every Tailwind hover/fade/slide transition in the codebase (hundreds of `transition-*`/`duration-*` classes) currently snaps instantly — a visual-quality bug, and a trap for Phase 2 (fixing it will *add* transition work).

### 3.6 Responsive / device-specific [MEASURED + STATIC]

- `pointer: coarse` is honoured by `CustomCursor`/`CursorGlow` (both early-return) — but `HireMeModal.tsx:322-323` adds `has-custom-cursor` to `<html>` unconditionally whenever the modal is closed (observed on the mobile profile). Visually harmless (the CSS is gated by `@media (pointer: fine)`), but it un-hides the cursor elements' `display`.
- Mobile at DPR 3: DinoRunner canvas is **1170×2532 (2.96 MP)** redrawn every frame; GitHub graph canvas 646×1097 (DPR capped at 2 by R3F). Grain is hidden < 768 px (`globals.css:440`).
- Mobile throttled CPU makes every interaction ≥ 0.4 s (table 3.4) and every frame ≥ 48 ms (table 3.2).

### 3.7 Long-session memory and compositor layers (data used by Stages 6, 9, 11) [MEASURED]

Compositor layers (`LayerTree` domain, desktop, after load):

| Position | Layers (total / drawing) | Notable layers |
|---|---|---|
| hero | 372 / 83 | 4 BackgroundTypography rows **13,760–16,121 × 221 px (3.0–3.6 MP each)**, reason `ActiveTransformAnimation` + `WillChangeTransform`; full-page "Overlap" squashing layers |
| stack | 657 / 382 | + HireMeModal hidden pre-capture copy `fixed z-[-9999]` 1434×931 (always composited), DinoRunner canvas 1434×900, `.grid-overlay` 1434×900 |
| projects / github | 673–685 / 413–421 | + `.vignette` 1434×900, wheel facets |

Upper-bound raster area of drawing layers: ~92–97 MP (≈350–370 MB RGBA *if fully rastered*; Chrome only rasters tiles near the viewport, so real GPU memory is lower — **actual GPU memory was not measurable** with available tools).

Memory over 8 heavy cycles (open/close modal, scroll the whole page, toggle GitHub year), forced GC before each sample:

| Sample | JS heap | DOM nodes | Documents | JS listeners | Canvases |
|---|---|---|---|---|---|
| start | 15.0 MB | 4,168 | 5 | 2,156 | 3 |
| cycle 2 | 17.3 MB | 4,180 | 5 | 3,872 | 3 |
| cycle 4 | 17.7 MB | 4,176 | 5 | 3,872 | 3 |
| cycle 6 | 18.0 MB | 4,174 | 5 | 3,872 | 3 |
| cycle 8 | 18.0 MB | 4,176 | 5 | 3,872 | 3 |

**No evidence of a leak**: heap plateaus, node/canvas/document counts are flat; listeners grow once (first modal/scroll cycle) then stay flat. WebGL GPU-resource disposal cannot be observed with these counters.

---

## STAGE 4 — Component-by-Component Audit ✅ COMPLETE

Classification: **HEALTHY** · **NEEDS INVESTIGATION** · **PERFORMANCE ISSUE** · **CRITICAL PERFORMANCE ISSUE**. "Measured" means the component's cost was isolated in Stages 2–3 (ablation, LoAF, layer tree, network); otherwise the evidence is static.

### 4.1 Rendered components

| Component (file) | Role | What it does per frame / on events | Evidence | Classification |
|---|---|---|---|---|
| **`app/page.tsx` (`Home`)** | Entire page, one client component | Returns spinner until `mounted` (`:471-477`) → SSR shell is empty; second render mounts ~3,100 elements in one 1.1 s task; owns scroll-spy state (`:363, :398-404`), mobile-menu/modal state and **contact-form field state (`:382-384`)** → every keystroke / section change / modal toggle re-renders the whole page; unused state & data (`hoveredPillar`, `buildPillars`, `capabilities`, `isFinePointer`, `ProjectsShowcase`, `ProjectCard`) | MEASURED: LoAF 1,147 ms React mount; INP 112 ms/key (1×), 1,560 ms/key (4×); 69–85 ms React frames while scrolling | **CRITICAL** |
| `app/layout.tsx` | Root layout (server) | Loads 6 next/font Google families + 2 `geist` families + 1 local font; **Geist loaded twice** (`Geist` from next/font and `GeistSans` from the `geist` package) | STATIC + network (10 font preloads, 459 KB fonts) | PERFORMANCE ISSUE |
| `SmoothScroll` (`components/SmoothScroll.tsx`) | Lenis smooth wheel | Permanent rAF (`:17-23`, ≤ 0.01 ms/frame); Lenis `Dimensions` debounced resize re-measures the document (221 ms forced layout during load); anchor binding at mount finds **0 anchors** (`:42`) | MEASURED (LoAF, `getEventListeners`) | PERFORMANCE ISSUE (functional bug + forced layouts) |
| `CustomCursor` | Dot + ring cursor | rAF-throttled transform writes (good); `target.closest(...)` ×2 and 4 `classList.toggle` on **every** `mousemove` (`:48-58`) | STATIC | HEALTHY (minor: unthrottled `closest`) |
| `CursorGlow` | 400 px radial glow following mouse | rAF-throttled `translate3d`; `will-change: transform` | STATIC | HEALTHY |
| `IntroPreloader` + `IntroLoadingBar` | 2.3 s intro overlay | Overlay holds the real content hidden; loading bar calls **two `setState` per rAF** for 1.3 s (`IntroLoadingBar.tsx:32-38`); infinite shimmer while running | MEASURED (overlay gone at 5.3 s desktop / 12.7 s mobile vs 3.15 s coded) | PERFORMANCE ISSUE (UX-critical gate on LCP-as-perceived) |
| `ScrollProgressBar` | Top progress bar | `useScroll` + `useSpring` → `scaleX` (composited) | STATIC | HEALTHY |
| Social dock (inline in page `:706-761`) | 4 fixed icon buttons | `backdrop-filter: blur(16px)` ×4 fixed (`:641`) + multi-layer `box-shadow` + `drop-shadow` on SVG; 4 `Magnetic` springs | STATIC | NEEDS INVESTIGATION (fixed backdrop-filters re-sample content every scrolled frame) |
| Static glow orb / `.grid-overlay` / `.grain` / `.vignette` (`page.tsx:764-774`, `globals.css:337-466`) | Full-viewport fixed decoration | 4 permanently composited full-viewport layers (orb has `filter: blur(40px)`; grain is an SVG `feTurbulence` data-URI tile) blended on every composited frame | MEASURED (layer tree: grid-overlay & vignette 1434×900 layers) | NEEDS INVESTIGATION (overdraw; cost not isolated) |
| Navbar (`page.tsx:777-863`) + `MagneticNavGroup` | Fixed glass nav | `backdrop-blur-xl`; per-mousemove `getBoundingClientRect()` ×5 items inside `useTransform` (`MagneticNavItem.tsx:69-73`); 28 ms `setInterval` scramble with `setState` (`:37-54`); `boxShadow` computed from `glow.get()` at render time (`:100-102`, only updates on re-render) | STATIC | NEEDS INVESTIGATION (hover cost small, not isolated) |
| `TimePill` | IST clock | 1 Hz `setState` + `animate-ping` | STATIC | HEALTHY |
| HIRE ME button | Opens modal | see `HireMeModal` | MEASURED | (see below) |
| **`HireMeModal`** | Genie-animated modal | Always mounts **two** copies (hidden pre-capture copy, permanently composited; real copy hidden by genie with `visibility:hidden`); real copy contains an `<iframe src="/Prajit_Balaji_Resume.pdf">` that **loads the PDF viewer at startup**; 600 ms after mount runs `html-to-image toCanvas(..., {skipFonts:false})` (`:247-261`) → **74 fetches / 2.2 MB** of fonts + base64 encoding; open/close effect forces layouts (`:274-316`); genie-web adds a full-viewport WebGL2 canvas to `<body>` | MEASURED: network, LoAF (190–964 ms timers, FileReader frames up to 2.26 s on mobile), INP 272/416 ms (1×), 9.8 s / 4.6 s (4×) | **CRITICAL** |
| `BackgroundTypography` | 4 rows of giant stroked marquee text in hero | 16 spans of 12 rem stroked text; 4 `will-change` layers **13.7–16.1 k × 221 px**; CSS marquee paused off-screen (good); **is the LCP element and the CLS source** (font swap) | MEASURED (layer tree, LCP, CLS) | PERFORMANCE ISSUE |
| Hero blur orbs (`page.tsx:913-919`) | Static blurred circles | `blur-[80/100px]` on 400–500 px elements, static | STATIC | HEALTHY (static blur rasterised once) |
| **`DinoRunner`** | Full-hero 2D-canvas game | Canvas = hero size × DPR (1434×900 desktop; **1170×2532 on mobile DPR 3**); `clearRect` + hundreds of `fillRect` **every frame forever — no visibility check** (`:577-1201`); on load, `getImageData` pixel loops over a 2170×725 sprite strip (281 ms) and a 640×640 sprite (72 ms) on the main thread (`:330-475`) | MEASURED: 0.4–0.5 ms JS/frame at every scroll position; **~45 GPU-process points even when off-screen** (ablation at github: GPU 130 % → 84.5 %) | **CRITICAL** |
| **`ElasticHeroTitle`** | 12 letters animated by GSAP | Random exit/re-entry tweens forever; `getBoundingClientRect()` per letter tween (`:56`); never paused off-screen; wrapped in `ScrollReveal` → `motion.div` (scroll-linked scale/opacity/y) → `Magnetic` | MEASURED: GSAP ticker 0.13–0.25 ms/frame everywhere; ablation effect at hero within noise | PERFORMANCE ISSUE (low individual cost, always-on) |
| `TypewriterTitle` | Typing subtitle | Writes `textContent` every 35–60 ms (layout each time, reserved width prevents shift); framer infinite cursor blink | STATIC | HEALTHY (minor) |
| `StatsCard` | Glass stats card | `backdrop-filter: blur(24px) saturate(160%)` (`:30-31`) over the animated hero (DinoRunner + marquees + letters behind it → backdrop re-sampled every frame) | STATIC | NEEDS INVESTIGATION |
| `ScrollReveal` (used ~25×) | Reveal wrapper | `useInView` + animate opacity/y/rotateX/scale; leaves **`transform-style: preserve-3d` + `perspective: 1200px` on every wrapper permanently** (`:43-46`) → new stacking contexts / 3D rendering contexts around large subtrees; `triggerOnce={false}` on the GitHub section (`page.tsx:1194`) | STATIC | PERFORMANCE ISSUE (layer/3D-context inflation; cost not isolated) |
| `Magnetic` / `TiltCard` | Cursor springs | `getBoundingClientRect()` on each mousemove of the hovered element; springs on transform (composited) | STATIC | HEALTHY |
| `BottomTicker` | Fixed bottom marquee | CSS marquee **never pauses** (IntersectionObserver on a fixed element is always intersecting, `:46-54`); parent has `mask-image` gradient (`:62-67`) → mask re-applied on every animated frame | MEASURED (contributes to the CSS-animation share of GPU cost; not isolated individually) | PERFORMANCE ISSUE |
| Portrait (`page.tsx:1033-1047`) | `next/image` priority | Served as optimised 45 KB WebP (good) but rendered with `mask-image` ×2 + `mix-blend-mode: multiply` | MEASURED (network) / STATIC | HEALTHY (paint cost static) |
| `AnimatedHeroHeading` / `WordReveal` | One-shot reveals | `once: true` | STATIC | HEALTHY |
| `StatsMarquee` | Count-up stat strip | 4 copies × 6 stats = **24 `AnimatedValue` components each running its own rAF loop with `setState` per frame for 1.4 s** (`:32-39`, `:80-100`); marquee paused off-screen | STATIC | PERFORMANCE ISSUE (24 React re-renders per frame for 1.4 s on first view) |
| `About` | Education timeline | `whileInView once` + `ScrollReveal`; huge watermark text; **duplicate `id="about"`** | MEASURED (duplicate id) | HEALTHY (perf) / functional bug |
| **`Expertise`** | 24 animated SVG skill cells | **25 always-on framer `repeat: Infinity` SVG attribute animations** (cx/cy/r/opacity — JS-driven, not WAAPI) + 12 hover-only; plus 24 cells × 3 CSS animations (incl. a `blur-2xl` circle with animated `scale`+`opacity`), 27 `spin-slow-reverse`, etc.; `.expertise-paused` pauses **only CSS** (`:1167-1169`), framer loops run forever; hover sets row state → all 6 cells + SVGs re-render; raw `<img>` 748 KB PNG (`:634`); invalid `@keyframes float-y-1.5` | MEASURED: worst section at idle (main 91–94 % busy, style ≈ 3.4 ms/frame); CSS paused → fps 51→92; framer paused → layouts/frame drop page-wide | **CRITICAL** |
| **`ProjectWheel3D`** | CSS-3D curved carousel | At 1440 px: **9 cards × 7 facets × ~8 elements = ~500 `preserve-3d` elements**; main-thread rAF writes `style.transform` + per-card `visibility` every frame while visible (`:624-693`), auto-rotate never stops; **raw full-size PNGs as CSS `background-image`** (`:166`; 3.5 MB velari 1920×1080) referenced by 7 facets each; `drop-shadow` filters on 63 facet titles (`:301`); `backdrop-filter` on buttons; 2 `framer` animations per facet re-targeted on focus; `onWheel` rotates the wheel *and* scrolls the page; reads a ref in render for cursor (`:787`) | MEASURED: layers 372 → ~670; wheel paused → fps 38–43 → 46–47; residual 48 % main-thread busy at projects with everything paused | **CRITICAL** |
| `GithubContributions` | Data loader + reveal | Calls Server Action from the client after mount (3.7 s cold locally / 289 ms prod); `whileInView` with **`filter: blur(8px)` and `once:false`** on a 600 px container that holds the WebGL canvas (`:48-54`) → re-blurs the whole canvas area on every entry/exit | MEASURED (network) / STATIC (blur) | PERFORMANCE ISSUE |
| **`GithubGraph3D`** | R3F instanced cube grid | `<Canvas>` default **`frameloop="always"`** + `dpr [1,2]` + `antialias`; `useFrame` loops over ~365 instances every frame and **always rewrites every matrix** because the idle "wave" term makes `zChanged` permanently true (`:323-330`) → full instance-matrix upload each frame; **`isInView` is never passed** (`GithubContributions.tsx:55`) so it never pauses; drei `ContactShadows` (re-renders the scene into a render target + 2 blur passes per frame); `Environment preset="city"` downloads a **1.5 MB HDR from raw.githubusercontent.com** and runs PMREM; `castShadow` + 2048² shadow map configured but `<Canvas shadows>` is off (dead config); 12 drei `<Html>` labels projected every frame; `useThree()` without selector re-renders `DelayedSnapControls` (and re-binds its listeners) whenever `size` changes (react-use-measure `scroll:true` reports `top` changes after scrolling) | MEASURED: R3F loop 0.45–0.81 ms JS/frame at all positions; first frame 1.15 s (shader compile + PMREM); R3F paused at github → fps 37–41 → 47–51 | **CRITICAL** |
| `Credentials` | Ticker menu + detail panel | `onMouseEnter` on moving ticker buttons → `setActiveId` → `AnimatePresence mode="wait"` crossfade with **`filter: blur(6px)`** over a large image+text panel; ticker strip has `backdrop-blur-md`; 10 `animate-ping` dots | MEASURED: 668 ms worst frame on hover (1×) | PERFORMANCE ISSUE |
| `JourneyTimeline` (in page) | Scroll-drawn line | `useScroll({target})` → `scaleY` (composited); `animate-pulse` dots | STATIC | HEALTHY |
| Contact form + `GlowButton` | Form | Field state in `Home` (see above); `GlowButton` `rotate` mode spins a **blurred conic gradient forever** (`glow.tsx:68-84`) incl. off-screen | STATIC (+ INP measured) | PERFORMANCE ISSUE |
| `lib/githubContributions.ts` | Server Action | Scrapes GitHub HTML with regex; `unstable_cache` 1 h | MEASURED (3.7 s cold) | NEEDS INVESTIGATION (cold-path latency, third-party HTML dependency) |

### 4.2 Present in the repo but not rendered

| File | Imported by page? | In production bundle? [MEASURED by chunk signature search] | Classification |
|---|---|---|---|
| `ui/liquid-glass-carousel.tsx` (1,674 lines, three + gsap + GLSL) | yes (`page.tsx:19`) — unused import | **No** (tree-shaken) | HEALTHY (dead code; maintenance risk) |
| `TechnologyArsenal.tsx` (+ `ui/TechPill.tsx`) | yes (`page.tsx:30`) — unused | **No** | HEALTHY (dead code) |
| `ui/spiral-3d-slider.tsx`, `ui/MeshText.tsx`, `ui/AnimatedDock.tsx`, `GlowButtonDemo.tsx`, `ui/GlassButton.tsx`, `ui/ExpertiseHoverItem.tsx`, `ui/webgl-error-boundary.tsx` | no | No | HEALTHY (dead code) |
| `ProjectsShowcase` / `ProjectCard` (inside `page.tsx:87-232`) | defined, never used | Possibly retained inside the page chunk (same module) | HEALTHY (dead code) |

---

## STAGE 5 — React & Next.js Architecture ✅ COMPLETE

### 5.1 Rendering model [MEASURED + STATIC]

- App Router, one route. `next build` classifies `/` as **○ Static (prerendered)**, but the prerendered HTML (8.6 KB local / 11.2 KB prod) contains only the cursor elements, the CursorGlow div and the spinner. Static generation is therefore wasted: the page behaves as client-side rendering behind a two-pass hydration (hydrate spinner → `useEffect` sets `mounted` → re-render everything). ESLint flags exactly this: `react-hooks/set-state-in-effect` at `page.tsx:393`.
- The `mounted` gate exists to avoid SSR/client mismatches from browser-only code (`matchMedia`, `window` sizes, canvas). Those components already read browser APIs inside effects, so the gate is not required for correctness of most sections; it does, however, (a) remove all server HTML, (b) make the full mount a single 1.1 s (desktop) / 1.5 s (4× CPU) task (§2.5), and (c) break `SmoothScroll`'s anchor binding (§3.3).
- `suppressHydrationWarning` on `<html>` hides any mismatch signal. No hydration errors/warnings were logged in any run [MEASURED].

### 5.2 Client/Server boundaries and code splitting [MEASURED from build]

- Only `app/layout.tsx` is a Server Component. Everything under `page.tsx` is client.
- **No `next/dynamic` / `React.lazy` anywhere.** The `/` route loads 12 first-party scripts (1,869 KB raw / ~537 KB gzip / ~460 KB brotli excluding the `nomodule` polyfill). Of that, three.js (2 chunks, 730 KB raw), R3F (160 KB), and the drei/genie-web/html-to-image parts of the 305 KB shared chunk exist only for the GitHub graph (section 6, ~10,000 px below the fold) and the Hire-Me modal (click-only). See Stage 8 for the breakdown.

### 5.3 State placement and re-render scope [STATIC + MEASURED]

| State | Owner | Re-render scope on change | Trigger frequency | Measured cost |
|---|---|---|---|---|
| `name`, `email`, `message` (contact form) | `Home` (`page.tsx:382-384`) | **whole page** | every keystroke | 46 ms (1×) / 842 ms (4×) script per key |
| `activeSection` (scroll spy) | `Home` (`:363`) | whole page | each section boundary crossed while scrolling | 69–85 ms React frames during scroll (1×) |
| `hireMeOpen`, `menuOpen` | `Home` | whole page | modal / menu toggles | part of 272 ms / 9.8 s INP |
| `formState` | `Home` | whole page | submit | — |
| `activeSkill` | `ExpertiseRow` | 6 SVG-heavy cells | every hover (85 ms debounce) | frames p95 71 ms (1×) during hover |
| `activeId` | `Credentials` | whole Credentials + AnimatePresence remount | every ticker hover | 668 ms worst frame |
| `dims` | `ProjectWheel3D` | whole wheel (~500 elements) | **every `resize` event, not debounced** (`ProjectWheel3D.tsx:555-561`) | not measured |
| `display` (scramble) | `MagneticNavItem` | 1 item | every 28 ms during hover | small |
| `progress`, `filledCols` | `IntroLoadingBar` | bar | **every frame for 1.3 s** | small |
| 24× `display` | `StatsMarquee` `AnimatedValue` | each value | **every frame for 1.4 s × 24** | not isolated |

No component in the tree is memoised (`React.memo`/`useMemo` on children). Memoising everything is **not** recommended. Moving the three hot state owners (form fields, scroll spy, modal) out of `Home`, or isolating the sections they re-render, is the targeted fix (Stage 14/Phase 2).

### 5.4 Hooks / effects review [STATIC]

| Location | Finding | Impact |
|---|---|---|
| `page.tsx:392-415` | `setMounted(true)` + scroll-spy observer in one mount effect | Two-pass render; observer callback sets page-level state |
| `page.tsx:370-379` | Escape handler re-subscribed on every `menuOpen`/`hireMeOpen` change; **duplicates** HireMeModal's own Escape handler (`HireMeModal.tsx:275-296`) → two state updates per Escape | Minor; contributes to the 416 ms Escape INP |
| `SmoothScroll.tsx:7-54` | Anchor query at mount finds 0 anchors (content not yet rendered) | Functional bug; native smooth scroll fights Lenis' own scroll handling |
| `HireMeModal.tsx:242-263` | `setScrollbarWidth` in mount effect (lint `set-state-in-effect`); 600 ms timer starts the font-embedding capture during the intro | Load-time long tasks + 2.2 MB of fetches |
| `HireMeModal.tsx:110-153` | Mutates `errors` prop object (`errors.name = undefined`) | Correctness smell (lint `react-hooks/immutability`) |
| `HireMeModal.tsx:391-395` | `config={{…}}` object literal → genie `set()` effect re-runs on every render | Minor |
| `GithubGraph3D.tsx:63-131` | `useThree()` without selector + effect depending on `size` → listeners re-bound whenever the canvas container's `top` changes (react-use-measure `scroll:true`) | Re-renders after scroll gestures |
| `GithubGraph3D.tsx:152-195` | `Math.random()` inside `useMemo` (lint purity) | Non-deterministic but intentional |
| `ElasticHeroTitle.tsx:130-236` | Scheduler loop via `setTimeout` + GSAP; correct cleanup | Always-on |
| `ProjectWheel3D.tsx:608-699` | rAF effect re-created on `focusedIndex`/`radius` change; correct cleanup | OK |
| `ProjectWheel3D.tsx:787` | Reads `isDragging.current` during render for `cursor` → never updates | Functional nit |
| All observers / listeners / timers reviewed | Every `addEventListener`, `IntersectionObserver`, `setInterval`, `setTimeout`, `requestAnimationFrame` found has matching cleanup | No leaks found (consistent with §3.7) |

ESLint (run read-only on the isolated copy): **81 errors, 46 warnings** — 41 `react-hooks/immutability`, 41 `no-unused-vars`, 10 `prefer-const`, 11 `no-explicit-any`, 8 `react-hooks/purity`, 7 `react-hooks/refs`, 3 `exhaustive-deps`, 2 `set-state-in-effect`, 1 `no-img-element`. `next build` does not run ESLint in Next 16, so none of these block deploys.

### 5.5 Data fetching [MEASURED + STATIC]

`GithubContributions` calls the Server Action `getGithubContributions` from a client effect after mount. That costs a POST round-trip to the page route (289 ms on prod with a warm cache, **3.7 s** cold locally while the server scrapes and regex-parses `github.com/users/septilex/contributions`). Server Actions are executed sequentially per client, are not HTTP-cacheable, and here re-run on every page view. Year toggles issue another action call.

### 5.6 Images and fonts through Next [MEASURED]

- `next/image` is used correctly for the portrait (`priority`, `sizes` → 45 KB WebP), the nav logo, timeline logos and certificates. It is **not** used for the 6 project previews (CSS `background-image`, raw PNG, `ProjectWheel3D.tsx:166`), the PostgreSQL logo (raw `<img>`, `Expertise.tsx:634`), or the DinoRunner sprites (`new Image()`).
- next/font: 10 font files are preloaded in production, but **5 of them belong to families that never render**: Inter (47.5 KB), GeistMono (69.9 KB), Space Grotesk (22 KB), Instrument Serif normal + italic (30.4 KB). That is ~170 KB at high priority. **Montserrat 700 is preloaded, but the hero renders Montserrat 900** (not preloaded). Geist is loaded twice (next/font `Geist` + `geist` package `GeistSans`). Body text resolves to Geist, so the fontshare **Switzer** declared in `--font-sans` (`globals.css:14`) is never used.
- 4 runtime CSS `@import url()` (fontshare Cabinet Grotesk + Switzer; Google Montenegrin Gothic One; Anton; Archivo + Space Mono) are render-blocking. **Anton, Archivo and Space Mono are referenced only by the `.sw-*` "Swiss hero" classes (`globals.css:637-882`), which no component uses.**

---

## STAGE 6 — Animation Systems (framer-motion, GSAP, CSS, rAF) ✅ COMPLETE

### 6.1 Inventory of running animations at idle [MEASURED]

`document.getAnimations()` after load (desktop): **121 CSS animations registered, 22 running** at any one position (the rest are paused by IntersectionObserver/class toggles). By name: `spin-slow-reverse` 27, `float-y-3` 24, `pulse-scale` 24, `ping` 13, `marquee` 6, `spin-slow` 5, `float-y-1` 5, `float-y-2` 4, `pulse` 4, `float-x-1` 3, `bounce` 1, `ticker-scroll` 1, `glow-spin` 1, `pulse-opacity-fast` 1. Only **2 WAAPI (framer "accelerated") animations** exist (opacity). Every other framer animation (springs, scroll-linked values, **all SVG attribute animations**) runs in JS on the framer frame loop.

JS-driven loops: framer-motion frame batch, GSAP ticker, R3F `eq`, DinoRunner, ProjectWheel `tick`, Lenis (see §2.7 for per-frame cost).

### 6.2 Findings

| # | Finding | Location | Mechanism | Evidence |
|---|---|---|---|---|
| A1 | **framer-motion forces a style + layout on every frame, page-wide** | Main driver: 25 always-on `repeat: Infinity` SVG attribute animations in `Expertise.tsx` (cx/cy/r/opacity on `<motion.circle>` etc.), still running when the section is far off-screen; plus springs/scroll values | SVG geometry attribute changes dirty layout. framer applies them in its `render` step every frame, and `.expertise-paused` only pauses CSS (`Expertise.tsx:1167`) | MEASURED: framer paused → layouts drop from ~220 to ~33 per 4 s and main-thread busy 73 % → 54 % at the hero (§2.8) |
| A2 | **No animation is stopped by visibility except CSS marquees / Expertise CSS** | DinoRunner, ElasticHeroTitle (GSAP), GithubGraph3D (R3F), BottomTicker, GlowButton spin, framer infinite loops, TypewriterTitle | No IntersectionObserver / `frameloop` gating | MEASURED: all loops run at every scroll position (§2.7) |
| A3 | CSS animations on SVG elements and on blurred elements | Expertise icons: `spin-slow`, `float-*` applied to SVG `<g>` (`Expertise.tsx:122-370`); cell background `blur-2xl` circles with `pulse-scale` (scale + opacity) ×24 (`:949-952`) | CSS animations on SVG children are not composited the way HTML transform animations are, so they need style+paint on the main thread. Animating a `filter: blur()` element needs a filtered render surface each frame [mechanism partly HYPOTHESIS] | MEASURED: CSS paused at the Expertise section → fps 51 → 92, GPU-process 105 % → 75 % |
| A4 | Always-on composited decorations | 13 `animate-ping`, `BottomTicker` marquee inside a `mask-image` parent (`BottomTicker.tsx:62-80`), `glow-spin` blurred conic gradient (`glow.tsx:68-84`) | Compositor work every frame; masks/filters add render surfaces | MEASURED as a group: CSS paused at hero → GPU-process 98 % → 84–90 %; at github → 130 % → 87 % |
| A5 | `ScrollReveal` leaves `preserve-3d` + `perspective` on ~25 wrappers and animates `rotateX` + `scale` + `y` + `opacity` | `ScrollReveal.tsx:32-46` | Each wrapper becomes a 3D rendering context / stacking context around a large subtree; `rotateX` reveals need 3D compositing | STATIC (contributes to the 372 → 685 layer count; not isolated) |
| A6 | Filter-blur reveals over large areas | `GithubContributions.tsx:49-52` (`blur(8px)`→0 on a 600 px container holding the WebGL canvas, **`once:false`**); `Credentials.tsx:171-173` (`blur(6px)` crossfade on every hover change) | Animated `filter: blur` re-filters the full element every frame of the transition | MEASURED for Credentials: 668 ms worst frame on hover |
| A7 | GSAP letter loop with layout reads | `ElasticHeroTitle.tsx:56, 91-126` | `getBoundingClientRect()` at each tween start; tweens forever, off-screen too | MEASURED: 0.13–0.25 ms/frame at every position |
| A8 | Scroll-linked hero transform stacked on other transforms | `page.tsx:387-390, 946` (`useScroll` → scale/opacity/y) wrapping `Magnetic` (spring) wrapping 12 GSAP-animated letters, inside a `ScrollReveal` with `preserve-3d` | Several transform owners on nested layers; compositor-friendly individually | STATIC (HEALTHY individually) |
| A9 | Count-up animations driven by React state | `StatsMarquee.tsx:32-39` (24 rAF loops × `setState`), `IntroLoadingBar.tsx:32-38` | React render per frame per instance | STATIC |
| A10 | Tailwind transitions are globally disabled | `globals.css:888-891` | Unlayered `transition-duration:0s` overrides `@layer utilities` | MEASURED (§3.5) — a visual bug; fixing it re-enables hundreds of hover transitions (mostly `transition-all`, which also transitions layout properties) |
| A11 | **Reduced-motion is essentially unsupported** | Only `globals.css:878` (`.sw-dot`, unused), `globals.css:1009` (hides grain/vignette), `Expertise.tsx:1170` (applies only while the section is already paused) | No `useReducedMotion` / `<MotionConfig reducedMotion="user">`, GSAP, DinoRunner, R3F, wheel, Lenis ignore it; genie-web does respect it (`reducedMotion:"auto"`) | STATIC — accessibility issue and a missed fast path |

### 6.3 Property usage summary (rendered code) [STATIC]

18 `backdrop-filter`/`backdrop-blur` sites (4 of them on fixed elements: social dock ×4, nav, plus StatsCard, Credentials ticker, modal inputs), 43 blur-filter sites (mostly static, rasterised once — fine), 5 `drop-shadow` filters (63 instances inside the wheel), 5 `mix-blend-mode`, 4 `mask-image`, 15 `will-change`, 41 `repeat: Infinity`, 12 `whileInView`, 5 `useScroll`, 6 `preserve-3d` sites (×~500 instances in the wheel). Animations that are compositor-friendly in isolation (transform/opacity marquees, pings, spins) are not the problem individually. The problem is that **dozens of them run simultaneously and permanently** on top of the main-thread JS/SVG work.

---

## STAGE 7 — WebGL / 3D / Canvas ✅ COMPLETE

Applies to: `GithubGraph3D` (three + R3F + drei), `HireMeModal` (genie-web WebGL2 canvas), `DinoRunner` (2D canvas), `ProjectWheel3D` (CSS 3D, not WebGL). Not rendered: `liquid-glass-carousel`, `spiral-3d-slider`, `MeshText`.

### 7.1 GithubGraph3D [STATIC + MEASURED]

| Aspect | Current | Evidence / impact |
|---|---|---|
| Frame loop | `frameloop` default **`"always"`** (`node_modules/@react-three/fiber/dist/events-*.esm.js:1428`) | Renders every frame for the whole session at every scroll position; 0.45–0.81 ms JS/frame measured at the hero (~9,000 px away) |
| Visibility gating | `isInView` prop defaults to `true` and is never passed (`GithubGraph3D.tsx:443`, `GithubContributions.tsx:55`) | Built-in pause path exists but is dead |
| Per-frame CPU | `useFrame` iterates all ~365 instances; the idle wave term (`:323-326`) makes `zChanged` permanently `true` (`:330`), so **every instance matrix is recomposed and `instanceMatrix.needsUpdate = true` every frame** → 365 × 16 floats uploaded per frame | STATIC (certain from code) |
| Render passes | Main scene + **drei `ContactShadows`**: renders the scene from below into a 512² render target + horizontal/vertical blur passes **every frame** by default | STATIC |
| Environment | `<Environment preset="city">` → 1.5 MB `potsdamer_platz_1k.hdr` from `raw.githubusercontent.com` (third-party, `max-age=300`) + PMREM generation | MEASURED: 1,507 KB download; first frame 1.15 s (with shader compile) |
| Shadows | `castShadow`, `receiveShadow`, `shadow-mapSize={[2048,2048]}` configured, but `<Canvas>` has no `shadows` prop (R3F default `false`) | Dead configuration (no cost, misleading) |
| DPR / AA | default `dpr=[1,2]`, `antialias: true`, `powerPreference: 'high-performance'` | Mobile canvas 646×1097 physical px; desktop 1214×548 |
| Material | `MeshStandardMaterial` + `onBeforeCompile` (per-instance emissive), module-level singleton (no disposal needed) | Shader compiler warnings X4122 logged (harmless) |
| DOM overlays | 12 drei `<Html>` month labels | Projected every frame |
| Resize/scroll | R3F `useMeasure({scroll:true, debounce:{scroll:50}})` → `size.top` changes after scrolling → `DelayedSnapControls` (uses `useThree()` with no selector) re-renders and re-binds pointer listeners | STATIC |
| Ablation | R3F paused at the github section: fps 37–41 → 47–51, frames > 33 ms 8–26 → 0–4 per 4 s | MEASURED |

GPU-specific per-frame cost (draw calls, overdraw, fragment cost of the 365-instance PBR + env map) could not be measured: no GPU profiler is available headlessly. The ablation shows the frame-time effect only.

### 7.2 genie-web (HireMeModal) [STATIC + MEASURED]

Creates a `position:fixed; inset:0` WebGL2 canvas (antialias) appended to `<body>` at mount with `z-index:2147483000`; it releases its size to 1×1 when idle (good). Snapshot source is the html-to-image canvas captured at `pixelRatio 1.5`. The capture's font embedding is the expensive part (§2.4/2.5), not the WebGL warp itself.

### 7.3 DinoRunner 2D canvas [STATIC + MEASURED]

Backing store = CSS size × DPR (`DinoRunner.tsx:521-526`): 1434×900 on desktop, **1170×2532 on mobile**. Full `clearRect` and redraw of clouds, ground, obstacles, 8–10 enemies (pixel sprites drawn as one `fillRect` per pixel via `stamp()`), bullets, particles every frame (`:943-1196`), with no visibility check or frame cap. Ablation: **~45 GPU-process percentage points even while the hero is off-screen** (GPU-accelerated canvas raster still executes). Load-time `getImageData` pixel loops: 281 + 72 ms (desktop).

### 7.4 ProjectWheel3D (CSS 3D) [STATIC + MEASURED]

~500 `preserve-3d` elements (9 cards × 7 facets × ~8 children at 1440 px) → layer count rises from 372 to ~670. Back-face culling via `visibility` keeps ~5 cards drawn, but **culled cards stay in the layer tree**. Rotation is written from a main-thread rAF, so wheel smoothness depends on main-thread availability (which §2.7 shows is 50–94 % consumed). Each facet paints a 604 px slice of a **full-resolution PNG background** (velari 1920×1080, 3.5 MB). Residual 48 % main-thread busy at the projects section with *every* loop paused points to per-frame layer-tree/commit cost [HYPOTHESIS — needs a trace].

---

## STAGE 8 — Images, Video, Fonts & Other Assets ✅ COMPLETE

### 8.1 Largest / most expensive assets [MEASURED: file size, header-parsed dimensions, network]

| File | Format | Size | Dimensions (decoded RGBA) | How it is used | Concern | Recommended handling |
|---|---|---|---|---|---|---|
| `public/reference/hero-effect.mp4.mp4` | MP4 | 21.5 MB | — | **Unreferenced** | Deployed publicly for nothing | Remove from `public/` |
| `public/portrait/My Portrait White Shirt.png` | PNG | 5.2 MB | 2048×2048 (16 MB) | `next/image priority` → served as 45 KB WebP | Fine at runtime (optimiser) | Keep (optionally ship a smaller master) |
| `public/velari-preview.png` | PNG | **3.5 MB** | 1920×1080 (7.9 MB) | **Raw CSS `background-image`** in 7 facets × N wheel cards; also `buildPillars` (unused) | Downloaded on load at ~1.6 s; decoded full-size for a ~600 px slot | Serve a resized WebP/AVIF (~800–1200 px) via `next/image` or pre-generated asset; lazy-load with the section |
| `public/devmentor-preview.png` | PNG | 740 KB | 1920×1080 | same | same | same |
| `public/cardiovanta-preview.png` | PNG | 731 KB | 1024×576 | same | same | same |
| `public/kadence-preview.png` | PNG | 620 KB | 1024×576 | same | same | same |
| `public/devscore-preview.png` / `sketchduel-preview.png` | PNG | 95 / 61 KB | 1920×1080 / 1024×576 | same | — | same |
| `public/pets-strip.png` | PNG | 1.16 MB | 2170×725 (6.0 MB) | DinoRunner: downloaded + `getImageData` pixel loops at load (281 ms) | Main-thread image processing every visit | Pre-process offline into small per-pet sprites |
| `public/logos/postgresql.png` | PNG | **748 KB** | 1024×816 | Raw `<img>` in a small Expertise icon (`Expertise.tsx:634`) | ~25× more pixels than displayed | SVG or small WebP |
| `public/01…10_*_dino.png` (10 files) | PNG | 256–326 KB each | 640×640 | DinoRunner picks **one** per visit, rotated via `localStorage` | One 286 KB download per visit + pixel loop (72 ms) | Pre-crop / pre-recolour offline, WebP |
| `public/certifications/*.jpg` (5) | JPEG | 49–103 KB | ~1200×950 | `next/image` (fill, `sizes`) | Fine | Keep |
| `public/Prajit_Balaji_Resume.pdf` | PDF | 174 KB | — | **Loaded at startup** by the hidden modal iframe (plus Chrome PDF-viewer extension) | Wasted request + viewer process on every visit | Load the iframe only when the modal opens (or show an image preview) |
| Unreferenced PNGs: `dino-running-animation-legs.png` 1.9 MB, `Final DINOSSS.png` 1.8 MB, `Final Dinos 1.png` 1.5 MB, `Ten Costumed Dino Pixel Sprites.png` 1.5 MB, `final dino.png` 1.4 MB, `dino-skins-strip.png` 1.2 MB, `geethanjali-logo.png` 210 KB, `srm-logo.png` 224 KB, `expertise-hud-bg.png` 173 KB, `dino-skin.png` 47 KB, `sprites/dino-running-sheet.png` 461 KB (actually a JPEG), `10_individual_dinos_no_overlap.zip` 2.9 MB, `file/globe/next/vercel/window.svg` | — | **~14 MB** total | Not referenced by any source file | Deploy-size and repo hygiene only (no runtime cost) | Remove from `public/` |

### 8.2 Video
No video is rendered. The only video file is the unreferenced 21.5 MB MP4.

### 8.3 Fonts [MEASURED]
Production loads 14 font files (459 KB) + html-to-image re-fetches ~2.2 MB of font data. 5 of 10 preloaded files are unused families (Inter, GeistMono, Space Grotesk, Instrument Serif ×2 — ~170 KB). Montserrat 700 is preloaded while 900 renders. Syne loads 5 weights (400–800). Geist is downloaded twice (two packages). The local `researcher` font is a 71 KB **TTF** (not WOFF2). Remote: Cabinet Grotesk ×3 weights from fontshare (render-blocking CSS, no size-adjusted fallback → CLS source), Montenegrin Gothic One (intro only). All `display: swap`.

### 8.4 Other assets
- SVG icons are inline in JSX (fine). Expertise defines duplicated SVG gradient IDs ("Framer Motion" appears in two categories) — validity nit.
- Grain texture: inline SVG `feTurbulence` data-URI on a fixed full-viewport layer (rasterised once, then composited).
- 3D: no models. The only texture-like asset is the 1.5 MB HDR fetched from `raw.githubusercontent.com`.
- Repo-root (not deployed): `turbopack_strings.txt` 3.3 MB, `lEwvRBN_gif (650×408).gif` 1.2 MB, `clean.diff`/`my_diff.diff`, helper scripts. No runtime impact.

---

## STAGE 9 — JavaScript Bundle & Dependencies ✅ COMPLETE

### 9.1 Initial JS for `/` (local production build, webpack) [MEASURED]

| Chunk | Raw | gzip | brotli | Contents (identified by signature strings) |
|---|---|---|---|---|
| `6ed3d865-*.js` | 371 KB | 98 KB | 80 KB | **three.js** (part 1, REVISION 186) |
| `ba652262-*.js` | 359 KB | 87 KB | 72 KB | **three.js** (part 2) |
| `766-*.js` | 305 KB | 108 KB | 92 KB | framer-motion, **drei** (Environment presets, ContactShadows, Html), **genie-web**, **html-to-image**, lucide icons |
| `616-*.js` | 217 KB | 59 KB | 48 KB | React scheduler / Next client runtime |
| `bcb44a4a-*.js` | 195 KB | 61 KB | 52 KB | react-dom |
| `app/page-*.js` | 185 KB | 47 KB | 38 KB | All page components (incl. dead `ProjectCard`/`ProjectsShowcase`) |
| `dc1647ae-*.js` | 160 KB | 50 KB | 44 KB | **@react-three/fiber** |
| `2cfc335e-*.js` | 50 KB | 19 KB | 18 KB | **GSAP** core |
| `app/layout-*.js` | 23 KB | 6.5 KB | 5.9 KB | Lenis, cursor components |
| `webpack`, `main-app` | 4 KB | 2 KB | 2 KB | runtime |
| **Total initial (excl. `nomodule` polyfills)** | **≈1,870 KB** | **≈537 KB** | **≈460 KB** | |

**≈ 890 KB raw / ≈ 235 KB gzip (three ×2 + R3F) plus the drei/genie/html-to-image part of chunk 766 serve features that are not needed for first paint** (a graph ~10,000 px below the fold and a click-only modal). They are downloaded, parsed and compiled during the initial load on every visit. Production transferred 555 KB of script (brotli). Not separable further without a bundle analyzer (none installed — [NOT TESTED]).

### 9.2 Tree-shaking check [MEASURED]
Signature strings of the unused `liquid-glass-carousel` (`uRimTangential`), `spiral-3d-slider` ("Spiral image gallery") and `TechnologyArsenal` are **absent** from all chunks → correctly eliminated despite the stray imports.

### 9.3 Dependency usage [STATIC]

| Package | Used by (rendered) | Note |
|---|---|---|
| three / @react-three/fiber / @react-three/drei | `GithubGraph3D` only | Largest cost; should load lazily |
| framer-motion | 20 files | Core to the visual identity; keep |
| gsap | `ElasticHeroTitle` only | 19 KB br for one effect — acceptable, could be replaced by CSS/framer later (low priority) |
| genie-web, html-to-image | `HireMeModal` only | Should load on demand |
| lenis | `SmoothScroll` | Small |
| lucide-react | 7 files | Tree-shaken per icon |
| class-variance-authority | `button.tsx`, `glow.tsx` | Small |
| cn | `lib/utils.ts` | shadcn's compiled clsx + tailwind-merge |
| **@base-ui/react** | **none** | **Unused dependency** |
| clsx, tailwind-merge | only `AnimatedDock` (not rendered) | Redundant with `cn` |
| shadcn | `globals.css` `@import "shadcn/tailwind.css"` | CLI package listed under `dependencies`; build-time only |
| geist | `layout.tsx` | Duplicates next/font `Geist` |
| tw-animate-css | `globals.css` | Build-time CSS |

No duplicate copies of React or three were detected in the output chunks. Unused packages do not affect the client bundle (tree-shaken) but add install/build time.

---

## STAGE 10 — CSS, Layout & Browser Rendering ✅ COMPLETE

| # | Finding | Location | Mechanism / cost | Evidence |
|---|---|---|---|---|
| C1 | **Unlayered `* { transition-property; transition-duration: 0s }` disables all Tailwind transitions** | `globals.css:888-891` | Cascade layers: unlayered > `@layer utilities` | MEASURED (§3.5) |
| C2 | **Render-blocking third-party CSS chain** | `globals.css:1-4` | HTML → main CSS → 4 cross-origin `@import`s (2 hosts, extra DNS/TLS) → fonts. Two of the four (Anton; Archivo + Space Mono) serve only unused `.sw-*` rules | MEASURED: one prod run had FCP 5.98 s because fontshare took 5.6 s |
| C3 | Dead CSS | `.sw-*` block `globals.css:637-882` (~245 lines), `.reveal-init/.reveal-active`, `.glass-button*`, `.text-glow` (no-op) | Payload only (main CSS 114 KB raw / 20 KB br) | STATIC |
| C4 | Full-viewport fixed overlays composited on every frame | `.grid-overlay` (z 2), `.vignette` (z 99), `.grain` (z 100, ≥768 px), fixed glow orb with `filter: blur(40px)` + `mix-blend-mode: screen` (`page.tsx:764-770`), CursorGlow, BottomTicker | ≥4 full-screen layers blended per frame (overdraw), plus a blend mode | MEASURED: layers present (§3.7); cost not isolated |
| C5 | Grid drawn twice | `body` background-image (`globals.css:328-331`) **and** `.grid-overlay` (`:337-346`) with identical gradients | Body grid paints across the 15,935 px document | STATIC |
| C6 | Backdrop filters over animated content | fixed social dock ×4 (`page.tsx:641`), nav `backdrop-blur-xl` (`:784`), StatsCard `blur(24px) saturate(160%)` over the animated hero, Credentials ticker, wheel buttons | A backdrop filter re-samples and re-blurs what is behind it whenever that content changes. Behind the fixed dock/nav that is *every scrolled frame* | STATIC [HYPOTHESIS on magnitude] |
| C7 | 3D rendering contexts everywhere | `ScrollReveal` (`preserve-3d` + `perspective` on ~25 wrappers), ProjectWheel (~500 `preserve-3d` elements), TiltCard | Layer explosion: 372 → 685 composited layers | MEASURED (layer counts) |
| C8 | Giant composited text layers | `BackgroundTypography` rows 13.7–16.1 k px wide (`will-change` + animation) | Large tiled layers; 12 rem `-webkit-text-stroke` text is costly to raster | MEASURED (layer tree) |
| C9 | Forced synchronous layouts | framer read phase (294 ms on load), Lenis `Dimensions` resize (221 ms), HireMeModal effect (`clientWidth` read after style writes), genie `getBoundingClientRect`, `MagneticNavItem` per-mousemove rect reads, `ElasticHeroTitle` per-tween rect read | Interleaved reads after writes force a full-page layout | MEASURED (LoAF `forcedStyleAndLayoutDuration`: 294, 221, 5,845 ms @4×) |
| C10 | Per-frame style + layout at idle | Driven by framer SVG attribute animations, CSS animations on SVG, TypewriterTitle `textContent` | ~2.2–3.4 ms style + 0.6–0.8 ms layout per frame on a ~4,200-node DOM | MEASURED (§2.7) |
| C11 | DOM size | ~3,150 elements (4,170 nodes), max depth 17; the wheel alone contributes ~500 | Raises the cost of every style recalc and layout in C10 | MEASURED |
| C12 | `html { scroll-behavior: smooth }` alongside Lenis, without Lenis' recommended CSS (`lenis/dist/lenis.css` is not imported) | `globals.css:319`, `SmoothScroll.tsx` | Native smooth scrolling (anchors, keyboard) runs while Lenis also listens to scroll | STATIC; anchor path MEASURED |
| C13 | Invalid keyframe name `float-y-1.5` | `Expertise.tsx:1141` | Rule dropped by the parser (unused anyway) | STATIC |

---

## STAGE 11 — Network, API & Third Parties ✅ COMPLETE

### 11.1 Where the time goes during load [MEASURED, production desktop]

| Bottleneck class | Verdict | Evidence |
|---|---|---|
| Server response (TTFB) | **Not the bottleneck** | 52–158 ms, `x-vercel-cache: HIT`, brotli HTML |
| Render-blocking CSS / third-party | **Intermittent major blocker** | 4 `@import`s; one run FCP 5.98 s (fontshare 5.6 s) |
| JavaScript download | Moderate | 555 KB br, 12 chunks, all initial; ~half for below-the-fold/click features |
| **JavaScript execution / rendering** | **Primary blocker** | TBT 1.96 s desktop / 6.3 s mobile; 1.1 s mount task; 1.15 s first R3F frame; intro stretched to 5.3 s / 12.7 s |
| Images | Bandwidth competition (esp. mobile) | 8 MB of raw PNGs requested at ~1.6 s, mostly for content far below the fold; still downloading at 25 s on Slow-4G |
| Fonts | Moderate | 459 KB, ~170 KB of preloads unused; CLS source (Cabinet Grotesk swap) |
| Self-inflicted fetches | **Major waste** | html-to-image: 74 requests / 2.2 MB on every visit |

### 11.2 Third-party / external requests

| Host | Purpose | Blocking? | Cache |
|---|---|---|---|
| `api.fontshare.com`, `cdn.fontshare.com` | Cabinet Grotesk / Switzer (Switzer unused) | **CSS is render-blocking** | 1 day CSS / 7 days fonts |
| `fonts.googleapis.com`, `fonts.gstatic.com` | Montenegrin Gothic One (intro), Anton / Archivo / Space Mono (**unused**) | **CSS is render-blocking** | private 1 day CSS / 1 year fonts |
| `raw.githubusercontent.com` | drei HDR (1.5 MB) | Suspends the 3D scene until loaded | `max-age=300` |
| `github.com` (server-side, via Server Action) | contribution HTML scrape | Delays the GitHub section; fragile to GitHub markup changes | `unstable_cache` 1 h |
| `api.web3forms.com` | contact form submit | On submit only | — |
| Analytics / tag managers | **none present** | — | — |

### 11.3 Repeated / duplicate requests [MEASURED]
html-to-image re-fetches the 4 already-loaded remote CSS sheets and fetches next/font files up to 6× each (cache-served in a normal session, but each response is still read and base64-encoded). It also downloads fontshare `.woff` and `.ttf` variants that the page itself never needs. No other duplicates.

### 11.4 Caching
Immutable caching on hashed assets is correct. `/public` files (PNGs, PDF, SVG logos) are `max-age=0, must-revalidate`, so they revalidate on every visit. Moving them into hashed/static paths or `next/image` would make them cacheable.

---

## STAGE 12 — Memory & Long-Session Stability ✅ COMPLETE

- Measured in §3.7: JS heap 15.0 → 18.0 MB across 8 heavy cycles and plateauing; DOM nodes, documents and canvases flat. **No leak found.**
- Steady background cost does not decay over time: the always-on loops (§2.7) keep the CPU/GPU busy for the whole session, which means battery drain and fan noise on laptops and heat throttling on phones during long visits [STATIC inference from measured steady-state CPU].
- Resource lifetime: the hidden PDF viewer (extra plugin document) and the always-composited pre-capture modal copy live for the whole session. The genie WebGL2 context, the R3F WebGL context and the DinoRunner canvas are created once and never released (they are not leaking, just never idle).
- WebGL resource disposal: the material is a module singleton and geometry/instances are not re-created on year toggle (instance count unchanged), so no churn is expected. GPU memory could not be measured.

---

## STAGE 13 — Errors, Warnings & Reliability ✅ COMPLETE

### 13.1 Console / runtime [MEASURED, every run]
- No uncaught exceptions, no hydration errors, no failed first-party requests.
- 2 warnings per load: `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` (from R3F/three version pairing), and `THREE.WebGLProgram: Program Info Log … warning X4122` (D3D shader-compiler precision warning; harmless).
- Build: succeeds; TypeScript passes; one transient `write ECONNABORTED` retry while next/font downloaded Google Fonts at build time. ESLint (not run by the build): 81 errors / 46 warnings (§5.4).

### 13.2 Functional / UX defects (separate from performance)

| # | Defect | Location | Evidence |
|---|---|---|---|
| F1 | Lenis anchor navigation never binds; anchors use native smooth scroll | `SmoothScroll.tsx:42` | MEASURED (no listeners) |
| F2 | All Tailwind transitions disabled | `globals.css:888-891` | MEASURED |
| F3 | Hire-Me modal form cannot be submitted: "SEND INQUIRY →" is a `<div>`, there is no submit button, and with two text inputs Enter does not implicitly submit. `handleSubmit` would only fake success via `setTimeout` | `HireMeModal.tsx:100-181, 164-170, 341-356` | STATIC |
| F4 | "DOWNLOAD MY RESUME" in the modal is a `<div>`, not a link | `HireMeModal.tsx:209-216` | STATIC |
| F5 | Duplicate `id="about"` (scroll spy + nav target only the first) | `page.tsx:1011`, `About.tsx:10` | MEASURED |
| F6 | `has-custom-cursor` forced onto `<html>` on touch devices | `HireMeModal.tsx:319-328` | MEASURED |
| F7 | Dark (`#0a0807`) spinner flashes before a cream page and intro | `page.tsx:473` | MEASURED (SSR HTML) |
| F8 | Wheel over the project carousel both rotates it and scrolls the page | `ProjectWheel3D.tsx:734-738` (React `onWheel` is passive) | STATIC |
| F9 | Wheel grab cursor never updates (ref read in render) | `ProjectWheel3D.tsx:787` | STATIC (lint) |
| F10 | Contact form uses blocking `alert()` for validation / errors | `page.tsx:427, 462, 467` | STATIC |
| F11 | `prefers-reduced-motion` essentially ignored | §6.2 A11 | STATIC |
| F12 | Custom cursor hides the native cursor on every interactive element via `cursor: none !important` | `globals.css:349-359` | STATIC (accessibility consideration) |
| F13 | Deployment reference URL serves a June build | §2.2 | MEASURED |

Of these, F1, F2 and F11 also interact with performance (scroll path, transition work, motion budget). The rest are recorded so they are not mistaken for performance bottlenecks.

---

## STAGE 14 — Production & Deployment ✅ COMPLETE

Observation date: **2026-11-02 05:20–06:30 UTC**, from the auditor's machine (India region; Vercel edge `bom1`), headless Chrome 156.

| Aspect | Local production build | Current production (`prajith-…`) | Old reference URL (`prajit-…`) |
|---|---|---|---|
| Code | working tree (HEAD + 9 uncommitted files) | HEAD `cd1d9a3` (inferred from markup + `Age`) | June 2026 build |
| Bundler | webpack | webpack | Turbopack |
| HTML | 8.6 KB, **no font preloads** (build-copy artifact) | 11.2 KB, 10 font preloads, brotli | — |
| TTFB | 13–42 ms | 52–158 ms (edge HIT) | 153–409 ms |
| FCP / LCP (desktop median) | 784 / 2,400 ms | 1,168 / 2,920 ms | 616 / 2,824 ms |
| CLS | 0.79 (font race) | 0.055 | 0 |
| TBT | 2,571 ms | 1,956 ms | 116 ms |
| Requests / bytes | 119 / 11.2 MB | 124 / 11.3 MB | 17 / 0.33 MB |
| Compression | — | brotli for HTML/JS/CSS | brotli |
| Cache | — | immutable hashed assets; `/public` `max-age=0` | same |
| Errors | none | none | none |

Local and production behave the same at runtime (same chunks, same requests, same long-task pattern). Differences are explained by network (edge vs localhost), font preloads, and the CLS font race. The supplied URL measures a different, much lighter site, so **any earlier impression that "production is fine" based on that URL would be wrong**. No deployment was modified or triggered.

---
---

# ULTIMATE PORTFOLIO PERFORMANCE AUDIT REPORT

*(Consolidated assessment. It summarises the stage log above; section references like "§2.8" point to the detailed evidence.)*

## 1. Executive Summary

**Why is the portfolio lagging?** Because it never stops working. With no input at all, the page keeps the main thread **50–94 % busy**, performs a **style recalculation and a full layout on every frame**, and keeps the GPU process at **≥ 1 full CPU core** at every scroll position (§2.7). On this laptop's integrated GPU it delivers 35–58 fps against a 127 fps ceiling at idle, ~39 fps while wheel-scrolling (p95 frame 40–47 ms), and **14–17 fps on a 4×-slower CPU** (mobile proxy). Scrolling and clicks have to compete with that permanent load, so they stutter and respond late: **lab INP 416 ms on desktop and up to 9.8 s at 4× CPU** (opening the Hire-Me modal).

**Confirmed root causes (measured, reproduced):**
1. **An unbounded set of always-on animation loops** (§2.8 ablation): the GitHub 3D graph renders every frame for the whole session (`frameloop="always"`, its `isInView` pause path is never wired); the DinoRunner full-viewport canvas redraws forever (~45 GPU-process points even when off-screen); 25 always-on framer-motion SVG attribute animations in Expertise force a page-wide layout every frame; dozens of CSS infinite animations (blurred pulses, masked ticker, pings, spinning glow) run simultaneously; the GSAP hero title and the 3D wheel loop never stop. **When all of them are paused, every section runs at the display ceiling (126–128 fps, p95 8.1 ms).**
2. **A monolithic client-rendered page**: `app/page.tsx` is one `"use client"` component that renders only a spinner on the server, then mounts ~3,100 elements in a single 1.1 s task, and owns the form, scroll-spy and modal state. Every keystroke, section change or modal toggle re-renders the entire page (§5.3). No code splitting: three.js / R3F / drei / genie-web / html-to-image (~half of the 1.87 MB initial JS) load up-front for features below the fold or behind a click (§9.1).
3. **Self-inflicted and unoptimised loading**: the Hire-Me modal pre-captures itself with html-to-image 600 ms after mount, triggering **74 font fetches / 2.2 MB** and long tasks during the intro, and its hidden `<iframe>` loads the resume PDF and PDF viewer on every visit. 8 MB of raw PNGs (one 3.5 MB) are fetched for content far below the fold, a 1.5 MB HDR comes from `raw.githubusercontent.com`, and four render-blocking third-party font CSS imports (two of them unused) once delayed FCP to 6 s (§2.4, §11).

**Nature of the problem:** a combination, in this order: **main-thread CPU** (continuous JS/SVG/style/layout work plus whole-tree React renders) and **GPU/compositor** (canvas redraws, hundreds of composited 3D layers, blurred/masked animated layers, continuous WebGL) are the lag; **network/JS-volume** is the load-time problem; **memory is healthy** (no leak, §3.7).

**What to fix first:** (1) stop off-screen/idle animation work: gate the R3F graph, DinoRunner, GSAP title, wheel and infinite SVG/CSS loops by visibility and reduced motion; (2) make the Hire-Me modal lazy (no pre-capture, no startup PDF, no forced layouts on open); (3) split the page so heavy sections load on demand and hot state stops re-rendering the whole tree.

**Also discovered:** the URL supplied as the deployment reference (`prajit-…`) serves a ~5-month-old build; the audited code is live at `prajith-…` (§2.2). Several functional bugs: Tailwind transitions are globally disabled, Lenis anchor scrolling never binds, the modal form cannot submit, and there is a duplicate `id="about"` (§13.2).

Confidence: findings marked MEASURED were reproduced across runs. Magnitudes on real phones and discrete GPUs were not measured.

## 2. Project Architecture Overview
Next.js 16.2.6 App Router (webpack build), React 19.2.4, TypeScript, Tailwind v4, framer-motion 12 (dominant animation system), GSAP 3 (hero title), Lenis (smooth wheel), three 0.186 + R3F 9 + drei 10 (GitHub graph only), genie-web + html-to-image (modal), hand-written 2D canvas (DinoRunner) and CSS-3D (ProjectWheel3D). One static route `/`. Only the root layout is a Server Component; the whole page is a single client component behind a `mounted` gate. No dynamic imports. Assets in `public/` (49 files, ~14 MB unreferenced plus a 21.5 MB unreferenced MP4). Fonts: 9 next/font/geist families + 4 runtime CSS imports. Data: one Server Action scraping GitHub. Full map and dependency table: Stage 1.

## 3. Repository Integrity Report
- **Initial state** (recorded first): branch `main`, HEAD `cd1d9a3`, nothing staged, no untracked files, no stashes, 9 modified files (list in §0.1).
- **Method**: SHA-1 of all 125 files outside `node_modules/.git/.next`, plus `git status` and `git diff`, saved outside the repo before any work. Builds, lint and the production server ran in an **isolated scratchpad copy** with a read-only `node_modules` junction. The repo's `.next/` was never touched.
- **Final state** (verified 2026-11-02 after all stages): branch `main`, HEAD `cd1d9a3`; `git status` identical except for one new untracked file `docs/reports/PORTFOLIO_PERFORMANCE_AUDIT.md`; `git diff` byte-identical to the initial diff; nothing staged; no stash; **all 125 pre-existing files hash-identical**; `.next/BUILD_ID` unchanged (`ZIjj77LPRTaQc-NCPB2ct`, 2026-10-16); **0 files in `node_modules` written** during the session.
- **Generated artifacts (outside the repo, session scratchpad only):** isolated build copy and its `.next`, Chrome profiles, CDP measurement scripts and JSON results, ESLint JSON. A local `next start` server on port 3123 was used for testing.
- **Confirmed: no application source code, configuration, dependency, lockfile or existing project file was modified.**

## 4. Performance Baseline
See §2.1 (environment), §2.3 (load metrics), §2.7–2.8 (idle steady state and ablation), §3.2 (scroll), §3.4 (INP). Headline numbers:

| Metric (production unless noted) | Desktop | Mobile emulation (Slow-4G + 4× CPU) | Target |
|---|---|---|---|
| TTFB | 134 ms | 158 ms | — |
| FCP (spinner) | 1,168 ms (outlier 5,984 ms) | 3,124 ms | ≤ 1.8 s |
| LCP | **2,920 ms** | **9,032 ms** | ≤ 2.5 s |
| Content visible (intro overlay gone) | 5,349 ms | 12,665 ms | — |
| CLS | 0.055 (local worst 0.79) | 0.014 (local 0.185) | ≤ 0.1 |
| TBT | **1,956 ms** | **6,289 ms** | < 200 ms |
| Lab INP (max of 19 interactions, local) | **416 ms** | **9,832 ms** (4× CPU, desktop layout) | ≤ 200 ms |
| Idle fps (ceiling 127) | 35–58 | 14 | — |
| Wheel / touch scroll fps | ~39 (p95 40–47 ms) | 16.5 (p95 79 ms) | stable 60 + |
| JS (initial) | 555 KB br / 1.87 MB raw | same | — |
| Transfer | 11.3 MB / 124 requests | ≥ 2.2 MB in 25 s window | — |
| JS heap after load | ~20 MB | ~13–21 MB | — |
Not measured: Speed Index, Lighthouse score, field INP/CrUX, real devices, discrete GPU (§2.9).

## 5. Route-by-Route Performance Analysis
There is one real route, `/` (plus the default `/_not-found`). Section-by-section behaviour of `/` (idle cost per section, §2.7):

| Section | Idle fps | Main busy | Dominant cost (from ablation) |
|---|---|---|---|
| Hero | 45–58 | 72–75 % | framer per-frame layout, DinoRunner, CSS animations, giant marquee layers |
| About / Education | ~74 | ~92 % | background loops (off-screen R3F, Dino, framer SVG) |
| Expertise (`#stack`) | 48–51 | **91–94 %** | CSS animations on SVG/blur (pausing CSS → 92 fps) + framer SVG loops |
| Projects (wheel) | 38–43 | 48–59 % | wheel rAF + ~500 `preserve-3d` layers (residual 48 % with everything paused) |
| GitHub graph | 35–41 | 73–76 % | R3F rendering + Dino (off-screen) + CSS animations |
| Credentials / Journey / Contact | 46–70 | 66–88 % | background loops; Credentials hover crossfade |
`/_not-found`: not audited (default page).

## 6. Component-by-Component Performance Analysis
Full inventory with evidence: **Stage 4 (§4.1–4.2)**. Summary of classifications:
- **CRITICAL**: `app/page.tsx` (Home), `HireMeModal`, `DinoRunner`, `Expertise`, `ProjectWheel3D`, `GithubGraph3D`.
- **PERFORMANCE ISSUE**: `layout.tsx` fonts, `SmoothScroll`, `IntroPreloader`/`IntroLoadingBar`, `BackgroundTypography`, `ElasticHeroTitle`, `ScrollReveal`, `BottomTicker`, `StatsMarquee`, `GithubContributions`, `Credentials`, contact `GlowButton`.
- **NEEDS INVESTIGATION**: social dock and nav backdrop filters, fixed full-viewport overlays, `StatsCard` backdrop filter, `MagneticNavItem`, `lib/githubContributions.ts` cold path.
- **HEALTHY**: `CustomCursor`, `CursorGlow`, `ScrollProgressBar`, `TimePill`, `TypewriterTitle`, `Magnetic`, `TiltCard`, `AnimatedHeroHeading`, `WordReveal`, `About` (perf), `JourneyTimeline`, portrait image, hero static orbs; all unrendered/dead-code components.

## 7. React and Next.js Analysis
See **Stage 5**. Key points: empty SSR shell from the `mounted` gate; the full page mounts in one ~1.1 s task; page-level state causes whole-tree re-renders (typing 46 ms → 842 ms per key at 4×; scroll-spy 69–85 ms frames); no code splitting; Server Action used as a client fetch; next/image unused for the heaviest images; 5 unused font preloads; ESLint 81 errors / 46 warnings; effects and listeners are cleaned up correctly.

## 8. Animation Analysis
See **Stage 6**. 121 registered CSS animations (22 running), only 2 WAAPI animations; all SVG/spring work is JS. framer SVG loops cause per-frame layout page-wide; CSS animations on SVG/blurred elements dominate the Expertise section; nothing except marquees is visibility-gated; filter-blur transitions over large areas; `ScrollReveal` leaves 3D contexts behind; Tailwind transitions globally disabled; reduced motion essentially unsupported.

## 9. WebGL and 3D Analysis
See **Stage 7**. GithubGraph3D: continuous render loop, all 365 instance matrices rewritten every frame, ContactShadows extra passes every frame, 1.5 MB third-party HDR + PMREM, first frame 1.15 s, dead shadow config, `isInView` never wired. DinoRunner: DPR-sized full-viewport 2D canvas redrawn forever (2.96 MP on mobile). genie-web: idle canvas released to 1×1 (fine). ProjectWheel3D: CSS-3D layer explosion with main-thread rotation.

## 10. Asset Optimization Analysis
See **Stage 8**. Largest wins: project previews (5.8 MB raw PNG used as CSS backgrounds, one 3.5 MB 1920×1080), `pets-strip.png` 1.16 MB + main-thread pixel processing, `postgresql.png` 748 KB for a small icon, resume PDF loaded at startup, unused fonts/preloads, ~35 MB of unreferenced files in `public/`.

## 11. JavaScript Bundle and Dependency Analysis
See **Stage 9**. 1.87 MB raw / ~537 KB gzip initial JS; three.js (730 KB raw) + R3F (160 KB) + drei/genie/html-to-image (in a 305 KB shared chunk) are below-the-fold or click-only. Tree-shaking works (unused carousel/slider/arsenal absent). `@base-ui/react` unused; `clsx`/`tailwind-merge` redundant; `shadcn` CLI in runtime deps; Geist via two packages.

## 12. CSS and Browser Rendering Analysis
See **Stage 10**. Unlayered transition reset; render-blocking third-party `@import` chain; ~245 lines of dead `.sw-*` CSS; ≥4 fixed full-viewport overlays; grid painted twice; backdrop filters over animated content; 372–685 composited layers; 13–16 k px-wide text layers; forced synchronous layouts (framer read, Lenis resize, modal effect); per-frame style 2.2–3.4 ms + layout 0.6–0.8 ms at idle.

## 13. Network and API Analysis
See **Stage 11**. The server is fast (edge HIT, 50–160 ms TTFB). The load is limited by JS execution and rendering, intermittently blocked by third-party font CSS, and wasted by html-to-image fetches (74 / 2.2 MB), eager raw PNGs (8 MB), the startup PDF and a third-party HDR. No analytics or third-party scripts. `/public` assets are not long-cached.

## 14. Memory and Stability Analysis
See **Stage 12 / §3.7**. No leak: heap 15 → 18 MB plateau over 8 heavy cycles, DOM/canvas/document counts flat. The concern is continuous CPU/GPU use (battery, thermals), not memory growth.

## 15. Errors and Reliability Findings
See **Stage 13**. No exceptions or hydration errors; 2 benign three.js warnings. Functional defects F1–F13 (Lenis anchors dead, Tailwind transitions disabled, modal form unsubmittable, resume "button" not a link, duplicate `id="about"`, cursor class on touch devices, dark spinner flash, wheel double-scroll, `alert()` UX, reduced motion ignored, `cursor:none` everywhere, stale deployment URL).

## 16. Production Deployment Analysis
See **Stage 14 / §2.2**. Current production (`prajith-balaji-portfolio.vercel.app`, ≈ HEAD `cd1d9a3`) behaves like the local build at runtime. The supplied URL is a June build. Compression and immutable caching of hashed assets are correct; `/public` assets are `max-age=0`.

## 17. Complete Issue Register

Route for all issues: `/`. Severity per the brief (P0 critical … P3 low). Each issue is counted once; where two issues share a mechanism, the dependency is noted in §18.

| ID | Severity | Component | File | Root Cause | Evidence | Recommended Solution |
|---|---|---|---|---|---|---|
| PERF-01 | **P0** | HireMeModal open/close path | `app/page.tsx:365,877,897`; `components/HireMeModal.tsx:274-316,388-411` | Opening re-renders all of `Home`; the effect reads `clientWidth` after style writes and changes `body` padding/overflow (full-page relayout); genie reads rects synchronously; Escape handled twice | INP 272 ms / 416 ms (1×); **9,832 ms / 4,592 ms (4×)**; LoAF 5,845 ms forced layout | Move modal open state out of `Home` (local store/context consumed only by the button and modal); measure the scrollbar once at idle; avoid layout-affecting `body` writes in the same frame as reads (`scrollbar-gutter: stable` or a single batched write); remove the duplicate Escape handler |
| PERF-02 | **P1** | HireMeModal pre-capture & hidden iframe | `components/HireMeModal.tsx:242-263, 365-378, 199-203` | html-to-image `toCanvas(skipFonts:false)` 600 ms after mount embeds every web font (re-fetching all); a permanent hidden copy of the modal; the real hidden copy's `<iframe>` loads the PDF + viewer at startup | 74 fetches / 2.2 MB; long tasks 190–964 ms + FileReader frames up to 2.26 s (mobile); PDF + `chrome-extension://…pdf` document at load | Capture lazily (on first hover/intent of HIRE ME, or on open) with `skipFonts` or a pre-built font CSS; mount the modal content and iframe only when opened (or use a static resume preview image); drop the permanent hidden copy |
| PERF-03 | **P1** | DinoRunner | `components/DinoRunner.tsx:521-558, 577-1201, 330-475` | Full-viewport DPR-sized canvas cleared and redrawn every frame with no visibility check; per-visit `getImageData` pixel processing | ~45 GPU-process points even off-screen (github ablation 130 %→84.5 %); 0.4–0.5 ms JS/frame everywhere; 281 + 72 ms load tasks; 1170×2532 canvas on mobile | Pause the loop when the hero is not intersecting / tab hidden / reduced motion; cap DPR (e.g. ≤ 1.5) and frame rate (30 fps is enough for pixel art); pre-process sprites offline |
| PERF-04 | **P1** | Expertise | `components/Expertise.tsx:110-790, 944-958, 1167-1198` | 25 always-on framer `repeat: Infinity` SVG attribute animations (JS, layout-dirtying) never paused; 24 cells × 3 CSS animations incl. animated blurred circles; pause class covers CSS only | framer paused → layouts ~220→33 /4 s, busy 73→54 % at the hero; CSS paused at section → fps 51→92 | Gate all icon animations on section visibility (pass `inView` down and animate only when visible; or `useReducedMotion`); convert attribute animations (cx/cy/r) to transform/opacity on HTML/CSS or run them only on hover; replace animated blurred circles with pre-blurred static gradients animated by opacity |
| PERF-05 | **P1** | GithubGraph3D | `components/GithubGraph3D.tsx:272-403, 551-600`; `GithubContributions.tsx:55` | `frameloop="always"`, `isInView` never passed; wave term forces all instance matrices to update every frame; ContactShadows renders every frame | R3F 0.45–0.81 ms JS/frame at all positions; paused → fps 37–41→47–51 at the section; first frame 1.15 s | Wire visibility (`frameloop="demand"` + `invalidate()` while animating, or toggle `frameloop` via IntersectionObserver); `ContactShadows frames={1}` (static); skip matrix writes when settled; cap `dpr` (e.g. `[1,1.5]`) |
| PERF-06 | **P1** | Home (page architecture) | `app/page.tsx:1, 360, 392-394, 471-477` | Whole page is one client component; `mounted` gate produces an empty SSR shell and a single huge mount task | SSR HTML = spinner only; React mount task 1,147 ms (1×) / 1,537 ms (4×); intro gone 5.3 s / 12.7 s | Remove the global `mounted` gate; let sections render on the server (static markup), and isolate browser-only pieces in their own client components that handle `mounted` locally |
| PERF-07 | **P1** | Bundling | `app/page.tsx:19-42`; `components/GithubContributions.tsx:5`; `components/HireMeModal.tsx:7-8` | No code splitting; three/R3F/drei/genie/html-to-image in the initial bundle | ≈ 890 KB raw / 235 KB gz for three+R3F alone on first load | `next/dynamic` (`ssr:false`) for `GithubGraph3D` (load near viewport) and for the modal internals (load on intent); remove dead imports |
| PERF-08 | **P1** | Home state | `app/page.tsx:363, 382-384, 398-404, 1255-1299` | Form fields and scroll-spy state live in the page root, so every change re-renders the full tree | 46 ms (1×) / 842 ms (4×) script per keystroke; 69–85 ms React frames while scrolling | Extract `ContactForm` (own state) and a `NavBar` that subscribes to the active section on its own; keep `Home` static |
| PERF-09 | **P1** | ProjectWheel3D | `components/ui/ProjectWheel3D.tsx:115-313, 572-584, 624-693, 166, 301` | ~500 `preserve-3d` elements (7 facets × ~8 layers per card); main-thread rotation forever; raw full-size PNG backgrounds; `drop-shadow` on 63 facets | Layers 372→~670; wheel paused → fps 38–43→46–47; residual 48 % busy with everything paused | Reduce per-facet element count (merge glass layers into one element per facet / pseudo-elements); fewer facets on small screens; drive rotation with a CSS animation or WAAPI (compositor) when idle-rotating; pause when off-screen (already partly); serve resized images |
| PERF-10 | **P1** | Images | `ProjectWheel3D.tsx:166`; `Expertise.tsx:634`; `DinoRunner.tsx:330-391`; `public/*.png` | Raw multi-MB PNGs requested at ~1.6 s for content far below the fold; full-resolution decode for small slots | 8 MB images; velari 3.5 MB; still downloading at 25 s on Slow-4G | Pre-generate resized WebP/AVIF (≤ ~1200 px), load when the section nears the viewport, use `next/image` where possible; SVG for the PostgreSQL logo |
| PERF-11 | **P1** | Global CSS fonts | `app/globals.css:1-4` | Render-blocking third-party `@import` chain; Anton/Archivo/Space Mono imports unused | One prod run FCP 5.98 s (fontshare CSS 5.6 s) | Self-host Cabinet Grotesk via `next/font/local`; delete the unused Google imports; load Montenegrin Gothic One via `next/font` |
| PERF-12 | **P2** | BackgroundTypography / fonts | `components/BackgroundTypography.tsx:34-54`; `globals.css:15` | Cabinet Grotesk swaps under 12 rem text with no metric-adjusted fallback; LCP element is the faint marquee | CLS 0.79 local / 0.055 prod (race) | Self-hosted font with `adjustFontFallback`/`size-adjust` (comes with PERF-11); optionally mark the marquee decorative so the hero title is the LCP candidate |
| PERF-13 | **P2** | IntroPreloader | `components/IntroPreloader.tsx:11-31` | Overlay gates all content; its timers stretch under main-thread load | Overlay gone 5.3 s / 12.7 s vs 3.15 s coded | Keep the design, but finish it on a wall-clock budget independent of load work (depends on PERF-02/03/05/06); consider showing it only on first visit (session flag) |
| PERF-14 | **P2** | Font configuration | `app/layout.tsx:2-53` | 5 preloaded families never render; Montserrat 700 preloaded while 900 renders; Geist loaded via two packages; Switzer unused; local font as TTF | ~170 KB unused high-priority preloads | Remove unused families or set `preload:false`; request only the weights used; one Geist source; convert researcher font to WOFF2 |
| PERF-15 | **P2** | Credentials | `components/Credentials.tsx:134, 168-176, 114` | Hover on a moving ticker swaps content with a `filter: blur` crossfade over a large panel; new image mount | 668 ms worst frame (1×) | Crossfade with opacity/transform only; preload/keep the 5 certificate images mounted; debounce hover |
| PERF-16 | **P2** | GitHub section reveal | `components/GithubContributions.tsx:48-54`; `app/page.tsx:1194` | `filter: blur` reveal with `once:false` over the WebGL container, inside a `triggerOnce={false}` ScrollReveal | STATIC (re-runs on every entry/exit) | `once:true`, opacity/transform only |
| PERF-17 | **P2** | ScrollReveal | `components/ScrollReveal.tsx:32-46` | Permanent `preserve-3d` + `perspective` on ~25 wrappers; `rotateX` reveal | Contributes to 372→685 layers [not isolated] | Drop `preserve-3d`/`perspective` after the reveal (or use 2D y/opacity); verify layer count drop |
| PERF-18 | **P2** | Fixed overlays & backdrop filters | `app/page.tsx:637-705, 764-774, 784`; `globals.css:337-466`; `StatsCard.tsx:30-31` | ≥4 full-viewport fixed layers + blend mode; backdrop filters on fixed/over-animated elements | Layers present; cost **not isolated** | Profile with a GPU trace; merge grid/vignette/grain into one layer; reduce backdrop blur radius or use pre-blurred backgrounds where content behind is animated |
| PERF-19 | **P2** | Reduced motion | global | No reduced-motion path for framer, GSAP, R3F, canvas, Lenis | STATIC | `<MotionConfig reducedMotion="user">`, and a shared `useAnimationBudget()` (visibility + reduced motion + tab hidden) used by every loop |
| PERF-20 | **P2** | Lenis / anchors | `components/SmoothScroll.tsx:25-45`; `globals.css:319` | Anchor binding runs before content exists; native smooth scroll + Lenis without `lenis.css` | No listeners on anchors; anchor travel frames p95 341 ms | Use Lenis' built-in `anchors` option (event delegation), import `lenis/dist/lenis.css`, remove `scroll-behavior: smooth` |
| PERF-21 | **P2** | GitHub data path | `lib/githubContributions.ts`; `components/GithubContributions.tsx:14-29` | Client-triggered Server Action per view; regex scrape of GitHub HTML; cold 3.7 s | MEASURED (3.7 s cold / 289 ms warm) | Fetch at build/ISR in a Server Component and pass data as props, or a cached route handler with `revalidate` |
| PERF-22 | **P2** | Environment HDR | `components/GithubGraph3D.tsx:599` | 1.5 MB HDR from `raw.githubusercontent.com` (5-min cache) + PMREM | MEASURED | Self-host a small (e.g. 256 px) HDR/cubemap or bake a simple lighting setup; drei `Environment files=…` |
| PERF-23 | **P3** | StatsMarquee / IntroLoadingBar | `StatsMarquee.tsx:16-44, 80-100`; `IntroLoadingBar.tsx:28-54` | 24 rAF loops each calling `setState` per frame; loading bar 2 `setState` per frame | STATIC | Animate counters with one shared loop writing `textContent` via refs (or only the visible copy); loading bar via CSS transform |
| PERF-24 | **P3** | ElasticHeroTitle, BottomTicker, GlowButton, pings | `ElasticHeroTitle.tsx`, `BottomTicker.tsx:46-80`, `glow.tsx:68-84` | Always-on effects without visibility gating | MEASURED as part of the CSS/GSAP groups (small individually) | Gate with the shared animation budget (PERF-19) |
| PERF-25 | **P3** | Caching of `/public` | Vercel defaults | `max-age=0, must-revalidate` on images/PDF | MEASURED headers | Serve heavy assets through `next/image` / hashed imports, or add `headers()` cache rules for static media |
| PERF-26 | **P3** | Repo / dependency hygiene | `package.json`, `public/`, `components/ui/*` | Unused deps, dead components/imports, ~35 MB unreferenced public files | STATIC | Remove after the functional fixes; no runtime change expected |
| FUNC-01 | P2 (functional) | Global CSS | `globals.css:888-891` | Unlayered transition reset disables Tailwind transitions | MEASURED | Scope the reset to `html.theme-transitioning` only (or wrap in `@layer base`); review that re-enabled `transition-all` usages don't animate layout properties |
| FUNC-02 | P2 (functional) | HireMeModal form | `HireMeModal.tsx:100-181, 209-216, 341-356` | No submit button; fake submit; resume "button" is a div | STATIC | Real `<button type="submit">`, wire to the same submit as the contact form; real download link |
| FUNC-03 | P3 (functional) | IDs / cursor / misc | `page.tsx:1011`, `About.tsx:10`, `HireMeModal.tsx:319-328`, `page.tsx:473`, `ProjectWheel3D.tsx:734-738,787` | Duplicate id; cursor class on touch; dark spinner flash; wheel double scroll; cursor ref | MEASURED / STATIC | Rename one `about` id; guard class with `pointer: fine`; light skeleton; `preventDefault` via a non-passive native wheel listener only when appropriate |
| DEPLOY-01 | P1 (process) | Deployment reference | Vercel projects | Supplied URL is a June build; current code lives at `prajith-…` | MEASURED (`Age` headers, bundler) | Confirm which project/domain is canonical; redeploy or alias |

## 18. Root Cause Hierarchy

```
RC-1  No animation budget / lifecycle policy  (PRIMARY — the "lag")
      Every effect animates forever, everywhere, at full DPR.
      ├─ PERF-05 GitHub graph renders every frame (WebGL + 365 matrix uploads + ContactShadows)
      ├─ PERF-03 DinoRunner redraws a full-viewport canvas every frame (GPU even off-screen)
      ├─ PERF-04 Expertise: 25 JS SVG loops → page-wide per-frame layout; heavy CSS animations
      ├─ PERF-09 Wheel rotates on the main thread forever
      └─ PERF-24 GSAP title, ticker, spinning glow, pings …
      Proof: pausing all of them → 126–128 fps everywhere (§2.8)

RC-2  Monolithic client-rendered page  (PRIMARY — load & interaction latency)
      ├─ PERF-06 empty SSR + 1.1 s single mount task
      ├─ PERF-08 page-level state → whole-tree re-renders (typing, scroll spy)
      ├─ PERF-01 modal open = full re-render + forced layouts (INP 9.8 s @4×)
      └─ PERF-07 no code splitting (three/R3F/drei/genie/html-to-image on first load)

RC-3  Eager, unoptimised and self-inflicted loading  (PRIMARY — load waste)
      ├─ PERF-02 html-to-image pre-capture (74 req / 2.2 MB) + startup PDF iframe
      ├─ PERF-10 8 MB raw PNGs fetched early; pixel processing on main thread
      ├─ PERF-11 render-blocking third-party font CSS (+ unused imports)
      ├─ PERF-14 unused/wrong font preloads, duplicate Geist
      ├─ PERF-22 1.5 MB third-party HDR
      └─ PERF-21 client-triggered Server Action scrape

RC-4  Excessive compositing & paint complexity  (SECONDARY — amplifier)
      ├─ PERF-09 ~500 preserve-3d wheel layers;  PERF-17 ScrollReveal 3D contexts
      ├─ PERF-18 fixed full-viewport overlays + backdrop filters over animated content
      ├─ PERF-15 / PERF-16 filter-blur transitions over large areas
      └─ PERF-12 giant stroked text layers (also LCP/CLS)
```

How they interact:
- **RC-1 × RC-2**: the always-on loops consume the frame budget, so every React re-render from RC-2 (typing, scroll spy, modal) lands on a thread that is already 50–94 % busy. That is why a 46 ms render becomes a 100–400 ms interaction on desktop and seconds at 4× CPU.
- **RC-3 → perceived load**: load-time long tasks (mount, capture, pixel loops, first R3F frame) all run inside the intro window and stretch the 3.15 s intro to 5.3 s / 12.7 s.
- **RC-4 × RC-1**: every animated frame has to composite 370–685 layers, several full-screen overlays and backdrop filters, so each loop costs more GPU than it would on a simpler layer tree.
- **On slow CPUs**, the floor is RC-2/RC-4 (style + layout over ~3,100 elements every frame). Pausing loops alone only took 4×-CPU scrolling from 16.5 to 19.5 fps, so fixing RC-1 is necessary but not sufficient for phones.

## 19. Recommended Optimization Roadmap

| Stage | Goal | Fixes (Phase 2 IDs, §23) | Order / dependencies |
|---|---|---|---|
| **Stage 1 — Critical** | Stop idle work; unblock interactions | FIX-01 animation budget hook → FIX-02 GitHub graph gating → FIX-03 DinoRunner gating → FIX-04 Expertise loop gating → FIX-05 lazy modal (no pre-capture/PDF) → FIX-06 modal open path | FIX-01 first (shared primitive); 02–04 independent after it; 05 before 06 |
| **Stage 2 — Rendering & interaction** | Stop whole-tree re-renders; give back SSR | FIX-07 extract ContactForm / Nav scroll spy → FIX-08 remove `mounted` gate (section-local guards) → FIX-09 code-split graph & modal | FIX-07 before FIX-08 (smaller diff); FIX-09 after FIX-02/05 |
| **Stage 3 — Animation & GPU** | Lower per-frame compositing cost | FIX-10 wheel simplification → FIX-11 ScrollReveal 3D cleanup → FIX-12 blur-transition replacements (Credentials, GitHub reveal) → FIX-13 overlays/backdrop profiling & merge → FIX-14 remaining always-on effects + reduced motion | After Stage 1 so effects can be measured in isolation |
| **Stage 4 — Assets & network** | Cut bytes and blocking requests | FIX-15 fonts (self-host Cabinet, prune families/weights, fix preloads) → FIX-16 images (resized, lazy, next/image) → FIX-17 HDR self-host/smaller → FIX-18 GitHub data at build/ISR | FIX-15 also resolves CLS |
| **Stage 5 — Architecture & quality** | Correctness and hygiene | FIX-19 Lenis anchors + CSS → FIX-20 transitions reset (FUNC-01) → FIX-21 functional bugs (FUNC-02/03) → FIX-22 dead code/deps/public cleanup → DEPLOY-01 | FIX-20 re-enables transitions → re-measure after |
| **Stage 6 — Validation** | Prove it, prevent regressions | Re-run the harness from this audit (load ×3, idle per section, ablation, scroll, INP 1×/4×, memory, layers) on local + production; visual comparison screenshots per section | After each fix and at the end |

## 20. Expected Performance Improvements
**All values below are ESTIMATES** derived from the measured ablation and byte counts. None are measured results of a fix.

| Change | Expected effect (estimate) | Basis |
|---|---|---|
| Stage 1 gating (FIX-01–04) | Idle at sections where the gated effects are off-screen: approaching the ceiling (≥ 100 fps desktop, main busy < 30 %); hero with Dino + title still animating: ~60–70 fps | §2.8: all paused → 126–128 fps; single-loop removals gave +8 to +40 fps at the relevant section |
| FIX-05 lazy modal | −74 requests, −2.2 MB, −1 document (PDF), removes 190–960 ms load tasks; intro ends closer to its coded 3.15 s | §2.4/2.5 |
| FIX-06 + FIX-07 | Modal open/close and typing INP well under 200 ms on desktop; large reduction at 4× CPU (cannot promise a number) | LoAF shows whole-tree render + forced layout dominate |
| FIX-09 code splitting | Initial JS −≈ 890 KB raw / −≈ 235 KB gzip (three+R3F) plus drei/genie/html-to-image share | §9.1 chunk sizes |
| FIX-16 images | −≈ 7 MB on initial load (deferred/resized) | §8.1 |
| FIX-15 fonts | −≈ 170 KB preloads, removal of 2 unused render-blocking CSS requests, CLS ≈ 0 | §5.6, §2.6 |
| FIX-08 SSR | Real content in HTML: FCP/LCP become meaningful (hero text) instead of spinner/marquee | §5.1 |

## 21. Regression Risks

| Fix area | What could break | Mitigation |
|---|---|---|
| Animation gating (FIX-01–04, 14) | Effects appearing "frozen" on re-entry; GSAP letters stuck mid-flight; R3F not redrawing after year toggle or drag; entrance stagger replaying unexpectedly | Resume from current state; `invalidate()` on interaction/data change; screenshot/visual check per section; test drag + year toggle |
| Modal changes (FIX-05/06) | Genie warp needs a snapshot (first open may be slower or fall back); scrollbar-width compensation (layout jump on open); focus/Escape behaviour | Capture on intent (hover/focus of HIRE ME); test open/close repeatedly, keyboard, mobile menu path |
| Removing `mounted` gate (FIX-08) | Hydration mismatches from browser-only code (`window`, `matchMedia`, random values in render, `localStorage`) | Move such reads into effects/local `useMounted` in the specific components; run with hydration warnings visible |
| State extraction (FIX-07) | Scroll-spy highlight lag, form reset behaviour | Unit-level manual checks; keep APIs identical |
| Code splitting (FIX-09) | Layout shift when the graph loads; loading flash | Reserve the 600 px height (already done by the loading box); preload when within ~1 viewport |
| Wheel simplification (FIX-10) | Visual change of the glass slab look, facet curvature, focus animation | Side-by-side screenshots at 3 widths; keep facet math; change only layer composition |
| Transitions reset (FIX-20) | Hundreds of `transition-all` hovers come back to life: new visual motion and extra work (including layout-property transitions) | Re-enable deliberately; audit `transition-all` usages; measure INP/hover after |
| Fonts (FIX-15) | Typeface metrics change (Cabinet self-hosted), wrong weights | Visual diff of headings; keep same files |
| Images (FIX-16) | Blurry previews if downscaled too far; wheel facets mis-slicing | Use ≥ 2× slot width; verify all 6 projects |
| Lenis (FIX-19) | Anchor offsets under the fixed nav, double smoothing | Test every nav item, mobile menu, keyboard paging |
| Reduced motion (FIX-14/19) | Users with reduced motion see a static hero | Intended; ensure layout is complete without animation |

## 22. Final Engineering Assessment
The portfolio's visual identity is not inherently too expensive. The ablation shows the same page, with the same DOM, images and CSS, running at the display ceiling once its animations stop running when nobody can see them. The lag comes from **policy, not content**: every effect runs continuously, at every scroll position, at full device pixel ratio, alongside a page architecture that re-renders everything on every interaction and loads everything up-front.

Address it in this order:
1. **Give animations a lifecycle** (visibility, tab, reduced motion) and apply it to the GitHub graph, DinoRunner and Expertise first. These are the three largest measured contributors, and the change is low-risk visually.
2. **Make the Hire-Me modal lazy** and its open path cheap. It is the worst interaction measured (P0) and the largest self-inflicted load cost.
3. **Split the page**: hot state out of `Home`, heavy sections and libraries loaded on demand, real server HTML.
4. Then reduce compositing complexity (wheel, 3D reveal wrappers, blur transitions, overlays) and fix assets/fonts.

The two items that most need deeper profiling before acting are the residual ~48–57 % main-thread cost at the wheel/graph sections with everything paused (layer-tree/commit hypothesis) and the GPU cost of the fixed backdrop filters/overlays. Both need a full DevTools performance trace with GPU rows and, ideally, a real mid-range phone.

## 23. Phase 2 Implementation Readiness

Each fix is meant to be implemented on its own, verified with the same harness used in this audit, and visually compared before moving on. "Harness" means the scratchpad CDP scripts (`load.mjs`, `steady.mjs`, `ablate.mjs`, `scroll.mjs`, `interact.mjs`, `memlayers.mjs`). They currently live only in the session scratchpad; they would be kept outside the app source (or added to a `tools/` folder) only with your approval.

| Fix ID | Scope | Affected files | Root cause (issue) | Proposed solution | Depends on | Regression risks | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|---|---|
| **FIX-01** | Shared animation-budget primitive | new `lib/useAnimationBudget.ts` (or similar); no visual change | RC-1 | Hook combining IntersectionObserver (element visible), `document.visibilityState`, and `prefers-reduced-motion` → boolean `active` | — | None by itself | Hook returns correct state in all 3 conditions | Unit check in browser console; no behaviour change yet |
| **FIX-02** | GitHub graph render gating | `GithubGraph3D.tsx`, `GithubContributions.tsx` | PERF-05 | Pass `active` as `isInView`; use `frameloop` demand/never when inactive or settled; skip matrix writes when settled; `ContactShadows frames={1}`; `dpr={[1,1.5]}` | FIX-01 | Graph not redrawing after drag/hover/year change | R3F loop ≈ 0 ms/frame when off-screen; at section idle fps ≥ 60 on this laptop; hover/drag/year toggle unchanged | `steady.mjs` (all positions) + `ablate.mjs github`; manual hover/drag/toggle |
| **FIX-03** | DinoRunner gating | `DinoRunner.tsx` | PERF-03 | Stop rAF when hero not visible / tab hidden / reduced motion; DPR cap 1.5; 30 fps cap; keep game state | FIX-01 | Game "jumps" on resume (use clamped dt — already present) | GPU-process ≥ 40 points lower when hero off-screen; hero visuals identical | `ablate.mjs github` (Dino row ≈ baseline); visual check hero |
| **FIX-04** | Expertise loop gating | `Expertise.tsx` | PERF-04 | Pass section visibility into icons; run framer infinite loops only when visible (or only on hover); keep CSS pause; consider transform-based alternatives for cx/cy moves | FIX-01 | Icons static when first entering until gating flips | Layout count at hero ≤ ~40 per 4 s; Expertise section fps ≥ 80 desktop | `steady.mjs` hero + stack; visual check of 24 icons |
| **FIX-05** | Lazy modal content & capture | `HireMeModal.tsx` | PERF-02 | Remove mount-time pre-capture and permanent hidden copy; capture on intent (pointerenter/focus of HIRE ME) with fonts limited/skipped; mount iframe only when open (or use a resume thumbnail) | — | First-open snapshot quality/latency; Genie fallback path | Load: 0 html-to-image fetches, no PDF request, no FileReader long tasks; modal looks identical | `load.mjs` ×3 (request list); open/close visually |
| **FIX-06** | Modal open/close path | `page.tsx`, `HireMeModal.tsx` | PERF-01 | Modal state outside `Home`; precomputed scrollbar width; batched body style writes (or `scrollbar-gutter: stable`); single Escape handler | FIX-05 | Scroll lock / layout jump; keyboard behaviour | INP open & close < 200 ms (1×); large reduction at 4× | `interact.mjs` 1× and 4× |
| **FIX-07** | State isolation | `page.tsx` (+ new `ContactForm`, nav subcomponents) | PERF-08 | Move form fields + submit into `ContactForm`; scroll spy inside the nav component | — | Active-link highlight, form behaviour | Typing INP < 50 ms (1×); no React frame > 50 ms during scroll from spy | `interact.mjs` typing; `scroll.mjs` LoAF |
| **FIX-08** | Remove global `mounted` gate | `page.tsx` and browser-only components | PERF-06 | Server-render sections; component-local guards for browser APIs | FIX-07 | Hydration mismatches | SSR HTML contains hero text; no hydration warnings; mount long task < 300 ms (1×) | `load.mjs` (HTML, long tasks, LCP element); console check |
| **FIX-09** | Code splitting | `page.tsx`, `GithubContributions.tsx`, `HireMeModal.tsx` | PERF-07 | `next/dynamic` for graph (near-viewport) and modal internals (on intent); remove dead imports | FIX-02, FIX-05 | Load flash / CLS around the graph | Initial JS ≤ ~1 MB raw; three/R3F chunks not requested until near the section | build chunk table; `load.mjs` network rows |
| **FIX-10** | Wheel layer reduction | `ProjectWheel3D.tsx` | PERF-09 | Collapse per-facet glass/edge layers; remove `drop-shadow` filters on titles (use text-shadow or none); compositor-driven idle rotation; resized images | FIX-16 (images) optional | Visual change of glass slab | Layers at projects ≤ ~400; section idle fps ≥ 60; visuals match | `memlayers.mjs`; `ablate.mjs projects`; screenshots |
| **FIX-11** | ScrollReveal 3D cleanup | `ScrollReveal.tsx` | PERF-17 | Remove `preserve-3d`/`perspective` after reveal (or 2D reveal) | — | Subtle change of reveal feel | Layer count drop measurable; reveal visually equivalent | `memlayers.mjs`; visual |
| **FIX-12** | Blur transitions | `Credentials.tsx`, `GithubContributions.tsx`, `page.tsx:1194` | PERF-15/16 | Opacity/transform crossfades, `once:true`, keep images mounted | — | Slightly different crossfade look | No frame > 100 ms on Credentials hover (1×) | `interact.mjs` Credentials step |
| **FIX-13** | Overlays & backdrop filters | `page.tsx`, `globals.css`, `StatsCard.tsx` | PERF-18 | Profile first; then merge grid/vignette/grain and reduce backdrop work over animated content | Stage 1 done | Visual texture changes | GPU-process per frame reduced; no visible difference | GPU trace + `steady.mjs` |
| **FIX-14** | Remaining always-on effects + reduced motion | `ElasticHeroTitle.tsx`, `BottomTicker.tsx`, `glow.tsx`, `StatsMarquee.tsx`, `IntroLoadingBar.tsx`, layout (`MotionConfig`) | PERF-19/23/24 | Apply FIX-01 everywhere; `MotionConfig reducedMotion="user"`; ref-based counters | FIX-01 | Static visuals under reduced motion (intended) | With reduced motion: no rAF loops running at idle | `steady.mjs` with `prefers-reduced-motion` emulated |
| **FIX-15** | Fonts | `layout.tsx`, `globals.css:1-4,14-22` | PERF-11/12/14 | Self-host Cabinet Grotesk (`next/font/local`, fallback metrics); delete unused imports/families; preload only used weights; one Geist; WOFF2 researcher | — | Typography metrics | 0 third-party CSS requests; CLS < 0.01 in 3 runs; preloads only used files | `load.mjs` ×3; visual diff of headings |
| **FIX-16** | Images | `ProjectWheel3D.tsx`, `Expertise.tsx`, `DinoRunner.tsx`, `public/` | PERF-10 | Resized WebP/AVIF variants; lazy-load near viewport; SVG PostgreSQL logo; pre-processed sprites | — | Image sharpness | Initial-load image bytes < 1 MB; no image > 300 KB | `load.mjs` byType Image |
| **FIX-17** | HDR | `GithubGraph3D.tsx` | PERF-22 | Self-hosted small environment map | FIX-09 | Lighting look | No third-party request; first R3F frame < 300 ms (1×) | `load.mjs`; LoAF |
| **FIX-18** | GitHub data | `lib/githubContributions.ts`, `GithubContributions.tsx`, `page.tsx` | PERF-21 | Fetch in a Server Component with ISR/revalidate, pass as props; year toggle via cached route | FIX-08 | Data freshness | No POST on page load | `load.mjs` (no POST `/`) |
| **FIX-19** | Lenis anchors & CSS | `SmoothScroll.tsx`, `globals.css:319` | PERF-20 | Lenis `anchors` option, import `lenis.css`, drop `scroll-behavior: smooth` | — | Anchor offsets | Anchor clicks prevented and smoothed by Lenis; no frame > 100 ms during anchor travel after Stage 1 | `interact.mjs` nav step |
| **FIX-20** | Transition reset | `globals.css:888-898` | FUNC-01 | Scope the zero-duration rule to theme switching only | — | Many transitions re-enabled | Tailwind `duration-*` computes as authored; hover INP still < 200 ms | computed-style check; `interact.mjs` |
| **FIX-21** | Functional bugs | `HireMeModal.tsx`, `About.tsx`, `page.tsx`, `ProjectWheel3D.tsx` | FUNC-02/03 | Real submit/download controls, unique ids, cursor class guard, light skeleton, wheel/cursor fixes | — | Form behaviour | Modal form submits; `#about` unique; no cursor class on touch | Manual + `interact.mjs` |
| **FIX-22** | Hygiene | `package.json`, `public/`, unused components | PERF-25/26 | Remove unused deps/files/imports; cache headers for static media | All above | Accidentally removing something used | Build + all harness runs unchanged | build; `load.mjs` |
| **DEPLOY-01** | Canonical deployment | Vercel | DEPLOY-01 | Decide the canonical domain; alias/redeploy | — | — | Supplied URL serves the current build | `curl -I` (`Age`, chunk names) |

### Findings that need additional profiling before implementation
1. Residual 48–57 % main-thread busy at the projects/github sections with all loops paused (layer-tree / commit cost hypothesis): DevTools trace with "Layers" and "Paint" enabled.
2. GPU cost of fixed backdrop filters, the blended glow orb and full-viewport overlays (PERF-18): GPU trace.
3. The unexplained GPU increase when pausing R3F at the hero (§2.8, point 4).
4. Real mid-range Android device run (thermal + real GPU), and a discrete-GPU desktop run.
5. Scroll frames of 150–440 ms without script attribution (image decode/raster of large PNGs/layers hypothesis).

---

> **STATUS: AUDIT COMPLETE — Phase 1 finished. No fixes have been implemented. Awaiting explicit authorization before Phase 2.**
