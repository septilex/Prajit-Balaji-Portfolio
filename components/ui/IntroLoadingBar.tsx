"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── IntroLoadingBar ──────────────────────────────────────────────────────────
// An 8-bit retro progress bar embedded inside the intro preloader.
//
// Performance: progress is written straight to the DOM from a single rAF loop
// (refs, no React state per frame). The only React re-render is the one-time
// "done" flip at 100%. Previously every frame triggered a re-render of the
// whole bar, which competed with the intro animations for the main thread.

interface IntroLoadingBarProps {
  startDelay?: number;
  duration?: number;
  onComplete?: () => void;
}

const PIXEL_COLS = 24; // number of pixel columns in the bar

const FILLED_EDGE = "#ff8a3d";
const FILLED_ACCENT = "rgba(255, 138, 61, 0.8)";
const FILLED_BASE = "rgba(58, 50, 43, 0.6)";

function colColor(i: number, filledCols: number) {
  if (i >= filledCols) return "transparent";
  if (i === filledCols - 1) return FILLED_EDGE;
  return i % 3 === 0 ? FILLED_ACCENT : FILLED_BASE;
}

export function IntroLoadingBar({
  startDelay = 300,
  duration = 1300,
  onComplete,
}: IntroLoadingBarProps) {
  const [done, setDone] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let raf = 0;
    let startTime: number | null = null;
    let lastCols = -1;
    let lastPct = -1;

    const tick = (ts: number) => {
      if (startTime === null) startTime = ts;
      const pct = Math.min(((ts - startTime) / duration) * 100, 100);
      const whole = Math.floor(pct);
      const cols = Math.floor((pct / 100) * PIXEL_COLS);

      if (whole !== lastPct && labelRef.current) {
        labelRef.current.textContent = `${whole}%`;
        lastPct = whole;
      }
      if (cols !== lastCols) {
        // Only the columns whose state can change (old edge → new edge) are touched
        const from = Math.max(0, lastCols - 1);
        for (let i = from; i < Math.min(PIXEL_COLS, cols + 1); i++) {
          const el = colRefs.current[i];
          if (el) el.style.backgroundColor = colColor(i, cols);
        }
        lastCols = cols;
      }

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        onCompleteRef.current?.();
      }
    };

    const delay = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [startDelay, duration]);

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
          ref={labelRef}
          className="text-[9px] md:text-[10px] tracking-[0.2em] text-[#3a322b]/40 tabular-nums"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          0%
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
          {Array.from({ length: PIXEL_COLS }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                colRefs.current[i] = el;
              }}
              className="flex-1 h-full rounded-[1px]"
              style={{ backgroundColor: "transparent" }}
            />
          ))}
        </div>

        {/* Scan-line shimmer overlay — only while in progress (transform-only, GPU composited) */}
        {!done && (
          <motion.div
            className="absolute inset-y-0 left-0 pointer-events-none will-change-transform"
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
