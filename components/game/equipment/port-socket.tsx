"use client";

import type { Connector, Direction } from "@/game/training/scenarios";
import type { SocketKind } from "@/game/training/sim/model-geometry";
import { HardwareSocket } from "./hardware-model";

/** Physical generic training sockets, centred on the same anchor as their interactive target. +Z is outward. */
export function PortSocket({ connector, direction }: { connector: Connector; direction?: Direction }) {
  const kinds: Partial<Record<Connector, SocketKind>> = { HDMI: "hdmi", SDI: "bnc", "USB-A": "usba", "USB-B": "usbb", "USB-C": "usbc", ETHERNET: "rj45", "XLR-M": "xlr3m", "XLR-F": "xlr3f", XLR: direction === "OUTPUT" ? "xlr3m" : "xlr3f", XLR4: "xlr4", "3.5mm": "jack35", "6.35mm": "trs", DC: "dc", IEC: "iec", RCA: "rca", COMBO: "xlr3f" };
  const kind = kinds[connector];
  if (kind) return <group scale={1.4}><HardwareSocket kind={kind} at={[0, 0, 0]} n={[0, 0, 1]} />
    {connector === "COMBO" && <mesh position={[0, 0, 0.0045]}><circleGeometry args={[0.0032, 16]} /><meshStandardMaterial color="#050608" /></mesh>}
  </group>;
  if (connector === "CONTROL") return <mesh><torusGeometry args={[0.014, 0.0015, 6, 20]} /><meshBasicMaterial color="#b98cff" transparent opacity={0.8} /></mesh>;
  const circular = ["SDI", "XLR", "XLR-M", "XLR-F", "XLR4", "3.5mm", "6.35mm", "DC", "RCA", "speakON"].includes(connector);
  const radius = connector.startsWith("XLR") ? 0.015 : connector === "3.5mm" ? 0.006 : 0.01;
  if (circular) return <group>
    <mesh position={[0, 0, -0.006]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[radius + 0.004, radius + 0.004, 0.012, 12]} /><meshStandardMaterial color="#858b94" metalness={0.8} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.001]}><circleGeometry args={[radius, 16]} /><meshStandardMaterial color="#080b10" roughness={0.8} /></mesh>
    <mesh><torusGeometry args={[radius + 0.001, 0.002, 6, 16]} /><meshStandardMaterial color="#a6a9ae" metalness={0.8} roughness={0.3} /></mesh>
    {connector.startsWith("XLR") && [0, 1, 2].map((i) => <mesh key={i} position={[Math.sin(i * Math.PI * 2 / 3) * 0.007, Math.cos(i * Math.PI * 2 / 3) * 0.007, 0.002]}>
      <circleGeometry args={[0.002, 6]} /><meshStandardMaterial color={connector === "XLR-M" ? "#b8b9ad" : "#000000"} />
    </mesh>)}
  </group>;
  const width = connector === "USB-C" ? 0.013 : connector === "FIBER" ? 0.02 : 0.026;
  const height = connector === "ETHERNET" || connector === "MULTICORE" ? 0.02 : 0.012;
  return <group>
    <mesh position={[0, 0, -0.005]}><boxGeometry args={[width + 0.006, height + 0.006, 0.012]} /><meshStandardMaterial color="#979da5" metalness={0.8} roughness={0.35} /></mesh>
    <mesh position={[0, 0, 0.0015]}><planeGeometry args={[width, height]} /><meshStandardMaterial color="#06080d" roughness={0.9} /></mesh>
    <mesh position={[0, -height * 0.22, 0.002]}><boxGeometry args={[width * 0.7, 0.002, 0.001]} /><meshStandardMaterial color="#a58b53" metalness={0.5} roughness={0.45} /></mesh>
  </group>;
}
