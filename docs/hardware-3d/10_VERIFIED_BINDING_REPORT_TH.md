# 10 · รายงานการผูกรุ่นที่ยืนยันแล้ว (ยกเว้น ST)

วันที่: 2026-10-20 · ยังไม่ได้ commit · ยังไม่เริ่มโมเดล 3D

## 1. รุ่นที่ผูกในรอบนี้
ทุกรุ่นตรวจกับหน้า techspecs ทางการแล้ว (เอกสาร 09) ระบบใช้ id instance ตำแหน่ง และ control เดิมของโปรไฟล์ที่ถูกแทน การตั้งค่าและเงื่อนไขผ่านของทุกด่านจึงเหมือนเดิม

| รุ่นที่ผูก | model key | แทนโปรไฟล์เดิม | instance ที่เปลี่ยน |
|---|---|---|---|
| Blackmagic Studio Camera 4K Plus G2 | `bmd-studio-camera-4k-plus-g2` | `generic-hdmi-camera` | XS `cam1` (**ST ไม่เปลี่ยน**) |
| Blackmagic Studio Camera 4K Pro G2 | `bmd-studio-camera-4k-pro-g2` | `generic-sdi-camera` | AU `cam1–3`, OUT `cam1–3` |
| Blackmagic SmartView Duo | `bmd-smartview-duo` | `generic-sdi-monitor` | AU `monitor`, OUT `monitor`, SP `monitor` (จอสนาม `display` ยัง generic) |
| Magewell USB Capture SDI Gen 2 (32070) | `magewell-usb-capture-sdi-gen2` | `generic-sdi-usb-capture` | AU `capture` |
| ATEM Television Studio HD8 ISO | `bmd-atem-television-studio-hd8-iso` (ล็อกไว้แล้ว) | `reference-production-switcher` | OUT `sw` |
| Blackmagic Videohub 20x20 12G | `bmd-videohub-20x20-12g` | `reference-video-router-8` | SP `router` |
| Blackmagic ATEM 2 M/E Constellation 4K | `bmd-atem-2me-constellation-4k` | `reference-production-switcher` | SP `sw` |
| HyperDeck Studio HD Plus | `bmd-hyperdeck-studio-hd-plus` (เดิม) | `reference-recorder` | SP `rec` |
| Streaming Encoder HD ×2 | `bmd-streaming-encoder-hd` (ล็อกไว้แล้ว) | `reference-sdi-encoder` | SP `enc`, `enc2` (คง failureDomain หลัก/สำรองเดิม) |

**ที่ไม่ผูกตามคำสั่ง:** สวิตเชอร์ ST, กล้อง ST และ Mini Converter Optical Fiber 12G ของ OUT (ยังไม่ได้เลือก SFP)

## 2. การเปลี่ยนแปลงในโค้ด และเหตุผลทางเทคนิค
- **`game/training/sim/equipment.ts`:** เพิ่ม 6 รุ่น โดยพอร์ตเป็นไปตามสเปกทางการ และเก็บพอร์ตจริงที่ด่านไม่ได้ใช้ไว้ด้วย
  - กล้อง: SDI return in, XLR, 3.5 mm, Ethernet
  - SmartView: จอ B และ loop out
  - Videohub: 20 × 20
  - Constellation: 20 in, 12 out, MV 2 ช่อง, analog TRS 1/4 นิ้ว ×2
- **`game/training/sim/engine.ts`:**
  - SmartView Duo มีสองจออิสระ ด่านใช้จอ A (`sdi-in`) ส่วน loop out ส่งภาพต่อออกไปจริง
  - Constellation มี MULTIVIEW ช่องที่ 2 (`mv-out-2`) และใช้ขาเข้าแอนะล็อก 1/4 นิ้วเดิม (`xlr-l/r`)
  - Constellation 4K แปลงมาตรฐานภาพได้จริง แต่ในเกม **ไม่ได้เปิดการแปลง** เพื่อคงกฎเดิมของด่าน (ระบบฝึก 1080p50) บันทึกเหตุผลไว้ใน notes ของโมเดลแล้ว
- **`game/training/sim/reference-rooms.ts`:** ฟังก์ชัน `bind()` เปลี่ยนเฉพาะ model และป้าย ไม่แตะ id และตำแหน่ง
- **`game/training/sim/reference-stages.ts` (OUT):**
  - edge `sw:sdi-out-1 → embed:sdi-in` เปลี่ยนเป็น `sw:pgm-out → embed:sdi-in` เหตุผลคือ HD8 ISO มีขาออก PROGRAM เฉพาะ
  - ลบค่า `sdi-out-1 = PROGRAM` ที่ไม่มีบนเครื่องจริง
  - **ชนิดสายเหมือนเดิม** (`VID-SDI-3G`)
