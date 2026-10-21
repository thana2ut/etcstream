# 18 · สถานะงานทั้งหมด (MASTER FINAL COMPLETION)

วันที่: 2026-10-20 · Claude Code · **ยังไม่ได้ commit / push** · ยังไม่ได้ทดสอบในเบราว์เซอร์และในเกม (เจ้าของจะทดสอบครั้งเดียวตาม `21_FINAL_OWNER_ONE_PASS_QA_TH.md`)

> ผลตรวจอัตโนมัติไม่ได้พิสูจน์ว่าภาพหรือการเล่นถูกต้อง เอกสารนี้แยก "ทำแล้วและมีหลักฐานจากโค้ด" ออกจาก "ยังไม่ได้ทำ" ให้ชัด

## สรุปหนึ่งหน้า
| Phase | สถานะ | หมายเหตุ |
|---|---|---|
| 01 · ปรับ 14 โมเดล | ✅ ทำแล้ว | ปุ่มบนตัวเครื่องกดได้จริง (ผ่าน control เดียวกับคอนโซล), แก้อุปกรณ์ลอย/ทับกัน, พอร์ตเข้าถึงได้ทุกพอร์ต |
| 02 · ค้นข้อมูลฮาร์ดแวร์ที่เหลือ | 🟡 บางส่วน | AJA ได้ขนาดทางการ, Magewell พบข้อขัดแย้ง MCX/BNC, SM58 อ่านเอกสารไม่ได้, ST ยัง PENDING (ดู 19) |
| 03 · สร้างห้องภารกิจ 25 ห้องใหม่ (โต๊ะอุปกรณ์) | ⛔ **ยังไม่ได้ทำ** | ขัดกับข้อกำหนดที่ห้ามทำลาย save และห้ามเปลี่ยนเนื้อหาด่าน (ดูหัวข้อ "Phase 03") แก้ได้เฉพาะการจัดวางที่ผิดจริง |
| 04 · เชื่อม gameplay | ✅ เพิ่มการกดปุ่มบนอุปกรณ์ | ใช้ state จริง ไม่มี UI แยกที่ไม่ผูกกับเกม |
| 05 · ตรวจ flow ผู้เล่น | 🟡 ตรวจระดับโค้ดเท่านั้น | ไม่ได้แก้ UI เพราะยังไม่พบปัญหาจริงและห้ามทดสอบในเบราว์เซอร์ |
| 06 · save/resume | ✅ ไม่เปลี่ยน signature | audit ของ 25 ด่านตรงกับก่อนเปลี่ยน |
| 07 · ประสิทธิภาพ | 🟡 ลดภาระ SP | ป้ายข้อความแสดงเฉพาะเมื่ออยู่ใกล้ (LOD) **ยังไม่ได้วัด FPS จริง** |
| 08 · ตรวจอัตโนมัติ | ✅ | 191/194 ผ่าน, ข้อล้มเหลว 3 ข้อมาจากงาน Arena ใน session อื่น (ดู 20) |
| 09 · เอกสาร | ✅ | 18, 19, 20, 21 |

## 25 ด่าน: สถานะการทำงาน
**ทุกด่านเล่นได้ระดับโค้ด:**
- solver แก้ทุกด่านได้จนเซ็นรับงาน
- edge 331/331 ใช้ได้
- admin loadout ครบ 25 ด่าน
- พอร์ตทุกพอร์ตมีจุดยืนเข้าถึง
- ไม่มีอุปกรณ์ทับกันหรือลอย

| สถานที่ | ด่าน | สถานะ |
|---|---|---|
| XS ห้องเรียน | XS-01…05 | ✅ ครบระดับโค้ด · ATEM Mini Pro และ Studio Camera 4K Plus G2 มีโมเดล 3D ส่วนมิกเซอร์ยังเป็น generic |
| ST สตูดิโอ | ST-01…05 | 🟡 เล่นได้ แต่สวิตเชอร์และมิกเซอร์ยังเป็น **generic (PENDING ST)** |
| AU หอประชุม | AU-01…05 | ✅ ครบระดับโค้ด · อุปกรณ์ Blackmagic 6 รุ่นมีโมเดล 3D ส่วนเสียงยังเป็น generic/reference |
| OUT กลางแจ้ง | OUT-01…05 | ✅ ครบระดับโค้ด · ยังมี AJA 3G-AMA และ fiber TX/RX ที่ไม่มีโมเดล 3D |
| SP กีฬา | SP-01…05 | ✅ ครบระดับโค้ด · ระบบ replay และเสียงยังเป็น reference |

**คำว่า "ครบ"** หมายถึงผ่านเกณฑ์ระดับโค้ดเท่านั้น การยอมรับจริงต้องรอเจ้าของทดสอบ

