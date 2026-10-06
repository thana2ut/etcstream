"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, CurvePath, LineCurve3, QuadraticBezierCurve3, CylinderGeometry, DoubleSide, Euler, InstancedMesh, LatheGeometry, Matrix4,
  Object3D, PlaneGeometry, Quaternion, SphereGeometry, TorusGeometry, TubeGeometry, Vector2, Vector3, type Material, type Texture,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { STUDIO } from "@/game/training/studio-room-layout";
import { tex } from "./textures";

export type V3 = [number, number, number];
export type XZ = [number, number];
export const FONT = "/fonts/geist-regular.ttf";
/** Footprint the procedural venues were designed around (the studio GLB room itself is larger). */
export const W = 11.5, D = 8.8, H = 3.2;
/** Floor light stands: in the back corners, clear of the round table, both side tables (and their cable rows) and the backdrop. */
export const LIGHT_SPOTS: [number, number, number][] = [[-3.5, 2.05, -2.75], [3.5, 2.05, -2.75]];

/* ───────── material shorthand ───────── */
export interface MatProps { c?: string; m?: number; r?: number; rough?: number; map?: Texture | null; e?: string; ei?: number; side?: typeof DoubleSide; transparent?: boolean; opacity?: number }
export function Mat({ c = "#ffffff", m = 0, r, rough, map, e, ei = 0, side, transparent, opacity }: MatProps) {
  return <meshStandardMaterial color={c} metalness={m} roughness={r ?? rough ?? 0.6} map={map ?? null} emissive={e ?? "#000000"} emissiveIntensity={ei} side={side} transparent={transparent} opacity={opacity} />;
}
/** Presets use `rough` (not `r`) so spreading them onto <Tube r=…>/<Ball r=…> never overrides the radius. */
export const CHROME: MatProps = { c: "#d9dde2", m: 0.95, rough: 0.18 };
export const STEEL: MatProps = { c: "#8d939b", m: 0.85, rough: 0.35 };
export const BLACK_METAL: MatProps = { c: "#1b1d21", m: 0.7, rough: 0.4 };
export const RUBBER: MatProps = { c: "#151515", m: 0, rough: 0.9 };

/* ───────── image-based lighting: chrome/steel/glass need something to reflect ───────── */
type Mood = "day" | "classroom" | "studio" | "ballroom" | "night";
const MOODS: Record<Mood, { base: string; panels: { c: string; i: number; p: V3; s: [number, number] }[] }> = {
  day: { base: "#6f8fae", panels: [{ c: "#ffffff", i: 1.1, p: [0, 8, 0], s: [20, 20] }, { c: "#cfe6ff", i: 0.6, p: [0, 2, -10], s: [30, 6] }, { c: "#7f9a62", i: 0.3, p: [0, -3, 0], s: [30, 30] }, { c: "#fff2d8", i: 1.2, p: [10, 4, 6], s: [8, 8] }] },
  classroom: { base: "#cfd3d6", panels: [{ c: "#ffffff", i: 2.5, p: [0, 4, 0], s: [8, 6] }, { c: "#e8f3ff", i: 2, p: [-8, 2, 0], s: [1, 8] }, { c: "#d8cfbf", i: 0.6, p: [0, -2, 0], s: [12, 12] }] },
  studio: { base: "#101114", panels: [{ c: "#fff2dc", i: 3, p: [-3, 5, 4], s: [3, 2] }, { c: "#e8f0ff", i: 2, p: [4, 5, 3], s: [3, 2] }, { c: "#5ccf6c", i: 0.8, p: [0, 2, -6], s: [9, 4] }, { c: "#2a5a8a", i: 0.6, p: [9, 3, 4], s: [1, 4] }] },
  ballroom: { base: "#efe6d6", panels: [{ c: "#fff1d6", i: 2.5, p: [0, 5, 0], s: [20, 16] }, { c: "#ffffff", i: 1.8, p: [0, 2.5, -9], s: [14, 3] }, { c: "#3a5a9a", i: 0.5, p: [0, -2, 0], s: [20, 20] }] },
  night: { base: "#0b1228", panels: [{ c: "#eef3ff", i: 4, p: [-12, 12, -8], s: [6, 3] }, { c: "#eef3ff", i: 4, p: [12, 12, -8], s: [6, 3] }, { c: "#eef3ff", i: 3, p: [0, 12, 20], s: [10, 3] }, { c: "#2f7a34", i: 0.6, p: [0, -2, 10], s: [40, 40] }] },
};
export function VenueLighting({ mood, intensity = 1 }: { mood: Mood; intensity?: number }) {
  const m = MOODS[mood];
  return <Environment resolution={128} frames={1} environmentIntensity={intensity}>
    <color attach="background" args={[m.base]} />
    {m.panels.map((q, i) => <Lightformer key={i} form="rect" color={q.c} intensity={q.i} position={q.p} scale={[q.s[0], q.s[1], 1]} target={[0, 1, 0]} />)}
  </Environment>;
}

