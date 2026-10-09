"use client";

import { gsap } from "gsap";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "@/components/ui/liquid-glass-carousel-utils/webgl-error-boundary";
import { GlowButton } from "@/components/ui/glow";
import { Magnetic } from "@/components/ui/Magnetic";
import { TiltCard } from "@/components/ui/TiltCard";
import { Link2, X } from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export interface LiquidGlassCarouselItem {
  src: string;
  title: string;
  /** Width / height. Measured from the image when omitted. */
  aspect?: number;
  desc?: string;
  tags?: string[];
  github?: string;
  link?: string;
  cat?: string;
}

export interface LiquidGlassCarouselProps {
  items?: LiquidGlassCarouselItem[];
  /** Target panel height in CSS pixels. Scaled down when the container is shorter. */
  panelHeight?: number;
  gap?: number;
  background?: string;
  /** Play the rise-and-grow intro. Ignored when the user prefers reduced motion. */
  entry?: boolean;
  className?: string;
  style?: CSSProperties;
  onActiveChange?: (index: number) => void;
  onFocusChange?: (focused: boolean) => void;
}

const LANDSCAPE_ASPECT = 16 / 10;

export const liquidGlassCarouselDefaultItems: LiquidGlassCarouselItem[] = [];

const LENS = {
  sizeX: 0.565,
  sizeY: 1,
  posX: 0.5,
  posY: 0.5,
  rotation: 65,
  spin: 0,
  zoom: 0,
  dispersion: 11,
  blur: 0,
  glow: 4.2,
  whiteGlow: 0.24,
  novaSize: 12,
  blueRing: 6,
  ringRadius: 0.49,
  ringWidth: 0.014,
  shimmer: true,
  shimmerFreq: 12,
  shimmerSpeed: 3.5,
  shimmerDepth: 0.12,
  rimStart: 0.578,
  rimTangential: 0.6,
  rimInward: 0,
  rimFreq1: 2,
  rimFreq2: 1,
  blueColor: "#009dff",
  rimLine: 1.4,
  rimLinePos: 0.488,
  rimLineWidth: 0.003,
  vignette: 0,
  vignetteSize: 0.3,
  samples: 12,
};

const FOCUS = {
  cardDuration: 0.7,
  focusDuration: 0.9,
  cardEase: "power4.out",
  focusEase: "power3.out",
  stagger: 0.06,
  dropDist: 1.4,
  centerScale: 1.18,
  lensFade: 0.85,
};

const ENTRY = {
  delay: 0.5,
  startH: 80,
  riseDuration: 1.0,
  stagger: 0.07,
  riseEase: "power3.out",
  fromBelow: 0.9,
  growDelay: 0.25,
  growDuration: 2.15,
  growEase: "expo.inOut",
  growStagger: 0.085,
  lensBloom: 1.4,
  lensBloomEase: "power2.inOut",
};

const LENS_VERTEX = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const LENS_FRAGMENT = `
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uAspect;
uniform vec2 uCenter;
uniform float uZoom;
uniform float uRotation;
uniform float uSquareRound;
uniform float uShape;
uniform float uSizeX;
uniform float uSizeY;
uniform float uRimStart;
uniform float uRimTangential;
uniform float uRimInward;
uniform float uRimFreq1;
uniform float uRimFreq2;
uniform float uNovaSize;
uniform float uGlow;
uniform float uWhiteGlow;
uniform float uRingRadius;
uniform float uRingWidth;
uniform vec3 uBlueColor;
uniform float uBlueRing;
uniform float uShimmer;
uniform float uShimmerFreq;
uniform float uShimmerSpeed;
uniform float uShimmerDepth;
uniform float uTime;
uniform float uDispersion;
uniform float uBlur;
uniform float uRimLine;
uniform float uRimLinePos;
uniform float uRimLineWidth;
uniform float uVignette;
uniform float uVignetteSize;
uniform int uSamples;
varying vec2 vUv;

#define PI 3.14159265359
#define MAX_SAMPLES 16

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec4 discLens(vec2 center, float aspectCorrect, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;

  float maskND;
  if (uShape > 0.5) {
    float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
    float sd = sdRoundBox(p, halfSize, corner);
    maskND = 1.0 + sd / min(uSizeX, uSizeY);
  } else {
    maskND = dist;
  }
  if (maskND > 1.0) return vec4(0.0);

  float shapeND = clamp(maskND, 0.0, 1.0);
  float nd = clamp(dist, 0.0, 1.0);
  vec2 offset = vUv - center;
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 rimPull = -radialDir * rimStrength * rScreen * uRimInward;

  vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask;
  int N = uSamples;
  if (N < 2) N = 2;
  if (N > MAX_SAMPLES) N = MAX_SAMPLES;
  vec3 col = vec3(0.0);
  float alphaCol = 0.0;
  vec3 caW = vec3(0.0);
  float aW = 0.0;
  float invSigmaSq = 6.9252; // Precalculated 1.0 / (0.38 * 0.38)
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= N) break;
    float t = float(i) / float(N - 1);
    vec2 sUV = baseUV + dispDir * (t - 0.5);
    vec4 s = texture2D(uTex, sUV);
    
    float t0 = t;
    float t5 = t - 0.5;
    float t1 = t - 1.0;

    vec3 w = vec3(
      exp(-invSigmaSq * t0 * t0),
      exp(-invSigmaSq * t5 * t5),
      exp(-invSigmaSq * t1 * t1)
    );
    col += s.rgb * w;
    alphaCol += s.a * w.g;
    caW += w;
    aW += w.g;
  }
  col /= max(caW, vec3(0.001));
  alphaCol /= max(aW, 0.001);

  float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
  if (uBlur > 0.01 && blurFade > 0.01) {
    vec2 blurRad = vec2(uBlur) / uRes * blurFade;
    vec3 bcol = vec3(0.0);
    float balpha = 0.0;
    float btw = 0.0;
    for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
      for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
        vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
        float w = 1.0 - rr * 0.38;
        vec4 s = texture2D(uTex, baseUV + o);
        bcol += s.rgb * w;
        balpha += s.a * w;
        btw += w;
      }
    }
    col = mix(bcol / btw, col, rimMask);
    alphaCol = mix(balpha / btw, alphaCol, rimMask);
  }

  // Darkening removed

  float r2 = shapeND * shapeND * 0.25;
  float gs = max(uNovaSize * uGlow * 0.003, 0.004);
  float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
  nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
  col += vec3(nova);

  float dC = shapeND * 0.5;
  float tR = clamp(uRingRadius, 0.1, 0.49);
  float rW = max(uRingWidth, 0.003);
  float ring = exp(-((dC - tR) * (dC - tR)) / (rW * rW));
  ring *= uBlueRing * (uGlow / 17.0) * 1.8;
  if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
  float ringAura = exp(-((dC - tR) * (dC - tR)) / ((rW * 6.0) * (rW * 6.0))) * 0.28 * uBlueRing * (uGlow / 17.0);
  col += uBlueColor * (ring + ringAura);
  col += vec3(exp(-((dC - uRimLinePos) * (dC - uRimLinePos)) / max(uRimLineWidth * uRimLineWidth, 0.00000001)) * uRimLine);

  outA = smoothstep(1.0, 0.93, maskND);
  return vec4(col, alphaCol);
}

void main(){
  vec4 base = texture2D(uTex, vUv);
  vec4 outc = base;
  float a = 0.0;
  vec4 c = discLens(uCenter, uAspect, a);
  outc = mix(outc, c, a);
  if (uVignette > 0.001) {
    vec2 vc = vUv - 0.5;
    vc.x *= uAspect;
    float d = length(vc) / max(uVignetteSize, 0.0001);
    float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
    outc *= clamp(vig, 0.0, 1.0);
  }
  gl_FragColor = outc;
}
`

