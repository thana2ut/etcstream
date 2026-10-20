// OWNER-ONLY: review this file, then run interactively. Never pass secrets on the command line.
// Writes one private salted hash file; does not alter an existing credential or database row.
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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
function matches(secret, stored) {
  const [kind, salt, hash] = stored.split("$");
  return kind === "scrypt" && /^[a-f0-9]{128}$/.test(hash || "") && timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(secret, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }));
}
try {
  const file = resolve(process.env.ARENA_COMPETITION_CREDENTIAL_FILE || ".arena/competition-credential.json");
  const databaseFile = resolve(process.env.ARENA_DB_PATH || ".arena/arena.sqlite");
  for (const target of [file, databaseFile]) {
    const publicPath = relative(resolve("public"), target);
    if (!publicPath.startsWith("..") && !publicPath.includes(":")) throw Error("ต้องเก็บข้อมูลรับรองและฐานข้อมูลนอก public");
  }
  if (existsSync(file)) throw Error("มีข้อมูลรับรองแข่งขันอยู่แล้ว หยุดเพื่อเก็บรหัสเดิม ไม่เขียนทับ");
  if (!existsSync(databaseFile)) throw Error("ยังไม่มีฐานข้อมูลผู้ดูแลเดิม ต้องให้เจ้าของตั้งค่าระบบหลักก่อน");
  const database = new DatabaseSync(databaseFile, { readOnly: true });
  const admin = database.prepare("SELECT hash FROM admins WHERE active=1 LIMIT 1").get();
  database.close();
  let master = await masked("ยืนยันรหัสหลักปัจจุบัน (ซ่อน): ");
  if (!admin || !matches(master, String(admin.hash))) throw Error("ยืนยันรหัสหลักไม่สำเร็จ ยังไม่สร้างข้อมูลรับรอง");
  let secret = await masked("กำหนดรหัสห้องแข่งขันแยก (อย่างน้อย 14 ตัวอักษร ผสมตัวอักษรและตัวเลข/สัญลักษณ์): ");
  let confirm = await masked("ยืนยันรหัสห้องแข่งขัน: ");
  if (secret !== confirm || secret.length < 14 || !/[A-Za-z]/.test(secret) || !/[^A-Za-z]/.test(secret) || matches(secret, String(admin.hash))) throw Error("รหัสต้องตรงกัน แข็งแรง และต่างจากรหัสหลัก ยังไม่สร้างข้อมูลรับรอง");
  const salt = randomBytes(24).toString("hex");
  const hash = `scrypt$${salt}$${scryptSync(secret, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
  master = ""; secret = ""; confirm = "";
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify({ version: 1, hash }) + "\n", { flag: "wx", mode: 0o600 });
  console.log("สร้างข้อมูลรับรองห้องแข่งขันแยกแล้ว ไม่เปลี่ยนรหัสหลักหรือข้อมูลผู้เล่น กรุณาจำกัดสิทธิ์โฟลเดอร์ด้วย ACL ของ Windows");
} catch (e) { console.error(e instanceof Error ? e.message : "ตั้งค่ารหัสแยกไม่สำเร็จ"); process.exitCode = 1; }
