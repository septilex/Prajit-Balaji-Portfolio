"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useReducedMotion,
  useMotionValue,
  wrap,
} from "framer-motion";

export interface BackgroundTypographyProps {
  rows?: string[];
  speed?: number;
  opacity?: number;
  strokeWidth?: number;
}

const DEFAULT_ROWS = [
  "INNOVATION • DESIGN • ENGINEERING •",
  "FRONTEND • BACKEND • FULLSTACK •",
  "ARTIFICIAL INTELLIGENCE • MACHINE LEARNING •",
  "SCALABILITY • PERFORMANCE • ARCHITECTURE •",
];

function ParallaxText({
  children,
  baseVelocity = 100,
  strokeWidth = 1,
}: {
  children: string;
  baseVelocity: number;
  strokeWidth: number;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
  const prefersReducedMotion = useReducedMotion();

  // Create duplicate content to ensure smooth wrap
  // Assuming 4 children, we wrap seamlessly by shifting between 0 and 25% (or 0 and 33.33% if 3 children)
  // But wait, the standard framer-motion scroll velocity tutorial wraps from -20 to -45.
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    if (prefersReducedMotion) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Change direction based on scroll velocity if scrolling happens
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex flex-nowrap overflow-hidden whitespace-nowrap leading-[0.8] m-0 py-2">
      <motion.div
        className="flex whitespace-nowrap text-nowrap flex-nowrap uppercase font-display font-black tracking-[-0.04em] will-change-transform"
        style={{ x }}
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="block px-8"
            style={{
              fontSize: "clamp(4rem, 15vw, 12rem)",
              color: "transparent",
              WebkitTextStroke: `${strokeWidth}px currentColor`,
            }}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function BackgroundTypography({
  rows = DEFAULT_ROWS,
  speed = 1,
  opacity = 0.04,
  strokeWidth = 1,
}: BackgroundTypographyProps) {
  return (
    <div
      className="absolute inset-0 z-0 flex flex-col justify-center overflow-hidden pointer-events-none select-none text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]"
      style={{ opacity }}
      aria-hidden="true"
    >
      {rows.map((row, i) => {
        // Alternate directions and vary speeds slightly to make it organic
        const direction = i % 2 === 0 ? 1 : -1;
        const rowSpeed = speed * direction * (1 + i * 0.1);

        return (
          <ParallaxText key={i} baseVelocity={rowSpeed} strokeWidth={strokeWidth}>
            {row}
          </ParallaxText>
        );
      })}
    </div>
  );
}
