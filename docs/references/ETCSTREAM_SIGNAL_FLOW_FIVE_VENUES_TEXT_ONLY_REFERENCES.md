# ETCSTREAM — ข้อมูลอุปกรณ์และหลักการต่อระบบ AV / Live Production แยกตามสถานที่ (ฉบับข้อมูลล้วน)

**ปรับปรุงข้อมูล:** 11 ตุลาคม 2026  
**ประเภทเอกสาร:** ข้อมูลอ้างอิงข้อความล้วน (ไม่มีรูปภาพ) สำหรับอุปกรณ์ พอร์ต สาย และ Signal Graph ของเกม ไม่ใช่รายการครุภัณฑ์ที่ยืนยันว่ามหาวิทยาลัยมีจริง  
**ข้อจำกัด:** **ไม่แก้ / รื้อ / ทับระบบห้องสตูดิโอที่พัฒนาอยู่**; ส่วนห้องสตูดิโอเป็นข้อมูลอธิบายและจุดตรวจยืนยันเท่านั้น  
**สถานะข้อมูล:** `VERIFIED_SPEC` = คุณสมบัติของรุ่นตัวอย่างที่อ้างอิงจากเอกสารผู้ผลิต; `DESIGN_REFERENCE` = ผังตัวอย่างที่ออกแบบให้เหมาะกับสถานที่; `PROVISIONAL` = รอตรวจของจริง; `UNKNOWN` = ยังไม่มีหลักฐาน

> ระบบ AV ใช้หลาย topology ได้ ไม่ใช่มีผังถูกเพียงผังเดียว ผังในเอกสารนี้เป็น **เส้นทางตัวอย่างสำหรับใช้เป็นข้อมูลประกอบเกม** ที่ออกแบบให้ครบอุปกรณ์และสอดคล้องกับการทำงานจริง ต้องตรวจ exact port ของรุ่นที่ใส่เกมก่อนล็อก interaction anchor

## A. กฎทางเทคนิคที่ใช้ทุกสถานที่

1. **แยก Signal เป็นประเภท:** Video (HDMI / SDI), Analog Audio (Mic/Line), Embedded Audio (ใน HDMI/SDI), USB (host ↔ device), IP/Network (สื่อสารสองทาง), Optical/Fiber (ต้องตรง transceiver/protocol), Control/Tally/Intercom, Power. กฎ `OUTPUT → INPUT` ใช้กับพอร์ต AV แบบทิศทางเดียว อย่าเอาไปตัดสิน USB/Network/Fiber/Power แบบเหมารวม
2. **หัวต่อหน้าตาเหมือนกันไม่ได้แปลว่าข้อมูลเข้ากัน:** SDI ผ่าน BNC 75 Ω ไม่เท่ากับ BNC ของ reference/timecode/MADI; RJ45 ไม่เท่ากับ Dante/NDI/Internet โดยอัตโนมัติ; USB-C ต้องแยก Host/Device/Webcam/Power/Control; 3.5 mm Mic กับ 3.5 mm Line ต้องตรวจระดับสัญญาณ; HDMI ≠ SDI โดยไม่ใช้ active converter [R03,R05,R07,R08]
3. **กำหนด format สำหรับแต่ละระบบ:** ใช้ baseline 1080p50 หรือ 1080p59.94/60 **เลือกหนึ่งค่าให้ตรงกัน** (ไม่ใช่ทุกตัวรองรับทุก format); 3G-SDI สามารถใช้กับ 1080p50/59.94/60 เมื่ออุปกรณ์และ Level A/B เข้ากัน; 4K ต้องตรวจ 6G/12G-SDI และสเปกอุปกรณ์จริง [R02,R08]
4. **Video vs Program vs Multiview:** `Camera Output` เป็น input source; `Switcher Program Out` เป็นภาพที่ส่งรายการ; `Multiview Out` เป็นภาพตารางช่วยผู้ควบคุม **ไม่ใช้แทน Program สำหรับผู้ชม**; `Preview` ไม่เท่ากับ Program; `AUX` จะส่งอะไรขึ้นกับการตั้งค่า routing [R01,R02]
5. **เสียง:** Mic → Preamp/Mixer (ปรับ gain, mix) → เส้นทางเสียงปลายทาง; Passive speaker ต้องมี power amplifier ในเส้นทาง ส่วน Active speaker มี amplifier ในตัว; Phantom +48V ใช้เมื่อไมค์ที่ต่ออยู่ต้องการ ห้ามเปิดเป็นคำตอบสำหรับไมค์ทุกตัว [R10,R11]
6. **Broadcast Mix กับ PA/FOH Mix:** งานที่มีคนอยู่ในสถานที่ควรมี output/bus แยกสำหรับลำโพงห้อง/เวที และสำหรับสตรีม เนื่องจากสมดุลเสียงและเสียงจากพื้นที่จริงต่างกัน อย่านำ FOH mix ไปเป็นสตรีมเสมอโดยไม่พิจารณา [R10,R12]
7. **การรวมภาพเสียง:** ออก program ที่มี embedded audio จาก switcher หรือใช้ audio embedder ที่รองรับจริงก่อน capture/encoder; หลีกเลี่ยงการจับ audio ซ้ำจาก HDMI และ desktop/USB input พร้อมกันจนเกิด echo. ตรวจ audio meter ที่ OBS และตรวจ sync จริงก่อน on-air [R04,R06,R13]
8. **ระยะสาย SDI:** ไม่ใส่กฎเหมารวมว่า SDI ได้ X เมตรทุกชนิด ระยะขึ้นกับ data rate (3G/12G), ชนิด coax, หัวต่อ, receiver, loss budget; ไปไกลให้เลือก fiber transport ที่มี TX/RX/กล้องที่รองรับ ไม่ใช่สาย fiber เสียบ BNC ตรง ๆ [R07,R09]
9. **Wireless:** Lavalier → TX → RF pairing → RX → audio cable → mixer; video TX/RX ก็เช่นกัน โดย RF segment ไม่ใช่ physical cable. ต้องตรวจ frequency compatibility, pairing, battery, receiver output [R11]
10. **Streaming:** Capture device ไม่ใช่ encoder โดยอัตโนมัติ; `Switcher USB webcam → OBS` ไม่จำเป็นต้องซื้อ capture card แยกถ้า switcher มีฟังก์ชันนี้; `SDI/HDMI Program → Capture → PC/OBS` เป็นอีกทาง; hardware encoder รับ Program แล้วส่ง RTMP/SRT ผ่าน network ของรุ่นที่รองรับ [R01,R04,R06,R13]
11. **สัญญาณมีหลาย state:** port physically connected, device powered/ready, correct format, video present, audio present, program selected, audio mix assigned, encoder connected, platform receiving และ recording active เป็นคนละเงื่อนไข
12. **ความปลอดภัย:** สายไม่กีดขวางทางหนีไฟ/ทางเดิน; ใช้ cable ramp ในจุดข้ามทาง; ภายนอกต้องมีระบบไฟ/grounding/weather protection โดยผู้ชำนาญการ เกมควรจำลองเป็น validation ไม่ใช่สอนผู้เล่นเดินไฟแรงสูงหรือแก้ไฟเอง

