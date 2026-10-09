"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

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
    title: "Frontend Engineering",
    description:
      "Crafting end-to-end products with modern frameworks and clean architecture.",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Three.js / R3F",
      "Framer Motion",
      "Tailwind CSS",
    ],
  },
  {
    title: "Backend & Infrastructure",
    description:
      "Designing resilient, scalable systems from APIs to deployment pipelines.",
    skills: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "MongoDB",
      "PostgreSQL",
      "REST APIs"
    ],
  },
  {
    title: "UI/UX & Creative Engineering",
    description:
      "Blending art with technology to build experiences people remember.",
    skills: [
      "Figma",
      "Framer Motion",
      "GSAP",
      "Three.js",
      "React Three Fiber",
      "GLSL Shaders",
    ],
  },
];

function getTechSubtitle(skill: string) {
  const map: Record<string, string> = {
    "OpenAI": "Multimodal Agents",
    "LLMs": "Neural Transformers",
    "RAG": "Vector Search Gen",
    "AI Agents": "Autonomous Systems",
    "Prompt Engineering": "Context Optimization",
    "AI Workflows": "Pipeline Automation",
    "React": "Component Systems",
    "Next.js": "Server-side Rendering",
    "TypeScript": "Static Typing",
    "Node.js": "V8 Runtime Engine",
    "Express.js": "RESTful Microservices",
    "FastAPI": "Python Microframework",
    "Tailwind CSS": "Utility-first Styling",
    "MongoDB": "Document DBMS",
    "PostgreSQL": "Relational DB",
    "REST APIs": "Network Interfaces",
    "Docker": "Containerization",
    "AWS": "Cloud Infrastructure",
    "Vercel": "Edge Deployments",
    "UI/UX Design": "User Interfaces",
    "Figma": "Interface Prototyping",
    "Motion Design": "Kinetic Interfaces",
    "Interaction Design": "Behavioral Systems",
    "Three.js / React Three Fiber": "WebGL Rendering",
    "Three.js": "3D Rendering",
    "React Three Fiber": "Declarative WebGL",
    "Three.js / R3F": "WebGL Rendering",
    "GSAP": "Animation Engine",
    "GLSL Shaders": "GPU Programming",
    "Framer Motion": "Motion Systems",
    "Performance Optimization": "Latency Reduction",
    "Responsive Design": "Fluid Layouts"
  };
  return map[skill] || "Tech Specification";
}


// ─── Abstract Tech Icons ──────────────────────────────────────────────────────

