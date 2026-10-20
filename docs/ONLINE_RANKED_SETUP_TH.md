# คู่มือตั้งค่าออนไลน์และอันดับ V9

สถานะ: **AWAITING_OWNER_CONFIGURATION — NOT TESTED**

Agent แก้ซอร์สเท่านั้น ไม่เปิดฐานข้อมูลจริง ไม่อ่านค่าลับ ไม่รัน migration/seed/test/lint/build/typecheck หรือ browser/gameplay จึงยังไม่ยืนยันว่าโฮสต์ปัจจุบันออนไลน์หรือมี schema รุ่นใด

## เทคโนโลยีและสาเหตุจากซอร์ส

ใช้ Next.js 16.3.6, React 19.2.8 และ SQLite ผ่าน Node `node:sqlite`/`DatabaseSync` ใน `server/arena/db.ts` ไม่ใช่ Prisma/PostgreSQL/Supabase ไม่ต้องเพิ่ม DATABASE_URL ให้ผิดระบบ ทุก browser เรียก Node instance เดียวและไฟล์ฐานข้อมูลส่วนตัวบน persistent disk เดียว

คำเตือน V6 เดิมมาจาก `requireOnlineSchema()` เมื่อ `MAX(schema_version)<2` ตรวจเพียงเลขเวอร์ชัน สคริปต์เดิมรับเฉพาะ version=1 และไม่ได้โหลด `.env.local` เอง จึงรันซ้ำไม่ได้และอาจชี้คนละ ARENA_DB_PATH กับ Next นี่เป็นข้อค้นพบจากซอร์ส ไม่ใช่การตรวจฐานข้อมูลจริงหรือการยืนยันจาก screenshot ซึ่งไม่มีไฟล์ภาพแนบในรอบนี้

V9 เพิ่ม contract ตาราง/คอลัมน์/index/trigger จริง แยก NOT_CONFIGURED, MIGRATION_REQUIRED, CONNECTIVITY_ERROR, READY และใช้สคริปต์อัปเกรดใหม่ที่โหลดการตั้งค่าทางเซิร์ฟเวอร์โดยไม่พิมพ์ค่า ไม่แก้ migration 002 เดิม ไม่สร้างฐานข้อมูลว่างแทนข้อมูลที่หาย และไม่ mark READY เอง

## Environment โดยเจ้าของ

แก้ผ่าน VS Code บนเซิร์ฟเวอร์หรือ environment ของผู้ให้บริการ ตัวอย่างนี้ไม่มีรหัสลับ:

```dotenv
ARENA_DB_PATH=D:/etcstream/.arena/arena.sqlite
ARENA_PUBLIC_ORIGIN=https://YOUR-ACTUAL-HOST.example
ARENA_DEMO_ENABLED=0
ARENA_VERIFIED_SLICE_ENABLED=0
```

แทน hostname ด้วย origin จริง ไม่มี path/slash ท้าย Production ต้อง HTTPS ตรงกับ browser origin ฐานข้อมูลต้องนอก public และอยู่บน disk ที่ไม่หายหลัง deploy/restart จำกัดสิทธิ์ด้วย Windows ACL/สิทธิ์ผู้ใช้เซิร์ฟเวอร์ ไม่ใส่รหัสหลัก/แข่งขันใน frontend หรือไฟล์ตัวอย่าง

ใช้ Node ที่มี `node:sqlite` และรองรับ Next รุ่นที่ติดตั้ง ไม่ใช่ Edge runtime ไม่ได้ตรวจ Node ของเครื่องจริงในรอบนี้ ค่ารหัสผู้ดูแลเดิมยังอยู่ใน hash ส่วนตัว ไม่ได้เปลี่ยนโดย agent

## อัปเกรดฐานข้อมูลเดิมอย่างปลอดภัย

