"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── TiltCard ─────────────────────────────────────────────────────────────────
// Subtle cursor-following 3D tilt. Pure transform (GPU-composited) — the same
// pattern as the Expertise SkillRow, generalized as a wrapper.

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees at the card edges. */
  maxTilt?: number;
}

export function TiltCard({ children, className = "", maxTilt = 7 }: TiltCardProps) {
  const x = useMotionValue(0); // normalized -0.5 … 0.5
  const y = useMotionValue(0);

  const springCfg = { stiffness: 220, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springCfg);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springCfg);

  return (
    <div
      className={className}
      style={{ perspective: "1200px" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
