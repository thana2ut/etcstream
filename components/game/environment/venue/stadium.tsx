"use client";

import { useMemo } from "react";
import { BackSide, BufferGeometry, CapsuleGeometry, DoubleSide, Float32BufferAttribute } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { VenueLighting, Ball, BLACK_METAL, CHROME, Cyl, g, Instanced, Lathe, merge, place, RB, RUBBER, Slab, STEEL, Tube, type Placement, type V3, FONT } from "./kit";
import { tex } from "./textures";
import { Text } from "@react-three/drei";
import { LAYOUTS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";

const THAI = "'Sarabun','Leelawadee UI','Tahoma',sans-serif";
/** Pitch: 90 m along X, 60 m along Z, its near touchline 7 m in front of the broadcast platform. */
const PITCH = { x: 90, z: 60, near: 15.5 };
const PCZ = PITCH.near + PITCH.z / 2;

function adBoard(key: string, bg: string, fg: string, text: string) {
  return tex.sign(`ad-${key}`, 1024, 128, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = fg; c.font = `bold 78px ${THAI}`; c.textBaseline = "middle";
    for (let x = 30; x < w; x += c.measureText(text).width + 90) c.fillText(text, x, h / 2 + 4);
  });
}
function scoreboardTexture() {
  return tex.sign("scoreboard", 1024, 400, (c, w, h) => {
    c.fillStyle = "#05070d"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#0e1a3a"; c.fillRect(20, 20, w - 40, 110);
    c.fillStyle = "#ffffff"; c.font = `bold 64px ${THAI}`; c.textAlign = "center"; c.fillText("GRAND FINAL", w / 2, 98);
    c.font = "bold 150px sans-serif"; c.fillStyle = "#ffd34d"; c.fillText("2 : 1", w / 2, 290);
    c.font = `bold 56px ${THAI}`; c.fillStyle = "#ffffff"; c.fillText("HOME", 170, 250); c.fillText("AWAY", w - 170, 250);
    c.fillStyle = "#ff3b3b"; c.beginPath(); c.arc(w / 2 - 80, 355, 14, 0, 7); c.fill();
    c.font = "bold 40px sans-serif"; c.fillText("LIVE  78:12", w / 2 + 20, 370);
  });
}
function backdropTexture() {
  return tex.sign("stadium-backdrop", 1024, 360, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, w, h); grd.addColorStop(0, "#071a46"); grd.addColorStop(1, "#1840a0");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(120,170,255,.25)"; c.lineWidth = 2; for (let i = -h; i < w; i += 40) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); }
    c.fillStyle = "#ffd34d"; c.font = `bold 96px ${THAI}`; c.textAlign = "center"; c.fillText("GRAND FINAL", w / 2, 150);
    c.fillStyle = "#ff4d4d"; c.font = `bold 52px ${THAI}`; c.fillText("● ON AIR · ถ่ายทอดสด", w / 2, 250);
  });
}

