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

const CACTUS_MD = px([
  "  #",
  "# #",
  "# #",
  "# ##",
  " ##",
  "  #",
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

// Spiky ball — menacing urchin/mine creature with protruding spikes
const SPIKY_BALL = [
  px([
    "    #   #    ",
    "   ##   ##   ",
    "  # ##### #  ",
    " ## ##### ## ",
    "#  #######  #",
    "   #######   ",
    "#  #######  #",
    " ## ##### ## ",
    "  # ##### #  ",
    "   ##   ##   ",
    "    #   #    ",
  ]),
  px([
    "   #     #   ",
    "    ## ##    ",
    "  # ##### #  ",
    " ## ##### ## ",
    "   #######   ",
    "#  #######  #",
    "   #######   ",
    " ## ##### ## ",
    "  # ##### #  ",
    "    ## ##    ",
    "   #     #   ",
  ]),
];

// Monster bird — aggressive with sharp beak, jagged wings, tail spikes
const MONSTER_BIRD = [
  px([
    "  #              ",
    " ##   ##         ",
    " ### ####        ",
    "  #######  ###   ",
    "  ###########  ##",
    "   ##########  # ",
    "    ############ ",
    "     ######  ##  ",
    "      ####   #   ",
    "       ##        ",
  ]),
  px([
    "       ##        ",
    "      ####   #   ",
    "     ######  ##  ",
    "    ############ ",
    "   ##########  # ",
    "  ###########  ##",
    "  #######  ###   ",
    " ### ####        ",
    " ##   ##         ",
    "  #              ",
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
  spikyBall: "rgba(140, 30, 30, 0.95)",
  spikyBallSpike: "rgba(200, 50, 20, 0.9)",
  monsterBird: "rgba(50, 15, 60, 0.95)",
  cloud: "rgba(145,135,120,0.7)",
};

// ── Weapons — detailed pixel-art designs ──────────────────────────────────
type WeaponType = "mp5" | "ak47" | "deagle";

const WEAPON_ORDER: WeaponType[] = ["mp5", "ak47", "deagle"];

/** Get the weapon for this page load, cycling on each refresh */
function getWeaponForSession(): WeaponType {
  if (typeof window === "undefined") return "mp5";
  const key = "dinoWeaponIndex";
  const stored = localStorage.getItem(key);
  const idx = stored !== null ? parseInt(stored, 10) : 0;
  const weaponIdx = idx % 3;
  localStorage.setItem(key, String(idx + 1));
  return WEAPON_ORDER[weaponIdx];
}

// ── Detailed pixel-art weapon sprites ─────────────────────────────────────

// MP5 — compact SMG, clearly recognizable with stock, body, barrel, grip, magazine
const MP5_SPRITE = px([
  "                  ###    ",
  "  ################   #   ",
  "  ################    ###",
  "  ##  ############   ###",
  "  ##  ##  ############# ",
  "      ##    #####       ",
  "      ###   ##          ",
  "       ##               ",
]);

// AK-47 — iconic long rifle with curved magazine, wooden stock, long barrel
const AK47_SPRITE = px([
  "                         ######  ",
  "  ###########################  # ",
  " #############################  #",
  " ###  #######################   #",
  " ##   ##   ################     ",
  "       ##    ######             ",
  "       ###   #####              ",
  "       ####  ###                ",
  "        ##                      ",
]);

// Desert Eagle — large boxy pistol, thick barrel, chunky grip
const DEAGLE_SPRITE = px([
  "        ########  ",
  "  ################",
  "  ################",
  "  ##  ############",
  "      ##  ####    ",
  "      ##  ###     ",
  "      ##  ###     ",
  "      #####       ",
  "       ###        ",
]);

const WEAPONS: Record<WeaponType, {
  sprite: [number, number][];
  muzzleX: number;
  muzzleY: number;
  cd: number;
  recoilAmt: number;
  flashSize: number;
  bulletLength: number;
  bulletWidth: number;
  casingSize: number;
  color: string;
  trailColor: string;
  glowColor: string;
}> = {
  mp5: {
    sprite: MP5_SPRITE,
    muzzleX: 25, muzzleY: 1.5, cd: 2, recoilAmt: 1.2, flashSize: 3,
    bulletLength: 8, bulletWidth: 1, casingSize: 1,
    color: "#ffee44", trailColor: "rgba(255,230,50,0.7)", glowColor: "rgba(255,200,30,0.5)"
  },
  ak47: {
    sprite: AK47_SPRITE,
    muzzleX: 33, muzzleY: 1.5, cd: 6, recoilAmt: 3.5, flashSize: 5,
    bulletLength: 12, bulletWidth: 1.5, casingSize: 1.5,
    color: "#ffcc22", trailColor: "rgba(255,200,30,0.7)", glowColor: "rgba(255,170,20,0.5)"
  },
  deagle: {
    sprite: DEAGLE_SPRITE,
    muzzleX: 18, muzzleY: 1.0, cd: 15, recoilAmt: 7, flashSize: 7,
    bulletLength: 16, bulletWidth: 2, casingSize: 1.5,
    color: "#ffbb11", trailColor: "rgba(255,180,40,0.8)", glowColor: "rgba(255,140,20,0.6)"
  }
};

// ── Internal types ─────────────────────────────────────────────────────────

interface Obs { x: number; type: "sm" | "md" | "lg" | "tree" }
interface Flyer { 
  x: number; y: number; f: number; t: number;
  speed: number; age: number;
  /** Pre-computed attack angle (radians) toward dino at spawn time */
  attackAngle: number;
  /** Velocity components computed from attackAngle */
  vx: number; vy: number;
  /** Which band this bird spawned in */
  band: 'upper' | 'middle' | 'lower';
  /** Creature type */
  kind: 'spikyBall' | 'monsterBird';
}
interface Drift { x: number; y: number; s: number; opacity?: number; }
interface Bullet { x: number; y: number; vx: number; vy: number; wpn: WeaponType; trail: { x: number; y: number }[]; }
interface Casing { x: number; y: number; vx: number; vy: number; rot: number; vrot: number; groundLife: number; size: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }

// ── Component ──────────────────────────────────────────────────────────────

export function DinoRunner() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const rid = useRef(0);
  const currentWeapon = useRef<WeaponType>("mp5");

  useEffect(() => {
    // Determine weapon on mount (client-side only)
    currentWeapon.current = getWeaponForSession();

    const el = cvs.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const wpnType = currentWeapon.current;

    let W = 0, H = 0, PX = 2.5;

    // Mutable animation state
    let gOff = 0;
    let dF = 0, dT = 0;
    let obs: Obs[] = [];
    let bds: Flyer[] = [];
    let cls: Drift[] = [];
    let bullets: Bullet[] = [];
    let casings: Casing[] = [];
    let particles: Particle[] = [];
    let shootCD = 0;
    let recoil = 0;
    let muzzleFlash = 0;
    let oCD = 80, bCD = 0, cCD = 0;
    let init = false;

    // Jump state scaled to medium-subtle size
    let jumpY = 0, jumpVel = 0, isJumping = false;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -9.0;

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

    /** Spawn initial birds so they're visible on page load */
    const spawnInitialBirds = () => {
      const bands: ('upper' | 'middle' | 'lower')[] = ['upper', 'middle', 'lower'];
      const isDeagle = currentWeapon.current === 'deagle';
      const numBirds = isDeagle ? 8 : 10; // Less initial birds in Deagle mode for scattering

      // Spawn birds spread across the sky
      for (let i = 0; i < numBirds; i++) {
        const band = bands[i % 3];
        let spawnX: number;
        let spawnY: number;

        // Make sure all enemies start far away from the dino so they die at a distance
        spawnX = W * 0.65 + (i / numBirds) * (W * 0.5) + (Math.random() - 0.5) * W * 0.1;

        switch (band) {
          case 'upper':  spawnY = H * 0.12 + Math.random() * (H * 0.12); break;
          case 'middle': spawnY = H * 0.30 + Math.random() * (H * 0.12); break;
          case 'lower':  spawnY = H * 0.48 + Math.random() * (H * 0.12); break;
        }

        const speedMult = isDeagle ? 0.35 : 1.0;
        const speed = (2 + Math.random() * 3) * (PX / 2.5) * speedMult;
        // Direct target dino
        const dinoCX = W * 0.12 + (34 * PX * 1.15) * 0.5;
        const dinoCY = H * 0.78 - (34 * PX) * 0.5;
        const angle = Math.atan2(dinoCY - spawnY, dinoCX - spawnX);

        bds.push({
          x: spawnX,
          y: spawnY!,
          f: Math.random() > 0.5 ? 1 : 0,
          t: Math.random() * 10,
          speed,
          age: 2, // start as if already alive so they can be targeted
          attackAngle: angle,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          band,
          kind: i % 2 === 0 ? 'spikyBall' : 'monsterBird',
        });
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
        // Spread large clouds evenly across the entire screen and off-screen right
        cls = [];
        const numClouds = 12;
        for (let i = 0; i < numClouds; i++) {
           cls.push({
             x: W * -0.1 + (i / numClouds) * (W * 1.6) + (Math.random() - 0.5) * W * 0.1,
             y: H * (0.02 + Math.random() * 0.25),
             s: 2.0 + Math.random() * 2.0,
             opacity: 0.5 + Math.random() * 0.25
           });
        }
        
        // Spawn initial birds
        spawnInitialBirds();
        
        // Spawn initial obstacles spread across the screen
        const numObs = 6 + Math.floor(Math.random() * 3); // 6 to 8 obstacles
        for (let i = 0; i < numObs; i++) {
          const r = Math.random();
          // Spread them across the viewport, starting a bit ahead of the dino
          const obsX = W * 0.35 + (i / numObs) * (W * 0.65) + (Math.random() - 0.5) * W * 0.1;
          obs.push({ x: obsX, type: r < 0.25 ? "sm" : r < 0.5 ? "md" : r < 0.75 ? "lg" : "tree" });
        }

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
    const SPD = 2.0;
    const DINO_X_FRAC = 0.12;

    let prev = 0;

    const frame = (t: number) => {
      const dt = prev ? Math.min((t - prev) / 16.67, 3) : 1;
      prev = t;
      const g = gy();
      const v = SPD * dt;
      const dinoX = W * DINO_X_FRAC;
      // Target rendered size matching existing scale
      const dinoTargetH = 34 * PX;
      const dinoTargetW = dinoTargetH * (dinoAspect || 1.15);

      // ── UPDATE ──

      gOff = (gOff + v * 1.5) % (PX * 12);

      // Dino run cycle
      dT += dt;
      if (dT > 6.5) { dF ^= 1; dT = 0; }

      // Auto-jump — finely timed trigger distance
      if (!isJumping) {
        for (const o of obs) {
          const dinoFront = dinoX + dinoTargetW * 0.78;
          const dist = o.x - dinoFront;
          const triggerDist = o.type === "tree" ? 35 : 28;
          
          if (dist > 0 && dist < triggerDist) {
            isJumping = true;
            if (o.type === "sm") jumpVel = -9.0;
            else if (o.type === "md") jumpVel = -10.5;
            else jumpVel = -12.0; // lg and tree
            break;
          }
        }
      }

      if (isJumping) {
        jumpY += jumpVel * dt;
        jumpVel += GRAVITY * dt;
        if (jumpY >= 0) { jumpY = 0; jumpVel = 0; isJumping = false; }
      }

      const dy = g - dinoTargetH + jumpY + (isJumping ? 0 : dF ? -PX * 0.5 : PX * 0.2);

      // Decay recoil and flash
      if (recoil > 0) recoil = Math.max(0, recoil - dt * 0.8);
      if (muzzleFlash > 0) muzzleFlash -= dt;

      // Auto-shoot at nearest bird — NO targeting delay, fire immediately
      shootCD -= dt;
      let aimAngle = 0;
      let nearestBird: Flyer | null = null;
      let minDist = Infinity;
      
      for (const b of bds) {
        // Kill Zone Restriction: Ignore enemies until they reach the letter "B" (W * 0.55)
        if (b.x > W * 0.55) continue;

        // Target ALL creatures
        const spriteW = b.kind === 'spikyBall' ? 13 * PX * 0.675 : 18 * PX * 0.675;
        const spriteH = b.kind === 'spikyBall' ? 11 * PX * 0.675 : 10 * PX * 0.675;
        const bcx = b.x + spriteW * 0.5;
        const bcy = b.y + spriteH * 0.5;
        const dist = Math.hypot(bcx - dinoX, bcy - dy);
        if (dist < minDist) { minDist = dist; nearestBird = b; }
      }

      const wpnScale = PX * 0.7;
      const gunBaseX = dinoX - recoil * PX + dinoTargetW * 0.6;
      const gunBaseY = dy + dinoTargetH * 0.60;

      if (nearestBird) {
         // Aim at the center of the creature sprite
         const sprW = nearestBird.kind === 'spikyBall' ? 13 * PX * 0.675 : 18 * PX * 0.675;
         const sprH = nearestBird.kind === 'spikyBall' ? 11 * PX * 0.675 : 10 * PX * 0.675;
         const birdCenterX = nearestBird.x + sprW * 0.5;
         const birdCenterY = nearestBird.y + sprH * 0.5;
         aimAngle = Math.atan2(birdCenterY - gunBaseY, birdCenterX - gunBaseX);
         
         if (shootCD <= 0) {
           const wpn = WEAPONS[wpnType];
           shootCD = wpn.cd;
           recoil = wpn.recoilAmt;
           muzzleFlash = wpn.flashSize;
           
           const muzzleDist = wpn.muzzleX * wpnScale;
           const bX = gunBaseX + Math.cos(aimAngle) * muzzleDist;
           const bY = gunBaseY + Math.sin(aimAngle) * muzzleDist;
           const speed = 100 * PX; // extremely fast so the dino never misses and enemies die instantly at range
           
           bullets.push({
             x: bX, y: bY,
             vx: Math.cos(aimAngle) * speed,
             vy: Math.sin(aimAngle) * speed,
             wpn: wpnType,
             trail: [{ x: bX, y: bY }]
           });

           casings.push({
             x: gunBaseX, y: gunBaseY,
             vx: -(1 + Math.random() * 2) * PX,
             vy: -(2 + Math.random() * 3) * PX,
             rot: 0,
             vrot: (Math.random() - 0.5) * 0.8,
             groundLife: 60,
             size: wpn.casingSize
           });
        }
      }

      // Update Bullets & Collision
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Store trail points (keep last N for comet tail)
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 14) b.trail.shift();
        
        let hit = false;
        for (let j = bds.length - 1; j >= 0; j--) {
           const bird = bds[j];
           const birdW = bird.kind === 'spikyBall' ? 13 * PX * 0.675 : 18 * PX * 0.675;
           const birdH = bird.kind === 'spikyBall' ? 11 * PX * 0.675 : 10 * PX * 0.675;
           const bx = bird.x + birdW * 0.5;
           const by = bird.y + birdH * 0.5;
           
           // Continuous collision detection: check line segment from prev pos to current pos
           const prevX = b.x - b.vx * dt;
           const prevY = b.y - b.vy * dt;
           const l2 = (b.x - prevX) ** 2 + (b.y - prevY) ** 2;
           let t = Math.max(0, Math.min(1, ((bx - prevX) * (b.x - prevX) + (by - prevY) * (b.y - prevY)) / (l2 || 1)));
           const projX = prevX + t * (b.x - prevX);
           const projY = prevY + t * (b.y - prevY);
           
           const hitDist = Math.hypot(projX - bx, projY - by);
           const hitRadius = bird.kind === 'spikyBall' ? 4.5 * PX : 5.25 * PX;
           if (hitDist < hitRadius) {
              hit = true;
              // Pixel-art impact — pixel burst with creature-colored fragments
              const impactColor = bird.kind === 'spikyBall' ? PAL.spikyBall : PAL.monsterBird;
              for (let k = 0; k < 16; k++) {
                 const angle = (Math.PI * 2 * k) / 16;
                 const spd = (3 + Math.random() * 5) * PX;
                 particles.push({
                   x: bx + (Math.random() - 0.5) * 8,
                   y: by + (Math.random() - 0.5) * 8,
                   vx: Math.cos(angle) * spd,
                   vy: Math.sin(angle) * spd,
                   life: 14 + Math.random() * 12,
                   color: k % 4 === 0 ? "#ffcc00" : k % 4 === 1 ? "#ff6600" : k % 4 === 2 ? "#ffffff" : impactColor,
                   size: 1.5 + Math.random() * 2
                 });
              }
              // A few larger pixel chunks
              for (let k = 0; k < 5; k++) {
                particles.push({
                  x: bx, y: by,
                  vx: (Math.random() - 0.5) * 10 * PX,
                  vy: (Math.random() - 0.5) * 10 * PX - 3 * PX,
                  life: 20 + Math.random() * 14,
                  color: impactColor,
                  size: 2.5 + Math.random() * 1.5
                });
              }
              bds.splice(j, 1);
              break;
           }
        }

        if (hit || b.x > W + 50 || b.y > H + 50 || b.y < -50 || b.x < -50) {
          bullets.splice(i, 1);
        }
      }

      // Update Casings
      for (let i = casings.length - 1; i >= 0; i--) {
        const c = casings[i];
        if (c.y < g - PX) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.vy += GRAVITY * dt * 2.5; // fall to ground
          c.rot += c.vrot * dt;
        } else {
          c.y = g - PX;
          c.groundLife -= dt;
        }
        if (c.groundLife <= 0) casings.splice(i, 1);
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += GRAVITY * dt * 1.5;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Obstacles
      oCD -= dt;
      if (oCD <= 0) {
        const r = Math.random();
        obs.push({ x: W + 20, type: r < 0.25 ? "sm" : r < 0.5 ? "md" : r < 0.75 ? "lg" : "tree" });
        oCD = 30 + Math.random() * 40;
      }
      for (const o of obs) o.x -= v * 1.5;
      if (obs.length && obs[0].x < -60) obs.shift();

      // ════════════════════════════════════════════════════════════════════
      // BIRDS — Only birds as flying/shooting targets
      // Birds spawn across the visible sky area.
      // ════════════════════════════════════════════════════════════════════

      const MAX_BIRDS = 12;
      const dinoCenterX = dinoX + dinoTargetW * 0.5;
      const dinoCenterY = dy + dinoTargetH * 0.5;

      /** Spawn a bird in a specific band */
      const spawnBird = (band: 'upper' | 'middle' | 'lower') => {
        const isDeagle = wpnType === 'deagle';
        
        // X: distribute across right side of the screen 
        // Spawn them far away for all modes so Dino has time to kill them from a distance
        const spawnX = W * 0.70 + Math.random() * (W * 0.50);

        // Y: pick from the specified band
        let spawnY: number;
        switch (band) {
          case 'upper':  spawnY = H * 0.10 + Math.random() * (H * 0.15); break;
          case 'middle': spawnY = H * 0.30 + Math.random() * (H * 0.15); break;
          case 'lower':  spawnY = H * 0.50 + Math.random() * (H * 0.12); break;
        }

        // Varied speeds: slower for farther birds, faster for closer ones
        const speedMult = isDeagle ? 0.35 : 1.0;
        const speed = (3 + Math.random() * 4) * (PX / 2.5) * speedMult;

        // Pre-compute attack angle toward the dino center
        const attackAngle = Math.atan2(dinoCenterY - spawnY, dinoCenterX - spawnX);

        // Remove variation so they directly target the dino
        const finalAngle = attackAngle;

        bds.push({
          x: spawnX,
          y: spawnY,
          f: 0, t: 0,
          speed,
          age: 0,
          attackAngle: finalAngle,
          vx: Math.cos(finalAngle) * speed,
          vy: Math.sin(finalAngle) * speed,
          band,
          kind: Math.random() > 0.5 ? 'spikyBall' : 'monsterBird',
        });
      };

      bCD -= dt;
      if (bCD <= 0 && bds.length < MAX_BIRDS) {
        // Cycle through spawn bands to ensure variety
        const bands: ('upper' | 'middle' | 'lower')[] = ['upper', 'middle', 'lower'];
        const chosenBand = bands[Math.floor(Math.random() * bands.length)];
        spawnBird(chosenBand);
        // Staggered spawning: spawn another bird quickly sometimes
        // In Deagle mode, skip staggered spawning to keep them scattered
        if (wpnType !== 'deagle' && Math.random() > 0.5 && bds.length < MAX_BIRDS) {
          const secondBand = bands[Math.floor(Math.random() * bands.length)];
          spawnBird(secondBand);
        }
        bCD = wpnType === 'deagle' ? 22 + Math.random() * 10 : 12 + Math.random() * 20;
      }

      // Update bird positions — move along their pre-computed attack vector
      for (let i = bds.length - 1; i >= 0; i--) {
        const b = bds[i];
        b.age += dt / 60;

        // Move along attack trajectory
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Wing flap animation
        b.t += dt;
        if (b.t > 12) { b.f ^= 1; b.t = 0; }

        // Remove birds that have gone well past the dino or off-screen
        if (b.x < -80 || b.y > H + 40 || b.x > W + 80 || b.y < -80) {
          bds.splice(i, 1);
        }
      }

      // Clouds
      cCD -= dt;
      if (cCD <= 0) {
        cls.push({
          x: W + 60,
          y: H * (0.02 + Math.random() * 0.25),
          s: 2.0 + Math.random() * 2.0,
          opacity: 0.5 + Math.random() * 0.25
        });
        cCD = 40 + Math.random() * 60; // Spawn clouds much less frequently
      }
      for (const c of cls) c.x -= v * (0.15 + (c.s - 0.6) * 0.1);
      cls = cls.filter(c => c.x > -100);

      // ── RENDER ──
      ctx.clearRect(0, 0, W, H);

      // Clouds
      for (const c of cls) {
         ctx.globalAlpha = c.opacity ?? 0.5;
         stamp(CLOUD, c.x, c.y, PAL.cloud, PX * c.s);
      }
      ctx.globalAlpha = 1;

      // Ground
      ctx.fillStyle = PAL.ground;
      ctx.fillRect(0, g, W, 1);

      ctx.fillStyle = PAL.pebble;
      for (let x = -gOff; x < W + PX * 12; x += PX * 12) {
        ctx.fillRect(x, g + PX * 2, PX * 2, PX * 0.7);
        ctx.fillRect(x + PX * 5, g + PX * 3.5, PX, PX * 0.7);
        ctx.fillRect(x + PX * 9, g + PX * 1.5, PX * 1.5, PX * 0.5);
      }

      // Casings (render before dino so they fall behind)
      ctx.fillStyle = "#ffb84d";
      for (const c of casings) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = c.groundLife < 20 ? Math.max(0, c.groundLife / 20) : 1;
        ctx.fillRect(-1.5 * PX * c.size, -PX * c.size, 3 * PX * c.size, 1.5 * PX * c.size);
        ctx.restore();
      }

      // ── Dino Graphic (Split rendering for static body + wiggling legs) ──
      if (dinoLoaded && selectedDinoCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.imageSmoothingEnabled = false;

        const splitRatio = 0.65; // Upper 65% is body, lower 35% is legs
        const splitH_canvas = selectedDinoCanvas.height * splitRatio;
        const splitH_dest = dinoTargetH * splitRatio;

        // Draw top half (body, head, arms) - STATIC
        ctx.drawImage(
          selectedDinoCanvas,
          0, 0, selectedDinoCanvas.width, splitH_canvas,
          Math.round(dinoX - recoil * PX), Math.round(dy), Math.round(dinoTargetW), Math.round(splitH_dest)
        );

        // Draw bottom half (legs) - WIGGLING
        const legWiggle = isJumping ? 0 : (dF ? 0.25 : -0.25); // Radians for leg swing
        const legPivotX = Math.round(dinoX - recoil * PX) + dinoTargetW * 0.5;
        const legPivotY = Math.round(dy) + splitH_dest;
        
        ctx.save();
        ctx.translate(legPivotX, legPivotY);
        ctx.rotate(legWiggle);
        ctx.drawImage(
          selectedDinoCanvas,
          0, splitH_canvas, selectedDinoCanvas.width, selectedDinoCanvas.height - splitH_canvas,
          -dinoTargetW * 0.5, 0, Math.round(dinoTargetW), Math.round(dinoTargetH - splitH_dest)
        );
        ctx.restore();

        ctx.restore();
      }

      // Gun — rendered at larger scale for visibility
      const wpn = WEAPONS[wpnType];
      ctx.save();
      ctx.translate(gunBaseX, gunBaseY);
      ctx.rotate(aimAngle);
      stamp(wpn.sprite, -4 * wpnScale, -3 * wpnScale, PAL.gear, wpnScale);

      // Muzzle Flash — bright multi-layered flash
      if (muzzleFlash > 0) {
        const flashPct = muzzleFlash / wpn.flashSize;
        const flashRadius = flashPct * wpn.flashSize * PX * 0.9;
        // Outer glow
        ctx.globalAlpha = flashPct * 0.6;
        ctx.fillStyle = "#ffcc44";
        ctx.beginPath();
        ctx.arc(wpn.muzzleX * wpnScale, wpn.muzzleY * wpnScale, flashRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Core white flash
        ctx.globalAlpha = flashPct;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(wpn.muzzleX * wpnScale, wpn.muzzleY * wpnScale, flashRadius, 0, Math.PI * 2);
        ctx.fill();
        // Inner hot core
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.arc(wpn.muzzleX * wpnScale, wpn.muzzleY * wpnScale, flashRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // Bullets — THICK bright yellow/orange/white comet-style with intense glow
      for (const b of bullets) {
        const bWpn = WEAPONS[b.wpn];
        
        // Draw glowing trail (comet tail) — THICK and bright
        if (b.trail.length > 1) {
          for (let ti = 0; ti < b.trail.length - 1; ti++) {
            const tp = b.trail[ti];
            const tn = b.trail[ti + 1];
            const pct = (ti + 1) / b.trail.length;
            const width = pct * bWpn.bulletWidth * PX * 0.5;
            
            // Wide outer glow — soft diffuse light
            ctx.strokeStyle = bWpn.glowColor;
            ctx.lineWidth = width + PX * 2;
            ctx.globalAlpha = pct * 0.25;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tp.x, tp.y);
            ctx.lineTo(tn.x, tn.y);
            ctx.stroke();

            // Mid glow — orange
            ctx.strokeStyle = bWpn.trailColor;
            ctx.lineWidth = width + PX * 1;
            ctx.globalAlpha = pct * 0.5;
            ctx.beginPath();
            ctx.moveTo(tp.x, tp.y);
            ctx.lineTo(tn.x, tn.y);
            ctx.stroke();
            
            // Inner trail — bright yellow-white core
            ctx.strokeStyle = "#fff8cc";
            ctx.lineWidth = width;
            ctx.globalAlpha = pct * 0.7;
            ctx.beginPath();
            ctx.moveTo(tp.x, tp.y);
            ctx.lineTo(tn.x, tn.y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';

        // Large glow halo around projectile head
        const glowR = bWpn.bulletLength * PX * 0.6;
        ctx.save();
        ctx.translate(b.x, b.y);
        
        // Outer soft glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = bWpn.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, glowR * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mid glow
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = bWpn.trailColor;
        ctx.beginPath();
        ctx.arc(0, 0, glowR, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright inner glow
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#ffeeaa";
        ctx.beginPath();
        ctx.arc(0, 0, glowR * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
        // Projectile body (comet head) — thick and bright
        ctx.rotate(Math.atan2(b.vy, b.vx));
        // Colored body — thick
        ctx.fillStyle = bWpn.color;
        ctx.fillRect(
          -bWpn.bulletLength * PX * 0.6,
          -bWpn.bulletWidth * PX * 0.6,
          bWpn.bulletLength * PX * 1.2,
          bWpn.bulletWidth * PX * 1.2
        );
        // Bright white-hot core on top
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          -bWpn.bulletLength * PX * 0.3,
          -bWpn.bulletWidth * PX * 0.35,
          bWpn.bulletLength * PX * 0.6,
          bWpn.bulletWidth * PX * 0.7
        );
        ctx.restore();
      }

      // Particles (Impact Splash)
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life < 8 ? Math.max(0, p.life / 8) : 1;
        const sz = PX * p.size;
        ctx.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
      }
      ctx.globalAlpha = 1;

      // Obstacles
      for (const o of obs) {
        if (o.type === "tree") {
          stamp(TREE, o.x, g - 11 * PX, PAL.tree);
        } else {
          const sp = o.type === "lg" ? CACTUS_LG : o.type === "md" ? CACTUS_MD : CACTUS_SM;
          const rows = o.type === "lg" ? 9 : o.type === "md" ? 8 : 7;
          stamp(sp, o.x, g - rows * PX, PAL.cactus);
        }
      }

      // Creatures — spiky balls and monster birds attacking the dino
      for (const b of bds) {
        ctx.save();
        ctx.globalAlpha = 1;
        if (b.kind === 'spikyBall') {
          // Spiky ball — rendered in menacing red with slightly larger scale
          stamp(SPIKY_BALL[b.f], b.x, b.y, PAL.spikyBall, PX * 0.675);
          // Draw brighter spike tips for extra menace
          stamp(SPIKY_BALL[b.f], b.x, b.y, PAL.spikyBallSpike, PX * 0.5625);
        } else {
          // Monster bird — rendered in dark purple, larger aggressive shape
          stamp(MONSTER_BIRD[b.f], b.x, b.y, PAL.monsterBird, PX * 0.675);
          // Eye glow
          const eyeX = b.x + 14 * PX * 0.675;
          const eyeY = b.y + 4 * PX * 0.675;
          ctx.fillStyle = '#ff3333';
          ctx.fillRect(eyeX, eyeY, PX * 1.5, PX * 1.125);
        }
        ctx.restore();
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
