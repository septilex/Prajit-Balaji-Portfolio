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
} from "lucide-react";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BackgroundTypography } from "@/components/BackgroundTypography";
import { StatsMarquee } from "@/components/StatsMarquee";
import { Credentials } from "@/components/Credentials";
import { Education } from "@/components/Education";
import { Expertise } from "@/components/Expertise";
import { TypewriterTitle } from "@/components/TypewriterTitle";

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
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
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
      status: "Live",
      year: "2026",
      link: "https://kadence-musicz.vercel.app/",
      image: "/kadence-preview.png",
    },
    {
      num: "/02",
      title: "VELARI",
      cat: "AI • GENERATIVE ART",
      desc: "An AI canvas that turns your imagination into mesmerizing, gallery-worthy generative art in real time.",
      status: "Live",
      year: "2026",
      link: "https://velari-dusky.vercel.app/",
      image: "/velari-preview.png",
    },
    {
      num: "/03",
      title: "DevMentor AI",
      cat: "AI • ENGINEERING ASSISTANT",
      desc: "An AI pair programmer that thinks like a senior engineer — auditing, architecting, and documenting your code at superhuman speed.",
      status: "Live",
      year: "2026",
      link: "https://devmentorr.vercel.app/",
      image: "/devmentor-preview.png",
    },
    {
      num: "/04",
      title: "DevScore",
      cat: "AI • DEVELOPER ANALYSIS",
      desc: "The ultimate verdict on your code: scans your GitHub to reveal your true skill, growth, and developer DNA.",
      status: "Live",
      year: "2026",
      link: "https://devscore-xi.vercel.app/",
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

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#0a0807] light:bg-[#fdfbf7] transition-colors duration-700 ease-in-out">
      <ScrollProgressBar />

      {/* Static Glow Orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[1] h-[500px] w-[500px] rounded-full opacity-70 mix-blend-screen transition-transform duration-500"
        style={{ transform: "translateX(-200px) translateY(-200px)" }}
      >
        <div className="glow-orb h-full w-full rounded-full"></div>
      </div>

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
        <div className="flex items-center justify-between gap-6 rounded-full border border-[#3a2a1c]/60 bg-[#0f0a07]/55 px-5 py-2.5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,180,120,0.06)] dark:border-[#3a2a1c]/60 light:bg-white/60 light:border-black/10">
          <a href="#hero" className="flex items-center gap-2 text-sm font-medium tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a3d] to-[#c2410c] text-[#0a0807] text-[10px] font-bold shadow-[0_0_20px_rgba(255,138,61,0.4)]">
              P
            </span>
            <span className="hidden sm:inline text-[#f2ece1]/90 dark:text-[#f2ece1]/90 light:text-[#1a1612]/90">
              PRAJIT BALAJI
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-1">
            {[
              { id: "projects", label: "Work" },
              { id: "about", label: "About" },
              { id: "stack", label: "Stack" },
              { id: "journey", label: "Journey" },
              { id: "contact", label: "Contact" },
            ].map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`relative inline-block rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    activeSection === link.id
                      ? "text-[#ff8a3d]"
                      : "text-[#f2ece1]/55 dark:text-[#f2ece1]/55 light:text-[#1a1612]/55 hover:text-[#ff8a3d]"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

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
          <div className="absolute left-[8%] top-[18%] h-[520px] w-[520px] rounded-full bg-[#c2410c]/25 blur-[140px] light:bg-[#c2410c]/8 light:blur-[140px]"></div>
          <div className="absolute right-[5%] top-[35%] h-[640px] w-[640px] rounded-full bg-[#ff8a3d]/18 blur-[160px] light:bg-[#ff8a3d]/6 light:blur-[160px]"></div>
          <div className="absolute bottom-[-10%] left-1/2 h-[420px] w-[80%] -translate-x-1/2 rounded-full bg-[#b87333]/22 blur-[120px] light:bg-[#b87333]/8 light:blur-[120px]"></div>
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
                  <span className="text-[#a89c8d] text-xl md:text-2xl mt-3 inline-block">Creating futuristic digital experiences.</span>
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
      <section id="about" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48 overflow-hidden">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 relative z-20 font-researcher">
          <span>01</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span className="text-[#ff8a3d] font-black text-[13px] md:text-[15px] tracking-[0.4em]">About</span>
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12 relative z-10 items-center">
          
          {/* Left Column: Portrait Showcase */}
          <ScrollReveal initialTransform="translateY(60px)" className="md:col-span-9 relative flex items-center justify-center min-h-[600px] md:min-h-[800px]">
            
            {/* Background Oversized Typography */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-0 opacity-[0.015] dark:opacity-[0.015] light:opacity-[0.02] overflow-hidden">
              <h2 className="font-display text-[min(18vw,200px)] font-black leading-[0.8] tracking-tighter text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
                PRAJIT
              </h2>
              <h2 className="font-display text-[min(18vw,200px)] font-black leading-[0.8] tracking-tighter text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
                BALAJI
              </h2>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full">
              
              {/* Vertical Feature List */}
              <div className="flex flex-row md:flex-col gap-6 md:gap-10 order-2 md:order-1 flex-wrap justify-center md:justify-start w-full md:w-auto md:min-w-[140px] z-20">
                {[
                  { icon: "⌨", label: "Full Stack Developer" },
                  { icon: "🤖", label: "AI Builder" },
                  { icon: "⚛", label: "React Developer" },
                  { icon: "🎨", label: "UI/UX Enthusiast" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02] border border-white/[0.05] dark:bg-white/[0.02] dark:border-white/[0.05] light:bg-black/[0.02] light:border-black/[0.05] text-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white/[0.06] dark:group-hover:bg-white/[0.06] light:group-hover:bg-black/[0.06] group-hover:border-[#ff8a3d]/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[0_10px_30px_rgba(255,138,61,0.15)]">
                      <span className="opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{feature.icon}</span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a89c8d] group-hover:text-[#f2ece1] dark:group-hover:text-[#f2ece1] light:group-hover:text-[#1a1612] transition-colors duration-500 whitespace-nowrap">
                        {feature.label.split(' ').map((word, idx) => (
                          <React.Fragment key={idx}>
                            {word}<br/>
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portrait Image (Massive Showcase) */}
              <div className="relative order-1 md:order-2 flex-grow w-full group perspective-1000 z-10 flex justify-center lg:justify-start">
                <div className="relative aspect-square w-full max-w-[850px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
                  
                  {/* Soft ambient lighting behind image */}
                  <div className="absolute inset-0 z-0 bg-[#ff8a3d]/[0.03] light:bg-[#ff8a3d]/[0.05] rounded-full blur-[100px] transition-all duration-700 group-hover:bg-[#ff8a3d]/[0.06] light:group-hover:bg-[#ff8a3d]/[0.08] scale-90"></div>
                  
                  {/* The Image perfectly blended */}
                  <Image
                    src="/portrait/portrait-fdfbf7.png"
                    alt="Prajit Balaji"
                    fill
                    className="object-cover object-center transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
                    style={{
                      maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)"
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                    priority
                  />
                </div>
              </div>
              
            </div>
          </ScrollReveal>

          {/* Right Column: Biography */}
          <ScrollReveal initialTransform="translateY(80px)" className="md:col-span-3 md:pt-12 relative z-20">
            <div className="space-y-8 text-base md:text-[17px] leading-[1.85] tracking-[0.01em] text-[#c9bcaa] dark:text-[#c9bcaa] light:text-[#4a423a]">
              <p className="text-lg md:text-[19px] leading-[1.6] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#2a2420]">
                I'm <strong className="font-extrabold text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-xl md:text-2xl tracking-tight">Prajit Balaji K</strong>, a 2nd-year B.Tech CSE (AI & Future Technologies) student at <span className="font-medium text-[#ff8a3d]">SRM University – AP</span>.
              </p>
              <p>
                I love building AI products and am genuinely passionate about <span className="font-medium text-[#ff8a3d]">Generative AI</span> and <span className="font-medium text-[#ff8a3d]">LLMs</span> — exploring how they work, experimenting with them, and using them to create modern, intelligent, and high-performance digital experiences.
              </p>
              <p>
                I enjoy turning ideas into real-world products through <span className="font-medium text-[#ff8a3d]">full-stack development</span>, AI tools, and clean, interactive design.
              </p>
              <p>
                Outside of code, I explore new tech, build immersive UI/UX, and constantly push myself to learn and build better.
              </p>
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
          <div className="flex flex-col gap-6 select-none mt-10 w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            {/* Row 1 */}
            <div className="flex w-max animate-marquee gap-4 md:gap-6 whitespace-nowrap hover:[animation-play-state:paused] cursor-none">
              {[...["React", "Next.js", "TypeScript", "TailwindCSS", "Node.js", "Express", "MongoDB", "PostgreSQL", "OpenAI", "LLMs"], ...["React", "Next.js", "TypeScript", "TailwindCSS", "Node.js", "Express", "MongoDB", "PostgreSQL", "OpenAI", "LLMs"], ...["React", "Next.js", "TypeScript", "TailwindCSS", "Node.js", "Express", "MongoDB", "PostgreSQL", "OpenAI", "LLMs"]].map((tech, i) => (
                <span
                  key={`m1-${i}`}
                  data-cursor=""
                  className="inline-flex items-center px-7 py-4 rounded-full border border-white/10 bg-white/[0.02] text-[15px] md:text-[17px] font-semibold tracking-tight text-[#f2ece1] transition-all duration-500 ease-out hover:bg-[#ff8a3d]/10 hover:border-[#ff8a3d]/50 hover:text-[#ff8a3d] hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(255,138,61,0.2)] dark:border-white/10 dark:bg-white/[0.02] dark:text-[#f2ece1] dark:hover:bg-[#ff8a3d]/10 dark:hover:border-[#ff8a3d]/50 light:border-black/10 light:bg-black/[0.02] light:text-[#1a1612] light:hover:bg-[#ff8a3d]/10 light:hover:border-[#ff8a3d]/50 cursor-none"
                >
                  {["OpenAI", "LLMs", "RAG", "AI Agents", "Prompt Engineering", "AI Workflows"].includes(tech) && (
                    <span className="w-2 h-2 rounded-full bg-[#ff8a3d] mr-3 shadow-[0_0_12px_rgba(255,138,61,0.6)]"></span>
                  )}
                  {tech}
                </span>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex w-max animate-marquee-slow gap-4 md:gap-6 whitespace-nowrap hover:[animation-play-state:paused] cursor-none" style={{ animationDirection: "reverse" }}>
              {[...["RAG", "AI Agents", "Docker", "AWS", "Vercel", "GitHub", "REST APIs", "Authentication", "Prompt Engineering", "AI Workflows"], ...["RAG", "AI Agents", "Docker", "AWS", "Vercel", "GitHub", "REST APIs", "Authentication", "Prompt Engineering", "AI Workflows"], ...["RAG", "AI Agents", "Docker", "AWS", "Vercel", "GitHub", "REST APIs", "Authentication", "Prompt Engineering", "AI Workflows"]].map((tech, i) => (
                <span
                  key={`m2-${i}`}
                  data-cursor=""
                  className="inline-flex items-center px-7 py-4 rounded-full border border-white/10 bg-white/[0.02] text-[15px] md:text-[17px] font-semibold tracking-tight text-[#a89c8d] transition-all duration-500 ease-out hover:bg-[#ff8a3d]/10 hover:border-[#ff8a3d]/50 hover:text-[#ff8a3d] hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(255,138,61,0.2)] dark:border-white/10 dark:bg-white/[0.02] dark:text-[#a89c8d] dark:hover:bg-[#ff8a3d]/10 dark:hover:border-[#ff8a3d]/50 light:border-black/10 light:bg-black/[0.02] light:text-[#5a5046] light:hover:bg-[#ff8a3d]/10 light:hover:border-[#ff8a3d]/50 light:hover:text-[#ff8a3d] cursor-none"
                >
                  {["OpenAI", "LLMs", "RAG", "AI Agents", "Prompt Engineering", "AI Workflows"].includes(tech) && (
                    <span className="w-2 h-2 rounded-full bg-[#ff8a3d] mr-3 shadow-[0_0_12px_rgba(255,138,61,0.6)] animate-pulse"></span>
                  )}
                  {tech}
                </span>
              ))}
          </div>
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

        <div className="mt-20 flex flex-col gap-y-40 md:gap-y-64">
          {projects.map((project, idx) => (
            <ScrollReveal
              key={project.title}
              initialTransform="translateY(80px)"
            >
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredProject(idx)}
                onMouseLeave={() => setHoveredProject(null)}
                data-cursor="EXPLORE"
                className={`group block w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  hoveredProject !== null && hoveredProject !== idx ? "opacity-40 scale-[0.97]" : "opacity-100 scale-100"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-14 items-center">
                  
                  {/* Left Column: Number & Title */}
                  <div className="order-1 lg:order-none lg:col-span-4 flex flex-col justify-center relative z-20 pr-0 lg:pr-4">
                    <div className="flex lg:flex-col items-baseline lg:items-start gap-3 lg:gap-6">
                      <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#a89c8d]/60 font-researcher">
                        {project.num}
                      </span>
                      <h3 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-[3.5rem] leading-[0.9] font-black tracking-[-0.04em] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] transition-colors duration-500 group-hover:text-[#ff8a3d] break-words uppercase">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  {/* Center Column: Large Image Showcase */}
                  <div className="order-2 lg:order-none lg:col-span-5 w-full relative z-10">
                    <div className="relative w-full rounded-2xl md:rounded-[36px] border border-white/[0.04] bg-gradient-to-br from-[#1a120c]/40 to-[#0a0807]/80 p-2 md:p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-4 group-hover:shadow-[0_40px_100px_-20px_rgba(255,138,61,0.25)] group-hover:border-[#ff8a3d]/20 dark:border-white/[0.04] dark:from-[#1a120c]/40 dark:to-[#0a0807]/80 light:from-white/80 light:to-white/90 light:border-black/[0.05] light:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] light:group-hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.15)] light:group-hover:border-[#ff8a3d]/30">
                      {/* Browser Top Bar */}
                      <div className="flex items-center justify-between px-3 pb-3 pt-2 md:px-5 md:pb-5 md:pt-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20 light:bg-black/15 transition-all duration-300 group-hover:bg-[#ff5f56] group-hover:shadow-[0_0_10px_rgba(255,95,86,0.8)]"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20 light:bg-black/15 transition-all duration-300 group-hover:bg-[#ffbd2e] group-hover:shadow-[0_0_10px_rgba(255,189,46,0.8)]"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-white/20 light:bg-black/15 transition-all duration-300 group-hover:bg-[#27c93f] group-hover:shadow-[0_0_10px_rgba(39,201,63,0.8)]"></div>
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/40 font-semibold group-hover:text-[#a89c8d]/80 transition-colors duration-500 font-researcher">
                          {project.cat}
                        </div>
                      </div>
                      
                      {/* Screenshot Container */}
                      <div className="relative overflow-hidden rounded-xl md:rounded-[24px] border border-white/5 light:border-black/5 bg-[#0a0807] light:bg-[#fdfbf7]">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ff8a3d]/20 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-[800ms] z-10 pointer-events-none mix-blend-overlay"></div>
                        <Image 
                          src={project.image} 
                          alt={`${project.title} Preview`}
                          width={1600}
                          height={1000}
                          className="w-full h-auto object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] aspect-[16/10]"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description, Status, Link */}
                  <div className="order-3 lg:order-none lg:col-span-3 flex flex-col justify-center h-full lg:pt-10 xl:pt-20">
                    <p className="text-[15px] md:text-[17px] leading-[1.8] tracking-tight text-[#a89c8d] dark:text-[#a89c8d] light:text-[#5a5046] mb-10 font-medium">
                      {project.desc}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-6 dark:border-white/[0.06] light:border-black/[0.06]">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] w-max font-bold transition-colors duration-500 font-researcher ${
                            project.status === "Live"
                              ? "border-[#ff8a3d]/30 bg-[#ff8a3d]/10 text-[#ff8a3d] group-hover:border-[#ff8a3d]/50 group-hover:bg-[#ff8a3d]/20"
                              : "border-white/10 bg-white/5 text-[#a89c8d]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              project.status === "Live"
                                ? "bg-[#ff8a3d] shadow-[0_0_12px_rgba(255,138,61,0.9)] animate-pulse"
                                : "bg-[#a89c8d]/60"
                            }`}
                          ></span>
                          {project.status}
                        </span>
                        <span className="text-[11px] font-semibold tracking-[0.3em] text-[#a89c8d]/40 pl-1 mt-1 font-researcher">
                          {project.year}
                        </span>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[#ff8a3d]/50 group-hover:bg-[#ff8a3d] group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_10px_30px_rgba(255,138,61,0.3)] text-[#f2ece1] dark:border-white/10 dark:bg-white/5 light:border-black/10 light:bg-black/5 light:text-black">
                        <ArrowUpRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                </div>
              </a>
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
                <p className="mt-2 text-sm text-[#a89c8d]/70 font-researcher">
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
                    <p className="mt-2 text-sm text-[#a89c8d]/70 font-researcher">
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

                <button
                  type="submit"
                  disabled={formState === "loading" || formState === "success"}
                  className="group relative mt-4 inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#ff8a3d]/50 bg-gradient-to-br from-[#ff8a3d] via-[#e8742c] to-[#c2410c] px-7 py-4 text-sm font-medium text-[#1a0d05] transition-all hover:shadow-[0_0_60px_rgba(255,138,61,0.45),inset_0_1px_0_rgba(255,220,180,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
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
                </button>
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
                  data-cursor="EMAIL"
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
                    data-cursor={social.label === "Github" ? "CODE" : social.label === "LinkedIn" ? "CONNECT" : "EMAIL"}
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
