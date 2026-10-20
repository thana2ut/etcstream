# 01 · ทะเบียนฮาร์ดแวร์ (Gate 1: รอบแรก)

วันที่ตรวจหน้าเว็บทางการ: 2026-10-20 · ข้อมูลจากหน้า techspecs ของผู้ผลิต อ่านผ่าน WebFetch · **ยังไม่ได้ตรวจภาพถ่ายด้านหน้า/หลังทีละมุม และยังไม่ได้ตรวจ PDF คู่มือทีละหน้า** จึงยังไม่มีรุ่นใดได้ `LOCKED_EXACT_REVISION`

ความหมายของสถานะ: `LOCKED_EXACT_REVISION` · `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` · `PROVISIONAL_GAME_REFERENCE` · `GENERIC_EDUCATIONAL_PROFILE` · `BLOCKED_CONFLICT`

## ก. รุ่นจริงที่อยู่ในโค้ดภารกิจตอนนี้ (6 รุ่น)

### 1. Blackmagic Micro Converter HDMI to SDI 3G (`bmd-micro-converter-hdmi-sdi-3g`)
- **แหล่ง:** https://www.blackmagicdesign.com/products/microconverters/techspecs/W-CONU-18 (sourceUrl ในโค้ด)
- **พอร์ตตามผู้ผลิต:** "HDMI Type A in" · "2 x SD, HD or 3G-SDI" out · USB Type-C สำหรับไฟ/อัปเดต (4.4–5.25V) · รุ่น wPSU มีอะแดปเตอร์ +5V
- **พอร์ตในโค้ด:** HDMI IN, SDI OUT (1 ช่อง), USB-C POWER
- **การตรวจ:** เส้นทางที่ใช้ (HDMI แล็ปท็อป/กราฟิก → SDI เข้าสวิตเชอร์, ใช้ไฟ USB-C) ถูกต้อง แต่ **โมเดลขาด SDI OUT ตัวที่ 2** ซึ่งมีจริงบนตัวเครื่อง
- **ด่านที่ใช้:** AU-03, AU-04, AU-05, SP-03, SP-04, SP-05
- **สถานะ:** `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` (ยังไม่ได้ตรวจภาพจริง ต้องเพิ่มพอร์ตที่ขาด และต้องระบุว่าใช้รุ่นมีหรือไม่มี PSU)

### 2. Blackmagic Micro Converter SDI to HDMI 3G (`bmd-micro-converter-sdi-hdmi-3g`)
- **แหล่ง:** หน้าเดียวกับข้อ 1
- **พอร์ตตามผู้ผลิต:** "1 x SD, HD or 3G-SDI" in · 1 SDI loop out · "HDMI Type A out" · USB-C ไฟ
- **พอร์ตในโค้ด:** SDI IN, HDMI OUT, USB-C POWER
- **การตรวจ:** เส้นทางที่ใช้ถูกต้อง แต่ **โมเดลขาด SDI LOOP OUT**
- **ด่านที่ใช้:** AU-01, AU-03, AU-04, AU-05
- **สถานะ:** `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING`

### 3. Blackmagic HyperDeck Studio HD Plus (`bmd-hyperdeck-studio-hd-plus`)
- **แหล่ง:** https://www.blackmagicdesign.com/ae/products/hyperdeckstudio/techspecs
- **พอร์ตตามผู้ผลิต:**
  - SDI: 1 in (สูงสุด 6G) · 2 out + 1 monitor out
  - HDMI 2.0: 1 in / 1 out
  - เสียง: headphone 6.35 mm
  - Ethernet 1Gb, ช่อง SD 2 ช่อง, USB-C (บันทึกลงไดรฟ์ภายนอก / webcam)
  - ไฟ AC ภายใน + 4-pin XLR 12V
- **พอร์ตในโค้ด:** SDI IN, SDI OUT
- **การตรวจ:** เส้นทางที่ใช้ (PGM SDI → บันทึก) ถูกต้อง แต่โมเดลขาดพอร์ตที่มองเห็นได้บนตัวเครื่องหลายตัว
- **ด่านที่ใช้:** AU-05
- **สถานะ:** `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING`

