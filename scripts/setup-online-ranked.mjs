// OWNER REVIEW ONLY. Stop app writers first. Agent must not execute this file.
// Creates a consistent backup, repairs missing additive V6 objects, then installs V9. Never drops data.
import { DatabaseSync } from "node:sqlite";
import { existsSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
if (!process.argv.includes("--owner-reviewed-and-stopped-writers")) throw Error("อ่าน SQL/คู่มือและหยุดแอปก่อน แล้วใช้ --owner-reviewed-and-stopped-writers");
if (existsSync(".env.local")) { try { process.loadEnvFile(".env.local"); } catch { throw Error("อ่านไฟล์ตั้งค่าฝั่งเซิร์ฟเวอร์ไม่ได้ ยังไม่เปิดฐานข้อมูล"); } }
const file = resolve(process.env.ARENA_DB_PATH || ".arena/arena.sqlite");
const rel = relative(resolve("public"), file);
if (!rel.startsWith("..") && !rel.includes(":")) throw Error("ห้ามใช้ฐานข้อมูลใน public");
if (!existsSync(file)) throw Error("ไม่พบฐานข้อมูลเดิม ให้เจ้าของใช้ provision-arena.mjs ผ่านช่องรับรหัสแบบปิดบังก่อน ห้ามสร้างฐานข้อมูลว่างแทนข้อมูลจริง");
const database = new DatabaseSync(file);
let transaction = false;
try {
  database.exec("PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000");
  const version = Number(database.prepare("SELECT MAX(version) AS v FROM schema_version").get()?.v || 0);
  if (version < 1 || version > 3) throw Error("รุ่นฐานข้อมูลไม่อยู่ในช่วงที่รองรับ หยุดโดยไม่เปลี่ยนข้อมูล");
  const backup = file + ".before-v9-" + new Date().toISOString().replace(/[:.]/g,"-") + ".sqlite";
  database.prepare("VACUUM INTO ?").run(backup);
  console.log("สร้างสำเนาฐานข้อมูลก่อนเปลี่ยนโครงสร้างแล้ว เก็บสำเนานี้แบบส่วนตัว");
  database.exec("BEGIN IMMEDIATE"); transaction = true;
  // Interpret only this checked-in migration's one-statement-per-line format, not external SQL.
  const base = readFileSync(new URL("../server/arena/schema.sql",import.meta.url),"utf8");
  for (const line of base.split(/\r?\n/)) if (line.startsWith("CREATE TRIGGER ")) database.exec(line.replace("CREATE TRIGGER ","CREATE TRIGGER IF NOT EXISTS "));
  const sql = readFileSync(new URL("../server/arena/migrations/002-online-ranked.sql", import.meta.url), "utf8");
  for (let statement of sql.split(/\r?\n/).map((s)=>s.trim()).filter((s)=>s && !s.startsWith("--"))) {
    const add = statement.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/i);
    if (add && database.prepare(`PRAGMA table_info(${add[1]})`).all().some((c)=>c.name===add[2])) continue;
    statement = statement.replace(/^CREATE TABLE /i,"CREATE TABLE IF NOT EXISTS ").replace(/^CREATE UNIQUE INDEX /i,"CREATE UNIQUE INDEX IF NOT EXISTS ").replace(/^CREATE INDEX /i,"CREATE INDEX IF NOT EXISTS ").replace(/^CREATE TRIGGER /i,"CREATE TRIGGER IF NOT EXISTS ").replace(/^INSERT INTO schema_version/i,"INSERT OR IGNORE INTO schema_version");
    database.exec(statement);
  }
  database.exec(readFileSync(new URL("../server/arena/migrations/003-authoritative-commands.sql",import.meta.url),"utf8"));
  const contract = JSON.parse(readFileSync(new URL("../server/arena/schema-contract.json",import.meta.url),"utf8"));
  for (const [table, columns] of Object.entries(contract.columns)) {
    const actual = new Set(database.prepare(`PRAGMA table_info(${table})`).all().map((c)=>c.name));
    if (columns.some((c)=>!actual.has(c))) throw Error("โครงสร้างเดิมขาดคอลัมน์ที่ต้องใช้ ต้องตรวจ corrective migration โดยเจ้าของ ไม่ลบหรือสร้างทับข้อมูล");
  }
  const objects = new Set(database.prepare("SELECT name FROM sqlite_master").all().map((o)=>o.name));
  if (contract.objects.some((name)=>!objects.has(name))) throw Error("โครงสร้าง index/trigger ยังไม่ครบ ไม่ทำเครื่องหมายพร้อม");
  if (database.prepare("PRAGMA foreign_key_check").all().length) throw Error("พบความสัมพันธ์ข้อมูลเดิมไม่ครบ หยุดและ rollback ให้เจ้าของตรวจโดยไม่ลบข้อมูล");
  database.exec("COMMIT"); transaction = false;
  console.log("อัปเกรด/ซ่อมโครงสร้างแบบเพิ่มข้อมูลแล้ว ไม่มีการสร้างผู้เล่นหรือผลแข่งขัน ต้องเปิดแอปและทำ owner QA ต่อ");
} catch (error) {
  if (transaction) database.exec("ROLLBACK");
  console.error("อัปเกรดไม่สำเร็จ เก็บข้อมูลและสำเนาเดิมไว้ ตรวจโครงสร้าง/สิทธิ์ไฟล์หรือคู่เพื่อนซ้ำกับผู้ดูแลโดยไม่ reset ฐานข้อมูล");
  if (process.env.NODE_ENV !== "production") console.error(error instanceof Error ? error.name : "MigrationError");
  process.exitCode = 1;
} finally { database.close(); }
