"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles, CheckCircle2, Loader2, Download } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { Genie } from "genie-web/react";
import { toCanvas } from "html-to-image";
import { afterIntroIdle } from "@/lib/intro";
import { sendContactInquiry } from "@/lib/contact";

type FormErrors = { name?: string; email?: string; projectDetails?: string };

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
  errors: FormErrors,
  submitError?: string,
  isCaptureMode?: boolean,
  setName?: (v: string) => void,
  setEmail?: (v: string) => void,
  setProjectDetails?: (v: string) => void,
  handleSubmit?: (e: React.FormEvent) => void,
  onClose?: () => void
}>((props, ref) => {
  const { name, email, projectDetails, formState, errors, submitError, isCaptureMode, setName, setEmail, setProjectDetails, handleSubmit, onClose } = props;

  return (
    <div
      ref={ref}
      role={isCaptureMode ? undefined : "dialog"}
      aria-modal={isCaptureMode ? undefined : "true"}
      aria-labelledby={isCaptureMode ? undefined : "hire-me-title"}
      tabIndex={-1}
      className={`relative w-full max-w-[1100px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[28px] md:rounded-[36px] border border-[var(--border-medium)] p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(255,138,61,0.15)] custom-scrollbar ${
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
          <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor={isCaptureMode ? undefined : "hire-name"} className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                Name <span className="text-[#ff8a3d]">*</span>
              </label>
              <input
                id={isCaptureMode ? undefined : "hire-name"}
                required
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name && !isCaptureMode ? "hire-name-error" : undefined}
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => {
                  setName?.(e.target.value);
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                  errors.name ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
              {!isCaptureMode && errors.name && <p id="hire-name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor={isCaptureMode ? undefined : "hire-email"} className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                Email <span className="text-[#ff8a3d]">*</span>
              </label>
              <input
                id={isCaptureMode ? undefined : "hire-email"}
                required
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email && !isCaptureMode ? "hire-email-error" : undefined}
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => {
                  setEmail?.(e.target.value);
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                  errors.email ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
              {!isCaptureMode && errors.email && <p id="hire-email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* What are you looking to build? */}
            <div>
              <label htmlFor={isCaptureMode ? undefined : "hire-details"} className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-[var(--fg-mute)] font-semibold font-researcher">
                What are you looking to build? <span className="text-[#ff8a3d]">*</span>
              </label>
              <textarea
                id={isCaptureMode ? undefined : "hire-details"}
                required
                aria-invalid={!!errors.projectDetails}
                aria-describedby={errors.projectDetails && !isCaptureMode ? "hire-details-error" : undefined}
                rows={4}
                placeholder="Tell me about your product, timeline, vision, or role..."
                value={projectDetails}
                onChange={(e) => {
                  setProjectDetails?.(e.target.value);
                }}
                disabled={formState === "loading" || formState === "success"}
                className={`w-full rounded-2xl border ${isCaptureMode ? "bg-[var(--bg-elev)]" : "bg-[var(--bg-elev)]/60 backdrop-blur-md"} px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 resize-none ${
                  errors.projectDetails ? "border-red-500/80" : "border-[var(--border-subtle)]"
                }`}
              />
              {!isCaptureMode && errors.projectDetails && <p id="hire-details-error" className="mt-1 text-sm text-red-600">{errors.projectDetails}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Magnetic strength={0.2} className="w-full">
                <button
                  type="submit"
                  disabled={isCaptureMode || formState === "loading" || formState === "success"}
                  className="font-syne group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#ff8a3d]/60 bg-gradient-to-r from-[#ff8a3d] via-[#e8742c] to-[#c2410c] px-6 py-3.5 text-sm font-bold tracking-wider uppercase text-[#1a0d05] shadow-[0_0_25px_rgba(255,138,61,0.35)]"
                >
                  {formState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {formState === "success" && <CheckCircle2 className="h-4 w-4" />}
                  <span className="font-syne">{formState === "loading" ? "SENDING..." : formState === "success" ? "INQUIRY SENT" : "SEND INQUIRY"}</span>
                </button>
              </Magnetic>
            </div>

            {!isCaptureMode && submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
            {!isCaptureMode && formState === "success" && <p role="status" className="text-sm text-[var(--fg-primary)]">Thanks! Your inquiry has been sent.</p>}

            {/* Subtle direct email hint */}
            <div className="pt-1 text-center">
              <span className="text-[11px] text-[var(--fg-mute)]/75 font-syne">
                Prefer direct contact?{" "}
                <a href="mailto:prajitk299@gmail.com" className="text-[#ff8a3d] underline">prajitk299@gmail.com</a>
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
            ) : (
              <iframe
                tabIndex={-1}
                src="/Prajit_Balaji_Resume.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0&statusbar=0"
                className="absolute -top-[20px] -left-[20px] w-[calc(100%+40px)] h-[calc(100%+40px)] pointer-events-none border-none bg-white"
                title="Prajit Balaji Resume"
              />
            )}
            <div className="absolute inset-0 z-10" />
          </div>

          {/* Download Resume Button */}
          <div className="mt-5 flex justify-center shrink-0">
            <Magnetic strength={0.3}>
              <a href="/Prajit_Balaji_Resume.pdf" download="Prajit_Balaji_Resume.pdf" className="font-syne group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fg-mute)] px-4 py-2">
                <Download className="h-4 w-4" />
                DOWNLOAD MY RESUME
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  );
});

ModalContent.displayName = "ModalContent";


// ────────────────────────────────────────────────────────────────────────────────
// Main Modal
// ────────────────────────────────────────────────────────────────────────────────
export function HireMeModal({ isOpen, onClose }: HireMeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; projectDetails?: string }>({});

  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  const hiddenCaptureRef = useRef<HTMLDivElement>(null);
  const cachedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // 1. Pre-capture the modal invisibly after mount to ensure absolutely zero delay on click
  // html-to-image serialises the DOM and inlines every web font as base64 —
  // a big main-thread job. It used to fire 600ms after mount, i.e. right in the
  // middle of the intro, causing a visible hitch. Now it waits until the intro
  // is fully done and the browser is idle (fonts are loaded by then too).
  useEffect(() => {
    return afterIntroIdle(() => {
      // Measured after the intro: the preloader sets body overflow:hidden,
      // which would make the scrollbar width read as 0.
      setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth);

      if (hiddenCaptureRef.current && !cachedCanvasRef.current) {
        toCanvas(hiddenCaptureRef.current, {
          pixelRatio: 1.5, // Reduced from 2 for much smoother WebGL framerates
          backgroundColor: "transparent",
          skipFonts: false,
          style: {
            opacity: "1",
            visibility: "visible",
          }
        }).then((canvas) => {
          cachedCanvasRef.current = canvas;
        }).catch(err => console.warn("Pre-capture failed:", err));
      }
    }, 3000);
  }, []);

  // 2. The instant capture function passed to Genie WebGL
  const instantCapture = useCallback(async (el: HTMLElement) => {
    if (cachedCanvasRef.current) {
      return cachedCanvasRef.current;
    }
    return toCanvas(el, { pixelRatio: 1.5, backgroundColor: "transparent" });
  }, []);

  // Keep keyboard navigation inside the dialog and restore the opener on close.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const width = window.innerWidth - document.documentElement.clientWidth;
    const fixedButton = document.querySelector('[aria-label="Hire Me"]')?.closest<HTMLElement>('.fixed');
    const previousMargin = fixedButton?.style.marginRight ?? "";
    body.style.paddingRight = (parseFloat(getComputedStyle(body).paddingRight) + width) + "px";
    body.style.overflow = "hidden";
    if (fixedButton) fixedButton.style.marginRight = width + "px";
    const root = document.documentElement;
    const hadCustomCursor = root.classList.contains("has-custom-cursor");
    root.classList.remove("has-custom-cursor");

    const focusFrame = requestAnimationFrame(() => dialog?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      if (fixedButton) fixedButton.style.marginRight = previousMargin;
      if (hadCustomCursor) root.classList.add("has-custom-cursor");
      const returnTarget = opener?.getClientRects().length ? opener : document.querySelector<HTMLElement>('[aria-controls="site-menu"]');
      returnTarget?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; projectDetails?: string } = {};
    if (!name.trim()) newErrors.name = "Please provide your name";
    if (!email.trim()) newErrors.email = "Please provide your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Please enter a valid email address";
    if (!projectDetails.trim()) newErrors.projectDetails = "Please describe what you are looking to build";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || formState === "success") return;
    setSubmitError("");
    if (!validateForm()) {
      requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    submittingRef.current = true;
    setFormState("loading");
    try {
      await sendContactInquiry({ name, email, message: projectDetails });
      setFormState("success");
      setName("");
      setEmail("");
      setProjectDetails("");
      setErrors({});
    } catch (error) {
      setFormState("idle");
      setSubmitError(error instanceof Error ? error.message : "Unable to send. Please try again or email directly.");
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <>
      {/* 
        PRE-CAPTURE NODE
        Rendered identically to the real modal, ensuring EXACT padding and dimensions
        so the WebGL snapshot matches the final DOM pixel-for-pixel.
      */}
      <div
        aria-hidden="true"
        inert
        className="fixed top-0 bottom-0 left-0 z-[-9999] pointer-events-none flex items-center justify-center p-4 sm:p-6 md:p-8"
        style={{ right: "0px" }}
      >
         <ModalContent 
           ref={hiddenCaptureRef}
           name={name}
           email={email}
           projectDetails={projectDetails}
           formState={formState}
           errors={errors}
           isCaptureMode={true}
         />
      </div>

      {/* 
        THE GENIE WRAPPER
        No global dimming / backdrop overlays are rendered as per request.
      */}
      <div 
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={"fixed top-0 bottom-0 left-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 " + (isOpen ? "pointer-events-auto" : "pointer-events-none")}
        style={{ right: isOpen ? `${scrollbarWidth}px` : "0px" }}
      >
        <Genie
          open={isOpen}
          origin='[aria-label="Hire Me"]'
          config={{ 
            duration: 480, // Reduced from 850 for much faster, snappier movement
            direction: "auto",
            capture: instantCapture
          }}
          className="pointer-events-auto"
        >
          <ModalContent 
           name={name}
           email={email}
           projectDetails={projectDetails}
           formState={formState}
           errors={errors}
           ref={dialogRef}
           submitError={submitError}
           isCaptureMode={false}
           setName={(value) => { setName(value); setErrors((previous) => ({ ...previous, name: undefined })); setSubmitError(""); }}
           setEmail={(value) => { setEmail(value); setErrors((previous) => ({ ...previous, email: undefined })); setSubmitError(""); }}
           setProjectDetails={(value) => { setProjectDetails(value); setErrors((previous) => ({ ...previous, projectDetails: undefined })); setSubmitError(""); }}
           handleSubmit={handleSubmit}
           onClose={onClose}
         />
        </Genie>
      </div>
    </>
  );
}
