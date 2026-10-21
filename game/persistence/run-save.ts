import { SCENARIOS, type Scenario } from "@/game/training/scenarios";
import type { ScenarioId, TrainingState } from "@/game/training/hdmi-training";

/**
 * Durable snapshot of ONE unfinished playable run (mission level or Free Practice), kept apart from the
 * academy progress record (unlocks / completed levels). Browser-local (localStorage) — it stays in this
 * browser profile only; there is no cross-device sync.
 *
 * Only canonical, JSON-safe gameplay state is stored: cable end ports/positions, bag contents, equipment
 * positions/turns, held object, procedural actions and the simulation runtime (device config, tests, faults).
 * Derived signal flow and objective ticks are NOT stored; they are recomputed from this state on load.
 */
export const RUN_SAVE_SCHEMA = 1;
const PREFIX = "etcstream-run-v1";

export type RunMode = "mission" | "mission-admin" | "free-practice";

export interface RunKey { playerId: string; mode: RunMode; scenarioId: ScenarioId }

/** Store fields that make up the playable world (everything else is UI / derived). */
export const SAVED_FIELDS = ["cables", "held", "heldItem", "items", "actionsDone", "programSource", "completed", "hiddenCables", "bagged", "sim"] as const;
type SavedTraining = Pick<TrainingState, (typeof SAVED_FIELDS)[number]>;

export interface RunSnapshot {
  schema: number;
  rev: number;
  savedAt: string;
  key: RunKey;
  /** Content signature of the level the snapshot was taken on (ports / cables / equipment ids). */
  contentSig: string;
  /** Bag packed in the cable-prep lobby (catalog id → count); resuming never sends the player back there. */
  lobbyBag: Record<string, number>;
  training: SavedTraining;
  wrongStreak: number;
  failed: boolean;
  heldTurn: number;
}

export const runStorageKey = (k: RunKey) => `${PREFIX}:${k.playerId}:${k.mode}:${k.scenarioId}`;

