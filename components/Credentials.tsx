"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export type Credential = {
  id: string;
  tickerLabel: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
  imageSrc: string;
  verifyUrl?: string;
};

export const CREDENTIALS: Credential[] = [
  {
    id: "google-ai-pro",
    tickerLabel: "Google AI Professional",
    title: "Google AI Professional Certificate",
    issuer: "Google Career Certificates",
    date: "June 7, 2026",
    description: "Demonstrated fluency in AI, completing 7 courses on applying AI to brainstorming, research, communication, content creation, data analysis, and coding. Built a portfolio of 20+ artifacts using AI, vibe-coded a custom AI solution, and leveraged AI tools responsibly to solve real workplace challenges.",
    skills: ["AI Fundamentals", "Brainstorming & Planning", "Research & Insights", "Content Creation", "Data Analysis", "App Building"],
    imageSrc: "/certifications/Google AI.jpg",
    verifyUrl: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/overlay/Certifications/559499110/treasury/?profileId=ACoAAFt9SysBUj6heYrOZ1_DwJZQvMEbJs3izAg"
  },
  {
    id: "google-ai-essentials",
    tickerLabel: "Google AI Essentials",
    title: "Google AI Essentials",
    issuer: "Google Career Certificates",
    date: "May 30, 2026",
    description: "Competent in using AI tools responsibly and improving productivity across workflows. Completed hands-on practice designed to build AI skills, maximize productivity, and discover the art of prompting.",
    skills: ["Introduction to AI", "Maximize Productivity", "Art of Prompting", "Responsible AI"],
    imageSrc: "/certifications/Google AI Essentials.jpg",
    verifyUrl: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/overlay/Certifications/51308577/treasury/?profileId=ACoAAFt9SysBUj6heYrOZ1_DwJZQvMEbJs3izAg"
  },
  {
    id: "nvidia-prompt-eng",
    tickerLabel: "Prompt Engineering",
    title: "Building LLM Applications With Prompt Engineering",
    issuer: "NVIDIA",
    date: "May 25, 2026",
    description: "Demonstrated competence in the completion of Building LLM Applications With Prompt Engineering. Validated skills in interacting with Large Language Models and crafting effective prompts for complex AI applications.",
    skills: ["LLMs", "Prompt Engineering", "AI Application Development"],
    imageSrc: "/certifications/NVIDIA Prompt Engineering.jpg",
    verifyUrl: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/overlay/Certifications/1935341866/treasury/?profileId=ACoAAFt9SysBUj6heYrOZ1_DwJZQvMEbJs3izAg"
  },
  {
    id: "nvidia-gen-ai",
    tickerLabel: "Generative AI",
    title: "Generative AI Explained",
    issuer: "NVIDIA",
    date: "May 25, 2026",
    description: "Demonstrated competence in the core concepts of Generative AI, understanding how these models are built, trained, and deployed to solve complex real-world problems.",
    skills: ["Generative AI", "Deep Learning Concepts", "AI Workflows"],
    imageSrc: "/certifications/NVIDIA Generative AI.jpg",
    verifyUrl: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/overlay/Certifications/1935582351/treasury/?profileId=ACoAAFt9SysBUj6heYrOZ1_DwJZQvMEbJs3izAg"
  },
  {
    id: "jpmc-swe",
    tickerLabel: "Software Engineering",
    title: "Software Engineering Job Simulation",
    issuer: "JPMorgan Chase & Co. (Forage)",
    date: "May 29, 2026",
    description: "Completed practical tasks in a simulated corporate environment, gaining hands-on experience in project setup, systems integration, and backend API development.",
    skills: ["Project Setup", "Kafka Integration", "H2 Integration", "REST API", "Java Backend"],
    imageSrc: "/certifications/JP Morgan Job Simulation Kafka & Java.jpg",
    verifyUrl: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/overlay/Certifications/1935994035/treasury/?profileId=ACoAAFt9SysBUj6heYrOZ1_DwJZQvMEbJs3izAg"
  }
];

