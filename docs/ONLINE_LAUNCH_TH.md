# ETCSTREAM V12 — สถานะการเปิดออนไลน์จริง

วันที่ 20 ตุลาคม 2026 · **NOT YET LIVE** · ยังไม่ผ่านการทดสอบการเล่นโดยเจ้าของ

## เป้าหมายที่ยืนยันแล้ว

- โค้ดปัจจุบัน: `D:\etcstream` · GitHub: https://github.com/thana2ut/etcstream
- แยกงานที่ `codex/real-online-launch-v12` โดยเก็บ main และ remote branches เดิม ไม่ force push
- Supabase เป้าหมายเดียว: `etcstream-online` / `abtzrovcsomghbuwdmrr` / https://abtzrovcsomghbuwdmrr.supabase.co
- ห้ามใช้โครงการ `etcstream` / `kppjvrhpnunuurwvjanj` แทน ตัวตรวจ configuration ฝั่งเซิร์ฟเวอร์ปฏิเสธ hostname อื่น
- ไม่สร้าง Supabase project ใหม่ ไม่แก้ `.env.local` ไม่รัน migration/seed ไม่ทดสอบเกม

## สถานะที่ตรวจได้จริง

ปลั๊กอิน Supabase ตอบว่าไม่มีสิทธิ์เข้า `abtzrovcsomghbuwdmrr` แม้ตรวจซ้ำหลังเจ้าของแจ้งเชื่อมต่อ
จึงยังตรวจ schema, migration history, Auth และ Realtime ของโครงการนี้ไม่ได้ และยังไม่มีการเปลี่ยนข้อมูลในฐานข้อมูลใด
บัญชี Dashboard ที่เปิดตรวจยังเข้าถึงโครงการเป้าหมายไม่ได้ ต้องเชื่อมบัญชี/Organization ที่เป็นเจ้าของโครงการให้ถูกต้อง

หน้า Vercel New Project เชื่อม GitHub thana2ut/etcstream แล้ว ตั้ง Next.js, root ./, Thanawut Hobby ถูกต้อง แต่ยังไม่ได้ deploy
ปลั๊กอิน Vercel ไม่มีสิทธิ์ scope thanawut (403) ขณะที่ Dashboard เจ้าของเข้าถึงหน้า Import ได้
ยังไม่มี deployment ID, build หรือ URL เกมจริง ห้ามใช้ชื่อโดเมนที่คาดเดาเป็นผลส่งมอบ

## โค้ดที่เพิ่มและขอบเขตจริง

| ระบบ | สถานะ source | สถานะออนไลน์จริง |
|---|---|---|
| ตัวตนและชื่อผู้เล่น | Supabase Auth แบบไม่ใช้อีเมล + profile RPC | รอสิทธิ์และ schema/config |
| รายชื่อออนไลน์ | consent + heartbeat TTL 90 วินาที, private Realtime เป็นสัญญาณให้เรียกข้อมูลใหม่ | รอ schema/Auth/Realtime |
| สหายและปิดกั้น | ส่ง/รับ/ปฏิเสธ/ยกเลิก/ลบสหาย/บล็อกผ่าน RPC แบบ atomic | ยังไม่ deploy/ไม่ทดสอบ |
| เกม 3D และ 25 ด่าน | ใช้ฉาก อุปกรณ์ กระเป๋า และกติกาเดิม | เก็บ source เดิม ไม่ทดสอบการเล่น |
| การจับเวลา | เวลาเริ่ม/จบจาก PostgreSQL, countdown 3 วินาที, รหัสรอบ idempotent | ยังไม่ deploy/ไม่ทดสอบ |
| การตรวจคำสั่ง | engine เดิมคำนวณคำสั่งฝั่ง server, revision ป้องกันเขียนทับพร้อมกัน | ยังไม่รับรองอันดับ |
| อันดับ 25 ด่าน/ตัวเอง/เพื่อน | เพิ่ม RPC อ่าน verified best จริง, scope โลก/ตัวเอง/เพื่อน/ใกล้ฉัน และกรอง consent/block/version | การรับรองผล **Blocked** ต้องทำ independent final replay และ eligibility ครบ |
| ฤดูกาล | สูตรเดิมอธิบายใน UI แต่ cloud ยังไม่เปิดฤดูกาล | **Blocked** ยังไม่มี season lifecycle cloud |
| 1v1 | แสดงยังไม่เปิดใช้งาน | **Blocked** ยังไม่มีวงจรห้อง/เริ่มพร้อมกัน/ตัดสินผล |
| ผู้ดูแล | gate เดียว `/admin`, hash ใหม่, session/grant ร่วมใน DB, preview 25 ด่านเดิม | รอ secrets/schema และเจ้าของตรวจ |
| ดูแลผู้เล่น | rename/clear/hide/suspend/restore แยกกัน + audit ใน transaction | hard delete ปิดไว้ |

