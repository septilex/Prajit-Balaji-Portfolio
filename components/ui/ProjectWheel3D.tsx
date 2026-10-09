"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Magnetic } from "@/components/ui/Magnetic";

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

/* ─── Faceted Curved Project Card ──────────────────────────────────────────── */
/*
 * Each card is divided into FACETS wide vertical segments with progressive
 * rotation angles. The center segment faces the camera; outer segments bend
 * away with increasing angles, forming a faceted curved glass display.
 * The image is laminated inside a thick liquid-glass slab:
 *   glass front → project image → glass back + visible 3D edge thickness.
 */

const FACETS = 7;
const GLASS_DEPTH = 10; // half-thickness in px; total slab depth = 20px
// Progressive Y-rotation per facet: center flat, edges bend away
const FACET_ROTATIONS = [-16, -7, -2.5, 0, 2.5, 7, 16];

/** Compute facet center (x, z) so adjacent facets connect edge-to-edge. */
function computeFacetCenters(segW: number) {
  const N = FACET_ROTATIONS.length;
  const mid = Math.floor(N / 2);
  const cx: number[] = new Array(N).fill(0);
  const cz: number[] = new Array(N).fill(0);

  // Walk right from center
  for (let i = mid; i < N - 1; i++) {
    const ti = (FACET_ROTATIONS[i] * Math.PI) / 180;
    const tj = (FACET_ROTATIONS[i + 1] * Math.PI) / 180;
    const rx = cx[i] + (segW / 2) * Math.cos(ti);
    const rz = cz[i] - (segW / 2) * Math.sin(ti);
    cx[i + 1] = rx + (segW / 2) * Math.cos(tj);
    cz[i + 1] = rz - (segW / 2) * Math.sin(tj);
  }

  // Walk left from center
  for (let i = mid; i > 0; i--) {
    const ti = (FACET_ROTATIONS[i] * Math.PI) / 180;
    const tj = (FACET_ROTATIONS[i - 1] * Math.PI) / 180;
    const lx = cx[i] - (segW / 2) * Math.cos(ti);
    const lz = cz[i] + (segW / 2) * Math.sin(ti);
    cx[i - 1] = lx - (segW / 2) * Math.cos(tj);
    cz[i - 1] = lz + (segW / 2) * Math.sin(tj);
  }

  return FACET_ROTATIONS.map((rot, i) => ({ x: cx[i], z: cz[i], rot }));
}

