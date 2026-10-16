# คืนข้อความภาษาไทย

วันที่ 16 ตุลาคม 2026 — เปลี่ยนเฉพาะภาษาและการแสดงผลข้อความ

## สิ่งที่แก้

- ชื่อและคำอธิบายภารกิจ 25 ด่าน ใบงาน ทีมงาน คำแนะนำ เกณฑ์ผ่าน รางวัล และคิวออกอากาศ
- เป้าหมายเฉพาะด่าน 135 รายการ รวมทั้งเป้าหมายร่วมและรายการความปลอดภัย
- บททบทวนและคำถาม 27 หัวข้อ รวมคำถามเฉพาะด่าน
- เมนูควบคุม ชื่ออุปกรณ์ จุดติดตั้ง การตั้งค่า คำอธิบายพอร์ต สถานะ และข้อความแจ้งเตือน
- รายการภารกิจหน้าเลือกด่านและคำอธิบายหน้าก่อนเริ่มเกม
- แยกข้อความไทยของตัวเลือกจากค่าภายใน เช่น แสดง “จัดกรอบภาพตามใบงานแล้ว” แต่ส่งค่า `Framed for assignment` เหมือนเดิม
- คงชื่อผลิตภัณฑ์ รหัสพอร์ต HDMI/SDI/XLR รูปแบบภาพ และรหัสภายในตามเดิม

## ไฟล์ที่แก้ในรอบนี้

- `app/play/page.tsx`
- `components/game/operator-console.tsx`
- `components/game/equipment-inspector.tsx`
- `components/ui/cable-lobby.tsx`
- `game/content/cable-catalog.ts`
- `game/content/mission-catalog.ts`
- `game/content/sim-equipment-info.ts`
- `game/rendering/scene-font.ts`
- `game/training/hdmi-training.ts`
- `game/training/monitor-feed.ts`
- `game/training/sim/engine.ts`
- `game/training/sim/equipment.ts`
- `game/training/sim/library.ts`
- `game/training/sim/rooms.ts`
- `game/training/sim/stages.ts`
- `game/training/venue-layouts.ts` — ข้อความตำแหน่งเท่านั้น
- `game/training/venue-scenarios.ts`
- `tests/production-sim.test.mjs`
- `tests/venue-scenarios.test.mjs`

## ไฟล์ใหม่

- `game/content/sim-thai.ts` — ชื่อแสดงผลไทย โดยไม่เปลี่ยนค่าจำลอง
- `docs/THAI_LANGUAGE_RESTORE.md` — รายงานนี้
- `art/review/thai-language/stadium-job-thai.png`
- `art/review/thai-language/stadium-controls-thai.png`

## การตรวจสอบ

- `npm run lint` ผ่าน
- `npm run build` ผ่าน รวม TypeScript และการสร้างหน้าทั้งหมด
- `git diff --check` ผ่าน มีเพียงคำเตือนรูปแบบขึ้นบรรทัด LF/CRLF ปกติบน Windows
- ทดสอบอัตโนมัติ 162/162 ผ่าน ไม่มีข้ามทดสอบ รวมการเล่นจบทั้ง 25 ด่านและการกู้เหตุขัดข้องระดับ 5
- ตรวจเทียบกับ HEAD: ชนิดและตำแหน่งพอร์ต ตัวเลือกและค่าเริ่มต้นอุปกรณ์ เส้นทางต่อสาย ค่าภารกิจ กฎเป้าหมาย ตำแหน่งห้อง และตัวระบุสัญญาณไม่เปลี่ยน
- เปิดสนามกีฬาจริง ตรวจใบงาน หน้าควบคุมอุปกรณ์ และตัวเลือกไทยพร้อมค่าภายในเดิม
- ไม่ปรับรูปทรงฉาก ทางเดิน แสง หรือระบบเล่นในรอบนี้
- ไม่เพิ่มแพ็กเกจ ไม่แก้ข้อมูลลับ ไม่ commit, push หรือ deploy

## ข้อจำกัดและขั้นตอนต่อไป

ชื่อรุ่นและชื่อที่สลักบนพอร์ตยังคงตามอุปกรณ์จริง การตรวจภาพรอบนี้ใช้สนามกีฬาเป็นตัวอย่าง ส่วนการตรวจเล่นครบทุกด่านใช้ชุดทดสอบอัตโนมัติ ต้ารีเฟรชเกมในเครื่องเพื่อตรวจข้อความได้เลย
