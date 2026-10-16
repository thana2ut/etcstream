"use client";

import { SceneText as Text } from "@/components/game/scene-text";

import { SCENE_FONT, sceneText } from "@/game/rendering/scene-font";

import { useMemo } from "react";
import { Object3D } from "three";
import { GenericDevice } from "../../equipment/generic-device";
import { scenarioOf } from "@/game/training/hdmi-training";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { LAYOUTS, VENUE_SCALE } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";
import { AvCart, VenueLighting, Ball, BLACK_METAL, CHROME, Cyl, D as BASE_D, H, Lathe, RB, Slab, STEEL, Tube, W as BASE_W, type V3 } from "./kit";
import { tex } from "./textures";

import { useTrainingStore } from "@/game/stores/training-store";
import { venueScreenFeed, venueScreenLive } from "@/game/training/monitor-feed";

/**
 * Mission classroom (บทที่ 01) — modern media-training classroom, built to the reference concept
 * (art/reference/venues/classroom-01/02, docs/VENUE_VISUAL_REFERENCES.md):
 *  front: wood-slat feature wall, centred projector screen over the teacher desk, grey acoustic panels, corner speakers,
 *         track lights, mobile whiteboard (left), classroom TV on a stand (right, layout furniture)
 *  left:  large windows with blinds, camera on tripod (scenario device) beside a softbox, AV cart with wireless gear
 *  right: tall metal shelving over the portable-gear cabinet, blue / grey acoustic panels, door
 *  ceiling: suspended grid with LED panels, AC vents, downlights, ceiling projector · floor: polished grey tile.
 * Gameplay furniture (desks, cabinet, cable shelf, TV stand) comes from the layout so colliders and surfaces match.
 */
const K = VENUE_SCALE.classroom;
const W = BASE_W * K, D = BASE_D * K;
const k = (v: number) => +(v * K).toFixed(3);
const BACK = -D / 2;
const L = -W / 2, R = W / 2;

/** A repeated presentation output, driven by the existing TV/Projector input route. */
function ProjectionSurface() {
  const feed = useTrainingStore((state) => venueScreenFeed(state, "monitor"));
  const ready = useTrainingStore((state) => venueScreenLive(state, "monitor"));
  return <group position={[0, 1.9, BACK + 0.195]}>
    <Slab p={[0, 0, 0]} s={[3.9, 2.08, 0.004]} c={ready ? "#263d60" : "#d1d2cf"} r={0.9} />
    <Text font={SCENE_FONT} position={[0, 0, 0.006]} fontSize={0.12} color={ready ? "#e5efff" : "#454c53"} textAlign="center">
      {sceneText(ready ? `ภาพจำลองจากสัญญาณจริง\n${feed}` : "ยังไม่มีภาพจากระบบ\nตรวจสายและเลือก Program")}
    </Text>
  </group>;
}
/** View through the windows: sky, campus trees and a city block. */
function windowView() {
  return tex.sign("window-view-2", 320, 220, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, 0, h * 0.7); sky.addColorStop(0, "#9cc6ec"); sky.addColorStop(1, "#e4f0fa");
    c.fillStyle = sky; c.fillRect(0, 0, w, h);
    c.fillStyle = "#c9cfd6"; c.fillRect(170, 60, 60, 110); c.fillRect(240, 85, 70, 85);
    c.fillStyle = "#8aa2bb"; for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) c.fillRect(176 + i * 18, 68 + j * 20, 10, 12);
    c.fillStyle = "#4f8a3f";
    for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(8 + i * 28, 150 - (i % 3) * 12, 30, 0, 7); c.fill(); }
    c.fillStyle = "#6c9d48"; c.fillRect(0, 170, w, h - 170);
  });
}

