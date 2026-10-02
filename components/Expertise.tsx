"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ProximitySkillList } from "@/components/ui/ExpertiseHoverItem";

// ─── Data ────────────────────────────────────────────────────────────────────

type ExpertiseCategoryData = {
  title: string;
  description: string;
  skills: string[];
};

const EXPERTISE_DATA: ExpertiseCategoryData[] = [
  {
    title: "AI & Intelligent Systems",
    description:
      "Building intelligent systems that learn, adapt, and solve real problems.",
    skills: [
      "OpenAI",
      "LLMs",
      "RAG",
      "AI Agents",
      "Prompt Engineering",
      "AI Workflows",
    ],
  },
  {
    title: "Full-Stack Development",
    description:
      "Crafting end-to-end products with modern frameworks and clean architecture.",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express.js",
      "Tailwind CSS",
    ],
  },
  {
    title: "Backend & Infrastructure",
    description:
      "Designing resilient, scalable systems from APIs to deployment pipelines.",
    skills: ["MongoDB", "PostgreSQL", "REST APIs", "Docker", "AWS", "Vercel"],
  },
  {
    title: "UI/UX & Creative Engineering",
    description:
      "Blending art with technology to build experiences people remember.",
    skills: [
      "UI/UX Design",
      "Motion Design",
      "Interaction Design",
      "Three.js / React Three Fiber",
      "Performance Optimization",
      "Responsive Design",
    ],
  },
];

// ─── Futuristic HUD background ───────────────────────────────────────────────

