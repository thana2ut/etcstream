import schemaContract from "./schema-contract.json";
import "server-only";
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { randomUUID } from "node:crypto";

export type Row = Record<string, string | number | null>;
export class ArenaError extends Error { constructor(public status: number, message: string, public code?: string) { super(message); } }
let connection: DatabaseSync | undefined;
export function db() {
  if (!connection) {
    // Runtime private data must not be traced or copied into the deployment bundle.
    const file = resolve(/* turbopackIgnore: true */ process.env.ARENA_DB_PATH || ".arena/arena.sqlite");
    const publicRelative = relative(resolve("public"), file);
    if (!publicRelative.startsWith("..") && !publicRelative.includes(":")) throw new ArenaError(503, "ห้ามวางฐานข้อมูลในโฟลเดอร์สาธารณะ");
    if (!existsSync(/* turbopackIgnore: true */ file)) throw new ArenaError(503, "ระบบออนไลน์ยังไม่พร้อมให้บริการ กรุณาติดต่อผู้ดูแล", "DB_NOT_CONFIGURED");
    const candidate = new DatabaseSync(file);
    try { candidate.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;"); }
    catch (error) { candidate.close(); throw error; }
    connection = candidate;
  }
  return connection;
}
export const one = (sql: string, ...args: (string | number | null)[]) => db().prepare(sql).get(...args) as Row | undefined;
export const all = (sql: string, ...args: (string | number | null)[]) => db().prepare(sql).all(...args) as Row[];
export const run = (sql: string, ...args: (string | number | null)[]) => db().prepare(sql).run(...args);
export type DatabaseState = "NOT_CONFIGURED" | "MIGRATION_REQUIRED" | "CONNECTIVITY_ERROR" | "READY";
const requiredColumns: Record<string, string[]> = schemaContract.columns;
export function databaseDiagnostic() {
  const missing: string[] = [];
  let schemaVersion = 0;
  try {
    const connection = db();
    connection.prepare("SELECT 1").get();
    const names = new Set((connection.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name));
    for (const [table, columns] of Object.entries(requiredColumns)) {
      if (!names.has(table)) { missing.push(table); continue; }
      const actual = new Set((connection.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((r) => r.name));
      for (const column of columns) if (!actual.has(column)) missing.push(`${table}.${column}`);
    }
    const objects = new Set((connection.prepare("SELECT name FROM sqlite_master").all() as { name: string }[]).map((r) => r.name));
    for (const name of schemaContract.objects) if (!objects.has(name)) missing.push(name);
    if (names.has("schema_version")) schemaVersion = Number(connection.prepare("SELECT MAX(version) AS v FROM schema_version").get()?.v || 0);
    const state: DatabaseState = schemaVersion >= 3 && !missing.length ? "READY" : "MIGRATION_REQUIRED";
    return { state, schemaVersion, requiredVersion: 3, missing, message: state === "READY" ? "เชื่อมต่อฐานข้อมูลร่วมและพบโครงสร้างที่ต้องใช้แล้ว" : "ต้องให้เจ้าของสำรองข้อมูลและใช้ขั้นตอนอัปเกรด V6/V9", action: state === "READY" ? null : "docs/online-arena/ONLINE_RANKED_SETUP_TH.md" };
  } catch (error) {
    const state: DatabaseState = error instanceof ArenaError && error.code === "DB_NOT_CONFIGURED" ? "NOT_CONFIGURED" : "CONNECTIVITY_ERROR";
    return { state, schemaVersion, requiredVersion: 3, missing, message: state === "NOT_CONFIGURED" ? "ยังไม่ได้ตั้งฐานข้อมูลส่วนกลางบนเซิร์ฟเวอร์" : "ไม่สามารถเชื่อมต่อหรืออ่านฐานข้อมูลออนไลน์ได้", action: "docs/online-arena/ONLINE_RANKED_SETUP_TH.md" };
  }
}
export function onlineSchemaReady() {
  const status = databaseDiagnostic();
  if (["NOT_CONFIGURED", "CONNECTIVITY_ERROR"].includes(status.state)) throw new ArenaError(503, "ไม่สามารถโหลดข้อมูลออนไลน์ได้", `DB_${status.state}`);
  return status.state === "READY";
}
export function requireOnlineSchema() {
  const status = databaseDiagnostic();
  if (status.state !== "READY") throw new ArenaError(503, status.state === "MIGRATION_REQUIRED" ? "ระบบอันดับออนไลน์อยู่ระหว่างเตรียมโครงสร้างข้อมูล กรุณาลองใหม่ภายหลัง" : "ไม่สามารถโหลดข้อมูลออนไลน์ได้", `DB_${status.state}`);
}
export function transaction<T>(fn: () => T): T {
  db().exec("BEGIN IMMEDIATE");
  try { const value = fn(); db().exec("COMMIT"); return value; } catch (e) { db().exec("ROLLBACK"); throw e; }
}
export function audit(actor: string, action: string, target: string, reason: string, metadata: unknown = {}) {
  run("INSERT INTO audit VALUES(?,?,?,?,?,?,?,?)", randomUUID(), actor, action, target, reason, JSON.stringify(metadata), Date.now(), randomUUID());
}
export function limit(key: string, max: number, windowMs = 60_000) {
  const now = Date.now();
  const row = one("SELECT * FROM limits WHERE key=?", key);
  if (!row || Number(row.until) < now) run("INSERT OR REPLACE INTO limits VALUES(?,1,?)", key, now + windowMs);
  else { if (Number(row.count) >= max) throw new ArenaError(429, "ทำรายการบ่อยเกินไป กรุณารอสักครู่"); run("UPDATE limits SET count=count+1 WHERE key=?", key); }
}

export function safeArenaError(error: unknown): ArenaError {
  if (error instanceof ArenaError) return error;
  const message = error instanceof Error ? error.message : "";
  if (message.includes("NAME_TAKEN")) return new ArenaError(409,"ชื่อนี้มีผู้ใช้แล้ว กรุณาเลือกชื่อที่ต่างออกไป ข้อมูลบัญชีเดิมไม่ถูกโอนหรือรวมกัน");
  if (/no such (table|column)/i.test(message)) return new ArenaError(503,"ระบบออนไลน์ต้องเตรียมโครงสร้างข้อมูลเพิ่มเติม กรุณาติดต่อผู้ดูแล", "DB_MIGRATION_REQUIRED");
  if (/SQLITE_BUSY|SQLITE_CANTOPEN|SQLITE_READONLY|SQLITE_IOERR|database is locked|readonly database|unable to open database/i.test(message)) return new ArenaError(503,"ไม่สามารถโหลดข้อมูลออนไลน์ได้ กรุณาลองใหม่ภายหลัง", "DB_CONNECTIVITY_ERROR");
  return new ArenaError(500,"ระบบข้อมูลออนไลน์ขัดข้อง กรุณาลองอีกครั้ง");
}
