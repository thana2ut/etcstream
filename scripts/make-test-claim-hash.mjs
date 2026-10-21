// OWNER ONLY. Writes the scrypt hash for the admin1-admin3 test code to .arena/test-claim.hash
// so it can be piped into Vercel without copy/paste. Usage: node scripts/make-test-claim-hash.mjs <code>
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
const code = process.argv[2];
if (!code || code.length < 6) { console.error("ใส่รหัสอย่างน้อย 6 ตัวอักษรต่อท้ายคำสั่ง"); process.exit(1); }
const salt = randomBytes(24).toString("hex");
const hash = `scrypt$${salt}$${scryptSync(code, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
mkdirSync(".arena", { recursive: true });
writeFileSync(".arena/test-claim.hash", hash);
console.log(`เขียน hash แล้ว: .arena/test-claim.hash (รหัสยาว ${code.length} ตัว)`);
