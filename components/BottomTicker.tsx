"use client";

import { useRef, useState, useEffect } from "react";

const ITEMS = [
  "REACT",
  "NEXT.JS",
  "TYPESCRIPT",
  "PYTHON",
  "LLMS",
  "RAG",
  "GEN AI",
  "CLOUD",
  "FULL STACK",
  "NODE.JS",
  "DOCKER",
  "AWS",
  "OPENAI",
  "PROMPT ENGINEERING",
  "AI AGENTS",
  "REST APIS",
  "POSTGRESQL",
  "MONGODB",
  "© 2026 PRAJIT BALAJI",
  "SCROLL TO EXPLORE",
];

/** Orange diamond separator */
function Sep() {
  return (
    <span
      aria-hidden="true"
      className="mx-6 shrink-0 text-[#ff8a3d] text-[10px] leading-none"
      style={{ userSelect: "none" }}
    >
      ✦
    </span>
  );
}

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animState =
    !inView || paused ? "paused" : "running";

  return (
    <div
      className="relative flex overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex flex-nowrap whitespace-nowrap"
        style={{
          animation: `ticker-scroll ${reverse ? "55s" : "45s"} linear infinite ${reverse ? "reverse" : "normal"}`,
          animationPlayState: animState,
          willChange: "transform",
        }}
      >
        {/* Two identical copies — seamless loop */}
        {[0, 1].map((copy) => (
          <span key={copy} className="flex items-center">
            {ITEMS.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span
                  className="font-researcher text-[10px] font-bold uppercase tracking-[0.3em] text-white/85 whitespace-nowrap"
                >
                  {item}
                </span>
                <Sep />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * BottomTicker — full-width black strip with two counter-scrolling rows of
 * tech stack items separated by orange diamond separators.
 */
export function BottomTicker() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "#1a1612",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      {/* Row 1 */}
      <div className="py-2.5">
        <TickerRow />
      </div>
    </div>
  );
}
