"use client";

import React, { useEffect, useRef } from "react";

export function CursorGlow() {
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);

  // Targets
  const mouse = useRef({ x: 0, y: 0 });
  // Current values (interpolated)
  const primary = useRef({ x: 0, y: 0 });
  const secondary = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Start centered in viewport
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    primary.current.x = mouse.current.x;
    primary.current.y = mouse.current.y;
    secondary.current.x = mouse.current.x;
    secondary.current.y = mouse.current.y;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let rafId: number;
    const update = () => {
      // Lerp speeds
      const primarySpeed = 0.08;
      const secondarySpeed = 0.03; // Slower, heavier lag for background depth

      primary.current.x += (mouse.current.x - primary.current.x) * primarySpeed;
      primary.current.y += (mouse.current.y - primary.current.y) * primarySpeed;

      secondary.current.x += (mouse.current.x - secondary.current.x) * secondarySpeed;
      secondary.current.y += (mouse.current.y - secondary.current.y) * secondarySpeed;

      if (primaryRef.current) {
        // Offset by half size (250px) to center
        primaryRef.current.style.transform = `translate3d(${primary.current.x - 250}px, ${primary.current.y - 250}px, 0)`;
      }

      if (secondaryRef.current) {
        // Parallax background shift: offset by half size (350px) + light scaling
        secondaryRef.current.style.transform = `translate3d(${secondary.current.x - 350}px, ${secondary.current.y - 350}px, 0)`;
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Primary active spotlight follow (soft diffusion) */}
      <div
        ref={primaryRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-20 h-[500px] w-[500px] rounded-full mix-blend-screen opacity-70 transition-opacity duration-700 will-change-transform dark:opacity-75 light:opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(255, 138, 61, 0.16) 0%, rgba(232, 116, 44, 0.06) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Secondary large slow-lag ambient lighting element (creates parallax distance/depth) */}
      <div
        ref={secondaryRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-10 h-[700px] w-[700px] rounded-full mix-blend-screen opacity-40 transition-opacity duration-700 will-change-transform dark:opacity-50 light:opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(194, 65, 12, 0.12) 0%, rgba(184, 115, 51, 0.03) 50%, transparent 80%)",
          filter: "blur(60px)",
        }}
      />
    </>
  );
}
