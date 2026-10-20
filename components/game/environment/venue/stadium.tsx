"use client";

import { SceneText as Text } from "@/components/game/scene-text";

import { DeviceVisual } from "../../equipment/device-visual";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf } from "@/game/training/hdmi-training";
import { MISSION_ROOMS as ROOMS } from "@/game/training/sim/rooms";
import { MODELS } from "@/game/training/sim/equipment";
import { SignalScreen } from "./signal-screen";
import { useMemo } from "react";
import { BackSide, BufferGeometry, DoubleSide, Float32BufferAttribute, Object3D } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { VenueLighting, Ball, BLACK_METAL, CHROME, Cyl, g, Instanced, Lathe, merge, place, RB, RUBBER, Slab, STEEL, Tube, type Placement, type V3, FONT } from "./kit";
import { tex } from "./textures";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { LAYOUTS, VENUE_SCALE } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";

/** Pitch: 90 m along X, 60 m along Z, its near touchline 7 m in front of the broadcast platform. */
// The broadcast compound is enlarged with its layout (VENUE_SCALE, a game-design choice); room shell and dressing follow.
const K = VENUE_SCALE.stadium, k = (v: number) => +(v * K).toFixed(3);
const PITCH = { x: 90, z: 60, near: k(15.5) };
const PCZ = PITCH.near + PITCH.z / 2;

/** Continuous stadium site: distant scenery must stand on ground, not the sky dome.
 * Dressing only; the existing playable bounds and all AV stations stay unchanged. */
function StadiumGround() {
  const serviceFront = PITCH.near - 3;
  const serviceBack = -15.5;
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 38]} receiveShadow>
      <planeGeometry args={[170, 160]} />
      <meshStandardMaterial map={tex.grass([65, 60])} color="#83977d" roughness={1} />
    </mesh>
    {/* One uninterrupted concourse under the near stand, truck and lighting towers. */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, (serviceBack + serviceFront) / 2]} receiveShadow>
      <planeGeometry args={[124, serviceFront - serviceBack]} />
      <meshStandardMaterial map={tex.concrete([62, 16])} color="#929797" roughness={0.94} />
    </mesh>
    {/* Paved service paths behind the goals and the far touchline. */}
    {[-1, 1].map(side => <mesh key={side} rotation={[-Math.PI / 2, 0, 0]} position={[side * 49, -0.004, PCZ]} receiveShadow>
      <planeGeometry args={[6, 76]} /><meshStandardMaterial map={tex.paving([3, 38])} color="#a2a6a3" roughness={0.95} />
    </mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, PITCH.near + PITCH.z + 3]} receiveShadow>
      <planeGeometry args={[104, 4]} /><meshStandardMaterial map={tex.paving([52, 2])} color="#a2a6a3" roughness={0.95} />
    </mesh>
    {/* Drainage strip and curb finish the near terrace instead of a floating blue edge. */}
    <Slab p={[0, -0.015, -15.38]} s={[64, 0.08, 0.3]} c="#929b9b" r={0.9} />
    <Slab p={[0, -0.001, -15.08]} s={[64, 0.025, 0.16]} c="#303a3d" r={0.8} />
    {Array.from({ length: 32 }, (_, i) => <Slab key={i} p={[-31 + i * 2, -0.009, -15.08]} s={[0.018, 0.025, 0.16]} c="#8b9698" r={0.8} />)}
    {/* Small foundations ground the existing masts without moving them. */}
    {FLOOD_POSITIONS.map(([x, , z]) =>
      <Slab key={`${x}-${z}`} p={[x, -0.09, z]} s={[3.8, 0.2, 3.8]} map={tex.concrete([2, 2])} c="#acb0ad" r={0.9} />)}
    {/* Painted bays under the OB truck: flat paint cannot obstruct the player. */}
    {[-1, 1].map(side => <Slab key={side} p={[k(18) + side * 2.2, -0.0005, k(3)]} s={[0.1, 0.006, 12]} c="#d4c7a0" r={1} />)}
  </>;
}

/** Neutral graphic perimeter boards, without branding or baked text. */
function adBoard(key: string, bg: string, fg: string) {
  return tex.sign(`stadium-board-${key}`, 512, 64, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg;
    for (let x = -h; x < w; x += 130) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 55, 0); c.lineTo(x + 90, 0); c.lineTo(x + 35, h); c.closePath(); c.fill(); }
  });
}
/** A single closed bowl encloses both the pitch and the existing technical apron.
 * Offset curves share the same corner centres, so seats, terraces and roof join exactly. */
const BOWL = { halfX: 51, near: -16, far: PITCH.near + PITCH.z + 6, radius: 12, rows: 14, rowDepth: 0.85, rise: 0.45, stations: 640 };
const FLOOD_POSITIONS: V3[] = [[-69, 0, -25], [69, 0, -25], [-69, 0, PITCH.near + PITCH.z + 17], [69, 0, PITCH.near + PITCH.z + 17]];

/** Clockwise in X/Z, returning an outward unit normal for every point of the loop. */
function bowlPoint(t: number, offset = 0) {
  const cx = BOWL.halfX - BOWL.radius, zn = BOWL.near + BOWL.radius, zf = BOWL.far - BOWL.radius;
  const across = 2 * cx, along = zf - zn, arc = Math.PI * BOWL.radius / 2;
  const lengths = [across, arc, along, arc, across, arc, along, arc];
  let distance = ((t % 1 + 1) % 1) * lengths.reduce((a, b) => a + b, 0), segment = 0;
  while (segment < 7 && distance >= lengths[segment]) distance -= lengths[segment++];
  const u = distance / lengths[segment];
  let x: number, z: number, nx: number, nz: number;
  if (segment === 0) { x = -cx + across * u; z = BOWL.near; nx = 0; nz = -1; }
  else if (segment === 2) { x = BOWL.halfX; z = zn + along * u; nx = 1; nz = 0; }
  else if (segment === 4) { x = cx - across * u; z = BOWL.far; nx = 0; nz = 1; }
  else if (segment === 6) { x = -BOWL.halfX; z = zf - along * u; nx = -1; nz = 0; }
  else {
    const corner = (segment - 1) / 2, angle = -Math.PI / 2 + corner * Math.PI / 2 + u * Math.PI / 2;
    nx = Math.cos(angle); nz = Math.sin(angle);
    x = (corner < 2 ? cx : -cx) + nx * BOWL.radius;
    z = (corner === 0 || corner === 3 ? zn : zf) + nz * BOWL.radius;
  }
  return { x: x + nx * offset, z: z + nz * offset, nx, nz, yaw: Math.atan2(nx, nz) };
}

