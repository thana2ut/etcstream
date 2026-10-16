import type { Scenario } from "./scenarios";
import { LAYOUTS, type Point3 } from "./venue-layouts";

export interface ReviewView { id: string; label: string; eye: Point3; target: Point3 }

/** Inspection cameras in the actual playable scene; these never teleport the player or solve a task. */
export function environmentViews(scenario: Scenario, items: Record<string, { position: Point3; turn: number }> = {}): ReviewView[] {
  const layout = LAYOUTS[scenario.layout ?? "studio"];
  const b = layout.bounds;
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const target: Point3 = [cx, 1.1, cz];
  const eye: Point3 = [layout.spawn[0], 1.65, layout.spawn[2]];
  const views: ReviewView[] = [
    { id: "A-spawn", label: "A spawn", eye, target: [eye[0] - Math.sin(layout.spawnYaw) * 5, 1.1, eye[2] - Math.cos(layout.spawnYaw) * 5] },
    { id: "B-reverse", label: "B reverse", eye: [cx, 1.65, b.minZ + 1], target: [cx, 1.1, b.maxZ - 1] },
    { id: "C-west", label: "C west side", eye: [b.minX + 1, 1.65, cz], target },
    { id: "D-east", label: "D east side", eye: [b.maxX - 1, 1.65, cz], target },
    ...([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([x, z], i) => ({
      id: `E-corner-${i + 1}`, label: `E corner ${i + 1}`,
      eye: [x < 0 ? b.minX + 0.8 : b.maxX - 0.8, 1.65, z < 0 ? b.minZ + 0.8 : b.maxZ - 0.8] as Point3, target,
    })),
    // Below indoor ceilings: an elevated oblique view, not a fabricated roofless room.
    { id: "F-overview", label: "F top-down", eye: [b.maxX - 0.6, scenario.layout === "studioMission" ? 5.1 : scenario.layout === "auditorium" ? 4.4 : scenario.layout === "outdoor" ? 8 : 6, b.maxZ - 0.6], target: [cx, 0.1, cz] },
    { id: "G-floor", label: "G floor level", eye: [cx, 0.18, b.maxZ - 1], target: [cx, 0.3, cz] },
    { id: "H-ceiling", label: "H ceiling", eye: [layout.work.center[0], 1.5, layout.work.center[2]], target: [layout.work.center[0] + 0.1, 3.2, layout.work.center[2] - 0.1] },
    { id: "J-storage", label: "J equipment cases", eye: [Math.max(b.minX + 0.5, layout.equipment.center[0] - 1.5), 1.65, Math.min(b.maxZ - 0.5, layout.equipment.center[2] + 1.4)], target: layout.equipment.center },
  ];
  for (const device of scenario.devices) {
    const [x, y, z] = items[device.id]?.position ?? device.position;
    const yaw = (device.yaw ?? 0) + (items[device.id]?.turn ?? 0);
    const display = device.kind === "box" && /Monitor|Wall|TV|Screen|Display|Destination|Projector/.test(device.label) && !/Processor|Converter|Encoder|Router|Interface/.test(device.label);
    const height = y + (device.kind === "camera" ? 1.3 : device.kind === "mic" ? y < 0.3 ? /Shotgun/.test(device.label) ? 1.95 : 1.48 : 0.03 : Math.max(0.15, device.size[1] / 2) + (display && y < 0.3 ? 1.1 : 0));
    const distance = Math.max(0.85, Math.hypot(device.size[0], device.size[2]) + 0.4);
    for (const side of [1, -1]) {
      const direction = device.kind === "camera" || ["speaker", "pa"].includes(device.id) ? -side : side;
      views.push({
      id: `I-${device.id}-${side === 1 ? "front" : "back"}`,
      label: `I ${device.label} · ${side === 1 ? "front panel" : "rear panel"}`,
      eye: [Math.max(b.minX + 0.2, Math.min(b.maxX - 0.2, x + Math.sin(yaw) * distance * direction)), height + 0.3, Math.max(b.minZ + 0.2, Math.min(b.maxZ - 0.2, z + Math.cos(yaw) * distance * direction))],
      target: [x, height, z],
    });
    }
  }
  return views;
}
