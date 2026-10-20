# MODEL_EVIDENCE · Blackmagic ATEM Mini Pro (`bmd-atem-mini-pro`)

- **สถานะ:** `LOCKED_EXACT_REVISION` (ระดับพอร์ตและเส้นทาง) · **asset 3D ยังไม่เริ่ม** (ต้องดูภาพทางการก่อน ดูข้อจำกัด)
- **รุ่น:** ATEM Mini Pro (ไม่ใช่ ATEM Mini / Pro ISO / Extreme) ไม่มีการแยกรุ่นปีของฮาร์ดแวร์ในเอกสารทางการ คู่มือเล่มเดียวครอบคลุม Pro และ Pro ISO ซึ่งมีแผงพอร์ตเหมือนกัน ต่างกันแค่ ISO บันทึกแยกทุกขาเข้า
- **วันที่ตรวจ:** 2026-10-20

## หลักฐานทางการ
1. Tech specs: https://www.blackmagicdesign.com/products/atemmini/techspecs
   - "4 x HDMI type A, 10-bit HD switchable"
   - HDMI Program Outputs 1, Total Aux Outputs 1
   - "2 x 3.5mm stereo mini jack"
   - "1 x USB Type-C 3.1 Gen 1 for external drive recording, webcam out"
   - Ethernet 10/100/1000
   - "1 x External 12V power supply" (Pro ใช้ไฟ 30W)
2. คู่มือ ATEM Mini (PDF ทางการ https://documents.blackmagicdesign.com/UserManuals/ATEM_Mini_Manual.pdf)
   - "Setting the HDMI Output using the Video Out Buttons" → "The default output source for ATEM Mini Pro is the multiview"
   - "Setting Audio Input and Output Behavior" (หน้า 114): ตั้ง mic inputs เป็น microphone หรือ line level ได้ในแท็บ audio ของ ATEM Software Control
   - "Plug your computer into ATEM Mini's USB-C connector" → คอมพิวเตอร์มองเห็นเป็น webcam
   - ภาพแผงด้านหน้าหน้า 7 มีป้าย MIC 1 / MIC 2 / VIDEO OUT / KEY / RECORD / STREAM (อ่านจาก text layer ของ PDF)
3. หน้าผลิตภัณฑ์ https://www.blackmagicdesign.com/products/atemmini มีภาพ "ATEM Mini Pro Panel" และ "Broadcast Switcher Rear Inputs" (เห็นแค่ alt text **ยังไม่ได้ดูภาพจริง**)

## พอร์ตในเกม ↔ หลักฐาน
| stableId | ป้าย | ทิศ / หน้าที่ | หัวต่อ | สัญญาณ | หลักฐาน |
|---|---|---|---|---|---|
| hdmi-in-1…4 | HDMI IN 1–4 | INPUT | HDMI Type A | HDMI HD | techspecs |
| hdmi-out | HDMI OUT | OUTPUT (เลือก PROGRAM / MULTIVIEW, ค่าเริ่มต้น MULTIVIEW) | HDMI Type A | HDMI | techspecs + คู่มือ (Video Out Buttons) |
| mic-1, mic-2 | MIC IN 1–2 | INPUT (ตั้ง MIC / LINE) | 3.5 mm stereo | LINE_UNBAL เมื่อตั้ง LINE | techspecs + คู่มือ หน้า 114 |
| usb | USB-C | OUTPUT webcam (DEVICE → HOST) หรือบันทึกดิสก์ | USB-C | USB_UVC | techspecs + คู่มือ |
| eth | ETHERNET | สตรีม / ควบคุม | RJ45 | ETHERNET | techspecs |
| (ไฟ) | 12V DC | — | ขั้วไฟจากอะแดปเตอร์ | งานไฟจำลองแบบปลอดภัย ไม่ใช่สายในกระเป๋า | techspecs |

## เส้นทางในด่าน (ตรวจด้วยสคริปต์จำลองแล้ว)
- **XS-01:** cam1 HDMI → HDMI IN 1 · HDMI OUT (ตั้ง PROGRAM) → จอ HDMI IN
- **XS-03:** + slides → HDMI IN 2 · USB-C → OBS host USB
- **XS-04:** ต่อไว้ล่วงหน้า + fault
- **XS-05:** + mixer STREAM/AUX (TRS 6.35 ไม่สมดุล −10 dBV) → MIC 1 (3.5 mm ตั้ง LINE)
- **ผลการจำลอง:** จอแสดง TEACHER CAM, OBS ได้ PROGRAM และได้ยินแค่ TEACHER VOICE (ไม่ซ้อน) ถ้าปล่อยค่าเริ่มต้น MULTIVIEW จอจะแสดง MULTIVIEW แทน
- **การตั้งค่าที่ด่านต้องการ (ตามเครื่องจริง):** `hdmi-out = PROGRAM`, `mic1-mode = LINE`, `mic1-on`, `emb-audio = OFF`
- **objective ที่เพิ่มใน XS-01:** `hdmi-out-pgm` (HDMI OUT ส่งภาพออกอากาศ ไม่ใช่ MULTIVIEW)

## งบ asset (Phase 04 ยังไม่เริ่ม)
- **ขนาด:** ประมาณ 24 × 12 × 4 ซม. (ค่าประมาณ ยังต้องดูมิติทางการ)
- **รูปทรง:** แผงหน้ามีปุ่มขนาดใหญ่ 4 ปุ่ม + แถวปุ่ม VIDEO OUT / KEY / RECORD / STREAM, ด้านหลังมีพอร์ตตามตาราง
- **ระดับรายละเอียด:** distant ไม่เกิน 200 tris · normal ไม่เกิน 1.5k · inspect ไม่เกิน 4k · ไม่ใช้โลโก้หรือภาพถ่ายของผู้ผลิต

## ข้อจำกัด
- ยังไม่ได้ดูภาพถ่ายด้านหน้า/หลังจากผู้ผลิตด้วยตาเอง (เครื่องนี้ไม่มีเครื่องมือแปลง PDF เป็นภาพ และไม่ได้เปิดเบราว์เซอร์ตามคำขอ) **จึงห้ามเริ่มโมเดล 3D แบรนด์จนกว่าจะได้ดูภาพ**
- ขนาดตัวเครื่องในเกมเป็นค่าประมาณ

## การตัดสินใจ: ตัวเลือก A (เจ้าของโครงการ 2026-10-20)
- **การฝึกใหม่:** HDMI OUT เริ่มที่ MULTIVIEW เสมอ ผู้เล่นต้องกดปุ่ม VIDEO OUT เลือก PROGRAM เอง ระบบไม่เปลี่ยนให้อัตโนมัติเมื่อเสียบสาย
- **การตรวจในด่าน:** XS-01, XS-03 และ XS-05 มี objective `hdmi-out-pgm` และจอ/OBS ต้องได้ภาพ PROGRAM จริง
- **การบันทึก:** ค่าที่ตั้งเก็บในบันทึกเล่นต่อ (`sim.config`) และไม่ถูกรีเซ็ต
- **พอร์ต:** ไม่มีพอร์ต HDMI เพิ่ม ใช้ HDMI OUT ช่องเดียวตามเครื่องจริง
