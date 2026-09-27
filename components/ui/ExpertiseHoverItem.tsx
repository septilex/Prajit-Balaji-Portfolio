"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

interface ExpertiseHoverItemProps {
  name: string;
  index: number;
  mouseY: MotionValue<number>;
}

export function ExpertiseHoverItem({ name, index, mouseY }: ExpertiseHoverItemProps) {
  const padded = String(index + 1).padStart(2, "0");
  const ref = useRef<HTMLDivElement>(null);

  const localX = useMotionValue(0);
  const localY = useMotionValue(0);

  const springBase = { mass: 0.12, stiffness: 240, damping: 22 };

  const rotateX = useSpring(useTransform(localY, [-0.5, 0.5], [8, -8]), springBase);
  const rotateY = useSpring(useTransform(localX, [-0.5, 0.5], [-10, 10]), springBase);
  const translateZ = useSpring(useTransform(localX, [-0.5, 0.5], [0, 0]), springBase);

  const hovered = useMotionValue(0);
  const glowOpacity = useSpring(hovered, { mass: 0.1, stiffness: 200, damping: 20 });
  const scaleSync = useSpring(useTransform(hovered, [0, 1], [1, 1.018]), {
    mass: 0.1,
    stiffness: 240,
    damping: 22,
  });

  // Keep the shared MotionValue wired in so the current ProximitySkillList API remains intact.
  void mouseY;
  void translateZ;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    localX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    localY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
    hovered.set(1);
  };

  const handleMouseLeave = () => {
    localX.set(0);
    localY.set(0);
    hovered.set(0);
  };

  return (
    <div
      ref={ref}
      className="group/skill relative cursor-default border-b border-[#3a2a1c]/12 hover:border-[#ff8a3d]/25 transition-colors duration-300"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleSync,
          transformStyle: "preserve-3d",
        }}
        className="flex items-center justify-between py-4 px-4 -mx-4 origin-center"
      >
        <motion.div
          className="absolute left-0 top-0 w-[3px] rounded-r-full bg-[#ff8a3d] origin-top"
          style={{
            scaleY: glowOpacity,
            height: "100%",
          }}
        />

        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-sm bg-gradient-to-r from-[#ff8a3d]/[0.03] to-transparent"
          style={{ opacity: glowOpacity }}
        />

        <motion.span
          className="relative font-sans text-sm text-[#3a322b]/65 transition-colors duration-300 group-hover/skill:text-[#3a322b]"
          style={{ translateZ: 14 }}
        >
          {name}
        </motion.span>

        <motion.span
          className="relative font-researcher text-xs tracking-wider text-[#3a322b]/25 transition-colors duration-300 group-hover/skill:text-[#ff8a3d]"
          style={{ translateZ: 8 }}
        >
          {padded}
        </motion.span>
      </motion.div>
    </div>
  );
}

interface ProximitySkillListProps {
  skills: string[];
}

export function ProximitySkillList({ skills }: ProximitySkillListProps) {
  const mouseY = useMotionValue(Infinity);
  const pendingY = useRef(0);
  const rafPending = useRef(false);

  const onMouseMove = (e: React.MouseEvent) => {
    pendingY.current = e.clientY;
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        mouseY.set(pendingY.current);
      });
    }
  };

  return (
    <div onMouseMove={onMouseMove} onMouseLeave={() => mouseY.set(Infinity)}>
      {skills.map((skill, i) => (
        <ExpertiseHoverItem key={skill} name={skill} index={i} mouseY={mouseY} />
      ))}
    </div>
  );
}
