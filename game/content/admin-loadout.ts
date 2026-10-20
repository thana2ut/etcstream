import type { Scenario } from "@/game/training/scenarios";
import { catalogIdFor } from "./cable-catalog";
import { checkMissionBag, requiredBag } from "./mission-bag";

/**
 * Admin test launch only: the exact physical leads the ACTIVE level needs, taken from its canonical
 * routes (scenario.canonical ← stage.solution in venue-scenarios). Pre-installed leads and leads that
 * come attached to a device (fixedA) are not packed. Nothing is wired; the leads start inside the bag.
 */
export type AdminLoadout =
  | { ok: true; leads: string[]; bag: Record<string, number> }
  | { ok: false; issues: string[] };

export function buildAdminLoadout(scenario: Scenario): AdminLoadout {
  const id = scenario.stage?.id ?? scenario.id;
  if (!scenario.stage) return buildTrainingLoadout(scenario);
  if (!scenario.canonical) return { ok: false, issues: [`${id}: ไม่พบเส้นทางมาตรฐานของด่านนี้ในข้อมูลปัจจุบัน`] };
  const preinstalled = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
  const issues: string[] = [];
  const leads: string[] = [];
  for (const route of scenario.canonical) {
    const cable = scenario.cables.find((c) => c.id === route.cableId);
    if (!cable) { issues.push(`${id}: เส้นทาง ${route.from} → ${route.to} อ้างถึงสาย ${route.cableId} ที่ไม่มีในคลังของด่าน`); continue; }
    if (cable.fixedA || preinstalled.has(cable.id)) continue;
    if (!scenario.ports[route.from] || !scenario.ports[route.to]) { issues.push(`${id}: พอร์ต ${route.from} หรือ ${route.to} ไม่มีในด่าน`); continue; }
    if (leads.includes(cable.id)) { issues.push(`${id}: สาย ${cable.id} ถูกใช้ซ้ำในสองเส้นทาง`); continue; }
    leads.push(cable.id);
  }
  const bag: Record<string, number> = {};
  for (const lead of leads) {
    const k = catalogIdFor(scenario.cables.find((c) => c.id === lead)!);
    bag[k] = (bag[k] ?? 0) + 1;
  }
  // Must equal the same requirement the normal lobby validates against (never a looser rule).
  const need = requiredBag(scenario);
  const same = Object.keys({ ...need, ...bag }).every((k) => (need[k] ?? 0) === (bag[k] ?? 0));
  if (!same || !checkMissionBag(scenario, bag).ok) issues.push(`${id}: ชุดสายที่สร้างได้ไม่ตรงกับเงื่อนไขกระเป๋าของด่าน`);
  return issues.length ? { ok: false, issues } : { ok: true, leads, bag };
}

/** Non-production training must resolve one unambiguous cable type for every real requirement. */
function buildTrainingLoadout(scenario: Scenario): AdminLoadout {
  const issues = scenario.requirements.filter((r) => !r.verified).map((r) => `${r.label}: เส้นทางฝึกเดิมยังเป็นสมมติฐาน จึงยังจัดชุดสายอัตโนมัติที่ยืนยันได้ไม่ได้`);
  const leads: string[] = [];
  const bag: Record<string, number> = {};
  for (const requirement of scenario.requirements) {
    const options = scenario.cables.filter((c) => !c.socketB && !c.fixedA && !leads.includes(c.id) && requirement.from.some((from) => requirement.to.some((to) => {
      const a = scenario.ports[from], b = scenario.ports[to];
      return a && b && a.direction === "OUTPUT" && b.direction === "INPUT" && ((c.ends[0] === a.connector && c.ends[1] === b.connector) || (c.ends[1] === a.connector && c.ends[0] === b.connector));
    })));
    // Alternatives with the same connectors can still be electrically different (TRS/TRRS, TS/TRS).
    const types = new Set(options.map((c) => `${catalogIdFor(c)}:${c.ends.join("/")}:${c.plugs?.join("/") ?? ""}`));
    if (types.size !== 1 || !options.length) { issues.push(`${requirement.label}: ยังระบุชนิดและจำนวนสายได้ไม่แน่นอนจากข้อมูลปัจจุบัน`); continue; }
    const cable = options[0]; leads.push(cable.id);
    const catalog = catalogIdFor(cable); bag[catalog] = (bag[catalog] ?? 0) + 1;
  }
  return issues.length ? { ok: false, issues } : { ok: true, leads, bag };
}