/** Stadium seat (fold-down shell) + optional seated spectator, instanced across all stands. */
function useStands() {
  return useMemo(() => {
    const seat = merge([
      place(new RoundedBoxGeometry(0.44, 0.06, 0.4, 1, 0.025), [0, 0.42, 0.02]),
      place(new RoundedBoxGeometry(0.44, 0.42, 0.05, 1, 0.025), [0, 0.66, 0.22], [-0.15, 0, 0]),
      place(g.cyl(0.03, 0.04, 0.38, 6), [0, 0.2, 0.1]),
    ]);
    const body = merge([
      place(new CapsuleGeometry(0.16, 0.36, 2, 8), [0, 0.86, 0.1]),
      place(g.sphere(0.11, 8, 6), [0, 1.32, 0.06]),
      place(new CapsuleGeometry(0.07, 0.38, 2, 6), [-0.1, 0.5, -0.12], [Math.PI / 2, 0, 0]),
      place(new CapsuleGeometry(0.07, 0.38, 2, 6), [0.1, 0.5, -0.12], [Math.PI / 2, 0, 0]),
    ]);
    // Rows rise 0.45 m and step 0.85 m back. Four stands: main (behind the platform), far, and the two ends.
    const seats: Record<string, Placement[]> = { blue: [], red: [], white: [] };
    const people: Record<string, Placement[]> = { a: [], b: [], c: [], d: [] };
    const colorOf = (i: number, row: number) => ["blue", "red", "white"][(Math.floor(i / 8) + row) % 3 === 0 ? 2 : (row % 2 ? 0 : 1)];
    let n = 0;
    const add = (p: V3, ry: number, row: number, i: number) => {
      seats[colorOf(i, row)].push({ p, ry });
      n = (n * 1103515245 + 12345 + i * 7 + row * 131) >>> 0;
      if (n % 100 < 62) people["abcd"[n % 4]].push({ p, ry });
    };
    const ROWS = 14;
    for (let row = 0; row < ROWS; row++) {
      const y = 1.2 + row * 0.45;
      for (let i = 0; i < 110; i++) add([-30 + i * 0.55, y, -9 - row * 0.85], 0, row, i);                                   // main stand faces +Z
      for (let i = 0; i < 160; i++) add([-44 + i * 0.55, y, PITCH.near + PITCH.z + 6 + row * 0.85], Math.PI, row, i);      // far stand faces -Z
      for (let i = 0; i < 105; i++) {
        add([-(PITCH.x / 2 + 6 + row * 0.85), y, PITCH.near + 1 + i * 0.55], Math.PI / 2, row, i);                          // west end faces +X
        add([PITCH.x / 2 + 6 + row * 0.85, y, PITCH.near + 1 + i * 0.55], -Math.PI / 2, row, i);                            // east end faces -X
      }
    }
    return { seat, body, seats, people };
  }, []);
}
function Stands() {
  const { seat, body, seats, people } = useStands();
  const seatMat = { blue: { c: "#1d4fa0", r: 0.45 }, red: { c: "#c22a2a", r: 0.45 }, white: { c: "#e8e8e8", r: 0.45 } } as const;
  const shirts = { a: "#f2f2f2", b: "#1f5bbf", c: "#d33b2f", d: "#2b2b30" } as const;
  const concrete = tex.concrete([20, 1]);
  const tiers = 14;
  return <>
    {(Object.keys(seats) as (keyof typeof seatMat)[]).map((k) => <Instanced key={k} parts={[{ geo: seat, mat: seatMat[k] }]} at={seats[k]} />)}
    {(Object.keys(people) as (keyof typeof shirts)[]).map((k) => <Instanced key={k} parts={[{ geo: body, mat: { c: shirts[k], r: 0.85 } }]} at={people[k]} />)}
    {/* stepped concrete terraces */}
    {Array.from({ length: tiers }, (_, row) => {
      const y = 1.2 + row * 0.45, h = y, back = row * 0.85;
      return <group key={row}>
        <Slab p={[0, h / 2, -9.2 - back]} s={[62, h, 0.86]} map={concrete} c="#ffffff" r={0.95} />
        <Slab p={[0, h / 2, PITCH.near + PITCH.z + 6.2 + back]} s={[90, h, 0.86]} map={concrete} c="#ffffff" r={0.95} />
        {[-1, 1].map((s) => <Slab key={s} p={[s * (PITCH.x / 2 + 6.2 + back), h / 2, PCZ - 1.5]} s={[0.86, h, 60]} map={concrete} c="#ffffff" r={0.95} />)}
      </group>;
    })}
    {/* front walls + railings */}
    <Slab p={[0, 0.6, -8.6]} s={[62, 1.2, 0.3]} c="#20304e" />
    <Tube pts={[[-31, 2.0, -8.55], [31, 2.0, -8.55]]} r={0.03} {...CHROME} />
    {Array.from({ length: 32 }, (_, i) => <Tube key={i} pts={[[-31 + i * 2, 1.2, -8.55], [-31 + i * 2, 2.0, -8.55]]} r={0.02} {...CHROME} />)}
    {/* cantilever roof over the main stand */}
    <Slab p={[0, 10.2, -15]} s={[64, 0.25, 15]} rot={[0.08, 0, 0]} c="#c9ccd2" m={0.5} r={0.4} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = -32 + i * 8;
      return <group key={i}>
        <Tube pts={[[x, 0, -22.5], [x, 11.2, -22.5]]} r={0.3} {...STEEL} />
        <Tube pts={[[x, 11.2, -22.5], [x, 10.6, -7.6]]} r={0.18} {...STEEL} />
        <Tube pts={[[x, 7.5, -22.5], [x, 10.6, -12]]} r={0.12} {...STEEL} />
      </group>;
    })}
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
  const ry = Math.atan2(-x, PCZ - z);
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
    <Ball p={[0.12, 1.55, -0.2]} r={0.012} c="#ff2020" e="#ff2020" ei={3} />
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
    <mesh position={[0, 16.5, -0.46]} rotation={[0, Math.PI, 0]}><planeGeometry args={[18.6, 7.3]} /><meshBasicMaterial map={scoreboardTexture()} toneMapped={false} /></mesh>
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
    <mesh scale={130}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial map={sky} side={BackSide} fog={false} /></mesh>
    <points geometry={geo}><pointsMaterial color="#ffffff" size={0.6} sizeAttenuation={false} fog={false} /></points>
  </>;
}

