# 17 · Phase 04: รายการตรวจของเจ้าของ (ทดสอบรวมครั้งเดียว)

วันที่: 2026-10-20 · สถานะทุกข้อ: **NOT YET TESTED** · รายละเอียดอ้างอิงอยู่ใน `16_PHASE04_ALL_14_MODELS_IMPLEMENTATION_TH.md`

**ลำดับการทดสอบ:** XS → AU → OUT → SP → ST/Free Practice (ตรวจว่าไม่เปลี่ยน) → save → อุปกรณ์อื่น แต่ละสถานที่ใช้ด่านที่มีอุปกรณ์ครบที่สุด เพื่อไม่ต้องเข้าซ้ำ

**ข้อตรวจร่วมทุกโมเดล (ใช้ทุกครั้งที่ตรวจข้อ "รูปลักษณ์"):**
- รูปทรง สี ปุ่ม จอ และป้ายตรงกับรูปทางการ
- สัดส่วนถูกต้อง: ขยายเท่ากันทุกแกน ไม่ยืดหรือบี้
- หัวต่อเรียงตามรูปแผงจริง
- หัวต่อที่ไม่ใช้ในด่านมองเห็นได้ แต่**ไม่มี**วงเป้าและเสียบไม่ได้

## 1. XS (ห้องเรียน) · ด่าน XS-05 (เสริมด้วย XS-01)
| # | รายการ | ผล |
|---|---|---|
| XS-1 | ATEM Mini Pro: รูปลักษณ์, ปุ่มด้านบน, ป้าย "ATEM Mini Pro" | NOT YET TESTED |
| XS-2 | ATEM Mini Pro: หลังเครื่องเรียง (มองจากหน้า ซ้าย→ขวา) MIC 1, MIC 2, HDMI 1–4, HDMI OUT, USB OUT, ATEM CONTROL, POWER | NOT YET TESTED |
| XS-3 | ATEM Mini Pro: POWER เสียบไม่ได้ ส่วนพอร์ตอื่นเสียบสายที่ถูกชนิดได้ | NOT YET TESTED |
| XS-4 | ATEM Mini Pro: เปิด power → ปุ่ม PGM ของแหล่งภาพเป็นสีแดง, VIDEO OUT M/V หรือ PGM เป็นสีเขียวตามการตั้งค่า | NOT YET TESTED |
| XS-5 | Studio Camera 4K Plus G2 บนขาตั้ง: ด้านขวามี HDMI / SDI OUT / SDI IN / +12V, ด้านซ้ายมี USB-C ×2 / หูฟัง / MIC 3.5 mm | NOT YET TESTED |
| XS-6 | กล้อง: เสียบ HDMI OUT และ MIC 3.5 mm ได้, tally ด้านบนเป็นสีแดงเมื่อกล้องขึ้น PGM | NOT YET TESTED |
| XS-7 | หยิบ วาง หมุน ATEM Mini Pro และกดค้าง 2 วินาทีเพื่อดู | NOT YET TESTED |
| XS-8 | เดินชนโต๊ะ/อุปกรณ์ได้ตามปกติ ไม่ทะลุ | NOT YET TESTED |

## 2. AU (หอประชุม) · ด่าน AU-05
| # | รายการ | ผล |
|---|---|---|
| AU-1 | ATEM Television Studio HD8 ISO: พื้นปุ่ม, T-bar, แผงจอยก, จอ LCD | NOT YET TESTED |
| AU-2 | HD8 ISO หลังเครื่อง: SDI IN 1–8 (แถวล่าง) ต่อได้, SDI OUTPUTS 1–8 (แถวบน) เสียบไม่ได้, AUX 1/2, PROGRAM, MULTIVIEW (SDI/HDMI), CH1/CH2 XLR | NOT YET TESTED |
| AU-3 | HD8 ISO: เลือก PGM/PVW แล้วปุ่ม 1–8 แถว PGM เป็นสีแดง / แถว PVW เป็นสีเขียว | NOT YET TESTED |
| AU-4 | HD8 ISO ยังหยิบ วาง หมุน และกดค้างเพื่อดูได้เหมือนเดิม | NOT YET TESTED |
| AU-5 | HyperDeck Studio HD Plus: หน้าเครื่อง (ปุ่ม transport, INPUT, จอ, ช่อง SD ×2) | NOT YET TESTED |
| AU-6 | HyperDeck หลังเครื่อง: SDI OUT A/B, SDI IN, SDI LOOP OUT, MONITOR OUT แยกกัน, HDMI IN/OUT, ETHERNET, REMOTE/REF/TIMECODE เสียบไม่ได้ | NOT YET TESTED |
| AU-7 | HyperDeck: REC เป็นสีแดงเมื่อบันทึก, PLAY ติดไฟเมื่อเล่น, บันทึกได้ทีละแหล่ง (ไม่มี ISO) | NOT YET TESTED |
| AU-8 | Micro Converter HDMI→SDI และ SDI→HDMI: ป้ายบนตัวต่างกัน, ปลาย BNC/HDMI ถูกด้าน, LED, USB POWER | NOT YET TESTED |
| AU-9 | Micro Converter: หยิบ วาง หมุนได้ และเสียบสายถูกทิศ | NOT YET TESTED |
| AU-10 | SmartView Duo: จอ 2 จอ, จอซ้าย = Monitor 1 (`sdi-in`), จอขวา = Monitor 2 (`sdi-in-b`) แสดงภาพแยกกัน | NOT YET TESTED |
| AU-11 | Studio Camera 4K Pro G2 ×3: ด้านขวามี Ethernet + 12V XLR 4 ขา, ด้านซ้ายมี XLR ×2 + Talkback (เสียบไม่ได้) | NOT YET TESTED |