/* ───────── rounded box (never a raw hard-edged cube) ───────── */
/** Shared rounded-box geometries: identical sizes reuse one GPU buffer instead of uploading thousands of copies. */
const RB_CACHE = new Map<string, RoundedBoxGeometry>();
function roundedGeo(s: V3, radius: number) {
  const key = `${s[0].toFixed(3)}|${s[1].toFixed(3)}|${s[2].toFixed(3)}|${radius.toFixed(4)}`;
  let geo = RB_CACHE.get(key);
  if (!geo) { geo = new RoundedBoxGeometry(s[0], s[1], s[2], Math.min(...s) < 0.05 ? 1 : 2, radius); RB_CACHE.set(key, geo); }
  return geo;
}
export function RB({ p, s, rot, rad, ...mat }: { p: V3; s: V3; rot?: V3; rad?: number } & MatProps) {
  const radius = rad ?? Math.min(0.03, Math.min(...s) * 0.3);
  return <mesh position={p} rotation={rot} geometry={roundedGeo(s, radius)} dispose={null} castShadow receiveShadow><Mat {...mat} /></mesh>;
}
/** Flat panel (walls, floors, ceilings) — big surfaces where rounding is invisible. */
export function Slab({ p, s, rot, ...mat }: { p: V3; s: V3; rot?: V3 } & MatProps) {
  return <mesh position={p} rotation={rot} receiveShadow castShadow><boxGeometry args={s} /><Mat {...mat} /></mesh>;
}
export function Cyl({ p, rt, rb, h, rot, seg = 32, open, ...mat }: { p: V3; rt: number; rb?: number; h: number; rot?: V3; seg?: number; open?: boolean } & MatProps) {
  return <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[rt, rb ?? rt, h, seg, 1, open]} /><Mat {...mat} /></mesh>;
}
export function Ball({ p, r: radius, sc, ...mat }: { p: V3; r: number; sc?: V3 } & MatProps) {
  return <mesh position={p} scale={sc} castShadow><sphereGeometry args={[radius, 24, 16]} /><Mat {...mat} /></mesh>;
}
/** Bent tube through points — chair frames, railings, stand legs. */
export function Tube({ pts, r: radius = 0.015, closed = false, smooth = false, ...mat }: { pts: V3[]; r?: number; closed?: boolean; smooth?: boolean } & MatProps) {
  const key = JSON.stringify(pts);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by value so inline point arrays don't rebuild geometry
  const geo = useMemo(() => tubeGeo(pts, radius, closed, smooth), [key, radius, closed, smooth]);
  return <mesh geometry={geo} castShadow receiveShadow><Mat {...mat} /></mesh>;
}
/** Revolved profile [radius, y][] — cones, bottles, lampshades, speaker cones. */
export function Lathe({ p, prof, rot, seg = 40, ...mat }: { p: V3; prof: [number, number][]; rot?: V3; seg?: number } & MatProps) {
  const key = JSON.stringify(prof);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by value
  const geo = useMemo(() => new LatheGeometry(prof.map(([x, y]) => new Vector2(x, y)), seg), [key, seg]);
  return <mesh position={p} rotation={rot} geometry={geo} castShadow receiveShadow><Mat {...mat} side={DoubleSide} /></mesh>;
}

