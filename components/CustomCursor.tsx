"use client";

import React, { useEffect, useRef } from "react";

// ─── CustomCursor ─────────────────────────────────────────────────────────────
// Dot + trailing ring. The dot tracks the pointer 1:1 (no lag), the ring
// follows with a soft lerp. Interactive elements grow the ring; mousedown
// contracts it. All movement is direct transform writes inside one rAF loop —
// zero React re-renders, zero paint work.

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch devices keep their native behavior
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hides the native cursor via CSS (scoped to this class)
    document.documentElement.classList.add("has-custom-cursor");

    let mx = -100;
    let my = -100;
    let visible = false;
    let rafId: number | null = null;

    const updateCursor = () => {
      const t = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      dot.style.transform = t;
      ring.style.transform = t;
      rafId = null;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }

      const target = e.target as HTMLElement;
      const interactive = !!target.closest(
        "a, button, [role='button'], input, textarea, select, label"
      );
      ring.classList.toggle("cursor-ring--active", interactive);
      dot.classList.toggle("cursor-dot--active", interactive);

      if (rafId === null) {
        rafId = requestAnimationFrame(updateCursor);
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onDown = () => ring.classList.add("cursor-ring--down");
    const onUp = () => ring.classList.remove("cursor-ring--down");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring" />
    </>
  );
}
