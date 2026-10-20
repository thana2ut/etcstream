# สเปกโมเดล 3D: Camera Fiber Converter

`bmd-camera-fiber-converter` · ใช้ในด่าน SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-camera-fiber-converter-imperial-md.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/connections/blackmagic-camera-fiber-converter.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 5.43 in ≈ 138 mm · สูง 7.51 in ≈ 191 mm · ลึก 5.51 in ≈ 140 mm
- **น้ำหนัก:** 4.85 lb ≈ 2.20 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
ติดหลัง URSA ด้วยแผ่น V-Lock และมีสาย Molex สั้นไปที่กล้อง

## ตำแหน่งหัวต่อ
- **ด้านซ้าย:** SMPTE Hybrid Fiber, USB-C, 12G SDI In, 3G SDI Out, REF Out, Ethernet
- **ด้านขวา:** D-tap 12V Out, RET 1, RET 2, CALL, PTZ
- **ด้านหลัง:** Headset 1/2 (XLR 5 ขา), Tracker, DC Out, XLR Audio In ×2 (AES/EBU/Line/Mic, +48V), 3G SDI Return Out ×3

## ปุ่ม จอ และป้าย
- **แผงหลัง:** ไฟสถานะ POWER/TALLY/FIBER, RET 1/2 + สวิตช์, Intercom 1/2, LIGHT, FOCUS, REC, ปุ่มหมุน IRIS

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in (12G SDI In), fiber
- **ในรูปแต่ไม่มีในซิม:** หัวต่อที่เหลือทั้งหมด

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
เสียบสาย 12G สั้นจากกล้องเข้า SDI IN และเสียบสาย SMPTE fiber

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
