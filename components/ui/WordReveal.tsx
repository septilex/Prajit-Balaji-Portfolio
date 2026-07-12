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

  return (
    <h2 className={className}>
      {words.map((item, i) => (
        <React.Fragment key={i}>
          <motion.span
            className={`inline-block ${item.accent ? accentClassName : ""}`}
            initial={{ opacity: 0, y: "0.4em", filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.07,
            }}
          >
            {item.w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </h2>
  );
}
