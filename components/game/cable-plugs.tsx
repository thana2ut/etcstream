"use client";

import type { PlugStyle } from "@/game/training/scenarios";
import { roundedHardwareBox } from "@/game/rendering/hardware-detail-geometry";
import { ExtrudeGeometry, Shape } from "three";

/**
 * Phase 05 connector heads, authored in REAL millimetres from the connector-shape library
 * (C:\Users\asus\Downloads\อุปกรณ์\02_CABLES_AND_CONNECTORS\_CONNECTOR_SHAPES + each cable's MODELING_REFERENCE_PACK.md)
 * and the published mating dimensions of each standard (HDMI Type A 13.9 × 4.45 mm shell, BNC 75 Ω bayonet, XLR-3
 * IEC 61076-2-103, IEC 60603 phone plugs 3.5 / 6.35 mm, USB-A 12 × 4.5 mm, USB-B 8 × 7.3 mm, USB-C 8.25 × 2.4 mm,
 * RJ45 11.7 mm, RCA 3.2 mm pin / 8 mm shell, SMPTE 304/311 hybrid fiber (LEMO 3K.93C class, Ø ≈ 26 mm).
 * Overmold / boot sizes are typical moulded-lead values, not a specific vendor SKU.
 *
 * Unit space: the tip points to −Z, the cable leaves from +Z. `MM` converts millimetres into this unit space; the
 * parent group (hdmi-cables.tsx `plugFit`, ×0.32 when plugged) then makes the rendered head ≈ 1.8 × real size, the same
 * order as the venue devices' `displayScale` (1.3–2.5) so a plug and its socket stay in proportion. This display factor
 * is kept separate from the real dimensions below.
 *
 * Deliberately NOT specific: `optical` (FIB-SDI-LINK — LC vs SC, mode and polarity are unresolved, so it is a neutral
 * labelled-generic boot with no LC latch or SC square body) and `multicore` (the reference shows a stage-box panel only,
 * no snake connector). `logical` is not a connector at all: CTRL-REPLAY is a logical control link, drawn as an endpoint
 * marker ring so it can still be picked up without pretending to be a physical plug.
 */
export const MM = 0.0056;
const m = (v: number) => v * MM;
const GOLD = "#d4a53c", NICKEL = "#c9ccd1", CHROME = "#dfe2e6", BLACK = "#15161a", DARK = "#050506", GREY = "#5d636b";

