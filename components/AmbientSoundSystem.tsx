"use client";

import { useEffect, useRef } from "react";

class SynthPadEngine {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Arpeggiator fields
  private chordIndex = 0;
  private noteIndex = 0;
  private arpeggiatorTimer: number | null = null;

  private baseCutoff = 170;
  private maxCutoff = 650;
  private targetCutoff = 170;
  private activeCutoff = 170;
  private animationFrameId: number | null = null;

  constructor() {}

  public start() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 3.0); // very soft global mix, slow fade-in
      this.masterGain.connect(this.ctx.destination);

      // Lowpass Filter for cinematic warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.Q.value = 1.4;
      this.filter.frequency.value = this.baseCutoff;

      // Space Delay line (acts as reverb wash)
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.value = 0.85; // long breathing delay

      this.feedbackGain = this.ctx.createGain();
      this.feedbackGain.gain.value = 0.42; // high feedback wash

      // Connect Space Routing
      this.filter.connect(this.masterGain);
      this.filter.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.feedbackGain.connect(this.masterGain);

      // LFO for filter cutoff modulation
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.value = 0.038; // extremely slow cycle
      this.lfo.type = "sine";

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.value = 55;

      this.lfo.connect(this.lfoGain);
      if (this.filter.frequency) {
        this.lfoGain.connect(this.filter.frequency);
      }
      this.lfo.start();

      // Ambient Base Pad: C minor 9th (Cm9) chord in low register
      const chord = [65.41, 98.00, 130.81, 155.56, 233.08];

      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();

        osc.frequency.value = freq;
        osc.type = idx % 2 === 0 ? "triangle" : "sine";

        // Muted low background drone levels
        oscGain.gain.value = idx === 0 ? 0.15 : 0.05;

        osc.connect(oscGain);
        oscGain.connect(this.filter!);
        osc.start();

        this.oscillators.push(osc);
        this.gains.push(oscGain);
      });

      this.tick();
      this.startArpeggiator();
    } catch (e) {
      console.warn("Failed to initialize Web Audio system:", e);
    }
  }

  private startArpeggiator() {
    if (this.arpeggiatorTimer) return;

    // Iconic Interstellar-inspired slow arpeggiation chords:
    // 1: Am (A3, E4, A4, C5, E5)
    // 2: F (F3, C4, F4, A4, C5)
    // 3: C (C3, G3, C4, E4, G4)
    // 4: G (G3, D4, G4, B4, D5)
    const chords = [
      [220.00, 329.63, 440.00, 523.25, 659.25],
      [174.61, 261.63, 349.23, 440.00, 523.25],
      [130.81, 196.00, 261.63, 329.63, 392.00],
      [196.00, 293.66, 392.00, 493.88, 587.33],
    ];

    const notePattern = [0, 1, 2, 3, 4, 3, 2, 1];
    const noteInterval = 1000; // slow, breathing arpeggiator rate (1.0s)

    this.arpeggiatorTimer = window.setInterval(() => {
      if (!this.ctx || this.ctx.state === "suspended") return;

      const activeChord = chords[this.chordIndex];
      const patternIdx = notePattern[this.noteIndex];
      const freq = activeChord[patternIdx];

      this.playArpeggioNote(freq);

      this.noteIndex++;
      if (this.noteIndex >= notePattern.length) {
        this.noteIndex = 0;
        this.chordIndex = (this.chordIndex + 1) % chords.length;
      }
    }, noteInterval);
  }

  private playArpeggioNote(freq: number) {
    if (!this.ctx || !this.filter) return;

    try {
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq / 2, now); // sub-octave warmth

      // Sub-volume notes so they blend into background reflection
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.004, now + 0.3); // slow rise
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8); // slow long decay

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(this.filter);

      osc1.start(now);
      osc1.stop(now + 3.0);
      osc2.start(now);
      osc2.stop(now + 3.0);
    } catch (e) {}
  }

  public setScrollSpeed(speed: number) {
    const normSpeed = Math.min(1.0, speed / 3.0);
    this.targetCutoff = this.baseCutoff + normSpeed * (this.maxCutoff - this.baseCutoff);
  }

  private tick = () => {
    if (!this.ctx || !this.filter) return;

    this.activeCutoff += (this.targetCutoff - this.activeCutoff) * 0.05;
    this.filter.frequency.setValueAtTime(this.activeCutoff, this.ctx.currentTime);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  public playHover() {
    if (!this.ctx || this.ctx.state === "suspended") return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.009, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  public playClick() {
    if (!this.ctx || this.ctx.state === "suspended") return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 783.99];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.012);

        gain.gain.setValueAtTime(0, now + idx * 0.012);
        gain.gain.linearRampToValueAtTime(0.014, now + idx * 0.012 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.012);
        osc.stop(now + 0.22);
      });
    } catch (e) {}
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public stop() {
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.arpeggiatorTimer) {
      clearInterval(this.arpeggiatorTimer);
      this.arpeggiatorTimer = null;
    }

    if (this.masterGain) {
      try {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.45); // smooth fade-out
      } catch (e) {}
    }

    setTimeout(() => {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

      this.oscillators.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      if (this.lfo) {
        try { this.lfo.stop(); } catch (e) {}
      }
      if (this.ctx) {
        try { this.ctx.close(); } catch (e) {}
      }

      this.ctx = null;
      this.oscillators = [];
      this.gains = [];
      this.filter = null;
      this.masterGain = null;
      this.delayNode = null;
      this.feedbackGain = null;
      this.lfo = null;
      this.lfoGain = null;
    }, 500);
  }
}

