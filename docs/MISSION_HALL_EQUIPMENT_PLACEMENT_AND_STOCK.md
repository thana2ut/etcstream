# หอจารึกแห่งภารกิจ — การวางอุปกรณ์และสต็อกสาย (5 ห้อง × 5 ระดับ)

**แหล่งข้อมูลจริงมีที่เดียว:** `game/training/venue-scenarios.ts` (อุปกรณ์ พอร์ต สาย 1 เส้นต่อ 1 เส้นทาง ขั้นตั้งค่า ระดับที่ใช้) + `game/training/venue-layouts.ts` (จุดติดตั้ง/คลัง)
**สถานะ:** NOT TESTED / NOT PLAYTESTED · ทุกอุปกรณ์เป็นตัวแทน low-poly ชั่วคราว

## กติกาที่โค้ดบังคับ
- สายถูกสร้างจากเส้นทางบังคับเท่านั้น (`route()` 1 เส้นทาง = 1 สายที่มีชนิดหัวต่อตรงทั้งสองปลาย) ⇒ **สต็อกสาย = จำนวนเส้นทางของระดับนั้น** + สายหลอก 6 เส้นในระดับ 4
- อุปกรณ์ในด่าน = อุปกรณ์ที่มีพอร์ตในเส้นทางของระดับนั้น หรือเป็นเจ้าของขั้นตั้งค่า — ไม่มีอุปกรณ์ "ผี"
- อุปกรณ์พกพา (Movable) เริ่มในคลังอุปกรณ์ ต้องหยิบไปวางที่จุดติดตั้ง (ระยะ ≤ 0.5 m) จึงใช้พอร์ตได้; ระดับ 4 เริ่มติดตั้งแล้ว
- อุปกรณ์ติดตั้งประจำ (Fixed) อยู่ที่จุดใช้งาน แต่ยังต้องต่อสาย/ตั้งค่าเอง
- environmentOnly (ไม่นับผ่านด่าน): ขาตั้ง/แท่นกล้อง, ตู้/ชั้น/เคส, หูฟังห้องเรียน, ป้าย, ราง/ทางสาย, UPS
- ระดับ = แท็กในเส้นทาง: `1`, `2`, `3`, `5`; ระดับ 4 ใช้ชุดของระดับ 5

---

## XS ห้องเรียน — คลังอุปกรณ์: ตู้ AV ผนังขวา · คลังสาย: ชั้นวางสายหลังห้อง (2 ชั้น)
| id | อุปกรณ์ | ประเภท | จุดเริ่ม → จุดติดตั้ง | ระดับ |
|---|---|---|---|---|
| cam1 | Classroom HDMI Camera | Fixed (บนขาตั้ง) | หลังห้องกลาง | 1,3,4,5 |
| slides | Teacher Presentation Laptop | Fixed | โต๊ะผู้สอน | 3,4,5 |
| sw | Mini HDMI Switcher (USB Webcam) | Movable | ตู้ AV → โต๊ะควบคุม AV กลาง | 1,3,4,5 |
| monitor | Classroom TV / Projector | Fixed | ผนังหน้า | 1,3,4,5 |
| lav1 / tx1 | Lavalier / Wireless TX | Fixed / Movable | โต๊ะผู้สอน | 2,4,5 |
| rx | Wireless Receiver | Movable | ตู้ AV → ข้าง Mixer | 2,4,5 |
| mix | Small Audio Mixer (PA + AUX) | Movable | ตู้ AV → โต๊ะควบคุม AV | 2,4,5 |
| speaker | Active Classroom Speaker | Fixed | หน้าห้องซ้าย | 2,4,5 |
| pc | Streaming Notebook / OBS | Movable | ตู้ AV → โต๊ะควบคุม AV ขวา | 4,5 |

สต็อกสาย: ระดับ 1 HDMI 2 · ระดับ 2 สายไมค์ 1, XLR 1, TRS 1 · ระดับ 3 HDMI 3 · ระดับ 5 = 8 เส้น (HDMI 3, สายไมค์ 1, XLR 1, TRS 1, TRS→3.5 1, USB-C→A 1)