/** Large window with aluminium frame, mullions, sill and a venetian blind drawn to the top third. */
function Window({ z }: { z: number }) {
  const x = L + 0.06;
  const wd = 2.3, ht = 1.75, cy = 1.72;
  return <group>
    <Slab p={[x + 0.005, cy, z]} rot={[0, Math.PI / 2, 0]} s={[wd, ht, 0.01]} map={windowView()} c="#ffffff" e="#ffffff" ei={0.12} />
    {[ht / 2, -ht / 2].map((dy) => <RB key={dy} p={[x + 0.03, cy + dy, z]} s={[0.06, 0.06, wd + 0.06]} rad={0.008} {...CHROME} c="#c9cdd2" />)}
    {[-wd / 2, -wd / 6, wd / 6, wd / 2].map((dz) => <RB key={dz} p={[x + 0.03, cy, z + dz]} s={[0.06, ht, 0.05]} rad={0.008} {...CHROME} c="#c9cdd2" />)}
    <RB p={[x + 0.09, cy - ht / 2 - 0.03, z]} s={[0.18, 0.04, wd + 0.1]} rad={0.01} c="#ecebe6" />
    {/* blind slats (top third) + headrail + pull cord */}
    {Array.from({ length: 12 }, (_, i) => <RB key={i} p={[x + 0.1, cy + ht / 2 - 0.08 - i * 0.045, z]} rot={[0, 0, 0.55]} s={[0.05, 0.004, wd - 0.08]} rad={0.0015} c="#e9e9e6" r={0.5} />)}
    <RB p={[x + 0.1, cy + ht / 2 - 0.02, z]} s={[0.07, 0.05, wd]} rad={0.01} c="#dddcd6" />
    <Tube pts={[[x + 0.13, cy + ht / 2 - 0.05, z + wd / 2 - 0.1], [x + 0.13, cy, z + wd / 2 - 0.08]]} r={0.003} c="#ddd" />
  </group>;
}

