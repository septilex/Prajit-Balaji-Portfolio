"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// ─── MagneticNavItem ──────────────────────────────────────────────────────────
// Adapts the dock's distance-based MotionValue into a nav pill hover system.
// mouseX is the shared pageX value passed from the parent nav group.

interface MagneticNavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  mouseX: MotionValue<number>;
}

export function MagneticNavItem({ href, label, isActive, mouseX }: MagneticNavItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Distance from cursor center to this element's center (in px)
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    const center = bounds.x + bounds.width / 2;
    return val - center;
  });

  // Scale: hover center → 1.14, neighbors fall off naturally
  const scaleSync = useTransform(distance, [-120, 0, 120], [1, 1.12, 1]);
  const scale = useSpring(scaleSync, { mass: 0.08, stiffness: 280, damping: 18 });

  // Slight upward lift toward the cursor
  const ySync = useTransform(distance, [-100, 0, 100], [0, -3, 0]);
  const y = useSpring(ySync, { mass: 0.08, stiffness: 260, damping: 18 });

  // Shadow bloom on proximity
  const glowSync = useTransform(distance, [-80, 0, 80], [0, 1, 0]);
  const glow = useSpring(glowSync, { mass: 0.08, stiffness: 260, damping: 20 });

  // Border/highlight brightness on proximity
  const bgOpacitySync = useTransform(distance, [-80, 0, 80], [0, 1, 0]);
  const bgOpacity = useSpring(bgOpacitySync, { mass: 0.08, stiffness: 260, damping: 22 });

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{
        scale,
        y,
        boxShadow: glow.get() > 0.05
          ? `0 ${Math.round(glow.get() * 12)}px ${Math.round(glow.get() * 28)}px rgba(58,50,43,${(glow.get() * 0.12).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,${(glow.get() * 0.4).toFixed(3)})`
          : undefined,
      }}
      className={`relative inline-block rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 select-none ${
        isActive
          ? "text-[#ff8a3d]"
          : "text-[#3a322b]/60 hover:text-[#3a322b]"
      }`}
    >
      {/* Soft glass pill background — fades in on proximity */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#3a322b]/[0.04] border border-[#3a322b]/[0.08]"
        style={{ opacity: bgOpacity }}
      />
      <span className="relative z-10">{label}</span>
    </motion.a>
  );
}

// ─── MagneticNavGroup ─────────────────────────────────────────────────────────
// Wraps nav items and provides the shared mouseX MotionValue.

interface NavItem {
  id: string;
  label: string;
}

interface MagneticNavGroupProps {
  items: NavItem[];
  activeSection: string;
}

export function MagneticNavGroup({ items, activeSection }: MagneticNavGroupProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className="hidden md:flex items-center gap-0.5"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {items.map((item) => (
        <MagneticNavItem
          key={item.id}
          href={`#${item.id}`}
          label={item.label}
          isActive={activeSection === item.id}
          mouseX={mouseX}
        />
      ))}
    </div>
  );
}