const LENS_FX_KEYS = [
  "uDispersion",
  "uBlueRing",
  "uRimLine",
  "uVignette",
  "uZoom",
  "uRimTangential",
  "uRimInward",
] as const;

const REPEATS = 4;
const CLICK_SLOP = 6;
const TOUCH_CLICK_SLOP = 12;
const FLICK_IDLE_MS = 90;

function at<T>(list: readonly T[], index: number): T {
  const item = list[index];
  if (item === undefined) {
    throw new Error("Index out of range.");
  }
  return item;
}

type PanelRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  poolIdx: number;
  srcIndex: number;
  centerX: number;
};

type PoolItem = {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  srcIndex: number;
  bound: boolean;
};

type Source = {
  tex: THREE.Texture | null;
  aspect: number;
  locked: boolean;
};

export type LiquidGlassCarouselHandle = {
  closeFocus: () => void;
  next: () => void;
  previous: () => void;
  destroy: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function hexToNumber(background: string) {
  const value = background.trim();
  if (value.startsWith("#") && (value.length === 7 || value.length === 4)) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;
    const parsed = Number.parseInt(hex.slice(1), 16);
    return Number.isFinite(parsed) ? parsed : 0xffffff;
  }
  return 0xffffff;
}

function createCarousel(
  mount: HTMLElement,
  cursorElement: HTMLElement | null,
  options: {
    items: LiquidGlassCarouselItem[];
    panelHeight: number;
    gap: number;
    background: string;
    entry: boolean;
    onActiveChange: (index: number) => void;
    onFocusChange: (open: boolean) => void;
    onEntryDone: (done: boolean) => void;
  },
): LiquidGlassCarouselHandle | null {
  const reduced = prefersReducedMotion();
  const entryOn = options.entry && !reduced;
  const items = options.items;
  if (items.length === 0) return null;

  let W = Math.max(1, mount.clientWidth);
  let H = Math.max(1, mount.clientHeight);
  const panelHFor = () =>
    Math.max(120, Math.min(options.panelHeight, Math.round(H * 0.52)));
  let PANEL_H = panelHFor();
  const GAP = options.gap;
  const EASE = reduced ? 0.28 : 0.09;
  const SNAP_EASE = reduced ? 0.22 : 0.05;
  const WHEEL = 1.4;
  const DRAG = 1.6;
  const TOUCH_DRAG = 1;
  const TOUCH_EASE = 0.22;
  const FRICTION = 0.865;
  const SNAP_IDLE_MS = 120;
  const SHRINK_MAX = 60;
  const SHRINK_ATTACK = 0.25;
  const SHRINK_DECAY = 0.06;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0); // Transparent
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.userSelect = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -W / 2,
    W / 2,
    H / 2,
    -H / 2,
    -100,
    100,
  );
  camera.position.z = 10;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const sources: Source[] = items.map((img) => {
    const s: Source = {
      tex: null,
      aspect: img.aspect || LANDSCAPE_ASPECT,
      locked: img.aspect != null,
    };
    loader.load(
      img.src,
      (tex: THREE.Texture) => {
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.colorSpace = THREE.SRGBColorSpace;
        if (!s.locked && tex.image) {
          const imgElement = tex.image as HTMLImageElement;
          s.aspect = imgElement.width / imgElement.height;
        }
        s.tex = tex;
        recomputeTotal();
        if (!userInteracted) {
          scroll = centerForIndex(0);
          target = scroll;
        }
      },
      undefined,
      () => {
        s.aspect = s.aspect || LANDSCAPE_ASPECT;
      },
    );
    return s;
  });

  function slotWidth(srcIndex: number) {
    return at(sources, srcIndex).aspect * PANEL_H + GAP;
  }

  let offsets: number[] = [];
  let totalWidth = 0;
  function recomputeTotal() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      offsets.push(acc);
      acc += slotWidth(i);
    }
    totalWidth = acc;
  }
  recomputeTotal();

  function centerForIndex(idx: number) {
    const N = sources.length;
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return at(offsets, s) + slotWidth(s) / 2 - GAP / 2 + loop * totalWidth;
  }

  function nearestIndex(value: number) {
    if (!totalWidth) return 0;
    const N = sources.length;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = i + k * N;
      }
    }
    return best;
  }

  function centerIndex(value: number) {
    if (!totalWidth) return 0;
    let bestI = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sources.length; i++) {
      const center = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        bestI = i;
      }
    }
    return bestI;
  }

  let lastCenter = -1;
  const pool: PoolItem[] = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < sources.length; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xdddddd,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, mat, srcIndex: i, bound: false });
    }
  }

  let scroll = centerForIndex(0);
  let target = scroll;
  let userInteracted = false;
  let velocity = 0;
  let prevScroll = 0;
  let scrollEnergy = 0;
  let pendingFocus: { srcIndex: number } | null = null;
  let lastInput = performance.now();
  let snapped = false;

  const rt = new THREE.WebGLRenderTarget(W * dpr, H * dpr);
  const lensScene = new THREE.Scene();
  const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lensUniforms = {
    uTex: { value: rt.texture },
    uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uSizeX: { value: LENS.sizeX },
    uSizeY: { value: LENS.sizeY },
    uShape: { value: 0 },
    uSquareRound: { value: 0 },
    uRotation: { value: 0 },
    uAspect: { value: W / H },
    uZoom: { value: LENS.zoom },
    uDispersion: { value: LENS.dispersion },
    uBlur: { value: LENS.blur },
    uGlow: { value: LENS.glow },
    uWhiteGlow: { value: LENS.whiteGlow },
    uNovaSize: { value: LENS.novaSize },
    uBlueRing: { value: LENS.blueRing },
    uRingRadius: { value: LENS.ringRadius },
    uRingWidth: { value: LENS.ringWidth },
    uShimmer: { value: reduced || !LENS.shimmer ? 0 : 1 },
    uShimmerFreq: { value: LENS.shimmerFreq },
    uShimmerSpeed: { value: LENS.shimmerSpeed },
    uShimmerDepth: { value: LENS.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: LENS.rimStart },
    uRimTangential: { value: LENS.rimTangential },
    uRimInward: { value: LENS.rimInward },
    uRimFreq1: { value: LENS.rimFreq1 },
    uRimFreq2: { value: LENS.rimFreq2 },
    uBlueColor: { value: new THREE.Color(LENS.blueColor) },
    uRimLine: { value: LENS.rimLine },
    uRimLinePos: { value: LENS.rimLinePos },
    uRimLineWidth: { value: LENS.rimLineWidth },
    uVignette: { value: LENS.vignette },
    uVignetteSize: { value: LENS.vignetteSize },
    uSamples: { value: LENS.samples },
  };
  const lensMat = new THREE.ShaderMaterial({
    uniforms: lensUniforms as unknown as THREE.ShaderMaterial["uniforms"],
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
    transparent: true,
  });
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensScene.add(lensQuad);

  const focusState = {
    active: false,
    srcIndex: -1,
    poolIdx: -1,
    lensFx: entryOn ? 0 : 1,
    anim: null as gsap.core.Timeline | null,
  };
  const drop = new Array(REPEATS * sources.length).fill(0);
  let focusScale = 1;
  const lastCenterX: Array<number | undefined> = new Array(
    REPEATS * sources.length,
  );
  const pEntry = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryActive = entryOn;
  let entrySettled = false;
  const growArr = new Array(REPEATS * sources.length).fill(entryOn ? 0 : 1);
  let entryAnim: gsap.core.Timeline | null = null;

  const lensFxFull: Record<(typeof LENS_FX_KEYS)[number], number> = {
    uDispersion: lensUniforms.uDispersion.value,
    uBlueRing: lensUniforms.uBlueRing.value,
    uRimLine: lensUniforms.uRimLine.value,
    uVignette: lensUniforms.uVignette.value,
    uZoom: lensUniforms.uZoom.value,
    uRimTangential: lensUniforms.uRimTangential.value,
    uRimInward: lensUniforms.uRimInward.value,
  };

  let panelRects: PanelRect[] = [];
  let centeredPanel: {
    srcIndex: number;
    centerX: number;
    wPx: number;
    h: number;
    poolIdx: number;
  } | null = null;

  function layout() {
    panelRects = [];
    centeredPanel = null;
    let centeredDist = Infinity;
    const half = W / 2;
    const buffer = PANEL_H;
    pool.forEach((p, poolIdx) => {
      const rep = Math.floor(poolIdx / sources.length);
      const i = p.srcIndex;
      const src = at(sources, i);
      const slotCenterInLoop = at(offsets, i) + slotWidth(i) / 2 - GAP / 2;
      let x = slotCenterInLoop - scroll;
      x = ((x % totalWidth) + totalWidth) % totalWidth;
      x += (rep - Math.floor(REPEATS / 2)) * totalWidth;
      if (x > half + totalWidth) x -= totalWidth * REPEATS;

      const centerX = x;
      const inEntry = entryActive || entrySettled;
      if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
        p.mesh.visible = false;
        lastCenterX[poolIdx] = undefined;
        return;
      }
      lastCenterX[poolIdx] = centerX;

      const shrink = 1 - 0.25 * scrollEnergy;
      const h = PANEL_H * shrink;
      const wPx = src.aspect * PANEL_H * shrink;

      if (src.tex && !p.bound) {
        p.mat.map = src.tex;
        p.mat.color.set(0xffffff);
        p.mat.needsUpdate = true;
        p.bound = true;
      }

      let y = 0;
      const isFocused = focusState.active && focusState.poolIdx === poolIdx;
      const d = drop[poolIdx] || 0;
      let drawW = wPx;
      let drawH = h;
      if (isFocused) {
        drawW = wPx * focusScale;
        drawH = h * focusScale;
      } else if (d > 0) {
        y = -d * H * FOCUS.dropDist;
      }

      p.mesh.visible = true;
      let finalX = centerX;
      let finalY = y;
      let finalW = drawW;
      let finalH = drawH;
      if (entryActive || entrySettled) {
        const pe = pEntry[poolIdx] || 0;
        const g = growArr[poolIdx] || 0;
        const curH = ENTRY.startH + (drawH - ENTRY.startH) * g;
        finalH = curH;
        finalW = curH * src.aspect;

        const cSrc = centerIndex(scroll);
        let di = i - cSrc;
        if (di > sources.length / 2) di -= sources.length;
        if (di < -sources.length / 2) di += sources.length;
        const N = sources.length;
        const midRep = Math.floor(REPEATS / 2);
        if (rep !== midRep) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const slotH = (s: number) => {
          const gg = growArr[midRep * N + s] || 0;
          return ENTRY.startH + (PANEL_H - ENTRY.startH) * gg;
        };
        let off = 0;
        if (di > 0) {
          for (let k = 0; k < di; k++) {
            const sa = (((cSrc + k) % N) + N) % N;
            const sb = (((cSrc + k + 1) % N) + N) % N;
            off +=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        } else if (di < 0) {
          for (let k = 0; k < -di; k++) {
            const sa = (((cSrc - k) % N) + N) % N;
            const sb = (((cSrc - k - 1) % N) + N) % N;
            off -=
              (at(sources, sa).aspect * slotH(sa) +
                at(sources, sb).aspect * slotH(sb)) /
                2 +
              GAP;
          }
        }
        finalX = off;
        if (finalX < -half - buffer || finalX > half + buffer) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const below = -H * ENTRY.fromBelow;
        finalY = below + (y - below) * pe;
      }

      p.mesh.position.set(finalX, finalY, 0);
      p.mesh.scale.set(finalW, finalH, 1);

      const sx = centerX + W / 2;
      const sy = H / 2 - y;
      panelRects.push({
        left: sx - drawW / 2,
        right: sx + drawW / 2,
        top: sy - drawH / 2,
        bottom: sy + drawH / 2,
        poolIdx,
        srcIndex: i,
        centerX,
      });

      if (Math.abs(centerX) < centeredDist) {
        centeredDist = Math.abs(centerX);
        centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx };
      }
    });
  }

  function panelAtPointer(px: number, py: number) {
    for (const r of panelRects) {
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
        return r;
      }
    }
    return null;
  }

  function localPoint(e: { clientX: number; clientY: number }) {
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const el = renderer.domElement;
  let dragging = false;
  let dragPointerId: number | null = null;
  let dragLastX = 0;
  let dragDist = 0;
  let dragVel = 0;
  let dragMoveT = 0;
  let suppressClick = false;
  let dragPointerType = "mouse";
  let lastPointerX = Number.NaN;
  let lastPointerY = Number.NaN;
  let pointerInside = false;
  let lastPointerType = "mouse";

  if (cursorElement) {
    gsap.set(cursorElement, {
      xPercent: 20,
      yPercent: 30,
      scale: 0,
      autoAlpha: 0,
    });
  }
  const moveX = cursorElement
    ? gsap.quickTo(cursorElement, "x", { duration: 0.5, ease: "power3.out" })
    : null;
  const moveY = cursorElement
    ? gsap.quickTo(cursorElement, "y", { duration: 0.5, ease: "power3.out" })
    : null;

  let overPanel = false;
  let hoverPanel = false;
  let cursorNow = "";
  function setCursor(v: string) {
    if (v === cursorNow) return;
    cursorNow = v;
    el.style.cursor = v;
  }

  function updateCursor() {
    if (focusState.active || entryActive || entrySettled) return setCursor("");
    if (dragging) return setCursor("grabbing");
    if (!hoverPanel) return setCursor("");
    return setCursor("grab");
  }

  function setHover(on: boolean) {
    hoverPanel = on;
    setView(on);
  }

  function refreshHover() {
    if (!pointerInside || lastPointerType !== "mouse") return;
    if (!Number.isFinite(lastPointerX)) return;
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
  }

  function setView(on: boolean) {
    if (entryActive || entrySettled) on = false;
    if (dragging) on = false;
    if (on === overPanel) {
      updateCursor();
      return;
    }
    overPanel = on;
    updateCursor();
    if (!cursorElement) return;
    gsap.killTweensOf(cursorElement, "scale,autoAlpha,opacity,visibility");
    gsap.to(cursorElement, {
      scale: on ? 1 : 0,
      autoAlpha: on ? 1 : 0,
      duration: on ? 0.35 : 0.25,
      ease: on ? "power3.out" : "power3.in",
    });
  }

  function inputLocked() {
    return focusState.active || entryActive || entrySettled;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (inputLocked()) return;
    userInteracted = true;
    pendingFocus = null;
    target += (e.deltaY || e.deltaX) * WHEEL;
    lastInput = performance.now();
    snapped = false;
  }

  function onPointerDown(e: PointerEvent) {
    suppressClick = false;
    if (inputLocked()) return;
    if (dragging) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging = true;
    dragPointerId = e.pointerId;
    dragPointerType = e.pointerType || "mouse";
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    const p = localPoint(e);
    dragLastX = p.x;
    lastPointerX = p.x;
    lastPointerY = p.y;
    dragDist = 0;
    dragVel = 0;
    dragMoveT = performance.now();
    setView(false);
    velocity = 0;
    pendingFocus = null;
    userInteracted = true;
    snapped = false;
    lastInput = dragMoveT;
  }

  function onPointerMove(e: PointerEvent) {
    const p = localPoint(e);
    if (dragging && e.pointerId === dragPointerId) {
      const sens = dragPointerType === "mouse" ? DRAG : TOUCH_DRAG;
      const dx = p.x - dragLastX;
      dragLastX = p.x;
      dragDist += Math.abs(dx);
      target -= dx * sens;
      dragVel = dragVel * 0.6 + -dx * sens * 0.4;
      dragMoveT = performance.now();
      lastInput = dragMoveT;
      snapped = false;
    }
    lastPointerX = p.x;
    lastPointerY = p.y;
    lastPointerType = e.pointerType || "mouse";
    pointerInside = true;
    if (e.pointerType !== "mouse") return;
    if (moveX) moveX(p.x);
    if (moveY) moveY(p.y);
    if (focusState.active) {
      setHover(false);
      return;
    }
    setHover(panelAtPointer(p.x, p.y) !== null);
  }

  function onPointerUp(e?: PointerEvent) {
    if (!dragging) return;
    if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;
    dragging = false;
    if (dragPointerId !== null) {
      try {
        el.releasePointerCapture(dragPointerId);
      } catch {
        /* already released */
      }
      dragPointerId = null;
    }
    velocity = performance.now() - dragMoveT > FLICK_IDLE_MS ? 0 : dragVel;
    dragVel = 0;
    lastInput = performance.now();
    snapped = false;
    suppressClick =
      dragDist > (dragPointerType === "mouse" ? CLICK_SLOP : TOUCH_CLICK_SLOP);
    if (dragPointerType === "mouse") {
      setHover(panelAtPointer(lastPointerX, lastPointerY) !== null);
    } else {
      updateCursor();
    }
  }

  function onEnter(e: PointerEvent) {
    pointerInside = true;
    lastPointerType = e.pointerType || "mouse";
  }
  function onLeave() {
    pointerInside = false;
    setHover(false);
  }

  function onClick(e: MouseEvent) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (focusState.active) {
      closeFocus();
      return;
    }
    if (entryActive || entrySettled) return;
    const p = localPoint(e);
    const hit = panelAtPointer(p.x, p.y);
    if (!hit) return;
    if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
      pendingFocus = null;
      openFocus();
      return;
    }
    userInteracted = true;
    velocity = 0;
    target = centerForIndex(nearestIndex(scroll + hit.centerX));
    snapped = true;
    pendingFocus = { srcIndex: hit.srcIndex };
    setView(false);
  }

  function openFocus() {
    if (focusState.active || !centeredPanel) return;
    const src = sources[centeredPanel.srcIndex];
    if (!src?.tex) return;

    focusState.active = true;
    focusState.srcIndex = centeredPanel.srcIndex;
    const focusPoolIdx = centeredPanel.poolIdx;
    focusState.poolIdx = focusPoolIdx;
    target = centerForIndex(nearestIndex(scroll));

    const focusX = lastCenterX[focusPoolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.idx !== focusPoolIdx && o.x !== undefined)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => a.dist - b.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && o.dist - prevDist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    for (const key of LENS_FX_KEYS) {
      lensFxFull[key] = lensUniforms[key].value;
    }

    if (focusState.anim) focusState.anim.kill();
    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline();
    tl.to(
      focusState,
      { lensFx: 0, duration: FOCUS.lensFade, ease: "power3.out" },
      0,
    );
    tl.to(
      scaleProxy,
      {
        v: FOCUS.centerScale,
        duration: FOCUS.focusDuration,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        { [o.idx]: 1, duration: FOCUS.cardDuration, ease: FOCUS.cardEase },
        o.rank * FOCUS.stagger,
      );
    });
    focusState.anim = tl;
    setView(false);
    options.onFocusChange(true);
  }

  function closeFocus() {
    if (!focusState.active) return;
    if (focusState.anim) focusState.anim.kill();

    const focusX = lastCenterX[focusState.poolIdx] || 0;
    const others = pool
      .map((_, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x ?? 0) - focusX) }))
      .sort((a, b) => b.dist - a.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && prevDist - o.dist > 1) rank += 1;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    options.onFocusChange(false);
    const scaleProxy = { v: focusScale };
    const tl = gsap.timeline({
      onComplete: () => {
        focusState.active = false;
        focusState.srcIndex = -1;
        updateCursor();
      },
    });
    tl.to(
      focusState,
      { lensFx: 1, duration: FOCUS.lensFade * 0.8, ease: "power3.inOut" },
      0,
    );
    tl.to(
      scaleProxy,
      {
        v: 1,
        duration: FOCUS.focusDuration * 0.85,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = scaleProxy.v;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        {
          [o.idx]: 0,
          duration: FOCUS.cardDuration * 0.85,
          ease: FOCUS.cardEase,
        },
        o.rank * FOCUS.stagger * 0.7,
      );
    });
    focusState.anim = tl;
  }

  function playEntry() {
    if (!entryOn) {
      options.onEntryDone(true);
      return;
    }
    if (entryAnim) entryAnim.kill();
    for (let k = 0; k < pEntry.length; k++) pEntry[k] = 0;
    entryActive = true;
    entrySettled = false;
    options.onEntryDone(false);
    for (let k = 0; k < growArr.length; k++) growArr[k] = 0;
    focusState.lensFx = 0;
    target = centerForIndex(nearestIndex(scroll));
    scroll = target;
    velocity = 0;
    snapped = true;
    layout();
    const visible: number[] = [];
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] !== undefined) visible.push(k);
    }
    const tl = gsap.timeline({ delay: ENTRY.delay });
    const spread = ENTRY.stagger * Math.max(visible.length - 1, 1);
    let lastRiseEnd = 0;
    visible.forEach((idx) => {
      const at = Math.random() * spread;
      lastRiseEnd = Math.max(lastRiseEnd, at + ENTRY.riseDuration);
      tl.to(
        pEntry,
        { [idx]: 1, duration: ENTRY.riseDuration, ease: ENTRY.riseEase },
        at,
      );
    });
    tl.call(
      () => {
        entryActive = false;
        entrySettled = true;
      },
      [],
      lastRiseEnd,
    );
    const cSrcG = centerIndex(scroll);
    const Ng = sources.length;
    const midRepG = Math.floor(REPEATS / 2);
    const growList: { idx: number; rank: number }[] = [];
    let maxRank = 0;
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] === undefined) continue;
      if (Math.floor(k / Ng) !== midRepG) continue;
      let di = (k % Ng) - cSrcG;
      if (di > Ng / 2) di -= Ng;
      if (di < -Ng / 2) di += Ng;
      const r = Math.abs(di);
      maxRank = Math.max(maxRank, r);
      growList.push({ idx: k, rank: r });
    }
    const growRanked = growList.map((v) => ({
      idx: v.idx,
      rank: maxRank - v.rank,
    }));
    const growStart = lastRiseEnd + ENTRY.growDelay;
    let growEnd = growStart;
    tl.to(
      focusState,
      { lensFx: 1, duration: ENTRY.lensBloom, ease: ENTRY.lensBloomEase },
      growStart,
    );
    growRanked.forEach((o) => {
      const at = growStart + o.rank * ENTRY.growStagger;
      growEnd = Math.max(growEnd, at + ENTRY.growDuration);
      tl.to(
        growArr,
        { [o.idx]: 1, duration: ENTRY.growDuration, ease: ENTRY.growEase },
        at,
      );
    });
    tl.call(
      () => {
        entrySettled = false;
        for (let k = 0; k < growArr.length; k++) growArr[k] = 1;
        options.onEntryDone(true);
        updateCursor();
      },
      [],
      growEnd,
    );
    entryAnim = tl;
  }

  function step(direction: number) {
    if (inputLocked()) return;
    userInteracted = true;
    velocity = 0;
    pendingFocus = null;
    target = centerForIndex(nearestIndex(scroll) + direction);
    snapped = true;
    lastInput = performance.now();
  }

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("click", onClick);

  let raf = 0;
  let running = true;
  let visible = true;

  function tick() {
    if (!running) return;
    if (!visible || document.hidden) {
      raf = 0;
      return;
    }
    if (!dragging) {
      target += velocity;
      velocity *= FRICTION;
      if (Math.abs(velocity) < 0.05) velocity = 0;
      if (
        !snapped &&
        !focusState.active &&
        performance.now() - lastInput > SNAP_IDLE_MS
      ) {
        target = centerForIndex(nearestIndex(scroll));
        snapped = true;
      }
    }
    const follow =
      dragging && dragPointerType !== "mouse"
        ? TOUCH_EASE
        : snapped && !pendingFocus
          ? SNAP_EASE
          : EASE;
    scroll += (target - scroll) * follow;

    const ci = centerIndex(scroll);
    if (ci !== lastCenter) {
      lastCenter = ci;
      options.onActiveChange(ci);
    }

    const rawSpeed = scroll - prevScroll;
    prevScroll = scroll;
    const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, SHRINK_MAX));
    const k = norm > scrollEnergy ? SHRINK_ATTACK : SHRINK_DECAY;
    scrollEnergy += (norm - scrollEnergy) * k;

    layout();
    refreshHover();

    if (pendingFocus && !focusState.active) {
      if (Math.abs(target - scroll) < 0.5) {
        const pf = pendingFocus;
        pendingFocus = null;
        if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex) {
          openFocus();
        }
      }
    }

    lensUniforms.uCenter.value.set(LENS.posX, LENS.posY);
    lensUniforms.uAspect.value = W / H;
    lensUniforms.uTime.value = performance.now() * 0.001;
    const rad = (a: number) => (a * Math.PI) / 180;
    lensUniforms.uRotation.value =
      rad(LENS.rotation) + rad(LENS.spin) * (performance.now() * 0.001);
    const fx = focusState.lensFx;
    for (const key of LENS_FX_KEYS) {
      lensUniforms[key].value = lensFxFull[key] * fx;
    }

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(lensScene, lensCam);
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!running || raf) return;
    raf = requestAnimationFrame(tick);
  }

  startLoop();
  if (entryOn) playEntry();
  else options.onEntryDone(true);

  function onResize() {
    W = Math.max(1, mount.clientWidth);
    H = Math.max(1, mount.clientHeight);
    PANEL_H = panelHFor();
    recomputeTotal();
    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    rt.setSize(W * ratio, H * ratio);
    lensUniforms.uRes.value.set(W * ratio, H * ratio);
    if (!userInteracted) {
      scroll = centerForIndex(0);
      target = scroll;
    }
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(mount);
  const intersection = new IntersectionObserver(([entry]) => {
    const box = entry?.boundingClientRect;
    if (!box || (box.width === 0 && box.height === 0)) return;
    visible = entry?.isIntersecting ?? true;
    if (visible) startLoop();
  });
  intersection.observe(mount);
  const onVisibility = () => {
    if (!document.hidden) startLoop();
  };
  document.addEventListener("visibilitychange", onVisibility);

  function destroy() {
    running = false;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("click", onClick);
    if (focusState.anim) focusState.anim.kill();
    if (entryAnim) entryAnim.kill();
    if (cursorElement) gsap.killTweensOf(cursorElement);
    renderer.dispose();
    rt.dispose();
    lensQuad.geometry.dispose();
    lensMat.dispose();
    pool.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mat.dispose();
    });
    sources.forEach((s) => {
      s.tex?.dispose();
    });
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  return {
    closeFocus,
    next: () => step(1),
    previous: () => step(-1),
    destroy,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function LiquidGlassCarousel({
  items = liquidGlassCarouselDefaultItems,
  panelHeight = 550,
  gap = 24,
  background = "transparent",
  entry = true,
  className,
  style,
  onActiveChange,
  onFocusChange,
}: LiquidGlassCarouselProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidGlassCarouselHandle | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const revealPlayedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [entryDone, setEntryDone] = useState(!entry);
  const [failed, setFailed] = useState(false);
  const labelId = useId();
  const liveId = useId();
  const current = items[active] ?? items[0];
  const onActiveChangeRef = useRef(onActiveChange);
  const onFocusChangeRef = useRef(onFocusChange);
  onActiveChangeRef.current = onActiveChange;
  onFocusChangeRef.current = onFocusChange;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || items.length === 0) return;

    const engine = createCarousel(mount, cursorRef.current, {
      items,
      panelHeight,
      gap,
      background,
      entry,
      onActiveChange: (index) => {
        setActive(index);
        onActiveChangeRef.current?.(index);
      },
      onFocusChange: (open) => {
        setFocused(open);
        onFocusChangeRef.current?.(open);
      },
      onEntryDone: setEntryDone,
    });
    if (!engine) {
      setFailed(true);
      return;
    }
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [items, panelHeight, gap, background, entry]);

  useEffect(() => {
    const info = infoRef.current;
    const counter = counterRef.current;
    if (!info || !counter) return;
    const reduced = prefersReducedMotion();
    gsap.set(counter, { xPercent: -50 });

    if (!entryDone && entry && !reduced) {
      gsap.set(counter, { autoAlpha: 0 });
      revealPlayedRef.current = false;
      return;
    }

    if (entryDone && !focused && !revealPlayedRef.current) {
      revealPlayedRef.current = true;
      gsap.fromTo(
        counter,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: reduced ? 0 : 1.6,
          ease: "power2.out",
          delay: reduced ? 0 : 0.18,
        },
      );
      return;
    }

    if (focused) {
      gsap.to(counter, {
        autoAlpha: 0,
        duration: reduced ? 0 : 0.4,
        ease: "power3.out",
      });
    } else {
      gsap.to(counter, {
        autoAlpha: 1,
        duration: reduced ? 0 : 0.4,
        ease: "power3.out",
      });
    }
  }, [focused, entryDone, entry]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      engineRef.current?.next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      engineRef.current?.previous();
    } else if (event.key === "Escape") {
      event.preventDefault();
      engineRef.current?.closeFocus();
    }
  };

  return (
    <div
      className={cn(
        "relative h-[90vh] min-h-[700px] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onKeyDown={onKeyDown}
    >
      <p id={labelId} className="sr-only">
        Liquid glass project carousel
      </p>
      <p id={liveId} className="sr-only" aria-live="polite">
        {current?.title ?? ""}, {pad(active + 1)} of {pad(items.length)}
        {focused ? ", focused" : ""}
      </p>

      <WebGLErrorBoundary
        fallback={
          <WebGLFallback
            className="absolute inset-0"
            message="This carousel needs WebGL, which is unavailable in this browser."
          />
        }
      >
        {failed ? (
          <WebGLFallback
            className="absolute inset-0"
            message="This carousel needs WebGL, which is unavailable in this browser."
          />
        ) : (
          <div ref={mountRef} className="absolute inset-0" />
        )}
      </WebGLErrorBoundary>

      <div
        ref={infoRef}
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex flex-row items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12",
          "transition-all duration-500 ease-out",
          focused ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}
      >
        {/* LEFT: Title + Tech Stack - shifted left for breathing room */}
        <div className="flex-1 flex flex-col items-end text-right pr-8 sm:pr-12 md:pr-16 lg:pr-24 max-w-[600px] pointer-events-auto">
          <div className="flex items-center justify-end gap-3 text-[#ff8a3d] font-researcher text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black mb-2 md:mb-3">
              {current?.cat}
          </div>
          <div className="w-full flex justify-end">
            <Magnetic strength={0.2}>
              <TiltCard maxTilt={15} className="inline-block cursor-pointer">
                <h3 className="font-montserrat text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight text-black drop-shadow-sm break-words transition-colors duration-300 hover:text-[#ff8a3d] text-right">
                  {current?.title}
                </h3>
              </TiltCard>
            </Magnetic>
          </div>
          <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-end gap-x-2 md:gap-x-4 gap-y-2">
            {current?.tags?.map((tag) => (
              <span
                key={tag}
                className="font-syne text-[9px] md:text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a7f72]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CENTER SPACER: Keeps content safely clear of the centered project tile */}
        <div className="flex-shrink-0 w-[50vw] md:w-[54vw] lg:w-[56vw] max-w-[1040px] pointer-events-none" />

        {/* RIGHT SPACER: Symmetrically balances the layout */}
        <div className="flex-1 pointer-events-none" />

        {/* BOTTOM OF PROJECT: Description + Action Buttons */}
        <div className="absolute bottom-0 sm:bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-4 flex flex-col items-center justify-center text-center pointer-events-auto">
          <p className="font-syne text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] font-bold leading-[1.65] text-black drop-shadow-sm max-w-[620px]">
            {current?.desc}
          </p>
          <div className="mt-3 md:mt-4 flex items-center justify-center gap-3 md:gap-4 pointer-events-auto">
              {current?.github && (
                <Magnetic strength={0.35}>
                  <GlowButton
                    asChild
                    mode="rotate"
                    blur="soft"
                    glowScale={1.1}
                    colors={["#ff8a3d", "#3a322b", "#ffaf7a"]}
                    variant="unstyled"
                    className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/90 backdrop-blur-md text-[#f2ece1] transition-all duration-300 hover:scale-110 hover:bg-[#ff8a3d] hover:text-black border border-white/5 outline-none"
                  >
                    <a
                      href={current.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${current.title} source on GitHub`}
                    >
                      <Github className="h-4 w-4 md:h-5 md:w-5" />
                    </a>
                  </GlowButton>
                </Magnetic>
              )}
              {current?.link && (
                <Magnetic strength={0.35}>
                  <GlowButton
                    asChild
                    mode="rotate"
                    blur="soft"
                    glowScale={1.1}
                    colors={["#ff8a3d", "#3a322b", "#ffaf7a"]}
                    variant="unstyled"
                    className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/90 backdrop-blur-md text-[#f2ece1] transition-all duration-300 hover:scale-110 hover:bg-[#ff8a3d] hover:text-black border border-white/5 outline-none"
                  >
                    <a
                      href={current.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${current.title} live site`}
                    >
                      <Link2 className="h-4 w-4 md:h-5 md:w-5" />
                    </a>
                  </GlowButton>
                </Magnetic>
              )}
          </div>
        </div>
      </div>

      <div
        ref={counterRef}
        className={cn(
          "pointer-events-none absolute bottom-[6%] left-1/2 z-10 m-0 flex flex-col items-center justify-center text-center transition-opacity duration-300",
          focused ? "opacity-0" : "opacity-100"
        )}
      >
        <Magnetic strength={0.25}>
          <TiltCard maxTilt={18} className="pointer-events-auto mb-1 cursor-pointer inline-block">
            <span className="inline-block font-researcher text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-[#1a1612] [-webkit-text-stroke:0.5px_#1a1612] transition-colors duration-300 hover:text-[#ff8a3d] hover:[-webkit-text-stroke:0.5px_#ff8a3d]">
              {current?.title}
            </span>
          </TiltCard>
        </Magnetic>
        <span className="text-[13px] font-medium tabular-nums tracking-[-0.02em] text-[#a89c8d] sm:text-[15px]">
          {pad(active + 1)}/{pad(items.length)}
        </span>
      </div>

      <div
        ref={cursorRef}
        className="pointer-events-none absolute left-0 top-0 z-20 text-[11px] font-researcher uppercase tracking-[0.2em] font-bold text-[#ff8a3d]"
      >
        View
      </div>

      <button
        type="button"
        onClick={() => engineRef.current?.closeFocus()}
        aria-label="Close focused project"
        className="absolute right-[4%] top-[4.5%] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-[#f2ece1] transition-all duration-300 hover:bg-[#ff8a3d] hover:text-black border border-white/10"
        style={{
          opacity: focused ? 1 : 0,
          pointerEvents: focused ? "auto" : "none",
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default LiquidGlassCarousel;