/** Louvered 1200×600 LED troffer in the suspended ceiling. */
function CeilingTroffer({ p }: { p: V3 }) {
  return <group position={p}>
    <RB p={[0, 0, 0]} s={[1.2, 0.05, 0.6]} rad={0.01} c="#f4f4f2" m={0.3} r={0.4} />
    <Slab p={[0, -0.028, 0]} s={[1.12, 0.005, 0.52]} c="#ffffff" e="#f6f9ff" ei={1.2} />
    {[-0.37, 0, 0.37].map((x) => <Slab key={x} p={[x, -0.033, 0]} s={[0.012, 0.006, 0.52]} c="#d8dade" m={0.6} />)}
    {[-0.13, 0.13].map((z) => <Slab key={z} p={[0, -0.033, z]} s={[1.12, 0.006, 0.012]} c="#d8dade" m={0.6} />)}
  </group>;
}
/** Square AC diffuser with slats. */
function AcVent({ p }: { p: V3 }) {
  return <group position={p}>
    <RB p={[0, 0, 0]} s={[0.62, 0.03, 0.62]} rad={0.01} c="#eceeef" r={0.5} />
    {[-0.2, -0.1, 0, 0.1, 0.2].map((z) => <Slab key={z} p={[0, -0.018, z]} s={[0.52, 0.006, 0.05]} c="#bfc3c7" m={0.4} />)}
  </group>;
}
function Downlight({ p }: { p: V3 }) {
  return <group position={p}>
    <Cyl p={[0, 0, 0]} rt={0.07} h={0.02} c="#e9ebec" m={0.5} />
    <Cyl p={[0, -0.012, 0]} rt={0.05} h={0.004} c="#ffffff" e="#fff6e2" ei={2.2} />
  </group>;
}
/** Fabric acoustic panel with a thin frame. */
function AcousticPanel({ p, s, rot = [0, 0, 0], c }: { p: V3; s: [number, number]; rot?: V3; c: string }) {
  return <group position={p} rotation={rot}>
    <RB p={[0, 0, 0]} s={[s[0], s[1], 0.05]} rad={0.01} map={tex.fabric(c, [Math.max(1, s[0]), Math.max(1, s[1])])} c="#ffffff" r={0.96} />
  </group>;
}
/** Black two-way wall speaker on a bracket. */
function WallSpeaker({ p, yaw }: { p: V3; yaw: number }) {
  return <group position={p} rotation={[0, yaw, 0]}>
    <RB p={[0, 0, 0.04]} s={[0.05, 0.05, 0.08]} rad={0.01} {...BLACK_METAL} />
    <group position={[0, 0, 0.2]} rotation={[0.12, 0, 0]}>
      <RB p={[0, 0, 0]} s={[0.3, 0.46, 0.26]} rad={0.025} c="#16171a" r={0.6} />
      <RB p={[0, 0, 0.131]} s={[0.27, 0.43, 0.005]} rad={0.01} map={tex.fabric("#1c1d20", [1, 2])} c="#ffffff" r={0.95} />
    </group>
  </group>;
}
/** Track rail with spot heads aimed at the front wall. */
function TrackLights({ z, xs }: { z: number; xs: number[] }) {
  const y = H - 0.08;
  return <group>
    <RB p={[0, y, z]} s={[Math.max(...xs) - Math.min(...xs) + 1, 0.04, 0.05]} rad={0.012} {...BLACK_METAL} />
    {xs.map((x) => <group key={x} position={[x, y - 0.04, z]} rotation={[-0.6, 0, 0]}>
      <Cyl p={[0, -0.05, 0]} rt={0.012} h={0.1} {...BLACK_METAL} />
      <Cyl p={[0, -0.14, 0]} rt={0.045} rb={0.05} h={0.14} {...BLACK_METAL} />
      <Cyl p={[0, -0.212, 0]} rt={0.04} h={0.004} c="#fff8e8" e="#fff2d4" ei={2.4} />
    </group>)}
  </group>;
}
/** Potted indoor plant (fiddle-leaf style): pot, soil, stems, leaf clusters. */
function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  const leaves: V3[] = [[0.12, 1.05, 0.05], [-0.14, 0.95, 0.06], [0.05, 1.25, -0.08], [-0.08, 1.18, 0.12], [0.16, 0.82, -0.1], [-0.15, 0.75, -0.08], [0.02, 1.4, 0.02], [0.18, 1.3, 0.1], [-0.2, 1.12, -0.12]];
  return <group position={p} scale={s}>
    <Lathe p={[0, 0, 0]} prof={[[0, 0], [0.17, 0], [0.2, 0.42], [0.21, 0.44], [0, 0.44]]} c="#e9e7e2" r={0.55} />
    <Cyl p={[0, 0.43, 0]} rt={0.19} h={0.02} c="#3d2d20" r={1} />
    {leaves.map((l, i) => <group key={i}>
      <Tube pts={[[0, 0.43, 0], [l[0] * 0.5, (l[1] + 0.43) / 2, l[2] * 0.5], l]} r={0.008} c="#4d6b2c" />
      <Ball p={l} r={0.11} sc={[1, 0.45, 0.7]} c={i % 2 ? "#3f7d32" : "#4f8f3a"} rough={0.7} />
    </group>)}
  </group>;
}
/** Softbox on a light stand beside the camera, aimed at the teaching area. */
function Softbox({ p, intensity = 8 }: { p: V3; intensity?: number }) {
  const target = useMemo(() => {
    const t = new Object3D(); t.position.set(0.1, 1.2, k(-3.72)); return t;
  }, []);
  const dx = target.position.x - p[0], dz = target.position.z - p[2];
  const yaw = Math.atan2(dx, dz), pitch = Math.atan2(2.15 - target.position.y, Math.hypot(dx, dz));
  return <>
    <group position={p} rotation={[0, yaw, 0]}>
      {[0, 1, 2].map((i) => { const a = i * Math.PI * 2 / 3; return <Tube key={i} pts={[[0, 0.4, 0], [Math.cos(a) * 0.38, 0.025, Math.sin(a) * 0.38]]} r={0.012} {...BLACK_METAL} />; })}
      <Cyl p={[0, 1.07, 0]} rt={0.016} h={2.09} {...STEEL} />
      <Cyl p={[0, 1.55, 0]} rt={0.025} h={0.05} {...BLACK_METAL} />
      <group position={[0, 2.15, 0]} rotation={[pitch, 0, 0]}>
        <RB p={[0, 0, -0.1]} s={[0.14, 0.14, 0.18]} rad={0.02} {...BLACK_METAL} />
        <RB p={[0, 0, 0.025]} s={[0.7, 0.52, 0.18]} rad={0.035} c="#25272b" r={0.85} />
        <Slab p={[0, 0, 0.12]} s={[0.64, 0.46, 0.008]} c="#fffdf7" e="#f7f8ff" ei={0.65} />
        <Tube pts={[[-0.4, 0.1, 0], [-0.4, -0.32, 0], [0.4, -0.32, 0], [0.4, 0.1, 0]]} r={0.012} {...BLACK_METAL} />
      </group>
    </group>
    <primitive object={target} />
    <spotLight position={[p[0], 2.15, p[2]]} target={target} angle={0.55} penumbra={0.85} intensity={intensity} distance={12} color="#f7f8ff" />
  </>;
}

/** The camera is installed even in the introductory laptop-only exercise. */
function InstalledClassroomCamera() {
  const active = useTrainingStore((state) => scenarioOf(state).devices.some((d) => d.id === "cam1"));
  const spot = LAYOUTS.classroom.places.cam1;
  if (active) return null;
  return <group position={spot.p} rotation={[0, spot.yaw, 0]}>
    <GenericDevice bare device={{ id: "cam1", label: "กล้องผู้สอน", model: "กล้องฝึก HDMI", verified: false, generic: true, kind: "camera", size: [0.32, 1.5, 0.45], color: "#263345", position: spot.p }} />
    <RigidBody type="fixed" colliders={false}><CylinderCollider position={[0, 0.5, 0]} args={[0.5, 0.36]} /></RigidBody>
  </group>;
}

