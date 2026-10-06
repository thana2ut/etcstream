import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

/** Procedural canvas textures, generated once per key on the client and shared by every venue. */
const cache = new Map<string, Texture>();

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function make(key: string, size: [number, number], draw: (g: CanvasRenderingContext2D, w: number, h: number, r: () => number) => void, repeat: [number, number] = [1, 1], color = true): Texture | null {
  if (typeof document === "undefined") return null;
  const id = `${key}|${repeat.join("x")}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const c = document.createElement("canvas");
  [c.width, c.height] = size;
  const g = c.getContext("2d");
  if (!g) return null;
  draw(g, c.width, c.height, rng(key.length * 7919 + key.charCodeAt(0)));
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  if (color) t.colorSpace = SRGBColorSpace;
  cache.set(id, t);
  return t;
}

function speckle(g: CanvasRenderingContext2D, w: number, h: number, r: () => number, n: number, alpha: number, light = "255,255,255", dark = "0,0,0") {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? light : dark},${alpha * r()})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

export const tex = {
  /** Planked or veneer wood with grain lines. */
  wood: (base = "#a87a4c", repeat: [number, number] = [1, 1]) => make(`wood${base}`, [512, 512], (g, w, h, r) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const y = r() * h;
      g.strokeStyle = `rgba(${r() > 0.5 ? "60,35,15" : "255,230,190"},${0.05 + r() * 0.12})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + i) * (3 + r() * 6));
      g.stroke();
    }
    for (let k = 0; k < 5; k++) {
      const x = r() * w, y = r() * h;
      g.strokeStyle = "rgba(70,40,20,.18)";
      for (let j = 1; j < 6; j++) { g.beginPath(); g.ellipse(x, y, j * 6, j * 2.2, 0, 0, Math.PI * 2); g.stroke(); }
    }
  }, repeat),
  /** Woven fabric: tablecloth, chair covers, curtains, tent canvas. */
  fabric: (base = "#f4f2ee", repeat: [number, number] = [4, 4]) => make(`fabric${base}`, [256, 256], (g, w, h, r) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.025 + r() * 0.025})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.03})`; g.fillRect(x, 0, 1, h); }
    speckle(g, w, h, r, 900, 0.06);
  }, repeat),
  /** Smooth wall paint with faint roller texture. */
  paint: (base = "#e8e0cf", repeat: [number, number] = [3, 2]) => make(`paint${base}`, [256, 256], (g, w, h, r) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 2500, 0.05);
  }, repeat),
  /** Vinyl/ceramic floor tiles with grout. */
  tiles: (base = "#d8d2c4", grout = "#a9a294", n = 4, repeat: [number, number] = [6, 5]) => make(`tiles${base}${n}`, [512, 512], (g, w, h, r) => {
    const s = w / n;
    g.fillStyle = grout; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = (r() - 0.5) * 14;
      g.fillStyle = shade(base, v); g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
      for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(120,110,95,${r() * 0.12})`; g.beginPath(); g.arc(i * s + r() * s, j * s + r() * s, 1 + r() * 4, 0, 7); g.fill(); }
    }
  }, repeat),
  /** Hotel ballroom carpet: blue field with cream scroll pattern. */
  carpet: (repeat: [number, number] = [10, 10]) => make("carpet2", [512, 512], (g, w, h, r) => {
    g.fillStyle = "#284a86"; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 16000, 0.14, "120,160,220", "10,20,50");
    // damask-style scrollwork: thin, low-contrast strokes so it reads as carpet, not graphics
    const scroll = (cx: number, cy: number, s: number) => {
      g.strokeStyle = "rgba(210,222,245,.45)"; g.lineWidth = 2;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, cy, s * (0.35 + i * 0.2), i * 1.7, i * 1.7 + 2.0); g.stroke(); }
      g.strokeStyle = "rgba(95,135,200,.6)"; g.lineWidth = 3;
      g.beginPath(); g.ellipse(cx, cy, s, s * 0.6, Math.PI / 4, 0, Math.PI * 2); g.stroke();
    };
    for (const [x, y] of [[128, 128], [384, 384], [384, 128], [128, 384]]) scroll(x, y, 70);
    g.strokeStyle = "rgba(160,190,235,.35)"; g.lineWidth = 2;
    for (const [x, y] of [[0, 0], [256, 256], [512, 0], [0, 512], [512, 512], [256, 0], [0, 256]]) { g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.stroke(); }
  }, repeat),
  /** Cork pinboard. */
  cork: () => make("cork", [256, 256], (g, w, h, r) => {
    g.fillStyle = "#b5865a"; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 6000, 0.35, "230,190,140", "80,50,25");
  }),
  /** Exterior concrete paving slabs. */
  paving: (repeat: [number, number] = [6, 5]) => make("paving", [512, 512], (g, w, h, r) => {
    g.fillStyle = "#8e8a82"; g.fillRect(0, 0, w, h);
    const s = w / 4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = shade("#9c978d", (r() - 0.5) * 18); g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
    }
    speckle(g, w, h, r, 14000, 0.18);
  }, repeat),
  grass: (repeat: [number, number] = [30, 30]) => make("grass", [256, 256], (g, w, h, r) => {
    g.fillStyle = "#5f9142"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      g.strokeStyle = `rgba(${r() > 0.5 ? "140,190,90" : "40,80,30"},${0.3 + r() * 0.4})`;
      const x = r() * w, y = r() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 5); g.stroke();
    }
  }, repeat),
  /** Mown pitch stripes are drawn by geometry; this adds blade noise. */
  turf: (repeat: [number, number] = [20, 20]) => make("turf", [256, 256], (g, w, h, r) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 9000, 0.25, "255,255,255", "60,90,60");
  }, repeat),
  concrete: (repeat: [number, number] = [4, 4]) => make("concrete", [256, 256], (g, w, h, r) => {
    g.fillStyle = "#9a9894"; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 8000, 0.2);
  }, repeat),
  /** Speaker grille: dark perforated metal. */
  grille: () => make("grille", [128, 128], (g, w, h) => {
    g.fillStyle = "#1a1b1e"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#050506";
    for (let y = 4; y < h; y += 8) for (let x = (y / 8) % 2 ? 8 : 4; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); }
  }, [3, 6]),
  /** Building facade render with joints. */
  render: (base = "#ddd3c2") => make(`render${base}`, [256, 256], (g, w, h, r) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    speckle(g, w, h, r, 4000, 0.1);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, h - 2, w, 2);
  }, [6, 4]),
  bark: () => make("bark", [128, 256], (g, w, h, r) => {
    g.fillStyle = "#5b402a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(${r() > 0.5 ? "30,20,10" : "120,90,60"},.5)`; g.lineWidth = 1 + r() * 3; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h / 3, x - 6, (2 * h) / 3, x + (r() - 0.5) * 10, h); g.stroke(); }
  }, [2, 2]),
  /** Generic sign/banner/screen with lines of text, drawn with the system font so Thai renders too. */
  sign: (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => make(`sign:${key}`, [w, h], (g, cw, ch) => draw(g, cw, ch)),
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
