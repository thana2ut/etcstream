# 00 · ตรวจแหล่งข้อมูล 25 ด่านที่ใช้งานจริง (Gate 0)

วันที่: 2026-10-20 · ทำแบบอ่านอย่างเดียว ไม่ได้แก้ฉาก ข้อมูลด่าน หรือโมเดล · ยังไม่ได้ commit

## 1. สภาพ repository และงานที่ต้องปกป้อง
- **branch:** `main` มีงานที่ยังไม่ commit จำนวนมาก (ระบบจำลอง 25 ด่าน, UI, บันทึก/เล่นต่อ, ผู้ดูแล, ประสิทธิภาพ) รอบนี้ไม่ได้ reset, clean หรือ restore อะไรเลย
- **ไฟล์ที่เพิ่มในรอบนี้:**
  - `scripts/generate-hardware-audit.ts` (อ่านอย่างเดียว)
  - `docs/generated/*`
  - เอกสาร 00–03
- **ที่ไม่ได้แตะ:** ห้องฝึกอิสระ (`studio-full` ใน `game/training/scenarios.ts`) รวมถึงป้าย HDS7105, Samsung และ PMX-402D-USB ในห้องนั้น
- **เอกสารอ้างอิงที่พบ:**
  - `docs/ETCSTREAM_SIGNAL_FLOW_FIVE_VENUES_TEXT_ONLY_REFERENCES.md` (Appendix A)
  - `docs/ETCSTREAM_CLAUDE_RESEARCH_LOCKED_25_LEVELS_COMPLETE_EQUIPMENT_SPACIOUS_SMOOTH.md`
  - `docs/ETCSTREAM_TECHNICAL_HANDOFF_THAI_5_VENUES_25_LEVELS.md`
- **เอกสารอ้างอิงที่ไม่พบ:** `EDUSTREAM_CLAUDE_REBUILD_ALL_MISSION_ROOMS_...` และ `..._CRITICAL_HARDWARE_ROSTER_CORRECTION_...` ไม่มีทั้งใน repo และ Downloads จึงไม่ได้อ่าน รายชื่อแบรนด์ตัวอย่างในเอกสารเหล่านั้นถือเป็นแค่ "ผู้สมัคร" ตาม MASTER V2

## 2. แหล่งข้อมูลจริงในโค้ด (ลำดับการประกอบด่าน)
1. `game/training/sim/equipment.ts`: `MODELS` (โปรไฟล์อุปกรณ์ พอร์ต การควบคุม และ sourceUrl)
2. `game/training/sim/rooms.ts` → `MISSION_ROOMS`: instance อุปกรณ์ของแต่ละสถานที่ ตำแหน่ง และรายการอุปกรณ์ที่ย้ายได้ (ผ่าน `reference-rooms.ts`)
3. `game/training/sim/stages.ts` + `reference-stages.ts`: `STAGES` ได้แก่ อุปกรณ์ต่อด่าน, `solution` (คู่ OUTPUT→INPUT), `prewired`, `faults`, `solutionConfig`, `objectives`, `extraCables`
4. `game/training/venue-scenarios.ts` `buildVenueScenario`: สร้างพอร์ต สาย (หนึ่งเส้นต่อหนึ่งคู่ใน solution) และ `canonical`
5. `game/content/cable-catalog.ts` + `game/content/mission-bag.ts`: ชนิดสายในแคตตาล็อก กระเป๋าที่ต้องใช้ และการตรวจกระเป๋า
6. `game/training/hdmi-training.ts` `simContext` → `sim/engine.ts` `evaluate`: กราฟสัญญาณและเงื่อนไขผ่าน

