"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  initialTransform?: string; // Kept for API compatibility, but we use framer-motion variants
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  initialTransform, // Ignored in favor of premium 3D effect
  delay = 0,
  duration = 800, // Slightly longer, more cinematic
  threshold = 0.05,
  triggerOnce = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: triggerOnce, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60, rotateX: 15, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, rotateX: 0, scale: 1 }
          : { opacity: 0, y: 60, rotateX: 15, scale: 0.95 }
      }
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1200px"
      }}
    >
      {children}
    </motion.div>
  );
}