---

# ห้องประตูแรกแห่งภาพ — ห้องเรียน
**สถานที่:** ห้องเรียน  | **รูปแบบงาน:** สอนสด + แสดงสไลด์ + Hybrid Classroom  | **สถานะ:** DESIGN_REFERENCE

## ชุดระบบที่เลือก
ใช้ **HDMI Mini Switcher ที่มี HDMI output + USB Webcam Output** เป็นระบบตัวอย่างหนึ่งชุด เช่น ATEM Mini Pro ตามเอกสาร Blackmagic [R01] การเลือกนี้ทำให้ต่อจอห้องเรียนพร้อมส่งเข้า OBS ได้ **โดยไม่ต้องมี HDMI Capture Card แยก**; ถ้าเปลี่ยนเป็น Mini Switcher รุ่นที่ไม่มี USB Webcam Output ต้องเพิ่ม capture card และตรวจจำนวน program output ให้เพียงพอ

## อุปกรณ์ตามหมวด (จำนวนสำหรับระบบตัวอย่าง)
| หมวด | อุปกรณ์ | จำนวน/ตำแหน่ง | หน้าที่ |
|---|---|---|---|
| Video source | Classroom HDMI Camera + Tripod | 1, กลางหลังห้อง | รับภาพผู้สอน |
| Presentation | Laptop มี HDMI OUT | 1, โต๊ะอาจารย์ | ส่งสไลด์ |
| Video routing | Mini HDMI Switcher (ตัวอย่าง ATEM Mini Pro) | 1, โต๊ะควบคุมด้านหลัง | เลือก Camera/Slide; PGM/USB webcam |
| Monitoring / display | TV หรือ Projector พร้อม HDMI INPUT | 1, หน้าห้อง | แสดง Program |
| Audio source | Lavalier + compatible TX/RX | 1 ชุด, ตัวผู้สอน/โต๊ะควบคุม | ส่งเสียงพูด |
| Audio processing | Small Audio Mixer มี AUX/Main ตามที่กำหนด | 1, โต๊ะควบคุม | gain/mix / แยก PA และ stream ถ้าต้องการ |
| In-room sound | Active speaker หรือระบบ PA ที่มีอยู่ | 1 ระบบ, หน้าห้อง | ให้คนในห้องได้ยิน |
| Streaming | Notebook + OBS | 1, โต๊ะควบคุม | รับ USB webcam; record/stream |
| Accessories | HDMI ×3 (2 เส้นเข้าที่ Switcher และ 1 เส้นออกจอ), USB data×1, สาย audio ตามพอร์ต, power adapters, headphones | ตาม route | เชื่อมต่อ/จ่ายไฟ/ตรวจฟัง |

## พอร์ตต่อพอร์ต: Canonical Route
```text
ภาพ Camera:      Camera HDMI OUT ------HDMI------> Switcher HDMI IN 1
ภาพสไลด์:       Teacher Laptop HDMI OUT --HDMI--> Switcher HDMI IN 2
จอห้องเรียน:    Switcher HDMI PROGRAM OUT --HDMI--> TV/Projector HDMI IN
คอมสตรีม:        Switcher USB WEBCAM DEVICE --USB DATA--> Notebook USB HOST
ใน OBS:           Add Video Capture Device → เลือก Switcher webcam source
ไมค์:             Lavalier → TX ~~RF PAIRING~~> RX AUDIO OUT
เสียงเข้ามิกเซอร์: RX AUDIO OUT --audio cable--> Mixer LINE/MIC IN ตามระดับสัญญาณที่อุปกรณ์รองรับ
เสียงคนในห้อง: Mixer MAIN/PA OUT --> Active Speaker INPUT หรือ PA system
เสียงสตรีม:       Mixer STREAM/AUX OUT --> Switcher AUDIO IN ที่รองรับระดับสัญญาณ
                   (ตั้งค่า Mic/Line บนรุ่นที่รองรับ และตรวจ connector/level)
```
**อย่า** เพิ่ม Magewell ในเส้นทางหลักของรุ่นนี้เพียงเพราะชุดตัวอย่างอื่นมี Capture Card; USB Webcam Output เป็น capture interface ในตัวแล้ว [R01,R04]. HDMI OUT มีหน้าที่ส่งภาพให้จอ จึงไม่เอา Multiview ไปโชว์เป็นสไลด์ห้องเรียน

