# MODEL_EVIDENCE · ชุดกล้องสนาม SP (ตัวเลือก B ที่เจ้าของโครงการเลือก 2026-10-20)

URSA Broadcast G2 (`bmd-ursa-broadcast-g2`) → Camera Fiber Converter (`bmd-camera-fiber-converter`) → SMPTE hybrid fiber → Studio Fiber Converter (`bmd-studio-fiber-converter`)

## 1. ความเข้ากันได้ของกล้องกับ converter (ตรวจก่อน ตามข้อ 1 ของคำสั่ง)
- **หน้าทางการ:** https://www.blackmagicdesign.com/products/blackmagicursabroadcast/fiberconverters ระบุว่า "Now it's easy to transform URSA Broadcast G2 into a true broadcast studio camera!" และ "perfectly matches URSA Broadcast G2"
- **การต่อฝั่งกล้อง:** "you connect the 12G‑SDI connections between the converter and the camera" และ "The Molex connector is the main power connector" ตัว converter "attaches to the back of your URSA Broadcast in place of the battery plate"
- **หน้า techspecs ของ G2:** https://www.blackmagicdesign.com/products/blackmagicursabroadcast/techspecs ระบุ Camera Fiber Converter ใน "Optional Accessories"
- **สรุป:** เข้ากันได้ ยืนยันจากเอกสารทางการ

## 2. พอร์ตตามผู้ผลิต
| อุปกรณ์ | พอร์ต (คำจากหน้าทางการ) | แหล่ง |
|---|---|---|
| URSA Broadcast G2 | SDI Video Outputs 1 · SDI Monitor Outputs 1 · SDI Video Inputs 1 · "2 x XLR switchable between mic, line and AES" · 4-pin XLR 12V · "12-pin Molex connector under rear battery plate" · B4 mount | techspecs G2 |
| Camera Fiber Converter | "1x SMPTE Hybrid Fiber Optic with SMPTE 304 connector (Male)" · "1x 12G SDI for Camera feed" · "1x 3G SDI for Camera return feed, 3x 3G SDI for Return SDI Outputs" · 2× 5-pin XLR talkback · 2× 3-pin XLR audio in · USB-C · แถมสาย 12G SDI สั้น 3 เส้น · ได้ไฟผ่านไฟเบอร์ (สูงสุด 2 กม.) | https://www.blackmagicdesign.com/products/blackmagicfiberconverters/techspecs |
| Studio Fiber Converter | "1x SMPTE Hybrid Fiber Optic with Female SMPTE 304 connector" · "2x 12G SDI for Ultra HD up to 60p" · "3x 12G SDI Return feeds" · analog audio out ×4 · talkback 25-pin · USB-C · "100 - 240V AC input" · จ่ายไฟให้กล้อง | เดียวกัน |
| สายเชื่อม | "standard SMPTE 311M hybrid electrical and fiber optic cables with SMPTE 304M connectors on each end" | หน้า fiber converters |

## 3. สิ่งที่ทำในโค้ด
- **พอร์ตที่ใช้ในเกม:**
  - กล้อง: `sdi-out` (12G-SDI OUT), `sdi-mon`, `sdi-ret`, `xlr-1/2` (มีจริง ยังไม่ใช้ในด่าน)
  - Camera Converter: `sdi-in` (12G SDI IN · CAMERA FEED), `fiber` (SMPTE 304 MALE)
  - Studio Converter: `fiber` (SMPTE 304 FEMALE), `sdi-out`, `sdi-out-2`
  - พอร์ตจริงอื่นที่ยังไม่ใช้ ระบุไว้ใน notes ของโมเดล ไม่ได้สร้างพอร์ตเกินสเปก
- **edge ต่อกล้อง i:**
  - `cam i:sdi-out → cfc i:sdi-in` สาย 12G SDI สั้น ใช้แคตตาล็อก `VID-SDI-6G-12G` และผู้เล่นต่อเอง
  - `cfc i:fiber → ccu i:fiber` สาย SMPTE hybrid (`FIB-CAMERA-CCU`)
  - `ccu i:sdi-out → router:in-i`
- **ตำแหน่ง:** Camera Fiber Converter ยึดท้ายกล้องของตัวเอง (`mountedOn`) เป็นอุปกรณ์ติดตั้งถาวร ไม่ยกขึ้นมือ ส่วน Studio Fiber Converter อยู่ในตู้ฐาน
- **การจับคู่:** ใช้ `opticalPeer` คู่ cfc i ↔ ccu i ถ้าต่อข้ามคู่จะถูกปฏิเสธ (ระบบเดิม)
- **ไฟ:** Studio Fiber Converter ต้องเปิดไฟ ถ้าปิดจะไม่มีภาพ (fault "s-ccu-power" เดิมยังใช้ได้) Camera Converter ได้ไฟผ่านไฟเบอร์ (`needsPower: false`) ส่วนกล้องยังมีสวิตช์ไฟแบบฝึก
- **กล้องทั้ง 6 ตัว:** ใช้ชุดเดียวกัน เพราะ manifest ของ SP (`reference-stages.ts` `stadium`) กำหนดทุกตำแหน่งเหมือนกันอยู่แล้ว (วนกล้อง 1–6 ด้วยกฎเดียว) ไม่ได้สร้างความแตกต่างที่เอกสารไม่ได้ระบุ

## 4. ผลที่ตามมาที่ต้องรู้
- **ไม่ต่อไว้ล่วงหน้า:** ตอนแรกลองให้ชุดกล้อง+converter ต่อไว้ล่วงหน้า แต่ขัดกฎเดิม "L5 never pre-wire" (เทสต์ `L5 certifications reveal no route checklist and never pre-wire`) จึงเปลี่ยนเป็นให้ผู้เล่นต่อสาย SDI สั้นเอง ไม่ได้แก้กฎ
- **กระเป๋าที่ต้องใช้เพิ่ม `VID-SDI-6G-12G`:** SP-01 +1, SP-03 +6, SP-05 +6 (SP-04 ต่อไว้ครบ) และกระเป๋าผู้ดูแลเปลี่ยนตาม
- **บันทึกเดิมของ SP-01/03/04/05:** จะถูกแจ้งว่า "ด่านสนามกีฬาเปลี่ยนเป็นระบบไฟเบอร์จริงของ Blackmagic..." ผู้เล่นเลือกเริ่มใหม่หรือกลับหน้าสำนักได้ ระบบไม่ลบบันทึกเอง

## 5. สถานะ
- **URSA Broadcast G2, Camera Fiber Converter, Studio Fiber Converter:** `LOCKED_EXACT_REVISION` (ระดับพอร์ตและเส้นทางที่ใช้)
- **asset 3D:** ยังไม่เริ่ม ต้องดูภาพทางการก่อน
- **ยังไม่ยืนยัน:** ขนาดตัวเครื่องจริงของแต่ละชิ้น และรายละเอียดหน้าแผงเพื่อทำโมเดล