/** Confidence repeater shares the projector's evaluated input, including no-signal and power states. */
function ClassroomConfidenceScreen() {
  const feed = useTrainingStore((state) => venueScreenFeed(state, "monitor"));
  const [x, , z] = LAYOUTS.classroom.places.monitor.p;
  return <group position={[x, 0, z]}>
    <Cyl p={[0, 1.22, -0.04]} rt={0.018} h={0.48} {...BLACK_METAL} />
    <RB p={[0, 1.55, -0.04]} s={[0.92, 0.55, 0.06]} rad={0.018} c="#20252c" />
    <Slab p={[0, 1.55, -0.006]} s={[0.86, 0.49, 0.004]} c="#101b2a" />
    <Text font={SCENE_FONT} position={[0, 1.55, 0]} fontSize={0.047} maxWidth={0.8} color="#dce8f4" textAlign="center">{sceneText(feed)}</Text>
    <Text font={SCENE_FONT} position={[0, 1.9, 0]} fontSize={0.05} color="#384556">จอตรวจภาพโปรเจกเตอร์</Text>
  </group>;
}

/** Mobile whiteboard on a steel frame with casters. */
function MobileWhiteboard({ p, yaw }: { p: V3; yaw: number }) {
  return <group position={p} rotation={[0, yaw, 0]}>
    <RB p={[0, 1.45, 0]} s={[1.8, 1.1, 0.04]} rad={0.015} {...CHROME} c="#c8ccd1" />
    <Slab p={[0, 1.45, 0.022]} s={[1.74, 1.04, 0.004]} c="#fbfbf8" r={0.12} />
    <Text font={SCENE_FONT} position={[0, 1.78, 0.027]} fontSize={0.07} color="#1d4fb0">{sceneText("HDMI 101 | ฝึกต่อสัญญาณภาพ")}</Text>
    <Text font={SCENE_FONT} position={[0, 1.45, 0.027]} fontSize={0.065} color="#283a4d">{sceneText("กล้อง → เครื่องสลับภาพ → จอ")}</Text>
    <Text font={SCENE_FONT} position={[0, 1.15, 0.027]} fontSize={0.045} color="#1e7a3a">{sceneText("ต่อขาออก → ขาเข้า แล้วตรวจภาพออกอากาศ")}</Text>
    <RB p={[0, 0.87, 0.05]} s={[1.6, 0.03, 0.08]} rad={0.01} {...CHROME} c="#b8bdc3" />
    {[-0.93, 0.93].map((x) => <group key={x}>
      <RB p={[x, 0.95, 0]} s={[0.04, 1.9, 0.04]} rad={0.01} {...STEEL} />
      <RB p={[x, 0.08, 0]} s={[0.05, 0.04, 0.6]} rad={0.01} {...STEEL} />
      {[-0.27, 0.27].map((z) => <Cyl key={z} p={[x, 0.035, z]} rt={0.035} h={0.03} rot={[0, 0, Math.PI / 2]} c="#2a2a2a" r={0.8} />)}
    </group>)}
    {["#1d4fb0", "#c0302a", "#111"].map((c, i) => <group key={c} position={[-0.5 + i * 0.14, 0.9, 0.06]} rotation={[0, 0, Math.PI / 2]}>
      <Cyl p={[0, 0, 0]} rt={0.011} h={0.12} c="#f2f2f2" r={0.4} />
      <Cyl p={[0, 0.07, 0]} rt={0.012} h={0.035} c={c} r={0.4} />
    </group>)}
  </group>;
}
/** Tall steel shelving above the portable-gear cabinet: camera cases, cable coils, headsets, boxes. */
function StorageShelving({ x, z, len }: { x: number; z: number; len: number }) {
  const shelves = [1.32, 1.82, 2.32];
  const posts = [-len / 2, -len / 6, len / 6, len / 2];
  const depth = 0.42, fx = x - depth / 2; // front edge (room side)
  return <group>
    {posts.flatMap((dz) => [x - depth / 2 + 0.02, x + depth / 2 - 0.02].map((px) => <RB key={`${dz}${px}`} p={[px, 1.4, z + dz]} s={[0.035, 2.8, 0.035]} rad={0.006} {...STEEL} c="#6f757d" />))}
    {shelves.map((y) => <RB key={y} p={[x, y, z]} s={[depth, 0.025, len]} rad={0.004} {...STEEL} c="#7b828a" />)}
    {/* row 1: camera cases */}
    {[-1.05, -0.45, 0.2, 0.85].map((dz, i) => <group key={dz} position={[x + 0.02, shelves[0] + 0.15, z + dz]}>
      <RB p={[0, 0, 0]} s={[0.34, 0.28, 0.5]} rad={0.02} c={i % 2 ? "#1b1c1f" : "#2a2c30"} r={0.7} />
      <RB p={[-0.172, 0.04, 0]} s={[0.01, 0.06, 0.2]} rad={0.004} {...CHROME} />
    </group>)}
    {/* row 2: cable coils + headsets */}
    {[-1.1, -0.7, -0.3, 0.1].map((dz, i) => <mesh key={dz} position={[fx + 0.18, shelves[1] + 0.13, z + dz]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.12, 0.028, 10, 28]} /><meshStandardMaterial color={["#e0702a", "#141414", "#2b5fd0", "#141414"][i]} roughness={0.6} />
    </mesh>)}
    {[0.55, 0.95].map((dz) => <group key={dz} position={[fx + 0.16, shelves[1] + 0.1, z + dz]}>
      <Lathe p={[0, 0.06, 0]} rot={[0, 0, Math.PI / 2]} prof={[[0.0, 0.0], [0.09, 0], [0.09, 0.012], [0, 0.012]]} c="#141414" />
      {[-0.08, 0.08].map((dy) => <Cyl key={dy} p={[0, 0.02, dy]} rt={0.045} h={0.04} rot={[Math.PI / 2, 0, 0]} c="#202124" r={0.6} />)}
    </group>)}
    {/* row 3: labelled storage boxes + small cases */}
    {[-1.1, -0.55, 0, 0.55, 1.05].map((dz, i) => <RB key={dz} p={[x + 0.02, shelves[2] + 0.13, z + dz]} s={[0.34, 0.24, 0.42]} rad={0.015} c={["#2a2c30", "#d9d6cf", "#2a2c30", "#3c3f45", "#d9d6cf"][i]} r={0.7} />)}
  </group>;
}
/** Ceiling-mounted projector with drop pole, aimed at the front screen. */
function CeilingProjector({ p }: { p: V3 }) {
  return <group position={p}>
    <Cyl p={[0, -0.2, 0]} rt={0.022} h={0.4} {...STEEL} />
    <RB p={[0, -0.42, 0]} s={[0.38, 0.13, 0.32]} rad={0.035} c="#f1f1ef" r={0.4} />
    <RB p={[0, -0.49, 0]} s={[0.3, 0.02, 0.26]} rad={0.01} c="#d8d8d5" />
    <Cyl p={[0.09, -0.42, -0.17]} rt={0.045} h={0.04} rot={[Math.PI / 2, 0, 0]} c="#151515" m={0.3} r={0.2} />
    <Cyl p={[0.09, -0.42, -0.192]} rt={0.035} h={0.004} rot={[Math.PI / 2, 0, 0]} c="#9cc7ff" e="#cfe3ff" ei={1.8} />
  </group>;
}