- **`tests/helpers/solver.mjs`:** ตัวช่วยเทสต์ระบุเครื่องบันทึก SP ด้วยชื่อโมเดล `reference-recorder` เปลี่ยนเป็นระบุด้วย instance `rec` ของด่าน `xl-*` กฎ "เครื่องบันทึก SP ต้องบันทึกค้างไว้ตอนส่งงาน" ยังเหมือนเดิม
- **`game/persistence/run-save.ts`:** ข้อความย้ายข้อมูลสำหรับ OUT-01…03 และ SP-02 (ด่านอื่นมีข้อความไว้แล้วจากรอบก่อน) บันทึกเดิมไม่ถูกลบอัตโนมัติ

## 3. ข้อ 6: ยืนยันกราฟสัญญาณ
- **สายทั้งหมด** (ทุกหัวต่อและทิศทาง ทั้ง 25 ด่าน): **331/331 ผ่าน** และ**จำนวนสายเท่าเดิม**
- **`npm test`:** ข้อที่ล้มเหลือเท่ากับก่อนเริ่มงาน (19 ข้อเดิม) ไม่มีข้อล้มใหม่
  - ระหว่างทำ SP-04/05 ล้มชั่วคราวเพราะตัวช่วยเทสต์ระบุเครื่องบันทึกด้วยชื่อโมเดล แก้ตามข้อ 2 แล้ว
- **ผลจำลองเส้นทาง** (สคริปต์ ไม่ใช่การเล่นเกม):
  - AU-05: จอเวที, เครื่องบันทึก และ OBS ได้ PGM พร้อมเสียง 5 แหล่ง
  - OUT-05: ตัวฝังเสียง → ตัวเข้ารหัส → จุดรับสตรีมได้ภาพและเสียง
  - SP-05: CAM 1–6 ผ่านไฟเบอร์และ Videohub ถึง Constellation และ HyperDeck กำลังบันทึก PGM พร้อมเสียง
  - XS-01: ทุก objective ที่ตรวจได้ผ่าน
- **กระเป๋าผู้ดูแล:** สร้างได้ทั้ง 25 ด่าน
- **`tsc --noEmit` และ eslint (ไฟล์ที่แก้):** ผ่าน

## 4. ข้อ 5: ST · 3 edge ที่จะได้รับผลกระทบ (ยังไม่เปลี่ยน)
| edge | ต้นทาง (ปัจจุบัน) | ปลายทาง (ปัจจุบัน) | สายปัจจุบัน |
|---|---|---|---|
| ST-02 `mix:aux-out → sw:audio-in` | มิกเซอร์ STREAM/AUX OUT · TRS 6.35 mm **สเตอริโอ** ไม่สมดุล −10 dBV | สวิตเชอร์ generic AUDIO IN · 3.5 mm สเตอริโอ LINE | `AUD-TRS-635-35` (6.35 TRS → 3.5 mm) |
| ST-04 `mix:aux-out → sw:audio-in` | เดียวกัน | เดียวกัน | เดียวกัน |
| ST-05 `mix:aux-out → sw:audio-in` | เดียวกัน | เดียวกัน | เดียวกัน |

**ถ้าเปลี่ยนเป็น ATEM Mini Extreme ISO G2:**
- เครื่องนี้มีขาเข้า "2 x XLR Combo with phantom power" เป็น **ช่องโมโน (สมดุล) 2 ช่อง** ไม่ใช่ช่องสเตอริโอ 3.5 mm
- **เสียบสาย TRS สเตอริโอตรงไม่ได้:** ขาออกของมิกเซอร์เป็นสเตอริโอใน TRS เส้นเดียว (L ที่ tip, R ที่ ring) ถ้าเสียบตรงเข้าขาเข้าสมดุล ซ้ายกับขวาจะหักล้างกันบางส่วน
- **ต้องใช้สาย Y / insert** TRS สเตอริโอ 6.35 → 2 × TS 6.35 (L → combo 1, R → combo 2)
  - edge ต่อด่านเปลี่ยนจาก 1 เป็น **2 edge** (`sw:combo-1`, `sw:combo-2`)
  - ต้องเพิ่มชนิดสายใหม่ในแคตตาล็อก และกระเป๋าของ ST-02/04/05 จะเปลี่ยน
- **ทางเลือกที่สะอาดกว่า:** ถ้ามิกเซอร์ที่เลือกจริงมี AUX ขาออกแบบโมโนสมดุล 2 ช่อง (L/R) ใช้สาย TRS↔TRS สมดุล 2 เส้นได้ ไม่ต้องใช้ Y แต่ต้องรู้รุ่นมิกเซอร์ก่อน
- **ยังไม่ยืนยัน:** ขาเข้า combo ของ Extreme ISO G2 ตั้งระดับ line ได้หรือไม่ ต้องดูคู่มือ G2
- **สรุป:** ยังไม่เปลี่ยน ST จนกว่าเจ้าของจะเลือก (ก) Y-cable + 2 edge หรือ (ข) รอรุ่นมิกเซอร์จริง

