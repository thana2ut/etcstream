# 09 · ตารางเสนอรุ่นฮาร์ดแวร์ทั้ง 46 โปรไฟล์ (ร่างให้เจ้าของโครงการพิจารณา)

วันที่: 2026-10-20 · **เป็นข้อเสนอ ยังไม่ได้ผูกในโค้ด** (ยกเว้นรุ่นที่ LOCKED ไปแล้วในรอบก่อน) · ยังไม่เริ่มทำโมเดล 3D · ยังไม่ได้ commit

**สัญลักษณ์สถานะ**
- 🔒 **LOCKED:** รุ่น พอร์ต ทิศทาง และเส้นทางตรงเอกสารผู้ผลิต และใช้ในเกมแล้ว
- 🟡 **PENDING ROUTE:** รุ่นจริงอยู่ในเกมแล้ว แต่โปรไฟล์ยังขาดพอร์ตหรือข้อมูลบางส่วน
- ⚪ **GENERIC:** โปรไฟล์ฝึกที่ยังไม่มีรุ่นจริง
- 🔴 **UNVERIFIED:** มีชื่อรุ่นแล้ว แต่ยังเปิดเอกสารทางการยืนยันไม่ได้

**ผลตรวจรุ่นที่เสนอ**
- ✅ **ตรวจแล้ว:** ตรวจหน้าสเปกทางการแล้ว และพอร์ตที่ด่านใช้มีอยู่จริง
- ⛔ **ตรวจไม่ได้:** หน้าทางการโหลดไม่ได้หรือไม่ตรงรุ่น จึงยังเป็น **PENDING VERIFICATION** ห้ามใช้จนกว่าจะยืนยัน
- ❌ **ไม่ผ่าน:** สเปกไม่ตรงความต้องการของด่าน

## 1. ห้องเรียน (XS)
| โปรไฟล์ | สถานะ | รุ่นที่เสนอ | ผลตรวจ / หลักฐาน | ผลต่อ edge |
|---|---|---|---|---|
| `bmd-atem-mini-pro` | 🔒 | Blackmagic ATEM Mini Pro | techspecs + คู่มือ | — |
| `generic-hdmi-camera` (XS, ST) | ⚪ | **Blackmagic Studio Camera 4K Plus G2** | ✅ HDMI 2.0 out 1, SDI out 1, SDI in 1, 3.5 mm, USB-C ×2, 12V barrel, จอ 7 นิ้ว (blackmagicdesign.com/products/blackmagicstudiocamera/techspecs) | ใช้ HDMI OUT เหมือนเดิม ไม่เปลี่ยน |
| `generic-projector` | ⚪ | Epson PowerLite FH52+ (ผู้สมัคร) | ⛔ ลิงก์หน้าทางการพาไปรุ่นอื่น | — |
| `generic-laptop` (XS, AU) | ⚪ | **ทรัพย์สินของสถาบัน** | ต้องมี HDMI OUT ขนาดเต็ม · ขอรุ่นจากเจ้าของ | — |
| `generic-obs-host` (XS, ST, AU) | ⚪ | **ทรัพย์สินของสถาบัน** | ต้องมี USB-A ×2 (USB 3.0) + Ethernet · ขอรุ่นจากเจ้าของ | — |
| `generic-4ch-mixer` (XS, ST) | ⚪ | ยังไม่มีผู้สมัครที่ผ่าน | ❌ Mackie ProFX6v3 มีไมค์แค่ 2 ช่องและไม่มี AUX send | — |
| `generic-active-pa` (XS, AU, OUT, SP) | ⚪ | JBL EON710 (ผู้สมัคร) | ⛔ หน้าทางการโหลดได้แต่ไม่มีเนื้อหา | — |
| `generic-lav-mic` / `generic-wireless-tx` / `generic-wireless-rx` (ทุกสถานที่) | ⚪ | Sennheiser XSW 1-ME2 หรือ Shure BLX14/CVL (ผู้สมัคร) | ⛔ หน้าทางการ 404 | — |