/** The functional scenario gear occupies the desk; only its modesty panel and chair are scenery. */
function TeacherDeskDressing({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <RB p={[0, 0.4, 0.7]} s={[3.5, 0.7, 0.03]} rad={0.006} c="#2f3338" r={0.6} />
    {/* office chair behind the desk */}
    <group position={[0.1, 0, -1.05]} rotation={[0, Math.PI, 0]}>
      {[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return <Tube key={i} pts={[[0, 0.08, 0], [Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3]]} r={0.014} {...BLACK_METAL} />; })}
      <Cyl p={[0, 0.27, 0]} rt={0.025} h={0.38} {...CHROME} />
      <RB p={[0, 0.48, 0]} s={[0.48, 0.07, 0.46]} rad={0.03} c="#1f2e55" r={0.7} />
      <RB p={[0, 0.82, 0.22]} rot={[-0.1, 0, 0]} s={[0.46, 0.58, 0.06]} rad={0.03} c="#1f2e55" r={0.7} />
    </group>
  </group>;
}
/** Black flight case on casters (equipment storage on the floor). */
function RoadCase({ p, s, yaw = 0 }: { p: V3; s: V3; yaw?: number }) {
  const [w, h, d] = s;
  return <group position={p} rotation={[0, yaw, 0]}>
    <RB p={[0, 0.08 + (h - 0.08) / 2, 0]} s={[w, h - 0.08, d]} rad={0.02} map={tex.fabric("#1d1e21", [2, 2])} c="#ffffff" r={0.85} />
    {[0.09, h - 0.02].map((y) => <RB key={y} p={[0, y, 0]} s={[w + 0.006, 0.02, d + 0.006]} rad={0.005} {...CHROME} c="#c4c8cc" />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Ball key={`${a}${b}`} p={[a * w / 2, h - 0.02, b * d / 2]} r={0.025} {...CHROME} />))}
    {[-w / 3, w / 3].map((x) => <RB key={x} p={[x, h * 0.6, d / 2 + 0.008]} s={[0.07, 0.08, 0.02]} rad={0.006} {...CHROME} />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Cyl key={`w${a}${b}`} p={[a * (w / 2 - 0.08), 0.04, b * (d / 2 - 0.08)]} rt={0.04} h={0.03} rot={[0, 0, Math.PI / 2]} c="#141414" r={0.9} />))}
  </group>;
}
/** Equipment table under the windows: wireless receivers, a small mixer, cases stored underneath. */
function WindowGearTable({ x, z, len }: { x: number; z: number; len: number }) {
  const h = 0.78, d = 0.6;
  return <group position={[x, 0, z]}>
    <RB p={[0, h - 0.02, 0]} s={[d, 0.04, len]} rad={0.01} map={tex.wood("#d9bf94", [1, Math.max(1, len)])} c="#ffffff" r={0.45} />
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <RB key={`${a}${b}`} p={[a * (d / 2 - 0.04), (h - 0.04) / 2, b * (len / 2 - 0.05)]} s={[0.04, h - 0.04, 0.04]} rad={0.008} {...BLACK_METAL} />))}
    <RB p={[0, 0.2, 0]} s={[d - 0.06, 0.025, len - 0.1]} rad={0.004} c="#2b2e33" m={0.4} />
    {/* receivers, a 4-channel mixer, headphones */}
    {[-0.8, -0.45].map((dz) => <group key={dz} position={[0.05, h, dz]}>
      <RB p={[0, 0.035, 0]} s={[0.16, 0.06, 0.22]} rad={0.01} c="#1c1d20" />
      {[-0.07, 0.07].map((a) => <Cyl key={a} p={[-0.04, 0.15, a]} rt={0.005} h={0.18} c="#111" />)}
      <Ball p={[0.081, 0.045, 0.06]} r={0.006} c="#284735" />
    </group>)}
    <group position={[0.05, h, 0.15]}>
      <RB p={[0, 0.03, 0]} s={[0.3, 0.05, 0.36]} rad={0.012} c="#26282c" />
      {[-0.09, -0.03, 0.03, 0.09].flatMap((dz) => [0.08, -0.02, -0.1].map((dx) => <Cyl key={`${dz}${dx}`} p={[dx, 0.065, dz]} rt={0.012} h={0.02} c={dx > 0 ? "#d8d8d8" : "#303236"} />))}
    </group>
    <mesh position={[0.1, h + 0.05, 0.7]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.012, 8, 24, Math.PI]} /><meshStandardMaterial color="#141414" roughness={0.6} /></mesh>
    {[-0.6, 0.35].map((dz) => <RoadCase key={dz} p={[0, 0.215, dz]} s={[0.5, 0.36, 0.7]} />)}
  </group>;
}

