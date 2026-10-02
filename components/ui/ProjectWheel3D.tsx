"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface ProjectWheelItem {
  src: string;
  title: string;
  cat?: string;
  desc?: string;
  tags?: string[];
  github?: string;
  link?: string;
  status?: string;
  year?: string;
}

export interface ProjectWheel3DProps {
  items: ProjectWheelItem[];
  autoSpeed?: number;
  autoRotate?: boolean;
}

/* ─── Curved Project Card ───────────────────────────────────────────────────── */
/*
 * Each card is sliced into STRIPS thin vertical panels, each slightly rotated
 * around Y. Together they form a physically curved surface — like a bent glass
 * display panel. The image is shown via CSS background-image with offset so
 * each strip shows the correct column of the original screenshot.
 */

const STRIPS = 14;
const BEND_DEGREES = 24; // total arc across the card width

function CurvedProjectCard({
  item,
  cardWidth,
  cardHeight,
}: {
  item: ProjectWheelItem;
  cardWidth: number;
  cardHeight: number;
}) {
  const bendRad = (BEND_DEGREES * Math.PI) / 180;
  const stripWidth = cardWidth / STRIPS;
  // Radius of the card's own internal curvature
  const R = cardWidth / (2 * Math.sin(bendRad / 2));

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
           THICK LIQUID-GLASS SLAB — 7 layers creating realistic depth
           ═══════════════════════════════════════════════════════════════════ */}

      {/* Layer 1 — Outermost diffuse glow (ambient orange warmth) */}
      <div
        className="absolute rounded-[28px]"
        style={{
          inset: "-18px",
          transform: "translateZ(-16px)",
          background: `radial-gradient(
            ellipse at 50% 40%,
            rgba(255, 180, 120, 0.08) 0%,
            rgba(255, 138, 61, 0.04) 40%,
            transparent 70%
          )`,
          boxShadow: `
            0 0 80px rgba(255, 138, 61, 0.06),
            0 30px 100px rgba(0, 0, 0, 0.1)
          `,
          filter: "blur(4px)",
        }}
      />

      {/* Layer 2 — Thick translucent glass body (the main slab) */}
      <div
        className="absolute rounded-[24px]"
        style={{
          inset: "-14px",
          transform: "translateZ(-10px)",
          background: `linear-gradient(
            165deg,
            rgba(255, 255, 255, 0.28) 0%,
            rgba(255, 235, 215, 0.18) 8%,
            rgba(255, 220, 190, 0.12) 18%,
            rgba(220, 180, 140, 0.08) 35%,
            rgba(200, 160, 120, 0.06) 50%,
            rgba(220, 180, 140, 0.08) 65%,
            rgba(255, 220, 190, 0.14) 82%,
            rgba(255, 255, 255, 0.22) 92%,
            rgba(255, 235, 215, 0.18) 100%
          )`,
          boxShadow: `
            inset 0 2px 4px rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px rgba(200, 140, 80, 0.12),
            inset 2px 0 4px rgba(255, 255, 255, 0.08),
            inset -2px 0 4px rgba(255, 255, 255, 0.06),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 12px 40px rgba(0, 0, 0, 0.08)
          `,
        }}
      />

      {/* Layer 3 — Inner glass refraction ring (sharper edge definition) */}
      <div
        className="absolute rounded-[22px]"
        style={{
          inset: "-10px",
          transform: "translateZ(-7px)",
          background: `linear-gradient(
            170deg,
            rgba(255, 255, 255, 0.45) 0%,
            rgba(255, 255, 255, 0.12) 12%,
            transparent 25%,
            transparent 75%,
            rgba(255, 255, 255, 0.1) 88%,
            rgba(255, 240, 220, 0.3) 100%
          )`,
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.55),
            inset 0 -1px 0 rgba(200, 160, 120, 0.18)
          `,
        }}
      />

      {/* Layer 4 — Glass depth layer (creates the "sealed inside" feeling) */}
      <div
        className="absolute rounded-[20px]"
        style={{
          inset: "-6px",
          transform: "translateZ(-4px)",
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.06) 0%,
            rgba(255, 245, 235, 0.04) 30%,
            rgba(255, 220, 190, 0.03) 60%,
            rgba(200, 150, 100, 0.05) 100%
          )`,
          boxShadow: `
            inset 0 0 12px rgba(255, 255, 255, 0.06),
            0 0 0 1px rgba(255, 220, 190, 0.06)
          `,
        }}
      />

      {/* Layer 5 — Left glass edge (thick dimensional highlight) */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 rounded-l-[20px]"
        style={{
          left: "-14px",
          width: "22px",
          transform: "translateZ(-3px)",
          background: `linear-gradient(to right,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 240, 220, 0.15) 30%,
            rgba(255, 220, 190, 0.06) 60%,
            transparent 100%
          )`,
        }}
      />

      {/* Layer 5b — Right glass edge */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 rounded-r-[20px]"
        style={{
          right: "-14px",
          width: "22px",
          transform: "translateZ(-3px)",
          background: `linear-gradient(to left,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 240, 220, 0.12) 30%,
            rgba(255, 220, 190, 0.05) 60%,
            transparent 100%
          )`,
        }}
      />

      {/* Layer 6 — Bottom copper/bronze glass edge (thick, warm) */}
      <div
        className="pointer-events-none absolute inset-x-0 rounded-b-[22px]"
        style={{
          bottom: "-14px",
          height: "32px",
          transform: "translateZ(-3px)",
          background: `linear-gradient(
            to top,
            rgba(180, 120, 60, 0.35) 0%,
            rgba(200, 150, 90, 0.2) 25%,
            rgba(255, 200, 150, 0.1) 50%,
            transparent 100%
          )`,
          boxShadow: "0 4px 16px rgba(180, 120, 60, 0.12)",
        }}
      />

      {/* Layer 6b — Top glass edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 rounded-t-[22px]"
        style={{
          top: "-14px",
          height: "24px",
          transform: "translateZ(-3px)",
          background: `linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 245, 235, 0.15) 40%,
            transparent 100%
          )`,
        }}
      />

      {/* Layer 7 — Inner specular highlight (top, in front of image) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 rounded-t-2xl"
        style={{
          height: "40%",
          transform: "translateZ(4px)",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Layer 7b — Inner left refraction (in front of image) */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-l-2xl"
        style={{
          width: "24px",
          transform: "translateZ(3px)",
          background: `linear-gradient(to right,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 235, 215, 0.06) 40%,
            transparent 100%
          )`,
        }}
      />

      {/* Layer 7c — Inner right refraction (in front of image) */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 right-0 rounded-r-2xl"
        style={{
          width: "24px",
          transform: "translateZ(3px)",
          background: `linear-gradient(to left,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 235, 215, 0.05) 40%,
            transparent 100%
          )`,
        }}
      />

      {/* Layer 7d — Inner bottom copper edge (in front of image) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl"
        style={{
          height: "36px",
          transform: "translateZ(3px)",
          background: `linear-gradient(
            to top,
            rgba(200, 140, 80, 0.25) 0%,
            rgba(255, 180, 120, 0.08) 50%,
            transparent 100%
          )`,
        }}
      />

      {/* ── Curved image surface made of strips ──────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: STRIPS }).map((_, i) => {
          const angle = -bendRad / 2 + (i + 0.5) * (bendRad / STRIPS);
          const x = R * Math.sin(angle);
          const z = R * (Math.cos(angle) - 1);
          const rotDeg = (angle * 180) / Math.PI;

          return (
            <div
              key={i}
              className="absolute top-0 overflow-hidden"
              style={{
                width: `${stripWidth + 1.5}px`, // +1.5px overlap prevents sub-pixel gaps
                height: "100%",
                left: "50%",
                transformStyle: "preserve-3d",
                transform: `
                  translateX(${x - stripWidth / 2}px)
                  translateZ(${z}px)
                  rotateY(${rotDeg}deg)
                `,
                borderRadius:
                  i === 0
                    ? "16px 0 0 16px"
                    : i === STRIPS - 1
                    ? "0 16px 16px 0"
                    : "0",
              }}
            >
              {/* Pure image slice — no overlays or gradients to cause vertical bands */}
              <div
                className="absolute top-0 h-full"
                style={{
                  width: `${cardWidth}px`,
                  left: `${-i * stripWidth}px`,
                  backgroundImage: `url(${item.src})`,
                  backgroundSize: `${cardWidth}px ${cardHeight}px`,
                  backgroundPosition: "0 0",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Single continuous bottom shadow for text legibility (flat plane) ── */}
      <div
        className="pointer-events-none absolute inset-0 rounded-b-[16px]"
        style={{
          transform: "translateZ(6px)",
          background: `linear-gradient(
            to top,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.2) 25%,
            transparent 45%
          )`,
        }}
      />

      {/* ── Title text overlay (flat, floating in front of curve) ─────── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 md:p-5"
        style={{ transform: "translateZ(8px)" }}
      >
        <h3 className="font-syne text-sm md:text-lg font-extrabold uppercase tracking-wider text-white drop-shadow-lg">
          {item.title}
        </h3>
        {item.cat && (
          <p className="mt-1 font-researcher text-[8px] md:text-[10px] uppercase tracking-[0.25em] text-white/60">
            {item.cat}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Glass Rim Segment ─────────────────────────────────────────────────────── */

function GlassRimSegment({
  angle,
  radius,
  height,
  segmentWidth,
}: {
  angle: number;
  radius: number;
  height: number;
  segmentWidth: number;
}) {
  return (
    <div
      className="absolute"
      style={{
        width: `${segmentWidth + 2}px`,
        height: `${height}px`,
        left: `${-segmentWidth / 2}px`,
        top: `${-height / 2}px`,
        transformStyle: "preserve-3d",
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(255, 220, 190, 0.02) 0%,
            rgba(255, 200, 160, 0.06) 20%,
            rgba(255, 180, 130, 0.1) 40%,
            rgba(200, 150, 100, 0.15) 70%,
            rgba(180, 130, 80, 0.18) 85%,
            rgba(160, 110, 60, 0.12) 100%
          )`,
          borderLeft: "1px solid rgba(255, 220, 190, 0.1)",
          borderRight: "1px solid rgba(255, 220, 190, 0.06)",
          boxShadow: `
            inset 0 -8px 20px rgba(200, 140, 80, 0.08),
            inset 0 2px 10px rgba(255, 255, 255, 0.04),
            0 0 12px rgba(255, 138, 61, 0.03)
          `,
        }}
      />
    </div>
  );
}

/* ─── Main Wheel Component ──────────────────────────────────────────────────── */

export function ProjectWheel3D({
  items,
  autoSpeed = 8,
  autoRotate = true,
}: ProjectWheel3DProps) {
  const count = items.length;
  const angleStep = 360 / count;

  /* ── Responsive sizing ─────────────────────────────────────────────────── */
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  useEffect(() => {
    const update = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = dims.w < 768;

  // Wide radius — gentle bracelet curvature (DON'T change)
  const radius = isMobile ? 500 : Math.min(dims.w * 0.65, 1200);
  // Card dimensions stay large (DON'T change)
  const cardWidth = isMobile ? 280 : Math.min(dims.w * 0.42, 800);
  const cardHeight = cardWidth * 0.62;

  /* ── Rotation state — all ref-based to avoid React re-renders ────────── */
  const rotationRef = useRef(0);       // current visual rotation
  const targetRotation = useRef(0);    // where we're easing toward
  const velocityRef = useRef(0);       // angular velocity for momentum
  const rafRef = useRef<number>(0);
  const lastTime = useRef(0);
  const isDragging = useRef(false);
  const wasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragPrevX = useRef(0);
  const dragStartRotation = useRef(0);
  const lastInteraction = useRef(0);
  const cylinderRef = useRef<HTMLDivElement>(null);

  /* ── Focused project ───────────────────────────────────────────────────── */
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  /* ── Animation loop — direct DOM writes, zero React re-renders ─────── */
  useEffect(() => {
    // Smoothing factor: lower = smoother/slower easing
    const SMOOTHING = 0.08;
    // Momentum friction: how fast velocity decays (0–1, lower = longer glide)
    const FRICTION = 0.94;
    // Velocity threshold below which we stop applying momentum
    const VEL_EPSILON = 0.01;

    const tick = (time: number) => {
      if (!lastTime.current) lastTime.current = time;
      const rawDt = (time - lastTime.current) / 1000;
      const dt = Math.min(rawDt, 0.05); // cap at 50ms to prevent jumps
      lastTime.current = time;

      // Auto-rotate when idle
      if (
        autoRotate &&
        !isDragging.current &&
        focusedIndex === null &&
        performance.now() - lastInteraction.current > 1500
      ) {
        targetRotation.current -= autoSpeed * dt;
      }

      // Apply momentum when not dragging and velocity is significant
      if (!isDragging.current && Math.abs(velocityRef.current) > VEL_EPSILON) {
        targetRotation.current += velocityRef.current * dt * 60;
        velocityRef.current *= Math.pow(FRICTION, dt * 60);
        if (Math.abs(velocityRef.current) < VEL_EPSILON) {
          velocityRef.current = 0;
        }
      }

      // Frame-rate-independent exponential interpolation
      const frameSmoothing = 1 - Math.pow(1 - SMOOTHING, dt * 60);
      const diff = targetRotation.current - rotationRef.current;
      rotationRef.current += diff * frameSmoothing;

      // Direct DOM write — no React setState, no VDOM diff
      if (cylinderRef.current) {
        cylinderRef.current.style.transform = `
          translate(-50%, -50%)
          translateZ(-${radius}px)
          rotateY(${rotationRef.current}deg)
        `;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoRotate, autoSpeed, focusedIndex, radius]);

  /* ── Pointer handlers with velocity tracking ───────────────────────────── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    wasDragged.current = false;
    velocityRef.current = 0; // kill momentum on grab
    dragStartX.current = e.clientX;
    dragPrevX.current = e.clientX;
    dragStartRotation.current = targetRotation.current;
    lastInteraction.current = performance.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    const frameDx = e.clientX - dragPrevX.current;
    dragPrevX.current = e.clientX;
    if (Math.abs(dx) > 5) wasDragged.current = true;
    targetRotation.current = dragStartRotation.current + dx * 0.18;
    // Track velocity from frame-to-frame mouse delta
    velocityRef.current = frameDx * 0.04;
    lastInteraction.current = performance.now();
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    // Momentum continues via velocityRef in the animation loop
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    targetRotation.current -= e.deltaY * 0.06;
    velocityRef.current = 0; // reset momentum on scroll
    lastInteraction.current = performance.now();
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (wasDragged.current) return;
      if (focusedIndex === index) {
        setFocusedIndex(null);
        return;
      }
      velocityRef.current = 0; // kill momentum on click
      const targetAngle = -index * angleStep;
      const currentMod = ((targetRotation.current % 360) + 360) % 360;
      const targetMod = ((targetAngle % 360) + 360) % 360;
      let diff = targetMod - currentMod;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      targetRotation.current += diff;
      lastInteraction.current = performance.now();
      setFocusedIndex(index);
    },
    [focusedIndex, angleStep]
  );

  /* ── Camera ────────────────────────────────────────────────────────────── */
  const perspective = isMobile ? 1200 : 1800;

  return (
    <div className="relative w-full">
      {/* 3D Scene — straight-on camera */}
      <div
        className="relative mx-auto select-none py-10"
        style={{
          width: "100%",
          height: `${cardHeight + 200}px`,
          perspective: `${perspective}px`,
          perspectiveOrigin: "50% 50%",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Rotating cylinder — transform driven by rAF via ref, not React state */}
        <div
          ref={cylinderRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            willChange: "transform",
            transform: `
              translate(-50%, -50%)
              translateZ(-${radius}px)
              rotateY(0deg)
            `,
          }}
        >

          {/* ── Curved Project Cards ─────────────────────────────────── */}
          {items.map((item, i) => {
            const cardAngle = i * angleStep;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  left: `${-cardWidth / 2}px`,
                  top: `${-cardHeight / 2}px`,
                  transformStyle: "preserve-3d",
                  transform: `
                    rotateY(${cardAngle}deg)
                    translateZ(${radius}px)
                  `,
                  backfaceVisibility: "hidden",
                }}
                onClick={() => handleCardClick(i)}
              >
                <CurvedProjectCard
                  item={item}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Focused project overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {focusedIndex !== null && items[focusedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setFocusedIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.75, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-4 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Liquid glass border */}
              <div
                className="absolute -inset-[4px] rounded-3xl"
                style={{
                  background: `linear-gradient(
                    140deg,
                    rgba(255, 255, 255, 0.55) 0%,
                    rgba(255, 138, 61, 0.25) 25%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 138, 61, 0.3) 75%,
                    rgba(255, 255, 255, 0.5) 100%
                  )`,
                  boxShadow: `
                    0 0 60px rgba(255, 138, 61, 0.3),
                    0 25px 80px rgba(0, 0, 0, 0.4),
                    inset 0 1px 2px rgba(255, 255, 255, 0.5)
                  `,
                }}
              />

              <div className="relative overflow-hidden rounded-3xl bg-[#0d0b09]">
                <div className="relative aspect-video w-full">
                  <Image
                    src={items[focusedIndex].src}
                    alt={items[focusedIndex].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 95vw, 800px"
                    priority
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-syne text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
                    {items[focusedIndex].title}
                  </h3>
                  {items[focusedIndex].cat && (
                    <p className="mt-2 font-researcher text-[10px] uppercase tracking-[0.3em] text-[#ff8a3d]">
                      {items[focusedIndex].cat}
                    </p>
                  )}
                  {items[focusedIndex].desc && (
                    <p className="mt-4 text-sm leading-relaxed text-white/60 font-syne">
                      {items[focusedIndex].desc}
                    </p>
                  )}
                  {items[focusedIndex].tags &&
                    items[focusedIndex].tags!.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items[focusedIndex].tags!.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-3 py-1 font-researcher text-[9px] uppercase tracking-[0.2em] text-white/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  <div className="mt-6 flex gap-4">
                    {items[focusedIndex].link && (
                      <a
                        href={items[focusedIndex].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#ff8a3d] px-6 py-2.5 font-researcher text-[10px] font-black uppercase tracking-[0.3em] text-black transition-all duration-300 hover:bg-[#ffaa6d] hover:shadow-[0_0_30px_rgba(255,138,61,0.5)]"
                      >
                        View Live
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M17 7H7M17 7v10"
                          />
                        </svg>
                      </a>
                    )}
                    {items[focusedIndex].github && (
                      <a
                        href={items[focusedIndex].github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 font-researcher text-[10px] uppercase tracking-[0.3em] text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFocusedIndex(null)}
                className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1612] text-white/70 shadow-lg transition-colors hover:bg-[#ff8a3d] hover:text-black"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProjectWheel3D;