## 2. สตูดิโอ (ST)
| โปรไฟล์ | สถานะ | รุ่นที่เสนอ | ผลตรวจ / หลักฐาน | ผลต่อ edge |
|---|---|---|---|---|
| `generic-studio-switcher` | ⚪ (HDS7105 ไม่มีเอกสารทางการ) | **Blackmagic ATEM Mini Extreme ISO G2** | ✅ HDMI IN ×8, HDMI OUT ×3 (ส่ง MV ไปช่องใดก็ได้ จึงมี MULTIVIEW และ PGM พร้อมกันได้ตามที่ ST-03 ต้องใช้), เสียง XLR combo ×2 (มี phantom), USB-C ×2, Ethernet 1G + 10G | **เปลี่ยน 3 edge:** ST-02/04/05 `mix:aux-out → sw:audio-in` เพราะเครื่องจริงไม่มีขาเข้า 3.5 mm แต่มี XLR/TRS combo ต้องเปลี่ยนสายจาก `AUD-TRS-635-35` เป็นสาย TRS↔TRS ไลน์ ส่วนพอร์ตภาพใช้ HDMI OUT 1/2 ที่กำหนดหน้าที่เป็น MV/PGM |
| `magewell-usb-capture-hdmi-gen2` | 🟡 | Magewell 32060 (เดิม) | ✅ HDMI in + USB 3.0 · ขนาด 92.2×40.2×12.3 มม. · ⛔ ไม่ระบุชนิดขั้ว USB ฝั่งตัวเครื่อง | — |
| `generic-hdmi-monitor` (ST, AU) | ⚪ | **ทรัพย์สินของสถาบัน** (ทีวี/จอ HDMI) | ขอรุ่นจากเจ้าของ (ป้ายเดิม Samsung U8000F ยังไม่ได้ตรวจ) | — |
| `generic-dynamic-mic` (ST, AU, SP) | ⚪ | Shure SM58 | 🔴 รอเอกสาร (เหมือน `shure-sm58`) | — |
| `yamaha-hs5` | 🔴 | Yamaha HS5 (เดิม) | ⛔ เว็บ Yamaha 403 | — |

## 3. หอประชุม (AU)
| โปรไฟล์ | สถานะ | รุ่นที่เสนอ | ผลตรวจ / หลักฐาน | ผลต่อ edge |
|---|---|---|---|---|
| `bmd-atem-television-studio-hd8-iso` | 🔒 | ATEM Television Studio HD8 ISO | techspecs W-APS-21 + คู่มือ | — |
| `generic-sdi-camera` (AU, OUT) | ⚪ | **Blackmagic Studio Camera 4K Pro G2** | ✅ 12G-SDI out 1, SDI return in 1, HDMI 2.0 out 1, XLR ×2 (mic/line), 3.5 mm, Ethernet 10G, 12V barrel + XLR 4-pin, จอ 7 นิ้ว | ใช้ SDI OUT เหมือนเดิม ไม่เปลี่ยน |
| `generic-sdi-ptz` | ⚪ | Panasonic AW-UE50 (ผู้สมัคร) | ⛔ เข้าเว็บ pro.panasonic.com ไม่ได้ | — |
| `generic-sdi-monitor` (AU, OUT, SP) | ⚪ | **Blackmagic SmartView Duo** | ✅ SDI 3G ขาเข้าพร้อม loop, จอ 8 นิ้ว ×2 (800×480), Ethernet, 12V, 3RU · ⛔ ขนาดละเอียดเป็นภาพ | SDI IN เหมือนเดิม ไม่เปลี่ยน |
| `generic-sdi-usb-capture` | ⚪ | **Magewell USB Capture SDI Gen 2 (32070)** | ✅ SDI 3G in + เสียงฝัง, USB 3.0 · 92.2×40.2×12.3 มม. | ไม่เปลี่ยน |
| `bmd-micro-converter-hdmi-sdi-3g` (AU, SP) | 🟡 | เดิม | ขาด SDI OUT 2 ในโปรไฟล์ · W-CONU-18 ไม่มี PSU ส่วน W-CONU-21 มี PSU | ไม่เปลี่ยน |
| `bmd-micro-converter-sdi-hdmi-3g` | 🟡 | เดิม | ขาด SDI LOOP OUT ในโปรไฟล์ | ไม่เปลี่ยน |
| `bmd-hyperdeck-studio-hd-plus` | 🟡 | เดิม | โปรไฟล์ขาด HDMI, SDI out 2 + monitor, ฯลฯ | ไม่เปลี่ยน |
| `reference-console-6` / `reference-stagebox-6` / `reference-tail-6` (AU, OUT, SP) | ⚪ | Yamaha TF5 + NY64-D + Tio1608-D (ผู้สมัคร) | ⛔ เว็บ Yamaha 403 · ถ้าใช้ระบบนี้ มัลติคอร์จะกลายเป็นเครือข่าย Dante | ถ้าเลือกจะเปลี่ยน `STG-MULTICORE` เป็น Ethernet/Dante (ต้องอนุมัติ) |
| `reference-handheld-tx` | ⚪ | Shure BLX24/SM58 (ผู้สมัคร) | ⛔ 404 | — |

