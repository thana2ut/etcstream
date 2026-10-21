import { simThai } from "./sim-thai";
import type { Scenario } from "@/game/training/scenarios";
import { MODELS } from "@/game/training/sim/equipment";
import { selectedGameProduct } from './selected-product-info';

/** Inspect Mode card for production-stage devices, built from the equipment manifest (English, sourced). */
export function simEquipmentInfo(scenario: Scenario, id: string) {
  const inst = scenario.simDevices?.[id];
  if (!inst) return undefined;
  const m = MODELS[inst.model];
  if (!m) return undefined;
  const station = scenario.placeables.find((p) => p.id === id)?.zoneLabel;
  const target=selectedGameProduct(inst.model);
  return {
    name: inst.label, model: target?`${target.name} · อ้างอิงภาพสำหรับเกม`:`${simThai(m.manufacturer)} · ${simThai(m.name)}`,
    role: m.generic ? "อุปกรณ์จำลองเพื่อฝึก" : m.manufacturer,
    summary: simThai(m.notes[0] ?? m.name),
    facts: [...(target?[`สินค้าอ้างอิงภาพ: ${target.name}`,target.compatibility,`แหล่งภาพ/สเปก: ${target.url}`]:[]),...m.verifiedPorts.map((p) => `พอร์ตตามโปรไฟล์ฝึก: ${p}`), ...m.notes.slice(1).map(simThai), ...(m.sourceUrl ? [`แหล่งอ้างอิง: ${m.sourceUrl}`] : []), `สิทธิ์การใช้ชิ้นงาน: ${m.assetLicense}`],
    inThisRoom: `${inst.label}${station ? ` — จุดติดตั้ง: ${station}` : ""} เปิดแผงควบคุม (C) เพื่อดูสถานะ พอร์ต และการตั้งค่า`,
    unverified: scenario.stage?.unresolvedHardware ?? [],
  };
}
