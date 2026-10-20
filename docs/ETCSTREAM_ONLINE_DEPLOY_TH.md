# ETCSTREAM Online V13

## โครงการและการรัน

- GitHub `thana2ut/etcstream`, Production `main`; ตรวจ actual origin และ fetch แล้ว ไม่มี divergence จากฐาน `5f50d39a45f1555c242e7bf7a29dcb5ba946cd58`
- Vercel `etcstream` ใน Thanawut, Hobby, Next.js, root `./` ใช้ project เดิม
- URL จริง https://etcstream.vercel.app; Production ฐานเดิม Ready: `dpl_6Q47MRg197EKya8eSLHKuM3R51RC` ไม่ใช่หลักฐานว่า V13 ผ่านแล้ว
- Supabase ที่เจ้าของยืนยันล่าสุด **etcstream / kppjvrhpnunuurwvjanj**, Tokyo แทน Candidate A `abtzrovcsomghbuwdmrr` ตามคำตอบ A/B ในแชต ไม่ใช่การเปลี่ยนชื่อหรือย้ายข้อมูล
- ไม่พบ `.env.local` ใน workspace ไม่สร้างหรือแก้ไฟล์ค่าจริง
- เจ้าของอนุมัติไฟล์ `supabase/migrations/20261020125254_real_online_v12.sql` แล้ว apply สำเร็จ `real_online_v12`, remote `20261020143741`
- ตรวจฐานก่อนรัน public ว่าง/Auth 0 ราย; หลังรัน 7 ตาราง etc_ เปิด RLS, anon เรียก etc_player ไม่ได้, authenticated เรียก etc_save_run ไม่ได้
- `supabase/migrations/20261020144218_cloud_ranked_v13.sql` เพิ่ม schema ฤดูกาล/catalog/RPC: **รออนุมัติและรัน** ห้ามแก้ migration ที่รันแล้ว

## Environment Variables

Vercel > etcstream > Settings > Environment Variables > Production: ชื่ออยู่ Key ค่าอยู่ Value ห้ามกรอกคีย์ลับเป็นชื่อรายการ

| ชื่อ | วิธีตั้ง |
| --- | --- |
| ARENA_BACKEND | supabase |
| NEXT_PUBLIC_SUPABASE_URL | URL ของ kppjvrhpnunuurwvjanj |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | publishable key โครงการเดียวกัน กรอกโดยตรง |
| SUPABASE_SECRET_KEY | คีย์ใหม่กรอกโดยตรงแบบ Secret ยกเลิกคีย์ที่เคยแชร์ |
| ADMIN_PASSWORD_HASH | scrypt hash ใหม่จาก private terminal กรอกแบบ Secret |
| ADMIN_CREDENTIAL_ROTATED | 1 หลัง hash ใหม่บันทึกและรหัสเก่าเลิกใช้ |
| ARENA_PUBLIC_ORIGIN | https://etcstream.vercel.app |
| NEXT_PUBLIC_SITE_URL | https://etcstream.vercel.app |
| ARENA_DEMO_ENABLED | 0 |
| ARENA_VERIFIED_SLICE_ENABLED | 0 จนเจ้าของตรวจรับ xs-1 เอง |

ไม่ใช้ ADMIN_SESSION_SECRET เพราะสุ่ม token ต่อ session และเก็บ digest ใน DB; ไม่ใช้ SUPABASE_JWKS_URL หรือ ARENA_DB_PATH ใน cloud
ไม่มี elevated key ใน NEXT_PUBLIC ใด ๆ; env ใหม่ต้อง redeploy ค่า public ถูกใส่ client bundle ตอน build
ห้ามเปิดเผยค่าในรายงาน log screenshot หรือ Git ไม่มีการนำคีย์ที่ส่งในแชตไปใช้

## Auth / Presence / Friends

Supabase Auth SSR สร้าง UUID หลังชื่อเล่น กู้บัญชีจากชื่อหรือ friend code ไม่ได้
เปิด anonymous sign-ins ในโครงการเดิม; ตั้ง Site URL/redirects เป็น Production จริงและ localhost:3000 แล้ว
ผู้เล่นควรผูกอีเมลก่อนพึ่งสถิติข้ามเครื่อง บัญชีไม่ผูกอีเมลอาจหายเมื่อออกจากระบบ/ล้างข้อมูล
ต้องให้แม่แบบ Magic Link/Change Email มี `{{ .Token }}` เพื่อกรอก OTP และตั้ง SMTP/ข้อจำกัดอีเมลฟรีให้เหมาะสม ยังไม่ทดสอบส่งจริง
UI ยังไม่มี CAPTCHA เชื่อมกับ Auth; ใช้ rate limits ของบริการและ RPC ต้องเพิ่ม CAPTCHA ก่อนเปิดวงกว้าง
opt-in profile/presence/rank แยกกัน เริ่มต้นปิด UUID เดียวหลายแท็บนับคนเดียว heartbeat หมดอายุ 90 วินาที
Realtime private ใช้แจ้งโหลดข้อมูลใหม่ ไม่เชื่อ payload เป็นตัวตน/คะแนน fallback ทุก 30 วินาทีเมื่อแท็บแสดง รายชื่อสูงสุด 100
ขอ/รับ/ปิดกั้นเพื่อนผ่าน transaction, unique canonical pair และบล็อกข้อมูลที่ไม่ยินยอม

## หลักฐาน / อันดับ / ฤดูกาล