## 4. งานกลางแจ้ง (OUT)
| โปรไฟล์ | สถานะ | รุ่นที่เสนอ | ผลตรวจ / หลักฐาน | ผลต่อ edge |
|---|---|---|---|---|
| `bmd-streaming-encoder-hd` | 🔒 | Streaming Encoder HD | techspecs | — |
| `aja-3g-ama` | 🔒 | AJA 3G-AMA | aja.com | — |
| `reference-production-switcher` (OUT) | ⚪ | **ATEM Television Studio HD8 ISO** (ใช้ซ้ำจาก AU) | ✅ เป็นรุ่นที่ล็อกแล้ว · ❌ ATEM SDI Extreme ISO ไม่ผ่าน เพราะเสียงเป็น 3.5 mm ไม่สมดุล แต่ไม่กระทบ OUT เพราะ OUT ไม่มีเสียงเข้าสวิตเชอร์ | **เปลี่ยนชื่อพอร์ตเท่านั้น สายเท่าเดิม:** `sw:sdi-out-1 → embed` เป็น PROGRAM OUT หรือ AUX และ `sw:mv-out` เป็น MULTIVIEW |
| `reference-fiber-tx` / `reference-fiber-rx` | ⚪ | **Blackmagic Mini Converter Optical Fiber 12G ×2** | ✅ SDI in/out + Optical in/out ต่อเครื่อง (สองทิศทาง), ไฟ 6–36 VDC (มีอะแดปเตอร์ 12V) · ⛔ **ต้องเลือก SFP module ที่ขายแยก** (ชนิดหัวต่อ, single/multi mode และระยะยังไม่ยืนยัน) | edge ไม่เปลี่ยน แต่ต้องกำหนดรุ่นสาย `FIB-SDI-LINK` ให้ตรงกับ SFP |
| `reference-shotgun` | ⚪ | Sennheiser MKE 600 (ผู้สมัคร) | ⛔ 404 | — |
| `generic-ambience-mic` (OUT, SP) | ⚪ | Shure SM57 | ✅ dynamic cardioid · ⛔ หน้าไม่ระบุขั้วและขนาด | — |
| `generic-gateway` (OUT, SP) | ⚪ | **อุปกรณ์เครือข่ายของสถาบัน (ฝ่าย IT)** | ขอรุ่นจากเจ้าของ | — |
| `generic-test-ingest` (OUT, SP) | ⚪ (ตั้งใจให้เป็นแบบนี้) | **ไม่ใช่ฮาร์ดแวร์** เป็นจุดรับสตรีมจำลองในเกม | ไม่ต้องหารุ่นจริง | — |

