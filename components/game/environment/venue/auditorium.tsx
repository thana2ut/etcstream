"use client";

import { useMemo } from "react";
import { LAYOUTS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";
import { DoubleSide, MeshPhysicalMaterial, OctahedronGeometry } from "three";
import { VenueLighting, CHROME, merge, place, Tube, Lathe, Cyl, BLACK_METAL, g, Instanced, RB, Slab, type Placement, type V3, type XZ } from "./kit";
import { tex } from "./textures";

const THAI = "'Sarabun','Leelawadee UI','Tahoma',sans-serif";

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
    c.fillStyle = "#ffffff"; c.font = `bold 28px sans-serif`; c.fillText("LIVE  1080p", 740, 455);
    c.fillStyle = "#8a96a8"; c.font = `20px ${THAI}`; c.fillText("etcstream · สำนักวิถีแห่งสายสัญญาณ", 32, h - 22);
  });
}



/** Flower arrangement unit for the stage front: foam box, leaves, blooms. */
function useFlowerRow() {
  return useMemo(() => {
    const blooms = merge(Array.from({ length: 7 }, (_, i) => place(g.sphere(0.07 + (i % 3) * 0.015, 10, 8), [(i - 3) * 0.06, 0.32 + ((i * 7) % 3) * 0.04, ((i * 5) % 3 - 1) * 0.05], [0, 0, 0], [1, 0.8, 1])));
    const blooms2 = merge(Array.from({ length: 5 }, (_, i) => place(g.sphere(0.05, 8, 6), [(i - 2) * 0.08, 0.36 + (i % 2) * 0.05, 0.04 - (i % 2) * 0.08])));
    const leaves = merge(Array.from({ length: 9 }, (_, i) => place(g.sphere(0.06, 6, 4), [(i - 4) * 0.05, 0.25, ((i % 3) - 1) * 0.07], [0.3 * i, i, 0.4], [1.6, 0.35, 0.7])));
    const base = merge([place(g.rbox([0.3, 0.2, 0.18], 0.02), [0, 0.1, 0])]);
    return [
      { geo: base, mat: { c: "#eef1f4", r: 0.5 } },
      { geo: leaves, mat: { c: "#4f8d45", r: 0.7 } },
      { geo: blooms, mat: { c: "#f7f2fb", r: 0.75 } },
      { geo: blooms2, mat: { c: "#9cc8f2", r: 0.7 } },
    ];
  }, []);
}

