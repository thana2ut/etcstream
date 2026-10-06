"use client";

import { Billboard, RoundedBox, Text } from "@react-three/drei";
import type { DeviceDef } from "@/game/training/scenarios";

const FONT = "/fonts/geist-regular.ttf";

/**
 * Clean, recognisable placeholders for GENERIC TRAINING MODEL / provisional equipment.
 * They show the device category, relative size and a readable front (ports face +Z, cameras' lens −Z),
 * and are meant to be swapped for reference-based Blender GLBs later — they are not real products.
 */
function Rb({ p, s, c, m = 0.25, r = 0.5, e, ei = 0 }: { p: [number, number, number]; s: [number, number, number]; c: string; m?: number; r?: number; e?: string; ei?: number }) {
  return <RoundedBox position={p} args={s} radius={Math.min(0.02, Math.min(...s) * 0.3)} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={c} metalness={m} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </RoundedBox>;
}
function Rod({ a, b, r = 0.012, c = "#22252a" }: { a: [number, number, number]; b: [number, number, number]; r?: number; c?: string }) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
  const pitch = Math.acos(dy / len), yaw = Math.atan2(dx, dz);
  return <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[pitch, yaw, 0, "YXZ"]} castShadow>
    <cylinderGeometry args={[r, r, len, 8]} /><meshStandardMaterial color={c} metalness={0.7} roughness={0.4} />
  </mesh>;
}

export function GenericLabel({ device, y }: { device: DeviceDef; y: number }) {
  const tag = device.status === "CONFIRMED" ? device.model : device.status === "PROVISIONAL" ? "รุ่นรอยืนยัน" : device.status === "UNKNOWN" ? "รุ่นไม่ทราบ" : "แบบฝึก";
  return <Billboard position={[0, y, 0]}>
    <Text font={FONT} fontSize={0.05} color="#f6ddaa" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000">{device.label}</Text>
    <Text font={FONT} position={[0, -0.01, 0]} fontSize={0.028} color="#8be4f4" anchorX="center" anchorY="top" outlineWidth={0.003} outlineColor="#000">{tag}</Text>
  </Billboard>;
}

