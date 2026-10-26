"use client";

import { SceneText as Text } from "@/components/game/scene-text";

import { SCENE_FONT, sceneText } from "@/game/rendering/scene-font";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Line } from "@react-three/drei";
import { DoubleSide, type Mesh, MeshBasicMaterial } from "three";
import { VenueEnvironment } from "./environment/venue-environment";
import { Studio as MissionStudio } from "./environment/venue/studio";
import { layoutOf } from "@/game/training/hdmi-training";
import { StaticScenery } from "./render-performance";
import type { VenueId } from "@/game/content/mission-catalog";
import { STUDIO } from "@/game/training/studio-room-layout";
import { getPort, heldPlugFits, isItemPlaced, itemPoint, portAvailable, portPosition, scenarioOf, simContext, socketPorts } from "@/game/training/hdmi-training";
import type { ActionDef, DeviceDef } from "@/game/training/scenarios";
import { useTrainingStore } from "@/game/stores/training-store";
import { PlaceableEquipment } from "./placeable-equipment";
import { HdmiCables } from "./hdmi-cables";
import { DeviceVisual } from "./equipment/device-visual";
import { PortSocket } from "./equipment/port-socket";
import { equipmentVisualGeometry } from "@/game/rendering/equipment-visual-profile";
import { SamsungTv } from "./equipment/samsung-tv";
import { monitorFeed } from "@/game/training/monitor-feed";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import * as studioAnchors from "@/game/training/studio-mission-ports.json";

/** Port tag text always draws over the device it labels (troika keeps its own derived material, so pass one). */
const TAG_TEXT_MATERIAL = new MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false });

const ROOM_FONT = SCENE_FONT;
const CONNECTOR_COLOR: Record<string, string> = {
  HDMI: "#e9bd6a", "USB-A": "#8fb4ff", "USB-C": "#8fb4ff", "3.5mm": "#6fd68a", "6.35mm": "#6fd68a", XLR: "#b9b9c4", SDI: "#e07a5f",
};

