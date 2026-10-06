"use client";

import type { PlugStyle } from "@/game/training/scenarios";

/**
 * Procedural plug heads for every cable type on the reference sheet (art/reference/cables).
 * Unit space: the tip points to -Z, the cable leaves from +Z; the parent scales it.
 */
const GOLD = "#d4a53c", NICKEL = "#c9ccd1", BLACK = "#15161a", DARK = "#050506";

function Mat({ color, metal = 0.2, rough = 0.5 }: { color: string; metal?: number; rough?: number }) {
  return <meshStandardMaterial color={color} metalness={metal} roughness={rough} />;
}
/** Cylinder along Z. */
function Rod({ z, r, len, color, metal = 0.2, r2 }: { z: number; r: number; len: number; color: string; metal?: number; r2?: number }) {
  return <mesh position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
    <cylinderGeometry args={[r2 ?? r, r, len, 18]} /><Mat color={color} metal={metal} rough={metal > 0.5 ? 0.25 : 0.55} />
  </mesh>;
}
function Blk({ p, s, color, metal = 0.2 }: { p: [number, number, number]; s: [number, number, number]; color: string; metal?: number }) {
  return <mesh position={p} castShadow><boxGeometry args={s} /><Mat color={color} metal={metal} rough={metal > 0.5 ? 0.25 : 0.55} /></mesh>;
}
/** Phone-plug shaft (3.5 / 6.35 mm): gold sleeve split by black insulator rings. */
function Shaft({ r, len, rings, z0 }: { r: number; len: number; rings: number; z0: number }) {
  const seg = len / (rings + 1);
  return <>
    <Rod z={z0 - len / 2} r={r} len={len} color={GOLD} metal={0.9} />
    {Array.from({ length: rings }, (_, i) => <Rod key={i} z={z0 - seg * (i + 1)} r={r * 1.02} len={seg * 0.14} color={DARK} />)}
    <mesh position={[0, 0, z0 - len - r * 0.4]}><sphereGeometry args={[r, 12, 8]} /><Mat color={GOLD} metal={0.9} /></mesh>
  </>;
}

