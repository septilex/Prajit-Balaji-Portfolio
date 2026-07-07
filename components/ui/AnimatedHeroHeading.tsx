"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── AnimatedHeroHeading ──────────────────────────────────────────────────────
// Renders a multi-line hero heading in the Syed Moinuddin editorial style:
//   • Syne 800 weight (applied via font-syne Tailwind class or inline var)
//   • Uppercase dramatic presentation
//   • Line-by-line overflow-hidden reveal, translateY stagger
//   • Tight line-height, strong negative letter-spacing

interface AnimatedHeroHeadingProps {
  lines: string[];
  className?: string;
  // Optional per-word highlight: if any word matches, it gets orange treatment
  accentWords?: string[];
}

// Bezier typed as const so Framer Motion's Variants type accepts it
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

const lineVariants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.85,
      ease: EASE_OUT_EXPO,
      delay: i * 0.12,
    },
  }),
};

export function AnimatedHeroHeading({
  lines,
  className = "",
  accentWords = [],
}: AnimatedHeroHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const accentSet = new Set(accentWords.map((w) => w.toUpperCase()));

  return (
    <div ref={ref} className={`select-none ${className}`}>
      {lines.map((line, lineIdx) => {
        // Split into words so we can accent individual ones
        const words = line.split(" ");
        const hasAccent = words.some((w) =>
          accentSet.has(w.replace(/[^A-Z]/g, "").toUpperCase())
        );

        return (
          // overflow-hidden is the key — it clips the translate-Y travel
          <div key={lineIdx} className="overflow-hidden">
            <motion.div
              custom={lineIdx}
              variants={lineVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="flex flex-wrap"
              style={{
                // Critical: Syne 800 for the big editorial feel
                fontFamily: "var(--next-font-syne), 'Cabinet Grotesk', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 3.5vw, 3.8rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {words.map((word, wordIdx) => {
                const bare = word.replace(/[^A-Za-z]/g, "").toUpperCase();
                const isAccent = accentSet.has(bare);
                const punctuation = word.match(/[^A-Za-z]+$/)?.[0] ?? "";
                const root = word.replace(/[^A-Za-z]+$/, "");

                return (
                  <span
                    key={wordIdx}
                    className="mr-[0.18em] last:mr-0"
                    style={{
                      color: isAccent ? "#ff8a3d" : "#3a322b",
                    }}
                  >
                    {root}
                    {punctuation && (
                      <span style={{ color: "#3a322b" }}>{punctuation}</span>
                    )}
                  </span>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