### 4. Magewell USB Capture HDMI Gen 2 (`magewell-usb-capture-hdmi-gen2`)
- **แหล่ง:** https://www.magewell.com/products/usb-capture-hdmi-gen-2 · Part number **32060** (SKU 320600000)
- **พอร์ตตามผู้ผลิต:** "One HDMI input + embedded audio" · USB 3.0 (เข้ากับ USB 2.0 ได้) มีสาย USB 3.0 แถมมา (ACC10001) · เสียง 2 ช่อง · รับภาพได้สูงสุด 2048×2160 ที่ 120fps
- **ที่หน้าเว็บไม่ระบุ:** ชนิดขั้ว USB ฝั่งตัวเครื่อง, HDMI loop-through, ช่องเสียงแยก
- **พอร์ตในโค้ด:** HDMI IN, "USB 3.0 (DEVICE → HOST)" ใช้หัว USB-A ซึ่งเป็นฝั่งคอมพิวเตอร์ ส่วนฝั่งตัวเครื่องยังไม่ยืนยัน
- **การตรวจ:** บทบาทถูกต้อง เป็นอุปกรณ์จับภาพ HDMI→USB ไม่ใช่ตัวเข้ารหัสสตรีม และไม่ใช่ webcam ของสวิตเชอร์
- **ด่านที่ใช้:** ST-04, ST-05
- **สถานะ:** `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` (ต้องดูคู่มือหรือภาพเพื่อยืนยันชนิดขั้ว USB ฝั่งตัวเครื่อง)

### 5. Shure SM58 (`shure-sm58`)
- **แหล่งในโค้ด:** https://www.shure.com/en-US/docs/guide/SM58
- **พอร์ตในโค้ด:** XLR OUT
- **การตรวจ:** รอบนี้ยังไม่ได้เปิดหน้าตรวจซ้ำ
- **ด่านที่ใช้:** SP-02, SP-04, SP-05
- **สถานะ:** `PROVISIONAL_GAME_REFERENCE` (รอตรวจคู่มือ)

### 6. Yamaha HS5 (`yamaha-hs5`)
- **แหล่งในโค้ด:** https://usa.yamaha.com/products/proaudio/speakers/hs_series/index.html
- **พอร์ตในโค้ด:** XLR balanced, TRS balanced
- **การตรวจ:** รอบนี้ยังไม่ได้ตรวจซ้ำ และเว็บ Yamaha บางโดเมนตอบ 403 ระหว่างตรวจ
- **ด่านที่ใช้:** ST-02, ST-05
- **สถานะ:** `PROVISIONAL_GAME_REFERENCE`