function Box({ position, scale, color, metalness = 0.15 }: { position: [number, number, number]; scale: [number, number, number]; color: string; metalness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={scale} /><meshStandardMaterial color={color} metalness={metalness} roughness={0.5} /></mesh>;
}

/** Ring colour per device, so every jack shows at a glance which box it belongs to. */
const DEVICE_COLOR: Record<string, string> = {
  switcher: "#ff5a4f", mixer: "#4f8dff", capture: "#b67bff", computer: "#38d6c4", monitor: "#8be4f4",
  speaker: "#ff9f43", rx: "#5ee07a", tx1: "#c8f25a", tx2: "#f2e25a", lav1: "#c8f25a", lav2: "#f2e25a",
  cam1: "#ff6fb5", camera: "#ff6fb5",
};
const CONNECTOR_NAME: Record<string, string> = {
  "3.5mm": "3.5 mm", "6.35mm": "6.35 mm", "XLR": "XLR", "XLR-M": "XLR (M)", "XLR-F": "XLR (F)", DisplayPort: "DP",
};

/**
 * Port marker: an elliptical ring in the device colour at the jack, plus a faint "x-ray" ring so it is never lost
 * behind the device body. The name tag ("อุปกรณ์ · พอร์ต · IN/OUT") is drawn on top of everything:
 * on the port being aimed at, and — while a cable end is held — on every port that plug physically fits (green ✓).
 * Ports the held plug cannot enter fade out, so the right jack stands out without revealing the route.
 */
/**
 * Where a port's marker sits and which way it faces: flush on the device face (2.5 cm proud of it, so it never
 * cuts into the casing), turned to the face's outward direction — not to the camera. Returns "x,y,z,yaw,flat".
 */
function markerPoint(state: Parameters<typeof portPosition>[0], id: string): string {
  const port = getPort(state, id);
  if (!port) return "";
  const p = portPosition(state, id);
  const scenario = scenarioOf(state);
  const item = state.items[port.device] ?? (port.requiresItem ? state.items[port.requiresItem] : undefined);
  const device = scenario.devices.find((d) => d.id === port.device);
  const native = scenario.layout === "studioMission" ? (studioAnchors as Record<string, { normal: number[] }>)[id] : null;
  if (port.normal) {
    const yaw = item?.turn ?? 0, [x, y, z] = port.normal;
    const nx = x * Math.cos(yaw) + z * Math.sin(yaw), nz = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [p[0] + nx * 0.025, p[1] + y * 0.025, p[2] + nz * 0.025, Math.atan2(nx, nz), y > 0.5 ? 1 : 0].join(",");
  }
  if (native && device) {
    const yaw = (device.yaw ?? 0) + (item?.turn ?? 0), [x, y, z] = native.normal;
    const nx = x * Math.cos(yaw) + z * Math.sin(yaw), nz = -x * Math.sin(yaw) + z * Math.cos(yaw);
    return [p[0] + nx * 0.025, p[1] + y * 0.025, p[2] + nz * 0.025, Math.atan2(nx, nz), y > 0.5 ? 1 : 0].join(",");
  }
  if (scenario.layout === "classroom" && device?.generic) {
    const yaw = (device.yaw ?? 0) + (item?.turn ?? 0) + (device.id === "monitor" ? Math.PI : 0);
    return [p[0] + Math.sin(yaw) * 0.025, p[1], p[2] + Math.cos(yaw) * 0.025, yaw, 0].join(",");
  }
  // Studio gear baked into the room GLB (not scenario devices) uses its layout position.
  const baked = port.device === "speaker" ? STUDIO.speaker : port.device === "monitor" && !device ? STUDIO.equipment.monitor : null;
  const center = item ? [item.position[0], p[1], item.position[2]] : device ? [device.position[0], p[1], device.position[2]] : baked ? [baked[0], p[1], baked[2]] : null;
  let dx = center ? p[0] - center[0] : 0, dz = center ? p[2] - center[2] : 0;
  const len = Math.hypot(dx, dz);
  if (len < 0.02) return [p[0], p[1] + 0.02, p[2], 0, 1].join(","); // port on a top surface: ring lies flat
  dx /= len; dz /= len;
  return [+(p[0] + dx * 0.025).toFixed(4), p[1], +(p[2] + dz * 0.025).toFixed(4), +Math.atan2(dx, dz).toFixed(4), 0].join(",");
}

/** Local visual animation only: never changes cable connections or simulation time. */
function PortFeedback({ connection, radius }: { connection: string; radius: number }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const previous = useRef(connection);
  const remaining = useRef(0);
  useFrame((_, delta) => {
    if (previous.current !== connection) {
      previous.current = connection;
      remaining.current = 0.65;
      material.current?.color.set(connection ? "#6fe6ff" : "#ffcb70");
    }
    remaining.current = Math.max(0, remaining.current - delta);
    const progress = 1 - remaining.current / 0.65;
    if (mesh.current) { mesh.current.visible = remaining.current > 0; mesh.current.scale.setScalar(1 + progress * 1.5); }
    if (material.current) material.current.opacity = (1 - progress) * 0.85;
  });
  return <mesh ref={mesh} visible={false}>
    <ringGeometry args={[radius * 1.1, radius * 1.3, 24]} />
    <meshBasicMaterial ref={material} transparent opacity={0} depthWrite={false} side={DoubleSide} />
  </mesh>;
}

function Port({ id }: { id: string }) {
  const mission = useTrainingStore((state) => Boolean(scenarioOf(state).stage));
  const connection = useTrainingStore((state) => {
    if (!scenarioOf(state).stage) return "";
    for (const [cableId, cable] of Object.entries(state.cables)) {
      if (cable.a.portId === id) return `${cableId}:a`;
      if (cable.b.portId === id) return `${cableId}:b`;
    }
    return "";
  });
  const signal = useTrainingStore((state) => {
    if (!scenarioOf(state).stage) return false;
    const ctx = simContext(state);
    const value = ctx?.inp[id] ?? ctx?.out[id];
    if (!value) return false;
    if (value.kind === "control") return value.active;
    if (value.kind === "video") return value.content !== "BLACK";
    if (value.kind === "audio") return value.sources.length > 0;
    if (value.kind === "net" && value.role === "stream") return value.keyOk && Boolean(value.content || value.audio.length);
    return true;
  });
  const physicalSocket = useTrainingStore((state) => {
    const p = getPort(state, id);
    return scenarioOf(state).layout !== "studio" && scenarioOf(state).devices.some((d) => d.id === p?.device && d.generic && !equipmentVisualGeometry(d.modelId)?.parts);
  });
  const port = useTrainingStore((state) => getPort(state, id));
  const live = useTrainingStore((state) => portAvailable(state, id));
  const at = useTrainingStore((state) => markerPoint(state, id));
  const fits = useTrainingStore((state) => heldPlugFits(state, id));
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "port" && state.focusedTarget.portId === id);
  if (!port || !live) return null;
  const base = DEVICE_COLOR[port.device] ?? CONNECTOR_COLOR[port.connector] ?? "#ffffff";
  const color = fits === true ? "#5ef08a" : fits === false ? "#5d6470" : mission && connection ? signal ? "#5ef08a" : "#ffcb70" : base;
  const r = port.radius ?? 0.06;
  const ring = Math.min(Math.max(r * 0.75, 0.016), 0.04);
  const plug = CONNECTOR_NAME[port.connector] ?? port.connector;
  const dir = port.linkRole === "NETWORK_PEER" ? "เครือข่ายสองทาง" : port.linkRole === "USB_HOST" ? "HOST" : port.linkRole === "USB_DEVICE" ? "DEVICE" : port.linkRole === "POWER_ONLY" ? "ไฟเลี้ยงเท่านั้น" : port.direction === "INPUT" ? "IN" : "OUT";
  const showTag = focused;
  const status = mission && connection ? signal ? "เสียบแล้ว · พอร์ตมีสัญญาณจำลอง" : "เสียบแล้ว · พอร์ตยังไม่มีสัญญาณจำลอง" : "";
  const tag = `${fits === true ? "✓ เสียบได้ · " : ""}${port.label.replace(/\s*\([^)]*\)\s*$/, "")} · ${plug} · ${dir}${status ? ` · ${status}` : ""}`;
  const tagSize = 0.036;
  const tagWidth = Math.min(1.35, Math.max(0.6, tag.length * tagSize * 0.44 + 0.12));
  const [mx, my, mz, yaw, flat] = at.split(",").map(Number);
  return <group position={[mx, my, mz]}>
    <group rotation={flat ? [-Math.PI / 2, 0, 0] : [0, yaw, 0]}>
      {mission && <PortFeedback connection={connection} radius={ring} />}
      {physicalSocket && <group position={[0, 0, -0.025]}><PortSocket connector={port.connector} direction={port.direction} /></group>}
      {/* balanced ellipse flush on the device face: thin bright rim, soft glass fill, faint x-ray copy through the body */}
      <mesh scale={[1.3, 1, 1]}><torusGeometry args={[ring, ring * (focused ? 0.17 : 0.11), 10, 48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={fits === false ? 0.2 : focused ? 1.6 : 1.0} transparent opacity={fits === false ? 0.45 : 1} /></mesh>
      <mesh scale={[1.3, 1, 1]}><circleGeometry args={[ring * 0.9, 40]} /><meshBasicMaterial color={color} transparent opacity={fits === false ? 0.04 : focused ? 0.22 : 0.1} depthWrite={false} side={DoubleSide} /></mesh>
      {!mission && <mesh scale={[1.3, 1, 1]} renderOrder={8}><torusGeometry args={[ring, ring * 0.08, 6, 40]} /><meshBasicMaterial color={color} transparent opacity={fits === false ? 0.06 : 0.25} depthTest={false} depthWrite={false} /></mesh>}
    </group>
    <Billboard>
      {/* Port tag floats above the socket and a little toward the player so it never lies on the device face. */}
      {showTag && <group position={[0, ring + 0.12, 0.05]}>
        <mesh renderOrder={1000}><planeGeometry args={[tagWidth, 0.16]} /><meshBasicMaterial color={fits === true ? "#0d3a22" : "#0b1220"} transparent opacity={0.82} depthTest={false} depthWrite={false} /></mesh>
        <mesh position={[0, -0.092, 0]} renderOrder={1000}><planeGeometry args={[0.003, 0.024]} /><meshBasicMaterial color={color} transparent opacity={0.7} depthTest={false} depthWrite={false} /></mesh>
        <Text font={ROOM_FONT} position={[0, 0, 0.001]} fontSize={tagSize} lineHeight={1.5} color={fits === true ? "#c8ffd8" : "#f7f1e3"} anchorX="center" anchorY="middle" textAlign="center" renderOrder={1001} material={TAG_TEXT_MATERIAL} maxWidth={tagWidth - 0.1}>
          {sceneText(tag)}
        </Text>
      </group>}
    </Billboard>
    <mesh userData={{ trainingTarget: { kind: "port", portId: id }, serviceNormal: mission ? flat ? [0, 1, 0] : [Math.sin(yaw), 0, Math.cos(yaw)] : undefined }}>
      <sphereGeometry args={[mission ? r + 0.006 : r, 12, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </group>;
}

/** Interactive spot for a procedural step (set mixer level, open OBS). */
function ActionSpot({ action }: { action: ActionDef }) {
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "action" && state.focusedTarget.actionId === action.id);
  const done = useTrainingStore((state) => state.actionsDone[action.id]);
  const at = useTrainingStore((state) => (action.onItem ? itemPoint(state, action.onItem, action.position) : action.position).join(","));
  const live = useTrainingStore((state) => !action.onItem || (state.heldItem !== action.onItem && isItemPlaced(state, action.onItem)));
  if (!live) return null;
  const color = done ? "#6fd68a" : "#e9c27a";
  return <group position={at.split(",").map(Number) as [number, number, number]}>
    <mesh><torusGeometry args={[0.05, 0.008, 8, 24]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} /></mesh>
    <mesh userData={{ trainingTarget: { kind: "action", actionId: action.id } }}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    {focused && <Billboard position={[0, 0.12, 0]}><Text font={ROOM_FONT} fontSize={0.055} color={color} anchorX="center" outlineWidth={0.002} outlineColor="#000" maxWidth={0.95} textAlign="center">{sceneText(done ? action.doneLabel : action.label)}</Text></Billboard>}
  </group>;
}

/** The existing floor stand stays in the environment; only the TV body changes. */
function Monitor() {
  const feed = useTrainingStore(monitorFeed);
  return <group position={STUDIO.equipment.monitor}>
    <SamsungTv feed={feed} interactive />
  </group>;
}

/** Adapter sockets are mounted dynamically; keep their target independent of the static Port hooks. */
function AdapterSocket({ id }: { id: string }) {
  const at = useTrainingStore((state) => portPosition(state, id).join(","));
  const [x, y, z] = at.split(",").map(Number);
  return <group position={[x, y, z]}>
    <mesh><torusGeometry args={[0.026, 0.004, 8, 24]} /><meshStandardMaterial color="#5ef08a" emissive="#5ef08a" emissiveIntensity={0.8} /></mesh>
    <mesh userData={{ trainingTarget: { kind: "port", portId: id } }}><sphereGeometry args={[0.04, 12, 10]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
  </group>;
}

/** The single-camera prop used by the basic HDMI scenario. */
function BasicCamera() {
  return <group position={STUDIO.equipment.camera} scale={0.6}>
    <mesh position={[-0.28, -1.25, 0.18]} rotation={[0, 0, -0.18]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0.28, -1.25, 0.18]} rotation={[0, 0, 0.18]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, -1.25, -0.28]} rotation={[0.18, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <Box position={[0, 0, 0]} scale={[0.95, 0.28, 0.65]} color="#1b2638" />
    <mesh position={[0, 0.23, -0.25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.25, 0.3, 0.55, 20]} /><meshStandardMaterial color="#233b52" metalness={0.65} roughness={0.3} /></mesh>
    <Text font={ROOM_FONT} position={[0, 0.57, 0]} fontSize={0.13} color="#94edfa" anchorX="center">CAMERA</Text>
  </group>;
}

function FixedDevice({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  const mission = useTrainingStore((state) => Boolean(scenarioOf(state).venueScale));
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "device" && state.focusedTarget.deviceId === device.id);
  return <group position={device.position} rotation={[0, device.yaw ?? 0, 0]}>
    {(device.id !== "speaker" || mission) && <DeviceVisual device={device} bare={!focused && !(mission && device.kind === "camera")} />}
    <mesh position={[0, device.kind === "camera" ? 1.3 : h / 2, 0]} userData={{ trainingTarget: { kind: "device", deviceId: device.id } }}>
      <boxGeometry args={[Math.max(w, 0.3), device.kind === "camera" ? 0.4 : h, Math.max(d, 0.3)]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </group>;
}

/** Mission venues show their full interactive equipment, ports and cables (set true only for a scenery-only preview). */
export const VENUE_SCENE_ONLY = false;

/** Thai zone signs over the main work areas of a mission venue (storage, control desk, cameras, stage side, stream, racks). */
const ZONE_SIGNS: [string, string][] = [["cam1", "จุดกล้อง"], ["stagebox", "ข้างเวที / Stagebox"], ["encoder", "จุดสตรีม"], ["router", "ตู้ Rack"], ["mic0", "จุดเสียง / ผู้บรรยาย"], ["fiber-tx", "จุดส่งสัญญาณ Fiber"]];
function ZoneSign({ text, at, compact = false }: { text: string; at: [number, number, number]; compact?: boolean }) {
  return <Billboard position={at} scale={compact ? 0.6 : 1}>
    <mesh><planeGeometry args={[1.4, 0.35]} /><meshBasicMaterial color="#e7c98f" /></mesh>
    <mesh position={[0, 0, 0.001]}><planeGeometry args={[1.37, 0.32]} /><meshBasicMaterial color="#0a1222" /></mesh>
    <Text font={ROOM_FONT} position={[0, 0, 0.003]} fontSize={0.095} maxWidth={1.3} color="#ffe9b8" textAlign="center">{sceneText(text)}</Text>
  </Billboard>;
}

function ZoneSigns() {
  const compact = useTrainingStore((state) => scenarioOf(state).layout === "studioMission");
  const signs = useTrainingStore((state) => {
    const layout = layoutOf(state);
    const list: { text: string; at: [number, number, number] }[] = [
      { text: "คลังอุปกรณ์", at: [layout.equipment.center[0], layout.equipment.center[1] + 1.25, layout.equipment.center[2]] },
      { text: "คลังสาย", at: [layout.cables.center[0], layout.cables.center[1] + 1.25, layout.cables.center[2]] },
      { text: "โต๊ะควบคุม", at: [layout.work.center[0], layout.work.center[1] + 1.55, layout.work.center[2]] },
    ];
    const zoneSigns: [string, string][] = layout.id === "outdoor" ? [
      ["cam1", "กล้อง A · ตะวันออก"], ["cam2", "กล้อง B · ตะวันตก"], ["cam3", "กล้อง C · ภาพรวม"],
      ["mic", "จุดพิธีกรและไมค์"], ["vh", "ตู้รวมสัญญาณภาพ"], ["wan", "จุดรับสตรีมทดสอบ"],
    ] : layout.id === "stadium" ? [
      ["cam1", "กล้อง 1 · ภาพกว้าง"], ["cam2", "กล้อง 2 · ริมสนาม"], ["cam4", "กล้อง 3 · มุมท้ายสนาม"], ["cam3", "กล้อง 4 · ผู้ชม"],
      ["sw", "โต๊ะผู้กำกับภาพ"], ["replay", "โต๊ะเล่นคลิป"], ["graphics", "โต๊ะกราฟิก"], ["mix", "โต๊ะควบคุมเสียง"],
      ["mic0", "โต๊ะผู้บรรยาย"], ["encoder", "ตู้ส่งสตรีม"],
    ] : ZONE_SIGNS;
    for (const [id, text] of zoneSigns) { const p = layout.places[id]?.p; if (p) list.push({ text, at: [p[0], Math.max(p[1], 0) + 2.3, p[2]] }); }
    return JSON.stringify(list);
  });
  return <>{(JSON.parse(signs) as { text: string; at: [number, number, number] }[]).map((s) => <ZoneSign key={s.text} text={s.text} at={s.at} compact={compact} />)}</>;
}

/** Wireless TX → RX radio link: shown once both bodypacks sit at their operating spots. */
function WirelessLink({ tx }: { tx: string }) {
  const ends = useTrainingStore((state) => {
    if (state.scenarioId === "studio-full" && state.selectedWireless !== tx) return "";
    if (!state.items[tx] || !state.items.rx || !isItemPlaced(state, tx) || !isItemPlaced(state, "rx")) return "";
    const [a, b] = [state.items[tx].position, state.items.rx.position];
    return [a[0], a[1] + 0.3, a[2], b[0], b[1] + 0.32, b[2]].join(",");
  });
  if (!ends) return null;
  const [ax, ay, az, bx, by, bz] = ends.split(",").map(Number);
  const mid: [number, number, number] = [(ax + bx) / 2, Math.max(ay, by) + 0.25, (az + bz) / 2];
  return <group>
    <Line points={[[ax, ay, az], mid, [bx, by, bz]]} color="#62dce9" lineWidth={2} dashed dashSize={0.05} gapSize={0.04} transparent opacity={0.85} />
    <Billboard position={mid}><Text font={ROOM_FONT} fontSize={0.05} color="#b5f3ff" anchorX="center" textAlign="center" maxWidth={1.1}>{sceneText(`${tx.toUpperCase()} ⟶ RX · ไร้สาย`)}</Text></Billboard>
  </group>;
}

export function TrainingRoom({ venue = "studio" }: { venue?: VenueId }) {
  const scenario = useTrainingStore((state) => scenarioOf(state));
  const sockets = useTrainingStore((state) => socketPorts(state).join("|")).split("|").filter(Boolean);
  // A scenery-only preview must be explicitly enabled; normal mission rendering retains gameplay.
  if (VENUE_SCENE_ONLY && scenario.venueScale) return <StaticScenery><VenueEnvironment venue={venue} /></StaticScenery>;
  return <>
    {/* Mission S has its own enlarged studio shell; free practice keeps Studio Room 01. */}
    <StaticScenery>{scenario.layout === "studioMission" ? <MissionStudio /> : <VenueEnvironment venue={venue} />}</StaticScenery>
    {scenario.id === "hdmi-basic" && <BasicCamera />}
    {/* Tripod cameras block walking; colliders follow whichever cameras this scenario shows. */}
    <RigidBody key={scenario.id} type="fixed" colliders={false}>
      {(scenario.id === "hdmi-basic" ? [[STUDIO.equipment.camera[0], 0, STUDIO.equipment.camera[2]]] : scenario.devices.filter((d) => d.kind === "camera").map((d) => d.position))
        .map(([x, , z], i) => <CylinderCollider key={i} position={[x, 0.85, z]} args={[0.85, scenario.venueScale ? 0.3 : 0.5]} />)}
    </RigidBody>
    {/* Floor-standing fixed gear (racks, network cabinets, display stands) blocks walking like the real thing. */}
    {scenario.venueScale && <RigidBody key={`fixed-${scenario.id}`} type="fixed" colliders={false}>
      {scenario.devices.filter((d) => d.kind !== "camera" && d.position[1] < 0.3 && !scenario.placeables.some((p) => p.id === d.id))
        .map((d) => <CuboidCollider key={d.id} position={[d.position[0], 0.6, d.position[2]]} rotation={[0, d.yaw ?? 0, 0]} args={[d.size[0] / 2 + 0.02, 0.6, d.size[2] / 2 + 0.02]} />)}
    </RigidBody>}
    {scenario.devices.filter((d) => !scenario.placeables.some((p) => p.id === d.id)).map((device) => <FixedDevice key={device.id} device={device} />)}
    {!scenario.venueScale && <Monitor />}
    {scenario.venueScale && <ZoneSigns />}
    {["tx1", "tx2"].filter((id) => scenario.placeables.some((p) => p.id === id)).map((id) => <WirelessLink key={id} tx={id} />)}
    {Object.keys(scenario.ports).filter((id) => !scenario.cables.some((cable) => cable.fixedA === id)).map((id) => <Port key={id} id={id} />)}
    {sockets.map((id) => <AdapterSocket key={id} id={id} />)}
    {scenario.actions.map((action) => <ActionSpot key={action.id} action={action} />)}
    <PlaceableEquipment />
    <HdmiCables />
  </>;
}
