# Portfolio Remediation Log

> **Phase:** 1 — Animation lifecycle & performance (audit fixes FIX-01 … FIX-04)
> **Reference:** `docs/reports/PORTFOLIO_PERFORMANCE_AUDIT.md`
> **Started:** 2026-11-02 · **Completed:** 2026-11-03 · **Status:** ✅ PHASE 1 COMPLETE — all four steps implemented and individually verified. Awaiting authorization for Phase 2.
> **Phase 2 (FIX-05, FIX-06 — Hire Me modal):** authorized 2026-11-04 with decisions D1–D6. **FIX-05 implemented and validated under clean conditions** ([§ Phase 2 — Step 1](#phase-2--step-1--fix-05-lazy-modal-capture--content--validated-clean-awaiting-review)). R1 was tested and not confirmed, so no change was made. **FIX-06 not started**: it awaits your review of FIX-05.

## 0. Ground rules and method

### 0.1 Repository safety (checked before any change)

| Check | Result |
|---|---|
| Branch / HEAD | `main` @ `cd1d9a3` (unchanged since the audit) |
| Pre-existing work | The 9 modified files recorded in the audit (`app/globals.css`, `app/page.tsx`, `components/About.tsx`, `BackgroundTypography.tsx`, `Credentials.tsx`, `Expertise.tsx`, `HireMeModal.tsx`, `ui/AnimatedHeroHeading.tsx`, `ui/ProjectWheel3D.tsx`) + untracked audit report. `git diff` was byte-identical to the audit snapshot; every file hash matched except the audit report itself. |
| Staged / stash | none / none |
| Backups | Exact copies of every file touched in this phase (`GithubGraph3D.tsx`, `GithubContributions.tsx`, `DinoRunner.tsx`, `Expertise.tsx` — the last one *including* its pre-existing uncommitted edits) were saved to the session scratchpad before editing. |
| Git writes | None. No commit, stash, reset, checkout or push. No dependency installed. |

### 0.2 How every step is verified

1. **Build:** `next build --webpack` of the working tree, run in an isolated copy (`build-cand`) so the repository's own `.next/` is never touched. TypeScript runs as part of the build.
2. **Lint:** ESLint on the touched files, compared message-by-message with the pre-change baseline (goal: no new findings).
3. **Measurements:** the CDP harness from the audit, on the same machine (Chrome 156 headless, Intel UHD iGPU, 1440×900 DPR 1, display ceiling ≈ 127 fps). The **unchanged audit build stays online as the baseline** (`:3123`) next to the candidate (`:3124`), so before/after are measured back-to-back.
4. **Behaviour checks** in the real browser (loop activity per condition, interactions, reduced motion, tab hidden).
5. **Visual checks:** screenshots of the affected sections on both builds, compared side by side.
6. **Console:** errors, warnings and uncaught exceptions captured during each check.

Baseline lint for the files touched in this phase: `DinoRunner.tsx` 10 errors / 5 warnings, `Expertise.tsx` 0 / 1, `GithubContributions.tsx` 0 / 2, `GithubGraph3D.tsx` 44 / 7 (all pre-existing).

---

## Step 1 — FIX-01 Shared animation budget ✅ VERIFIED

**Original behaviour.** Every continuously animated component decided on its own whether to run. Most never stopped (R3F graph, DinoRunner, Expertise framer loops, GSAP title); a few paused CSS marquees via ad-hoc IntersectionObservers. No component reacted to a hidden tab (beyond the browser's own rAF throttling) or to `prefers-reduced-motion`.

**Root cause (audit RC-1).** No shared lifecycle policy for animations.

**Change.** New file `lib/useAnimationBudget.ts` (133 lines, no dependencies):

| Export | Signal | Implementation |
|---|---|---|
| `usePageVisible()` | tab in foreground | `useSyncExternalStore` on `visibilitychange` (server snapshot `true`) |
| `usePrefersReducedMotion()` | OS/browser motion preference | `useSyncExternalStore` on `matchMedia('(prefers-reduced-motion: reduce)')` `change` (server snapshot `false`) |
| `useInViewport(ref, {rootMargin, threshold})` | element near/in viewport | one `IntersectionObserver` per element, disconnected on unmount; starts `false`; falls back to "visible" where IO is unsupported |
| `useAnimationBudget(ref, options)` | combined | returns `{ inView, pageVisible, reducedMotion, shouldRender, shouldAnimate }` where `shouldRender = inView && pageVisible` and `shouldAnimate = shouldRender && !reducedMotion` |

Design notes: the values are live React state, so consumers resume automatically when an element scrolls back, the tab returns, or the preference changes. Consumers choose the granularity: a WebGL scene may still *render* a static frame under reduced motion (`shouldRender`) while ambient loops stop (`shouldAnimate`).

**Verification.**

| Check | Result |
|---|---|
| Build (incl. TypeScript) | ✅ pass |
| ESLint `lib/useAnimationBudget.ts` | ✅ 0 errors, 0 warnings |
| Runtime | The hook has no consumer in Step 1; all three signals were exercised in the browser through the GitHub graph in Step 2 (scroll off-screen, simulated hidden tab, emulated reduced motion) — see below. |

---

## Step 2 — FIX-02 GitHubGraph3D render gating ✅ VERIFIED

**Original behaviour (measured in the audit and re-measured today).** The R3F `<Canvas>` used the default `frameloop="always"` and rendered every frame for the whole session at every scroll position — ~50 frames/s at the hero, ~9,000 px from the graph, with the tab hidden (in this harness), and under reduced motion. Each frame rewrote all ~365 instance matrices (the `|| amt < 1` term forced it) and drei `ContactShadows` re-rendered the scene into its render target plus four blur passes. The component's own `isInView` pause path existed but was never wired (`GithubContributions` never passed it).

**Files modified.** `components/GithubGraph3D.tsx` only (`GithubContributions.tsx` did not need changes).

**Changes implemented.**

| # | Change | Why |
|---|---|---|
| 1 | `useAnimationBudget(containerRef, { rootMargin: "200px 0px" })` on the graph container; `<Canvas frameloop={shouldAnimate ? "always" : "demand"}>` | Continuous rendering only while the graph is near the viewport, the tab is visible and motion is allowed. Otherwise frames are rendered on demand and not at all off-screen. The 200 px margin wakes the loop just before the graph scrolls in. |
| 2 | On-demand wake-ups: `invalidate()` on pointer down/move/up, on the snap-back timer, on hover in/out, when the graph becomes active and when new year data arrives; `useFrame` keeps invalidating only while something still moves | Preserves hover, drag and snap-back in on-demand mode (reduced motion) |
| 3 | `MAX_FRAME_DELTA = 0.1 s` clamp in both `useFrame` callbacks | After a pause R3F reports the whole gap as one frame delta; without the clamp every `1 − e^(−k·Δt)` spring would snap to its target |
| 4 | Per-instance matrix rewrite only when the pose actually changes (removed the `|| amt < 1` that forced all 365 instances to update every frame); the idle wave amplitude is `0` under reduced motion | Avoids uploading unchanged instance matrices when settled |
| 5 | Entrance timeline armed on data arrival but **started on the first frame rendered while on screen** | Previously the stagger played out at page load while the section was ~10,000 px below the fold, so it was never seen. Re-entering the section does **not** replay it (same as before). |
| 6 | Adaptive contact shadows: `ContactShadows frames={settled ? 1 : Infinity}` where *settled* = cubes at rest (idle wave excluded) **and** group rotation at rest (not dragging, snap-back done) | Shadows re-render only while something moves; once at rest one final frame is captured and held. Rotation is part of the condition because drei's blur pass is only correct when the group is unrotated (see regression below). |
| 7 | `DelayedSnapControls` uses primitive `useThree` selectors (`size.width`, `size.height`, `viewport.width`, `gl`, `invalidate`) instead of the whole store | The canvas `size` object changes whenever its page offset changes (react-use-measure tracks scroll); the component re-rendered and re-bound its window listeners after scroll gestures |
| 8 | Removed the dead `isInView` prop and its never-executed reset branch | It would have replayed the entrance on every scroll-back if it had ever been wired |

Unchanged on purpose: the idle wave (still animates every frame while visible), DPR (`[1,2]`), antialiasing, lighting, the Environment HDR, the dead directional-light shadow config (it has no runtime cost because `<Canvas shadows>` is off).

**Regression found and fixed during verification.** The first build froze the contact shadow on a frame captured while the group was still rotated after a drag (cube colours had settled before the snap-back finished). drei renders its blur pass with the shadow camera's world transform, so a capture inside a rotated group is corrupt, and the graph showed a dark blob instead of the soft strip after snapping back. The baseline shows the same corrupt frames *during* a drag but hides them by re-rendering every frame. Fix: rotation/drag state is part of the "settled" condition (change 6). Re-verified: correct strip after snap-back and after the year toggle.

**Behaviour verification — R3F loop activity (rAF callbacks of the R3F loop, desktop):**

| Condition | Baseline | Step 2 |
|---|---|---|
| Hero, graph far off-screen (3 s) | 155 | **0** |
| Graph on screen (3 s) | 115 | 116 (unchanged — the wave still animates) |
| Tab hidden (2 s, simulated `visibilitychange`) | 99 | **0** |
| Tab visible again (2 s) | 97 | 102 (resumes) |
| Reduced motion (emulated), idle | 112 / 2 s | settles, then **0** (19–68 tail frames while settling) |
| Reduced motion, hovering cubes | 39 | 38–40 (on-demand frames) |
| Motion preference restored (2 s) | 96 | 103 |
| Scrolled back to hero (3 s) | 164 | **0** |

**Functional checks (Step 2 build):** hover tooltip ✅ ("10 contributions on July 16th."), drag rotation ✅, snap-back ✅, year toggle 2026 → 2025 ✅ ("3,812 contributions in 2025", new data with staggered entrance), no uncaught exceptions ✅. Console: only the 2 pre-existing three.js warnings (`THREE.Clock` deprecation, D3D shader precision note) — identical to baseline.

**Visual checks.** Side-by-side screenshots (settled, hover, mid-drag, after snap-back, year 2025, reduced motion) on baseline and candidate: same cube colours, depth, month labels, wave, contact-shadow strip and drag behaviour. A ~3 % size difference seen in one pair of screenshots was traced with a numeric test (projected positions of the DOM month labels, 2 runs per build, before and after a forced resize) to a **pre-existing** bug present identically in both builds — see "Remaining problems".

**Performance — idle per section (desktop, no input; 4–5 s windows):**

| Position | Baseline fps | Step 2 fps (2 runs) | Comment |
|---|---|---|---|
| hero | 45.2 | 44.7 / 50.7 | A-B-A at hero: baseline 50.0 / 52.5 / 50.3 → candidate 49.9 / 57.1 / 59.7 |
| about (intro) | 79.2 | 84.2 / 95.9 | |
| about (education) | 81.2 | 90.5 / 87.3 | |
| stack (Expertise) | 49.5 | 41.4 / 53.0 | noisy; Expertise is addressed in Step 4 |
| projects | 38.0 | 45.8 / 45.4 | |
| github (graph visible) | 37.3 | 36.3 / 37.2 | unchanged by design (graph still animates) |
| credentials | 48.1 | 50.5 / 49.8 | |
| journey | 56.6 | 69.4 / 63.7 | |
| contact | 74.8 | 101.1 / 93.7 | |

R3F JS cost away from the graph: **0.45–0.81 ms/frame → 0** (loop not scheduled).

**GPU-process CPU — investigated, not a regression.** At the hero/projects positions the candidate showed higher GPU-process CPU (~140 % vs ~114–120 %). An A-B-A test on the *baseline* reproduces it exactly: pausing R3F there raises fps 50 → 60 *and* GPU-process CPU 110 → 146 %; pausing DinoRunner on the candidate barely changes it. Normalised per frame the GPU-process cost is unchanged (≈ 22–25 ms of GPU-process CPU per frame in both builds). Off-screen R3F work had been throttling the page's frame rate; with it gone Chrome produces more frames per second, each still carrying the remaining per-frame work (CSS animations, DinoRunner, framer per-frame layout) that Steps 3–4 target.

**Lint.** `GithubGraph3D.tsx` 44 errors / 7 warnings → **34 / 4**, zero new messages (the remaining ones are pre-existing React-Compiler rules on the typed-array physics state).

**Remaining problems found in this step (not caused by it, out of Phase 1 scope):**
- **Undersized graph canvas until the next resize** (pre-existing, both builds): R3F measures its container while the section's reveal animation is still scaled down (`ScrollReveal` scale 0.95 / `GithubContributions` motion wrapper), so the drawing buffer is 1214×549 instead of 1278×598 until a later scroll/resize re-measures it. Belongs with FIX-11/FIX-12 (reveal-transform cleanup).
- One non-reproducible 1,056 ms long animation frame appeared in one candidate run (not in the re-run); consistent with the pre-existing late `html-to-image` `FileReader` work from the audit (FIX-05).

---

## Step 3 — FIX-03 DinoRunner lifecycle ✅ VERIFIED

**Original behaviour.** The full-hero 2D canvas was cleared and redrawn on every animation frame for the whole session — while the hero was scrolled away, with the tab hidden (in this harness) and under reduced motion. It drew at whatever rate the display offered (up to 120+ fps on high-refresh screens) and sized its backing store at the full device pixel ratio (1170×2532 = 2.96 MP on a DPR-3 phone). The audit's ablation attributed ~45 GPU-process percentage points to it even when off-screen.

**Files modified.** `components/DinoRunner.tsx` only.

**Changes implemented.**

| # | Change | Why |
|---|---|---|
| 1 | `useAnimationBudget(canvasRef)` + a small lifecycle effect that calls `start()` / `stop()` / `drawStatic()` on a loop controller exposed by the setup effect | The game runs only while the hero canvas is on screen and the tab is visible |
| 2 | `frame()` is now a pure update-and-draw step; a separate `loop` owns `requestAnimationFrame`. `start()` resets the frame-time origin (`prev = 0`) | Resumes with `dt = 1` instead of one large catch-up step — no jump when scrolling back |
| 3 | Frame cap: frames closer than `MIN_FRAME_MS = 1000/60 × 0.8 ≈ 13.3 ms` are skipped | All game motion is `dt`-scaled (verified line by line: jumps, bullets, casings, particles, birds, obstacles, clouds; the run cycle uses absolute time), so 120/144 Hz displays now render exactly what a 60 Hz display already showed, at half the canvas work. 60 Hz displays never skip (jitter headroom). |
| 4 | `MAX_DPR = 2` for the canvas backing store + `image-rendering: pixelated` on the canvas | Phones at DPR 3 draw 780×1688 instead of 1170×2532 (−56 % pixels). The pixelated upscale keeps pixel-art edges hard; on DPR ≤ 2 screens the canvas maps 1:1 and the style has no effect. |
| 5 | Reduced motion: `drawStatic()` paints one frame instead of looping; repainted when sprites finish loading and after a resize (which clears the canvas) | Keeps the scene visible without motion |

Unchanged: game logic, sprites and their load-time processing, weapons, spawn rules, palette, drawing code.

**Regression found and fixed during verification.** With only the DPR cap, the native-resolution crop on a DPR-3 phone showed slightly softened sprite edges (bilinear 1.5× upscale). Added `image-rendering: pixelated`; re-captured: edges as hard as the baseline.

**Behaviour verification — frames actually drawn** (full-canvas `clearRect` calls on the hero canvas, counted in the browser):

| Condition | Baseline | Step 3 |
|---|---|---|
| Hero visible, desktop (draws/s) | 51.3 | 50.3 – 53.3 (main-thread-limited, below the cap) |
| Hero scrolled away (3 s) | 157 | **0** |
| Back on hero (2 s) | 107 | 105 – 115 (resumes, game continues mid-action) |
| Tab hidden (2 s) | 102 | **0** |
| Tab visible again (2 s) | 107 | 104 – 107 |
| Reduced motion (2 s) | 130 | **0** — static scene painted (non-blank canvas verified) |
| Motion restored (2 s) | 104 | 107 – 112 |
| Mobile DPR 3 backing store | 1170×2532 | **780×1688** |
| Mobile hero: Dino draws/s vs page rAF rate | 67 / 70 | 53 – 57 / 79 – 109 (cap engaged; the rest of the page gets more frames) |

**Visual checks.** Desktop hero (normal, after scroll-back, reduced motion) and mobile hero screenshots on both builds: same dino skin, pet, cacti, clouds, enemies, bullets/particles and ground line. Native-resolution DPR-3 crops: pixel edges identical in hardness to baseline after the `pixelated` fix.

**Console.** No exceptions; only the 2 pre-existing three.js warnings.

**Lint.** `DinoRunner.tsx` 10 errors / 5 warnings before and after — **no new findings** (all pre-existing `prefer-const` / unused vars).

**Performance — idle, desktop, cumulative (Steps 2 + 3) vs baseline.** ⚠️ *Measured on 2026-11-03 after a machine reboot, with only ~0.6–1.5 GB of 7.7 GB RAM free and other applications using CPU (Antigravity IDE ≈ 1.5 GB / up to ~65 % CPU, cloudcode_cli ≈ 0.7 GB, ChatGPT). Absolute fps are therefore about half of the Step 2 session's; runs were interleaved A-B-A-B so both builds saw the same conditions.*

| Section | Baseline fps (A / B) | Candidate fps (A / B) | Script ms per 5 s (base → cand) |
|---|---|---|---|
| hero | 30.8 / 24.3 | 32.8 / 29.6 | 758 / 653 → 563 / 554 |
| about | 46.7 / 42.8 | 56.1 / 46.9 | 766 / 863 → 605 / 601 |
| stack | 23.2 / 21.6 | 29.0 / 25.1 | 547 / 596 → 300 / 316 |
| github | 16.0 / 22.9 | 25.1 / 27.1 | 397 / 481 → 433 / 538 |

The candidate is faster in all 8 paired windows. Step 3's own share is isolated by the deterministic counts above (no Dino work off-screen / hidden / reduced motion) and by the audit's A-B-A ablation (pausing DinoRunner while off-screen: GPU-process 130 % → 84.5 % at the GitHub section).

**Remaining problems.** The load-time pixel processing of the sprite strips (`getImageData` loops, 281 + 72 ms on desktop) is unchanged — that is FIX-16 (pre-processed sprites).

---

## Step 4 — FIX-04 Expertise animation lifecycle ✅ VERIFIED

**Original behaviour.** The 24 skill-cell icons contained **37 `repeat: Infinity` framer-motion loops**. 25 of them always animated — mostly SVG geometry attributes (`cx`, `cy`, `r`) and transforms on SVG elements, which framer drives in JavaScript (not WAAPI) and which dirty layout every frame. The other 12 were hover-gated but, when not hovered, still ran a repeating no-op transition to their rest value. The section's IntersectionObserver toggled a `.expertise-paused` class that paused **only CSS** animations, so the framer loops ran for the whole session at every scroll position — the audit's ablation tied them to a **page-wide layout on every frame** (pausing framer cut layouts ~220 → ~33 per 4 s at the hero). The section's reduced-motion CSS set `animation: none; transform: none !important` on every descendant (only while paused, i.e. off-screen), which would override SVG `transform` attributes and break the artwork if it ever applied on screen.

**Files modified.** `components/Expertise.tsx` only. The file's pre-existing uncommitted edits (responsive padding/typography/grid classes) were preserved, and so was its CRLF line-ending format (the edit was applied by a count-checked script that matched every pattern exactly once on an LF-normalised copy and wrote CRLF back; the first attempt aborted without writing anything when it detected the line endings).

**Changes implemented.**

| # | Change | Why |
|---|---|---|
| 1 | Section-level `useAnimationBudget(sectionRef, { rootMargin: "200px" })` replaces the hand-written IntersectionObserver | One signal for visibility, tab visibility and reduced motion |
| 2 | `.expertise-paused` is now bound declaratively from `!shouldAnimate` | CSS animations pause off-screen (as before) **and** when the tab is hidden or reduced motion is on |
| 3 | `IconMotionContext` + `useIconLoop()` helper; all 37 loops converted from `animate={…} transition={…}` to `{...loop(keyframes, transition, options)}` | Loops run only while the section is animating; otherwise each value rests at its first keyframe (snaps instantly while paused) |
| 4 | Hover-gated loops use `{ enabled: isActive }` | While hovered they loop exactly as before; when the hover ends they ease back to rest **once** instead of repeating a no-op loop forever |
| 5 | `rotate: 360` / `rotateY: 360` loops became explicit `[0, 360]` keyframes (Next.js orbit, Three.js/R3F tetrahedron, AI-Workflows gear) | A loop paused at 360° would otherwise never spin again after resuming (framer starts from the current value) |
| 6 | GLSL hover drift keeps an explicit rest pose `{ x: 0, y: 0 }`; the "Three.js" icon (which spins in both hover states) is treated as always-on | Preserves the original rest positions and behaviour |
| 7 | Section header status dot gated by `shouldAnimate` | It was one of the two remaining WAAPI loops running off-screen |
| 8 | Removed the reduced-motion `animation: none; transform: none !important` rule (replaced by a comment) | The paused state now covers reduced motion and freezes animations at their first keyframe; `transform: none` would have broken SVG geometry and the blurred circles' keyframed opacity |

Unchanged: every icon's artwork, geometry, colours, durations, easings and delays; hover effects; cell layout and CSS animations; the pre-existing responsive edits.

**Behaviour verification** (attribute/style mutations inside `#stack` = JS-driven animation activity; CSS animation play states via `getAnimations()`):

| Condition | Baseline | Step 4 |
|---|---|---|
| Hero (section off-screen) — mutations / 2 s | 3,717 | **0** |
| Hero — layouts / 3 s (layout time) | 107 (153 ms) · 122 (111 ms) | **20 (15 ms) · 30 (28 ms)** |
| Hero — frames / 3 s | 111 · 101 | **158 · 204** |
| Section on screen — mutations / 2 s · CSS running | 3,186 · 94 | 3,481 · 94 (icons animate as before) |
| Hovering a cell — mutations / 2 s | 3,867 | 3,366 (hover loops run) |
| Tab hidden — mutations / 2 s · CSS | 3,240 · running | **0 · paused** |
| Tab visible again | 3,900 | 2,087 (resumes) |
| Reduced motion — mutations / 2 s · CSS | 4,920 · running | **0 · paused** |
| Motion restored | 3,780 | 2,316 (resumes) |

**Visual checks.** Section screenshots on both builds: identical icons, cells, typography and layout (only the animation phase differs, e.g. ring rotation angles). Reduced motion: every icon intact — OpenAI petals, AI-Agents ring, RAG grid, AI-Workflows diagram keep their SVG transforms; blurred background circles stay faint. Hover: cell lifts, title turns orange, progress line fills, hover loops run.

**Console.** No exceptions; only the pre-existing three.js warnings. **Build:** pass (TypeScript included). **Lint:** `Expertise.tsx` 0 errors / 1 warning before and after (pre-existing `no-img-element`) — no new findings.

**Performance — idle, desktop, cumulative (Steps 2 + 3 + 4) vs baseline**, interleaved A-B-A-B on 2026-11-03 (free RAM ≈ 1.35 GB, CPU 15–23 % background):

| Section | Baseline fps (A / B) | Phase 1 fps (A / B) | Layouts per 5 s (base → P1) | Script ms per 5 s (base → P1) |
|---|---|---|---|---|
| hero | 38.2 / 45.8 | **68.9 / 73.4** | 194 / 233 → **52 / 49** | 683 / 636 → 321 / 324 |
| about | 74.3 / 75.4 | 114.3 / 76.6 | 373 / 380 → 49 / 44 | 741 / 762 → 306 / 315 |
| stack (Expertise on screen) | 37.6 / 35.9 · 33.6 / 27.1 / 25.5 | 47.1 / 27.1 · 45.7 / 36.5 / 30.2 | ≈ 1 per frame in both (the section animates by design) | ≈ 510–570 → ≈ 300–335 |
| projects | 40.3 / 34.5 | 47.7 / 34.7 | 203 / 177 → 48 / 44 | 372 / 309 → 55 / 68 |
| github | 35.5 / 36.4 | 58.4 / 38.3 | 179 / 184 → 54 / 49 | 432 / 442 → 325 / 195 |
| contact | 62.1 / 69.7 | **144 / 111** | 315 / 352 → 47 / 45 | 641 / 634 → 179 / 211 |

At the stack section the candidate was faster in 4 of 5 interleaved pairs; the one slower window (27.1 vs 35.9) coincided with a background CPU spike and did not reproduce in three further pairs.

---

## Phase 1 — whole-page regression pass (final build vs baseline)

| Check | Baseline | Phase 1 | Verdict |
|---|---|---|---|
| Cold load ×2: exceptions / console warnings | 0 / 2 | 0 / 2 (same pre-existing three.js warnings) | ✅ no new errors |
| Cold load: requests | 129 | 129 | ✅ identical |
| Cold load: long tasks | 14 / 13 | **10 / 10** | improved |
| Cold load: intro overlay gone | 7,179 / 5,386 ms | **4,886 / 4,856 ms** | improved (less competing work) |
| Cold load: TBT | 2,260 / 1,518 ms | 1,725 / 1,693 ms | unchanged within noise (dominated by the full-page mount, html-to-image capture and first R3F compile — later fixes) |
| Cold load: CLS | 0.79 | 0.79 | unchanged (font-swap race — FIX-15) |
| Wheel scroll 14 s ×2: fps | 26.5 / 29.3 | **35.8 / 36.8** | improved |
| Wheel scroll: median / p95 frame | 34.8 / 62.4 · 34.5 / 55.8 ms | **27.6 / 48.6 · 27.6 / 48.7 ms** | improved |
| Wheel scroll: frames > 50 ms | 42 / 34 | **22 / 22** | improved |
| Wheel scroll: script time | 2,066 / 2,112 ms | **1,399 / 1,513 ms** | improved |
| Interactions ×3 (median) — nav click | 112 ms | **80 ms** | improved |
| — GitHub year toggle | 144 ms | **96 ms** | improved |
| — typing (worst key) | 144 ms | **120 ms** | improved |
| — wheel unfocus | 88 ms | 72 ms | improved |
| — Credentials hover (frame p95) | 111 ms | 83 ms | improved |
| — Expertise hover (frame p95) | 63 ms | 63 ms | unchanged |
| — HIRE ME open / Escape close | 440 / 432 ms | 440 / 440 ms | unchanged (whole-page re-render + forced layouts — PERF-01, Phase 2) |
| — wheel card focus | 240 ms (224 – 1,744) | 296 ms (168 – 336) | no significant change (overlapping ranges; wheel code untouched) |
| All interactions functional (nav target reached, modal opens/closes, hover, wheel focus/unfocus, year toggle, typing) | ✅ | ✅ | ✅ |

---

## Phase 1 — Final status ✅ COMPLETE

### Summary of modifications
1. **`lib/useAnimationBudget.ts` (new)** — shared lifecycle signals (element visibility, tab visibility, reduced motion) with `shouldRender` / `shouldAnimate`.
2. **`components/GithubGraph3D.tsx`** — render loop continuous only while visible with motion allowed, on-demand otherwise; no off-screen rendering; per-instance matrix writes only on change; entrance starts when first visible; adaptive contact shadows (re-rendered only while something moves; captured once at rest, including the drag/snap-back state); delta clamp; primitive `useThree` selectors.
3. **`components/DinoRunner.tsx`** — loop runs only while the hero is visible and the tab is foregrounded; ≈60 fps draw ceiling (dt-scaled motion unchanged); backing-store DPR capped at 2 with pixelated upscaling; static scene under reduced motion.
4. **`components/Expertise.tsx`** — all 37 icon loops and the CSS animations gated by one section-level budget; hover loops ease back to rest once; resumable rotation keyframes; reduced-motion CSS fixed.

### Files changed
| File | Status | Lines |
|---|---|---|
| `lib/useAnimationBudget.ts` | new | +133 |
| `components/GithubGraph3D.tsx` | modified (was unmodified before Phase 1) | +196 / −95 |
| `components/DinoRunner.tsx` | modified (was unmodified before Phase 1) | +80 / −5 |
| `components/Expertise.tsx` | modified (had pre-existing uncommitted edits — preserved) | +99 / −69 relative to its pre-Phase-1 state (helper, section hook, provider, 37 converted call sites, CSS rule) |
| `docs/reports/PORTFOLIO_REMEDIATION_LOG.md` | new | this log |

### Git preservation (verified at the end of Phase 1)
- Branch `main`, HEAD `cd1d9a3` unchanged; nothing staged; no stash; no commit, push or deployment.
- The 8 pre-existing modified files not touched in this phase (`app/globals.css`, `app/page.tsx`, `About.tsx`, `BackgroundTypography.tsx`, `Credentials.tsx`, `HireMeModal.tsx`, `ui/AnimatedHeroHeading.tsx`, `ui/ProjectWheel3D.tsx`) and `GithubContributions.tsx` are **byte-identical** to their state at the start of Phase 1.
- `Expertise.tsx`: all pre-existing uncommitted edits present; CRLF line endings preserved.
- No dependency was added or changed (`package.json` / lockfile untouched).

### Build & test results
- Production build (`next build --webpack`, incl. TypeScript): ✅ after every step.
- ESLint on touched files: **no new findings**; `GithubGraph3D.tsx` improved from 44/7 to 34/4, others unchanged (`DinoRunner` 10/5, `Expertise` 0/1, hook 0/0).
- Behaviour checks in the browser for every component and condition (on screen, off screen, tab hidden, reduced motion, interactions): ✅.
- No automated test suite exists in the project (none was added).

### Remaining issues (out of Phase 1 scope or discovered during it)
| Issue | Where it belongs |
|---|---|
| Modal open/close INP ≈ 440 ms (whole-page re-render + forced layouts) | PERF-01 / FIX-05–06 |
| Remaining per-frame work at idle: CSS loops (ticker, pings, glow spin), GSAP hero title, wheel rotation, ~1 style recalc per frame | FIX-10, FIX-14 |
| GitHub canvas measured while its reveal animation is still scaled (draws at 1214×549 until the next resize) | FIX-11 / FIX-12 |
| Load-time work: full-page mount, html-to-image capture, first R3F frame, sprite pixel processing; CLS font race | FIX-05, FIX-08, FIX-15, FIX-16 |
| GPU-process CPU per second rises where fps rises (per-frame cost unchanged) — will fall as per-frame work is removed | FIX-13, FIX-14 |

### Measurement caveats
- All numbers are lab measurements on one laptop (Chrome 156 headless, Intel UHD iGPU); no real-device or field data.
- Step 2 was measured on 2026-11-02; Steps 3–4 and the regression pass on 2026-11-03 after a reboot, with less free memory and more background CPU. Every comparison was made back-to-back against the unchanged baseline build under the same conditions; absolute values differ between days and should not be compared across sessions.

> **STOP — Phase 1 complete. Phase 2 will not begin without explicit authorization.**

---

## Phase 2 — Investigation & implementation plan (FIX-05, FIX-06) ⏸ AWAITING AUTHORIZATION

> **Date:** 2026-11-04 · **Mode:** investigation only — **no source file was modified**. All experiments ran against an isolated production build in the scratchpad, using runtime instrumentation injected through the DevTools protocol.

### P2.0 Scope, repository state, method

**Specs (audit, verbatim intent).**
- **FIX-05 (PERF-02):** remove the mount-time pre-capture and the permanent hidden copy; capture on intent; mount the iframe only when open. Acceptance: no html-to-image fetches, no PDF request and no FileReader long tasks at load; the modal looks identical.
- **FIX-06 (PERF-01, depends on FIX-05):** move the modal state out of `Home`; precompute the scrollbar width; batch the body writes; single Escape handler. Acceptance: open and close INP < 200 ms at 1×, and a large reduction at 4×.

**Repository state.**

| Check | Result |
|---|---|
| HEAD | `cd1d9a3` (unchanged); nothing staged |
| Working tree | Same 11 modified + 2 untracked entries as at the end of Phase 1 |
| Source files vs the end-of-Phase-1 snapshot | 12/12 byte-identical (Phase 1 work and user edits intact) |
| User edits in Phase 2 target files | `HireMeModal.tsx`: root className (`max-h-[95svh]`, responsive radius and padding), to be preserved. `page.tsx`: several edits, including the uncommitted Escape effect (lines 369–379), which FIX-06 would touch minimally. |
| Baseline build | `build-cand` (Phase 1 final). Its sources are byte-identical to the working tree (47/47 files), so it is the Phase 2 baseline. |

**Instruments** (scratchpad, all new; none touch the repo):

| Script | What it measures |
|---|---|
| `modal.mjs` | Event Timing split (input/processing/presentation) per interaction, plus:<br>• a DevTools-hook shim timestamping React commits and post-commit effects and counting re-rendered components;<br>• timed wrappers on forced reads (`getBoundingClientRect`, `clientWidth`), canvas resizes, `texImage2D` and `drawImage`;<br>• a timeline of the Genie target and canvas;<br>• counters for the modal effect's side effects. |
| `modal-trace.mjs` | Chrome trace of one open and one close: self-time per thread and event, style-recalc element counts, layout dirty/total objects, JS time by chunk. |
| `modal-isolate.mjs` | Each side effect of the open path applied alone, then style and layout forced; traced element counts. |
| `modal-emu.mjs` | In-browser projections of candidate fixes on the unchanged build. |
| `capture.mjs`, `capture2.mjs` | html-to-image cost and pixel fidelity, using a separately injected copy with its own cold cache. |
| `modal-diag.mjs`, `a11y-check.mjs` | Hit tests, wheel and scroll behaviour, keyboard/AX exposure. |

**Environment caveat.** The machine was heavily loaded:
- memreduct periodically trims working sets;
- commit charge was 14.4/22.8 GB;
- background CPU was 25–59% with no Chrome running;
- multi-second system stalls occurred.

Load runs were about 4× slower than the same build on 2026-11-03. Absolute numbers drift between batches (two interleaved baselines: open 512 vs 624 ms). **Every comparison must be interleaved and repeated.** Capture timings are reported as ranges only.

### P2.1 Reproducible baseline (Phase 1 final build)

| Profile | Open INP median (range) | in / proc / pres | Close (Esc) INP median (range) | Modal fully visible after click | Samples |
|---|---|---|---|---|---|
| Desktop 1440×900, 1× | **512 ms** (408–752) | 13 / 329 / 129 | **504 ms** (432–592) | 916 ms (838–1,051) | 12 + 12 (3 loads) |
| Desktop, 4× CPU | **8,056 ms** (7,896–8,424) | 91 / 6,868 / 634 | **8,608 ms** (8,328–9,632) | 8,282 ms | 4 + 4 |
| Desktop, DPR 2, 1× | 656 ms (624–984) | 20 / 413 / 242 | 688 ms (568–808) | 1,138 ms | 3 + 3 |
| Mobile 390×844 DPR 3 (menu → HIRE ME), 1× | 288 ms (240–304) | 79 / 107 / 82 | 224 ms (✕ tap 192) | 745 ms | 3 + 3 |
| Mobile, 4× CPU | 1,184–1,456 ms | — | 1,016–1,392 ms | 1,645 ms | 2 + 2 |

**Also measured:**
- **Typing in the modal:** 64–128 ms per key event; the first keys reach 272 ms.
- **Backdrop blur:** negligible. Steady fps with the modal open was 45 with all `backdrop-filter`/`filter` in the dialog enabled, and 45.6 with them disabled.
- **Correctness:** 0 exceptions; open and close succeeded in every cycle.

### P2.2 Where the time goes — desktop 1× (medians, instrumented)

| # | Open path step | Time | Evidence |
|---|---|---|---|
| 1 | Input delay | 13 ms | Event Timing |
| 2 | **`Home` re-render and commit**: 731 function components and 3,067 host fibers re-render, out of 4,570 fibers | **78 ms** | Commit hook. Isolated `Home` render: 58–157 ms, 767 components |
| 3 | Modal effect: `clientWidth` read, forcing style for the React commit (24 elements) | 17 ms | Probe and trace |
| 4 | Modal effect: body `overflow`/`padding-right` and HIRE ME `margin-right` writes | 3–11 ms | Isolated; layout 69 of 3,992 objects dirty |
| 5 | Genie `show()`: canvas `width`/`height` set to the viewport. WebGL buffer re-allocation is a synchronous GPU wait (`WaitForGetOffset`). | **48 ms** (44–70) | Probe and trace |
| 6 | **Genie reads the target rect, forcing a style recalc of 2,213 elements.** Cause: the `has-custom-cursor` class removed from `<html>` changes `body`'s inherited `cursor` (`none` → `auto`), so every descendant is restyled. | **157 ms** (114–213) | Probe; trace (`UpdateLayoutTree` elementCount 2,213; Layout only 3 ms) |
| 7 | Texture upload, snapshot copy, origin rect (capture already cached) | < 3 ms | Probe |
| 8 | Presentation: frame plus GPU, with the GPU process at 137–153% CPU from the page's continuous animations | 129 ms | Event Timing, trace |
| = | **INP 512 ms** → 480 ms warp → modal visible at ~916 ms → **Genie `release()` (canvas → 1×1) stalls the main thread for ~69 ms right at reveal** (168 ms at DPR 2) | | Timeline, probe |

**Close (Esc), the same structure:** `Home` render 69 ms, cursor-class restyle 167 ms, canvas up 59 ms, presentation 175 ms, giving **INP 504 ms**. The release stall is 57 ms.

**Mobile:** the cursor rules live inside `@media (pointer: fine)`, so the forced style there is only 1–2 ms. The remaining mobile cost is the `Home` render (~47 ms) plus Genie's canvas work.

### P2.3 Isolation (each side effect alone, 1×, medians of 5, traced element counts)

| Side effect | Cost | Style elements |
|---|---|---|
| `has-custom-cursor` toggle on `<html>` | **137–209 ms** | **2,216** |
| `body` `cursor` changed with `!important` inline (mechanism check) | 134–152 ms | 1,964 |
| Dummy class on `<html>` (control) | 0.2 ms | 0 |
| Native cursor scoped to the dialog (attribute + 2 cursor elements hidden) | 5–18 ms | 60 |
| `body` overflow / padding / HIRE ME margin (all three) | 3–11 ms | 2–4 |
| Same with `scrollbar-gutter: stable` instead of padding compensation | 2–8 ms | 5 |
| Genie canvas 1×1 ↔ viewport | 59–93 ms each way | 4 (GPU wait, not style) |
| `Home` re-render (mobile-menu toggle as a proxy) | 58–157 ms | 24 |

### P2.4 Projections (fixes emulated in the unchanged build, interleaved, 1× desktop, n = 6 each)

| Variant | Open INP | Close INP | Modal visible |
|---|---|---|---|
| Baseline (same batch) | 624 ms (560–952) | 552 ms (408–896) | 1,038 ms |
| Cursor cascade removed (`body{cursor:none!important}` injected) | **320 ms** (280–440) | **392 ms** (304–448) | 744 ms |
| … plus Genie canvas re-allocation removed (release blocked) | 208 ms (176–304) | 232 ms (224–280) | 596 ms |
| 4× CPU: baseline → cursor removed | 4,264–5,592 → **1,696–1,912 ms** | 3,096–4,672 → 2,768–4,344 ms | — |

The `Home` re-render (step 2) isn't included in these projections and comes off on top.

### P2.5 Audit hypotheses checked

| Audit claim (PERF-01) | Verdict | Evidence |
|---|---|---|
| Opening re-renders all of `Home` | ✅ Confirmed | 731 components, 78 ms at 1× and ~1.3 s at 4× |
| Body padding/overflow changes cause a full-page relayout ("5,845 ms forced layout") | ❌ **Refuted as the main cost** | Layout is 3–16 ms. The "forced layout" in LoAF is a **style recalc caused by the cursor class**, which the audit did not identify. |
| Genie reads rects synchronously | ✅ But it is only where the recalc lands | Removing the cursor cascade cuts that read from 157 ms to 29 ms |
| Escape is handled twice | ⚠️ Exists but costs nothing | `document` (page.tsx) and `window` (modal) listeners; still only one `Home` commit per Escape. Kept as hygiene. |
| Inline `onClose` re-runs the effect on every `Home` render | ⚠️ True in code, latent in practice | No unrelated `Home` renders while closed: scroll-spy test produced 0 extra effect runs |
| — (new) Genie canvas re-allocation | 🆕 | 48–70 ms on open, plus a 57–87 ms stall at reveal; library-internal |

### P2.6 FIX-05 evidence (pre-capture and iframe)

**Pre-capture at load.**
- The mount-time pre-capture issues **84 `fetch` requests (~1.0 MB) between 1.4 and 3.3 s of load, during the intro** (clean run 2026-11-03; `preloaderGone` at 4.9 s).
- It fetches **every format** of every Fontshare face (ttf + woff + woff2, 27 files), 17 Google woff2 files and 35 local next/font woff2 subsets, and it re-fetches 4 cross-origin stylesheets.

**Capture cost.**

| Variant | Time | Main-thread long tasks |
|---|---|---|
| Today's options, cold | 2.7 s | 1.7 s |
| Warm repeat | 1.1 s | 0.6 s |
| `skipFonts` | 0.6 s | 0 |
| Precomputed font CSS | 0.5 s | 0 |
| Any variant, under memory pressure | 4–7 s | single long tasks |

The embedded font CSS is **1.2 MB, with 36 @font-face rules**.

**Fidelity.**
- `skipFonts` makes the display fonts (Researcher, Syne) fall back to system fonts during the warp, so it is rejected.
- **An embed limited to the faces the modal's text needs (14 of 40; 500 KB) differs from today's capture by 87 px (0.005%). This reproduced in two runs.**

**"Capture on intent" as the only trigger isn't viable.** Even the cheapest capture (~0.5 s) exceeds a typical hover-to-click gap, so the first open would wait for it.

**Snapshot-geometry defect (pre-existing).**
- The hidden copy lays out at **1100×701**, while the real modal is **941×696**. The code comment claims "pixel-for-pixel".
- The warp therefore lands a wrong-aspect image and then swaps to the DOM.
- The cached snapshot is never invalidated, so it goes stale after a resize.

**PDF iframe.** It is requested at 0.5–0.8 s of every page load and keeps **one extra renderer process plus the PDF-viewer extension service worker** alive for the whole session, even if the modal is never opened. The PDF is 174 KB.

### P2.7 Pre-existing defects found (functional and accessibility, not performance; not fixed unless approved)

| ID | Defect | Evidence |
|---|---|---|
| F1 | The scroll lock doesn't work. Lenis keeps scrolling the page behind the open modal; `body{overflow:hidden}` doesn't stop it. | 3 wheel ticks outside the modal: `scrollY` 0 → 1,200 |
| F2 | On short desktop windows, wheeling over the modal scrolls the **page**, and the modal's bottom (SEND INQUIRY, resume) can't be reached. | 1440×600: dialog 694/568 px; dialog `scrollTop` stays 0; page 0 → 720 |
| F3 | Focus isn't moved into the dialog on open, isn't returned to HIRE ME on close (it ends on `BODY`), and isn't trapped. `aria-modal="true"`, but the page behind stays interactive. | Probe |
| F4 | **The hidden capture copy is focusable and exposed to assistive tech while the modal is closed.** It contributes 4 tab stops (✕, 2 inputs, textarea), duplicate textboxes in the AX tree, a "Close modal" button and the heading. | `a11y-check.mjs` |
| F5 | The modal adds `has-custom-cursor` on mount and on close, including on touch devices, where `CustomCursor` deliberately doesn't. | Code |
| F6 | On mobile, the Genie origin is the hidden desktop button (rect 0,0,0,0), so the warp starts from the top-left corner, not the menu item. | `a11y-check.mjs` |
| F7 | Already in the audit (FUNC-02): no real submit button, a simulated submit, and the resume "download" is a `<div>`. | Audit |

### P2.8 Implementation plan (one fix at a time; build and validate after each)

**FIX-05 — Lazy modal capture and content.** File: `components/HireMeModal.tsx` only.

1. **Scheduling.** Remove the "mount + 600 ms" capture. Add one single-flight `ensureSnapshot()`, started by whichever comes first:
   - **idle after the intro:** `load` + ~4 s, then `requestIdleCallback` with a timeout;
   - **intent:** `pointerenter` or `focus` on the HIRE ME button (after FIX-06, also opening the mobile menu);
   - **the click itself.**

   `capture` passed to Genie awaits the in-flight promise instead of starting a second capture (today a too-early click falls back to capturing the real element, iframe included). The cache is invalidated on viewport resize (debounced) and the snapshot is re-captured at idle.

   *This deviates from the audit's "capture on intent" for the reasons in P2.6.*
2. **Cheaper capture, same pixels.** Build `fontEmbedCSS` once and cache it, using only the @font-face rules for families used in the modal whose `unicode-range` covers its text, woff2 source only. Pass it to `toCanvas`. html-to-image then skips its own stylesheet scan and refetches.
3. **Hidden copy.** Mount it only while a capture runs, with `aria-hidden="true"` and `inert`. This fixes F4 and stops a second copy re-rendering on every keystroke.
   - **Option D2:** wrap it so its width resolves like the real modal (941 instead of 1100), making the warp land exactly on the final modal.
4. **PDF iframe.** Render it after the first intent or open (D3), then keep it mounted. The snapshot is unaffected, because it already uses the static "RESUME" placeholder.

**FIX-06 — Open/close path.** Files: `app/page.tsx`, `components/HireMeModal.tsx`, `app/globals.css`, and `components/CustomCursor.tsx` if D1 = A.

1. **State out of `Home`.** A tiny `useSyncExternalStore` store exported from `HireMeModal.tsx` (`openHireMe`/`closeHireMe`/`useHireMeOpen`, with server snapshot `false`).
   - `page.tsx` drops `hireMeOpen`. The desktop button calls `openHireMe()`; the mobile button calls `setMenuOpen(false); openHireMe()`; `<HireMeModal />` takes no props.
   - **Desktop open and close no longer render `Home`.** Mobile still renders it once, for the menu close it already performs.
2. **Cursor (D1).** Stop toggling `has-custom-cursor` on `<html>`.
   - **A (recommended):** a static `data-native-cursor` attribute on the dialog. CSS restores the user-agent cursors inside it (`cursor:auto` on the root, `cursor:revert` on a/button/input/textarea/select/label). `CustomCursor` hides the dot and ring while the pointer is over `[data-native-cursor]`, a 3-line change in its existing `mousemove` handler. Cost at open/close is about 0, and it fixes F5. *Visible change: while the modal is open, the custom cursor stays visible outside the dialog. Today the native cursor is used everywhere while it's open.*
   - **B:** keep exactly today's semantics, but move the toggle out of the interaction. INP improves, but a 137–209 ms restyle (far more at 4×) lands at the reveal, a visible hitch. Not recommended.
3. **Scroll compensation.** Keep the existing mechanism (measured cheap). Remove the forced `clientWidth` read, using a width measured at mount and on resize, and do one batched write. `scrollbar-gutter` is not adopted: no measurable gain, and it adds layout risk.
4. **Escape.** Keep only the modal's handler. Remove the `hireMeOpen` branch from page.tsx's Escape effect; its menu-close behaviour stays.
5. **Stable Genie `config`** via `useMemo`. Genie currently re-runs `set()` on every modal render, including each keystroke.
6. **Not changed:** genie-web internals. The canvas re-allocation remains (D4).

**Not touched:** any other component, dependency, configuration, the visual design or any animation parameter. No new packages.

### P2.9 Risks and regressions

| Risk | Mitigation and check |
|---|---|
| First open before the idle capture is ready waits for the capture (0.5–3 s) | Intent triggers start it early. Test a "click 2 s after load, no hover" case and a keyboard-only case. |
| Snapshot fidelity drifts (woff2-only, subset) | Pixel-diff each candidate snapshot against a reference capture of the same geometry (≤ 0.01%) |
| D2 changes how the warp looks (it becomes accurate) | Explicit approval; mid-warp screenshots before and after |
| D1-A cursor behaviour outside the dialog | Explicit approval. Native-cursor parity *inside* the dialog: compare computed `cursor` per element with today's open state. |
| Lazy iframe: the PDF may pop in after the first reveal | Measure the iframe load relative to the reveal; fall back to idle mounting if visible |
| Store / SSR hydration | `getServerSnapshot` → `false`; check the console for hydration warnings |
| Scroll compensation with a cached width goes stale after zoom | Re-measure on resize; compare fixed-element rects (nav, HIRE ME, docks) before and after open |
| Genie promise chain under rapid toggling | 10× rapid open/close, then the final state must be consistent |
| Mobile menu path | Menu closes, modal opens, ✕ closes |
| Edits to the user's uncommitted code in `page.tsx` (Escape effect) and `globals.css` | Minimal diffs, each shown in the log; pre-existing user changes verified byte-for-byte outside the touched lines |

### P2.10 Expected measurable improvements (this machine; to be confirmed by interleaved A/B)

| Metric | Baseline | Expected after FIX-05 | Expected after FIX-06 |
|---|---|---|---|
| Fetches during the intro (capture) | 84 (~1.0 MB, 3 formats + all subsets) | **0 before the intro ends**; ≤ 14 woff2 HTTP-cache reads later | — |
| Capture main-thread work during the intro | 0.2–1.7 s (more under memory pressure) | **0** | — |
| PDF request and viewer process at load | 1 + 1 renderer + extension service worker | **0 until intent** | — |
| Phantom focusable controls while closed | 4 | **0** | — |
| Open INP, desktop 1× | 512–624 ms | ≈ unchanged | **~240–320 ms** |
| Close INP, desktop 1× | 504–552 ms | ≈ unchanged | **~300–390 ms** |
| Open INP, desktop 4× | 4.3–8.1 s | — | **~1.0–1.9 s** |
| Modal fully visible after click (1×) | 916–1,038 ms | — | ~650–750 ms |
| Mobile 1× open / close | 288 / 224 ms | — | ~240 / ~180 ms (projected) |

**The audit's "< 200 ms at 1×" target is not expected to be met by FIX-06 alone on this machine.** The Genie residual (~110–160 ms: re-allocation on open plus the release stall) remains. The emulation removing it reached 208 / 232 ms. Fixing that needs a change to genie-web itself (D4), which is outside these two fixes.

### P2.11 Validation and visual-regression strategy

- **Builds.**
  - Freeze the current `build-cand` as `build-p2base` (:3123) and rebuild the candidate (:3124) after each fix.
  - `next build --webpack` must pass. ESLint problem count must not rise above the Phase 1 baseline.
  - 0 new exceptions or console errors.
- **Performance, interleaved A-B-A-B under the same conditions:**
  - `modal.mjs`: desktop 1× (3 loads × 4 cycles), 4× (2 × 2), mobile 1× and 4×, DPR 2;
  - `load.mjs` × 3 each;
  - `capture2.mjs` (fidelity);
  - `modal-isolate.mjs` (cursor toggle gone);
  - medians with ranges; stall-affected samples flagged, not dropped silently.
- **Functional checks.**
  - Open: mouse, keyboard Enter/Space on HIRE ME, mobile menu.
  - Close: Esc, ✕ click and tap.
  - 10× rapid toggling.
  - Typing, validation errors, simulated submit and auto-close.
  - Resize while open and while closed; reduced motion (Genie becomes instant); tab hidden.
  - Scroll compensation: no shift of fixed elements.
  - Exactly one Escape handler; `Home` not re-rendered on desktop open/close (commit hook).
  - Focus behaviour unchanged (or improved, if F3 is approved); AX tree has no phantom controls.
- **Visual.** Desktop 1440×900 and mobile 390×844 screenshots — closed, mid-warp (~240 ms), fully open, mid-close — pixel-diffed against the baseline. Snapshot PNGs diffed. Cursor parity inside the dialog via computed styles.
- **Documentation.** Each step logged here: diff, build, measurements, screenshots, remaining issues.

### P2.12 Decisions needed before implementation

| ID | Decision | Recommendation |
|---|---|---|
| D1 | Cursor: **A** scoped native cursor (edits `globals.css` and `CustomCursor.tsx`) or **B** deferred global toggle | **A** |
| D2 | Snapshot geometry: make the hidden copy lay out like the real modal (warp lands exactly) | Yes |
| D3 | PDF iframe: mount on first intent/open, on idle, or replace with a static thumbnail (new asset) | First intent/open |
| D4 | Genie canvas re-allocation residual: leave for now, or a separate fix patching/vendoring genie-web (keeping the canvas costs ~20 MB GPU memory at DPR 1, ~80 MB at DPR 2) | Leave for this phase; separate decision |
| D5 | Pre-existing defects F1–F3, F6: separate follow-up fixes after FIX-06, or leave | Follow-up items, after FIX-06 |
| D6 | Measurement hygiene: pause memreduct and close heavy apps during the A/B runs | Yes |

> **STOP — Phase 2 investigation complete. No implementation will begin without explicit authorization.**

---

## Phase 2 — Step 1 — FIX-05 Lazy modal capture & content ✅ VALIDATED (clean), AWAITING REVIEW

> **Authorized** 2026-11-04 with decisions D1–D6. FIX-05 was implemented first, as instructed. **FIX-06 has not been started**: its patch exists only as a dry run in the scratchpad, and no FIX-06 change touches the repository.

### 1.1 Original behaviour (baseline = Phase 1 final build)

| Behaviour | Detail |
|---|---|
| Pre-capture timing | Starts 600 ms after mount, during the intro |
| Fonts embedded | Every @font-face of every family the modal uses: all unicode subsets and every listed format (ttf + woff + woff2) |
| Capture copy | Permanently mounted, keyboard-focusable and exposed in the accessibility tree |
| PDF iframe | Loads at every page load |
| Snapshot geometry | Captured at 1100 px wide, against a 941 px modal |
| Resize | The snapshot is never refreshed |

### 1.2 Changes — `components/HireMeModal.tsx` only (+294 / −45 lines against the pre-Phase-2 backup; LF line endings preserved)

| # | Change | Purpose |
|---|---|---|
| 1 | Removed the mount-time `toCanvas` pre-capture, `cachedCanvasRef` and `instantCapture` | Nothing is captured during page load or the intro |
| 2 | Single-flight `ensureSnapshot()`, started by whichever comes first: idle after the intro (`load` + 5 s, then `requestIdleCallback`), the first intent (`pointerenter`/`focus` on HIRE ME), or Genie's own capture call | Snapshot ready before the click in the normal case. Concurrent callers share one capture, never a second live capture. |
| 3 | `captureForGenie`: cached snapshot → in-flight capture → (only if capture fails) a live capture as before → 1×1 blank | Genie always receives an image, so the modal can never get stuck closed |
| 4 | `buildFontEmbedCSS` / `getModalFontCSS` (module level, built once): only the faces whose family the modal uses **and** whose `unicode-range` covers its text, woff2 preferred, from the HTTP cache | Same rendering with far less work (14 of 40 faces; woff2 only) |
| 5 | The capture copy renders only while a capture runs, with `aria-hidden="true"` and `inert` | **F4**: no phantom tab stops or accessibility-tree nodes |
| 6 | **D2:** the copy is wrapped in a bare `<div>` standing in for Genie's element, and its wrapper uses the same `right` offset as the real one | Snapshot lays out at the real modal's size |
| 7 | Resize handling: debounced; re-captures at idle; while the modal is open it waits until closed | The snapshot stays matched to the layout and is never re-captured during an interaction |
| 8 | **D3:** the PDF `<iframe>` renders only after the first intent (hover/focus of HIRE ME) or open, then stays mounted | No PDF or viewer process during page load |

Unchanged: the modal markup and design, the Genie config (480 ms, `auto`), `pixelRatio: 1.5`, the capture-mode styling, scroll compensation, Escape handling and the cursor effect (the last three belong to FIX-06). Your edit to the root className is intact (verified).

### 1.3 Build and static checks

| Check | Result |
|---|---|
| `next build --webpack` (isolated copy) | ✅ Compiled; **TypeScript passed** (15.4 s); 4/4 static pages. BUILD_ID `GeLQCaMsygHclduLdogXy`, page chunk `page-22d28840005cc3a9.js` |
| ESLint `HireMeModal.tsx` | 5 errors / 4 warnings, **identical message-for-message to the baseline** (all pre-existing: `any`, prop mutation ×3, setState in effect, 4 unused imports). **0 new.** |
| Files changed by FIX-05 | `components/HireMeModal.tsx` only. All other 127 tracked/untracked files are byte-identical to the Phase 2 start snapshot. |
| Git | HEAD `cd1d9a3`; nothing staged, committed or pushed |

### 1.4 Validation conditions — read before the numbers

**Builds compared**

| Build | Directory | BUILD_ID | Page chunk |
|---|---|---|---|
| Baseline | `build-p2base` (frozen copy of the Phase 1 build) | `vbDoYWNpF9Qzk7ddDjinF` | `page-e9b0affa7d31eb04.js` |
| Candidate | `build-cand` | `GeLQCaMsygHclduLdogXy` | `page-22d28840005cc3a9.js` |

**Browser and device setup**
- Chrome 156.0.8078.80, `--headless=new --disable-extensions`, a fresh profile for every sample.
- Desktop: 1440×900, DPR 1, mouse.
- Mobile: 390×844, DPR 3, touch.
- CPU throttling via `Emulation.setCPUThrottlingRate`: 1× and 4×.
- Baseline and candidate runs always alternated.

| Session | Time (IST) | Machine state | Use |
|---|---|---|---|
| A | 2026-11-04 11:33–11:50 | Mem Reduct not running | Valid, small sample (superseded by C) |
| B | 2026-11-04 18:34–18:56, after an 18:22 reboot | **Mem Reduct auto-restarted (elevated)**; 5,000–16,000 page faults/s, disk 350–885% | **Timing invalid (D6).** Deterministic results only. |
| **C** | **2026-11-04 19:24–20:47** | **Mem Reduct exited (checked and logged as `memreduct=0` before every one of 137 runs)**, heavy apps closed. CPU 25–48%, paging mostly < 3,000/s, disk < 20%, 0.5–1 GB free RAM. | **Valid. All numbers below come from session C unless stated.** |

Session C consisted of:

| Set | Runs |
|---|---|
| R1 first-open, round 1 | 34 |
| R1 first-open, round 2 | 24 |
| Final benchmark | 42 |
| Follow-ups (FCP check, extra mobile 4× pairs) | 15 |
| Reversed-order loads | 8 |
| Long-window loads | 10 |
| Load profiles | 4 |

Every run exited with code 0. Separately, I ran 2 early-click diagnostics, which weren't logged in the batches. Session A and B results are kept and noted where relevant.

### 1.5 Load-window behaviour

**Deterministic outcomes** (session C: 7 load pairs, plus 3 full checks per build):

| Metric | Baseline | Candidate |
|---|---|---|
| html-to-image fetches | **73** (737 KB), from 1.4 s, all **during the intro** | **11** (4 KB; HTTP-cache hits), **all after the intro** |
| Formats / cross-origin stylesheet re-fetches | woff2 + woff + ttf / 4 | woff2 (+ 1 local ttf) / **0** |
| Resume PDF + viewer process at load | Requested in **7 of 7** loads | **0 of 7** |
| Requests in the 12 s window | 117 | **53** |
| Transferred | 11,174 KB | **10,442 KB** (−0.7 MB) |
| JS heap at 12 s | 22 MB | **17 MB** |
| Capture timing | Mount + 600 ms, during the intro | Copy mounted 0.38–0.64 s, **2–5 s after the intro ended** (e.g. 10.18 → 10.56 s with the intro ending at 4.84 s) |

**Load timing.** Three experiments were needed, because the first one conflicted with the others:

| Experiment | FCP (baseline → candidate) | Intro end | Long-task time |
|---|---|---|---|
| `load.mjs`, 12 s window, 7 pairs (baseline first in 3, candidate first in 4) | 1,184 → 1,816 ms | 6,208 → 6,456 ms | 3,807 → 5,821 ms total |
| **`load-long`, 25 s window, 5 pairs, alternating order** | **1,340 → 1,196 ms** | **5,713 → 5,132 ms** | Before intro end 2,328 → 2,690 ms. **After intro end 0 → 1,009 ms** (196–1,463). Total 2,328 → 3,232 ms. |
| V8 profile, first 5 s, 2 pairs | 1,272 / 2,404 → 1,108 / 1,288 ms | — | JS in chunk 766 (html-to-image + genie-web): **2.0–2.2 → 1.2–1.3 s** |

**Interpretation.**
- **FCP and the intro are not regressed.** Their direction flips with run order. The long-window and profiler runs show the candidate equal or slightly earlier, with less JavaScript during load.
- **What did move** is the capture's main-thread work. The baseline performs it during the intro, fragmented into many small fetch/FileReader tasks. The candidate performs it once at idle, 2–5 s after the intro. There it shows up as **0.2–1.5 s of long tasks** (median ~1.0 s). The largest single frame is the one-time font build (`FileReader.onload`, 183–232 ms; 473 ms in one diagnostic run), followed by a few 64–78 ms serialise/rasterise/unmount frames.
- **Net effect:** total long-task time over 25 s is **~0.9 s higher** (median; ranges overlap). This is a known cost of FIX-05 (L1).

### 1.6 Accessibility and hidden-capture behaviour

| Check (session C) | Baseline | Candidate |
|---|---|---|
| Capture copy while closed (2 s / 16 s / after close; desktop × 2, mobile × 1) | Mounted. 4 controls, **4 focusable**, 5 AX nodes | **Not mounted: 0 / 0 / 0** in every check |
| Capture copy *during* a capture (session B) | — | `inert` + `aria-hidden`: 0 focusable, 0 AX nodes |
| Real Tab navigation (closed) | 50 stops, **4 in the invisible copy** | **46 stops, 0 in the copy**, 0 in the hidden modal |
| Keyboard Tab → HIRE ME → Enter → Escape | Opens in 552 ms; closes in 47 ms | Opens in 565 ms; closes in 42 ms. **Keyboard focus counts as intent** (PDF requested). |
| Focus after open / close | Stays on HIRE ME | Same (F3 is a separate follow-up) |

**F4: ✅ met.**

**F5: ❌ not met by FIX-05.** On touch devices, `html.has-custom-cursor` is still added in **both** builds: present at load, removed while open, re-added after close. The cause is `HireMeModal`'s cursor effect, which the approved plan changes in **FIX-06** (D1: the global class toggle is removed). F5 will be verified as an acceptance criterion of FIX-06 unless you want a separate minimal guard in FIX-05 (see 1.13).

### 1.7 Snapshot accuracy (D2) and visual regression

| Check (session C) | Baseline | Candidate |
|---|---|---|
| Snapshot size, desktop (Genie texture) | 1650×1051 for a 941×696 dialog — stretched 1.754 × 1.509 | **1411×1044 = 1.5 × the dialog exactly** (all runs) |
| Font fidelity vs a full-font reference of the same markup | — | Desktop **92 px (0.0062%)** in every run. Mobile **87 px (0.014%)**: the same few glyph pixels in a smaller image, so just over my 0.01% threshold. |
| Snapshot vs the real modal (visual) | 1100 px layout squeezed into 941 px | **Same layout as the real modal.** Remaining differences are pre-existing capture-mode choices: the "RESUME" placeholder instead of the PDF, solid instead of translucent input fills. |
| Fully open modal, pixel diff between builds | — | Desktop dialog: **131 px (0.020%)**, all on the outer edge and rounded corners where the animated page shows through. With the PDF area masked: 0.015% / 0.033%. **Mobile dialog: 47 px (0.002%).** Content, PDF included, is identical. |
| Mid-warp frames (screencast, 25 / 50 / 75 / 95%) | Squeezed 1100 px layout inside the warp | **Same mesh, curvature, direction and timing.** The content inside now has the final modal's proportions, so the reveal no longer reflows. |
| Mobile snapshot | 528×1203 for 358×802 | Unchanged (pre-existing: html-to-image excludes the dialog's 6 px scrollbar, so the snapshot is 1.7% narrower) |

**D2: ✅ snapshot accuracy improved; warp effect preserved; no visual regression.**

### 1.8 Modal interaction timing (session C, `modal.mjs`)

Values are median (min–max); IQR outliers are named.

| Profile | Build | Samples | Open INP | Modal visible | Close INP | Close done |
|---|---|---|---|---|---|---|
| Desktop 1× | Baseline | 12 | 400 (304–456) | 829 (733–924) | 392 (336–688; outlier 688) | 791 (757–994; outlier 994) |
| Desktop 1× | **Candidate** | 12 | **344 (256–496)** | **787 (706–876)** | **336 (288–472)** | **772 (707–895)** |
| Desktop 4× | Baseline | 4 | 4,080 (3,768–4,216) | 4,411 (3,966–4,549) | 5,136 (4,864–5,232) | 5,240 (4,953–5,320) |
| Desktop 4× | **Candidate** | 4 | **3,672 (3,320–4,176)** | **3,957 (3,723–4,634)** | **4,408 (4,104–6,608)** | **4,552 (4,202–6,725)** |
| Mobile 1× | Baseline | 6 | 152 (128–168) | 624 (605–646) | 128 (120–152) | 581 (580–598) |
| Mobile 1× | Candidate | 6 | 144 (144–184) | 628 (614–682) | 144 (128–200; outlier 200) | 588 (571–599) |
| Mobile 4× | Baseline | 8 | 536 (472–624) | 991 (918–1,056) | 560 (384–656) | 912 (772–972) |
| Mobile 4× | Candidate | 8 | 616 (496–800) | 1,038 (974–1,259) | 552 (504–1,264; outlier 1,264) | 872 (838–1,401; outlier 1,401) |

**Other measured interactions.**
- **✕ close:** desktop 384 → 312 ms; mobile 152 → 120 ms.
- **Typing:** per-key events desktop 88 (72–136) → 104 (88–112) ms; worst key 136 → 120 ms. Mobile 40 → 40 ms.
- **All opens and closes succeeded**, with 0 exceptions. The only console output is the 2 pre-existing three.js warnings.
- **Escape**, the mobile ✕ tap, menu-Escape, reduced motion (baseline 440 ms → candidate 327 ms to visible) and the custom cursor inside/outside the modal all behave identically. The computed cursor of all 50 dialog elements is identical.

**Measured result.** No regression in open/close latency.
- Desktop medians are lower (open INP −56 ms at 1×, −408 ms at 4×). A plausible reason is that 52 fewer permanent DOM nodes shrink the cursor-class restyle. The ranges overlap, so **I don't claim an improvement**.
- Mobile 4× open is +80 ms (median; ranges overlap; n = 8). It's within run-to-run variation and will be re-checked under FIX-06.
- The large latency gains are FIX-06's, and remain **projections** until FIX-06 is measured.

### 1.9 R1 — first open after the first hover (dedicated test)

**Method.** One fresh page load per sample, so the measured open is the page's *first*.
- Controlled hover (400 ms) before the click, with pointerenter and click confirmed on the button itself (round 2).
- Frames sampled in-page with `requestAnimationFrame`, avoiding screencast overhead.
- Controls:
  - the **PDF request blocked** (the viewer never starts);
  - **no hover** (the viewer starts at the click, so its load overlaps the warp).

**Round 2** — clean, 24 runs, all clicks confirmed, all opened. Median (min–max), n = 6 each:

| Variant | Warp fps | Warp max gap | Modal visible | INP |
|---|---|---|---|---|
| Baseline (PDF preloaded at page load) | 23.2 (10.8–28.8) | 146 ms | 941 (835–1,193) | 416 |
| **Candidate (PDF viewer starting ~400 ms before the click)** | **27.0 (25.7–41.6)** | **83 ms** | **929 (911–1,006)** | 456 |
| Candidate, PDF blocked (viewer never starts) | 30.0 (11.1–34.1) | 83 ms | 949 (888–1,054) | 488 |
| Candidate, no hover (viewer loads *during* the warp) | 26.4 (24.4–27.8) | 111 ms | 891 (843–960) | 408 |

**Round 1** (34 runs) came from a machine that was still settling: intros at 6–59 s, and several clicks not registered in both builds. It showed the same pattern for warp fps, and noisy time-to-visible.

**Verdict: R1 not confirmed.** PDF-viewer start-up doesn't measurably affect warp smoothness or time-to-visible: blocking the PDF changes nothing beyond noise. The earlier 1,920 ms sample was the loaded machine plus screencast overhead.

**As instructed, the deferral was not implemented.** It's kept, unapplied and dry-run-verified, in the scratchpad (`fix05b/patch-r1.cjs`). That patch creates the iframe after the warp, shows the snapshot's placeholder until then, and fades the PDF in.

**What *does* limit smoothness on the first open, in both builds:**
- the warp runs at ~23–30 fps, with the GPU process at ~210% CPU from the page's own animations;
- the click task is heavy (the cursor-class restyle and `Home` re-render), which is FIX-06.

### 1.10 Early click (no hover, ~0.3 s after the intro ends)

| Run | Baseline | Candidate |
|---|---|---|
| Desktop 1 / 2 | Visible after 2,551 / 3,582 ms | Not visible within 4 s / ~4.4 s |
| Mobile 1 / 2 | Not visible within 4 s / 2,588 ms | Not visible within 4 s / 2,415 ms |
| Diagnostic run (timeline) | **4,286 ms** | **4,383 ms** |

**Both builds are slow here for the same pre-existing reason:**
- a **1.4–1.6 s React-Three-Fiber first frame** (shader compilation) right after the intro;
- a ~0.5 s scheduler task.

**On top of that, each build has its own capture cost:**
- **baseline:** its pre-capture, started during the intro, is still running at the click;
- **candidate:** the first capture lands on the critical path, including the one-time font build.

**Not a FIX-05 regression in the diagnosis.** The batch runs vary, and the candidate desktop pair was slower, so I list this as limitation L2.

### 1.11 Pre-existing behaviour found during validation (identical in both builds; not changed)

| Item | Detail |
|---|---|
| Post-intro 3D stall | React-Three-Fiber canvas first render: 1.0–1.7 s typically, up to 4.7 s. Any interaction in the ~1–3 s after the intro waits for it. |
| Rapid toggling | genie-web serialises show/hide animations. After 10 fast open/close cycles, the next open waits for the queue (> 1.6 s). |
| Scroll-lock compensation | While open, the right-hand social dock shifts 6 px and the nav 3 px; only the body and HIRE ME are compensated |
| Scroll lock with Lenis (F1) | Wheel still scrolls the page behind the modal (0 → 1,200 px desktop, 0 → 400 px mobile) |

### 1.12 Remaining limitations of FIX-05

| ID | Limitation |
|---|---|
| L1 | The idle capture costs ~0.2–1.5 s of main-thread long tasks once per page load, after the intro. Its largest frame is the one-time font build, ~190–250 ms. |
| L2 | A click before the idle capture has finished waits for it. In practice the post-intro 3D stall dominates that window in both builds. |
| L3 | Genie canvas re-allocation (D4) is unchanged |
| L4 | F5 is not addressed by FIX-05 (planned in FIX-06) |
| L5 | The mobile snapshot is 1.7% narrower (pre-existing) |

### 1.13 Deviations from the specification, and decisions for your review

| Spec | Actual | Reason |
|---|---|---|
| "Capture on intent" | Idle after the intro, or intent, or click, whichever comes first | A capture takes 0.4–0.7 s, longer than a typical hover-to-click gap (approved in the plan) |
| "Fonts limited or skipped" | Limited to the faces the modal's text needs | `skipFonts` changes the warp's fonts |
| — | Re-capture after a resize | The old snapshot was never refreshed |
| "Iframe only when open" | First intent or open (D3) | R1 not confirmed, so D3 stays as approved |

**Decisions for you:**
1. Approve FIX-05 as validated.
2. **F5:** verify it under FIX-06 as planned (D1), or add a minimal touch-device guard to FIX-05 now.
3. **R1 deferral:** leave it unapplied (recommended, since the data doesn't support it), or apply it anyway as a precaution.
4. **L1 (optional, later):** split the one-time font build so that no single capture frame exceeds ~50 ms.

> **STOP — FIX-05 implemented and validated under clean conditions. FIX-06 will not begin until you review and approve these results.**
