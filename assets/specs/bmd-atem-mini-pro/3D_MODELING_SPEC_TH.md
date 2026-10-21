# สเปกโมเดล 3D: ATEM Mini Pro

`bmd-atem-mini-pro` · ใช้ในด่าน XS · สถานะ: **ทำโมเดลแล้ว (Phase 04.1)** · ดู `docs/hardware-3d/16_ATEM_MINI_PRO_3D_IMPLEMENTATION_TH.md`

## แหล่งอ้างอิงทางการ (Blackmagic Design techspecs, ตรวจ 2026-10-20)
- **รูปขนาด:** https://images.blackmagicdesign.com/images/products/atemmini/techspecs/physical-specifications/atem-mini-pro-imperial.jpg
- **รูปหัวต่อ:** https://images.blackmagicdesign.com/images/products/atemmini/techspecs/connections/atem-mini-pro.png

## ขนาดและน้ำหนัก (อ่านจากรูปทางการ)
- **ขนาด:** กว้าง 9.35 in ≈ 237 mm · ลึก 4.07 in ≈ 103 mm · สูง 1.38 in ≈ 35 mm
- **น้ำหนัก:** 19.4 oz ≈ 0.550 kg
- ค่า mm แปลงจากนิ้ว (×25.4) แล้วปัดเศษ

## รูปทรงภายนอก
คอนโซลตั้งโต๊ะสีดำ หน้าเอียงลาด ด้านข้างมีช่องระบาย และมีโลโก้ Blackmagicdesign มุมขวาบน

## ตำแหน่งหัวต่อ
- **ด้านหลัง (จากซ้ายไปขวา):** POWER (DC แบบล็อก), ATEM CONTROL (Ethernet), USB OUT (USB-C), HDMI OUT, HDMI 4, 3, 2, 1, MIC 2, MIC 1 (3.5 mm)

## ปุ่ม จอ และป้าย
- **หน้าเครื่อง:** MIC 1/2 ON/OFF ▲▼, AFV/RESET/ON/OFF ▲▼ ×4, PICTURE IN PICTURE, KEY ON/OFF, REC/STOP, ON AIR/OFF (STREAM), EFFECT, DURATION, VIDEO OUT 1/2/3/4/M/V/PGM, ปุ่มแหล่งภาพ 1–4, STILL, BLACK, CUT, AUTO, FTB

## เทียบกับ registry (`game/training/sim/equipment.ts` / `reference-equipment.ts`)
- **ครบ:** hdmi-in-1..4, hdmi-out, mic-1/2, usb, eth
- **ในรูปแต่ไม่มีในซิม:** POWER (ใช้ตัวควบคุม power แทน)

**กติกา:** ปั้นทุกหัวต่อที่เห็นในรูป หัวต่อที่ไม่มีใน registry ให้เป็นแบบ**เสียบไม่ได้** และไม่เพิ่มพอร์ตในซิม

## จุดโต้ตอบในเกม
ปุ่ม VIDEO OUT (PGM/M/V) = ตัวควบคุม `hdmi-out`, ปุ่มแหล่งภาพ 1–4, ปุ่ม MIC 1 ON

## ข้อมูลที่ยังไม่มี (ห้ามเดา)
- **รัศมีมุม สีจริง (RAL) และความลึกของหัวต่อ:** รูปทางการไม่ได้ระบุ ให้ประมาณจากสัดส่วนในรูปและระบุใน asset ว่าเป็นค่าประมาณ
