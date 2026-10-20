// OWNER ONLY. Run interactively in PowerShell; never supply a password as an argument.
// Writes one new ignored, owner-only file per run. Never marks Vercel rotation complete.
// Does not alter .env.local, Vercel, Supabase or SQLite.
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, openSync, writeFileSync, closeSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

async function masked(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw Error("ต้องรันใน PowerShell แบบโต้ตอบบนเครื่องเจ้าของ");
  process.stdout.write(label);
  process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolveValue, reject) => {
    let value = "", tooLong = false;
    const finish = () => { process.stdin.off("data", receive); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); };
    const receive = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") { finish(); reject(Error("ยกเลิกแล้ว")); return; }
        if (char === "\r" || char === "\n") { finish(); if (tooLong) reject(Error("รหัสยาวเกิน 128 ตัวอักษร กรุณารันใหม่")); else resolveValue(value); return; }
        if (char === "\x7f" || char === "\b") value = value.slice(0,-1);
        else if (char >= " ") { if (value.length < 128) value += char; else tooLong = true; }
      }
    };
    process.stdin.on("data", receive);
  });
}
try {
  console.log("ใช้รหัสใหม่ที่ไม่เคยส่งในแชต รหัสจะไม่แสดงบนหน้าจอหรือถูกบันทึกลงประวัติคำสั่ง");
  const secret = await masked("รหัสหลักใหม่ (ซ่อนตัวอักษร): ");
  const confirmation = await masked("ยืนยันรหัสหลักใหม่: ");
  if (secret !== confirmation || secret.length < 14 || !/[A-Za-z]/.test(secret) || !/[^A-Za-z]/.test(secret)) throw Error("รหัสใหม่ต้องตรงกัน ยาวอย่างน้อย 14 ตัวอักษร และผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์");
  const salt = randomBytes(24).toString("hex");
  const hash = `scrypt$${salt}$${scryptSync(secret,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString("hex")}`;
  mkdirSync(resolve(".arena"), { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "");
  const output = resolve(".arena", `cloud-admin-${stamp}-${randomBytes(4).toString("hex")}.env`);
  const descriptor = openSync(output, "wx", 0o600);
  try {
    // Windows ignores POSIX file modes. Restrict the empty file before writing the hash.
    if (process.platform === "win32") {
      const identity = execFileSync("whoami", [], { encoding: "utf8", windowsHide: true }).trim();
      if (!identity || /[\r\n]/.test(identity)) throw Error("ยืนยันสิทธิ์เจ้าของไฟล์ไม่ได้ ยังไม่บันทึก hash");
      try { execFileSync("icacls", [output, "/inheritance:r", "/grant:r", `${identity}:(F)`], { stdio: "pipe", windowsHide: true }); }
      catch { throw Error("จำกัดสิทธิ์ไฟล์ไม่ได้ ยังไม่บันทึก hash กรุณาใช้โฟลเดอร์บนไดรฟ์ NTFS ของเจ้าของ"); }
    }
    writeFileSync(descriptor, `ADMIN_PASSWORD_HASH=${hash}\n`, { encoding: "utf8" });
  } finally { closeSync(descriptor); }
  console.log(`สร้างไฟล์ส่วนตัวแล้ว: ${output}`);
  console.log("เปิดไฟล์นี้เป็นการส่วนตัว คัดลอกเฉพาะ hash ไป ADMIN_PASSWORD_HASH ใน Vercel Production และบันทึกให้สำเร็จก่อนตั้ง ADMIN_CREDENTIAL_ROTATED=1");
  console.log("ห้ามส่งรหัส/hash ในแชต ห้ามอัปโหลดไฟล์ และอย่าแก้ .env.local เพื่อขั้นตอนนี้");
} catch (error) { console.error(error?.code === "EEXIST" ? "ชื่อไฟล์ซ้ำ จึงไม่เขียนทับ กรุณารันใหม่" : error.message); process.exitCode = 1; }
