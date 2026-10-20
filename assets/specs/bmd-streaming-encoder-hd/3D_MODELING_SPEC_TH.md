# สเปกโมเดล 3D: Streaming Encoder HD

`bmd-streaming-encoder-hd` · ใช้ในด่าน OUT, SP · สถานะ: **ผ่านด่าน 1–3 พร้อมทำโมเดล** (ยังไม่ได้เริ่มทำ)

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/blackmagicstreamingprocessors/techspecs/physical-specifications/blackmagic-streaming-encoder-hd-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/blackmagicstreamingprocessors/techspecs/connections/blackmagic-streaming-encoder-hd.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 5.51 in ≈ 140 mm · ลึก 6.9 in ≈ 175 mm · สูง 1.75 in ≈ 44 mm
- **น้ำหนัก:** 1.66 lb ≈ 0.75 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
กล่องเล็ก หน้าเครื่องมี USB-C ใต้ฝาปิด จอ LCD และปุ่มหมุน

## ตำแหน่งหัวต่อ
- **ด้านหลัง (จากซ้ายไปขวา):** AC, 12V DC (XLR 4 ขา), LIVE STREAM (Ethernet), WEBCAM OUT (USB-C), MONITOR OUT (HDMI), MONITOR OUT (SDI, บน), SDI LOOP OUT (บน), SDI IN (ล่างขวา)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** USB-C, ON AIR, OFF, CALL, MENU, SET, LOCK, จอ LCD, ปุ่มหมุน

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** sdi-in, sdi-loop, sdi-mon, hdmi-mon, eth, usb

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
ON AIR/OFF = ตัวควบคุม stream และเมนู stream key (ค่าทดสอบ)

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
