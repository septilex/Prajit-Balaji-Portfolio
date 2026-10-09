"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TITLES = [
  "Full Stack Developer",
  "ML Engineer",
  "React Developer",
  "UI/UX Enthusiast",
];

const cursorAnimate = { opacity: [1, 0] };
const cursorTransition = { duration: 0.8, repeat: Infinity, ease: "linear" as const };

export const TypewriterTitle = () => {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let titleIndex = 0;
    let isDeleting = false;
    let text = "";
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const currentTitle = TITLES[titleIndex];
      
      if (!isDeleting && text === currentTitle) {
        // Hold for 1.5 seconds at the end of typing
        timeoutId = setTimeout(() => {
          isDeleting = true;
          tick();
        }, 1500);
      } else if (isDeleting && text === "") {
        // Move to next title when fully deleted
        timeoutId = setTimeout(() => {
          isDeleting = false;
          titleIndex = (titleIndex + 1) % TITLES.length;
          tick();
        }, 500);
      } else {
        // Typing or deleting
        const nextDelay = isDeleting ? 35 : 60;
        text = currentTitle.substring(0, text.length + (isDeleting ? -1 : 1));
        
        if (textRef.current) {
          textRef.current.textContent = text;
        }
        
        timeoutId = setTimeout(tick, nextDelay);
      }
    };

    // Start the animation
    timeoutId = setTimeout(tick, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <span className="relative inline-flex flex-col items-center justify-center text-[#ff8a3d]/90 uppercase text-[11px] md:text-sm tracking-[0.3em] font-semibold mt-4">
      {/* Invisible longest text to exactly reserve the required layout space at all breakpoints */}
      <span className="invisible whitespace-nowrap">FULL STACK DEVELOPER</span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
        <span ref={textRef}></span>
        <motion.span
          animate={cursorAnimate}
          transition={cursorTransition}
          className="inline-block w-[2px] h-[1.1em] bg-[#ff8a3d]/90 ml-1 md:ml-1.5 rounded-full"
        />
      </span>
    </span>
  );
};
