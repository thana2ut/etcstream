import { getMissionBySlug } from "@/game/content/mission-catalog";

/**
 * The venue the mission hall assigned to the player (one at a time). It stays assigned until all five of its
 * levels are cleared; only then can a new one be drawn. A fresh assignment may be redrawn MAX_REROLLS time(s).
 * Stored per player and validated against the catalog.
 */
export const MAX_REROLLS = 1;
interface DrawRecord { version: 1; playerId: string; slug: string; rerolls: number }
export interface MissionDrawState { slug: string; rerolls: number }
const key = (playerId: string) => `etcstream-mission-draw-v1:${playerId}`;

export const missionDrawRepository = {
  load(playerId: string): MissionDrawState | null {
    try {
      const raw = window.localStorage.getItem(key(playerId));
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (!value || typeof value !== "object") return null;
      const record = value as Partial<DrawRecord>;
      if (record.version !== 1 || record.playerId !== playerId || typeof record.slug !== "string" || !getMissionBySlug(record.slug)) return null;
      const rerolls = Number.isInteger(record.rerolls) ? Math.min(Math.max(record.rerolls as number, 0), MAX_REROLLS) : 0;
      return { slug: record.slug, rerolls };
    } catch { return null; }
  },
  save(playerId: string, slug: string, rerolls = 0): boolean {
    if (!getMissionBySlug(slug)) return false;
    const record: DrawRecord = { version: 1, playerId, slug, rerolls: Math.min(Math.max(rerolls, 0), MAX_REROLLS) };
    try { window.localStorage.setItem(key(playerId), JSON.stringify(record)); return true; }
    catch { return false; }
  },
};
