# 16 · Phase 04: โมเดล 3D ฮาร์ดแวร์ที่ยืนยันแล้วทั้ง 14 รุ่น

วันที่: 2026-10-20 · Claude Code · **ยังไม่ได้ทดสอบในเบราว์เซอร์และในเกม** (เจ้าของจะทดสอบรวมครั้งเดียวตาม `17_PHASE04_OWNER_SINGLE_PASS_QA_TH.md`) · ยังไม่ได้ commit

> ผลตรวจระดับโค้ดในเอกสารนี้ไม่ได้พิสูจน์ว่าภาพหรือการเล่นถูกต้อง

## สรุป
- **ความคืบหน้า:** ทำครบ **14/14 รุ่น** (ATEM Mini Pro เป็นต้นแบบ #1, Batch A 4 รุ่น, Batch B 4 รุ่น, Batch C 5 รุ่น) ไม่มีรุ่นที่ BLOCKED
- **อุปกรณ์ที่ไม่ได้แตะ:**
  - ST (PENDING 3 ข้อ)
  - AJA 3G-AMA
  - Magewell USB Capture SDI Gen 2
  - โปรไฟล์ GENERIC/reference ทั้งหมด
  - Free Practice
- **ระบบที่ไม่เปลี่ยน:** objective, level ID, กราฟสัญญาณ, กติกาสาย, admin loadout และ save
- **ที่มาของพิกัด:** วัดจากรูปทางการของ Blackmagic Design (`physical-specifications` / `connections`) โดยใช้มาตราส่วนจากตัวเลขขนาดที่พิมพ์บนรูปเดียวกัน
- **ขนาด:** ขนาดจริงเก็บใน `size` ส่วนขนาดในเกมใช้ `displayScale` แยกรายรุ่น ไม่ได้ใช้ ×2.5 ของ ATEM Mini Pro กับรุ่นใหญ่
- **ลำดับการทำงาน:** เขียน geometry ของทั้ง 13 รุ่นในรอบเดียวด้วย renderer กลาง แล้วตรวจทางเทคนิคครั้งเดียวที่ครอบคลุมทั้ง 3 batch (ไม่ได้ตรวจแยกหลังจบแต่ละ batch)

## ไฟล์
| ไฟล์ | หน้าที่ |
|---|---|
| `game/training/sim/hardware-geometry.ts` (ใหม่) | ข้อมูลของ 13 รุ่น: ขนาดจริง, display scale, พอร์ต registry, หัวต่อจริงที่เสียบไม่ได้, ชิ้นส่วน/ปุ่ม/จอ/ป้าย, ค่าประมาณ, URL อ้างอิง |
| `game/training/sim/model-geometry.ts` | ชนิดข้อมูล, `TRIPOD_TOP`, ATEM Mini Pro, `portClearance` |
| `components/game/equipment/hardware-model.tsx` (ใหม่) | renderer กลาง (geometry/material ใช้ร่วมกัน), หัวต่อตามชนิด, ขาตั้งกล้อง, แร็คทาวเวอร์ |
| `components/game/equipment/device-visual.tsx` | ส่งอุปกรณ์ที่มี geometry ไปที่ renderer กลาง |
| `game/training/venue-scenarios.ts` | ขนาด collision = ขนาดจริง × scale, พอร์ตตรงกับ socket จริงพร้อม offset ของขาตั้ง/แร็ค, CFC ติดชิดหลัง URSA, กติกายกได้ใช้ขนาดจริง |
| `game/training/scenarios.ts` | ฟิลด์เสริม `DeviceDef.modelId`, `DeviceDef.mount` |
| `tests/phase04-hardware-models.test.mjs` (ใหม่) | ตรวจ registry ↔ 3D, ชนิดหัวต่อ, กฎฮาร์ดแวร์สำคัญ, ตำแหน่งพอร์ตในทุกด่าน, hit sphere ไม่ทับกัน |

## ตารางสรุป 14 รุ่น
| # | รุ่น | สถานะ | ขนาดจริง (mm) | scale | พอร์ตต่อได้ | เสียบไม่ได้ | การวาง |
|---|---|---|---|---|---|---|---|
| 1 | ATEM Mini Pro | ✅ | 237.5 × 35 × 103.4 | ×2.5 | 9 | 1 | โต๊ะ · หยิบได้ |
| 2 | ATEM Television Studio HD8 ISO | ✅ | 584 × 161 × 376 | ×1.4 | 19 | 27 | โต๊ะ · หยิบได้ |
| 3 | ATEM 2 M/E Constellation 4K | ✅ | 482.6 × 44.2 × 234 | ×1.4 | 36 | 6 | โต๊ะ · หยิบได้ |
| 4 | Videohub 20x20 12G | ✅ | 482.6 × 44.2 × 236 | ×1.4 | 40 | 5 | ติดตั้งถาวร (router) |
| 5 | Streaming Encoder HD | ✅ | 140 × 44.5 × 175.3 | ×1.6 | 6 | 3 | โต๊ะ หยิบได้ / แร็คทาวเวอร์ (SP) |
| 6 | HyperDeck Studio HD Plus | ✅ | 210 × 44.2 × 176.8 | ×1.6 | 8 | 12 | โต๊ะ หยิบได้ / แร็คทาวเวอร์ (SP) |
| 7 | Micro Converter HDMI to SDI 3G | ✅ | 79.5 × 24.9 × 45.7 | ×2.5 | 4 | 0 | โต๊ะ · หยิบได้ |
| 8 | Micro Converter SDI to HDMI 3G | ✅ | 79.5 × 24.9 × 45.7 | ×2.5 | 4 | 0 | โต๊ะ · หยิบได้ |
| 9 | SmartView Duo | ✅ | 482.6 × 133 × 35 | ×1.3 | 4 | 5 | ติดตั้งถาวร (display) |
| 10 | Studio Camera 4K Plus G2 | ✅ | 273.6 × 167.4 × 169.7 | ×1.5 | 4 | 4 | บนขาตั้ง |
| 11 | Studio Camera 4K Pro G2 | ✅ | 273.6 × 167.4 × 169.7 | ×1.5 | 3 | 10 | บนขาตั้ง |
| 12 | URSA Broadcast G2 | ✅ | 150 × 252 × 278 | ×1.5 | 5 | 7 | บนขาตั้ง |
| 13 | Camera Fiber Converter | ✅ | 138 × 190.8 × 140 | ×1.5 | 2 | 13 | ติดหลัง URSA |
| 14 | Studio Fiber Converter | ✅ | 210.3 × 88.4 × 371.9 | ×1.3 | 3 | 15 | ชั้นแร็ค CCU (ตำแหน่งเดิม) |

**ที่มาของ display scale:**
- **เลือกรายรุ่น:** ตั้งให้ระยะห่างระหว่างหัวต่อที่ใกล้กันที่สุดในฉากอยู่ที่ประมาณ 24–28 mm ซึ่งเล็งได้ในมุมมองบุคคลที่หนึ่ง เช่น BNC ของจริงห่างกัน 17–20 mm จึงใช้ ×1.3–1.6
- **ขยายสม่ำเสมอทุกแกน:** ตำแหน่งหัวต่อที่มองเห็นจึงยังตรงสัดส่วนจริง
- **hit sphere:** = min(ค่าเดิม, 48% ของระยะถึงพอร์ตข้างเคียง) จึงไม่ทับกัน (มีเทสต์ตรวจ)

## รายละเอียดรายรุ่น (สร้างจากข้อมูลในโค้ด)

### 1. Blackmagic Design ATEM Mini Pro — `bmd-atem-mini-pro`
- **สถานะ:** ✅ ทำโมเดลแล้ว (ต้นแบบ #1 · component เฉพาะ `atem-mini-pro.tsx`)
- **ขนาดจริง:** 238 × 35 × 103 mm (กว้าง × สูง × ลึก)
- **display scale:** ×2.5 → ในฉาก 0.594 × 0.088 × 0.259 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/atemmini/techspecs/physical-specifications/atem-mini-pro-imperial.jpg
  - https://images.blackmagicdesign.com/images/products/atemmini/techspecs/connections/atem-mini-pro.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `hdmi-in-1` HDMI IN 1 · IN · HDMI → (-60, 13, -52) หลัง
  - `hdmi-in-2` HDMI IN 2 · IN · HDMI → (-37, 13, -52) หลัง
  - `hdmi-in-3` HDMI IN 3 · IN · HDMI → (-14, 13, -52) หลัง
  - `hdmi-in-4` HDMI IN 4 · IN · HDMI → (8, 13, -52) หลัง
  - `hdmi-out` HDMI OUT · OUT · HDMI → (32, 13, -52) หลัง
  - `mic-1` MIC IN 1 (3.5 mm) · IN · 3.5mm → (-89, 13, -52) หลัง
  - `mic-2` MIC IN 2 (3.5 mm) · IN · 3.5mm → (-78, 13, -52) หลัง
  - `usb` USB-C · OUT · USB-C → (52, 11, -52) หลัง
  - `eth` ETHERNET · OUT · ETHERNET → (70, 16, -52) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (1):** POWER (12V DC, locking)
- **ใช้ในด่าน:**
  - sw: xs-1, xs-3, xs-4, xs-5
- **หยิบ/วางได้ใน:** xs-1, xs-3, xs-4, xs-5

### 2. Blackmagic Design ATEM Television Studio HD8 ISO — `bmd-atem-television-studio-hd8-iso`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 584 × 161 × 376 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.4 → ในฉาก 0.818 × 0.225 × 0.526 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/atemtelevisionstudio/techspecs/physical-specifications/atem-television-studio-hd8-iso-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/atemtelevisionstudio/techspecs/connections/atem-television-studio-hd8-iso@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in-1` SDI IN 1 · IN · SDI → (63, 20, -160) หลัง
  - `sdi-in-2` SDI IN 2 · IN · SDI → (46, 20, -160) หลัง
  - `sdi-in-3` SDI IN 3 · IN · SDI → (28, 20, -160) หลัง
  - `sdi-in-4` SDI IN 4 · IN · SDI → (10, 20, -160) หลัง
  - `sdi-in-5` SDI IN 5 · IN · SDI → (-8, 20, -160) หลัง
  - `sdi-in-6` SDI IN 6 · IN · SDI → (-25, 20, -160) หลัง
  - `sdi-in-7` SDI IN 7 · IN · SDI → (-43, 20, -160) หลัง
  - `sdi-in-8` SDI IN 8 · IN · SDI → (-60, 20, -160) หลัง
  - `ref-in` REF IN (BNC) · IN · SDI → (197, 20, -160) หลัง
  - `pgm-out` SDI OUT · PROGRAM · OUT · SDI → (-101, 39, -160) หลัง
  - `aux-1` SDI OUT · AUX 1 · OUT · SDI → (-84, 39, -160) หลัง
  - `aux-2` SDI OUT · AUX 2 · OUT · SDI → (-84, 20, -160) หลัง
  - `mv-out` SDI OUT · MULTIVIEW · OUT · SDI → (-101, 20, -160) หลัง
  - `hdmi-mv` HDMI OUT · MULTIVIEW · OUT · HDMI → (-118, 29, -160) หลัง
  - `xlr-l` XLR AUDIO IN 1 (balanced) · IN · XLR → (-201, 29, -160) หลัง
  - `xlr-r` XLR AUDIO IN 2 (balanced) · IN · XLR → (-225, 29, -160) หลัง
  - `usb-1` USB-C 1 · OUT · USB-C → (140, 39, -160) หลัง
  - `usb-2` USB-C 2 · OUT · USB-C → (125, 39, -160) หลัง
  - `eth` ETHERNET · OUT · ETHERNET → (135, 18, -160) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (27):** SDI OUTPUT 1, SDI OUTPUT 2, SDI OUTPUT 3, SDI OUTPUT 4, SDI OUTPUT 5, SDI OUTPUT 6, SDI OUTPUT 7, SDI OUTPUT 8, REF OUT, TIMECODE OUT, TIMECODE IN, MADI OUT, MADI IN, REMOTE, TALKBACK (RJ45), ETHERNET 2, ETHERNET 3, ETHERNET 4, CONTROL OUT L, CONTROL OUT R, STUDIO OUT L, STUDIO OUT R, STEREO IN L, STEREO IN R, TALKBACK (XLR 5-pin), AC IN, 12–30V DC
- **ใช้ในด่าน:**
  - sw: l-1, l-3, l-4, l-5, m-1, m-2, m-3, m-4, m-5
- **หยิบ/วางได้ใน:** l-1, l-3, l-4, l-5, m-1, m-2, m-3, m-4, m-5
- **ค่าประมาณ:**
  - ความลึกของโปรไฟล์ด้านข้างปรับตามความลึกทางการ 14.8 in (รูปด้านข้างวัดได้ 350 mm)
  - ตำแหน่งปุ่มบนพื้นหน้าเครื่องอ่านจากรูปมุมเฉียง (±3 mm)

### 3. Blackmagic Design ATEM 2 M/E Constellation 4K — `bmd-atem-2me-constellation-4k`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 483 × 44 × 234 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.4 → ในฉาก 0.676 × 0.062 × 0.328 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/atemconstellation/techspecs/physical-specifications/atem-2me-constellation-4k-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/atemconstellation/techspecs/connections/atem-2me-constellation-4k@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in-1` 12G-SDI IN 1 · IN · SDI → (120, 31, -117) หลัง
  - `sdi-in-2` 12G-SDI IN 2 · IN · SDI → (120, 12, -117) หลัง
  - `sdi-in-3` 12G-SDI IN 3 · IN · SDI → (102, 31, -117) หลัง
  - `sdi-in-4` 12G-SDI IN 4 · IN · SDI → (102, 12, -117) หลัง
  - `sdi-in-5` 12G-SDI IN 5 · IN · SDI → (84, 31, -117) หลัง
  - `sdi-in-6` 12G-SDI IN 6 · IN · SDI → (84, 12, -117) หลัง
  - `sdi-in-7` 12G-SDI IN 7 · IN · SDI → (66, 31, -117) หลัง
  - `sdi-in-8` 12G-SDI IN 8 · IN · SDI → (66, 12, -117) หลัง
  - `sdi-in-9` 12G-SDI IN 9 · IN · SDI → (47, 31, -117) หลัง
  - `sdi-in-10` 12G-SDI IN 10 · IN · SDI → (47, 12, -117) หลัง
  - `sdi-in-11` 12G-SDI IN 11 · IN · SDI → (29, 31, -117) หลัง
  - `sdi-in-12` 12G-SDI IN 12 · IN · SDI → (29, 12, -117) หลัง
  - `sdi-in-13` 12G-SDI IN 13 · IN · SDI → (11, 31, -117) หลัง
  - `sdi-in-14` 12G-SDI IN 14 · IN · SDI → (11, 12, -117) หลัง
  - `sdi-in-15` 12G-SDI IN 15 · IN · SDI → (-7, 31, -117) หลัง
  - `sdi-in-16` 12G-SDI IN 16 · IN · SDI → (-7, 12, -117) หลัง
  - `sdi-in-17` 12G-SDI IN 17 · IN · SDI → (-25, 31, -117) หลัง
  - `sdi-in-18` 12G-SDI IN 18 · IN · SDI → (-25, 12, -117) หลัง
  - `sdi-in-19` 12G-SDI IN 19 · IN · SDI → (-42, 31, -117) หลัง
  - `sdi-in-20` 12G-SDI IN 20 · IN · SDI → (-42, 12, -117) หลัง
  - `sdi-out-1` 12G-SDI OUT 1 · OUT · SDI → (-63, 31, -117) หลัง
  - `sdi-out-2` 12G-SDI OUT 2 · OUT · SDI → (-63, 12, -117) หลัง
  - `sdi-out-3` 12G-SDI OUT 3 · OUT · SDI → (-81, 31, -117) หลัง
  - `sdi-out-4` 12G-SDI OUT 4 · OUT · SDI → (-81, 12, -117) หลัง
  - `sdi-out-5` 12G-SDI OUT 5 · OUT · SDI → (-99, 31, -117) หลัง
  - `sdi-out-6` 12G-SDI OUT 6 · OUT · SDI → (-99, 12, -117) หลัง
  - `sdi-out-7` 12G-SDI OUT 7 · OUT · SDI → (-117, 31, -117) หลัง
  - `sdi-out-8` 12G-SDI OUT 8 · OUT · SDI → (-117, 12, -117) หลัง
  - `sdi-out-9` 12G-SDI OUT 9 · OUT · SDI → (-135, 31, -117) หลัง
  - `sdi-out-10` 12G-SDI OUT 10 · OUT · SDI → (-135, 12, -117) หลัง
  - `sdi-out-11` 12G-SDI OUT 11 · OUT · SDI → (-152, 31, -117) หลัง
  - `sdi-out-12` 12G-SDI OUT 12 · OUT · SDI → (-152, 12, -117) หลัง
  - `mv-out` MULTIVIEW 1 (12G-SDI) · OUT · SDI → (-172, 31, -117) หลัง
  - `mv-out-2` MULTIVIEW 2 (12G-SDI) · OUT · SDI → (-172, 12, -117) หลัง
  - `xlr-l` ANALOG IN 1 · balanced 1/4" TRS · IN · 6.35mm → (-199, 32, -117) หลัง
  - `xlr-r` ANALOG IN 2 · balanced 1/4" TRS · IN · 6.35mm → (-199, 12, -117) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (6):** AC IN, CONTROL (Ethernet), USB-C, TALKBACK (RJ45), REF IN, TALKBACK HEADSET (XLR 5-pin)
- **ใช้ในด่าน:**
  - sw: xl-1, xl-2, xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** xl-1, xl-2, xl-3, xl-4, xl-5

### 4. Blackmagic Design Videohub 20x20 12G — `bmd-videohub-20x20-12g`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 483 × 44 × 236 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.4 → ในฉาก 0.676 × 0.062 × 0.330 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicvideohub/techspecs/physical-specifications/blackmagic-videohub-20x20-12g-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicvideohub/techspecs/connections/blackmagic-videohub-20x20-12g@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `in-1` SDI IN 1 · IN · SDI → (140, 28, -118) หลัง
  - `out-1` SDI OUT 1 · OUT · SDI → (-43, 28, -118) หลัง
  - `in-2` SDI IN 2 · IN · SDI → (140, 11, -118) หลัง
  - `out-2` SDI OUT 2 · OUT · SDI → (-43, 11, -118) หลัง
  - `in-3` SDI IN 3 · IN · SDI → (123, 28, -118) หลัง
  - `out-3` SDI OUT 3 · OUT · SDI → (-61, 28, -118) หลัง
  - `in-4` SDI IN 4 · IN · SDI → (123, 11, -118) หลัง
  - `out-4` SDI OUT 4 · OUT · SDI → (-61, 11, -118) หลัง
  - `in-5` SDI IN 5 · IN · SDI → (105, 28, -118) หลัง
  - `out-5` SDI OUT 5 · OUT · SDI → (-79, 28, -118) หลัง
  - `in-6` SDI IN 6 · IN · SDI → (105, 11, -118) หลัง
  - `out-6` SDI OUT 6 · OUT · SDI → (-79, 11, -118) หลัง
  - `in-7` SDI IN 7 · IN · SDI → (86, 28, -118) หลัง
  - `out-7` SDI OUT 7 · OUT · SDI → (-97, 28, -118) หลัง
  - `in-8` SDI IN 8 · IN · SDI → (86, 11, -118) หลัง
  - `out-8` SDI OUT 8 · OUT · SDI → (-97, 11, -118) หลัง
  - `in-9` SDI IN 9 · IN · SDI → (68, 28, -118) หลัง
  - `out-9` SDI OUT 9 · OUT · SDI → (-115, 28, -118) หลัง
  - `in-10` SDI IN 10 · IN · SDI → (68, 11, -118) หลัง
  - `out-10` SDI OUT 10 · OUT · SDI → (-115, 11, -118) หลัง
  - `in-11` SDI IN 11 · IN · SDI → (51, 28, -118) หลัง
  - `out-11` SDI OUT 11 · OUT · SDI → (-133, 28, -118) หลัง
  - `in-12` SDI IN 12 · IN · SDI → (51, 11, -118) หลัง
  - `out-12` SDI OUT 12 · OUT · SDI → (-133, 11, -118) หลัง
  - `in-13` SDI IN 13 · IN · SDI → (33, 28, -118) หลัง
  - `out-13` SDI OUT 13 · OUT · SDI → (-151, 28, -118) หลัง
  - `in-14` SDI IN 14 · IN · SDI → (33, 11, -118) หลัง
  - `out-14` SDI OUT 14 · OUT · SDI → (-151, 11, -118) หลัง
  - `in-15` SDI IN 15 · IN · SDI → (15, 28, -118) หลัง
  - `out-15` SDI OUT 15 · OUT · SDI → (-169, 28, -118) หลัง
  - `in-16` SDI IN 16 · IN · SDI → (15, 11, -118) หลัง
  - `out-16` SDI OUT 16 · OUT · SDI → (-169, 11, -118) หลัง
  - `in-17` SDI IN 17 · IN · SDI → (-4, 28, -118) หลัง
  - `out-17` SDI OUT 17 · OUT · SDI → (-186, 28, -118) หลัง
  - `in-18` SDI IN 18 · IN · SDI → (-4, 11, -118) หลัง
  - `out-18` SDI OUT 18 · OUT · SDI → (-186, 11, -118) หลัง
  - `in-19` SDI IN 19 · IN · SDI → (-20, 28, -118) หลัง
  - `out-19` SDI OUT 19 · OUT · SDI → (-204, 28, -118) หลัง
  - `in-20` SDI IN 20 · IN · SDI → (-20, 11, -118) หลัง
  - `out-20` SDI OUT 20 · OUT · SDI → (-204, 11, -118) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (5):** AC IN, REF IN, REF OUT, ETHERNET, USB
- **ใช้ในด่าน:**
  - router: xl-1, xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)

### 5. Blackmagic Design Streaming Encoder HD — `bmd-streaming-encoder-hd`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 140 × 44 × 175 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.6 → ในฉาก 0.224 × 0.071 × 0.280 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicstreamingprocessors/techspecs/physical-specifications/blackmagic-streaming-encoder-hd-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicstreamingprocessors/techspecs/connections/blackmagic-streaming-encoder-hd.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in` SDI IN · IN · SDI → (-57, 14, -88) หลัง
  - `sdi-loop` SDI LOOP OUT · OUT · SDI → (-57, 32, -88) หลัง
  - `sdi-mon` SDI MONITOR OUT · OUT · SDI → (-35, 32, -88) หลัง
  - `hdmi-mon` HDMI MONITOR OUT · OUT · HDMI → (-38, 12, -88) หลัง
  - `eth` ETHERNET (stream) · OUT · ETHERNET → (2, 16, -88) หลัง
  - `usb` USB-C (webcam) · OUT · USB-C → (-17, 11, -88) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (3):** AC IN, 12V DC, USB-C (front)
- **ใช้ในด่าน:**
  - enc: l-4, l-5
  - enc (แร็ค): xl-4, xl-5
  - enc2 (แร็ค): xl-4, xl-5
- **หยิบ/วางได้ใน:** l-4, l-5

### 6. Blackmagic Design HyperDeck Studio HD Plus — `bmd-hyperdeck-studio-hd-plus`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 210 × 44 × 177 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.6 → ในฉาก 0.336 × 0.071 × 0.283 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/hyperdeckstudio/techspecs/physical-specifications/hyperdeck-studio-hd-plus-imperial.jpg
  - https://images.blackmagicdesign.com/images/products/hyperdeckstudio/techspecs/connections/hyperdeck-studio-hd-plus.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in` SDI IN · IN · SDI → (-73, 16, -88) หลัง
  - `sdi-out` SDI OUT A · OUT · SDI → (-73, 33, -88) หลัง
  - `sdi-out-2` SDI OUT B · OUT · SDI → (-91, 33, -88) หลัง
  - `sdi-loop` SDI LOOP OUT · OUT · SDI → (-91, 16, -88) หลัง
  - `sdi-mon` SDI MONITOR OUT · OUT · SDI → (3, 16, -88) หลัง
  - `hdmi-in` HDMI IN · IN · HDMI → (-58, 12, -88) หลัง
  - `hdmi-out` HDMI OUT · OUT · HDMI → (-58, 30, -88) หลัง
  - `eth` ETHERNET · OUT · ETHERNET → (38, 15, -88) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (12):** AC IN, 10–14V DC, REMOTE IN (RS-422), REMOTE OUT (RS-422), EXT DISK (USB-C), REF OUT, REF IN, TIMECODE OUT, TIMECODE IN, HEADPHONE, SD CARD 1, SD CARD 2
- **ใช้ในด่าน:**
  - rec: m-5
  - rec (แร็ค): xl-4, xl-5
- **หยิบ/วางได้ใน:** m-5

### 7. Blackmagic Design Micro Converter HDMI to SDI 3G — `bmd-micro-converter-hdmi-sdi-3g`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 80 × 25 × 46 mm (กว้าง × สูง × ลึก)
- **display scale:** ×2.5 → ในฉาก 0.199 × 0.062 × 0.114 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/microconverters/techspecs/physical-specifications/micro-converter-hdmi-to-sdi-3g-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/microconverters/techspecs/connections/micro-converter-hdmi-to-sdi-3g.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `hdmi-in` HDMI IN · IN · HDMI → (40, 9, -6) ขวา
  - `sdi-out` SDI OUT 1 · OUT · SDI → (-40, 13, -11) ซ้าย
  - `sdi-out-2` SDI OUT 2 · OUT · SDI → (-40, 13, 11) ซ้าย
  - `usb-pwr` USB-C POWER · IN · USB-C → (40, 14, 13) ขวา
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (0):** —
- **ใช้ในด่าน:**
  - convHS: m-3, m-4, m-5, xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** m-3, m-4, m-5, xl-3, xl-4, xl-5
- **ค่าประมาณ:**
  - ตำแหน่งหัวต่อบนปลายทั้งสองอ่านจากรูปมุมเฉียง (±2 mm) ส่วนลำดับ BNC (ขาเข้า/loop) อ่านจากป้ายในรูป

### 8. Blackmagic Design Micro Converter SDI to HDMI 3G — `bmd-micro-converter-sdi-hdmi-3g`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 80 × 25 × 46 mm (กว้าง × สูง × ลึก)
- **display scale:** ×2.5 → ในฉาก 0.199 × 0.062 × 0.114 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/microconverters/techspecs/physical-specifications/micro-converter-sdi-to-hdmi-3g-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/microconverters/techspecs/connections/micro-converter-sdi-to-hdmi-3g.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in` SDI IN · IN · SDI → (-40, 13, -11) ซ้าย
  - `hdmi-out` HDMI OUT · OUT · HDMI → (40, 9, -6) ขวา
  - `sdi-loop` SDI LOOP OUT · OUT · SDI → (-40, 13, 11) ซ้าย
  - `usb-pwr` USB-C POWER · IN · USB-C → (40, 14, 13) ขวา
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (0):** —
- **ใช้ในด่าน:**
  - convSH: m-1, m-3, m-4, m-5
- **หยิบ/วางได้ใน:** m-1, m-3, m-4, m-5
- **ค่าประมาณ:**
  - ตำแหน่งหัวต่อบนปลายทั้งสองอ่านจากรูปมุมเฉียง (±2 mm) ส่วนลำดับ BNC (ขาเข้า/loop) อ่านจากป้ายในรูป

### 9. Blackmagic Design SmartView Duo — `bmd-smartview-duo`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 483 × 133 × 35 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.3 → ในฉาก 0.627 × 0.173 × 0.046 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/smartview/techspecs/physical-specifications/smartview-duo-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/smartview/techspecs/connections/smartview-duo@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in` SDI IN (จอ A) · IN · SDI → (-75, 37, -17) หลัง
  - `sdi-loop` SDI LOOP OUT (จอ A) · OUT · SDI → (-95, 37, -17) หลัง
  - `sdi-in-b` SDI IN (จอ B) · IN · SDI → (95, 37, -17) หลัง
  - `sdi-loop-b` SDI LOOP OUT (จอ B) · OUT · SDI → (75, 37, -17) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (5):** TALLY, ETHERNET IN, ETHERNET OUT, USB 2.0, POWER +12V
- **ใช้ในด่าน:**
  - monitor: l-1, l-3, l-4, l-5, m-3, m-4, m-5, xl-1, xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)

