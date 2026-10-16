"use client";

import { SignalScreen } from "./signal-screen";
import { SCENE_CANVAS_FONT } from "@/game/rendering/scene-font";
import { useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BackSide, BufferGeometry, DoubleSide, Float32BufferAttribute, IcosahedronGeometry } from "three";
import { VenueLighting, BLACK_METAL, CHROME, ConeGeo, Cyl, g, Instanced, Lathe, merge, place, RB, Slab, STEEL, Tube, type Placement, type V3, type XZ } from "./kit";
import { tex } from "./textures";
import { LAYOUTS, VENUE_SCALE } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";

const THAI = SCENE_CANVAS_FONT;
const L = LAYOUTS.outdoor;
/** Control tent over the production desk (its legs are layout obstacles). */
// The field site is enlarged with its layout (VENUE_SCALE, a game-design choice); tent, stage dressing and props follow.
const K = VENUE_SCALE.outdoor, k = (v: number) => +(v * K).toFixed(3);
const STAGE = L.furniture.find((f) => f.kind === "stage")!;
const TENT = { x0: k(1.9), x1: k(6.1), z0: k(6.6), z1: k(10.9), eave: 2.6, peak: 3.6 };
const CROWD_RAILS: Placement[] = [-6.5, -4.6, 4.6, 6.5].map((x) => ({ p: [x, 0, 4.1] as V3 }));
const FIELD_FURNITURE = { ...L, furniture: L.furniture.filter((f) => f.kind !== "chairBlock") };

function skyTexture() {
  return tex.sign("sky", 32, 512, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#3d7fd1"); grd.addColorStop(0.42, "#86bdf0"); grd.addColorStop(0.5, "#d6ebfb"); grd.addColorStop(1, "#d6ebfb");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
  });
}
function bannerTexture() {
  return tex.sign("outdoor-led-waves", 1024, 512, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, w, h); sky.addColorStop(0, "#0c287d"); sky.addColorStop(1, "#167ccc");
    c.fillStyle = sky; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(0, h * (0.3 + i * 0.1));
      c.bezierCurveTo(w * 0.4, h * (1.0 + i * 0.04), w * 0.65, h * 0.4, w, h * (0.65 + i * 0.08));
      c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = ["#225bb5", "#2989d2", "#42a7e0", "#66c0ec"][i]; c.fill();
    }
  });
}
function facadeSign() {
  return tex.sign("facade-sign", 1024, 160, (c, w, h) => {
    c.fillStyle = "#f4efe6"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#7a2a20"; c.font = `bold 80px ${THAI}`; c.textAlign = "center"; c.fillText("Student Activity Centre", w / 2, 108);
  });
}

/** Leafy tree: tapering trunk, a few limbs, jittered foliage clumps. */
function useTree() {
  return useMemo(() => {
    const trunk = merge([
      g.lathe([[0.26, 0], [0.2, 0.25], [0.16, 1.2], [0.13, 2.2], [0.09, 2.8], [0, 2.9]], 12),
      g.tube([[0, 1.8, 0], [0.5, 2.5, 0.2], [0.9, 3.0, 0.3]], 0.07, false, true),
      g.tube([[0, 2.1, 0], [-0.6, 2.7, -0.1], [-1.0, 3.2, -0.3]], 0.06, false, true),
      g.tube([[0, 2.4, 0], [0.1, 3.0, -0.6], [0.2, 3.4, -0.9]], 0.05, false, true),
    ]);
    const clump = (r: number, seed: number) => {
      const ico = new IcosahedronGeometry(r, 2);
      const pos = ico.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const n = 1 + 0.18 * Math.sin(pos.getX(i) * 7 + seed) * Math.cos(pos.getZ(i) * 6 + seed * 2) + 0.08 * Math.sin(pos.getY(i) * 13);
        pos.setXYZ(i, pos.getX(i) * n, pos.getY(i) * n * 0.85, pos.getZ(i) * n);
      }
      ico.computeVertexNormals();
      return ico;
    };
    const leaves = merge([
      place(clump(1.3, 1), [0, 3.4, 0]), place(clump(0.95, 2), [0.95, 3.25, 0.3]), place(clump(0.9, 3), [-1.0, 3.4, -0.3]),
      place(clump(0.85, 4), [0.2, 4.1, -0.6]), place(clump(0.8, 5), [-0.3, 3.0, 0.8]),
    ]);
    const leaves2 = merge([place(clump(0.7, 6), [0.6, 4.0, 0.5]), place(clump(0.65, 7), [-0.7, 4.0, 0.4]), place(clump(0.6, 8), [0.2, 2.7, -0.9])]);
    return [
      { geo: trunk, mat: { map: tex.bark(), c: "#ffffff", r: 0.95 } },
      { geo: leaves, mat: { c: "#3f7a37", r: 0.85 } },
      { geo: leaves2, mat: { c: "#5a9a45", r: 0.85 } },
    ];
  }, []);
}

