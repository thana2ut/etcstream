"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { ExtrudeGeometry, Shape } from "three";
import { SceneText } from "@/components/game/scene-text";
import { useTrainingStore } from "@/game/stores/training-store";
import { MODEL_GEOMETRY } from "@/game/training/sim/model-geometry";
import { MODELS } from "@/game/training/sim/equipment";
import type { Press } from "@/game/training/sim/model-geometry";
import { HardwareSocket, PressTarget } from "./hardware-model";

/**
 * Blackmagic ATEM Mini Pro, procedural model from the official techspecs images
 * (assets/specs/bmd-atem-mini-pro/3D_MODELING_SPEC_TH.md). Built in metres at real size — 237.5 × 35 × 103.4 mm —
 * then drawn at the venue display scale. Origin = bottom centre, front edge +Z, rear connector panel −Z.
 * Sockets enabled in the simulation are the registry ports placed by MODEL_GEOMETRY; the POWER inlet is drawn but inert.
 */
const GEO = MODEL_GEOMETRY["bmd-atem-mini-pro"];
const [W, H, D] = GEO.size;
/** Front-edge height: estimated from the official side view (rear 35 mm, panel slopes toward the operator). */
const H_FRONT = 0.027;
const SLOPE = Math.atan2(H - H_FRONT, D);

// Top-view image (662 px wide = 237.5 mm; panel rear edge at 15 px, front edge at 285 px) → panel coordinates.
const TX = (px: number) => (px - 331) * 0.0003588;
const TZ = (py: number) => -D / 2 + ((py - 15) / 270) * D;
const BODY = "#1b1d21", KEY = "#2a2d33", KEY_TEXT = "#e9ecef", PRINT = "#c9ced6";

function useCfg(deviceId: string, key: string) {
  return useTrainingStore((state) => {
    const own = state.sim?.config[deviceId]?.[key];
    return own !== undefined ? own : MODELS["bmd-atem-mini-pro"].controls.find((c) => c.key === key)?.default;
  });
}

