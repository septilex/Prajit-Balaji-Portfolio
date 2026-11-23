"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface Stat {
  value: string;
  label: string;
  accent?: boolean;
}

const STATS: Stat[] = [
  { value: "12+", label: "Projects Shipped" },
  { value: "3", label: "Years Building" },
  { value: "∞", label: "Curiosity", accent: true },
];

/**
 * StatsCard — floating glass card with key stats and a resume download button.
 * Matches the portfolio's warm-neutral palette exactly.
 */
export function StatsCard() {
  return (
    <motion.div
      // Phones (< 768px): full content width, stats in three equal columns,
      // résumé below. From 768px: the original single inline row.
      className="relative flex w-full max-w-[26rem] flex-col items-stretch gap-0 overflow-hidden rounded-2xl md:w-auto md:max-w-none md:flex-row"
      style={{
        // Liquid glass: translucent so the grid shows through, saturated
        // backdrop for that refractive richness.
        background: "rgba(246, 242, 236, 0.42)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255, 255, 255, 0.55)",
        boxShadow:
          "0 22px 60px rgba(58,50,43,0.16), 0 4px 20px rgba(58,50,43,0.07), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -2px 8px rgba(58,50,43,0.05)",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -3,
        boxShadow:
          "0 30px 84px rgba(58,50,43,0.22), 0 4px 24px rgba(58,50,43,0.09), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 8px rgba(58,50,43,0.06)",
      }}
    >
      {/* Specular sheen — the top-light streak that reads as "glass" */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.18) 26%, rgba(255,255,255,0) 48%)",
        }}
      />

      {/* Stats block. On phones the labels may wrap onto two lines (11px,
          AA-contrast ink) instead of forcing a ~500px no-wrap row that pushed
          "Curiosity" out of the card. md+ keeps the original 8.5px row. */}
      <div className="relative z-10 grid grid-cols-3 divide-x divide-white/40 md:flex">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-col items-center justify-start gap-1.5 px-2 py-3 text-center md:justify-center md:gap-1 md:px-5 md:py-5"
          >
            <span
              className="font-montserrat text-xl font-black leading-none tracking-tight md:text-2xl"
              style={{ color: stat.accent ? "#ff8a3d" : "#1a1612" }}
            >
              {stat.value}
            </span>
            <span className="font-researcher text-[11px] font-bold uppercase leading-[1.3] tracking-[0.12em] text-[rgba(58,50,43,0.72)] md:whitespace-nowrap md:text-[8.5px] md:leading-normal md:tracking-[0.22em] md:text-[rgba(58,50,43,0.45)]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider (vertical on md+, horizontal on phones) */}
      <div className="relative z-10 hidden md:block w-px bg-white/40" />
      <div className="relative z-10 block md:hidden h-px bg-white/40" />

      {/* Resume CTA */}
      <a
        href="/Prajit_Balaji_Resume.pdf"
        download="Prajit_Balaji_Resume.pdf"
        aria-label="Download my resume"
        className="glass-corner-btn group relative z-10 flex items-center justify-center gap-2.5 px-6 py-3 md:py-5"
        style={{
          textDecoration: "none",
          minWidth: "9rem",
        }}
      >
        <Download
          className="relative z-10 h-3.5 w-3.5 shrink-0 transition-transform duration-400 group-hover:translate-y-0.5"
        />
        <span
          className="relative z-10 font-researcher text-[9px] font-bold uppercase tracking-[0.3em] whitespace-nowrap"
        >
          MY RESUME
        </span>
      </a>
    </motion.div>
  );
}
