# ก่อน First Deployment — ETCSTREAM

ตรวจ 20 ตุลาคม 2026: GitHub main ยังอยู่ `05cbeed`; source ใหม่อยู่ local branch `codex/real-online-launch-v12`
Vercel New Project เชื่อม repository `thana2ut/etcstream` แล้ว แต่ยังเป็นหน้า Import ไม่ได้สร้าง deployment
Framework Next.js, root ./, workspace Thanawut Hobby ถูกต้อง หน้าฟอร์มยังไม่มี env ที่บันทึก
Vercel connector ไม่มีสิทธิ์ scope `thanawut` (403); ใช้หน้า Dashboard ที่เจ้าของเข้าสู่ระบบแล้วได้ แต่ไม่กรอก secret ผ่านแชต
Supabase connector ยังไม่มีสิทธิ์ `abtzrovcsomghbuwdmrr`; ไม่ได้เปลี่ยนฐานข้อมูลหรือใช้ project อื่นแทน

## Environment Variables ที่ต้องตั้ง

ก่อน deploy ตั้งเฉพาะ Production ในช่อง Environment Variables ของหน้า Import หรือหน้า Project Settings:

| ชื่อ | ค่าหรือวิธีตั้ง |
|---|---|
| ARENA_BACKEND | supabase |
| NEXT_PUBLIC_SUPABASE_URL | https://abtzrovcsomghbuwdmrr.supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | คัดลอก publishable key จาก project เป้าหมายโดยเจ้าของ |
| SUPABASE_SECRET_KEY | server-only Secret/Sensitive จาก project เป้าหมาย |
| ADMIN_PASSWORD_HASH | แฮชจากสคริปต์ที่เจ้าของกรอกรหัสใหม่แบบซ่อน; Secret/Sensitive |
| ADMIN_CREDENTIAL_ROTATED | 1 หลังบันทึก hash ใหม่สำเร็จ |
| ARENA_DEMO_ENABLED | 0 |
| ARENA_VERIFIED_SLICE_ENABLED | 0 |

ห้ามกรอก secret เป็น NEXT_PUBLIC_ และไม่ใช้ production secret ร่วมกับ Preview โดยไม่จำเป็น
ARENA_DB_PATH ไม่ใช้บน cloud

## URL ครั้งแรกโดยไม่เดาโดเมน

1. เปิดการใช้ System Environment Variables ของ Vercel
2. ครั้งแรกเว้น ARENA_PUBLIC_ORIGIN และ NEXT_PUBLIC_SITE_URL ได้ใน source ใหม่นี้:
   - ตัวตรวจ origin ฝั่ง server ใช้ https:// + VERCEL_PROJECT_PRODUCTION_URL ใน Production
   - ใช้ VERCEL_URL เฉพาะ Preview; ไม่เชื่อ Host หรือ X-Forwarded-Host จากคำขอ
   - ถ้าไม่มีค่าจาก platform จะปฏิเสธคำขอ ไม่ลดการตรวจ CSRF
   - NEXT_PUBLIC_SITE_URL ยังไม่มี code path ที่ต้องใช้ระหว่าง build นี้ จึงไม่ต้องใส่ placeholder
3. เมื่อ Vercel คืน Production URL จริงแล้ว ตั้ง ARENA_PUBLIC_ORIGIN และ NEXT_PUBLIC_SITE_URL เป็น origin จริงเดียวกัน ไม่มี path
4. ตั้ง Supabase Auth Site URL/redirect allowlist ให้ตรง actual URL แล้ว redeploy เพื่อใช้ค่าชุดใหม่
5. โดเมน .vercel.app ที่ platform คืนมาใช้ได้โดยไม่ซื้อโดเมน ไม่มีการซื้อ/เปิดแผนเสียเงินในงานนี้

อ้างอิง: https://vercel.com/docs/environment-variables/system-environment-variables

## ประตูที่ยังต้องผ่านก่อนเปิดจริง

- เจ้าของยืนยันเลิกใช้รหัสเก่าและใช้รหัสใหม่ที่ไม่เคยแชร์; ประวัติ hash เก่าไม่ถูก rewrite
- อัปโหลด source ใหม่อย่างปลอดภัย; main เก่าไม่ใช่ V12 และห้ามอ้างว่ารหัสเก่าถูกปิดใน main ปัจจุบัน
- ได้สิทธิ์ตรวจ Supabase เป้าหมาย สำรอง/ตรวจ schema และให้เจ้าของอนุมัติ migration ก่อนรัน
- ตั้ง secrets แบบส่วนตัวและยืนยันชื่อ env/Production เท่านั้น ไม่แสดงค่า
- build/deployment สำเร็จจริง จากนั้นเจ้าของทดสอบ login/Gameplay เอง
- ผล ranked ยังไม่รับรอง, ฤดูกาลและ 1v1 ยังไม่เปิด ตาม ONLINE_LAUNCH_TH.md
