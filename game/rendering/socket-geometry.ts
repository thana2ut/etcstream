import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Shape, type BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SocketKind } from "../training/sim/model-geometry";

/** Local +Z points out of the panel. Visual shapes only: no electrical/profile/target metadata. */
export interface SocketSurface { color: string; geometry: BufferGeometry }
const CACHE = new Map<SocketKind, SocketSurface[]>();
const METAL = "#adb3bb", DARK = "#07090c", GOLD = "#b99b4f", PLASTIC = "#24282e";

export function socketSurfaces(kind: SocketKind): SocketSurface[] {
  const cached = CACHE.get(kind); if (cached) return cached;
  const groups = new Map<string, BufferGeometry[]>();
  const add = (g: BufferGeometry, c: string, x = 0, y = 0, z = 0) => {
    g.translate(x, y, z);
    // Extruded outlines are non-indexed; boxes/cylinders are indexed. Normalise before batching.
    const compatible = g.index ? g.toNonIndexed() : g;
    if (compatible !== g) g.dispose();
    groups.set(c, [...(groups.get(c) ?? []), compatible]);
  };
  const box = (w: number, h: number, d: number, c: string, x = 0, y = 0, z = d / 2) => add(new BoxGeometry(w, h, d), c, x, y, z);
  const disc = (r: number, d: number, c: string, x = 0, y = 0, z = d / 2) => {
    const g = new CylinderGeometry(r, r, d, r < 0.002 ? 10 : 24); g.rotateX(Math.PI / 2); add(g, c, x, y, z);
  };
  const polygon = (pts: [number, number][], c: string, d: number, z = 0) => {
    const s = new Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
    add(new ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 }), c, 0, 0, z);
  };
  const rect = (w: number, h: number, d = 0.0015) => { box(w, h, d, METAL); box(w * 0.82, h * 0.72, 0.0003, DARK, 0, 0, d + 0.00015); };
  const contacts = (count: number, width: number, y: number, z: number) => {
    for (let i = 0; i < count; i++) box(width / count * 0.48, 0.0004, 0.0002, GOLD, (i / Math.max(1, count - 1) - 0.5) * width, y, z);
  };
  switch (kind) {
    case "bnc":
      disc(0.0055, 0.006, METAL); disc(0.0039, 0.0003, DARK, 0, 0, 0.00615);
      disc(0.0028, 0.0003, "#e3dfce", 0, 0, 0.00635); disc(0.00095, 0.0003, GOLD, 0, 0, 0.00655);
      disc(0.00045, 0.0002, DARK, 0, 0, 0.00675); // female centre receptacle, never a male cable pin
      for (const x of [-0.0056, 0.0056]) box(0.002, 0.0015, 0.0017, METAL, x, 0, 0.003);
      break;
    case "hdmi": {
      const p: [number, number][] = [[-0.0075, 0.0032], [0.0075, 0.0032], [0.0075, -0.0008], [0.0057, -0.0032], [-0.0057, -0.0032], [-0.0075, -0.0008]];
      polygon(p, METAL, 0.0016); polygon(p.map(([x, y]) => [x * 0.83, y * 0.66]), DARK, 0.0002, 0.0017);
      box(0.0108, 0.00075, 0.0002, PLASTIC, 0, 0.0005, 0.002); contacts(10, 0.010, 0.0005, 0.0022); break;
    }
    case "rj45":
      rect(0.0158, 0.0135); box(0.006, 0.0025, 0.0003, DARK, 0, -0.0055, 0.0018); contacts(8, 0.010, 0.004, 0.00195);
      box(0.002, 0.0012, 0.0002, "#509450", -0.0057, 0.0055, 0.0019); box(0.002, 0.0012, 0.0002, "#be9c3b", 0.0057, 0.0055, 0.0019); break;
    case "usba": rect(0.0125, 0.005); box(0.010, 0.0011, 0.0003, "#25497a", 0, -0.001, 0.0019); contacts(4, 0.008, -0.0003, 0.0021); break;
    case "usbc": {
      const s = new Shape(), w = 0.009, h = 0.0034, r = h / 2;
      s.moveTo(-w / 2 + r, -r); s.lineTo(w / 2 - r, -r); s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-w / 2 + r, r); s.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5, false);
      add(new ExtrudeGeometry(s, { depth: 0.001, bevelEnabled: false, curveSegments: 8 }), METAL);
      box(0.007, 0.0019, 0.0002, DARK, 0, 0, 0.0012); box(0.0062, 0.00055, 0.00015, PLASTIC, 0, 0, 0.0014); break;
    }
    case "usbb":
      polygon([[-0.006, -0.0055], [0.006, -0.0055], [0.006, 0.003], [0.0038, 0.0055], [-0.0038, 0.0055], [-0.006, 0.003]], METAL, 0.0015);
      box(0.008, 0.007, 0.0002, DARK, 0, -0.0004, 0.0017); box(0.005, 0.0035, 0.0002, "#b7bdc4", 0, 0, 0.0019); break;
    case "xlr3f": case "xlr3m": case "xlr4": case "xlr5": {
      disc(0.011, 0.0035, METAL); disc(0.0088, 0.0003, PLASTIC, 0, 0, 0.0037);
      const count = kind === "xlr4" ? 4 : kind === "xlr5" ? 5 : 3;
      const xy: [number, number][] = count === 3 ? [[-0.0045, 0.0026], [0.0045, 0.0026], [0, -0.0051]] : Array.from({ length: count }, (_, i) => [Math.sin(i * Math.PI * 2 / count) * 0.0047, Math.cos(i * Math.PI * 2 / count) * 0.0047]);
      for (const [x, y] of xy) {
        if (kind === "xlr3m") disc(0.0008, 0.0035, GOLD, x, y, 0.0055);
        else { disc(0.00125, 0.0002, METAL, x, y, 0.004); disc(0.00085, 0.0002, DARK, x, y, 0.0042); }
      }
      box(0.003, 0.0014, 0.0003, DARK, 0, 0.008, 0.004); break;
    }
    case "db9": case "db25": {
      const w = kind === "db9" ? 0.031 : 0.053;
      polygon([[-w / 2, 0.006], [w / 2, 0.006], [w / 2 - 0.0025, -0.006], [-w / 2 + 0.0025, -0.006]], METAL, 0.002);
      box(w - 0.010, 0.008, 0.0003, PLASTIC, 0, 0, 0.0022);
      for (const x of [-w / 2 + 0.002, w / 2 - 0.002]) disc(0.0013, 0.002, METAL, x, 0, 0.003);
      const n = kind === "db9" ? 5 : 13;
      for (let row = 0; row < 2; row++) for (let i = 0; i < n - row; i++) disc(0.00045, 0.0002, GOLD, (i - (n - row - 1) / 2) * 0.0027, row ? -0.0015 : 0.0015, 0.0025);
      break;
    }
    case "iec":
      polygon([[-0.015, -0.0115], [0.015, -0.0115], [0.015, 0.005], [0.008, 0.0115], [-0.008, 0.0115], [-0.015, 0.005]], PLASTIC, 0.003);
      box(0.023, 0.014, 0.0003, DARK, 0, 0, 0.0032);
      for (const [x, y] of [[-0.006, -0.003], [0.006, -0.003], [0, 0.004]]) box(0.002, 0.001, 0.004, METAL, x, y, 0.005); break;
    case "smpte":
      disc(0.015, 0.012, METAL); disc(0.0105, 0.0003, PLASTIC, 0, 0, 0.0122);
      for (const [x, y] of [[-0.004, 0.003], [0.004, 0.003]]) { disc(0.002, 0.0003, "#d6cfb6", x, y, 0.0124); disc(0.0008, 0.0002, DARK, x, y, 0.0126); }
      for (const [x, y] of [[-0.004, -0.0035], [0.004, -0.0035], [-0.007, 0], [0.007, 0]]) disc(0.001, 0.0003, GOLD, x, y, 0.0124);
      break;
    case "mcx": disc(0.0018, 0.0025, GOLD); disc(0.0011, 0.0002, "#e4dfd0", 0, 0, 0.0027); disc(0.00035, 0.0002, DARK, 0, 0, 0.0029); break;
    case "trs": case "jack35": case "rca": case "dc": {
      const r = kind === "trs" ? 0.0065 : kind === "jack35" ? 0.0042 : kind === "rca" ? 0.0045 : 0.0054;
      const depth = kind === "rca" ? 0.006 : 0.002;
      disc(r, depth, METAL); disc(kind === "trs" ? 0.0032 : 0.0018, 0.0003, DARK, 0, 0, depth + 0.0002);
      if (kind === "dc") disc(0.0007, 0.001, METAL, 0, 0, depth + 0.0005); break;
    }
    case "sd": rect(0.025, 0.0028); break;
    case "sfp": rect(0.014, 0.0095, 0.003); break;
    case "multipin":
      // W1-style disconnect silhouette only. Unknown pinout stays a dark protective insert.
      disc(.019,.012,METAL);disc(.0155,.0004,DARK,0,0,.0123);box(.004,.003,.002,PLASTIC,0,.015,.0125);break;
    case "optical-lc":
      rect(.014,.0095,.003);
      for(const x of [-.0035,.0035]) {box(.0055,.006,.002,PLASTIC,x,0,.003);box(.0038,.004,.0003,DARK,x,0,.0052);}
      break;
  }
  const surfaces = [...groups].map(([color, geos]) => {
    const geometry = mergeGeometries(geos, false)!; geos.forEach((g) => g.dispose()); return { color, geometry };
  });
  CACHE.set(kind, surfaces); return surfaces;
}
