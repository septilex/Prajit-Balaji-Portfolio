"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, CheckCircle2, Loader2, Download } from "lucide-react";
import { GlowButton } from "@/components/ui/glow";
import { Magnetic } from "@/components/ui/Magnetic";

interface HireMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HireMeModal({ isOpen, onClose }: HireMeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; projectDetails?: string }>({});

  // Close on ESC key press & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Disable custom cursor and restore native 1:1 cursor on modal open to eliminate all lag/delay
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
    if (!name.trim()) {
      newErrors.name = "Please provide your name";
    }
    if (!email.trim()) {
      newErrors.email = "Please provide your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!projectDetails.trim()) {
      newErrors.projectDetails = "Please describe what you are looking to build";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState("loading");

    // Seamless feedback simulation matching the existing portfolio submit UX
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop dark overlay (GPU accelerated, clean tint without heavy multi-layer blur thrashing) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[#0a0807]/85 transform-gpu will-change-[opacity]"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-me-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full max-w-[1100px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[28px] md:rounded-[36px] border border-[var(--border-medium)] bg-[var(--bg-card)] p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(255,138,61,0.15)] transform-gpu custom-scrollbar"
          >
            {/* Ambient orange glow orb in top corner */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#ff8a3d]/12 blur-[40px]"
            />
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
              className="absolute top-6 right-6 md:top-8 md:right-8 z-[60] group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elev)]/80 text-[var(--fg-mute)] transition-all duration-200 hover:border-[#ff8a3d]/50 hover:bg-[#ff8a3d]/10 hover:text-[var(--amber)] backdrop-blur-md"
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
                    id="hire-me-title"
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
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      disabled={formState === "loading" || formState === "success"}
                      className={`w-full rounded-2xl border bg-[var(--bg-elev)]/60 px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 backdrop-blur-md transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                        errors.name ? "border-red-500/80" : "border-[var(--border-subtle)]"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] font-medium text-red-400 font-syne">{errors.name}</p>
                    )}
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
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      disabled={formState === "loading" || formState === "success"}
                      className={`w-full rounded-2xl border bg-[var(--bg-elev)]/60 px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 backdrop-blur-md transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 ${
                        errors.email ? "border-red-500/80" : "border-[var(--border-subtle)]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] font-medium text-red-400 font-syne">{errors.email}</p>
                    )}
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
                        setProjectDetails(e.target.value);
                        if (errors.projectDetails) setErrors((prev) => ({ ...prev, projectDetails: undefined }));
                      }}
                      disabled={formState === "loading" || formState === "success"}
                      className={`w-full rounded-2xl border bg-[var(--bg-elev)]/60 px-4 py-3 text-sm text-[var(--fg-primary)] placeholder:[var(--fg-mute)]/50 backdrop-blur-md transition-all duration-200 focus:border-[#ff8a3d] focus:outline-none focus:ring-1 focus:ring-[#ff8a3d]/50 resize-none ${
                        errors.projectDetails ? "border-red-500/80" : "border-[var(--border-subtle)]"
                      }`}
                    />
                    {errors.projectDetails && (
                      <p className="mt-1 text-[11px] font-medium text-red-400 font-syne">{errors.projectDetails}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Magnetic strength={0.2} className="w-full">
                      <GlowButton
                        type="submit"
                        disabled={formState === "loading" || formState === "success"}
                        mode="rotate"
                        blur="medium"
                        colors={["#ff8a3d", "#e8742c", "#c2410c", "#ffaf7a"]}
                        variant="unstyled"
                        wrapperClassName="w-full"
                        className="font-syne group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full border border-[#ff8a3d]/60 bg-gradient-to-r from-[#ff8a3d] via-[#e8742c] to-[#c2410c] px-6 py-3.5 text-sm font-bold tracking-wider uppercase text-[#1a0d05] shadow-[0_0_25px_rgba(255,138,61,0.35)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,138,61,0.55)] disabled:cursor-not-allowed disabled:opacity-75"
                      >
                        {formState === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#1a0d05]" />
                            <span className="font-syne">Sending Inquiry...</span>
                          </>
                        ) : formState === "success" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-950" />
                            <span className="font-syne">Inquiry Sent!</span>
                          </>
                        ) : (
                          <>
                            <span className="font-syne">SEND INQUIRY →</span>
                            <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </>
                        )}
                      </GlowButton>
                    </Magnetic>
                  </div>

                  {/* Subtle direct email hint */}
                  <div className="pt-1 text-center">
                    <span className="text-[11px] text-[var(--fg-mute)]/75 font-syne">
                      Prefer direct contact?{" "}
                      <a
                        href="mailto:prajitk299@gmail.com"
                        className="text-[#ff8a3d] hover:underline underline-offset-2"
                      >
                        prajitk299@gmail.com
                      </a>
                    </span>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN - RESUME PREVIEW */}
              <div className="flex flex-col pt-4 lg:pt-0 w-full items-center justify-center">
                {/* Resume Card — clean, centered, no border, no glow, no tilt */}
                <div 
                  className="relative w-full max-w-[450px] mx-auto rounded-[16px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden" 
                  style={{ aspectRatio: "8.5 / 11.5" }}
                >
                  <iframe
                    src="/Prajit_Balaji_Resume.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0&statusbar=0"
                    className="absolute -top-[4px] -left-[6px] w-[calc(100%+12px)] h-[calc(100%+8px)] pointer-events-none border-none bg-white"
                    title="Prajit Balaji Resume"
                  />
                  <div className="absolute inset-0 z-10" />
                </div>

                {/* Download Resume Button */}
                <div className="mt-5 flex justify-center shrink-0">
                  <Magnetic strength={0.3}>
                    <a
                      href="/Prajit_Balaji_Resume.pdf"
                      download="Prajit_Balaji_Resume.pdf"
                      className="font-syne group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--fg-mute)] transition-colors hover:text-[#ff8a3d] px-4 py-2"
                    >
                      <Download className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                      DOWNLOAD MY RESUME
                    </a>
                  </Magnetic>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