function AbstractTechIcon({ skill, isActive }: { skill: string, isActive: boolean }) {
  switch (skill) {
    // --- AI & Intelligent Systems ---
    case "OpenAI":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="openaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#fcfaf7" />
               <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0.4" />
             </linearGradient>
           </defs>
           <g style={{ animation: "spin-slow 40s linear infinite", transformOrigin: "50px 50px" }}>
             {[0, 60, 120, 180, 240, 300].map((angle, i) => (
               <g key={`petal-${i}`} transform={`rotate(${angle} 50 50)`}>
                 {/* Bold interlocking ribbon/knot */}
                 <path d="M 43 50 L 43 20 A 15 15 0 0 1 70 20 L 70 35 A 10 10 0 0 0 49 35 L 49 50 Z" fill="url(#openaiGrad)" stroke="#3a2a1c" strokeWidth="1.5" strokeOpacity="0.9" strokeLinejoin="round" />
               </g>
             ))}
             <motion.circle cx="50" cy="50" r="4.5" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.3, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
           </g>
           <circle cx="50" cy="50" r="42" strokeDasharray="3 6" strokeWidth="1.5" strokeOpacity="0.2" style={{ animation: "spin-slow-reverse 60s linear infinite", transformOrigin: "50px 50px" }} />
        </svg>
      );
    case "LLMs":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none" strokeLinejoin="round">
           <defs>
             <linearGradient id="llmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.25" />
               <stop offset="100%" stopColor="#fcfaf7" stopOpacity="0.9" />
             </linearGradient>
           </defs>
           
           <g style={{ animation: "float-y-2 6s ease-in-out infinite" }}>
             {/* Center pillar flowing through layers */}
             <line x1="50" y1="10" x2="50" y2="90" stroke="#ff8a3d" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.8" />
             
             {/* Flowing tokens down the central pillar */}
             <motion.circle cx="50" cy="10" r="2" fill="#ff8a3d" stroke="none" animate={{ cy: [10, 90], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
             <motion.circle cx="50" cy="10" r="2" fill="#ff8a3d" stroke="none" animate={{ cy: [10, 90], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }} />

             {/* Stack of large Transformer layers */}
             {[0, 1, 2, 3].map((layer, i) => (
               <motion.g key={i} transform={`translate(10, ${15 + i * 18})`} animate={{ y: isActive ? (i - 1.5) * 2 : 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                 <path d="M 40 20 L 80 5 L 40 -10 L 0 5 Z" fill="url(#llmGrad)" stroke="#3a2a1c" strokeWidth="1.5" strokeOpacity="0.9" />
                 <circle cx="40" cy="5" r="3" fill="#ff8a3d" stroke="none" />
               </motion.g>
             ))}
             
             {/* Flow lines */}
             <path d="M 20 20 L 20 74 M 80 20 L 80 74" stroke="#3a2a1c" strokeWidth="1.5" strokeOpacity="0.4" />
           </g>
        </svg>
      );
    case "RAG":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-x-1 8s ease-in-out infinite" }}>
             
             {/* 1. Documents (Left) */}
             <g transform="translate(5, 30)">
               <path d="M 12 0 L 28 0 L 28 40 L 12 40 Z" fill="#fcfaf7" strokeWidth="1.5" />
               <path d="M 6 6 L 22 6 L 22 46 L 6 46 Z" fill="#fcfaf7" strokeWidth="1.5" />
               <line x1="11" y1="14" x2="17" y2="14" strokeWidth="1.5" strokeOpacity="0.5" />
               <line x1="11" y1="22" x2="17" y2="22" strokeWidth="1.5" strokeOpacity="0.5" />
               <line x1="11" y1="30" x2="17" y2="30" strokeWidth="1.5" strokeOpacity="0.5" />
               <text x="14" y="60" fontSize="5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DOCS</text>
             </g>

             <path d="M 33 26 L 43 26" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="3 3" />
             <motion.circle cx="33" cy="26" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [33, 43], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />

             {/* 2. Vector Search (Center) */}
             <g transform="translate(55, 26)">
               <rect x="-12" y="-12" width="24" height="24" rx="2" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
               <motion.g animate={{ rotate: isActive ? 45 : 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                 {[-6, 0, 6].map((x) => 
                   [-6, 0, 6].map((y) => (
                     <motion.circle key={`${x}-${y}`} cx={x} cy={y} r={x===0&&y===0 ? 2.5 : 1.5} fill={x===0 ? "#ff8a3d" : "#3a2a1c"} fillOpacity={x===0 ? 1 : 0.4} stroke="none" 
                       animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2 + Math.random()*2, repeat: Infinity, delay: Math.random() }} />
                   ))
                 )}
               </motion.g>
               <text x="0" y="34" fontSize="5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">VECTOR</text>
             </g>

             <path d="M 67 26 L 77 26" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="3 3" />
             <motion.circle cx="67" cy="26" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [67, 77], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }} />

             {/* 3. Response (Right) */}
             <g transform="translate(80, 20)">
               <path d="M 0 0 L 16 0 L 16 38 L 0 38 Z" fill="#fcfaf7" strokeWidth="1.5" />
               <rect x="0" y="0" width="16" height="12" fill="#ff8a3d" fillOpacity="0.2" stroke="none" />
               <line x1="4" y1="18" x2="12" y2="18" strokeWidth="1.5" strokeOpacity="0.5" />
               <line x1="4" y1="26" x2="12" y2="26" strokeWidth="1.5" strokeOpacity="0.5" />
               <text x="8" y="52" fontSize="5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">OUTPUT</text>
             </g>

           </g>
        </svg>
      );
    case "AI Agents":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <radialGradient id="globeGrad" cx="30%" cy="30%" r="70%">
               <stop offset="0%" stopColor="#fcfaf7" />
               <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0.4" />
             </radialGradient>
           </defs>
           
           {/* Center Core */}
           <circle cx="50" cy="50" r="20" fill="url(#globeGrad)" strokeWidth="1.5" strokeOpacity="0.9" />
           <motion.circle cx="50" cy="50" r="5" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.3, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }} />

           <g style={{ animation: "spin-slow 25s linear infinite", transformOrigin: "50px 50px" }}>
             {/* Bold directional loop */}
             <circle cx="50" cy="50" r="38" strokeDasharray="12 8" strokeWidth="1.5" strokeOpacity="0.5" />
             <path d="M 50 12 L 53 7 L 50 2 Z" fill="#3a2a1c" stroke="none" transform="translate(-1, 0)" />
             
             {/* Orbiting data points */}
             <circle cx="50" cy="12" r="2" fill="#ff8a3d" stroke="none" />
             <circle cx="50" cy="88" r="2" fill="#ff8a3d" stroke="none" />

             {/* Nodes on loop */}
             {[0, 72, 144, 216, 288].map((angle, i) => (
               <g key={i} transform={`rotate(${angle} 50 50) translate(50, 12)`}>
                 <circle cx="0" cy="0" r="7" fill="#fcfaf7" strokeWidth="1.5" />
                 <motion.circle cx="0" cy="0" r="2.5" fill="#ff8a3d" stroke="none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
               </g>
             ))}
           </g>
           
           {/* Static Bold Labels */}
           {[ 
             { angle: -90, label: "PERCEIVE" },
             { angle: -18, label: "REASON" },
             { angle: 54, label: "ACT" },
             { angle: 126, label: "TOOLS" },
             { angle: 198, label: "OBSERVE" },
           ].map((node, i) => {
             const rad = node.angle * Math.PI / 180;
             const cx = 50 + 52 * Math.cos(rad);
             const cy = 50 + 52 * Math.sin(rad);
             return (
               <text key={i} x={cx} y={node.angle > 0 && node.angle < 180 ? cy + 4 : cy} fontSize="4" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{node.label}</text>
             );
           })}
        </svg>
      );
    case "Prompt Engineering":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-x-1 4s ease-in-out infinite" }}>
             
             {/* Large Stacked Input Cards */}
             {[
               { y: 15, label: "SYSTEM" },
               { y: 32, label: "USER" },
               { y: 49, label: "CONTEXT" },
               { y: 66, label: "INSTRUCT" },
             ].map((card, i) => (
               <motion.g key={i} transform={`translate(10, ${card.y}) skewY(-8)`} animate={{ x: isActive ? (i%2===0 ? -2 : 2) : 0 }} transition={{ duration: 0.5 }}>
                 <path d="M 0 0 L 32 0 L 32 14 L 0 14 Z" fill="#fcfaf7" strokeWidth="1.5" strokeOpacity="0.9" />
                 <text x="4" y="9.5" fontSize="5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold">{card.label}</text>
               </motion.g>
             ))}

             {/* Central Processing Funnel (Thick glowing lines) */}
             <g transform="translate(0, 0)">
               <path d="M 45 25 C 65 25, 60 50, 75 50" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.4" fill="none" />
               <path d="M 45 42 C 65 42, 60 50, 75 50" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.6" fill="none" />
               <path d="M 45 59 C 65 59, 60 50, 75 50" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.8" fill="none" />
               <path d="M 45 76 C 65 76, 60 50, 75 50" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.4" fill="none" />
               <motion.circle cx="75" cy="50" r="4" fill="#ff8a3d" stroke="none" animate={{ r: [4, 5, 4] }} transition={{ duration: 1.5, repeat: Infinity }} />
               {/* Animated Pulses flowing into center */}
               <motion.circle cx="45" cy="25" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [45, 75], cy: [25, 50], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
               <motion.circle cx="45" cy="76" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [45, 75], cy: [76, 50], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }} />
             </g>

             {/* Right Optimized Output Block */}
             <g transform="translate(77, 30) skewY(-8)">
               <path d="M 0 0 L 20 0 L 20 40 L 0 40 Z" fill="#ff8a3d" fillOpacity="0.1" strokeWidth="1.5" strokeOpacity="0.9" />
               <text x="2" y="10" fontSize="4.5" fill="#ff8a3d" stroke="none" fontFamily="monospace" fontWeight="bold">OUTPUT</text>
               <line x1="2" y1="20" x2="16" y2="20" stroke="#3a2a1c" strokeOpacity="0.5" strokeWidth="1.5" />
               <line x1="2" y1="28" x2="18" y2="28" stroke="#3a2a1c" strokeOpacity="0.5" strokeWidth="1.5" />
               <line x1="2" y1="36" x2="12" y2="36" stroke="#3a2a1c" strokeOpacity="0.5" strokeWidth="1.5" />
             </g>

           </g>
        </svg>
      );
    case "AI Workflows":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-y-1 4s ease-in-out infinite" }}>
             
             {/* Thick Automation Paths */}
             <path d="M 22 50 L 35 50" strokeWidth="1.5" />
             <path d="M 55 50 L 70 50" strokeWidth="1.5" />
             
             {/* Branch paths */}
             <path d="M 45 40 L 45 25 L 65 25 M 65 33 L 65 40" strokeWidth="1.5" strokeDasharray="4 4" />
             <path d="M 45 60 L 45 75 L 65 75 M 65 67 L 65 60" strokeWidth="1.5" strokeDasharray="4 4" />

             {/* Animated Pulses */}
             <motion.circle cx="22" cy="50" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [22, 35], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
             <motion.circle cx="55" cy="50" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [55, 70], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }} />
             <motion.circle cx="45" cy="60" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cy: [60, 75], opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 1 }} />

             {/* 1. Trigger */}
             <g transform="translate(5, 40)">
               <rect x="0" y="0" width="17" height="20" rx="2" fill="#fcfaf7" strokeWidth="1.5" />
               <motion.circle cx="8.5" cy="10" r="3" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 1, repeat: Infinity }} />
               <text x="8.5" y="30" fontSize="4.5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TRIGGER</text>
             </g>

             {/* 2. Process */}
             <g transform="translate(35, 40)">
               <rect x="0" y="0" width="20" height="20" rx="4" fill="#fcfaf7" strokeWidth="1.5" />
               <motion.circle cx="10" cy="10" r="4" strokeWidth="1.5" strokeDasharray="2 2" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "10px 10px" }} />
               <text x="10" y="30" fontSize="4.5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PROCESS</text>
             </g>

             {/* 3. Tools (Top) */}
             <g transform="translate(60, 15)">
               <rect x="0" y="0" width="18" height="18" rx="2" fill="#fcfaf7" strokeWidth="1.5" />
               <path d="M 5 5 L 13 13 M 5 13 L 13 5" strokeWidth="2" strokeLinecap="round" />
               <text x="9" y="27" fontSize="4.5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TOOLS</text>
             </g>

             {/* 4. Output / Actions */}
             <g transform="translate(70, 40)">
               <path d="M 0 0 L 20 10 L 0 20 Z" fill="#ff8a3d" stroke="#ff8a3d" strokeWidth="1.5" strokeLinejoin="round" />
               <text x="6" y="30" fontSize="4.5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">OUTPUT</text>
             </g>
             
             {/* 5. Memory (Bottom) */}
             <g transform="translate(60, 65)">
               <rect x="0" y="0" width="18" height="18" rx="2" fill="#fcfaf7" strokeWidth="1.5" />
               <line x1="4" y1="6" x2="14" y2="6" strokeWidth="1.5" />
               <line x1="4" y1="10" x2="14" y2="10" strokeWidth="1.5" />
               <line x1="4" y1="14" x2="14" y2="14" strokeWidth="1.5" />
               <text x="9" y="27" fontSize="4.5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MEMORY</text>
             </g>

           </g>
        </svg>
      );
    // --- Frontend Engineering ---
    case "React":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <radialGradient id="reactCore" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0" />
             </radialGradient>
           </defs>
           <g style={{ animation: "spin-slow 30s linear infinite", transformOrigin: "50px 50px" }}>
             {[0, 60, 120].map((angle, i) => (
               <motion.ellipse 
                 key={i} 
                 cx="50" cy="50" rx="35" ry="12" 
                 transform={`rotate(${angle} 50 50)`}
                 stroke="url(#reactCore)"
                 strokeWidth="2.5"
                 strokeOpacity="0.8"
                 fill="none"
               />
             ))}
             {[0, 60, 120].map((angle, i) => (
               <ellipse 
                 key={`base-${i}`} 
                 cx="50" cy="50" rx="35" ry="12" 
                 transform={`rotate(${angle} 50 50)`}
                 stroke="#3a2a1c"
                 strokeWidth="1.5"
                 strokeOpacity="0.4"
                 fill="none"
               />
             ))}
             {/* Orbiting nodes */}
             <motion.circle cx="85" cy="50" r="3" fill="#ff8a3d" stroke="none" transform="rotate(0 50 50)" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
             <motion.circle cx="67.5" cy="19.7" r="3" fill="#ff8a3d" stroke="none" transform="rotate(0 50 50)" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
             <motion.circle cx="32.5" cy="80.3" r="3" fill="#ff8a3d" stroke="none" transform="rotate(0 50 50)" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
           </g>
           
           <circle cx="50" cy="50" r="8" fill="url(#reactCore)" stroke="none" />
           <circle cx="50" cy="50" r="5" fill="#fcfaf7" stroke="#3a2a1c" strokeWidth="1.5" />
           <motion.circle cx="50" cy="50" r="3" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.2, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }} />
        </svg>
      );
    case "Next.js":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="nextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#3a2a1c" />
               <stop offset="100%" stopColor="#1a1612" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-1 4s ease-in-out infinite" }}>
             <circle cx="50" cy="50" r="38" fill="url(#nextGrad)" stroke="#3a2a1c" strokeWidth="1.5" />
             <circle cx="50" cy="50" r="45" strokeDasharray="2 4" strokeWidth="1.5" strokeOpacity="0.2" />
             
             <motion.g animate={{ rotateY: isActive ? 15 : 0 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ transformOrigin: "50px 50px" }}>
               {/* The Next.js N */}
               <path d="M 35 70 L 35 30 L 65 70 L 65 30" stroke="#fcfaf7" strokeWidth="6" strokeLinejoin="miter" strokeMiterlimit="10" />
               {/* Accent highlight */}
               <path d="M 35 30 L 65 70" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="square" />
             </motion.g>

             {/* Orbital ring */}
             <motion.circle cx="50" cy="50" r="45" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="30 150" strokeOpacity="0.8" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "50px 50px" }} />
           </g>
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-y-2 5s ease-in-out infinite" }}>
             
             {/* 3D Layered Panels */}
             {[
               { offset: -8, color: "#3a2a1c", opacity: 0.1 },
               { offset: -4, color: "#ff8a3d", opacity: 0.2 },
               { offset: 0, color: "#fcfaf7", opacity: 0.9 },
             ].map((layer, i) => (
               <g key={i} transform={`translate(${layer.offset}, ${layer.offset})`}>
                 <path d="M 30 20 L 75 20 L 75 65 L 30 65 Z" fill={layer.color} fillOpacity={layer.opacity} stroke="#3a2a1c" strokeWidth="1.5" strokeOpacity="0.8" />
               </g>
             ))}

             <motion.g animate={{ scale: isActive ? 1.05 : 1 }} transition={{ duration: 0.3 }}>
               {/* "TS" text */}
               <text x="52.5" y="48" fontSize="20" fill="#3a2a1c" stroke="none" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-1">TS</text>
               {/* Accent line */}
               <path d="M 35 55 L 70 55" stroke="#ff8a3d" strokeWidth="2" strokeDasharray="4 4" />
             </motion.g>

             {/* Connection dots */}
             <circle cx="30" cy="20" r="1.5" fill="#ff8a3d" stroke="none" />
             <circle cx="75" cy="65" r="1.5" fill="#ff8a3d" stroke="none" />
           </g>
        </svg>
      );
    case "Three.js / R3F":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="threeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.6" />
               <stop offset="100%" stopColor="#1a1612" stopOpacity="0.9" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-1.5 6s ease-in-out infinite" }}>
             
             {/* Orbital wires */}
             <ellipse cx="50" cy="55" rx="35" ry="10" strokeDasharray="2 4" strokeWidth="1.5" strokeOpacity="0.3" transform="rotate(-15 50 55)" />
             <ellipse cx="50" cy="55" rx="35" ry="10" strokeDasharray="2 4" strokeWidth="1.5" strokeOpacity="0.3" transform="rotate(45 50 55)" />

             <motion.g animate={{ rotateY: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "50px 55px" }}>
               {/* Solid 3D Tetrahedron */}
               <path d="M 50 15 L 80 75 L 20 75 Z" fill="url(#threeGrad)" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M 50 15 L 50 85 L 80 75" fill="#fcfaf7" fillOpacity="0.1" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M 50 15 L 50 85 L 20 75" fill="#fcfaf7" fillOpacity="0.2" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
               
               <circle cx="50" cy="15" r="2.5" fill="#ff8a3d" stroke="none" />
               <circle cx="80" cy="75" r="2.5" fill="#ff8a3d" stroke="none" />
               <circle cx="20" cy="75" r="2.5" fill="#ff8a3d" stroke="none" />
               <circle cx="50" cy="85" r="2.5" fill="#ff8a3d" stroke="none" />
             </motion.g>

             <motion.circle cx="85" cy="45" r="3" fill="#ff8a3d" stroke="none" animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
             <motion.circle cx="20" cy="35" r="2" fill="#ff8a3d" stroke="none" animate={{ y: [8, -8, 8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

           </g>
        </svg>
      );
    case "Tailwind CSS":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="twGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#fcfaf7" stopOpacity="0.9" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-2 5s ease-in-out infinite" }}>
             
             <motion.g animate={{ scale: isActive ? 1.05 : 1, rotate: isActive ? 5 : 0 }} transition={{ duration: 0.4, type: "spring" }}>
               {/* Tailwind Waves */}
               <path d="M 25 45 C 25 30, 45 25, 55 35 C 65 45, 60 55, 75 55 C 80 55, 85 50, 85 45 C 85 60, 65 65, 55 55 C 45 45, 50 35, 35 35 C 30 35, 25 40, 25 45 Z" fill="url(#twGrad)" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
               <path d="M 15 65 C 15 50, 35 45, 45 55 C 55 65, 50 75, 65 75 C 70 75, 75 70, 75 65 C 75 80, 55 85, 45 75 C 35 65, 40 55, 25 55 C 20 55, 15 60, 15 65 Z" fill="#fcfaf7" fillOpacity="0.8" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
             </motion.g>

             {/* Accents */}
             <circle cx="75" cy="35" r="2" fill="#ff8a3d" stroke="none" />
             <circle cx="25" cy="75" r="2" fill="#ff8a3d" stroke="none" />
             
             <path d="M 75 35 L 85 25" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="2 2" />
             <path d="M 25 75 L 15 85" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="2 2" />

           </g>
        </svg>
      );
    // --- Backend & Infrastructure ---
    case "Node.js":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#1a1612" stopOpacity="0.9" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-1.5 5s ease-in-out infinite" }}>
             {/* Abstract Node Hexagons */}
             <path d="M 50 20 L 75 35 L 75 65 L 50 80 L 25 65 L 25 35 Z" strokeDasharray="3 4" strokeWidth="1.5" strokeOpacity="0.4" />
             <path d="M 50 30 L 65 40 L 65 60 L 50 70 L 35 60 L 35 40 Z" fill="url(#nodeGrad)" stroke="#3a2a1c" strokeWidth="1.5" />
             <path d="M 50 30 L 50 50 L 35 60 M 50 50 L 65 60" stroke="#fcfaf7" strokeWidth="1.5" strokeOpacity="0.4" />
             
             {/* Surrounding Nodes */}
             <motion.circle cx="25" cy="35" r="3" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
             <motion.circle cx="75" cy="65" r="3" fill="#ff8a3d" stroke="none" animate={{ scale: isActive ? [1, 1.5, 1] : 1 }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
             
             <text x="50" y="55" fontSize="12" fill="#fcfaf7" stroke="none" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">JS</text>
           </g>
        </svg>
      );
    case "Express.js":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-x-1 4s ease-in-out infinite" }}>
             {/* Routing paths */}
             <path d="M 10 50 L 30 50 C 40 50, 45 35, 55 35 L 90 35" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5" />
             <path d="M 10 50 L 30 50 C 40 50, 45 65, 55 65 L 90 65" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5" />
             <path d="M 10 50 L 90 50" strokeWidth="1.5" />
             
             {/* Traveling nodes */}
             <motion.circle cx="10" cy="50" r="2" fill="#ff8a3d" stroke="none" animate={{ cx: [10, 90], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
             
             {/* Center bold EX mark */}
             <rect x="35" y="35" width="30" height="30" rx="4" fill="#fcfaf7" stroke="#3a2a1c" strokeWidth="2" />
             <text x="50" y="55" fontSize="14" fill="#3a2a1c" stroke="none" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-1">ex</text>
             
             {/* Endpoints */}
             <circle cx="90" cy="35" r="3" fill="#ff8a3d" stroke="none" />
             <circle cx="90" cy="50" r="3" fill="#ff8a3d" stroke="none" />
             <circle cx="90" cy="65" r="3" fill="#ff8a3d" stroke="none" />
           </g>
        </svg>
      );
    case "FastAPI":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="fastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#1a1612" stopOpacity="0.95" />
               <stop offset="100%" stopColor="#3a2a1c" stopOpacity="0.8" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-1.5 4s ease-in-out infinite" }}>
             {/* Outer dimensional rings */}
             <circle cx="50" cy="50" r="40" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="2 4" />
             <motion.circle cx="50" cy="50" r="32" fill="url(#fastGrad)" stroke="#ff8a3d" strokeWidth="1.5" />
             
             {/* Orbiting particles */}
             <g style={{ animation: "spin-slow 15s linear infinite", transformOrigin: "50px 50px" }}>
                <circle cx="18" cy="50" r="3" fill="#ff8a3d" stroke="none" />
                <circle cx="82" cy="50" r="2" fill="#ff8a3d" stroke="none" />
             </g>

             {/* Lightning Bolt */}
             <motion.path 
               d="M 52 25 L 35 55 L 48 55 L 45 75 L 65 45 L 52 45 Z" 
               fill="#ff8a3d" 
               stroke="#fcfaf7" 
               strokeWidth="1.5" 
               strokeLinejoin="round"
               animate={{ scale: isActive ? 1.05 : 1 }}
               transition={{ duration: 0.3 }}
             />
           </g>
        </svg>
      );
    case "MongoDB":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="mongoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#3a2a1c" />
               <stop offset="100%" stopColor="#1a1612" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-2 6s ease-in-out infinite" }}>
             {/* Network nodes */}
             <path d="M 20 40 L 50 15 L 80 40 L 80 70 L 50 90 L 20 70 Z" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.3" />
             
             <motion.g animate={{ scale: isActive ? 1.05 : 1 }} transition={{ duration: 0.4, type: "spring" }}>
               {/* 3D Leaf Left */}
               <path d="M 50 15 C 30 35, 30 65, 50 85 Z" fill="url(#mongoGrad)" stroke="#3a2a1c" strokeWidth="1.5" />
               {/* 3D Leaf Right */}
               <path d="M 50 15 C 70 35, 70 65, 50 85 Z" fill="#ff8a3d" fillOpacity="0.9" stroke="#3a2a1c" strokeWidth="1.5" />
               
               {/* Central stem */}
               <line x1="50" y1="15" x2="50" y2="85" stroke="#fcfaf7" strokeWidth="1.5" strokeOpacity="0.5" />
             </motion.g>

             {/* Orbiting data points */}
             <motion.circle cx="20" cy="40" r="2.5" fill="#ff8a3d" stroke="none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
             <motion.circle cx="80" cy="70" r="2.5" fill="#ff8a3d" stroke="none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
           </g>
        </svg>
      );
    case "PostgreSQL":
      return (
        <motion.div 
          animate={{ y: [-1, 1, -1] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center opacity-90"
        >
          <img 
            src="/logos/postgresql.png" 
            alt="PostgreSQL" 
            className="w-2/3 h-2/3 object-contain"
          />
        </motion.div>
      );
    case "REST APIs":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <g style={{ animation: "float-y-1 6s ease-in-out infinite" }}>
             
             {/* Left Methods */}
             {[
               { y: 20, label: "GET" },
               { y: 40, label: "POST" },
               { y: 60, label: "PUT" },
               { y: 80, label: "DEL" },
             ].map((method, i) => (
               <g key={i} transform={`translate(10, ${method.y})`}>
                 <rect x="0" y="0" width="30" height="14" rx="2" fill="#fcfaf7" strokeWidth="1.5" />
                 <text x="15" y="10" fontSize="5" fill="#3a2a1c" stroke="none" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{method.label}</text>
                 <path d="M 30 7 L 45 7" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.5" />
                 {/* Traveling pulses */}
                 <motion.circle cx="30" cy="7" r="1.5" fill="#ff8a3d" stroke="none" animate={{ cx: [30, 45], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
               </g>
             ))}

             {/* Right API System Block (Isometric/3D look) */}
             <motion.g transform="translate(60, 25) skewY(-10)" animate={{ scale: isActive ? 1.05 : 1 }} transition={{ duration: 0.3 }}>
               <rect x="0" y="0" width="30" height="50" rx="4" fill="#1a1612" stroke="#ff8a3d" strokeWidth="1.5" />
               <rect x="0" y="0" width="30" height="50" rx="4" fill="#ff8a3d" fillOpacity="0.1" stroke="none" />
               <text x="15" y="28" fontSize="10" fill="#fcfaf7" stroke="none" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="1">API</text>
               
               {/* Server slots */}
               <line x1="5" y1="40" x2="25" y2="40" stroke="#fcfaf7" strokeWidth="1.5" strokeOpacity="0.3" />
               <line x1="5" y1="45" x2="25" y2="45" stroke="#fcfaf7" strokeWidth="1.5" strokeOpacity="0.3" />
             </motion.g>

           </g>
        </svg>
      );
    // --- UI/UX & Creative Engineering ---
    case "Figma":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" strokeWidth="0.4" fill="none">
           <motion.g animate={{ x: isActive ? 3 : 0, y: isActive ? -2 : 0 }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}>
              <rect x="25" y="15" width="25" height="25" rx="12.5" fill={isActive ? "#ff8a3d" : "none"} fillOpacity="0.1" />
              <rect x="50" y="15" width="25" height="25" rx="12.5" />
              <rect x="25" y="40" width="25" height="25" rx="12.5" />
              <rect x="50" y="40" width="25" height="25" rx="12.5" />
              <circle cx="37.5" cy="77.5" r="12.5" />
              <rect x="25" y="65" width="25" height="12.5" />
           </motion.g>
           <circle cx="37.5" cy="27.5" r="1.5" fill="#ff8a3d" stroke="none" className="anim-pulse-op-fast" />
           <circle cx="62.5" cy="52.5" r="1.5" fill="#ff8a3d" stroke="none" />
           {/* Subtle alignment lines */}
           <path d="M 25 10 L 25 90 M 75 10 L 75 90 M 10 40 L 90 40" strokeOpacity="0.1" strokeDasharray="1 3" />
        </svg>
      );
    case "Framer Motion":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" fill="none">
           <defs>
             <linearGradient id="framerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#3a2a1c" />
               <stop offset="100%" stopColor="#1a1612" />
             </linearGradient>
           </defs>
           <g style={{ animation: "float-y-1 4s ease-in-out infinite" }}>
             
             {/* Motion trails */}
             <path d="M 10 30 C 20 10, 40 10, 50 30" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.6" />
             <path d="M 50 70 C 60 90, 80 90, 90 70" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.6" />

             <motion.g animate={{ scale: isActive ? 1.05 : 1 }} transition={{ duration: 0.3, type: "spring", stiffness: 300 }}>
               {/* Framer Logo */}
               {/* Top Triangle */}
               <path d="M 30 20 L 70 20 L 50 40 L 30 40 Z" fill="url(#framerGrad)" stroke="#fcfaf7" strokeWidth="1.5" strokeLinejoin="round" />
               {/* Middle Triangle */}
               <path d="M 30 40 L 70 40 L 50 60 L 30 60 Z" fill="#ff8a3d" fillOpacity="0.9" stroke="#fcfaf7" strokeWidth="1.5" strokeLinejoin="round" />
               {/* Bottom Triangle */}
               <path d="M 30 60 L 50 60 L 50 80 Z" fill="#fcfaf7" stroke="#3a2a1c" strokeWidth="1.5" strokeLinejoin="round" />
             </motion.g>

             {/* Pulsing nodes */}
             <motion.circle cx="30" cy="20" r="2.5" fill="#ff8a3d" stroke="none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
             <motion.circle cx="50" cy="80" r="2.5" fill="#ff8a3d" stroke="none" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
           </g>
        </svg>
      );
    case "GSAP":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" strokeWidth="0.35" fill="none">
           <circle cx="50" cy="50" r="12" fill={isActive ? "#ff8a3d" : "none"} fillOpacity="0.1" strokeWidth="0.5" />
           <g style={{ animation: "spin-slow 25s linear infinite", transformOrigin: "50px 50px" }}>
             <ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(25 50 50)" />
             <ellipse cx="50" cy="50" rx="42" ry="16" strokeDasharray="2 4" transform="rotate(-35 50 50)" strokeOpacity="0.6" />
             <circle cx="12" cy="34" r="2.5" fill="#ff8a3d" stroke="none" transform="rotate(25 50 50)" />
             <circle cx="86" cy="67" r="1.5" fill="#ff8a3d" stroke="none" transform="rotate(-35 50 50)" />
           </g>
           <circle cx="50" cy="50" r="14" stroke="#ff8a3d" strokeWidth="0.2" strokeDasharray="1 3" style={{ animation: "spin-slow-reverse 15s linear infinite", transformOrigin: "50px 50px" }} />
        </svg>
      );
    case "Three.js":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" strokeWidth="0.35" fill="none" strokeLinejoin="round">
           <motion.g animate={{ rotateY: isActive ? [0, 360] : [0, 180] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "50px 50px" }}>
             {/* Abstract wireframe geometry */}
             <path d="M 50 15 L 85 75 L 15 75 Z" strokeWidth="0.6" />
             <path d="M 50 15 L 50 85 L 85 75" strokeOpacity="0.6" fill={isActive ? "#ff8a3d" : "none"} fillOpacity="0.08" />
             <path d="M 50 15 L 50 85 L 15 75" strokeOpacity="0.6" />
             <path d="M 15 75 L 85 75" strokeDasharray="2 4" strokeOpacity="0.4" />
             <circle cx="50" cy="15" r="2" fill="#ff8a3d" stroke="none" />
             <circle cx="50" cy="85" r="1.5" fill="#ff8a3d" stroke="none" />
             <circle cx="15" cy="75" r="1" fill="#ff8a3d" stroke="none" fillOpacity="0.5" />
           </motion.g>
           <circle cx="50" cy="50" r="45" strokeOpacity="0.05" strokeDasharray="1 4" />
        </svg>
      );
    case "React Three Fiber":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" strokeWidth="0.35" fill="none">
           <circle cx="50" cy="50" r="20" strokeDasharray="1 3" strokeOpacity="0.8" />
           <circle cx="50" cy="50" r="35" strokeOpacity="0.25" />
           <g style={{ animation: "spin-slow-reverse 30s linear infinite", transformOrigin: "50px 50px" }}>
             <circle cx="50" cy="15" r="3.5" fill="#ff8a3d" stroke="none" />
             <circle cx="85" cy="50" r="2" stroke="#ff8a3d" />
             <circle cx="15" cy="50" r="2.5" fill="#ff8a3d" stroke="none" fillOpacity="0.5" />
             <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" strokeOpacity="0.2" />
           </g>
           <motion.circle cx="50" cy="50" r="7" fill={isActive ? "#ff8a3d" : "transparent"} stroke="#ff8a3d" transition={{ duration: 0.8, ease: "easeOut" }} />
           <path d="M 50 5 L 50 10 M 50 90 L 50 95 M 5 50 L 10 50 M 90 50 L 95 50" strokeOpacity="0.3" />
        </svg>
      );
    case "GLSL Shaders":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90" stroke="#3a2a1c" strokeWidth="0.35" fill="none">
           <defs>
             <clipPath id="shaderMask">
               <rect x="5" y="5" width="90" height="90" rx="5" />
             </clipPath>
           </defs>
           <motion.g clipPath="url(#shaderMask)" animate={{ x: isActive ? [-4, 4, -4] : 0, y: isActive ? [3, -3, 3] : 0 }} transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}>
             {/* Wavy Deformed Grid */}
             {[...Array(12)].map((_, i) => (
               <path key={`h-${i}`} d={`M 0 ${10 + i * 8} Q 25 ${5 + i * 8 + (i%2?6:-6)} 50 ${10 + i * 8} T 100 ${10 + i * 8}`} strokeOpacity={0.15 + (i/25)} />
             ))}
             {[...Array(12)].map((_, i) => (
               <path key={`v-${i}`} d={`M ${10 + i * 8} 0 Q ${5 + i * 8 + (i%2?6:-6)} 25 ${10 + i * 8} 50 T ${10 + i * 8} 100`} strokeOpacity={0.15 + ((12-i)/25)} />
             ))}
           </motion.g>
           <motion.circle cx="25" cy="25" r="2" fill="#ff8a3d" stroke="none" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
           <motion.circle cx="75" cy="75" r="2.5" fill="#ff8a3d" stroke="none" fillOpacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}