### 10. Blackmagic Design Studio Camera 4K Plus G2 — `bmd-studio-camera-4k-plus-g2`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 274 × 167 × 170 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.5 → ในฉาก 0.410 × 0.251 × 0.255 m บนหัวขาตั้งสูง 1.12 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicstudiocamera/techspecs/physical-specifications/blackmagic-studio-camera-4k-plus-g2-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicstudiocamera/techspecs/connections/blackmagic-studio-camera-4k-plus-g2.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `hdmi-out` HDMI OUT · OUT · HDMI → (95, 106, -21) ขวา
  - `sdi-out` SDI OUT · OUT · SDI → (95, 84, -19) ขวา
  - `sdi-ret` SDI IN (program return) · IN · SDI → (95, 69, -19) ขวา
  - `mic-35` 3.5 mm STEREO IN · IN · 3.5mm → (-95, 12, -33) ซ้าย
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (4):** +12V DC (locking barrel), USB-C 1, USB-C 2, 3.5mm HEADPHONE
- **ใช้ในด่าน:**
  - cam1 (ขาตั้ง): xs-1, xs-3, xs-4, xs-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)
- **ค่าประมาณ:**
  - สัดส่วนชิ้นส่วนตัวกล้อง (ตัวเครื่อง จอหลัง มือจับ) ประมาณจากรูป ขนาดรวมตรงตามทางการ
  - หัวต่อด้านซ้าย (USB-C, 3.5 mm, XLR) วางตามแผนภาพ connections (±5 mm)
  - รูป physical ของ 4K Plus G2 ไม่แสดง SDI แต่สเปกและแผนภาพยืนยันว่ามี จึงวางตามคอลัมน์เดียวกับ 4K Pro G2

