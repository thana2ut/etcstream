import { playerEquipmentNote, playerEquipmentText, simThai } from "./sim-thai";
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
    name: inst.label, model: m.generic ? "อุปกรณ์ฝึกจำลอง" : playerEquipmentText(target?.name ?? m.name),
    role: m.generic ? "อุปกรณ์จำลองเพื่อฝึก" : simThai(m.manufacturer),
    summary: playerEquipmentNote(m.notes[0] ?? "") ?? `${inst.label} ใช้เชื่อมต่อสัญญาณตามหน้าที่ของอุปกรณ์ในห้องฝึก`,
    facts: [...m.verifiedPorts.map((p) => `พอร์ต: ${p}`).filter((p) => playerEquipmentNote(p) !== null), ...m.notes.slice(1).map(playerEquipmentNote).filter((note): note is string => Boolean(note))],
    inThisRoom: `${inst.label}${station ? ` — จุดติดตั้ง: ${station}` : ""} กด E ค้างเพื่อดูพอร์ต แล้วต่อสายให้ตรงพอร์ต`,
    unverified: scenario.stage?.unresolvedHardware ?? [],
  };
}