/* ───────── geometry builders for merging/instancing ───────── */
/**
 * Tube along a polyline whose corners are rounded with a small fillet — straight runs stay straight
 * (frames, railings, legs). Pass `smooth` for organic curves (cables, branches) to use a Catmull-Rom spline.
 */
export function tubeGeo(pts: V3[], radius: number, closed = false, smooth = false) {
  const v = pts.map((q) => new Vector3(...q));
  if (smooth || v.length < 3) {
    const curve = v.length < 3 ? new LineCurve3(v[0], v[v.length - 1]) : new CatmullRomCurve3(v, closed, "centripetal");
    return new TubeGeometry(curve, Math.max(4, v.length * 12), radius, 10, closed);
  }
  const path = new CurvePath<Vector3>();
  let cursor = v[0].clone();
  for (let i = 1; i < v.length - 1; i++) {
    const a = v[i - 1], b = v[i], c = v[i + 1];
    const f = Math.min(0.06, a.distanceTo(b) * 0.45, b.distanceTo(c) * 0.45);
    const p1 = b.clone().add(a.clone().sub(b).normalize().multiplyScalar(f));
    const p2 = b.clone().add(c.clone().sub(b).normalize().multiplyScalar(f));
    if (cursor.distanceTo(p1) > 1e-4) path.add(new LineCurve3(cursor, p1));
    path.add(new QuadraticBezierCurve3(p1, b.clone(), p2));
    cursor = p2;
  }
  path.add(new LineCurve3(cursor, v[v.length - 1]));
  return new TubeGeometry(path as unknown as CatmullRomCurve3, Math.max(8, v.length * 10), radius, 10, closed);
}
export function place(geo: BufferGeometry, p: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], sc: V3 = [1, 1, 1]) {
  geo.applyMatrix4(new Matrix4().compose(new Vector3(...p), new Quaternion().setFromEuler(new Euler(...rot)), new Vector3(...sc)));
  return geo;
}
export const g = {
  rbox: (s: V3, rad = Math.min(0.03, Math.min(...s) * 0.3)) => new RoundedBoxGeometry(s[0], s[1], s[2], 3, rad),
  box: (s: V3) => new BoxGeometry(...s),
  cyl: (rt: number, rb: number, h: number, seg = 20, open = false) => new CylinderGeometry(rt, rb, h, seg, 1, open),
  sphere: (r: number, w = 16, h = 12) => new SphereGeometry(r, w, h),
  torus: (r: number, t: number) => new TorusGeometry(r, t, 8, 24),
  lathe: (prof: [number, number][], seg = 24) => new LatheGeometry(prof.map(([x, y]) => new Vector2(x, y)), seg),
  tube: tubeGeo,
  /** Draped fabric panel: a plane with vertical sine folds, swaying wider at the hem. */
  drape: (w: number, h: number, folds: number, depth: number) => {
    const geo = new PlaneGeometry(w, h, Math.max(24, folds * 8), 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const t = 0.6 + 0.4 * (0.5 - y / h);
      pos.setZ(i, Math.sin((x / w) * folds * Math.PI * 2) * depth * t);
    }
    geo.computeVertexNormals();
    return geo;
  },
};
/** Merge parts into one geometry (keeps only position/normal/uv so any primitive mixes). */
export function merge(parts: BufferGeometry[]) {
  const clean = parts.map((part) => {
    const gg = part.index ? part.toNonIndexed() : part;
    for (const k of Object.keys(gg.attributes)) if (!["position", "normal", "uv"].includes(k)) gg.deleteAttribute(k);
    return gg;
  });
  return mergeGeometries(clean, false) ?? new BufferGeometry();
}