## 5. สนามกีฬา (SP)
| โปรไฟล์ | สถานะ | รุ่นที่เสนอ | ผลตรวจ / หลักฐาน | ผลต่อ edge |
|---|---|---|---|---|
| `bmd-ursa-broadcast-g2` ×6 | 🔒 | URSA Broadcast G2 | techspecs + หน้า fiberconverters | — |
| `bmd-camera-fiber-converter` ×6 | 🔒 | Camera Fiber Converter | techspecs | — |
| `bmd-studio-fiber-converter` ×6 | 🔒 | Studio Fiber Converter | techspecs | — |
| `reference-video-router-8` | ⚪ | **Blackmagic Videohub 20x20 12G** | ✅ SDI 20 in / 20 out, REF (Tri-Sync/BB), Ethernet + USB-C, 1RU, จอ 2.2 นิ้ว, ปุ่ม 24 + 3 + search dial · ⛔ หน้าเว็บไม่ระบุชนิดหัวต่อ SDI | ใช้ IN 1–8 / OUT 1–8 เหมือนเดิม สายไม่เปลี่ยน |
| `reference-production-switcher` (SP) | ⚪ | **Blackmagic ATEM 2 M/E Constellation 4K** | ✅ 12G-SDI in 20 (แปลงมาตรฐานทุกช่อง), out 12 (กำหนด aux/preview ได้ทุกช่อง), MV 2 × 12G, analog **balanced 1/4 นิ้ว ×2** (ตรงกับโปรไฟล์ TRS), talkback 5-pin, REF Tri-Sync/BB, USB-C + webcam, Ethernet, 1RU, จอ 2.2 นิ้ว, ปุ่ม 22 LED + source 8 | ไม่เปลี่ยน: `sdi-in-1…8`, `sdi-out-1…4` (เป็น 4 ใน 12 ช่องที่กำหนดได้), MV, TRS L/R |
| `reference-replay` + `reference-replay-controller` | ⚪ | **ยังไม่มีรุ่นที่ยืนยันได้** | ระบบภาพซ้ำเฉพาะทาง (เช่น EVS) ไม่มีสเปกสาธารณะให้ตรวจ · ไม่ได้ใช้ HyperDeck มาแทนแบบเดา เพราะพอร์ตควบคุมยังไม่ยืนยัน | ต้องให้เจ้าของเลือก |
| `generic-graphics-pc` | ⚪ | **ทรัพย์สินของสถาบัน** + Micro Converter HDMI→SDI (เดิม) | ต้องมี HDMI OUT | — |
| `reference-recorder` | ⚪ | **HyperDeck Studio HD Plus** (ใช้ซ้ำ) | ✅ SDI in, 2 out + monitor, SD ×2, USB-C | ไม่เปลี่ยน |
| `reference-sdi-encoder` ×2 (หลัก/สำรอง) | ⚪ | **Streaming Encoder HD ×2** (ใช้ซ้ำรุ่นที่ล็อกแล้ว) | ✅ เครื่องละ SDI in + Ethernet | ไม่เปลี่ยน |
| `shure-sm58` | 🔴 | Shure SM58 | ⛔ หน้าคู่มือโหลดเนื้อหาไม่ได้ | — |
| `generic-sdi-monitor` (MV และจอสนาม) | ⚪ | SmartView Duo (MV) · จอสนามขนาดใหญ่ **ต้องให้เจ้าของเลือก** | ดูข้อ 3 | — |

## 6. ข้อ 7: ตรวจระบบ SP ทั้งชุด
| ส่วน | สถานะ | รายละเอียด |
|---|---|---|
| กล้อง 6 ตัว + Fiber/CCU | 🔒 ครบ | กล้องละ URSA G2 → สาย 12G สั้น → Camera Fiber Converter → SMPTE 311M hybrid → Studio Fiber Converter → Videohub (ทุกตำแหน่งเหมือนกันตาม manifest) |
| เราเตอร์ภาพ | ✅ เสนอ Videohub 20x20 12G | ใช้ IN 1–8 (กล้อง 6, ภาพซ้ำ, กราฟิก) และ OUT 1–8 ไปสวิตเชอร์ เหลือพอร์ตว่าง 12 |
| สวิตเชอร์ | ✅ เสนอ Constellation 2 M/E 4K | ขาเข้า 8 จาก 20 ช่อง และขาออก 4 + MV จาก 12 + 2 ช่อง อยู่ในขีดจำกัด เสียงจากคอนโซลเข้า TRS 1/4 นิ้วได้จริง |
| ภาพซ้ำ | ⛔ PENDING | ยังไม่มีรุ่นที่มีเอกสาร |
| ภาพมอนิเตอร์ | ⚪/✅ | MV ใช้ SmartView Duo ได้ ส่วนจอสนามยังรอการเลือก |
| ส่งสัญญาณหลัก/สำรอง | 🟡 | Streaming Encoder HD ×2 แยกขาออกสวิตเชอร์และเกตเวย์คนละเครื่อง แต่ใช้สวิตเชอร์และไฟร่วมกัน จึง**สำรองได้บางส่วน** (ตรงกับหมายเหตุเดิมในโค้ด) เกตเวย์ 2 ตัวรอรุ่นจาก IT |

