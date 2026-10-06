"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { LAYOUTS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";
import { VenueLighting, BLACK_METAL, CHROME, Cyl, D, H, Lathe, RB, Slab, STEEL, Tube, W, type V3 } from "./kit";
import { tex } from "./textures";

const BACK = -D / 2;

/** Whiteboard writing: lesson title and a signal-flow sketch in marker. */
function boardTexture() {
  return tex.sign("classroom-board", 1024, 384, (c, w, h) => {
    c.fillStyle = "#fbfbf8"; c.fillRect(0, 0, w, h);
    const grad = c.createLinearGradient(0, 0, w, h); grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(120,130,140,.06)");
    c.fillStyle = grad; c.fillRect(0, 0, w, h);
    c.fillStyle = "#1d4fb0"; c.font = "bold 54px 'Sarabun','Leelawadee UI',sans-serif"; c.fillText("HDMI 101 · พื้นฐานการต่อสัญญาณภาพ", 40, 78);
    c.strokeStyle = "#1d4fb0"; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 96); c.lineTo(760, 98); c.stroke();
    const boxes: [number, string][] = [[60, "CAMERA"], [400, "SWITCHER"], [740, "MONITOR"]];
    c.lineWidth = 5; c.font = "bold 34px sans-serif";
    for (const [x, label] of boxes) { c.strokeStyle = "#222"; c.strokeRect(x, 150, 230, 90); c.fillStyle = "#222"; c.fillText(label, x + 22, 207); }
    c.strokeStyle = "#c0302a"; c.fillStyle = "#c0302a";
    for (const x of [290, 630]) { c.beginPath(); c.moveTo(x + 10, 195); c.lineTo(x + 100, 195); c.stroke(); c.beginPath(); c.moveTo(x + 100, 182); c.lineTo(x + 112, 195); c.lineTo(x + 100, 208); c.fill(); }
    c.font = "28px sans-serif"; c.fillText("OUT", 300, 180); c.fillText("IN", 350, 230); c.fillText("OUT", 640, 180); c.fillText("IN", 690, 230);
    c.fillStyle = "#1e7a3a"; c.font = "30px 'Sarabun','Leelawadee UI',sans-serif"; c.fillText("✔ ต่อ OUTPUT → INPUT เสมอ   ✔ ตรวจทุกช่วงก่อนออกอากาศ", 40, 320);
  });
}
function slideTexture() {
  return tex.sign("classroom-slide", 640, 400, (c, w, h) => {
    c.fillStyle = "#f4f7fb"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#16407e"; c.fillRect(0, 0, w, 64);
    c.fillStyle = "#fff"; c.font = "bold 30px 'Sarabun','Leelawadee UI',sans-serif"; c.fillText("บทที่ 1 · ประตูแรกแห่งภาพ", 24, 43);
    c.fillStyle = "#28303c"; c.font = "24px 'Sarabun','Leelawadee UI',sans-serif";
    ["• รู้จักพอร์ต HDMI IN / OUT", "• เส้นทาง Camera → Switcher → Monitor", "• ตรวจสัญญาณบนจอปลายทาง"].forEach((s, i) => c.fillText(s, 34, 130 + i * 50));
    c.fillStyle = "#d6deea"; c.fillRect(34, 300, 360, 10); c.fillRect(34, 322, 260, 10);
    c.fillStyle = "#16407e"; c.beginPath(); c.arc(540, 320, 46, 0, 7); c.fill();
  });
}
/** View through the classroom windows: sky, campus trees and the next building. */
function windowView() {
  return tex.sign("window-view", 256, 196, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, "#8fc0ea"); sky.addColorStop(1, "#dcecf8");
    c.fillStyle = sky; c.fillRect(0, 0, w, h);
    c.fillStyle = "#d8cfbf"; c.fillRect(150, 70, 120, 90);
    c.fillStyle = "#7d9cb8"; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) c.fillRect(158 + i * 26, 80 + j * 26, 16, 16);
    c.fillStyle = "#5a8a45";
    for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(10 + i * 30, 120 - (i % 3) * 10, 26, 0, 7); c.fill(); }
    c.fillStyle = "#6f9e47"; c.fillRect(0, 140, w, h - 140);
  });
}
function clockTexture() {
  return tex.sign("clock-face", 256, 256, (c, w) => {
    c.fillStyle = "#fdfdfb"; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill();
    c.fillStyle = "#222"; c.font = "bold 26px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; c.fillText(String(i), 128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98); }
    for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2; c.fillRect(128 + Math.cos(a) * 118 - 1, 128 + Math.sin(a) * 118 - 1, i % 5 ? 2 : 4, i % 5 ? 2 : 4); }
    void w;
  });
}
function noticeTexture(i: number) {
  const colors = ["#fff7c2", "#d9f0ff", "#ffe1d6", "#e5ffd9", "#ffffff"];
  return tex.sign(`notice${i}`, 128, 160, (c, w, h) => {
    c.fillStyle = colors[i % colors.length]; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(30,40,60,.75)"; c.fillRect(10, 12, w - 20, 12);
    for (let k = 0; k < 8; k++) c.fillRect(10, 38 + k * 14, (w - 20) * (0.5 + ((k * 37 + i * 11) % 50) / 100), 4);
  });
}