/** Many copies of one merged prop: one draw call each for every material slot. */
export interface Placement { p: V3; ry?: number; s?: number }
export function Instanced({ parts, at }: { parts: { geo: BufferGeometry; mat: MatProps | Material }[]; at: Placement[] }) {
  return <>{parts.map((part, i) => <InstancedPart key={i} geo={part.geo} mat={part.mat} at={at} />)}</>;
}
function InstancedPart({ geo, mat, at }: { geo: BufferGeometry; mat: MatProps | Material; at: Placement[] }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const o = new Object3D();
    at.forEach(({ p, ry = 0, s = 1 }, i) => { o.position.set(...p); o.rotation.set(0, ry, 0); o.scale.setScalar(s); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [at]);
  const isMat = (mat as Material).isMaterial;
  return <instancedMesh ref={ref} args={[geo, isMat ? (mat as Material) : undefined, at.length]} castShadow receiveShadow frustumCulled={false}>
    {!isMat && <Mat {...(mat as MatProps)} />}
  </instancedMesh>;
}

/* ───────── shared gameplay furniture (fixed footprint: colliders/drop heights match the studio) ───────── */
export interface FurnitureStyle {
  top: string; edge: string; frame: MatProps; cloth?: string;
  /** Base of the round work table: cast pedestal, four tube legs, or a solid broadcast desk with an LED band. */
  round?: "pedestal" | "legs" | "anchor";
  /** What fills the two side work zones (same 0.78 m surface): folding tables, pushed-together desks, road cases or a rack desk. */
  sides?: "folding" | "desks" | "cases" | "racks";
  led?: string;
  /** Floor LED light stands (studio-style). Off where they would be out of place, e.g. a classroom. */
  lights?: boolean;
}
export function WorkFurniture({ style }: { style: FurnitureStyle }) {
  const [tx, , tz] = STUDIO.table;
  const R = STUDIO.tableRadius;
  const wood = tex.wood(style.top, [3, 3]);
  const clothTex = style.cloth ? tex.fabric(style.cloth, [8, 2]) : null;
  /** Bullnose edge profile for the round top (rim at y 0.70‒0.75). */
  const edge = useMemo<[number, number][]>(() => [[R - 0.04, 0.7], [R - 0.01, 0.705], [R, 0.725], [R - 0.01, 0.745], [R - 0.04, 0.75]], [R]);
  return <>
    {/* round conference table: veneer top, bullnose edge, apron, cast pedestal with four splayed feet */}
    <Cyl p={[tx, 0.725, tz]} rt={R - 0.03} h={0.05} seg={72} map={wood} c="#ffffff" r={0.38} />
    <Lathe p={[tx, 0, tz]} prof={edge} seg={72} c={style.edge} r={0.35} />
    {clothTex && <Lathe p={[tx, 0, tz]} prof={[[R + 0.005, 0.752], [R + 0.03, 0.73], [R + 0.05, 0.45], [R + 0.06, 0.05]]} seg={72} map={clothTex} c="#ffffff" r={0.9} />}
    {(style.round ?? "pedestal") === "pedestal" && <>
    <Cyl p={[tx, 0.66, tz]} rt={R * 0.82} h={0.08} seg={60} open {...style.frame} />
    <Lathe p={[tx, 0, tz]} prof={[[0.0, 0.66], [0.16, 0.66], [0.11, 0.6], [0.09, 0.2], [0.13, 0.12], [0.0, 0.12]]} {...style.frame} />
    {[0, 1, 2, 3].map((i) => {
      const a = i * Math.PI / 2 + Math.PI / 4;
      return <group key={i}>
        <Tube pts={[[tx, 0.13, tz], [tx + Math.cos(a) * 0.45, 0.08, tz + Math.sin(a) * 0.45], [tx + Math.cos(a) * 0.82, 0.04, tz + Math.sin(a) * 0.82]]} r={0.03} {...style.frame} />
        <Cyl p={[tx + Math.cos(a) * 0.82, 0.015, tz + Math.sin(a) * 0.82]} rt={0.045} h={0.03} {...RUBBER} />
      </group>;
    })}
    </>}
    {style.round === "legs" && <>
      <Cyl p={[tx, 0.68, tz]} rt={R * 0.9} h={0.04} seg={60} open {...style.frame} />
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; const lx = tx + Math.cos(a) * R * 0.78, lz = tz + Math.sin(a) * R * 0.78; return <group key={i}>
        <Tube pts={[[lx, 0.02, lz], [lx, 0.7, lz]]} r={0.022} {...style.frame} />
        <Cyl p={[lx, 0.012, lz]} rt={0.03} h={0.024} {...RUBBER} />
      </group>; })}
      <mesh position={[tx, 0.18, tz]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R * 0.78, 0.012, 8, 64]} /><Mat {...style.frame} /></mesh>
    </>}
    {style.round === "anchor" && <>
      <Lathe p={[tx, 0, tz]} seg={72} prof={[[R - 0.25, 0.0], [R - 0.12, 0.02], [R - 0.12, 0.66], [R - 0.05, 0.7], [R - 0.3, 0.7]]} c={style.edge} r={0.35} m={0.3} />
      <Lathe p={[tx, 0, tz]} seg={72} prof={[[R - 0.115, 0.3], [R - 0.11, 0.3], [R - 0.11, 0.36], [R - 0.115, 0.36]]} c={style.led ?? "#3a7bff"} e={style.led ?? "#3a7bff"} ei={2.2} />
      <Lathe p={[tx, 0, tz]} seg={72} prof={[[R - 0.13, 0.02], [R - 0.122, 0.02], [R - 0.122, 0.09], [R - 0.13, 0.09]]} c="#0c0d10" />
    </>}
    {(style.sides ?? "folding") === "folding" && <>
    {/* side folding tables: rounded laminate top, skirt/cloth, folding tube legs with cross brace */}
    {STUDIO.sideTables.map(([x, , z], i) => <group key={i}>
      <RB p={[x, 0.76, z]} s={[STUDIO.sideTableSize[0], 0.04, STUDIO.sideTableSize[2]]} rad={0.015} map={wood} c="#ffffff" r={0.4} />
      {clothTex
        ? <RB p={[x, 0.42, z]} s={[STUDIO.sideTableSize[0] + 0.02, 0.66, STUDIO.sideTableSize[2] + 0.02]} rad={0.012} map={clothTex} c="#ffffff" r={0.95} />
        : <RB p={[x, 0.71, z]} s={[STUDIO.sideTableSize[0] - 0.08, 0.06, STUDIO.sideTableSize[2] - 0.08]} rad={0.01} {...style.frame} />}
      {[-1, 1].map((b) => <group key={b}>
        <Tube pts={[[x - 0.6, 0.02, z + b * 2.35], [x - 0.6, 0.6, z + b * 2.3], [x - 0.5, 0.7, z + b * 2.25], [x + 0.5, 0.7, z + b * 2.25], [x + 0.6, 0.6, z + b * 2.3], [x + 0.6, 0.02, z + b * 2.35]]} r={0.016} {...style.frame} />
        <Tube pts={[[x - 0.6, 0.25, z + b * 2.34], [x + 0.6, 0.25, z + b * 2.34]]} r={0.01} {...style.frame} />
        {[-0.6, 0.6].map((dx) => <Cyl key={dx} p={[x + dx, 0.012, z + b * 2.35]} rt={0.022} h={0.024} {...RUBBER} />)}
      </group>)}
      <Tube pts={[[x, 0.25, z - 2.34], [x, 0.3, z], [x, 0.25, z + 2.34]]} r={0.012} {...style.frame} />
    </group>)}
    </>}
    {style.sides && style.sides !== "folding" && STUDIO.sideTables.map(([x, , z], i) => <SideZone key={i} kind={style.sides as "desks" | "cases" | "racks"} x={x} z={z} outward={i === 0 ? -1 : 1} wood={wood} frame={style.frame} />)}
    <AvCart p={[STUDIO.monitor[0], 0, STUDIO.monitor[2]]} frame={style.frame} />
    <PaSpeaker p={[STUDIO.speaker[0], 0, STUDIO.speaker[2]]} />
    {style.lights !== false && LIGHT_SPOTS.map(([x, y, z], i) => <LightStand key={i} p={[x, 0, z]} h={y} />)}
  </>;
}