## 5. ที่ยังค้าง (PENDING / GENERIC / UNVERIFIED)
| กลุ่ม | รายการ | สาเหตุ |
|---|---|---|
| 🟡 PENDING ROUTE | Micro Converter HDMI→SDI / SDI→HDMI, HyperDeck (โปรไฟล์ยังขาดพอร์ตจริงบางตัว), Magewell HDMI (ไม่ระบุขั้ว USB) | ต้องเพิ่มพอร์ตที่ขาด / ข้อมูลไม่ครบในหน้าทางการ |
| 🔴 UNVERIFIED | Shure SM58, Yamaha HS5 | หน้าทางการโหลดไม่ได้ / 403 |
| ⚪ GENERIC รอเลือกรุ่น | ไมค์ไร้สาย + TX/RX, มิกเซอร์ 4 ช่อง, PA, โปรเจกเตอร์, PTZ, ไมค์ช็อตกัน, ไมค์บรรยากาศ, ไมค์ไดนามิก, คอนโซล/stagebox/หาง, ไมค์มือถือ RF | หน้าทางการตรวจไม่ได้ หรือผู้สมัครไม่ผ่าน |
| ⚪ GENERIC ของสถาบัน | โน้ตบุ๊ก, OBS host, PC กราฟิก, จอ HDMI, จอสนาม, เกตเวย์ | ต้องให้เจ้าของส่งรุ่นจริง |
| ⚪ GENERIC รอข้อมูล | ไฟเบอร์ OUT (Mini Converter Optical Fiber 12G + SFP), ภาพซ้ำ + แผงควบคุม SP | ต้องเลือก SFP / ไม่มีรุ่นที่มีเอกสาร |
| ⚪ ตั้งใจให้เป็นแบบนี้ | จุดรับสตรีมจำลอง | ไม่ใช่ฮาร์ดแวร์ |
| ⏸ ST | สวิตเชอร์และกล้อง ST | รอการตัดสินใจในข้อ 4 |

## 6. การตัดสินใจที่ยังต้องการจากเจ้าของ
1. **ST:** เลือก (ก) Y-cable + 2 edge กับ ATEM Mini Extreme ISO G2 หรือ (ข) รอรุ่นมิกเซอร์จริง หรือส่งข้อมูล HDS7105 จริง
2. **SFP + สายไฟเบอร์ของ OUT:** ชนิดหัวต่อ, single/multi mode และระยะ
3. **ระบบภาพซ้ำ SP:** ระบุรุ่นที่มีเอกสาร
4. **รุ่นทรัพย์สินสถาบัน:** โน้ตบุ๊ก, OBS, PC กราฟิก, จอ HDMI, จอสนาม, เกตเวย์
5. **ลิงก์ หรือ PDF สเปก** สำหรับรุ่นที่เว็บผู้ผลิตโหลดไม่ได้ (Shure, Sennheiser, Yamaha, Panasonic, JBL, Epson)
6. **อนุญาตอุดพอร์ตที่ขาด** ของรุ่น 🟡 (จะมีข้อความย้ายข้อมูลบันทึกเล่นต่อตามแบบเดิม)

Phase 04 (โมเดล 3D) ยังไม่เริ่ม เพราะยังมีอุปกรณ์ที่จำเป็นต่อภารกิจค้างอยู่

---
## อัปเดต: เพิ่มพอร์ตจริงที่ขาด (ตาม techspecs ทางการ)
- **Micro Converter HDMI to SDI 3G:** เพิ่ม `sdi-out-2` (ทางการระบุ "2 x SDI out") ทั้งสองช่องส่งภาพเดียวกัน
- **Micro Converter SDI to HDMI 3G:** เพิ่ม `sdi-loop` (SDI LOOP OUT ส่งต่อสัญญาณขาเข้า)
- **HyperDeck Studio HD Plus:** เพิ่ม SDI OUT 2, SDI MONITOR OUT, HDMI IN/OUT และ Ethernet บันทึกได้ครั้งละ 1 แหล่ง (SDI หรือ HDMI) ไม่มี ISO
- **Engine:** ตัวแปลงส่งสัญญาณออกทุกพอร์ตวิดีโอ ส่วน recorder ใช้ SDI ก่อน ถ้าไม่มีจึงใช้ HDMI
- **edge และด่านเดิม:** ไม่เปลี่ยน พอร์ตใหม่เป็นทางเลือกเท่านั้น จึงไม่ต้องมีข้อความ migration เพิ่ม
- **ผลตรวจ:**
  - edge 331/331 ใช้ได้
  - admin loadout ครบ 25 ด่าน
  - เทสต์เท่ากับ baseline (ปรับเทสต์ SP 3 ให้นับเฉพาะขาเข้า SDI)
- **ST:** ไม่แตะ ยัง PENDING (ดู `12_ST_HARDWARE_VERIFICATION_TH.md`)


> **แก้ไขภายหลัง:** ถอด HyperDeck `sdi-out-2` ออก เพราะยังไม่ชัดว่าช่อง monitor นับรวมใน "SDI Video Outputs 2" หรือไม่ ส่วนการเลือกขาเข้าบันทึกเปลี่ยนเป็นนโยบายฝึกที่ผู้เล่นเลือกเอง ไม่ใช่การเลือกอัตโนมัติ ดู `13_GENERIC_PROFILE_VERIFICATION_TH.md`
