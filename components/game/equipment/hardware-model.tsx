"use client";

import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { BoxGeometry, CatmullRomCurve3, CylinderGeometry, DataTexture, ExtrudeGeometry, LatheGeometry, LinearMipmapLinearFilter, MeshBasicMaterial, MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping, Shape, TubeGeometry, Vector2, Vector3, type InstancedMesh } from "three";
import { SceneText } from "@/components/game/scene-text";
import { useTrainingStore } from "@/game/stores/training-store";
import { simContext } from "@/game/training/hdmi-training";
import { MODELS } from "@/game/training/sim/equipment";
import type { ModelGeometry, Part, Press, SocketKind, V3 } from "@/game/training/sim/model-geometry";
import { socketSurfaces } from "@/game/rendering/socket-geometry";
import { CONTROL_KNOB, photoLoftGeometry, roundedHardwareBox } from "@/game/rendering/hardware-detail-geometry";

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
const DARK = mat("#14161a", { rough: 0.7 });
// Authored micro-weave, not a photograph: the grille stays readable without hundreds of wire meshes.
const weave = new Uint8Array(32 * 32 * 4);
for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
  const wire = (x + y) % 16 < 3 || (x - y + 32) % 16 < 3, i = (y * 32 + x) * 4;
  weave[i] = weave[i + 1] = weave[i + 2] = wire ? 190 : 35; weave[i + 3] = 255;
}
const WEAVE = new DataTexture(weave, 32, 32);
WEAVE.wrapS = WEAVE.wrapT = RepeatWrapping; WEAVE.repeat.set(12, 6); WEAVE.generateMipmaps = true; WEAVE.minFilter = LinearMipmapLinearFilter; WEAVE.needsUpdate = true;
const GRILLE = new MeshStandardMaterial({ color: "#b7bbc1", metalness: 0.65, roughness: 0.62, map: WEAVE, bumpMap: WEAVE, bumpScale: 0.00018 });
function partMaterial(part: Part & { c: string }) {
  return part.finish === "grille" ? GRILLE : mat(part.c, part.finish === "metal" ? { metal: 0.45, rough: 0.52 }
    : part.finish === "rubber" ? { metal: 0, rough: 0.9 } : { metal: 0.15, rough: 0.6 });
}

/** Shared, cached connector meshes; local image references drive their silhouette and visible contacts. */
export const HardwareSocket = memo(function HardwareSocket({ kind, at, n }: { kind: SocketKind; at: V3; n: V3 }) {
  return <group position={at} quaternion={face(n)} dispose={null}>
    {socketSurfaces(kind).map(({ color, geometry }) => <mesh key={color} geometry={geometry} material={mat(color, { metal: color === "#adb3bb" || color === "#b99b4f" ? 0.8 : 0.1, rough: 0.4 })} />)}
  </group>;
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

const SHAPES = new WeakMap<Part, LatheGeometry | TubeGeometry>();
function ShapedPart({ part }: { part: Extract<Part, { t: "lathe" | "tube" }> }) {
  let geometry = SHAPES.get(part);
  if (!geometry) {
    geometry = part.t === "lathe" ? new LatheGeometry(part.profile.map(([r, y]) => new Vector2(r, y)), 32)
      : new TubeGeometry(new CatmullRomCurve3(part.points.map((p) => new Vector3(...p))), 24, part.r, 6, false);
    SHAPES.set(part, geometry);
  }
  return <mesh geometry={geometry} material={partMaterial(part)} position={part.t === "lathe" ? part.p : undefined}
    quaternion={part.t === "lathe" ? face(part.n, Y) : undefined} castShadow receiveShadow dispose={null} />;
}

const FacePattern = memo(function FacePattern({ part }: { part: Extract<Part, { t: "pattern" }> }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const obj = new Object3D(); obj.rotation.x = Math.PI / 2; obj.scale.set(part.r, 0.0003, part.r);
    part.points.forEach(([x, y], i) => { obj.position.set(x, y, 0); obj.updateMatrix(); mesh.setMatrixAt(i, obj.matrix); });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
  }, [part]);
  return <group position={part.p} quaternion={face(part.n)}><instancedMesh ref={ref} args={[UNIT_CYL_LO, partMaterial(part), part.points.length]} dispose={null} /></group>;
});