/** Closed annular surface; equal offsets make a vertical wall, different heights a roof. */
function bowlBand(inner: number, outer: number, innerY: number, outerY: number) {
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], count = 256;
  for (let i = 0; i <= count; i++) {
    const a = bowlPoint(i / count, inner), b = bowlPoint(i / count, outer);
    positions.push(a.x, innerY, a.z, b.x, outerY, b.z);
    uv.push(i / count * 32, 0, i / count * 32, 1);
    if (i < count) { const j = i * 2; indices.push(j, j + 2, j + 3, j, j + 3, j + 1); }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function useStands() {
  return useMemo(() => {
    const seat = merge([
      place(new RoundedBoxGeometry(0.44, 0.06, 0.4, 1, 0.025), [0, 0.42, 0.02]),
      place(new RoundedBoxGeometry(0.44, 0.42, 0.05, 1, 0.025), [0, 0.66, 0.22], [-0.15, 0, 0]),
      place(g.cyl(0.03, 0.04, 0.38, 6), [0, 0.2, 0.1]),
    ]);
    const seats: Record<string, Placement[]> = { blue: [], red: [], white: [] }, stairEdges: Placement[] = [];
    const steps: BufferGeometry[] = [];
    for (let row = 0; row < BOWL.rows; row++) {
      const y = 1.2 + row * BOWL.rise, offset = row * BOWL.rowDepth;
      steps.push(bowlBand(offset - 0.42, offset + 0.43, y, y));
      steps.push(bowlBand(offset - 0.42, offset - 0.42, row === 0 ? 0 : y - BOWL.rise, y));
      for (let i = 0; i < BOWL.stations; i++) {
        const p = bowlPoint(i / BOWL.stations, offset);
        // Twenty radial stair aisles stay aligned across all fourteen rows.
        if (i % 32 < 3) {
          if (i % 32 === 1) stairEdges.push({ p: [p.x - p.nx * 0.39, y + 0.012, p.z - p.nz * 0.39], ry: p.yaw });
          continue;
        }
        const color = ["blue", "red", "white"][(Math.floor(i / 12) + Math.floor(row / 2)) % 3];
        seats[color].push({ p: [p.x, y, p.z], ry: p.yaw });
      }
    }
    const last = (BOWL.rows - 1) * BOWL.rowDepth, top = 1.2 + (BOWL.rows - 1) * BOWL.rise;
    steps.push(bowlBand(last + 0.43, last + 2.3, top, top)); // rear circulation concourse
    steps.push(bowlBand(last + 2.3, last + 2.3, 0, top + 1.2)); // enclosed rear structure
    const terraces = merge(steps);
    const roof = bowlBand(-1, last + 4.5, 10.5, 12.0);
    const fascia = bowlBand(last + 4.5, last + 4.5, 11.7, 12.0);
    const front = bowlBand(-0.55, -0.55, 0, 1.2);
    const rails: Placement[] = [], supports: Placement[] = [];
    for (let i = 0; i < 192; i++) {
      const p = bowlPoint(i / 192, -0.55); rails.push({ p: [p.x, 1.2, p.z], ry: p.yaw });
    }
    for (let i = 0; i < 32; i++) {
      const p = bowlPoint(i / 32); supports.push({ p: [p.x, 0, p.z], ry: p.yaw });
    }
    const frame = merge([
      place(g.cyl(0.16, 0.2, 11.8, 10), [0, 5.9, last + 3.6]),
      place(g.box([0.18, 0.24, last + 5.5]), [0, 11.1, (last + 3.5) / 2], [-Math.atan2(1.5, last + 5.5), 0, 0]),
      g.tube([[0, 7.5, last + 3.6], [0, 10.4, 1]], 0.07),
    ]);
    const rail = place(g.cyl(0.022, 0.022, 0.8, 6), [0, 0.4, 0]);
    const handrail = Array.from({ length: 97 }, (_, i): V3 => { const p = bowlPoint(i / 96, -0.55); return [p.x, 2.0, p.z]; });
    return { seat, seats, stairEdges, terraces, roof, fascia, front, frame, rail, rails, supports, handrail };
  }, []);
}

function Stands() {
  const bowl = useStands();
  const seatMat = { blue: { c: "#1d4fa0", r: 0.45 }, red: { c: "#c22a2a", r: 0.45 }, white: { c: "#e8e8e8", r: 0.45 } } as const;
  const edgeParts = useMemo(() => [{ geo: g.box([1.35, 0.015, 0.045]), mat: { c: "#c3b88b", r: 0.9 } }], []);
  return <>
    {(Object.keys(bowl.seats) as (keyof typeof seatMat)[]).map(color => <Instanced key={color} parts={[{ geo: bowl.seat, mat: seatMat[color] }]} at={bowl.seats[color]} />)}
    <mesh geometry={bowl.terraces} receiveShadow><meshStandardMaterial map={tex.concrete([4, 1])} color="#c1c4c2" roughness={0.95} side={DoubleSide} /></mesh>
    <mesh geometry={bowl.front} receiveShadow><meshStandardMaterial color="#263b51" roughness={0.85} side={DoubleSide} /></mesh>
    <mesh geometry={bowl.roof} receiveShadow><meshStandardMaterial color="#b6c1c7" metalness={0.25} roughness={0.55} side={DoubleSide} /></mesh>
    <mesh geometry={bowl.fascia}><meshStandardMaterial color="#526572" metalness={0.35} roughness={0.5} side={DoubleSide} /></mesh>
    <Instanced parts={edgeParts} at={bowl.stairEdges} />
    <Instanced parts={[{ geo: bowl.frame, mat: STEEL }]} at={bowl.supports} />
    <Instanced parts={[{ geo: bowl.rail, mat: CHROME }]} at={bowl.rails} />
    <Tube pts={bowl.handrail} r={0.025} {...CHROME} />
    {/* Continuous roof-edge lighting gives all four corners a finished stadium silhouette. */}
    {bowl.supports.map(({ p, ry }, i) => <group key={i} position={p} rotation={[0, ry ?? 0, 0]}>
      <Slab p={[0, 10.25, 0]} s={[2.2, 0.05, 0.22]} c="#ecf4fa" e="#e7f2ff" ei={1.2} />
    </group>)}
  </>;
}

/** Lattice floodlight mast with a lamp head. */
function Floodlight({ p }: { p: V3 }) {
  const [x, , z] = p;
  const H = 26;
  const r = 0.9;
  const corners: [number, number][] = [[-r, -r], [r, -r], [r, r], [-r, r]];
  const lamps = useMemo(() => {
    const list: Placement[] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) list.push({ p: [x - 2.5 + i * 1.0, H + 0.4 + j * 0.8, z] });
    return list;
  }, [x, z]);
  const lampParts = useMemo(() => [
    { geo: place(g.lathe([[0, 0.25], [0.32, 0.18], [0.38, -0.02], [0.36, -0.06]], 18), [0, 0, 0], [Math.PI / 2, 0, 0]), mat: { c: "#2a2d33", m: 0.7, r: 0.4 } },
    { geo: place(g.cyl(0.34, 0.34, 0.02, 18), [0, 0, -0.05], [Math.PI / 2, 0, 0]), mat: { c: "#ffffff", e: "#f4f8ff", ei: 3 } },
  ], []);
  const ry = Math.atan2(-x, PCZ - z) + Math.PI;
  return <group>
    {corners.map(([a, b], i) => <Tube key={i} pts={[[x + a * 1.6, 0, z + b * 1.6], [x + a, H, z + b]]} r={0.07} {...STEEL} />)}
    {Array.from({ length: 13 }, (_, k) => {
      const y0 = k * 2, y1 = y0 + 2, s0 = 1.6 - (0.6 * y0) / H, s1 = 1.6 - (0.6 * y1) / H;
      return corners.map(([a, b], i) => {
        const [c2, d2] = corners[(i + 1) % 4];
        return <Tube key={`${k}${i}`} pts={[[x + a * s0, y0, z + b * s0], [x + c2 * s1, y1, z + d2 * s1]]} r={0.03} {...STEEL} />;
      });
    })}
    <group rotation={[0, ry, 0]} position={[x, 0, z]}>
      <group position={[-x, 0, -z]}>
        <RB p={[x, H + 1.6, z + 0.25]} s={[6.4, 3.6, 0.2]} rad={0.05} {...BLACK_METAL} />
        <Instanced parts={lampParts} at={lamps} />
        <Tube pts={[[x - 3.2, H + 3.6, z], [x + 3.2, H + 3.6, z]]} r={0.04} {...STEEL} />
      </group>
    </group>
  </group>;
}

