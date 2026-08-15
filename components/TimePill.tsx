"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TimePill — live IST clock in a rounded black capsule.
 * Uses requestAnimationFrame-based second polling to stay battery-friendly.
 */
export function TimePill() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // IST = UTC+5:30
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const istMs = utcMs + 5.5 * 60 * 60 * 1000;
      const ist = new Date(istMs);

      const h = ist.getHours();
      const m = ist.getMinutes();
      const s = ist.getSeconds();
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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

      {/* Live time — Syne font wide digits */}
      <span
        className="font-syne text-[11px] font-bold tabular-nums tracking-wider"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {time || "00:00:00"}
      </span>
    </div>
  );
}
