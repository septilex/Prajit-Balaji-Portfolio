"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DinoRunner — Ambient Chrome-Dino-inspired infinite runner Easter egg.
   Pure canvas, zero React re-renders, requestAnimationFrame driven.
   Features a cool orange dino with sunglasses, headphones, horns & hoodie.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Convert a visual pixel-art grid into [x,y] filled-pixel coordinates */
function px(rows: string[]): [number, number][] {
  const out: [number, number][] = [];
  for (let y = 0; y < rows.length; y++)
    for (let x = 0; x < rows[y].length; x++)
      if (rows[y][x] === "#") out.push([x, y]);
  return out;
}



// ── Other sprites ──────────────────────────────────────────────────────────

const CACTUS_SM = px([
  "  #",
  "  #",
  "# #",
  "# #",
  " ##",
  "  #",
  "  #",
]);

const CACTUS_LG = px([
  "  #",
  "# # #",
  "# # #",
  "# ###",
  " ##",
  "  #",
  "  #",
  "  #",
  "  #",
]);

const TREE = px([
  "   ##",
  "  ####",
  " ######",
  "########",
  " ######",
  "  ####",
  "   ##",
  "   ##",
  "   ##",
  "   ##",
  "   ##",
]);

const BIRD = [
  px(["#   #", " # #", "  #", " ###"]),
  px([" ###", "  #", " # #", "#   #"]),
];

const PTERO = [
  px([
    "#       #",
    " #     #",
    "  ## ##",
    "  #####",
    "   ###",
  ]),
  px([
    "   ###",
    "  #####",
    "  ## ##",
    " #     #",
    "#       #",
  ]),
];

const CLOUD = px(["  ###", " #####", "#######"]);

// ── Palette ────────────────────────────────────────────────────────────────

const PAL = {
  dino: "rgba(255,138,61,0.85)",
  gear: "rgba(26,22,18,0.85)",
  lens: "rgba(90,63,42,0.85)",
  shine: "rgba(255,255,255,0.6)",
  ground: "rgba(58,50,43,0.75)",
  pebble: "rgba(58,50,43,0.6)",
  cactus: "rgba(58,50,43,0.75)",
  tree: "rgba(90,63,42,0.75)",
  bird: "rgba(168,156,141,0.75)",
  ptero: "rgba(200,170,140,0.65)",
  cloud: "rgba(168,156,141,0.5)",
};

// ── Internal types ─────────────────────────────────────────────────────────

interface Obs { x: number; type: "sm" | "lg" | "tree" }
interface Flyer { x: number; y: number; f: number; t: number; big: boolean }
interface Drift { x: number; y: number; s: number }

// ── Component ──────────────────────────────────────────────────────────────

