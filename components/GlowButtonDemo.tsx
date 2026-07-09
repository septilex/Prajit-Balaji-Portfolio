"use client";

import { GlowButton, type GlowButtonProps } from "@/components/ui/glow";
import { ArrowRight } from "lucide-react";

type GlowButtonDemoProps = Pick<
  GlowButtonProps,
  "mode" | "blur" | "duration" | "glowScale"
>;

export const GlowButtonDemo = ({
  mode = "rotate",
  blur = "strong",
  duration = 5,
  glowScale = 1,
}: GlowButtonDemoProps) => {
  return (
    <div className="flex min-h-[240px] flex-wrap items-center justify-center gap-6 p-10">
      <GlowButton
        mode={mode}
        blur={blur}
        duration={duration}
        glowScale={glowScale}
        colors={["#FF5733", "#33FF57", "#3357FF", "#F1C40F"]}
      >
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </GlowButton>
    </div>
  );
};

export default GlowButtonDemo;
