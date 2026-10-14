# Mission Hall — ตารางที่มาของเส้นทางสัญญาณ

อ้างอิงงานวิจัย `ETCSTREAM_SIGNAL_FLOW_FIVE_VENUES_TEXT_ONLY_REFERENCES.md` (Appendix A) · [R##] ยืนยันความสามารถของรุ่นตัวอย่างเท่านั้น **ไม่ได้ยืนยันว่าเป็นอุปกรณ์ของมหาวิทยาลัย**
รูปแบบสัญญาณฝึก: 1080p50 ทุกระบบ (กฎ A.3)

| ห้อง | ขอบ/โหนดในเกม | หัวข้อใน Appendix A | อ้างอิง | สถานะ |
|---|---|---|---|---|
| xs | Camera/Laptop HDMI → SW HDMI IN 1/2; SW HDMI OUT → TV | ห้องเรียน · Canonical Route | R01 | DESIGN_REFERENCE |
| xs | SW USB Webcam → Notebook USB HOST → OBS (ไม่มี Capture แยก) | ห้องเรียน · ชุดระบบที่เลือก | R01, R04 | DESIGN_REFERENCE |
| xs | Lav → TX ~RF~ RX → Mixer; MAIN/PA → Active speaker; AUX → SW MIC IN | ห้องเรียน · Canonical Route, กฎ A.5–A.6, A.9 | R10, R11 | DESIGN_REFERENCE (ขั้วต่อ mixer เป็น Generic) |
| s | Cam 1–3 → HDS7105 VIDEO IN (HDMI) | สตูดิโอ · Instructor path, จุดห้ามเดา | — | PROVISIONAL (ชนิดเอาต์พุตกล้อง UNKNOWN) |
| s | RX → Mixer; XS 1 → Mixer MIC; Mixer MAIN → HDS7105 LINE IN | สตูดิโอ · Instructor path | — | PROVISIONAL |
| s | MULTIVIEW → TV; PGM → Magewell → HP → OBS | สตูดิโอ · Instructor path | R04, R05 | Magewell/TV = SELECTED TRAINING REFERENCE |
| s | Mixer MONITOR → HS5 | สตูดิโอ · Instructor path ("if supported") | — | PROVISIONAL |
| m | Cam C/L/R, PTZ SDI → SW SDI IN 1–4; Laptop → HDMI→SDI → IN 5 | หอประชุม · Canonical VIDEO | R02, R08 | DESIGN_REFERENCE |
| m | AUX (Program) → SDI→HDMI → จอเวที; MV → FOH; PGM → Recorder; USB → PC | หอประชุม · Canonical VIDEO | R02, R08 | DESIGN_REFERENCE |
| m | Podium / Handheld RX ×2 / Lav RX ×2 → Stagebox → Multicore → Mixer | หอประชุม · Canonical AUDIO | R10, R14 | DESIGN_REFERENCE (analog เลือกแทน Dante) |
| m | Mixer PA BUS → Active PA; BROADCAST → SW AUDIO IN | หอประชุม · Canonical AUDIO, กฎ A.6 | R10, R12 | DESIGN_REFERENCE |
| l | Far Cam → Fiber TX → RX → SW IN 1; Cam B/C SDI → IN 2/3 | ภายนอก · Canonical VIDEO, กฎ A.8 | R07, R09 | DESIGN_REFERENCE |
| l | Lav/Shotgun(+48V)/Ambient → Mixer; PA BUS → PA; BROADCAST → Embedder | ภายนอก · Canonical AUDIO, กฎ A.5 | R11, R15 | DESIGN_REFERENCE |
| l | PGM → Embedder → Encoder → Router → Ingest | ภายนอก · Canonical VIDEO | R06, R13, R15 | DESIGN_REFERENCE |
| xl | Cam n → CCU n → Router IN n → OUT n → SW IN n | สนามกีฬา · Canonical FIELD/VIDEO | R09, R16, R03 | DESIGN_REFERENCE |
| xl | Replay → Router IN 7; Controller → Replay CONTROL; Graphics → HDMI→SDI → IN 8 | สนามกีฬา · Canonical FIELD/VIDEO, Control/Tally | R08, R16 | DESIGN_REFERENCE |
| xl | Mics ×5 + Presenter RX → Stagebox → Multicore → Console; VENUE PA / BROADCAST | สนามกีฬา · Canonical AUDIO | R10, R17 | DESIGN_REFERENCE (analog เลือกแทน Dante) |
| xl | PGM + BROADCAST → Embedder → DA → Main / Backup / Recorder | สนามกีฬา · กรณี Constellation, Redundancy rule | R03, R15 | DESIGN_REFERENCE · Partial redundancy |
| xl | Main/Backup Encoder → แยก Network → แยก Ingest | Redundancy rule | R06, R13 | DESIGN_REFERENCE |
| xl | Intercom PL1 → Commentary Unit; SW TALLY → CCU Rack | Control/Tally/Intercom/Sync | R09 | GENERIC (เส้นทาง Tally ร่วมของ Rack เป็นโปรไฟล์ฝึก) |

## ช่องว่างที่ยังไม่ปิด (UNRESOLVED)
- พอร์ตจริงของ HDS7105 (revision) และชนิดเอาต์พุตกล้องสตูดิโอ
- RX สตูดิโอแยก 2 ช่องหรือผสม (เกมใช้ผสม)
- เส้นควบคุม PTZ (IP/Serial) และ program confidence monitor ของหอประชุม — ยังไม่อยู่ในกราฟ
- Ethernet ในเกมยังทำเป็น OUTPUT→INPUT ไม่ใช่สองทางแท้ · ยังไม่แยกระดับ Mic/Line บน XLR ในตัวตรวจ
- Tally/Intercom: เลือกโปรไฟล์ฝึกเรียบง่าย ไม่ได้อิงโปรโตคอลของยี่ห้อใด