export function DinoRunner() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const rid = useRef(0);

  useEffect(() => {
    const el = cvs.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, PX = 2.5;

    // Mutable animation state
    let gOff = 0;
    let dF = 0, dT = 0;
    let obs: Obs[] = [];
    let bds: Flyer[] = [];
    let cls: Drift[] = [];
    let oCD = 80, bCD = 60, cCD = 0;
    let init = false;

    // Jump state scaled to medium-subtle size
    let jumpY = 0, jumpVel = 0, isJumping = false;
    const GRAVITY = 0.42;
    const JUMP_FORCE = -7.5;

    // ── Load All 6 Dino Variants from Strip & Pick Random One ──
    const TOTAL_SKINS = 6;
    let selectedDinoCanvas: HTMLCanvasElement | null = null;
    let dinoLoaded = false;
    let dinoAspect = 1.0;

    const stripImg = new Image();
    stripImg.src = "/dino-skins-strip.png";
    stripImg.onload = () => {
      const sw = stripImg.naturalWidth || 1024;
      const sh = stripImg.naturalHeight || 145;
      const frameW = sw / TOTAL_SKINS;
      dinoAspect = frameW / sh;

      // Extract each skin onto its own clean transparent offscreen canvas
      const skinCanvases: HTMLCanvasElement[] = [];

      for (let s = 0; s < TOTAL_SKINS; s++) {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = frameW;
        offCanvas.height = sh;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) continue;

        // Draw this specific dino frame
        offCtx.drawImage(
          stripImg,
          s * frameW, 0, frameW, sh,
          0, 0, frameW, sh
        );

        // Remove background beige/white cleanly
        const imgData = offCtx.getImageData(0, 0, frameW, sh);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 215 && g > 210 && b > 200) {
            data[i + 3] = 0; // Transparent background
          }
        }
        offCtx.putImageData(imgData, 0, 0);
        skinCanvases.push(offCanvas);
      }

      if (skinCanvases.length > 0) {
        // Randomly pick one skin on page load
        const chosenIdx = Math.floor(Math.random() * skinCanvases.length);
        selectedDinoCanvas = skinCanvases[chosenIdx];
        dinoLoaded = true;
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height;
      el.width = W * dpr; el.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      PX = W > 1200 ? 2.5 : W > 768 ? 2.0 : 1.6;

      if (!init) {
        cls = [
          { x: W * 0.05, y: H * 0.08, s: 0.9 },
          { x: W * 0.18, y: H * 0.16, s: 0.7 },
          { x: W * 0.32, y: H * 0.05, s: 1.1 },
          { x: W * 0.48, y: H * 0.12, s: 0.8 },
          { x: W * 0.62, y: H * 0.18, s: 0.65 },
          { x: W * 0.75, y: H * 0.07, s: 1.0 },
          { x: W * 0.88, y: H * 0.14, s: 0.85 },
          { x: W * 0.98, y: H * 0.04, s: 0.75 },
        ];
        init = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const stamp = (
      sprite: [number, number][],
      ox: number, oy: number,
      color: string, sz: number = PX
    ) => {
      ctx.fillStyle = color;
      const s = Math.max(1, Math.ceil(sz));
      for (const [sx, sy] of sprite)
        ctx.fillRect(Math.round(ox + sx * sz), Math.round(oy + sy * sz), s, s);
    };

    const gy = () => H * 0.78;
    const SPD = 1.5;
    const DINO_X_FRAC = 0.12;

    let prev = 0;

    const frame = (t: number) => {
      const dt = prev ? Math.min((t - prev) / 16.67, 3) : 1;
      prev = t;
      const g = gy();
      const v = SPD * dt;
      const dinoX = W * DINO_X_FRAC;
      // Target rendered size matching existing scale
      const dinoTargetH = 20 * PX;
      const dinoTargetW = dinoTargetH * (dinoAspect || 1.15);

      // ── UPDATE ──

      gOff = (gOff + v * 1.5) % (PX * 12);

      // Dino run cycle
      dT += dt;
      if (dT > 6.5) { dF ^= 1; dT = 0; }

      // Auto-jump — finely timed trigger distance
      if (!isJumping) {
        for (const o of obs) {
          // Calculate distance from front of dino to obstacle
          // Dino's body is centered with head forward (approx 75% of total sprite box)
          const dinoFront = dinoX + dinoTargetW * 0.78;
          const dist = o.x - dinoFront;
          const triggerDist = o.type === "tree" ? 22 : 16;
          
          if (dist > 0 && dist < triggerDist) {
            isJumping = true;
            jumpVel = JUMP_FORCE;
            break;
          }
        }
      }

      if (isJumping) {
        jumpY += jumpVel * dt;
        jumpVel += GRAVITY * dt;
        if (jumpY >= 0) { jumpY = 0; jumpVel = 0; isJumping = false; }
      }

      // Obstacles
      oCD -= dt;
      if (oCD <= 0) {
        const r = Math.random();
        obs.push({ x: W + 20, type: r < 0.35 ? "sm" : r < 0.65 ? "lg" : "tree" });
        oCD = 60 + Math.random() * 80;
      }
      for (const o of obs) o.x -= v * 1.5;
      if (obs.length && obs[0].x < -60) obs.shift();

      // Birds & pterodactyls
      bCD -= dt;
      if (bCD <= 0) {
        bds.push({
          x: W + 30,
          y: g - 60 - Math.random() * (H * 0.3),
          f: 0, t: 0,
          big: Math.random() > 0.6,
        });
        bCD = 80 + Math.random() * 100;
      }
      for (const b of bds) {
        b.x -= v * (b.big ? 0.9 : 1.2);
        b.t += dt;
        if (b.t > (b.big ? 10 : 14)) { b.f ^= 1; b.t = 0; }
      }
      if (bds.length && bds[0].x < -60) bds.shift();

      // Clouds — increased frequency & varied heights
      cCD -= dt;
      if (cCD <= 0) {
        cls.push({
          x: W + 60,
          y: H * (0.03 + Math.random() * 0.2),
          s: 0.6 + Math.random() * 0.6,
        });
        cCD = 75 + Math.random() * 85;
      }
      for (const c of cls) c.x -= v * (0.15 + (c.s - 0.6) * 0.1);
      cls = cls.filter(c => c.x > -100);

      // ── RENDER ──
      ctx.clearRect(0, 0, W, H);

      // Clouds
      for (const c of cls) stamp(CLOUD, c.x, c.y, PAL.cloud, PX * c.s);

      // Ground
      ctx.fillStyle = PAL.ground;
      ctx.fillRect(0, g, W, 1);

      ctx.fillStyle = PAL.pebble;
      for (let x = -gOff; x < W + PX * 12; x += PX * 12) {
        ctx.fillRect(x, g + PX * 2, PX * 2, PX * 0.7);
        ctx.fillRect(x + PX * 5, g + PX * 3.5, PX, PX * 0.7);
        ctx.fillRect(x + PX * 9, g + PX * 1.5, PX * 1.5, PX * 0.5);
      }

      // ── Dino Graphic (Exact user artwork) ──
      const legBob = isJumping ? 0 : dF ? -PX * 0.5 : PX * 0.2;
      const dy = g - dinoTargetH + jumpY + legBob;

      if (dinoLoaded && selectedDinoCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        // Pixel-perfect crisp rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          selectedDinoCanvas,
          Math.round(dinoX),
          Math.round(dy),
          Math.round(dinoTargetW),
          Math.round(dinoTargetH)
        );
        ctx.restore();
      }

      // Obstacles
      for (const o of obs) {
        if (o.type === "tree") {
          stamp(TREE, o.x, g - 11 * PX, PAL.tree);
        } else {
          const sp = o.type === "lg" ? CACTUS_LG : CACTUS_SM;
          const rows = o.type === "lg" ? 9 : 7;
          stamp(sp, o.x, g - rows * PX, PAL.cactus);
        }
      }

      // Birds & pterodactyls
      for (const b of bds) {
        if (b.big) stamp(PTERO[b.f], b.x, b.y, PAL.ptero);
        else stamp(BIRD[b.f], b.x, b.y, PAL.bird);
      }

      rid.current = requestAnimationFrame(frame);
    };

    rid.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rid.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={cvs}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
