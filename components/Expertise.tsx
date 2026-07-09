"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
        {/* Left accent bar — reveals on hover */}
        <div className="absolute left-0 top-0 w-[3px] h-full bg-[#ff8a3d] scale-y-0 group-hover/skill:scale-y-100 transition-transform duration-300 origin-top" />

        {/* Skill name */}
        <span 
          className="font-sans text-sm text-[#3a322b]/70 group-hover/skill:text-[#3a322b] transition-all duration-300"
          style={{ transform: "translateZ(15px)" }}
        >
          {name}
        </span>

        {/* Index number */}
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
    <div
      className="relative overflow-hidden"
      style={{ width: "0.6em", height: "1em" }}
    >
      <div
        className="absolute left-0 w-full"
        style={{
          transform: `translateY(-${digit}em)`,
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <div
            key={n}
            className="flex items-center justify-center"
            style={{ height: "1em" }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Digit Counter (Desktop left column) ────────────────────────────

function StickyDigitCounter({ activeIndex }: { activeIndex: number }) {
  const displayNum = activeIndex + 1;
  const tens = Math.floor(displayNum / 10);
  const ones = displayNum % 10;

  return (
    <div className="hidden md:block md:w-[35%] md:flex-shrink-0">
      <div className="sticky top-[200px]">
        <div
          className="flex font-display font-bold text-[#f2ece1]/10 light:text-black leading-none"
          style={{ fontSize: "18vw" }}
        >
          <DigitColumn digit={tens} />
          <DigitColumn digit={ones} />
        </div>
      </div>
    </div>
  );
}

// ─── ExpertiseCategoryBlock ─────────────────────────────────────────────────

const ExpertiseCategoryBlock = React.forwardRef<
  HTMLDivElement,
  { category: ExpertiseCategoryData; index: number }
>(function ExpertiseCategoryBlock({ category, index }, ref) {
  const padded = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={ref}
      className="min-h-[80vh] flex flex-col justify-center border-t border-[#3a2a1c]/35 light:border-black/10 last:border-b"
    >
      {/* Mobile-only ghost number */}
      <span className="md:hidden font-display font-bold text-6xl text-[#f2ece1]/10 light:text-black mb-4">
        {padded}
      </span>

      {/* Category title */}
      <h3 
        className="font-normal text-3xl md:text-5xl text-[#3a322b] tracking-wide leading-[1.05] uppercase"
        style={{ fontFamily: "'Anton', sans-serif" }}
      >
        {category.title}
      </h3>

      {/* Category description */}
      <p className="text-[#a89c8d] light:text-[#3a2a1c]/70 font-syne text-sm md:text-base mt-4 leading-relaxed max-w-xl">
        {category.description}
      </p>

      {/* Skills list */}
      <div className="mt-10 space-y-0">
        <ProximitySkillList skills={category.skills} />
      </div>
    </div>
  );
});

// ─── ExpertiseSection (Main Export) ─────────────────────────────────────────

export function Expertise() {
  const [activeIndex, setActiveIndex] = useState(0);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Scroll reveal for the header
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

  // Scroll spy — update active index using IntersectionObserver (highly performant)
  useEffect(() => {
    const refs = categoryRefs.current;
    if (!refs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = refs.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
    );

    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const setCategoryRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      categoryRefs.current[index] = el;
    },
    []
  );

  return (
    <section ref={sectionRef} className="px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div
          className="mb-16 pt-32"
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
          <h2 className="font-display font-black text-[clamp(3rem,7vw,8rem)] text-[#f2ece1] light:text-[#1a1612] leading-[0.9] tracking-[-0.03em]">
            My <span className="text-[#ff8a3d]">Expertise</span>
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="md:flex md:gap-12">
          {/* Left: Sticky giant counter (desktop only) */}
          <StickyDigitCounter activeIndex={activeIndex} />

          {/* Right: Category list */}
          <div className="md:flex-1 space-y-0">
            {EXPERTISE_DATA.map((category, i) => (
              <ExpertiseCategoryBlock
                key={category.title}
                ref={setCategoryRef(i)}
                category={category}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
