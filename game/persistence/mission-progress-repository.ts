import { getDifficultyMeta, getMissionBySlug, missionChapters } from "@/game/content/mission-catalog";

export interface MissionSelection {
  slug: string;
  difficulty: number;
  acceptedAt: string;
}

export interface MissionProgressRecord {
  version: 1;
  playerId: string;
  selected: MissionSelection | null;
  completed: Record<string, number[]>;
}

const key = (playerId: string) => `etcstream-mission-progress-v1:${playerId}`;
const empty = (playerId: string): MissionProgressRecord => ({ version: 1, playerId, selected: null, completed: {} });

export function isDifficultyUnlocked(progress: MissionProgressRecord, slug: string, level: number): boolean {
  return level === 1 || Boolean(progress.completed[slug]?.includes(level - 1));
}

function normalize(value: unknown, playerId: string): MissionProgressRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || record.playerId !== playerId) return null;
  const completed: Record<string, number[]> = {};
  const rawCompleted = record.completed && typeof record.completed === "object" ? record.completed as Record<string, unknown> : {};
  for (const mission of missionChapters) {
    const raw = rawCompleted[mission.slug];
    const valid = Array.isArray(raw) ? raw.filter((level): level is number => Number.isInteger(level) && level >= 1 && level <= 5) : [];
    completed[mission.slug] = [];
    for (const level of [1, 2, 3, 4, 5]) {
      if (!valid.includes(level)) break;
      completed[mission.slug].push(level);
    }
  }
  const rawSelected = record.selected && typeof record.selected === "object" ? record.selected as Record<string, unknown> : null;
  const mission = getMissionBySlug(typeof rawSelected?.slug === "string" ? rawSelected.slug : null);
  const level = rawSelected?.difficulty;
  const acceptedAt = rawSelected?.acceptedAt;
  const selected = mission && typeof level === "number" && getDifficultyMeta(mission, level)
    && isDifficultyUnlocked({ version: 1, playerId, selected: null, completed }, mission.slug, level)
    && typeof acceptedAt === "string" && !Number.isNaN(Date.parse(acceptedAt))
    ? { slug: mission.slug, difficulty: level, acceptedAt } : null;
  return { version: 1, playerId, selected, completed };
}

export class LocalStorageMissionProgressRepository {
  load(playerId: string): MissionProgressRecord {
    if (typeof window === "undefined") return empty(playerId);
    try {
      const raw = window.localStorage.getItem(key(playerId));
      if (raw) return normalize(JSON.parse(raw), playerId) ?? empty(playerId);
      return empty(playerId);
    } catch { return empty(playerId); }
  }

  private save(record: MissionProgressRecord): boolean {
    try { window.localStorage.setItem(key(record.playerId), JSON.stringify(record)); return true; }
    catch { return false; }
  }

  select(playerId: string, slug: string, level: number): MissionProgressRecord | null {
    const mission = getMissionBySlug(slug);
    const record = this.load(playerId);
    if (!mission || !getDifficultyMeta(mission, level) || !isDifficultyUnlocked(record, slug, level)) return null;
    const updated: MissionProgressRecord = { ...record, selected: { slug, difficulty: level, acceptedAt: new Date().toISOString() } };
    return this.save(updated) ? updated : null;
  }

  complete(playerId: string, slug: string, level: number): MissionProgressRecord | null {
    const record = this.load(playerId);
    if (record.selected?.slug !== slug || record.selected.difficulty !== level) return null;
    const completed = { ...record.completed, [slug]: [...new Set([...(record.completed[slug] ?? []), level])].sort() };
    const updated = { ...record, completed };
    return this.save(updated) ? updated : null;
  }
}

export const missionProgressRepository = new LocalStorageMissionProgressRepository();