ผลกระทบ: สร้าง backup ใหม่หนึ่งไฟล์ แล้วเพิ่มเฉพาะโครงสร้างที่ขาดใน transaction เดียว ไม่ลบผู้เล่น ผล เพื่อน หรือฤดูกาล ไม่มี demo player/score seed

1. อ่าน `server/arena/migrations/002-online-ranked.sql`, `003-authoritative-commands.sql`, `schema-contract.json` และ `scripts/setup-online-ranked.mjs` ก่อน
2. หยุด Next/worker ทุกตัวที่เขียนไฟล์ ตรวจ path ของ environment ให้ตรงกับแอปจริง
3. ใน PowerShell ตรวจโฟลเดอร์ก่อนแล้วรันเองทีละบรรทัด:

```powershell
Set-Location D:\etcstream
node scripts/setup-online-ranked.mjs --owner-reviewed-and-stopped-writers
```

สคริปต์อ่าน `.env.local` โดยไม่แสดงค่า ใช้ SQLite `VACUUM INTO` สร้างสำเนา consistent ข้างไฟล์จริงชื่อ `.before-v9-<เวลา>.sqlite` ก่อน BEGIN ไม่คัดลอกเฉพาะ main file ขณะมี WAL writer ตรวจคอลัมน์ก่อน ALTER ใช้ IF NOT EXISTS กับ object ที่มีแล้ว เพิ่ม V9 และตรวจ contract/foreign keys ก่อน COMMIT รันซ้ำไม่ duplicate ข้อมูล

ถ้าพบคู่เพื่อนสองทิศทางซ้ำ/ฐานโครงสร้างเดิมผิด/เวอร์ชันนอก 1–3 จะหยุดและ rollback ไม่ deduplicate, DROP หรือ reset ให้เอง เก็บไฟล์เดิมกับ backup ไว้ให้เจ้าของตรวจ corrective migration เพิ่ม

4. เปิดแอปใหม่ เข้า `/admin` → รหัสหลัก → ห้องแข่งขัน → รหัสแข่งขัน → ฐานข้อมูลและการตั้งค่า → โหลดใหม่
5. READY หมายถึงอ่านและพบโครงสร้าง ไม่ใช่ผลทดสอบการเขียน/เกม/อินเทอร์เน็ต ทำ manual checklist ต่อ

## ติดตั้งใหม่เฉพาะเมื่อไม่มีข้อมูลเดิมจริง

อ่าน schema.sql และ provision-arena.mjs ก่อน สคริปต์เก่าไม่ได้โหลด `.env.local` ให้ จึงตั้ง path ใน PowerShell ให้ตรงกัน:

```powershell
Set-Location D:\etcstream
$env:ARENA_DB_PATH = 'D:/etcstream/.arena/arena.sqlite'
node scripts/provision-arena.mjs
node scripts/setup-online-ranked.mjs --owner-reviewed-and-stopped-writers
```

รหัสตั้งต้นกรอกผ่านช่องปิดบังบนเครื่องเท่านั้น สคริปต์ปฏิเสธเมื่อมีฐานข้อมูลอยู่แล้ว ห้ามใช้ทับข้อมูลเดิม เข้าแอดมินครั้งแรกหมุนรหัสตามนโยบายเดิม ห้องแข่งขันยังต้องรหัสแยก V8 อ่าน provision-competition-code.mjs ก่อนตั้งค่าเอง Agent ไม่รันคำสั่งเหล่านี้

## สถานะวินิจฉัย

| สถานะ | ความหมาย |
|---|---|
| NOT_CONFIGURED | ไม่พบไฟล์ตาม runtime path ตรวจ path/storage หรือ provision ใหม่เฉพาะเมื่อไม่มีข้อมูลเก่า |
| MIGRATION_REQUIRED | version หรือตาราง/คอลัมน์/index/trigger ไม่ครบ ใช้รายการในแอดมินและขั้นตอนอัปเกรด |
| CONNECTIVITY_ERROR | เปิด/อ่านไม่ได้ ตรวจสิทธิ์ lock หรือ storage ไม่ใช้ DB ว่างแทน |
| READY | อ่านได้และโครงสร้างครบ ยังต้อง owner QA การเขียนและการเล่น |