function ExpertiseHudBackground({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="expertiseFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a2a1c" stopOpacity="0.22" />
            <stop offset="0.5" stopColor="#3a2a1c" stopOpacity="0.08" />
            <stop offset="1" stopColor="#3a2a1c" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="orangeHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff8a3d" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer technical frame */}
        <g fill="none" stroke="#3a2a1c" strokeOpacity="0.28" strokeWidth="1">
          <path d="M38 34 L72 34 L176 138 L475 138" />
          <path d="M38 34 L38 84" />
          <path d="M72 34 L104 66" />
          <path d="M127 212 L205 212 L238 179" />
          <path d="M92 214 L65 241 L65 672 L96 703 L96 784 L129 817" />
          <path d="M129 817 L276 817" />
          <path d="M232 697 L313 697 L355 740 L476 740" />
          <path d="M482 711 L528 711 L581 763" />
          <path d="M580 763 L626 809" />
          <path d="M1490 94 L1490 179 L1531 220 L1531 657 L1492 696 L1492 742" />
          <path d="M1531 220 L1570 181 L1570 92" />
          <path d="M1353 185 L1458 185 L1492 219" />
          <path d="M1079 136 L1118 176 L1444 176" />
          <path d="M962 136 L1079 136" />
          <path d="M1444 176 L1504 236" />
          <path d="M1503 665 L1463 705 L1463 758" />
          <path d="M1320 833 L1424 833 L1499 758" />
          <path d="M1030 834 L1180 834" />
        </g>

        {/* Accent frame pieces */}
        <g fill="none" stroke="#ff8a3d" strokeWidth="1.2" strokeLinecap="round">
          <path d="M58 182 L97 221 L97 245" />
          <path d="M73 757 L202 757" />
          <path d="M1346 838 L1442 838" />
          <path d="M1511 211 L1553 169" />
          <path d="M1037 191 L1127 191" />
          <path d="M678 189 L729 189" />
          <path d="M856 189 L922 189" />
        </g>

        {/* Header technical micro-lines */}
        <g fill="none" stroke="#3a2a1c" strokeOpacity="0.54" strokeWidth="1">
          <path d="M239 94 L239 125" />
          <path d="M258 111 L278 111" />
          <path d="M334 184 L443 184" />
          <path d="M459 184 L475 184" />
          <path d="M472 206 L602 206" />
          <path d="M597 206 L654 206" />
          <path d="M932 111 L1078 111" />
        </g>

        {/* Header orange indicator + dotted run */}
        <g stroke="#ff8a3d" strokeWidth="1.5" strokeLinecap="round">
          <path d="M693 190 L786 190" />
          <path d="M819 190 L825 190" />
          <path d="M835 190 L841 190" />
          <path d="M851 190 L857 190" />
          <path d="M867 190 L873 190" />
          <path d="M883 190 L889 190" />
          <path d="M899 190 L905 190" />
          <path d="M915 190 L921 190" />
        </g>


        {/* Main targeting HUD and tick ring have been moved to HUDCounterRadar */}

        {/* HUD nodes / crosshair markers */}
        <g>
          <circle cx="276" cy="255" r="7" fill="#ff8a3d" fillOpacity="0.95" filter="url(#softGlow)" />
          <circle cx="276" cy="255" r="18" fill="url(#orangeHalo)" />
          <rect x="620" y="493" width="9" height="9" fill="#ff8a3d" />
          <circle cx="528" cy="265" r="3" fill="#ff8a3d" />
          <circle cx="651" cy="349" r="2.5" fill="#ff8a3d" />
          <path d="M485 563 h23 m-11.5 -11.5 v23" stroke="#ff8a3d" strokeWidth="1.5" />
          <path d="M238 214 h18 m-9 -9 v18" stroke="#ff8a3d" strokeWidth="1.5" />
          <path d="M646 278 h18 m-9 -9 v18" stroke="#3a2a1c" strokeOpacity="0.65" />
        </g>

        {/* Left micro details */}
        <g fill="none" strokeLinecap="round">
          <path d="M66 367 h35" stroke="#ff8a3d" strokeWidth="2" />
          <path d="M70 388 h15" stroke="#3a2a1c" strokeOpacity="0.55" />
          <circle cx="71" cy="347" r="2" fill="#ff8a3d" />
          <circle cx="71" cy="359" r="2" fill="#3a2a1c" fillOpacity="0.58" />
          <circle cx="71" cy="371" r="2" fill="#3a2a1c" fillOpacity="0.58" />
          <path d="M131 562 h25" stroke="#3a2a1c" strokeOpacity="0.5" />
          <path d="M155 579 h26" stroke="#ff8a3d" strokeWidth="1.2" />
          <path d="M199 579 h18" stroke="#3a2a1c" strokeOpacity="0.45" />
        </g>

        {/* Expertise overview micro label */}
        <g fontFamily="inherit" fontSize="9" letterSpacing="3">
          <text x="214" y="708" fill="#3a2a1c" fillOpacity="0.76">EXPERTISE</text>
          <text x="214" y="723" fill="#3a2a1c" fillOpacity="0.76">OVERVIEW</text>
        </g>
        <g fill="#ff8a3d" opacity="0.9">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={218 + (i % 6) * 11} cy={747 + Math.floor(i / 6) * 10} r="1.6" />
          ))}
        </g>

        {/* Central/right connector system (Removed hardcoded horizontal grid lines) */}
        <g fill="none" stroke="#3a2a1c" strokeOpacity="0.38" strokeWidth="1">
          <path d="M685 251 L739 251 L760 230 L1055 230" />
          <path d="M658 574 L699 574" />
        </g>

        {/* Right technical metadata */}
        <g fontFamily="inherit" fontSize="8" letterSpacing="2.5" fill="#3a2a1c" fillOpacity="0.7">
          <text x="1420" y="295">// INTELLIGENCE</text>
          <text x="1420" y="309">// SYSTEMS</text>
          <text x="1420" y="323">// REAL IMPACT</text>
        </g>
        <g stroke="#3a2a1c" strokeOpacity="0.54" strokeWidth="1">
          <path d="M1396 274 h48" />
          <path d="M1421 263 l17 -17" />
          <path d="M1452 341 v31" />
        </g>
        <g stroke="#3a2a1c" strokeOpacity="0.46" strokeWidth="1">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M1428 ${248 + i * 7} l8 -8`} />
          ))}
        </g>

        {/* Right dotted matrix */}
        <g fill="#3a2a1c" fillOpacity="0.42">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={1431 + (i % 6) * 12} cy={554 + Math.floor(i / 6) * 12} r="1.1" />
          ))}
        </g>

        {/* Right edge markers */}
        <g>
          <rect x="1531" y="221" width="6" height="6" fill="#ff8a3d" />
          <rect x="1531" y="577" width="5" height="5" fill="#ff8a3d" />
          <rect x="1531" y="668" width="5" height="5" fill="#ff8a3d" />
          <circle cx="1548" cy="357" r="2.5" fill="#ff8a3d" />
        </g>

        {/* Bottom data / hatch details */}
        <g fill="#ff8a3d" opacity="0.8">
          {Array.from({ length: 16 }).map((_, i) => (
            <circle key={i} cx={1213 + (i % 8) * 10} cy={823 + Math.floor(i / 8) * 10} r="1.25" />
          ))}
        </g>
        <g stroke="#3a2a1c" strokeOpacity="0.46" strokeWidth="1">
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M1350 ${806 + i * 7} l11 -11`} />
          ))}
        </g>

        {/* Bottom-right targeting module */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1450 772 L1480 742 L1557 742 L1581 766 L1581 817 L1555 842 L1482 842 L1450 811 Z" stroke="#ff8a3d" strokeWidth="1.1" />
          <path d="M1472 783 L1489 766 L1544 766 L1560 782 L1560 814 L1544 829 L1490 829 L1472 812 Z" stroke="#3a2a1c" strokeOpacity="0.52" />
          <rect x="1499" y="788" width="28" height="28" stroke="#3a2a1c" strokeOpacity="0.52" />
          <path d="M1513 793 v18 m-9 -9 h18" stroke="#3a2a1c" strokeWidth="1.2" />
          <circle cx="1549" cy="761" r="3" fill="#ff8a3d" stroke="none" />
        </g>



        {/* Minimal crosshair / alignment markers */}
        <g stroke="#3a2a1c" strokeOpacity="0.56" strokeWidth="1">
          <path d="M626 199 v24 m-12 -12 h24" />
          <path d="M1236 278 v24 m-12 -12 h24" />
          <path d="M153 691 v24 m-12 -12 h24" />
          <path d="M680 816 v14 m-7 -7 h14" />
        </g>

        {/* Animated section activity marker */}
        <motion.circle
          cx="1268"
          cy="527"
          r="13"
          fill="none"
          stroke="#ff8a3d"
          strokeWidth="1"
          animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <circle cx="1268" cy="527" r="2.2" fill="#ff8a3d" />

        {/* Active category pulse near the main HUD */}
        <motion.rect
          x="620"
          y={492 + activeIndex * 0.5}
          width="9"
          height="9"
          fill="#ff8a3d"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// ─── SkillRow ────────────────────────────────────────────────────────────────

function SkillRow({ name, index }: { name: string; index: number }) {
  const padded = String(index + 1).padStart(2, "0");

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);
  const shiftX = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="group/skill relative cursor-default border-b border-[#3a2a1c]/15 hover:border-[#ff8a3d]/30 transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "800px" }}
    >
      <motion.div
        className="flex items-center justify-between py-4 px-4 -mx-4 transition-all duration-300 origin-center group-hover/skill:bg-[#3a322b]/[0.02]"
        style={{
          rotateX,
          rotateY,
          x: shiftX,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute left-0 top-0 w-[3px] h-full bg-[#ff8a3d] scale-y-0 group-hover/skill:scale-y-100 transition-transform duration-300 origin-top" />
        <span
          className="font-sans text-sm text-[#3a322b]/70 group-hover/skill:text-[#3a322b] transition-all duration-300"
          style={{ transform: "translateZ(15px)" }}
        >
          {name}
        </span>
        <span
          className="font-researcher text-xs tracking-wider text-[#3a322b]/30 group-hover/skill:text-[#ff8a3d] transition-all duration-300"
          style={{ transform: "translateZ(10px)" }}
        >
          {padded}
        </span>
      </motion.div>
    </div>
  );
}

// ─── Digit Column (Slot-machine counter) ────────────────────────────────────

function DigitColumn({ digit }: { digit: number }) {
  return (
    <div className="relative overflow-hidden" style={{ width: "0.6em", height: "1em" }}>
      <div
        className="absolute left-0 w-full"
        style={{
          transform: `translateY(-${digit}em)`,
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div key={n} className="flex items-center justify-center" style={{ height: "1em" }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Local HUD Counter Radar ──────────────────────────────────────────────────

function HUDCounterRadar() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="140 202 500 500"
        className="w-[140%] md:w-[180%] h-[140%] md:h-[180%] absolute opacity-60 md:opacity-80"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main targeting HUD around the 01 */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="390" cy="452" r="150" stroke="#3a2a1c" strokeOpacity="0.42" strokeDasharray="1.5 5" />
          <circle cx="390" cy="452" r="131" stroke="#3a2a1c" strokeOpacity="0.33" />
        </g>
      </svg>
    </div>
  );
}

// ─── Sticky Digit Counter (Desktop left column) ────────────────────────────

function StickyDigitCounter({ activeIndex, onClick }: { activeIndex: number; onClick: () => void }) {
  const displayNum = activeIndex + 1;
  const tens = Math.floor(displayNum / 10);
  const ones = displayNum % 10;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-1, 1], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="w-full md:w-[40%] flex-shrink-0 relative flex items-center justify-center mb-10 md:mb-0">
      <HUDCounterRadar />
      
      <motion.div
        className="relative z-20 w-full flex items-center justify-center py-8 md:py-12"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="group relative flex justify-center items-center overflow-hidden w-[65%] md:w-[70%] aspect-square rounded-full cursor-pointer bg-[#ff8a3d] hover:brightness-110 border border-[#1a1612]/10"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={{ 
            scale: [1, 1.04, 1],
            boxShadow: [
              "0px 15px 35px rgba(255,138,61,0.2)",
              "0px 25px 50px rgba(255,138,61,0.45)",
              "0px 15px 35px rgba(255,138,61,0.2)"
            ]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
        >
          {/* Inner HUD / Technical design */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            {/* Counter-rotating elements */}
            <svg viewBox="-100 -100 200 200" className="w-full h-full absolute inset-0 animate-[spin_60s_linear_infinite_reverse]">
              {/* Outer thick dashed arc */}
              <circle cx="0" cy="0" r="95" fill="none" stroke="#1a1612" strokeWidth="2" strokeDasharray="10 30" strokeOpacity="0.2" />
              {/* Complex inner arc */}
              <path d="M -60 -60 A 84.8 84.8 0 0 1 60 -60" fill="none" stroke="#1a1612" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M -60 60 A 84.8 84.8 0 0 0 60 60" fill="none" stroke="#1a1612" strokeWidth="1" strokeOpacity="0.4" />
              {/* Tiny ticks */}
              {Array.from({ length: 36 }).map((_, i) => (
                <line key={i} x1="0" y1="-82" x2="0" y2="-85" transform={`rotate(${i * 10})`} stroke="#1a1612" strokeWidth="0.5" strokeOpacity="0.5" />
              ))}
            </svg>

            <svg viewBox="-100 -100 200 200" className="w-full h-full absolute inset-0 animate-[spin_40s_linear_infinite]">
              {/* Outer dashed ring */}
              <circle cx="0" cy="0" r="90" fill="none" stroke="#1a1612" strokeWidth="1" strokeDasharray="4 6" />
              {/* Middle track */}
              <circle cx="0" cy="0" r="70" fill="none" stroke="#1a1612" strokeWidth="0.5" strokeDasharray="1 4" />
              {/* Inner accent ring */}
              <circle cx="0" cy="0" r="50" fill="none" stroke="#1a1612" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="40 10" />
              
              {/* Crosshairs */}
              <path d="M 0 -95 L 0 -85 M 0 85 L 0 95 M -95 0 L -85 0 M 85 0 L 95 0" stroke="#1a1612" strokeWidth="2" />
              
              {/* Rotated accents */}
              <g transform="rotate(45)">
                <path d="M 0 -85 L 0 -75 M 0 75 L 0 85 M -85 0 L -75 0 M 75 0 L 85 0" stroke="#1a1612" strokeWidth="1" strokeOpacity="0.5" />
                {/* Tech chevrons */}
                <path d="M -3 -80 L 0 -83 L 3 -80" fill="none" stroke="#1a1612" strokeWidth="1" />
                <path d="M -3 80 L 0 83 L 3 80" fill="none" stroke="#1a1612" strokeWidth="1" />
              </g>
              
              <g transform="rotate(22.5)">
                <circle cx="0" cy="-90" r="2" fill="#1a1612" />
                <circle cx="0" cy="90" r="2" fill="#1a1612" />
                <circle cx="-90" cy="0" r="2" fill="#1a1612" />
                <circle cx="90" cy="0" r="2" fill="#1a1612" />
              </g>
            </svg>
            
            {/* Static HUD lines & text */}
            <svg viewBox="-100 -100 200 200" className="w-full h-full absolute inset-0">
              {/* Background grid */}
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1a1612" strokeWidth="0.2" strokeOpacity="0.15" />
              </pattern>
              <circle cx="0" cy="0" r="100" fill="url(#grid)" />

              {/* Static cross grid */}
              <path d="M -100 0 L 100 0" stroke="#1a1612" strokeWidth="0.5" strokeDasharray="2 10" strokeOpacity="0.3" />
              <path d="M 0 -100 L 0 100" stroke="#1a1612" strokeWidth="0.5" strokeDasharray="2 10" strokeOpacity="0.3" />
              
              {/* Target brackets (corners) */}
              <path d="M -40 -40 L -30 -40 M -40 -40 L -40 -30" stroke="#1a1612" strokeWidth="1" fill="none" strokeOpacity="0.6" />
              <path d="M 40 -40 L 30 -40 M 40 -40 L 40 -30" stroke="#1a1612" strokeWidth="1" fill="none" strokeOpacity="0.6" />
              <path d="M -40 40 L -30 40 M -40 40 L -40 30" stroke="#1a1612" strokeWidth="1" fill="none" strokeOpacity="0.6" />
              <path d="M 40 40 L 30 40 M 40 40 L 40 30" stroke="#1a1612" strokeWidth="1" fill="none" strokeOpacity="0.6" />

              {/* Small tech text */}
              <text x="0" y="-55" fontSize="4" fill="#1a1612" textAnchor="middle" opacity="0.6" className="font-mono tracking-widest">SYS.04</text>
              <text x="0" y="58" fontSize="4" fill="#1a1612" textAnchor="middle" opacity="0.6" className="font-mono tracking-widest">OP-MODE</text>
              <text x="-65" y="2" fontSize="3" fill="#1a1612" textAnchor="middle" opacity="0.4" transform="rotate(-90 -65 0)" className="font-mono">824.9</text>
              <text x="65" y="2" fontSize="3" fill="#1a1612" textAnchor="middle" opacity="0.4" transform="rotate(90 65 0)" className="font-mono">112.4</text>

              {/* Central focal reticle */}
              <circle cx="0" cy="0" r="15" fill="none" stroke="#1a1612" strokeWidth="0.5" strokeOpacity="0.2" />
              <circle cx="0" cy="0" r="2" fill="#1a1612" opacity="0.3" />
            </svg>
          </div>

          {/* Digits inside the solid button */}
          <div
            className="flex justify-center font-display font-bold text-[#1a1612] leading-none relative z-10 pointer-events-none select-none text-[18vw] md:text-[11vw]"
            style={{ transform: "translateZ(40px)" }}
          >
            <DigitColumn digit={tens} />
            <DigitColumn digit={ones} />
          </div>
        </motion.div>
      </motion.div>

      {/* The CLICK ME text has been moved to the SVG arc inside HUDCounterRadar */}
    </div>
  );
}

// ─── ExpertiseCategoryBlock ─────────────────────────────────────────────────

function ExpertiseCategoryBlock({ category }: { category: ExpertiseCategoryData }) {
  return (
    <div className="flex flex-col justify-center">
      <h3 className="font-syne font-bold text-2xl md:text-3xl lg:text-4xl text-[#3a322b] tracking-tight leading-[1.05] uppercase">
        {category.title}
      </h3>

      <p className="font-syne font-semibold tracking-wide text-[#a89c8d] light:text-[#3a2a1c]/80 text-base md:text-lg lg:text-xl mt-4 leading-relaxed max-w-xl">
        {category.description}
      </p>

      <div className="mt-10 space-y-0">
        <ProximitySkillList skills={category.skills} />
      </div>
    </div>
  );
}

// ─── ExpertiseSection (Main Export) ─────────────────────────────────────────

export function Expertise() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  const handleNextCategory = () => {
    setActiveIndex((prev) => (prev + 1) % EXPERTISE_DATA.length);
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden px-6 md:px-12 py-24 md:py-32">
      {/* <ExpertiseHudBackground activeIndex={activeIndex} /> */}

      <div className="relative z-10 max-w-7xl mx-auto w-full mt-auto mb-auto">
          <div
            className="mb-12 md:mb-16"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(46px)",
              transition:
                "opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1), transform 0.95s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <span className="font-researcher text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em] uppercase block mb-4">
              04 / Expertise
            </span>
            <h2 className="font-syne uppercase font-black text-[clamp(1.5rem,3.5vw,4rem)] text-[#f2ece1] light:text-[#1a1612] leading-[0.9] tracking-[-0.03em]">
              <span className="text-[0.7em]"><span className="text-[1.25em]">M</span>Y</span> <span className="text-[#ff8a3d]"><span className="text-[1.25em]">E</span>XPERTISE</span>
            </h2>
          </div>

          <div className="md:flex md:gap-20 lg:gap-32 items-center">
            <StickyDigitCounter activeIndex={activeIndex} onClick={handleNextCategory} />

            <div className="md:flex-1 relative h-[50vh] md:h-[60vh] border-t border-[#3a2a1c]/35 light:border-black/10 mt-8 md:mt-0 md:pl-8 lg:pl-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -40, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <ExpertiseCategoryBlock category={EXPERTISE_DATA[activeIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile-specific HUD density reduction */}
        <div className="pointer-events-none absolute inset-0 z-[1] md:hidden opacity-25">
          <div className="absolute left-4 top-24 h-px w-20 bg-[#ff8a3d]" />
          <div className="absolute right-4 top-36 h-px w-24 bg-[#3a2a1c]" />
          <div className="absolute bottom-24 left-4 h-px w-28 bg-[#3a2a1c]" />
          <div className="absolute bottom-20 right-5 h-14 w-14 border border-[#ff8a3d] rotate-45" />
        </div>
    </section>
  );
}