/** Steel crowd-control barrier: tube frame, vertical rods, flat feet. */
function useBarrier() {
  return useMemo(() => {
    const L = 1.85;
    const frame = merge([
      g.tube([[-L / 2, 0.12, 0], [-L / 2, 1.08, 0], [L / 2, 1.08, 0], [L / 2, 0.12, 0]], 0.019),
      g.tube([[-L / 2, 0.22, 0], [L / 2, 0.22, 0]], 0.014),
      ...Array.from({ length: 13 }, (_, i) => g.tube([[-L / 2 + 0.13 * (i + 1), 0.22, 0], [-L / 2 + 0.13 * (i + 1), 1.08, 0]], 0.007)),
    ]);
    const feet = merge([-1, 1].map((s) => place(g.rbox([0.06, 0.03, 0.62], 0.01), [s * (L / 2 - 0.05), 0.015, 0])));
    const legs = merge([-1, 1].flatMap((s) => [-1, 1].map((k) => g.tube([[s * L / 2, 0.14, 0], [s * (L / 2 - 0.05), 0.03, k * 0.28]], 0.011))));
    return [{ geo: frame, mat: { ...CHROME, c: "#cfd4da", r: 0.28 } }, { geo: feet, mat: { ...STEEL, c: "#6d737b" } }, { geo: legs, mat: { ...CHROME, c: "#cfd4da" } }];
  }, []);
}

function useCones() {
  return useMemo(() => [
    { geo: ConeGeo(), mat: { c: "#ff6a1a", r: 0.45 } },
    { geo: merge([place(g.cyl(0.115, 0.135, 0.09, 24, true), [0, 0.32, 0]), place(g.cyl(0.07, 0.085, 0.07, 24, true), [0, 0.53, 0])]), mat: { c: "#f4f4f4", r: 0.2, m: 0.3, side: DoubleSide } },
    { geo: place(g.rbox([0.38, 0.04, 0.38], 0.012), [0, 0.02, 0]), mat: { c: "#1b1b1b", r: 0.85 } },
  ], []);
}

