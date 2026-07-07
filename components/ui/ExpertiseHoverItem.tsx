"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// ─── ExpertiseHoverItem ───────────────────────────────────────────────────────
// A single skill row that uses pointer-within-row coordinates to produce a
// cinematic 3D pop-out.  mouseY is the shared page-Y value from the parent
// ProximitySkillList so neighbouring rows react faintly to the cursor.

interface ExpertiseHoverItemProps {
  name: string;
  index: number;
  mouseY: MotionValue<number>;
}

export function ExpertiseHoverItem({ name, index, mouseY }: ExpertiseHoverItemProps) {
  const padded = String(index + 1).padStart(2, "0");
  const ref = useRef<HTMLDivElement>(null);

  // ── Per-row local pointer tracking (strong primary 3D tilt) ────────────────
  const localX = useMotionValue(0);
  const localY = useMotionValue(0);

  const springBase = { mass: 0.12, stiffness: 240, damping: 22 };

  const rotateX = useSpring(useTransform(localY, [-0.5, 0.5], [8, -8]), springBase);
  const rotateY = useSpring(useTransform(localX, [-0.5, 0.5], [-10, 10]), springBase);
  const translateZ = useSpring(useTransform(localX, [-0.5, 0.5], [0, 0]), {
    ...springBase,
  });

  // Lift on Y-local hover
  const liftY = useSpring(useTransform(localY, [-0.5, 0.5], [0, 0]), springBase);

  // Hover-activated glow scale
  const hovered = useMotionValue(0);
  const glowOpacity = useSpring(hovered, { mass: 0.1, stiffness: 200, damping: 20 });
  const scaleSync = useSpring(
    useTransform(hovered, [0, 1], [1, 1.018]),
    { mass: 0.1, stiffness: 240, damping: 22 }
  );

  // ── Proximity from shared mouseY (weak neighbor influence) ──────────────────
  const proximity = useTransform(mouseY, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const center = rect.top + rect.height / 2;
    const dist = Math.abs(val - center);
    return Math.max(0, 1 - dist / 110); // 110px falloff radius
  });
  const neighborScale = useSpring(
    useTransform(proximity, [0, 1], [1, 1.009]),
    { mass: 0.1, stiffness: 200, damping: 22 }
  );

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
        {/* Left accent bar */}
        <motion.div
          className="absolute left-0 top-0 w-[3px] rounded-r-full bg-[#ff8a3d] origin-top"
          style={{
            scaleY: glowOpacity,
            height: "100%",
          }}
        />

        {/* Soft highlight backdrop */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-sm bg-gradient-to-r from-[#ff8a3d]/[0.03] to-transparent"
          style={{ opacity: glowOpacity }}
        />

        {/* Skill name — deeper in 3D */}
        <motion.span
          className="relative font-sans text-sm text-[#3a322b]/65 transition-colors duration-300 group-hover/skill:text-[#3a322b]"
          style={{ translateZ: 14 }}
        >
          {name}
        </motion.span>

        {/* Index — slightly shallower */}
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

// ─── ProximitySkillList ───────────────────────────────────────────────────────
// Wraps a list of skill names and shares a single mouseY MotionValue so each
// ExpertiseHoverItem can react faintly to the cursor even when not directly hovered.

interface ProximitySkillListProps {
  skills: string[];
}

export function ProximitySkillList({ skills }: ProximitySkillListProps) {
  const mouseY = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
    >
      {skills.map((skill, i) => (
        <ExpertiseHoverItem key={skill} name={skill} index={i} mouseY={mouseY} />
      ))}
    </div>
  );
}