/** Alternative side work zones. All keep the studio's top surface (0.78 m) over 1.4 × 5 m. */
function SideZone({ kind, x, z, outward, wood, frame }: { kind: "desks" | "cases" | "racks"; x: number; z: number; outward: number; wood: Texture | null; frame: MatProps }) {
  const [sw, , sd] = STUDIO.sideTableSize;
  const n = 3, seg = sd / n;
  if (kind === "desks") return <group>
    {Array.from({ length: n }, (_, k) => { const cz = z - sd / 2 + seg * (k + 0.5); return <group key={k}>
      <RB p={[x, 0.76, cz]} s={[sw, 0.035, seg - 0.02]} rad={0.012} map={wood} c="#ffffff" r={0.45} />
      <RB p={[x - outward * (sw / 2 - 0.05), 0.47, cz]} s={[0.02, 0.42, seg - 0.2]} rad={0.006} c="#7b8189" m={0.4} />
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => <group key={`${a}${b}`}>
        <RB p={[x + a * (sw / 2 - 0.05), 0.37, cz + b * (seg / 2 - 0.06)]} s={[0.035, 0.74, 0.035]} rad={0.008} {...frame} />
        <Cyl p={[x + a * (sw / 2 - 0.05), 0.008, cz + b * (seg / 2 - 0.06)]} rt={0.022} h={0.016} {...RUBBER} />
      </group>))}
      <RB p={[x, 0.62, cz]} s={[sw - 0.2, 0.012, seg - 0.25]} rad={0.004} c="#5c626a" m={0.4} />
    </group>; })}
  </group>;
  if (kind === "cases") {
    const tolex = tex.fabric("#202124", [2, 2]);
    return <group>
      {Array.from({ length: n }, (_, k) => { const cz = z - sd / 2 + seg * (k + 0.5); const h = 0.68; return <group key={k}>
        <RB p={[x, 0.1 + h / 2, cz]} s={[sw - 0.02, h, seg - 0.04]} rad={0.02} map={tolex} c="#ffffff" r={0.85} />
        <RB p={[x, 0.76, cz]} s={[sw, 0.04, seg - 0.02]} rad={0.012} map={wood} c="#c9c2b6" r={0.55} />
        {[0.1, 0.1 + h].map((y) => <RB key={y} p={[x, y, cz]} s={[sw + 0.004, 0.025, seg - 0.03]} rad={0.006} {...CHROME} c="#c4c8cc" />)}
        {[-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [0.1, 0.1 + h].map((y) => <Ball key={`${a}${b}${y}`} p={[x + a * (sw / 2 - 0.01), y, cz + b * (seg / 2 - 0.03)]} r={0.03} {...CHROME} />)))}
        {[-0.35, 0.35].map((dz) => <group key={dz} position={[x + outward * (sw / 2 + 0.005), 0.62, cz + dz]}><RB p={[0, 0, 0]} s={[0.02, 0.09, 0.07]} rad={0.006} {...CHROME} /><Cyl p={[outward * 0.012, -0.02, 0]} rt={0.012} h={0.02} rot={[0, 0, Math.PI / 2]} c="#999" m={0.9} /></group>)}
        <RB p={[x + outward * (sw / 2 + 0.01), 0.42, cz]} s={[0.02, 0.05, 0.22]} rad={0.01} c="#111" />
        {[-1, 1].flatMap((a) => [-1, 1].map((b) => <group key={`w${a}${b}`} position={[x + a * (sw / 2 - 0.12), 0.05, cz + b * (seg / 2 - 0.12)]}>
          <RB p={[0, 0.035, 0]} s={[0.1, 0.02, 0.1]} rad={0.004} {...STEEL} />
          <mesh position={[0, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.035, 16]} /><Mat {...RUBBER} /></mesh>
        </group>))}
      </group>; })}
    </group>;
  }
  // racks: continuous production desk, three 19" rack bays below with lit gear
  return <group>
    <RB p={[x, 0.76, z]} s={[sw, 0.04, sd]} rad={0.015} map={wood} c="#ffffff" r={0.45} />
    <RB p={[x, 0.735, z]} s={[sw - 0.02, 0.02, sd - 0.02]} rad={0.006} c="#0e0f12" />
    {Array.from({ length: n }, (_, k) => { const cz = z - sd / 2 + seg * (k + 0.5); return <group key={k}>
      <RB p={[x, 0.37, cz]} s={[sw - 0.1, 0.72, 0.56]} rad={0.012} c="#15171b" m={0.4} r={0.5} />
      {Array.from({ length: 5 }, (_, u) => <group key={u} position={[x + outward * (sw / 2 - 0.04), 0.12 + u * 0.12, cz]}>
        <RB p={[0, 0, 0]} s={[0.02, 0.085, 0.48]} rad={0.004} c={u % 2 ? "#2a2d33" : "#202227"} m={0.5} r={0.4} />
        {[0, 1, 2, 3].map((l) => <Ball key={l} p={[outward * 0.012, 0.015, -0.18 + l * 0.04]} r={0.005} c={["#38ff6a", "#38ff6a", "#ffb020", "#3a8bff"][(l + u) % 4]} e={["#38ff6a", "#38ff6a", "#ffb020", "#3a8bff"][(l + u) % 4]} ei={2.5} />)}
      </group>)}
    </group>; })}
    {[-1, 1].map((b) => <RB key={b} p={[x, 0.37, z + b * (sd / 2 - 0.03)]} s={[sw, 0.74, 0.04]} rad={0.012} {...frame} />)}
  </group>;
}

