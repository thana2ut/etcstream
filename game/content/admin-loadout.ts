import type { Scenario } from "@/game/training/scenarios";
import { catalogIdFor, packableCables } from "./cable-catalog";
import { checkMissionBag, requiredBag } from "./mission-bag";

/**
 * Admin test launch only: missions use the ACTIVE level's canonical leads; free practice uses room stock.
 * Mission routes come from scenario.canonical ← stage.solution in venue-scenarios. Pre-installed leads and leads that
 * come attached to a device (fixedA) are not packed. Nothing is wired; the leads start inside the bag.
 */
export type AdminLoadout =
  | { ok: true; leads: string[]; bag: Record<string, number> }
  | { ok: false; issues: string[] };

export function buildAdminLoadout(scenario: Scenario): AdminLoadout {
  const id = scenario.stage?.id ?? scenario.id;
  if (scenario.id === "studio-full") {
    const bag = requiredBag(scenario);
    const leads = packableCables(scenario).map((cable) => cable.id);
    return leads.length === 8 && checkMissionBag(scenario, bag).ok
      ? { ok: true, leads, bag }
      : { ok: false, issues: ["ชุดสายห้องฝึกไม่ครบ กรุณาตรวจข้อมูลสายที่ต้องใช้"] };
  }
  if (!scenario.stage) return buildTrainingLoadout(scenario);
  if (!scenario.canonical) return { ok: false, issues: [`${id}: ไม่พบเส้นทางมาตรฐานของด่านนี้ในข้อมูลปัจจุบัน`] };
  const preinstalled = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
  const issues: string[] = [];
  const leads: string[] = [];
  for (const route of scenario.canonical) {
    const cable = scenario.cables.find((c) => c.id === route.cableId);
    if (!cable) { issues.push(`${id}: เส้นทาง ${route.from} → ${route.to} อ้างถึงสาย ${route.cableId} ที่ไม่มีในคลังของด่าน`); continue; }
    if (cable.fixedA || preinstalled.has(cable.id) || catalogIdFor(cable) === "CTRL-REPLAY") continue;
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

/** Admin free practice packs the room's actual stock, without inferring a wiring solution. */
function buildTrainingLoadout(scenario: Scenario): AdminLoadout {
  const leads: string[] = [];
  const bag: Record<string, number> = {};
  for (const cable of packableCables(scenario)) {
    const catalog = catalogIdFor(cable);
    if (catalog === "CTRL-REPLAY") continue;
    leads.push(cable.id);
    bag[catalog] = (bag[catalog] ?? 0) + 1;
  }
  return { ok: true, leads, bag };
}
