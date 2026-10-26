import "server-only";
import { adminEntry, openEntry, closeEntry } from "./admin-entry";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { one, run, ArenaError, limit, type Row } from "./db";
import { boundedBody } from "@/server/security/request-body";
import { checkJsonShape } from "@/server/security/json-shape";

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
  // First Vercel deployment: use only platform-owned URL metadata, never forwarded Host headers.
  const platformHost = process.env.VERCEL === "1"
    ? process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL
    : undefined;
  const configured = process.env.ARENA_PUBLIC_ORIGIN || (platformHost ? `https://${platformHost}` : undefined);
  if(process.env.NODE_ENV==="production" && !configured) throw new ArenaError(503,"เจ้าของระบบยังไม่ได้กำหนดที่อยู่เว็บไซต์สำหรับคำขอที่ปลอดภัย");
  let expected: string;
  try {
    const origin = new URL(configured || new URL(request.url).origin);
    if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash || (process.env.NODE_ENV === "production" && origin.protocol !== "https:")) throw Error();
    expected = origin.origin;
  } catch { throw new ArenaError(503,"ที่อยู่เว็บไซต์ยังตั้งค่าไม่ถูกต้อง กรุณาให้ผู้ดูแลตรวจ HTTPS และชื่อโดเมน"); }
  if (request.headers.get("origin") !== expected || request.headers.get("sec-fetch-site") === "cross-site") throw new ArenaError(403, "ไม่อนุญาตคำขอจากเว็บไซต์อื่น");
}
export async function input(request: Request) {
  checkOrigin(request);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ArenaError(415, "รูปแบบข้อมูลไม่ถูกต้อง");
  const bytes = await boundedBody(request, 262144);
  let value: unknown;
  try { value = JSON.parse(bytes.toString("utf8")); if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(); } catch { throw new ArenaError(400, "ข้อมูลคำขอไม่ถูกต้อง"); }
  checkJsonShape(value);
  return value as Record<string, unknown>;
}
export function loginLimit() {
  // Single-owner portal: persistent global budget cannot be evaded by spoofing proxy headers.
  limit("login-global", 8, 900000);
}