function TripodCamera({ device }: { device: DeviceDef }) {
  const broadcast = /Broadcast|Long-lens/.test(device.label), ptz = device.label.startsWith("PTZ");
  if (ptz) return <group>
    <Rod a={[0, 0, 0]} b={[0, 1.15, 0]} r={0.03} />
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Rod key={k} a={[0, 0.02, 0]} b={[Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3]} r={0.02} />; })}
    <Rb p={[0, 1.22, 0]} s={[0.2, 0.08, 0.2]} c="#1d2026" />
    <mesh position={[0, 1.36, 0]} castShadow><sphereGeometry args={[0.11, 20, 16]} /><meshStandardMaterial color="#e9eaec" roughness={0.35} /></mesh>
    <mesh position={[0, 1.36, -0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.06, 16]} /><meshStandardMaterial color="#0e1218" metalness={0.6} roughness={0.2} /></mesh>
  </group>;
  const lens = broadcast ? 0.42 : 0.2;
  return <group>
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2 + Math.PI / 6; return <Rod key={k} a={[0, 1.08, 0]} b={[Math.cos(a) * 0.45, 0.01, Math.sin(a) * 0.45]} r={0.016} />; })}
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2 + Math.PI / 6; return <Rod key={`s${k}`} a={[0, 0.42, 0]} b={[Math.cos(a) * 0.27, 0.42, Math.sin(a) * 0.27]} r={0.008} />; })}
    <mesh position={[0, 1.12, 0]}><cylinderGeometry args={[0.06, 0.07, 0.1, 16]} /><meshStandardMaterial color="#1b1d22" metalness={0.6} roughness={0.4} /></mesh>
    <Rod a={[0.06, 1.18, 0.12]} b={[0.12, 1.1, 0.5]} r={0.012} c="#5b6068" />
    <Rb p={[0, 1.28, 0.02]} s={[broadcast ? 0.24 : 0.16, broadcast ? 0.26 : 0.17, broadcast ? 0.42 : 0.3]} c={broadcast ? "#e6e7e9" : "#2a2e35"} />
    <mesh position={[0, 1.28, -0.16 - lens / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[broadcast ? 0.075 : 0.05, broadcast ? 0.07 : 0.045, lens, 18]} /><meshStandardMaterial color="#15181d" metalness={0.5} roughness={0.35} /></mesh>
    <mesh position={[0, 1.28, -0.16 - lens - 0.005]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[broadcast ? 0.068 : 0.044, broadcast ? 0.068 : 0.044, 0.01, 18]} /><meshStandardMaterial color="#26385a" metalness={0.9} roughness={0.05} /></mesh>
    <Rb p={[-0.1, 1.42, 0.05]} s={[0.07, 0.07, 0.14]} c="#1b1d22" />
    <mesh position={[0.05, 1.4, -0.04]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#ff2020" emissive="#ff2020" emissiveIntensity={2} /></mesh>
    {/* rear connector plate (ports are placed here) */}
    <Rb p={[0, 1.28, broadcast ? 0.24 : 0.18]} s={[0.12, 0.1, 0.02]} c="#0d0f12" />
  </group>;
}

function Display({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  const wall = device.label.includes("Wall");
  const floor = device.position[1] < 0.3;
  return <group>
    {floor && <>
      <Rod a={[0, 0, 0]} b={[0, 1.1, 0]} r={0.03} />
      <Rb p={[0, 0.02, 0]} s={[0.6, 0.04, 0.4]} c="#1d2026" />
    </>}
    {!wall && !floor && <Rb p={[0, 0.04, -0.02]} s={[w * 0.35, 0.08, 0.16]} c="#1d2026" />}
    <group position={[0, floor ? 1.1 : wall ? 0 : 0.08, 0]}>
      <Rb p={[0, h / 2, 0]} s={[w, h, Math.max(d, 0.05)]} c="#0e1014" m={0.4} r={0.35} />
      {wall
        ? Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-w / 2 + (i % 4 + 0.5) * (w / 4), h - (Math.floor(i / 4) + 0.5) * (h / 3), d / 2 + 0.004]}>
          <planeGeometry args={[w / 4 - 0.05, h / 3 - 0.05]} /><meshBasicMaterial color={["#1d3a6a", "#2a5a3a", "#5a2a2a", "#3a3a5a"][i % 4]} toneMapped={false} />
        </mesh>)
        : <mesh position={[0, h / 2, d / 2 + 0.004]}><planeGeometry args={[w - 0.04, h - 0.04]} /><meshBasicMaterial color="#0c1a2c" toneMapped={false} /></mesh>}
    </group>
  </group>;
}

