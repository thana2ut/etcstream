"use client";

import { memo } from "react";
import { Text } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { layoutObstacles, type Furniture, type VenueLayout } from "@/game/training/venue-layouts";
import { Ball, BLACK_METAL, CHROME, Cyl, FONT, RB, RUBBER, Slab, STEEL, Tube, type MatProps } from "./kit";
import { tex } from "./textures";

/**
 * Renders a venue layout's furniture from game/training/venue-layouts.ts (one renderer per FurnitureKind)
 * and builds the matching colliders, so what the player sees is exactly what blocks them and what they work on.
 */
export interface FurnitureLook { top?: string; frame?: MatProps; cloth?: string; caseColor?: string }

function Legs({ w, d, h, frame, inset = 0.06 }: { w: number; d: number; h: number; frame: MatProps; inset?: number }) {
  return <>{[-1, 1].flatMap((a) => [-1, 1].map((b) => <group key={`${a}${b}`}>
    <RB p={[a * (w / 2 - inset), h / 2, b * (d / 2 - inset)]} s={[0.04, h, 0.04]} rad={0.01} {...frame} />
    <Cyl p={[a * (w / 2 - inset), 0.008, b * (d / 2 - inset)]} rt={0.024} h={0.016} {...RUBBER} />
  </group>))}</>;
}

function Desk({ f, look, skirt }: { f: Furniture; look: FurnitureLook; skirt?: string }) {
  const [w, h, d] = f.size;
  const wood = tex.wood(look.top ?? "#c9a476", [Math.max(1, w), 1]);
  const frame = look.frame ?? STEEL;
  return <group>
    <RB p={[0, h - 0.02, 0]} s={[w, 0.04, d]} rad={0.012} map={wood} c="#ffffff" r={0.45} />
    {skirt
      ? <RB p={[0, (h - 0.04) / 2, 0]} s={[w + 0.01, h - 0.04, d + 0.01]} rad={0.008} map={tex.fabric(skirt, [Math.max(2, w * 2), 1])} c="#ffffff" r={0.95} />
      : <>
        <Legs w={w} d={d} h={h - 0.04} frame={frame} />
        <RB p={[0, h * 0.55, -d / 2 + 0.03]} s={[w - 0.14, h * 0.5, 0.015]} rad={0.004} {...frame} c="#5b616a" />
        <Tube pts={[[-w / 2 + 0.06, 0.12, 0], [w / 2 - 0.06, 0.12, 0]]} r={0.012} {...frame} />
      </>}
    {/* cable grommet + power strip under the rear edge */}
    <Cyl p={[w * 0.32, h + 0.001, -d / 2 + 0.12]} rt={0.035} h={0.004} c="#0e0f12" />
    <RB p={[0, h - 0.08, -d / 2 + 0.08]} s={[0.42, 0.04, 0.06]} rad={0.012} c="#e8e8e4" />
    {f.label && <Text font={FONT} position={[0, h - 0.06, d / 2 + 0.012]} fontSize={0.05} color="#f2d9a6" anchorX="center" outlineWidth={0.003} outlineColor="#000">{f.label}</Text>}
  </group>;
}