### 11. Blackmagic Design Studio Camera 4K Pro G2 — `bmd-studio-camera-4k-pro-g2`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 274 × 167 × 170 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.5 → ในฉาก 0.410 × 0.251 × 0.255 m บนหัวขาตั้งสูง 1.12 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicstudiocamera/techspecs/physical-specifications/blackmagic-studio-camera-4k-pro-g2-imperial@2x.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicstudiocamera/techspecs/connections/blackmagic-studio-camera-4k-pro-g2@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-out` 12G-SDI OUT · OUT · SDI → (95, 84, -19) ขวา
  - `sdi-ret` 12G-SDI IN (RETURN) · IN · SDI → (95, 69, -19) ขวา
  - `hdmi-out` HDMI OUT (monitor) · OUT · HDMI → (95, 106, -21) ขวา
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (10):** +12V DC (locking barrel), ETHERNET, +12V DC (XLR 4-pin), XLR AUDIO IN 1, XLR AUDIO IN 2, TALKBACK HEADSET, 3.5mm MIC IN, USB-C 1, USB-C 2, 3.5mm HEADPHONE (with mic)
- **ใช้ในด่าน:**
  - cam1 (ขาตั้ง): l-1, l-3, l-4, l-5, m-1, m-3, m-4, m-5
  - cam2 (ขาตั้ง): l-3, l-4, l-5, m-3, m-4, m-5
  - cam3 (ขาตั้ง): l-3, l-4, l-5, m-3, m-4, m-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)
