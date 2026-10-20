"use client";

import { memo, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Shape, Vector3 } from "three";
import { RoundedBox } from "@react-three/drei";
import { SceneText } from "@/components/game/scene-text";
import { useTrainingStore } from "@/game/stores/training-store";
import { simContext } from "@/game/training/hdmi-training";
import { MODELS } from "@/game/training/sim/equipment";
import type { ModelGeometry, Part, Press, SocketKind, V3 } from "@/game/training/sim/model-geometry";

/**
 * Data-driven renderer for the Phase 04 hardware models (game/training/sim/hardware-geometry.ts).
 * Built at real size in metres and scaled by the model's displayScale. Geometries and materials are shared module-wide so
 * the 6-camera stadium rig does not multiply GPU resources; only per-device lit/feeds subscribe to the store.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);
const UNIT_CYL = new CylinderGeometry(1, 1, 1, 20);
const UNIT_CYL_LO = new CylinderGeometry(1, 1, 1, 10);
const MATS = new Map<string, MeshStandardMaterial>();
function mat(color: string, opts: { metal?: number; rough?: number; glow?: number } = {}) {
  const k = `${color}|${opts.metal ?? 0.15}|${opts.rough ?? 0.55}|${opts.glow ?? 0}`;
  let m = MATS.get(k);
  if (!m) { m = new MeshStandardMaterial({ color, metalness: opts.metal ?? 0.15, roughness: opts.rough ?? 0.55, emissive: opts.glow ? color : "#000000", emissiveIntensity: opts.glow ?? 0 }); MATS.set(k, m); }
  return m;
}
const Z = new Vector3(0, 0, 1), Y = new Vector3(0, 1, 0);
const QS = new Map<string, Quaternion>();
/** Rotation that turns local +Z (faces, sockets) or +Y (cylinders) onto the face normal n. */
function face(n: V3, from: Vector3 = Z) {
  const k = `${from === Z ? "z" : "y"}${n.join(",")}`;
  let q = QS.get(k);
  if (!q) { q = new Quaternion().setFromUnitVectors(from, new Vector3(...n).normalize()); QS.set(k, q); }
  return q;
}
const METAL = mat("#9aa0a8", { metal: 0.85, rough: 0.3 }), HOLE = mat("#06070a", { rough: 0.9 }), DARK = mat("#14161a", { rough: 0.7 });

/** One physical connector, drawn protruding along local +Z from the panel surface (real millimetre outlines). */
const Socket = memo(function Socket({ kind, at, n }: { kind: SocketKind; at: V3; n: V3 }) {
  const q = face(n);
  const round = (r: number, depth: number, inner: number, body = METAL) => <>
    <mesh geometry={UNIT_CYL} material={body} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, depth / 2]} scale={[r, depth, r]} />
    <mesh geometry={UNIT_CYL_LO} material={HOLE} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, depth + 0.0002]} scale={[inner, 0.0004, inner]} />
  </>;
  const rect = (w: number, h: number, frame = METAL, depth = 0.0015) => <>
    <mesh geometry={UNIT_BOX} material={frame} position={[0, 0, depth / 2]} scale={[w, h, depth]} />
    <mesh geometry={UNIT_BOX} material={HOLE} position={[0, 0, depth + 0.0001]} scale={[w * 0.8, h * 0.66, 0.0003]} />
  </>;
  let body: React.ReactNode;
  switch (kind) {
    case "bnc": body = <>{round(0.0055, 0.006, 0.0032)}<mesh geometry={UNIT_CYL_LO} material={mat("#c8a24a", { metal: 0.9, rough: 0.3 })} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0062]} scale={[0.0007, 0.001, 0.0007]} /></>; break;
    case "hdmi": body = rect(0.015, 0.0065); break;
    case "rj45": body = rect(0.0158, 0.0135, mat("#b8bcc2", { metal: 0.6 })); break;
    case "usbc": body = rect(0.009, 0.0034); break;
    case "usbb": body = rect(0.012, 0.011); break;
    case "sfp": body = rect(0.014, 0.0095); break;
    case "db9": body = rect(0.031, 0.0125); break;
    case "db25": body = rect(0.053, 0.0125); break;
    case "iec": body = rect(0.03, 0.023, DARK, 0.003); break;
    case "sd": body = rect(0.025, 0.0028, DARK); break;
    case "xlr3f": case "xlr3m": case "xlr4": case "xlr5": body = round(0.011, 0.004, 0.0085, mat("#a9adb3", { metal: 0.8 })); break;
    case "trs": body = round(0.0065, 0.003, 0.0032); break;
    case "jack35": body = round(0.0042, 0.0016, 0.0018); break;
    case "rca": body = round(0.0045, 0.006, 0.0018, mat(at[1] > 0.03 ? "#d8d8d8" : "#c23b32", { metal: 0.4 })); break;
    case "dc": body = round(0.0054, 0.0016, 0.0028); break;
    case "smpte": body = round(0.015, 0.02, 0.009, mat("#b9bdc3", { metal: 0.9, rough: 0.25 })); break;
  }
  return <group position={at} quaternion={q}>{body}</group>;
});

