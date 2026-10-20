# สเปกโมเดล 3D: ATEM Television Studio HD8 ISO

`bmd-atem-television-studio-hd8-iso` · ใช้ในด่าน AU, OUT · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/atemtelevisionstudio/techspecs/physical-specifications/atem-television-studio-hd8-iso-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/atemtelevisionstudio/techspecs/connections/atem-television-studio-hd8-iso@2x.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 23 in ≈ 584 mm · ลึก 14.8 in ≈ 376 mm · สูง 6.35 in ≈ 161 mm
- **น้ำหนัก:** 14.9 lb ≈ 6.76 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
คอนโซลมีแผงจอ LCD และปุ่มยกสูงด้านหลัง (รูปด้านข้างแสดงแผงเอียง) มี T-bar ด้านขวา แถวปุ่มสี (แดง/เขียว/เหลือง) และ fader ด้านซ้าย

## ตำแหน่งหัวต่อ
- **ด้านหลัง (จากซ้ายไปขวา):** AC, 12–30V DC (XLR 4 ขา), REF OUT/IN, TIMECODE OUT/IN, MADI OUT/IN, USB A/B (USB-C), ETHERNET ×4, REMOTE, TALKBACK (RJ45), SDI OUTPUTS 1–8 (แถวบน), SDI INPUTS 1–8 (แถวล่าง), AUX 1/AUX 2, PROGRAM/MULTIVIEW (SDI), MULTIVIEW (HDMI), CONTROL OUT L/R, STUDIO OUT L/R (6.35 mm), STEREO IN L/R (RCA), ANALOG AUDIO IN CH1/CH2 (XLR), TALKBACK (XLR 5 ขา)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** แผงปุ่มสลับภาพ, T-bar, จอ LCD และปุ่มหมุน 4 ตัว

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in-1..8, ref-in, pgm-out, aux-1/2, mv-out, hdmi-mv, xlr-l/r (= CH1/CH2), usb-1/2, eth
- **ในรูปแต่ไม่มีในซิม (ต้องปั้นไว้ แต่เสียบไม่ได้):** SDI OUTPUTS 1–8, REF OUT, TIMECODE, MADI, REMOTE, TALKBACK, CONTROL/STUDIO OUT, STEREO IN, Ethernet อีก 3 ช่อง

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
แถวปุ่ม PGM/PVW, เมนู AUX 1/2, MULTIVIEW, ปุ่ม XLR ON

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