- **ค่าประมาณ:**
  - สัดส่วนชิ้นส่วนตัวกล้อง (ตัวเครื่อง จอหลัง มือจับ) ประมาณจากรูป ขนาดรวมตรงตามทางการ
  - หัวต่อด้านซ้าย (USB-C, 3.5 mm, XLR) วางตามแผนภาพ connections (±5 mm)

### 12. Blackmagic Design URSA Broadcast G2 — `bmd-ursa-broadcast-g2`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 150 × 252 × 278 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.5 → ในฉาก 0.225 × 0.378 × 0.417 m บนหัวขาตั้งสูง 1.12 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicursabroadcast/techspecs/physical-specifications/blackmagic-ursa-broadcast-g2-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicursabroadcast/techspecs/connections/blackmagic-ursa-broadcast-g2@2x.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-out` 12G-SDI OUT · OUT · SDI → (53, 147, 139) หน้า
  - `sdi-mon` SDI MONITOR OUT · OUT · SDI → (75, 130, -43) ขวา
  - `sdi-ret` SDI IN (RETURN) · IN · SDI → (53, 131, 139) หน้า
  - `xlr-1` AUDIO IN 1 · XLR (MIC/LINE/AES) · IN · XLR → (-18, 182, -60) บน
  - `xlr-2` AUDIO IN 2 · XLR (MIC/LINE/AES) · IN · XLR → (18, 182, -60) บน
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (7):** HEADPHONE, REF IN / TIMECODE IN, +12V POWER IN (XLR 4-pin), USB-C, +12V POWER OUT, LANC, BROADCAST LENS
- **ใช้ในด่าน:**
  - cam1 (ขาตั้ง): xl-1, xl-3, xl-4, xl-5
  - cam2 (ขาตั้ง): xl-3, xl-4, xl-5
  - cam3 (ขาตั้ง): xl-3, xl-4, xl-5
  - cam4 (ขาตั้ง): xl-3, xl-4, xl-5
  - cam5 (ขาตั้ง): xl-3, xl-4, xl-5
  - cam6 (ขาตั้ง): xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)