/** Stable fingerprint of a level's mutable-object identities; changes when mission content changes shape. */
export function contentSignature(scenario: Scenario): string {
  // Venue-stock units (other levels' gear staged in the room) are excluded, so adding them kept existing saves valid.
  const stock = new Set(scenario.devices.filter((d) => d.stockOnly).map((d) => d.id));
  const parts = [
    Object.keys(scenario.ports).filter((k) => !stock.has(scenario.ports[k].device)).sort().join(","),
    scenario.cables.map((c) => `${c.id}:${c.ends.join("-")}`).sort().join(","),
    scenario.placeables.filter((p) => !p.stockOnly).map((p) => p.id).sort().join(","),
  ].join("|");
  let h = 2166136261;
  for (let i = 0; i < parts.length; i++) { h ^= parts.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

export function pickTraining(state: TrainingState): SavedTraining {
  const out: Record<string, unknown> = {};
  for (const f of SAVED_FIELDS) out[f] = state[f];
  // Store state is immutable (every change replaces the object), so references are safe to keep; the single
  // JSON.stringify in writeRun is the only serialisation per save.
  return out as SavedTraining;
}

export type LoadResult =
  | { status: "none" }
  | { status: "ok"; snapshot: RunSnapshot }
  | { status: "incompatible"; savedAt?: string; reason: string };

/** Read and validate a saved run. Never deletes or rewrites anything. */
export function loadRun(key: RunKey): LoadResult {
  let raw: string | null;
  try { raw = window.localStorage.getItem(runStorageKey(key)); } catch { return { status: "none" }; }
  if (!raw) return { status: "none" };
  let snap: RunSnapshot;
  try { snap = JSON.parse(raw) as RunSnapshot; } catch { return { status: "incompatible", reason: "ข้อมูลบันทึกเสียหาย อ่านไม่ได้" }; }
  const why = validateSnapshot(snap, key);
  return why ? { status: "incompatible", savedAt: typeof snap?.savedAt === "string" ? snap.savedAt : undefined, reason: why } : { status: "ok", snapshot: snap };
}

function validateSnapshot(s: RunSnapshot, key: RunKey): string | null {
  if (!s || typeof s !== "object" || s.schema !== RUN_SAVE_SCHEMA) return "รูปแบบข้อมูลบันทึกเป็นรุ่นที่ไม่รองรับ";
  if (s.key?.playerId !== key.playerId || s.key?.mode !== key.mode || s.key?.scenarioId !== key.scenarioId) return "ข้อมูลบันทึกไม่ใช่ของด่านนี้";
  const scenario = SCENARIOS[key.scenarioId];
  if (!scenario) return "ไม่พบด่านนี้ในเนื้อหาปัจจุบัน";
  if (s.contentSig !== contentSignature(scenario)) return CONTENT_CHANGES[key.scenarioId] ?? "เนื้อหาด่านถูกปรับปรุงหลังจากบันทึก อุปกรณ์หรือพอร์ตบางส่วนไม่ตรงกับเดิม";
  const t = s.training;
  if (!t || typeof t.cables !== "object" || typeof t.items !== "object") return "ข้อมูลบันทึกไม่ครบ";
  const cableIds = new Set(scenario.cables.map((c) => c.id));
  const saved = Object.keys(t.cables);
  if (saved.length !== cableIds.size || saved.some((id) => !cableIds.has(id))) return "รายการสายในบันทึกไม่ตรงกับด่าน";
  // Each port holds at most one plug, every referenced port exists, and a bagged lead is not also in the room.
  const used = new Set<string>();
  const bagged = new Set(t.bagged ?? []);
  for (const [id, c] of Object.entries(t.cables)) {
    for (const end of [c?.a, c?.b]) {
      if (!end || !Array.isArray(end.loosePosition) || end.loosePosition.length !== 3) return "ตำแหน่งสายในบันทึกไม่ถูกต้อง";
      if (end.portId == null) continue;
      if (!scenario.ports[end.portId]) return "บันทึกอ้างถึงพอร์ตที่ไม่มีในด่านนี้";
      if (used.has(end.portId)) return "พบสายสองเส้นเสียบพอร์ตเดียวกันในบันทึก";
      used.add(end.portId);
      if (bagged.has(id)) return "พบสายที่อยู่ทั้งในกระเป๋าและในห้อง";
    }
  }
  const itemIds = new Set(scenario.placeables.map((p) => p.id));
  if (Object.keys(t.items).some((id) => !itemIds.has(id))) return "รายการอุปกรณ์ในบันทึกไม่ตรงกับด่าน";
  if (t.held && !cableIds.has(t.held.cableId)) return "สายที่ถืออยู่ในบันทึกไม่มีในด่านนี้";
  if (t.heldItem && !itemIds.has(t.heldItem)) return "อุปกรณ์ที่ถืออยู่ในบันทึกไม่มีในด่านนี้";
  return null;
}

/**
 * Known content migrations, explained to the player instead of the generic message. Saves taken before such a change
 * are never rewritten or deleted automatically: the player chooses เริ่มใหม่ or กลับหน้าสำนัก (no silent reset).
 */
const SP_FIBER_2026_10 = "ด่านสนามกีฬาเปลี่ยนเป็นระบบไฟเบอร์จริงของ Blackmagic (กล้อง URSA Broadcast G2 → Camera Fiber Converter → สาย SMPTE → Studio Fiber Converter) สายและพอร์ตของกล้องในบันทึกเดิมจึงใช้ต่อไม่ได้";
const XS_ATEM_2026_10 = "ห้องเรียนเปลี่ยนเครื่องสลับภาพเป็น Blackmagic ATEM Mini Pro ตามสเปกจริง (HDMI OUT ช่องเดียว · MIC 1/2) พอร์ตของเครื่องสลับภาพในบันทึกเดิมจึงใช้ต่อไม่ได้";
const AU_HD8_2026_10 = "หอประชุมเปลี่ยนเครื่องสลับภาพเป็น ATEM Television Studio HD8 ISO ตามสเปกจริง (PROGRAM OUT · AUX 1/2) พอร์ตของเครื่องสลับภาพในบันทึกเดิมจึงใช้ต่อไม่ได้";
const OUT_ENC_2026_10 = "งานกลางแจ้งเปลี่ยนตัวเข้ารหัสเป็น Blackmagic Streaming Encoder HD และตัวฝังเสียงเป็น AJA 3G-AMA ตามสเปกจริง บันทึกเดิมจึงใช้ต่อไม่ได้";
const HW_BIND_2026_10 = "ด่านนี้เปลี่ยนอุปกรณ์เป็นรุ่นจริงที่ยืนยันสเปกแล้ว (กล้อง จอ เครื่องสลับภาพ เราเตอร์ เครื่องบันทึก หรือตัวเข้ารหัส) พอร์ตในบันทึกเดิมจึงใช้ต่อไม่ได้";
const CONTENT_CHANGES: Partial<Record<ScenarioId, string>> = {
  "xl-1": SP_FIBER_2026_10, "xl-3": SP_FIBER_2026_10, "xl-4": SP_FIBER_2026_10, "xl-5": SP_FIBER_2026_10,
  "xs-1": XS_ATEM_2026_10, "xs-3": XS_ATEM_2026_10, "xs-4": XS_ATEM_2026_10, "xs-5": XS_ATEM_2026_10,
  "m-1": AU_HD8_2026_10, "m-2": AU_HD8_2026_10, "m-3": AU_HD8_2026_10, "m-4": AU_HD8_2026_10, "m-5": AU_HD8_2026_10,
  "l-1": HW_BIND_2026_10, "l-2": HW_BIND_2026_10, "l-3": HW_BIND_2026_10, "l-4": OUT_ENC_2026_10, "l-5": OUT_ENC_2026_10,
  "xl-2": HW_BIND_2026_10,
};

/** Monotonic revision per key so a stale write can never replace a newer one. */
const lastRev = new Map<string, number>();

/** Synchronous, whole-value write (localStorage setItem is atomic per key). Returns false on any failure. */
export function writeRun(key: RunKey, data: Omit<RunSnapshot, "schema" | "rev" | "savedAt" | "key" | "contentSig">): { ok: true; savedAt: string } | { ok: false } {
  const storageKey = runStorageKey(key);
  try {
    let prev = lastRev.get(storageKey);
    if (prev === undefined) {
      try { prev = (JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as RunSnapshot | null)?.rev ?? 0; } catch { prev = 0; }
    }
    const savedAt = new Date().toISOString();
    const snap: RunSnapshot = { schema: RUN_SAVE_SCHEMA, rev: prev + 1, savedAt, key, contentSig: contentSignature(SCENARIOS[key.scenarioId]), ...data };
    window.localStorage.setItem(storageKey, JSON.stringify(snap));
    lastRev.set(storageKey, snap.rev);
    return { ok: true, savedAt };
  } catch {
    return { ok: false };
  }
}

/** Remove only this one run's unfinished snapshot (explicit start-over or a finished run). */
export function deleteRun(key: RunKey): void {
  try { window.localStorage.removeItem(runStorageKey(key)); } catch { /* nothing stored */ }
  lastRev.delete(runStorageKey(key));
}

export function formatSavedAt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}