function FlightCase({ f, look }: { f: Furniture; look: FurnitureLook }) {
  const [w, h, d] = f.size;
  const tolex = tex.fabric(look.caseColor ?? "#202124", [2, 2]);
  return <group>
    <RB p={[0, 0.08 + (h - 0.12) / 2, 0]} s={[w, h - 0.12, d]} rad={0.02} map={tolex} c="#ffffff" r={0.85} />
    <RB p={[0, h - 0.02, 0]} s={[w + 0.01, 0.04, d + 0.01]} rad={0.01} c="#3a3d43" r={0.6} />
    {[0.09, h - 0.05].map((y) => <RB key={y} p={[0, y, 0]} s={[w + 0.006, 0.022, d + 0.006]} rad={0.005} {...CHROME} c="#c4c8cc" />)}
    {[-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [0.09, h - 0.05].map((y) => <Ball key={`${a}${b}${y}`} p={[a * (w / 2), y, b * (d / 2)]} r={0.028} {...CHROME} />)))}
    {[-w / 3, w / 3].map((x) => <RB key={x} p={[x, h * 0.62, d / 2 + 0.008]} s={[0.07, 0.09, 0.02]} rad={0.006} {...CHROME} />)}
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <mesh key={`w${a}${b}`} position={[a * (w / 2 - 0.1), 0.045, b * (d / 2 - 0.1)]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 0.035, 16]} /><meshStandardMaterial color="#141414" roughness={0.9} /></mesh>))}
    {f.label && <Text font={FONT} position={[0, h * 0.4, d / 2 + 0.015]} fontSize={0.06} color="#f2d9a6" anchorX="center" outlineWidth={0.003} outlineColor="#000">{f.label}</Text>}
  </group>;
}

function AvCabinet({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h / 2, 0]} s={[w, h, d]} rad={0.015} c="#b9c0c8" m={0.5} r={0.45} />
    {/* open front (toward the room, −X side when on the right wall) with two shelves of gear trays */}
    <RB p={[-w / 2 - 0.005, h / 2, 0]} s={[0.01, h - 0.08, d - 0.08]} rad={0.004} c="#2b2f36" />
    {[0.32, 0.62].map((y) => <RB key={y} p={[-0.02, y, 0]} s={[w - 0.08, 0.02, d - 0.1]} rad={0.004} c="#8f969e" m={0.5} />)}
    {Array.from({ length: 4 }, (_, i) => <mesh key={i} position={[-0.05, 0.36, -d / 2 + 0.35 + i * (d - 0.7) / 3]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.1, 0.018, 8, 28]} /><meshStandardMaterial color={["#1b1b1f", "#2d6cdf", "#1b1b1f", "#d0b030"][i]} roughness={0.6} /></mesh>)}
    <RB p={[0, h + 0.005, 0]} s={[w + 0.02, 0.01, d + 0.02]} rad={0.003} c="#d6d9dc" />
    <Text font={FONT} position={[-w / 2 - 0.012, h - 0.12, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.07} color="#1d2a3d">ตู้ AV · อุปกรณ์พกพา</Text>
  </group>;
}

function CableRack({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    {[-1, 1].flatMap((a) => [-1, 1].map((b) => <RB key={`${a}${b}`} p={[a * (w / 2 - 0.02), h / 2, b * (d / 2 - 0.02)]} s={[0.035, h, 0.035]} rad={0.008} {...BLACK_METAL} />))}
    {[0.15, 0.55, h].map((y) => <RB key={y} p={[0, y, 0]} s={[w, 0.025, d]} rad={0.006} c="#3a3e45" m={0.5} />)}
    {Array.from({ length: Math.floor(w / 0.3) }, (_, i) => <mesh key={i} position={[-w / 2 + 0.18 + i * 0.3, 0.3, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.11, 0.02, 8, 28]} /><meshStandardMaterial color={["#1b1b1f", "#e08a2e", "#3a6fd8", "#1b1b1f", "#d8c040"][i % 5]} roughness={0.6} /></mesh>)}
    {f.label && <Text font={FONT} position={[0, h - 0.1, d / 2 + 0.03]} fontSize={0.06} color="#f2d9a6" anchorX="center" outlineWidth={0.003} outlineColor="#000">{f.label}</Text>}
  </group>;
}

function RackCabinet({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h / 2, 0]} s={[w, h, d]} rad={0.02} c="#15171b" m={0.4} r={0.5} />
    {Array.from({ length: 9 }, (_, u) => <group key={u} position={[0, 0.2 + u * 0.19, d / 2 + 0.006]}>
      <RB p={[0, 0, 0]} s={[w - 0.08, 0.15, 0.01]} rad={0.004} c={u % 2 ? "#262a31" : "#1e2127"} m={0.5} />
      {[0, 1, 2, 3].map((l) => <Ball key={l} p={[-w / 2 + 0.12 + l * 0.05, 0.03, 0.008]} r={0.006} c={["#38ff6a", "#38ff6a", "#ffb020", "#3a8bff"][(l + u) % 4]} e={["#38ff6a", "#38ff6a", "#ffb020", "#3a8bff"][(l + u) % 4]} ei={2.4} />)}
    </group>)}
  </group>;
}