function Mat({ color, metal = 0.2, rough = 0.5, opacity }: { color: string; metal?: number; rough?: number; opacity?: number }) {
  return <meshStandardMaterial color={color} metalness={metal} roughness={rough} transparent={opacity !== undefined} opacity={opacity ?? 1} />;
}
/** Cylinder along Z, dimensions in mm: z = centre, d = diameter, len = length, d2 = diameter at the +Z end. */
function Rod({ z, d, len, color, metal = 0.2, d2, seg = 18 }: { z: number; d: number; len: number; color: string; metal?: number; d2?: number; seg?: number }) {
  return <mesh position={[0, 0, m(z)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
    <cylinderGeometry args={[m((d2 ?? d) / 2), m(d / 2), m(len), seg]} /><Mat color={color} metal={metal} rough={metal > 0.5 ? 0.25 : 0.55} />
  </mesh>;
}
/** Box in mm: centre p, size s. */
function Blk({ p, s, color, metal = 0.2 }: { p: [number, number, number]; s: [number, number, number]; color: string; metal?: number }) {
  return <mesh position={[m(p[0]), m(p[1]), m(p[2])]} castShadow><boxGeometry args={[m(s[0]), m(s[1]), m(s[2])]} /><Mat color={color} metal={metal} rough={metal > 0.5 ? 0.25 : 0.55} /></mesh>;
}
/** IEC 60603 phone-plug shaft (mm): diameter d, exposed length len from z0 toward −Z, `rings` black insulators. */
function Shaft({ d, len, rings, z0 }: { d: number; len: number; rings: number; z0: number }) {
  const seg = len / (rings + 1);
  return <>
    <Rod z={z0 - len / 2} d={d} len={len} color={NICKEL} metal={0.9} />
    {Array.from({ length: rings }, (_, i) => <Rod key={i} z={z0 - seg * (i + 1)} d={d * 1.02} len={Math.max(0.6, seg * 0.14)} color={DARK} />)}
    <mesh position={[0, 0, m(z0 - len - d * 0.2)]}><sphereGeometry args={[m(d / 2), 12, 8]} /><Mat color={NICKEL} metal={0.9} /></mesh>
  </>;
}
/** Moulded overmold with a tapered strain relief (mm, rectangular). */
function Overmold({ w, h, len, relief = 14, color = BLACK }: { w: number; h: number; len: number; relief?: number; color?: string }) {
  const diameter=Math.min(w,h);
  return <>
    <mesh position={[0,0,m(len/2)]} geometry={roundedHardwareBox([m(w),m(h),m(len)],m(Math.min(1.2,h*.15)))} dispose={null} castShadow><Mat color={color} /></mesh>
    <Rod z={len + relief / 2} d={diameter * 0.55} d2={diameter * 0.4} len={relief} color={color} />
    {[.18,.4,.62].map((t,i)=><Rod key={i} z={len+relief*t} d={diameter*(.58-t*.12)} len={1.2} color={color} />)}
  </>;
}
/** XLR-3 insert pin positions (mm) on the IEC 61076-2-103 circle. */
const XLR_PINS: [number, number][] = [[-4.5, 2.6], [4.5, 2.6], [0, -5.1]];
const SHELLS = new Map<string, ExtrudeGeometry>();
function Shell({ kind, inset = false }: { kind: "hdmi" | "usbc"; inset?: boolean }) {
  const key = `${kind}:${inset}`;
  let geometry = SHELLS.get(key);
  if (!geometry) {
    const s = new Shape(), f = inset ? 0.77 : 1;
    if (kind === "hdmi") {
      const pts = [[-6.95, 2.225], [6.95, 2.225], [6.95, -0.6], [5.3, -2.225], [-5.3, -2.225], [-6.95, -0.6]];
      pts.forEach(([x, y], i) => i ? s.lineTo(m(x * f), m(y * f)) : s.moveTo(m(x * f), m(y * f))); s.closePath();
    } else {
      const r = m(1.2 * f), a = m(2.925 * f);
      s.moveTo(-a, -r); s.lineTo(a, -r); s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-a, r); s.absarc(-a, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    }
    const len = kind === "hdmi" ? 11 : 6.6;
    geometry = new ExtrudeGeometry(s, { depth: m(inset ? 0.2 : len), bevelEnabled: false, curveSegments: 8 });
    geometry.translate(0, 0, m(-len - (inset ? 0.2 : 0))); SHELLS.set(key, geometry);
  }
  return <mesh geometry={geometry} dispose={null}><Mat color={inset ? DARK : NICKEL} metal={inset ? 0 : 0.9} /></mesh>;
}

export function PlugMesh({ style, accent }: { style: PlugStyle; accent?: string }) {
  switch (style) {
    case "hdmi":   // Type A: 13.9 × 4.45 mm metal shell, 11 mm insertion depth
      return <><Overmold w={21} h={10} len={32} />
        <Shell kind="hdmi" /><Shell kind="hdmi" inset />
        {Array.from({ length: 10 }, (_, i) => <Blk key={i} p={[-4.9 + i * 1.08, 0.5, -11.25]} s={[0.45, 0.5, 0.2]} color={GOLD} metal={0.8} />)}</>;
    case "dp":     // DisplayPort: 16.1 × 4.8 mm with one chamfered corner and latch button
      return <><Overmold w={22} h={10} len={32} />
        <Blk p={[0, 0, -5]} s={[16.1, 4.8, 10]} color={NICKEL} metal={0.9} /><Blk p={[6.5, 1.6, -5.1]} s={[3, 1.6, 10.2]} color={BLACK} />
        <Blk p={[0, 5.6, 16]} s={[8, 1.6, 10]} color="#2a2b30" /></>;
    case "sdi":    // BNC 75 Ω male: Ø 14.3 mm bayonet coupling sleeve with two locking slots, Ø 8 mm boot
      return <><Rod z={22} d={9} d2={6.5} len={28} color={BLACK} /><Rod z={4} d={11.5} len={8} color={NICKEL} metal={0.9} />
        <Rod z={-6} d={14.3} len={12} color={NICKEL} metal={0.9} seg={24} />
        {[-1, 1].map((s) => <Blk key={s} p={[s * 7.1, 0, -9]} s={[0.45, 2.2, 4]} color={DARK} />)}
        <Rod z={-12.4} d={8.6} len={0.6} color={DARK} /><Rod z={-11} d={1.3} len={4} color={GOLD} metal={0.9} /></>;
    case "xlr-m":  // Ø 19.6 mm shell, three Ø 1.6 mm pins, 55 mm body
      return <><Rod z={18} d={20.5} d2={17} len={40} color={BLACK} /><Rod z={52} d={9} d2={7} len={30} color={BLACK} />
        <Rod z={-6} d={19.6} len={12} color={NICKEL} metal={0.9} /><Rod z={-11.9} d={17} len={0.4} color={DARK} />
        {XLR_PINS.map(([x, y], i) => <mesh key={i} position={[m(x), m(y), m(-15)]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[m(0.8), m(0.8), m(7), 8]} /><Mat color={GOLD} metal={0.9} /></mesh>)}</>;
    case "xlr-f":  // socket insert with three pin holes and the push-latch tab
      return <><Rod z={18} d={20.5} d2={17} len={40} color={BLACK} /><Rod z={52} d={9} d2={7} len={30} color={BLACK} />
        <Rod z={-7} d={19} len={14} color={BLACK} /><Rod z={-14.1} d={16} len={0.4} color="#25272b" />
        {XLR_PINS.map(([x, y], i) => <mesh key={i} position={[m(x), m(y), m(-14.3)]}><sphereGeometry args={[m(1.1), 8, 6]} /><Mat color={DARK} /></mesh>)}
        <Blk p={[0, 10.6, 2]} s={[4, 2, 10]} color={NICKEL} metal={0.9} /></>;
    case "trs35": return <><Rod z={12} d={7.5} d2={5.5} len={22} color={BLACK} /><Rod z={30} d={4} d2={3} len={14} color={BLACK} /><Shaft d={3.5} len={14} rings={2} z0={0} /></>;
    case "locking35": return <><PlugMesh style="trs35" /><Rod z={2.5} d={8.5} len={7} color={GOLD} metal={0.85} seg={24} />
      {Array.from({ length: 8 }, (_, i) => <group key={i} rotation={[0, 0, i * Math.PI / 4]}><Blk p={[4.3, 0, 2.5]} s={[0.5, 0.8, 6]} color={NICKEL} metal={0.8} /></group>)}</>;
    case "trrs35": return <><Rod z={12} d={7.5} d2={5.5} len={22} color={BLACK} /><Rod z={30} d={4} d2={3} len={14} color={BLACK} /><Shaft d={3.5} len={14} rings={3} z0={0} /></>;
    case "ts635": return <><Rod z={17} d={13} d2={10} len={34} color={BLACK} /><Rod z={40} d={6.5} d2={5} len={14} color={BLACK} /><Shaft d={6.35} len={30} rings={1} z0={0} /></>;
    case "trs635": return <><Rod z={17} d={13} d2={10} len={34} color={BLACK} /><Rod z={40} d={6.5} d2={5} len={14} color={BLACK} /><Shaft d={6.35} len={30} rings={2} z0={0} /></>;
    case "speaker635": return <><Rod z={17} d={13} d2={10} len={34} color={BLACK} /><Rod z={1} d={13.4} len={2} color="#2f6fd6" /><Shaft d={6.35} len={30} rings={1} z0={0} /></>;
    case "speakon": // NL4FC-class twist-lock: Ø 24 mm locking ring, 60 mm body (distractor lead only)
      return <><Rod z={22} d={22} d2={18} len={40} color={BLACK} /><Rod z={-3} d={24} len={10} color="#3a3d43" seg={12} />
        <Rod z={-10} d={17} len={4} color={BLACK} /><Blk p={[0, 13, -2]} s={[4, 2.4, 8]} color={NICKEL} metal={0.9} /></>;
    case "rca": return <><Rod z={13} d={9} d2={7} len={26} color={BLACK} /><Rod z={-1} d={9.5} len={4} color={accent ?? "#c21d1d"} />
      <Rod z={-7} d={8} len={8} color={NICKEL} metal={0.9} /><Rod z={-9} d={3.2} len={12} color={NICKEL} metal={0.9} /></>;
    case "rca-pair": return <><PlugMesh style="rca" accent="#eeeeee" /><group position={[m(15), m(5), m(8)]}><PlugMesh style="rca" accent="#c52b2b" /></group>
      <Rod z={42} d={3.3} len={28} color={BLACK} /><group position={[m(15), m(5), 0]}><Rod z={46} d={3.3} len={20} color={BLACK} /></group></>;
    case "usba":
    case "usba3":  // Type A: 12 × 4.5 mm shell, 12 mm insertion; USB 3.x has the blue insulator
      return <><Overmold w={16} h={8} len={26} />
        <Blk p={[0, 0, -6]} s={[12, 4.5, 12]} color={NICKEL} metal={0.9} /><Blk p={[0, -0.8, -6.1]} s={[10.5, 1.8, 12.2]} color={style === "usba3" ? "#1f5fd1" : "#eeeeee"} /></>;
    case "usbb":   // Type B: 8 × 7.3 mm shell with chamfered top corners
      return <><Overmold w={13} h={12} len={24} />
        <Blk p={[0, -0.6, -5]} s={[8, 6.1, 10]} color={NICKEL} metal={0.9} /><Blk p={[0, 3, -5]} s={[5.8, 1.6, 10]} color={NICKEL} metal={0.9} />
        <Blk p={[0, 0, -5.1]} s={[5, 3.6, 10.2]} color="#eeeeee" /></>;
    case "usbc":   // Type C: 8.25 × 2.4 mm stadium shell
      return <><mesh position={[0, 0, m(12)]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]} castShadow><capsuleGeometry args={[m(6), m(14), 4, 12]} /><Mat color={BLACK} /></mesh>
        <Rod z={30} d={3.6} d2={3} len={12} color={BLACK} />
        <Shell kind="usbc" /><Shell kind="usbc" inset /><Blk p={[0, 0, -6.85]} s={[5.9, 0.45, 0.2]} color={GREY} /></>;
    case "ethernet": // RJ45 8P8C: 11.7 mm wide clear plug, latch tab, 14 mm boot
      return <><Overmold w={14} h={12} len={14} color="#456886" />
        <mesh position={[0, 0, m(-10)]}><boxGeometry args={[m(11.7), m(8), m(20)]} /><Mat color="#d4dce1" rough={0.15} opacity={0.75} /></mesh>
        {Array.from({ length: 8 }, (_, i) => <Blk key={i} p={[-4.55 + i * 1.3, -3.6, -17]} s={[0.6, 0.4, 3]} color={GOLD} metal={0.9} />)}
        <Blk p={[0, 5.2, -8]} s={[6, 1.4, 14]} color="#c9d2d8" /></>;
    case "iec": return <><Overmold w={26} h={20} len={40} /><Blk p={[0, 0, -6]} s={[24, 16, 12]} color="#202124" />
      {[[-5, -2], [5, -2], [0, 4]].map(([x, y], i) => <Blk key={i} p={[x, y, -12.2]} s={[3.2, 2, 0.6]} color={DARK} />)}</>;
    case "dc": return <><Rod z={12} d={8} d2={6} len={22} color={BLACK} /><Rod z={-5} d={5.5} len={10} color={NICKEL} metal={0.9} /><Rod z={-10.1} d={2.1} len={0.4} color={DARK} /></>;
    case "smpte":  // SMPTE 304/311 hybrid fiber (FIB-CAMERA-CCU): chrome Ø 26 mm, knurled coupling, red alignment band
      return <><Rod z={40} d={22} d2={16} len={40} color={BLACK} /><Rod z={8} d={24} len={24} color={CHROME} metal={0.9} seg={24} />
        {[0, 1, 2, 3].map((i) => <Rod key={i} z={-8 - i * 3} d={26.5} len={1.6} color={CHROME} metal={0.9} seg={24} />)}
        <Rod z={-14} d={25.5} len={14} color={CHROME} metal={0.9} seg={24} /><Rod z={-23} d={25.6} len={2} color="#d0202a" />
        <Rod z={-30} d={22} len={12} color={CHROME} metal={0.9} seg={24} /><Rod z={-36.2} d={18} len={0.4} color={DARK} />
        {[[-4, 3], [4, 3], [-4, -3.5], [4, -3.5], [-7, 0], [7, 0]].map(([x, y], i) => <mesh key={i} position={[m(x), m(y), m(-36.5)]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[m(i < 2 ? 1.6 : 0.9), m(i < 2 ? 1.6 : 0.9), m(0.6), 10]} /><Mat color={i < 2 ? "#ece7d5" : GOLD} metal={i < 2 ? 0.1 : 0.9} /></mesh>)}</>;
    case "lc-duplex": // GAME Optical Fiber 12G module only; the generic owner-library optical end stays unresolved.
      return <>{[-3.5,3.5].map(x=><group key={x} position={[m(x),0,0]}>
        <Rod z={19} d={4.8} d2={2.3} len={26} color="#e4c52d" />
        {[0,1,2,3].map(i=><Rod key={i} z={7+i*2} d={5.1-i*.3} len={.8} color="#d6b92d" />)}
        <Blk p={[0,0,-1]} s={[5.7,6.1,17]} color="#527fa8" />
        <Blk p={[0,3.6,-1]} s={[4.2,1.1,13]} color="#c1cbd0" />
        <Rod z={-10.5} d={1.25} len={4} color="#ecece4" seg={16} />
      </group>)}<Blk p={[0,0,4]} s={[14,2,3]} color="#a6b9c8" /></>;
    case "fiber":
    case "optical": // FIB-SDI-LINK: GENERIC optical termination — family (LC/SC), mode and polarity unresolved
      return <><Rod z={20} d={6} d2={4} len={26} color="#e8c21a" /><Blk p={[0, 0, -2]} s={[10, 10, 18]} color={GREY} />
        <Blk p={[0, 0, -2]} s={[10.4, 3, 6]} color="#e8c21a" /><Rod z={-13} d={5} len={4} color="#8b9199" /></>;
    case "multicore": // Analog multicore tail — GENERIC: no snake connector evidence, drawn as a neutral circular multipin shell
      return <><Rod z={30} d={18} d2={14} len={40} color={BLACK} /><Rod z={-2} d={36} len={28} color="#4c5968" metal={0.5} seg={20} />
        <Rod z={-16.2} d={30} len={0.4} color={DARK} /></>;
    case "control":
    case "logical": // CTRL-REPLAY: logical control link endpoint — NOT a physical connector
      return <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[m(12), m(1.6), 8, 24]} /><meshBasicMaterial color="#b98cff" transparent opacity={0.85} /></mesh>;
    case "lav":
      return <>
        {/* Foam windscreen, capsule barrel, strain relief and spring clip stay on one captive lead. */}
        <mesh position={[0, 0.04, 0]} scale={[1, 1.13, 1]} castShadow><sphereGeometry args={[0.029, 16, 12]} /><Mat color="#18191b" rough={0.98} /></mesh>
        <mesh position={[0, -0.006, 0]} castShadow><cylinderGeometry args={[0.016, 0.018, 0.055, 12]} /><Mat color="#292a2c" metal={0.25} rough={0.42} /></mesh>
        <mesh position={[0, -0.038, 0]} castShadow><cylinderGeometry args={[0.011, 0.013, 0.024, 12]} /><Mat color={BLACK} rough={0.65} /></mesh>
        <Blk p={[0, -1.8, 4.3]} s={[7.9, 2.1, 2.1]} color="#353638" metal={0.45} />
        <Blk p={[0, -4.6, 6.6]} s={[5.5, 7.7, 1.1]} color="#292a2c" metal={0.55} />
      </>;
    case "adapter35to635": // local Hosa shape: moulded 3.5 mm female body → 6.35 mm TRS male
      return <><Rod z={10} d={12} d2={10} len={20} color={BLACK} seg={16} /><Rod z={20.1} d={8} len={0.4} color={NICKEL} metal={0.9} /><Rod z={20.4} d={3.6} len={0.4} color={DARK} /><Shaft d={6.35} len={30} rings={2} z0={0} /></>;
    case "adapter635to35": // ADAPTER-635-35: 6.35 mm socket body → 3.5 mm TRS plug
      return <><Rod z={12} d={14} len={24} color={BLACK} /><Rod z={24.1} d={6.5} len={0.4} color={DARK} /><Rod z={-1} d={9} len={2} color={GOLD} metal={0.9} /><Shaft d={3.5} len={14} rings={2} z0={-2} /></>;
  }
}

/** Plug styles that represent an unresolved / generic physical termination (shown with a generic label in docs/UI). */
export const GENERIC_PLUG_STYLES: readonly PlugStyle[] = ["optical", "fiber", "multicore"];
/** Plug styles that are logical links, not physical connectors. */
export const LOGICAL_PLUG_STYLES: readonly PlugStyle[] = ["control", "logical"];