/** Rolling AV cart under the monitor: two shelves, round posts, swivel casters. */
export function AvCart({ p, frame }: { p: V3; frame: MatProps }) {
  const [x, , z] = p;
  return <group>
    {[0.82, 0.32].map((y) => <RB key={y} p={[x, y, z]} s={[0.62, 0.035, 0.5]} rad={0.012} c="#2a2d33" r={0.5} />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <group key={`${a}${b}`}>
      <Cyl p={[x + a * 0.28, 0.48, z + b * 0.22]} rt={0.014} h={0.74} {...frame} />
      <Cyl p={[x + a * 0.28, 0.06, z + b * 0.22]} rt={0.02} h={0.03} {...CHROME} />
      <mesh position={[x + a * 0.28, 0.035, z + b * 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow><torusGeometry args={[0.025, 0.012, 8, 16]} /><Mat {...RUBBER} /></mesh>
    </group>))}
    <Tube pts={[[x - 0.3, 0.9, z + 0.26], [x - 0.3, 0.95, z + 0.3], [x + 0.3, 0.95, z + 0.3], [x + 0.3, 0.9, z + 0.26]]} r={0.011} {...CHROME} />
    {/* power strip and coiled cable on the lower shelf */}
    <RB p={[x - 0.1, 0.36, z + 0.05]} s={[0.36, 0.04, 0.07]} rad={0.012} c="#e9e9e6" />
    <mesh position={[x + 0.15, 0.36, z - 0.05]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.012, 8, 28]} /><Mat c="#111" r={0.7} /></mesh>
  </group>;
}