function CurvedProjectCard({
  item,
  cardWidth,
  cardHeight,
  isFocused,
}: {
  item: ProjectWheelItem;
  cardWidth: number;
  cardHeight: number;
  isFocused: boolean;
}) {
  const segW = cardWidth / FACETS;
  const facets = React.useMemo(() => computeFacetCenters(segW), [segW]);

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* ═══ FACETED LIQUID-GLASS SLAB ═══
           Glass Back → Image Inside → Glass Front + 3D Thickness Edges */}

      {/* ── Ambient outer glow (behind everything) ── */}
      <div
        className="absolute pointer-events-none rounded-[28px]"
        style={{
          inset: "-18px",
          transform: "translateZ(-22px)",
          background: `radial-gradient(
            ellipse at 50% 40%,
            rgba(255, 180, 120, 0.07) 0%,
            rgba(255, 138, 61, 0.035) 40%,
            transparent 70%
          )`,
          boxShadow: "0 0 70px rgba(255,138,61,0.05), 0 30px 90px rgba(0,0,0,0.10)",
        }}
      />

      {/* ── Per-facet panel stack ── */}
      {facets.map((f, i) => {
        const isFirst = i === 0;
        const isLast = i === FACETS - 1;
        const edgeR = isFirst
          ? "16px 0 0 16px"
          : isLast
          ? "0 16px 16px 0"
          : "0";

        return (
          <motion.div
            key={i}
            className="absolute top-0"
            initial={false}
            animate={{
              x: isFocused ? (i - Math.floor(FACETS / 2)) * segW - segW / 2 : f.x - segW / 2,
              z: isFocused ? 0 : f.z,
              rotateY: isFocused ? 0 : f.rot,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: `${segW + 1.5}px`,
              height: "100%",
              left: "50%",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Glass Back Surface */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: edgeR,
                transform: `translateZ(${-GLASS_DEPTH}px)`,
                background: `linear-gradient(180deg,
                  rgba(255,245,230,0.06) 0%,
                  rgba(220,180,140,0.04) 50%,
                  rgba(200,150,100,0.07) 100%)`,
                boxShadow: "inset 0 0 10px rgba(255,200,150,0.03)",
              }}
            />

            {/* Project Image — clean, no overlays */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: edgeR }}
            >
              <div
                className="absolute top-0 h-full"
                style={{
                  width: `${cardWidth}px`,
                  left: `${-i * segW}px`,
                  backgroundImage: `url(${item.src})`,
                  backgroundSize: `${cardWidth}px ${cardHeight}px`,
                  backgroundPosition: "0 0",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>

            {/* Glass Front Surface */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: edgeR,
                transform: `translateZ(${GLASS_DEPTH}px)`,
                background: `linear-gradient(175deg,
                  rgba(255,255,255,0.09) 0%,
                  rgba(255,255,255,0.025) 18%,
                  transparent 40%,
                  transparent 70%,
                  rgba(255,225,195,0.02) 88%,
                  rgba(255,200,150,0.05) 100%)`,
              }}
            />

            {/* Top thickness edge — shows glass depth from above */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: `${segW + 1.5}px`,
                height: `${GLASS_DEPTH * 2}px`,
                left: 0,
                top: `${-GLASS_DEPTH}px`,
                transformOrigin: "50% 50%",
                transform: "rotateX(90deg)",
                borderRadius:
                  isFirst ? "8px 0 0 0" : isLast ? "0 8px 0 0" : "0",
                background: `linear-gradient(180deg,
                  rgba(255,255,255,0.18) 0%,
                  rgba(255,245,230,0.10) 35%,
                  rgba(255,220,190,0.06) 65%,
                  rgba(200,160,120,0.03) 100%)`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            />

            {/* Bottom thickness edge — warm copper tone */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: `${segW + 1.5}px`,
                height: `${GLASS_DEPTH * 2}px`,
                left: 0,
                bottom: `${-GLASS_DEPTH}px`,
                transformOrigin: "50% 50%",
                transform: "rotateX(90deg)",
                borderRadius:
                  isFirst ? "0 0 0 8px" : isLast ? "0 0 8px 0" : "0",
                background: `linear-gradient(0deg,
                  rgba(200,140,80,0.22) 0%,
                  rgba(255,180,120,0.14) 30%,
                  rgba(255,220,190,0.07) 65%,
                  rgba(255,245,235,0.03) 100%)`,
                boxShadow: "0 4px 12px rgba(180,120,60,0.08)",
              }}
            />

            {/* Left outer glass edge (first facet only) */}
            {isFirst && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: `${GLASS_DEPTH * 2}px`,
                  height: "100%",
                  left: `${-GLASS_DEPTH}px`,
                  top: 0,
                  transformOrigin: "50% 50%",
                  transform: "rotateY(-90deg)",
                  borderRadius: "12px 0 0 12px",
                  background: `linear-gradient(90deg,
                    rgba(255,220,190,0.20) 0%,
                    rgba(255,200,150,0.12) 30%,
                    rgba(200,160,120,0.05) 70%,
                    rgba(180,140,100,0.02) 100%)`,
                  boxShadow: `
                    inset 0 2px 4px rgba(255,255,255,0.18),
                    inset 0 -2px 6px rgba(200,140,80,0.10),
                    0 0 8px rgba(255,180,120,0.05)`,
                }}
              />
            )}

            {/* Right outer glass edge (last facet only) */}
            {isLast && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: `${GLASS_DEPTH * 2}px`,
                  height: "100%",
                  right: `${-GLASS_DEPTH}px`,
                  top: 0,
                  transformOrigin: "50% 50%",
                  transform: "rotateY(90deg)",
                  borderRadius: "0 12px 12px 0",
                  background: `linear-gradient(-90deg,
                    rgba(255,220,190,0.20) 0%,
                    rgba(255,200,150,0.12) 30%,
                    rgba(200,160,120,0.05) 70%,
                    rgba(180,140,100,0.02) 100%)`,
                  boxShadow: `
                    inset 0 2px 4px rgba(255,255,255,0.18),
                    inset 0 -2px 6px rgba(200,140,80,0.10),
                    0 0 8px rgba(255,180,120,0.05)`,
                }}
              />
            )}

            {/* ── Curved Title Text Below Card (Fades out when focused) ── */}
            <motion.div
              className="absolute top-full left-0 overflow-hidden pointer-events-none mt-6 md:mt-8"
              initial={false}
              animate={{ opacity: isFocused ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: `${segW + 1.5}px`,
                height: "60px",
                transform: `translateZ(${GLASS_DEPTH}px)`,
              }}
            >
              <div
                className="absolute top-0 flex flex-col items-center justify-start"
                style={{
                  width: `${cardWidth}px`,
                  left: `${-i * segW}px`,
                }}
              >
                <h3 className="font-researcher text-[14px] md:text-[18px] font-black uppercase tracking-[0.25em] text-black transition-colors group-hover:text-[#ff8a3d] drop-shadow-[0_0_10px_rgba(255,138,61,0.3)]">
                  {item.title}
                </h3>
                {item.cat && (
                  <p className="mt-1.5 font-syne text-[10px] md:text-[12px] font-bold uppercase tracking-[0.1em] text-black/40">
                    {item.cat}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* ── Floating specular highlight (in front, no image interference) ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 rounded-t-2xl"
        style={{
          height: "35%",
          transform: `translateZ(${GLASS_DEPTH + 3}px)`,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      {/* ── Subtle orange edge reflections (float in front of glass) ── */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-l-2xl"
        style={{
          width: "28px",
          transform: `translateZ(${GLASS_DEPTH + 2}px)`,
          background:
            "linear-gradient(to right, rgba(255,160,80,0.06) 0%, rgba(255,138,61,0.02) 50%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 bottom-0 right-0 rounded-r-2xl"
        style={{
          width: "28px",
          transform: `translateZ(${GLASS_DEPTH + 2}px)`,
          background:
            "linear-gradient(to left, rgba(255,160,80,0.06) 0%, rgba(255,138,61,0.02) 50%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl"
        style={{
          height: "36px",
          transform: `translateZ(${GLASS_DEPTH + 2}px)`,
          background:
            "linear-gradient(to top, rgba(200,140,80,0.12) 0%, rgba(255,180,120,0.04) 60%, transparent 100%)",
        }}
      />

      {/* ── Flat Title & Buttons (Fades in when focused) ── */}
      <motion.div
        className="absolute top-[20%] right-full mr-8 md:mr-12 w-[220px] md:w-[280px] flex flex-col items-end text-right"
        initial={false}
        animate={{ opacity: isFocused ? 1 : 0, x: isFocused ? 0 : 20 }}
        transition={{ duration: 0.5, delay: isFocused ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
        style={{ transform: `translateZ(${GLASS_DEPTH}px)`, pointerEvents: isFocused ? "auto" : "none" }}
      >
        <h3 className="font-researcher text-[16px] md:text-[22px] font-black uppercase tracking-[0.25em] text-black drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-tight">
          {item.title}
        </h3>
        {item.cat && (
          <p className="mt-2 font-syne text-[10px] md:text-[12px] font-bold uppercase tracking-[0.1em] text-black/40">
            {item.cat}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 items-end">
          {item.link && (
            <Magnetic strength={0.3}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn-black relative inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-researcher text-[9px] md:text-[10px] uppercase tracking-widest"
              >
                Vercel / Live
              </a>
            </Magnetic>
          )}
          {item.github && (
            <Magnetic strength={0.3}>
              <a
                href={item.github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn-white relative inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-researcher text-[9px] md:text-[10px] uppercase tracking-widest"
              >
                GitHub
              </a>
            </Magnetic>
          )}
        </div>
      </motion.div>

      {/* (Text overlay and bottom shadow removed since title is now below the card) */}
    </div>
  );
}


/* ─── Main Wheel Component ──────────────────────────────────────────────────── */

const glassStyles = `
  .glass-btn-black {
    color: #bd6a2b;
    background: linear-gradient(180deg, rgba(40,40,40,0.85) 0%, rgba(15,15,15,0.95) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0,0,0,0.8);
    border-top: 1px solid rgba(255,255,255,0.25);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.25),
      inset 0 -2px 6px rgba(0,0,0,0.8),
      0 6px 0px rgba(10,10,10,0.95),
      0 6px 4px rgba(255,138,61,0.15),
      0 14px 20px rgba(0,0,0,0.5),
      0 0 15px rgba(255,138,61,0.15);
    text-shadow: 0 0 4px rgba(255,138,61,0.2);
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.25s, color 0.25s, background 0.3s;
    margin-bottom: 6px;
  }
  .glass-btn-black:hover {
    color: #ffebd6;
    background: linear-gradient(180deg, rgba(50,50,50,0.9) 0%, rgba(20,20,20,0.98) 100%);
    border-top: 1px solid rgba(255,255,255,0.35);
    box-shadow: 
      inset 0 1px 2px rgba(255,255,255,0.4),
      inset 0 -2px 6px rgba(0,0,0,0.8),
      0 6px 0px rgba(10,10,10,0.95),
      0 6px 6px rgba(255,138,61,0.25),
      0 16px 25px rgba(255,138,61,0.1),
      0 0 35px rgba(255,138,61,0.6);
    text-shadow: 0 0 12px rgba(255,138,61,1), 0 0 20px rgba(255,138,61,0.8);
  }
  .glass-btn-black:active {
    transform: translateY(6px);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.15),
      inset 0 -1px 4px rgba(0,0,0,0.9),
      0 0px 0px rgba(10,10,10,0.95),
      0 0px 0px rgba(255,138,61,0.15),
      0 4px 10px rgba(0,0,0,0.4),
      0 0 20px rgba(255,138,61,0.4);
  }

  .glass-btn-white {
    color: #000000;
    background: linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(220,220,220,0.4) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0,0,0,0.1);
    border-top: 1px solid rgba(255,255,255,0.9);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,1),
      inset 0 -2px 6px rgba(0,0,0,0.15),
      0 6px 0px rgba(170,170,170,0.6),
      0 6px 4px rgba(255,255,255,0.3),
      0 14px 20px rgba(0,0,0,0.15),
      0 0 15px rgba(255,255,255,0.4);
    text-shadow: none;
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.25s, color 0.25s, background 0.3s;
    margin-bottom: 6px;
  }
  .glass-btn-white:hover {
    color: #ffffff;
    background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(240,240,240,0.5) 100%);
    border-top: 1px solid rgba(255,255,255,1);
    box-shadow: 
      inset 0 1px 2px rgba(255,255,255,1),
      inset 0 -2px 6px rgba(0,0,0,0.15),
      0 6px 0px rgba(170,170,170,0.6),
      0 6px 6px rgba(255,255,255,0.5),
      0 16px 25px rgba(0,0,0,0.2),
      0 0 35px rgba(255,255,255,0.8);
    text-shadow: 0 0 12px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8);
  }
  .glass-btn-white:active {
    transform: translateY(6px);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.8),
      inset 0 -1px 4px rgba(0,0,0,0.1),
      0 0px 0px rgba(170,170,170,0.6),
      0 0px 0px rgba(255,255,255,0.3),
      0 4px 10px rgba(0,0,0,0.1),
      0 0 20px rgba(255,255,255,0.6);
  }

  /* Reflection highlights */
  .glass-btn-black::before, .glass-btn-white::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8%;
    right: 8%;
    height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%);
    border-radius: 50px 50px 0 0;
    pointer-events: none;
  }
  .glass-btn-white::before {
    background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%);
  }
`;

export function ProjectWheel3D({
  items,
  autoSpeed = 8,
  autoRotate = true,
}: ProjectWheel3DProps) {
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

  // Dynamically duplicate items to form a dense, continuous horizontal bracelet
  const displayItems = React.useMemo(() => {
    const targetGap = isMobile ? 15 : 25;
    const targetChord = cardWidth + targetGap;
    const val = targetChord / (2 * radius);
    const idealTheta = 2 * Math.asin(Math.min(val, 1)) * (180 / Math.PI);
    const idealCount = Math.max(items.length, Math.round(360 / idealTheta));
    
    let arr = [...items];
    while (arr.length < idealCount) {
      arr = [...arr, ...items];
    }
    return arr.slice(0, idealCount);
  }, [items, isMobile, cardWidth, radius]);

  const count = displayItems.length;
  const angleStep = 360 / count;

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
  const [frozenAngle, setFrozenAngle] = useState<number>(0);

  /* ── Animation loop — direct DOM writes, zero React re-renders ─────── */
  useEffect(() => {
    // Smoothing factor: lower = smoother/slower easing
    const SMOOTHING = 0.08;
    // Momentum friction: how fast velocity decays (0–1, lower = longer glide)
    const FRICTION = 0.94;
    // Velocity threshold below which we stop applying momentum
    const VEL_EPSILON = 0.01;

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    if (cylinderRef.current?.parentElement) {
      observer.observe(cylinderRef.current.parentElement);
    }

    const tick = (time: number) => {
      if (!isVisible) {
        lastTime.current = 0; // Prevent delta jump on return
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      
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
        
        // GPU Culling: Hide cards facing away from the camera to avoid compositing 140+ facets
        const children = cylinderRef.current.children;
        const total = children.length;
        if (total > 0) {
          const step = 360 / total;
          for (let i = 0; i < total; i++) {
            const card = children[i] as HTMLElement;
            const cardAngle = i * step;
            let absAngle = (rotationRef.current + cardAngle) % 360;
            if (absAngle < 0) absAngle += 360;
            if (absAngle > 180) absAngle -= 360;
            
            // Visible only if within 100 degrees of the front (camera is 0)
            const cardVisible = Math.abs(absAngle) < 100;
            const visStr = cardVisible ? "visible" : "hidden";
            
            // Only update DOM if changed to prevent style recalculation thrashing
            if (card.style.visibility !== visStr) {
              card.style.visibility = visStr;
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [autoRotate, autoSpeed, focusedIndex, radius]);

  /* ── Pointer handlers with velocity tracking ───────────────────────────── */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (focusedIndex !== null) {
      setFocusedIndex(null);
      return;
    }
    isDragging.current = true;
    wasDragged.current = false;
    velocityRef.current = 0; // kill momentum on grab
    dragStartX.current = e.clientX;
    dragPrevX.current = e.clientX;
    dragStartRotation.current = targetRotation.current;
    lastInteraction.current = performance.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [focusedIndex]);

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
      
      // If ANY card is already focused, do not open a new one. 
      // The onPointerDown handler on the container will handle dismissing it.
      if (focusedIndex !== null) {
        if (focusedIndex === index) {
          setFocusedIndex(null);
        }
        return;
      }
      
      velocityRef.current = 0; // kill momentum on click
      
      // Calculate the angle needed to center this card
      const cardAngle = index * angleStep;
      const targetAngle = -cardAngle;
      
      // Find the shortest path to the target angle to prevent spinning the long way around
      const current = targetRotation.current;
      let diff = (targetAngle - current) % 360;
      if (diff > 180) diff -= 360;
      else if (diff < -180) diff += 360;
      
      targetRotation.current = current + diff;
      
      lastInteraction.current = performance.now();
      setFocusedIndex(index);
    },
    [focusedIndex, angleStep]
  );

  /* ── Camera ────────────────────────────────────────────────────────────── */
  const perspective = isMobile ? 1200 : 1800;

  return (
    <div className="relative w-full">
      <style>{glassStyles}</style>
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
        {/* Click anywhere on the container background to reset focus */}
        <div 
          className="absolute inset-0 z-0" 
          onClick={() => setFocusedIndex(null)}
        />
        
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
          {displayItems.map((item, i) => {
            const cardAngle = i * angleStep;
            const isFocused = focusedIndex === i;

            return (
              <motion.div
                key={i}
                className="absolute"
                initial={false}
                animate={{
                  transform: isFocused 
                    ? `rotateY(${cardAngle}deg) translateZ(${radius + 120}px) scale(1.1)`
                    : `rotateY(${cardAngle}deg) translateZ(${radius}px) scale(1)`,
                  opacity: focusedIndex !== null && !isFocused ? 0.25 : 1,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  left: `${-cardWidth / 2}px`,
                  top: `${-cardHeight / 2}px`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden" as any,
                }}
                onPointerDown={(e) => {
                  if (isFocused) {
                    e.stopPropagation();
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent background click from triggering
                  handleCardClick(i);
                }}
              >
                <CurvedProjectCard
                  item={item}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isFocused={isFocused}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectWheel3D;
