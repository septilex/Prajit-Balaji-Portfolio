"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TimePill — live IST clock in a rounded black capsule.
 * Uses requestAnimationFrame-based second polling to stay battery-friendly.
 */
export function TimePill() {
  const [time, setTime] = useState("");
  const rafRef = useRef<number | null>(null);
  const lastSecondRef = useRef(-1);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // IST = UTC+5:30
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const istMs = utcMs + 5.5 * 60 * 60 * 1000;
      const ist = new Date(istMs);

      const s = ist.getSeconds();
      if (s !== lastSecondRef.current) {
        lastSecondRef.current = s;
        const h = ist.getHours();
        const m = ist.getMinutes();
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");
        setTime(`${hh}:${mm}:${ss}`);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="group relative hidden md:flex items-center gap-2 rounded-full px-3.5 py-1.5 select-none"
      style={{
        background: "#1a1612",
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset",
        transition: "box-shadow 0.25s ease",
      }}
      title="Indian Standard Time"
    >
      {/* Subtle live-dot indicator */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff8a3d] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff8a3d]" />
      </span>

      {/* IST label */}
      <span
        className="font-researcher text-[9px] font-bold tracking-[0.25em] uppercase"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        IST
      </span>

      {/* Live time — monospace so digits don't shift */}
      <span
        className="font-mono text-[11px] font-semibold tabular-nums"
        style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em" }}
      >
        {time || "00:00:00"}
      </span>
    </div>
  );
}