## 7. ข้อ 6: ผลต่อสาย 331 เส้น
- **รุ่นที่เสนอแบบ ✅ ส่วนใหญ่มีพอร์ตครบตามที่ด่านใช้** (ตัวเลข/ชนิดหัวต่อ/ทิศตรง) จึง**ไม่ต้องเปลี่ยนสายใน 328 เส้น**
- **มี 3 เส้นที่ต้องเปลี่ยนชนิดสาย** ถ้าอนุมัติ ATEM Mini Extreme ISO G2 สำหรับ ST ได้แก่ ST-02/04/05 `mix:aux-out → sw:audio-in` เหตุผลทางเทคนิค: เครื่องจริงมีขาเข้า XLR/TRS combo ไม่มี 3.5 mm
- OUT ที่ใช้ HD8 ISO เปลี่ยนแค่ชื่อพอร์ตขาออก จำนวนและชนิดสายเท่าเดิม
- **ผลตรวจปัจจุบัน** (โปรไฟล์ในเกม): 331/331 ผ่าน (เอกสาร 08)

## 8. สรุปการตัดสินใจที่ต้องการจากเจ้าของโครงการ
1. **อนุมัติผูกรุ่นที่ตรวจผ่าน (✅):** Studio Camera 4K Plus G2 (HDMI cam), Studio Camera 4K Pro G2 (SDI cam), SmartView Duo (จอ SDI/MV), Magewell USB Capture SDI Gen 2, Videohub 20x20 12G, Constellation 2 M/E 4K, HD8 ISO สำหรับ OUT, Mini Converter Optical Fiber 12G (หลังเลือก SFP), Streaming Encoder HD ×2 และ HyperDeck สำหรับ SP
2. **อนุมัติเปลี่ยนสวิตเชอร์ ST เป็น ATEM Mini Extreme ISO G2** (เปลี่ยน 3 edge ตามข้อ 7) หรือคง generic ไว้จนกว่าจะได้ภาพ/คู่มือ HDS7105 จริง
3. **ส่งรุ่นจริงของทรัพย์สินสถาบัน:** โน้ตบุ๊ก, คอมพิวเตอร์ OBS, PC กราฟิก, จอ HDMI, จอสนาม, เกตเวย์เครือข่าย
4. **เลือก หรือส่งลิงก์/PDF สเปก** สำหรับรุ่นที่ตรวจไม่ได้ (⛔): ไมค์ไร้สาย, มิกเซอร์ 4 ช่อง, PA, โปรเจกเตอร์, PTZ, ไมค์ช็อตกัน, ระบบคอนโซลดิจิทัล และระบบภาพซ้ำ
5. **เลือก SFP module และสายไฟเบอร์** สำหรับ OUT

ระหว่างนี้ Phase 04 (โมเดล 3D) ยังไม่เริ่ม เพราะอุปกรณ์ที่จำเป็นต่อภารกิจยังค้างอยู่

---
## อัปเดต (2026-10-20): ST มิกเซอร์
- **`generic-4ch-mixer` (ST):** เสนอ **Mackie ProFX12v3** (คู่มือทางการ https://mackie.com/img/file_resources/ProFXv3_Series_OM2024July.pdf)
  - Main L/R เป็น XLR สมดุลแยกซ้าย/ขวา → ATEM Mini Extreme ISO G2 combo 1/2 (ตั้ง line) เป็น 2 edge ไม่ใช้ Y
  - Mon Send 1/4" TRS (pre-fader) → HS5
  - ยังไม่ผูก รอการอนุมัติและ spec sheet ระดับสัญญาณ รายละเอียดใน `docs/hardware-3d/11_ST_MIXER_CANDIDATE_TH.md`
- **ผู้สมัครที่ไม่ผ่าน:** ProFX10v3 / 6v3 ไม่ผ่าน (ไม่มี Mon Send หรือไมค์ไม่พอ)
- **XS ยังใช้ `generic-4ch-mixer`:** ห้องเรียนต่อ AUX สเตอริโอ → ATEM Mini Pro MIC 1 (3.5 mm สเตอริโอไม่สมดุล ตั้ง LINE) ถูกต้องอยู่แล้ว จึงไม่ต้องใช้รุ่นนี้