function useDevice(deviceId: string, modelId: string) {
  const model = MODELS[modelId];
  const hasPower = Boolean(model?.controls.some((c) => c.key === "power"));
  const config = useTrainingStore((state) => state.sim?.config[deviceId]);
  const cfg = (k: string) => config?.[k] ?? model?.controls.find((c) => c.key === k)?.default;
  return { powered: hasPower ? cfg("power") === true : true, cfg };
}

const HIT = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
export function PressTarget({ deviceId, press, w, h }: { deviceId: string; press: Press; w: number; h: number }) {
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "control" && state.focusedTarget.deviceId === deviceId && state.focusedTarget.key === press.key && state.focusedTarget.value === press.value);
  return <>
    <mesh geometry={UNIT_BOX} material={HIT} position={[0, 0, 0.004]} scale={[Math.max(w, 0.012) * 1.25, Math.max(h, 0.01) * 1.25, 0.006]}
      userData={{ trainingTarget: { kind: "control", deviceId, key: press.key, value: press.value, label: press.label } }} />
    {focused && <mesh geometry={UNIT_BOX} material={mat("#5ef08a", { glow: 1.2 })} position={[0, 0, 0.0001]} scale={[w + 0.002, h + 0.002, 0.0004]} />}
  </>;
}

function Screen({ part, deviceId, powered }: { part: Extract<Part, { t: "screen" }>; deviceId: string; powered: boolean }) {
  const feed = useTrainingStore((state) => {
    if (!powered || !part.feed) return "";
    const ctx = simContext(state);
    if (!ctx) return "";
    if (part.feed.startsWith("in:")) { const s = ctx.inp[`${deviceId}:${part.feed.slice(3)}`]; return s?.kind === "video" ? s.content : "NO SIGNAL"; }
    const v = ctx.view[deviceId];
    return v?.picture ?? v?.status ?? "";
  });
  const [w, h] = part.s;
  return <group position={part.p} quaternion={face(part.n)}>
    <mesh geometry={UNIT_BOX} material={mat(powered ? "#0f2a4a" : "#07090c", { rough: 0.2, glow: powered ? 0.55 : 0 })} position={[0, 0, 0.0004]} scale={[w, h, 0.0008]} />
    {feed && <SceneText position={[0, 0, 0.0012]} fontSize={Math.min(h * 0.16, w * 0.09)} maxWidth={w * 0.92} color="#e8f2ff" outlineWidth={0} anchorX="center" anchorY="middle" textAlign="center">{feed}</SceneText>}
  </group>;
}

