"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── AI / featured tech set ──────────────────────────────────────────────────
const AI_TECHS = new Set(["OpenAI", "LLMs", "RAG", "AI Agents", "Prompt Engineering", "AI Workflows"]);

// ─── TechPill ─────────────────────────────────────────────────────────────────
// A lightweight, GPU-composited technology capsule with instantaneous CSS hover response.
// Zero layout thrashing, zero continuous physics calculations during marquee motion.

interface TechPillProps {
  tech: string;
  pillKey: string;
  dimmed?: boolean; // row 2 uses slightly dimmer text
}

export function TechPill({ tech, pillKey, dimmed = false }: TechPillProps) {
  const isAI = AI_TECHS.has(tech);

  return (
    <span
      key={pillKey}
      className={`group relative inline-flex items-center px-7 py-4 rounded-full border select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(255,138,61,0.25)] hover:border-[#ff8a3d]/50 hover:bg-[#ff8a3d]/[0.08]
        ${
          dimmed
            ? "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#5a5046]"
            : "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#3a322b]"
        }
        font-syne text-[15px] md:text-[17px] font-bold tracking-wide hover:text-[#ff8a3d]
      `}
    >
      {/* Orange dot indicator */}
      <span
        className={`w-2 h-2 rounded-full bg-[#ff8a3d] mr-3 shrink-0 ${
          dimmed ? "animate-pulse" : ""
        } shadow-[0_0_12px_rgba(255,138,61,0.6)] transition-transform duration-300 group-hover:scale-125`}
      />

      <span className="relative z-10">{tech}</span>
    </span>
  );
}

// ─── ProximityPillRow ─────────────────────────────────────────────────────────
// GPU-composited marquee row. Pauses automatically when off-screen.

interface ProximityPillRowProps {
  techs: string[]; // the actual deduped set
  rowKey: string;
  reverse?: boolean;
  dimmed?: boolean;
  animClass: string; // e.g. "animate-marquee" | "animate-marquee-slow"
}

export function ProximityPillRow({
  techs,
  rowKey,
  reverse = false,
  dimmed = false,
  animClass,
}: ProximityPillRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Pause the marquee entirely when scrolled off screen
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const doubled = [...techs, ...techs];

  return (
    <div
      ref={rowRef}
      className={`flex w-max ${animClass} whitespace-nowrap will-change-transform`}
      style={{
        animationDirection: reverse ? "reverse" : undefined,
        animationPlayState: inView ? "running" : "paused",
      }}
    >
      {doubled.map((tech, i) => (
        <span key={`${rowKey}-${i}`} className="pr-4 md:pr-6">
          <TechPill
            pillKey={`${rowKey}-${i}`}
            tech={tech}
            dimmed={dimmed}
          />
        </span>
      ))}
    </div>
  );
}