## ข. ผู้สมัครตาม MASTER V2 (ยังไม่อยู่ในโค้ด ตรวจสเปกทางการแล้ว)
| รุ่น | แหล่งทางการ | พอร์ตสำคัญตามผู้ผลิต | ความเข้ากันกับโปรไฟล์ในโค้ด | สถานะ |
|---|---|---|---|---|
| **ATEM Mini Pro** | https://www.blackmagicdesign.com/products/atemmini/techspecs | 4× HDMI type A in · 1 HDMI program out (+1 aux ตามตาราง) · 2× 3.5mm stereo in · USB-C (webcam out / บันทึก) · Ethernet · 12V | `generic-mini-switcher` (XS) ใช้พอร์ตที่เป็น subset ได้พอดี (HDMI IN ×2, PGM, 3.5mm, USB-C webcam) | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` |
| **ATEM Television Studio HD8 ISO** | https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs | 8× SDI in · 12 SDI out (program 1, aux 2) · MV 1× 3G-SDI + HDMI · 2× XLR balanced analog + 2× RCA · MADI · ref BNC · 2× USB-C webcam · ISO บันทึกทุกอินพุต | `generic-sdi-switcher` (AU) มี SDI IN ×6, REF, OUT ×3, MV, XLR ×2 เข้ากันได้ (subset) | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` |
| **ATEM 2 M/E Constellation 4K** | https://www.blackmagicdesign.com/products/atemconstellation/techspecs | 20× 12G-SDI in · 12 SDI out (aux/preview เลือกได้ทุกช่อง) · MV 2× 12G-SDI · **analog 2× balanced 1/4 inch jack (ไม่ใช่ XLR)** · talkback 5-pin XLR | `reference-production-switcher` (OUT/SP) ใช้ TRS 6.35mm ×2 ตรงกับข้อเท็จจริงนี้ IN ×8 / OUT ×4 เป็น subset | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` (สำหรับ SP เท่านั้น ส่วน OUT ยังต้องเลือกสวิตเชอร์พกพา) |
| **Videohub 20x20 12G** | https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs | 20 SDI in / 20 SDI out · Ethernet + USB-C · 1RU · ไฟ AC ภายใน (หน้าเว็บไม่ระบุชนิดขั้ว) | `reference-video-router-8` (8×8) เป็น subset | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` |
| **Camera Fiber Converter / Studio Fiber Converter** | https://www.blackmagicdesign.com/products/blackmagicfiberconverters/techspecs | Camera: SMPTE 304 ตัวผู้, 12G SDI in จากกล้อง, return out, ยึดกับ URSA Mini / URSA Broadcast, ได้ไฟผ่านไฟเบอร์ · Studio: SMPTE 304 ตัวเมีย, 2× 12G SDI out, 3× SDI return in, AC | **โครงต่างจากโค้ด:** ระบบจริงคือ กล้อง → (SDI) → Camera Fiber Converter → ไฟเบอร์ → Studio Converter → SDI แต่โค้ดรวมกล้องกับตัวส่งไว้ในชิ้นเดียว (`reference-fiber-camera` → `reference-ccu`) | `BLOCKED_CONFLICT` ถ้าจะผูกกับรุ่นจริงโดยไม่แก้โครง (ดูเอกสาร 03) |
| **URSA Broadcast G2** | https://www.blackmagicdesign.com/products/blackmagicursabroadcast/techspecs | SDI out 1 + SDI monitor out 1 · 2× XLR (mic/line/AES) · เมาท์ B4 (EF รวมมาด้วย) · **หน้าสเปก G2 ไม่ได้ระบุว่ารองรับ Fiber Converter** (หน้า converter เขียนกว้างๆ ว่า "URSA Broadcast") | ยังไม่ได้ผูก | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` (ต้องยืนยันว่า G2 ใช้กับ converter ได้) |
| **AJA 3G-AMA** | https://www.aja.com/products/3g-ama | 1× 3G-SDI in / 1× out (BNC) · **D-sub 25 pin ตัวเมียบนตัวเครื่อง** พร้อมสาย breakout แถมมา (4× XLR ตัวเมียเข้า / 4× XLR ตัวผู้ออก) · ไฟ +5–20 VDC · USB สำหรับตั้งค่า | `reference-audio-embedder` (OUT) มี XLR ×2 "· BREAKOUT" ตรงตามหลัก แต่ asset ต้องแสดง D-sub บนตัวเครื่อง และ XLR อยู่บนสาย breakout | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` |
| **Web Presenter HD** | (ไม่พบในหน้า techspecs ปัจจุบัน) | — | — | `BLOCKED_CONFLICT`: รุ่นนี้ไม่มีในหน้าปัจจุบัน |
| **Streaming Encoder HD** (ทดแทน Web Presenter HD) | https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs | SDI: 1 in, 1 loop out, 1 monitor out (12G) · HDMI monitor out · Ethernet สตรีม · USB-C webcam · AC ภายใน + 4-pin XLR 12V · ไม่มี analog audio | `reference-sdi-encoder` (PROGRAM SDI IN → Ethernet) เข้ากันได้ | `OFFICIAL_MODEL_VERIFIED_ROUTE_PENDING` |
| **Yamaha TF5 + NY64-D + Tio1608-D** | th.yamaha.com (ได้ 403 ระหว่างตรวจ) | ยังไม่ได้ข้อมูล | `reference-console-6` + stagebox/tail ยังไม่ได้เทียบ | `PENDING_EVIDENCE` |