function Tally({ part, deviceId }: { part: Extract<Part, { t: "tally" }>; deviceId: string }) {
  const on = useTrainingStore((state) => { const ctx = simContext(state); const pic = ctx?.view[deviceId]?.picture; return Boolean(pic && ctx?.view.sw?.picture === pic); });
  return <mesh geometry={UNIT_BOX} material={mat(on ? "#ff2a1f" : "#5a1612", { glow: on ? 1.4 : 0 })} position={part.p} scale={part.s} />;
}

function Prism({ part }: { part: Extract<Part, { t: "prism" }> }) {
  const geometry = useMemo(() => {
    const s = new Shape();
    part.profile.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
    s.closePath();
    const width = part.x[1] - part.x[0];
    const g = new ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
    g.rotateY(-Math.PI / 2); g.translate(part.x[1], 0, 0);
    return g;
  }, [part]);
  return <mesh geometry={geometry} material={mat(part.c, { rough: 0.6 })} castShadow receiveShadow />;
}

function Parts({ geo, deviceId, modelId, detail }: { geo: ModelGeometry; deviceId: string; modelId: string; detail: boolean }) {
  const { powered, cfg } = useDevice(deviceId, modelId);
  return <>{(geo.parts ?? []).map((part, i) => {
    switch (part.t) {
      case "box": return part.round
        ? <RoundedBox key={i} position={part.p} args={part.s} radius={Math.min(0.004, Math.min(...part.s) * 0.2)} smoothness={2} castShadow receiveShadow material={mat(part.c, { rough: 0.6 })} />
        : <mesh key={i} geometry={UNIT_BOX} material={mat(part.c, { rough: 0.6 })} position={part.p} scale={part.s} castShadow receiveShadow />;
      case "prism": return <Prism key={i} part={part} />;
      case "cyl": return <mesh key={i} geometry={UNIT_CYL} material={mat(part.c, { metal: 0.4, rough: 0.45 })} position={part.p} quaternion={face(part.n, Y)} scale={[part.r, part.h, part.r]} />;
      case "knob": return <group key={i} position={part.p} quaternion={face(part.n)}>
        <mesh geometry={UNIT_CYL} material={DARK} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, part.r * 0.6]} scale={[part.r, part.r * 1.2, part.r]} />
      </group>;
      case "key": {
        const color = powered ? part.lit?.find((l) => cfg(l.key) === l.eq)?.color : undefined;
        const [w, h] = part.s;
        return <group key={i} position={part.p} quaternion={face(part.n)}>
          <mesh geometry={UNIT_BOX} material={mat(color ?? part.c ?? "#2c3036", { rough: 0.5, glow: color ? 0.9 : 0 })} position={[0, 0, 0.0011]} scale={[w, h, 0.0022]} />
          {/* Pressable keys get a slightly larger invisible hit box; the visible key keeps its real size. */}
          {part.press && <PressTarget deviceId={deviceId} press={part.press} w={w} h={h} />}
          {detail && part.label && <SceneText position={[0, 0, 0.0023]} fontSize={Math.min(h * 0.42, w / Math.max(2.2, part.label.length * 0.62))} color={color || (part.c && part.c !== "#2c3036" && !part.c.startsWith("#1") && !part.c.startsWith("#2")) ? "#15171a" : "#eceef0"} outlineWidth={0} anchorX="center" anchorY="middle">{part.label}</SceneText>}
        </group>;
      }
      case "screen": return <Screen key={i} part={part} deviceId={deviceId} powered={powered} />;
      case "text": return !detail ? null : <group key={i} position={part.p} quaternion={face(part.n)}>
        <SceneText position={[0, 0, 0.0003]} fontSize={part.size} color={part.c ?? "#c9ced6"} outlineWidth={0} anchorX="center" anchorY="middle">{part.text}</SceneText>
      </group>;
      case "tally": return <Tally key={i} part={part} deviceId={deviceId} />;
    }
  })}</>;
}

