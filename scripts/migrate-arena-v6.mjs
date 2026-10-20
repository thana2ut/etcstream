// OWNER ONLY: review SQL and create a consistent backup before invoking this script.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
const file = resolve(process.env.ARENA_DB_PATH || ".arena/arena.sqlite");
const withinPublic = relative(resolve("public"), file);
if (!withinPublic.startsWith("..") && !withinPublic.includes(":")) throw Error("ห้ามใช้ฐานข้อมูลในโฟลเดอร์ public");
if (!existsSync(file)) throw Error("ไม่พบฐานข้อมูลเดิม กรุณาตั้งค่าระบบเดิมก่อน");
if (!process.argv.includes("--owner-reviewed-and-backed-up")) throw Error("ต้องตรวจ SQL สำรองฐานข้อมูล และหยุดตัวเขียนก่อน จากนั้นจึงยืนยันด้วย --owner-reviewed-and-backed-up");
const db = new DatabaseSync(file);
try {
  db.exec("PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; BEGIN IMMEDIATE;");
  const current = Number(db.prepare("SELECT MAX(version) AS v FROM schema_version").get().v);
  if (current !== 1) throw Error("สคริปต์นี้ใช้กับ schema เวอร์ชัน 1 เท่านั้น ไม่แก้ฐานข้อมูลรุ่นอื่น");
  db.exec(readFileSync(new URL("../server/arena/migrations/002-online-ranked.sql", import.meta.url), "utf8"));
  db.exec("COMMIT");
  console.log("เพิ่มโครงสร้าง V6 แล้ว ไม่มีการสร้างผู้เล่น คะแนน หรือฤดูกาลจำลอง");
} catch (e) { db.exec("ROLLBACK"); throw e; } finally { db.close(); }
