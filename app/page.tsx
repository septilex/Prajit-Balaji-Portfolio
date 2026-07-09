"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Sun,
  Moon,
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  Mail,
  Loader2,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BackgroundTypography } from "@/components/BackgroundTypography";
import { StatsMarquee } from "@/components/StatsMarquee";
import { Credentials } from "@/components/Credentials";
import { Education } from "@/components/Education";
import { Expertise } from "@/components/Expertise";
import { TypewriterTitle } from "@/components/TypewriterTitle";
import { IntroPreloader } from "@/components/IntroPreloader";
import { MagneticNavGroup } from "@/components/ui/MagneticNavItem";
import { ProximityPillRow } from "@/components/ui/TechPill";
import { AnimatedHeroHeading } from "@/components/ui/AnimatedHeroHeading";
import { GlowButton } from "@/components/ui/glow";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);

    // Scroll spy logic to highlight active link using IntersectionObserver
    const sections = ["hero", "projects", "about", "stack", "journey", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);



  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setFormState("loading");
    setTimeout(() => {
      setFormState("success");
      setName("");
      setEmail("");
      setMessage("");
      // Reset after 3 seconds
      setTimeout(() => setFormState("idle"), 3000);
    }, 1800);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#0a0807] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff8a3d]" />
      </div>
    );
  }

  const buildPillars = [
    {
      num: "01",
      title: "AI Products",
      desc: "Built DevMentor AI and KADENCE — applying LLMs, agents, and intelligent workflows to real products.",
      image: "/kadence-preview.png",
    },
    {
      num: "02",
      title: "Creative Technology",
      desc: "Created VELARI, combining generative AI, interaction design, and immersive digital experiences.",
      image: "/velari-preview.png",
    },
    {
      num: "03",
      title: "Developer Platforms",
      desc: "Built products focused on developer growth, mentorship, analysis, and productivity.",
      image: "/devscore-preview.png",
    },
    {
      num: "04",
      title: "Full-Stack Systems",
      desc: "Engineering complete products from frontend experiences to backend infrastructure and deployment.",
      image: "/devmentor-preview.png",
    }
  ];

  const capabilities = [
    { num: "01", title: "Full-Stack Development", desc: "End-to-end product engineering, from interface to infra." },
    { num: "02", title: "AI Integration", desc: "LLMs, RAG, agents, and intelligent product layers." },
    { num: "03", title: "Backend Systems", desc: "Resilient, scalable APIs and real-time pipelines." },
    { num: "04", title: "UI / UX Engineering", desc: "Cinematic interfaces with motion-rich micro-interactions." },
    { num: "05", title: "API Development", desc: "Clean REST & GraphQL contracts built to last." },
    { num: "06", title: "Cloud & Deployment", desc: "Vercel, AWS, Docker — shipping confidently." },
    { num: "07", title: "Database Architecture", desc: "Designing schemas that scale with the product." },
    { num: "08", title: "Performance Optimization", desc: "Sub-second experiences, every load, every device." },
  ];

  const projects = [
    {
      num: "/01",
      title: "KADENCE",
      cat: "MUSIC • 3D UNIVERSE",
      desc: "Step into a living, breathing 3D universe of music where every artist and album becomes a world to explore.",
      tags: ["REACT", "THREE.JS", "NEXT.JS"],
      status: "Live",
      year: "2026",
      link: "https://kadence-musicz.vercel.app/",
      github: "https://github.com/septilex",
      image: "/kadence-preview.png",
    },
    {
      num: "/02",
      title: "VELARI",
      cat: "AI • GENERATIVE ART",
      desc: "An AI canvas that turns your imagination into mesmerizing, gallery-worthy generative art in real time.",
      tags: ["REACT", "OPENAI", "TAILWIND CSS"],
      status: "Live",
      year: "2026",
      link: "https://velari-dusky.vercel.app/",
      github: "https://github.com/septilex",
      image: "/velari-preview.png",
    },
    {
      num: "/03",
      title: "DevMentor AI",
      cat: "AI • ENGINEERING ASSISTANT",
      desc: "An AI pair programmer that thinks like a senior engineer — auditing, architecting, and documenting your code at superhuman speed.",
      tags: ["NEXT.JS", "TYPESCRIPT", "OPENAI"],
      status: "Live",
      year: "2026",
      link: "https://devmentorr.vercel.app/",
      github: "https://github.com/septilex",
      image: "/devmentor-preview.png",
    },
    {
      num: "/04",
      title: "DevScore",
      cat: "AI • DEVELOPER ANALYSIS",
      desc: "The ultimate verdict on your code: scans your GitHub to reveal your true skill, growth, and developer DNA.",
      tags: ["NEXT.JS", "GITHUB API", "AI"],
      status: "Live",
      year: "2026",
      link: "https://devscore-xi.vercel.app/",
      github: "https://github.com/septilex",
      image: "/devscore-preview.png",
    },
  ];

  const timeline = [
    {
      year: "2027",
      role: "Amazon Internship Goal",
      desc: "Aiming to enter large-scale engineering environments as a Java-focused developer while strengthening backend systems, scalability, and software engineering foundations through real-world experience.",
      side: "left",
      logoSrc: "/logos/amazon.png",
      logoClass: "scale-[1.6]",
    },
    {
      year: "2032",
      role: "Aspiring Data Scientist at Google",
      desc: "Working toward contributing to intelligent systems, machine learning infrastructure, and large-scale data-driven technologies while expanding expertise in AI research, analytics, and generative systems.",
      side: "right",
      logoSrc: "/logos/google.png",
      logoClass: "scale-[1.6]",
    },
    {
      year: "2037",
      role: "Independent LLM & Startup Vision",
      desc: "Aiming to build a proprietary large language model ecosystem and lead an AI startup focused on futuristic digital products, intelligent systems, and real-world business integrations.",
      side: "left",
    },
    {
      year: "2040",
      role: "Long-Term Mission",
      desc: "Building impactful AI-driven technologies that help people transform ideas into scalable realities while pushing the boundaries of intelligent systems and human-centered innovation.",
      side: "right",
    },
  ];

  const navItems = [
    { id: "projects", label: "Work" },
    { id: "about", label: "About" },
    { id: "stack", label: "Stack" },
    { id: "journey", label: "Journey" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#f2ece1] transition-colors duration-700 ease-in-out">
      <IntroPreloader />
      <ScrollProgressBar />

      {/* Static Glow Orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[1] h-[500px] w-[500px] rounded-full opacity-70 mix-blend-screen transition-transform duration-500"
        style={{ transform: "translateX(-200px) translateY(-200px)" }}
      >
        <div className="glow-orb h-full w-full rounded-full"></div>
      </div>

      <div className="grid-overlay"></div>
      <div className="grain"></div>
      <div className="vignette"></div>

      {/* Floating Header Navbar */}
      <nav
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-700 w-[min(95%,720px)]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-40px)",
        }}
      >
        <div className="flex items-center justify-between gap-6 rounded-full border border-[#3a2a1c]/10 bg-[#f2ece1]/45 backdrop-blur-xl px-5 py-2.5 shadow-[0_12px_40px_rgba(58,50,43,0.1),0_2px_8px_rgba(58,50,43,0.05),inset_0_1px_0_rgba(255,255,255,0.5)]">
          <a href="#hero" className="flex items-center gap-2 text-sm font-medium tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a3d] to-[#c2410c] text-white text-[10px] font-bold shadow-[0_0_20px_rgba(255,138,61,0.4)]">
              P
            </span>
            <span className="hidden sm:inline text-[#3a322b] font-researcher font-bold tracking-[0.2em] text-[11px]">
              PRAJIT BALAJI
            </span>
          </a>

          <MagneticNavGroup items={navItems} activeSection={activeSection} />

          <div className="flex items-center gap-2">
            {/* Theme toggle removed */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen w-full overflow-hidden">
        {/* Background Typography */}
        <BackgroundTypography 
           rows={[
            "PRAJIT BALAJI • CREATIVE ENGINEER •",
            "ARTIFICIAL INTELLIGENCE • NEXT.JS • REACT •",
            "SYSTEM ARCHITECTURE • UI/UX PRO MAX •",
            "BUILDING THE FUTURE • SCALING SYSTEMS •"
           ]} 
           opacity={0.06}
        />

        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(40,18,8,0.9),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_70%_50%,rgba(40,18,8,0.9),transparent_60%)] light:bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,240,225,0.4),transparent_60%)]"></div>
          <div className="absolute left-[8%] top-[18%] h-[400px] w-[400px] rounded-full bg-[#c2410c]/20 blur-[80px] light:bg-[#c2410c]/8 light:blur-[80px]"></div>
          <div className="absolute right-[5%] top-[35%] h-[500px] w-[500px] rounded-full bg-[#ff8a3d]/15 blur-[100px] light:bg-[#ff8a3d]/6 light:blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-1/2 h-[350px] w-[70%] -translate-x-1/2 rounded-full bg-[#b87333]/18 blur-[80px] light:bg-[#b87333]/8 light:blur-[80px]"></div>
          <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#1a0d05]/80 via-[#0d0807]/40 to-transparent dark:from-[#1a0d05]/80 dark:via-[#0d0807]/40 light:from-[#f5efe6] light:to-transparent"></div>
        </div>

        {/* Hero layout: flex column filling full viewport height */}
        <div className="relative z-10 flex min-h-screen flex-col justify-between pb-12 pt-32">

          {/* Top metadata row — constrained to 1600px */}
          <ScrollReveal
            initialTransform="translateY(20px)"
            className="mx-auto mt-12 w-full max-w-[1600px] px-6 md:px-12 flex items-center justify-between text-[9.5px] uppercase tracking-[0.3em] text-[#1A1612] font-researcher font-bold"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff8a3d] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff8a3d]"></span>
              </span>
              <span>Available for projects · 2026</span>
            </div>
            <div className="hidden md:block">Portfolio · v0.26</div>
          </ScrollReveal>

          {/* ── MASSIVE HERO TITLE — full viewport width, no container constraint ── */}
          <div className="flex flex-1 flex-col justify-center items-center text-center w-full">
            <ScrollReveal initialTransform="translateY(80px)">
              <h1
                className="font-montserrat whitespace-nowrap font-black text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-glow"
                style={{
                  fontSize: "clamp(2rem, 12.5vw, 18rem)",
                  lineHeight: "0.85",
                  letterSpacing: "-0.06em",
                }}
              >
                PRAJIT BALAJI
              </h1>
            </ScrollReveal>

            {/* Sub-info row — centered directly underneath */}
            <div className="mt-12 flex flex-col items-center justify-center gap-6 px-6 md:px-12 w-full max-w-[1600px]">
              <ScrollReveal
                initialTransform="translateY(30px)"
              >
                <p className="font-display text-2xl leading-tight tracking-tight md:text-4xl text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-center">
                  Full-Stack AI Engineer
                  <br />
                  <TypewriterTitle />
                  <br />
                  <span className="font-syne text-[#a89c8d] text-xl md:text-2xl mt-3 inline-block">Creating futuristic digital experiences.</span>
                </p>
              </ScrollReveal>

              <ScrollReveal
                initialTransform="translateY(30px)"
                className="text-[9.5px] uppercase tracking-[0.25em] text-[#1A1612] font-researcher font-bold text-center mt-4"
              >
                <div>Based in the <span className="text-[#ff8a3d] font-bold">cloud</span></div>
                <div className="mt-1">Building the <span className="text-[#ff8a3d] font-bold">next decade</span></div>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom row — constrained to 1600px */}
          <ScrollReveal
            initialTransform="translateY(20px)"
            className="mx-auto w-full max-w-[1600px] px-6 md:px-12 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-[#1A1612] font-researcher font-bold"
          >
            <span className="flex items-center gap-2">Scroll to explore</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3a2a1c]/80 dark:border-[#3a2a1c]/80 light:border-black/10">
              <ArrowDown className="h-3 w-3 text-[#ff8a3d] animate-bounce" />
            </div>
            <span className="hidden md:inline">© 2026</span>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 1: About */}
      <section id="about" className="relative mx-auto max-w-[1600px] px-0 py-0 overflow-hidden">

        {/* ── Main 2-col editorial grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[100vh] relative z-10">

          {/* ── LEFT: Dominant Portrait ──────────────────────────────────── */}
          <ScrollReveal
            initialTransform="translateX(-30px)"
            className="md:col-span-6 relative overflow-hidden flex items-end"
          >
            {/* Atmospheric name watermark */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
              <span className="font-display font-black leading-[0.85] tracking-[-0.04em] text-[#3a322b]/[0.035] text-[clamp(5rem,14vw,16rem)]">
                PRAJIT
              </span>
              <span className="font-display font-black leading-[0.85] tracking-[-0.04em] text-[#3a322b]/[0.035] text-[clamp(5rem,14vw,16rem)]">
                BALAJI
              </span>
            </div>

            {/* Portrait — bleeds to full height, soft bottom fade */}
            <div className="relative z-10 w-full h-[70vh] md:h-[100vh] group">
              <Image
                src="/portrait/My Portrait White Shirt.png"
                alt="Prajit Balaji"
                fill
                className="object-cover object-top transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
                style={{
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                  mixBlendMode: "multiply",
                }}
                sizes="(max-width: 768px) 100vw, 58vw"
                priority
              />
              {/* Warm ambient glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#f2ece1] via-[#f2ece1]/30 to-transparent pointer-events-none" />
            </div>

            {/* Section tag — bottom-left corner */}
            <div className="absolute bottom-8 left-8 md:left-12 z-20 flex items-center gap-3 font-researcher text-[10px] uppercase tracking-[0.35em] text-[#3a322b]/40">
              <span>01</span>
              <span className="h-px w-8 bg-[#3a322b]/20" />
              <span className="text-[#ff8a3d]/70 font-black tracking-[0.4em]">About</span>
            </div>
          </ScrollReveal>

          {/* ── RIGHT: Editorial intro panel ─────────────────────────────── */}
          <ScrollReveal
            initialTransform="translateY(50px)"
            className="md:col-span-6 flex flex-col justify-center px-8 md:px-12 lg:px-14 py-20 md:py-24"
          >
            {/* Small eyebrow */}
            <p className="font-researcher text-[10px] uppercase tracking-[0.5em] text-[#ff8a3d]/70 mb-6">
              Introduction
            </p>

            {/* Syed-style 3-line animated hero heading */}
            <AnimatedHeroHeading
              lines={[
                "I BUILD PRODUCTS,",
                "CRAFT EXPERIENCES,",
                "ENGINEER THE FUTURE.",
              ]}
              accentWords={["products", "experiences", "future"]}
              className="mb-10"
            />

            {/* Thin separator */}
            <div className="w-12 h-[2px] bg-[#ff8a3d]/40 rounded-full mb-8" />

            {/* Biography block */}
            <div className="font-syne space-y-5 text-[16px] font-semibold leading-[24px] text-[#95979D]">
              <p>
                I'm{" "}
                <span 
                  className="font-extrabold text-[#3a322b] text-[1.05em] tracking-tight"
                  style={{ fontFamily: "var(--next-font-syne), sans-serif" }}
                >
                  Prajit Balaji K
                </span>
                {" "}— a 3rd-year B.Tech CSE
                {" "}<span className="text-[#ff8a3d] font-medium">(AI & Future Technologies)</span>{" "}
                student at{" "}
                <span className="text-[#ff8a3d] font-medium">SRM University – AP</span>.
              </p>

              <p>
                I build AI-powered products and am deeply passionate about{" "}
                <span className="text-[#ff8a3d]/90 font-medium">Generative AI</span> and{" "}
                <span className="text-[#ff8a3d]/90 font-medium">LLMs</span> — understanding how
                they work, experimenting with them, and shipping intelligent digital experiences.
              </p>

              <p>
                I turn ideas into real-world products through{" "}
                <span className="text-[#ff8a3d]/90 font-medium">full-stack engineering</span>,
                AI tooling, and design systems that feel as good as they perform.
              </p>

              <p>
                Outside of code, I obsess over new tech, build immersive UI/UX, and
                constantly push myself to learn faster and ship smarter.
              </p>
            </div>

            {/* CTA links */}
            <div className="mt-10 flex items-center gap-6">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.3em] text-[#3a322b] hover:text-[#ff8a3d] transition-colors duration-300"
              >
                <span>View Work</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <span className="h-px w-8 bg-[#3a322b]/15" />
              <a
                href="#contact"
                className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#3a322b]/45 hover:text-[#3a322b] transition-colors duration-300"
              >
                Let's Talk
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Marquee Strip */}
      <StatsMarquee />

      {/* Section 2: Education */}
      <Education />

      {/* Section 3: Technology Arsenal */}
      <section id="stack" className="relative mx-auto max-w-[1600px] pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="px-6 md:px-12">
          <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher">
            <span>03</span>
            <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
            <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">Technology Arsenal</span>
          </div>
          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-5xl text-[clamp(3rem,7vw,8rem)] font-black leading-[0.9] tracking-[-0.03em] mb-20 md:mb-32 text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
              A modern arsenal for <span className="text-[#ff8a3d]">building at the edge.</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Marquees */}
        <ScrollReveal initialTransform="translateY(40px)" delay={200}>
          <div className="flex flex-col gap-6 select-none mt-10 w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] overflow-hidden">
            {/* Row 1 */}
            <ProximityPillRow
              techs={["React", "Next.js", "TypeScript", "TailwindCSS", "Node.js", "Express", "MongoDB", "PostgreSQL", "OpenAI", "LLMs"]}
              rowKey="row1"
              animClass="animate-marquee"
            />

            {/* Row 2 */}
            <ProximityPillRow
              techs={["RAG", "AI Agents", "Docker", "AWS", "Vercel", "GitHub", "REST APIs", "Authentication", "Prompt Engineering", "AI Workflows"]}
              rowKey="row2"
              reverse
              dimmed
              animClass="animate-marquee-slow"
            />
          </div>
        </ScrollReveal>
      </section>



      {/* Section 4: Expertise */}
      <Expertise />

      {/* Section 5: Projects */}
      <section id="projects" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher">
          <span>05</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">Projects</span>
        </div>

        <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-5xl text-[clamp(3rem,7vw,8rem)] font-black leading-[0.9] tracking-[-0.03em] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
              Projects that <span className="text-[#ff8a3d]">define me.</span>
            </h2>
          </ScrollReveal>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-researcher">
            {projects.length} works
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-y-12 md:gap-y-20">
          {projects.map((project) => (
            <ScrollReveal
              key={project.title}
              initialTransform="translateY(80px)"
            >
              <div className="rainbow-glow relative rounded-[28px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 md:rounded-[40px]">
              <span aria-hidden="true" className="rainbow-halo"><span className="rainbow-conic" /></span>
              <span aria-hidden="true" className="rainbow-ring"><span className="rainbow-conic" /></span>
              <div
                className="group relative overflow-hidden rounded-[28px] md:rounded-[40px] border border-[#3a322b]/10 bg-gradient-to-br from-white via-[#faf5ec] to-[#f3ecdf] shadow-[0_30px_80px_-30px_rgba(58,50,43,0.28)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#ff8a3d]/30 hover:shadow-[0_45px_100px_-30px_rgba(255,138,61,0.35)]"
              >
                {/* Ambient orange glow on hover */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#ff8a3d]/10 opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100"></div>

                <div className="relative grid grid-cols-1 items-center gap-10 p-8 md:p-12 lg:grid-cols-2 lg:gap-12 lg:p-16">

                  {/* ── Left: Icons, Title, Description, Tech Tags ── */}
                  <div className="flex flex-col">
                    {/* Icon buttons */}
                    <div className="mb-8 flex items-center gap-4 md:mb-10">
                      <GlowButton
                        asChild
                        mode="rotate"
                        blur="soft"
                        glowScale={1.1}
                        colors={["#ff8a3d", "#3a322b", "#ffaf7a"]}
                        variant="unstyled"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1612] text-[#f2ece1] transition-all duration-300 hover:scale-110 hover:bg-[#ff8a3d] hover:text-[#1a1612] border-0 outline-none"
                      >
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source on GitHub`}
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      </GlowButton>
                      <GlowButton
                        asChild
                        mode="rotate"
                        blur="soft"
                        glowScale={1.1}
                        colors={["#ff8a3d", "#3a322b", "#ffaf7a"]}
                        variant="unstyled"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1612] text-[#f2ece1] transition-all duration-300 hover:scale-110 hover:bg-[#ff8a3d] hover:text-[#1a1612] border-0 outline-none"
                      >
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${project.title} live site`}
                        >
                          <Link2 className="h-5 w-5" />
                        </a>
                      </GlowButton>
                    </div>

                    {/* Title */}
                    <h3 className="font-montserrat text-4xl font-black leading-[0.95] tracking-tight text-[#1a1612] transition-colors duration-500 group-hover:text-[#ff8a3d] md:text-5xl xl:text-6xl">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="font-syne mt-4 w-[90%] max-w-[457px] text-[16px] font-semibold leading-[24px] text-[#95979D]">
                      {project.desc}
                    </p>

                    {/* Tech tags */}
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-syne text-[13px] font-bold uppercase tracking-[0.12em] text-[#3a322b] transition-colors duration-300 group-hover:text-[#1a1612] md:text-[15px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ── Right: MacBook mockup ── */}
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title}`}
                    className="relative block w-full"
                  >
                    <div className="relative mx-auto w-full max-w-[580px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                      {/* Screen + bezel */}
                      <div className="relative rounded-t-[16px] border-[10px] border-b-0 border-[#2b2b2f] bg-[#2b2b2f] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.5)] md:rounded-t-[20px] md:border-[14px] md:border-b-0">
                        <div className="relative overflow-hidden rounded-[4px] bg-black">
                          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#ff8a3d]/25 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-100"></div>
                          <Image
                            src={project.image}
                            alt={`${project.title} Preview`}
                            width={1600}
                            height={1000}
                            className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      {/* Base / hinge */}
                      <div className="relative left-1/2 h-3.5 w-[112%] -translate-x-1/2 rounded-b-[10px] bg-gradient-to-b from-[#d8d8db] via-[#bcbcc0] to-[#96969b] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] md:h-4">
                        {/* Notch */}
                        <div className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-[6px] bg-[#7c7c82]"></div>
                      </div>
                    </div>
                  </a>

                </div>
              </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>



      {/* Section 6: Credentials */}
      <Credentials />

      {/* Section 7: Journey */}
      <section id="journey" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher">
          <span>07</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">Journey</span>
        </div>

        <ScrollReveal initialTransform="translateY(40px)">
          <h2 className="font-display mb-24 max-w-5xl text-[clamp(3rem,7vw,8rem)] font-black leading-[0.9] tracking-[-0.03em] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
            My vision towards <span className="text-[#ff8a3d]">what I am striving to.</span>
          </h2>
        </ScrollReveal>

        {/* Timeline Grid */}
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#ff8a3d]/40 via-[#5a3f2a]/30 to-transparent md:left-1/2"></div>

          {timeline.map((node, idx) => (
            <ScrollReveal
              key={node.year}
              initialTransform="translateY(40px)"
              className={`relative mb-20 grid grid-cols-12 items-start gap-6 ${
                node.side === "right" ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Left Column (Content for left side, empty for right) */}
              <div
                className={`col-span-12 pl-8 md:col-span-5 md:pl-0 ${
                  node.side === "left" ? "md:text-right" : "md:hidden"
                }`}
              >
                <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 ${node.side === "left" ? "md:justify-end" : ""}`}>
                  {node.side === "left" && node.logoSrc && (
                    <div className="group/logo flex h-16 sm:h-20 px-6 sm:px-8 items-center justify-center rounded-[20px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)] light:shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,138,61,0.25)] overflow-hidden border border-black/5 dark:border-white/10 shrink-0">
                      <Image src={node.logoSrc} alt={node.role} width={200} height={80} className={`object-contain h-10 sm:h-12 w-auto ${node.logoClass || ""}`} priority />
                    </div>
                  )}
                  <div className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                    {node.year}
                  </div>
                </div>
                <div className="mt-4 font-display text-xl text-[#dfd3c0] md:text-2xl dark:text-[#dfd3c0] light:text-[#3a352f] font-medium">
                  {node.role}
                </div>
                <p className="mt-2 text-sm text-[#a89c8d]/70 font-syne">
                  {node.desc}
                </p>
              </div>

              {/* Center Dot */}
              <div className="absolute left-0 top-2 flex h-4 w-4 -translate-x-1/2 items-center justify-center md:left-1/2">
                <div className="h-3 w-3 rounded-full bg-[#ff8a3d] shadow-[0_0_18px_rgba(255,138,61,0.7)] animate-pulse"></div>
                <div className="absolute h-6 w-6 rounded-full border border-[#5a3f2a]/70 dark:border-[#5a3f2a]/70 light:border-black/10"></div>
              </div>

              {/* Right Column (Content for right side, empty for left) */}
              <div
                className={`col-span-12 pl-8 md:col-span-5 md:col-start-8 md:pl-0 ${
                  node.side === "right" ? "block" : "hidden md:block opacity-0"
                }`}
              >
                {node.side === "right" && (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                      <div className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                        {node.year}
                      </div>
                      {node.logoSrc && (
                        <div className="group/logo flex h-16 sm:h-20 px-6 sm:px-8 items-center justify-center rounded-[20px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)] light:shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,138,61,0.25)] overflow-hidden border border-black/5 dark:border-white/10 shrink-0">
                          <Image src={node.logoSrc} alt={node.role} width={200} height={80} className={`object-contain h-10 sm:h-12 w-auto ${node.logoClass || ""}`} priority />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 font-display text-xl text-[#dfd3c0] md:text-2xl dark:text-[#dfd3c0] light:text-[#3a352f] font-medium">
                      {node.role}
                    </div>
                    <p className="mt-2 text-sm text-[#a89c8d]/70 font-syne">
                      {node.desc}
                    </p>
                  </>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Section 8: Contact */}
      <section id="contact" className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
          <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-researcher">
            <span>08</span>
            <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
            <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">Let&apos;s Talk</span>
          </div>

          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-6xl text-[clamp(2.5rem,8vw,10rem)] font-semibold leading-[0.9] tracking-tight">
              Let's build the <span className="text-[#ff8a3d]">future.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-24 grid grid-cols-1 gap-16 md:grid-cols-12">
            {/* Form */}
            <ScrollReveal initialTransform="translateY(40px)" className="md:col-span-7">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold font-researcher">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={formState === "loading" || formState === "success"}
                      className="flex w-full py-1 transition-colors h-12 rounded-none border-0 border-b border-[#3a2a1c]/70 bg-transparent px-0 text-base text-[#f2ece1] placeholder:text-[#a89c8d]/55 focus:outline-none focus:border-[#ff8a3d] dark:text-[#f2ece1] dark:border-[#3a2a1c]/70 dark:placeholder:text-[#a89c8d]/55 light:text-black light:border-black/20 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold font-researcher">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={formState === "loading" || formState === "success"}
                      className="flex w-full py-1 transition-colors h-12 rounded-none border-0 border-b border-[#3a2a1c]/70 bg-transparent px-0 text-base text-[#f2ece1] placeholder:text-[#a89c8d]/55 focus:outline-none focus:border-[#ff8a3d] dark:text-[#f2ece1] dark:border-[#3a2a1c]/70 dark:placeholder:text-[#a89c8d]/55 light:text-black light:border-black/20 focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold font-researcher">
                    Tell me about it
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="A project, an idea, anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={formState === "loading" || formState === "success"}
                    className="flex w-full py-2 transition-colors rounded-none border-0 border-b border-[#3a2a1c]/70 bg-transparent px-0 text-base text-[#f2ece1] placeholder:text-[#a89c8d]/55 focus:outline-none focus:border-[#ff8a3d] dark:text-[#f2ece1] dark:border-[#3a2a1c]/70 dark:placeholder:text-[#a89c8d]/55 light:text-black light:border-black/20 focus:ring-0 resize-none"
                  />
                </div>

                <GlowButton
                  type="submit"
                  disabled={formState === "loading" || formState === "success"}
                  mode="rotate"
                  blur="medium"
                  colors={["#ff8a3d", "#e8742c", "#c2410c", "#ffaf7a"]}
                  variant="unstyled"
                  wrapperClassName="mt-4"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#ff8a3d]/50 bg-gradient-to-br from-[#ff8a3d] via-[#e8742c] to-[#c2410c] px-7 py-4 text-sm font-medium text-[#1a0d05] transition-all hover:shadow-[0_0_60px_rgba(255,138,61,0.45),inset_0_1px_0_rgba(255,220,180,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formState === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Transmitting...
                    </>
                  ) : formState === "success" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-950" />
                      Transmission Received!
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Send transmission
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </GlowButton>
              </form>
            </ScrollReveal>

            {/* Direct details */}
            <ScrollReveal
              initialTransform="translateX(-40px)"
              className="md:col-span-4 md:col-start-9 space-y-8"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold font-researcher">
                  Direct
                </div>
                <a
                  href="mailto:prajitk299@gmail.com"
                  className="font-display mt-2 block text-2xl tracking-tight hover:text-[#c9bcaa] md:text-3xl text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] transition-colors"
                >
                  prajitk299@gmail.com
                </a>
              </div>

              <div className="space-y-3 pt-4">
                {[
                  {
                    label: "Github",
                    href: "https://github.com/septilex",
                    icon: <Github className="h-4 w-4" />,
                  },
                  {
                    label: "LinkedIn",
                    href: "https://www.linkedin.com/in/prajit-balaji-kalidindi-2b706a36a/",
                    icon: <Linkedin className="h-4 w-4" />,
                  },
                  {
                    label: "Email",
                    href: "mailto:prajitk299@gmail.com",
                    icon: <Mail className="h-4 w-4" />,
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border-b border-[#3a2a1c]/55 dark:border-[#3a2a1c]/55 light:border-black/10 py-3 text-sm transition-colors hover:text-[#f2ece1] text-[#a89c8d]"
                  >
                    <span className="flex items-center gap-3 text-[#c9bcaa] group-hover:text-[#ff8a3d] transition-colors">
                      {social.icon}
                      {social.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#a89c8d]/55 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#ff8a3d]" />
                  </a>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Footer Accent bar / text */}
        <div className="relative border-t border-[#3a2a1c]/55 dark:border-[#3a2a1c]/55 light:border-black/10 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_at_50%_120%,rgba(255,138,61,0.28),rgba(194,65,12,0.12)_30%,transparent_60%)]"></div>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff8a3d]/60 to-transparent"></div>
          </div>

          <div className="relative mx-auto max-w-[1600px] px-6 py-16 md:px-12">
            <ScrollReveal initialTransform="translateY(100px)">
              <h3 className="font-montserrat text-balance text-[clamp(3.5rem,12vw,12rem)] font-black leading-[0.85] tracking-[-0.06em] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-glow">
                PRAJIT BALAJI
              </h3>
            </ScrollReveal>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-semibold font-researcher">
              <span>© 2026 · All systems imagined</span>
              <span>Crafted in the dark · v0.26</span>
              <span>Made with code, motion & care</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
