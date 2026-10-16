import type { Scenario } from "@/game/training/scenarios";
import { MODELS } from "@/game/training/sim/equipment";

/** Inspect Mode card for production-stage devices, built from the equipment manifest (English, sourced). */
export function simEquipmentInfo(scenario: Scenario, id: string) {
  const inst = scenario.simDevices?.[id];
  if (!inst) return undefined;
  const m = MODELS[inst.model];
  const station = scenario.placeables.find((p) => p.id === id)?.zoneLabel;
  return {
    name: inst.label, model: `${m.manufacturer} · ${m.name}`,
    role: m.generic ? "Generic Training Device" : m.manufacturer,
    summary: m.notes[0] ?? m.name,
    facts: [...m.verifiedPorts.map((p) => `Port: ${p}`), ...m.notes.slice(1), ...(m.sourceUrl ? [`Source: ${m.sourceUrl}`] : []), `Asset licence: ${m.assetLicense}`],
    inThisRoom: `${inst.label}${station ? ` — station: ${station}` : ""}. Open the Operator Console (C) for live status, ports and controls.`,
    unverified: [] as string[],
  };
}