Public เห็นข้อความบริการไม่พร้อม/โหลดไม่ได้ ค่าออนไลน์เป็น — ไม่แสดง path, SQL ดิบ หรือ secret รายละเอียดตั้งค่าต้องผ่านสองประตู Competition Admin เท่านั้น Retry เรียก API ใหม่จริง

## ตัวตนและความเป็นส่วนตัว

UUID/friend code/session ออกโดยเซิร์ฟเวอร์ Nickname ไม่ใช่สิทธิ์ ไม่รวมบัญชีด้วยชื่อซ้ำหรือ localStorage ชื่อใหม่ normalize NFC และเทียบอังกฤษ NOCASE พร้อมปฏิเสธชื่อซ้ำ ชื่อซ้ำเก่ารักษาตัวตนไว้ไม่ลบหรือรวมย้อนหลัง การย้ายเครื่องใช้ recovery credential สุ่ม แสดงครั้งเดียว เก็บ hash/expiry ใช้ครั้งเดียวและ revoke session เก่า ไม่ใช้ friend code เป็นรหัสเข้าบัญชี

Presence ใช้ heartbeat/หมดอายุ 90 วินาทีตามระบบเดิม เคารพ consent/hidden/suspended/blocked ตัวอย่างไม่อยู่ใน players/sessions/friends/attempts จึงไม่เพิ่มสถิติจริง

## ผลยืนยันและข้อจำกัด

Arena เริ่ม attempt ผูกเจ้าของ/stage/version/rules/seed/เวลาเซิร์ฟเวอร์ ตรวจ bag แบบ exact-match ก่อน ready เก็บคำสั่งต่อเนื่องแบบ append-only/hash chain และ state เซิร์ฟเวอร์ เมื่อ finish จะเริ่ม state ใหม่แล้วเล่นคำสั่งจากฐานข้อมูลซ้ำ ตรวจ hash/ลำดับ/เวลา/penalty และ signOff/validateLevel เดิม ไม่ใช้ client snapshot หรือเวลาที่ client ส่งเป็นหลักฐานยืนยัน

เปิดรับ VERIFIED เฉพาะ xs-1 ห้องเรียนระดับ 1 เมื่อไม่มี designIssues หลักฐานครบ และเจ้าของตรวจเองแล้วตั้ง ARENA_VERIFIED_SLICE_ENABLED=1 พร้อม restart ค่าเริ่มต้นปิด ไม่มี promote ผลเก่าย้อนหลัง อีก 24 ระดับยัง UNDER_REVIEW แม้เก็บคำสั่งได้ ต้องตรวจเงื่อนไขเฉพาะระดับ/เวลา stream-weather ที่เป็น simulation และนโยบายเพิ่มก่อนเปิด ไม่อ้างว่ารับรองครบ 25 แล้ว

นี่เป็นการตรวจคำสั่งและสภาวะ AV ไม่ใช่ anti-bot/พิสูจน์ตัวมนุษย์หรือระยะเดินจริง Floor 1 วินาทีและอย่างน้อย 2 คำสั่งเป็น sanity bound ไม่ใช่มาตรฐานเวลาวิชาชีพ เวลาอย่างเป็นทางการคือ server finish − start + versioned penalties เวลาเดินต่อเมื่อหลุด การส่งผลรอ outbox ส่งซ้ำเดิมได้ รีเฟรชรอบที่เริ่มแล้วดึง state/bag/seq เซิร์ฟเวอร์โดยไม่เริ่มเวลาใหม่

Admin preview V8 ไม่ส่งผลเข้ารอบและไม่เรียกช่องรับคำสั่ง Arena API เขียนแข่งขันปฏิเสธเมื่อมี admin session อยู่ ต้องออกแอดมินก่อนเล่นบัญชีปกติ

