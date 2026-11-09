// ─── Intro lifecycle ──────────────────────────────────────────────────────────
// The IntroPreloader covers the whole viewport for ~2.3s. Anything that
// animates or computes underneath it during that time is invisible but still
// competes with the intro for the main thread / GPU, which is what made the
// intro stutter. Components use these helpers to hold off until it's done.
//
//   "playing"   → preloader is on screen
//   "revealing" → curtain has started lifting (start hero animations now)
//   "done"      → curtain fully gone (safe to do heavy one-off work)

import { useSyncExternalStore } from "react";

export type IntroPhase = "playing" | "revealing" | "done";

const ORDER: Record<IntroPhase, number> = { playing: 0, revealing: 1, done: 2 };

let phase: IntroPhase = "playing";
const listeners = new Set<() => void>();

export function setIntroPhase(next: IntroPhase) {
  if (ORDER[next] <= ORDER[phase]) return;
  phase = next;
  listeners.forEach((l) => l());
}

export function getIntroPhase() {
  return phase;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Runs `cb` once the intro reaches `target` (immediately if already there). Returns a cancel fn. */
export function onIntroPhase(target: IntroPhase, cb: () => void): () => void {
  if (ORDER[phase] >= ORDER[target]) {
    cb();
    return () => {};
  }
  let fired = false;
  const listener = () => {
    if (!fired && ORDER[phase] >= ORDER[target]) {
      fired = true;
      listeners.delete(listener);
      cb();
    }
  };
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Runs `cb` in browser idle time after the intro is fully done. Returns a cancel fn. */
export function afterIntroIdle(cb: () => void, timeout = 1500): () => void {
  let idleId: number | null = null;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  const cancelPhase = onIntroPhase("done", () => {
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => cb(), { timeout });
    } else {
      timerId = setTimeout(cb, 200);
    }
  });
  return () => {
    cancelPhase();
    if (idleId !== null) window.cancelIdleCallback(idleId);
    if (timerId !== null) clearTimeout(timerId);
  };
}

/** True once the intro curtain has started lifting. False during SSR. */
export function useIntroRevealed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ORDER[phase] >= ORDER.revealing,
    () => false
  );
}
