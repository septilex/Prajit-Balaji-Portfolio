// ─── Dino / pet sprite preparation ────────────────────────────────────────────
// The raw sprite PNGs need a per-pixel clean-up pass (white → black outline
// fix, background removal, auto-cropping, slicing the pet strip into frames).
// That's ~2M pixels of work plus getImageData read-backs — enough to drop
// frames if it runs on the main thread while the intro is animating.
//
// So it runs in a Web Worker on an OffscreenCanvas while the intro plays, and
// the finished sprites come back as ImageBitmaps, ready to draw the instant the
// curtain lifts. Browsers without OffscreenCanvas fall back to the main thread
// (in idle time).
//
// NOTE: cleanDino / slicePets are stringified into the worker, so they must stay
// fully self-contained: no imports, no references to module-level values.

export type SpriteImage = HTMLCanvasElement | ImageBitmap;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type MakeCanvas = (w: number, h: number) => AnyCanvas;

/** Turns near-white pixels black and crops to the visible bounds. */
function cleanDino(src: CanvasImageSource & { width: number; height: number }, mk: MakeCanvas): AnyCanvas {
  const sw = src.width;
  const sh = src.height;
  const off = mk(sw, sh);
  const ctx = off.getContext("2d", { willReadFrequently: true }) as AnyCtx | null;
  if (!ctx) return off;
  ctx.drawImage(src, 0, 0);

  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;
  let minX = sw, minY = sh, maxX = 0, maxY = 0;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      if (data[i + 3] > 0) {
        const distToWhite = Math.abs(data[i] - 255) + Math.abs(data[i + 1] - 255) + Math.abs(data[i + 2] - 255);
        if (distToWhite < 40) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  if (maxX < minX || maxY < minY) return off;
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = mk(cropW, cropH);
  const cctx = cropped.getContext("2d") as AnyCtx | null;
  if (!cctx) return off;
  cctx.drawImage(off, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped;
}

/** Splits the pet strip into individual frames with the background keyed out. */
function slicePets(src: CanvasImageSource & { width: number; height: number }, mk: MakeCanvas): AnyCanvas[] {
  const sw = src.width || 600;
  const sh = src.height || 100;
  const off = mk(sw, sh);
  const ctx = off.getContext("2d", { willReadFrequently: true }) as AnyCtx | null;
  if (!ctx) return [];
  ctx.drawImage(src, 0, 0);

  const data = ctx.getImageData(0, 0, sw, sh).data;
  const bgR = data[0], bgG = data[1], bgB = data[2];

  const colHits: boolean[] = new Array(sw).fill(false);
  for (let x = 0; x < sw; x++) {
    for (let y = 0; y < sh; y++) {
      const i = (y * sw + x) * 4;
      const dist = Math.abs(data[i] - bgR) + Math.abs(data[i + 1] - bgG) + Math.abs(data[i + 2] - bgB);
      if (dist > 30) {
        colHits[x] = true;
        break;
      }
    }
  }

  const segments: { startX: number; endX: number }[] = [];
  let inSeg = false;
  let segStart = 0;
  let gapCount = 0;
  for (let x = 0; x < sw; x++) {
    if (colHits[x]) {
      if (!inSeg) { inSeg = true; segStart = x; }
      gapCount = 0;
    } else if (inSeg) {
      gapCount++;
      if (gapCount > 3) {
        segments.push({ startX: segStart, endX: x - gapCount });
        inSeg = false;
      }
    }
  }
  if (inSeg) segments.push({ startX: segStart, endX: sw - 1 });

  const frames: AnyCanvas[] = [];
  for (const seg of segments) {
    if (seg.endX - seg.startX <= sw * 0.02) continue;
    let minY = sh, maxY = 0;
    for (let x = seg.startX; x <= seg.endX; x++) {
      for (let y = 0; y < sh; y++) {
        const i = (y * sw + x) * 4;
        const dist = Math.abs(data[i] - bgR) + Math.abs(data[i + 1] - bgG) + Math.abs(data[i + 2] - bgB);
        if (dist > 30) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxY < minY) continue;

    const cropW = seg.endX - seg.startX + 1;
    const cropH = maxY - minY + 1;
    const f = mk(cropW, cropH);
    const fctx = f.getContext("2d", { willReadFrequently: true }) as AnyCtx | null;
    if (!fctx) continue;
    fctx.drawImage(src, seg.startX, minY, cropW, cropH, 0, 0, cropW, cropH);
    const fData = fctx.getImageData(0, 0, cropW, cropH);
    const fd = fData.data;
    for (let i = 0; i < fd.length; i += 4) {
      const dist = Math.abs(fd[i] - bgR) + Math.abs(fd[i + 1] - bgG) + Math.abs(fd[i + 2] - bgB);
      if (dist < 40) fd[i + 3] = 0;
    }
    fctx.putImageData(fData, 0, 0);
    frames.push(f);
  }
  return frames;
}

const WORKER_SOURCE = `
const cleanDino = ${cleanDino.toString()};
const slicePets = ${slicePets.toString()};
const mk = (w, h) => new OffscreenCanvas(w, h);
const load = async (url) => createImageBitmap(await (await fetch(url)).blob());
self.onmessage = async (e) => {
  try {
    const [d, p] = await Promise.all([load(e.data.dinoUrl), load(e.data.petUrl)]);
    const dino = cleanDino(d, mk).transferToImageBitmap();
    const pets = slicePets(p, mk).map((c) => c.transferToImageBitmap());
    self.postMessage({ dino, pets }, [dino, ...pets]);
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
`;

export interface DinoSprites {
  dino: SpriteImage | null;
  pets: SpriteImage[];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadOnMainThread(dinoUrl: string, petUrl: string): Promise<DinoSprites> {
  const [d, p] = await Promise.all([loadImage(dinoUrl), loadImage(petUrl)]);
  await new Promise<void>((r) =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(() => r(), { timeout: 300 })
      : setTimeout(r, 0)
  );
  const mk = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const src = (img: HTMLImageElement) =>
    Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight });
  return {
    dino: cleanDino(src(d), mk) as HTMLCanvasElement,
    pets: slicePets(src(p), mk) as HTMLCanvasElement[],
  };
}

/** Loads and prepares the dino + pet sprites, off the main thread when possible. */
export function loadDinoSprites(
  dinoPath: string,
  petPath: string
): { promise: Promise<DinoSprites>; cancel: () => void } {
  const dinoUrl = new URL(dinoPath, window.location.href).href;
  const petUrl = new URL(petPath, window.location.href).href;

  const canUseWorker =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap === "function";

  if (!canUseWorker) {
    return { promise: loadOnMainThread(dinoUrl, petUrl), cancel: () => {} };
  }

  let worker: Worker | null = null;
  let blobUrl: string | null = null;
  const cleanup = () => {
    worker?.terminate();
    worker = null;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  };

  const promise = new Promise<DinoSprites>((resolve, reject) => {
    try {
      blobUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
      worker = new Worker(blobUrl);
    } catch {
      cleanup();
      loadOnMainThread(dinoUrl, petUrl).then(resolve, reject);
      return;
    }
    worker.onmessage = (e: MessageEvent<{ dino?: ImageBitmap; pets?: ImageBitmap[]; error?: string }>) => {
      cleanup();
      if (e.data.error || !e.data.dino) {
        // e.g. OffscreenCanvas 2D unsupported in workers — do it on the main thread
        loadOnMainThread(dinoUrl, petUrl).then(resolve, reject);
      } else {
        resolve({ dino: e.data.dino, pets: e.data.pets ?? [] });
      }
    };
    worker.onerror = () => {
      cleanup();
      loadOnMainThread(dinoUrl, petUrl).then(resolve, reject);
    };
    worker.postMessage({ dinoUrl, petUrl });
  });

  return { promise, cancel: cleanup };
}
