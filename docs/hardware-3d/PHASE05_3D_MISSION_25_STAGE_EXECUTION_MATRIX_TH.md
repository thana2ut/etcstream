# Phase 05 · ตารางดำเนินงาน 3D ครบ 25 ด่าน

วันที่: 2026-10-21 · Claude Code · ยังไม่ได้ commit · **ตรวจระดับโค้ดเท่านั้น ยังไม่ได้เล่นจริงในเบราว์เซอร์ และเจ้าของยังไม่ได้ทดสอบ**

ข้อมูลในตารางคำนวณจากโค้ดจริง (`SCENARIOS` + `MODEL_GEOMETRY`) ไม่ได้คัดลอกจากรายงานเก่า
- รหัสสถานที่: xs = ห้องเรียน, s = สตูดิโอ, m = หอประชุม, l = กลางแจ้ง, xl = สนามกีฬา
- ลำดับการตรวจ: XS → ST → AU → OUT → SP

| ด่าน | สถานที่ | อุปกรณ์ | พอร์ต | 3D ตามหลักฐานผู้ผลิต | GLB (owner/ผู้ผลิต) | GENERIC จำลอง | ผลตรวจระดับโค้ด |
|---|---|---|---|---|---|---|---|
| xs-1 | XS ห้องเรียน | 3 | 15 | bmd-studio-camera-4k-plus-g2, bmd-atem-mini-pro | — | 1 รายการ | PASS (source-level) |
| xs-2 | XS ห้องเรียน | 5 | 10 | — | — | 5 รายการ | PASS (source-level) |
| xs-3 | XS ห้องเรียน | 5 | 19 | bmd-studio-camera-4k-plus-g2, bmd-atem-mini-pro | — | 3 รายการ | PASS (source-level) |
| xs-4 | XS ห้องเรียน | 8 | 27 | bmd-studio-camera-4k-plus-g2, bmd-atem-mini-pro | — | 6 รายการ | PASS (source-level) |
| xs-5 | XS ห้องเรียน | 10 | 29 | bmd-studio-camera-4k-plus-g2, bmd-atem-mini-pro | — | 8 รายการ | PASS (source-level) |
| s-1 | ST สตูดิโอ | 3 | 9 | — | — | 3 รายการ | PASS (source-level) |
| s-2 | ST สตูดิโอ | 9 | 21 | — | yamaha-hs5 | 5 รายการ | PASS (source-level) |
| s-3 | ST สตูดิโอ | 5 | 11 | — | — | 3 รายการ | PASS (source-level) |
| s-4 | ST สตูดิโอ | 9 | 23 | — | magewell-usb-capture-hdmi-gen2 | 8 รายการ | PASS (source-level) |
| s-5 | ST สตูดิโอ | 16 | 31 | — | yamaha-hs5, magewell-usb-capture-hdmi-gen2 | 9 รายการ | PASS (source-level) |
| m-1 | AU หอประชุม | 4 | 27 | bmd-studio-camera-4k-pro-g2, bmd-atem-television-studio-hd8-iso, bmd-micro-converter-sdi-hdmi-3g | — | 1 รายการ | PASS (source-level) |
| m-2 | AU หอประชุม | 9 | 47 | bmd-atem-television-studio-hd8-iso | — | 7 รายการ | PASS (source-level) |
| m-3 | AU หอประชุม | 10 | 43 | bmd-studio-camera-4k-pro-g2, bmd-micro-converter-hdmi-sdi-3g, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo, bmd-micro-converter-sdi-hdmi-3g | — | 3 รายการ | PASS (source-level) |
| m-4 | AU หอประชุม | 14 | 68 | bmd-studio-camera-4k-pro-g2, bmd-micro-converter-hdmi-sdi-3g, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo, bmd-micro-converter-sdi-hdmi-3g | — | 7 รายการ | PASS (source-level) |
| m-5 | AU หอประชุม | 29 | 91 | bmd-studio-camera-4k-pro-g2, bmd-micro-converter-hdmi-sdi-3g, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo, bmd-micro-converter-sdi-hdmi-3g, magewell-usb-capture-sdi-gen2, bmd-hyperdeck-studio-hd-plus | — | 13 รายการ | PASS (source-level) |
| l-1 | OUT กลางแจ้ง | 3 | 26 | bmd-studio-camera-4k-pro-g2, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo | — | 0 รายการ | PASS (source-level) |
| l-2 | OUT กลางแจ้ง | 7 | 16 | — | — | 7 รายการ | PASS (source-level) |
| l-3 | OUT กลางแจ้ง | 7 | 36 | bmd-studio-camera-4k-pro-g2, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo | — | 2 รายการ | PASS (source-level) |
| l-4 | OUT กลางแจ้ง | 18 | 66 | bmd-studio-camera-4k-pro-g2, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo, aja-3g-ama, bmd-streaming-encoder-hd | — | 11 รายการ | PASS (source-level) |
| l-5 | OUT กลางแจ้ง | 18 | 66 | bmd-studio-camera-4k-pro-g2, bmd-atem-television-studio-hd8-iso, bmd-smartview-duo, aja-3g-ama, bmd-streaming-encoder-hd | — | 11 รายการ | PASS (source-level) |
| xl-1 | SP สนามกีฬา | 6 | 90 | bmd-ursa-broadcast-g2, bmd-camera-fiber-converter, bmd-studio-fiber-converter, bmd-videohub-20x20-12g, bmd-atem-2me-constellation-4k, bmd-smartview-duo | — | 0 รายการ | PASS (source-level) |
| xl-2 | SP สนามกีฬา | 13 | 69 | shure-sm58, bmd-atem-2me-constellation-4k | — | 9 รายการ | PASS (source-level) |
| xl-3 | SP สนามกีฬา | 25 | 148 | bmd-ursa-broadcast-g2, bmd-camera-fiber-converter, bmd-studio-fiber-converter, bmd-videohub-20x20-12g, bmd-atem-2me-constellation-4k, bmd-smartview-duo, bmd-micro-converter-hdmi-sdi-3g | — | 3 รายการ | PASS (source-level) |
| xl-4 | SP สนามกีฬา | 45 | 210 | bmd-ursa-broadcast-g2, bmd-camera-fiber-converter, bmd-studio-fiber-converter, bmd-videohub-20x20-12g, bmd-atem-2me-constellation-4k, bmd-smartview-duo, shure-sm58, bmd-micro-converter-hdmi-sdi-3g, bmd-streaming-encoder-hd, bmd-hyperdeck-studio-hd-plus | — | 15 รายการ | PASS (source-level) |
| xl-5 | SP สนามกีฬา | 45 | 210 | bmd-ursa-broadcast-g2, bmd-camera-fiber-converter, bmd-studio-fiber-converter, bmd-videohub-20x20-12g, bmd-atem-2me-constellation-4k, bmd-smartview-duo, shure-sm58, bmd-micro-converter-hdmi-sdi-3g, bmd-streaming-encoder-hd, bmd-hyperdeck-studio-hd-plus | — | 15 รายการ | PASS (source-level) |

**ความหมายของ "PASS (source-level)" ในตาราง**
- อุปกรณ์ทุกชิ้นในด่านมี renderer
- พอร์ตทุกจุดอยู่บน socket ของโมเดล (สำหรับพอร์ตบนสายหาง/สาย breakout ระบบตรวจตามระยะของสาย)
- ด่านแก้โจทย์ได้ด้วยเส้นทางที่ถูก และต่อผิดแล้วไม่ผ่าน

ทั้งหมดนี้ยืนยันด้วยชุดทดสอบ `npm test` 204/204

**ความคืบหน้า:** 5/25 → 10/25 → 15/25 → 20/25 → 25/25 (source-level)

**ด่านที่ได้รับผลกระทบจากงานรอบนี้**
- m-5: Magewell SDI เป็น 3D ใหม่
- l-4, l-5: AJA 3G-AMA เป็น 3D ใหม่
- xl-2, xl-4, xl-5: Shure SM58 เป็น 3D ใหม่

ด่านอื่นใช้โมเดลเดิมซ้ำ หรือใช้โปรไฟล์ GENERIC ตามเดิม
