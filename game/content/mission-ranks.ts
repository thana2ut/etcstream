import { missionChapters } from "./mission-catalog";

/**
 * Sect ranks for the mission hall. A rank is derived only from levels actually cleared (existing progress record),
 * so there is no new storage to tamper with or migrate. Thresholds follow the 25-level curriculum:
 * every rank needs real work in more than one venue scale before the next title.
 */
export interface SectRank { id: string; title: string; role: string; minCleared: number }
export const SECT_RANKS: readonly SectRank[] = [
  { id: "trainee", title: "ศิษย์ฝึกหัด", role: "เพิ่งเริ่มรู้จัก OUTPUT → INPUT", minCleared: 0 },
  { id: "assistant", title: "ผู้ช่วยช่างสัญญาณ", role: "ต่อภาพและเสียงพื้นฐานได้เอง", minCleared: 3 },
  { id: "technician", title: "ช่างเทคนิคภาพ-เสียง", role: "ดูแลห้องเรียนและสตูดิโอได้ครบ", minCleared: 8 },
  { id: "operator", title: "ผู้ควบคุมการผลิต", role: "คุมงานเวทีและสลับภาพหลายกล้อง", minCleared: 13 },
  { id: "chief", title: "หัวหน้าทีมถ่ายทอด", role: "วางระบบภาคสนามและแก้ปัญหาหน้างาน", minCleared: 19 },
  { id: "master", title: "จอมถ่ายทอด", role: "ควบคุม Full Live Production ได้ทุกสถานที่", minCleared: 25 },
];

export type CompletedMap = Record<string, number[] | undefined>;

export const clearedCount = (completed: CompletedMap) => Object.values(completed).reduce((n, levels) => n + (levels?.length ?? 0), 0);
export function rankFor(cleared: number): SectRank {
  return [...SECT_RANKS].reverse().find((r) => cleared >= r.minCleared) ?? SECT_RANKS[0];
}
export function nextRank(cleared: number): SectRank | null {
  return SECT_RANKS.find((r) => r.minCleared > cleared) ?? null;
}

/** Merit for a level: grows with level and venue scale (XS … XL); a first clear pays the full amount, a review pays 30 %. */
export function meritFor(slug: string, level: number, firstClear: boolean): number {
  const scale = Math.max(0, missionChapters.findIndex((m) => m.slug === slug));
  const base = Math.round(level * 10 * (1 + scale * 0.5));
  return firstClear ? base : Math.max(5, Math.round(base * 0.3));
}
export function totalMerit(completed: CompletedMap): number {
  return Object.entries(completed).reduce((sum, [slug, levels]) => sum + (levels ?? []).reduce((s, lv) => s + meritFor(slug, lv, true), 0), 0);
}

export interface MissionDraw { slug: string; level: number; firstClear: boolean; merit: number; weight: number }

/**
 * The hall's assignment pool: every *unlocked* level. The next uncleared level of each venue weighs 6
 * (keeps the trainee advancing), other uncleared unlocked levels 3, cleared levels 1 (review / practice).
 * `exclude` avoids handing out the same order twice in a row.
 */
export function assignmentPool(completed: CompletedMap, isUnlocked: (slug: string, level: number) => boolean, exclude?: { slug: string; level: number } | null): MissionDraw[] {
  const pool: MissionDraw[] = [];
  for (const m of missionChapters) {
    const done = completed[m.slug] ?? [];
    const frontier = m.difficulties.find((d) => !done.includes(d.level))?.level;
    for (const d of m.difficulties) {
      if (!isUnlocked(m.slug, d.level)) continue;
      if (exclude && exclude.slug === m.slug && exclude.level === d.level) continue;
      const firstClear = !done.includes(d.level);
      pool.push({ slug: m.slug, level: d.level, firstClear, merit: meritFor(m.slug, d.level, firstClear), weight: !firstClear ? 1 : d.level === frontier ? 6 : 3 });
    }
  }
  return pool;
}

/** Weighted draw. `random` is injectable for deterministic use; the UI passes a crypto-backed source. */
export function drawAssignment(pool: MissionDraw[], random: () => number): MissionDraw | null {
  if (!pool.length) return null;
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = random() * total;
  for (const p of pool) { roll -= p.weight; if (roll < 0) return p; }
  return pool[pool.length - 1];
}
export const cryptoRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