function Label({ text, x, z, size = 0.0026, color = PRINT }: { text: string; x: number; z: number; size?: number; color?: string }) {
  return <SceneText position={[x, 0.0006, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={size} color={color} outlineWidth={0} anchorX="center" anchorY="middle">{text}</SceneText>;
}

/** Rubber key: small 10.8 × 7.9 mm, large source/transition key 22 × 14 mm (measured on the top view). */
function Key({ px, py, text, big = false, lit, below, press, deviceId }: { px: number; py: number; text: string; big?: boolean; lit?: string; below?: string; press?: Press; deviceId?: string }) {
  const [w, d] = big ? [0.022, 0.0144] : [0.0108, 0.0079];
  const x = TX(px), z = TZ(py);
  return <group>
    <RoundedBox position={[x, 0.0012, z]} args={[w, 0.0024, d]} radius={0.0011} smoothness={2} castShadow>
      <meshStandardMaterial color={lit ?? (big ? "#e7e9ec" : KEY)} emissive={lit ?? "#000"} emissiveIntensity={lit ? 0.9 : 0} roughness={0.55} />
    </RoundedBox>
    <SceneText position={[x, 0.00245, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={big ? 0.0036 : 0.0019} color={big && !lit ? "#1d2024" : KEY_TEXT} outlineWidth={0} anchorX="center" anchorY="middle">{text}</SceneText>
    {below && <Label text={below} x={x} z={z + d / 2 + 0.0025} size={0.0018} />}
    {press && deviceId && <group position={[x, 0.0012, z]} rotation={[-Math.PI / 2, 0, 0]}><PressTarget deviceId={deviceId} press={press} w={w} h={d} /></group>}
  </group>;
}

/** Rear sockets (real outlines measured on the rear view: HDMI 15 × 6.5 mm, RJ45 13.6 × 12 mm, USB-C 9 × 3.5 mm). */
function Socket({ at, kind }: { at: [number, number, number]; kind: "hdmi" | "rj45" | "usbc" | "jack" | "dc" }) {
  return <HardwareSocket at={at} n={[0, 0, -1]} kind={kind === "jack" ? "jack35" : kind} />;
}

function RearLabel({ text, x, y }: { text: string; x: number; y: number }) {
  return <SceneText position={[x, y, -D / 2 - 0.0002]} rotation={[0, Math.PI, 0]} fontSize={0.0021} color={PRINT} outlineWidth={0} anchorX="center" anchorY="middle">{text}</SceneText>;
}

function Body() {
  // Side profile (Y–Z) extruded across the width: rear 35 mm, front edge 27 mm, small top chamfer at the front.
  const geometry = useMemo(() => {
    const s = new Shape();
    s.moveTo(-D / 2, 0); s.lineTo(D / 2, 0); s.lineTo(D / 2, H_FRONT - 0.004); s.lineTo(D / 2 - 0.004, H_FRONT); s.lineTo(-D / 2, H); s.closePath();
    const g = new ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelSegments: 2 });
    g.translate(0, 0, -W / 2); g.rotateY(-Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={BODY} roughness={0.62} metalness={0.15} /></mesh>;
}

export function AtemMiniProModel({ deviceId }: { deviceId: string }) {
  const on = useCfg(deviceId, "power") === true;
  const pgm = String(useCfg(deviceId, "pgm") ?? "");
  const out = String(useCfg(deviceId, "hdmi-out") ?? "MULTIVIEW");
  const mic1 = useCfg(deviceId, "mic1-on") === true;
  const rec = useCfg(deviceId, "record") === true;
  const red = on ? "#ff2a1f" : undefined, green = on ? "#35d36a" : undefined;
  const src = (n: number) => on && pgm === `HDMI ${n}` ? "#ff2a1f" : undefined;
  const p = GEO.ports;
  return <group scale={GEO.displayScale}>
    <Body />
    {/* rubber feet */}
    {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.012), -0.0008, sz * (D / 2 - 0.01)]}><cylinderGeometry args={[0.005, 0.005, 0.0016, 12]} /><meshStandardMaterial color="#0b0c0e" roughness={0.9} /></mesh>))}
    {/* top control panel, tilted with the body slope; buttons and print from the official top view */}
    <group position={[0, (H + H_FRONT) / 2 + 0.0002, 0]} rotation={[SLOPE, 0, 0]}>
      <Label text="ATEM Mini Pro" x={TX(80)} z={TZ(33)} size={0.0042} color="#f2f3f5" />
      <Label text="Blackmagicdesign" x={TX(568)} z={TZ(33)} size={0.0032} color="#f2f3f5" />
      {/* MIC 1 / MIC 2 */}
      {[[50, 88, "MIC 1"], [128, 163, "MIC 2"]].map(([a, b, name], i) => <group key={String(name)}>
        <Key px={a as number} py={65} text="ON" lit={i === 0 && mic1 ? red : undefined} deviceId={deviceId} press={i === 0 ? { key: "mic1-on", value: true, label: "MIC 1 ON" } : undefined} />
        <Key px={b as number} py={65} text="OFF" lit={i === 0 && !mic1 && on ? red : undefined} deviceId={deviceId} press={i === 0 ? { key: "mic1-on", value: false, label: "MIC 1 OFF" } : undefined} />
        <Key px={a as number} py={90} text="▲" /><Key px={b as number} py={90} text="▼" />
        <Label text={String(name)} x={TX(((a as number) + (b as number)) / 2)} z={TZ(103)} size={0.0019} />
      </group>)}
      {/* HDMI input audio rows: AFV/RESET, ON/OFF, ▲/▼ for inputs 1–4 */}
      {[[50, 88], [128, 163], [205, 240], [283, 318]].map(([a, b]) => <group key={a}>
        <Key px={a} py={127} text="AFV" /><Key px={b} py={127} text="RESET" />
        <Key px={a} py={153} text="ON" /><Key px={b} py={153} text="OFF" />
        <Key px={a} py={179} text="▲" /><Key px={b} py={179} text="▼" />
      </group>)}
      {/* source buttons 1–4, STILL, BLACK */}
      {[69, 146, 223, 300].map((px, i) => <Key key={px} px={px} py={226} text={String(i + 1)} big lit={src(i + 1)} deviceId={deviceId} press={{ key: "pgm", value: `HDMI ${i + 1}`, label: `แหล่งภาพ ${i + 1} ขึ้นออกอากาศ` }} />)}
      <Key px={355} py={213} text="STILL" /><Key px={355} py={238} text="BLACK" lit={on && pgm === "Black" ? "#ff2a1f" : undefined} deviceId={deviceId} press={{ key: "pgm", value: "Black", label: "BLACK · ภาพดำ" }} />
      {/* PICTURE IN PICTURE */}
      <Key px={381} py={63} text="◩" /><Key px={420} py={63} text="◪" /><Key px={458} py={63} text="ON" />
      <Key px={381} py={89} text="◩" /><Key px={420} py={89} text="◪" /><Key px={458} py={89} text="OFF" />
      <Label text="PICTURE IN PICTURE" x={TX(420)} z={TZ(103)} size={0.0019} />
      {/* KEY, RECORD, STREAM */}
      <Key px={533} py={65} text="ON" /><Key px={533} py={90} text="OFF" below="KEY" />
      <Key px={575} py={65} text="REC" lit={on && rec ? "#ff2a1f" : undefined} deviceId={deviceId} press={{ key: "record", value: true, label: "REC · บันทึกลงดิสก์ USB" }} />
      <Key px={575} py={90} text="STOP" below="RECORD" deviceId={deviceId} press={{ key: "record", value: false, label: "STOP · หยุดบันทึก" }} />
      <Key px={612} py={65} text="ON AIR" /><Key px={612} py={90} text="OFF" below="STREAM" />
      <Label text="● DISK" x={TX(575)} z={TZ(45)} size={0.0017} />
      {/* DURATION, EFFECT, VIDEO OUT */}
      <Key px={420} py={153} text="0.5" /><Key px={457} py={153} text="1.0" /><Key px={420} py={178} text="1.5" /><Key px={457} py={178} text="2.0" />
      <Label text="DURATION" x={TX(438)} z={TZ(193)} size={0.0019} />
      <Key px={497} py={127} text="▮" /><Key px={533} py={127} text="▬" /><Key px={497} py={153} text="➔▮" /><Key px={533} py={153} text="▮➔" />
      <Key px={497} py={178} text="MIX" /><Key px={533} py={178} text="DIP" />
      <Label text="EFFECT" x={TX(515)} z={TZ(193)} size={0.0019} />
      <Key px={575} py={127} text="1" /><Key px={612} py={127} text="2" /><Key px={575} py={153} text="3" /><Key px={612} py={153} text="4" />
      <Key px={575} py={178} text="M/V" lit={on && out === "MULTIVIEW" ? green : undefined} deviceId={deviceId} press={{ key: "hdmi-out", value: "MULTIVIEW", label: "VIDEO OUT · M/V" }} />
      <Key px={612} py={178} text="PGM" lit={on && out === "PROGRAM" ? green : undefined} deviceId={deviceId} press={{ key: "hdmi-out", value: "PROGRAM", label: "VIDEO OUT · PGM" }} />
      <Label text="VIDEO OUT" x={TX(594)} z={TZ(193)} size={0.0019} />
      {/* CUT, AUTO, FTB */}
      <Key px={438} py={226} text="CUT" big /><Key px={516} py={226} text="AUTO" big /><Key px={593} py={226} text="FTB" big />
    </group>
    {/* rear connector panel: registry sockets + the inert POWER inlet */}
    <Socket at={p["eth"].at} kind="rj45" /><Socket at={p["usb"].at} kind="usbc" /><Socket at={p["hdmi-out"].at} kind="hdmi" />
    {[1, 2, 3, 4].map((n) => <Socket key={n} at={p[`hdmi-in-${n}`].at} kind="hdmi" />)}
    <Socket at={p["mic-1"].at} kind="jack" /><Socket at={p["mic-2"].at} kind="jack" />
    {GEO.inert.map((i) => <Socket key={i.name} at={i.at} kind="dc" />)}
    {([["POWER", GEO.inert[0].at[0]], ["ATEM CONTROL", p["eth"].at[0]], ["USB OUT", p["usb"].at[0]], ["HDMI OUT", p["hdmi-out"].at[0]],
      ["4", p["hdmi-in-4"].at[0]], ["3", p["hdmi-in-3"].at[0]], ["2", p["hdmi-in-2"].at[0]], ["1", p["hdmi-in-1"].at[0]], ["MIC 2", p["mic-2"].at[0]], ["MIC 1", p["mic-1"].at[0]]] as [string, number][])
      .map(([t, x]) => <RearLabel key={t} text={t} x={x} y={0.0265} />)}
  </group>;
}
