# สเปกโมเดล 3D: Studio Fiber Converter

`bmd-studio-fiber-converter` · ใช้ในด่าน SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-studio-fiber-converter-imperial-md.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/connections/blackmagic-studio-fiber-converter.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 8.28 in ≈ 210 mm · สูง 3.48 in ≈ 88 mm · ลึก 14.64 in ≈ 372 mm
- **น้ำหนัก:** 6.17 lb ≈ 2.80 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
กล่องตั้งโต๊ะ หน้าเครื่องมีสวิตช์ไฟ หัว SMPTE fiber พร้อมฝาปิด และจอ LCD

## ตำแหน่งหัวต่อ
- **ด้านหลัง:** AC IN, INTERCOM/TALLY (DB-25), PTZ (DB-9), OPTICAL I/O (SFP, ไม่บังคับ), ETHERNET, 12G DIGITAL I/O: OUT ×2 (บน) และ RETURN IN 1–3 (ล่าง), REF OUT/IN, AUDIO ANALOG OUT 1–4 (XLR)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** Power, SMPTE Hybrid Fiber, USB-C, จอ LCD, MENU, SET, ▲▼

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** fiber (หน้า), sdi-out, sdi-out-2 (12G OUT ×2)
- **ในรูปแต่ไม่มีในซิม:** RETURN IN, AUDIO OUT, INTERCOM, PTZ, REF, Ethernet

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
เสียบ fiber ที่หน้าเครื่อง และต่อ SDI OUT ไปเข้า Videohub

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