function StudentDesk({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h - 0.015, 0]} s={[w, 0.025, d]} rad={0.01} map={tex.wood("#d5b282")} c="#ffffff" r={0.45} />
    <RB p={[0, h - 0.12, -0.02]} s={[w - 0.08, 0.012, d - 0.16]} rad={0.004} c="#6d737b" m={0.5} />
    <Legs w={w} d={d} h={h - 0.03} frame={{ ...STEEL, c: "#5d636b" }} />
    {/* chair behind the desk */}
    <group position={[0, 0, d / 2 + 0.3]}>
      <RB p={[0, 0.45, 0]} s={[0.42, 0.03, 0.4]} rad={0.012} c="#2f6fb5" r={0.35} />
      <RB p={[0, 0.74, 0.19]} rot={[-0.1, 0, 0]} s={[0.42, 0.34, 0.025]} rad={0.012} c="#2f6fb5" r={0.35} />
      {[-1, 1].map((s) => <Tube key={s} pts={[[s * 0.19, 0.01, -0.18], [s * 0.19, 0.44, -0.16], [s * 0.19, 0.44, 0.18], [s * 0.19, 0.01, 0.2]]} r={0.01} {...STEEL} />)}
    </group>
  </group>;
}

function AudienceTable({ f, look }: { f: Furniture; look: FurnitureLook }) {
  const [w, h] = f.size;
  return <group>
    <RB p={[0, h - 0.01, 0]} s={[w, 0.02, 0.6]} rad={0.008} c="#fbfaf7" />
    <RB p={[0, (h - 0.02) / 2, 0]} s={[w + 0.02, h - 0.02, 0.62]} rad={0.008} map={tex.fabric(look.cloth ?? "#fbfaf7", [4, 1])} c="#ffffff" r={0.95} />
    {[-w / 4, w / 4].flatMap((x) => [-1, 1].map((s) => <group key={`${x}${s}`} position={[x, 0, s * 0.55]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
      <RB p={[0, 0.46, 0]} s={[0.44, 0.08, 0.44]} rad={0.035} map={tex.fabric("#f5f3ef")} c="#ffffff" r={0.92} />
      <RB p={[0, 0.22, 0]} s={[0.44, 0.44, 0.44]} rad={0.03} map={tex.fabric("#f5f3ef")} c="#ffffff" r={0.92} />
      <RB p={[0, 0.85, 0.2]} rot={[-0.08, 0, 0]} s={[0.44, 0.7, 0.07]} rad={0.03} map={tex.fabric("#f5f3ef")} c="#ffffff" r={0.92} />
    </group>))}
  </group>;
}

function ChairBlock({ f }: { f: Furniture }) {
  const [w] = f.size;
  const n = Math.max(2, Math.round(w / 0.52));
  return <group>{Array.from({ length: n }, (_, i) => <group key={i} position={[-w / 2 + 0.26 + i * ((w - 0.52) / (n - 1)), 0, 0]}>
    <RB p={[0, 0.45, 0]} s={[0.42, 0.03, 0.4]} rad={0.012} c="#2c3e63" />
    <RB p={[0, 0.78, 0.19]} rot={[-0.15, 0, 0]} s={[0.42, 0.3, 0.025]} rad={0.012} c="#2c3e63" />
    {[-1, 1].map((s) => <group key={s}>
      <Tube pts={[[s * 0.2, 0, -0.2], [s * 0.2, 0.45, 0.05], [s * 0.2, 0.95, 0.24]]} r={0.01} {...STEEL} />
      <Tube pts={[[s * 0.2, 0, 0.22], [s * 0.2, 0.45, -0.1]]} r={0.01} {...STEEL} />
    </group>)}
  </group>)}</group>;
}

function Stage({ f, look }: { f: Furniture; look: FurnitureLook }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h - 0.025, 0]} s={[w, 0.05, d]} rad={0.015} map={tex.wood(look.top ?? "#3b2d22", [Math.max(2, w / 1.5), 2])} c="#ffffff" r={0.55} />
    <RB p={[0, (h - 0.05) / 2, d / 2 - 0.01]} s={[w, h - 0.05, 0.02]} rad={0.005} map={tex.fabric(look.cloth ?? "#1c1c22", [w, 1])} c="#ffffff" r={0.95} />
    <RB p={[0, (h - 0.05) / 2, -0.02]} s={[w - 0.1, h - 0.06, d - 0.1]} rad={0.01} c="#1a1a1e" />
    {/* side steps up to the stage */}
    {[-1, 1].map((s) => <group key={s} position={[s * (w / 2 - 0.75), 0, d / 2]}>
      {[1, 2, 3].map((k) => <RB key={k} p={[0, (h * k) / 8, 0.15 + (3 - k) * 0.28]} s={[1.0, (h * k) / 4, 0.28]} rad={0.01} c="#2a2a30" />)}
    </group>)}
  </group>;
}

