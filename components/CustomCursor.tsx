"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [hoverText, setHoverText] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  // Motion values for high-performance updates without React re-renders
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring configuration for smooth, premium feel
  const springConfig = { damping: 28, stiffness: 300, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on touch/mobile devices entirely
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX;
      let newY = e.clientY;

      const target = e.target as HTMLElement;
      const cursorElement = target.closest("[data-cursor]") as HTMLElement;

      if (cursorElement) {
        setIsHovering(true);
        setHoverText(cursorElement.dataset.cursor || "");
        setIsPointer(false);

        // Subtle magnetic attraction
        const rect = cursorElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 15% pull towards center of element
        const pull = 0.15;
        newX = e.clientX + (centerX - e.clientX) * pull;
        newY = e.clientY + (centerY - e.clientY) * pull;
      } else {
        setIsHovering(false);
        setHoverText("");
        
        // Fallback for regular clickable elements without specific labels
        const isClickable = !!target.closest("a, button, input, textarea, select");
        setIsPointer(isClickable);
      }

      mouseX.set(newX);
      mouseY.set(newY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center rounded-full will-change-transform"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: isHovering ? 72 : isPointer ? 8 : 10,
        height: isHovering ? 72 : isPointer ? 8 : 10,
        backgroundColor: isHovering ? "rgba(255, 138, 61, 0.03)" : "rgba(255, 138, 61, 1)",
        border: isHovering ? "1px solid rgba(255, 138, 61, 0.4)" : "0px solid rgba(255, 138, 61, 0)",
        backdropFilter: isHovering ? "blur(4px)" : "blur(0px)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {/* Subtle glow layer (only visible when not hovering a label to prevent blobbiness) */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-[#ff8a3d] mix-blend-screen pointer-events-none"
        animate={{
          opacity: isHovering ? 0 : 0.6,
          filter: isHovering ? "blur(0px)" : "blur(4px)",
          scale: isHovering ? 1 : 1.5,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Label Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: isHovering ? 1 : 0, 
          scale: isHovering ? 1 : 0.5 
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="font-display text-[9px] font-bold tracking-[0.2em] text-[#ff8a3d] whitespace-nowrap"
      >
        {hoverText}
      </motion.div>
    </motion.div>
  );
}