export function PlugMesh({ style, accent }: { style: PlugStyle; accent?: string }) {
  switch (style) {
    case "fiber":
      return <><Blk p={[0, 0, 0.02]} s={[0.08, 0.05, 0.14]} color="#176cbc" /><Blk p={[0, 0, -0.07]} s={[0.03, 0.03, 0.05]} color="#ece7d5" /><Rod z={0.12} r={0.02} len={0.08} color="#e99032" /></>;
    case "ethernet":
      return <><Blk p={[0, 0, 0.02]} s={[0.09, 0.065, 0.12]} color="#456886" /><Blk p={[0, 0, -0.07]} s={[0.08, 0.05, 0.06]} color="#d4dce1" /><Blk p={[0, 0.038, -0.04]} s={[0.03, 0.013, 0.08]} color="#b0bcc4" /></>;
    case "hdmi":
      return <><Blk p={[0, 0, 0.02]} s={[0.12, 0.05, 0.14]} color={BLACK} /><Blk p={[0, 0, -0.08]} s={[0.09, 0.03, 0.07]} color={GOLD} metal={0.9} /><Blk p={[0, 0, -0.08]} s={[0.07, 0.012, 0.072]} color={DARK} /></>;
    case "dp":
      return <><Blk p={[0, 0, 0.02]} s={[0.12, 0.05, 0.14]} color={BLACK} /><Blk p={[0, 0, -0.08]} s={[0.09, 0.03, 0.07]} color={GOLD} metal={0.9} /><Blk p={[0.03, 0.013, -0.08]} s={[0.03, 0.008, 0.074]} color={BLACK} /><Blk p={[0, 0.03, 0.03]} s={[0.04, 0.012, 0.06]} color="#2a2b30" /></>;
    case "sdi":
      return <><Rod z={0.04} r={0.028} len={0.12} color={BLACK} /><Rod z={-0.04} r={0.04} len={0.05} color={NICKEL} metal={0.9} /><Rod z={-0.08} r={0.03} len={0.04} color={NICKEL} metal={0.9} />
        <mesh position={[0, 0, -0.1]}><torusGeometry args={[0.03, 0.006, 8, 20]} /><Mat color={NICKEL} metal={0.9} /></mesh>
        {[0.035, -0.035].map((x) => <Blk key={x} p={[x, 0, -0.05]} s={[0.012, 0.012, 0.02]} color={NICKEL} metal={0.9} />)}</>;
    case "xlr-m":
      return <><Rod z={0.03} r={0.045} len={0.14} r2={0.038} color={BLACK} /><Rod z={-0.06} r={0.047} len={0.05} color={NICKEL} metal={0.9} />
        {[[0, 0.018], [-0.016, -0.01], [0.016, -0.01]].map(([x, y], i) => <mesh key={i} position={[x, y, -0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.005, 0.005, 0.04, 8]} /><Mat color={GOLD} metal={0.9} /></mesh>)}</>;
    case "xlr-f":
      return <><Rod z={0.03} r={0.045} len={0.14} r2={0.038} color={BLACK} /><Rod z={-0.065} r={0.046} len={0.05} color={BLACK} />
        {[[0, 0.018], [-0.016, -0.01], [0.016, -0.01]].map(([x, y], i) => <mesh key={i} position={[x, y, -0.091]}><sphereGeometry args={[0.006, 8, 6]} /><Mat color={DARK} /></mesh>)}
        <Blk p={[0, 0.045, -0.02]} s={[0.014, 0.008, 0.03]} color={NICKEL} metal={0.9} /></>;
    case "trs35": return <><Rod z={0.04} r={0.022} len={0.12} r2={0.016} color={BLACK} /><Shaft r={0.009} len={0.08} rings={2} z0={-0.02} /></>;
    case "trrs35": return <><Rod z={0.04} r={0.022} len={0.12} r2={0.016} color={BLACK} /><Shaft r={0.009} len={0.08} rings={3} z0={-0.02} /></>;
    case "ts635": return <><Rod z={0.04} r={0.035} len={0.12} r2={0.028} color={BLACK} /><Shaft r={0.016} len={0.1} rings={1} z0={-0.02} /></>;
    case "trs635": return <><Rod z={0.04} r={0.035} len={0.12} r2={0.028} color={BLACK} /><Shaft r={0.016} len={0.1} rings={2} z0={-0.02} /></>;
    case "speaker635": return <><Rod z={0.04} r={0.035} len={0.12} r2={0.028} color={BLACK} /><Rod z={-0.015} r={0.037} len={0.02} color="#2f6fd6" /><Shaft r={0.016} len={0.1} rings={1} z0={-0.025} /></>;
    case "rca": return <><Rod z={0.04} r={0.028} len={0.12} r2={0.022} color={BLACK} /><Rod z={-0.03} r={0.03} len={0.03} color={accent ?? "#c21d1d"} /><Rod z={-0.065} r={0.022} len={0.04} color={GOLD} metal={0.9} /><Rod z={-0.08} r={0.006} len={0.05} color={GOLD} metal={0.9} /></>;
    case "usba":
    case "usba3":
      return <><Blk p={[0, 0, 0.02]} s={[0.1, 0.05, 0.14]} color={BLACK} /><Blk p={[0, 0, -0.08]} s={[0.08, 0.03, 0.07]} color={NICKEL} metal={0.9} /><Blk p={[0, -0.004, -0.08]} s={[0.07, 0.012, 0.072]} color={style === "usba3" ? "#1f5fd1" : "#eeeeee"} /></>;
    case "usbc":
      return <><mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.45]} castShadow><capsuleGeometry args={[0.035, 0.08, 4, 12]} /><Mat color={BLACK} /></mesh>
        <mesh position={[0, 0, -0.065]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}><capsuleGeometry args={[0.009, 0.03, 4, 10]} /><Mat color={NICKEL} metal={0.9} /></mesh></>;
    case "iec":
      return <><Blk p={[0, 0, 0.02]} s={[0.1, 0.07, 0.14]} color={BLACK} /><Blk p={[0, 0, -0.06]} s={[0.085, 0.055, 0.03]} color="#202124" /><Blk p={[0, 0, -0.076]} s={[0.06, 0.035, 0.004]} color={DARK} /></>;
    case "dc": return <><Rod z={0.04} r={0.02} len={0.12} r2={0.015} color={BLACK} /><Rod z={-0.04} r={0.012} len={0.06} color={NICKEL} metal={0.9} /><Rod z={-0.07} r={0.005} len={0.005} color={DARK} /></>;
    case "lav":
      return <>
        {/* Foam windscreen, capsule barrel, strain relief and spring clip stay on one captive lead. */}
        <mesh position={[0, 0.04, 0]} scale={[1, 1.13, 1]} castShadow><sphereGeometry args={[0.029, 16, 12]} /><Mat color="#18191b" rough={0.98} /></mesh>
        <mesh position={[0, -0.006, 0]} castShadow><cylinderGeometry args={[0.016, 0.018, 0.055, 12]} /><Mat color="#292a2c" metal={0.25} rough={0.42} /></mesh>
        <mesh position={[0, -0.038, 0]} castShadow><cylinderGeometry args={[0.011, 0.013, 0.024, 12]} /><Mat color={BLACK} rough={0.65} /></mesh>
        <Blk p={[0, -0.01, 0.024]} s={[0.044, 0.012, 0.012]} color="#353638" metal={0.45} />
        <Blk p={[0, -0.026, 0.037]} s={[0.031, 0.043, 0.006]} color="#292a2c" metal={0.55} />
      </>;
    case "adapter35to635":
      return <><Rod z={0.03} r={0.03} len={0.08} color={GOLD} metal={0.9} /><Rod z={0.071} r={0.012} len={0.004} color={DARK} /><Shaft r={0.016} len={0.1} rings={2} z0={-0.01} /></>;
    case "adapter635to35":
      return <><Rod z={0.03} r={0.042} len={0.1} color={BLACK} /><Rod z={0.081} r={0.02} len={0.004} color={DARK} /><Rod z={-0.025} r={0.03} len={0.01} color={GOLD} metal={0.9} /><Shaft r={0.009} len={0.08} rings={2} z0={-0.03} /></>;
  }
}