// ─── Standard Skill Cell ───────────────────────────────────────────────────────

function SkillCell({ 
  skill, 
  isActive, 
  onActivate, 
  onDeactivate 
}: { 
  skill: string, 
  isActive: boolean, 
  onActivate: () => void, 
  onDeactivate: () => void 
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onActivate();
    }, 85); // Perceptual delay for luxury feel
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onDeactivate();
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative border-r border-b border-[#3a2a1c]/15 min-h-[110px]"
      style={{ perspective: 1000 }}
    >
       <motion.div
         animate={{
           y: isActive ? -6 : 0,
           x: isActive ? -6 : 0,
           backgroundColor: isActive ? "#fcfaf7" : "rgba(252, 250, 247, 0)",
           borderColor: isActive ? "rgba(255, 138, 61, 0.4)" : "rgba(255, 138, 61, 0)",
           boxShadow: isActive ? "-6px 6px 16px rgba(58, 42, 28, 0.06)" : "0px 0px 0px rgba(58, 42, 28, 0)",
         }}
         transition={{
           type: "spring",
           stiffness: 250,
           damping: 35,
           mass: 0.8,
           backgroundColor: { duration: 0.4, ease: "easeOut" },
           borderColor: { duration: 0.4, ease: "easeOut" },
           boxShadow: { duration: 0.5, ease: "easeOut" },
         }}
         className="w-full h-full p-6 flex flex-col justify-between z-10 border bg-transparent"
       >
         <div className="flex justify-between items-start mb-4 relative z-20">
           <motion.span 
             animate={{ color: isActive ? "#ff8a3d" : "#1a1612" }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="font-syne font-bold tracking-tight text-[15px]"
           >
             {skill}
           </motion.span>
           <motion.span 
             animate={{ 
               opacity: isActive ? 1 : 0, 
               y: isActive ? 0 : 4,
               color: isActive ? "rgba(255, 138, 61, 0.9)" : "rgba(58, 42, 28, 0.3)" 
             }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="text-[11px] font-mono"
           >
             &#8599;
           </motion.span>
         </div>
         
         <div className="flex items-center gap-2 relative z-20">
           <motion.div 
             animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5 }}
             transition={{ duration: 0.3, ease: "easeOut" }}
             className="w-1 h-1 rounded-full bg-[#ff8a3d]"
           />
           <motion.div 
             animate={{ color: isActive ? "rgba(58, 42, 28, 0.7)" : "rgba(58, 42, 28, 0.4)" }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="text-[10px] font-mono tracking-widest uppercase truncate"
           >
             {getTechSubtitle(skill)}
           </motion.div>
         </div>
       </motion.div>
    </div>
  );
}

