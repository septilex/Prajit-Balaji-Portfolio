"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntroLoadingBar } from "@/components/ui/IntroLoadingBar";

export function IntroPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [startOutro, setStartOutro] = useState(false);

  useEffect(() => {
    // Lock scroll during the intro
    document.body.style.overflow = "hidden";
    
    // Trigger text outro animation after 3.5s
    const textTimer = setTimeout(() => {
      setStartOutro(true);
    }, 3500);

    // Slide up the entire overlay after 4.6s
    const overlayTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "";
    }, 4600);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(overlayTimer);
      document.body.style.overflow = "";
    };
  }, []);

  const words = ["Innovating,", "Empowering,", "Delivering."];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f2ece1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(58, 50, 43, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(58, 50, 43, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px"
          }}
        >
          {/* Center column: text + loading bar */}
          <div className="flex flex-col items-center gap-8">
            {/* Word reveal row */}
            <motion.div
              initial="hidden"
              animate={startOutro ? "exit" : "visible"}
              className="flex flex-row space-x-[6px] md:space-x-3 text-base sm:text-xl md:text-2xl lg:text-3xl text-black tracking-[-0.02em] scale-x-[1.1] md:scale-x-[1.15] transform-origin-center"
              style={{ fontFamily: "'Montenegrin Gothic One', sans-serif" }}
            >
              {words.map((word, idx) => (
                <span key={idx} className="overflow-hidden block leading-[1.1] py-1">
                  <motion.span
                    variants={{
                      hidden: { y: 60, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 1.6,
                          ease: [0.25, 1, 0.5, 1],
                          delay: 0.2 + idx * 0.3,
                        },
                      },
                      exit: {
                        y: -60,
                        opacity: 0,
                        transition: {
                          duration: 0.8,
                          ease: [0.25, 1, 0.5, 1],
                          delay: idx * 0.15,
                        },
                      },
                    }}
                    className="block transform-gpu"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.div>

            {/* 8-bit retro loading bar — fades out with the outro */}
            <motion.div
              animate={startOutro ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="w-full px-4 sm:px-0"
            >
              <IntroLoadingBar
                startDelay={800}
                duration={2400}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
