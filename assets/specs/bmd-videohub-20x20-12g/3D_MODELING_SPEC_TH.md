# สเปกโมเดล 3D: Videohub 20x20 12G

`bmd-videohub-20x20-12g` · ใช้ในด่าน SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/blackmagicvideohub/techspecs/physical-specifications/blackmagic-videohub-20x20-12g-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/blackmagicvideohub/techspecs/connections/blackmagic-videohub-20x20-12g.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 19 in ≈ 483 mm · ลึก 9.3 in ≈ 236 mm · สูง 1.74 in ≈ 44 mm
- **น้ำหนัก:** 7.87 lb ≈ 3.57 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
ติดแร็ค 19" สูง 1RU หน้าเครื่องด้านซ้ายมีชื่อ "Videohub 20x20 12G"

## ตำแหน่งหัวต่อ
- **ด้านหลัง:** AC, ETHERNET, USB, REF IN/REF OUT, 12G-SDI IN 1–20 (บล็อกซ้าย 2 แถว), 12G-SDI OUT 1–20 (บล็อกขวา 2 แถว)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** ปุ่มป้าย/ตัวเลข 2 แถว, IN, OUT, CLEAR, TAKE, จอ LCD, ปุ่มหมุน, MENU, SET, LOCK

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** in-1..20, out-1..20
- **ในรูปแต่ไม่มีในซิม:** ETHERNET, USB, REF

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
เลือก OUT แล้วเลือก IN แล้วกด TAKE = crosspoint `xp-N`

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
