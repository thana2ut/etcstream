import * as data from "./studio-room-layout.data.json";
type Point = [number, number, number];
const point = (value: number[]): Point => [value[0], value[1], value[2]];
/** Metres, Y up, front = -Z. Blender generator reads the same JSON. */
export const STUDIO = {
  ...data,
  spawn: point(data.spawn), table: point(data.table),
  monitor: point(data.monitor), speaker: point(data.speaker),
  sideTables: data.sideTables.map(point), cameras: data.cameras.map(point), lights: data.lights.map(point),
  equipment: { camera: point(data.equipment.camera), switcher: point(data.equipment.switcher), monitor: point(data.equipment.monitor) },
  ports: Object.fromEntries(Object.entries(data.ports).map(([key, value]) => [key, point(value)])) as Record<keyof typeof data.ports, Point>,
  cableEnds: data.cableEnds.map(point),
  placementZones: Object.fromEntries(Object.entries(data.placementZones).map(([key, value]) => [key, point(value)])) as Record<keyof typeof data.placementZones, Point>,
  placeableItems: Object.fromEntries(Object.entries(data.placeableItems).map(([key, value]) => [key, point(value)])) as Record<keyof typeof data.placeableItems, Point>,
};

/** Drop onto the actual furniture surface, otherwise onto the floor. */
export function studioDropHeight(x: number, z: number): number {
  if (Math.hypot(x - STUDIO.table[0], z - STUDIO.table[2]) < STUDIO.tableRadius) return 0.81;
  if (STUDIO.sideTables.some(([tx, , tz]) => Math.abs(x - tx) < STUDIO.sideTableSize[0] / 2 && Math.abs(z - tz) < STUDIO.sideTableSize[2] / 2)) return 0.83;
  return 0.08;
}

export function nearestTablePlacement(x: number, z: number, kind: "cable" | "equipment"): Point | null {
  if (Math.hypot(x - STUDIO.table[0], z - STUDIO.table[2]) > STUDIO.tableRadius + 0.35) return null;
  const candidates = kind === "cable"
    ? [STUDIO.placementZones.cableLeft, STUDIO.placementZones.cableRight]
    : [STUDIO.placementZones.smallDevice, STUDIO.placementZones.auxDevice];
  return candidates.reduce((best, candidate) =>
    Math.hypot(x - candidate[0], z - candidate[2]) < Math.hypot(x - best[0], z - best[2]) ? candidate : best);
}