function Goal({ x, dir }: { x: number; dir: 1 | -1 }) {
  const net = useMemo(() => g.drape(7.32, 2.44, 18, 0.06), []);
  const netTex = tex.sign("net", 128, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 3;
    for (let i = 0; i <= w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
  });
  if (netTex) netTex.repeat.set(16, 6);
  return <group position={[x, 0, PCZ]} rotation={[0, dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
    <Tube pts={[[-3.66, 0, 0], [-3.66, 2.44, 0], [3.66, 2.44, 0], [3.66, 0, 0]]} r={0.06} c="#ffffff" />
    <Tube pts={[[-3.66, 2.44, 0], [-3.66, 1.8, -2], [-3.66, 0, -2]]} r={0.025} c="#ddd" />
    <Tube pts={[[3.66, 2.44, 0], [3.66, 1.8, -2], [3.66, 0, -2]]} r={0.025} c="#ddd" />
    <mesh geometry={net} position={[0, 1.22, -2]}><meshStandardMaterial map={netTex} transparent alphaTest={0.3} side={DoubleSide} /></mesh>
  </group>;
}

/** Pitch markings drawn as thin strips. */
function PitchLines() {
  const L = 0.12, y = 0.004;
  const { x: px, z: pz, near } = PITCH;
  const strip = (a: [number, number], b: [number, number], k: string) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return <mesh key={k} position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[-Math.PI / 2, 0, -Math.atan2(b[1] - a[1], b[0] - a[0])]}><planeGeometry args={[len, L]} /><meshBasicMaterial color="#f4f4f4" /></mesh>;
  };
  const z0 = near, z1 = near + pz, x0 = -px / 2, x1 = px / 2;
  const boxes = [-1, 1].flatMap((s) => [
    strip([s * x1, PCZ - 20], [s * (x1 - 16.5), PCZ - 20], `pa${s}`), strip([s * (x1 - 16.5), PCZ - 20], [s * (x1 - 16.5), PCZ + 20], `pb${s}`), strip([s * (x1 - 16.5), PCZ + 20], [s * x1, PCZ + 20], `pc${s}`),
    strip([s * x1, PCZ - 9], [s * (x1 - 5.5), PCZ - 9], `ga${s}`), strip([s * (x1 - 5.5), PCZ - 9], [s * (x1 - 5.5), PCZ + 9], `gb${s}`), strip([s * (x1 - 5.5), PCZ + 9], [s * x1, PCZ + 9], `gc${s}`),
  ]);
  return <>
    {strip([x0, z0], [x1, z0], "t1")}{strip([x0, z1], [x1, z1], "t2")}{strip([x0, z0], [x0, z1], "g1")}{strip([x1, z0], [x1, z1], "g2")}{strip([0, z0], [0, z1], "half")}
    {boxes}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, PCZ]}><ringGeometry args={[9.15 - L / 2, 9.15 + L / 2, 72]} /><meshBasicMaterial color="#f4f4f4" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, PCZ]}><circleGeometry args={[0.2, 16]} /><meshBasicMaterial color="#f4f4f4" /></mesh>
    {[-1, 1].map(side => <group key={`penalty-${side}`}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * (x1 - 11), y, PCZ]}><circleGeometry args={[0.11, 16]} /><meshBasicMaterial color="#f4f4f4" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * (x1 - 11), y, PCZ]}>
        <ringGeometry args={[9.15 - L / 2, 9.15 + L / 2, 48, 1, side < 0 ? -Math.acos(5.5 / 9.15) : Math.PI - Math.acos(5.5 / 9.15), 2 * Math.acos(5.5 / 9.15)]} />
        <meshBasicMaterial color="#f4f4f4" />
      </mesh>
    </group>)}
    {[[x0, z0, -Math.PI / 2], [x1, z0, Math.PI], [x0, z1, 0], [x1, z1, Math.PI / 2]].map(([x, z, start], i) => <mesh key={`corner-arc-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
      <ringGeometry args={[1 - L / 2, 1 + L / 2, 16, 1, start, Math.PI / 2]} /><meshBasicMaterial color="#f4f4f4" />
    </mesh>)}
    {[[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z], i) => <group key={i} position={[x, 0, z]}>
      <Cyl p={[0, 0.75, 0]} rt={0.015} h={1.5} c="#f2f2f2" />
      <mesh position={[0.18, 1.35, 0]}><planeGeometry args={[0.36, 0.26]} /><meshStandardMaterial color="#ffd400" side={DoubleSide} /></mesh>
    </group>)}
  </>;
}

/** Outside-broadcast truck: rounded box body, cab, windscreen, wheels with rims, roof dish. */
function ObVan({ p, ry = 0 }: { p: V3; ry?: number }) {
  return <group position={p} rotation={[0, ry, 0]}>
    <RB p={[0, 2.0, 0]} s={[2.5, 2.9, 8.2]} rad={0.18} c="#f2f3f5" m={0.25} r={0.35} />
    <RB p={[1.255, 2.1, -0.4]} s={[0.02, 0.9, 6]} rad={0.008} c="#c22a2a" />
    <RB p={[1.256, 1.65, -0.4]} s={[0.02, 0.12, 6]} rad={0.006} c="#1d4fa0" />
    <RB p={[0, 1.65, 5.0]} s={[2.4, 2.1, 1.9]} rad={0.25} c="#e9ebee" m={0.25} r={0.35} />
    <RB p={[0, 2.15, 5.93]} rot={[-0.15, 0, 0]} s={[2.1, 0.9, 0.04]} rad={0.05} c="#1a2633" m={0.6} r={0.08} />
    {[-1, 1].map((s) => <RB key={s} p={[s * 1.21, 2.1, 5.15]} s={[0.03, 0.6, 0.9]} rad={0.03} c="#1a2633" m={0.6} r={0.08} />)}
    <RB p={[0, 0.85, 5.96]} s={[2.3, 0.35, 0.08]} rad={0.04} {...BLACK_METAL} />
    {[-1, 1].map((s) => <Ball key={s} p={[s * 0.85, 1.05, 5.97]} r={0.1} sc={[1.3, 0.8, 0.4]} c="#fffbe0" e="#fff6c8" ei={1.5} />)}
    {[-3, -1.6, 4.8].flatMap((z) => [-1, 1].map((s) => <group key={`${z}${s}`} position={[s * 1.12, 0.52, z]} rotation={[0, 0, Math.PI / 2]}>
      <Cyl p={[0, 0, 0]} rt={0.52} h={0.36} {...RUBBER} />
      <Cyl p={[0, s * 0.185, 0]} rt={0.3} h={0.02} {...CHROME} />
      <Cyl p={[0, s * 0.19, 0]} rt={0.1} h={0.03} c="#444" m={0.8} />
    </group>))}
    {/* side door, steps, cable patch panel */}
    <RB p={[1.26, 1.8, 1.8]} s={[0.03, 2.1, 0.95]} rad={0.02} c="#e3e5e8" />
    <Tube pts={[[1.28, 1.6, 1.42], [1.28, 1.6, 1.52]]} r={0.015} {...CHROME} />
    {[0, 1, 2].map((i) => <RB key={i} p={[1.5 + i * 0.18, 0.2 + i * 0.22, 1.8]} s={[0.25, 0.04, 0.9]} rad={0.01} {...STEEL} />)}
    <RB p={[1.26, 1.0, -3.2]} s={[0.04, 0.6, 1.0]} rad={0.02} c="#30343b" />
    {Array.from({ length: 8 }, (_, i) => <Cyl key={i} p={[1.29, 1.1 - Math.floor(i / 4) * 0.22, -3.55 + (i % 4) * 0.23]} rot={[0, 0, Math.PI / 2]} rt={0.035} h={0.04} c="#c9a227" m={0.8} />)}
    {/* satellite dish on the roof */}
    <group position={[0, 3.55, -2.4]} rotation={[-0.75, 0.4, 0]}>
      <Lathe p={[0, 0, 0]} prof={[[0, 0], [0.3, 0.03], [0.6, 0.12], [0.85, 0.26], [0.88, 0.28]]} c="#f1f2f4" r={0.4} m={0.2} />
      <Tube pts={[[0.7, 0.24, 0], [0, 0.9, 0]]} r={0.015} {...STEEL} />
      <Tube pts={[[-0.7, 0.24, 0], [0, 0.9, 0]]} r={0.015} {...STEEL} />
      <Cyl p={[0, 0.92, 0]} rt={0.06} h={0.14} c="#333" />
    </group>
    <Cyl p={[0, 3.5, -2.4]} rt={0.12} h={0.25} {...STEEL} />
    {Array.from({ length: 4 }, (_, i) => <Tube key={i} pts={[[-1.1, 3.48, -3.9 + i * 2.6], [1.1, 3.48, -3.9 + i * 2.6]]} r={0.02} {...STEEL} />)}
  </group>;
}

/** Broadcast camera on a fluid head + tripod (large studio lens, viewfinder, pan bars). */
function BroadcastCamera({ p, ry = 0 }: { p: V3; ry?: number }) {
  return <group position={p} rotation={[0, ry, 0]}>
    {[0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return <Tube key={i} pts={[[0, 1.1, 0], [Math.cos(a) * 0.5, 0.02, Math.sin(a) * 0.5]]} r={0.022} {...BLACK_METAL} />; })}
    <Lathe p={[0, 1.08, 0]} prof={[[0, 0], [0.12, 0], [0.1, 0.12], [0, 0.12]]} {...BLACK_METAL} />
    <RB p={[0, 1.36, 0]} s={[0.24, 0.3, 0.46]} rad={0.04} c="#2a2d33" m={0.3} r={0.4} />
    <RB p={[0, 1.37, -0.38]} s={[0.22, 0.24, 0.42]} rad={0.04} c="#e8e9ea" r={0.35} />
    <Cyl p={[0, 1.37, -0.68]} rot={[Math.PI / 2, 0, 0]} rt={0.11} rb={0.1} h={0.2} {...BLACK_METAL} />
    <Cyl p={[0, 1.37, -0.785]} rot={[Math.PI / 2, 0, 0]} rt={0.09} h={0.01} c="#2a3a5a" m={0.9} r={0.05} />
    <RB p={[0.0, 1.6, 0.05]} s={[0.22, 0.16, 0.2]} rad={0.03} {...BLACK_METAL} />
    {[-1, 1].map((s) => <Tube key={s} pts={[[s * 0.08, 1.3, 0.2], [s * 0.18, 1.24, 0.55], [s * 0.2, 1.2, 0.7]]} r={0.016} {...STEEL} />)}
    <Ball p={[0.12, 1.55, -0.2]} r={0.012} c="#492a2a" />
  </group>;
}

/** Scaffold camera tower with handrail and stair. */
function CameraTower({ p }: { p: V3 }) {
  const [x, , z] = p;
  const h = 5;
  const posts: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  return <group>
    {posts.map(([a, b], i) => <Tube key={i} pts={[[x + a, 0, z + b], [x + a, h + 1, z + b]]} r={0.024} {...STEEL} />)}
    {[1, 2, 3, 4].flatMap((k) => posts.map(([a, b], i) => { const [c, d] = posts[(i + 1) % 4]; return <Tube key={`${k}${i}`} pts={[[x + a, k * (h / 4) - 1.2, z + b], [x + c, k * (h / 4), z + d]]} r={0.016} {...STEEL} />; }))}
    {[h, h + 1, h + 0.5].flatMap((y) => posts.map(([a, b], i) => { const [c, d] = posts[(i + 1) % 4]; return <Tube key={`r${y}${i}`} pts={[[x + a, y, z + b], [x + c, y, z + d]]} r={0.02} c={y > h ? "#f2c230" : "#8d939b"} m={0.6} />; }))}
    <RB p={[x, h, z]} s={[2.1, 0.06, 2.1]} rad={0.01} map={tex.wood("#8f7350", [2, 2])} c="#ffffff" />
    {posts.map(([a, b], i) => <RB key={`f${i}`} p={[x + a, 0.01, z + b]} s={[0.2, 0.02, 0.2]} rad={0.004} {...STEEL} />)}
    <BroadcastCamera p={[x, h + 0.03, z]} ry={Math.atan2(-x, PCZ - z) + Math.PI} />
  </group>;
}

function Scoreboard() {
  const z = PITCH.near + PITCH.z + 22;
  return <group position={[0, 0, z]}>
    {[-6, 6].map((x) => <Tube key={x} pts={[[x, 0, 0], [x, 13, 0]]} r={0.35} {...STEEL} />)}
    <RB p={[0, 16.5, 0]} s={[19.5, 8.2, 0.9]} rad={0.2} {...BLACK_METAL} />
    <group position={[0, 16.5, -0.46]} rotation={[0, Math.PI, 0]}><SignalScreen device="display" width={18.6} height={7.3} title="จอสนาม • สัญญาณจำลอง" /></group>
  </group>;
}

function StarSky() {
  const geo = useMemo(() => {
    const b = new BufferGeometry();
    const pts: number[] = [];
    let s = 7;
    for (let i = 0; i < 1500; i++) {
      s = (s * 16807) % 2147483647; const u = s / 2147483647;
      s = (s * 16807) % 2147483647; const v = s / 2147483647;
      const th = u * Math.PI * 2, ph = Math.acos(0.15 + 0.85 * v);
      pts.push(120 * Math.sin(ph) * Math.cos(th), 120 * Math.cos(ph), 120 * Math.sin(ph) * Math.sin(th));
    }
    b.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return b;
  }, []);
  const sky = tex.sign("night-sky", 32, 512, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "#02040c"); grd.addColorStop(0.45, "#0b1530"); grd.addColorStop(0.52, "#1d2b52"); grd.addColorStop(1, "#1d2b52");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
  });
  return <>
    {/* Stay inside the existing 140m camera far plane from every playable position. */}
    <mesh scale={110} renderOrder={-100}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial map={sky} side={BackSide} fog={false} depthWrite={false} /></mesh>
    <points geometry={geo}><pointsMaterial color="#ffffff" size={0.6} sizeAttenuation={false} fog={false} /></points>
  </>;
}

/** White tensioned canopy on the existing control-room perimeter. */
function ControlTentRoof({ x0, x1, z0, z1, h }: { x0: number; x1: number; z0: number; z1: number; h: number }) {
  const roof = useMemo(() => {
    const corners: V3[] = [[x0 - 0.2, h, z0 - 0.2], [x1 + 0.2, h, z0 - 0.2], [x1 + 0.2, h, z1 + 0.2], [x0 - 0.2, h, z1 + 0.2]];
    const top: V3 = [(x0 + x1) / 2, h + 1.8, (z0 + z1) / 2];
    const points: number[] = [], uv: number[] = [];
    for (let i = 0; i < 4; i++) { points.push(...corners[i], ...top, ...corners[(i + 1) % 4]); uv.push(0, 0, 0.5, 1, 1, 0); }
    const geo = new BufferGeometry(); geo.setAttribute("position", new Float32BufferAttribute(points, 3)); geo.setAttribute("uv", new Float32BufferAttribute(uv, 2)); geo.computeVertexNormals(); return geo;
  }, [x0, x1, z0, z1, h]);
  return <>
    <mesh geometry={roof}><meshStandardMaterial map={tex.fabric("#ecebe5", [5, 5])} side={DoubleSide} roughness={0.9} /></mesh>
    {[x0, x1].flatMap((x) => [z0, z1].map((z) => <group key={`${x}-${z}`}>
      <Tube pts={[[x, 0, z], [x, h, z], [(x0 + x1) / 2, h + 1.75, (z0 + z1) / 2]]} r={0.035} {...STEEL} />
    </group>))}
    {[z0, z1].map((z) => <Tube key={z} pts={[[x0, h, z], [x1, h, z]]} r={0.04} {...STEEL} />)}
    {[x0, x1].map((x) => <Tube key={x} pts={[[x, h, z0], [x, h, z1]]} r={0.04} {...STEEL} />)}
  </>;
}

function ControlMonitors() {
  const pgmInstalled = useTrainingStore((state) => scenarioOf(state).devices.some((d) => d.id === "pgm"));
  const wall = LAYOUTS.stadium.furniture.find((f) => f.kind === "controlWall")!;
  return <>
    <RB p={[wall.center[0], 1.7, wall.center[2]]} s={[wall.size[0] + 0.2, 3.35, 0.08]} rad={0.02} c="#11161e" />
    {([[-2.9, 2.8, 2.2, 1.0], [0, 2.8, 2.2, 1.0], [2.9, 2.8, 2.2, 1.0], [-3.1, 1.55, 2.0, 1.1], [3.1, 1.55, 2.0, 1.1]] as const).map(([x, y, w, h]) => <group key={`${x}-${y}`} position={[wall.center[0] + x, y, wall.center[2] + 0.2]}>
      <RB p={[0, 0, 0]} s={[w, h, 0.09]} rad={0.025} c="#10141b" />
      <group position={[0, 0, 0.051]}>{x > 0 && !pgmInstalled ? <Text font={FONT} fontSize={0.085} maxWidth={w - 0.2} textAlign="center" color="#b3c4d5">{"จอตรวจภาพออกอากาศ\nยังไม่ใช้ในระดับนี้"}</Text> : <SignalScreen device={x > 0 ? "pgm" : "monitor"} width={w - 0.12} height={h - 0.12} title={x > 0 ? "จอตรวจภาพออกอากาศ" : "จอรวมภาพ · ระบบจำลอง"} />}</group>
    </group>)}
    {[-5, -2.9, -0.8].map((z) => <group key={`operator-${z}`} position={[k(-7), 0, k(z) + 1.1]}>
      <RB p={[0, 0.47, 0]} s={[0.5, 0.08, 0.45]} rad={0.035} c="#21262e" />
      <RB p={[0, 0.85, 0.18]} s={[0.5, 0.64, 0.08]} rad={0.035} c="#21262e" />
      <Cyl p={[0, 0.23, 0]} rt={0.035} h={0.4} {...CHROME} />
      <RB p={[0, 0.04, 0]} s={[0.5, 0.04, 0.45]} rad={0.02} {...BLACK_METAL} />
    </group>)}
    <RigidBody type="fixed" colliders={false}>
      {[-5, -2.9, -0.8].map((z) => <CuboidCollider key={z} position={[k(-7), 0.6, k(z) + 1.1]} args={[0.25, 0.6, 0.25]} />)}
    </RigidBody>
  </>;
}

function CommentaryPosition() {
  const desk = LAYOUTS.stadium.furniture.find((f) => f.kind === "commentaryDesk")!;
  return <>
    {/* Plinth stays inside the desk collider so the unchanged tabletop ports remain reachable. */}
    <RB p={[desk.center[0], 0.08, desk.center[2]]} s={[desk.size[0], 0.16, desk.size[2]]} rad={0.02} c="#232831" />
    <Slab p={[desk.center[0], 0.16, desk.center[2] + desk.size[2] / 2 + 0.012]} s={[desk.size[0] - 0.1, 0.035, 0.012]} c="#fff1da" e="#ffe1b0" ei={1.5} />
    {[-0.9, 0, 0.9].map((x) => <group key={x} position={[desk.center[0] + x, 0, desk.center[2] - 0.85]}>
      <RB p={[0, 0.49, 0]} s={[0.48, 0.09, 0.46]} rad={0.035} c="#20252c" />
      <RB p={[0, 0.82, -0.2]} s={[0.48, 0.56, 0.08]} rad={0.035} c="#20252c" />
      <Cyl p={[0, 0.23, 0]} rt={0.035} h={0.4} {...CHROME} />
      <RB p={[0, 0.04, 0]} s={[0.48, 0.04, 0.42]} rad={0.02} {...BLACK_METAL} />
      <mesh position={[0, 0.8, 0.78]}><torusGeometry args={[0.085, 0.013, 8, 24, Math.PI]} /><meshStandardMaterial color="#161a20" /></mesh>
    </group>)}
    <RigidBody type="fixed" colliders={false}>
      {[-0.9, 0, 0.9].map((x) => <CuboidCollider key={x} position={[desk.center[0] + x, 0.6, desk.center[2] - 0.85]} args={[0.24, 0.6, 0.25]} />)}
    </RigidBody>
  </>;
}

function SidelineBarriers() {
  const parts = useMemo(() => [{ geo: merge([
    g.tube([[-0.95, 0.08, 0], [-0.95, 1.0, 0], [0.95, 1.0, 0], [0.95, 0.08, 0]], 0.022),
    g.tube([[-0.95, 0.18, 0], [0.95, 0.18, 0]], 0.017),
    ...Array.from({ length: 11 }, (_, i) => g.tube([[-0.8 + i * 0.16, 0.18, 0], [-0.8 + i * 0.16, 1.0, 0]], 0.009)),
    ...[-1, 1].map((v) => place(g.box([0.07, 0.03, 0.55]), [v * 0.86, 0.015, 0])),
  ]), mat: CHROME }], []);
  const at = useMemo<Placement[]>(() => {
    const { minX, maxX, maxZ } = LAYOUTS.stadium.bounds;
    return [
      ...Array.from({ length: 17 }, (_, i) => ({ p: [minX + 1 + i * 2, 0, maxZ + 0.18] as V3 })),
      ...[minX - 0.16, maxX + 0.16].flatMap((x) => [4, 6, 8, 10, 12, 14, 16].map((z) => ({ p: [x, 0, z] as V3, ry: Math.PI / 2 }))),
    ];
  }, []);
  return <Instanced parts={parts} at={at} />;
}

function SidelineDressing() {
  const L = LAYOUTS.stadium;
  const props = useMemo(() => ({ ...L, furniture: [
    { id: "sideline-case-a", kind: "roadCase" as const, center: [k(-10.5), 0, k(5.5)] as V3, size: [1.2, 0.8, 0.7] as V3 },
    { id: "sideline-case-b", kind: "roadCase" as const, center: [k(10.6), 0, k(3.2)] as V3, size: [1.2, 0.8, 0.7] as V3 },
    { id: "sideline-reel-a", kind: "cableReel" as const, center: [k(-8.8), 0, k(5.5)] as V3, size: [0.9, 0.85, 0.5] as V3 },
    { id: "sideline-reel-b", kind: "cableReel" as const, center: [k(10.5), 0, k(1.8)] as V3, size: [0.9, 0.85, 0.5] as V3 },
    { id: "sideline-power", kind: "powerCase" as const, center: [k(11.7), 0, k(3.2)] as V3, size: [0.65, 0.65, 0.45] as V3 },
  ] }), [L]);
  return <>
    <LayoutFurniture layout={props} />
    <RigidBody type="fixed" colliders={false}>
      {props.furniture.map((f) => <CuboidCollider key={f.id} position={[f.center[0], f.size[1] / 2, f.center[2]]} args={[f.size[0] / 2, f.size[1] / 2, f.size[2] / 2]} />)}
    </RigidBody>
    {[-7, 4].map((x) => <group key={`ramp-${x}`} position={[k(x), 0, k(11.3)]}>
      <RB p={[0, 0.024, 0]} s={[2.3, 0.048, 0.65]} rad={0.02} c="#202328" />
      <RB p={[0, 0.052, 0]} s={[2.25, 0.012, 0.33]} rad={0.004} c="#d8a82c" />
    </group>)}
    {[-6.5, 7.5].map((x) => <group key={`field-mic-${x}`} position={[k(x), 0, k(13.65)]}>
      <Tube pts={[[0, 0, 0], [0, 0.8, 0]]} r={0.015} {...BLACK_METAL} />
      <RB p={[0, 0.02, 0]} s={[0.4, 0.04, 0.35]} rad={0.015} {...BLACK_METAL} />
      <mesh position={[0, 0.84, 0]} scale={[0.65, 0.75, 1.8]}><sphereGeometry args={[0.13, 12, 8]} /><meshStandardMaterial map={tex.fabric("#8d8e8c")} roughness={0.95} /></mesh>
    </group>)}
    {[0, 1, 2, 3].map((i) => <Tube key={`floor-cable-${i}`} pts={[[k(-0.9 + i * 0.055), 0.014, k(-0.1)], [k(-0.9 + i * 0.055), 0.014, k(11.3 + i * 0.05)], [k(13.3), 0.014, k(11.3 + i * 0.05)]]} r={0.012} c="#13161b" />)}
  </>;
}

/** Render the installed kit in early lessons, without duplicating active or stored mission equipment. */
function InstalledStadiumEquipment() {
  const active = useTrainingStore((state) => `|${scenarioOf(state).devices.map((d) => d.id).join("|")}|`);
  const ids = ["cam1", "cam2", "cam3", "cam4", "mix", "sw", "gfx", "play", "pgm", "mic1", "mic2", "enc", "net", "wan", "rec"];
  return <>{ids.map((id) => {
    if (active.includes(`|${id}|`)) return null;
    const room = ROOMS.xl;
    const alias = room.places[id];
    const spot = typeof alias === "string" ? LAYOUTS.stadium.places[alias] : alias ? { ...alias, p: [k(alias.p[0]), alias.p[1], k(alias.p[2])] as V3 } : undefined;
    if (!spot) return null;
    const inst = room.instances[id], model = MODELS[inst.model];
    const size: V3 = ["enc", "net", "wan", "rec"].includes(id) ? [0.56, 1.7, 0.56] : [...model.size];
    return <group key={id} position={spot.p} rotation={[0, spot.yaw, 0]}>
      <DeviceVisual bare device={{ id, label: model.role === "display" ? `${inst.label} · Monitor` : inst.label, model: model.name,
        generic: model.generic, verified: !model.generic, kind: model.kind, size, position: spot.p, color: "#263345" }} />
    </group>;
  })}</>;
}

/** The spare CCU/router bays are fitted, not empty structural frames; no pretend patch targets. */
function RackInfill() {
  const active = useTrainingStore((state) => scenarioOf(state).devices.map((d) => d.id).join("|"));
  const occupants: Record<string, string> = { "xl-rack-ccu": "ccu1", "xl-rack-router": "router", "xl-rack-backup": "enc2", "xl-rack-backup-net": "net2" };
  const racks = LAYOUTS.stadium.furniture.filter((f) => occupants[f.id] && !active.split("|").includes(occupants[f.id]));
  return <>{racks.map((f, i) => <group key={f.id} position={f.center} rotation={[0, Math.PI / 2, 0]}>
    <RB p={[0, 0.95, 0]} s={[0.51, 1.8, 0.48]} rad={0.012} c="#191e26" />
    {Array.from({ length: 8 }, (_, row) => <group key={row} position={[0, 0.18 + row * 0.21, 0.25]}>
      <RB p={[0, 0, 0]} s={[0.48, 0.17, 0.025]} rad={0.004} c={row % 2 ? "#303743" : "#232a34"} />
      <RB p={[-0.12, 0.015, 0.016]} s={[0.11, 0.035, 0.005]} rad={0.002} c="#3b5962" />
      {Array.from({ length: 5 }, (_, n) => <Slab key={n} p={[0.02 + n * 0.025, 0, 0.016]} s={[0.009, 0.07, 0.005]} c="#11151b" />)}
    </group>)}
    <Text font={FONT} position={[0, 1.93, 0.31]} fontSize={0.038} maxWidth={0.5} color="#e2cfac">{["ควบคุมกล้องสำรอง", "แผงจัดสายสำรอง", "ตัวเข้ารหัสสำรอง", "เครือข่ายสำรอง"][i]}</Text>
  </group>)}</>;
}

/** Operator panels sit on the free front edge, away from actual equipment and its connectors. */
function ProductionPanels() {
  const desks = LAYOUTS.stadium.furniture.filter((f) => ["xl-switch", "xl-replay"].includes(f.id));
  return <>{desks.map((desk, d) => <group key={desk.id} position={[desk.center[0], desk.size[1], desk.center[2] + 0.28]}>
    <RB p={[0, 0.025, 0]} s={[d ? 0.8 : 1.8, 0.05, 0.24]} rad={0.015} c="#222934" />
    {Array.from({ length: d ? 8 : 16 }, (_, col) => [0, 1].map((row) => <RB key={`${col}-${row}`} p={[(col - (d ? 3.5 : 7.5)) * 0.085, 0.054, -0.05 + row * 0.08]} s={[0.055, 0.012, 0.05]} rad={0.005} c={col === 0 ? "#7d3a38" : col === 1 ? "#38594a" : "#6d7785"} />))}
  </group>)}</>;
}

function CommentaryMicStands() {
  const room = ROOMS.xl;
  return <>{["mic1", "mic2"].map((id) => {
    const p = LAYOUTS.stadium.places[room.places[id] as string].p;
    return <group key={id} position={p}>
      <RB p={[0, 0.012, 0]} s={[0.16, 0.016, 0.14]} rad={0.025} {...BLACK_METAL} />
      <Cyl p={[0, 0.022, 0]} rt={0.012} h={0.03} {...CHROME} />
    </group>;
  })}</>;
}

/* Stadium live-broadcast job site (game/training/venue-layouts.ts `stadium`), three zones:
 * ZONE C broadcast control room (west, indoor: multiview wall, switcher / replay / graphics desk rows, audio console, rack wall),
 * ZONE B commentary desk (centre-east), ZONE A pitch-side camera positions + crowd / field mics (south, toward the pitch). */
export function Stadium() {
  const L = LAYOUTS.stadium;
  const commentaryTarget = useMemo(() => {
    const target = new Object3D(); target.position.set(k(6.2), 0.9, k(-1.8)); return target;
  }, []);
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const ads = useMemo(() => [adBoard("a", "#123c9b", "#dbe9ff"), adBoard("b", "#245aba", "#dbe9ff"), adBoard("c", "#103781", "#59baff")], []);
  const stripes = tex.turf([6, 30]);
  const roomWall = tex.fabric("#bfc2c4", [6, 2]);
  const roomFloor = tex.tiles("#3b3f46", "#2c2f35", 4, [6, 5]);
  const room = { x0: k(-13.1), x1: k(-1.0), z0: k(-7.6), z1: k(2.2), h: 3.4 };
  return <>
    <color attach="background" args={["#060a18"]} />
    <VenueLighting mood="night" intensity={0.7} />
    <fog attach="fog" args={["#0b1228", 60, 160]} />
    <StarSky />
    <hemisphereLight args={["#b8c8ff", "#3a4a3a", 0.75]} />
    <ambientLight intensity={0.25} />
    <directionalLight position={[10, 18, 16]} intensity={2.0} color="#f2f6ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-normalBias={0.03} />

    <StadiumGround />
    {/* Textured run-off grass surrounds the existing pitch; no exposed world holes. */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, PCZ]} receiveShadow><planeGeometry args={[PITCH.x + 12, PITCH.z + 12]} /><meshStandardMaterial map={stripes} color="#376f3c" roughness={1} /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-PITCH.x / 2 + (i + 0.5) * (PITCH.x / 12), -0.01, PCZ]} receiveShadow><planeGeometry args={[PITCH.x / 12, PITCH.z]} /><meshStandardMaterial map={stripes} color={i % 2 ? "#2f7a34" : "#3a8f3e"} roughness={1} /></mesh>)}
    <PitchLines />
    <Goal x={-PITCH.x / 2} dir={-1} />
    <Goal x={PITCH.x / 2} dir={1} />
    {/* broadcast compound apron (walkable) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(minX + maxX) / 2, 0.002, (minZ + maxZ) / 2]} receiveShadow><planeGeometry args={[maxX - minX + 1, maxZ - minZ + 1]} /><meshStandardMaterial map={tex.concrete([12, 10])} color="#8a8a86" roughness={0.95} /></mesh>
    {/* pitch-side LED boards just past the camera row */}
    {([[-16, 30], [16, 30]] as const).map(([x, len], k) => <group key={x} position={[x, 0, maxZ + 0.6]}>
      <RB p={[0, 0.5, 0]} s={[len, 0.95, 0.25]} rad={0.04} {...BLACK_METAL} />
      <mesh position={[0, 0.5, 0.13]}><planeGeometry args={[len - 0.4, 0.85]} /><meshBasicMaterial map={ads[(k + 1) % 3]} toneMapped={false} /></mesh>
      <mesh position={[0, 0.5, -0.13]} rotation={[0, Math.PI, 0]}><planeGeometry args={[len - 0.4, 0.85]} /><meshBasicMaterial map={ads[(k + 2) % 3]} toneMapped={false} /></mesh>
    </group>)}

    {/* ZONE C — broadcast control room shell (walls, ceiling, door gap on the east wall at z −1.2 … 0.6) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(room.x0 + room.x1) / 2, 0.004, (room.z0 + room.z1) / 2]} receiveShadow><planeGeometry args={[room.x1 - room.x0, room.z1 - room.z0]} /><meshStandardMaterial map={roomFloor} roughness={0.7} /></mesh>
    <Slab p={[(room.x0 + room.x1) / 2, room.h / 2, room.z0]} s={[room.x1 - room.x0, room.h, 0.12]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x0, room.h / 2, (room.z0 + room.z1) / 2]} s={[0.12, room.h, room.z1 - room.z0]} map={roomWall} c="#ffffff" r={0.9} />
    {/* White lower canvas and a clear vinyl window retain the original wall collider. */}
    <Slab p={[(room.x0 + room.x1) / 2, 0.5, room.z1]} s={[room.x1 - room.x0, 1, 0.12]} map={roomWall} r={0.9} />
    <Slab p={[(room.x0 + room.x1) / 2, 2.05, room.z1]} s={[room.x1 - room.x0, 2.1, 0.05]} c="#a4b6c9" transparent opacity={0.18} r={0.25} />
    <Slab p={[(room.x0 + room.x1) / 2, 3.25, room.z1]} s={[room.x1 - room.x0, 0.3, 0.12]} map={roomWall} r={0.9} />
    {[-12, -9, -6, -3].map((x) => <Slab key={`window-post-${x}`} p={[k(x), room.h / 2, room.z1]} s={[0.06, room.h, 0.13]} c="#d1d4d9" m={0.65} r={0.4} />)}
    <Slab p={[room.x1, room.h / 2, k(-4.4)]} s={[0.12, room.h, k(6.4)]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x1, room.h / 2, k(1.4)]} s={[0.12, room.h, k(1.6)]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x1, room.h - 0.3, k(-0.3)]} s={[0.12, 0.6, k(1.8)]} map={roomWall} c="#ffffff" r={0.9} />
    <ControlTentRoof x0={room.x0} x1={room.x1} z0={room.z0} z1={room.z1} h={room.h} />
    <RB p={[room.x1 + 0.08, 2.5, k(-0.3)]} s={[0.025, 0.44, 2.2]} rad={0.01} c="#111b2b" />
    <Text font={FONT} position={[room.x1 + 0.1, 2.5, k(-0.3)]} rotation={[0, Math.PI / 2, 0]} fontSize={0.16} maxWidth={2.1} textAlign="center" color="#fff1d0">เต็นท์ควบคุมการถ่ายทอดสด</Text>
    <RB p={[room.x1 + 0.07, 2.75, k(-0.3)]} s={[0.04, 0.16, 0.7]} rad={0.01} c="#c40f12" e="#ff2020" ei={1.2} />
    {[-10.5, -7.0, -3.5].flatMap((x) => [-5.5, -1.6].map((z) => <RB key={`${x}${z}`} p={[k(x), room.h - 0.04, k(z)]} s={[1.4, 0.04, 0.5]} rad={0.01} c="#ffffff" e="#e8eeff" ei={1.4} />))}
    {/* two room lights cover the whole control room (panel fixtures above are emissive only) */}
    {[-9.5, -4.5].map((x) => <pointLight key={x} position={[k(x), room.h - 0.5, k(-2.6)]} intensity={12} distance={16} decay={1.6} color="#eef2ff" />)}
    {/* soft fill so the control room never reads as a black box (the night environment barely reaches indoors) */}
    <pointLight position={[k(-7), room.h - 0.4, k(0.8)]} intensity={8} distance={12} decay={1.6} color="#eef2ff" />
    {/* Supported service lights keep connector backs readable in the narrow rack aisle. */}
    {[-7.4, -3.0, 1.4].map(z => <group key={`rack-service-${z}`}>
      <RB p={[minX + 0.42, 2.8, z]} s={[0.7, 0.04, 0.25]} rad={0.01} c="#eef3f6" e="#eef3f6" ei={0.7} />
      <Tube pts={[[minX, 2.95, z], [minX + 0.42, 2.95, z], [minX + 0.42, 2.8, z]]} r={0.012} {...STEEL} />
      <pointLight position={[minX + 0.55, 2.6, z]} intensity={4} distance={5} decay={2} color="#eaf3ff" />
    </group>)}
    {/* multiview wall frame + desks / racks / audio desk come from the layout */}
    <group position={[k(-7.0), 0, k(-7.4)]} scale={[K, 1, 1]}>
      {Array.from({ length: 4 }, (_, i) => <RB key={i} p={[-2.7 + i * 1.8, 3.0, 0.1]} s={[1.6, 0.24, 0.06]} rad={0.01} c="#0e1015" />)}
    </group>

    {/* Commentary desk stays at its mission height; platform is recessed underneath it. */}
    <CommentaryPosition />
    <primitive object={commentaryTarget} />
    <spotLight position={[k(6.2), 3.6, k(1.0)]} target={commentaryTarget} angle={0.7} penumbra={0.6} intensity={18} distance={8} color="#fff2e0" />

    {/* ZONE A — pitch-side cable route along the edge + ramp at the walkway */}
    <RB p={[0, 0.025, k(11.3)]} s={[k(26), 0.05, 0.22]} rad={0.02} c="#24262b" />
    <RB p={[k(-0.9), 0.025, k(5.0)]} s={[0.22, 0.05, k(12.6)]} rad={0.02} c="#24262b" />

    <SidelineDressing />
    <SidelineBarriers />
    <ControlMonitors />
    <InstalledStadiumEquipment />
    <RackInfill />
    <ProductionPanels />
    <CommentaryMicStands />
    <Stands />
    {FLOOD_POSITIONS.map(([x, , z]) => <Floodlight key={`${x}${z}`} p={[x, 0, z]} />)}
    <Scoreboard />
    {/* outside-broadcast truck parked in the compound beyond the east fence */}
    <ObVan p={[k(18.0), 0, k(3.0)]} ry={0} />
    <CameraTower p={[k(17.5), 0, k(12.0)]} />

    <LayoutFurniture layout={{ ...L, furniture: L.furniture.filter((f) => f.kind !== "controlWall") }} look={{ top: "#2b2f36", cloth: "#14161b", caseColor: "#1d1f24" }} />
    <LayoutColliders layout={L} />
  </>;
}
