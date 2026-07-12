"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Magnetic ─────────────────────────────────────────────────────────────────
// Pulls its child toward the cursor while hovered, springs back on leave.
// Same feel as the magnetic nav items, packaged as a standalone wrapper.

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** How strongly the element follows the cursor (0–1). */
  strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 200, damping: 16, mass: 0.3 };
  const sx = useSpring(x, springCfg);
  const sy = useSpring(y, springCfg);

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
