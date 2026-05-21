"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // cubic easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Sync clicking navigation anchors to scroll smoothly with Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        if (href === "#hero") {
          lenis.scrollTo(0);
        } else {
          const element = document.querySelector(href);
          if (element) {
            lenis.scrollTo(element as HTMLElement, { offset: 0, duration: 1.2 });
          }
        }
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick as EventListener);
    });

    return () => {
      cancelAnimationFrame(rafId);
      anchors.forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick as EventListener);
      });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
