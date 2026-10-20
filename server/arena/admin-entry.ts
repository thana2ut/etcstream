import "server-only";
import { randomUUID } from "node:crypto";
import { ArenaError } from "./db";

// Short-lived process-local grants: restart fails closed; never a remembered browser privilege.
type Entry = { id: string; expires: number; preview: { id: string; scenarioId: string; expires: number; chamber: "training" | "missions" } | null };
const state = globalThis as typeof globalThis & { etcAdminEntries?: Map<string, Entry> };
const entries = state.etcAdminEntries ??= new Map<string, Entry>();
export function openEntry(key: string, expires: number) {
  for (const [k, entry] of entries) if (entry.expires <= Date.now()) entries.delete(k);
  if (entries.size >= 10000) throw new ArenaError(503, "ระบบผู้ดูแลมีคำขอมากเกินไป กรุณาลองใหม่");
  entries.set(key, { id: randomUUID(), expires, preview: null });
}
export function closeEntry(key: string) { entries.delete(key); }
export function adminEntry(key: string) {
  const entry = entries.get(key);
  if (!entry || entry.expires <= Date.now()) { entries.delete(key); throw new ArenaError(401, "กรุณากรอกรหัสหลักเพื่อเข้าตำหนักอีกครั้ง"); }
  return entry;
}
