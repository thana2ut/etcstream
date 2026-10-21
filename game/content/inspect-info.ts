import type { TrainingTarget } from "../training/hdmi-training";
import type { Scenario, CableDef } from "../training/scenarios";
import { EQUIPMENT_INFO, type EquipmentInfo } from "./equipment-info";
import { simEquipmentInfo } from "./sim-equipment-info";
import { catalogById, catalogIdFor, type CatalogCable } from "./cable-catalog";
import { referenceEvidence, referenceKeyForDevice } from "./reference-evidence";

const CABLE_PREFIX = "@cable:";
/** UI-only identifier; never enters the save or the equipment/cable registry. */
export function inspectIdForTarget(target?: TrainingTarget | null) {
  return target?.kind === "item" ? target.itemId : target?.kind === "device" ? target.deviceId : target?.kind === "end" ? `${CABLE_PREFIX}${target.cableId}` : null;
}
export function inspectCableKey(cable: CableDef) {
  return cable.socketB ? cable.socketB === "3.5mm" ? "ADAPTER-35-635" : "ADAPTER-635-35"
    : cable.fixedA || cable.plugs?.includes("lav") ? "AUD-LAV-TX" : catalogIdFor(cable);
}
export function cableInspectCatalog(cable: CableDef): CatalogCable {
  const key = inspectCableKey(cable), catalog = catalogById(key);
  return { ...(catalog ?? { id: key, name: cable.label, category: "audio", family: "trs", ends: cable.ends.join(" ↔ "), use: cable.socketB ? "แปลงขนาดหัวแจ็คให้ตรงพอร์ต ไม่แปลงระดับหรือชนิดสัญญาณ" : "เชื่อมพอร์ตที่ชนิดหัวและหน้าที่ตรงกัน", status: "มีเงื่อนไข", note: "ตรวจพอร์ตต้นทางและปลายทางก่อนต่อ", color: cable.color }), name: cable.label,
    ...(cable.plugs?.includes('lc-duplex')?{ends:'LC duplex ↔ LC duplex · ชุด Optical Fiber 12G ใน GAME',note:'สินค้าเป้าหมายเกมใช้ optical SFP / single-mode LC เข้าคู่กัน; ไม่ยืนยันชุดไฟเบอร์จริงของเจ้าของ'}:{}) };
}
export function inspectSubject(scenario: Scenario, id: string) {
  const cable = id.startsWith(CABLE_PREFIX) ? scenario.cables.find((c) => c.id === id.slice(CABLE_PREFIX.length)) : undefined;
  if (cable) {
    const evidence=referenceEvidence(inspectCableKey(cable),true);
    return {kind:'cable' as const,cable,catalog:cableInspectCatalog(cable),evidence:cable.plugs?.includes('lc-duplex')?{...evidence,note:'ชุดที่เลือกสำหรับ GAME ใช้ LC duplex กับ Optical Fiber 12G SFP และเส้นใย single-mode; ตัวตน/ชนิดชุดไฟเบอร์จริงของเจ้าของยังไม่ยืนยัน ภาพคลังเดิมไม่ถูกเปลี่ยนสถานะเป็น exact'}:evidence};
  }
  const device = scenario.devices.find((d) => d.id === id) ?? scenario.placeables.find((p) => p.id === id)?.device;
  const info: EquipmentInfo = (scenario.simDevices?.[id] ? simEquipmentInfo(scenario, id) : EQUIPMENT_INFO[id]) ?? {
    name: device?.label ?? "อุปกรณ์ในห้องฝึก", model: device?.model ?? "ยังไม่มีข้อมูลรุ่นที่ยืนยัน", role: "อุปกรณ์เพื่อการฝึก",
    summary: "ตรวจชื่อพอร์ตและหน้าที่ก่อนนำไปต่อในระบบ", facts: [], inThisRoom: device?.zoneLabel ?? "ตรวจดูตำแหน่งติดตั้งในห้องฝึก", unverified: ["ข้อมูลอ้างอิงยังไม่ครบ"],
  };
  return { kind: "device" as const, device, info, evidence: referenceEvidence(referenceKeyForDevice(device, id), device?.generic) };
}
