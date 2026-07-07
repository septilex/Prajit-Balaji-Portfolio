"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [hoverText, setHoverText] = useState("");

  // Track hover/pointer state via refs to avoid React re-renders on every mousemove
  const hoverRef = useRef(false);
  const pointerRef = useRef(false);

  // Motion values for cursor animation states — no React re-renders
  const cursorWidth = useMotionValue(10);
  const cursorHeight = useMotionValue(10);
  const cursorBg = useMotionValue("rgba(255, 138, 61, 1)");
  const cursorBorder = useMotionValue("0px solid rgba(255, 138, 61, 0)");
  const glowOpacity = useMotionValue(1);
  const glowShadow = useMotionValue("0 0 12px 4px rgba(255, 138, 61, 0.4)");
  const glowScale = useMotionValue(1.5);
  const labelOpacity = useMotionValue(0);
  const labelScale = useMotionValue(0.5);

  // Motion values for high-performance position updates without React re-renders
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

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
        if (!hoverRef.current) {
          hoverRef.current = true;
          pointerRef.current = false;
          setHoverText(cursorElement.dataset.cursor || "");

          // Update motion values directly — no React re-render
          cursorWidth.set(72);
          cursorHeight.set(72);
          cursorBg.set("rgba(255, 138, 61, 0.03)");
          cursorBorder.set("1px solid rgba(255, 138, 61, 0.4)");
          glowOpacity.set(0);
          glowShadow.set("none");
          glowScale.set(1);
          labelOpacity.set(1);
          labelScale.set(1);
        }

        // Subtle magnetic attraction
        const rect = cursorElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pull = 0.15;
        newX = e.clientX + (centerX - e.clientX) * pull;
        newY = e.clientY + (centerY - e.clientY) * pull;
      } else {
        if (hoverRef.current) {
          hoverRef.current = false;
          setHoverText("");
          labelOpacity.set(0);
          labelScale.set(0.5);
        }

        const isClickable = !!target.closest("a, button, input, textarea, select");
        if (isClickable !== pointerRef.current) {
          pointerRef.current = isClickable;
          cursorWidth.set(isClickable ? 8 : 10);
          cursorHeight.set(isClickable ? 8 : 10);
          cursorBg.set("rgba(255, 138, 61, 1)");
          cursorBorder.set("0px solid rgba(255, 138, 61, 0)");
          glowOpacity.set(1);
          glowShadow.set("0 0 12px 4px rgba(255, 138, 61, 0.4)");
          glowScale.set(1.5);
        }
      }

      mouseX.set(newX);
      mouseY.set(newY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, cursorWidth, cursorHeight, cursorBg, cursorBorder, glowOpacity, glowShadow, glowScale, labelOpacity, labelScale]);

  // Spring the motion values for smooth interpolation
  const springConfig = { stiffness: 400, damping: 28 };
  const springW = useSpring(cursorWidth, springConfig);
  const springH = useSpring(cursorHeight, springConfig);

  if (!isMounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center rounded-full will-change-transform"
      style={{
        x: mouseX,
        y: mouseY,
        width: springW,
        height: springH,
        backgroundColor: cursorBg,
        border: cursorBorder,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Subtle glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full bg-transparent pointer-events-none"
        style={{
          opacity: glowOpacity,
          boxShadow: glowShadow,
          scale: glowScale,
        }}
      />

      {/* Label Text */}
      <motion.div
        style={{
          opacity: labelOpacity,
          scale: labelScale,
        }}
        className="font-display text-[9px] font-bold tracking-[0.2em] text-[#ff8a3d] whitespace-nowrap"
      >
        {hoverText}
      </motion.div>
    </motion.div>
  );
}