## S สตูดิโอภารกิจ — คลังอุปกรณ์: โต๊ะยาวขวา · คลังสาย: โต๊ะยาวซ้าย (2 ชั้น)
| id | อุปกรณ์ | ประเภท | จุดเริ่ม → จุดติดตั้ง | ระดับ |
|---|---|---|---|---|
| cam1–3 | Studio Camera 1–3 | Fixed (ขาตั้ง 3 จุด) | ซ้าย / กลาง / ขวา | cam1: 1,3,4,5 · cam2–3: 3,4,5 |
| sw | DeviceWell HDS7105 | Fixed | กลางโต๊ะผลิต | 1–5 |
| mix | Audio Mixer (PMX chassis) | Fixed | โต๊ะผลิตซ้าย | 2,4,5 |
| rx | Wireless RX (2TX/1RX) | Movable | โต๊ะอุปกรณ์ → ข้าง Mixer | 2,4,5 |
| tx1, tx2 / lav1, lav2 | Wireless TX / Lavalier | Movable / Fixed | โต๊ะอุปกรณ์ → โต๊ะพิธีกร | 2,4,5 |
| mic | Sennheiser XS 1 | Movable | โต๊ะอุปกรณ์ → โต๊ะพิธีกร | 2,4,5 |
| speaker | Yamaha HS5 | Fixed | ข้างโต๊ะผลิต | 2,4,5 |
| monitor | Samsung TV (Multiview) | Fixed | ขาตั้ง TV หลังซ้าย | 1,3,4,5 |
| capture | Magewell USB Capture HDMI | Movable | โต๊ะอุปกรณ์ → ระหว่าง HDS7105 กับ Notebook | 4,5 |
| pc | HP Notebook / OBS | Fixed | โต๊ะผลิตขวา | 4,5 |

สต็อกสาย: ระดับ 1 HDMI 2 · ระดับ 2 = 6 (สายไมค์ 2, 3.5→6.35, XLR, 6.35→3.5, TRS) · ระดับ 3 HDMI 4 · ระดับ 5 = 12

## M หอประชุม — คลังอุปกรณ์: กล่องไมค์ข้างเวทีซ้าย · คลังสาย: Cable rack หลัง FOH (2 ชั้น)
| id | อุปกรณ์ | ประเภท | จุดติดตั้ง | ระดับ |
|---|---|---|---|---|
| cam1 / cam2 / cam3 | Camera C / L / R (SDI) | Fixed | หลังกลาง (riser) / ทางเดินซ้าย / ขวา | cam1: 1,3,4,5 · อื่น: 3,4,5 |
| cam4 | PTZ Camera (SDI) | Fixed | ใกล้เวทีซ้าย | 3,4,5 |
| slides + conv-slides | Laptop + HDMI→SDI | Fixed + Movable | โต๊ะ Presentation | 3,4,5 |
| sw | Production 3G-SDI Switcher | Fixed | FOH Production | 1–5 |
| conv-display + display | SDI→HDMI + จอเวที | Movable + Fixed | ข้างเวทีขวา / หน้าเวที | 1,3,4,5 |
| monitor | FOH Multiview Monitor | Fixed | FOH | 3,4,5 |
| recorder / pc | Program Recorder / Production PC | Fixed | FOH | 4,5 |
| mic1 | Podium Microphone | Fixed | Podium | 2,4,5 |
| hh1, hh2 / hhrx1, hhrx2 | Wireless Handheld / RX | Fixed / Movable | หน้าเวทีขวา / ตู้ RX ข้างเวทีขวา | hh1: 2,4,5 · hh2: 4,5 |
| lav1, lav2 / tx1, tx2 / lavrx1, lavrx2 | Lav / TX / RX | Fixed / Movable / Movable | จุดวิทยากร / ตู้ RX | 4,5 |
| stagebox | Analog Stagebox | Fixed | ข้างเวทีขวา | 2,4,5 |
| mix | Digital FOH Mixer | Fixed | FOH Audio | 2,4,5 |
| pa | Active PA Speaker | Fixed | ซ้ายเวที | 2,4,5 |

สต็อกสาย: ระดับ 1 SDI 2, HDMI 1 · ระดับ 2 XLR 4, Multicore 1 · ระดับ 3 SDI 6, HDMI 3 · ระดับ 5 = 21 (SDI 7, HDMI 3, USB 1, XLR 7, สายไมค์ 2, Multicore 1)

## L ภายนอกอาคาร — คลังอุปกรณ์: Field cases ทางเข้าบริการ · คลังสาย: Field cable box
| id | อุปกรณ์ | ประเภท | จุดติดตั้ง | ระดับ |
|---|---|---|---|---|
| cam1 + fiber-tx | Far Camera A + Fiber TX | Fixed + Movable | หน้าซ้ายไกล | 1,3,4,5 |
| fiber-rx | Fiber RX | Movable | ข้างเต็นท์ควบคุม | 1,3,4,5 |
| cam2 / cam3 | Near Camera B / C | Fixed | หน้าขวา / หลังกลาง | cam2: 1,3,4,5 · cam3: 3,4,5 |
| sw | Field SDI Switcher | Fixed | เต็นท์ | 1–5 |
| monitor | Portable Multiview Monitor | Movable | เต็นท์ | 1,3,4,5 |
| lav1/tx1 + rx | Lav/TX + RX | Fixed/Movable + Movable | พิธีกร / เต็นท์ | 2,4,5 |
| mic0 / mic1 | Shotgun / Ambient | Fixed | หน้าเวที / ฝั่งผู้ชม | 2,4,5 |
| mix / pa | Field Mixer / Active PA | Fixed | เต็นท์ / ข้างเวที | 2,4,5 |
| embedder / encoder | Audio Embedder / SDI Encoder | Movable | โต๊ะ encode ในเต็นท์ | 4,5 |
| network / live | Router / Ingest (จำลอง) | Fixed | เต็นท์ / ข้างเต็นท์ | 4,5 |

