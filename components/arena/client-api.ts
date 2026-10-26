"use client";
import type { TrainingState } from "@/game/training/hdmi-training";
export function apiErrorMessage(value: unknown, fallback = "เชื่อมต่อระบบไม่ได้"): string {
  if (typeof value === "string" && value.trim() && value !== "[object Object]") return value;
  if (value && typeof value === "object") {
    const error = value as { message?: unknown; error?: unknown };
    if (typeof error.message === "string") return apiErrorMessage(error.message, fallback);
    if (typeof error.error === "string") return apiErrorMessage(error.error, fallback);
    if (error.error && typeof error.error === "object" && error.error !== value) return apiErrorMessage((error.error as { message?: unknown }).message, fallback);
  }
  return fallback;
}
export async function api<T>(path: string, body?: unknown, admin = false, signal?: AbortSignal): Promise<T> {
  let response:Response;
  try {response=await fetch(`/api/${admin ? "admin" : "arena"}/${path}`, { method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store", signal, headers: body === undefined ? {} : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });}
  catch(e){if((e as Error).name==="AbortError")throw e;throw new Error("การเชื่อมต่อขัดข้อง กรุณาลองใหม่เมื่อเครือข่ายพร้อม");}
  let value;
  try{value=await response.json();}catch(e){if((e as Error).name==="AbortError")throw e;throw new Error("ระบบกลางตอบกลับไม่ครบ กรุณาลองเชื่อมต่อใหม่");}
  if (path === "logout" || (!admin && response.status === 401)) clearCache();
  if (!response.ok || value?.error) {
    if (admin && (response.status === 401 || response.status === 403)) window.dispatchEvent(new Event("etc-admin-session-lost"));
    throw new Error(apiErrorMessage(value?.error));
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

/** Keep the online profile name in step with the local trainee name. Resolves to an error message or "". */
export async function syncOnlineName(name: string): Promise<string> {
  try {
    const r = await fetch("/api/arena/profile", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (r.status === 401 || r.status === 503) return "";
    if (!r.ok) { const v = await r.json().catch(() => ({})); return String(v.error || "ยังเปลี่ยนชื่อออนไลน์ไม่ได้"); }
    clearCache();
    return "";
  } catch { return ""; }
}

/** Verify the owner code for a reserved name on the server (signs this browser into the owner profile). Resolves to an error message or "". */
export async function claimReservedName(name: string, code: string): Promise<string> {
  try {
    const r = await fetch("/api/arena/owner-claim", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, code }) });
    if (!r.ok) { const v = await r.json().catch(() => ({})); return String(v.error || "รหัสยืนยันไม่ถูกต้อง"); }
    clearCache();
    try { window.localStorage.setItem("etc-owner-name-verified", "1"); } catch { /* storage blocked */ }
    return "";
  } catch { return "เชื่อมต่อไม่ได้ กรุณาลองใหม่"; }
}