/** Powered PA speaker on the floor: rounded cabinet, grille, woofer + horn, top handle, pole cup. */
export function PaSpeaker({ p }: { p: V3 }) {
  const [x, , z] = p;
  const grille = tex.grille();
  return <group position={[x, 0, z]}>
    <RB p={[0, 0.5, 0]} s={[0.48, 0.98, 0.44]} rad={0.05} c="#1d1e22" r={0.75} />
    <RB p={[0, 0.48, 0.215]} s={[0.42, 0.86, 0.02]} rad={0.008} map={grille} c="#ffffff" m={0.5} r={0.5} />
    <Lathe p={[0, 0.34, 0.2]} rot={[-Math.PI / 2, 0, 0]} prof={[[0.03, 0.02], [0.08, 0.0], [0.17, -0.04], [0.18, -0.045]]} c="#1a1a1c" r={0.8} />
    <RB p={[0, 0.76, 0.205]} s={[0.24, 0.12, 0.04]} rad={0.02} c="#0c0c0d" />
    <Tube pts={[[-0.1, 0.99, 0], [-0.08, 1.03, 0], [0.08, 1.03, 0], [0.1, 0.99, 0]]} r={0.014} {...BLACK_METAL} />
    <Cyl p={[0, 0.005, 0]} rt={0.2} h={0.01} {...RUBBER} />
    <Ball p={[0.17, 0.9, 0.222]} r={0.008} c="#3bff6a" e="#3bff6a" ei={2} />
  </group>;
}

