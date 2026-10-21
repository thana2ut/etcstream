# Phase 08 — การตรวจและข้อจำกัด

วันที่ 21 ตุลาคม 2026

ผู้ใช้สั่ง **ห้ามทดสอบใด ๆ** ในข้อความท้ายคำขอ จึงเพิ่มชุดตรวจอัตโนมัติไว้แต่ **ไม่ได้รัน** npm test, npm run lint, npm run build, TypeScript check หรือ browser playtest; ไม่มีตัวเลขผ่าน/ล้มเหลวที่จะอ้างได้

ไฟล์ชุดตรวจใหม่: tests/phase08-cable-selection.test.mjs ครอบคลุม 25 กราฟ แคตตาล็อกกายภาพ ตัวลวง จำนวนที่ขาด/เกิน Admin และ Free Practice

การแก้ไม่เปลี่ยนรหัส mission, hardware, port, stage.solution, scenario.canonical, equipment union, save schema, Supabase หรือข้อมูลผู้เล่น

ข้อจำกัด: ไม่มีการรับรองผลรันอัตโนมัติหรือผลเล่นจริงจนกว่าเจ้าของอนุญาตให้ตรวจ; ความถูกต้องของฮาร์ดแวร์ PENDING/GENERIC ยังคงตาม Phase 07

การเผยแพร่: Vercel production สร้างงานสำเร็จและรายงาน `READY` ที่ `https://etcstream.vercel.app`; ผลนี้เป็นสถานะ build/deploy ของผู้ให้บริการ ไม่ใช่ผล npm test, lint, TypeScript check หรือ browser playtest
