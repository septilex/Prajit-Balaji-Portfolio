"use client";

import React, { useEffect, useRef, useState } from "react";

const AI_TECHS = new Set([
  "OpenAI",
  "LLMs",
  "RAG",
  "AI Agents",
  "Prompt Engineering",
  "AI Workflows",
]);

export function TechPill({ tech, pillKey, dimmed = false }: {
  tech: string;
  pillKey: string;
  dimmed?: boolean;
}) {
  const isAI = AI_TECHS.has(tech);

  return (
    <span
      key={pillKey}
      className={`group relative inline-flex items-center overflow-hidden rounded-full border px-7 py-4 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-105 hover:border-[#ff8a3d]/50 hover:bg-[#ff8a3d]/[0.08] hover:shadow-[0_16px_32px_-8px_rgba(255,138,61,0.25)] ${
        dimmed
          ? "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#5a5046]"
          : "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#3a322b]"
      } font-syne text-[15px] font-bold tracking-wide md:text-[17px]`}
    >
      <span
        className={`mr-3 h-2 w-2 shrink-0 rounded-full bg-[#ff8a3d] shadow-[0_0_12px_rgba(255,138,61,0.6)] transition-transform duration-300 group-hover:scale-125 ${
          dimmed ? "animate-pulse" : ""
        }`}
      />

      <span className="relative z-10 transition-colors duration-300 group-hover:text-[#ff8a3d]">
        {tech}
      </span>

      {isAI && (
        <span className="ml-3 hidden font-researcher text-[7px] uppercase tracking-[0.2em] text-[#ff8a3d]/60 sm:inline">
          AI
        </span>
      )}

      <span className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-[#ff8a3d]/50 transition-transform duration-300 group-hover:scale-x-100" />
    </span>
  );
}

export function ProximityPillRow({
  techs,
  rowKey,
  reverse = false,
  dimmed = false,
  animClass,
}: {
  techs: string[];
  rowKey: string;
  reverse?: boolean;
  dimmed?: boolean;
  animClass: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

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
