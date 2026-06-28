"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EducationItem = ({
  year,
  title1,
  title2,
  subtitle,
  grade,
  bottomText,
  align = "right",
}: {
  year: string;
  title1: string;
  title2: string;
  subtitle: string;
  grade: string;
  bottomText: string;
  align?: "left" | "right";
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect for the background year
  const yBg = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const isRight = align === "right";

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center min-h-[40vh] md:min-h-[50vh] py-12 ${
        isRight ? "justify-end" : "justify-start"
      }`}
    >
      {/* Huge Background Year */}
      <motion.div
        style={{ y: yBg }}
        className={`absolute top-1/2 -translate-y-1/2 font-display text-[15rem] md:text-[25rem] lg:text-[30rem] font-black leading-none text-white/[0.02] dark:text-white/[0.02] light:text-black/[0.03] pointer-events-none select-none z-0 ${
          isRight ? "right-[5%] md:right-[10%]" : "left-[5%] md:left-[10%]"
        }`}
      >
        {year}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 flex flex-col max-w-3xl ${
          isRight ? "items-end text-right" : "items-start text-left"
        }`}
      >
        {/* Arrow Line */}
        <div
          className={`flex items-center gap-4 mb-6 md:mb-8 ${
            isRight ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {isRight && (
            <motion.svg
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff8a3d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#ff8a3d]"
            >
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </motion.svg>
          )}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            style={{ originX: isRight ? 1 : 0 }}
            className="w-12 md:w-24 h-[1px] bg-[#ff8a3d]"
          />
          {!isRight && (
            <motion.svg
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff8a3d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#ff8a3d]"
            >
              <path d="M5 12h14M19 12l-7 7M19 12l-7-7" />
            </motion.svg>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col mb-4 md:mb-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tight text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] leading-[1.1]"
          >
            {title1}
          </motion.h3>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-bold tracking-tight text-[#ff8a3d] leading-[1.1]"
          >
            {title2}
          </motion.h3>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm md:text-base text-[#a89c8d] dark:text-[#a89c8d] light:text-[#5a5046] font-medium tracking-wide mb-1"
        >
          {subtitle}
        </motion.p>

        {/* Grade */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base md:text-lg text-[#ff8a3d] font-bold tracking-wider mb-2"
        >
          {grade}
        </motion.p>

        {/* Bottom Text (Metadata) */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[10px] md:text-xs text-[#a89c8d]/60 font-semibold tracking-[0.3em] uppercase"
        >
          {bottomText}
        </motion.p>
      </motion.div>
    </div>
  );
};

export const Education = () => {
  return (
    <section id="education" className="relative mx-auto max-w-[1600px] px-6 py-20 md:px-12 md:py-32 overflow-hidden">
      <div className="mb-16 md:mb-24 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 relative z-20">
        <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
        <span>Education</span>
      </div>

      <div className="flex flex-col gap-12 md:gap-24 w-full">
        {/* SRM University AP */}
        <EducationItem
          year="2024"
          align="right"
          title1="SRM University"
          title2="AP"
          subtitle="B.Tech in Computer Science and Engineering (AI & Future Technologies)"
          grade="CGPA: 8.92"
          bottomText="S R M · 2024 - 2028"
        />

        {/* Geetanjali Olympiad School */}
        <EducationItem
          year="2022"
          align="left"
          title1="Geetanjali Olympiad"
          title2="School"
          subtitle="CBSE, PCB (Physics, Chemistry & Biology)"
          grade="GPA: 8.2"
          bottomText="2022 - 2024"
        />
      </div>
    </section>
  );
};