export function Classroom() {
  const floor = tex.tiles("#8f9498", "#7b8085", 3, [W / 2.4, D / 2.4]);
  const wall = tex.paint("#e6e4df", [4, 2]);
  const lowerWall = tex.paint("#a9adb2", [6, 1]);
  const ceiling = tex.tiles("#e9e9e6", "#c9c9c4", 2, [W / 1.2, D / 1.2]);
  const slats = tex.wood("#b88a58", [6, 1]);
  const door = tex.wood("#a8723f", [1, 2]);

  return <>
    <color attach="background" args={["#e3e6e9"]} />
    <VenueLighting mood="classroom" intensity={0.45} />
    <hemisphereLight args={["#f4f6fa", "#77746f", 0.5]} />
    <ambientLight intensity={0.04} />
    {/* daylight through the window wall (left) */}
    <directionalLight position={[-12, 5, 1]} target-position={[0, 0, 0]} intensity={0.95} color="#f8f9ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-normalBias={0.03} />
    {/* Broad ceiling fill avoids the bright point-light patches on the suspended tiles. */}
    <directionalLight position={[0, 8, 3]} intensity={0.45} color="#f3f6ff" />

    {/* shell: polished tile floor, white walls with a grey lower band and skirting, suspended ceiling */}
    <Slab p={[0, -0.05, 0]} s={[W, 0.1, D]} map={floor} c="#ffffff" r={0.32} m={0.08} />
    <Slab p={[0, H + 0.02, 0]} s={[W, 0.04, D]} map={ceiling} c="#ffffff" r={0.9} />
    {([[0, BACK, W, 0], [0, D / 2, W, 0], [L, 0, D, 1], [R, 0, D, 1]] as const).map(([x, z, len, side], i) => <group key={i}>
      <Slab p={[x, H / 2, z]} s={side ? [0.1, H, len] : [len, H, 0.1]} map={wall} c="#ffffff" r={0.85} />
      {i !== 0 && <Slab p={[x + (side ? Math.sign(-x) * 0.055 : 0), 0.5, z + (side ? 0 : Math.sign(-z) * 0.055)]} s={side ? [0.01, 1.0, len] : [len, 1.0, 0.01]} map={lowerWall} c="#ffffff" r={0.6} />}
      <Slab p={[x + (side ? Math.sign(-x) * 0.06 : 0), 0.05, z + (side ? 0 : Math.sign(-z) * 0.06)]} s={side ? [0.02, 0.1, len] : [len, 0.1, 0.02]} c="#4a4d52" r={0.5} />
    </group>)}
    {[-4.6, -2.3, 0, 2.3, 4.6].flatMap((x) => [-2.6, 0.2, 3].map((z) => <CeilingTroffer key={`${x}${z}`} p={[k(x), H - 0.005, k(z)]} />))}
    {[-3.45, 3.45].flatMap((x) => [-1.2, 1.6].map((z) => <AcVent key={`${x}${z}`} p={[k(x), H - 0.005, k(z)]} />))}
    {[-5.2, 5.2].flatMap((x) => [-3.6, -1.2, 1.2, 3.6].map((z) => <Downlight key={`${x}${z}`} p={[k(x), H - 0.005, k(z)]} />))}
    <CeilingProjector p={[0, H - 0.02, k(-0.2)]} />

    {/* front wall: wood-slat feature wall, centred projector screen, grey acoustic panels, corner speakers, track lights */}
    <group position={[0, 0, BACK + 0.06]}>
      <RB p={[0, H / 2 - 0.05, 0.03]} s={[k(5.6), H - 0.1, 0.04]} rad={0.01} c="#a77a4c" r={0.6} />
      {Array.from({ length: Math.round(k(5.6) / 0.09) }, (_, i) => <RB key={i} p={[-k(2.8) + 0.045 + i * 0.09, H / 2 - 0.05, 0.065]} s={[0.05, H - 0.14, 0.03]} rad={0.006} map={slats} c="#ffffff" r={0.55} />)}
      {[-1, 1].map((sd) => <group key={sd}>
        {[0, 1].flatMap((col) => [0, 1].map((row) => <AcousticPanel key={`${col}${row}`} p={[sd * (k(3.35) + col * 1.02), 1.55 + row * 1.02, 0.05]} s={[0.98, 0.98]} c={(col + row) % 2 ? "#8f969c" : "#a7adb2"} />))}
        <WallSpeaker p={[sd * (k(2.8) + 0.45), H - 0.7, 0]} yaw={0} />
      </group>)}
      {/* projector screen centred over the teacher desk */}
      <RB p={[0, 2.98, 0.14]} s={[4.3, 0.12, 0.14]} rad={0.04} c="#f2f2f0" />
      <RB p={[0, 1.9, 0.12]} s={[4.06, 2.24, 0.02]} rad={0.004} c="#1a1a1a" />

    </group>
    <ProjectionSurface />
    <TrackLights z={BACK + 1.0} xs={[-3.2, -1.6, 0, 1.6, 3.2]} />
    <TeacherDeskDressing x={0} z={k(-3.0)} />
    <MobileWhiteboard p={[k(-3.1), 0, BACK + 0.95]} yaw={0.18} />

    {/* left wall: large windows with blinds, acoustic panel near the front, softbox beside the camera, AV cart */}
    {[-2.75, 0, 2.75].map((z) => <Window key={z} z={k(z)} />)}
    <AcousticPanel p={[L + 0.08, 1.9, BACK + 0.9]} rot={[0, Math.PI / 2, 0]} s={[1.0, 1.6]} c="#5d78a8" />
    <InstalledClassroomCamera />
    <ClassroomConfidenceScreen />
    <Softbox p={[-7.1, 0, -4.65]} intensity={8} />
    <Softbox p={[4.6, 0, -4.1]} intensity={4} />
    <AvCart p={[k(-5.3), 0, k(3.45)]} frame={STEEL} />
    {/* wireless receivers + small mixer on the cart */}
    {[-0.16, 0.12].map((dz, i) => <group key={dz} position={[k(-5.3) + (i ? 0.1 : -0.12), 0.86, k(3.45) + dz]}>
      <RB p={[0, 0.03, 0]} s={[0.2, 0.05, 0.14]} rad={0.01} c="#1c1d20" />
      <Cyl p={[-0.07, 0.13, -0.05]} rt={0.005} h={0.16} c="#111" />
      <Cyl p={[0.07, 0.13, -0.05]} rt={0.005} h={0.16} c="#111" />
      <Ball p={[0.06, 0.04, 0.071]} r={0.006} c="#284735" />
    </group>)}
    <WindowGearTable x={L + 0.42} z={k(-1.35)} len={2.4} />
    <Plant p={[L + 0.45, 0, k(-2.95)]} s={0.85} />

    {/* right wall: tall steel shelving over the gear cabinet, blue / grey acoustic panels, door */}
    <StorageShelving x={R - 0.25} z={k(0.1)} len={2.9} />
    <RoadCase p={[R - 0.55, 0, k(-1.65)]} s={[0.62, 0.72, 0.62]} yaw={0.15} />
    {[-3.55, -2.3, 2.0, 3.25].map((zb, i) => <AcousticPanel key={zb} p={[R - 0.08, 2.05, k(zb)]} rot={[0, -Math.PI / 2, 0]} s={[1.1, 1.6]} c={i % 2 ? "#5d78a8" : "#8f969c"} />)}
    <group position={[R - 0.06, 0, k(2.0) + 1.1]}>
      <RB p={[-0.02, 1.08, 0]} s={[0.06, 2.18, 1.12]} rad={0.012} c="#e9e6df" />
      <RB p={[-0.04, 1.05, 0]} s={[0.05, 2.08, 1.0]} rad={0.01} map={door} c="#ffffff" r={0.5} />
      <RB p={[-0.07, 1.55, 0.18]} s={[0.01, 0.42, 0.16]} rad={0.004} c="#d8ecff" e="#d8ecff" ei={0.3} />
      <Tube pts={[[-0.1, 1.0, -0.4], [-0.15, 1.0, -0.4], [-0.15, 1.0, -0.26]]} r={0.01} {...CHROME} />
    </group>
    <Plant p={[R - 0.5, 0, BACK + 0.55]} s={1.0} />

    {/* back wall: acoustic panel band, wall speaker pair, fire extinguisher by the door side */}
    {[-4.5, -2.25, 0, 2.25].map((x, i) => <AcousticPanel key={x} p={[k(x), 1.95, D / 2 - 0.08]} rot={[0, Math.PI, 0]} s={[1.6, 1.2]} c={i % 2 ? "#8f969c" : "#5d78a8"} />)}
    <group position={[R - 0.16, 0, D / 2 - 0.35]}>
      <Lathe p={[0, 0, 0]} prof={[[0, 0], [0.075, 0], [0.08, 0.04], [0.08, 0.5], [0.06, 0.56], [0.025, 0.6], [0, 0.6]]} c="#c8201d" r={0.3} m={0.2} />
      <RB p={[0, 0.63, 0]} s={[0.05, 0.06, 0.05]} rad={0.012} {...BLACK_METAL} />
    </group>

    {/* Job layout (game/training/venue-layouts.ts): teacher desk front-centre, 2-seat student tables, AV desk rear-right,
        gear cabinet on the right wall, cable shelf by the AV desk, TV on its stand front-right. */}
    <LayoutFurniture layout={LAYOUTS.classroom} look={{ top: "#d9bf94", frame: { ...BLACK_METAL, c: "#25282d" } }} />
    <LayoutColliders layout={LAYOUTS.classroom} />
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[k(-3.1), 0.95, BACK + 0.95]} args={[0.95, 0.95, 0.35]} />
      <CuboidCollider position={[k(-5.3), 0.5, k(3.45)]} args={[0.34, 0.5, 0.28]} />
      <CuboidCollider position={[-7.1, 1.1, -4.65]} args={[0.26, 1.1, 0.26]} />
      <CuboidCollider position={[4.6, 1.1, -4.1]} args={[0.26, 1.1, 0.26]} />
      <CuboidCollider position={[L + 0.42, 0.4, k(-1.35)]} args={[0.32, 0.4, 1.22]} />
      <CuboidCollider position={[R - 0.55, 0.36, k(-1.65)]} args={[0.34, 0.36, 0.34]} />
      <CuboidCollider position={[0.1, 0.5, k(-3.0) - 1.05]} args={[0.3, 0.5, 0.3]} />
    </RigidBody>
  </>;
}