interface AmbientSoundSystemProps {
  muted: boolean;
}

export function AmbientSoundSystem({ muted }: AmbientSoundSystemProps) {
  const engineRef = useRef<SynthPadEngine | null>(null);

  useEffect(() => {
    engineRef.current = new SynthPadEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    if (!muted) {
      engineRef.current.start();
      
      const resumeAudio = () => {
        if (engineRef.current) {
          engineRef.current.resume();
        }
        window.removeEventListener("click", resumeAudio);
        window.removeEventListener("keydown", resumeAudio);
        window.removeEventListener("touchstart", resumeAudio);
        window.removeEventListener("mousemove", resumeAudio);
        window.removeEventListener("scroll", resumeAudio);
      };

      window.addEventListener("click", resumeAudio, { once: true, passive: true });
      window.addEventListener("keydown", resumeAudio, { once: true, passive: true });
      window.addEventListener("touchstart", resumeAudio, { once: true, passive: true });
      window.addEventListener("mousemove", resumeAudio, { once: true, passive: true });
      window.addEventListener("scroll", resumeAudio, { once: true, passive: true });

      return () => {
        window.removeEventListener("click", resumeAudio);
        window.removeEventListener("keydown", resumeAudio);
        window.removeEventListener("touchstart", resumeAudio);
        window.removeEventListener("mousemove", resumeAudio);
        window.removeEventListener("scroll", resumeAudio);
      };
    } else {
      engineRef.current.stop();
    }
  }, [muted]);

  useEffect(() => {
    if (muted) return;

    const handleScroll = () => {
      let lastScrollTop = window.scrollY;
      let lastTime = Date.now();
      let scrollTimeout: NodeJS.Timeout;

      const onScroll = () => {
        const now = Date.now();
        const currentScrollTop = window.scrollY;
        const deltaTime = Math.max(1, now - lastTime);
        const deltaScroll = Math.abs(currentScrollTop - lastScrollTop);
        const speed = deltaScroll / deltaTime;

        lastScrollTop = currentScrollTop;
        lastTime = now;

        if (engineRef.current) {
          engineRef.current.setScrollSpeed(speed);
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (engineRef.current) {
            engineRef.current.setScrollSpeed(0);
          }
        }, 120);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        clearTimeout(scrollTimeout);
      };
    };

    return handleScroll();
  }, [muted]);

  useEffect(() => {
    if (muted) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role='button'], input, textarea, select");
      if (isInteractive && engineRef.current) {
        engineRef.current.playHover();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role='button'], input[type='submit']");
      if (isInteractive && engineRef.current) {
        engineRef.current.playClick();
      }
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
    };
  }, [muted]);

  return null;
}