/** Pop-up event canopy: square legs, scissor-truss eaves, pyramid roof with valance. */
function Canopy({ tent = TENT }: { tent?: typeof TENT }) {
  const { x0, x1, z0, z1, eave, peak } = tent;
  const poles: XZ[] = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  /** Four-sided pyramid roof built from explicit triangles (eave corners → peak), so it always sits flush on the frame. */
  const roof = useMemo(() => {
    const c: V3[] = [[x0 - 0.05, eave, z0 - 0.05], [x1 + 0.05, eave, z0 - 0.05], [x1 + 0.05, eave, z1 + 0.05], [x0 - 0.05, eave, z1 + 0.05]];
    const top: V3 = [cx, peak, cz];
    const pos: number[] = [], uv: number[] = [];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; pos.push(...a, ...top, ...b); uv.push(0, 0, 0.5, 1, 1, 0); }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  }, [cx, cz, eave, peak, x0, x1, z0, z1]);
  const canvas = tex.fabric("#f5f2ec", [6, 6]);
  const white = tex.fabric("#f5f2ec", [6, 6]);
  const edges: [V3, V3][] = [[[x0, eave, z0], [x1, eave, z0]], [[x1, eave, z0], [x1, eave, z1]], [[x1, eave, z1], [x0, eave, z1]], [[x0, eave, z1], [x0, eave, z0]]];
  return <group>
    {/* translucent canvas: a little emissive so the underside reads as sunlit fabric, not a dark slab */}
    <mesh geometry={roof} castShadow receiveShadow><meshStandardMaterial map={white} side={DoubleSide} roughness={0.9} emissive="#fff6ea" emissiveIntensity={0.35} /></mesh>
    {/* straight valance band on all four eaves */}
    {[[cx, z0 - 0.06, x1 - x0 + 0.22, 0], [cx, z1 + 0.06, x1 - x0 + 0.22, 0], [x0 - 0.06, cz, z1 - z0 + 0.22, 1], [x1 + 0.06, cz, z1 - z0 + 0.22, 1]].map(([a, b, len, side], i) =>
      <RB key={i} p={[a, eave - 0.14, b]} s={side ? [0.012, 0.3, len] : [len, 0.3, 0.012]} rad={0.004} map={canvas} c="#ffffff" r={0.85} />)}
    {/* legs with foot plates, sandbags and height pins */}
    {poles.map(([x, z]) => <group key={`${x}${z}`}>
      <RB p={[x, eave / 2, z]} s={[0.05, eave, 0.05]} rad={0.008} {...CHROME} c="#d9dce0" r={0.3} />
      <RB p={[x, 0.008, z]} s={[0.18, 0.016, 0.18]} rad={0.004} {...STEEL} />
      <RB p={[x + 0.16, 0.06, z]} s={[0.34, 0.12, 0.2]} rad={0.05} map={tex.fabric("#2d3a2c")} c="#ffffff" r={0.95} />
      <Cyl p={[x, 1.7, z + 0.03]} rt={0.006} h={0.06} rot={[Math.PI / 2, 0, 0]} c="#e23" />
    </group>)}
    {/* scissor truss under each eave */}
    {edges.map(([a, b], i) => {
      const n = 4;
      const pts: V3[][] = [];
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n;
        const p0: V3 = [a[0] + (b[0] - a[0]) * t0, eave, a[2] + (b[2] - a[2]) * t0];
        const p1: V3 = [a[0] + (b[0] - a[0]) * t1, eave, a[2] + (b[2] - a[2]) * t1];
        pts.push([p0, [p1[0], eave - 0.32, p1[2]]], [[p0[0], eave - 0.32, p0[2]], p1]);
      }
      return <group key={i}>
        <Tube pts={[a, b]} r={0.016} {...CHROME} c="#d9dce0" />
        {pts.map((seg, j) => <Tube key={j} pts={seg} r={0.01} {...CHROME} c="#d9dce0" />)}
      </group>;
    })}
    {/* roof rafters to the peak */}
    {poles.map(([x, z]) => <Tube key={`r${x}${z}`} pts={[[x + Math.sign(cx - x) * 0.05, eave - 0.03, z + Math.sign(cz - z) * 0.05], [cx, peak - 0.1, cz]]} r={0.012} {...CHROME} c="#d9dce0" />)}
  </group>;
}

