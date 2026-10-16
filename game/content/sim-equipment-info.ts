import { simThai } from "./sim-thai";
import type { Scenario } from "@/game/training/scenarios";
import { MODELS } from "@/game/training/sim/equipment";

/** Inspect Mode card for production-stage devices, built from the equipment manifest (English, sourced). */
export function simEquipmentInfo(scenario: Scenario, id: string) {
  const inst = scenario.simDevices?.[id];
  if (!inst) return undefined;
  const m = MODELS[inst.model];
  const station = scenario.placeables.find((p) => p.id === id)?.zoneLabel;
  return {
    name: inst.label, model: `${simThai(m.manufacturer)} · ${simThai(m.name)}`,
    role: m.generic ? "อุปกรณ์จำลองเพื่อฝึก" : m.manufacturer,
    summary: simThai(m.notes[0] ?? m.name),
    facts: [...m.verifiedPorts.map((p) => `พอร์ตตามโปรไฟล์ฝึก: ${p}`), ...m.notes.slice(1).map(simThai), ...(m.sourceUrl ? [`แหล่งอ้างอิง: ${m.sourceUrl}`] : []), `สิทธิ์การใช้ชิ้นงาน: ${m.assetLicense}`],
    inThisRoom: `${inst.label}${station ? ` — จุดติดตั้ง: ${station}` : ""} เปิดแผงควบคุม (C) เพื่อดูสถานะ พอร์ต และการตั้งค่า`,
    unverified: scenario.stage?.unresolvedHardware ?? [],
  };
}
