"use client";

import React from "react";
import { WordReveal } from "@/components/ui/WordReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProximityPillRow } from "@/components/ui/TechPill";

function ArsenalHUD() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-[#3a322b]/55"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <path d="M38 96H160L212 148H420" />
          <path d="M38 96V206L92 260" />
          <path d="M1562 94H1460L1410 144H1190" />
          <path d="M1562 94V206L1508 260" />
          <path d="M38 790H170L220 740H430" />
          <path d="M1562 790H1430L1380 740H1170" />
          <path d="M88 308H250L286 272H430" />
          <path d="M1512 308H1350L1314 272H1170" />
          <path d="M88 610H220L260 650H430" />
          <path d="M1512 610H1380L1340 650H1170" />
        </g>

        <g stroke="#ff8a3d" strokeWidth="1.4" opacity="1.0">
          <path d="M38 206L88 256" />
          <path d="M1562 206L1512 256" />
          <path d="M170 790L220 740" />
          <path d="M1430 790L1380 740" />
          <path d="M238 188H330" />
          <path d="M1270 188H1362" />
          <path d="M238 706H330" />
          <path d="M1270 706H1362" />
        </g>

        <g stroke="currentColor" strokeDasharray="2 7" opacity=".7">
          <path d="M86 232H420" />
          <path d="M1180 232H1514" />
          <path d="M86 678H420" />
          <path d="M1180 678H1514" />
          <path d="M420 120V780" />
          <path d="M1180 120V780" />
        </g>

        <g stroke="#ff8a3d" strokeWidth="1">
          <path d="M82 370v34M65 387h34" />
          <path d="M1518 370v34M1501 387h34" />
          <path d="M92 706v30M77 721h30" />
          <path d="M1508 706v30M1493 721h30" />
        </g>

        <g stroke="currentColor" opacity=".48">
          <circle cx="800" cy="450" r="285" />
          <circle cx="800" cy="450" r="305" strokeDasharray="1 8" />
          <circle cx="800" cy="450" r="330" strokeDasharray="40 12 2 12" />
        </g>

        <g stroke="#ff8a3d" opacity=".95">
          <circle cx="800" cy="450" r="250" strokeDasharray="3 11" />
          <circle cx="800" cy="450" r="5" fill="#ff8a3d" />
        </g>

        <g stroke="currentColor" opacity=".54">
          <path d="M800 112V178M800 722V788M462 450H528M1072 450H1138" />
          <path d="M548 198l22 22M1052 198l-22 22M548 702l22-22M1052 702l-22-22" />
        </g>

        <g fill="#ff8a3d">
          <circle cx="420" cy="120" r="3" />
          <circle cx="1180" cy="120" r="3" />
          <circle cx="420" cy="780" r="3" />
          <circle cx="1180" cy="780" r="3" />
          <circle cx="238" cy="188" r="3" />
          <circle cx="1362" cy="188" r="3" />
          <rect x="1490" y="300" width="6" height="6" />
          <rect x="104" y="300" width="6" height="6" />
        </g>

        <g stroke="currentColor" opacity=".42">
          <path d="M118 330h70M118 342h42M1412 330h70M1440 342h42" />
          <path d="M118 566h42M118 578h70M1412 566h70M1412 578h42" />
        </g>
      </svg>

      <div className="absolute left-[7%] top-[30%] hidden font-researcher text-[8px] uppercase tracking-[0.45em] md:block">
        SYSTEM / 03
      </div>

      <div className="absolute right-[7%] top-[30%] hidden text-right font-researcher text-[8px] uppercase tracking-[0.35em] md:block">
        STACK / ACTIVE
      </div>

      <div className="absolute left-[7%] bottom-[17%] hidden md:block opacity-100">
        <div className="mb-2 font-researcher text-[8px] uppercase tracking-[0.42em] text-[#3a322b]/60">
          TECHNICAL INDEX
        </div>

        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-[#ff8a3d]/50"
            />
          ))}
        </div>
      </div>

      <div className="absolute right-[7%] bottom-[17%] hidden text-right md:block">
        <div className="font-researcher text-[8px] uppercase tracking-[0.35em]">
          DIGITAL / CREATIVE
        </div>

        <div className="mt-1 font-researcher text-[7px] uppercase tracking-[0.25em] text-[#3a322b]/80">
          BUILD • DEPLOY • SCALE
        </div>
      </div>
    </div>
  );
}

export function TechnologyArsenal() {
  return (
    <section
      id="stack"
      className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden py-24 md:py-32"
    >
      <ArsenalHUD />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="px-6 md:px-12">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher">
          <span>03</span>

          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10" />

          <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">
            Technology Arsenal
          </span>
        </div>

        <div className="relative">
          <div className="absolute -left-5 top-[0.2em] hidden h-10 w-px bg-[#ff8a3d] md:block" />

          <WordReveal
            text="A modern arsenal for"
            accentText="building at the edge."
            className="font-display max-w-5xl text-[clamp(3rem,7vw,8rem)] font-black leading-[0.9] tracking-[-0.03em] mb-20 md:mb-32 text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]"
          />
        </div>

        <div className="mb-8 flex items-center justify-between font-researcher text-[8px] uppercase tracking-[0.35em] text-[#3a322b]/40 md:mb-10">
          <span>CORE TECHNOLOGIES</span>
          <span className="hidden md:block">
            01 — 20 / CONTINUOUSLY EVOLVING
          </span>
        </div>
      </div>

      <ScrollReveal initialTransform="translateY(40px)" delay={200}>
        <div className="relative z-10 flex w-full select-none flex-col gap-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ProximityPillRow
            techs={[
              "React",
              "Next.js",
              "TypeScript",
              "TailwindCSS",
              "Node.js",
              "Express",
              "MongoDB",
              "PostgreSQL",
              "OpenAI",
              "LLMs",
            ]}
            rowKey="row1"
            animClass="animate-marquee"
          />

          <ProximityPillRow
            techs={[
              "RAG",
              "AI Agents",
              "Docker",
              "AWS",
              "Vercel",
              "GitHub",
              "REST APIs",
              "Authentication",
              "Prompt Engineering",
              "AI Workflows",
            ]}
            rowKey="row2"
            reverse
            dimmed
            animClass="animate-marquee-slow"
          />
        </div>
      </ScrollReveal>

        <div className="relative z-10 mt-10 flex items-center justify-between px-6 font-researcher text-[8px] uppercase tracking-[0.32em] text-[#3a322b]/55 md:px-12">
          <span>01 / FRONTEND</span>
          <span>02 / BACKEND</span>
          <span>03 / AI SYSTEMS</span>
          <span className="hidden md:inline">04 / INFRASTRUCTURE</span>
        </div>
      </div>
    </section>
  );
}