## สิ่งที่เปลี่ยนในรอบนี้ (ไฟล์จริง)
| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `game/training/hdmi-training.ts` | **แก้บั๊ก:** `settleSim` เคยลบผล "ไม่ผ่าน" ของการทดสอบไปด้วย ตอนนี้ถอนเฉพาะผล "ผ่าน" ที่หมดอายุ · เพิ่ม target ชนิด `control` (กดปุ่มบนอุปกรณ์ → `setControl` เดียวกับคอนโซล, รองรับ toggle และ cycle) · ข้อความ HUD "E · กดปุ่ม …" |
| `game/stores/training-store.ts` | `targetKey` รองรับ `control` |
| `game/training/venue-scenarios.ts` | `settleOnFurniture` (ดึงของบนโต๊ะให้อยู่บนผิวโต๊ะเต็มตัว และจัด 2 แถวเมื่อโต๊ะแคบ) · จุดยืนเข้าถึงของพอร์ตที่หันขึ้นหรือหน้าถูกบัง |
| `game/training/sim/model-geometry.ts`, `hardware-geometry.ts` | `Press` (ปุ่มจริงที่ผูกกับ control): Encoder ON AIR/OFF · HyperDeck REC/PLAY/STOP/INPUT · TVS แถว PGM/PVW 1–8 · สวิตช์ไฟ Studio Fiber Converter และ Studio Camera |
| `components/game/equipment/hardware-model.tsx` | `PressTarget` (hit box ใหญ่กว่าปุ่มเล็กน้อย ขอบเขียวเมื่อเล็ง) · ป้ายข้อความ LOD 3 m |
| `components/game/equipment/atem-mini-pro.tsx` | ปุ่มที่กดได้: แหล่งภาพ 1–4, BLACK, VIDEO OUT M/V/PGM, MIC 1 ON/OFF, REC/STOP |
| `game/content/mission-catalog.ts` | สร้างใหม่ (ข้อความ SP-01 ตรงกับสาย fiber ชุดใหม่) |
| `tests/scene-layout-invariants.test.mjs` (ใหม่) | ตรวจอุปกรณ์ไม่ทับกัน, ไม่ลอยขอบโต๊ะ, ทุกพอร์ตมีจุดยืน |
| `tests/phase04-hardware-models.test.mjs` | +2 เทสต์ของปุ่มบนอุปกรณ์ |
| `tests/production-sim.test.mjs`, `tests/venue-scenarios.test.mjs` | ปรับเทสต์ที่อ้าง topology เดิมหรือข้อความภาษาอังกฤษเดิม (ทุกรายการพร้อมเหตุผลใน 20) |

**ไฟล์ 3D:**
- ไม่มีไฟล์ GLB ใหม่ โมเดลทั้ง 14 รุ่นสร้างแบบ procedural จากข้อมูล geometry
- ไฟล์: `components/game/equipment/hardware-model.tsx`, `atem-mini-pro.tsx`, `game/training/sim/hardware-geometry.ts`, `model-geometry.ts`

## ปุ่มบนอุปกรณ์ที่กดได้ (ผูกกับ state จริง)
**ปุ่มที่ทำให้กดได้** (มีอยู่ในรูปทางการ และหน้าที่ตรงกับ control ในซิมแบบหนึ่งต่อหนึ่ง):

| อุปกรณ์ | ปุ่ม | control |
|---|---|---|
| ATEM Mini Pro | 1–4, BLACK · M/V, PGM · MIC 1 ON/OFF · REC/STOP | `pgm` · `hdmi-out` · `mic1-on` · `record` |
| ATEM TVS HD8 ISO | แถว PROGRAM 1–8 / PREVIEW 1–8 | `pgm` / `pvw` |
| Streaming Encoder HD | ON AIR / OFF | `stream` |
| HyperDeck Studio HD Plus | REC / PLAY / STOP / INPUT | `record` / `play` / `record=false` / `rec-input` (สลับ SDI↔HDMI) |
| Studio Camera 4K Plus/Pro G2 | สวิตช์ไฟด้านหลัง | `power` |
| Studio Fiber Converter | สวิตช์ไฟหน้าเครื่อง | `power` |

**ปุ่มที่ไม่ทำให้กดได้:** Constellation (ปุ่มแหล่งภาพขึ้นกับโหมดปลายทาง), Videohub (ต้องทำลำดับ OUT → IN → TAKE) และ CUT/AUTO เพราะหน้าที่จริงไม่ตรงกับ control ในซิมแบบหนึ่งต่อหนึ่ง จึงยังสั่งผ่านคอนโซล

