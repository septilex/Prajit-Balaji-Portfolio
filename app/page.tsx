"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    // Get initial theme
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");

    // Scroll spy logic to highlight active link
    const sections = ["hero", "projects", "about", "stack", "journey", "contact"];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy);
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

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

  const techStack = [
    "React",
    "Next.js",
    "TailwindCSS",
    "Framer Motion",
    "TypeScript",
    "OpenAI API",
    "Gemini",
    "AI Workflows",
    "Prompt Engineering",
    "AI Integrations",
    "Node.js",
    "Express",
    "Firebase",
    "MongoDB",
    "APIs",
    "Vercel",
    "GitHub",
    "Cloud Hosting",
  ];

  const stackCards = [
    { title: "Frontend", num: "01", bg: "bg-[#c2410c]/15" },
    { title: "Backend", num: "02", bg: "bg-[#c2410c]/15" },
    { title: "AI & Tools", num: "03", bg: "bg-[#c2410c]/15" },
    { title: "Deployment", num: "04", bg: "bg-[#c2410c]/15" },
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
      title: "DevScore",
      cat: "AI · Developer Analysis",
      desc: "AI-powered developer scoring and analysis platform.",
      status: "Live",
      year: "2026",
      link: "https://devscore-xi.vercel.app/",
    },
    {
      num: "/02",
      title: "VELARI",
      cat: "Futuristic UI · Creative Engine",
      desc: "Cinematic futuristic digital experience and premium interface project.",
      status: "Live",
      year: "2026",
      link: "https://velari-dusky.vercel.app/",
    },
    {
      num: "/03",
      title: "DevMentor",
      cat: "AI · Developer Guidance",
      desc: "AI-native mentorship and developer guidance platform.",
      status: "Live",
      year: "2026",
      link: "https://devmentorr.vercel.app/",
    },
  ];

  const timeline = [
    {
      year: "2027",
      role: "Amazon Internship Goal",
      desc: "Aiming to enter large-scale engineering environments as a Java-focused developer while strengthening backend systems, scalability, and software engineering foundations through real-world experience.",
      side: "left",
    },
    {
      year: "2032",
      role: "Aspiring Data Scientist at Google",
      desc: "Working toward contributing to intelligent systems, machine learning infrastructure, and large-scale data-driven technologies while expanding expertise in AI research, analytics, and generative systems.",
      side: "right",
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0807] light:bg-[#fdfbf7] transition-colors duration-700 ease-in-out">
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
            <button
              onClick={toggleTheme}
              aria-label="toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3a2a1c]/70 bg-[#1a120c]/60 transition-colors hover:bg-[#2a1a10]/80 hover:border-[#ff8a3d]/40 dark:border-[#3a2a1c]/70 dark:bg-[#1a120c]/60 light:bg-[#f5efe6] light:border-black/10"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-[#ff8a3d]" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[#ff8a3d]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen w-full overflow-hidden">
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
            delay={100}
            className="mx-auto mt-12 w-full max-w-[1600px] px-6 md:px-12 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[#a89c8d]"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff8a3d] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff8a3d]"></span>
              </span>
              <span>Available for select projects · 2026</span>
            </div>
            <div className="hidden md:block">Portfolio · v0.26</div>
          </ScrollReveal>

          {/* ── MASSIVE HERO TITLE — full viewport width, no container constraint ── */}
          <div className="flex flex-1 flex-col justify-center">
            <ScrollReveal initialTransform="translateY(80px)" delay={300}>
              <h1
                className="font-display whitespace-nowrap font-bold text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-glow"
                style={{
                  fontSize: "clamp(2rem, 14vw, 20rem)",
                  lineHeight: "0.82",
                  letterSpacing: "-0.05em",
                  paddingLeft: "max(1.5rem, min(3rem, 6vw))",
                }}
              >
                PRAJIT BALAJI
              </h1>
            </ScrollReveal>

            {/* Sub-info row — constrained to 1600px again */}
            <div className="mx-auto mt-10 w-full max-w-[1600px] px-6 md:px-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
              <ScrollReveal
                initialTransform="translateY(30px)"
                delay={500}
                className="md:col-span-7"
              >
                <p className="font-display text-2xl leading-tight tracking-tight md:text-4xl text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612]">
                  Full-Stack AI Engineer
                  <br />
                  <span className="text-[#ff8a3d]/85">AI Builder</span>
                  <br />
                  <span className="text-[#a89c8d]">Creating futuristic digital experiences.</span>
                </p>
              </ScrollReveal>

              <ScrollReveal
                initialTransform="translateY(30px)"
                delay={600}
                className="md:col-span-5 md:text-right text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70"
              >
                <div>Based in the cloud</div>
                <div className="mt-1">Building the next decade</div>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom row — constrained to 1600px */}
          <ScrollReveal
            initialTransform="translateY(20px)"
            delay={800}
            className="mx-auto w-full max-w-[1600px] px-6 md:px-12 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70"
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
      <section id="about" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
          <span>01</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span>About</span>
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <ScrollReveal initialTransform="translateY(60px)" className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.2rem,6.5vw,6.5rem)] font-semibold leading-[0.95] tracking-tight">
              Building digital <span className="text-[#a89c8d]/70">systems</span> that feel{" "}
              <em className="not-italic text-[#ff8a3d]/85">futuristic</em>, scalable, and alive.
            </h2>
          </ScrollReveal>

          <ScrollReveal initialTransform="translateY(80px)" className="md:col-span-3 md:col-start-10 md:pt-12">
            <div className="space-y-6 text-[15px] leading-relaxed text-[#c9bcaa] dark:text-[#c9bcaa] light:text-[#3a352f]">
              <p>
                I design and engineer interfaces, intelligent backends, and AI-native products. My work lives at
                the intersection of cinematic design and hard engineering.
              </p>
              <p className="text-[#a89c8d]/70">
                From neural pipelines to pixel-perfect motion, every system I build should feel inevitable.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 2: Tech Stack */}
      <section id="stack" className="relative py-32 md:py-48">
        <div className="mx-auto max-w-[1600px] px-6 md:px-12">
          <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
            <span>02</span>
            <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
            <span>Tech Stack</span>
          </div>
          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-5xl text-[clamp(2rem,5vw,5rem)] font-semibold leading-[0.95] tracking-tight">
              A modern arsenal for <span className="text-[#a89c8d]/70">building at the edge.</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Marquees */}
        <div className="mt-20 overflow-hidden select-none">
          {/* Marquee 1: Leftward */}
          <div className="flex w-max animate-marquee gap-4 whitespace-nowrap">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={`marquee-1-${i}`}
                className="font-display inline-flex items-center gap-3 rounded-full border border-[#3a2a1c]/55 bg-[#1a120c]/40 px-7 py-3 text-2xl font-medium tracking-tight text-[#f2ece1]/80 backdrop-blur-sm hover:bg-[#2a1810]/70 hover:border-[#ff8a3d]/30 transition-colors dark:border-[#3a2a1c]/55 dark:bg-[#1a120c]/40 light:bg-white/40 light:border-black/10 light:text-[#1a1612]/80"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d]/80"></span>
                {tech}
              </span>
            ))}
          </div>

          {/* Marquee 2: Rightward (Slow) */}
          <div className="mt-6 flex w-max animate-marquee-slow gap-4 whitespace-nowrap" style={{ animationDirection: "reverse" }}>
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={`marquee-2-${i}`}
                className="font-display inline-flex items-center gap-3 rounded-full border border-[#3a2a1c]/55 bg-[#1a120c]/40 px-6 py-2.5 text-xl font-medium tracking-tight text-[#a89c8d] backdrop-blur-sm hover:bg-[#2a1810]/70 hover:border-[#ff8a3d]/30 transition-colors dark:border-[#3a2a1c]/55 dark:bg-[#1a120c]/40 light:bg-white/40 light:border-black/10 light:text-[#1a1612]/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d]/40"></span>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Stack Category Cards */}
        <div className="mx-auto mt-24 grid max-w-[1600px] grid-cols-2 gap-4 px-6 md:grid-cols-4 md:px-12">
          {stackCards.map((card, idx) => (
            <ScrollReveal
              key={card.title}
              initialTransform="translateY(40px)"
              delay={idx * 100}
            >
              <div
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative overflow-hidden rounded-2xl border border-[#3a2a1c]/55 bg-gradient-to-b from-white/[0.04] to-transparent p-6 backdrop-blur-sm transition-all duration-300 dark:border-[#3a2a1c]/55 light:border-black/10 light:from-black/[0.02] ${
                  hoveredCard !== null && hoveredCard !== idx ? "opacity-55 scale-[0.98]" : "opacity-100 scale-100"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70">
                  {card.num}
                </div>
                <div className="mt-12 font-display text-2xl font-medium tracking-tight md:text-3xl transition-colors group-hover:text-white dark:group-hover:text-white light:group-hover:text-black">
                  {card.title}
                </div>
                <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#c2410c]/15 blur-2xl transition-all duration-500 group-hover:bg-[#ff8a3d]/35"></div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Section 3: Capabilities */}
      <section className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
          <span>03</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span>Capabilities</span>
        </div>

        <ScrollReveal initialTransform="translateY(40px)">
          <h2 className="font-display mb-20 max-w-5xl text-[clamp(2rem,5.5vw,6rem)] font-semibold leading-[0.95] tracking-tight">
            What I do, <span className="text-[#a89c8d]/70">deeply.</span>
          </h2>
        </ScrollReveal>

        <div className="divide-y divide-[#3a2a1c]/55 border-y border-[#3a2a1c]/55 dark:divide-[#3a2a1c]/55 light:divide-black/10 light:border-black/10">
          {capabilities.map((item, idx) => (
            <ScrollReveal
              key={item.title}
              initialTransform="translateX(-40px)"
              delay={idx * 50}
              className="group grid grid-cols-12 items-center gap-4 py-8 transition-colors hover:bg-[#1a120c]/40 dark:hover:bg-[#1a120c]/40 light:hover:bg-black/[0.02]"
            >
              <div className="col-span-2 text-[11px] uppercase tracking-[0.3em] text-[#a89c8d]/70 md:col-span-1">
                {item.num}
              </div>
              <div className="col-span-10 md:col-span-6">
                <h3 className="font-display text-3xl font-medium tracking-tight md:text-5xl group-hover:text-white dark:group-hover:text-white light:group-hover:text-black transition-colors duration-300">
                  {item.title}
                </h3>
              </div>
              <div className="col-span-12 text-sm text-[#a89c8d] md:col-span-5 md:text-base">
                {item.desc}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Section 4: Selected Work */}
      <section id="projects" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
          <span>04</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span>Selected Work</span>
        </div>

        <div className="mb-20 flex flex-wrap items-end justify-between gap-6">
          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-5xl text-[clamp(2rem,6vw,7rem)] font-semibold leading-[0.95] tracking-tight">
              Projects that <span className="text-[#a89c8d]/70">define me.</span>
            </h2>
          </ScrollReveal>
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70">
            {projects.length} works
          </div>
        </div>

        <div className="divide-y divide-[#3a2a1c]/55 border-y border-[#3a2a1c]/55 dark:divide-[#3a2a1c]/55 light:divide-black/10 light:border-black/10">
          {projects.map((project, idx) => (
            <ScrollReveal
              key={project.title}
              initialTransform="translateY(40px)"
              delay={idx * 100}
            >
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredProject(idx)}
                onMouseLeave={() => setHoveredProject(null)}
                className={`group relative grid grid-cols-12 items-center gap-4 py-10 md:py-14 transition-all duration-300 ${
                  hoveredProject !== null && hoveredProject !== idx ? "opacity-35 scale-[0.99]" : "opacity-100 scale-100"
                }`}
              >
                <div className="col-span-2 text-[11px] uppercase tracking-[0.3em] text-[#a89c8d]/70 md:col-span-1">
                  {project.num}
                </div>
                <div className="col-span-10 md:col-span-5">
                  <h3 className="font-display text-4xl font-medium tracking-tight transition-colors group-hover:text-[#ff8a3d] md:text-7xl">
                    {project.title}
                  </h3>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[#a89c8d]/70">
                    {project.cat}
                  </div>
                </div>
                <div className="col-span-8 hidden text-sm text-[#a89c8d] md:col-span-3 md:block">
                  {project.desc}
                </div>
                <div className="col-span-3 hidden md:col-span-2 md:block">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                      project.status === "Live"
                        ? "border-[#3a2a1c]/70 bg-[#1a120c]/50 text-[#ff8a3d] dark:border-[#3a2a1c]/70 dark:bg-[#1a120c]/50"
                        : "border-[#3a2a1c]/70 bg-[#1a120c]/50 text-[#a89c8d] dark:border-[#3a2a1c]/70 dark:bg-[#1a120c]/50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        project.status === "Live"
                          ? "bg-[#ff8a3d] shadow-[0_0_10px_rgba(255,138,61,0.7)] animate-pulse"
                          : "bg-[#a89c8d]/60"
                      }`}
                    ></span>
                    {project.status}
                  </span>
                  <div className="mt-2 text-[11px] tracking-[0.2em] text-[#a89c8d]/70">
                    {project.year}
                  </div>
                </div>
                <div className="col-span-1 hidden justify-end md:flex">
                  <ArrowUpRight className="h-6 w-6 text-[#a89c8d]/55 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#ff8a3d]" />
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Section 5: Journey */}
      <section id="journey" className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
        <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
          <span>05</span>
          <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
          <span>Journey</span>
        </div>

        <ScrollReveal initialTransform="translateY(40px)">
          <h2 className="font-display mb-24 max-w-5xl text-[clamp(2rem,5.5vw,6rem)] font-semibold leading-[0.95] tracking-tight">
            My vision towards <span className="text-[#a89c8d]/70">what I am striving to.</span>
          </h2>
        </ScrollReveal>

        {/* Timeline Grid */}
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[#ff8a3d]/40 via-[#5a3f2a]/30 to-transparent md:left-1/2"></div>

          {timeline.map((node, idx) => (
            <ScrollReveal
              key={node.year}
              initialTransform="translateY(40px)"
              delay={idx * 150}
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
                <div className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                  {node.year}
                </div>
                <div className="mt-3 font-display text-xl text-[#dfd3c0] md:text-2xl dark:text-[#dfd3c0] light:text-[#3a352f] font-medium">
                  {node.role}
                </div>
                <p className="mt-2 text-sm text-[#a89c8d]/70">
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
                    <div className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                      {node.year}
                    </div>
                    <div className="mt-3 font-display text-xl text-[#dfd3c0] md:text-2xl dark:text-[#dfd3c0] light:text-[#3a352f] font-medium">
                      {node.role}
                    </div>
                    <p className="mt-2 text-sm text-[#a89c8d]/70">
                      {node.desc}
                    </p>
                  </>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Section 6: Contact */}
      <section id="contact" className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-12 md:py-48">
          <div className="mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70">
            <span>06</span>
            <span className="h-px w-12 bg-[#5a3f2a]/60 dark:bg-[#5a3f2a]/60 light:bg-black/10"></span>
            <span>Contact</span>
          </div>

          <ScrollReveal initialTransform="translateY(40px)">
            <h2 className="font-display max-w-6xl text-[clamp(2.5rem,8vw,10rem)] font-semibold leading-[0.9] tracking-tight">
              Let's build the <span className="text-[#a89c8d]/70">future.</span>
            </h2>
          </ScrollReveal>

          <div className="mt-24 grid grid-cols-1 gap-16 md:grid-cols-12">
            {/* Form */}
            <ScrollReveal initialTransform="translateY(40px)" className="md:col-span-7">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold">
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
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold">
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
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold">
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
              initialTransform="translateY(40px)"
              delay={200}
              className="md:col-span-4 md:col-start-9 space-y-8"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#a89c8d]/70 font-semibold">
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
                    href: "https://github.com",
                    icon: <Github className="h-4 w-4" />,
                  },
                  {
                    label: "LinkedIn",
                    href: "https://linkedin.com",
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
              <h3 className="font-display text-balance text-[clamp(3.5rem,12vw,12rem)] font-bold leading-[0.85] tracking-[-0.06em] text-[#f2ece1] dark:text-[#f2ece1] light:text-[#1a1612] text-glow">
                PRAJIT BALAJI
              </h3>
            </ScrollReveal>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-[#a89c8d]/70 font-semibold">
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