## อันดับและฤดูกาล

ต่อด่านใช้ VERIFIED ไม่ invalid มี timestamp/version และ total=elapsed+penalty ภายใต้เวอร์ชันด่าน/กติกาเดียวกัน เลือก best ต่อ UUID เรียง total, penalty, elapsed, verified_at, attempt ID มี Best/Latest/จำนวนผลยืนยัน/penalty/gap และอันดับของฉันแม้อยู่นอกหน้า 25 เพื่อนต้องตอบรับจริงและผ่าน privacy

คงฤดูกาล V1: อันดับ r จาก N คนได้ round(1000×(N−r+1)/N) รวมสูงสุดห้าด่านต่างกันที่คะแนนดีที่สุด สูงสุด 5000 ไม่สะสมผลซ้ำ Tie: จำนวนด่านยืนยันมากกว่า → เวลาได้ผลครบก่อน → UUID กลุ่มน้อย/ด่านไม่ครบแสดง provisional ปิดฤดูกาลแล้วเก็บ snapshot ไม่คำนวณอดีตใหม่ ไม่มีฤดูกาลหรือคะแนนจำลอง Duel ยังไม่ live ใช้การเปรียบเทียบ best ของสหายจริงที่ยินยอมได้

## DEMO แยกจริง

ต้นกล้า ฟ้าใส ธารา เมฆา ขวัญข้าว เป็น source ตัวอย่างแยก ID demo-thai-* ไม่มี account/time/rank/presence/result ไม่ seed ลง production players ผู้เล่นจริงที่เลือกชื่อเดียวกันยังมี UUID ของตนและไม่เกี่ยวกับ demo

เปิดได้เมื่อเจ้าของตั้ง ARENA_DEMO_ENABLED=1/restart และผ่าน Competition Admin → ตัวอย่างข้อมูล DEMO → เหตุผล/ยืนยัน DEMO ปิดจากแอดมินหรือ environment ได้ Ranked แสดงปุ่มตัวอย่างและกรอบป้ายแยก ไม่ผสมแถวอันดับจริง

## ให้คนอื่นเข้าระบบ

- หลาย browser ในเครื่องเดียว: ใช้ Node เดียวและแยก browser profile/cookie เพื่อสร้างคนละตัวตน ไม่พิมพ์ชื่อเพื่อยึดบัญชีเดิม
- LAN: เจ้าของเปิด app ให้รับ network interface/firewall ที่ตั้งใจ อุปกรณ์ใช้ IP เซิร์ฟเวอร์ ไม่ใช้ localhost ของตน กำหนด origin ตรง Dev HTTP เป็นแค่การตรวจในเครือข่ายส่วนตัว ไม่ใช่ production
- Internet: ต้องมี host Node + persistent writable disk + HTTPS hostname/reverse proxy + origin ตรงกัน ทุกคนเข้าฐานข้อมูลผ่าน API โดเมนเดียว โค้ดใช้ relative /api อยู่แล้ว ไม่ hardcode localhost ใน production
- ใช้หนึ่ง app instance กับ SQLite/WAL และ V8 process-local admin grants ไม่วางไฟล์บน network share เพื่อหลาย writer ไม่ใช้ multi-replica/ephemeral serverless โดยอ้างว่ารองรับแล้ว ต้องมี shared DB/grant store ในงานถัดไปหากเลือกสถาปัตยกรรมนั้น
- Netlify/serverless ที่ไม่มี persistent SQLite ตามข้อกำหนดไม่ใช่ hosting ที่รอบนี้รับรอง ไม่มีการซื้อบริการ deploy หรือเปิดอินเทอร์เน็ตโดย agent

ทำ ONLINE_RANKED_MANUAL_CHECKLIST_TH.md ด้วยตนเองหลังตั้งค่า ไม่มีผลทดสอบหรือคำยืนยันว่าออนไลน์จริงจาก agent