## Phase 03: เหตุผลที่ยังไม่สร้างห้องใหม่
- **คำขอ:** ให้แต่ละสถานที่มีโต๊ะอุปกรณ์และ "inventory เหมือนกันทั้ง 5 ด่าน"
- **ผลกระทบ:** ต้องเพิ่มอุปกรณ์ใหม่ (และพอร์ตใหม่) เข้าด่านที่ยังไม่มี ทำให้
  1. `contentSignature` เปลี่ยน → save ที่เล่นค้างไว้จะต้อง migrate
  2. เนื้อหาและ objective ของด่านเปลี่ยน ซึ่งขัดกับข้อกำหนด "Preserve all 25 existing level IDs and approved signal requirements" และ "never silently reset"
- **สิ่งที่มีอยู่แล้ว:** ทุกสถานที่มีโต๊ะอุปกรณ์ (`layout.equipment`) และของที่ต้องหยิบเอง (`boxed→carry`) หรือยกได้ (`installed·liftable`) อยู่แล้ว ดู placement ใน `docs/generated/STAGE_GRAPHS_GENERATED_TH.md`
- **สิ่งที่ยังติดตั้งประจำที่ (เหมาะกับงานจริง):** กล้องบนขาตั้ง, จอติดผนัง, เราเตอร์และแร็ค
- **สิ่งที่แก้จริงในรอบนี้:**
  - อุปกรณ์ AU ที่วางเกินขอบโต๊ะ (หางสายมัลติคอร์, HyperDeck, Micro Converter ×2)
  - SP หางสายทับมิกเซอร์
  - พอร์ต 30 จุดที่ไม่มีจุดยืนเข้าถึง
  - ทั้งหมดมีเทสต์ตรวจแล้ว
- **ถ้าจะทำต่อ:** ต้องตัดสินใจเรื่อง migration ของ save (ดู handoff ด้านล่าง)

## ข้อจำกัดที่เหลือ
1. **ยังไม่ได้ทดสอบภาพและการเล่นจริง:** ทั้ง 14 โมเดล ปุ่มที่กดได้ และ LOD ป้าย
2. **ไม่ได้รัน `next build`:** เพราะจะเขียนทับ `.next` ระหว่างที่อาจมี dev server ทำงานอยู่ ที่ตรวจแล้วคือ `tsc --noEmit` และ ESLint
3. **ประสิทธิภาพ:** ยังไม่มีค่า FPS ที่วัดจริง (โดยเฉพาะ iPhone ในด่าน SP)
4. **save เก่า:** ถ้าบันทึกตำแหน่งของที่ยกได้ไว้ก่อนรอบนี้ ของจะกลับไปตำแหน่งเดิม (อาจเกินขอบโต๊ะเล็กน้อยใน AU) ไม่ทำให้ save เสีย
5. **อุปกรณ์ที่ยังไม่มีข้อมูลทางการพอ:** ST 3 ข้อ, Magewell (MCX/BNC), SM58 และ generic ทั้งหมด (ดู 19)
6. **เทสต์ Arena 3 ข้อ:** ล้มเหลวจากงาน Arena V9 ใน session อื่น (ดู 20)

## HANDOFF (สำหรับ session ถัดไป)
1. **ST:** รอคำตอบ Blackmagic Support (คำถามอยู่ใน `12_ST_HARDWARE_VERIFICATION_TH.md`) แล้วจึงผูก ProFX12v3 + ATEM Mini Extreme ISO G2 + HS5 พร้อม migration ของ ST-02/04/05
2. **Phase 03 (โต๊ะอุปกรณ์):** เจ้าของต้องเลือกก่อนว่า
   - (ก) ยอมเปลี่ยน signature ของบางด่านแล้วใส่ข้อความ migration ใน `CONTENT_CHANGES`
   - (ข) จัดเฉพาะตำแหน่งเริ่มต้นของอุปกรณ์เดิมให้ไปอยู่บนโต๊ะอุปกรณ์ ไม่เพิ่มอุปกรณ์ใหม่ (signature ไม่เปลี่ยน)
3. **Arena:** ให้ session ที่ทำ Arena V9 ปรับ `tests/arena-server.test.mjs` ให้ตรงกฎใหม่ (ชื่อห้ามซ้ำ, ต้องยืนยันชุดสายก่อนจับเวลา)
4. **ประสิทธิภาพ:** วัด FPS ด่าน SP-05 บน iPhone ถ้าต่ำ ให้ลด `LABEL_RANGE` หรือรวม geometry ของปุ่มด้วย instancing
5. **โมเดลเพิ่ม:** AJA 3G-AMA (มีขนาดแล้ว ขาดรูปตำแหน่งหัวต่อ)
6. **ตัวช่วยตรวจ:**
   - `npm test`
   - `npx tsx scripts/generate-hardware-audit.ts` (ต้องได้ stages=25 และ audit ไม่เปลี่ยน)
   - สคริปต์ตรวจ 331 edge และ admin loadout (ดูวิธีใน 20)
