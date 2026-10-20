# เป้าหมาย cloud ล่าสุดที่เจ้าของยืนยัน

20 ตุลาคม 2026 (V15): เจ้าของสั่งสร้าง Supabase project ใหม่ในองค์กร **etcstream** (`rtlpdlkmyryhfubfmynk`)
- Project: **etcstream / `unohixcxthiilnkmjunc`**, region `ap-northeast-1` (Tokyo), Free plan ($0)
- project เดิม `kppjvrhpnunuurwvjanj` และ `abtzrovcsomghbuwdmrr` ไม่ได้อยู่ในบัญชีที่เชื่อมต่อแล้ว ไม่ได้ลบหรือย้ายข้อมูลใด
- Migration ที่ apply แล้ว: `20261020152900_real_online_v12`, `20261020153000_cloud_ranked_v13`, `public_hall_demo_v16` (ไฟล์ `20261020170000_public_hall_demo_v16.sql`; เวอร์ชันใน DB ถูกกำหนดโดย Supabase ตอน apply)
- RLS เปิดทุกตาราง ไม่มี grant ให้ anon/authenticated ใช้ตารางตรง ผู้เล่นเข้าถึงผ่าน RPC แคบ ๆ เท่านั้น

ชื่อ env ที่แอปใช้จริง: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
ไม่มี password/hash/secret key ใดถูกคัดลอกลงเอกสารนี้

## Production (V15)
- Vercel project `thanawut/etcstream` เชื่อม GitHub `thana2ut/etcstream` branch `main` commit `992ff60`
- URL: https://etcstream.vercel.app
- `/api/arena/status` = READY, anon อ่าน/เขียนตารางตรงถูกปฏิเสธ (42501), `/api/admin/*` ไม่มี session = 401
- env (ชื่อเท่านั้น): ARENA_BACKEND, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, ADMIN_PASSWORD_HASH, ADMIN_CREDENTIAL_ROTATED, ARENA_PUBLIC_ORIGIN, NEXT_PUBLIC_SITE_URL
- ARENA_VERIFIED_SLICE_ENABLED ยังไม่ตั้ง (= ปิด) รอเจ้าของตรวจรับ xs-1

## V19 (21 ตุลาคม 2026)
- apply migration `celestial_economy_v19` บน `unohixcxthiilnkmjunc` แล้ว (เพิ่มอย่างเดียว) รายละเอียดใน `docs/ECONOMY_V19_TH.md`
- apply migration `proven_runs_only_v19b` แล้ว: ทำเนียบ/อันดับฤดูกาล/เวลาดีที่สุด/เทียบสหาย นับเฉพาะรอบที่ `validation_version='cloud-independent-replay-v1'` และมี evidence · แถว preview-seed 221 แถวยังเก็บไว้ครบ ไม่ถูกแก้หรือลบ
- Vercel env (ตรวจชื่อด้วย CLI 21 ต.ค.): ทุกตัวตั้งไว้เฉพาะ Production รวม `ARENA_VERIFIED_SLICE_ENABLED` (มีอยู่แล้ว ไม่ได้อ่านค่า) · Preview ไม่มี env ออนไลน์
- Vercel ยังไม่ได้ deploy production ด้วยโค้ด V19