- **ค่าประมาณ:**
  - ขั้ว XLR AUDIO IN สองช่องบนหลังตัวกล้องวางตามแผนภาพ connections (±10 mm)
  - สัดส่วนตัวกล้อง มือจับ และเลนส์ประมาณจากรูป ขนาดรวมตรงตามทางการ

### 13. Blackmagic Design Camera Fiber Converter — `bmd-camera-fiber-converter`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 138 × 191 × 140 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.5 → ในฉาก 0.207 × 0.286 × 0.210 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-camera-fiber-converter-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/connections/blackmagic-camera-fiber-converter.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `sdi-in` 12G SDI IN · CAMERA FEED · IN · SDI → (69, 88, -1) ขวา
  - `fiber` SMPTE 304 FIBER (MALE) · OUT · FIBER → (69, 91, 31) ขวา
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (13):** USB-C, 3G SDI OUT, REF OUT, ETHERNET, HEADSET 1, HEADSET 2, XLR AUDIO IN 1, XLR AUDIO IN 2, 3G SDI RETURN OUT 1, 3G SDI RETURN OUT 2, 3G SDI RETURN OUT 3, TRACKER, DC OUT
- **ใช้ในด่าน:**
  - cfc1: xl-1, xl-3, xl-4, xl-5
  - cfc2: xl-3, xl-4, xl-5
  - cfc3: xl-3, xl-4, xl-5
  - cfc4: xl-3, xl-4, xl-5
  - cfc5: xl-3, xl-4, xl-5
  - cfc6: xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)
