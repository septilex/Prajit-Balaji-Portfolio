"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles, Send, CheckCircle2, Loader2, Download } from "lucide-react";
import { GlowButton } from "@/components/ui/glow";
import { Magnetic } from "@/components/ui/Magnetic";
import { Genie } from "genie-web/react";
import { toCanvas } from "html-to-image";

interface HireMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ────────────────────────────────────────────────────────────────────────────────
// ModalContent - Extracted to allow rendering an invisible copy for instant pre-capture
// ────────────────────────────────────────────────────────────────────────────────
const ModalContent = React.forwardRef<HTMLDivElement, { 
  name: string, 
  email: string, 
  projectDetails: string, 
  formState: string, 
  errors: any, 
  isCaptureMode?: boolean,
  setName?: (v: string) => void,
  setEmail?: (v: string) => void,
  setProjectDetails?: (v: string) => void,
  handleSubmit?: (e: React.FormEvent) => void,
  onClose?: () => void,
  showResume?: boolean
}>((props, ref) => {
  const { name, email, projectDetails, formState, errors, isCaptureMode, setName, setEmail, setProjectDetails, handleSubmit, onClose, showResume } = props;

  return (
    <div
      ref={ref}
      role={isCaptureMode ? undefined : "dialog"}
      aria-modal={isCaptureMode ? undefined : "true"}
      aria-labelledby={isCaptureMode ? undefined : "hire-me-title"}
      className={`relative w-full max-w-[1100px] max-h-[95svh] overflow-y-auto overflow-x-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[36px] border border-[var(--border-medium)] p-5 sm:p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(255,138,61,0.15)] custom-scrollbar ${
        isCaptureMode ? "bg-white" : "bg-[var(--bg-card)]"
      }`}
    >
      {/* Explicit solid background layer for html-to-image capture fallback */}
      {isCaptureMode && (
        <div 
          className="absolute inset-0 z-[-1]" 
          style={{ backgroundColor: "#ffffff" }}
          aria-hidden="true"
        />
      )}

      {/* Ambient orange glow orb in top corner (hidden during capture to prevent WebGL filter rendering bugs) */}
      {!isCaptureMode && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#ff8a3d]/12 blur-[40px]"
        />
      )}
      {/* Glass specular sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[28px] md:rounded-[36px] bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_30%,transparent_60%)]"
      />

      {/* Close Button - Absolute */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className={`absolute top-6 right-6 md:top-8 md:right-8 z-[60] group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--fg-mute)] transition-all duration-200 hover:border-[#ff8a3d]/50 hover:bg-[#ff8a3d]/10 hover:text-[var(--amber)] ${
          isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/80 backdrop-blur-md"
        }`}
      >
        <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
      </button>

      {/* Two Column Layout Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-center">
        
        {/* LEFT COLUMN - CONTACT FORM */}
        <div className="flex flex-col">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff8a3d] font-researcher">
              <Sparkles className="h-3.5 w-3.5 text-[#ff8a3d]" />
              <span>Availability • Open for Work</span>
            </div>
            <h3
              id={isCaptureMode ? undefined : "hire-me-title"}
              className="font-montserrat mt-2 text-2xl font-black tracking-tight text-[var(--fg-primary)] md:text-3xl pr-12 lg:pr-0"
            >
              Let&apos;s Build Together.
            </h3>
            <p className="font-syne mt-1 text-[13px] font-medium text-[var(--fg-mute)]">
              Have an ambitious vision or project in mind? Tell me about it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                Name <span className="text-[#ff8a3d]">*</span>
              </label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => {
                  setName?.(e.target.value);
                  if (errors.name) errors.name = undefined;
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                  errors.name ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                Email <span className="text-[#ff8a3d]">*</span>
              </label>
              <input
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => {
                  setEmail?.(e.target.value);
                  if (errors.email) errors.email = undefined;
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                  errors.email ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
            </div>

            {/* What are you looking to build? */}
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                What are you looking to build? <span className="text-[#ff8a3d]">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell me about your product, timeline, vision, or role..."
                value={projectDetails}
                onChange={(e) => {
                  setProjectDetails?.(e.target.value);
                  if (errors.projectDetails) errors.projectDetails = undefined;
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 resize-none ${
                  errors.projectDetails ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Magnetic strength={0.2} className="w-full">
                <div
                  // We use a simple button instead of GlowButton in capture mode if GlowButton causes WebGL issues,
                  // but GlowButton should be fine. We just map it.
                  className="font-syne group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#ff8a3d]/60 bg-gradient-to-r from-[#ff8a3d] via-[#e8742c] to-[#c2410c] px-6 py-3.5 text-sm font-bold tracking-wider uppercase text-[#1a0d05] shadow-[0_0_25px_rgba(255,138,61,0.35)]"
                >
                  <span className="font-syne">SEND INQUIRY →</span>
                </div>
              </Magnetic>
            </div>

            {/* Subtle direct email hint */}
            <div className="pt-1 text-center">
              <span className="text-[11px] text-[var(--fg-mute)]/75 font-syne">
                Prefer direct contact?{" "}
                <span className="text-[#ff8a3d]">prajitk299@gmail.com</span>
              </span>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN - RESUME PREVIEW */}
        <div className="flex flex-col pt-4 lg:pt-0 w-full items-center justify-center">
          {/* Resume Card */}
          <div 
            className="relative w-full max-w-[450px] mx-auto rounded-[16px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden" 
            style={{ aspectRatio: "8.5 / 11" }}
          >
            {isCaptureMode ? (
               // Static fallback for WebGL capture to avoid iframe CORS/taint issues which cause black textures
               // Enforce solid white background for the resume placeholder area
               <div className="absolute inset-0 flex flex-col items-center justify-center border-none" style={{ backgroundColor: "#ffffff" }}>
                 <span className="text-[#3a2a1c]/20 font-syne font-bold text-3xl tracking-widest uppercase">Resume</span>
                 <span className="text-[#3a2a1c]/20 font-syne text-sm tracking-wider uppercase mt-2">Prajit Balaji K</span>
               </div>
            ) : showResume ? (
              // Mounted on the first genuine intent (hover/focus of HIRE ME) or on open — never during page load
              <iframe
                src="/Prajit_Balaji_Resume.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0&statusbar=0"
                className="absolute -top-[20px] -left-[20px] w-[calc(100%+40px)] h-[calc(100%+40px)] pointer-events-none border-none bg-white"
                title="Prajit Balaji Resume"
              />
            ) : null}
            <div className="absolute inset-0 z-10" />
          </div>

          {/* Download Resume Button */}
          <div className="mt-5 flex justify-center shrink-0">
            <Magnetic strength={0.3}>
              <div className="font-syne group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fg-mute)] px-4 py-2">
                <Download className="h-4 w-4" />
                DOWNLOAD MY RESUME
              </div>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  );
});

ModalContent.displayName = "ModalContent";


// ────────────────────────────────────────────────────────────────────────────────
// Genie snapshot helpers (FIX-05)
// ────────────────────────────────────────────────────────────────────────────────
const HIRE_ME_SELECTOR = '[aria-label="Hire Me"]';
const SNAPSHOT_DELAY_AFTER_LOAD_MS = 5000; // the intro finishes ~3–5 s after load
const SNAPSHOT_IDLE_TIMEOUT_MS = 3000;
const SNAPSHOT_RESIZE_DEBOUNCE_MS = 400;
const SNAPSHOT_REFRESH_AFTER_CLOSE_MS = 1000; // let the close warp finish first

/** Layout key the snapshot depends on (scrollbar-independent, stable across mobile URL-bar changes). */
const viewportKey = () => `${window.innerWidth}x${document.documentElement.clientHeight}`;

function runWhenIdle(fn: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => fn(), { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 1);
  return () => window.clearTimeout(id);
}

// html-to-image's default font embedding inlines every @font-face of every family
// the node uses — all unicode subsets and every listed format — and re-fetches them
// on each capture. The snapshot only needs the faces that can render the modal's own
// text, so that CSS is built once (woff2 preferred) and reused.
let modalFontCSS: Promise<string> | null = null;

function getModalFontCSS(node: HTMLElement): Promise<string> {
  modalFontCSS ??= buildFontEmbedCSS(node).catch((err) => {
    modalFontCSS = null;
    throw err;
  });
  return modalFontCSS;
}

const unquote = (s: string) => s.trim().replace(/^["']|["']$/g, "");

function inUnicodeRange(range: string, codePoints: Set<number>): boolean {
  if (!range.trim()) return true;
  return range.split(",").some((part) => {
    const p = part.trim().replace(/^u\+/i, "");
    let lo: number;
    let hi: number;
    if (p.includes("-")) [lo, hi] = p.split("-").map((h) => parseInt(h, 16));
    else if (p.includes("?")) {
      lo = parseInt(p.replace(/\?/g, "0"), 16);
      hi = parseInt(p.replace(/\?/g, "F"), 16);
    } else lo = hi = parseInt(p, 16);
    for (const cp of codePoints) if (cp >= lo && cp <= hi) return true;
    return false;
  });
}

async function toDataURL(url: string): Promise<string> {
  const blob = await (await fetch(url, { cache: "force-cache" })).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function buildFontEmbedCSS(node: HTMLElement): Promise<string> {
  const families = new Set<string>();
  let text = node.textContent ?? "";
  for (const el of [node, ...Array.from(node.querySelectorAll<HTMLElement>("*"))]) {
    getComputedStyle(el).fontFamily.split(",").forEach((f) => families.add(unquote(f)));
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) text += el.placeholder + el.value;
  }
  const codePoints = new Set(Array.from(text, (ch) => ch.codePointAt(0) ?? 0));

  const faces: { rule: CSSFontFaceRule; base: string }[] = [];
  const collect = (rules: CSSRuleList, base: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) faces.push({ rule, base });
      else if (rule instanceof CSSGroupingRule) collect(rule.cssRules, base);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet — none of the modal's fonts come from one
    }
    collect(rules, sheet.href ?? document.baseURI);
  }

  const css = await Promise.all(
    faces
      .filter(
        ({ rule }) =>
          families.has(unquote(rule.style.getPropertyValue("font-family"))) &&
          inUnicodeRange(rule.style.getPropertyValue("unicode-range"), codePoints)
      )
      .map(async ({ rule, base }) => {
        const src = rule.style.getPropertyValue("src");
        const sources = Array.from(
          src.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)(?:\s*format\(\s*(["']?)(.*?)\3\s*\))?/g),
          (m) => ({ url: m[2], format: m[4] })
        );
        const pick = sources.find((s) => s.format === "woff2") ?? sources[0];
        if (!pick) return rule.cssText; // local() only — metric-adjusted fallback faces
        const embedded = `url(${await toDataURL(new URL(pick.url, base).href)})${pick.format ? ` format("${pick.format}")` : ""}`;
        if (rule.cssText.includes(src)) return rule.cssText.split(src).join(embedded);
        const descriptors = ["font-family", "font-style", "font-weight", "font-stretch", "unicode-range", "size-adjust", "ascent-override", "descent-override", "line-gap-override"]
          .map((p) => [p, rule.style.getPropertyValue(p)])
          .filter(([, v]) => v)
          .map(([p, v]) => `${p}: ${v};`)
          .join(" ");
        return `@font-face { ${descriptors} src: ${embedded}; }`;
      })
  );
  return css.join("\n");
}

// ────────────────────────────────────────────────────────────────────────────────
// Main Modal
// ────────────────────────────────────────────────────────────────────────────────
export function HireMeModal({ isOpen, onClose }: HireMeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; projectDetails?: string }>({});

  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Measure scrollbar exactly once on mount
  useEffect(() => {
    setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth);
  }, []);

  // ── Genie snapshot (FIX-05) ──────────────────────────────────────────────────
  // The warp needs a bitmap of the modal. It is captured once, off the critical
  // path — when the page is idle after the intro, or on the first intent (hover /
  // focus of HIRE ME), whichever comes first — and reused for every open/close.
  // The capture copy exists only while a capture runs (inert + aria-hidden).
  const [captureMounted, setCaptureMounted] = useState(false);
  const captureNodeRef = useRef<HTMLDivElement | null>(null);
  const captureNodeWaiterRef = useRef<((el: HTMLDivElement) => void) | null>(null);
  const snapshotRef = useRef<{ canvas: HTMLCanvasElement; key: string } | null>(null);
  const snapshotJobRef = useRef<Promise<HTMLCanvasElement> | null>(null);
  const snapshotStaleRef = useRef(false);
  const isOpenRef = useRef(isOpen);

  // PDF preview: mounted on the first genuine intent or on open, then kept mounted.
  const [resumeRequested, setResumeRequested] = useState(false);
  if (isOpen && !resumeRequested) setResumeRequested(true);

  const setCaptureNode = useCallback((el: HTMLDivElement | null) => {
    captureNodeRef.current = el;
    const resolve = captureNodeWaiterRef.current;
    if (el && resolve) {
      captureNodeWaiterRef.current = null;
      resolve(el);
    }
  }, []);

  // Single-flight: idle, intent and Genie all share one in-progress capture.
  const ensureSnapshot = useCallback((): Promise<HTMLCanvasElement> => {
    if (snapshotRef.current) return Promise.resolve(snapshotRef.current.canvas);
    if (snapshotJobRef.current) return snapshotJobRef.current;
    const job = (async () => {
      try {
        const key = viewportKey();
        const node =
          captureNodeRef.current ??
          (await new Promise<HTMLDivElement>((resolve) => {
            captureNodeWaiterRef.current = resolve;
            setCaptureMounted(true);
          }));
        const canvas = await toCanvas(node, {
          pixelRatio: 1.5, // Reduced from 2 for much smoother WebGL framerates
          backgroundColor: "transparent",
          fontEmbedCSS: await getModalFontCSS(node),
          style: {
            opacity: "1",
            visibility: "visible",
          },
        });
        snapshotRef.current = { canvas, key };
        return canvas;
      } finally {
        snapshotJobRef.current = null;
        setCaptureMounted(false);
      }
    })();
    snapshotJobRef.current = job;
    return job;
  }, []);

  const requestSnapshot = useCallback(() => {
    ensureSnapshot().catch((err) => console.warn("Hire Me snapshot failed:", err));
  }, [ensureSnapshot]);

  // What Genie calls on every show/hide: the cached snapshot (instant) or the
  // in-flight capture; only if that fails, a live capture as before.
  const captureForGenie = useCallback(async (el: HTMLElement): Promise<HTMLCanvasElement> => {
    try {
      return await ensureSnapshot();
    } catch (err) {
      console.warn("Hire Me snapshot failed, using a live capture:", err);
      try {
        return await toCanvas(el, { pixelRatio: 1.5, backgroundColor: "transparent" });
      } catch {
        const blank = document.createElement("canvas");
        blank.width = blank.height = 1;
        return blank;
      }
    }
  }, [ensureSnapshot]);

  // 1. Idle capture once the intro has finished.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelIdle: (() => void) | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        cancelIdle = runWhenIdle(requestSnapshot, SNAPSHOT_IDLE_TIMEOUT_MS);
      }, SNAPSHOT_DELAY_AFTER_LOAD_MS);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (timer !== undefined) clearTimeout(timer);
      cancelIdle?.();
    };
  }, [requestSnapshot]);

  // 2. First genuine intent on HIRE ME (hover / keyboard focus): capture now, preload the PDF.
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(HIRE_ME_SELECTOR);
    if (!trigger) return;
    const onIntent = () => {
      setResumeRequested(true);
      requestSnapshot();
    };
    trigger.addEventListener("pointerenter", onIntent);
    trigger.addEventListener("focus", onIntent);
    return () => {
      trigger.removeEventListener("pointerenter", onIntent);
      trigger.removeEventListener("focus", onIntent);
    };
  }, [requestSnapshot]);

  // 3. Keep the snapshot matched to the layout: after a resize, re-capture while closed.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelIdle: (() => void) | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const snap = snapshotRef.current;
        if (!snap || snap.key === viewportKey()) return;
        if (isOpenRef.current) {
          snapshotStaleRef.current = true; // keep using it until the modal has closed
          return;
        }
        snapshotRef.current = null;
        cancelIdle?.();
        cancelIdle = runWhenIdle(requestSnapshot, SNAPSHOT_IDLE_TIMEOUT_MS);
      }, SNAPSHOT_RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
      cancelIdle?.();
    };
  }, [requestSnapshot]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen || !snapshotStaleRef.current) return;
    const timer = setTimeout(() => {
      snapshotStaleRef.current = false;
      snapshotRef.current = null;
      requestSnapshot();
    }, SNAPSHOT_REFRESH_AFTER_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, requestSnapshot]);

  // Close on ESC key press & lock body scroll, with layout shift prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent the layout shift jitter when scrollbar disappears
      const currentScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${currentScrollbarWidth}px`;
      
      const hireBtn = document.querySelector('[aria-label="Hire Me"]');
      if (hireBtn instanceof HTMLElement) {
        // Find the fixed container of the button to apply the offset
        const fixedContainer = hireBtn.closest('.fixed');
        if (fixedContainer instanceof HTMLElement) {
          fixedContainer.style.marginRight = `${currentScrollbarWidth}px`;
        }
      }

      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.paddingRight = "0px";
      
      const hireBtn = document.querySelector('[aria-label="Hire Me"]');
      if (hireBtn instanceof HTMLElement) {
        const fixedContainer = hireBtn.closest('.fixed');
        if (fixedContainer instanceof HTMLElement) {
          fixedContainer.style.marginRight = "0px";
        }
      }

      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Disable custom cursor and restore native 1:1 cursor on modal open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.remove("has-custom-cursor");
    } else {
      document.documentElement.classList.add("has-custom-cursor");
    }
    return () => {
      document.documentElement.classList.add("has-custom-cursor");
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; projectDetails?: string } = {};
    if (!name.trim()) newErrors.name = "Please provide your name";
    if (!email.trim()) newErrors.email = "Please provide your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address";
    if (!projectDetails.trim()) newErrors.projectDetails = "Please describe what you are looking to build";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState("loading");
    setTimeout(() => {
      setFormState("success");
      setName("");
      setEmail("");
      setProjectDetails("");
      setErrors({});
      setTimeout(() => {
        setFormState("idle");
        onClose();
      }, 2200);
    }, 1500);
  };

  return (
    <>
      {/*
        SNAPSHOT COPY (FIX-05)
        Mounted only while the Genie snapshot is being captured. It uses the same box
        structure as the Genie wrapper below (the bare <div> stands in for Genie's own
        element), so it lays out at exactly the real modal's size. Hidden from
        assistive technology and keyboard focus.
      */}
      {captureMounted && (
        <div
          aria-hidden="true"
          inert
          className="fixed top-0 bottom-0 left-0 z-[-9999] pointer-events-none flex items-center justify-center p-4 sm:p-6 md:p-8"
          style={{ right: isOpen ? `${scrollbarWidth}px` : "0px" }}
        >
          <div>
            <ModalContent
              ref={setCaptureNode}
              name={name}
              email={email}
              projectDetails={projectDetails}
              formState={formState}
              errors={errors}
              isCaptureMode={true}
            />
          </div>
        </div>
      )}

      {/* 
        THE GENIE WRAPPER
        No global dimming / backdrop overlays are rendered as per request.
      */}
      <div 
        className="fixed top-0 bottom-0 left-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none"
        style={{ right: isOpen ? `${scrollbarWidth}px` : "0px" }}
      >
        <Genie
          open={isOpen}
          origin='[aria-label="Hire Me"]'
          config={{ 
            duration: 480, // Reduced from 850 for much faster, snappier movement
            direction: "auto",
            capture: captureForGenie
          }}
          className="pointer-events-auto"
        >
          <ModalContent 
           name={name}
           email={email}
           projectDetails={projectDetails}
           formState={formState}
           errors={errors}
           isCaptureMode={false}
           setName={setName}
           setEmail={setEmail}
           setProjectDetails={setProjectDetails}
           handleSubmit={handleSubmit}
           onClose={onClose}
           showResume={resumeRequested}
         />
        </Genie>
      </div>
    </>
  );
}
