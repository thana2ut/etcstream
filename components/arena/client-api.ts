"use client";
import type { TrainingState } from "@/game/training/hdmi-training";
export async function api<T>(path: string, body?: unknown, admin = false, signal?: AbortSignal): Promise<T> {
  let response:Response;
  try {response=await fetch(`/api/${admin ? "admin" : "arena"}/${path}`, { method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store", signal, headers: body === undefined ? {} : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });}
  catch(e){if((e as Error).name==="AbortError")throw e;throw new Error("การเชื่อมต่อขัดข้อง กรุณาลองใหม่เมื่อเครือข่ายพร้อม");}
  let value;
  try{value=await response.json();}catch(e){if((e as Error).name==="AbortError")throw e;throw new Error("ระบบกลางตอบกลับไม่ครบ กรุณาลองเชื่อมต่อใหม่");}
  if (path === "logout" || (!admin && response.status === 401)) clearCache();
  if (!response.ok) {
    if (admin && (response.status === 401 || response.status === 403)) window.dispatchEvent(new Event("etc-admin-session-lost"));
    throw new Error(value.error || "เชื่อมต่อระบบไม่ได้");
  }
  return value as T;
}
export type PlayerView = { id?:string; name: string; friendCode: string; online: boolean; public: boolean; rankPublic?:boolean; presence: boolean; nameLocked: boolean };
export type AttemptView = { id: string; scenario: string; status: string; start: number | null; elapsedMs: number | null; penaltyMs: number; totalMs: number | null; graphValid: boolean; invalid: boolean; created: number; seed?: number; reason?: string; serverNow?: number;eventSeq?:number; protocol?:string; verificationEnabled?:boolean; commandSeq?:number; replay?:{ state:TrainingState; bag:Record<string,number>; seq:number; protocol:string }|null;seasonId?:string|null;verifiedAt?:number|null;validationVersion?:string|null };
export type Profile = { player: PlayerView; stats: { starts: number; finishes: number | null; verified: number | null; bestMs: number | null }; history: AttemptView[]; rules: Record<string, number>; duelEnabled: boolean };
export const timeText = (ms: number | null) => ms === null ? "—" : `${Math.floor(ms / 60000).toString().padStart(2, "0")}:${Math.floor(ms / 1000 % 60).toString().padStart(2, "0")}.${Math.floor(ms % 1000 / 10).toString().padStart(2, "0")}`;
export const statusText = (status: string) => ({ PENDING: "รอเตรียมพร้อม", RUNNING: "กำลังแข่งขัน", VERIFYING:"กำลังตรวจสอบ", UNDER_REVIEW: "รอตรวจ · ยังไม่จัดอันดับ", VERIFIED: "ยืนยันแล้ว", UNRANKED:"ผลไม่จัดอันดับ",PRACTICE:"ฝึกซ้อม",REJECTED:"ไม่ผ่านการรับรอง", DNF: "ยุติรอบ" }[status] || status);

/** Per-tab display cache so revisited/refreshed pages render instantly; always re-validated from the server. */
const CACHE_PREFIX = "etc-cache:";
export function readCache<T>(path: string): T | undefined {
  try { const raw = sessionStorage.getItem(CACHE_PREFIX + path); return raw ? JSON.parse(raw) as T : undefined; } catch { return undefined; }
}
export function writeCache(path: string, value: unknown) {
  try { sessionStorage.setItem(CACHE_PREFIX + path, JSON.stringify(value)); } catch {}
}
export function clearCache() {
  try { for (const k of Object.keys(sessionStorage)) if (k.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(k); } catch {}
}