## ค. รุ่นที่ถูกตั้งชื่อในเกมแต่ไม่มีหลักฐาน
| ชื่อ | ใช้ที่ | ผลการค้น | สถานะ |
|---|---|---|---|
| **PMX-402D-USB** ("YAMAHA") | ห้องฝึกอิสระ (ห้ามแก้) / ป้ายเก่า | พบแค่ประกาศขายในตลาดออนไลน์ที่ขัดกันเอง บางรายการระบุว่าเป็น "DSP" หรือ "iHandy" ไม่พบหน้าหรือคู่มือทางการของ Yamaha ([eBay](https://www.ebay.com/p/20054519589), [jiji](https://jiji.co.ke/nairobi-central/audio-and-music-equipment/pmx402d-usb-pmx402d-usb-powered-mixer-k9X9WBRftKqNv2xkrAakrOhK.html), [dubizzle](https://uae.dubizzle.com/classified/electronics/home-audio-turntables/amplifiers/2026/3/28/ihandy-pmx402d-usb-is-a-4-channel-professi-2-495---41a327c127c441799b4cac915d696b62/)) | `BLOCKED_CONFLICT`: **ห้ามระบุว่าเป็นผลิตภัณฑ์ Yamaha** |
| **DeviceWell HDS7105** | ห้องฝึกอิสระ / โปรไฟล์ฝึกของสตูดิโอภารกิจ | ไม่พบสเปกทางการ ประกาศขายระบุว่ามี 4 HDMI + 1 DP เข้า แต่จำนวนช่องออก (2 หรือ 3) ไม่ตรงกัน และมีหลายรุ่นปี (v2021/v2022) ([eBay V2022](https://www.ebay.com/itm/402273961431), [eBay.de](https://www.ebay.de/itm/314404517007)) | `PROVISIONAL_GAME_REFERENCE` (ภารกิจใช้โปรไฟล์ generic อยู่แล้ว) |
| Samsung TV, COMICA, Sennheiser XS1, HP 15.6" | ห้องฝึกอิสระ / ป้ายในห้อง | ยังไม่ได้ตรวจในรอบนี้ | `PROVISIONAL_GAME_REFERENCE` |

## ง. โปรไฟล์ generic / reference (38 รายการ)
ทั้งหมดอยู่ใน `docs/generated/MODEL_UNION_GENERATED_TH.md` พร้อมพอร์ตครบทุกตัวและด่านที่ใช้ สถานะ `GENERIC_EDUCATIONAL_PROFILE` เกมระบุว่าเป็น "แบบจำลองเพื่อฝึก" และไม่อ้างว่าเป็นสินค้าจริง

## สรุปสถานะ Gate 1
- **ตรวจกับหน้าทางการแล้ว:** 11 รุ่น (ข้อ ก. 1–4 และข้อ ข. 7 รุ่น)
- **LOCKED:** 0 รุ่น เพราะยังไม่ได้ตรวจภาพถ่ายของรุ่นและรุ่นปีที่ระบุ
- **BLOCKED:** 3 รายการ (PMX-402D-USB, Web Presenter HD, โครงกล้อง+ฐานแบบไฟเบอร์)
- **PENDING:** Yamaha TF/Tio, Shure, HS5, และอุปกรณ์ของห้องฝึกอิสระ

---
## อัปเดตรอบที่ 2 (2026-10-20): ตามการตัดสินใจของเจ้าของโครงการ
| รุ่น | model key | สถานะใหม่ | หลักฐาน | ด่าน |
|---|---|---|---|---|
| **Blackmagic ATEM Mini Pro** | `bmd-atem-mini-pro` | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) · asset ยังไม่เริ่ม | techspecs + คู่มือ ATEM Mini (Video Out buttons, ค่าเริ่มต้น MULTIVIEW, MIC mic/line หน้า 114, USB-C webcam) ดู `assets/specs/bmd-atem-mini-pro/MODEL_EVIDENCE.md` | XS-01, XS-03, XS-04, XS-05 (แทน `generic-mini-switcher`) |
| **Blackmagic URSA Broadcast G2** | `bmd-ursa-broadcast-g2` | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) · asset ยังไม่เริ่ม | techspecs G2 + หน้า fiberconverters ("perfectly matches URSA Broadcast G2") | SP-01, SP-03, SP-04, SP-05 (แทน `reference-fiber-camera`) |
| **Blackmagic Camera Fiber Converter** | `bmd-camera-fiber-converter` | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) | techspecs fiber converters | SP-01, SP-03, SP-04, SP-05 (ใหม่ 6 ตัว ต่อกล้องละตัว) |
| **Blackmagic Studio Fiber Converter** | `bmd-studio-fiber-converter` | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) | techspecs fiber converters | SP-01, SP-03, SP-04, SP-05 (แทน `reference-ccu` ใช้ id `ccu1–6` เดิม) |