/** Printed labels only render within this distance (m): a 6-camera stadium otherwise carries ~200 SDF text meshes. */
const LABEL_RANGE = 3;
const WORLD = new Vector3();
/** Drawn at its own origin (bottom centre of the real body), already scaled to display size. */
export function HardwareModel({ geo, deviceId, modelId }: { geo: ModelGeometry; deviceId: string; modelId: string }) {
  const model = MODELS[modelId];
  const ref = useRef<Group>(null);
  const [near, setNear] = useState(false);
  const tick = useRef(0);
  useFrame(({ camera }) => {
    if (!ref.current || ++tick.current % 15) return;   // ~4×/s is plenty for a label LOD
    const close = ref.current.getWorldPosition(WORLD).distanceTo(camera.position) < LABEL_RANGE + Math.max(...geo.size) * geo.displayScale;
    if (close !== near) setNear(close);
  });
  return <group ref={ref} scale={geo.displayScale}>
    <Parts geo={geo} deviceId={deviceId} modelId={modelId} detail={near} />
    {Object.entries(geo.ports).map(([k, p]) => <Socket key={k} kind={p.kind ?? kindOf(model?.ports.find((x) => x.key === k)?.connector)} at={p.at} n={p.normal} />)}
    {geo.inert.map((p) => p.kind && <Socket key={p.name} kind={p.kind} at={p.at} n={p.normal ?? [0, 0, -1]} />)}
  </group>;
}

function kindOf(connector?: string): SocketKind {
  switch (connector) {
    case "HDMI": return "hdmi"; case "ETHERNET": return "rj45"; case "USB-C": return "usbc"; case "XLR": return "xlr3f";
    case "6.35mm": return "trs"; case "3.5mm": return "jack35"; case "FIBER": return "smpte"; default: return "bnc";
  }
}

/** Fluid-head tripod for modelled cameras: head plate at TRIPOD_TOP, legs spread 0.45 m (same footprint as before). */
export const Tripod = memo(function Tripod({ top }: { top: number }) {
  const legs = [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 6, foot = new Vector3(Math.cos(a) * 0.45, 0.01, Math.sin(a) * 0.45), head = new Vector3(0, top - 0.06, 0);
    const mid = foot.clone().add(head).multiplyScalar(0.5), len = foot.distanceTo(head);
    const q = new Quaternion().setFromUnitVectors(Y, head.clone().sub(foot).normalize());
    return <mesh key={k} geometry={UNIT_CYL_LO} material={mat("#24272c", { metal: 0.6, rough: 0.4 })} position={mid} quaternion={q} scale={[0.016, len, 0.016]} castShadow />;
  });
  return <group>
    {legs}
    <mesh geometry={UNIT_CYL} material={mat("#1b1d22", { metal: 0.6, rough: 0.4 })} position={[0, top - 0.045, 0]} scale={[0.065, 0.09, 0.065]} />
    <mesh geometry={UNIT_BOX} material={mat("#2a2d32", { metal: 0.5 })} position={[0, top - 0.004, 0]} scale={[0.12, 0.008, 0.14]} />
    <mesh geometry={UNIT_CYL_LO} material={mat("#5b6068", { metal: 0.6 })} position={[0.07, top - 0.06, 0.25]} rotation={[Math.PI / 2.6, 0, 0]} scale={[0.011, 0.38, 0.011]} />
  </group>;
});

/** Open equipment rack (stadium encoder/recorder towers): four posts, top and base; the unit sits at its mount height. */
export const RackTower = memo(function RackTower({ size }: { size: V3 }) {
  const [w, h, d] = size;
  return <group>
    {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <mesh key={`${sx}${sz}`} geometry={UNIT_BOX} material={mat("#24272c", { metal: 0.6 })} position={[sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02)]} scale={[0.04, h, 0.04]} castShadow />))}
    <mesh geometry={UNIT_BOX} material={mat("#1c1f23")} position={[0, h - 0.015, 0]} scale={[w, 0.03, d]} />
    <mesh geometry={UNIT_BOX} material={mat("#1c1f23")} position={[0, 0.04, 0]} scale={[w, 0.08, d]} />
  </group>;
});
