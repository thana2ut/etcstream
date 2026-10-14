# หอจารึกแห่งภารกิจ — 5 ห้อง × 5 ระดับ (25 ด่านฝึกต่อสาย 3D)

**สถานะ:** โค้ดติดตั้งแล้ว · **NOT TESTED / NOT PLAYTESTED**
**แหล่งข้อมูลโค้ด (ยึดโค้ดเป็นหลักถ้าต่างจากเอกสาร):** กราฟ `game/training/venue-scenarios.ts` · ผังสถานที่ `game/training/venue-layouts.ts` · เป้าหมายระดับ `game/content/mission-catalog.ts` · การ์ดความรู้ `game/content/mission-equipment-info.ts`
**ห้องฝึกอิสระ / Studio Room 01:** ไม่ได้แก้

## หลักการ
- การ์ดบท 5 ใบ (`ผ่านแล้ว X/5 ระดับ` แยกแต่ละบท) → การ์ดระดับ 1–5 ปลดล็อกตามลำดับ → ฉาก first-person ของห้องนั้น (WASD · เมาส์ · E หยิบ/ต่อ/ถอด/ตั้งค่า · F วาง · E ค้าง = การ์ดความรู้เล็ก · ESC)
- แต่ละห้องมี **กราฟเดียว** (ระดับ 5 = ระบบครบของห้อง) ทุกเส้น/ทุกขั้นตั้งค่าติดแท็กระดับที่ใช้ ระดับ 4 = กราฟเต็มที่ต่อไว้บางส่วน + ขาดทุก 3 เส้น + **สายผิดจุด 1 เส้น** + สายหลอก 6 เส้น (HDMI, USB-A, XLR, 3.5, 6.35, SDI)
- ผ่านด่าน = ทุกเส้นทางบังคับต่อตรงพอร์ต + ทุกขั้นตั้งค่าทำแล้ว (ขั้นตั้งค่ากดได้เฉพาะเมื่อเส้นทางต้นน้ำครบ และถูกยกเลิกเมื่อถอดสายต้นน้ำ) — ไม่ใช้การนับจำนวนสาย
- ปฏิเสธ: ทิศทางผิด, หัวต่อผิด, ชนิดสัญญาณต่าง (HDMI≠SDI, Multicore/Control/Intercom แยกชนิด), เส้นทางที่ไม่อยู่ในผัง — สายในมือไม่หลุด
- จอในฉาก: `NO SIGNAL` / `MULTIVIEW` / `PROGRAM ACTIVE <แหล่ง>` / `NO PROGRAM SELECTED` / `WRONG FEED`
- ความคืบหน้า: key เดิม `etcstream-mission-progress-v1:*` (slug × ระดับ) ไม่แปลง ไม่ลบ

**จำนวนสายในตารางคำนวณจากเส้นทางของระดับนั้น (1 เส้นทาง = 1 สาย)** ระดับ 4 ใช้สายชุดเดียวกับระดับ 5 + สายหลอก 6 เส้น

---

## บท 01 ห้องประตูแรกแห่งภาพ · ห้องเรียน (`xs`) — DESIGN_REFERENCE [R01,R04,R10,R11]
Mini HDMI Switcher (อ้างอิงความสามารถ ATEM Mini Pro: HDMI IN, HDMI OUT แยก, USB Webcam) · **ไม่มี Capture Card แยก**

| ระดับ | งาน | เส้นทางบังคับ | สาย | ขั้นตั้งค่า |
|---|---|---|---|---|
| 1 | ภาพกล้อง → TV | Camera HDMI OUT → SW HDMI IN 1 · SW HDMI OUT → TV HDMI IN | HDMI ×2 | HDMI OUT = Program · เลือก Program: Camera |
| 2 | เสียงไมค์ → ลำโพงห้อง | Lav → TX MIC IN · RX AUDIO OUT (Line) → Mixer CH1 · Mixer MAIN (PA) → Active Speaker LINE IN | สายไมค์ ×1, XLR ×1, TRS 6.35 ×1 | Pair TX↔RX · Gain + บัส PA |
| 3 | สลับกล้อง/สไลด์ | ระดับ 1 + Laptop HDMI OUT → SW HDMI IN 2 | HDMI ×3 | HDMI OUT = Program · เลือก Camera · เลือก Presentation |
| 4 | ซ่อมระบบ | กราฟเต็ม (ดูระดับ 5) | ชุดระดับ 5 + หลอก 6 | ทำใหม่ทั้งหมด · **ฟอลต์:** TV ต่อจาก Laptop โดยตรง |
| 5 | Hybrid ครบ | ทั้งหมดข้างบน + Mixer AUX (STREAM) → SW MIC IN 1 · SW USB-C WEBCAM → Notebook USB HOST | HDMI ×3, สายไมค์ ×1, XLR ×1, TRS 6.35 ×1, TRS 6.35→3.5 ×1, USB-C→A ×1 (8) | + บัส STREAM · MIC 1 = Line เข้า Program · OBS (Video Capture Device + เสียงทางเดียว) |