function Window({ z }: { z: number }) {
  const x = -W / 2 + 0.06;
  return <group>
    <Slab p={[x + 0.005, 1.75, z]} rot={[0, Math.PI / 2, 0]} s={[1.7, 1.3, 0.01]} map={windowView()} c="#ffffff" e="#ffffff" ei={0.55} />
    {/* aluminium frame + mullion + sill */}
    {[[0, 0.66, 0, 1.76], [0, -0.66, 0, 1.76]].map(([, dy, , len], i) => <RB key={i} p={[x + 0.03, 1.75 + dy, z]} s={[0.05, 0.05, len]} rad={0.008} {...CHROME} c="#c9cdd2" />)}
    {[-0.86, 0, 0.86].map((dz) => <RB key={dz} p={[x + 0.03, 1.75, z + dz]} s={[0.05, 1.36, 0.045]} rad={0.008} {...CHROME} c="#c9cdd2" />)}
    <RB p={[x + 0.08, 1.06, z]} s={[0.16, 0.035, 1.84]} rad={0.01} c="#e9e4da" />
    {/* venetian blind, half drawn */}
    {Array.from({ length: 14 }, (_, i) => <RB key={i} p={[x + 0.09, 2.36 - i * 0.045, z]} rot={[0, 0, 0.5]} s={[0.05, 0.004, 1.66]} rad={0.0015} c="#f1efe9" r={0.5} />)}
    <RB p={[x + 0.09, 2.42, z]} s={[0.07, 0.05, 1.72]} rad={0.01} c="#e6e3dc" />
    <Tube pts={[[x + 0.12, 2.38, z + 0.78], [x + 0.12, 1.75, z + 0.8]]} r={0.003} c="#ddd" />
  </group>;
}

function CeilingTroffer({ p }: { p: V3 }) {
  return <group position={p}>
    <RB p={[0, 0, 0]} s={[1.2, 0.05, 0.6]} rad={0.01} c="#f4f4f2" m={0.3} r={0.4} />
    <Slab p={[0, -0.028, 0]} s={[1.12, 0.005, 0.52]} c="#ffffff" e="#f6f9ff" ei={1.6} />
    {[-0.37, 0, 0.37].map((x) => <Slab key={x} p={[x, -0.033, 0]} s={[0.012, 0.006, 0.52]} c="#d8dade" m={0.6} />)}
  </group>;
}

