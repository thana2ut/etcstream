import "server-only";
import { createHash } from "node:crypto";
import { trustedClient } from "./supabase";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { SEASON_RULES_V1 } from "@/game/content/arena-ranked-rules";
import type { Json } from "./types";

export const cloudStages = Object.keys(SCENARIOS).filter((id) => /^(xs|s|m|l|xl)-[1-5]$/.test(id)) as ScenarioId[];
export const stageVersion = (id: ScenarioId) => createHash("sha256").update(JSON.stringify(SCENARIOS[id])).digest("hex").slice(0, 24);
export const stageVersions = () => Object.fromEntries(cloudStages.map((id) => [id, stageVersion(id)]));
export const stageEligible = (id: ScenarioId) => id === "xs-1" && !SCENARIOS[id].designIssues?.length;
export const verificationEnabled = (id: ScenarioId) => stageEligible(id) && process.env.ARENA_VERIFIED_SLICE_ENABLED === "1";
export async function ensureCloudCatalog() {
  const result = await trustedClient().from("etc_stage_catalog").upsert(cloudStages.map((scenario) => ({
    scenario, version: stageVersion(scenario), rules_version: 1, eligible: stageEligible(scenario), definition: SCENARIOS[scenario] as unknown as Json,
  })), { onConflict: "scenario,version,rules_version", ignoreDuplicates: true });
  if (result.error) throw new Error("CATALOG_REQUIRED");
  // Open seasons always rank the CURRENT stage versions; otherwise new runs get no season and never reach the board.
  const open = await trustedClient().from("etc_seasons").select("id").eq("status", "open");
  if (open.error) return;
  for (const season of open.data ?? []) {
    const synced = await trustedClient().from("etc_season_stages").upsert(cloudStages.map((scenario) => ({ season: season.id, scenario, version: stageVersion(scenario), rules_version: 1 })), { onConflict: "season,scenario" });
    if (synced.error) console.error("Season stage sync failed", season.id, synced.error.message);
  }
}
export type CloudSeason = { id: string; name: string; starts: string; ends: string; status: string; scoring_version: string; revision: number };
export function seasonDTO(s: CloudSeason) {
  return { ...s, starts: Date.parse(s.starts), ends: Date.parse(s.ends), scoringVersion: s.scoring_version, rules: SEASON_RULES_V1 };
}
export function standingDTO(value: Record<string, unknown> | null) {
  if (!value) return null;
  const score = Number(value.score), tier = [...SEASON_RULES_V1.tiers].reverse().find((t) => score >= t.min)!;
  const next = SEASON_RULES_V1.tiers.find((t) => t.min > score);
  return { ...value, score, tier: tier.name, nextTier: next?.name ?? null, nextThreshold: next?.min ?? null };
}