export function Credentials() {
  const [activeId, setActiveId] = useState(CREDENTIALS[0].id);
  const activeCredential = CREDENTIALS.find(c => c.id === activeId) || CREDENTIALS[0];

  const [isHovered, setIsHovered] = useState(false);
  const baseX = useMotionValue(0);

  // Smooth framer-motion infinite loop that pauses on hover
  useAnimationFrame((_, delta) => {
    if (isHovered) return;
    // Speed: moves 50% in roughly 40-45 seconds
    let currentX = baseX.get() - (delta * 0.0012);
    if (currentX <= -50) {
      currentX += 50;
    }
    baseX.set(currentX);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <section id="credentials" className="relative mx-auto w-full pt-32 pb-32 md:pt-48 md:pb-48 overflow-hidden z-10 bg-[#faf8f5]">
      {/* Background soft glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff8a3d]/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-[1600px] px-6 md:px-12 relative z-10">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#8c7d6e]">
          <span>06</span>
          <span className="h-px w-12 bg-[#ff8a3d]/40"></span>
          <span>Credentials</span>
        </div>
        
        <h2 className="font-display max-w-5xl text-[clamp(2.5rem,6vw,6.5rem)] font-bold leading-[0.95] tracking-tight mb-16 md:mb-24 text-[#110e0c]">
          Verified <span className="text-[#8c7d6e]/60">Expertise.</span>
        </h2>
      </div>

      {/* Ticker Tape Menu */}
      <div 
        className="relative w-full border-y border-[#110e0c]/5 bg-white/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-16 md:mb-24 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Edge Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#faf8f5] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#faf8f5] to-transparent z-20 pointer-events-none"></div>
        
        <motion.div
          style={{ x }}
          className="flex w-max py-8 pr-16 gap-16"
        >
          {/* We duplicate the credentials arrays to create enough width for a seamless 50% loop */}
          {[...CREDENTIALS, ...CREDENTIALS, ...CREDENTIALS, ...CREDENTIALS].map((cred, idx) => {
            const isActive = activeId === cred.id;
            return (
              <button
                key={`${cred.id}-${idx}`}
                onClick={() => setActiveId(cred.id)}
                className={`group relative flex items-center gap-5 whitespace-nowrap transition-all duration-300 outline-none ${
                  isActive ? "opacity-100 scale-105" : "opacity-40 hover:opacity-80"
                }`}
              >
                {/* Active Indicator Dot */}
                <div className={`relative flex items-center justify-center h-2.5 w-2.5 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                  <div className="h-full w-full rounded-full bg-[#ff8a3d] shadow-[0_0_15px_rgba(255,138,61,0.6)]"></div>
                  <div className="absolute inset-0 rounded-full border border-[#ff8a3d]/40 animate-ping"></div>
                </div>
                
                <span className={`font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight transition-colors duration-300 ${
                  isActive ? "text-[#110e0c]" : "text-[#8c7d6e]"
                }`}>
                  {cred.tickerLabel}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
          >
            {/* Left: Certificate Image Container */}
            <div className="lg:col-span-7 relative group perspective-[1200px]">
              <motion.div 
                className="relative rounded-[2rem] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] transition-transform duration-700 ease-out group-hover:scale-[1.01] group-hover:shadow-[0_30px_80px_rgba(255,138,61,0.08),0_0_0_1px_rgba(0,0,0,0.04)]"
                whileHover={{ rotateY: 2, rotateX: 2 }}
              >
                <div className="relative aspect-[1.4/1] w-full bg-[#fdfdfc]">
                  {/* Fallback pattern while loading */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#110e0c_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  
                  <Image 
                    src={activeCredential.imageSrc} 
                    alt={activeCredential.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-5 flex flex-col space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#ff8a3d]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VERIFIED • {activeCredential.date.split(" ").pop()}</span>
                </div>
                
                <h3 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-[#110e0c]">
                  {activeCredential.title}
                </h3>
                
                <p className="text-xl md:text-2xl font-medium text-[#8c7d6e]">
                  Issued by <span className="text-[#110e0c]">{activeCredential.issuer}</span>
                </p>
              </div>

              <div className="w-20 h-[2px] bg-gradient-to-r from-[#ff8a3d] to-transparent opacity-30"></div>

              <div className="space-y-8">
                <p className="text-lg md:text-xl leading-[1.8] text-[#6b6054] font-light">
                  {activeCredential.description}
                </p>
                
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8c7d6e]">Skills Validated</h4>
                  <div className="flex flex-wrap gap-3">
                    {activeCredential.skills.map(skill => (
                      <span key={skill} className="px-4 py-2 rounded-xl border border-[#e6e0d8] bg-white text-sm font-semibold text-[#110e0c] shadow-sm transition-all duration-300 hover:border-[#ff8a3d]/40 hover:text-[#ff8a3d] hover:shadow-[0_4px_12px_rgba(255,138,61,0.08)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {activeCredential.verifyUrl && (
                <div className="pt-8">
                  <a 
                    href={activeCredential.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#ff8a3d] text-white font-bold text-sm tracking-wide transition-all duration-300 hover:bg-[#e8742c] hover:scale-105 hover:shadow-[0_8px_25px_rgba(255,138,61,0.3)] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Verify Credential
                      <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
