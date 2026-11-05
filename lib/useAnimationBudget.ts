"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

// ─── Animation budget ─────────────────────────────────────────────────────────
// Shared lifecycle signals for anything that animates continuously (rAF loops,
// WebGL render loops, infinite CSS / framer-motion loops).
//
// A continuous animation is only worth running when:
//   1. its element is on (or near) the screen       → IntersectionObserver
//   2. the browser tab is in the foreground          → document.visibilityState
//   3. the user has not asked for reduced motion     → prefers-reduced-motion
//
// Consumers decide what to do with the signals:
//   • `shouldRender`  – visible + tab visible. Draw frames (a static frame is
//                        still useful under reduced motion).
//   • `shouldAnimate` – `shouldRender` and motion allowed. Run ambient loops.
//
// All subscriptions are cleaned up on unmount, and the values update live, so
// consumers resume automatically when an element scrolls back into view, the
// tab regains focus, or the OS motion preference changes.

// ── Tab visibility ────────────────────────────────────────────────────────────

function subscribePageVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const getPageVisible = () => document.visibilityState !== "hidden";
const getPageVisibleOnServer = () => true;

/** `true` while the document's tab is in the foreground. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribePageVisibility, getPageVisible, getPageVisibleOnServer);
}

// ── prefers-reduced-motion ────────────────────────────────────────────────────

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getReducedMotionOnServer = () => false;

/** `true` when the user has requested reduced motion at the OS/browser level. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionOnServer);
}

// ── Element visibility ────────────────────────────────────────────────────────

export interface InViewportOptions {
  /** Grow/shrink the viewport used for the check, e.g. "200px 0px" to wake up early. */
  rootMargin?: string;
  threshold?: number;
}

/**
 * `true` while `ref`'s element intersects the (margin-adjusted) viewport.
 * Starts `false` so nothing animates before the first observation arrives
 * (the observer reports the initial state on the next frame).
 */
export function useInViewport(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", threshold = 0 }: InViewportOptions = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // No observer support: never block animation.
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setInView(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Several entries can be queued for the same element; the last one is current.
        const latest = entries[entries.length - 1];
        if (latest) setInView(latest.isIntersecting);
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}

// ── Combined budget ───────────────────────────────────────────────────────────

export interface AnimationBudget {
  /** Element intersects the (margin-adjusted) viewport. */
  inView: boolean;
  /** Tab is in the foreground. */
  pageVisible: boolean;
  /** User prefers reduced motion. */
  reducedMotion: boolean;
  /** Worth drawing frames: on screen and tab visible. */
  shouldRender: boolean;
  /** Worth running ambient/continuous motion: `shouldRender` and motion allowed. */
  shouldAnimate: boolean;
}

export function useAnimationBudget(
  ref: RefObject<Element | null>,
  options?: InViewportOptions
): AnimationBudget {
  const inView = useInViewport(ref, options);
  const pageVisible = usePageVisible();
  const reducedMotion = usePrefersReducedMotion();
  const shouldRender = inView && pageVisible;
  return {
    inView,
    pageVisible,
    reducedMotion,
    shouldRender,
    shouldAnimate: shouldRender && !reducedMotion,
  };
}
