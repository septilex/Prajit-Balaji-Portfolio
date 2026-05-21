"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scaleX, setScaleX] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      setScaleX(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-gradient-to-r from-[#c2410c] via-[#ff8a3d] to-[#b87333] transition-transform duration-75 ease-out"
      style={{ transform: `scaleX(${scaleX})` }}
    />
  );
}
