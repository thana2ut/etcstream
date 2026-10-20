// OWNER ONLY. Run interactively in PowerShell; never supply a password as an argument.
// Writes an ignored file once. Does not alter .env.local, Vercel, Supabase or SQLite.
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function masked(label) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw Error("ต้องรันใน PowerShell แบบโต้ตอบบนเครื่องเจ้าของ");
  process.stdout.write(label);
  process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolveValue, reject) => {
    let value = "";
    const finish = () => { process.stdin.off("data", receive); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); };
    const receive = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") { finish(); reject(Error("ยกเลิกแล้ว")); return; }
        if (char === "\r" || char === "\n") { finish(); resolveValue(value); return; }
        if (char === "\x7f" || char === "\b") value = value.slice(0,-1);
        else if (char >= " " && value.length < 128) value += char;
      }
    };
    process.stdin.on("data", receive);
  });
}
try {
  const secret = await masked("รหัสหลักใหม่ (ซ่อนตัวอักษร): ");
  const confirmation = await masked("ยืนยันรหัสหลักใหม่: ");
  if (secret !== confirmation || secret.length < 14 || !/[A-Za-z]/.test(secret) || !/[^A-Za-z]/.test(secret)) throw Error("รหัสใหม่ต้องตรงกัน ยาวอย่างน้อย 14 ตัวอักษร และผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์");
  const salt = randomBytes(24).toString("hex");
  const hash = `scrypt$${salt}$${scryptSync(secret,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString("hex")}`;
  mkdirSync(resolve(".arena"), { recursive: true });
  writeFileSync(resolve(".arena/cloud-admin.env"), `ADMIN_PASSWORD_HASH=${hash}\nADMIN_CREDENTIAL_ROTATED=1\n`, { flag: "wx", mode: 0o600 });
  console.log("สร้าง .arena/cloud-admin.env แล้ว เปิดอ่านส่วนตัวและคัดลอกค่าไป Vercel Settings > Environment Variables ห้ามอัปโหลดไฟล์หรือส่งค่าในแชต");
} catch (error) { console.error(error?.code === "EEXIST" ? "มีไฟล์ตั้งค่ารหัสอยู่แล้ว ไม่เขียนทับ กรุณาตรวจไฟล์เดิมอย่างปลอดภัย" : error.message); process.exitCode = 1; }