/** Crystal chandelier strands: faceted drops, one physical material. */
function Chandeliers({ h, at: spots }: { h: number; at: XZ[] }) {
  const parts = useMemo(() => {
    const drops = merge(Array.from({ length: 34 }, (_, i) => place(new OctahedronGeometry(0.035, 0), [-2.2 + (i % 17) * 0.275, -0.25 - (i % 4) * 0.16 - (i % 3) * 0.05, i < 17 ? -0.95 : 0.95], [0, i, 0], [0.7, 1.8, 0.7])));
    const wires = merge(Array.from({ length: 34 }, (_, i) => place(g.cyl(0.002, 0.002, 0.5, 4), [-2.2 + (i % 17) * 0.275, 0, i < 17 ? -0.95 : 0.95])));
    const glass = new MeshPhysicalMaterial({ color: "#fff8e8", metalness: 0, roughness: 0.04, transmission: 0.6, ior: 1.6, thickness: 0.05, emissive: "#ffdf9a", emissiveIntensity: 0.55 });
    return [{ geo: drops, mat: glass }, { geo: wires, mat: { ...CHROME } }];
  }, []);
  const at = useMemo<Placement[]>(() => spots.map(([x, z]) => ({ p: [x, h - 0.15, z] as V3 })), [h, spots]);
  return <Instanced parts={parts} at={at} />;
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
export function Auditorium() {
  const L = LAYOUTS.auditorium;
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const w = maxX - minX + 0.4, d = maxZ - minZ + 0.4, h = 5.0;
  const frontZ = minZ - 0.05, backWallZ = maxZ + 0.15, midZ = (frontZ + backWallZ) / 2;
  const flowers = useFlowerRow();
  const carpet = tex.carpet([w / 1.1, d / 1.1]);
  const wall = tex.paint("#efe6d6", [8, 2]);
  const veneer = tex.wood("#6a4529", [1, 3]);
  const curtainTex = tex.fabric("#f2ede4", [3, 4]);
  const curtain = useMemo(() => g.drape(1.6, h - 0.1, 7, 0.07), []);
  const centre = slide("c", "Signal Flow Workshop 2026", ["• Camera → Production Switcher → LED / Capture", "• SDI OUT → SDI IN · XLR → Stagebox → Mixer", "• ตรวจ Program ก่อนเริ่มกิจกรรม"]);
  const sideA = slide("a", "กำหนดการกิจกรรม", ["1. พิธีเปิด", "2. บรรยายพิเศษ", "3. มอบรางวัล"]);
  const stageFrontZ = -5.3 + 1.3;
  const coffers = useMemo<XZ[]>(() => [-6, 0, 6].flatMap((x) => [-2.5, 2.5, 7.0].map((z): XZ => [x, z])), []);
  const flowerAt = useMemo<Placement[]>(() => Array.from({ length: 40 }, (_, i) => ({ p: [-6.6 + i * 0.34, 0.8, stageFrontZ - 0.12] as V3, ry: i * 0.7 })), [stageFrontZ]);
  return <>
    <color attach="background" args={["#efe9df"]} />
    <VenueLighting mood="ballroom" intensity={0.8} />
    <hemisphereLight args={["#fffaf0", "#6d6a72", 0.72]} />
    <ambientLight intensity={0.17} />
    <directionalLight position={[0.5, h - 0.45, 2.5]} target-position={[0, 0, -2]} intensity={1.4} color="#fff3e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={11} shadow-camera-bottom={-11} shadow-normalBias={0.03} />
    {[[-4, 1.5], [4, 1.5]].map(([x, z]) => <pointLight key={`${x}${z}`} position={[x, h - 0.9, z]} intensity={12} distance={16} color="#fff1d6" />)}
    {/* stage wash from the front truss */}
    {[-2.5, 2.5].map((x) => <spotLight key={x} position={[x, h - 0.7, -1.6]} target-position={[x * 0.4, 1.0, -5.0]} angle={0.7} penumbra={0.7} intensity={18} distance={12} color="#fff4e2" />)}

    {/* shell: carpet, cream walls with veneer pilasters, coffered ceiling with crystal chandeliers */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, midZ]} receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={carpet} roughness={1} /></mesh>
    <Slab p={[0, h / 2, frontZ]} s={[w, h, 0.1]} map={wall} c="#ffffff" r={0.85} />
    {[-8.6, 8.6].map((x) => <RB key={x} p={[x, h / 2, frontZ + 0.09]} s={[1.0, h, 0.1]} rad={0.02} map={veneer} c="#ffffff" r={0.4} />)}
    {[-1, 1].map((s) => <group key={s}>
      <Slab p={[s * w / 2, h / 2, midZ]} s={[0.1, h, d]} map={wall} c="#ffffff" r={0.85} />
      {Array.from({ length: 4 }, (_, i) => <RB key={i} p={[s * (w / 2 - 0.1), h / 2, frontZ + 2.5 + i * 4]} s={[0.16, h, 0.6]} rad={0.02} c="#e2d7c4" />)}
      {Array.from({ length: 4 }, (_, i) => <group key={`l${i}`} position={[s * (w / 2 - 0.16), 2.6, frontZ + 4.5 + i * 4]}>
        <Lathe p={[0, 0, 0]} prof={[[0.06, -0.12], [0.11, -0.12], [0.08, 0.1], [0.05, 0.1]]} c="#fff1d8" e="#ffcf80" ei={1.2} r={0.8} />
      </group>)}
    </group>)}
    <Slab p={[0, h / 2, backWallZ]} s={[w, h, 0.1]} map={wall} c="#ffffff" r={0.85} />
    {/* rear entrance doors (spawn side) */}
    <group position={[-7.9, 0, backWallZ - 0.06]}>
      {[-0.46, 0.46].map((x) => <RB key={x} p={[x, 1.1, 0]} s={[0.88, 2.2, 0.06]} rad={0.012} map={veneer} c="#ffffff" r={0.45} />)}
      <RB p={[0, 2.42, 0.03]} s={[0.5, 0.18, 0.02]} rad={0.004} c="#1f8f3a" e="#2bd45a" ei={0.6} />
    </group>
    <Slab p={[0, h + 0.05, midZ]} s={[w, 0.1, d]} c="#f7f4ef" r={0.9} />
    {coffers.map(([x, z]) => <group key={`${x}${z}`}>
      <Slab p={[x, h - 0.01, z]} s={[4.6, 0.02, 3]} c="#fff4dc" e="#ffe3ad" ei={1.0} />
      {[-1, 1].map((sz) => <RB key={`z${sz}`} p={[x, h - 0.18, z + sz * 1.6]} s={[5.1, 0.3, 0.22]} rad={0.04} c="#ffffff" r={0.7} />)}
      {[-1, 1].map((sx) => <RB key={`x${sx}`} p={[x + sx * 2.45, h - 0.18, z]} s={[0.22, 0.3, 3.4]} rad={0.04} c="#ffffff" r={0.7} />)}
    </group>)}
    <Chandeliers h={h} at={coffers} />
    <RB p={[0, h - 0.38, -1.6]} s={[14, 0.045, 0.06]} rad={0.01} {...BLACK_METAL} />
    {[-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6].map((x) => <TrackSpot key={x} p={[x, h - 0.46, -1.6]} aim={-0.6} />)}

    {/* LED / projection wall behind the stage (the "LED Program Screen" processor sits side-stage right) */}
    {([[-6.9, 3.4, sideA], [0, 6.0, centre], [6.9, 3.4, sideA]] as const).map(([x, sw, map]) => <group key={x} position={[x, 2.9, frontZ + 0.13]}>
      <RB p={[0, 0, 0]} s={[sw + 0.24, sw * 0.5625 + 0.24, 0.08]} rad={0.04} c="#1c1f25" m={0.3} r={0.35} />
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[sw, sw * 0.5625]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
    </group>)}
    {[-1, 1].map((s) => [0, 1].map((k) => <mesh key={`${s}${k}`} geometry={curtain} position={[s * (3.65 + k * 1.15), h / 2, frontZ + 0.3 + k * 0.03]} castShadow><meshStandardMaterial map={curtainTex} side={DoubleSide} roughness={0.95} /></mesh>))}
    <Instanced parts={flowers} at={flowerAt} />

    {/* service route: covered cable tray from stage-right along the right wall, then across the back to FOH */}
    <RB p={[8.75, 0.03, 1.4]} s={[0.3, 0.06, 11.0]} rad={0.02} c="#2a2c31" />
    <RB p={[6.1, 0.03, 6.95]} s={[5.6, 0.06, 0.3]} rad={0.02} c="#2a2c31" />

    {/* layout furniture: stage, podium, presenter table, camera riser, audience tables, FOH, cable rack, road cases */}
    <LayoutFurniture layout={L} look={{ top: "#2b2f36", cloth: "#fbfaf7" }} />
    <LayoutColliders layout={L} />
  </>;
}

