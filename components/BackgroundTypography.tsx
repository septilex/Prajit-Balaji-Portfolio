"use client";

import React from "react";

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
  direction,
  duration,
  strokeWidth = 1,
}: {
  children: string;
  direction: "normal" | "reverse";
  duration: number;
  strokeWidth: number;
}) {
  return (
    <div className="flex flex-nowrap overflow-hidden whitespace-nowrap leading-[0.8] m-0 py-2">
      <div
        className="flex whitespace-nowrap text-nowrap flex-nowrap uppercase font-display font-black tracking-[-0.04em] will-change-transform animate-marquee"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction,
        }}
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
      </div>
    </div>
  );
}

export function BackgroundTypography({
  rows = DEFAULT_ROWS,
  opacity = 0.04,
  strokeWidth = 1,
}: BackgroundTypographyProps) {
  return (
    <div
      className="absolute inset-0 z-0 flex flex-col justify-center overflow-hidden pointer-events-none select-none text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]"
      style={{ opacity }}
      aria-hidden="true"
    >
      {rows.map((row, i) => (
        <ParallaxText
          key={i}
          direction={i % 2 === 0 ? "normal" : "reverse"}
          duration={60 + i * 8}
          strokeWidth={strokeWidth}
        >
          {row}
        </ParallaxText>
      ))}
    </div>
  );
}