function Podium({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  const base = 0.8;
  return <group>
    <RB p={[0, base + (h - base - 0.06) / 2, 0]} s={[w, h - base - 0.06, d]} rad={0.03} map={tex.wood("#5b3a22", [1, 2])} c="#ffffff" r={0.45} />
    <RB p={[0, h - 0.03, -0.02]} rot={[0.25, 0, 0]} s={[w + 0.06, 0.04, d + 0.08]} rad={0.012} map={tex.wood("#6d4528")} c="#ffffff" r={0.4} />
    <RB p={[0, base + (h - base) * 0.55, d / 2 + 0.006]} s={[w * 0.6, 0.2, 0.01]} rad={0.004} c="#c8a868" m={0.8} r={0.3} />
  </group>;
}

function Platform({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h / 2, 0]} s={[w, h, d]} rad={0.02} map={tex.wood("#5f5a52", [2, 2])} c="#ffffff" r={0.7} />
    {[-1, 1].map((s) => <Tube key={s} pts={[[s * w / 2, h, -d / 2], [s * w / 2, h + 0.9, -d / 2], [s * w / 2, h + 0.9, d / 2], [s * w / 2, h, d / 2]]} r={0.02} {...STEEL} />)}
  </group>;
}

function CableReel({ f }: { f: Furniture }) {
  const [w, h] = f.size;
  const r = h / 2;
  return <group position={[0, r, 0]}>
    {[-1, 1].map((s) => <Cyl key={s} p={[s * 0.18, 0, 0]} rot={[0, 0, Math.PI / 2]} rt={r} h={0.025} c="#d64b2a" r={0.5} />)}
    {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-0.15 + i * 0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[r * 0.62, 0.03, 10, 36]} /><meshStandardMaterial color={i % 2 ? "#e08a2e" : "#141414"} roughness={0.6} /></mesh>)}
    <Cyl p={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} rt={0.05} h={w * 0.5} {...STEEL} />
  </group>;
}