export function Classroom() {
  const floor = tex.tiles("#dcd6c8", "#b4ad9f", 4, [W / 2.4, D / 2.4]);
  const wall = tex.paint("#efe7d6", [4, 2]);
  const dado = tex.paint("#8fa3a8", [6, 1]);
  const ceiling = tex.tiles("#f3f2ee", "#d9d8d2", 2, [W / 1.2, D / 1.2]);
  const board = boardTexture();
  const slide = slideTexture();
  const cork = tex.cork();
  const clock = clockTexture();
  const door = tex.wood("#8a5a34", [1, 2]);
  return <>
    <color attach="background" args={["#dfe3e6"]} />
    <VenueLighting mood="classroom" intensity={0.8} />
    <hemisphereLight args={["#ffffff", "#8a7f70", 0.63]} />
    <ambientLight intensity={0.12} />
    {/* daylight through the window wall */}
    <directionalLight position={[-9, 4.5, 1]} target-position={[0, 0, 0]} intensity={2.2} color="#fff7e8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={0.03} />
    {[-2.4, 1.6].map((z) => <pointLight key={z} position={[0, H - 0.4, z]} intensity={4} distance={9} color="#f2f6ff" />)}

    {/* shell: tiled floor, painted walls with a washable dado band, skirting, T-bar ceiling */}
    <Slab p={[0, -0.05, 0]} s={[W, 0.1, D]} map={floor} c="#ffffff" r={0.35} />
    <Slab p={[0, H + 0.02, 0]} s={[W, 0.04, D]} map={ceiling} c="#ffffff" r={0.9} />
    {([[0, BACK, W, 0], [0, D / 2, W, 0], [-W / 2, 0, D, 1], [W / 2, 0, D, 1]] as const).map(([x, z, len, side], i) => <group key={i}>
      <Slab p={[x, H / 2, z]} s={side ? [0.1, H, len] : [len, H, 0.1]} map={wall} c="#ffffff" r={0.85} />
      <Slab p={[x + (side ? Math.sign(-x) * 0.055 : 0), 0.55, z + (side ? 0 : Math.sign(-z) * 0.055)]} s={side ? [0.01, 1.1, len] : [len, 1.1, 0.01]} map={dado} c="#ffffff" r={0.6} />
      <Slab p={[x + (side ? Math.sign(-x) * 0.06 : 0), 0.05, z + (side ? 0 : Math.sign(-z) * 0.06)]} s={side ? [0.02, 0.1, len] : [len, 0.1, 0.02]} c="#5f5246" r={0.5} />
      <Slab p={[x + (side ? Math.sign(-x) * 0.058 : 0), 1.1, z + (side ? 0 : Math.sign(-z) * 0.058)]} s={side ? [0.016, 0.03, len] : [len, 0.03, 0.016]} c="#6f8388" />
    </group>)}
    {[-3.6, -1.2, 1.2, 3.6].flatMap((x) => [-2.6, 0.2, 3].map((z) => <CeilingTroffer key={`${x}${z}`} p={[x, H - 0.005, z]} />))}

    {/* whiteboard with aluminium frame, marker tray, markers and eraser */}
    <group position={[-1.5, 1.55, BACK + 0.08]}>
      <RB p={[0, 0, 0]} s={[3.3, 1.3, 0.04]} rad={0.015} {...CHROME} c="#c8ccd1" />
      <Slab p={[0, 0, 0.022]} s={[3.22, 1.22, 0.004]} map={board} c="#ffffff" r={0.12} />
      <RB p={[0, -0.68, 0.06]} s={[3.1, 0.03, 0.09]} rad={0.012} {...CHROME} c="#b8bdc3" />
      {["#1d4fb0", "#c0302a", "#1e7a3a", "#111"].map((c, i) => <group key={c} position={[-1.2 + i * 0.16, -0.65, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <Cyl p={[0, 0, 0]} rt={0.011} h={0.12} c="#f2f2f2" r={0.4} />
        <Cyl p={[0, 0.07, 0]} rt={0.012} h={0.035} c={c} r={0.4} />
      </group>)}
      <RB p={[1.1, -0.635, 0.06]} s={[0.14, 0.04, 0.05]} rad={0.01} c="#333a48" />
    </group>

    {/* ceiling projector + pull-down screen */}
    <group position={[1.9, 0, BACK]}>
      <RB p={[0, 2.92, 0.1]} s={[2.5, 0.1, 0.12]} rad={0.04} c="#f2f2f0" />
      <Slab p={[0, 1.95, 0.11]} s={[2.3, 1.75, 0.006]} map={slide} c="#ffffff" e="#ffffff" ei={0.25} r={0.9} />
      <Slab p={[0, 1.04, 0.11]} s={[2.32, 0.04, 0.02]} c="#2a2a2a" />
    </group>
    <group position={[1.6, H - 0.02, 0.6]}>
      <Cyl p={[0, -0.18, 0]} rt={0.02} h={0.36} {...STEEL} />
      <RB p={[0, -0.42, 0]} s={[0.36, 0.12, 0.3]} rad={0.035} c="#f1f1ef" r={0.4} />
      <Cyl p={[0.08, -0.42, -0.16]} rt={0.04} h={0.04} rot={[Math.PI / 2, 0, 0]} c="#151515" m={0.3} r={0.2} />
      <Cyl p={[0.08, -0.42, -0.182]} rt={0.032} h={0.004} rot={[Math.PI / 2, 0, 0]} c="#9cc7ff" e="#cfe3ff" ei={1.8} />
    </group>

    {/* windows on the left wall, door + split AC on the right */}
    {[-2.7, 0, 2.7].map((z) => <Window key={z} z={z} />)}
    <group position={[W / 2 - 0.06, 0, 2.6]}>
      <RB p={[-0.02, 1.05, 0]} s={[0.06, 2.12, 1.06]} rad={0.012} c="#e9e3d8" />
      <RB p={[-0.04, 1.03, 0]} s={[0.05, 2.04, 0.94]} rad={0.01} map={door} c="#ffffff" r={0.5} />
      <Tube pts={[[-0.1, 1.0, -0.38], [-0.14, 1.0, -0.38], [-0.14, 1.0, -0.26]]} r={0.01} {...CHROME} />
      <RB p={[-0.07, 1.65, 0.2]} s={[0.01, 0.34, 0.24]} rad={0.004} c="#d8ecff" e="#d8ecff" ei={0.3} />
    </group>
    <group position={[W / 2 - 0.16, 2.65, -1]}>
      <RB p={[0, 0, 0]} s={[0.22, 0.3, 0.95]} rad={0.08} c="#f7f7f5" r={0.35} />
      <RB p={[-0.1, -0.11, 0]} s={[0.03, 0.04, 0.85]} rad={0.012} c="#d9dbdd" />
      <mesh position={[-0.112, 0.06, 0.38]}><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#3cf07a" emissive="#3cf07a" emissiveIntensity={2} /></mesh>
    </group>

    {/* cork pinboard with notices, wall clock */}
    <group position={[W / 2 - 0.07, 1.7, -2.6]}>
      <RB p={[0, 0, 0]} s={[0.05, 1.05, 1.7]} rad={0.015} map={tex.wood("#9a6c40")} c="#ffffff" />
      <Slab p={[-0.028, 0, 0]} s={[0.004, 0.95, 1.6]} map={cork} c="#ffffff" r={0.95} />
      {[[-0.2, 0.25, -0.55, 0.05], [0.18, 0.2, -0.15, -0.06], [-0.15, -0.2, 0.25, 0.03], [0.15, 0.3, 0.6, 0.07], [-0.05, -0.25, -0.5, -0.04]].map(([dy, , dz, rz], i) => <group key={i} position={[-0.033, dy, dz]} rotation={[rz, 0, 0]}>
        <Slab p={[0, 0, 0]} s={[0.003, 0.32, 0.26]} map={noticeTexture(i)} c="#ffffff" r={0.8} />
        <mesh position={[-0.006, 0.14, 0]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color={["#e53935", "#1e88e5", "#43a047"][i % 3]} /></mesh>
      </group>)}
    </group>
    <group position={[0, 2.7, D / 2 - 0.06]} rotation={[0, Math.PI, 0]}>
      <Lathe p={[0, 0, 0]} rot={[Math.PI / 2, 0, 0]} prof={[[0.0, -0.03], [0.19, -0.03], [0.205, -0.02], [0.205, 0.02], [0.19, 0.03]]} c="#2b2b2b" r={0.4} />
      <Slab p={[0, 0, 0.026]} s={[0.36, 0.36, 0.002]} map={clock} c="#ffffff" transparent />
      <RB p={[0.04, 0.03, 0.035]} rot={[0, 0, -0.9]} s={[0.12, 0.012, 0.003]} rad={0.002} c="#111" />
      <RB p={[0, 0.07, 0.036]} rot={[0, 0, 1.4]} s={[0.15, 0.008, 0.003]} rad={0.002} c="#111" />
      <Cyl p={[0, 0, 0.038]} rt={0.01} h={0.006} rot={[Math.PI / 2, 0, 0]} c="#c0302a" />
    </group>

    {/* steel lockers + posters on the wall behind the spawn point */}
    <group position={[-4.15, 0, D / 2 - 0.25]}>
      {Array.from({ length: 6 }, (_, i) => <group key={i} position={[-1.15 + i * 0.46, 0, 0]}>
        <RB p={[0, 0.92, 0]} s={[0.44, 1.8, 0.42]} rad={0.012} c="#8d99a6" m={0.5} r={0.45} />
        <RB p={[0, 0.92, -0.212]} s={[0.4, 1.72, 0.01]} rad={0.004} c="#9aa6b2" m={0.5} r={0.4} />
        {[1.55, 1.48, 1.41, 0.45, 0.38, 0.31].map((y) => <RB key={y} p={[0, y, -0.22]} s={[0.24, 0.018, 0.004]} rad={0.002} c="#5e6873" />)}
        <RB p={[0.15, 1.0, -0.225]} s={[0.025, 0.12, 0.02]} rad={0.008} {...CHROME} />
        <RB p={[-0.1, 1.68, -0.218]} s={[0.12, 0.05, 0.002]} rad={0.002} c="#fdfdfb" />
      </group>)}
      <RB p={[0, 1.86, 0]} s={[2.8, 0.04, 0.44]} rad={0.01} c="#7d8995" m={0.5} />
      <RB p={[0, 0.03, 0]} s={[2.8, 0.06, 0.4]} rad={0.01} c="#3c434b" />
    </group>
    {[["poster-a", -5.0, "#1d4fb0", "กติกาห้องเรียน"], ["poster-b", -3.3, "#2f8f46", "ความปลอดภัยทางไฟฟ้า"]].map(([k, x, col, title]) => <Slab key={String(k)} p={[Number(x), 2.45, D / 2 - 0.06]} rot={[0, Math.PI, 0]} s={[1.1, 0.75, 0.01]} c="#ffffff" map={tex.sign(String(k), 320, 220, (c, w, h) => {
      c.fillStyle = "#fbfbf8"; c.fillRect(0, 0, w, h); c.fillStyle = String(col); c.fillRect(0, 0, w, 54);
      c.fillStyle = "#fff"; c.font = "bold 28px 'Sarabun','Leelawadee UI',sans-serif"; c.fillText(String(title), 16, 37);
      c.fillStyle = "#333"; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(24, 84 + i * 28, 5, 0, 7); c.fill(); c.fillRect(40, 80 + i * 28, 200 - (i % 2) * 60, 8); }
    })} />)}

    {/* student desk sets along the front wall, waste bin, fire extinguisher */}
    <Lathe p={[-5.35, 0, 3.55]} prof={[[0, 0], [0.13, 0], [0.16, 0.36], [0.165, 0.37], [0.15, 0.37], [0.12, 0.02], [0, 0.02]]} c="#3a6fb0" r={0.5} />
    <group position={[-W / 2 + 0.16, 0, -3.95]}>
      <Lathe p={[0, 0, 0]} prof={[[0, 0], [0.075, 0], [0.08, 0.04], [0.08, 0.5], [0.06, 0.56], [0.025, 0.6], [0, 0.6]]} c="#c8201d" r={0.3} m={0.2} />
      <RB p={[0, 0.63, 0]} s={[0.05, 0.06, 0.05]} rad={0.012} {...BLACK_METAL} />
      <Tube pts={[[0, 0.62, 0.02], [0.02, 0.5, 0.08], [0.03, 0.3, 0.09]]} r={0.008} c="#111" />
      <RB p={[-0.04, 1.2, 0]} s={[0.01, 0.2, 0.15]} rad={0.003} c="#d32f2f" e="#ff5544" ei={0.2} />
    </group>

    {/* Job layout (game/training/venue-layouts.ts): AV operator desk rear-right, AV cabinet on the right wall,
        teacher desk + TV at the front, student desks between, tripod camera rear-centre. */}
    <LayoutFurniture layout={LAYOUTS.classroom} look={{ top: "#cfa774", frame: { ...STEEL, c: "#6a7078" } }} />
    <LayoutColliders layout={LAYOUTS.classroom} />
    <RigidBody type="fixed" colliders={false}><CuboidCollider position={[-4.15, 0.95, D / 2 - 0.25]} args={[1.4, 0.95, 0.22]} /></RigidBody>
  </>;
}