- **ค่าประมาณ:**
  - แผงหลังฝั่งผู้ควบคุม (headset, XLR, SDI return, ปุ่ม) วางตามแผนภาพ connections (±5 mm)
  - ด้าน D-tap / RET / CALL / PTZ ไม่ได้ปั้นหัวต่อ (เป็นปุ่มและฝาครอบ)

### 14. Blackmagic Design Studio Fiber Converter — `bmd-studio-fiber-converter`
- **สถานะ:** ✅ ทำโมเดลแล้ว (renderer กลาง `hardware-model.tsx`)
- **ขนาดจริง:** 210 × 88 × 372 mm (กว้าง × สูง × ลึก)
- **display scale:** ×1.3 → ในฉาก 0.273 × 0.115 × 0.483 m
- **แหล่งอ้างอิง:**
  - https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-studio-fiber-converter-imperial-xl.jpg
  - https://images.blackmagicdesign.com/images/products/blackmagicfiberconverters/techspecs/connections/blackmagic-studio-fiber-converter.png
- **พอร์ตที่ต่อสายได้ (registry → ตำแหน่งจริง mm, x/สูง/z, หน้า):**
  - `fiber` SMPTE 304 FIBER (FEMALE) · IN · FIBER → (-58, 60, 186) หน้า
  - `sdi-out` 12G SDI OUT 1 · OUT · SDI → (-49, 36, -186) หลัง
  - `sdi-out-2` 12G SDI OUT 2 · OUT · SDI → (-69, 36, -186) หลัง
