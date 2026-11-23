"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";

// The glow only exists to follow a mouse. On touch screens it used to render
// anyway — a fixed 400px layer parked in the top-left corner — so it is now
// rendered only while the primary pointer is fine (mouse / trackpad).
const FINE_POINTER = "(pointer: fine)";
function subscribeFinePointer(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getFinePointer = () => window.matchMedia(FINE_POINTER).matches;
const getServerFinePointer = () => false;

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const finePointer = useSyncExternalStore(subscribeFinePointer, getFinePointer, getServerFinePointer);

  useEffect(() => {
    if (!finePointer) return;

    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (glowRef.current) {
            glowRef.current.style.transform = `translate3d(${mouse.current.x - 200}px, ${mouse.current.y - 200}px, 0)`;
          }
          rafId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-10 h-[400px] w-[400px] rounded-full opacity-60 will-change-transform dark:opacity-60 light:opacity-15"
      style={{
        background:
          "radial-gradient(circle, rgba(255, 138, 61, 0.12) 0%, rgba(232, 116, 44, 0.04) 40%, transparent 70%)",
      }}
    />
  );
}
