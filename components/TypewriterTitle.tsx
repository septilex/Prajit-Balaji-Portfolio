"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TITLES = [
  "Full Stack Developer",
  "ML Engineer",
  "React Developer",
  "UI/UX Enthusiast",
];

export const TypewriterTitle = () => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = TITLES[titleIndex];
    
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting && text === currentTitle) {
      // Hold for 1.5 seconds at the end of typing
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    } else if (isDeleting && text === "") {
      // Move to next title when fully deleted
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % TITLES.length);
      }, 500);
    } else {
      // Typing or deleting
      const nextDelay = isDeleting ? 35 : 60;
      timeoutId = setTimeout(() => {
        setText(currentTitle.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, nextDelay);
    }

    return () => clearTimeout(timeoutId);
  }, [text, isDeleting, titleIndex]);

  return (
    <span className="relative inline-flex flex-col items-center justify-center text-[#ff8a3d]/90 uppercase text-[11px] md:text-sm tracking-[0.3em] font-semibold mt-4">
      {/* Invisible longest text to exactly reserve the required layout space at all breakpoints */}
      <span className="invisible whitespace-nowrap">FULL STACK DEVELOPER</span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
        {text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block w-[2px] h-[1.1em] bg-[#ff8a3d]/90 ml-1 md:ml-1.5 rounded-full"
        />
      </span>
    </span>
  );
};
