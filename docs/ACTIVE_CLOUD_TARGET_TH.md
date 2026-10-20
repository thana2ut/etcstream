# เป้าหมาย cloud ล่าสุดที่เจ้าของยืนยัน

20 ตุลาคม 2026: เจ้าของยืนยันเปลี่ยนมาใช้ Supabase project **etcstream / kppjvrhpnunuurwvjanj**
การตัดสินใจนี้แทนข้อกำหนดก่อนหน้าที่ระบุ etcstream-online / abtzrovcsomghbuwdmrr ในเอกสารประวัติ
ไม่สร้าง project ใหม่ ไม่ย้ายหรือลบข้อมูลจากอีก project

- เว็บ Production build ผ่านแล้ว: https://etcstream.vercel.app
- Source ที่ build ผ่าน: 5f50d39 (แก้ .vercelignore ที่เคยตัด game/assets และ public/assets)
- ปรับ guard ของ Supabase และ CSP ใน working tree ให้ตรง project ใหม่แล้ว รอค่าตั้งส่วนตัวครบก่อน deploy รุ่นนี้
- ก่อนรันตรวจ public schema ว่างและ Auth 0 ราย; หลังเจ้าของอนุมัติ apply real_online_v12 สำเร็จ รุ่น remote 20261020143741 เปิด RLS ทั้ง 7 ตาราง
- Migration V13 เพิ่ม catalog/ฤดูกาล/อันดับอยู่ที่ 20261020144218_cloud_ranked_v13.sql รอเจ้าของอนุมัติ ไม่สร้างตารางตอนเริ่มแอป
- Secret ที่เคยส่งในแชตต้องยกเลิก เจ้าของสร้างใหม่และกรอกใน Vercel โดยตรง ไม่ส่งผ่านแชต/ไฟล์ source/Git
- เปิดฟอร์ม SUPABASE_SECRET_KEY ชนิด Secret เฉพาะ Production ให้เจ้าของกรอกและบันทึกเองแล้ว
- ตรวจพบชื่อ SUPABASE_SECRET_KEY บันทึกแล้ว โดยไม่เปิดค่า; รอ ADMIN_PASSWORD_HASH และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- ตั้ง ARENA_BACKEND/Project URL/ARENA_PUBLIC_ORIGIN/NEXT_PUBLIC_SITE_URL แบบ Config Production แล้ว
- เปิด anonymous sign-ins และตั้ง Supabase Auth Site URL/redirects เป็น Production จริงและ localhost แล้ว

ชื่อ env ที่แอปใช้จริง: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
ไม่ใช้ SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY หรือ SUPABASE_JWKS_URL เป็นชื่อทดแทนในแอปนี้
JWKS ไม่ต้องตั้งเอง: Supabase client จัดการกลไก Auth ตาม project URL

ไม่มี password/hash/key ใดถูกคัดลอกลงเอกสารนี้ ไม่ใช้คีย์ที่เปิดเผยเพื่อทดลองเรียกบริการ
