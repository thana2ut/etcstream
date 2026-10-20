# 02 · BOM และกราฟสัญญาณทั้ง 25 ด่าน (Gate 2: ส่วนที่ดึงจากโค้ด)

วันที่: 2026-10-20

## ที่มาและวิธีอ่าน
- **ข้อมูลหลัก:** `docs/generated/STAGE_GRAPHS_GENERATED_TH.md` และ `docs/generated/hardware-audit.json` สร้างจากโค้ดที่ใช้งานจริงด้วย `npx tsx scripts/generate-hardware-audit.ts` (อ่านอย่างเดียว) เอกสารนี้สรุปและเพิ่มการประเมินระดับความเชื่อมั่น ไม่ได้คัดลอกข้อมูลมือ
- **ข้อมูลของแต่ละด่าน:**
  - อุปกรณ์ทุก instance (id, ป้าย, model key, ผู้ผลิต, generic หรือไม่) และสภาพเริ่มต้น: `boxed→carry` (อยู่ในกล่อง หยิบได้), `installed·liftable` (ติดตั้งแล้ว ยกได้), `fixed` (ติดตั้งถาวร)
  - edge ทุกเส้น: `edgeId` (เช่น `SP-05-E37`), สาย 1 instance, ชนิดแคตตาล็อก, หัวต่อ, พอร์ตต้นทาง OUTPUT และพอร์ตปลายทาง INPUT พร้อมเครื่องหมายต่อไว้ล่วงหน้าหรือติดมากับอุปกรณ์
  - ตารางพอร์ตที่ใช้: จำนวนพอร์ตที่กราฟใช้เทียบกับพอร์ตในโปรไฟล์ของแต่ละอุปกรณ์
  - กระเป๋าที่ต้องใช้ (`requiredBag`), การตั้งค่าที่ไม่ใช่สาย (`solutionConfig` เช่น การจับคู่ RF, การเลือก Program, gain, ไฟ), fault, สายหลอก/สำรอง และ objective id
- **การเชื่อมต่อไร้สาย** (TX→RX) และเครือข่ายเชิงตรรกะ ไม่ใช่สายในกระเป๋า ระบบเก็บเป็นการตั้งค่า (pairing/route) ใน `solutionConfig`

## ความเชื่อมั่นของ edge (ภาพรวม)
| สถานที่ | อุปกรณ์ในกราฟ | สถานะ edge |
|---|---|---|
| XS | generic ทั้งหมด | **GENERIC_EDUCATIONAL_PROFILE** ใช้ได้ทางการเรียน ไม่อ้างรุ่นจริง โครง (HDMI→mini switcher→HDMI PGM, USB webcam→OBS, 3.5mm LINE) สอดคล้องกับความสามารถของ ATEM Mini Pro แต่ยังไม่ได้ผูกรุ่น |
| ST | generic + Magewell 32060 (ST-04/05) + Yamaha HS5 (ST-02/05) | **ผสม:** สวิตเชอร์ (HDS7105) = PENDING, Magewell = OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING (ชนิดขั้ว USB ฝั่งอุปกรณ์ยังไม่ยืนยัน), HS5 = PROVISIONAL (รอบนี้ยังไม่ได้ตรวจซ้ำ) |
| AU | generic SDI switcher + BMD Micro Converter ×2 + HyperDeck Studio HD Plus | ตัวแปลงและ HyperDeck ใช้พอร์ตที่มีจริงตามสเปก (เป็น subset) = **OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING** เพราะโมเดลยังขาดพอร์ตจริงบางตัว และยังไม่มี asset ภาพจริง |
| OUT | reference ทั้งหมด (fiber TX/RX, embedder, encoder, production switcher) | **GENERIC_EDUCATIONAL_PROFILE**; ผู้สมัคร AJA 3G-AMA / Streaming Encoder HD เข้ากันได้ในระดับพอร์ต แต่ยังไม่ได้ผูก |
| SP | reference + Shure SM58 | **GENERIC_EDUCATIONAL_PROFILE**; SM58 = PROVISIONAL (รอบนี้ยังไม่ได้ตรวจซ้ำ); โครงกล้อง/ฐานต่างจากระบบจริงของ Blackmagic (ดูเอกสาร 03) |

