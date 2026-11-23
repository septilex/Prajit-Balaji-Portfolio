"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { onIntroPhase } from "@/lib/intro";

/** Mount a heavy feature only as it approaches the viewport, after the intro. */
export function DeferredSection({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let observer: IntersectionObserver | undefined;
    const cancel = onIntroPhase("done", () => {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer?.disconnect();
      }, { rootMargin: "300px 0px" });
      observer.observe(element);
    });
    return () => { cancel(); observer?.disconnect(); };
  }, []);
  return <div ref={ref} className={className}>{ready ? children : null}</div>;
}
