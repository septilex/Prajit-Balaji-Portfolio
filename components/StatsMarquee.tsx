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

  // Kick off the count-up the first time the strip scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-4 sm:py-5 border-y border-[#3a2a1c]/10 bg-[#f2ece1] shadow-[0_10px_30px_rgba(58,50,43,0.05),0_-10px_30px_rgba(58,50,43,0.05)] overflow-hidden z-20"
    >
      <div className="relative z-0 flex overflow-hidden whitespace-nowrap group/marquee">
        <div
          className="flex flex-nowrap items-center gap-12 sm:gap-16 md:gap-24 w-max animate-marquee hover:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]"
          style={{ willChange: "transform" }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              {STATS.map((stat, j) => (
                <div key={`${i}-${j}`} className="flex items-center gap-12 sm:gap-16 md:gap-24 group">
                  {/* Stat Item */}
                  <div className="flex items-baseline gap-2 sm:gap-3 cursor-default transition-all duration-[600ms] ease-out hover:-translate-y-1">
                    <span className="font-display font-bold text-3xl sm:text-4xl text-[#3a322b] tracking-tight group-hover:text-[#ff8a3d] transition-colors duration-500">
                      <AnimatedValue value={stat.value} started={started} />
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#7a6f62]/80 group-hover:text-[#3a322b] transition-colors duration-500 font-researcher">
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