**ไม่มีด่านใดที่ประกาศได้ว่า "ใช้ฮาร์ดแวร์จริงครบทุกเส้น"** ส่วน edge ที่ใช้โปรไฟล์ generic ถูกต้องในฐานะแบบฝึก (ทิศทาง หัวต่อ ระดับสัญญาณ ตรวจด้วย `plugFits` และ `engine.evaluate`) แต่ไม่ใช่การยืนยันกับสินค้าจริง

## สถานะรายด่าน
ทุกด่านมีสถานะเดียวกัน: `SOURCE_CODE_RECONCILED` = ใช่ · `VERIFIED_FROM_MANUFACTURER` = ไม่ (มีแค่อุปกรณ์บางชิ้นใน ST/AU ที่มีสเปกทางการ) · `OWNER_NOT_PLAYTESTED`

| ด่าน | IMPLEMENTED (ในโค้ด) | edge ที่ใช้รุ่นจริงทางการ |
|---|---|---|
| XS-01…05 | ✓ | ไม่มี (generic ทั้งหมด) |
| ST-01, ST-03 | ✓ | ไม่มี |
| ST-02 | ✓ | HS5 (PROVISIONAL) |
| ST-04, ST-05 | ✓ | Magewell (ROUTE_PENDING), HS5 (ST-05) |
| AU-01 | ✓ | SDI→HDMI 3G (ROUTE_PENDING) |
| AU-02 | ✓ | ไม่มี |
| AU-03, AU-04 | ✓ | ตัวแปลงทั้งสองทิศ (ROUTE_PENDING) |
| AU-05 | ✓ | ตัวแปลง + HyperDeck Studio HD Plus (ROUTE_PENDING) |
| OUT-01…05 | ✓ | ไม่มี |
| SP-01 | ✓ | ไม่มี |
| SP-02 | ✓ | SM58 (PROVISIONAL) |
| SP-03 | ✓ | HDMI→SDI 3G (ROUTE_PENDING) |
| SP-04, SP-05 | ✓ | HDMI→SDI 3G (ROUTE_PENDING) และ SM58 (PROVISIONAL) |

## ที่ยังต้องทำใน Gate 2
- ผูก edge กับรุ่นจริงหลังจากที่เจ้าของโครงการเลือกรุ่นตามเอกสาร 03
- เพิ่มพอร์ตจริงที่ขาดในโปรไฟล์รุ่นทางการ (เช่น SDI OUT 2 ของ HDMI→SDI 3G, SDI LOOP OUT ของ SDI→HDMI 3G) แบบไม่ทำลายบันทึกเดิม ตอนนี้ยังไม่ได้แก้ เพราะจะเปลี่ยน `contentSignature` ทำให้บันทึกที่ค้างถูกแจ้งว่าไม่เข้ากันได้ ควรทำพร้อมแผน migration

---
## อัปเดตรอบที่ 2 (2026-10-20)
- **XS-01/03/04/05:** เครื่องสลับภาพเป็น ATEM Mini Pro
  - edge เปลี่ยนชื่อพอร์ต: `sw:hdmi-pgm-out` → `sw:hdmi-out` และ `sw:audio-in` → `sw:mic-1`
  - ค่าที่ต้องตั้ง: `hdmi-out = PROGRAM` (ค่าเริ่มต้นของเครื่องจริงคือ MULTIVIEW), `mic1-mode = LINE`, `mic1-on`
  - XS-01 เพิ่ม objective `hdmi-out-pgm`
  - กระเป๋าไม่เปลี่ยน
  - edge เหล่านี้เป็น **VERIFIED_FROM_MANUFACTURER** แล้ว ส่วนกล้อง โปรเจกเตอร์ แล็ปท็อป ไมค์ มิกเซอร์ และ PA ยังเป็น generic
