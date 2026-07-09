"use client";

import React, { useRef } from "react";
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
      style={{
        scale,
        y,
        boxShadow: shadowStrength.get() > 0.05
          ? `0 ${Math.round(shadowStrength.get() * 20)}px ${Math.round(shadowStrength.get() * 36)}px -10px rgba(255,138,61,${(shadowStrength.get() * 0.22).toFixed(3)}), 0 ${Math.round(shadowStrength.get() * 6)}px ${Math.round(shadowStrength.get() * 14)}px rgba(58,50,43,${(shadowStrength.get() * 0.08).toFixed(3)})`
          : undefined,
      }}
      className={`relative inline-flex items-center px-7 py-4 rounded-full border select-none transition-colors duration-200
        ${dimmed
          ? "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#5a5046]"
          : "border-[#3a322b]/10 bg-[#3a322b]/[0.02] text-[#3a322b]"
        }
        text-[15px] md:text-[17px] font-semibold tracking-tight
        hover:border-[#ff8a3d]/40 hover:bg-[#ff8a3d]/[0.06] hover:text-[#ff8a3d]
      `}
    >
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
  // Triple the array for seamless looping (same as original)
  const tripled = [...techs, ...techs, ...techs];

  return (
    <div
      className={`flex w-max ${animClass} gap-4 md:gap-6 whitespace-nowrap`}
      style={reverse ? { animationDirection: "reverse" } : undefined}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {tripled.map((tech, i) => (
        <TechPill
          key={`${rowKey}-${i}`}
          pillKey={`${rowKey}-${i}`}
          tech={tech}
          mouseX={mouseX}
          dimmed={dimmed}
        />
      ))}
    </div>
  );
}
