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
  const usageRef = useRef({ word1: 0, word2: 0 });
  const recentLettersRef = useRef<number[]>([]);

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
    const exitDur = 1.2 + Math.random() * 0.6; // 1.2s - 1.8s
    const gapDur = 0.1 + Math.random() * 0.1; // 100-200ms empty slot
    const entryDur = 1.2 + Math.random() * 0.6; // 1.2s - 1.8s

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

    const activeCount = animatingRef.current.size;
    const numAvailableDirs = 4 - activeCount;

    // Enforce 2 to 4 active letters per cycle. Wait if < 2 available.
    if (numAvailableDirs < 2) {
      if (loopRef.current) clearTimeout(loopRef.current);
      loopRef.current = setTimeout(() => {
        if (mountedRef.current) scheduleNext();
      }, 200 + Math.random() * 200);
      return;
    }

    const availableDirs = DIRECTIONS.filter((d) => !activeDirsRef.current.has(d));
    const numToAnimate = Math.floor(Math.random() * (numAvailableDirs - 2 + 1)) + 2;

    const word1 = [0, 1, 2, 3, 4, 5]; // PRAJIT
    const word2 = [7, 8, 9, 10, 11, 12]; // BALAJI

    let pickW1 = 0;
    let pickW2 = 0;

    if (numToAnimate === 2) {
      pickW1 = 1; pickW2 = 1;
    } else if (numToAnimate === 4) {
      pickW1 = 2; pickW2 = 2;
    } else if (numToAnimate === 3) {
      if (usageRef.current.word1 <= usageRef.current.word2) {
        pickW1 = 2; pickW2 = 1;
      } else {
        pickW1 = 1; pickW2 = 2;
      }
    }

    usageRef.current.word1 += pickW1;
    usageRef.current.word2 += pickW2;

    const availableWord1 = word1.filter((i) => !animatingRef.current.has(i));
    const availableWord2 = word2.filter((i) => !animatingRef.current.has(i));

    let w1Candidates = availableWord1.filter((i) => !recentLettersRef.current.includes(i));
    if (w1Candidates.length < pickW1) w1Candidates = availableWord1;

    let w2Candidates = availableWord2.filter((i) => !recentLettersRef.current.includes(i));
    if (w2Candidates.length < pickW2) w2Candidates = availableWord2;

    const selectedW1 = [...w1Candidates].sort(() => Math.random() - 0.5).slice(0, pickW1);
    const selectedW2 = [...w2Candidates].sort(() => Math.random() - 0.5).slice(0, pickW2);
    
    const selectedIndices = [...selectedW1, ...selectedW2].sort(() => Math.random() - 0.5);
    const shuffledDirs = [...availableDirs].sort(() => Math.random() - 0.5);

    recentLettersRef.current = [...recentLettersRef.current, ...selectedIndices].slice(-6);

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

    if (loopRef.current) clearTimeout(loopRef.current);
    const nextDelay = 300 + Math.random() * 900;
    loopRef.current = setTimeout(() => {
      if (mountedRef.current) scheduleNext();
    }, nextDelay);
  }, [animateLetter]);

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
      // Clean up GSAP timelines on unmount (fixes hot-reloading issues)
      mainRefs.current.forEach((el) => {
        if (el) {
          gsap.killTweensOf(el);
          gsap.set(el, { clearProps: "transform" });
        }
      });
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