/** Building behind the site: rendered facade, framed windows with sills, entrance canopy, parapet. */
function Building() {
  const z = k(-17);
  const render = tex.render("#e2d8c6");
  const glass = { c: "#6d93b6", m: 0.6, r: 0.08 };
  return <group>
    <Slab p={[0, 4.2, z]} s={[30, 8.4, 2]} map={render} c="#ffffff" r={0.85} />
    <RB p={[0, 8.55, z + 0.95]} s={[30.4, 0.35, 0.3]} rad={0.04} c="#efe7d9" />
    {[2.75, 5.5].map((y) => <RB key={y} p={[0, y, z + 1.05]} s={[30, 0.12, 0.18]} rad={0.03} c="#efe7d9" />)}
    {Array.from({ length: 3 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
      const x = -12.5 + c * 2.5, y = 1.5 + r * 2.75;
      if (r === 0 && Math.abs(x) < 2) return null;
      return <group key={`${r}${c}`} position={[x, y, z + 1.01]}>
        <RB p={[0, 0, 0]} s={[1.5, 1.55, 0.08]} rad={0.02} c="#f4f1ec" />
        <Slab p={[0, 0, 0.055]} s={[1.32, 1.37, 0.02]} {...glass} />
        <RB p={[0, 0, 0.09]} s={[0.04, 1.37, 0.03]} rad={0.01} c="#f4f1ec" />
        <RB p={[0, -0.84, 0.08]} s={[1.6, 0.06, 0.16]} rad={0.015} c="#cfc6b6" />
        {(r + c) % 4 === 0 && <RB p={[0.4, -0.5, 0.3]} s={[0.7, 0.45, 0.35]} rad={0.04} c="#f0f0ee" />}
      </group>;
    }))}
    {/* entrance: glass doors, canopy, steps, sign */}
    <Slab p={[0, 1.25, z + 1.02]} s={[3.2, 2.5, 0.04]} {...glass} />
    {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => <RB key={x} p={[x, 1.25, z + 1.06]} s={[0.06, 2.5, 0.05]} rad={0.012} {...BLACK_METAL} />)}
    <RB p={[0, 2.75, z + 1.9]} s={[4.6, 0.16, 1.9]} rad={0.04} c="#efe7d9" />
    {[-2, 2].map((x) => <Cyl key={x} p={[x, 1.35, z + 2.7]} rt={0.1} h={2.7} c="#efe7d9" />)}
    {[0, 1, 2].map((i) => <RB key={i} p={[0, 0.07 + i * 0.14, z + 3.2 - i * 0.32]} s={[5 - i * 0.3, 0.14, 0.34]} rad={0.02} map={tex.concrete()} c="#ffffff" />)}
    <Slab p={[0, 7.1, z + 1.06]} s={[8, 1.2, 0.04]} map={facadeSign()} c="#ffffff" />
    {/* hedges along the base */}
    {[-1, 1].map((s) => <group key={s}>
      <RB p={[s * 9, 0.32, z + 1.6]} s={[10, 0.64, 0.8]} rad={0.12} c="#3d7434" r={0.95} />
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[s * (4.4 + i * 0.68), 0.62 + (i % 3) * 0.04, z + 1.6 + ((i * 7) % 3 - 1) * 0.12]} castShadow><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color={i % 2 ? "#4a8a3e" : "#3f7a37"} roughness={0.95} flatShading /></mesh>)}
      <RB p={[s * 9, 0.05, z + 1.6]} s={[10.2, 0.1, 1.0]} rad={0.02} map={tex.concrete()} c="#ffffff" />
    </group>)}
  </group>;
}

/** Low rubber cable protector: black body and a broad yellow hinged lid. */
function CableRamp({ p, ry = 0, len = 1.8 }: { p: V3; ry?: number; len?: number }) {
  return <group position={p} rotation={[0, ry, 0]}>
    <RB p={[0, 0.025, 0]} s={[len, 0.05, 0.62]} rad={0.022} c="#202226" r={0.9} />
    <RB p={[0, 0.055, 0]} s={[len - 0.04, 0.015, 0.31]} rad={0.006} c="#e8b62b" r={0.75} />
    {Array.from({ length: Math.ceil(len / 0.18) }, (_, i) => <Slab key={i} p={[-len / 2 + 0.09 + i * 0.18, 0.065, 0]} s={[0.035, 0.003, 0.26]} c="#3a3430" />)}
  </group>;
}