## 3. สรุป 25 ด่านจากโค้ด (`docs/generated/hardware-audit.json`)
| ด่าน | อุปกรณ์ | edge (สาย) | fault | การตั้งค่าที่ไม่ใช่สาย | หมายเหตุ |
|---|---|---|---|---|---|
| XS-01 | 3 | 2 | 0 | 7 | |
| XS-02 | 5 | 3 | 0 | 14 | |
| XS-03 | 5 | 4 | 0 | 11 | |
| XS-04 | 8 | 6 | 4 | 3 | ต่อไว้ล่วงหน้า + fault |
| XS-05 | 10 | 8 | 4 | 31 | |
| ST-01 | 3 | 2 | 0 | 7 | |
| ST-02 | 9 | 6 | 0 | 27 | |
| ST-03 | 5 | 4 | 0 | 12 | |
| ST-04 | 9 | 7 | 4 | 3 | ต่อไว้ล่วงหน้า + fault |
| ST-05 | 16 | 13 | 4 | 47 | |
| AU-01 | 4 | 3 | 0 | 9 | |
| AU-02 | 9 | 9 | 0 | 33 | |
| AU-03 | 10 | 9 | 0 | 20 | |
| AU-04 | 14 | 14 | 4 | 4 | ต่อไว้ครบ ไม่ต้องใช้สายเพิ่ม |
| AU-05 | 29 | 29 | 5 | 114 | |
| OUT-01 | 3 | 2 | 0 | 13 | |
| OUT-02 | 7 | 5 | 0 | 35 | |
| OUT-03 | 7 | 6 | 0 | 19 | |
| OUT-04 | 18 | 17 | 2 | 57 | ต่อไว้ล่วงหน้า + fault |
| OUT-05 | 18 | 17 | 4 | 57 | สภาพอากาศ / ความปลอดภัย |
| SP-01 | 5 | 4 | 0 | 16 | |
| SP-02 | 13 | 17 | 0 | 45 | |
| SP-03 | 19 | 25 | 0 | 47 | |
| SP-04 | 39 | 50 | 2 | 105 | ต่อไว้ล่วงหน้า + fault |
| SP-05 | 39 | 50 | 4 | 105 | 6 กล้อง + 6 CCU, ส่งหลัก/สำรอง |

รายละเอียดทุกด่าน (รายการอุปกรณ์, edge, จำนวนพอร์ตที่ใช้, กระเป๋า, การตั้งค่า, fault, objective) อยู่ใน `docs/generated/STAGE_GRAPHS_GENERATED_TH.md` สร้างใหม่ได้ด้วย `npx tsx scripts/generate-hardware-audit.ts`

## 4. ความขัดแย้งกับเอกสารเก่าที่พบ
- **ห้องฝึกอิสระ:** ใช้ชื่อ HDS7105, Samsung TV และ PMX-402D-USB ส่วนห้องภารกิจสตูดิโอใช้โปรไฟล์ generic `generic-studio-switcher` ("โปรไฟล์ฝึกแบบ HDS7105") จึงไม่ได้อ้างว่าเป็นของจริง
- **ชื่อแบรนด์ใน MASTER V2:** ATEM Mini Pro, HD8 ISO, Constellation, Videohub, URSA, Fiber Converter, AJA, Web Presenter และ Yamaha TF ไม่มีใน `MODELS` ปัจจุบัน ทุกด่านใช้โปรไฟล์ generic หรือ reference แทน
- **รุ่นจริงในโค้ด:** มีแค่ 6 รุ่น ได้แก่ Blackmagic Micro Converter HDMI→SDI 3G / SDI→HDMI 3G, HyperDeck Studio HD Plus, Magewell USB Capture HDMI Gen 2, Shure SM58 และ Yamaha HS5
- **Web Presenter HD:** หน้า techspecs ปัจจุบันของ Blackmagic ไม่มีรุ่นนี้แล้ว มีแค่ Streaming Encoder HD/4K (ดูเอกสาร 01)

## 5. สถานะ Gate 0
- `SOURCE_CODE_RECONCILED`: ดึงข้อมูลได้ครบ 25 ด่านจากโค้ดจริง
- `OWNER_NOT_PLAYTESTED`
- ไม่มีการเปลี่ยนแปลงข้อมูลด่าน
