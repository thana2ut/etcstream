# MODEL_EVIDENCE · Blackmagic ATEM Television Studio HD8 ISO (`bmd-atem-television-studio-hd8-iso`)

- **สถานะ:** `LOCKED_EXACT_REVISION` (ระดับพอร์ตและเส้นทางที่ด่านใช้) · **asset 3D ยังไม่เริ่ม**
- **รุ่นที่เลือก:** ATEM Television Studio HD8 ISO รหัสหน้า W-APS-21 ไม่ใช่รุ่น 2TB และไม่ใช่ HD8 ธรรมดาที่ไม่มี ISO
- **วันที่ตรวจ:** 2026-10-20

## หลักฐาน
1. **Techspecs:** https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs/W-APS-21
   - SDI Video Inputs 8 · SDI Video Outputs 12 · SDI Program Outputs 1 · SDI Aux Outputs 2 · Multiview "1 x 3G-SDI" + HDMI 1
   - "2 x XLR balanced analog audio", "2 x RCA stereo analog audio" · Reference "1 x BNC In, 1 x BNC Out" (Tri-Sync / Black Burst)
   - "2 x USB-C supports USB 3.0 for external drive recording, webcam out…" · "4 x RJ45 with internet network switch"
2. **คู่มือ** ATEM Television Studio HD8/4K8 (https://documents.blackmagicdesign.com/UserManuals/ATEM_Television_Studio_HD_Manual.pdf)
   - HD8 มี auxiliary output 2 ช่อง ที่ส่ง "program feeds… clean feeds… or even specific video inputs" ได้
   - ปุ่มหน้าเครื่องเลือกขาเข้า 8 ช่อง, program และปุ่มสลับ multiview/preview
   - ISO = บันทึกขาเข้าแยกไฟล์

## พอร์ตในเกม
| stableId | ป้าย (เชิงอธิบาย) | ทิศ | สัญญาณ |
|---|---|---|---|
| sdi-in-1…8 | SDI IN 1–8 | INPUT | 3G-SDI 1080p50 |
| ref-in | REF IN (BNC) | INPUT | REF (ไม่ใช่ภาพ) |
| pgm-out | SDI OUT · PROGRAM | OUTPUT | ภาพออกอากาศเสมอ |
| aux-1, aux-2 | SDI OUT · AUX 1/2 | OUTPUT | ตั้งแหล่ง: SDI 1–8 / PROGRAM / CLEAN FEED / PREVIEW (ค่าเริ่มต้นในเกม SDI 1) |
| mv-out, hdmi-mv | SDI / HDMI OUT · MULTIVIEW | OUTPUT | MULTIVIEW หรือ PREVIEW ตามปุ่ม |
| xlr-l, xlr-r | XLR AUDIO IN 1/2 (balanced) | INPUT | LINE_BAL |
| usb-1, usb-2 | USB-C 1/2 | OUTPUT | webcam / บันทึก |
| eth | ETHERNET | OUTPUT | สตรีม / ควบคุม |

## การจับคู่กับด่าน AU (ใช้สายจำนวนเท่าเดิม)
- **AU-01:** cam1 → SDI IN 1 · **AUX 1 (ตั้ง PROGRAM)** → SDI→HDMI converter → จอเวที
- **AU-03/04/05:**
  - 5 แหล่งภาพ → SDI IN 1–5 · MULTIVIEW → จอ FOH · AUX 1 (PROGRAM) → จอเวที
  - AU-05 เพิ่ม AUX 2 (PROGRAM) → SDI capture → OBS และ **PROGRAM OUT → เครื่องบันทึก HyperDeck**
- **fault เดิม** ("AUX เลือกกล้อง 3", "กล้องเสียบ REF IN") ใช้ AUX 1 / REF IN ของจริง
- **ผลการจำลอง:** จอเวทีได้ PGM, ถ้าตั้ง AUX 1 = SDI 3 จะเห็น CAM3, เครื่องบันทึกได้ PGM, OBS ได้ PGM พร้อมเสียง 5 แหล่ง

## ยังไม่ยืนยัน
- ข้อความที่พิมพ์จริงบนแผงหลัง (ป้ายในเกมเป็นเชิงอธิบาย)
- XLR เป็นระดับ mic หรือ line (สเปกเขียนแค่ "balanced analog") ในเกมรับระดับไลน์จากบัส Broadcast ของคอนโซล
- ค่าเริ่มต้นของ AUX และเสียงฝังจากโรงงาน (ในเกมใช้ AUX = SDI 1 และเสียงฝัง = OFF ตามโปรไฟล์เดิม)
- **ทางเลือกในอนาคต:** USB-C webcam ของ HD8 ISO ใช้แทน SDI capture ใน AU-05 ได้ แต่จะเปลี่ยนโครงด่าน จึงยังไม่ทำ
