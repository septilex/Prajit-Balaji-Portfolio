"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

// ─── ElasticHeroTitle ─────────────────────────────────────────────────────────
// Renders "PRAJIT BALAJI" with each letter in its own clipped slot.
//
// A completely cursor-independent loop randomly picks letters and performs
// a DIRECTIONAL EXIT + OPPOSITE-SIDE RE-ENTRY animation:
//
//   UP:    letter exits top     → clone enters from bottom
//   DOWN:  letter exits bottom  → clone enters from top
//   LEFT:  letter exits left    → clone enters from right
//   RIGHT: letter exits right   → clone enters from left
//
// Each letter slot has overflow:hidden so exit/entry are visually clipped.
// The magnetic cursor effect is handled by the <Magnetic> wrapper in the
// parent — this component has zero cursor awareness.

interface ElasticHeroTitleProps {
  className?: string;
  style?: React.CSSProperties;
}

const TITLE_CHARS = "PRAJIT BALAJI".split("");
type Direction = "up" | "down" | "left" | "right";
const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export function ElasticHeroTitle({ className, style }: ElasticHeroTitleProps) {
  const mainRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animatingRef = useRef<Set<number>>(new Set());
  const activeDirsRef = useRef<Set<Direction>>(new Set());
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleNextRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Indices of actual letters (not spaces)
  const letterIndices = TITLE_CHARS
    .map((ch, i) => (ch !== " " ? i : -1))
    .filter((i) => i !== -1);

  // ── Animate a single letter with exit + re-entry ──────────────────────────
  const animateLetter = useCallback((idx: number, dir: Direction) => {
    if (!mountedRef.current) return;
    if (animatingRef.current.has(idx)) return; // already in-flight

    const mainEl = mainRefs.current[idx];
    const container = mainEl?.parentElement;
    if (!mainEl || !container) return;

    animatingRef.current.add(idx);
    activeDirsRef.current.add(dir);
    const rect = container.getBoundingClientRect();

    // Travel distance — enough to fully leave the clipped slot
    const vDist = rect.height + 6;
    const hDist = rect.width + 6;

    let exitX = 0,
      exitY = 0,
      entryFromX = 0,
      entryFromY = 0;

    switch (dir) {
      case "up":
        exitY = -vDist;
        entryFromY = vDist;
        break;
      case "down":
        exitY = vDist;
        entryFromY = -vDist;
        break;
      case "left":
        exitX = -hDist;
        entryFromX = hDist;
        break;
      case "right":
        exitX = hDist;
        entryFromX = -hDist;
        break;
    }

    // Slower, elegant pacing (decreasing speed more)
    const exitDur = 0.55 + Math.random() * 0.2; // 550–750ms
    const gapDur = 0.04 + Math.random() * 0.04; // 40–80ms empty slot
    const entryDur = 0.55 + Math.random() * 0.2; // 550–750ms

    const tl = gsap.timeline({
      onComplete: () => {
        // Ensure perfect zero position
        gsap.set(mainEl, { x: 0, y: 0 });
        animatingRef.current.delete(idx);
        activeDirsRef.current.delete(dir);
        // Immediately replenish if we dropped below minimum
        if (scheduleNextRef.current) scheduleNextRef.current();
      },
    });

    // Phase 1 — Letter exits (slow start, accelerating)
    tl.to(mainEl, {
      x: exitX,
      y: exitY,
      duration: exitDur,
      ease: "power2.in",
    });

    // Phase 2 — Brief empty gap, then position at entry start
    tl.set(
      mainEl,
      {
        x: entryFromX,
        y: entryFromY,
      },
      `>+${gapDur}`
    );

    // Phase 3 — Letter enters (fast start, smoothly decelerating to an exact stop)
    tl.to(mainEl, {
      x: 0,
      y: 0,
      duration: entryDur,
      ease: "power2.out",
    });
  }, []);

  // ── Scheduling loop ───────────────────────────────────────────────────────
  const scheduleNext = useCallback(() => {
    if (!mountedRef.current) return;

    // Enforce 2 to 4 active letters
    const activeCount = animatingRef.current.size;
    const minRequired = Math.max(0, 2 - activeCount);
    const maxAllowed = 4 - activeCount;

    if (maxAllowed > 0) {
      const availableDirs = DIRECTIONS.filter(
        (d) => !activeDirsRef.current.has(d)
      );

      const maxPossible = Math.min(maxAllowed, availableDirs.length);

      if (maxPossible >= minRequired && maxPossible > 0) {
        let numToAnimate = 0;
        if (minRequired > 0) {
          numToAnimate = Math.floor(Math.random() * (maxPossible - minRequired + 1)) + minRequired;
        } else {
          // If we already have >= 2 active, we occasionally add more randomly
          if (Math.random() > 0.5) {
            numToAnimate = Math.floor(Math.random() * maxPossible) + 1;
          }
        }
        
        if (numToAnimate > 0) {
          const availableIndices = letterIndices.filter(
            (idx) => !animatingRef.current.has(idx)
          );

          const shuffledIndices = [...availableIndices].sort(() => Math.random() - 0.5);
          const selectedIndices = shuffledIndices.slice(0, numToAnimate);

          const shuffledDirs = [...availableDirs].sort(() => Math.random() - 0.5);

          selectedIndices.forEach((idx, i) => {
            const dir = shuffledDirs[i];
            activeDirsRef.current.add(dir);
            animatingRef.current.add(idx);

            const delay = Math.random() * 150; 
            setTimeout(() => {
              if (mountedRef.current) {
                animatingRef.current.delete(idx);
                activeDirsRef.current.delete(dir);
                animateLetter(idx, dir);
              } else {
                animatingRef.current.delete(idx);
                activeDirsRef.current.delete(dir);
              }
            }, delay);
          });
        }
      }
    }

    if (loopRef.current) clearTimeout(loopRef.current);
    const nextDelay = 300 + Math.random() * 900;
    loopRef.current = setTimeout(() => {
      if (mountedRef.current) scheduleNext();
    }, nextDelay);
  }, [letterIndices, animateLetter]);

  useEffect(() => {
    scheduleNextRef.current = scheduleNext;
  }, [scheduleNext]);

  // ── Mount / unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Delay first animation slightly so page settles in, but start soon
    const initialDelay = 500 + Math.random() * 500;
    loopRef.current = setTimeout(() => {
      if (mountedRef.current) scheduleNext();
    }, initialDelay);

    return () => {
      mountedRef.current = false;
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [scheduleNext]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <h1 className={className} style={style}>
      {TITLE_CHARS.map((ch, i) => {
        if (ch === " ") {
          return (
            <span
              key={`space-${i}`}
              style={{ display: "inline-block", width: "0.3em" }}
            >
              &nbsp;
            </span>
          );
        }
        return (
          <span
            key={`slot-${i}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              position: "relative",
              verticalAlign: "top",
              // Tiny breathing room so resting letters aren't clipped,
              // negative margin keeps layout identical to plain text
              paddingTop: "0.12em",
              paddingBottom: "0.12em",
              marginTop: "-0.12em",
              marginBottom: "-0.12em",
            }}
          >
            {/* Main letter */}
            <span
              ref={(el) => {
                mainRefs.current[i] = el;
              }}
              style={{
                display: "inline-block",
                willChange: "transform",
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </h1>
  );
}