function PowerCase({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <RB p={[0, h / 2, 0]} s={[w, h, d]} rad={0.04} c="#e8b925" m={0.3} r={0.4} />
    <RB p={[0, h * 0.6, d / 2 + 0.005]} s={[w * 0.6, h * 0.3, 0.01]} rad={0.006} c="#20232a" />
    <Text font={FONT} position={[0, h * 0.6, d / 2 + 0.012]} fontSize={0.06} color="#ffd34d">UPS · POWER</Text>
  </group>;
}

function TvStand({ f }: { f: Furniture }) {
  const [w, h, d] = f.size;
  return <group>
    <Tube pts={[[-w * 0.3, 0.05, 0], [w * 0.3, 0.05, 0]]} r={0.02} {...BLACK_METAL} />
    {[-1, 1].map((s) => <Tube key={s} pts={[[s * w * 0.3, 0.05, -d / 2], [s * w * 0.3, 0.05, d / 2]]} r={0.02} {...BLACK_METAL} />)}
    <Cyl p={[0, h / 2, -0.03]} rt={0.035} h={h} {...BLACK_METAL} />
    <RB p={[0, h - 0.02, -0.03]} s={[w * 0.8, 0.04, 0.3]} rad={0.012} {...BLACK_METAL} />
  </group>;
}

const FurniturePiece = memo(function FurniturePiece({ f, look }: { f: Furniture; look: FurnitureLook }) {
  const body = (() => {
    switch (f.kind) {
      case "operatorDesk": case "presenterTable": case "tentDesk": return <Desk f={f} look={look} />;
      case "teacherDesk": return <Desk f={f} look={{ ...look, top: "#8a5a34" }} />;
      case "fohDesk": case "audioDesk": case "productionDesk": case "commentaryDesk": return <Desk f={f} look={{ ...look, top: look.top ?? "#2b2f36" }} skirt={look.cloth ?? "#1a1c22"} />;
      case "studentDesk": return <StudentDesk f={f} />;
      case "avCabinet": return <AvCabinet f={f} />;
      case "roadCase": case "fieldCase": return <FlightCase f={f} look={look} />;
      case "cableRack": return <CableRack f={f} />;
      case "rackCabinet": return <RackCabinet f={f} />;
      case "audienceTable": return <AudienceTable f={f} look={look} />;
      case "chairBlock": return <ChairBlock f={f} />;
      case "stage": return <Stage f={f} look={look} />;
      case "podium": return <Podium f={f} />;
      case "riser": case "cameraPlatform": return <Platform f={f} />;
      case "cableReel": return <CableReel f={f} />;
      case "powerCase": return <PowerCase f={f} />;
      case "tvStand": return <TvStand f={f} />;
      case "controlWall": return <RB p={[0, 2.0, 0]} s={[f.size[0] + 0.2, 4.0, 0.08]} rad={0.02} c="#0b0c10" />;
      default: return null;
    }
  })();
  return <group position={f.center}>{body}</group>;
});

export function LayoutFurniture({ layout, look = {} }: { layout: VenueLayout; look?: FurnitureLook }) {
  return <>{layout.furniture.map((f) => <FurniturePiece key={f.id} f={f} look={look} />)}</>;
}

/** Floor + bounds walls + every furniture / obstacle box of the layout. */
export function LayoutColliders({ layout }: { layout: VenueLayout }) {
  const { minX, maxX, minZ, maxZ } = layout.bounds;
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, hw = (maxX - minX) / 2, hd = (maxZ - minZ) / 2, h = 1.6;
  return <RigidBody type="fixed" colliders={false}>
    <CuboidCollider position={[cx, -0.08, cz]} args={[hw + 0.2, 0.08, hd + 0.2]} />
    <CuboidCollider position={[minX - 0.05, h, cz]} args={[0.05, h, hd]} />
    <CuboidCollider position={[maxX + 0.05, h, cz]} args={[0.05, h, hd]} />
    <CuboidCollider position={[cx, h, minZ - 0.05]} args={[hw, h, 0.05]} />
    <CuboidCollider position={[cx, h, maxZ + 0.05]} args={[hw, h, 0.05]} />
    {layoutObstacles(layout).map((o, i) => <CuboidCollider key={i} position={o.center} args={o.half} />)}
  </RigidBody>;
}

export { Slab };
