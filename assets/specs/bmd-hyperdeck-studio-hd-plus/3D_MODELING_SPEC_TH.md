# สเปกโมเดล 3D: HyperDeck Studio HD Plus

`bmd-hyperdeck-studio-hd-plus` · ใช้ในด่าน AU, SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/hyperdeckstudio/techspecs/physical-specifications/hyperdeck-studio-hd-plus-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/hyperdeckstudio/techspecs/connections/hyperdeck-studio-hd-plus.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 8.27 in ≈ 210 mm · ลึก 6.96 in ≈ 177 mm · สูง 1.74 in ≈ 44 mm
- **น้ำหนัก:** 2.53 lb ≈ 1.15 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
ครึ่งแร็ค สูง 1RU ด้านข้างมีช่องระบายลายรังผึ้ง

## ตำแหน่งหัวต่อ
- **ด้านหลัง (จากซ้ายไปขวา):** AC, DC 10–14V (XLR 4 ขา), REMOTE IN/OUT (RS-422 DB-9), ETHERNET, EXT DISK (USB-C), MONITOR OUT (3G-SDI), REF OUT/IN, TIMECODE OUT/IN, HDMI OUT/IN, SDI OUT A/B (บน), SDI IN, SDI LOOP OUT (ล่าง)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** ลำโพง, REM, หูฟัง, ช่อง SD ×2, SKIP, REC, SKIP, INPUT, REW, PLAY, F FWD, STOP, SEARCH, MENU, SET, จอ LCD, ปุ่มหมุน search

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in, sdi-out (A), sdi-out-2 (B), sdi-loop, sdi-mon, hdmi-in, hdmi-out, eth
- **ในรูปแต่ไม่มีในซิม:** REMOTE, REF, TIMECODE, EXT DISK, หูฟัง

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
ปุ่ม INPUT (มีในเครื่องจริง) = ตัวควบคุม `rec-input`, REC, PLAY, STOP, ช่อง SD = สื่อ

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
