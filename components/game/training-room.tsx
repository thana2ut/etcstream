"use client";

import { Billboard, Text } from "@react-three/drei";
import { DoubleSide } from "three";
import { VenueEnvironment } from "./environment/venue-environment";
import { StaticScenery } from "./render-performance";
import type { VenueId } from "@/game/content/mission-catalog";
import { STUDIO } from "@/game/training/studio-room-layout";
import { getPort, heldPlugFits, isItemPlaced, itemPoint, portAvailable, portPosition, requirementDone, scenarioOf, socketPorts } from "@/game/training/hdmi-training";
import type { ActionDef, DeviceDef } from "@/game/training/scenarios";
import { useTrainingStore } from "@/game/stores/training-store";
import { PlaceableEquipment } from "./placeable-equipment";
import { HdmiCables } from "./hdmi-cables";
import { DeviceVisual } from "./equipment/device-visual";
import { SamsungTv } from "./equipment/samsung-tv";
import { monitorFeed } from "@/game/training/monitor-feed";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";

const ROOM_FONT = "/fonts/geist-regular.ttf";
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
  // Studio gear baked into the room GLB (not scenario devices) uses its layout position.
  const baked = port.device === "speaker" ? STUDIO.speaker : port.device === "monitor" && !device ? STUDIO.equipment.monitor : null;
  const center = item ? [item.position[0], p[1], item.position[2]] : device ? [device.position[0], p[1], device.position[2]] : baked ? [baked[0], p[1], baked[2]] : null;
  let dx = center ? p[0] - center[0] : 0, dz = center ? p[2] - center[2] : 0;
  const len = Math.hypot(dx, dz);
  if (len < 0.02) return [p[0], p[1] + 0.02, p[2], 0, 1].join(","); // port on a top surface: ring lies flat
  dx /= len; dz /= len;
  return [+(p[0] + dx * 0.025).toFixed(4), p[1], +(p[2] + dz * 0.025).toFixed(4), +Math.atan2(dx, dz).toFixed(4), 0].join(",");
}