ใช้เกม 3D และ 25 scenario เดิม server seed/start/countdown/deadline/UUID idempotency และ revision lock
คำนวณด้วย evaluator จริง แล้วคำนวณซ้ำจาก ledger ตอนจบ อ่านหลายหน้าเพื่อไม่ตกหล่นเกิน 1000 commands ตรวจ seq/เวลารับ/penalty/mistakes/graph
ไม่รับ elapsed/finished/คะแนนจาก browser เป็น official V13 certifier เป็น service-only ตรวจ catalog และ proof
xs-1 เตรียมรับรองได้เมื่อเจ้าของเปิด ARENA_VERIFIED_SLICE_ENABLED หลังตรวจรับ อีก 24 ด่านยัง UNDER_REVIEW/REJECTED/DNF ไม่มีอันดับ
หลักฐานนี้รับรองกติกาแบบจำลอง ไม่พิสูจน์ว่าเป็นมนุษย์หรือการเคลื่อนเมาส์ ด่านที่จำลองเวลา/มี design issues ต้องตรวจเพิ่มก่อนเปิดรับรอง
rank เฉพาะ VERIFIED ไม่ invalid และยินยอม public/rank_public ไม่ hidden/suspended เสมอเรียง total,penalty,elapsed,verified_at,id
มี global/me/friends/nearby/weekly รายด่าน และ stage versions ฤดูกาล best/latest/summary 25 ด่านตามข้อมูลจริง
ฤดูกาล cultivation-v1 ให้ round(1000*(cohort-rank+1)/cohort) ต่อด่าน นับ best 5 ด่านต่างกัน สูงสุด 5000
เสมอใช้ score ลง/จำนวนด่านลง/เวลารับรองขึ้น/UUID ขึ้น ต่ำกว่า 3 ผู้เล่นหรือ 3 ด่านเป็น provisional
Admin สร้าง/เปิด/ปิด/เก็บฤดูกาลพร้อมเหตุผลและยืนยัน ID ไม่ seed ฤดูกาล ปิดเก็บ snapshot; invalidate คำนวณ snapshot ใหม่จาก runs
Snapshot เป็น derived data คำนวณใหม่ได้ ไม่ลบประวัติรอบจริง
**1v1 ยังไม่ implemented** UI ปิด ไม่มีการอ้างว่าห้อง/start/settlement ทำงาน

## Admin / ข้อมูลเดิม / Free Tier

/admin ประตูเดียว สามแผงเดิม session เดียว ไม่มี Competition password เพิ่ม
scrypt เฉพาะ server ต้อง ADMIN_CREDENTIAL_ROTATED=1 ไม่มีรหัสเก่า fallback ใน cloud
cookie HttpOnly/Secure/SameSite Strict อายุ 8 ชั่วโมง token digest + credential digest ทำให้ hash รุ่นเก่าใช้ไม่ได้
fresh entry reset, rate limit, preview แยกไม่ส่งคะแนนจริง ไม่ทดสอบรหัสผ่านแทนเจ้าของ
ไม่เปลี่ยน 3D/theme/25 missions/mission hall/free practice/local progress ไม่ import คะแนน local เป็น official
ยังต้องกำหนด retention ledger/budget/abandoned runs ก่อนเปิดวงกว้าง ไม่มี auto-delete ผู้เล่น
ไม่อัปเกรดแผนหรือเปิด spending; free email/DB/Realtime/Vercel quota ต้องเจ้าของติดตาม
หากต้องคืนโค้ดใช้ commit ที่ตรวจแล้ว ไม่ drop ตาราง/แก้ migration ที่รันแล้ว หากมีข้อมูลจริงให้สำรองก่อน corrective migration

## Owner acceptance (เขียนไว้ ไม่ดำเนินการแทน)

1. เปิด Production สองเครื่องต่างเครือข่าย สมัครคนละ UUID ชื่อไทย opt-in และตรวจหลายแท็บไม่เพิ่มคน
2. ผูกอีเมล ยืนยัน OTP กู้ข้ามเครื่อง refresh แล้วเป็นบัญชีเดิม
3. ขอ/รับเพื่อน block/unblock ตรวจข้อมูลที่ไม่ยินยอมและผู้ไม่ใช่เพื่อน
4. เล่น xs-1 ต่ออุปกรณ์จริง ตรวจ ledger/ผลรอตรวจ ก่อนเปิดสวิตช์รับรองแล้ว redeploy; อีก 24 ด่านต้องไม่ขึ้นอันดับจนรับรองได้
5. ตรวจ global/mine/friends/nearby/25-stage best/latest และอันดับเดียวกันข้ามเครื่อง
6. สร้างฤดูกาลใน Admin ตรวจ distinct stages/คะแนน/ปิด snapshot/invalidation; 1v1 ยังปิด
7. /admin เข้าจากภายนอกต้องถามใหม่ สลับสามแผงไม่ถามซ้ำ preview เตรียมสายและไม่ส่งคะแนน ผู้เล่นทั่วไปยังเลือกสาย
8. ตรวจ assets บนมือถือ/Desktop และ quota ไม่มี automated gameplay/browser playtest โดย Codex

TypeScript static check และ npm run lint ผ่านในรอบพัฒนา ไม่ใช่ผลตรวจ gameplay; git diff --check ผ่าน มีเพียง warning LF/CRLF ปกติบน Windows
Build รุ่นนี้รอ configuration ครบแล้วใช้ Vercel platform รายงาน deployment แยกจาก owner acceptance
ห้ามใช้ supabase db push แบบไม่เทียบประวัติ: timestamp ไฟล์ V12 ที่เจ้าของตรวจต่างจาก remote version ที่ MCP จัดให้ ต้อง reconcile migration metadata ด้วยขั้นตอนที่เจ้าของตรวจ ไม่รัน SQL ซ้ำ
