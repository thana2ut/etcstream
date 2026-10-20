# สเปกโมเดล 3D: ATEM 2 M/E Constellation 4K

`bmd-atem-2me-constellation-4k` · ใช้ในด่าน SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/atemconstellation/techspecs/physical-specifications/atem-2me-constellation-4k-imperial-xl.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/atemconstellation/techspecs/connections/atem-2me-constellation-4k@2x.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 19 in ≈ 483 mm · ลึก 9.22 in ≈ 234 mm · สูง 1.74 in ≈ 44 mm
- **น้ำหนัก:** 8 lb ≈ 3.63 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
ติดแร็ค 19" สูง 1RU หน้าเครื่องด้านซ้ายมีโลโก้ 12G SDI

## ตำแหน่งหัวต่อ
- **ด้านหลัง:** AC, CONTROL (RJ45), USB-C, TALKBACK (RJ45), REF IN, SDI INPUTS 1–20 (2 แถว คี่บน คู่ล่าง), SDI OUTPUTS 1–12 (2 แถว), MULTIVIEW 1/2, ANALOG AUDIO IN CH1/CH2 (แจ็ก 6.35 mm)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** TALKBACK (XLR 5 ขา), PROD TALK, ENG TALK, CALL, PGM MIX, ▲▼, ปุ่มแหล่งภาพ 1–20, CUT, AUTO, KEY1 MIX, DSK1/2 MIX, FTB, BARS, BLACK, MP1/MP2, MIX, WIPE, DIP, DVE, จอ LCD, ปุ่มหมุน, MENU, SET, LOCK

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in-1..20, sdi-out-1..12, mv-out/mv-out-2, xlr-l/r (= CH1/CH2 แจ็ก TRS 6.35 mm)
- **ในรูปแต่ไม่มีในซิม:** CONTROL, TALKBACK, USB-C, REF IN

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
ปุ่มแหล่งภาพ 1–20 (PGM), CUT/AUTO, AUX

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