## อุปกรณ์/สายและทางเลือกที่ต้องมีจริง
- HDMI Type-A ↔ Type-A 3 เส้นตาม path ด้านบน; USB cable ที่เป็นข้อมูลและตรงพอร์ต switcher/computer; audio cable ที่ตรง RX/mixer/switcher โดยตรวจ mic/line level; power ของทุก device; Active speaker รับ line signal ไม่ใช่เอาสายลำโพง power-amp มาเสียบ input
- ถ้า Projector อยู่ไกลเกินความเหมาะสมของ HDMI passive ให้เปลี่ยนระบบส่งภาพ/ใช้ extender ตามสเปกจริง ไม่ตั้งระยะตายตัวในเกม

**แหล่งอ้างอิงของห้องเรียน:**
- [R01] [Blackmagic Design — ATEM Mini specifications](https://www.blackmagicdesign.com/products/atemmini/techspecs)
- [R04] [OBS — Sources Guide](https://obsproject.com/kb/sources-guide)
- [R10] [Shure — Audio system basics](https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems)

---

# สะพานจันทราแห่งเสียง — ห้องสตูดิโอ
**สถานที่:** ห้องสตูดิโอ  | **ข้อกำหนดพิเศษ:** **REFERENCE ONLY — ไม่แก้ห้องฝึก/ผัง/asset/port/gameplay ที่กำลังพัฒนา**  
**สถานะ:** ผังการสอนเป็น instructor-described workflow; exact physical ports หลายจุดยังเป็น PROVISIONAL/UNKNOWN

## อุปกรณ์ในขอบเขตข้อมูลเดิม (ไม่ใช่การยืนยันว่าเป็นของจริงทั้งหมด)
| หมวด | รายการ | หลักฐาน/สถานะ |
|---|---|---|
| กล้อง | Studio Camera 1–3 | รุ่นและ HDMI/SDI ของทุกตัว ยังไม่ครบ |
| Switcher | DeviceWell HDS7105 | ระบุชื่อได้มั่นใจสูง; ตรวจ revision/actual rear panel ก่อนล็อกพอร์ต |
| เสียงพูด | Sennheiser XS 1 แบบสาย | ระบุจากภาพเดิมความมั่นใจสูง; บทบาทใน exam route ยังต้องตกลง |
| Wireless | COMICA WM100 PLUS family, 2TX/1RX hypothesis | PROVISIONAL; อาจารย์เคยกล่าวถึง Saramonic |
| Mixer | PMX-402D-USB chassis | PROVISIONAL โดยเฉพาะแบรนด์/พอร์ตที่ติดตั้งจริง |
| Capture | Magewell USB Capture HDMI Gen 2 32060 | **SELECTED GAME REFERENCE ไม่ใช่ยืนยันว่าเป็นของห้องจริง** [R05] |
| Notebook / OBS | HP-style Notebook / OBS | HP model/port mapping ให้ยึดภาพจริงเท่านั้น |
| TV / Monitor | Samsung U8000F 43" | **SELECTED GAME REFERENCE** ไม่ใช่หลักฐานว่าเป็นจอของจริง |
| Studio Speaker | Yamaha HS5 | **SELECTED GAME REFERENCE** ไม่ใช่หลักฐานว่าเป็นลำโพงของจริง |

## Instructor-described canonical audio/video path (เพื่อความรู้เท่านั้น)
```text
Camera 1/2/3 --[connector/transport VERIFY]--> HDS7105 VIDEO INPUTS
COMICA Lav 1 → TX1 --RF--> RX
COMICA Lav 2 → TX2 --RF--> RX
RX AUDIO OUTPUT → Mixer INPUT
Sennheiser XS1 XLR OUT → Mixer MIC INPUT (ถ้าภารกิจมีไมค์สาย)
Mixer designated OUTPUT → HDS7105 compatible AUDIO INPUT [VERIFY model/revision/level]
HDS7105 designated MULTIVIEW output → TV HDMI IN [VERIFY physical port]
HDS7105 PGM HDMI OUT → Magewell HDMI IN [GAME REFERENCE]
Magewell USB 3.0 DEVICE → HP Notebook USB HOST → OBS Video Capture Device
Mixer MONITOR/AUX OUT → active HS5 line input [if supported/assigned]
```
**สำคัญ:** อาจารย์เน้น `Mixer → Switcher → Capture` สำหรับเส้นเสียงรายการของห้องนี้; ไม่ใช้ `Mixer → Capture` เป็นเส้นบังคับหลัก. แต่การมีเส้น Monitor speaker แยกจาก Mixer ไม่ขัดหลักนี้. ตัวรับ wireless แบบ 2TX/1RX อาจ mix สองช่องหรือแยกช่องได้ตามรุ่น/setting; อย่าสมมติช่องอิสระโดยไม่มีข้อมูล

## จุดที่ยังห้ามเดารุ่น/พอร์ต
- กล้อง 2/3, HDMI vs SDI actual; ถ้า SDI source เข้ารุ่นที่มีแต่ HDMI ต้องมี active SDI→HDMI conversion [R08]
- Audio Mixer output → Switcher input ต้องตรวจ connector/level; ห้ามยัด XLR เข้า HDMI หรือใช้ 3.5 ต่อแบบไม่ดู mic/line
- Capture Card ที่ใช้ในห้องจริง = UNKNOWN; Magewell คือรุ่นสำหรับ training reference เท่านั้น
- Speaker, TV, wireless actual brand/model = ยังไม่ยืนยันของจริง

**เอกสารนี้ไม่สั่งแก้หรือทดสอบห้องสตูดิโอเดิม**

**แหล่งอ้างอิงของห้องสตูดิโอ:**
- [R05] [Magewell — USB Capture HDMI Gen 2](https://www.magewell.com/products/usb-capture-hdmi-gen-2)
- [R04] [OBS — Video Capture Sources](https://obsproject.com/kb/video-capture-sources)
- [R08] [Blackmagic — Micro Converters](https://www.blackmagicdesign.com/products/microconverters)
- หมายเหตุ: ผัง Mixer → HDS7105 → Capture มาจากคำอธิบายอาจารย์ ไม่ใช่ข้อกำหนดสากลว่าทุกสตูดิโอต้องต่อเหมือนกัน

---

# หอคอยกระจกสลับภาพ — หอประชุมอาคารกิจกรรม
**สถานที่:** หอประชุมอาคารกิจกรรม  | **รูปแบบงาน:** เวที/สัมมนา/พิธีการ/ฉายจอ/ไลฟ์พร้อมกัน  | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
Production switcher ประเภท **8-input 3G-SDI, XLR balanced audio, dedicated Program/AUX/Multiview/USB webcam** (ตัวอย่างตรวจสเปกจาก ATEM Television Studio HD8/ISO) [R02] + **Digital Audio Mixer ที่แยก PA BUS และ BROADCAST BUS ได้**. มี SDI→HDMI converter สำหรับจอ/โปรเจกเตอร์ที่รับ HDMI เท่านั้น [R08]. ถ้าใช้ analog stagebox ให้มี analog multicore/return ที่ตรงกัน; ถ้าใช้ Dante stagebox ต้องมี Dante-compatible mixer/interface และ network routing ไม่ใช่เสียบ RJ45 ธรรมดา [R14]

## Equipment inventory สำหรับงานตัวอย่าง
| หมวด | จำนวนอ้างอิง | อุปกรณ์/ตำแหน่ง |
|---|---:|---|
| กล้อง | 3 | SDI Camera ซ้าย/กลาง/ขวา บน tripod |
| PTZ | 1 | PTZ ที่ **มี SDI output** + mount + power + controller/network ตามรุ่น |
| Slides | 1 | Presentation Laptop HDMI OUT + **powered HDMI→SDI converter** |
| Video control | 1 | Production 3G-SDI Switcher ที่ FOH |
| Displays | 2–3 | Multiview monitor, Program confidence monitor, Stage LED/projector พร้อม processor/input |
| Conversion | ตามปลายทาง | SDI→HDMI converter ให้จอที่ไม่มี SDI; Scaler/LED processor เมื่อ required |
| Mic | 1+2+2 | Podium mic, wireless handheld 2, lav 2 พร้อม TX/RX ที่ compatible |
| Audio routing | 1 | Stagebox analog + multicore หรือ digital stagebox เฉพาะระบบ compatible |
| Audio control | 1 | Digital Mixer ที่ FOH มี separate Main/Matrix/Aux buses |
| PA | 1 ระบบ | FOH MIX → system DSP ตามความจำเป็น → active PA หรือ amp→passive PA |
| Streaming/record | 1+ | PC/OBS รับ switcher USB webcam **หรือ** dedicated SDI capture/recorder ตาม design (เลือกให้ชัด) |
| Support | ตามระบบ | SDI 75Ω/BNC, XLR balanced, multicore/Dante network ตาม selected design, HDMI patch, USB data, headsets, UPS, power distribution |

## Canonical VIDEO
```text
CAM L SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 1
CAM C SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 2
CAM R SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 3
PTZ SDI OUT ----------75Ω SDI/BNC-------> Switcher SDI IN 4
Presentation Laptop HDMI OUT → powered HDMI→SDI Converter → Switcher SDI IN 5

Switcher MULTIVIEW HDMI/SDI OUT → compatible FOH Multiview Monitor
Switcher dedicated PROGRAM SDI OUT → Recorder / SDI Capture (if selected)
Switcher AUX OUT configured to PROGRAM → SDI→HDMI converter → Stage Projector/LED processor HDMI IN
Switcher USB WEBCAM DEVICE → Production PC USB HOST → OBS (selected simple streaming route)
```
**ทุก output ที่แตกต่างต้องมี physical port ของ switcher ที่เลือกจริง**. ถ้า HD8 output ใช้ 1 HDMI เป็น Multiview แล้วส่ง Projector HDMI ให้ใช้ SDI AUX → active converter; ห้ามใช้สาย SDI→HDMI ที่ไม่แปลงสัญญาณ. USB webcam กับ separate capture/recorder เป็นทางเลือกตามการออกแบบ ไม่บังคับสองตัวโดยไม่มีเหตุผล [R02,R08].

## Canonical AUDIO — แยกสองปลายทาง
```text
Podium Mic XLR OUT → Stagebox MIC IN 1 → compatible multicore/Dante → Mixer MIC CH1
Wireless Handheld RX 1/2 XLR/LINE OUT → Stagebox/Mixer input CH2/3
Wireless Lav RX OUT → Stagebox/Mixer suitable input CH4/5 (output count verified)

Mixer MAIN/PA BUS OUT → Venue DSP / Active PA System (หรือ Amp → Passive PA)
Mixer BROADCAST AUX/MATRIX L/R LINE OUT → Switcher balanced XLR AUDIO IN L/R
Switcher must assign/enable this audio in PROGRAM → Stream/Capture
```
**อย่า:**เอา Mic-level XLR ของไมค์ไปต่อ Line-only input โดยไม่ผ่าน mic preamp; ห้ามถือว่า FOH bus = broadcast bus เสมอ [R10,R12].

## ตำแหน่งอุปกรณ์ตามสถานการณ์จริง
- FOH หลังหอประชุม = Switcher, Mixers, multiview, program monitor, PC, recorder; กล้องกลาง near FOH
- เวที = Podium, mic; side-stage = stagebox + wireless mic cases; กล้องอื่นอยู่ aisle edge
- สายตามขอบทางเดิน/side-stage/service path; ไม่บังประตูหนีไฟ; projector/LED อยู่ด้านหน้าและใช้สาย conversion/processor ตาม spec

**แหล่งอ้างอิงของหอประชุม:**
- [R02] [Blackmagic — ATEM Television Studio technical specifications](https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs)
- [R08] [Blackmagic — HDMI/SDI Micro Converters](https://www.blackmagicdesign.com/products/microconverters)
- [R14] [Yamaha — Tio1608-D Dante I/O rack](https://th.yamaha.com/en/business/audio/products/interfaces/tio1608-d/)
- [R10] [Shure — หลักการระบบเสียง](https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems)

---

# คลังผนึกพอร์ตโบราณ — พื้นที่ภายนอกอาคาร
**สถานที่:** พื้นที่ภายนอกอาคาร | **รูปแบบงาน:** งานภาคสนาม/ลานกิจกรรม/เวทีนอกอาคาร | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
Main control อยู่ **Control Tent**; กล้องใกล้ใช้ 3G-SDI ที่ความยาวได้รับการตรวจตามสเปก; กล้องไกลใช้ **active SDI-to-Fiber TX + matched RX** (หรือ broadcast camera fiber system ที่เข้ากันจริง); Wireless Video เป็นทางเลือกแยกไม่ใช่สิ่งจำเป็นสำหรับทุกงาน. โปรแกรมภาพออกเป็น **SDI 1080p**; เสียงที่ MIX แยก PA และ Program แล้ว **embed ด้วย compatible analog-audio-to-SDI embedder** ก่อนเข้า SDI hardware encoder (ตัวอย่าง AJA 3G-AMA รองรับ 3G-SDI + balanced analog I/O) [R07,R09,R15]. เลือกใช้ Encoder แบบมี SDI IN และ Ethernet เช่น Blackmagic Web Presenter 4K / Streaming Encoder 4K (ให้ตรวจรุ่น/format ที่เกมใช้) [R06].

## Equipment inventory ตัวอย่าง
| หมวด | จำนวน | อุปกรณ์/ตำแหน่ง |
|---|---:|---|
| Field video | 3 | Field Cameras A/B/C มี SDI output + tripods ต่างตำแหน่ง |
| Remote transport | 1 คู่ | Fiber TX/RX compatible + matched fiber patch/cable + power |
| Optional | 1 คู่ | Wireless Video TX/RX compatible + antenna/power (ทางเลือกของระบบ) |
| Video control | 1 | Portable 3G-SDI switcher ใน control tent |
| Monitoring | 1 | Portable Multiview Monitor compatible with output หรือ SDI→HDMI converter |
| Audio capture | 3 ระบบ | Wireless presenter TX/RX, shotgun mic, ambient mic (ตรวจ phantom ตามไมค์) |
| Audio mixing | 1 | Field audio/digital mixer มี PA/Broadcast buses |
| Audio embed | 1 | 3G-SDI analog audio embedder พร้อม breakout/connector/power ตามรุ่น |
| PA | 1 ระบบ | Venue DSP/active PA หรือ amp+passive PA แยกจาก broadcast |
| Streaming | 1 | Hardware Encoder SDI input + Ethernet network output |
| Networking | 1 ระบบ | Router + primary wired uplink เมื่อมี; mobile uplink เป็น fallback ตามอุปกรณ์จริง |
| Support | — | Cable reels 75Ω SDI, fiber case, XLR, power, UPS, weather covers, cable ramps, intercom headsets |

## Canonical VIDEO / TRANSPORT
```text
Near CAM A SDI OUT → qualified 75Ω SDI cable → Switcher SDI IN 1
Near CAM B SDI OUT → qualified 75Ω SDI cable → Switcher SDI IN 2
Far CAM C SDI OUT → FIBER TX SDI IN → matched optical link → FIBER RX SDI OUT → Switcher SDI IN 3
Switcher MULTIVIEW OUT → compatible Portable Monitor (converter if needed)
Switcher PGM SDI OUT → Audio Embedder SDI IN → Audio Embedder SDI OUT → Encoder SDI IN
Encoder Ethernet NETWORK OUT/PORT ↔ Router/LAN ↔ Internet Uplink → streaming ingest endpoint
```
**ผู้เล่นต้องเห็น** power state และ matching protocol/type บน fiber TX/RX; optical IN/OUT และ strand type ต้องยึดอุปกรณ์คู่จริง ไม่สอนว่า fiber ทุกชนิดใช้ร่วมกันได้. SDI cable max length ขึ้นกับ actual loss budget ไม่ใช่ fix ว่า “100m ถูกเสมอ” [R07,R09].

## Canonical AUDIO
```text
Presenter Lavalier → Wireless TX ~~RF~~> Receiver LINE/AUDIO OUT → Field Mixer proper input
Shotgun Mic XLR OUT → Field Mixer MIC IN (phantom only if required by model)
Ambient Mic XLR OUT → Field Mixer MIC IN
Mixer PA BUS → active PA/venue sound system
Mixer BROADCAST L/R LINE OUT → Audio Embedder compatible BALANCED AUDIO IN
Audio Embedder combines audio with Switcher PGM SDI → Encoder input
```
AJA 3G-AMA ตัวอย่างมี SDI IN/OUT และ breakout XLR balanced; ไม่ใช่เสียบ XLR เข้า BNC และการเลือก embed pair ต้อง configure [R15]

## ตำแหน่งและข้อกำหนด
- Service unload/cases → Control tent; camera A/B หน้าซ้าย-ขวา, camera C ไกล; TX อยู่ต้นทาง RX อยู่ฝั่ง control
- Cable route ขอบพื้นที่ + ramps ที่จำเป็น; power/UPS อยู่แยกจากสายสัญญาณ; weather protection ต้องเหมาะกับ rating ของ equipment
- network: `ENCODER CONNECTED` ≠ `STREAM HEALTHY`; กำหนด upstream network/ingest states และ bitrate/uplink headroom ตาม platform current guide [R13]

**แหล่งอ้างอิงของงานภายนอกอาคาร:**
- [R07] [Belden — ข้อจำกัดของระยะทางสาย SDI](https://www.belden.com/blogs/broadcast/12g-sdi-distance-challenges-to-consider-for-media-av-projects)
- [R09] [Blackmagic — Fiber Converters](https://www.blackmagicdesign.com/products/blackmagicfiberconverters)
- [R15] [AJA — 3G-AMA Audio Embedder](https://www.aja.com/products/3g-ama)
- [R06] [Blackmagic — Streaming Processors](https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs)

---

# บัลลังก์จอมถ่ายทอด — สนามกีฬาและงานถ่ายทอดสด
**สถานที่:** สนามกีฬาและงานถ่ายทอดสด | **รูปแบบงาน:** Multi-camera Broadcast + Commentary + Replay + Graphics + Program/Backup Streaming | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
ระบบเป็น 3 โซน Field/Commentary/Broadcast Control; ใช้ **Broadcast Camera + matched fiber/base station/CCU**, SDI router, production switcher ขนาดใหญ่, replay/graphics, audio stagebox + broadcast audio console, multiview, talkback/tally, main/backup encoders, recording, **independent** main/backup network paths ตามความเป็นไปได้ [R03,R09,R16,R17]. ตัวอย่าง Video Router: Blackmagic Videohub 20x20 12G (20 inputs/20 outputs) [R16]. ตัวอย่าง Production Switcher: ATEM 2 M/E Constellation 4K (20 SDI inputs) [R03]. รุ่นเป็น design reference ไม่ใช่ของสถานที่จริง

## Inventory แบ่งตามระบบ
| หมวด | ตัวอย่างจำนวน | หน้าที่ / ตำแหน่ง |
|---|---:|---|
| Camera | 6 | Main high-wide, field L/R, goal/end, long-lens, mobile; tripods/support |
| Camera links | 6 ชุด | Fiber-capable camera transport + compatible CCU/base stations; camera power, return/control as supported |
| Video routing | 1 | Video Router (crosspoint sources → destinations), technical rack |
| Live switching | 1 | Large SDI Production Switcher, operator desk |
| Source extras | 2 | Replay Server output, Graphics PC SDI/compatible output (HDMI→SDI converter if applicable) |
| Monitoring | 1 ระบบ | Multiview wall + Program/Preview/confidence display + converter if needed |
| Audio sources | ≥6 | 2 commentator mics, 2 crowd/ambient, 1 field mic, 1 wireless presenter TX/RX |
| Audio transport | 1 ระบบ | Audio Stagebox / multicore or correctly configured Dante + suitable consoles/interfaces |
| Audio console | 1 | Digital Broadcast Console with independent Broadcast and Venue PA buses |
| Venue PA | 1 ระบบ | DSP + powered PA or amplifier → passive PA |
| Operators | 1 ระบบ | Intercom/Talkback matrix/beltpacks/headsets; tally links to camera system as model supports |
| Streaming | 2 | Main and backup SDI encoders with suitable independent program feeds |
| Internet | 2 เส้นทาง | Primary uplink + backup uplink with genuinely separate failure domains where possible |
| Recording | 1+ | Program Recorder / recording storage; optional ISO record by supported device |
| Support | — | 75Ω SDI patch, fiber, network, XLR/balanced line, distro/UPS, rack labels/patch panels |

## Canonical FIELD / VIDEO ROUTES
```text
CAM 1..6 → matched CAMERA FIBER SYSTEM → BASE STATION/CCU 1..6
CCU 1..6 VIDEO SDI OUT → Video Router SDI IN 1..6
Replay Server VIDEO OUT → Router SDI IN 7
Graphics VIDEO OUT → compatible SDI route → Router SDI IN 8

Router SDI OUT 1..8 (assigned via crosspoints) → Switcher SDI IN 1..8
Switcher MULTIVIEW OUT → Multiview Wall compatible input
Switcher PROGRAM OUT 1 → Main Encoder SDI IN
Switcher independent PROGRAM/AUX OUT 2 configured to same PGM → Backup Encoder SDI IN
Switcher AUX OUT configured Venue Feed → Venue Display processor / converter → Stadium screen
Switcher PROGRAM/ISO output (as designed) → Recorder
```
**Router ไม่ใช่ Switcher:** router เลือกว่า feed จาก connector ไหนไป output ไหน; switcher สร้าง Program/Preview/Transition. 20x20 หมายถึงจำนวน ports ไม่ใช่จำนวนกล้องขั้นต่ำ [R03,R16]

## Canonical AUDIO: สอง MIX ตามหน้าที่
```text
Commentator Mic 1/2 → Audio Stagebox proper Mic inputs
Crowd Mic L/R → Stagebox proper Mic inputs (phantom when required)
Field Mic → Stagebox MIC IN
Wireless Presenter TX ~~RF~~> RX → Stagebox/Console compatible input
Stagebox → compatible multicore/Dante routing → Digital Audio Console

Console VENUE PA BUS → Venue DSP/Amplification → Stadium PA
Console BROADCAST PROGRAM L/R BUS → Switcher compatible balanced audio input
                   OR → compatible Audio Embedder → Program SDI pipeline
Switcher final PGM with embedded program audio → both Main/Backup Encoders
```
### กรณีเลือก ATEM Constellation 4K เป็น reference
รุ่น 2 M/E มี 2 x balanced 1/4-inch analog audio input และ embedded SDI audio; จึงต้องเลือก **balanced output/cable matching** หรือใช้อุปกรณ์ embedder ที่ตรง format. อย่าระบุว่ามี XLR analog input บนตัว switcher โดยอัตโนมัติ [R03,R15].

## Control/Tally/Intercom/Sync (แยกจาก Video Signal)
- Camera return/control, tally, talkback ต้องใช้ link/protocol ของระบบ camera/base station ที่เลือก (ไม่ได้เกิดเองจาก SDI เส้นเดียวทุกยี่ห้อ) [R09]
- Replay/graphics ต้องมี source video ที่ switcher/format compatible; controller เป็น `CONTROL` ไม่ใช่ program video cable
- ระบบที่มี ref input / genlock / timecode ให้สอนการเลือก sync source/format ตามอุปกรณ์; input re-sync บางรุ่นไม่ใช่ข้ออ้างว่าทุกอุปกรณ์มี frame sync [R03]
- ถ้าใช้ Dante network audio ให้สร้าง logical TX-channel→RX-subscription, clock/PTP, primary/secondary independent networks ตามระบบ ไม่ใช่ “RJ45 เข้ารูไหนก็ได้” [R17]

## Redundancy rule
Main encoder และ backup encoder ต้องได้รับ program ที่เหมาะสมผ่าน **สอง physical outputs หรือ proper SDI distribution equipment** ไม่ใช้ Y-split passive BNC; backup network ต้องไม่พึ่ง single point of failure เดียวกันถ้าระบบถูกเรียกว่า redundant. ถ้าแค่สอง encoder วิ่ง router/uplink เดียว ให้ระบุสถานะเป็น `PARTIAL REDUNDANCY` ไม่ใช่ `FULL REDUNDANCY` [R16,R17]

**แหล่งอ้างอิงของงานสนามกีฬา/ถ่ายทอดสด:**
- [R03] [Blackmagic — ATEM Constellation specifications](https://www.blackmagicdesign.com/products/atemconstellation/techspecs/W-APS-26)
- [R16] [Blackmagic — Videohub specifications](https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs)
- [R09] [Blackmagic — Fiber Converters](https://www.blackmagicdesign.com/products/blackmagicfiberconverters)
- [R17] [Audinate — Dante routing guide](https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/routing_media.htm)

---

# หมวดอุปกรณ์และหน้าที่ของพอร์ต (สำหรับฐานข้อมูลเกม)

| ประเภทในเกม | อุปกรณ์ | Ports/logic ที่ต้องสอน |
|---|---|---|
| VIDEO_SOURCE | Camera / PTZ / Laptop / Replay / Graphics | HDMI OUT / SDI OUT / IP output เฉพาะรุ่น |
| VIDEO_SWITCHING | Mini/Production Switcher | source inputs; PGM, Preview, AUX, MV เป็นคนละ signal |
| VIDEO_ROUTING | Video Router | SDI INs/OUTs + configurable crosspoint |
| CONVERSION | HDMI→SDI, SDI→HDMI, SDI↔Fiber TX/RX | converter has separate signal, power, and direction |
| AUDIO_SOURCE | Wired Mic, Lav, Shotgun, Crowd Mic | Mic-level; power as required |
| WIRELESS | Audio TX/RX, Video TX/RX | pairing RF + wired ports at TX/RX |
| AUDIO_MIXING | Small/Field/Digital/Broadcast mixer | MIC/LINE inputs, gain, Main/Matrix/Aux bus, headphones |
| AUDIO_TRANSPORT | Stagebox, multicore, Dante I/O | compatible multicore or TX/RX Dante subscription |
| AUDIO_DISTRIBUTION | PA/Active Speaker/Amp/DSP | line to active/DSP; amplifier needed for passive speaker |
| AUDIO_EMBED | HDMI/SDI embedder | video IN + audio IN → video-with-audio OUT |
| MONITORING | TV, Multiview Wall, Headphones | monitoring isn't same as broadcast destination |
| CAPTURE | USB/SDI/HDMI capture | physical input → USB device to host; needs software source |
| ENCODE | OBS PC or dedicated hardware encoder | receives program; creates stream/record output |
| NETWORK | Router/uplink/ingest endpoint | IP connectivity, upload capacity, actual on-air state |
| OPERATIONS | Intercom, Tally, CCU, Recorder | control and status path separate from picture where needed |
| SUPPORT | Power/UPS/Tripod/Cable ramp/Cases | required presence/placement, avoid hazardous electrical mini-game |

## Signal and connector tags (ตัวอย่าง)
- `HDMI_AV`: HDMI Type-A video + embedded audio
- `SDI_AV_3G`: SDI on **75-ohm** BNC, supported signal format / Level A-B
- `ANALOG_MIC_BALANCED`: XLR balanced microphone level
- `ANALOG_LINE_BALANCED`: XLR/TRS line level as actual equipment
- `ANALOG_LINE_UNBALANCED`: 3.5mm/RCA only if true ports
- `USB_WEBCAM_DEVICE`: capture/switcher-to-PC USB peripheral; PC must be `USB_HOST`
- `DANTE_AUDIO_IP`: requires Dante-enabled endpoint and configured routing, not generic Ethernet
- `NETWORK_IP`: router/encoder uplink; not SDI program video itself
- `FIBER_VIDEO_LINK`: matched powered TX/RX / supported CCU system, correct medium
- `WIRELESS_AUDIO_RF`, `WIRELESS_VIDEO_RF`: paired logical link; no wired cable across RF gap
- `SDI_CONTROL`, `TALLY`, `INTERCOM`, `REFERENCE`, `POWERSOURCE`: explicit port role as supported

#### ลำดับตรวจสอบความถูกต้องของการต่อ
```text
1. Is correct equipment present + reachable?
2. Does source port emit expected type and is device ready?
3. Are connector, physical medium and electrical signal level compatible?
4. Is intermediate converter/stagebox/router/receiver actually present and configured?
5. Is the chosen route allowed by ระบบที่เลือก (not all physically possible routes fulfill the job)?
6. Are downstream INPUT and required processing/selection ready?
7. Has Program actually been selected? Is monitoring target PGM or MV as intended?
8. Is program audio embedded/assigned, non-duplicated, and present at destination?
9. Does capture/encoder/OBS detect the correct device, and is network/uplink ready when streaming?
10. Are venue PA, screen, monitor, recording and optional backup independently ready if required?
```

### ตัวอย่างสถานะการต่อที่ไม่ถูกต้อง
- `WRONG_DIRECTION`: AV output→output/input→input
- `WRONG_CONNECTOR`: HDMI→SDI directly, XLR→SDI BNC, USB device→device
- `WRONG_SIGNAL_ROLE`: 75Ω BNC SDI fed into BNC REF/MADI input
- `WRONG_AUDIO_LEVEL`: RX line out into unsuitable mic input without correct level config
- `NO_CONVERTER`: HDMI source goes into SDI port without active HDMI→SDI
- `NO_AUDIO_EMBED`: Program video reaches encoder but analog audio never enters program
- `MULTIVIEW_AS_PROGRAM`: audience display/stream receives multiview instead of clean PGM
- `NO_SIGNAL_DESPITE_CABLE`: camera off / format mismatch / wrong input / router crosspoint
- `DOUBLE_AUDIO`: OBS captures embedded HDMI audio and duplicated desktop audio
- `FAKE_BACKUP`: main/backup share same single network failure point
- `STAGEBOX_PROTOCOL_MISMATCH`: generic Ethernet ↔ Dante with incompatible interfaces
- `RF_NOT_PAIRED`: audio/video TX and RX are present but frequency/pair/link invalid
- `UNSAFE_CABLE_ROUTE`: crosses walkway/egress without proper routing/protection

---

# แหล่งอ้างอิงหลัก (เว็บไซต์ผู้ผลิตและคู่มือทางการ)

- **[R01]** Blackmagic Design — ATEM Mini series official technical specifications, including ATEM Mini Pro HDMI inputs, HDMI out and USB webcam: https://www.blackmagicdesign.com/products/atemmini/techspecs
- **[R02]** Blackmagic Design — ATEM Television Studio HD8/ISO technical specifications (3G-SDI, audio, multiview, webcam, PGM/AUX): https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs
- **[R03]** Blackmagic Design — ATEM 2 M/E Constellation 4K specifications (20 SDI inputs, audio/control/output types): https://www.blackmagicdesign.com/products/atemconstellation/techspecs/W-APS-26
- **[R04]** OBS — Video capture sources and audio mixer guides: https://obsproject.com/kb/sources-guide and https://obsproject.com/kb/audio-mixer-guide
- **[R05]** Magewell — USB Capture HDMI Gen 2, part no. 32060, HDMI embedded audio and USB host interface: https://www.magewell.com/products/usb-capture-hdmi-gen-2
- **[R06]** Blackmagic Design — Streaming processors/Web Presenter specifications (SDI input, Ethernet RTMP/SRT, monitor): https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs
- **[R07]** Belden — SDI distance depends on cable attenuation, rate, receiver and added connector losses: https://www.belden.com/blogs/broadcast/12g-sdi-distance-challenges-to-consider-for-media-av-projects
- **[R08]** Blackmagic Design — Micro Converters, explicit HDMI→SDI and SDI→HDMI products: https://www.blackmagicdesign.com/products/microconverters
- **[R09]** Blackmagic Design — Fiber Converters: matched camera/studio converters, video/audio/talkback/tally/power over compatible SMPTE fiber: https://www.blackmagicdesign.com/products/blackmagicfiberconverters
- **[R10]** Shure — Sound system chain: microphone→mixer→amp/speaker, signal levels and broadcast sends: https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems
- **[R11]** Shure — BLX wireless system user guide: compatible TX/RX, receiver→mixer: https://www.shure.com/en-US/docs/guide/BLX ; phantom power explainer: https://service.shure.com/articles/en_US/Knowledge/what-is-phantom-power
- **[R12]** Shure — Separate streaming mix vs in-person mix discussion: https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems
- **[R13]** YouTube Help — Encoder setup and upload/bitrate/stream-health guidance (values can change by platform/date): https://support.google.com/youtube/answer/2853702?hl=en-EN
- **[R14]** Yamaha — Tio1608-D Dante stagebox illustrates that a network stagebox requires compatible Dante ecosystem (example product, not mandated purchase): https://th.yamaha.com/en/business/audio/products/interfaces/tio1608-d/
- **[R15]** AJA — 3G-AMA SDI analog audio embedder with SDI IN/OUT and balanced breakout I/O: https://www.aja.com/products/3g-ama
- **[R16]** Blackmagic Design — Videohub 20x20 12G SDI crosspoint router specification: https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs
- **[R17]** Audinate — Dante clock / media routing / redundant networks: https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/clock_synchronization.htm and https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/routing_media.htm

## หมายเหตุสำหรับการนำข้อมูลไปใช้
- ข้อมูลจากผู้ผลิตยืนยัน **ความสามารถของรุ่นตัวอย่าง** ไม่ใช่ว่าทุกอุปกรณ์ในหมวดนั้นทำได้เหมือนกัน
- ถ้าเปลี่ยนชื่อรุ่นในเกม ต้องกลับไปตรวจพอร์ต/สเปก/format/feature ทุกจุด ไม่ใช่ใช้ port catalog ของอีกรุ่นแทน
- ทุกอุปกรณ์ที่ยังไม่ได้เห็นป้ายรุ่นจริง ต้องใช้ `DESIGN_REFERENCE` / `GENERIC TRAINING MODEL` / `PROVISIONAL` / `UNKNOWN` ตามความเหมาะสม
- เอกสารฉบับนี้เป็น **ข้อมูลและแบบฝึกที่เสนอ** ไม่ได้แก้ไฟล์ใน `D:\etcstream` และ **ไม่แตะห้องสตูดิโอ**