/** Repeated white event chairs fit inside the existing chair-block colliders. */
function EventSeating() {
  const parts = useMemo(() => [
    { geo: merge([place(g.rbox([0.42, 0.045, 0.4], 0.012), [0, 0.46, 0]), place(g.rbox([0.42, 0.36, 0.04], 0.02), [0, 0.71, 0.18], [-0.1, 0, 0])]), mat: { c: "#eeeef0", r: 0.55 } },
    { geo: merge([-1, 1].flatMap((x) => [-1, 1].map((z) => place(g.cyl(0.012, 0.012, 0.45, 8), [x * 0.17, 0.225, z * 0.16])))), mat: CHROME },
  ], []);
  const at = useMemo<Placement[]>(() => L.furniture.filter((f) => f.kind === "chairBlock").flatMap((f) => [-1, 0, 1].map((v) => ({ p: [f.center[0] + v * 0.52, 0, f.center[2]] as V3 }))), []);
  return <Instanced parts={parts} at={at} />;
}

/** Box truss uses shared batched geometry for its chords and diagonal bracing. */
function Truss({ p, height = 6.2 }: { p: V3; height?: number }) {
  const parts = useMemo(() => [{ geo: merge([
    ...[-1, 1].flatMap((a) => [-1, 1].map((b) => g.tube([[a * 0.18, 0, b * 0.18], [a * 0.18, height, b * 0.18]], 0.025))),
    ...Array.from({ length: Math.ceil(height / 0.45) }, (_, i) => [-1, 1].flatMap((v) => [
      g.tube([[-0.18, i * 0.45, v * 0.18], [0.18, Math.min(height, (i + 1) * 0.45), v * 0.18]], 0.012),
      g.tube([[v * 0.18, i * 0.45, -0.18], [v * 0.18, Math.min(height, (i + 1) * 0.45), 0.18]], 0.012),
    ])).flat(),
  ]), mat: CHROME }], [height]);
  const at = useMemo<Placement[]>(() => [{ p }], [p]);
  return <Instanced parts={parts} at={at} />;
}

function StageRig() {
  const back = STAGE.center[2] - STAGE.size[2] / 2 + 0.2;
  const front = STAGE.center[2] + STAGE.size[2] / 2 - 0.2;
  const width = STAGE.size[0] - 0.4;
  return <>
    {[-1, 1].flatMap((v) => [back, front].map((z) => <Truss key={`${v}-${z}`} p={[v * width / 2, STAGE.size[1], z]} height={5.2} />))}
    {[back, front].map((z) => <group key={z} position={[-width / 2, 6.2, z]} rotation={[0, 0, -Math.PI / 2]}><Truss p={[0, 0, 0]} height={width} /></group>)}
    {[-1, 1].map((v) => <group key={v} position={[v * width / 2, 6.2, back]} rotation={[Math.PI / 2, 0, 0]}><Truss p={[0, 0, 0]} height={front - back} /></group>)}
    <Slab p={[0, 6.45, (front + back) / 2]} s={[width + 0.7, 0.09, front - back + 0.75]} map={tex.fabric("#e1e1dc")} r={0.8} />
    <RB p={[0, 3.6, back + 0.12]} s={[9.8, 4.0, 0.16]} rad={0.025} c="#131720" />
    <mesh position={[0, 3.6, back + 0.21]}><planeGeometry args={[9.6, 3.8]} /><meshBasicMaterial map={bannerTexture()} toneMapped={false} /></mesh>
    {[-1, 1].map((v) => <group key={`array-${v}`}>
      <Tube pts={[[v * (width / 2 - 0.65), 6.1, front], [v * (width / 2 - 0.65), 5.65, front]]} r={0.018} {...BLACK_METAL} />
      {Array.from({ length: 5 }, (_, i) => <RB key={i} p={[v * (width / 2 - 0.65), 5.45 - i * 0.36, front]} s={[0.75, 0.34, 0.52]} rot={[i * 0.025, 0, 0]} rad={0.015} map={tex.fabric("#1b1d22")} />)}
      <RB p={[v * (width / 2 - 0.6), 1.45, front - 0.25]} s={[1.0, 0.9, 0.75]} rad={0.025} c="#181a20" />
    </group>)}
    {[-5, -3, -1, 1, 3, 5].map((x) => <group key={x}>
      <Cyl p={[x, 5.88, front]} rt={0.11} h={0.3} rot={[0.7, 0, 0]} c="#15181d" />
      <Cyl p={[x, 5.75, front + 0.1]} rt={0.09} h={0.012} rot={[0.7, 0, 0]} c="#fff0d2" e="#ffe3aa" ei={1.5} />
      <RB p={[x, 1.18, front - 0.1]} s={[0.68, 0.32, 0.45]} rot={[-0.3, 0, 0]} rad={0.02} map={tex.fabric("#24262b")} />
    </group>)}
  </>;
}

