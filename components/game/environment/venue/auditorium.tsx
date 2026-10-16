"use client";

import { SignalScreen } from "./signal-screen";
import { SCENE_CANVAS_FONT } from "@/game/rendering/scene-font";
import { useMemo } from "react";
import { RepeatWrapping } from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { LAYOUTS, VENUE_SCALE } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";

import { VenueLighting, CHROME, merge, place, Tube, Lathe, Cyl, BLACK_METAL, g, Instanced, RB, Slab, type Placement, type V3, type XZ } from "./kit";
import { tex } from "./textures";

const THAI = SCENE_CANVAS_FONT;

function slide(key: string, title: string, lines: string[]) {
  return tex.sign(`aud-${key}`, 1024, 576, (c, w, h) => {
    c.fillStyle = "#f6f8fc"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#1c4fa6"; c.fillRect(0, 0, w, 80);
    c.fillStyle = "#3b7be0"; c.fillRect(0, 80, w, 6);
    c.fillStyle = "#ffffff"; c.font = `bold 40px ${THAI}`; c.fillText(title, 32, 54);
    c.fillStyle = "#26303e"; c.font = `30px ${THAI}`;
    lines.forEach((s, i) => c.fillText(s, 46, 160 + i * 58));
    c.fillStyle = "#d4dcea"; for (let i = 0; i < 4; i++) c.fillRect(46, 400 + i * 26, 520 - i * 90, 10);
    c.fillStyle = "#1c4fa6"; c.fillRect(680, 360, 290, 170);
    c.fillStyle = "#ffffff"; c.font = `bold 28px sans-serif`; c.fillText("TRAINING", 740, 455);
    c.fillStyle = "#8a96a8"; c.font = `20px ${THAI}`; c.fillText("etcstream · Academy of the Signal Path", 32, h - 22);
  });
}



/** Ceiling track spotlight: lathe can on a yoke. */
function TrackSpot({ p, aim = 0.55 }: { p: V3; aim?: number }) {
  return <group position={p}>
    <RB p={[0, 0.06, 0]} s={[0.08, 0.05, 0.06]} rad={0.012} {...BLACK_METAL} />
    <Tube pts={[[-0.07, 0.04, 0], [-0.07, -0.06, 0], [0.07, -0.06, 0], [0.07, 0.04, 0]]} r={0.006} {...BLACK_METAL} />
    <Lathe p={[0, -0.02, 0]} rot={[aim, 0, 0]} prof={[[0, 0.12], [0.05, 0.12], [0.055, 0.08], [0.06, -0.1], [0.064, -0.12], [0.05, -0.12]]} c="#111214" r={0.45} m={0.5} />
    <Cyl p={[0, -0.02 - Math.cos(aim) * 0.115, Math.sin(aim) * 0.115]} rot={[aim, 0, 0]} rt={0.048} h={0.004} c="#fff3d8" e="#ffe9c0" ei={2.4} />
  </group>;
}



/* Activity-hall job site (game/training/venue-layouts.ts `auditorium`):
 * stage + podium at the front with the LED / projection wall behind it, audience blocks with left / centre / right aisles,
 * FOH production + audio desks rear-centre, cable rack + road case behind FOH, side-stage cases, cable tray along the right wall. */
// The mission hall is enlarged with its layout (VENUE_SCALE, a game-design choice); fittings scale with it.
const K = VENUE_SCALE.auditorium, k = (v: number) => +(v * K).toFixed(3);
const STAGE = LAYOUTS.auditorium.furniture.find((f) => f.kind === "stage")!;
const COFFERS: XZ[] = [-6, 0, 6].flatMap((x) => [-2.5, 2.5, 7.0].map((z): XZ => [x * K, z * K]));
// Keep the mission furniture footprint and all aisles; replace only its visual finish.
const HALL_FURNITURE = { ...LAYOUTS.auditorium, furniture: LAYOUTS.auditorium.furniture.filter((f) => f.kind !== "chairBlock") };

function HallSeating() {
  const parts = useMemo(() => [
    { geo: merge([place(g.rbox([0.48, 0.1, 0.43], 0.035), [0, 0.48, 0]), place(g.rbox([0.48, 0.64, 0.09], 0.035), [0, 0.84, 0.2])]), mat: { c: "#202329", r: 0.48 } },
    { geo: merge([place(g.cyl(0.035, 0.035, 0.36, 10), [0, 0.23, 0]), ...[-1, 1].flatMap((v) => [place(g.box([0.5, 0.035, 0.035]), [0, 0.07, v * 0.15]), place(g.box([0.025, 0.22, 0.025]), [v * 0.25, 0.58, 0]), place(g.box([0.035, 0.035, 0.36]), [v * 0.25, 0.69, 0])])]), mat: CHROME },
    { geo: merge([-1, 1].flatMap((x) => [-1, 1].map((z) => place(g.sphere(0.045, 8, 6), [x * 0.23, 0.045, z * 0.15])))), mat: { c: "#15171a", r: 0.8 } },
  ], []);
  const chairs = useMemo<Placement[]>(() => LAYOUTS.auditorium.furniture.filter((f) => f.kind === "chairBlock").flatMap((f) => Array.from({ length: 6 }, (_, i) => ({ p: [f.center[0] + (i - 2.5) * 0.58, 0, f.center[2]] as V3 }))), []);
  return <Instanced parts={parts} at={chairs} />;
}

