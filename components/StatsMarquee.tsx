"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useReducedMotion,
  useMotionValue,
  wrap,
} from "framer-motion";

const STATS = [
  { value: "10+", label: "PROJECTS BUILT" },
  { value: "3", label: "AI MODELS" },
  { value: "2+", label: "YEARS CODING" },
  { value: "500+", label: "COMMITS" },
  { value: "96.8%", label: "MODEL ACCURACY" },
  { value: "∞", label: "COFFEE ☕" },
];

export function StatsMarquee() {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 100,
    stiffness: 200,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false,
  });

  const [isHovered, setIsHovered] = useState(false);
  const hoverVelocity = useSpring(1, { stiffness: 200, damping: 50 });

  useEffect(() => {
    hoverVelocity.set(isHovered ? 0 : 1);
  }, [isHovered, hoverVelocity]);

  const prefersReducedMotion = useReducedMotion();
  const directionFactor = useRef<number>(1);
  const baseVelocity = -0.5; // ultra slow, 60fps smooth glide

  // Wrap between 0 and -25% since we have 4 identical groups
  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  useAnimationFrame((t, delta) => {
    if (prefersReducedMotion) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = 1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = -1;
    }

    // Apply scroll-based velocity boost
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    
    // Apply smooth hover slowdown
    moveBy *= hoverVelocity.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <section className="relative w-full py-4 sm:py-5 border-y border-[#3a2a1c]/40 bg-[#0a0807]/40 backdrop-blur-xl overflow-hidden light:bg-[#fdfbf7]/80 light:border-black/10 z-20">
      {/* Container without fade mask */}
      <div 
        className="relative z-0 flex overflow-hidden whitespace-nowrap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className="flex flex-nowrap items-center gap-12 sm:gap-16 md:gap-24 w-max" 
          style={{ x, willChange: "transform" }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              {STATS.map((stat, j) => (
                <div key={`${i}-${j}`} className="flex items-center gap-12 sm:gap-16 md:gap-24 group">
                  {/* Stat Item */}
                  <div className="flex items-baseline gap-2 sm:gap-3 cursor-default transition-all duration-[600ms] ease-out hover:-translate-y-1">
                    <span className="font-display font-bold text-3xl sm:text-4xl text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] tracking-tight group-hover:text-[#ff8a3d] transition-colors duration-500 drop-shadow-[0_0_15px_rgba(255,138,61,0)] group-hover:drop-shadow-[0_0_15px_rgba(255,138,61,0.4)]">
                      {stat.value}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#a89c8d]/70 group-hover:text-[#a89c8d] transition-colors duration-500 font-researcher">
                      {stat.label}
                    </span>
                  </div>
                  
                  {/* Glowing Separator Dot */}
                  <motion.div 
                    className="relative flex items-center justify-center h-2 w-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d]/40 group-hover:bg-[#ff8a3d] transition-colors duration-500 shadow-[0_0_10px_rgba(255,138,61,0.3)] group-hover:shadow-[0_0_20px_rgba(255,138,61,0.8)]"></div>
                    <motion.div 
                      className="absolute inset-0 rounded-full border border-[#ff8a3d]/30"
                      animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: j * 0.2 }}
                    />
                  </motion.div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
