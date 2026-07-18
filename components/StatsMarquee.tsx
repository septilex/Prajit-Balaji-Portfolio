"use client";

import React, { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "10+", label: "PROJECTS BUILT" },
  { value: "3", label: "AI MODELS" },
  { value: "2+", label: "YEARS CODING" },
  { value: "500+", label: "COMMITS" },
  { value: "96.8%", label: "MODEL ACCURACY" },
  { value: "∞", label: "COFFEE ☕" },
];

// Counts up from 0 to the numeric part of `value` once `started` is true.
// Non-numeric values (like "∞") render as-is.
function AnimatedValue({ value, started }: { value: string; started: boolean }) {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value);

  useEffect(() => {
    if (!started) return;
    const m = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
    if (!m) return;

    const target = parseFloat(m[1]);
    const decimals = (m[1].split(".")[1] || "").length;
    const suffix = m[2];
    const duration = 1400;
    const t0 = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay((target * eased).toFixed(decimals) + suffix);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value]);

  return <>{display}</>;
}

export function StatsMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);

  // One observer, two jobs: kick off the count-up the first time the strip
  // appears, and pause the marquee animation whenever it's off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setStarted(true);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-2 sm:py-2.5 border-y border-white/10 bg-[#1F1C17] shadow-[0_8px_24px_rgba(0,0,0,0.22),0_-8px_24px_rgba(0,0,0,0.22)] overflow-hidden z-20"
    >
      <div className="relative z-0 flex overflow-hidden whitespace-nowrap group/marquee">
        <div
          className="flex flex-nowrap items-center gap-12 sm:gap-16 md:gap-24 w-max animate-marquee hover:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]"
          style={{
            willChange: "transform",
            animationDuration: "60s",
            animationPlayState: inView ? undefined : "paused",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              {STATS.map((stat, j) => (
                <div key={`${i}-${j}`} className="flex items-center gap-12 sm:gap-16 md:gap-24 group">
                  {/* Stat Item */}
                  <div className="flex items-baseline gap-2 sm:gap-3 cursor-default transition-all duration-[600ms] ease-out hover:-translate-y-1">
                    <span className="font-display font-bold text-2xl sm:text-3xl text-[#f6f2ec] tracking-tight transition-colors duration-500 group-hover:text-[#ff8a3d]">
                      <AnimatedValue value={stat.value} started={started} />
                    </span>
                    <span
                      className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#ff8a3d]/70 group-hover:text-[#ff8a3d] transition-colors duration-500 font-researcher"
                      style={{ textShadow: "0 0 12px rgba(255,138,61,0.45)" }}
                    >
                      {stat.label}
                    </span>
                  </div>

                  {/* Static separator dot — no Framer Motion */}
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d]/40 group-hover:bg-[#ff8a3d] transition-colors duration-500 shadow-[0_0_8px_rgba(255,138,61,0.3)]" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