function Port({ id }: { id: string }) {
  const port = useTrainingStore((state) => getPort(state, id));
  const live = useTrainingStore((state) => portAvailable(state, id));
  const at = useTrainingStore((state) => markerPoint(state, id));
  const fits = useTrainingStore((state) => heldPlugFits(state, id));
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "port" && state.focusedTarget.portId === id);
  if (!port || !live) return null;
  const base = DEVICE_COLOR[port.device] ?? CONNECTOR_COLOR[port.connector] ?? "#ffffff";
  const color = fits === true ? "#5ef08a" : fits === false ? "#5d6470" : base;
  const r = port.radius ?? 0.06;
  const ring = Math.min(Math.max(r * 0.75, 0.016), 0.04);
  const plug = CONNECTOR_NAME[port.connector] ?? port.connector;
  const dir = port.direction === "INPUT" ? "IN" : "OUT";
  const showTag = focused || fits === true;
  const tag = `${fits === true ? "✓ เสียบได้ · " : ""}${port.label.replace(/\s*\([^)]*\)\s*$/, "")} · ${plug} · ${dir}`;
  const tagSize = focused ? 0.026 : 0.019;
  const tagWidth = Math.min(0.9, tag.length * tagSize * 0.58 + 0.05);
  const [mx, my, mz, yaw, flat] = at.split(",").map(Number);
  return <group position={[mx, my, mz]}>
    <group rotation={flat ? [-Math.PI / 2, 0, 0] : [0, yaw, 0]}>
      {/* balanced ellipse flush on the device face: thin bright rim, soft glass fill, faint x-ray copy through the body */}
      <mesh scale={[1.3, 1, 1]}><torusGeometry args={[ring, ring * (focused ? 0.17 : 0.11), 10, 48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={fits === false ? 0.2 : focused ? 1.6 : 1.0} transparent opacity={fits === false ? 0.45 : 1} /></mesh>
      <mesh scale={[1.3, 1, 1]}><circleGeometry args={[ring * 0.9, 40]} /><meshBasicMaterial color={color} transparent opacity={fits === false ? 0.04 : focused ? 0.22 : 0.1} depthWrite={false} side={DoubleSide} /></mesh>
      <mesh scale={[1.3, 1, 1]} renderOrder={8}><torusGeometry args={[ring, ring * 0.08, 6, 40]} /><meshBasicMaterial color={color} transparent opacity={fits === false ? 0.06 : 0.25} depthTest={false} depthWrite={false} /></mesh>
    </group>
    <Billboard>
      {showTag && <group position={[0, ring + 0.045, 0]}>
        <mesh renderOrder={10}><planeGeometry args={[tagWidth, tagSize * 1.9]} /><meshBasicMaterial color={fits === true ? "#0d3a22" : "#0b1220"} transparent opacity={0.82} depthTest={false} depthWrite={false} /></mesh>
        <mesh position={[0, -tagSize * 0.95 - 0.012, 0]} renderOrder={10}><planeGeometry args={[0.003, 0.024]} /><meshBasicMaterial color={color} transparent opacity={0.7} depthTest={false} depthWrite={false} /></mesh>
        <Text font={ROOM_FONT} position={[0, 0, 0.001]} fontSize={tagSize} color={fits === true ? "#c8ffd8" : "#f7f1e3"} anchorX="center" anchorY="middle" renderOrder={11} material-depthTest={false} material-depthWrite={false} maxWidth={0.88}>
          {tag}
        </Text>
      </group>}
    </Billboard>
    <mesh userData={{ trainingTarget: { kind: "port", portId: id } }}>
      <sphereGeometry args={[r, 12, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </group>;
}

/** Interactive spot for a procedural step (set mixer level, open OBS). */
function ActionSpot({ action }: { action: ActionDef }) {
  const done = useTrainingStore((state) => state.actionsDone[action.id]);
  const at = useTrainingStore((state) => (action.onItem ? itemPoint(state, action.onItem, action.position) : action.position).join(","));
  const live = useTrainingStore((state) => !action.onItem || (state.heldItem !== action.onItem && isItemPlaced(state, action.onItem)));
  if (!live) return null;
  const color = done ? "#6fd68a" : "#e9c27a";
  return <group position={at.split(",").map(Number) as [number, number, number]}>
    <mesh><torusGeometry args={[0.05, 0.008, 8, 24]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} /></mesh>
    <mesh userData={{ trainingTarget: { kind: "action", actionId: action.id } }}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    <Text font={ROOM_FONT} position={[0, 0.09, 0]} fontSize={0.028} color={color} anchorX="center" outlineWidth={0.002} outlineColor="#000">{done ? action.doneLabel : action.label}</Text>
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
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "device" && state.focusedTarget.deviceId === device.id);
  return <group position={device.position} rotation={[0, device.yaw ?? 0, 0]}>
    {device.id !== "speaker" && <DeviceVisual device={device} bare={!focused} />}
    <mesh position={[0, device.kind === "camera" ? 1.3 : h / 2, 0]} userData={{ trainingTarget: { kind: "device", deviceId: device.id } }}>
      <boxGeometry args={[Math.max(w, 0.3), device.kind === "camera" ? 0.4 : h, Math.max(d, 0.3)]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </group>;
}

function ScenarioMonitor() {
  const scenario = useTrainingStore((state) => scenarioOf(state));
  const live = useTrainingStore((state) => {
    const path = scenarioOf(state).requirements.filter(r => r.group === "video" || r.id === "monitor");
    return path.length > 0 && path.every(r => requirementDone(state, r));
  });
  const programSource = useTrainingStore((state) => state.programSource);
  const device = scenario.devices.find(d => d.id === "monitor");
  if (!device) return null;
  return <Billboard position={[device.position[0], device.position[1] + 0.5, device.position[2]]}>
    <mesh><planeGeometry args={[0.6, 0.26]} /><meshBasicMaterial color={live ? "#084f40" : "#161c27"} /></mesh>
    <Text font={ROOM_FONT} position={[0, 0, 0.01]} fontSize={0.035} maxWidth={0.58} textAlign="center" color="#ffffff">{live ? `SIGNAL ACTIVE\nPROGRAM: ${programSource ?? "INPUT READY"}` : "NO SIGNAL"}</Text>
  </Billboard>;
}

/** Temporary: mission venues render the environment only, without scenario cables, ports or devices. */
export const VENUE_SCENE_ONLY = true;

export function TrainingRoom({ venue = "studio" }: { venue?: VenueId }) {
  const scenario = useTrainingStore((state) => scenarioOf(state));
  const sockets = useTrainingStore((state) => socketPorts(state).join("|")).split("|").filter(Boolean);
  // Mission-hall venues currently show the scene only (no cables / equipment). Flip VENUE_SCENE_ONLY to restore gameplay.
  if (VENUE_SCENE_ONLY && scenario.venueScale) return <StaticScenery><VenueEnvironment venue={venue} /></StaticScenery>;
  return <>
    <StaticScenery><VenueEnvironment venue={venue} /></StaticScenery>
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
    {scenario.venueScale ? <ScenarioMonitor /> : <Monitor />}
    {Object.keys(scenario.ports).filter((id) => !scenario.cables.some((cable) => cable.fixedA === id)).map((id) => <Port key={id} id={id} />)}
    {sockets.map((id) => <AdapterSocket key={id} id={id} />)}
    {scenario.actions.map((action) => <ActionSpot key={action.id} action={action} />)}
    <PlaceableEquipment />
    <HdmiCables />
  </>;
}
