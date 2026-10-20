// Run locally in an interactive terminal AFTER reviewing server/arena/schema.sql.
// Never pass credentials as command arguments, environment variables, or shell history.
import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
function masked(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw Error("ต้องรันในเทอร์มินัลโต้ตอบบนเครื่องเจ้าของเท่านั้น");
  process.stdout.write(prompt);
  return new Promise((resolveSecret, reject) => {
    let value = ""; process.stdin.setRawMode(true); process.stdin.resume();
    const onData = (buffer) => {
      for (const ch of buffer.toString("utf8")) {
        if (ch === "\u0003") { cleanup(); reject(Error("ยกเลิกโดยเจ้าของ")); return; }
        if (ch === "\r" || ch === "\n") { cleanup(); resolveSecret(value); return; }
        if (ch === "\u007f" || ch === "\b") { if (value) { value = value.slice(0, -1); process.stdout.write("\b \b"); } }
        else if (ch >= " " && value.length < 128) { value += ch; process.stdout.write("*"); }
      }
    };
    function cleanup() { process.stdin.removeListener("data", onData); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); }
    process.stdin.on("data", onData);
  });
}
try {
  const file = resolve(process.env.ARENA_DB_PATH || ".arena/arena.sqlite");
  const publicRelative = relative(resolve("public"), file);
  if (!publicRelative.startsWith("..") && !publicRelative.includes(":")) throw Error("ห้ามสร้างฐานข้อมูลหรือข้อมูลรับรองในโฟลเดอร์ public");
  if (existsSync(file)) throw Error("พบฐานข้อมูลเดิม หยุดเพื่อป้องกันการเขียนทับ ใช้การเข้าสู่ระบบ/เปลี่ยนรหัสเดิม หรือขั้นตอนกู้คืนที่ตรวจสอบโดยเจ้าของ");
  let initial = await masked("กรอกรหัสผู้ดูแลตั้งต้นเดิม (ซ่อนตัวอักษร): ");
  let confirm = await masked("ยืนยันรหัสตั้งต้นเดิม: ");
  if (!/^\d{8,64}$/.test(initial) || initial !== confirm) throw Error("รหัสตั้งต้นและคำยืนยันไม่ตรงกันหรือรูปแบบไม่ถูกต้อง ยังไม่สร้างฐานข้อมูล");
  const salt = randomBytes(24).toString("hex");
  const hash = `scrypt$${salt}$${scryptSync(initial, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
  initial = ""; confirm = "";
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(file);
  database.exec("PRAGMA foreign_keys=ON; BEGIN IMMEDIATE");
  try {
    database.exec(readFileSync(new URL("../server/arena/schema.sql", import.meta.url), "utf8"));
    database.prepare("INSERT INTO admins(id,hash,rotate,active) VALUES(?,?,1,1)").run(randomUUID(), hash);
    database.exec("COMMIT");
  } catch (e) { database.exec("ROLLBACK"); throw e; }
  database.close();
  console.log("ตั้งค่าฐานข้อมูลใหม่สำเร็จ เปิด /admin และเปลี่ยนรหัสตั้งต้นทันทีตามหน้าจอ ไม่ต้องส่งรหัสผ่านในแชต");
} catch (e) { console.error(e instanceof Error ? e.message : "ตั้งค่าไม่สำเร็จ"); process.exitCode = 1; }