export function Auditorium() {
  const stage = STAGE;
  const L = LAYOUTS.auditorium;
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const w = maxX - minX + 0.4, d = maxZ - minZ + 0.4, h = 5.0;
  const frontZ = minZ - 0.05, backWallZ = maxZ + 0.15, midZ = (frontZ + backWallZ) / 2;
  const carpet = tex.sign("aud-neutral-carpet", 512, 512, (c, tw, th) => {
    c.fillStyle = "#77716a"; c.fillRect(0, 0, tw, th);
    for (let y = 0; y < th; y += 64) for (let x = 0; x < tw; x += 64) {
      c.fillStyle = (x + y) % 128 ? "#827c73" : "#6c6862"; c.fillRect(x + 1, y + 1, 62, 62);
      c.strokeStyle = "#969087"; c.lineWidth = 1;
      for (let n = 6; n < 64; n += 6) { c.beginPath(); c.moveTo(x + n, y + 2); c.lineTo(x + n, y + 61); c.stroke(); }
    }
  });
  if (carpet) { carpet.wrapS = carpet.wrapT = RepeatWrapping; carpet.repeat.set(w / 4, d / 4); }
  const wall = tex.paint("#efe6d6", [8, 2]);
  const veneer = tex.wood("#6a4529", [1, 3]);
  const centre = slide("c", "Signal Flow Workshop 2026", ["• Camera → Production Switcher → LED / Capture", "• SDI OUT → SDI IN · XLR → Stagebox → Mixer", "• Check Program before the event starts"]);
  const sideA = slide("a", "Event schedule", ["1. Opening", "2. Keynote", "3. Awards"]);
  const coffers = COFFERS;
  return <>
    <color attach="background" args={["#efe9df"]} />
    <VenueLighting mood="ballroom" intensity={0.45} />
    <hemisphereLight args={["#fffaf0", "#6d6a72", 0.5]} />
    <ambientLight intensity={0.1} />
    <directionalLight position={[0.5, h - 0.45, 2.5]} target-position={[0, 0, -2]} intensity={0.8} color="#fff3e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={0.03} />
    {[[-4, 1.5], [4, 1.5]].map(([x, z]) => <pointLight key={`${x}${z}`} position={[k(x), h - 0.9, k(z)]} intensity={12} distance={18} color="#fff1d6" />)}
    {/* stage wash from the front truss */}
    {[-2.5, 2.5].map((x) => <spotLight key={x} position={[k(x), h - 0.7, k(-1.6)]} target-position={[k(x * 0.4), 1.0, stage.center[2]]} angle={0.7} penumbra={0.7} intensity={18} distance={12} color="#fff4e2" />)}

    {/* shell: neutral carpet, acoustic walls and warm wood coffered ceiling */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, midZ]} receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={carpet} roughness={1} /></mesh>
    <Slab p={[0, h / 2, frontZ]} s={[w, h, 0.1]} map={wall} c="#ffffff" r={0.85} />
    {[-1, 1].map((sx) => <RB key={sx} p={[sx * (w / 2 - 0.6), h / 2, frontZ + 0.09]} s={[1.0, h, 0.1]} rad={0.02} map={veneer} c="#ffffff" r={0.4} />)}
    {[-1, 1].map((s) => <group key={s}>
      <Slab p={[s * w / 2, h / 2, midZ]} s={[0.1, h, d]} map={wall} c="#ffffff" r={0.85} />
      {Array.from({ length: Math.floor((d - 3) / 4) + 1 }, (_, i) => <RB key={i} p={[s * (w / 2 - 0.1), h / 2, frontZ + 2.5 + i * 4]} s={[0.16, h, 0.6]} rad={0.02} c="#e2d7c4" />)}
      {Array.from({ length: Math.floor((d - 5) / 4) + 1 }, (_, i) => <group key={`l${i}`} position={[s * (w / 2 - 0.16), 2.6, frontZ + 4.5 + i * 4]}>
        <Lathe p={[0, 0, 0]} prof={[[0.06, -0.12], [0.11, -0.12], [0.08, 0.1], [0.05, 0.1]]} c="#fff1d8" e="#ffcf80" ei={1.2} r={0.8} />
      </group>)}
    </group>)}
    <Slab p={[0, h / 2, backWallZ]} s={[w, h, 0.1]} map={wall} c="#ffffff" r={0.85} />
    {/* rear entrance doors (spawn side) */}
    <group position={[k(-7.9), 0, backWallZ - 0.06]}>
      {[-0.46, 0.46].map((x) => <RB key={x} p={[x, 1.1, 0]} s={[0.88, 2.2, 0.06]} rad={0.012} map={veneer} c="#ffffff" r={0.45} />)}
      <RB p={[0, 2.42, 0.03]} s={[0.5, 0.18, 0.02]} rad={0.004} c="#1f8f3a" e="#2bd45a" ei={0.6} />
    </group>
    <Slab p={[0, h + 0.05, midZ]} s={[w, 0.1, d]} c="#f7f4ef" r={0.9} />
    {coffers.map(([x, z]) => <group key={`${x}${z}`}>
      <Slab p={[x, h - 0.01, z]} s={[4.6, 0.02, 3]} c="#fff4dc" e="#ffe3ad" ei={1.0} />
      {[-1, 1].map((sz) => <RB key={`z${sz}`} p={[x, h - 0.18, z + sz * 1.6]} s={[5.1, 0.3, 0.22]} rad={0.04} c="#ffffff" r={0.7} />)}
      {[-1, 1].map((sx) => <RB key={`x${sx}`} p={[x + sx * 2.45, h - 0.18, z]} s={[0.22, 0.3, 3.4]} rad={0.04} c="#ffffff" r={0.7} />)}
    </group>)}
    {/* Wood acoustic ceiling islands with recessed warm linear lighting. */}
    {coffers.map(([x, z]) => <group key={`wood-${x}-${z}`}>
      <Slab p={[x, h - 0.12, z]} s={[4.45, 0.08, 2.85]} map={veneer} r={0.6} />
      {[-1, 1].map((v) => <Slab key={v} p={[x, h - 0.17, z + v * 1.25]} s={[4.1, 0.025, 0.035]} c="#fff1ce" e="#ffda98" ei={1.6} />)}
    </group>)}
    <RB p={[0, h - 0.38, k(-1.6)]} s={[k(14), 0.045, 0.06]} rad={0.01} {...BLACK_METAL} />
    {[-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6].map((x) => <TrackSpot key={x} p={[k(x), h - 0.46, k(-1.6)]} aim={-0.6} />)}

    {/* LED / projection wall behind the stage (the "LED Program Screen" processor sits side-stage right) */}
    {([[-6.9, 3.4, sideA], [0, 6.0, centre], [6.9, 3.4, sideA]] as const).map(([x, sw, map]) => <group key={x} position={[k(x), 2.9, frontZ + 0.13]}>
      <RB p={[0, 0, 0]} s={[sw + 0.24, sw * 0.5625 + 0.24, 0.08]} rad={0.04} c="#1c1f25" m={0.3} r={0.35} />
      {x === 0 ? <group position={[0, 0, 0.045]}><SignalScreen device="display" width={sw} height={sw * 0.5625} title="Audience projection · live feed" /></group> : <mesh position={[0, 0, 0.045]}><planeGeometry args={[sw, sw * 0.5625]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>}
    </group>)}
    {/* Front slat panels, wall speakers and a conference camera above the central display. */}
    {[-1, 1].map((v) => <group key={`front-${v}`}>
      {Array.from({ length: 28 }, (_, i) => <Slab key={i} p={[v * (3.3 + i * 0.31), h / 2, frontZ + 0.065]} s={[0.12, h - 0.15, 0.08]} map={veneer} r={0.55} />)}
      <RB p={[v * 4.15, 3.45, frontZ + 0.38]} s={[0.44, 0.95, 0.28]} rad={0.025} c="#15191e" r={0.7} />
      <Slab p={[v * 4.15, 3.45, frontZ + 0.53]} s={[0.37, 0.84, 0.015]} map={tex.fabric("#24282c")} />
      <Slab p={[v * (w / 2 - 0.2), h - 0.3, midZ]} s={[0.035, 0.025, d - 0.5]} c="#ffe7b8" e="#ffd28b" ei={1.3} />
    </group>)}
    <RB p={[0, 4.7, frontZ + 0.33]} s={[0.42, 0.06, 0.38]} rad={0.02} {...BLACK_METAL} />
    <RB p={[0, 4.83, frontZ + 0.34]} s={[0.22, 0.2, 0.21]} rad={0.04} c="#252a32" />
    <Cyl p={[0, 4.83, frontZ + 0.46]} rot={[Math.PI / 2, 0, 0]} rt={0.067} h={0.045} c="#101c30" m={0.5} r={0.15} />
    {/* Built-in AV cabinet stays behind the stage; no new floor obstruction. */}
    <RB p={[0, 0.99, frontZ + 0.3]} s={[5.9, 0.35, 0.4]} rad={0.02} map={veneer} r={0.4} />
    <RB p={[0, 1.24, frontZ + 0.31]} s={[1.1, 0.12, 0.18]} rad={0.015} c="#15191e" />
    {/* Side-wall windows and blinds, set flush to preserve camera access along the aisle. */}
    {[0, 1, 2].map((i) => <group key={`window-${i}`} position={[-w / 2 + 0.07, 2.7, frontZ + 5.1 + i * 5.6]}>
      <Slab p={[0, 0, 0]} s={[0.035, 2.6, 3.7]} c="#a4c9de" e="#89afc5" ei={0.25} r={0.25} />
      {[-1, 0, 1].map((v) => <Slab key={v} p={[0.035, 0, v * 1.8]} s={[0.04, 2.7, 0.045]} c="#333941" />)}
      <Slab p={[0.06, 0.85, 0]} s={[0.045, 0.95, 3.75]} map={tex.fabric("#98958c")} />
      <Slab p={[0.06, -1.35, 0]} s={[0.16, 0.08, 3.85]} map={veneer} />
    </group>)}
    {/* AV rack recessed against the front wall, clear of side-stage mission equipment. */}
    <group position={[k(8.2), 0, frontZ + 0.35]}>
      <RB p={[0, 1.1, 0]} s={[0.72, 2.2, 0.48]} rad={0.02} c="#161a20" />
      {Array.from({ length: 9 }, (_, i) => <group key={i}>
        <RB p={[0, 0.3 + i * 0.2, 0.25]} s={[0.61, 0.15, 0.025]} rad={0.004} c="#30343a" m={0.35} />
        <RB p={[-0.2, 0.3 + i * 0.2, 0.27]} s={[0.12, 0.045, 0.008]} rad={0.002} c="#52959c" e="#53c9ca" ei={0.4} />
        <Cyl p={[0.22, 0.3 + i * 0.2, 0.28]} rot={[Math.PI / 2, 0, 0]} rt={0.022} h={0.02} c="#858b93" />
      </group>)}
    </group>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[k(8.2), 1.1, frontZ + 0.35]} args={[0.36, 1.1, 0.24]} />
    </RigidBody>
    {/* Acoustic wall panels stay flush to the shell, outside the side aisle. */}
    {[0, 1, 2, 3].map((i) => <group key={`acoustic-${i}`}>
      <Slab p={[w / 2 - 0.065, 2.5, frontZ + 4.1 + i * 4.6]} s={[0.04, 3.4, 2.6]} map={tex.fabric("#837e73", [2, 3])} r={0.95} />
      <Slab p={[w / 2 - 0.09, 2.5, frontZ + 2.65 + i * 4.6]} s={[0.06, 4.7, 0.18]} map={veneer} r={0.5} />
    </group>)}
    {/* Plants sit on the already blocked stage footprint. */}
    {[-1, 1].map((v) => <group key={`plant-${v}`} position={[v * (stage.size[0] / 2 - 0.65), stage.size[1], stage.center[2]]}>
      <Lathe p={[0, 0, 0]} prof={[[0.2, 0], [0.26, 0.06], [0.31, 0.5], [0.28, 0.54], [0.24, 0.5]]} c="#c8c4b8" r={0.8} />
      {Array.from({ length: 7 }, (_, i) => <group key={i} rotation={[0, i * 2.4, 0]}>
        <Tube pts={[[0, 0.45, 0], [0.1, 1.1 + i * 0.05, 0], [0.4, 1.25 + i * 0.05, 0]]} r={0.012} c="#45623c" />
        <mesh position={[0.32, 1.2 + i * 0.05, 0]} rotation={[0, 0, -0.45]} scale={[0.3, 0.12, 0.1]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={i % 2 ? "#527b3b" : "#365c32"} roughness={0.8} /></mesh>
      </group>)}
    </group>)}
    <HallSeating />

    {/* service route: covered cable tray from stage-right along the right wall, then across the back to FOH */}
    <RB p={[k(8.75), 0.03, k(1.4)]} s={[0.3, 0.06, k(11.0)]} rad={0.02} c="#2a2c31" />
    <RB p={[k(6.1), 0.03, k(6.95)]} s={[k(5.6), 0.06, 0.3]} rad={0.02} c="#2a2c31" />

    {/* layout furniture: stage, podium, presenter table, camera riser, audience seating, FOH, cable rack, road cases */}
    <LayoutFurniture layout={HALL_FURNITURE} look={{ top: "#946b43", cloth: "#262a30" }} />
    <LayoutColliders layout={L} />
  </>;
}

