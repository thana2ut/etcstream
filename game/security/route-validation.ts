import { getDifficultyMeta, getMissionBySlug } from "@/game/content/mission-catalog";

export type SafePlayParams =
  | { mode: "classroom"; mission: null; difficulty: null }
  | { mode: "mission"; mission: NonNullable<ReturnType<typeof getMissionBySlug>>; difficulty: number }
  | { mode: "invalid"; mission: null; difficulty: null };

export function parseGameMode(value: string | null): "classroom" | "mission" | null {
  return value === "classroom" || value === "mission" ? value : null;
}

export function parseMissionSlug(value: string | null) {
  return value ? getMissionBySlug(value) : null;
}

export function parseDifficulty(value: string | null): number | null {
  if (!value || !/^[1-5]$/.test(value)) return null;
  return Number(value);
}

export function getSafePlayParams(
  query: URLSearchParams,
  selected: { slug: string; difficulty: number } | null = null
): SafePlayParams {
  if (query.getAll("mode").length !== 1 || query.getAll("mission").length > 1 || query.getAll("difficulty").length > 1) {
    return { mode: "invalid", mission: null, difficulty: null };
  }
  const mode = parseGameMode(query.get("mode"));
  if (mode === "classroom" && !query.has("mission") && !query.has("difficulty")) {
    return { mode, mission: null, difficulty: null };
  }
  if (mode !== "mission") return { mode: "invalid", mission: null, difficulty: null };

  // Links created before query parameters were added use the saved selection.
  const legacy = !query.has("mission") && !query.has("difficulty");
  const slug = legacy ? selected?.slug ?? null : query.get("mission");
  const level = legacy ? String(selected?.difficulty ?? "") : query.get("difficulty");
  const mission = parseMissionSlug(slug);
  const difficulty = parseDifficulty(level);
  if (!mission || difficulty === null || !getDifficultyMeta(mission, difficulty)) {
    return { mode: "invalid", mission: null, difficulty: null };
  }
  return { mode, mission, difficulty };
}