/** Tripod light stand with an LED panel, yoke and barn doors. */
export function LightStand({ p, h }: { p: V3; h: number }) {
  const [x, , z] = p;
  const legs = [0, 1, 2].map((i) => i * (Math.PI * 2) / 3 + Math.PI / 6);
  return <group>
    {legs.map((a, i) => <Tube key={i} pts={[[x, 0.62, z], [x + Math.cos(a) * 0.42, 0.02, z + Math.sin(a) * 0.42]]} r={0.012} {...BLACK_METAL} />)}
    {legs.map((a, i) => <Tube key={`b${i}`} pts={[[x, 0.38, z], [x + Math.cos(a) * 0.2, 0.32, z + Math.sin(a) * 0.2]]} r={0.007} {...BLACK_METAL} />)}
    <Cyl p={[x, 0.75, z]} rt={0.02} h={0.3} {...BLACK_METAL} />
    <Cyl p={[x, (h + 0.6) / 2, z]} rt={0.013} h={h - 0.6} {...STEEL} />
    {[0.9, 1.5].map((y) => y < h && <Cyl key={y} p={[x, y, z]} rt={0.024} h={0.05} {...BLACK_METAL} />)}
    <Tube pts={[[x - 0.24, h - 0.02, z], [x - 0.24, h - 0.16, z], [x, h - 0.2, z], [x + 0.24, h - 0.16, z], [x + 0.24, h - 0.02, z]]} r={0.012} {...BLACK_METAL} />
    <RB p={[x, h, z]} s={[0.46, 0.34, 0.07]} rad={0.02} c="#24272c" m={0.4} r={0.4} />
    <RB p={[x, h, z + 0.037]} s={[0.4, 0.28, 0.01]} rad={0.004} c="#fff8e6" e="#fff3d6" ei={1.6} />
    {[[0, 0.19, -0.5], [0, -0.19, 0.5]].map(([, dy, rx], i) => <RB key={i} p={[x, h + dy, z + 0.09]} rot={[rx, 0, 0]} s={[0.44, 0.005, 0.12]} rad={0.002} {...BLACK_METAL} />)}
    <RB p={[x, h, z - 0.05]} s={[0.14, 0.1, 0.04]} rad={0.01} c="#111" />
  </group>;
}

/** Same walkable box as the studio: floor, four walls, backdrop and furniture colliders. */
export function Bounds({ extra, lights = true }: { extra?: ReactNode; lights?: boolean }) {
  return <RigidBody type="fixed" colliders={false}>
    <CuboidCollider position={[0, -0.08, 0]} args={[W / 2 + 0.1, 0.08, D / 2 + 0.1]} />
    {[-1, 1].map((side) => <group key={side}>
      <CuboidCollider position={[side * (W / 2 + 0.05), H / 2, 0]} args={[0.05, H / 2, D / 2]} />
      <CuboidCollider position={[0, H / 2, side * (D / 2 + 0.05)]} args={[W / 2, H / 2, 0.05]} />
    </group>)}
    <CuboidCollider position={[0, 1.45, -D / 2 + 0.2]} args={[W * 0.37, 1.45, 0.13]} />
    <CylinderCollider position={[STUDIO.table[0], 0.375, STUDIO.table[2]]} args={[0.375, STUDIO.tableRadius]} />
    {STUDIO.sideTables.map(([x, , z], i) => <CuboidCollider key={i} position={[x, 0.39, z]} args={[STUDIO.sideTableSize[0] / 2, 0.39, STUDIO.sideTableSize[2] / 2]} />)}
    <CuboidCollider position={[STUDIO.monitor[0], 0.72, STUDIO.monitor[2]]} args={[0.36, 0.72, 0.3]} />
    <CuboidCollider position={STUDIO.speaker} args={[0.25, 0.5, 0.23]} />
    {lights && LIGHT_SPOTS.map(([x, , z], i) => <CylinderCollider key={i} position={[x, 1, z]} args={[1, 0.3]} />)}
    {extra}
  </RigidBody>;
}

/** Shared small props. */
export function WaterBottleGeo() {
  return g.lathe([[0, 0], [0.033, 0], [0.035, 0.01], [0.035, 0.17], [0.03, 0.2], [0.014, 0.225], [0.014, 0.245], [0, 0.245]], 16);
}
export function ConeGeo() {
  return g.lathe([[0, 0.7], [0.03, 0.7], [0.035, 0.68], [0.16, 0.06], [0.17, 0.04], [0, 0.04]], 24);
}
