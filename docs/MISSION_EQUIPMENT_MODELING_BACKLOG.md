# งานปั้นโมเดลอุปกรณ์จริง (Mission Hall) — Backlog

## เพิ่มจาก Appendix A — ยังไม่เริ่มปั้นจริง

แหล่งต้นฉบับอยู่ใน `docs/references/` ใช้ข้อมูลรายชิ้นและพอร์ตจาก `MISSION_25_BILL_OF_MATERIALS.json` ก่อนแทนโมเดล รักษา `deviceId`, `portId`, ตำแหน่ง/normal และสถานะพกพาเดิม

| โปรไฟล์ฝึก | จุดที่ใช้ | ต้องยืนยันก่อนทำรุ่นจริง |
|---|---|---|
| `reference-fiber-tx` / `reference-fiber-rx` | กล้องไกล/เต็นท์ L | ชุดเข้าคู่ ขั้ว Optical, transceiver, wavelength, medium, power และแผง SDI จริง |
| `reference-fiber-camera` / `reference-ccu` | กล้อง/ฐาน 1–6 XL | รูปชุดกล้องกับฐานที่เข้าคู่จริง พอร์ตและสายระบบกล้อง ห้ามอนุมานโปรโตคอลจากโมเดลฝึก |
| `reference-stagebox-6` / `reference-tail-6` / `reference-console-6` | M และ XL; คอนโซล L | รุ่นจริงและ Mic/Line/bus/phantom แผงช่อง 6 ช่องในเกมเป็น subset การฝึก ไม่ใช่สเปกรุ่นที่สมมติขึ้น |
| `reference-production-switcher` / `reference-video-router-8` | L/XL | budget พอร์ตจริง ขาออกอิสระ AUX/PGM/MV, balanced TRS audio; ห้ามใส่ XLR บน Constellation โดยไม่มีหลักฐาน |
| `reference-audio-embedder` | L | รุ่น/แผง SDI และสาย breakout ตามรุ่นอ้างอิง AJA ห้ามปั้น pinout ที่เอกสารไม่ยืนยัน |
| `reference-replay` / `reference-replay-controller` | XL | รูปขั้วต่อและโปรโตคอลควบคุมจริง ปัจจุบันเป็นลิงก์ควบคุมจำลองทั่วไป |
| `reference-sdi-encoder` / `reference-recorder` | L/XL | รุ่น SDI/Network/สื่อบันทึกจริง โปรไฟล์ฝึกไม่ใช่การรับรองผลิตภัณฑ์ |
| `reference-handheld-tx` | M | ด้ามไมค์กับตัวส่งในตัวและ RX ที่เข้าคู่ ไม่มีสายไมค์→TX สมมติ |

HDS7105/camera/RX/capture ฝั่ง S และ PTZ-control/Tally/Intercom ยังต้องมีหลักฐานจริง สถานะงานปั้นของรายการใหม่นี้ **NOT STARTED** ทุกชิ้นยังเป็นตัวแทนฝึกที่มีพอร์ตใช้งานในเกม

**สถานะงานปั้นทั้งหมด: NOT STARTED** · ตอนนี้ทุกชิ้นในด่านภารกิจเป็น **ตัวแทนชั่วคราว low-poly** (`components/game/equipment/device-visual.tsx`) ที่ตำแหน่งพอร์ตเป็น anchor ฝึก ไม่ใช่ตำแหน่งพอร์ตหลังเครื่องจริง

## การเปลี่ยนเป็นโมเดลจริงโดยไม่กระทบกราฟ
- id อุปกรณ์และ id พอร์ต (`owner:name`) ใน `venue-scenarios.ts` คือ identity ทางตรรกะ — โมเดลใหม่ควรแทน **การแสดงผล + ตำแหน่ง anchor** เท่านั้น
- ตำแหน่ง anchor ตอนนี้คำนวณอัตโนมัติ (เรียงบนหน้าเครื่องฝั่งผู้เล่น) — เมื่อมีโมเดลจริงให้เพิ่ม manifest ต่ออุปกรณ์ (แบบ `art/blender/hds7105-manifest.json`) แล้วแทนที่การคำนวณ