/* Stadium live-broadcast job site (game/training/venue-layouts.ts `stadium`), three zones:
 * ZONE C broadcast control room (west, indoor: multiview wall, switcher / replay / graphics desk rows, audio console, rack wall),
 * ZONE B commentary desk (centre-east), ZONE A pitch-side camera positions + crowd / field mics (south, toward the pitch). */
export function Stadium() {
  const L = LAYOUTS.stadium;
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const ads = useMemo(() => [adBoard("a", "#0b1d4a", "#ffffff", "etcstream LIVE"), adBoard("b", "#c51f2a", "#ffffff", "สำนักวิถีแห่งสายสัญญาณ"), adBoard("c", "#0d0f14", "#ffd34d", "FULL LIVE PRODUCTION")], []);
  const stripes = tex.turf([6, 30]);
  const roomWall = tex.paint("#2a2e36", [6, 2]);
  const roomFloor = tex.tiles("#3b3f46", "#2c2f35", 4, [6, 5]);
  const room = { x0: -13.1, x1: -1.0, z0: -7.6, z1: 2.2, h: 3.2 };
  return <>
    <color attach="background" args={["#060a18"]} />
    <VenueLighting mood="night" intensity={0.7} />
    <fog attach="fog" args={["#0b1228", 60, 160]} />
    <StarSky />
    <hemisphereLight args={["#b8c8ff", "#3a4a3a", 0.75]} />
    <ambientLight intensity={0.25} />
    <directionalLight position={[10, 18, 16]} intensity={2.0} color="#f2f6ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-normalBias={0.03} />

    {/* pitch + markings beyond the camera positions */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, PCZ]} receiveShadow><planeGeometry args={[PITCH.x + 24, PITCH.z + 24]} /><meshStandardMaterial color="#2c6b30" roughness={1} /></mesh>
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
    <Slab p={[(room.x0 + room.x1) / 2, room.h / 2, room.z1]} s={[room.x1 - room.x0, room.h, 0.12]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x1, room.h / 2, -4.4]} s={[0.12, room.h, 6.4]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x1, room.h / 2, 1.4]} s={[0.12, room.h, 1.6]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[room.x1, room.h - 0.3, -0.3]} s={[0.12, 0.6, 1.8]} map={roomWall} c="#ffffff" r={0.9} />
    <Slab p={[(room.x0 + room.x1) / 2, room.h, (room.z0 + room.z1) / 2]} s={[room.x1 - room.x0, 0.1, room.z1 - room.z0]} c="#15171b" r={0.9} />
    <Text font={FONT} position={[room.x1 + 0.08, 2.45, -0.3]} rotation={[0, Math.PI / 2, 0]} fontSize={0.22} color="#ffd34d">BROADCAST CONTROL</Text>
    <RB p={[room.x1 + 0.07, 2.75, -0.3]} s={[0.04, 0.16, 0.7]} rad={0.01} c="#c40f12" e="#ff2020" ei={1.2} />
    {[-10.5, -7.0, -3.5].flatMap((x) => [-5.5, -1.6].map((z) => <RB key={`${x}${z}`} p={[x, room.h - 0.04, z]} s={[1.4, 0.04, 0.5]} rad={0.01} c="#ffffff" e="#e8eeff" ei={1.4} />))}
    {/* two room lights cover the whole control room (panel fixtures above are emissive only) */}
    {[-9.5, -4.5].map((x) => <pointLight key={x} position={[x, room.h - 0.5, -2.6]} intensity={26} distance={16} decay={1.6} color="#eef2ff" />)}
    {/* soft fill so the control room never reads as a black box (the night environment barely reaches indoors) */}
    <pointLight position={[-7, room.h - 0.4, 0.8]} intensity={14} distance={12} decay={1.6} color="#eef2ff" />
    {/* multiview wall frame + desks / racks / audio desk come from the layout */}
    <group position={[-7.0, 0, -7.4]}>
      {Array.from({ length: 4 }, (_, i) => <RB key={i} p={[-2.7 + i * 1.8, 3.0, 0.1]} s={[1.6, 0.24, 0.06]} rad={0.01} c="#0e1015" />)}
    </group>

    {/* ZONE B — commentary position with branded backdrop */}
    <group position={[6.2, 0, -2.5]}>
      <RB p={[0, 1.5, 0]} s={[4.2, 2.6, 0.12]} rad={0.04} c="#10141f" />
      <mesh position={[0, 1.55, 0.065]}><planeGeometry args={[4.0, 2.35]} /><meshBasicMaterial map={backdropTexture()} toneMapped={false} /></mesh>
    </group>
    {[5.5, 6.9].map((x) => <group key={x} position={[x, 0, -1.0]}>
      <RB p={[0, 0.48, 0]} s={[0.5, 0.1, 0.48]} rad={0.04} c="#20232a" />
      <RB p={[0, 0.85, -0.22]} rot={[0.12, 0, 0]} s={[0.48, 0.6, 0.08]} rad={0.04} c="#20232a" />
      <Cyl p={[0, 0.25, 0]} rt={0.025} h={0.4} {...CHROME} />
      {/* headset resting on the desk */}
      <mesh position={[0, 0.82, -0.62]} rotation={[0, 0, 0]}><torusGeometry args={[0.09, 0.012, 8, 24, Math.PI]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
    </group>)}
    <spotLight position={[6.2, 3.6, 1.0]} target-position={[6.2, 0.9, -1.8]} angle={0.7} penumbra={0.6} intensity={18} distance={8} color="#fff2e0" />

    {/* ZONE A — pitch-side cable route along the edge + ramp at the walkway */}
    <RB p={[0, 0.025, 11.3]} s={[26, 0.05, 0.22]} rad={0.02} c="#24262b" />
    <RB p={[-0.9, 0.025, 5.0]} s={[0.22, 0.05, 12.6]} rad={0.02} c="#24262b" />

    <Stands />
    {[[-52, -14], [52, -14], [-52, PITCH.near + PITCH.z + 14], [52, PITCH.near + PITCH.z + 14]].map(([x, z]) => <Floodlight key={`${x}${z}`} p={[x, 0, z]} />)}
    <Scoreboard />
    {/* outside-broadcast truck parked in the compound beyond the east fence */}
    <ObVan p={[18.0, 0, 3.0]} ry={0} />
    <CameraTower p={[17.5, 0, 12.0]} />

    <LayoutFurniture layout={L} look={{ top: "#2b2f36", cloth: "#14161b", caseColor: "#1d1f24" }} />
    <LayoutColliders layout={L} />
  </>;
}
