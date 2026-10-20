# สเปกโมเดล 3D: SmartView Duo

`bmd-smartview-duo` · ใช้ในด่าน AU, OUT, SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/smartview/techspecs/physical-specifications/smartview-duo-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/smartview/techspecs/connections/smartview-duo.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 19 in ≈ 483 mm · ลึก 1.38 in ≈ 35 mm · สูง 5.24 in ≈ 133 mm
- **น้ำหนัก:** 3.15 lb ≈ 1.43 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
แผงติดแร็ค 19" สูง 3RU มีจอ 2 จอวางคู่กัน

## ตำแหน่งหัวต่อ
- **ด้านหลัง (จากซ้ายไปขวา):** MONITOR 2 SDI IN/OUT, TALLY (DB-9), ETHERNET IN/OUT, USB 2.0, +12V, MONITOR 1 SDI IN/OUT

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** จอ 2 จอ (รูปด้านหน้าไม่มีปุ่ม)

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in/sdi-loop (Monitor 1), sdi-in-b/sdi-loop-b (Monitor 2)
- **ในรูปแต่ไม่มีในซิม:** TALLY, ETHERNET, USB, +12V

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
จอแสดงภาพจากสัญญาณจริงในซิม

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