## รายการ (ต่อหมวด)
| หมวด / id ในเกม | ห้อง | สถานะข้อมูล | ต้องการก่อนปั้น | พอร์ตที่ต้องมองเห็น |
|---|---|---|---|---|
| Mini HDMI Switcher `sw` | xs | อ้างอิงความสามารถ ATEM Mini Pro [R01] · Generic | รุ่นจริงที่ใช้ + ภาพด้านหลัง | HDMI IN 1–2, HDMI OUT, MIC IN 1 (3.5), USB-C Webcam |
| HDMI Camera `cam1` | xs | Generic | รุ่นจริง | HDMI OUT |
| Small Mixer `mix` | xs | Generic | รุ่นที่มี PA + AUX แยกจริง | CH1, MAIN OUT, AUX OUT |
| Wireless TX/RX `tx*` `rx*` | ทุกห้อง | Generic / S = PROVISIONAL (COMICA/Saramonic) | ยืนยันยี่ห้อ/รุ่น + เอาต์พุต RX | MIC IN (TX), AUDIO OUT (RX) |
| DeviceWell HDS7105 `sw` | s | PROVISIONAL | ภาพหลังเครื่อง revision จริง | VIDEO IN 1–3, LINE IN, PGM OUT, MULTIVIEW OUT |
| PMX-402D-USB `mix` | s | PROVISIONAL (chassis) | ยืนยันพอร์ตที่ติดตั้ง | CH1 MIC, CH3/4 LINE, MAIN, MONITOR |
| Studio Camera 1–3 | s | PROVISIONAL | รุ่น + ชนิดเอาต์พุต (HDMI/SDI) | VIDEO OUT |
| Magewell / Samsung TV / Yamaha HS5 | s | SELECTED TRAINING REFERENCE | ยืนยันว่าห้องจริงใช้หรือไม่ | HDMI IN / USB · HDMI IN · TRS IN |
| Sennheiser XS 1 `mic` | s | ระบุจากภาพเดิม | — | XLR OUT |
| Production SDI Switcher `sw` | m | Generic (อ้างอิง HD8 [R02]) | — | SDI IN 1–5, AUX, PGM, MULTIVIEW HDMI, AUDIO IN, USB |
| SDI Camera / PTZ | m, l | Generic | — | 3G-SDI OUT |
| HDMI↔SDI Converter | m, xl | อ้างอิง Micro Converter [R08] | — | HDMI IN/OUT, SDI IN/OUT |
| Analog Stagebox + Multicore | m, xl | Generic | — | MIC IN 1–6, MULTICORE OUT |
| Digital Mixer / Broadcast Console | m, xl | Generic | — | MULTICORE IN, PA OUT, BROADCAST OUT, PHONES |
| Fiber TX/RX | l | Generic [R09] | — | SDI IN/OUT, OPTICAL |
| Audio Embedder | l, xl | อ้างอิง AJA 3G-AMA [R15] | breakout จริงของรุ่น | SDI IN, ANALOG AUDIO IN, SDI OUT |
| SDI Encoder / Router / Ingest | l, xl | Generic [R06] | — | SDI IN, ETHERNET / LAN, WAN |
| Broadcast Camera 1–6 + CCU / Base Station 1–6 (แยกเครื่อง) | xl | Generic [R09] | — | CAMERA FIBER (กล้อง), CAMERA FIBER IN + SDI OUT (CCU), TALLY IN (CCU 1) |
| SDI Video Router | xl | อ้างอิง Videohub 20x20 [R16] | — | SDI IN/OUT 1–8 (จาก 20) |
| Broadcast Switcher | xl | อ้างอิง Constellation 2 M/E [R03] | — | SDI IN 1–8, PGM, AUX, MULTIVIEW, TALLY |
| Replay Server / Controller, Graphics, DA, Recorder, Intercom | xl | Generic | — | ตามตาราง `MISSION_HALL_5_CHAPTERS_25_LEVELS.md` |
| TV / จอเวที / Multiview Wall / จอสนาม | ทุกห้อง | Generic | — | HDMI IN / SDI IN |

ไม่มีชิ้นใดในรายการนี้ถือเป็น replica ที่ยืนยันแล้ว

## สายในห้องเตรียมสาย (41 รายการ) — งานปั้น NOT STARTED
- ตอนนี้แต่ละสายแสดงเป็นโมเดลชั่วคราว: หัวต่อจาก `components/game/cable-plugs.tsx` สองหัว + สายขด (`components/ui/cable-model.tsx`)
- วิธีใส่โมเดลปั้นจริง: วางไฟล์ `public/models/cables/<ชื่อ>.glb` แล้วเพิ่มบรรทัดใน `CABLE_MODEL_FILES` เช่น `"VID-HDMI-A-A": "/models/cables/vid-hdmi-a-a.glb"` — หน้าตัวอย่างและหน้าดู 3D จะใช้ไฟล์นั้นทันที
- id สายตาม `game/content/cable-catalog.ts` (ตรงกับเอกสาร ETCSTREAM_ALL_CABLES_CONNECTORS_FIVE_VENUES_MASTER.md)
- หัวที่ยังไม่มีรูปทรงเฉพาะ (ใช้กล่องหลายขาแทน): USB Type-B, Control Replay, Tally/GPI, Analog Multicore