- **หัวต่อจริงที่ปั้นไว้แต่เสียบไม่ได้ (15):** RETURN IN 1, RETURN IN 2, RETURN IN 3, REF OUT, REF IN, AC IN, INTERCOM / TALLY, PTZ, OPTICAL I/O, ETHERNET, AUDIO ANALOG OUT 1, AUDIO ANALOG OUT 2, AUDIO ANALOG OUT 3, AUDIO ANALOG OUT 4, USB-C
- **ใช้ในด่าน:**
  - ccu1: xl-1, xl-3, xl-4, xl-5
  - ccu2: xl-3, xl-4, xl-5
  - ccu3: xl-3, xl-4, xl-5
  - ccu4: xl-3, xl-4, xl-5
  - ccu5: xl-3, xl-4, xl-5
  - ccu6: xl-3, xl-4, xl-5
- **หยิบ/วางได้ใน:** ไม่ได้ (ติดตั้งถาวร / บนขาตั้ง / ในแร็ค ตามกติกาเดิม)


## กฎฮาร์ดแวร์สำคัญ (คงไว้และมีเทสต์)
- **HyperDeck Studio HD Plus:**
  - SDI OUT A (`sdi-out`), SDI OUT B (`sdi-out-2`), SDI LOOP OUT (`sdi-loop`) และ 3G MONITOR OUT (`sdi-mon`) อยู่ 4 ตำแหน่งแยกกันตามรูปแผงหลัง
  - ขาเข้าบันทึกมี SDI 1 ช่องและ HDMI 1 ช่อง เลือกได้ทีละแหล่ง **ไม่มี ISO 4 ช่อง**
- **Micro Converter:** ไม่สลับกัน
  - HDMI→SDI: `hdmi-in` + SDI OUT ×2
  - SDI→HDMI: `sdi-in` + `sdi-loop` + `hdmi-out`
- **SmartView Duo:** จอ 2 จอแยกอิสระ จอซ้าย (มองจากหน้า) = Monitor 1 แสดงสัญญาณจาก `sdi-in` ส่วนจอขวา = Monitor 2 แสดงจาก `sdi-in-b`
- **Studio Camera:**
  - **4K Plus G2:** HDMI, SDI OUT, SDI IN, 3.5 mm MIC, +12V DC, USB-C ×2, หูฟัง
  - **4K Pro G2:** มีเพิ่ม Ethernet, XLR ×2, Talkback XLR 5 ขา และ +12V XLR 4 ขา (ปั้นไว้แต่เสียบไม่ได้)
- **URSA Broadcast G2 / Camera Fiber Converter / Studio Fiber Converter:**
  - แยกเป็น 3 โมเดล
  - CFC ติดชิดหลัง URSA โดยแผ่นติดกล้องอยู่ฝั่ง −Z
  - SFC อยู่ที่ชั้นแร็ค CCU ตำแหน่งเดิม

## ระบบโต้ตอบ
| ระบบ | สถานะ |
|---|---|
| เลือก/เล็ง | ใช้ `DeviceVisual` + เป้าพอร์ตเดิม ตำแหน่งพอร์ตตรงกับ socket ในโมเดล (เทสต์ตรวจทุกพอร์ตทุกด่าน คลาดไม่เกิน 2 mm) |
| หยิบ วาง หมุน | ใช้ระบบ placeable เดิม รุ่นที่เคยหยิบได้ยังหยิบได้ (ตรวจจาก audit) |
| กดค้าง 2 วินาทีเพื่อดู | inspector เรียก `DeviceVisual bare` จึงแสดงโมเดลใหม่ (กล้องแสดงพร้อมขาตั้ง เหมือน HC-X2000 เดิม) |
| เสียบ/ถอดสาย | ใช้พอร์ต id เดิม และไม่เปลี่ยนกติกา `canConnect` |
| power และการควบคุม | ยังสั่งผ่านแผงควบคุมเดิม ส่วนโมเดล**แสดงผล**ตามสถานะ: ไฟปุ่ม PGM แดง / PVW เขียว (TVS, Constellation), ON AIR (Encoder), REC/PLAY (HyperDeck), จอแสดงภาพหรือสถานะเมื่อเปิดเครื่อง, tally กล้องเป็นสีแดงเมื่อขึ้น PGM |
| พอร์ตเฉพาะอุปกรณ์ | พอร์ต registry ต่อสายได้ ส่วนหัวต่อจริงอื่นไม่มีเป้า |
| collision | `CuboidCollider` ใช้ `device.size` = ขนาดจริง × scale (กล้องใช้ footprint ขาตั้งเดิม, ทาวเวอร์ SP ใช้ 0.56 × 1.7 × 0.56 m เดิม) |
| save/resume | ✅ `contentSignature` ไม่เปลี่ยน (id พอร์ต สาย และ placeable เดิม) audit ของ 25 ด่านตรงกับก่อนเปลี่ยนทุกฟิลด์ จึงไม่ต้องมีข้อความ migration |