function LampPost({ p }: { p: V3 }) {
  return <group position={p}>
    <Lathe p={[0, 0, 0]} prof={[[0.16, 0], [0.16, 0.06], [0.09, 0.12], [0.07, 0.6], [0.05, 4.2], [0, 4.2]]} c="#2d3136" m={0.6} r={0.4} />
    <Tube pts={[[0, 4.1, 0], [0.25, 4.35, 0], [0.7, 4.4, 0]]} r={0.035} c="#2d3136" m={0.6} />
    <RB p={[0.78, 4.36, 0]} s={[0.42, 0.08, 0.2]} rad={0.03} c="#2d3136" m={0.6} />
    <Slab p={[0.78, 4.315, 0]} s={[0.36, 0.01, 0.15]} c="#fff" e="#fff4d8" ei={0.6} />
  </group>;
}

export function Outdoor() {
  const tree = useTree();
  const barrier = useBarrier();
  const cones = useCones();
  const sky = skyTexture();
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const barriers = useMemo<Placement[]>(() => {
    const list: Placement[] = [];
    // Crowd barriers on the site edge, panels sized to fit each run; the service entrance (rear-left) stays open.
    const run = (from: number, to: number, at: (c: number) => V3, ry = 0) => {
      const len = to - from, n = Math.ceil(len / 1.95), step = len / n;
      for (let i = 0; i < n; i++) list.push({ p: at(from + step * (i + 0.5)), ry, s: step / 1.95 });
    };
    run(minZ, maxZ, (c) => [minX - 0.2, 0, c], Math.PI / 2);
    run(minZ, maxZ, (c) => [maxX + 0.2, 0, c], Math.PI / 2);
    run(minX, maxX, (c) => [c, 0, minZ - 0.2]);
    run(k(-8.6), maxX, (c) => [c, 0, maxZ + 0.2]);
    return list;
  }, [minX, maxX, minZ, maxZ]);
  const trees = useMemo<Placement[]>(() => [[-15, -4, 1.2], [-16, 5, 1], [15, -3, 1.3], [16, 6, 1], [-8, 15, 1.1], [6, 15.5, 1.2], [0, 18, 1.4], [-18, 12, 1.3], [17, 13, 1.1], [-15, -14, 1.2], [14, -15, 1.3]].map(([x, z, s], i) => ({ p: [k(x), 0, k(z)] as V3, s, ry: i * 1.3 })), []);
  const coneAt = useMemo<Placement[]>(() => [[-11.2, 11.0], [-9.0, 11.2], [-0.8, -6.2], [0.8, -6.2], [11.4, -9.4]].map(([x, z]) => ({ p: [k(x), 0, k(z)] as V3 })), []);
  return <>
    <color attach="background" args={["#a9d2f3"]} />
    <VenueLighting mood="day" intensity={0.55} />
    <fog attach="fog" args={["#cfe4f5", 30, 85]} />
    <mesh scale={46}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial map={sky} side={BackSide} fog={false} /></mesh>
    {[[-20, 18, -30, 3], [14, 22, -32, 2.4], [30, 16, 10, 2.8], [-30, 20, 15, 2.2]].map(([x, y, z, s], i) => <group key={i} position={[x, y, z]} scale={s}>
      {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.8], [-1.0, -0.25, 0, 0.75], [0.4, 0.4, -0.2, 0.7]].map(([a, b, c, r], k) => <mesh key={k} position={[a, b, c]}><sphereGeometry args={[r, 14, 10]} /><meshStandardMaterial color="#ffffff" roughness={1} fog={false} /></mesh>)}
    </group>)}
    <hemisphereLight args={["#dff0ff", "#9a968a", 0.69]} />
    <directionalLight position={[8, 12, 6]} intensity={2.4} color="#fff2d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-normalBias={0.03} />

    {/* ground: lawn, paved plaza with kerb */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[120, 120]} /><meshStandardMaterial map={tex.grass([40, 40])} roughness={1} /></mesh>
    <Slab p={[(minX + maxX) / 2, -0.04, (minZ + maxZ) / 2]} s={[maxX - minX + 1.2, 0.1, maxZ - minZ + 1.2]} map={tex.paving([(maxX - minX) / 2, (maxZ - minZ) / 2])} c="#ffffff" r={0.92} />
    {/* service road at the entrance */}
    <Slab p={[k(-10.3), -0.035, k(15)]} s={[4, 0.1, 6]} map={tex.concrete([2, 3])} c="#ffffff" r={0.95} />

    <Canopy />
    <Building />
    <Instanced parts={tree} at={trees} />
    <Instanced parts={barrier} at={barriers} />
    <Instanced parts={cones} at={coneAt} />
    {[[minX - 1.5, -6], [maxX + 1.5, -6], [minX - 1.5, 6], [maxX + 1.5, 6]].map(([x, z]) => <LampPost key={`${x}${z}`} p={[x, 0, z]} />)}

    {/* Rails leave the centre route and both camera/service aisles open. */}
    <Instanced parts={barrier} at={CROWD_RAILS} />
    <RigidBody type="fixed" colliders={false}>
      {CROWD_RAILS.map(({ p }, i) => <CuboidCollider key={i} position={[p[0], 0.55, p[2]]} args={[0.925, 0.55, 0.1]} />)}
    </RigidBody>
    {/* Raised monitor bridge keeps the original tabletop controls reachable. */}
    {[-1.25, 1.25].map((x) => <group key={`foh-monitor-${x}`} position={[L.work.center[0] + x, L.work.center[1], L.work.center[2] - 0.33]}>
      <RB p={[0, 0.08, 0]} s={[0.32, 0.035, 0.2]} rad={0.01} {...BLACK_METAL} />
      <RB p={[0, 0.3, -0.04]} s={[0.04, 0.44, 0.04]} rad={0.006} {...BLACK_METAL} />
      <RB p={[0, 0.63, -0.04]} s={[0.92, 0.54, 0.05]} rad={0.018} c="#15191f" />
      <group position={[0, 0.63, -0.011]}><SignalScreen device="monitor" width={0.85} height={0.47} title="FOH • SIM" /></group>
    </group>)}
    <StageRig />
    <EventSeating />
    {/* Side technical tents and delay towers are outside the walkable perimeter. */}
    {[-1, 1].map((v) => <group key={`technical-${v}`}>
      <Canopy tent={{ x0: v * 20 - 2.2, x1: v * 20 + 2.2, z0: -1, z1: 3.4, eave: 2.6, peak: 3.6 }} />
      <LayoutFurniture layout={{ ...L, furniture: [
        { id: "support-rack", kind: "rackCabinet", center: [v * 20, 0, 1], size: [0.7, 1.9, 0.7] },
        { id: "support-case", kind: "roadCase", center: [v * 20 + 1.1, 0, 1.3], size: [0.9, 0.8, 0.65] },
      ] }} />
      <Truss p={[v * 17.8, 0, -5.5]} height={7} />
      {Array.from({ length: 5 }, (_, i) => <RB key={i} p={[v * 17.8, 5.9 - i * 0.38, -5.1]} s={[0.8, 0.36, 0.55]} rad={0.015} map={tex.fabric("#1b1d22")} />)}
      <Slab p={[v * 17.8, 6.8, -5.1]} s={[1.3, 0.12, 0.18]} {...BLACK_METAL} />
      {[-0.45, 0, 0.45].map((x) => <Cyl key={x} p={[v * 17.8 + x, 6.55, -5.1]} rt={0.1} h={0.25} rot={[0.5, 0, 0]} c="#171a20" />)}
    </group>)}
    {/* Service cables hug the right perimeter; no raised prop crosses the centre aisle. */}
    {[0, 1, 2].map((i) => <Tube key={`service-cable-${i}`} pts={[[k(5.4), 0.015, k(10.6 + i * 0.05)], [k(11.3 + i * 0.05), 0.015, k(10.6 + i * 0.05)], [k(11.3 + i * 0.05), 0.015, k(-8.5)]]} r={0.012} c="#16181b" />)}

    {/* long cable runs follow the site edge; ramps where they cross walkways */}
    <RB p={[k(11.5), 0.025, k(0.6)]} s={[0.22, 0.05, k(19.0)]} rad={0.02} c="#24262b" />
    <RB p={[k(8.8), 0.025, k(9.9)]} s={[k(5.4), 0.05, 0.22]} rad={0.02} c="#24262b" />
    <CableRamp p={[0, 0, k(3.0)]} ry={0} len={3.2} />
    <CableRamp p={[k(11.5), 0, k(4.4)]} ry={Math.PI / 2} len={1.6} />
    {/* folding chairs and a cooler for the crew */}
    {[[2.6, 10.2, 0.4], [3.4, 10.3, -0.2]].map(([x, z, ry]) => <group key={x} position={[k(x), 0, k(z)]} rotation={[0, ry, 0]}>
      <RB p={[0, 0.45, 0]} s={[0.42, 0.03, 0.4]} rad={0.012} c="#2c3e63" />
      <RB p={[0, 0.78, 0.2]} rot={[-0.15, 0, 0]} s={[0.42, 0.3, 0.025]} rad={0.012} c="#2c3e63" />
      {[-1, 1].map((s) => <group key={s}>
        <Tube pts={[[s * 0.2, 0, -0.2], [s * 0.2, 0.45, 0.05], [s * 0.2, 0.95, 0.24]]} r={0.011} {...STEEL} />
        <Tube pts={[[s * 0.2, 0, 0.22], [s * 0.2, 0.45, -0.1]]} r={0.011} {...STEEL} />
      </group>)}
    </group>)}
    <group position={[k(4.4), 0, k(10.45)]}>
      <RB p={[0, 0.2, 0]} s={[0.6, 0.38, 0.38]} rad={0.05} c="#e7473c" />
      <RB p={[0, 0.41, 0]} s={[0.62, 0.06, 0.4]} rad={0.03} c="#f4f4f4" />
      <Tube pts={[[-0.22, 0.44, 0], [-0.2, 0.52, 0], [0.2, 0.52, 0], [0.22, 0.44, 0]]} r={0.012} c="#f4f4f4" />
    </group>

    <LayoutFurniture layout={FIELD_FURNITURE} look={{ top: "#32363d", frame: { ...STEEL, c: "#9aa0a6" }, caseColor: "#2b2f2a" }} />
    <LayoutColliders layout={L} />
  </>;
}
