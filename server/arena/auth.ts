import "server-only";
import { adminEntry, openEntry, closeEntry } from "./admin-entry";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { one, run, ArenaError, limit, type Row } from "./db";

export const cookieName = (role: string) => role === "admin" ? "etc_admin" : "etc_player";
export const digest = (text: string) => createHash("sha256").update(text).digest("hex");
export function passwordHash(secret: string) {
  const salt = randomBytes(24).toString("hex");
  return `scrypt$${salt}$${scryptSync(secret, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
}
export function passwordMatches(secret: string, stored: string) {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash || hash.length !== 128) return false;
  return timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(secret, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }));
}
export async function session(role: "player" | "admin"): Promise<Row | undefined> {
  const token = (await cookies()).get(cookieName(role))?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;
  const s = one("SELECT * FROM sessions WHERE token_hash=? AND role=? AND expires>?", digest(token), role, Date.now());
  if (!s) return;
  if (role === "admin") { try { adminEntry(digest(token)); } catch { return; } }
  const principal = role === "admin" ? one("SELECT id,rotate FROM admins WHERE id=? AND active=1", String(s.principal)) : one("SELECT * FROM players WHERE id=? AND deleted=0", String(s.principal));
  return principal ? { ...principal, sessionExpires: s.expires, ...(role === "admin" ? { entryKey: digest(token) } : {}) } : undefined;
}
export async function requireSession(role: "player" | "admin", allowRotation = false) {
  const p = await session(role);
  if (!p) throw new ArenaError(401, "กรุณาเข้าสู่ระบบก่อน");
  if (role === "admin" && p.rotate && !allowRotation) throw new ArenaError(403, "กรุณาเปลี่ยนรหัสผ่านตั้งต้นก่อนใช้งาน");
  if (p.suspended) throw new ArenaError(403, "บัญชีถูกระงับ กรุณาติดต่อผู้ดูแล");
  return p;
}
export async function issueSession(id: string, role: "player" | "admin") {
  const token = randomBytes(32).toString("hex"), age = role === "admin" ? 8 * 3600 : 30 * 86400;
  run("INSERT INTO sessions VALUES(?,?,?,?,?)", digest(token), id, role, Date.now() + age * 1000, Date.now());
  if (role === "admin") openEntry(digest(token), Date.now() + age * 1000);
  (await cookies()).set(cookieName(role), token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", ...(role === "player" ? { maxAge: age } : {}) });
}
export async function logout(role: "player" | "admin") {
  const jar = await cookies(), token = jar.get(cookieName(role))?.value;
  if (token) { run("DELETE FROM sessions WHERE token_hash=?", digest(token)); if (role === "admin") closeEntry(digest(token)); }
  jar.delete(cookieName(role));
}
export function checkOrigin(request: Request) {
  if(process.env.NODE_ENV==="production" && !process.env.ARENA_PUBLIC_ORIGIN) throw new ArenaError(503,"เจ้าของระบบยังไม่ได้กำหนดที่อยู่เว็บไซต์สำหรับคำขอที่ปลอดภัย");
  const expected = process.env.ARENA_PUBLIC_ORIGIN || new URL(request.url).origin;
  if(process.env.NODE_ENV==="production" && !expected.startsWith("https://")) throw new ArenaError(503,"ระบบออนไลน์จริงต้องตั้งค่า HTTPS ก่อน");
  if (request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") === "cross-site") throw new ArenaError(403, "ไม่อนุญาตคำขอจากเว็บไซต์อื่น");
}
export async function input(request: Request) {
  checkOrigin(request);
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ArenaError(415, "รูปแบบข้อมูลไม่ถูกต้อง");
  if (Number(request.headers.get("content-length") || 0) > 262144) throw new ArenaError(413, "ข้อมูลมีขนาดใหญ่เกินไป");
  const reader = request.body?.getReader(); let length = 0; const chunks: Uint8Array[] = [];
  if (!reader) throw new ArenaError(400, "ไม่พบข้อมูลคำขอ");
  while (true) { const next = await reader.read(); if (next.done) break; length += next.value.length; if (length > 262144) { await reader.cancel(); throw new ArenaError(413, "ข้อมูลมีขนาดใหญ่เกินไป"); } chunks.push(next.value); }
  try { const value = JSON.parse(Buffer.concat(chunks).toString("utf8")); if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(); return value as Record<string, unknown>; } catch { throw new ArenaError(400, "ข้อมูลคำขอไม่ถูกต้อง"); }
}
export function loginLimit() {
  // Single-owner portal: persistent global budget cannot be evaded by spoofing proxy headers.
  limit("login-global", 8, 900000);
}