อุปกรณ์: requiredInteractive = กล้อง, Laptop, Mini Switcher, TV, Lav, TX, RX, Small Mixer, Active Speaker, Notebook · environmentOnly = ขาตั้งกล้อง, ตู้ AV, ชั้นสาย, หูฟัง

## บท 02 สะพานจันทราแห่งเสียง · สตูดิโอภารกิจ (`s`) — PROVISIONAL [R04,R05,R08]
ฉากและผังแยก (`studioMission` + `venue/studio.tsx`) ไม่ใช้ Studio Room 01 · เส้นเสียงรายการ **Mixer → HDS7105 → Magewell** (ตามคำอธิบายอาจารย์)

| ระดับ | งาน | เส้นทางบังคับ | สาย | ขั้นตั้งค่า |
|---|---|---|---|---|
| 1 | กล้อง 1 + Multiview | Cam1 HDMI OUT → HDS7105 VIDEO IN 1 · MULTIVIEW OUT → Samsung TV | HDMI ×2 | เลือก Program: Camera 1 |
| 2 | เสียงสตูดิโอ | Lav1→TX1 · Lav2→TX2 · RX OUT → Mixer CH3/4 LINE · XS 1 XLR → CH1 MIC · Mixer MAIN → HDS7105 LINE IN · Mixer MONITOR → HS5 | สายไมค์ ×2, 3.5→6.35 ×1, XLR ×1, 6.35→3.5 ×1, TRS ×1 | Pair TX1+TX2 · Gain + MAIN · บัส MONITOR · LINE IN เข้า Program |
| 3 | 3 กล้อง | Cam1–3 → VIDEO IN 1–3 · MULTIVIEW → TV | HDMI ×4 | เลือก Program กล้อง 1/2/3 |
| 4 | ซ่อมระบบ | กราฟเต็ม | ชุดระดับ 5 + หลอก 6 | **ฟอลต์:** TV ต่อจาก PGM แทน MULTIVIEW |
| 5 | สตูดิโอครบ | ระดับ 2 + 3 + PGM → Magewell HDMI IN · Magewell USB → HP USB HOST | HDMI ×5, สายไมค์ ×2, 3.5→6.35, XLR, 6.35→3.5, TRS, USB 3.0 (12) | + OBS เลือก Magewell + เสียง HDMI ทางเดียว |

หมายเหตุ: HDS7105 พอร์ตเป็นโปรไฟล์ฝึก (revision รอตรวจ) · กล้องใช้โปรไฟล์ HDMI (รอตรวจ ไม่เดา SDI) · RX 2TX/1RX ผสมเป็นเอาต์พุตเดียว (รอยืนยัน) · Magewell 32060 / Samsung U8000F / Yamaha HS5 = SELECTED TRAINING REFERENCE · XS 1 เป็นแหล่งเสียงที่เลือกใส่ในบทนี้

## บท 03 หอคอยกระจกสลับภาพ · หอประชุม (`m`) — DESIGN_REFERENCE [R02,R08,R10,R12,R14]
3G-SDI switcher (อ้างอิงความสามารถ ATEM TVS HD8) · **Analog stagebox + multicore** (ไม่ใช่ Dante) · ไมค์ตามงานวิจัย: Podium + Handheld ไร้สาย ×2 + Lav ×2 (RX แยกเครื่องละช่อง)

| ระดับ | งาน | เส้นทางบังคับ | สาย | ขั้นตั้งค่า |
|---|---|---|---|---|
| 1 | กล้อง C → จอเวที | Cam C SDI → SW SDI IN 1 · SW AUX SDI → SDI→HDMI · Converter HDMI → จอเวที | SDI ×2, HDMI ×1 | AUX = Program · เลือก Camera C |
| 2 | เสียงเวที 2 ปลายทาง | Podium XLR → Stagebox MIC IN 1 · Handheld RX 1 → MIC IN 2 · Stagebox Multicore → Mixer · Mixer PA BUS → Active PA · Mixer BROADCAST → SW AUDIO IN | XLR ×4, Multicore ×1 | Pair Handheld 1 · Gain + PA BUS · BROADCAST BUS · AUDIO IN เข้า Program |
| 3 | 5 แหล่งภาพ + MV | Cam C/L/R + PTZ → SDI IN 1–4 · Laptop HDMI → HDMI→SDI → SDI IN 5 · AUX → SDI→HDMI → จอเวที · MULTIVIEW HDMI → FOH Monitor | SDI ×6, HDMI ×3 | AUX = Program · เลือก Program 5 แหล่ง |
| 4 | ซ่อมระบบ | กราฟเต็ม | ชุดระดับ 5 + หลอก 6 | **ฟอลต์:** จอเวทีต่อจาก PROGRAM OUT แทน AUX |
| 5 | งานเวทีครบ | ระดับ 2 + 3 + Handheld RX 2 → MIC IN 3 · Lav RX 1/2 → MIC IN 4/5 · Lav→TX ×2 · PGM SDI → Recorder · USB Webcam → PC | SDI ×7, HDMI ×3, USB ×1, XLR ×7, สายไมค์ ×2, Multicore ×1 (21) | + Pair ทั้ง 4 · Gain ทุกช่อง · บันทึก · OBS |

