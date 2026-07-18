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
      className="relative flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-2xl"
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

      {/* Stats block */}
      <div className="relative z-10 flex divide-x divide-white/40">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 px-5 py-4 sm:py-5"
          >
            <span
              className="font-montserrat text-2xl font-black leading-none tracking-tight"
              style={{ color: stat.accent ? "#ff8a3d" : "#1a1612" }}
            >
              {stat.value}
            </span>
            <span
              className="font-researcher text-[8.5px] font-bold uppercase tracking-[0.22em] whitespace-nowrap"
              style={{ color: "rgba(58,50,43,0.45)" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider (vertical on sm+, horizontal on mobile) */}
      <div className="relative z-10 hidden sm:block w-px bg-white/40" />
      <div className="relative z-10 block sm:hidden h-px bg-white/40" />

      {/* Resume CTA */}
      <motion.a
        href="/Prajit_Balaji_Resume.pdf"
        download="Prajit_Balaji_Resume.pdf"
        aria-label="Download my resume"
        className="group relative z-10 flex items-center justify-center gap-2.5 px-6 py-4 sm:py-5"
        style={{
          backgroundColor: "rgb(26, 22, 18)",
          color: "#f2ece1",
          textDecoration: "none",
          minWidth: "9rem",
        }}
        whileHover={{ backgroundColor: "rgb(255, 138, 61)", color: "#1a1612" }}
        transition={{ duration: 0.22 }}
      >
        <Download
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-400 group-hover:translate-y-0.5"
          style={{ color: "inherit" }}
        />
        <span
          className="font-researcher text-[9px] font-bold uppercase tracking-[0.3em] whitespace-nowrap"
          style={{ color: "inherit" }}
        >
          My Resume
        </span>
      </motion.a>
    </motion.div>
  );
}
