"use client";

import React from "react";
import { motion } from "framer-motion";

// ─── WordReveal ───────────────────────────────────────────────────────────────
// Staggers a heading in word-by-word: each word rises, sharpens from a blur,
// and fades in as the heading enters the viewport. One-shot (viewport once),
// transform/opacity/filter only — no layout thrash.

interface WordRevealProps {
  text: string;
  /** Optional trailing accent phrase, rendered in the accent color. */
  accentText?: string;
  className?: string;
  accentClassName?: string;
}

export function WordReveal({
  text,
  accentText,
  className = "",
  accentClassName = "text-[#ff8a3d]",
}: WordRevealProps) {
  const words = [
    ...text.split(" ").filter(Boolean).map((w) => ({ w, accent: false })),
    ...(accentText
      ? accentText.split(" ").filter(Boolean).map((w) => ({ w, accent: true }))
      : []),
  ];

  const cleanedClassName = className.replace(/\bfont-display\b/g, "").trim();

  return (
    <h2 className={`${cleanedClassName} font-syne uppercase`}>
      {words.map((item, i) => {
        const upperWord = item.w.toUpperCase();
        const first = upperWord.charAt(0);
        const rest = upperWord.slice(1);
        
        return (
          <React.Fragment key={i}>
            <motion.span
              className={`inline-block ${item.accent ? accentClassName : "text-[0.7em]"}`}
              initial={{ opacity: 0, y: "0.4em" }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.05,
              }}
            >
              <span className="text-[1.25em]">{first}</span>{rest}
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </h2>
  );
}
