"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// ─── AI / featured tech set ──────────────────────────────────────────────────
const AI_TECHS = new Set(["OpenAI", "LLMs", "RAG", "AI Agents", "Prompt Engineering", "AI Workflows"]);

// ─── TechPill ─────────────────────────────────────────────────────────────────
// A single technology capsule that reads cursor proximity from a shared mouseX
// MotionValue and applies a dock-style 3D bubble lift.

interface TechPillProps {
  tech: string;
  pillKey: string;
  mouseX: MotionValue<number>;
  dimmed?: boolean;  // row 2 uses slightly dimmer text
}

export function TechPill({ tech, pillKey, mouseX, dimmed = false }: TechPillProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isAI = AI_TECHS.has(tech);

  // Distance from cursor to pill center
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  const springCfg = { mass: 0.1, stiffness: 260, damping: 20 };

  // Scale: center 1.11, neighbors taper off
  const scaleSync = useTransform(distance, [-180, 0, 180], [1, 1.11, 1]);
  const scale = useSpring(scaleSync, springCfg);

  // Lift: slight upward push toward cursor
  const ySync = useTransform(distance, [-120, 0, 120], [0, -5, 0]);
  const y = useSpring(ySync, springCfg);

  // Shadow opacity: bloom at cursor center
  const shadowSync = useTransform(distance, [-120, 0, 120], [0, 1, 0]);
  const shadowStrength = useSpring(shadowSync, springCfg);

  // Border glow: fade orange in on proximity
  const borderSync = useTransform(distance, [-100, 0, 100], [0, 1, 0]);
  const borderGlow = useSpring(borderSync, springCfg);

  return (
    <motion.span
      ref={ref}
      key={pillKey}
      style={{ scale, y }}
      className={`relative inline-flex items-center px-7 py-4 rounded-full border select-none transition-colors duration-200
        ${dimmed
          ? "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#5a5046]"
          : "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#3a322b]"
        }
        text-[15px] md:text-[17px] font-semibold tracking-tight
        hover:border-[#ff8a3d]/40 hover:bg-[#ff8a3d]/[0.06] hover:text-[#ff8a3d]
      `}
    >
      {/* Proximity shadow — pre-rendered box-shadow faded via opacity
          (animating box-shadow itself repaints the pill every frame) */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none shadow-[0_16px_30px_-10px_rgba(255,138,61,0.22),0_5px_12px_rgba(58,50,43,0.08)]"
        style={{ opacity: shadowStrength }}
      />

      {/* Proximity border glow overlay */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[#ff8a3d] pointer-events-none"
        style={{ opacity: borderGlow }}
      />

      {/* AI dot indicator */}
      {isAI && (
        <span className={`w-2 h-2 rounded-full bg-[#ff8a3d] mr-3 shrink-0 ${dimmed ? "animate-pulse" : ""} shadow-[0_0_12px_rgba(255,138,61,0.6)]`} />
      )}

      <span className="relative z-10">{tech}</span>
    </motion.span>
  );
}

// ─── ProximityPillRow ─────────────────────────────────────────────────────────
// A single marquee row that shares one mouseX across all its pills so
// proximity-based scaling works correctly even in a horizontal scroll track.

interface ProximityPillRowProps {
  techs: string[];       // the actual deduped set (pre-tripled outside)
  rowKey: string;
  reverse?: boolean;
  dimmed?: boolean;
  animClass: string;     // e.g. "animate-marquee" | "animate-marquee-slow"
}

export function ProximityPillRow({
  techs,
  rowKey,
  reverse = false,
  dimmed = false,
  animClass,
}: ProximityPillRowProps) {
  const mouseX = useMotionValue(Infinity);
  const rowRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // rAF-gate the shared mouseX: mousemove fires up to 500×/s on high-poll
  // mice, and every set() fans out to a rect read per pill. One update per
  // frame is all the springs can use anyway.
  const pendingX = useRef(0);
  const rafPending = useRef(false);
  const onMouseMove = (e: React.MouseEvent) => {
    pendingX.current = e.pageX;
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        mouseX.set(pendingX.current);
      });
    }
  };

  // Pause the marquee entirely when scrolled off screen
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Two copies: the -50% marquee loop is seamless with exactly 2 (with 3 the
  // seam jumps by half a copy), and it's a third fewer live spring systems.
  const doubled = [...techs, ...techs];

  return (
    <div
      ref={rowRef}
      className={`flex w-max ${animClass} whitespace-nowrap`}
      style={{
        animationDirection: reverse ? "reverse" : undefined,
        animationPlayState: inView ? "running" : "paused",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {/* Spacing lives INSIDE each item (not flex gap) so the -50% loop
          point aligns exactly — with gap, the seam is off by half a gap. */}
      {doubled.map((tech, i) => (
        <span key={`${rowKey}-${i}`} className="pr-4 md:pr-6">
          <TechPill
            pillKey={`${rowKey}-${i}`}
            tech={tech}
            mouseX={mouseX}
            dimmed={dimmed}
          />
        </span>
      ))}
    </div>
  );
}