function RackUnit({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c="#15171b" m={0.4} />
    {Array.from({ length: Math.max(2, Math.floor(h / 0.2)) }, (_, u) => <group key={u} position={[0, 0.16 + u * 0.19, d / 2 + 0.006]}>
      <Rb p={[0, 0, 0]} s={[w - 0.06, 0.15, 0.01]} c={u % 2 ? "#262a31" : "#1e2127"} />
      {[0, 1, 2].map((l) => <mesh key={l} position={[-w / 2 + 0.1 + l * 0.05, 0.03, 0.01]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color="#38ff6a" emissive="#38ff6a" emissiveIntensity={2.4} /></mesh>)}
    </group>)}
  </group>;
}

function Desktop({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  const mixer = device.kind === "mixer" || /Mixer|Console/.test(device.label);
  const switcher = /Switcher/.test(device.label);
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c={device.color} />
    {(mixer || switcher) && <group position={[0, h + 0.004, 0]}>
      {Array.from({ length: mixer ? 8 : 10 }, (_, i) => <Rb key={i} p={[(i % (mixer ? 4 : 5) - (mixer ? 1.5 : 2)) * w * (mixer ? 0.2 : 0.16), 0.01, (Math.floor(i / (mixer ? 4 : 5)) - 0.5) * d * 0.4]} s={[w * 0.08, 0.02, mixer ? d * 0.26 : w * 0.08]} c={i === 0 ? "#e45647" : i === 1 ? "#45d36a" : "#9fb2c4"} />)}
    </group>}
    {/* front panel with I/O strip facing the trainee */}
    <mesh position={[0, h / 2, d / 2 + 0.003]}><planeGeometry args={[w * 0.86, Math.max(h * 0.5, 0.02)]} /><meshStandardMaterial color="#0a0f18" /></mesh>
  </group>;
}

function Laptop({ device }: { device: DeviceDef }) {
  const [w, , d] = device.size;
  return <group>
    <Rb p={[0, 0.012, 0]} s={[w, 0.024, d]} c="#c5c8cc" m={0.5} r={0.3} />
    <group position={[0, 0.024, -d / 2]} rotation={[-0.3, 0, 0]}>
      <Rb p={[0, d * 0.48, 0]} s={[w, d * 0.96, 0.014]} c="#c5c8cc" m={0.5} r={0.3} />
      <mesh position={[0, d * 0.48, 0.008]}><planeGeometry args={[w - 0.03, d * 0.88]} /><meshBasicMaterial color="#1b3d6e" toneMapped={false} /></mesh>
    </group>
  </group>;
}

function Mic({ device }: { device: DeviceDef }) {
  const onFloor = device.position[1] < 0.3;
  const shotgun = /Shotgun/.test(device.label);
  return <group>
    {onFloor && <>
      {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Rod key={k} a={[0, 0.3, 0]} b={[Math.cos(a) * 0.3, 0.01, Math.sin(a) * 0.3]} r={0.01} />; })}
      <Rod a={[0, 0.3, 0]} b={[0, shotgun ? 1.9 : 1.45, 0]} r={0.012} />
      {shotgun && <Rod a={[0, 1.9, 0]} b={[0, 2.0, -0.9]} r={0.012} />}
    </>}
    <group position={onFloor ? [0, shotgun ? 1.95 : 1.48, shotgun ? -0.9 : 0] : [0, 0.03, 0]} rotation={onFloor ? [0.3, 0, 0] : [Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[shotgun ? 0.012 : 0.016, shotgun ? 0.012 : 0.011, shotgun ? 0.3 : 0.18, 12]} /><meshStandardMaterial color="#1c1c1e" metalness={0.4} roughness={0.5} /></mesh>
      {!shotgun && <mesh position={[0, 0.11, 0]}><sphereGeometry args={[0.026, 14, 12]} /><meshStandardMaterial color="#555a60" metalness={0.7} roughness={0.35} /></mesh>}
    </group>
  </group>;
}

function Bodypack({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c="#15181d" />
    <Rod a={[w * 0.3, h, 0]} b={[w * 0.3, h + 0.12, 0]} r={0.004} c="#0e0e0e" />
    <mesh position={[-w * 0.25, h * 0.75, d / 2 + 0.002]}><circleGeometry args={[0.008, 10]} /><meshBasicMaterial color="#38ff6a" /></mesh>
  </group>;
}

export function GenericDevice({ device, bare = false }: { device: DeviceDef; bare?: boolean }) {
  const [, h] = device.size;
  const kind = device.kind;
  const tall = device.size[1] >= 0.8 && kind === "box";
  const display = /Monitor|Wall|TV|Screen|Display|Destination/.test(device.label) && kind === "box" && !tall;
  let body, labelY;
  if (kind === "camera") { body = <TripodCamera device={device} />; labelY = 1.68; }
  else if (display) { body = <Display device={device} />; labelY = (device.position[1] < 0.3 ? 1.1 : 0.08) + h + 0.12; }
  else if (tall) { body = <RackUnit device={device} />; labelY = h + 0.15; }
  else if (kind === "laptop") { body = <Laptop device={device} />; labelY = 0.4; }
  else if (kind === "mic") { body = <Mic device={device} />; labelY = device.position[1] < 0.3 ? 2.1 : 0.16; }
  else if (kind === "bodypack") { body = <Bodypack device={device} />; labelY = h + 0.16; }
  else { body = <Desktop device={device} />; labelY = h + 0.14; }
  return <group>
    {body}
    {!bare && <GenericLabel device={device} y={labelY} />}
  </group>;
}