ผลทุกด่านบน cloud จบเป็น UNDER_REVIEW/REJECTED/DNF เท่านั้น ไม่มี RPC เลื่อนเป็น VERIFIED
การรับคำสั่งไม่ได้พิสูจน์ว่าเป็นคนเล่นหรือเคลื่อนที่จริง และยังขาดการ replay ตรวจอิสระจาก ledger ตอน finalize
จึงห้ามนำผลเหล่านี้เข้าอันดับหรืออ้างว่าพร้อมแข่งจริง
สูตรฤดูกาลเดิม: ต่อด่านมี N คน อันดับ r ได้ round(1000 × (N − r + 1) / N), รวมสูงสุด 5 ด่านต่างกัน
สูตรนี้ยังไม่ถูกเปิดใช้บน cloud และห้ามคำนวณคะแนนจริงจาก localStorage

## ตั้งค่าอย่างปลอดภัย

1. เชื่อม Supabase plugin ด้วยบัญชีที่มี `etcstream-online` และตรวจ reference ให้ตรง ห้ามส่ง token ในแชต
2. อ่าน `supabase/README.md` และ SQL `20261020125254_real_online_v12.sql` สำรองฐานข้อมูล ตรวจ schema เดิม แล้วให้เจ้าของอนุมัติก่อนรัน
3. เปิด Anonymous sign-ins ใน Supabase Authentication ตามข้อจำกัดและมาตรการ CAPTCHA ของโครงการ
4. เปิดเฉพาะ RPC ที่ migration grant ให้ authenticated ตรวจ RLS/grants และ policy ของ private Realtime
5. ใน Vercel import repository ที่ยืนยันแล้ว ใช้ Next.js, root `.`, npm และ Node 22.x หรือ 24.x ไม่ใช้ SQLite ใน ephemeral filesystem
6. ตั้ง Environment Variables ใน **Project → Settings → Environment Variables** ส่วนตัว แยก Preview/Production ตามต้องการ:

| Variable | การใช้งาน |
|---|---|
| `ARENA_BACKEND` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL ของ abtzrovcsomghbuwdmrr เท่านั้น |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key ของโครงการเดียวกัน |
| `SUPABASE_SECRET_KEY` | server-only, ห้ามใช้ NEXT_PUBLIC_ |
| `ADMIN_PASSWORD_HASH` | scrypt hash ของรหัสใหม่ที่ไม่เคยแชร์ |
| `ADMIN_CREDENTIAL_ROTATED` | ตั้ง 1 หลังสร้างรหัสใหม่ |
| `ARENA_PUBLIC_ORIGIN` | origin HTTPS ที่ Vercel คืนจริง ไม่มี path หรือ slash ปิดท้าย |
| `NEXT_PUBLIC_SITE_URL` | origin จริงเดียวกัน |
| `ARENA_DEMO_ENABLED` | 0 |
| `ARENA_VERIFIED_SLICE_ENABLED` | 0, ไม่เปิด cloud ranking ด้วยค่านี้ |

7. สร้าง hash โดยเจ้าของใน PowerShell หลังตรวจว่าอยู่ `D:\etcstream`:

```powershell
node scripts/create-cloud-admin-hash.mjs
```

สคริปต์รับรหัสแบบซ่อนและสร้าง `.arena/cloud-admin-<ค่าที่ไม่ซ้ำ>.env` ใหม่ทุกครั้ง ไม่พิมพ์ค่า ไม่แก้ `.env.local`
เปิดอ่านไฟล์นี้เป็นการส่วนตัว คัดลอก hash ไป Vercel แล้วเก็บไฟล์ด้วยสิทธิ์เฉพาะเจ้าของ ห้าม commit/อัปโหลด/ส่งในแชต
รหัสใหม่อย่างน้อย 14 ตัวอักษร ผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์ การเปลี่ยน hash ยกเลิกสิทธิ์ session เก่า
ตั้ง `ADMIN_CREDENTIAL_ROTATED=1` หลังบันทึก hash ใหม่บน Vercel สำเร็จเท่านั้น ดู `ADMIN_CREDENTIAL_ROTATION_TH.md`

8. เมื่อมี URL จริง ตั้ง Supabase Auth Site URL และ redirect allowlist ให้ตรง เก็บ localhost เฉพาะที่ใช้ และอย่า allow wildcard preview โดยไม่จำเป็น
9. บัญชีไม่ใช้อีเมลจะกู้คืนไม่ได้เมื่อออก/ล้าง browser data/เปลี่ยนเครื่อง ต้องผูกอีเมลและยืนยันก่อนพึ่งพาประวัติถาวร
   หน้ากู้คืนใช้ OTP; ตั้งแม่แบบ Change Email และ Magic Link ให้แสดง `{{ .Token }}` และตั้ง SMTP/rate limits ให้เหมาะสม
10. Deploy แล้วอ่าน build log เท่านั้น การ build ผ่านไม่ใช่ผลทดสอบเกม

## ความเป็นส่วนตัวและการเก็บข้อมูล