// ─── Creative Skill Cell ──────────────────────────────────────────────────────

function CreativeSkillCell({ 
  skill, 
  index,
  isActive, 
  onActivate, 
  onDeactivate 
}: { 
  skill: string, 
  index: number,
  isActive: boolean, 
  onActivate: () => void, 
  onDeactivate: () => void 
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onActivate();
    }, 85);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onDeactivate();
  };
  
  const paddedIndex = String(index + 1).padStart(2, '0');

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[220px] md:min-h-[260px]"
      style={{ perspective: 1000 }}
    >
       <motion.div
         animate={{
           backgroundColor: isActive ? "#fcfaf7" : "rgba(252, 250, 247, 0)",
           borderColor: isActive ? "rgba(255, 138, 61, 0.4)" : "rgba(58, 42, 28, 0.15)",
           boxShadow: isActive ? "0px 12px 40px rgba(58, 42, 28, 0.05)" : "0px 0px 0px rgba(58, 42, 28, 0)",
           y: isActive ? -4 : 0,
         }}
         transition={{
           backgroundColor: { duration: 0.6, ease: "easeOut" },
           borderColor: { duration: 0.4, ease: "easeOut" },
           boxShadow: { duration: 0.6, ease: "easeOut" },
           y: { type: "spring", stiffness: 200, damping: 30 }
         }}
         className="w-full h-full p-8 md:p-10 flex flex-col justify-between z-10 bg-transparent overflow-hidden relative border border-[#3a2a1c]/15 group/ccell"
       >
         
         {/* Live Animated Background & Logo */}
         <div 
           style={{ animation: `float-y-3 ${6 + (index % 3)}s ease-in-out infinite` }}
           className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-[40%] h-[85%] pointer-events-none flex items-center justify-center group-hover/ccell:scale-105 transition-transform duration-500 ease-out"
         >
           {/* Pulsing Visual Effect Core (Optimized) */}
           <div
             style={{ animation: `pulse-scale ${8 + (index % 4)}s linear infinite` }}
             className="absolute w-28 h-28 bg-[#ff8a3d] blur-2xl rounded-full"
           />
           
           {/* Additional floating ring effect (Optimized) */}
           <div
             style={{ animation: `spin-slow-reverse ${20 + (index % 5)}s linear infinite` }}
             className="absolute w-24 h-24 border border-[#ff8a3d]/10 rounded-full border-dashed"
           />

           <div className="relative z-10 w-full h-full">
             {/* Use the original isActive state so heavy internal animations only play on hover, keeping base effects light */}
             <AbstractTechIcon skill={skill} isActive={isActive} />
           </div>
         </div>

         {/* Corner precision markers */}
         <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#3a2a1c]/20 m-4" />
         <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#3a2a1c]/20 m-4" />
         <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#3a2a1c]/20 m-4" />
         <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#3a2a1c]/20 m-4" />

         {/* Top Section */}
         <div className="flex justify-between items-start relative z-20 w-[55%]">
           <div>
             <motion.div 
               animate={{ color: isActive ? "#ff8a3d" : "#1a1612" }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="font-syne font-bold tracking-tight text-[18px] md:text-[22px] mb-3"
             >
               {skill}
             </motion.div>
             <motion.div 
               animate={{ color: isActive ? "rgba(58, 42, 28, 0.7)" : "rgba(58, 42, 28, 0.4)" }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="text-[9px] md:text-[11px] font-mono tracking-widest uppercase"
             >
               {getTechSubtitle(skill)}
             </motion.div>
           </div>
         </div>
         
         {/* Bottom Section */}
         <div className="flex items-center gap-4 relative z-20 mt-20 w-[95%]">
           <div className="text-[11px] font-mono text-[#ff8a3d] font-bold">
             {paddedIndex}
           </div>
           <div className="flex-1 h-[1px] bg-[#3a2a1c]/10 relative">
             <motion.div 
               className="absolute top-0 left-0 h-full bg-[#ff8a3d]/40"
               initial={{ width: "0%" }}
               animate={{ width: isActive ? "100%" : "0%" }}
               transition={{ duration: 0.8, ease: "easeInOut" }}
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#f2ece1] border border-[#3a2a1c]/20 rounded-full" />
           </div>
           <div className="text-[14px] font-mono text-[#3a2a1c]/30">
             <motion.span 
               animate={{ color: isActive ? "rgba(255, 138, 61, 0.8)" : "rgba(58, 42, 28, 0.3)" }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             >
               &#8599;
             </motion.span>
           </div>
         </div>
         
       </motion.div>
    </div>
  );
}


// ─── Expertise Row ────────────────────────────────────────────────────────────

function ExpertiseRow({ category, index }: { category: ExpertiseCategoryData, index: number }) {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const isPremiumLayout = true;
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  if (isPremiumLayout) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col border-t border-[#3a2a1c]/15 group relative py-16 md:py-24"
      >
        {/* Top Header Row for Premium Section */}
        <div className="flex flex-col md:flex-row w-full mb-16 md:mb-24">
          <div className="w-full md:w-[30%] flex flex-col justify-start md:pr-12 relative z-10 mb-8 md:mb-0">
             <div className="flex items-center gap-3">
               <span className="font-mono text-[13px] text-[#ff8a3d] font-bold">{paddedIndex}</span>
               <span className="text-[#3a2a1c] font-bold text-[12px] tracking-[0.2em] uppercase font-mono">/ {category.title}</span>
               {/* Tiny circle indicator from reference */}
               <div className="w-6 h-6 border border-[#ff8a3d]/30 rounded-full flex items-center justify-center ml-2">
                 <div className="w-1.5 h-1.5 bg-[#ff8a3d] rounded-full" />
               </div>
             </div>
          </div>
          
          <div className="w-full md:w-[70%] md:pl-12 md:border-l border-[#3a2a1c]/15 relative z-10 flex flex-col justify-center">
            <h3 className="font-syne font-bold text-3xl md:text-5xl text-[#1a1612] mb-4 tracking-tight">
              {category.title}
            </h3>
            <p className="font-sans text-base md:text-lg text-[#3a2a1c]/70 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>

        {/* Spacious Full-width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full z-10">
           {category.skills.map((skill, idx) => (
             <CreativeSkillCell 
               key={skill} 
               index={idx}
               skill={skill} 
               isActive={activeSkill === skill}
               onActivate={() => setActiveSkill(skill)}
               onDeactivate={() => setActiveSkill((prev) => prev === skill ? null : prev)}
             />
           ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col md:flex-row border-t border-[#3a2a1c]/15 group relative"
    >
      {/* Left Column */}
      <div className="w-full md:w-[30%] py-8 md:py-12 md:pr-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#3a2a1c]/15 relative z-10">
        <div>
           <div className="flex items-baseline gap-3 mb-2">
             <span className="font-mono text-[13px] text-[#ff8a3d] font-bold">{paddedIndex}</span>
             <span className="text-[#3a2a1c] font-bold text-[12px] tracking-[0.2em] uppercase font-mono">/ {category.title}</span>
           </div>
        </div>
        
        <div className="mt-12 md:mt-auto">
          <div className="text-[9px] uppercase font-mono tracking-[0.25em] text-[#ff8a3d] mb-2">SOURCE</div>
          <div className="text-[10px] text-[#3a2a1c]/60 leading-relaxed font-mono uppercase tracking-[0.15em] max-w-[90%]">
             Validated in production environments & engineering modules.
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-[70%] py-8 md:py-12 md:pl-12 flex flex-col relative z-10">
        <h3 className="font-syne font-bold text-2xl md:text-3xl lg:text-4xl text-[#1a1612] mb-4 tracking-tight">
          {category.title}
        </h3>
        <p className="font-sans text-sm md:text-base text-[#3a2a1c]/70 mb-12 max-w-2xl leading-relaxed">
          {category.description}
        </p>

        {/* Skill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#3a2a1c]/15 bg-[#3a2a1c]/[0.01]">
           {category.skills.map((skill) => (
             <SkillCell 
               key={skill} 
               skill={skill} 
               isActive={activeSkill === skill}
               onActivate={() => setActiveSkill(skill)}
               onDeactivate={() => setActiveSkill((prev) => prev === skill ? null : prev)}
             />
           ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

const expertiseStyles = `
  @keyframes spin-slow { to { transform: rotate(360deg); } }
  @keyframes spin-slow-reverse { to { transform: rotate(-360deg); } }
  @keyframes float-y-3 {
    0%, 100% { transform: translateY(-3px); }
    50% { transform: translateY(3px); }
  }
  @keyframes float-y-2 {
    0%, 100% { transform: translateY(-2px); }
    50% { transform: translateY(2px); }
  }
  @keyframes float-y-1.5 {
    0%, 100% { transform: translateY(-1.5px); }
    50% { transform: translateY(1.5px); }
  }
  @keyframes float-y-1 {
    0%, 100% { transform: translateY(-1px); }
    50% { transform: translateY(1px); }
  }
  @keyframes float-x-1 {
    0%, 100% { transform: translateX(-1px); }
    50% { transform: translateX(1px); }
  }
  @keyframes pulse-scale {
    0%, 100% { transform: scale(0.9); opacity: 0.05; }
    50% { transform: scale(1.1); opacity: 0.15; }
  }
  @keyframes pulse-opacity-fast {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }
  
  .anim-pulse-op-fast {
    animation: pulse-opacity-fast 3s ease-in-out infinite;
  }
  
  /* Pause ALL animations when the section is out of view */
  .expertise-paused *, .expertise-paused {
    animation-play-state: paused !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .expertise-paused *, .expertise-paused {
      animation: none !important;
      transform: none !important;
    }
  }
`;

export function Expertise() {
  const sectionRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    
    // Fallback if IntersectionObserver is not available
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.remove('expertise-paused');
      } else {
        el.classList.add('expertise-paused');
      }
    }, { rootMargin: "200px" });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stack" ref={sectionRef} className="relative w-full bg-[#f2ece1] px-6 md:px-12 py-24 md:py-32 overflow-hidden selection:bg-[#ff8a3d]/30">
      <style>{expertiseStyles}</style>
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-12"
        >
           <span className="font-researcher text-[#ff8a3d] text-lg font-bold tracking-[0.2em]">04</span>
           <h2 className="font-syne font-black text-3xl md:text-5xl text-[#1a1612] uppercase tracking-tighter">
             <span className="text-[0.7em]"><span className="text-[1.25em]">M</span>Y</span> <span className="text-[#ff8a3d]"><span className="text-[1.25em]">E</span>XPERTISE</span>
           </h2>
        </motion.div>

        {/* Spec-sheet Header Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-b border-[#3a2a1c]/20 py-4 mb-12 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-[#3a2a1c]/60"
        >
          <div className="mb-2 md:mb-0">[ SPEC SHEET // 2026 ]</div>
          <div className="hidden md:block text-center flex-1">Applied Expertise & Production Stack</div>
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ opacity: [1, 0.3, 1] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-1.5 h-1.5 bg-[#ff8a3d]" 
            /> 
            <span className="text-[#1a1612] font-bold">VERIFIED STACK</span>
          </div>
        </motion.div>

        {/* Stacked Rows */}
        <div className="flex flex-col">
          {EXPERTISE_DATA.map((cat, i) => (
            <ExpertiseRow key={cat.title} category={cat} index={i} />
          ))}
          {/* Final closing border */}
          <div className="border-t border-[#3a2a1c]/15 w-full" />
        </div>

      </div>
    </section>
  );
}