- **SP-01/03/04/05:** ทุกกล้องใช้ 3 edge ต่อเนื่องแทน 1 edge เดิม
  - `cam i:sdi-out → cfc i:sdi-in` (12G SDI สั้น `VID-SDI-6G-12G`)
  - `cfc i:fiber → ccu i:fiber` (SMPTE hybrid `FIB-CAMERA-CCU`)
  - `ccu i:sdi-out → router:in-i`
  - กระเป๋าเพิ่ม `VID-SDI-6G-12G` เป็น SP-01 ×1, SP-03 ×6, SP-05 ×6 (SP-04 ต่อไว้ครบ)
  - edge ฝั่งกล้องถึงฐานรับเป็น **VERIFIED_FROM_MANUFACTURER** แล้ว ส่วนเราเตอร์ เครื่องสลับภาพ ภาพซ้ำ กราฟิก และเสียงยังเป็น reference/generic
- **ผลการจำลอง (สคริปต์ ไม่ใช่การเล่นเกม):**
  - XS: ทุก objective ที่ตรวจได้ผ่าน จอได้ PROGRAM, OBS ได้ภาพและเสียงผู้สอนทางเดียว
  - SP-01/05: ภาพ CAM 1 และ CAM 6 ถึงเครื่องสลับภาพ ถ้าปิดไฟ Studio Fiber Converter ภาพจะหาย
- **ข้อมูลอ้างอิงที่สร้างใหม่แล้ว:** `docs/generated/STAGE_GRAPHS_GENERATED_TH.md` และ `hardware-audit.json`

---
## อัปเดตรอบที่ 3 (2026-10-20)
- **XS · ตัวเลือก A (เจ้าของยืนยัน):**
  - HDMI OUT ของ ATEM Mini Pro เริ่มที่ MULTIVIEW ในการฝึกใหม่ทุกครั้ง (ค่าเริ่มต้นของ control ตามคู่มือ) ระบบไม่เปลี่ยนเป็น PROGRAM เองเมื่อเสียบสาย ผู้เล่นต้องกด "ปุ่ม VIDEO OUT · ภาพที่ส่งออก HDMI OUT" ในคอนโซลเอง
  - ค่าที่ตั้งไว้บันทึกใน `sim.config` ของระบบเล่นต่อ จึงไม่รีเซ็ตเมื่อเล่นต่อ
  - XS-01, XS-03, XS-05 มี objective `hdmi-out-pgm` พร้อมคำแนะนำภาษาไทย
  - XS-04 เริ่มจากระบบที่ใช้งานอยู่แล้ว (startConfig ของด่านกู้ระบบ) ไม่ได้เพิ่มพอร์ต HDMI
- **AU-01…05 (HD8 ISO):**
  - edge: `sw:sdi-out-1` → `sw:aux-1`, `sw:sdi-out-2` → `sw:aux-2`, `sw:sdi-out-3` → `sw:pgm-out` (บันทึก)
  - ค่าที่ตั้ง: `aux-1 = PROGRAM` (และ `aux-2 = PROGRAM` ใน AU-05) ส่วน PROGRAM OUT ไม่ต้องตั้งเพราะส่งภาพออกอากาศเสมอ
  - fault AUX ย้ายไปที่ `aux-1` · objective AU-01 "AUX 1 ส่งภาพออกอากาศ (PROGRAM)"
  - กระเป๋าไม่เปลี่ยน
- **OUT-04/05:** ตัวเข้ารหัสและตัวฝังเสียงเป็นรุ่นจริง พอร์ตที่ด่านใช้มี key เดิม edge และกระเป๋าจึงไม่เปลี่ยน
- **ด่านที่ยังเป็น generic/reference ทั้งหมด:** กล้อง, PTZ, จอ, ไมค์, ตัวรับไร้สาย, คอนโซล/stagebox, ไฟเบอร์ OUT, สวิตเชอร์ OUT/SP, เราเตอร์, ภาพซ้ำ, กราฟิก และตัวเข้ารหัส SP

---
## อัปเดตรอบที่ 4 (2026-10-20)
- **OUT-04/05:** `sw:sdi-out-1 → embed:sdi-in` เปลี่ยนเป็น `sw:pgm-out → embed:sdi-in` (ขาออก PROGRAM เฉพาะของ HD8 ISO) สายเท่าเดิม
- **ด่านอื่น:** edge และกระเป๋าไม่เปลี่ยน ผลตรวจสาย 331/331 ผ่าน (เอกสาร 10)