ชื่อเล่นเป็นข้อมูลแสดงผล UUID จาก Auth เป็นตัวตน รหัสสหายไม่ใช่รหัสเข้าใช้งาน
เริ่มต้นไม่แสดงชื่อ/สถานะ/อันดับสาธารณะ ผู้เล่นเลือกเปิดในหน้าข้อมูลส่วนตัวได้
รายชื่อออนไลน์ใช้ consent, block และเวลาติดต่อเซิร์ฟเวอร์ล่าสุด ไม่ใช้ชื่อจาก broadcast เป็นหลักฐาน
ไม่มีการลบข้อมูลผู้เล่นเพื่อล้างชื่อ การซ่อน/ระงับ/ล้างชื่อแยกกันและมี audit
ยังไม่มี hard-delete endpoint หรือ cleanup job จึงต้องตกลงระยะเก็บบัญชี anonymous/command ledger ก่อนเปิดสาธารณะวงกว้าง
กำหนดเพดานคำสั่ง 5,000 ต่อรอบ รอบสูงสุด 4 ชั่วโมง และเริ่มไม่เกิน 8 รอบต่อชั่วโมงต่อบัญชี
ต้องติดตามขนาด DB, Realtime connections/messages และ egress จากโมเดล/รูป 3D ไม่เปิด paid overage อัตโนมัติ
Vercel Hobby เหมาะกับงานส่วนตัวที่ไม่เชิงพาณิชย์ ถ้าจะใช้เชิงพาณิชย์ต้องตรวจเงื่อนไขบัญชีก่อน โดยงานนี้ไม่ได้อัปเกรดแผน

## ตรวจรับโดยเจ้าของเท่านั้น — ยังไม่ได้ดำเนินการ

- [ ] เปิด URL HTTPS จริงจากสองเครื่องคนละเครือข่าย สร้างตัวตนและชื่อไทยคนละบัญชี
- [ ] เปิด consent ทั้งสองฝั่ง เห็นชื่อจริง ไม่มีผู้เล่นตัวอย่าง และหลายแท็บไม่นับเพิ่ม
- [ ] ปิดเบราว์เซอร์หนึ่งฝั่ง แล้วตรวจว่าสถานะหมดอายุภายใน 90 วินาที
- [ ] ส่ง/รับ/ปฏิเสธคำขอสหายและบล็อก ตรวจว่าผู้อื่นกดยอมรับแทนไม่ได้
- [ ] เล่นด่านจริง เลือกสายเอง บันทึกผล รีโหลดแล้วพบประวัติเดิม ผล UNDER_REVIEW ต้องไม่เข้าอันดับ
- [ ] เมื่อพัฒนา ranking eligibility เสร็จ ค่อยตรวจ best/โลก/ตัวเอง/เพื่อน/ใกล้อันดับ/25 ด่าน
- [ ] เมื่อพัฒนา 1v1 เสร็จ ค่อยตรวจ invite/ready/start/deadline/จบ/หลุดต่อใหม่/ตัดสินผล
- [ ] ผู้เล่นแก้คะแนน/สถานะรับรอง/ban flag ผ่าน Data API ไม่ได้
- [ ] ผู้เล่นทั่วไปเข้าข้อมูล admin ไม่ได้ เข้า `/admin` ใหม่ต้องกรอกรหัสหลัก และไม่มีประตู Competition ซ้ำ
- [ ] admin preview เติมเฉพาะสายที่ต้องใช้ ไม่สร้าง progress/คะแนน/อันดับผู้เล่น
- [ ] ตรวจอุปกรณ์ 3D และตัวอักษรไทยบน desktop/mobile ด้วยตนเอง

## ผลตรวจทางเทคนิค

- ไม่รัน npm run lint, npm run test, browser playtest หรือ local build ตามคำสั่งเจ้าของ
- `npx tsc --noEmit --incremental false`: ผ่านหลังแก้ชนิดข้อมูลที่ nullable
- `npm audit --omit=dev --json`: ไม่พบช่องโหว่ production หลัง Next 16.3.8 และ source-map-js patch
- ยังมี advisory ใน dependency ฝั่ง development ต้องพิจารณาแยก ห้ามใช้ audit fix --force
- ไม่ commit ฟอนต์ไบนารีใหม่ ใช้ `/fonts/scene-thai-latin.ttf` ที่มีใน Git อยู่แล้ว; ฟอนต์ใหม่ในเครื่องยังเก็บไว้
- เอกสารและภาพ QA ส่วนตัว/ไฟล์ดาวน์โหลด/ฐานข้อมูล/secret ไม่รวมในชุดอัปโหลด

## ข้อค้นพบเพิ่มเติมก่อน push

พบ browser admin hash เดิมในประวัติ remote branches เจ้าของยืนยันแล้วว่าสร้างรหัสใหม่และเลิกใช้รหัสเก่า
ตรวจเฉพาะรูปแบบ hash ใหม่และการถูกละเว้นจาก Git โดยไม่แสดงค่า การตั้งบน Vercel ยังต้องบันทึกส่วนตัวก่อนเปิด production
ดู `GITHUB_RECONCILIATION_TH.md` สำหรับ commits และ 23 จุดขัดแย้งจากการจำลอง merge แบบไม่แก้ working tree
ตัวตรวจ secret รุ่นแรกไม่ครอบคลุม hash ประเภทนี้; เพิ่ม guard แล้ว ไม่ถือว่ารายงาน no-match เดิมรับรองว่าประวัติปลอดภัย