function Parts({ geo, deviceId, modelId, detail }: { geo: ModelGeometry; deviceId: string; modelId: string; detail: boolean }) {
  const { powered, cfg } = useDevice(deviceId, modelId);
  return <>{(geo.parts ?? []).map((part, i) => {
    switch (part.t) {
      case "box": return part.round
        ? <mesh key={i} position={part.p} geometry={roundedHardwareBox(part.s)} castShadow receiveShadow material={partMaterial(part)} dispose={null} />
        : <mesh key={i} geometry={UNIT_BOX} material={partMaterial(part)} position={part.p} scale={part.s} castShadow receiveShadow />;
      case "prism": return <Prism key={i} part={part} />;
      case "loft": return <mesh key={i} geometry={photoLoftGeometry(part)} material={partMaterial(part)} castShadow receiveShadow dispose={null} />;
      case "cyl": return <mesh key={i} geometry={UNIT_CYL} material={partMaterial(part)} position={part.p} quaternion={face(part.n, Y)} scale={[part.r, part.h, part.r]} />;
      case "lathe": case "tube": return <ShapedPart key={i} part={part} />;
      case "pattern": return detail ? <FacePattern key={i} part={part} /> : null;
      case "knob": return <group key={i} position={part.p} quaternion={face(part.n)}>
        <mesh geometry={CONTROL_KNOB} material={DARK} scale={[part.r, part.r, part.r]} dispose={null} />
      </group>;
      case "key": {
        const color = powered ? part.lit?.find((l) => cfg(l.key) === l.eq)?.color : undefined;
        const [w, h] = part.s;
        return <group key={i} position={part.p} quaternion={face(part.n)}>
          <mesh geometry={roundedHardwareBox([w,h,0.0022],Math.min(0.0007,w*0.1,h*0.1))} material={mat(color ?? part.c ?? "#2c3036", { rough: 0.5, glow: color ? 0.9 : 0 })} position={[0, 0, 0.0011]} dispose={null} />
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
    {Object.entries(geo.ports).map(([k, p]) => <HardwareSocket key={k} kind={p.kind ?? kindOf(model?.ports.find((x) => x.key === k)?.connector)} at={p.at} n={p.normal} />)}
    {geo.inert.map((p) => p.kind && <HardwareSocket key={p.name} kind={p.kind} at={p.at} n={p.normal ?? [0, 0, -1]} />)}
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
  const segment = (a: Vector3, b: Vector3, r: number, color: string, key: string) => <mesh key={key} geometry={UNIT_CYL_LO} material={mat(color, { metal: 0.55, rough: 0.45 })}
    position={a.clone().add(b).multiplyScalar(0.5)} quaternion={new Quaternion().setFromUnitVectors(Y, b.clone().sub(a).normalize())} scale={[r, a.distanceTo(b), r]} castShadow />;
  const legs = [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 6, foot = new Vector3(Math.cos(a) * 0.45, 0.01, Math.sin(a) * 0.45), head = new Vector3(0, top - 0.06, 0);
    const joint = foot.clone().lerp(head, 0.48), spread = foot.clone().multiplyScalar(0.65); spread.y = top * 0.33;
    return <group key={k}>
      {segment(joint, head, 0.016, "#24272c", "outer")}{segment(foot, joint, 0.011, "#4b5057", "inner")}
      {segment(new Vector3(0, spread.y, 0), spread, 0.007, "#25292e", "spreader")}
      <mesh geometry={UNIT_BOX} material={mat("#15171a", { rough: 0.85 })} position={joint} scale={[0.044, 0.04, 0.04]} />
      <mesh geometry={UNIT_CYL_LO} material={mat("#111316", { rough: 0.95 })} position={foot} scale={[0.026, 0.02, 0.026]} />
    </group>;
  });
  return <group>
    {legs}
    <mesh geometry={UNIT_CYL} material={mat("#1b1d22", { metal: 0.6, rough: 0.4 })} position={[0, top - 0.045, 0]} scale={[0.065, 0.09, 0.065]} />
    <mesh geometry={UNIT_BOX} material={mat("#2a2d32", { metal: 0.5 })} position={[0, top - 0.004, 0]} scale={[0.12, 0.008, 0.14]} />
    <mesh geometry={UNIT_BOX} material={mat("#111416", { rough: 0.9 })} position={[0, top - 0.0005, 0]} scale={[0.10, 0.001, 0.12]} />
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
