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

/** Owner-awarded display only; never included in verified runs or competitive ranks. */
export async function loadAdminShowcase(seasonId: string | null, viewerId?: string) {
  if (!seasonId) return null;
  const db = trustedClient();
  const { data: award, error } = await db.from("etc_admin_showcase")
    .select("player,showcase_score,showcase_stages")
    .eq("season", seasonId).maybeSingle();
  if (error) { console.error("Admin showcase lookup failed", error); return null; }
  if (!award) return null;
  const { data: profile, error: profileError } = await db.from("etc_profiles")
    .select("name,friend_code,public,rank_public,hidden,suspended")
    .eq("id", award.player).maybeSingle();
  if (profileError) { console.error("Admin showcase profile lookup failed", profileError); return null; }
  if (!profile?.public || !profile.rank_public || profile.hidden || profile.suspended) return null;
  return { name: profile.name, friendCode: profile.friend_code,
    score: award.showcase_score, stages: award.showcase_stages,
    isMe: viewerId === award.player };
}
