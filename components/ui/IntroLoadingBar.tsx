"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── IntroLoadingBar ──────────────────────────────────────────────────────────
// An 8-bit retro progress bar embedded inside the intro preloader.
// Adapted for high-fps composite rendering with no Framer Motion color interpolation errors.

interface IntroLoadingBarProps {
  startDelay?: number;
  duration?: number;
  onComplete?: () => void;
}

const PIXEL_COLS = 24; // number of pixel columns in the bar

export function IntroLoadingBar({
  startDelay = 300,
  duration = 1300,
  onComplete,
}: IntroLoadingBarProps) {
  const [progress, setProgress] = useState(0);        // 0–100
  const [filledCols, setFilledCols] = useState(0);    // 0–PIXEL_COLS
  const [done, setDone] = useState(false);

  // Smoothly animate progress from 0→100 after startDelay
  useEffect(() => {
    let raf: number;
    let startTime: number | null = null;

    const delay = setTimeout(() => {
      const tick = (ts: number) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgress(pct);
        setFilledCols(Math.floor((pct / 100) * PIXEL_COLS));

        if (pct < 100) {
          raf = requestAnimationFrame(tick);
        } else {
          setDone(true);
          onComplete?.();
        }
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [startDelay, duration, onComplete]);

  const pctLabel = `${Math.floor(progress)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: startDelay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-3 w-full"
    >
      {/* Top label row */}
      <div className="flex items-center justify-between w-full max-w-xs md:max-w-sm px-0.5">
        <span
          className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-[#3a322b]/40"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          LOADING
        </span>
        <span
          className="text-[9px] md:text-[10px] tracking-[0.2em] text-[#3a322b]/40 tabular-nums"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {pctLabel}
        </span>
      </div>

      {/* Pixel bar track */}
      <div
        className="relative w-full max-w-xs md:max-w-sm h-[10px] md:h-[12px] border border-[#3a322b]/18 bg-[#3a322b]/[0.03] rounded-sm overflow-hidden"
        style={{
          imageRendering: "pixelated",
          boxShadow: "inset 0 1px 3px rgba(58,50,43,0.06)",
        }}
      >
        {/* Pixel columns grid */}
        <div className="absolute inset-0 flex gap-[2px] p-[2px]">
          {Array.from({ length: PIXEL_COLS }).map((_, i) => {
            const filled = i < filledCols;
            const isEdge = filled && i === filledCols - 1;

            return (
              <div
                key={i}
                className={`flex-1 h-full rounded-[1px] transition-colors duration-100 ${
                  filled
                    ? isEdge
                      ? "bg-[#ff8a3d]"
                      : i % 3 === 0
                      ? "bg-[#ff8a3d]/80"
                      : "bg-[#3a322b]/60"
                    : "bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Scan-line shimmer overlay — only while in progress */}
        {!done && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,138,61,0.15) 50%, transparent 100%)",
              width: "40%",
            }}
          />
        )}
      </div>

      {/* Completion flash */}
      {done && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.7] }}
          transition={{ duration: 0.3, times: [0, 0.2, 1] }}
          className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-[#ff8a3d]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          READY
        </motion.span>
      )}
    </motion.div>
  );
}