## 3. OUT (กลางแจ้ง) · ด่าน OUT-05
| # | รายการ | ผล |
|---|---|---|
| OUT-1 | HD8 ISO บนโต๊ะกลางแจ้ง: เสียบ PGM OUT ไป embedder ได้ | NOT YET TESTED |
| OUT-2 | Streaming Encoder HD: หน้าเครื่อง (ON AIR, MENU, OFF, SET, CALL, LOCK, จอ, ปุ่มหมุน, USB-C ใต้ฝา) | NOT YET TESTED |
| OUT-3 | Encoder หลังเครื่อง: SDI IN, SDI LOOP OUT, MONITOR OUT (SDI/HDMI), LIVE STREAM, WEBCAM OUT, 12V DC/AC เสียบไม่ได้ | NOT YET TESTED |
| OUT-4 | Encoder: ON AIR เป็นสีแดงเมื่อสตรีม | NOT YET TESTED |
| OUT-5 | SmartView Duo และกล้อง Pro G2 ×3 ตรงกับข้อ AU | NOT YET TESTED |

## 4. SP (สนามกีฬา) · ด่าน SP-05
| # | รายการ | ผล |
|---|---|---|
| SP-1 | URSA Broadcast G2 ×6 บนขาตั้ง: มือจับ, แผ่นรองไหล่, เลนส์, ป้าย 4K BROADCAST | NOT YET TESTED |
| SP-2 | URSA หลังเครื่อง: 12G SDI OUT / 12G SDI IN ต่อได้, REF/12V/USB-C/หูฟังเสียบไม่ได้, ด้านขวามี 3G SDI OUT (`sdi-mon`) | NOT YET TESTED |
| SP-3 | Camera Fiber Converter ติดชิดหลัง URSA ทุกตัว ไม่ลอยหรือจมในตัวกล้อง | NOT YET TESTED |
| SP-4 | CFC: เสียบสาย 12G สั้นจาก URSA เข้า SDI IN และสาย SMPTE fiber ได้, หัวต่อด้านหลัง (headset/XLR/return) เสียบไม่ได้ | NOT YET TESTED |
| SP-5 | Studio Fiber Converter ×6 ที่ชั้น CCU: หน้ามีหัว SMPTE + จอ, หลังมี 12G OUT ×2 ต่อได้, RETURN IN/AUDIO OUT/REF เสียบไม่ได้ | NOT YET TESTED |
| SP-6 | Videohub 20x20 12G: หน้าเครื่อง (ปุ่ม, จอ, ปุ่มหมุน), หลังมี IN 1–20 / OUT 1–20 ตรงหมายเลข (คี่บน คู่ล่าง) | NOT YET TESTED |
| SP-7 | ATEM 2 M/E Constellation 4K: หน้า (ปุ่ม 1–20, CUT/AUTO, จอ), หลัง SDI IN 1–20 / OUT 1–12 / MV 1–2 / CH1–CH2 | NOT YET TESTED |
| SP-8 | Constellation ยังหยิบ วาง หมุนได้เหมือนเดิม | NOT YET TESTED |
| SP-9 | HyperDeck และ Encoder ×2 ในแร็คทาวเวอร์: ตัวเครื่องอยู่ที่สูง ~1 m, แผงหลังเข้าถึงได้, เสียบสายได้ | NOT YET TESTED |
| SP-10 | Micro Converter HDMI→SDI (กราฟิก) และ SmartView Duo ที่ FOH ตรงกับข้อ AU | NOT YET TESTED |
| SP-11 | ความลื่นของภาพ (เฟรมเรต) ในด่าน SP บน desktop และมือถือ | NOT YET TESTED |

## 5. ส่วนที่ต้องไม่เปลี่ยน
| # | รายการ | ผล |
|---|---|---|
| NC-1 | Free Practice (studio-full) เหมือนเดิมทุกอย่าง | NOT YET TESTED |
| NC-2 | ST ทุกด่าน (อุปกรณ์ generic เดิม ยัง PENDING) | NOT YET TESTED |
| NC-3 | AJA 3G-AMA, Magewell และอุปกรณ์ GENERIC แสดงแบบเดิม | NOT YET TESTED |
| NC-4 | ตอนเลือกสาย ชุดสายและกติกาตรวจเหมือนเดิม | NOT YET TESTED |
| NC-5 | Admin auto loadout ยังเติมสายครบทุกด่าน | NOT YET TESTED |
| NC-6 | ธีม xianxia และข้อความไทยเหมือนเดิม | NOT YET TESTED |

## 6. Save และ resume
| # | รายการ | ผล |
|---|---|---|
| SV-1 | save ที่ทำไว้ก่อน Phase 04 (XS/AU/OUT/SP) โหลดต่อได้ ไม่มีข้อความ migration ใหม่ | NOT YET TESTED |
| SV-2 | สายที่เสียบไว้ใน save เก่าไปอยู่ที่ตำแหน่ง socket ใหม่ของโมเดล | NOT YET TESTED |
| SV-3 | หยิบหรือย้ายอุปกรณ์ → ออกจากด่าน → กลับเข้ามาแล้วอยู่ตำแหน่งเดิม | NOT YET TESTED |

## 7. หน้าจอแต่ละขนาด
| # | รายการ | ผล |
|---|---|---|
| RL-1 | Desktop: ป้ายพอร์ตและชื่ออุปกรณ์อ่านได้ ไม่ทับกัน | NOT YET TESTED |
| RL-2 | Tablet / iPad: เล็งพอร์ตเล็ก (MIC 3.5 mm, BNC แถวคู่) ได้ | NOT YET TESTED |
| RL-3 | iPhone: เปิดด่าน SP ได้ไม่ค้าง และหน้าจอตรวจสอบ 2 วินาทีแสดงโมเดลเต็ม | NOT YET TESTED |