ยังไม่ทำ (ไม่มีหลักฐานพอร์ต/บังคับ): สายควบคุม PTZ, Program confidence monitor, DSP ก่อน PA (ใช้ Active PA ตรง)

## บท 04 คลังผนึกพอร์ตโบราณ · ภายนอกอาคาร (`l`) — DESIGN_REFERENCE [R06,R07,R09,R13,R15]

| ระดับ | งาน | เส้นทางบังคับ | สาย | ขั้นตั้งค่า |
|---|---|---|---|---|
| 1 | กล้องไกล (Fiber) + ใกล้ | Far Cam SDI → Fiber TX · TX OPTICAL → RX OPTICAL · RX SDI → SW SDI IN 1 · Cam B SDI → SDI IN 2 · MV SDI → Monitor | SDI ×4, Fiber ×1 | ไฟเลี้ยง Fiber TX/RX · เลือก Program กล้อง A / B |
| 2 | เสียงภาคสนาม | Lav → TX · RX → CH1 · Shotgun → CH2 · Ambient → CH3 · PA BUS → Active PA | สายไมค์ ×1, XLR ×4 | Pair · +48V เฉพาะ Shotgun · Gain + PA · BROADCAST |
| 3 | 3 กล้อง | ระดับ 1 + Cam C SDI → SDI IN 3 | SDI ×5, Fiber ×1 | เลือก Program 3 กล้อง |
| 4 | ซ่อมระบบ | กราฟเต็ม | ชุดระดับ 5 + หลอก 6 | **ฟอลต์:** Embedder ได้ Multiview แทน Program |
| 5 | สตรีมภาคสนามครบ | ระดับ 2 + 3 + Mixer BROADCAST → Embedder AUDIO IN · PGM SDI → Embedder SDI IN · Embedder SDI OUT → Encoder · Encoder ETH → Router LAN · Router WAN → Ingest | SDI ×7, Fiber ×1, สายไมค์ ×1, XLR ×5, Ethernet ×2 (16) | + Embed · เครือข่าย · Encoder · Cable ramp |

Wireless video = ทางเลือก ไม่บังคับ (ไม่ใส่ในกราฟ)

## บท 05 บัลลังก์จอมถ่ายทอด · สนามกีฬา (`xl`) — DESIGN_REFERENCE [R03,R09,R15,R16,R17]
กล้อง n ↔ CCU n (ระบบคู่) → Router → Switcher (Constellation ไม่มี XLR audio → ใช้ Embedder) → DA 1×4 → Main / Backup / Recorder

| ระดับ | งาน | เส้นทางบังคับ | สาย | ขั้นตั้งค่า |
|---|---|---|---|---|
| 1 | กล้อง 1–2 ผ่าน CCU/Router | Cam n Fiber → CCU FIBER IN n · CCU SDI OUT n → Router IN n · Router OUT n → SW IN n (n=1,2) · MV → Wall | Camera Fiber ×2, SDI ×5 | Crosspoint 1, 2 · เลือก Program กล้อง 1/2 |
| 2 | เสียงถ่ายทอด | ผู้บรรยาย 1–2, Crowd L/R, Field → Stagebox MIC IN 1–5 · Multicore → Console · VENUE PA → Stadium PA | XLR ×6, Multicore ×1 | Broadcast mix · VENUE PA (ไม่ส่งผู้บรรยาย) |
| 3 | ห้องควบคุม | กล้อง 1–6 ครบ · Replay SDI → Router IN 7 → OUT 7 → SW IN 7 · Replay Controller → Replay CONTROL · Graphics HDMI → HDMI→SDI → Router IN 8 → OUT 8 → SW IN 8 · MV → Wall | Camera Fiber ×6, SDI ×17, RS-422 ×1, HDMI ×1 | Crosspoint 1–8 · เลือก Program ทุกแหล่ง |
| 4 | ซ่อมระบบ | กราฟเต็ม | ชุดระดับ 5 + หลอก 6 | **ฟอลต์:** Embedder ได้ Multiview แทน Program |
| 5 | ถ่ายทอดเต็มระบบ | ระดับ 2 + 3 + Presenter Lav→TX, RX → MIC IN 6 · AUX → Venue Processor → Stadium Display · BROADCAST → Embedder · PGM → Embedder → DA · DA OUT1 → Main Enc → Primary Net → Main Ingest · DA OUT2 → Backup Enc → Backup Net → Backup Ingest · DA OUT3 → Recorder · Intercom PL1 → Commentary Unit · SW TALLY → CCU Rack | Camera Fiber ×6, SDI ×23, HDMI ×2, XLR ×8, สายไมค์ ×1, Multicore ×1, Ethernet ×4, RS-422 ×1, Intercom XLR-4 ×1, GPI ×1 (48) | + Pair · เสียงพิธีกร · Embed · AUX = Venue feed · บันทึก · Main · Backup · Intercom · Tally map |

ระบบนี้เป็น **Encoder/Uplink failover** — Switcher, Embedder, DA ยังเป็นจุดเสี่ยงร่วม (Partial redundancy) · Tally ใช้บัสร่วมของ Rack (โปรไฟล์ฝึก)
