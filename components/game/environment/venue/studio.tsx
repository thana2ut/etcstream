"use client";

import { SCENE_FONT, sceneText } from "@/game/rendering/scene-font";
import { useMemo } from "react";
import { CylinderGeometry, DoubleSide } from "three";
import { LightStand, VenueLighting, BLACK_METAL, CHROME, Cyl, D, g, Instanced, merge, place, RB, Slab, STEEL, Tube, type Placement, type V3 } from "./kit";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { LAYOUTS, STUDIO_MISSION_SETS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";
import { tex } from "./textures";
import { Text } from "@react-three/drei";
import { useTrainingStore } from "@/game/stores/training-store";
import { Hcx2000Model } from "../../equipment/hc-x2000";
import { scenarioOf } from "@/game/training/hdmi-training";
import { studioSignalFeed } from "@/game/training/monitor-feed";

/**
 * Mission Hall S venue (layout `studioMission`): enlarged TV studio — black box, green cyclorama, pipe lighting grid, jib,
 * gallery window. Mission-only: the free-practice Studio Room 01 (studio-room-01.tsx / GLB) is a separate scene and is untouched.
 */
const ROOM = { x0: -8.6, x1: 8.6, z0: -D / 2 - 0.05, z1: 9.5, h: 6.4 };
const SETS = STUDIO_MISSION_SETS;

/** Installed repeaters show only state from the playable signal graph. */
function SignalPanel({ channel, size }: { channel: "program" | "inputs" | "recording" | "audio"; size: [number, number] }) {
  const feed = useTrainingStore((state) => studioSignalFeed(state, channel));
  const [w, h] = size;
  return <group>
    <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial color="#080e17" toneMapped={false} /></mesh>
    <Text font={SCENE_FONT} position={[0, 0, 0.003]} fontSize={Math.min(h / 5.8, w / 23)} maxWidth={w * 0.94} color="#cbd8e6" textAlign="center">{sceneText(feed)}</Text>
  </group>;
}

/** Night city skyline for the news-set video wall. */
function skylineTexture() {
  return tex.sign("news-skyline", 1024, 384, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#081633"); sky.addColorStop(0.65, "#163c86"); sky.addColorStop(1, "#0a1a3a");
    c.fillStyle = sky; c.fillRect(0, 0, w, h);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let x = 0; x < w; ) {
      const bw = 26 + rnd() * 60, bh = 70 + rnd() * 220;
      c.fillStyle = rnd() > 0.5 ? "#0c1b3d" : "#10234c"; c.fillRect(x, h - 60 - bh, bw, bh);
      for (let yy = h - 60 - bh + 8; yy < h - 66; yy += 12) for (let xx = x + 4; xx < x + bw - 6; xx += 9) if (rnd() > 0.45) { c.fillStyle = rnd() > 0.7 ? "#ffd27a" : "#9fd0ff"; c.fillRect(xx, yy, 4, 5); }
      x += bw + 4;
    }
    c.fillStyle = "#0b2a5e"; c.fillRect(0, h - 60, w, 60);
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(120,190,255,${0.15 + rnd() * 0.3})`; c.fillRect(rnd() * w, h - 50 + rnd() * 40, 30 + rnd() * 80, 2); }
  });
}
/** Globe graphic for the front of the news desk. */
function globeTexture() {
  return tex.sign("news-globe", 512, 160, (c, w, h) => {
    const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, "#0b2f78"); g2.addColorStop(0.5, "#1d5ad0"); g2.addColorStop(1, "#0b2f78");
    c.fillStyle = g2; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(170,215,255,.85)"; c.lineWidth = 2;
    c.beginPath(); c.arc(w / 2, h / 2, 56, 0, 7); c.stroke();
    for (const r of [20, 40]) { c.beginPath(); c.ellipse(w / 2, h / 2, r, 56, 0, 0, 7); c.stroke(); }
    for (const dy of [-28, 0, 28]) { c.beginPath(); c.moveTo(w / 2 - 54, h / 2 + dy); c.lineTo(w / 2 + 54, h / 2 + dy); c.stroke(); }
  });
}
/** Vertical wood slats with an LED strip at the base and top (premium set wall). */
function WoodSlatWall({ p, w, h, rot = [0, 0, 0], led = "#ffcf8a" }: { p: V3; w: number; h: number; rot?: V3; led?: string }) {
  const wood = tex.wood("#9a6a3c", [1, 3]);
  const n = Math.round(w / 0.1);
  return <group position={p} rotation={rot}>
    <RB p={[0, h / 2, -0.03]} s={[w, h, 0.04]} rad={0.01} c="#2a1d14" r={0.8} />
    {Array.from({ length: n }, (_, i) => <RB key={i} p={[-w / 2 + 0.05 + i * (w / n), h / 2, 0.01]} s={[0.055, h - 0.08, 0.035]} rad={0.006} map={wood} c="#ffffff" r={0.55} />)}
    {[0.06, h - 0.06].map((y) => <Slab key={y} p={[0, y, 0.04]} s={[w, 0.025, 0.01]} c="#ffffff" e={led} ei={2.6} />)}
  </group>;
}
/** News set: low riser, illuminated anchor desk, two chairs, skyline video wall flanked by wood slats. */
function NewsSet({ p, yaw }: { p: V3; yaw: number }) {
  const sky = skylineTexture(), globe = globeTexture();
  return <group position={p} rotation={[0, yaw, 0]}>
    {/* riser with LED edge */}
    <RB p={[0, 0.1, 0]} s={[3.8, 0.2, 2.6]} rad={0.02} c="#1c1f25" m={0.3} r={0.35} />
    <Slab p={[0, 0.2, 1.31]} s={[3.8, 0.02, 0.01]} c="#ffffff" e="#ffc878" ei={2.4} />
    <Slab p={[1.91, 0.2, 0]} s={[0.01, 0.02, 2.6]} c="#ffffff" e="#ffc878" ei={2.4} />
    {/* video wall */}
    <group position={[0, 0.2, -1.15]}>
      <RB p={[0, 1.45, -0.06]} s={[3.1, 2.1, 0.1]} rad={0.02} c="#0b0c10" />
      <mesh position={[0, 1.45, 0.0]}><planeGeometry args={[2.98, 1.92]} /><meshBasicMaterial map={sky} toneMapped={false} /></mesh>
      {[-1, 1].map((sd) => <WoodSlatWall key={sd} p={[sd * 1.75, 0, -0.04]} w={0.45} h={2.9} led="#7fb4ff" />)}
      <RB p={[0, 2.75, 0.02]} s={[3.9, 0.22, 0.25]} rad={0.02} map={tex.wood("#a77748", [3, 1])} c="#ffffff" r={0.6} />
      <Slab p={[0, 2.63, 0.15]} s={[3.8, 0.02, 0.01]} c="#ffffff" e="#ffc878" ei={2.6} />
    </group>
    {/* curved-front anchor desk: white top, glowing globe panel, LED base */}
    <group position={[0, 0.2, 0.15]}>
      <RB p={[0, 0.74, 0]} s={[2.4, 0.06, 0.8]} rad={0.03} c="#e8ecf2" m={0.2} r={0.25} />
      <RB p={[0, 0.38, 0.05]} s={[2.3, 0.7, 0.62]} rad={0.03} c="#c7ccd4" m={0.5} r={0.3} />
      <mesh position={[0, 0.4, 0.37]}><planeGeometry args={[1.5, 0.46]} /><meshBasicMaterial map={globe} toneMapped={false} /></mesh>
      <Slab p={[0, 0.03, 0.37]} s={[2.3, 0.02, 0.01]} c="#ffffff" e="#ffd08a" ei={2.6} />
      {[-0.5, 0.5].map((x) => <group key={x} position={[x, 0, -0.65]}>
        <Cyl p={[0, 0.32, 0]} rt={0.025} h={0.5} {...CHROME} />
        <RB p={[0, 0.6, 0]} s={[0.5, 0.08, 0.48]} rad={0.03} c="#16171a" r={0.6} />
        <RB p={[0, 0.98, -0.22]} rot={[-0.08, 0, 0]} s={[0.48, 0.7, 0.08]} rad={0.03} c="#16171a" r={0.6} />
        <Cyl p={[0, 0.07, 0]} rt={0.26} h={0.03} {...CHROME} />
      </group>)}
    </group>
    <pointLight position={[0, 1.6, 1.2]} intensity={6} distance={5} color="#5d8cff" />
  </group>;
}
/** Interview corner: rug, two armchairs, round coffee table, plant, warm lamp light. */
function InterviewCorner({ p, yaw }: { p: V3; yaw: number }) {
  const chair = (x: number, ry: number) => <group position={[x, 0, 0]} rotation={[0, ry, 0]}>
    <RB p={[0, 0.25, 0]} s={[0.78, 0.3, 0.76]} rad={0.08} c="#e8e2d6" r={0.9} />
    <RB p={[0, 0.66, -0.31]} rot={[-0.12, 0, 0]} s={[0.78, 0.6, 0.18]} rad={0.08} c="#e8e2d6" r={0.9} />
    {[-1, 1].map((s) => <RB key={s} p={[s * 0.36, 0.45, 0]} s={[0.12, 0.3, 0.74]} rad={0.05} c="#ded7ca" r={0.9} />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Cyl key={`${a}${b}`} p={[a * 0.3, 0.05, b * 0.28]} rt={0.02} h={0.1} c="#3b2a1d" />))}
  </group>;
  return <group position={p} rotation={[0, yaw, 0]}>
    <Cyl p={[0, 0.005, 0]} rt={1.5} h={0.01} seg={48} map={tex.fabric("#d9d2c4", [4, 4])} c="#ffffff" r={1} />
    {chair(-0.85, 0.5)}
    {chair(0.85, -0.5)}
    <group position={[0, 0, 0.15]}>
      <Cyl p={[0, 0.48, 0]} rt={0.36} h={0.035} map={tex.wood("#8a5a34")} c="#ffffff" r={0.5} />
      <Cyl p={[0, 0.24, 0]} rt={0.03} h={0.46} {...BLACK_METAL} />
      <Cyl p={[0, 0.015, 0]} rt={0.22} h={0.03} {...BLACK_METAL} />
      <Cyl p={[0.1, 0.55, 0.05]} rt={0.035} h={0.09} c="#f2f2f2" r={0.3} />
    </group>
    {/* plant in a tall pot */}
    <group position={[1.55, 0, -0.9]}>
      <Cyl p={[0, 0.3, 0]} rt={0.2} rb={0.16} h={0.6} c="#2b2b2b" r={0.6} />
      {[[0.12, 1.05, 0.05], [-0.14, 0.95, 0.06], [0.05, 1.3, -0.08], [-0.08, 1.2, 0.12], [0.18, 0.85, -0.1], [-0.18, 0.8, -0.08], [0.02, 1.45, 0.02]].map((l, i) => <group key={i}>
        <Tube pts={[[0, 0.6, 0], [l[0] * 0.5, (l[1] + 0.6) / 2, l[2] * 0.5], l as V3]} r={0.008} c="#4d6b2c" />
        <mesh position={l as V3} scale={[1, 0.45, 0.7]}><sphereGeometry args={[0.13, 12, 8]} /><meshStandardMaterial color={i % 2 ? "#3f7d32" : "#4f8f3a"} roughness={0.7} /></mesh>
      </group>)}
    </group>
    <pointLight position={[0, 2.0, 0.4]} intensity={10} distance={5.5} color="#ffcc88" />
    <RigidBody type="fixed" colliders={false}>
      {[-0.85, 0.85].map((x) => <CuboidCollider key={x} position={[x, 0.45, 0]} rotation={[0, x < 0 ? 0.5 : -0.5, 0]} args={[0.42, 0.45, 0.42]} />)}
      <CylinderCollider position={[0, 0.24, 0.15]} args={[0.24, 0.36]} />
      <CylinderCollider position={[1.55, 0.3, -0.9]} args={[0.3, 0.22]} />
    </RigidBody>
  </group>;
}
/** Straight dolly track (two rails on sleepers). */
function DollyTrack({ p, len, yaw }: { p: V3; len: number; yaw: number }) {
  return <group position={p} rotation={[0, yaw, 0]}>
    {[-0.3, 0.3].map((x) => <Tube key={x} pts={[[x, 0.04, -len / 2], [x, 0.04, len / 2]]} r={0.02} {...CHROME} />)}
    {Array.from({ length: Math.floor(len / 0.6) + 1 }, (_, i) => <RB key={i} p={[0, 0.015, -len / 2 + i * 0.6]} s={[0.8, 0.03, 0.08]} rad={0.008} {...BLACK_METAL} />)}
  </group>;
}
/** Hanging production monitor from the grid. */
function HangingMonitor({ p, yaw, i }: { p: V3; yaw: number; i: number }) {
  return <group position={p} rotation={[0, yaw, 0]}>
    <Tube pts={[[0, 0.8, 0], [0, 0.32, 0]]} r={0.015} {...STEEL} />
    <RB p={[0, 0, 0]} s={[1.0, 0.6, 0.06]} rad={0.015} c="#0a0a0c" />
    <group position={[0, 0, 0.032]}><SignalPanel channel={i % 2 ? "inputs" : "program"} size={[0.94, 0.54]} /></group>
  </group>;
}

/** Softbox on a stand (chroma key fill), aimed with yaw. */
function StandSoftbox({ p, yaw, h = 2.2 }: { p: V3; yaw: number; h?: number }) {
  const legs = [0, 1, 2].map((i) => i * (Math.PI * 2) / 3);
  return <group position={p} rotation={[0, yaw, 0]}>
    {legs.map((a, i) => <Tube key={i} pts={[[0, 0.6, 0], [Math.cos(a) * 0.5, 0.02, Math.sin(a) * 0.5]]} r={0.013} {...BLACK_METAL} />)}
    <RB p={[0.23, 0.07, 0.03]} s={[0.3, 0.13, 0.22]} rad={0.035} map={tex.fabric("#242629", [2, 2])} c="#ffffff" r={0.95} />
    <Cyl p={[0, (h + 0.6) / 2, 0]} rt={0.016} h={h - 0.6} {...STEEL} />
    <group position={[0, h, 0]} rotation={[0.15, 0, 0]}>
      <RB p={[0, 0, -0.14]} s={[0.14, 0.14, 0.14]} rad={0.02} c="#111" />
      <RB p={[0, 0, 0.08]} s={[0.9, 0.9, 0.36]} rad={0.04} c="#141518" r={0.7} />
      <Slab p={[0, 0, 0.27]} s={[0.84, 0.84, 0.005]} c="#ffffff" e="#fff6e6" ei={2.4} />
    </group>
  </group>;
}
/** Spotlight head hung from the grid, aimed at a target (visual only). */
function GridSpot({ p, target }: { p: V3; target: V3 }) {
  const dx = target[0] - p[0], dy = target[1] - p[1], dz = target[2] - p[2];
  const yaw = Math.atan2(dx, dz), pitch = Math.atan2(-dy, Math.hypot(dx, dz));
  return <group position={p}>
    <Tube pts={[[0, 0.25, 0], [0, 0.05, 0]]} r={0.012} {...BLACK_METAL} />
    <Cyl p={[0, 0.1, 0]} rt={0.045} h={0.025} rot={[0, 0, Math.PI / 2]} {...STEEL} />
    <Tube pts={[[0.06, -0.1, 0], [0.14, 0.05, 0.05], [0.08, 0.23, 0], [-0.05, 0.23, -0.05], [-0.08, -0.08, 0]]} r={0.004} {...STEEL} />
    <group rotation={[0, yaw, 0]}><group rotation={[pitch - Math.PI / 2, 0, 0]}>
      <Cyl p={[0, -0.12, 0]} rt={0.09} rb={0.11} h={0.26} {...BLACK_METAL} />
      <Cyl p={[0, -0.255, 0]} rt={0.085} h={0.005} c="#fff7e2" e="#fff0cc" ei={2.6} />
    </group></group>
  </group>;
}
/** Multiview monitor bridge for the production desk (three screens on a steel bar). */
function MonitorBridge({ p }: { p: V3 }) {
  return <group position={p}>
    {[-0.9, 0.9].map((x) => <RB key={x} p={[x, 0.3, 0]} s={[0.04, 0.6, 0.04]} rad={0.01} {...BLACK_METAL} />)}
    <RB p={[0, 0.6, 0]} s={[2.0, 0.04, 0.05]} rad={0.01} {...BLACK_METAL} />
    {[-0.66, 0, 0.66].map((x, i) => <group key={x} position={[x, 0.86, 0]} rotation={[0, x * -0.25, 0]}>
      <RB p={[0, 0, 0]} s={[0.62, 0.38, 0.04]} rad={0.01} c="#0a0a0c" />
      <group position={[0, 0, 0.022]}><SignalPanel channel={i === 0 ? "program" : i === 1 ? "inputs" : "recording"} size={[0.58, 0.34]} /></group>
    </group>)}
  </group>;
}
/** Yellow/black rubber cable cover on the floor between two points. */
function CableCover({ a, b }: { a: [number, number]; b: [number, number] }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
  return <group position={[(a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2]} rotation={[0, yaw, 0]}>
    <RB p={[0, 0.025, 0]} s={[0.42, 0.05, len]} rad={0.02} c="#18191b" r={0.9} />
    {[-0.17, 0.17].map((x) => <Slab key={x} p={[x, 0.051, 0]} s={[0.05, 0.002, len]} c="#e3b51e" r={0.7} />)}
  </group>;
}
/** Cable cart: two shelves of coiled cables and a power reel. */
function CableCart({ p, yaw }: { p: V3; yaw: number }) {
  return <group position={p} rotation={[0, yaw, 0]}>
    {[0.25, 0.7, 1.15].map((y) => <RB key={y} p={[0, y, 0]} s={[1.0, 0.03, 0.55]} rad={0.008} {...BLACK_METAL} c="#26282c" />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <RB key={`${a}${b}`} p={[a * 0.48, 0.6, b * 0.25]} s={[0.035, 1.2, 0.035]} rad={0.006} {...BLACK_METAL} />))}
    {[[0.27, -0.25, "#e0702a"], [0.27, 0.15, "#141414"], [0.72, -0.25, "#2b5fd0"], [0.72, 0.15, "#d8c040"], [1.17, 0, "#141414"]].map(([y, x, c], i) => <mesh key={i} position={[Number(x), Number(y) + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.16, 0.035, 10, 28]} /><meshStandardMaterial color={String(c)} roughness={0.6} />
    </mesh>)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Cyl key={`w${a}${b}`} p={[a * 0.44, 0.045, b * 0.22]} rt={0.045} h={0.03} rot={[0, 0, Math.PI / 2]} c="#141414" r={0.9} />))}
  </group>;
}

/** Fresnel / profile fixture hung from the grid. */
function useFresnels() {
  return useMemo(() => {
    const body = merge([
      place(g.lathe([[0, -0.2], [0.13, -0.2], [0.15, -0.12], [0.15, 0.14], [0.12, 0.2], [0, 0.2]], 20), [0, 0, 0], [Math.PI / 2 - 0.7, 0, 0]),
      place(g.tube([[-0.19, 0.16, 0], [-0.19, -0.05, 0], [0.19, -0.05, 0], [0.19, 0.16, 0]], 0.012), [0, 0, 0]),
      place(g.cyl(0.03, 0.03, 0.12, 10), [0, 0.22, 0]),
      ...[0, 1, 2, 3].map((k) => place(g.rbox([0.26, 0.004, 0.12], 0.002), [0, -Math.cos(0.7) * 0.2 - 0.05, Math.sin(0.7) * 0.2 + 0.02], [-0.7 + (k % 2 ? 0.6 : -0.6), (k * Math.PI) / 2, 0])),
    ]);
    const lens = place(g.cyl(0.12, 0.12, 0.01, 20), [0, -Math.cos(0.7) * 0.2, Math.sin(0.7) * 0.2], [Math.PI / 2 - 0.7, 0, 0]);
    return [{ geo: body, mat: { ...BLACK_METAL } }, { geo: lens, mat: { c: "#fff4dc", e: "#ffeac0", ei: 2.2 } }];
  }, []);
}

/** Jib crane with counterweights and remote head. */
function Jib({ p, ry = 0 }: { p: V3; ry?: number }) {
  return <group position={p} rotation={[0, ry, 0]}>
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Tube key={k} pts={[[0, 1.4, 0], [Math.cos(a) * 0.9, 0.02, Math.sin(a) * 0.9]]} r={0.035} {...BLACK_METAL} />; })}
    <Cyl p={[0, 1.55, 0]} rt={0.09} h={0.3} {...BLACK_METAL} />
    <group position={[0, 1.75, 0]} rotation={[0, 0, 0.22]}>
      {[-0.06, 0.06].map((zz) => <Tube key={zz} pts={[[-1.4, 0, zz], [3.0, 0, zz]]} r={0.04} {...STEEL} />)}
      {Array.from({ length: 8 }, (_, k) => <Tube key={k} pts={[[-1.2 + k * 0.52, 0, -0.06], [-0.94 + k * 0.52, 0.0, 0.06]]} r={0.012} {...STEEL} />)}
      {[0, 1, 2].map((k) => <Cyl key={k} p={[-1.5 + k * 0.12, -0.16, 0]} rot={[Math.PI / 2, 0, 0]} rt={0.17} h={0.08} c="#1e1f22" m={0.6} />)}
      <group position={[3.05, -0.18, 0]} rotation={[0, 0, -0.22]}>
        <RB p={[0, 0, 0]} s={[0.22, 0.32, 0.26]} rad={0.03} {...BLACK_METAL} />
        <RB p={[0.1, -0.08, 0]} s={[0.3, 0.16, 0.14]} rad={0.03} c="#2d3036" />
        <Cyl p={[0.28, -0.08, 0]} rot={[0, 0, Math.PI / 2]} rt={0.05} h={0.08} c="#111" />
      </group>
    </group>
  </group>;
}

/** Installed cameras stay visible in sound-only stages; active stages render the interactive body instead. */
function InstalledStudioCameras() {
  const active = useTrainingStore((state) => `|${scenarioOf(state).devices.map((d) => d.id).join("|")}|`);
  return <>{(["cam1", "cam2", "cam3"] as const).map((id, i) => {
    if (active.includes(`|${id}|`)) return null;
    const spot = LAYOUTS.studioMission.places[id];
    return <group key={id} position={spot.p} rotation={[0, spot.yaw, 0]}>
      <Hcx2000Model />
      <Text font={SCENE_FONT} position={[0, 1.78, 0]} fontSize={0.045} color="#e7cf9c" rotation={[0, Math.PI, 0]}>{`กล้อง ${["A", "B", "C"][i]} · พร้อมสำหรับด่านภาพ`}</Text>
      <RigidBody type="fixed" colliders={false}><CylinderCollider position={[0, 0.52, 0]} args={[0.52, 0.38]} /></RigidBody>
    </group>;
  })}</>;
}

/** The microphone itself remains an inventory item; its stand is fixed at the shared operating position. */
function InterviewMicStands() {
  return <>{(["micH", "micG"] as const).map((id) => {
    const [x, y, z] = LAYOUTS.studioMission.places[id].p;
    return <group key={id} position={[x, 0, z]}>
      <Cyl p={[0, 0.025, 0]} rt={0.18} h={0.05} {...BLACK_METAL} />
      <Cyl p={[0, y / 2, 0]} rt={0.012} h={y - 0.03} {...CHROME} />
      <RB p={[0, y - 0.015, 0]} s={[0.075, 0.025, 0.035]} rad={0.006} c="#202329" />
      <RigidBody type="fixed" colliders={false}><CylinderCollider position={[0, 0.04, 0]} args={[0.04, 0.18]} /></RigidBody>
    </group>;
  })}</>;
}

export function Studio() {
  const { x0, x1, z0, z1, h } = ROOM;
  const fresnels = useFresnels();
  const panelTex = tex.fabric("#1b1c20", [3, 2]);
  const floorTex = tex.paint("#202328", [12, 10]);
  const cycTex = tex.paint("#2fb34a", [6, 3]);
  const cove = useMemo(() => new CylinderGeometry(0.9, 0.9, 7.0, 24, 1, true, Math.PI, Math.PI / 2), []);
  const gridAt = useMemo<Placement[]>(() => {
    const list: Placement[] = [];
    for (let x = -6; x <= 6; x += 2) for (const z of [-3, -1, 1.5, 4]) if ((x + z * 3) % 4 !== 0) list.push({ p: [x, h - 1.15, z], ry: z > 2 ? 0 : Math.PI });
    return list;
  }, [h]);
  return <>
    <color attach="background" args={["#0b0c0e"]} />
    <VenueLighting mood="studio" intensity={0.85} />
    <hemisphereLight args={["#b8c0d0", "#2a2a30", 1.15]} />
    <ambientLight intensity={0.2} />
    {/* key/fill from the grid onto the set */}
    <spotLight position={[-3, h - 1.2, 3.5]} target-position={[0, 0.8, -1]} angle={0.6} penumbra={0.5} intensity={60} distance={14} color="#fff2dc" castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.03} />
    <spotLight position={[3.5, h - 1.2, 3]} target-position={[0, 0.8, -1]} angle={0.65} penumbra={0.7} intensity={35} distance={14} color="#e8f0ff" />
    <pointLight position={[0, 3, 6]} intensity={5} distance={12} color="#cdd8ff" />
    <pointLight position={[-2.7, 2.6, 4.7]} intensity={22} distance={7} color="#edf2ff" />
    <pointLight position={[6.2, 2.5, 6.4]} intensity={16} distance={6} color="#edf2ff" />
    <RB p={[6.2, 2.9, 6.4]} s={[1.8, 0.06, 0.2]} rad={0.015} c="#1d2025" />
    <Slab p={[6.2, 2.865, 6.4]} s={[1.65, 0.005, 0.15]} c="#f2f5ff" e="#f2f5ff" ei={1.5} />
    {[-0.6, 0.6].map((dx) => <Tube key={`storage-hanger-${dx}`} pts={[[6.2 + dx, 2.93, 6.4], [6.2 + dx, h - 0.9, 6.4]]} r={0.004} {...STEEL} />)}
    <RB p={[-2.7, 2.85, 4.7]} s={[2.8, 0.06, 0.2]} rad={0.015} c="#1d2025" />
    <Slab p={[-2.7, 2.815, 4.7]} s={[2.65, 0.005, 0.15]} c="#f2f5ff" e="#f2f5ff" ei={1.5} />
    {[-3.8, -1.6].map((x) => <Tube key={`work-hanger-${x}`} pts={[[x, 2.88, 4.7], [x, h - 0.9, 4.7]]} r={0.004} {...STEEL} />)}
    {/* dimmed house lights over the camera floor behind the set */}
    {[-4, 0, 4].map((x) => <group key={x}>
      <pointLight position={[x, h - 1.0, 6.8]} intensity={7} distance={9} color="#ffe2b8" />
      <RB p={[x, h - 0.95, 6.8]} s={[0.9, 0.06, 0.3]} rad={0.02} c="#fff2dc" e="#ffdca0" ei={1.2} />
    </group>)}
    {/* work light over both side tables so plugs and cables read clearly */}

    {/* floor: sealed concrete with gaffer-tape marks */}
    <Slab p={[(x0 + x1) / 2, -0.05, (z0 + z1) / 2]} s={[x1 - x0, 0.1, z1 - z0]} map={floorTex} c="#ffffff" r={0.43} m={0.12} />
    {/* gaffer-tape marks at the three tripod positions of the mission layout */}
    {(["cam1", "cam2", "cam3"] as const).map((id) => { const [x, , z] = LAYOUTS.studioMission.places[id].p; return <group key={id}>
      <Slab p={[x, 0.002, z]} s={[0.4, 0.004, 0.05]} c="#f2c230" />
      <Slab p={[x, 0.002, z]} s={[0.05, 0.004, 0.4]} c="#f2c230" />
    </group>; })}

    {/* acoustic black walls (panelled) */}
    {([[x0, (z0 + z1) / 2, z1 - z0, 1], [x1, (z0 + z1) / 2, z1 - z0, 1], [(x0 + x1) / 2, z1, x1 - x0, 0]] as const).map(([x, z, len, side], i) => <group key={i}>
      <Slab p={[x, h / 2, z]} s={side ? [0.1, h, len] : [len, h, 0.1]} c="#141518" r={0.95} />
      {Array.from({ length: Math.floor(len / 1.25) }, (_, k) => Array.from({ length: 3 }, (_, r) => {
        const off = -len / 2 + 0.65 + k * 1.25, y = 1.0 + r * 1.3;
        return <RB key={`${k}${r}`} p={side ? [x - Math.sign(x) * 0.08, y, z + off] : [x + off, y, z - 0.08]} s={side ? [0.06, 1.2, 1.18] : [1.18, 1.2, 0.06]} rad={0.025} map={panelTex} c="#ffffff" r={0.98} />;
      }))}
    </group>)}
    <Slab p={[0, h + 0.05, (z0 + z1) / 2]} s={[x1 - x0, 0.1, z1 - z0]} c="#0d0e10" r={0.95} />

    {/* green cyclorama: wall + floor cove + floor sweep (behind the backdrop collider) */}
    <Slab p={[0, h / 2, z0]} s={[x1 - x0, h, 0.1]} c="#141518" r={0.95} />
    <Slab p={[-3.7, 0.9 + (h - 1.4) / 2, z0 + 0.07]} s={[7.0, h - 1.4, 0.02]} map={cycTex} c="#ffffff" r={0.9} />
    <mesh geometry={cove} position={[-3.7, 0.9, z0 + 0.98]} rotation={[0, 0, Math.PI / 2]} receiveShadow><meshStandardMaterial map={cycTex} side={DoubleSide} roughness={0.9} /></mesh>
    <Slab p={[-3.7, 0.003, -2.5]} s={[7.0, 0.006, 1.94]} map={cycTex} c="#ffffff" r={0.95} />
    {[-1, 1].map((s) => <RB key={s} p={[-3.7 + s * 3.6, h / 2, z0 + 0.4]} s={[0.25, h, 0.8]} rad={0.04} c="#26282c" />)}

    {/* pipe lighting grid with fresnels, LED panels and hoist chains */}
    {Array.from({ length: 7 }, (_, i) => <Tube key={`gx${i}`} pts={[[x0 + 1, h - 0.9, -3.5 + i * 1.6], [x1 - 1, h - 0.9, -3.5 + i * 1.6]]} r={0.024} {...STEEL} />)}
    {Array.from({ length: 8 }, (_, i) => <Tube key={`gz${i}`} pts={[[-7 + i * 2, h - 0.85, -3.6], [-7 + i * 2, h - 0.85, 6.2]]} r={0.024} {...STEEL} />)}
    {[-6, 0, 6].flatMap((x) => [-3, 3].map((z) => <Tube key={`c${x}${z}`} pts={[[x, h, z], [x, h - 0.88, z]]} r={0.008} c="#555" m={0.8} />))}
    <Instanced parts={fresnels} at={gridAt} />
    {[-2.5, 2.5].map((x) => <group key={x} position={[x, h - 1.4, 2.6]} rotation={[0.7, 0, 0]}>
      <RB p={[0, 0, 0]} s={[1.0, 0.6, 0.08]} rad={0.03} {...BLACK_METAL} />
      <RB p={[0, 0, -0.045]} s={[0.92, 0.52, 0.01]} rad={0.004} c="#ffffff" e="#fff6e6" ei={1.6} />
      <Tube pts={[[0, 0.3, 0], [0, 0.55, 0.2]]} r={0.012} {...STEEL} />
    </group>)}
    {/* HVAC sock duct */}
    <Tube pts={[[x0 + 0.6, h - 0.35, -2], [x0 + 0.6, h - 0.35, 8.5]]} r={0.3} c="#2a2c31" m={0} />
    <Tube pts={[[x1 - 0.6, h - 0.35, -2], [x1 - 0.6, h - 0.35, 8.5]]} r={0.3} c="#2a2c31" m={0} />

    {/* production gallery window on the right wall + ON AIR light + entrance door */}
    <group position={[x1 - 0.06, 3.75, 6.4]}>
      <RB p={[0, 0, 0]} s={[0.12, 1.3, 4.2]} rad={0.04} c="#2b2e33" />
      <Slab p={[-0.065, 0, 0]} s={[0.01, 1.1, 4.0]} c="#0f2235" e="#2a5a8a" ei={0.6} m={0.4} r={0.05} />
      {[-1.3, 0, 1.3].map((dz) => <RB key={dz} p={[-0.075, -0.15, dz]} s={[0.01, 0.42, 1.0]} rad={0.004} c="#3a6aa0" e="#4a8ad0" ei={0.9} />)}
    </group>
    <group position={[x1 - 0.06, 0, 7.6]}>
      <RB p={[-0.02, 1.15, 0]} s={[0.1, 2.3, 1.5]} rad={0.03} c="#30333a" />
      {[-0.36, 0.36].map((dz) => <RB key={dz} p={[-0.07, 1.12, dz]} s={[0.04, 2.2, 0.7]} rad={0.015} c="#3c4048" m={0.4} r={0.4} />)}
      {[-0.06, 0.06].map((dz) => <Tube key={dz} pts={[[-0.1, 1.0, dz], [-0.16, 1.0, dz], [-0.16, 1.2, dz], [-0.1, 1.2, dz]]} r={0.012} {...CHROME} />)}
      <RB p={[-0.08, 2.55, 0]} s={[0.08, 0.3, 0.8]} rad={0.03} c="#1a1a1a" />
      <Text font={SCENE_FONT} position={[-0.13, 2.55, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.12} color="#c9d4df">STUDIO</Text>
    </group>
    <Text font={SCENE_FONT} position={[0, h - 0.6, z1 - 0.07]} rotation={[0, Math.PI, 0]} fontSize={0.28} color="#c9d4df">{sceneText("STUDIO A | สตูดิโอภารกิจ")}</Text>

    {/* Mounted repeaters: internal input/program/audio/OBS state, not decorative success images. */}
    <group position={[x0 + 0.12, 2.5, 3.4]} rotation={[0, Math.PI / 2, 0]}>
      <RB p={[0, 0, -0.06]} s={[2.9, 1.7, 0.12]} rad={0.03} {...BLACK_METAL} />
      {(["program", "inputs", "audio", "recording"] as const).map((channel, i) => <group key={channel} position={[-0.7 + (i % 2) * 1.4, 0.4 - Math.floor(i / 2) * 0.8, 0.03]}>
        <RB p={[0, 0, 0]} s={[1.34, 0.76, 0.05]} rad={0.012} c="#0a0a0c" />
        <group position={[0, 0, 0.027]}><SignalPanel channel={channel} size={[1.28, 0.72]} /></group>
      </group>)}
    </group>

    {/* a jib parked in the back-left corner (scenery; the mission cameras are interactive devices) */}
    <Jib p={SETS.jib} ry={0} />
    {/* cable snakes and a coiled cable on the floor */}
    <mesh position={[6.6, 0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.03, 8, 32]} /><meshStandardMaterial color="#111" roughness={0.7} /></mesh>
    <RB p={[7.4, 0.35, -1.6]} s={[0.6, 0.7, 0.6]} rad={0.04} map={tex.fabric("#202124", [2, 2])} c="#ffffff" r={0.85} />

    {/* floor cable tray from the camera marks to the production desk (route guide) */}
    <RB p={[0, 0.02, 1.9]} s={[6.4, 0.04, 0.22]} rad={0.015} c="#202226" />
    <RB p={[0, 0.02, 2.6]} s={[0.22, 0.04, 1.4]} rad={0.015} c="#202226" />
    {/* reference zones (art/reference/venues/studio-01/02): news set back-left, interview corner back-right */}
    <NewsSet p={SETS.news} yaw={0} />
    <InterviewCorner p={SETS.interview} yaw={-0.45} />
    <InstalledStudioCameras />
    <InterviewMicStands />
    <WoodSlatWall p={[x1 - 0.12, 0, 1.2]} w={4.2} h={3.6} rot={[0, -Math.PI / 2, 0]} />
    <DollyTrack p={[1.5, 0, -1.2]} len={2.2} yaw={0.2} />
    {/* chroma key fill: softboxes on stands around the green cyclorama */}
    {SETS.softboxes.map(([x, z], i) => <StandSoftbox key={i} p={[x, 0, z]} yaw={Math.atan2(-3.7 - x, -2.3 - z)} />)}
    <group position={[2.0, 0, -2.4]} rotation={[0, 1.69, 0]}><LightStand p={[0, 0, 0]} h={2.6} /></group>
    <group position={[7.6, 0, 0.1]} rotation={[0, -0.635, 0]}><LightStand p={[0, 0, 0]} h={2.6} /></group>
    {/* denser grid: spots aimed at the news set, the presenter table and the interview corner */}
    {([[3.0, -0.5], [5.0, 0.2], [6.0, 1.0]] as const).map(([x, z], i) => <GridSpot key={`n${i}`} p={[x, h - 1.0, z]} target={[4.5, 1.0, -2.7]} />)}
    {([[-5.5, 0.5], [-3.7, 0.0], [-1.5, 0.5]] as const).map(([x, z], i) => <GridSpot key={`p${i}`} p={[x, h - 1.0, z]} target={[-3.7, 1.0, -2.3]} />)}
    {([[5.0, 0.5], [6.6, 0.2]] as const).map(([x, z], i) => <GridSpot key={`i${i}`} p={[x, h - 1.0, z]} target={[6.2, 0.8, 2.0]} />)}
    <spotLight position={[4.5, h - 1.0, 0.6]} target-position={[4.5, 0.9, -2.7]} angle={0.55} penumbra={0.6} intensity={30} distance={10} color="#fff1dc" />
    <spotLight position={[5.6, h - 1.0, 0.4]} target-position={[6.2, 0.6, 2.0]} angle={0.55} penumbra={0.7} intensity={18} distance={9} color="#ffd8a8" />
    {/* production desk: multiview bridge at the far edge (screens face the operator) */}
    <MonitorBridge p={[-2.7, 0.76, 4.18]} />
    {/* Protected crossings leave the cross-studio lane at z 1.5–2.5 open. */}
    <CableCover a={[-3.7, 0.7]} b={[-3.7, 3.8]} />
    <CableCover a={[2.0, 0.7]} b={[2.0, 3.0]} />
    <CableCover a={[2.0, 3.0]} b={[-2.7, 3.0]} />
    <CableCover a={[-5.1, 5.6]} b={[-0.2, 5.6]} />
    <CableCart p={[-7.35, 0, 1.5]} yaw={Math.PI / 2} />
    {[[-3.7, 0.8, 0, 1], [4.5, 0.8, 0, 2]].map(([x, z, ry, i]) => <HangingMonitor key={i} p={[x, h - 1.7, z]} yaw={ry} i={i} />)}
    {/* Real case hardware and colliders come from LayoutFurniture. */}
    {/* Installed utility plates: infrastructure only; AC power is not a gameplay prerequisite. */}
    {[-5.8, 3.8, 6.0].map((x) => <group key={x} position={[x, 0.35, z1 - 0.06]} rotation={[0, Math.PI, 0]}>
      <RB p={[0, 0, 0]} s={[0.22, 0.13, 0.02]} rad={0.008} {...BLACK_METAL} />
      {[-0.055, 0.055].map((dx) => <RB key={dx} p={[dx, 0, 0.013]} s={[0.05, 0.06, 0.008]} rad={0.005} c="#090b0e" />)}
    </group>)}
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider key="news-set" position={[4.5, 0.9, -2.7]} rotation={[0, 0, 0]} args={[1.95, 0.9, 1.35]} />
      <CuboidCollider key="jib" position={[SETS.jib[0], 0.7, SETS.jib[2]]} args={[0.9, 0.7, 0.8]} />
      <CuboidCollider key="cable-cart" position={[-7.35, 0.6, 1.5]} args={[0.3, 0.6, 0.52]} />
      {[...SETS.softboxes, [2.0, -2.4], [7.6, 0.1]].map(([x, z]) => <CuboidCollider key={`${x}${z}`} position={[x, 1.1, z]} args={[0.3, 1.1, 0.3]} />)}

    </RigidBody>
    <LayoutFurniture layout={LAYOUTS.studioMission} look={{ top: "#2b2e33", frame: { ...BLACK_METAL } }} />
    <LayoutColliders layout={LAYOUTS.studioMission} />
  </>;
}
