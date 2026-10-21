import { SCENARIOS, type Scenario } from "@/game/training/scenarios";
import { catalogIdFor, PHYSICAL_CABLE_CATALOG } from "./cable-catalog";

/**
 * Mission-mode cable preparation (25 venue levels only; Free Practice keeps its own bag rules).
 * - The lobby offers the full physical catalog, including non-required training distractors.
 * - Entry requires the bag to match the level's required multiset exactly.
 */

const venueLevels = (scenario: Scenario): Scenario[] =>
  scenario.venueScale ? [1, 2, 3, 4, 5].map((n) => SCENARIOS[`${scenario.venueScale}-${n}` as keyof typeof SCENARIOS]).filter(Boolean) : [scenario];

/** Leads the trainee must bring: the level's canonical routes, minus anything pre-installed or factory-attached. */
export function requiredBag(scenario: Scenario): Record<string, number> {
  const preinstalled = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
  const need: Record<string, number> = {};
  for (const route of scenario.canonical ?? []) {
    const cable = scenario.cables.find((c) => c.id === route.cableId);
    if (!cable || cable.fixedA || preinstalled.has(cable.id)) continue;
    const id = catalogIdFor(cable);
    if (id === "CTRL-REPLAY") continue;
    need[id] = (need[id] ?? 0) + 1;
  }
  return need;
}

/** Room stock of one level, per catalog id (leads not pre-installed and not factory-attached). */
function levelStock(scenario: Scenario): Record<string, number> {
  const installed = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
  const stock: Record<string, number> = {};
  for (const cable of scenario.cables) if (!cable.fixedA && !installed.has(cable.id)) {
    const id = catalogIdFor(cable);
    if (id === "CTRL-REPLAY") continue;
    stock[id] = (stock[id] ?? 0) + 1;
  }
  return stock;
}

/**
 * Uniform candidate stock avoids leaking the answer through a level-specific limit.
 * These are training choices only; the actual room's cable stock is unchanged.
 */
export function venueCandidateStock(scenario: Scenario): Record<string, number> {
  const pool: Record<string, number> = Object.fromEntries(PHYSICAL_CABLE_CATALOG.map((c) => [c.id, 32]));
  for (const level of venueLevels(scenario)) for (const [id, n] of Object.entries(levelStock(level))) pool[id] = Math.max(pool[id] ?? 0, n);
  return pool;
}

export type BagProblem = "empty" | "missing" | "excess" | "wrong" | "stock";
export type BagCheck = { ok: true } | { ok: false; problem: BagProblem };

/** Exact-match check of a packed bag against the current level. Extra/wrong first, then counts. */
export function checkMissionBag(scenario: Scenario, bag: Record<string, number>): BagCheck {
  const need = requiredBag(scenario);
  const pool = venueCandidateStock(scenario);
  const packed = Object.entries(bag).filter(([, n]) => Number.isFinite(n) && n > 0);
  const needsAny = Object.keys(need).length > 0;
  if (packed.length === 0) return needsAny ? { ok: false, problem: "empty" } : { ok: true };
  if (packed.some(([id, n]) => n > (pool[id] ?? 0))) return { ok: false, problem: "stock" };
  if (packed.some(([id]) => !need[id])) return { ok: false, problem: "wrong" };
  if (packed.some(([id, n]) => n > need[id])) return { ok: false, problem: "excess" };
  if (Object.entries(need).some(([id, n]) => (bag[id] ?? 0) < n)) return { ok: false, problem: "missing" };
  return { ok: true };
}

export const BAG_PROBLEM_TEXT: Record<BagProblem, string> = {
  empty: "กระเป๋าวิชายังว่างเปล่า จงเลือกสายที่จำเป็นสำหรับภารกิจนี้ก่อน",
  missing: "สายสัญญาณยังไม่ครบตามภารกิจ โปรดตรวจสอบจำนวนอีกครั้ง",
  excess: "สายบางชนิดมีจำนวนเกินกว่าที่ภารกิจต้องใช้ โปรดตรวจสอบจำนวนอีกครั้ง",
  wrong: "พบสายที่ไม่สอดคล้องกับค่ายกลของด่าน โปรดจัดกระเป๋าใหม่",
  stock: "จำนวนสายที่เลือกมากเกินไป โปรดปรับจำนวนใหม่",
};
