# สเปกโมเดล 3D: URSA Broadcast G2

`bmd-ursa-broadcast-g2` · ใช้ในด่าน SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/blackmagicursabroadcast/techspecs/physical-specifications/blackmagic-ursa-broadcast-g2-imperial-xl.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/blackmagicursabroadcast/techspecs/connections/blackmagic-ursa-broadcast-g2@2x.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 5.9 in ≈ 150 mm · ยาว 10.95 in ≈ 278 mm · สูง 9.93 in ≈ 252 mm
- **น้ำหนัก:** 7.83 lb ≈ 3.55 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
กล้องแบกไหล่ มีมือจับด้านบน แผ่นรองไหล่ และเลนส์ในรูปติดป้าย 4K BROADCAST

## ตำแหน่งหัวต่อ
- **ด้านหลัง:** Headphone, 12G SDI Out, 12G SDI In, Ref In/Timecode In, +12V Power Input (XLR 4 ขา), USB-C, แผ่น V-Lock
- **ด้านขวา:** 3G SDI Out, +12V Power Output, LANC, Broadcast Lens connector
- **ด้านบน:** XLR Audio In ×2

## ปุ่ม จอ และป้าย
- **ด้านซ้าย:** ND, Auto WB, ปุ่ม function, Record, HFR, จอสถานะ LCD, ปุ่ม transport, ปุ่มหมุนระดับเสียง

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-out (12G SDI Out หลัง), sdi-mon (3G SDI Out ขวา), sdi-ret (12G SDI In), xlr-1/2
- **ในรูปแต่ไม่มีในซิม:** REF/TC, USB-C, LANC, หูฟัง

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
ด้านหลังใช้ติด Camera Fiber Converter (V-Lock + Molex)

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