สต็อกสาย: ระดับ 1 SDI 4, Fiber 1 · ระดับ 2 สายไมค์ 1, XLR 4 · ระดับ 3 SDI 5, Fiber 1 · ระดับ 5 = 16 (SDI 7, Fiber 1, สายไมค์ 1, XLR 5, Ethernet 2)

## XL สนามกีฬา — คลังอุปกรณ์: Accessory rack ในห้องควบคุม · คลังสาย: Technical cable rack 2 ชั้น (ขยายเพื่อรองรับ ~54 เส้น)
| id | อุปกรณ์ | ประเภท | จุดติดตั้ง | ระดับ |
|---|---|---|---|---|
| cam1–6 | Broadcast Camera 1–6 | Fixed | 6 จุดข้างสนาม (กล้อง 1 บนแท่น) | 1–2: 1,3,4,5 · 3–6: 3,4,5 |
| ccu1–6 | CCU / Base Station 1–6 (แยกเครื่อง คู่ระบบกล้อง) | Fixed | ตู้ Rack CCU (เรียงซ้อน) | ตามกล้อง |
| router | SDI Video Router | Fixed | ตู้ Rack Router | 1–5 |
| sw | Broadcast Production Switcher | Fixed | แถว 1 | 1–5 |
| replay / replay-ctl | Replay Server / Controller | Fixed | แถว 2 | 3,4,5 |
| graphics + conv-gfx | Graphics Workstation + HDMI→SDI | Fixed + Movable | แถว 3 | 3,4,5 |
| monitor | Multiview Wall | Fixed | ผนังหน้าห้องควบคุม | 1,3,4,5 |
| display-conv + display | Venue Processor + Stadium Display | Fixed | ข้างสนาม | 4,5 |
| mic0–4 | ผู้บรรยาย 1–2, Crowd L/R, Field | Fixed | โต๊ะผู้บรรยาย / ข้างสนาม | 2,4,5 |
| lav1/tx1 + rx | Presenter Lav/TX + RX | Fixed/Movable + Movable | ข้างสนาม / Audio area | 4,5 |
| stagebox / mix / pa | Stagebox / Broadcast Console / Stadium PA | Fixed | โต๊ะผู้บรรยาย / Audio desk / ข้างสนาม | 2,4,5 |
| embedder, da | Audio Embedder, SDI DA 1×4 | Fixed | ตู้ Rack | 4,5 |
| encoder, network, live | Main Encoder / Primary Network / Main Ingest | Fixed | ตู้ Rack | 4,5 |
| backup, backup-net, live-backup | Backup Encoder / Backup Network / Backup Ingest | Fixed | ตู้ Rack (แยก) | 4,5 |
| recorder | Program Recorder | Fixed | ตู้ Rack | 4,5 |
| intercom, commentary | Intercom Station, Commentary Unit | Fixed | แถว 1 / โต๊ะผู้บรรยาย | 4,5 |

สต็อกสาย: ระดับ 1 Camera Fiber 2, SDI 5 · ระดับ 2 XLR 6, Multicore 1 · ระดับ 3 Camera Fiber 6, SDI 17, RS-422 1, HDMI 1 · ระดับ 5 = 48 (Camera Fiber 6, SDI 23, HDMI 2, XLR 8, สายไมค์ 1, Multicore 1, Ethernet 4, RS-422 1, Intercom XLR-4 1, GPI 1)

## UNRESOLVED / ไม่ได้ใส่
- XS: หูฟังผู้ควบคุม (environmentOnly ไม่มีพอร์ตในกราฟ) · M: สายควบคุม PTZ, Confidence monitor, DSP · L: Wireless video (ทางเลือก) · XL: Talkback ผ่าน Camera Fiber (อธิบายในการ์ด ไม่ทำเป็นเส้นแยก)
- การวาง "สายในคลัง" เป็นเส้นสายจริงบนชั้น (ระบบสายเดิม) ยังไม่มีโมเดลม้วนสาย/ถาดแยกชนิด
