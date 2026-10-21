# 14 · รายการอุปกรณ์ที่ผ่านด่านตรวจ และสเปกสำหรับทำโมเดล 3D

วันที่: 2026-10-20 · **ยังไม่เริ่มทำโมเดล 3D แบบเหมา** · ยังไม่ได้ commit

## ด่านตรวจ (Gate) ก่อนทำโมเดล
1. พอร์ตตรงกับ techspecs ทางการ ✅
2. ใช้ในเส้นทางของด่าน และผ่านการตรวจ 331 edge ✅
3. ขนาด น้ำหนัก และตำแหน่งหัวต่อจากเอกสารทางการ ⛔ **ยังไม่ผ่าน**
   - Blackmagic แสดงขนาดเป็น**รูปภาพเท่านั้น** ไม่มีข้อความ
   - คำอนุญาตให้ดูรูปทางการกำหนดไว้ว่า "เมื่อฮาร์ดแวร์ภารกิจหลักยืนยันครบแล้ว" ตอนนี้ ST ยังค้าง จึง**ยังไม่ได้เปิดดูรูป**

**สรุป:** ยังไม่มีรุ่นไหนผ่านครบทั้ง 3 ข้อ จึงยังไม่สร้างโมเดล

## รายการที่ผ่านด่าน 1–2 (คิวทำโมเดลถัดไป)
| ลำดับ | รุ่น | ใช้ในด่าน | ขนาด/น้ำหนัก | รูปทรงภายนอก (จากข้อความทางการ) | หัวต่อที่ต้องวางตำแหน่ง | จุดโต้ตอบในเกม |
|---|---|---|---|---|---|---|
| 1 | ATEM Mini Pro | XS | PENDING (รูป) | PENDING (ยังไม่ได้ดูรูป) | HDMI IN 1–4, HDMI OUT, MIC 1–2 (3.5 mm), USB-C, Ethernet, 12V | ปุ่มเลือกภาพ, VIDEO OUT, เมนูเสียง |
| 2 | ATEM Television Studio HD8 ISO | AU, OUT | PENDING | PENDING (ยังไม่ได้ดูรูป) | SDI IN 1–8, REF, PGM, AUX 1–2, MV SDI/HDMI, XLR L/R, USB ×2, Ethernet | PGM/PVW, AUX, MV, เสียง |
| 3 | ATEM 2 M/E Constellation 4K | SP | PENDING | PENDING (ยังไม่ได้ดูรูป) | 12G-SDI IN 1–20, OUT 1–12, MV ×2, TRS 6.35 mm L/R | ผ่านแผงควบคุม |
| 4 | Videohub 20x20 12G | SP | PENDING | PENDING (ยังไม่ได้ดูรูป) | IN 1–20, OUT 1–20 | crosspoint |
| 5 | Streaming Encoder HD | OUT, SP | PENDING | กล่อง | SDI in, loop, mon, HDMI mon, Ethernet, USB-C, AC + XLR 12V | stream key (ค่าทดสอบ), เริ่ม/หยุด |
| 6 | HyperDeck Studio HD Plus | AU, SP | PENDING | "Half rack unit width, 1 rack unit height" (ข้อความทางการ) | SDI in/out/mon, HDMI in/out, REF, RS-422, TC, Ethernet, USB-C, SD ×2, หูฟัง | สื่อ, ขาเข้าบันทึก, REC/PLAY |
| 7 | Micro Converter HDMI→SDI 3G / SDI→HDMI 3G | หลายด่าน | PENDING | กล่องเล็ก | ตามตาราง 13-A | ไฟเลี้ยง USB-C |
| 8 | SmartView Duo | AU, OUT, SP | PENDING | PENDING (ยังไม่ได้ดูรูป) | SDI in/loop ×2 | — |
| 9 | Studio Camera 4K Plus G2 / Pro G2 | XS, AU, OUT | PENDING | กล้องสตูดิโอ | ตาม MODEL_EVIDENCE | — |
| 10 | URSA Broadcast G2 + Camera/Studio Fiber Converter | SP | PENDING | กล้อง + ตัวแปลงติดหลังกล้อง | SDI, SMPTE fiber | สาย 12G สั้น, fiber |
| 11 | AJA 3G-AMA | OUT | PENDING | กล่อง + breakout DB-25 | SDI in/out, DB-25 | ฝังเสียง |
| 12 | Magewell USB Capture SDI Gen 2 | AU | PENDING | ดองเกิล | SDI in, USB (ชนิดหัวฝั่งอุปกรณ์ PENDING) | — |

**ห้ามทำโมเดล:**
- ST (มิกเซอร์และสวิตเชอร์) ยัง PENDING 3 ข้อ
- โปรไฟล์ GENERIC ทั้งหมดในเอกสาร 13-C

## ขั้นตอนต่อไปเมื่อได้รับอนุมัติ
- **เปิดดูรูปทางการ** (front/rear/side/top) เพื่ออ่านขนาด น้ำหนัก และตำแหน่งหัวต่อ ทำได้เมื่อ ST ปิดครบ หรือเจ้าของอนุญาตให้ดูเฉพาะรุ่นที่ผ่านด่าน 1–2
- **บันทึกค่าจากรูป:** ลงใน `assets/specs/<model>/MODEL_EVIDENCE.md` พร้อม URL ของรูป
- **ทำโมเดลทีละรุ่น:** ตามลำดับในตาราง
