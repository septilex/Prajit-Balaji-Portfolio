"use client" 

import * as React from "react"
import { useRef } from "react";
import {
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
 
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import Link from "next/link";
 
const cn = (...args: any[]) => twMerge(clsx(args));
 
export interface DockItemData {
  link: string;
  Icon: React.ReactNode;
  target?: string;
}

export interface AnimatedDockProps {
  className?: string;
  items: DockItemData[];
}
 
export const AnimatedDock = ({ className, items }: AnimatedDockProps) => {
  const mouseX = useMotionValue(Infinity);
 
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex h-14 items-center gap-3 rounded-full bg-[#f2ece1]/10 border border-[#3a2a1c]/5 px-3 py-1.5 backdrop-blur-md",
        className,
      )}
    >
      {items.map((item, index) => (
        <DockItem key={index} mouseX={mouseX}>
          <Link
            href={item.link}
            target={item.target}
            className="grow flex items-center justify-center w-full h-full text-white"
          >
            {item.Icon}
          </Link>
        </DockItem>
      ))}
    </motion.div>
  );
};
 
interface DockItemProps {
  mouseX: MotionValue<number>;
  children: React.ReactNode;
}
 
export const DockItem = ({ mouseX, children }: DockItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-100, 0, 100], [36, 54, 36]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 180,
    damping: 15,
  });

  const iconScale = useTransform(width, [36, 54], [0.9, 1.35]);
  const iconSpring = useSpring(iconScale, {
    mass: 0.1,
    stiffness: 180,
    damping: 15,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="aspect-square w-9 rounded-full bg-[#3a322b] text-white flex items-center justify-center cursor-pointer hover:bg-[#ff8a3d] transition-colors duration-300 shadow-sm"
    >
      <motion.div
        style={{ scale: iconSpring }}
        className="flex items-center justify-center w-full h-full grow"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