## ผลตรวจ (หลังทำครบทั้ง 3 batch)
| รายการ | ผล |
|---|---|
| TypeScript (`tsc --noEmit`) | ✅ ผ่าน (exit 0) |
| ESLint ไฟล์ที่แก้ | ✅ 0 error 0 warning |
| เทสต์ใหม่ `phase04-hardware-models` | ✅ 5/5 |
| registry ↔ 3D | ✅ ทุกพอร์ตของ 14 รุ่นมี socket เดียว ชนิดหัวต่อตรง และไม่มีพอร์ตเกิน |
| edge 331 เส้น | ✅ 331/331 ใช้ได้ (กราฟเหมือนเดิม) |
| admin loadout 25 ด่าน | ✅ ไม่มีข้อผิดพลาด |
| save | ✅ audit ของ 25 ด่านตรงกับก่อนเปลี่ยน |
| `npm test`: ข้อล้มเหลวเดิม (baseline) | 19 ข้อเดิม และข้อ "three meaningful errors…" ยังผ่าน |
| `npm test`: ข้อล้มเหลวใหม่ | 3 ข้อใน `tests/arena-server.test.mjs` (ชื่อซ้ำ, admin search, forged finish) **ไม่ได้เกิดจากงานนี้** (ดูหมายเหตุด้านล่าง) |

**หมายเหตุเรื่อง arena:**
- **ต้นเหตุ:** ข้อล้มเหลวมาจากตรรกะเซิร์ฟเวอร์ Arena ("ชื่อนี้มีผู้ใช้แล้ว…", "กรุณายืนยันชุดสายก่อนเริ่มจับเวลา")
- **หลักฐาน:** มีงาน Arena V9 ที่แก้พร้อมกันใน session อื่น เพราะ `ONLINE_RANKED_V9_IMPLEMENTATION_TH.md` และ `SECURITY.md` เปลี่ยนระหว่างที่ทำงานนี้
- **ขอบเขตงานนี้:** ไม่ได้แตะไฟล์ arena และข้อมูลด่านกับชุดสายใน audit ไม่เปลี่ยน

**regression ที่พบระหว่างทำและแก้แล้ว:**
- **อาการ:** เมื่อขยาย TVS HD8 ISO (×1.4 = 0.82 m) และ Constellation (0.68 m) กติกาเดิม "ยกได้ถ้าด้านยาว ≤ 0.65 m" ทำให้ทั้งสองรุ่นยกไม่ได้
- **วิธีแก้:** ให้กติกานี้ใช้**ขนาดจริง**ของรุ่นที่มีโมเดล (584 / 483 mm) ผลจึงกลับมาตรงกับเดิมทุกด่าน

## ประสิทธิภาพ
- **geometry/material:** กล่องและทรงกระบอกใช้ geometry ชุดเดียว และ material cache ตามสี ใช้ร่วมกันทุกเครื่องทุก instance
- **ต่อ instance:** สร้างใหม่เฉพาะ ExtrudeGeometry ของตัวเครื่อง TVS/Mini Pro
- **store:** subscribe เฉพาะค่าที่ต้องแสดง (config ของอุปกรณ์นั้น, จอ, tally)
- ⚠️ **ด่าน SP มีป้ายข้อความ (troika text) ประมาณ 200 ชิ้น** จาก URSA ×6, CFC ×6, SFC ×6, Constellation และ Videohub ถ้า iPhone/iPad ช้า ให้ลดป้ายบนปุ่มของ Constellation/Videohub ก่อน

## ข้อจำกัดที่เหลือ
1. **ยังไม่ได้ทดสอบภาพจริง:** ต้องให้เจ้าของตรวจตามเอกสาร 17
2. **รายละเอียดรูปทรงเป็นค่าประมาณจากรูป:** ขนาดรวมตรงตามทางการ แต่มุมโค้ง ร่องระบาย มือจับ และเลนส์ประมาณจากรูป (ดู `estimates` ของแต่ละรุ่น)
3. **หัวต่อที่อ่านจากรูปมุมเฉียง (คลาด ±2–10 mm):** Micro Converter, ด้านซ้ายของ Studio Camera, XLR บน URSA และแผงหลัง CFC
4. **Studio Camera 4K Plus G2:** รูป physical ทางการไม่แสดง SDI แต่สเปกตัวอักษร ("SDI Video Inputs 1 / Outputs 1") และแผนภาพ connections ยืนยันว่ามี จึงวางตามคอลัมน์ของ 4K Pro G2
5. **ปุ่มบนโมเดล:** แสดงผลอย่างเดียว ยังกดบนตัวเครื่องไม่ได้ (ใช้แผงควบคุมเดิม)
6. **SmartView Duo:** วางตั้งบนโต๊ะแบบเดิม ไม่ได้เพิ่มแร็คเพื่อไม่ให้ผังห้องเปลี่ยน
7. **HyperDeck/Encoder ในด่าน SP:** อยู่ในแร็คทาวเวอร์ 1.7 m เดิม ตัวเครื่องติดที่ความสูง 1.0 m และแผงหลังชิดด้านหลังแร็ค
8. **สถานะไฟล์สเปก:** `assets/specs/*/3D_MODELING_SPEC_TH.md` ของ 13 รุ่นยังเป็นสถานะเดิม ให้ถือเอกสารนี้เป็นสถานะล่าสุด
