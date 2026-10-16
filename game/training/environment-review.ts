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
    { id: "A-spawn", label: "A จุดเริ่ม", eye, target: [eye[0] - Math.sin(layout.spawnYaw) * 5, 1.1, eye[2] - Math.cos(layout.spawnYaw) * 5] },
    { id: "B-reverse", label: "B มองย้อน", eye: [cx, 1.65, b.minZ + 1], target: [cx, 1.1, b.maxZ - 1] },
    { id: "C-west", label: "C ฝั่งตะวันตก", eye: [b.minX + 1, 1.65, cz], target },
    { id: "D-east", label: "D ฝั่งตะวันออก", eye: [b.maxX - 1, 1.65, cz], target },
    ...([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([x, z], i) => ({
      id: `E-corner-${i + 1}`, label: `E มุมห้อง ${i + 1}`,
      eye: [x < 0 ? b.minX + 0.8 : b.maxX - 0.8, 1.65, z < 0 ? b.minZ + 0.8 : b.maxZ - 0.8] as Point3, target,
    })),
    // Below indoor ceilings: an elevated oblique view, not a fabricated roofless room.
    { id: "F-overview", label: "F ผังมุมสูง", eye: [b.maxX - 0.6, scenario.layout === "studioMission" ? 5.1 : scenario.layout === "auditorium" ? 4.4 : scenario.layout === "outdoor" ? 8 : 6, b.maxZ - 0.6], target: [cx, 0.1, cz] },
    { id: "G-floor", label: "G ระดับพื้น", eye: [cx, 0.18, b.maxZ - 1], target: [cx, 0.3, cz] },
    { id: "H-ceiling", label: "H เพดาน", eye: [layout.work.center[0], 1.5, layout.work.center[2]], target: [layout.work.center[0] + 0.1, 3.2, layout.work.center[2] - 0.1] },
    { id: "J-storage", label: "J จุดคืนอุปกรณ์", eye: [Math.max(b.minX + 0.5, layout.equipment.center[0] - 1.5), 1.65, Math.min(b.maxZ - 0.5, layout.equipment.center[2] + 1.4)], target: layout.equipment.center },
  ];
  if (layout.id === "outdoor") {
    const [x, y, z] = layout.work.center;
    const west = layout.places.cam2.p;
    views.push(
      { id: "K-field-control", label: "K โต๊ะควบคุมภาคสนาม", eye: [x + 1.8, 1.8, z + 2.3], target: [x, y + 0.25, z] },
      { id: "K-field-west", label: "K กล้อง B และจุดตะวันตก", eye: [west[0] + 1.6, 1.8, west[2] + 2], target: [west[0], 1.1, west[2]] },
      { id: "K-field-stage", label: "K โต๊ะนำเสนอและไมค์พิธีกร", eye: [-1.8, 2.6, layout.places.lap.p[2] + 2.5], target: [0.4, 1.8, layout.places.lap.p[2]] },
    );
  }
  if (layout.id === "stadium") {
    views.push(
      { id: "K-ob-control", label: "K ห้องควบคุมการถ่ายทอด", eye: [-3, 1.85, 1.4], target: [-10, 1.1, -6] },
      { id: "K-ob-racks", label: "K ตู้เครื่องและแผงต่อสาย", eye: [-12.1, 1.7, -1.4], target: [-15.5, 1, -4.4] },
      { id: "K-ob-commentary", label: "K โต๊ะผู้บรรยาย", eye: [10.8, 1.8, -4.8], target: [8.1, 0.95, -2.1] },
      { id: "K-ob-cameras", label: "K แนวกล้องริมสนาม", eye: [-14.8, 2.4, 11.2], target: [2, 1.1, 16] },
    );
  }
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
      label: `I ${device.label} · ${side === 1 ? "ด้านหน้า" : "ด้านหลัง"}`,
      eye: [Math.max(b.minX + 0.2, Math.min(b.maxX - 0.2, x + Math.sin(yaw) * distance * direction)), height + 0.3, Math.max(b.minZ + 0.2, Math.min(b.maxZ - 0.2, z + Math.cos(yaw) * distance * direction))],
      target: [x, height, z],
    });
    }
  }
  return views;
}