**ความหมายของ LOCKED ในรอบนี้:** รุ่นที่ระบุ + พอร์ตตามสเปกทางการ + ทุกเส้นทางที่ด่านใช้ ผ่านการตรวจด้วยสคริปต์จำลองแล้ว ส่วน **ภาพถ่ายด้านหน้าและหลังสำหรับทำโมเดล 3D ยังไม่ได้ดู** จึงยังไม่เริ่ม Phase 04 ของรุ่นเหล่านี้

สถานะ Gate 1 หลังอัปเดต: LOCKED (พอร์ตและเส้นทาง) **4 รุ่น** · BLOCKED 3 รายการเดิม (PMX-402D-USB, Web Presenter HD; ส่วนโครงกล้อง+ฐานไฟเบอร์ **แก้แล้ว** ด้วยตัวเลือก B) · PENDING เหมือนเดิม

---
## อัปเดตรอบที่ 3 (2026-10-20): AU และ OUT
| รุ่น | model key | สถานะ | ด่าน | หลักฐาน |
|---|---|---|---|---|
| **ATEM Television Studio HD8 ISO** (W-APS-21) | `bmd-atem-television-studio-hd8-iso` (ใหม่) | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) | AU-01…05 (แทน `generic-sdi-switcher`) | `assets/specs/bmd-atem-television-studio-hd8-iso/MODEL_EVIDENCE.md` |
| **Blackmagic Streaming Encoder HD** | `bmd-streaming-encoder-hd` (แก้ให้ตรงสเปก) | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) | OUT-04, OUT-05 | `assets/specs/out-encoder-embedder/MODEL_EVIDENCE.md` |
| **AJA 3G-AMA** | `aja-3g-ama` (ใหม่) | `LOCKED_EXACT_REVISION` (พอร์ตและเส้นทาง) | OUT-04, OUT-05 | เดียวกัน |

**สรุป LOCKED (พอร์ตและเส้นทาง):** 7 รุ่น ได้แก่ ATEM Mini Pro, URSA Broadcast G2, Camera Fiber Converter, Studio Fiber Converter, TVS HD8 ISO, Streaming Encoder HD และ AJA 3G-AMA **asset 3D ยังไม่เริ่มทุกรุ่น** เพราะยังไม่ได้ดูภาพถ่ายทางการ

**ยังไม่ยืนยันใน AU:** ป้ายพิมพ์บนแผงหลังของ HD8 ISO และระดับ XLR (mic/line)

---
## อัปเดตรอบที่ 4 (2026-10-20): ผูกรุ่นที่ยืนยันแล้ว (ยกเว้น ST)
ผูกในโค้ดแล้ว ได้แก่ Studio Camera 4K Plus G2 (XS), Studio Camera 4K Pro G2 (AU/OUT), SmartView Duo (AU/OUT/SP), Magewell USB Capture SDI Gen 2 (AU), HD8 ISO (OUT), Videohub 20x20 12G (SP), ATEM 2 M/E Constellation 4K (SP), HyperDeck Studio HD Plus (SP) และ Streaming Encoder HD ×2 (SP) รายละเอียดอยู่ใน `docs/10_VERIFIED_BINDING_REPORT_TH.md` · ตารางสถานะรายรุ่น `docs/generated/MODEL_STATUS_TABLE_TH.md` (ต้องสร้างใหม่หลังเอกสารนี้)
