# Phase 08 — คู่มือคำตอบพอร์ตต่อพอร์ตจากโค้ดปัจจุบัน (สำหรับเจ้าของ/ผู้พัฒนา)

สร้างจาก `SCENARIOS` 25 ด่านโดยตรง; ห้ามนำตารางนี้ไปแสดงใน goal-only briefing ของผู้เล่น

รหัส `lead-N` เป็นรหัสสายภายในด่าน; รหัสชนิดในวงเล็บคือรายการแคตตาล็อก ผู้เล่นต้องจับคู่ปลาย OUTPUT กับ INPUT ด้วยตนเอง

## XS-01 — เส้นทางภาพ · Video Path

ห้อง: ห้องเรียน · ใบงาน: นำภาพจากกล้องห้องเรียนขึ้นจอหน้าห้องผ่านเครื่องสลับภาพ · กราฟ: `appendix-a-xs-1-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` |
| `sw` | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` |
| `monitor` | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` กล้องห้องเรียน · Studio Camera 4K Plus G2 HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-out` เครื่องสลับภาพ ATEM Mini Pro HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in-1` โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-HDMI-A-A` ×2

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `sw` | `pgm` | HDMI 1 |
| `sw` | `hdmi-out` | PROGRAM |
| `monitor` | `source` | HDMI 1 |
| `site` | `power-check` | true |
| `site` | `format` | true |

คิวสลับภาพ: เตรียมกล้อง … สลับ HDMI 1 ออกอากาศ → TEACHER CAM

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `front-cam` [signal, สำคัญ] จอหน้าห้องแสดงภาพจริงจากกล้อง (PROGRAM)
- `pgm-in1` [signal] PROGRAM เลือก HDMI 1
- `tv-input` [signal] จอเลือกขาเข้า HDMI ที่ต่อสายไว้
- `hdmi-out-pgm` [signal] HDMI OUT ส่งภาพออกอากาศ ไม่ใช่ MULTIVIEW
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-power-check` [physical] ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก
- `pre-format` [physical] ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz
- `cues` [rehearsal] ออกอากาศตามคิวครบ 1 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## XS-02 — เส้นทางเสียง · Audio Path

ห้อง: ห้องเรียน · ใบงาน: ให้เสียงผู้สอนจากไมค์หนีบปกดังออกลำโพงหน้าห้องอย่างชัดเจน ไม่หอน · กราฟ: `appendix-a-xs-2-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `lav` | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` |
| `tx` | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` |
| `rx` | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` |
| `mix` | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` |
| `pa` | ลำโพงแอ็กทีฟหน้าห้อง (XS-PA-01) | `generic-active-pa` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `lav` | `lav:out` ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | `lead-1` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไร้สาย TX MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไร้สาย RX AUDIO OUT (XLR) | `lead-2` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `mix` | `mix:main-out` มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | `lead-3` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `tx` | `power` | true |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `mix` | `power` | true |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-main` | true |
| `mix` | `main-fader` | Unity |
| `pa` | `power` | true |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `paired` [signal, สำคัญ] จับคู่ TX ↔ RX ช่องเดียวกัน
- `meter` [signal, สำคัญ] มิเตอร์มิกเซอร์ขยับด้วยเสียงผู้สอน
- `pa` [signal, สำคัญ] เสียงผู้สอนออกลำโพงหน้าห้อง ไม่หอน ไม่แตก
- `soundcheck` [rehearsal] ทดสอบพูดระดับจริงแล้ว
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `pre-mic-place` [physical] ตั้งไมค์ระดับปาก หันหลบลำโพง
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## XS-03 — สลับสองแหล่งภาพ · Two-Source Switching

ห้อง: ห้องเรียน · ใบงาน: สลับกล้องกับสไลด์ขึ้นจอห้องเรียน และตรวจภาพรายการเดียวกันใน OBS ผ่าน USB Webcam · กราฟ: `appendix-a-xs-3-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` |
| `slides` | โน้ตบุ๊กผู้สอน (XS-LAP-01) | `generic-laptop` |
| `sw` | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` |
| `monitor` | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` |
| `host` | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` กล้องห้องเรียน · Studio Camera 4K Plus G2 HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 1 | ผู้เล่นต้องต่อ |
| `slides` | `slides:hdmi-out` โน้ตบุ๊กผู้สอน HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-2` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 2 | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-out` เครื่องสลับภาพ ATEM Mini Pro HDMI OUT | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in-1` โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:usb` เครื่องสลับภาพ ATEM Mini Pro USB-C | `lead-4` (`DATA-USB-WEBCAM`, USB-C → USB-A) | `host` | `host:usb-1` โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `DATA-USB-WEBCAM` ×1<br>`VID-HDMI-A-A` ×3

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `slides` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `slides` | `present` | true |
| `monitor` | `source` | HDMI 1 |
| `sw` | `pgm` | HDMI 1 |
| `sw` | `hdmi-out` | PROGRAM |
| `site` | `cable-route` | true |
| `host` | `power` | true |
| `host` | `video-src` | USB video capture device |
| `host` | `audio-src` | None |

คิวสลับภาพ: ผู้สอนทักทาย … CAM 1 → TEACHER CAM; เข้าสไลด์ … LAPTOP 2 → SLIDES

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `in1` [signal, สำคัญ] HDMI IN1 = กล้อง
- `in2` [signal, สำคัญ] HDMI IN2 = โน้ตบุ๊ก
- `front` [signal, สำคัญ] จอหน้าห้องแสดง PROGRAM ปัจจุบัน
- `hdmi-out-pgm` [signal] HDMI OUT ส่งภาพออกอากาศ ไม่ใช่ MULTIVIEW
- `both` [rehearsal] ทั้งสองแหล่งภาพถูกเลือกออกอากาศได้จริง
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-cable-route` [physical] เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน
- `cues` [rehearsal] ออกอากาศตามคิวครบ 2 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน
- `webcam-installed` [physical, สำคัญ] ติดตั้งคอมพิวเตอร์และสาย USB DEVICE → HOST
- `webcam-picture` [signal, สำคัญ] OBS รับภาพ PROGRAM เดียวกับจอห้องเรียน

---

## XS-04 — ซ่อมพอร์ตและการจับภาพ · Port and Capture Repair

ห้อง: ห้องเรียน · ใบงาน: คาบเรียนออนไลน์กำลังจะเริ่ม แต่ OBS ไม่มีภาพและเสียง และจอหน้าห้องผิด — หาจุดเสียแล้วซ่อมทางกายภาพ · กราฟ: `appendix-a-xs-4-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` |
| `lav` | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` |
| `tx` | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` |
| `rx` | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` |
| `mix` | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` |
| `sw` | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` |
| `host` | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` |
| `monitor` | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` กล้องห้องเรียน · Studio Camera 4K Plus G2 HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:hdmi-out` เครื่องสลับภาพ ATEM Mini Pro HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in-1` โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `lav` | `lav:out` ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | `lead-3` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไร้สาย TX MIC IN (3.5 mm) | ต่อไว้ในฉาก (อาจมี fault) |
| `rx` | `rx:audio-out` ตัวรับไร้สาย RX AUDIO OUT (XLR) | `lead-4` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:aux-out` มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | `lead-5` (`AUD-TRS-635-35`, 6.35mm → 3.5mm) | `sw` | `sw:mic-1` เครื่องสลับภาพ ATEM Mini Pro MIC IN 1 (3.5 mm) | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:usb` เครื่องสลับภาพ ATEM Mini Pro USB-C | `lead-6` (`DATA-USB-WEBCAM`, USB-C → USB-A) | `host` | `host:usb-1` โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `DATA-USB-WEBCAM` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `rx` | `pair` | Paired |
| `mix` | `ch1-aux` | true |
| `site` | `soundcheck` | true |

คิวสลับภาพ: เริ่มคาบ … CAM 1 → TEACHER CAM

### Fault และการซ่อม

- `f-input` กล้องถูกเสียบเข้า HDMI IN2 แทน IN1; สายผิดจุด: cam1:hdmi-out → sw:hdmi-in-1 (เริ่มที่ cam1:hdmi-out → sw:hdmi-in-2)
- `f-pair` ตัวรับไม่ได้จับคู่กับตัวส่ง; ตั้งค่าผิด: rx.pair = Not paired
- `f-aux` เสียงผู้สอนส่งเข้า MAIN เท่านั้น ไม่ได้ส่งเข้า STREAM/AUX; ตั้งค่าผิด: mix.ch1-aux = false
- `f-usb` สาย USB เว็บแคมหลุด; สายหลุด: sw:usb → host:usb-1

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `front` [signal, สำคัญ] จอหน้าห้องแสดงภาพกล้อง
- `obs-video` [signal, สำคัญ] OBS รับเว็บแคมเป็นภาพ PROGRAM
- `obs-audio` [signal, สำคัญ] OBS ได้ยินเสียงผู้สอนเพียงทางเดียว
- `recovered` [delivery, สำคัญ] ตรวจหาและซ่อมจุดเสียครบ
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `cues` [rehearsal] ออกอากาศตามคิวครบ 1 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## XS-05 — ห้องเรียนไฮบริดครบระบบ · Full Hybrid Classroom

ห้อง: ห้องเรียน · ใบงาน: จัดห้องเรียนไฮบริดครบระบบ: กล้องและสไลด์ขึ้นจอหน้าห้องและ OBS, เสียงผู้สอนออกลำโพงในห้อง และส่งเข้าสตรีมแยกบัส โดยเสียงใน OBS ไม่ซ้อน · กราฟ: `appendix-a-xs-5-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` |
| `slides` | โน้ตบุ๊กผู้สอน (XS-LAP-01) | `generic-laptop` |
| `lav` | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` |
| `tx` | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` |
| `rx` | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` |
| `mix` | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` |
| `sw` | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` |
| `monitor` | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` |
| `pa` | ลำโพงแอ็กทีฟหน้าห้อง (XS-PA-01) | `generic-active-pa` |
| `host` | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` กล้องห้องเรียน · Studio Camera 4K Plus G2 HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 1 | ผู้เล่นต้องต่อ |
| `slides` | `slides:hdmi-out` โน้ตบุ๊กผู้สอน HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-2` เครื่องสลับภาพ ATEM Mini Pro HDMI IN 2 | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-out` เครื่องสลับภาพ ATEM Mini Pro HDMI OUT | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in-1` โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:usb` เครื่องสลับภาพ ATEM Mini Pro USB-C | `lead-4` (`DATA-USB-WEBCAM`, USB-C → USB-A) | `host` | `host:usb-1` โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |
| `lav` | `lav:out` ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | `lead-5` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไร้สาย TX MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไร้สาย RX AUDIO OUT (XLR) | `lead-6` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `mix` | `mix:main-out` มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | `lead-7` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:aux-out` มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | `lead-8` (`AUD-TRS-635-35`, 6.35mm → 3.5mm) | `sw` | `sw:mic-1` เครื่องสลับภาพ ATEM Mini Pro MIC IN 1 (3.5 mm) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-TRS-635-35` ×1<br>`DATA-USB-WEBCAM` ×1<br>`VID-HDMI-A-A` ×3

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `slides` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `host` | `power` | true |
| `tx` | `power` | true |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `mix` | `power` | true |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-main` | true |
| `mix` | `main-fader` | Unity |
| `mix` | `ch1-aux` | true |
| `mix` | `aux-master` | Unity |
| `slides` | `present` | true |
| `slides` | `mute-audio` | true |
| `sw` | `pgm` | HDMI 1 |
| `sw` | `hdmi-out` | PROGRAM |
| `sw` | `mic1-on` | true |
| `sw` | `mic1-mode` | LINE |
| `sw` | `emb-audio` | OFF |
| `monitor` | `source` | HDMI 1 |
| `pa` | `power` | true |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `host` | `video-src` | USB video capture device |
| `host` | `audio-src` | USB capture embedded audio |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |

คิวสลับภาพ: เปิดคาบ … ผู้สอน → TEACHER CAM; สไลด์ → SLIDES; ถามตอบ … ผู้สอน → TEACHER CAM

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): `s-rf` ตัวรับเปลี่ยนช่องความถี่ RF; `s-mute` ช่องไมค์ในมิกเซอร์ถูก Mute; `s-ain` ปิด MIC 1 ที่เครื่องสลับภาพ; `s-usb` สาย USB เว็บแคมหลุด

### เงื่อนไขตรวจรับจริง

- `front` [signal, สำคัญ] เปลี่ยนแหล่งภาพแล้วจอหน้าห้องเปลี่ยนตาม
- `hdmi-out-pgm` [signal] HDMI OUT ส่งภาพออกอากาศ ไม่ใช่ MULTIVIEW
- `obs-video` [signal, สำคัญ] เปลี่ยนแหล่งภาพแล้ว OBS เปลี่ยนตาม
- `room` [signal, สำคัญ] เสียงในห้องทำงาน ไม่หอน ไม่แตก
- `obs-audio` [signal, สำคัญ] OBS มีเสียงรายการตามที่ตั้งใจเท่านั้น (ไม่ซ้อน)
- `angles` [rehearsal] ใช้ทั้งภาพผู้สอนและสไลด์ในรายการ
- `recovered` [delivery, สำคัญ] แก้ปัญหาที่เกิดระหว่างงานได้
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical, สำคัญ] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-power-check` [physical] ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก
- `pre-cable-route` [physical] เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `pre-mic-place` [physical] ตั้งไมค์ระดับปาก หันหลบลำโพง
- `cues` [rehearsal, สำคัญ] ออกอากาศตามคิวครบ 3 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## ST-01 — ภาพสตูดิโอ · Studio Video

ห้อง: สตูดิโอภารกิจ · ใบงาน: ให้ภาพ CAM1 ขึ้นเป็นช่องหนึ่งในจอรวมภาพ (Multiview) ของห้องควบคุม · กราฟ: `appendix-a-s-1-v1` · สถานะหลักฐาน: PROVISIONAL

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` |
| `sw` | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` |
| `monitor` | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` CAM1 ภาพกว้าง HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-mv-out` เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in` ทีวีรวมภาพ HDMI IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-HDMI-A-A` ×2

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam1` | `clean` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `site` | `power-check` | true |
| `site` | `format` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `mv-cam1` [signal, สำคัญ] ช่อง CAM1 ปรากฏในจอรวมภาพ
- `in1` [signal, สำคัญ] VIDEO IN 1 รับ CAM1
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-power-check` [physical] ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก
- `pre-format` [physical] ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## ST-02 — เสียงหลายไมค์ · Multi-Microphone Audio

ห้อง: สตูดิโอภารกิจ · ใบงาน: พิธีกรและแขกรับเชิญต้องปรับเสียงได้แยกกัน ส่งเข้า Broadcast และฟังตรวจที่ลำโพงมอนิเตอร์ · กราฟ: `appendix-a-s-2-v1` · สถานะหลักฐาน: PROVISIONAL

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `lav1` | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` |
| `lav2` | ไมค์หนีบปก 2 (แขกรับเชิญ) (S-LAV-02) | `generic-lav-mic` |
| `tx1` | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` |
| `tx2` | ตัวส่ง TX 2 (S-TX-02) | `generic-wireless-tx` |
| `rx1` | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` |
| `rx2` | ตัวรับ RX ช่อง 2 (S-RX-02) | `generic-wireless-rx` |
| `mix` | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` |
| `sw` | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` |
| `speaker` | Yamaha HS5 ลำโพงมอนิเตอร์ (S-HS5-01) | `yamaha-hs5` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `lav1` | `lav1:out` ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | `lead-1` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx1` | `tx1:mic-in` ตัวส่ง TX 1 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `lav2` | `lav2:out` ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | `lead-2` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx2` | `tx2:mic-in` ตัวส่ง TX 2 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx1` | `rx1:audio-out` ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | `lead-3` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `rx2` | `rx2:audio-out` ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | `lead-4` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `mix` | `mix:aux-out` มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | `lead-5` (`AUD-TRS-635-35`, 6.35mm → 3.5mm) | `sw` | `sw:audio-in` เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | ผู้เล่นต้องต่อ |
| `mix` | `mix:main-out` มิกเซอร์เสียง MAIN / PA OUT (XLR) | `lead-6` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `speaker` | `speaker:xlr-in` Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×2<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×2<br>`AUD-TRS-635-35` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `tx1` | `power` | true |
| `rx1` | `power` | true |
| `rx1` | `rf` | CH 1 |
| `rx1` | `pair` | Paired |
| `tx2` | `power` | true |
| `rx2` | `power` | true |
| `rx2` | `rf` | CH 1 |
| `rx2` | `pair` | Paired |
| `tx2` | `rf` | CH 2 |
| `rx2` | `rf` | CH 2 |
| `mix` | `power` | true |
| `mix` | `main-fader` | Unity |
| `mix` | `aux-master` | Unity |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-main` | true |
| `mix` | `ch1-aux` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-main` | true |
| `mix` | `ch2-aux` | true |
| `sw` | `power` | true |
| `sw` | `ain-on` | true |
| `sw` | `emb-audio` | OFF |
| `speaker` | `power` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `separate` [physical] ไมค์สองตัวเข้าช่องแยกกัน
- `broadcast` [signal, สำคัญ] บัส Broadcast มีเสียงทั้งสองไมค์ที่เครื่องสลับภาพ
- `monitor` [signal, สำคัญ] ลำโพง HS5 ได้ยินทั้งสองไมค์
- `soundcheck` [rehearsal] ตรวจเสียงทีละไมค์แล้ว
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `pre-mic-place` [physical] ตั้งไมค์ระดับปาก หันหลบลำโพง
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## ST-03 — สลับสามกล้อง · Three-Camera Switch

ห้อง: สตูดิโอภารกิจ · ใบงาน: ถ่ายสามมุม: โต๊ะผู้นำเสนอ มุมสัมภาษณ์ และฉากเขียว — สลับด้วยเครื่องสลับภาพ ไม่ใช่การย้ายสาย · กราฟ: `appendix-a-s-3-v1` · สถานะหลักฐาน: PROVISIONAL

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` |
| `cam2` | CAM2 มุมสัมภาษณ์ (S-CAM-02) | `generic-hdmi-camera` |
| `cam3` | CAM3 มุมฉากเขียว (S-CAM-03) | `generic-hdmi-camera` |
| `sw` | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` |
| `monitor` | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` CAM1 ภาพกว้าง HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:hdmi-out` CAM2 มุมสัมภาษณ์ HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-2` เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:hdmi-out` CAM3 มุมฉากเขียว HDMI OUT | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-3` เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-mv-out` เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | `lead-4` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in` ทีวีรวมภาพ HDMI IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-HDMI-A-A` ×4

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam1` | `clean` | true |
| `cam2` | `power` | true |
| `cam2` | `framing` | Framed for assignment |
| `cam2` | `clean` | true |
| `cam3` | `power` | true |
| `cam3` | `framing` | Framed for assignment |
| `cam3` | `clean` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `site` | `cable-route` | true |

คิวสลับภาพ: เปิดรายการ … CAM1 → CAM1; สัมภาษณ์ … CAM2 → CAM2; ฉากเขียว … CAM3 → CAM3; กลับภาพกว้าง … CAM1 → CAM1

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `mv3` [signal, สำคัญ] เห็นทั้งสามกล้องในจอรวมภาพ
- `cuts` [rehearsal] การเลือกแหล่งภาพเปลี่ยน PGM จริง
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-cable-route` [physical] เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน
- `cues` [rehearsal] ออกอากาศตามคิวครบ 4 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## ST-04 — แก้ปัญหาการจับภาพ · Capture Troubleshooting

ห้อง: สตูดิโอภารกิจ · ใบงาน: ผู้ชมออนไลน์เห็นภาพตารางรวมภาพแทนรายการ และไม่ได้ยินเสียง — หาสาเหตุและซ่อมทางกายภาพ · กราฟ: `appendix-a-s-4-v1` · สถานะหลักฐาน: PROVISIONAL

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` |
| `lav1` | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` |
| `tx1` | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` |
| `rx1` | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` |
| `mix` | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` |
| `sw` | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` |
| `monitor` | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` |
| `capture` | Magewell USB Capture HDMI Gen 2 (S-CAP-01) | `magewell-usb-capture-hdmi-gen2` |
| `host` | โน้ตบุ๊ก OBS (จำลอง) (S-OBS-01) | `generic-obs-host` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` CAM1 ภาพกว้าง HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:hdmi-mv-out` เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in` ทีวีรวมภาพ HDMI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:hdmi-pgm-out` เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `capture` | `capture:hdmi-in` Magewell USB Capture HDMI Gen 2 HDMI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `capture` | `capture:usb` Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | `lead-4` (`DATA-USB-MAGEWELL`, USB-A → USB-A) | `host` | `host:usb-1` โน้ตบุ๊ก OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |
| `lav1` | `lav1:out` ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | `lead-5` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx1` | `tx1:mic-in` ตัวส่ง TX 1 MIC IN (3.5 mm) | ต่อไว้ในฉาก (อาจมี fault) |
| `rx1` | `rx1:audio-out` ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | `lead-6` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:aux-out` มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | `lead-7` (`AUD-TRS-635-35`, 6.35mm → 3.5mm) | `sw` | `sw:audio-in` เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | ต่อไว้ในฉาก (อาจมี fault) |

กระเป๋าสายกายภาพที่ต้องเลือก: `DATA-USB-MAGEWELL` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `mix` | `ch1-aux` | true |
| `host` | `video-src` | USB video capture device |
| `site` | `soundcheck` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- `f-roles` สาย Capture ต่อจาก MULTIVIEW OUT แทน PGM OUT; สายผิดจุด: sw:hdmi-pgm-out → capture:hdmi-in (เริ่มที่ sw:hdmi-mv-out → capture:hdmi-in)
- `f-bus` เสียงไมค์ไม่ได้ส่งเข้าบัส Broadcast; ตั้งค่าผิด: mix.ch1-aux = false
- `f-usb` สาย USB ของ Capture หลุด; สายหลุด: capture:usb → host:usb-1
- `f-obs` OBS ไม่ได้เลือก Video Capture Device; ตั้งค่าผิด: host.video-src = None

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `mv` [signal, สำคัญ] MULTIVIEW ไปที่ทีวีเพื่อดูตรวจ
- `obs-video` [signal, สำคัญ] OBS ได้ภาพ PGM ผ่าน Capture
- `obs-audio` [signal, สำคัญ] OBS มีเสียงรายการที่ฝังใน PGM
- `recovered` [delivery, สำคัญ] ตรวจหาและซ่อมจุดเสียครบ
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## ST-05 — สตูดิโอครบระบบ · Full Studio

ห้อง: สตูดิโอภารกิจ · ใบงาน: ประกอบสตูดิโอครบระบบ: สามกล้องสลับได้, ไมค์ไร้สาย 2 ตัวและไมค์สาย 1 ตัวแยกช่อง, Broadcast ฝังเข้า PGM, ฟังตรวจที่ HS5, จับภาพ PGM เข้า OBS · กราฟ: `appendix-a-s-5-v1` · สถานะหลักฐาน: PROVISIONAL

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` |
| `cam2` | CAM2 มุมสัมภาษณ์ (S-CAM-02) | `generic-hdmi-camera` |
| `cam3` | CAM3 มุมฉากเขียว (S-CAM-03) | `generic-hdmi-camera` |
| `sw` | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` |
| `monitor` | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` |
| `lav1` | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` |
| `lav2` | ไมค์หนีบปก 2 (แขกรับเชิญ) (S-LAV-02) | `generic-lav-mic` |
| `tx1` | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` |
| `tx2` | ตัวส่ง TX 2 (S-TX-02) | `generic-wireless-tx` |
| `rx1` | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` |
| `rx2` | ตัวรับ RX ช่อง 2 (S-RX-02) | `generic-wireless-rx` |
| `mic` | ไมค์สาย XLR (S-MIC-01) | `generic-dynamic-mic` |
| `mix` | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` |
| `speaker` | Yamaha HS5 ลำโพงมอนิเตอร์ (S-HS5-01) | `yamaha-hs5` |
| `capture` | Magewell USB Capture HDMI Gen 2 (S-CAP-01) | `magewell-usb-capture-hdmi-gen2` |
| `host` | โน้ตบุ๊ก OBS (จำลอง) (S-OBS-01) | `generic-obs-host` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:hdmi-out` CAM1 ภาพกว้าง HDMI OUT | `lead-1` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-1` เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:hdmi-out` CAM2 มุมสัมภาษณ์ HDMI OUT | `lead-2` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-2` เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:hdmi-out` CAM3 มุมฉากเขียว HDMI OUT | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `sw` | `sw:hdmi-in-3` เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-mv-out` เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | `lead-4` (`VID-HDMI-A-A`, HDMI → HDMI) | `monitor` | `monitor:hdmi-in` ทีวีรวมภาพ HDMI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:hdmi-pgm-out` เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | `lead-5` (`VID-HDMI-A-A`, HDMI → HDMI) | `capture` | `capture:hdmi-in` Magewell USB Capture HDMI Gen 2 HDMI IN | ผู้เล่นต้องต่อ |
| `capture` | `capture:usb` Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | `lead-6` (`DATA-USB-MAGEWELL`, USB-A → USB-A) | `host` | `host:usb-1` โน้ตบุ๊ก OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |
| `lav1` | `lav1:out` ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | `lead-7` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx1` | `tx1:mic-in` ตัวส่ง TX 1 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `lav2` | `lav2:out` ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | `lead-8` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx2` | `tx2:mic-in` ตัวส่ง TX 2 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx1` | `rx1:audio-out` ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | `lead-9` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `rx2` | `rx2:audio-out` ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | `lead-10` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `mic` | `mic:xlr-out` ไมค์สาย XLR XLR OUT | `lead-11` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` มิกเซอร์เสียง IN 3 MIC/LINE (XLR) | ผู้เล่นต้องต่อ |
| `mix` | `mix:aux-out` มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | `lead-12` (`AUD-TRS-635-35`, 6.35mm → 3.5mm) | `sw` | `sw:audio-in` เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | ผู้เล่นต้องต่อ |
| `mix` | `mix:main-out` มิกเซอร์เสียง MAIN / PA OUT (XLR) | `lead-13` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `speaker` | `speaker:xlr-in` Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×2<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×2<br>`AUD-TRS-635-35` ×1<br>`AUD-XLR-MIC` ×1<br>`DATA-USB-MAGEWELL` ×1<br>`VID-HDMI-A-A` ×5

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam1` | `clean` | true |
| `cam2` | `power` | true |
| `cam2` | `framing` | Framed for assignment |
| `cam2` | `clean` | true |
| `cam3` | `power` | true |
| `cam3` | `framing` | Framed for assignment |
| `cam3` | `clean` | true |
| `tx1` | `power` | true |
| `rx1` | `power` | true |
| `rx1` | `rf` | CH 1 |
| `rx1` | `pair` | Paired |
| `tx2` | `power` | true |
| `rx2` | `power` | true |
| `rx2` | `rf` | CH 1 |
| `rx2` | `pair` | Paired |
| `tx2` | `rf` | CH 2 |
| `rx2` | `rf` | CH 2 |
| `mix` | `power` | true |
| `mix` | `main-fader` | Unity |
| `mix` | `aux-master` | Unity |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-main` | true |
| `mix` | `ch1-aux` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-main` | true |
| `mix` | `ch2-aux` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-main` | true |
| `mix` | `ch3-aux` | true |
| `sw` | `power` | true |
| `sw` | `pgm` | HDMI 1 |
| `sw` | `ain-on` | true |
| `sw` | `emb-audio` | OFF |
| `monitor` | `power` | true |
| `speaker` | `power` | true |
| `host` | `power` | true |
| `host` | `video-src` | USB video capture device |
| `host` | `audio-src` | USB capture embedded audio |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |

คิวสลับภาพ: เปิดรายการ … CAM1 → CAM1; สัมภาษณ์ … CAM2 → CAM2; ฉากเขียว … CAM3 → CAM3; ปิดรายการ … CAM1 → CAM1

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): `s-pair` ตัวรับ RX ช่อง 2 หลุดการจับคู่; `s-mute` ช่องไมค์สายถูก Mute; `s-usb` สาย USB ของ Capture หลุด; `s-ain` ปิด AUDIO IN ที่เครื่องสลับภาพ

### เงื่อนไขตรวจรับจริง

- `mv3` [signal, สำคัญ] สามกล้องอยู่ในจอรวมภาพ
- `obs-video` [signal, สำคัญ] OBS ได้ภาพ PGM ผ่าน Capture
- `obs-audio` [signal, สำคัญ] OBS มีเสียงทั้งสามไมค์ที่ฝังใน PGM (ไม่ซ้อน)
- `monitor` [signal, สำคัญ] ฟังตรวจที่ HS5 ได้
- `cuts` [rehearsal] ใช้ครบสามมุมกล้องในรายการ
- `recovered` [delivery, สำคัญ] แก้ปัญหาที่เกิดระหว่างงานได้
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical, สำคัญ] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-power-check` [physical] ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก
- `pre-cable-route` [physical] เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `pre-mic-place` [physical] ตั้งไมค์ระดับปาก หันหลบลำโพง
- `cues` [rehearsal, สำคัญ] ออกอากาศตามคิวครบ 4 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## AU-01 — กล้องหลักสู่จอเวที · Main Camera to Stage Display

ห้อง: หอประชุม · ใบงาน: นำภาพกล้องกลางหลังห้องขึ้นจอเวที · กราฟ: `project-au-01-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` |
| `convSH` | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` |
| `display` | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:aux-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · AUX 1 | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `convSH` | `convSH:sdi-in` Micro Converter SDI→HDMI 3G SDI IN | ผู้เล่นต้องต่อ |
| `convSH` | `convSH:hdmi-out` Micro Converter SDI→HDMI 3G HDMI OUT | `lead-3` (`VID-HDMI-A-A`, HDMI → HDMI) | `display` | `display:hdmi-in` จอเวที HDMI IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-HDMI-A-A` ×1<br>`VID-SDI-3G` ×2

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `sw` | `power` | true |
| `sw` | `pgm` | SDI 1 |
| `sw` | `aux-1` | PROGRAM |
| `convSH` | `power` | true |
| `display` | `power` | true |
| `site` | `power-check` | true |
| `site` | `format` | true |

คิวสลับภาพ: เปิดงาน … กล้อง 1 → CAM1

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `stage` [signal, สำคัญ] จอเวทีแสดงภาพกล้อง
- `conv` [signal] ตัวแปลง SDI→HDMI มีไฟเลี้ยง
- `out` [signal] AUX 1 ส่งภาพออกอากาศ (PROGRAM)
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-power-check` [physical] ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก
- `pre-format` [physical] ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz
- `cues` [rehearsal] ออกอากาศตามคิวครบ 1 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## AU-02 — ไมค์เวทีผ่านมัลติคอร์และสองบัส

ห้อง: หอประชุม · ใบงาน: AU-02 · ให้เสียงโพเดียมดังในห้องและเข้าระบบถ่ายทอดแยกกัน · กราฟ: `appendix-a-m-2-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `podium` | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` |
| `stagebox` | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` |
| `tail` | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` |
| `mix` | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` |
| `paL` | ลำโพง PA ซ้าย (M-PA-L) | `generic-active-pa` |
| `paR` | ลำโพง PA ขวา (M-PA-R) | `generic-active-pa` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` |
| `hand1` | ไมค์ไร้สายมือถือ 1 พร้อมตัวส่ง (M-HAND-1) | `reference-handheld-tx` |
| `hrx1` | ตัวรับไมค์มือถือ 1 (M-HRX-1) | `generic-wireless-rx` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `podium` | `podium:xlr-out` ไมค์โพเดียม XLR OUT | `lead-1` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` Stagebox อนาล็อก MIC IN 1 | ผู้เล่นต้องต่อ |
| `hrx1` | `hrx1:audio-out` ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | `lead-2` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-2` Stagebox อนาล็อก MIC IN 2 | ผู้เล่นต้องต่อ |
| `stagebox` | `stagebox:multicore` Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | `lead-3` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-1` หางสายมัลติคอร์ FOH TAIL 1 | `lead-4` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ FOH CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-2` หางสายมัลติคอร์ FOH TAIL 2 | `lead-5` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์ FOH CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` มิกเซอร์ FOH PA-L LINE OUT | `lead-6` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `paL` | `paL:line-in` ลำโพง PA ซ้าย LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-r` มิกเซอร์ FOH PA-R LINE OUT | `lead-7` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `paR` | `paR:line-in` ลำโพง PA ขวา LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-l` มิกเซอร์ FOH BC-L LINE OUT | `lead-8` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 1 (balanced) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-r` มิกเซอร์ FOH BC-R LINE OUT | `lead-9` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 2 (balanced) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-PA-ACTIVE` ×2<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-XLR-LINE-BAL` ×2<br>`AUD-XLR-MIC` ×3<br>`STG-MULTICORE` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `mix` | `power` | true |
| `paL` | `power` | true |
| `paR` | `power` | true |
| `sw` | `power` | true |
| `hand1` | `power` | true |
| `hrx1` | `power` | true |
| `paL` | `power` | true |
| `paL` | `level` | Nominal |
| `paL` | `aim` | In front of the mic, aimed at audience |
| `paR` | `power` | true |
| `paR` | `level` | Nominal |
| `paR` | `aim` | In front of the mic, aimed at audience |
| `sw` | `power` | true |
| `sw` | `xlr-on` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `hand1` | `power` | true |
| `hand1` | `rf` | CH 1 |
| `hrx1` | `power` | true |
| `hrx1` | `rf` | CH 1 |
| `hrx1` | `pair` | Paired |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-mic-place` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pa` [signal, สำคัญ] เสียงโพเดียมออกลำโพงในห้อง ไม่หอน
- `lr` [physical] Broadcast เข้า L และ R ครบ
- `soundcheck` [rehearsal] ตรวจเสียงระดับพูดจริงแล้ว
- `audio-paL` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `audio-paR` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `audio-sw` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## AU-03 — กล้องและสไลด์ · Cameras and Slides

ห้อง: หอประชุม · ใบงาน: ห้าแหล่งภาพต้องเลือกได้ทั้งหมด จอเวทีต้องแสดงภาพ PGM ที่สะอาด ไม่ใช่ Multiview · กราฟ: `project-au-03-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` |
| `ptz` | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` |
| `slides` | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` |
| `convHS` | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` |
| `convSH` | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` |
| `display` | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้อง 3 ขวา · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ผู้เล่นต้องต่อ |
| `ptz` | `ptz:sdi-out` กล้อง PTZ SDI OUT (3G) | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 4 | ผู้เล่นต้องต่อ |
| `slides` | `slides:hdmi-out` โน้ตบุ๊กนำเสนอ HDMI OUT | `lead-5` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ผู้เล่นต้องต่อ |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 5 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอ Multiview FOH SDI IN (จอ A) | ผู้เล่นต้องต่อ |
| `sw` | `sw:aux-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · AUX 1 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `convSH` | `convSH:sdi-in` Micro Converter SDI→HDMI 3G SDI IN | ผู้เล่นต้องต่อ |
| `convSH` | `convSH:hdmi-out` Micro Converter SDI→HDMI 3G HDMI OUT | `lead-9` (`VID-HDMI-A-A`, HDMI → HDMI) | `display` | `display:hdmi-in` จอเวที HDMI IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-HDMI-A-A` ×2<br>`VID-SDI-3G` ×7

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `power` | true |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `power` | true |
| `cam3` | `framing` | Framed for assignment |
| `ptz` | `power` | true |
| `ptz` | `framing` | Framed for assignment |
| `slides` | `power` | true |
| `slides` | `present` | true |
| `slides` | `mute-audio` | true |
| `convHS` | `power` | true |
| `convSH` | `power` | true |
| `sw` | `power` | true |
| `sw` | `aux-1` | PROGRAM |
| `sw` | `pgm` | SDI 1 |
| `monitor` | `power` | true |
| `display` | `power` | true |
| `site` | `cable-route` | true |

คิวสลับภาพ: เปิด … กล้อง 1 → CAM1; สไลด์ → SLIDES; PTZ เวที → PTZ; กล้อง 2 → CAM2; กล้อง 3 → CAM3

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `mv5` [signal, สำคัญ] จอ FOH เห็นครบห้าแหล่งภาพ
- `stage` [signal, สำคัญ] จอเวทีแสดง PGM ที่สะอาด ไม่ใช่ Multiview
- `five` [rehearsal] เลือกครบทั้งห้าแหล่งภาพ
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-cable-route` [physical] เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน
- `cues` [rehearsal] ออกอากาศตามคิวครบ 5 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## AU-04 — ซ่อมระบบหอประชุม · Auditorium Fault Repair

ห้อง: หอประชุม · ใบงาน: ก่อนเริ่มงาน 15 นาที: จอเวทีดำ กล้อง 2 หาย และเสียงโพเดียมไม่เข้าระบบถ่ายทอด — คืนบทบาทพอร์ตและสัญญาณให้ถูก · กราฟ: `project-au-04-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` |
| `ptz` | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` |
| `slides` | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` |
| `convHS` | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` |
| `convSH` | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` |
| `display` | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` |
| `podium` | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` |
| `stagebox` | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` |
| `tail` | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` |
| `mix` | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam2` | `cam2:sdi-out` กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam3` | `cam3:sdi-out` กล้อง 3 ขวา · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ต่อไว้ในฉาก (อาจมี fault) |
| `ptz` | `ptz:sdi-out` กล้อง PTZ SDI OUT (3G) | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 4 | ต่อไว้ในฉาก (อาจมี fault) |
| `slides` | `slides:hdmi-out` โน้ตบุ๊กนำเสนอ HDMI OUT | `lead-5` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 5 | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอ Multiview FOH SDI IN (จอ A) | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:aux-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · AUX 1 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `convSH` | `convSH:sdi-in` Micro Converter SDI→HDMI 3G SDI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `convSH` | `convSH:hdmi-out` Micro Converter SDI→HDMI 3G HDMI OUT | `lead-9` (`VID-HDMI-A-A`, HDMI → HDMI) | `display` | `display:hdmi-in` จอเวที HDMI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `podium` | `podium:xlr-out` ไมค์โพเดียม XLR OUT | `lead-10` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` Stagebox อนาล็อก MIC IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `stagebox` | `stagebox:multicore` Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | `lead-11` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-1` หางสายมัลติคอร์ FOH TAIL 1 | `lead-12` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ FOH CH 1 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-l` มิกเซอร์ FOH BC-L LINE OUT | `lead-13` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 1 (balanced) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-r` มิกเซอร์ FOH BC-R LINE OUT | `lead-14` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 2 (balanced) | ต่อไว้ในฉาก (อาจมี fault) |

กระเป๋าสายกายภาพที่ต้องเลือก: ไม่ต้องนำสายเพิ่ม (ซ่อมจากสายที่อยู่ในฉาก)

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `convSH` | `power` | true |
| `sw` | `aux-1` | PROGRAM |
| `mix` | `ch1-bc` | true |
| `site` | `soundcheck` | true |

คิวสลับภาพ: เริ่มงาน … กล้อง 2 → CAM2

### Fault และการซ่อม

- `f-ref` กล้อง 2 เสียบเข้า REF IN แทน SDI IN; สายผิดจุด: cam2:sdi-out → sw:sdi-in-2 (เริ่มที่ cam2:sdi-out → sw:ref-in)
- `f-conv` ตัวแปลง SDI→HDMI ไม่มีไฟเลี้ยง; ตั้งค่าผิด: convSH.power = false
- `f-aux` AUX 1 เลือกแหล่งภาพผิด (กล้อง 3 แทน PROGRAM); ตั้งค่าผิด: sw.aux-1 = SDI 3
- `f-bus` ไมค์โพเดียมส่งเข้า PA แทน Broadcast; ตั้งค่าผิด: mix.ch1-bc = false

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `cam2` [signal, สำคัญ] กล้อง 2 กลับเข้า SDI IN ที่ถูกต้อง
- `stage` [signal, สำคัญ] จอเวทีแสดง PGM
- `bc` [signal, สำคัญ] เสียงโพเดียมถึงขาเข้า Broadcast
- `recovered` [delivery, สำคัญ] ตรวจหาและซ่อมจุดเสียครบ
- `installed` [physical] ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด
- `powered` [physical] อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ
- `channel-map` [physical] ต่อสายตรงตามผังช่องสัญญาณ
- `pre-soundcheck` [physical] ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก
- `cues` [rehearsal] ออกอากาศตามคิวครบ 1 คิว
- `no-black` [rehearsal] ไม่มีภาพดำออกอากาศระหว่างซ้อม
- `quiz` [delivery] คำถามทบทวนความเข้าใจ
- `signoff` [delivery, สำคัญ] ตรวจรับงานและเก็บงาน

---

## AU-05 — หอประชุมพร้อมภาพเสียงและบันทึกครบระบบ

ห้อง: หอประชุม · ใบงาน: AU-05 · จัดงานเต็มระบบ: ห้าแหล่งภาพ, จอเวทีจาก AUX, Multiview ที่ FOH, PGM สะอาดไป Capture/OBS และเครื่องบันทึกแยกขาออก, เสียงสามแหล่งผ่าน Stagebox แยก PA และ Broadcast · กราฟ: `appendix-a-m-5-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` |
| `ptz` | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` |
| `slides` | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` |
| `convHS` | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` |
| `convSH` | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` |
| `display` | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` |
| `podium` | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` |
| `stagebox` | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` |
| `tail` | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` |
| `mix` | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` |
| `paL` | ลำโพง PA ซ้าย (M-PA-L) | `generic-active-pa` |
| `paR` | ลำโพง PA ขวา (M-PA-R) | `generic-active-pa` |
| `capture` | Magewell USB Capture SDI Gen 2 (M-CAP-01) | `magewell-usb-capture-sdi-gen2` |
| `host` | คอมพิวเตอร์สตรีม OBS (จำลอง) (M-OBS-01) | `generic-obs-host` |
| `rec` | HyperDeck Studio HD Plus (M-REC-01) | `bmd-hyperdeck-studio-hd-plus` |
| `hand1` | ไมค์ไร้สายมือถือ 1 พร้อมตัวส่ง (M-HAND-1) | `reference-handheld-tx` |
| `hrx1` | ตัวรับไมค์มือถือ 1 (M-HRX-1) | `generic-wireless-rx` |
| `hand2` | ไมค์ไร้สายมือถือ 2 พร้อมตัวส่ง (M-HAND-2) | `reference-handheld-tx` |
| `hrx2` | ตัวรับไมค์มือถือ 2 (M-HRX-2) | `generic-wireless-rx` |
| `lav1` | ไมค์หนีบปก 1 (M-LAV-1) | `generic-lav-mic` |
| `lav2` | ไมค์หนีบปก 2 (M-LAV-2) | `generic-lav-mic` |
| `tx1` | ตัวส่งไมค์หนีบปก 1 (M-TX-1) | `generic-wireless-tx` |
| `tx2` | ตัวส่งไมค์หนีบปก 2 (M-TX-2) | `generic-wireless-tx` |
| `rx1` | ตัวรับไมค์หนีบปก 1 (M-RX-1) | `generic-wireless-rx` |
| `rx2` | ตัวรับไมค์หนีบปก 2 (M-RX-2) | `generic-wireless-rx` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้อง 3 ขวา · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ผู้เล่นต้องต่อ |
| `ptz` | `ptz:sdi-out` กล้อง PTZ SDI OUT (3G) | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 4 | ผู้เล่นต้องต่อ |
| `slides` | `slides:hdmi-out` โน้ตบุ๊กนำเสนอ HDMI OUT | `lead-5` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ผู้เล่นต้องต่อ |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 5 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอ Multiview FOH SDI IN (จอ A) | ผู้เล่นต้องต่อ |
| `sw` | `sw:aux-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · AUX 1 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `convSH` | `convSH:sdi-in` Micro Converter SDI→HDMI 3G SDI IN | ผู้เล่นต้องต่อ |
| `convSH` | `convSH:hdmi-out` Micro Converter SDI→HDMI 3G HDMI OUT | `lead-9` (`VID-HDMI-A-A`, HDMI → HDMI) | `display` | `display:hdmi-in` จอเวที HDMI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:aux-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · AUX 2 | `lead-10` (`VID-SDI-3G`, SDI → SDI) | `capture` | `capture:sdi-in` Magewell USB Capture SDI Gen 2 SDI IN | ผู้เล่นต้องต่อ |
| `capture` | `capture:usb` Magewell USB Capture SDI Gen 2 USB 3.0 (DEVICE → HOST) | `lead-11` (`DATA-USB-MAGEWELL`, USB-A → USB-A) | `host` | `host:usb-1` คอมพิวเตอร์สตรีม OBS USB-A 1 (capture) | ผู้เล่นต้องต่อ |
| `sw` | `sw:pgm-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · PROGRAM | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `rec` | `rec:sdi-in` HyperDeck Studio HD Plus SDI IN | ผู้เล่นต้องต่อ |
| `podium` | `podium:xlr-out` ไมค์โพเดียม XLR OUT | `lead-13` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` Stagebox อนาล็อก MIC IN 1 | ผู้เล่นต้องต่อ |
| `hrx1` | `hrx1:audio-out` ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | `lead-14` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-2` Stagebox อนาล็อก MIC IN 2 | ผู้เล่นต้องต่อ |
| `hrx2` | `hrx2:audio-out` ตัวรับไมค์มือถือ 2 AUDIO OUT (XLR) | `lead-15` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-3` Stagebox อนาล็อก MIC IN 3 | ผู้เล่นต้องต่อ |
| `rx1` | `rx1:audio-out` ตัวรับไมค์หนีบปก 1 AUDIO OUT (XLR) | `lead-16` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-4` Stagebox อนาล็อก MIC IN 4 | ผู้เล่นต้องต่อ |
| `rx2` | `rx2:audio-out` ตัวรับไมค์หนีบปก 2 AUDIO OUT (XLR) | `lead-17` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-5` Stagebox อนาล็อก MIC IN 5 | ผู้เล่นต้องต่อ |
| `lav1` | `lav1:out` ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | `lead-18` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx1` | `tx1:mic-in` ตัวส่งไมค์หนีบปก 1 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `lav2` | `lav2:out` ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | `lead-19` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx2` | `tx2:mic-in` ตัวส่งไมค์หนีบปก 2 MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `stagebox` | `stagebox:multicore` Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | `lead-20` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-1` หางสายมัลติคอร์ FOH TAIL 1 | `lead-21` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ FOH CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-2` หางสายมัลติคอร์ FOH TAIL 2 | `lead-22` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์ FOH CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-3` หางสายมัลติคอร์ FOH TAIL 3 | `lead-23` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` มิกเซอร์ FOH CH 3 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-4` หางสายมัลติคอร์ FOH TAIL 4 | `lead-24` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-4` มิกเซอร์ FOH CH 4 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-5` หางสายมัลติคอร์ FOH TAIL 5 | `lead-25` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-5` มิกเซอร์ FOH CH 5 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` มิกเซอร์ FOH PA-L LINE OUT | `lead-26` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `paL` | `paL:line-in` ลำโพง PA ซ้าย LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-r` มิกเซอร์ FOH PA-R LINE OUT | `lead-27` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `paR` | `paR:line-in` ลำโพง PA ขวา LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-l` มิกเซอร์ FOH BC-L LINE OUT | `lead-28` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 1 (balanced) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-r` มิกเซอร์ FOH BC-R LINE OUT | `lead-29` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM Television Studio HD8 ISO XLR AUDIO IN 2 (balanced) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×2<br>`AUD-PA-ACTIVE` ×2<br>`AUD-RX-MIXER-XLR` ×4<br>`AUD-XLR-LINE-BAL` ×2<br>`AUD-XLR-MIC` ×6<br>`DATA-USB-MAGEWELL` ×1<br>`STG-MULTICORE` ×1<br>`VID-HDMI-A-A` ×2<br>`VID-SDI-3G` ×9

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam2` | `power` | true |
| `cam3` | `power` | true |
| `ptz` | `power` | true |
| `slides` | `power` | true |
| `convHS` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `convSH` | `power` | true |
| `display` | `power` | true |
| `mix` | `power` | true |
| `paL` | `power` | true |
| `paR` | `power` | true |
| `host` | `power` | true |
| `rec` | `power` | true |
| `hand1` | `power` | true |
| `hrx1` | `power` | true |
| `hand2` | `power` | true |
| `hrx2` | `power` | true |
| `tx1` | `power` | true |
| `tx2` | `power` | true |
| `rx1` | `power` | true |
| `rx2` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `ptz` | `framing` | Framed for assignment |
| `cam1` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `power` | true |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `power` | true |
| `cam3` | `framing` | Framed for assignment |
| `ptz` | `power` | true |
| `ptz` | `framing` | Framed for assignment |
| `slides` | `power` | true |
| `slides` | `present` | true |
| `slides` | `mute-audio` | true |
| `convHS` | `power` | true |
| `convSH` | `power` | true |
| `sw` | `power` | true |
| `sw` | `aux-1` | PROGRAM |
| `sw` | `pgm` | SDI 1 |
| `monitor` | `power` | true |
| `display` | `power` | true |
| `sw` | `aux-2` | PROGRAM |
| `sw` | `xlr-on` | true |
| `sw` | `emb-audio` | OFF |
| `paL` | `power` | true |
| `paL` | `level` | Nominal |
| `paL` | `aim` | In front of the mic, aimed at audience |
| `paR` | `power` | true |
| `paR` | `level` | Nominal |
| `paR` | `aim` | In front of the mic, aimed at audience |
| `host` | `power` | true |
| `host` | `video-src` | USB video capture device |
| `host` | `audio-src` | USB capture embedded audio |
| `rec` | `power` | true |
| `rec` | `media` | SD card mounted (512 GB free) |
| `rec` | `record` | true |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |
| `site` | `storage` | true |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `ch4-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch4-on` | true |
| `mix` | `ch4-pa` | true |
| `mix` | `ch4-bc` | true |
| `mix` | `ch5-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch5-on` | true |
| `mix` | `ch5-pa` | true |
| `mix` | `ch5-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `hand1` | `power` | true |
| `hand1` | `rf` | CH 1 |
| `hrx1` | `power` | true |
| `hrx1` | `rf` | CH 1 |
| `hrx1` | `pair` | Paired |
| `hand2` | `power` | true |
| `hand2` | `rf` | CH 1 |
| `hrx2` | `power` | true |
| `hrx2` | `rf` | CH 1 |
| `hrx2` | `pair` | Paired |
| `tx1` | `power` | true |
| `tx1` | `rf` | CH 1 |
| `rx1` | `power` | true |
| `rx1` | `rf` | CH 1 |
| `rx1` | `pair` | Paired |
| `tx2` | `power` | true |
| `tx2` | `rf` | CH 1 |
| `rx2` | `power` | true |
| `rx2` | `rf` | CH 1 |
| `rx2` | `pair` | Paired |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `mic-place` | true |
| `site` | `storage` | true |

คิวสลับภาพ: เปิดงาน … สไลด์ → SLIDES; วิทยากร … กล้อง 1 → CAM1; ภาพเวที … PTZ → PTZ; กล้อง 2 → CAM2; กล้อง 3 → CAM3

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): `s-mv` AUX 1 ไปจอเวทีถูกเปลี่ยนเป็นภาพกล้อง 3; `s-conv` ตัวแปลงไปจอเวทีไฟดับ; `s-bc` บัส Broadcast ถูกลดลง; `s-full` สื่อบันทึกเต็ม; `s-usb` สาย USB ของ Capture หลุด

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-mic-place` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-storage` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `mv5` [signal, สำคัญ] Multiview FOH เห็นครบห้าแหล่งภาพ
- `stage` [signal, สำคัญ] จอเวทีแสดง PGM ที่สะอาด (จาก AUX)
- `rec` [delivery, สำคัญ] เครื่องบันทึกบันทึกจาก PGM ที่ถูกต้อง
- `audio-paL` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `audio-paR` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `obs-full` [delivery, สำคัญ] OBS รับภาพรายการพร้อมเสียงวิทยากรครบห้าแหล่ง
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `recovered` [delivery, สำคัญ] วินิจฉัยและแก้ปัญหาที่เกิดในงาน
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## OUT-01 — เส้นทางภาพภาคสนาม

ห้อง: สนามกลางแจ้ง · ใบงาน: OUT-01 · ต่อกล้องใกล้ผ่านเครื่องสลับภาพและตรวจจอรวมภาพ · กราฟ: `appendix-a-l-1-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องใกล้ A · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพภาคสนาม · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-SDI-3G` ×2

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `sw` | `pgm` | SDI 1 |
| `sw` | `emb-audio` | OFF |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `shelter` | true |
| `site` | `power-signoff` | true |
| `site` | `ramp` | true |
| `site` | `decision` | GO |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-shelter` [physical, สำคัญ] ตรวจความพร้อม: ป้องกันสภาพอากาศ
- `pre-power-signoff` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-ramp` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `safe` [physical, สำคัญ] ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย
- `mv` [signal, สำคัญ] จอรับภาพกล้อง A จากขาออกรวมภาพ
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## OUT-02 — เส้นทางเสียงภาคสนาม

ห้อง: สนามกลางแจ้ง · ใบงาน: OUT-02 · จับคู่ไมค์พิธีกร รับเสียงเวทีและบรรยากาศ แล้วส่ง PA โดยแยกบัสรายการ · กราฟ: `appendix-a-l-2-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `lav` | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` |
| `shotgun` | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` |
| `amb` | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` |
| `mix` | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` |
| `pa` | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `lav` | `lav:out` ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | `lead-1` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | `lead-2` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `shotgun` | `shotgun:xlr-out` ไมค์ช็อตกัน MIC XLR OUT | `lead-3` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `amb` | `amb:xlr-out` ไมค์บรรยากาศ XLR OUT | `lead-4` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | `lead-5` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-XLR-MIC` ×2

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `mix` | `ch2-phantom` | true |
| `shotgun` | `windscreen` | true |
| `amb` | `windscreen` | true |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `site` | `power-check` | true |
| `site` | `soundcheck` | true |
| `site` | `cable-route` | true |
| `site` | `shelter` | true |
| `site` | `power-signoff` | true |
| `site` | `ramp` | true |
| `site` | `decision` | GO |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-shelter` [physical, สำคัญ] ตรวจความพร้อม: ป้องกันสภาพอากาศ
- `pre-power-signoff` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-ramp` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `safe` [physical, สำคัญ] ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `broadcast-bus` [signal, สำคัญ] บัส Broadcast มีเสียงพร้อมนำไปฝังรายการ
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## OUT-03 — กล้องไกลและการสลับภาพ

ห้อง: สนามกลางแจ้ง · ใบงาน: OUT-03 · ติดตั้งคู่ Optical ของกล้อง C และสลับภาพ A/B/C ด้วย Preview ก่อน Program · กราฟ: `appendix-a-l-3-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` |
| `fiberTx` | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` |
| `fiberRx` | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องใกล้ A · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้องใกล้ B · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้องไกล C · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `fiberTx` | `fiberTx:sdi-in` ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | ผู้เล่นต้องต่อ |
| `fiberTx` | `fiberTx:optical-out` ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | `lead-4` (`FIB-SDI-LINK`, FIBER → FIBER) | `fiberRx` | `fiberRx:optical-in` ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | ผู้เล่นต้องต่อ |
| `fiberRx` | `fiberRx:sdi-out` ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | `lead-5` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพภาคสนาม · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `FIB-SDI-LINK` ×1<br>`VID-SDI-3G` ×5

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam2` | `power` | true |
| `cam3` | `power` | true |
| `fiberTx` | `power` | true |
| `fiberRx` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `sw` | `pgm` | SDI 1 |
| `sw` | `emb-audio` | OFF |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `shelter` | true |
| `site` | `power-signoff` | true |
| `site` | `ramp` | true |
| `site` | `decision` | GO |

คิวสลับภาพ: เตรียมแล้วออกภาพกล้อง A → CAM A; เตรียมแล้วออกภาพกล้อง B → CAM B; เตรียมแล้วออกภาพกล้อง C → CAM C

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-shelter` [physical, สำคัญ] ตรวจความพร้อม: ป้องกันสภาพอากาศ
- `pre-power-signoff` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-ramp` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `safe` [physical, สำคัญ] ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย
- `mv` [signal, สำคัญ] จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง
- `input-1` [signal, สำคัญ] ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด
- `input-2` [signal, สำคัญ] ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด
- `input-3` [signal, สำคัญ] ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## OUT-04 — ซ่อมระบบส่งภาพและเสียงกลางแจ้ง

ห้อง: สนามกลางแจ้ง · ใบงาน: OUT-04 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง · กราฟ: `appendix-a-l-4-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` |
| `fiberTx` | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` |
| `fiberRx` | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` |
| `lav` | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` |
| `shotgun` | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` |
| `amb` | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` |
| `mix` | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` |
| `pa` | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` |
| `embed` | ตัวฝังเสียง AJA 3G-AMA (พร้อมสาย breakout) (L-EMBED) | `aja-3g-ama` |
| `enc` | ตัวเข้ารหัส Streaming Encoder HD (L-ENC) | `bmd-streaming-encoder-hd` |
| `net` | เกตเวย์เครือข่ายสายหลัก (OUT-NET) | `generic-gateway` |
| `wan` | จุดรับสตรีมทดสอบส่วนตัว (WAN) (OUT-WAN) | `generic-test-ingest` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องใกล้ A · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam2` | `cam2:sdi-out` กล้องใกล้ B · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam3` | `cam3:sdi-out` กล้องไกล C · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `fiberTx` | `fiberTx:sdi-in` ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | ต่อไว้ในฉาก (อาจมี fault) |
| `fiberTx` | `fiberTx:optical-out` ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | `lead-4` (`FIB-SDI-LINK`, FIBER → FIBER) | `fiberRx` | `fiberRx:optical-in` ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | ต่อไว้ในฉาก (อาจมี fault) |
| `fiberRx` | `fiberRx:sdi-out` ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | `lead-5` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพภาคสนาม · SmartView Duo SDI IN (จอ A) | ต่อไว้ในฉาก (อาจมี fault) |
| `lav` | `lav:out` ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | `lead-7` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | ต่อไว้ในฉาก (อาจมี fault) |
| `rx` | `rx:audio-out` ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | `lead-8` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `shotgun` | `shotgun:xlr-out` ไมค์ช็อตกัน MIC XLR OUT | `lead-9` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `amb` | `amb:xlr-out` ไมค์บรรยากาศ XLR OUT | `lead-10` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:pa-l` มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | `lead-11` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:pgm-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · PROGRAM | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `embed` | `embed:sdi-in` ตัวฝังเสียง AJA 3G-AMA 3G-SDI IN (BNC) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-l` มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | `lead-13` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `embed` | `embed:audio-l` ตัวฝังเสียง AJA 3G-AMA BREAKOUT XLR IN 1 (DB-25) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-r` มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | `lead-14` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `embed` | `embed:audio-r` ตัวฝังเสียง AJA 3G-AMA BREAKOUT XLR IN 2 (DB-25) | ต่อไว้ในฉาก (อาจมี fault) |
| `embed` | `embed:sdi-out` ตัวฝังเสียง AJA 3G-AMA 3G-SDI OUT (BNC) · ฝังเสียงแล้ว | `lead-15` (`VID-SDI-3G`, SDI → SDI) | `enc` | `enc:sdi-in` ตัวเข้ารหัส Streaming Encoder HD SDI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `enc` | `enc:eth` ตัวเข้ารหัส Streaming Encoder HD ETHERNET (stream) | `lead-16` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net` | `net:lan-1` เกตเวย์เครือข่ายสายหลัก LAN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `net` | `net:wan` เกตเวย์เครือข่ายสายหลัก WAN | `lead-17` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan` | `wan:wan-in` จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ต่อไว้ในฉาก (อาจมี fault) |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-SDI-3G` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam2` | `power` | true |
| `cam3` | `power` | true |
| `fiberTx` | `power` | true |
| `fiberRx` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `embed` | `power` | true |
| `enc` | `power` | true |
| `net` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `sw` | `pgm` | SDI 1 |
| `sw` | `emb-audio` | OFF |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `mix` | `ch2-phantom` | true |
| `shotgun` | `windscreen` | true |
| `amb` | `windscreen` | true |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `embed` | `embed` | true |
| `enc` | `format` | 1080p50 |
| `enc` | `stream-key` | •••• (private test) |
| `enc` | `stream` | true |
| `net` | `wan-link` | Up |
| `net` | `uplink-test` | true |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `ramp` | true |
| `site` | `shelter` | true |
| `site` | `soundcheck` | true |
| `site` | `power-signoff` | true |
| `site` | `decision` | GO |

คิวสลับภาพ: ออกภาพกล้อง A → CAM A; ออกภาพกล้อง B → CAM B; ออกภาพกล้อง C → CAM C

### Fault และการซ่อม

- `f-physical-link` สายจากระบบกล้องเข้าฝ่ายควบคุมหลุด; สายหลุด: fiberRx:sdi-out → sw:sdi-in-3
- `f-embed` อุปกรณ์ฝังเสียงยังไม่เปิดการฝังรายการ; ตั้งค่าผิด: embed.embed = false

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-ramp` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-shelter` [physical, สำคัญ] ตรวจความพร้อม: ป้องกันสภาพอากาศ
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-power-signoff` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `safe` [physical, สำคัญ] ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย
- `mv` [signal, สำคัญ] จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง
- `input-1` [signal, สำคัญ] ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด
- `input-2` [signal, สำคัญ] ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด
- `input-3` [signal, สำคัญ] ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `embed` [signal, สำคัญ] มีภาพรายการและเสียงครบเข้าสู่ตัวเข้ารหัส
- `ingest` [delivery, สำคัญ] ผู้ชมจำลองได้รับภาพและเสียงรายการ
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `recovered` [delivery, สำคัญ] วินิจฉัยและแก้ปัญหาที่เกิดในงาน
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## OUT-05 — ถ่ายทอดภาคสนามครบเส้นทาง

ห้อง: สนามกลางแจ้ง · ใบงาน: OUT-05 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง · กราฟ: `appendix-a-l-5-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` |
| `cam2` | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` |
| `cam3` | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` |
| `fiberTx` | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` |
| `fiberRx` | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` |
| `sw` | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` |
| `monitor` | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` |
| `lav` | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` |
| `shotgun` | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` |
| `amb` | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` |
| `mix` | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` |
| `pa` | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` |
| `embed` | ตัวฝังเสียง AJA 3G-AMA (พร้อมสาย breakout) (L-EMBED) | `aja-3g-ama` |
| `enc` | ตัวเข้ารหัส Streaming Encoder HD (L-ENC) | `bmd-streaming-encoder-hd` |
| `net` | เกตเวย์เครือข่ายสายหลัก (OUT-NET) | `generic-gateway` |
| `wan` | จุดรับสตรีมทดสอบส่วนตัว (WAN) (OUT-WAN) | `generic-test-ingest` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องใกล้ A · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-1` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้องใกล้ B · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-2` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้องไกล C · Studio Camera 4K Pro G2 12G-SDI OUT | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `fiberTx` | `fiberTx:sdi-in` ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | ผู้เล่นต้องต่อ |
| `fiberTx` | `fiberTx:optical-out` ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | `lead-4` (`FIB-SDI-LINK`, FIBER → FIBER) | `fiberRx` | `fiberRx:optical-in` ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | ผู้เล่นต้องต่อ |
| `fiberRx` | `fiberRx:sdi-out` ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | `lead-5` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI IN 3 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · MULTIVIEW | `lead-6` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพภาคสนาม · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |
| `lav` | `lav:out` ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | `lead-7` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | `lead-8` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `mix` | `mix:in-1` มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `shotgun` | `shotgun:xlr-out` ไมค์ช็อตกัน MIC XLR OUT | `lead-9` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `amb` | `amb:xlr-out` ไมค์บรรยากาศ XLR OUT | `lead-10` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | `lead-11` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `sw` | `sw:pgm-out` เครื่องสลับภาพ ATEM Television Studio HD8 ISO SDI OUT · PROGRAM | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `embed` | `embed:sdi-in` ตัวฝังเสียง AJA 3G-AMA 3G-SDI IN (BNC) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-l` มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | `lead-13` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `embed` | `embed:audio-l` ตัวฝังเสียง AJA 3G-AMA BREAKOUT XLR IN 1 (DB-25) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-r` มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | `lead-14` (`AUD-XLR-LINE-BAL`, XLR-F → XLR-M) | `embed` | `embed:audio-r` ตัวฝังเสียง AJA 3G-AMA BREAKOUT XLR IN 2 (DB-25) | ผู้เล่นต้องต่อ |
| `embed` | `embed:sdi-out` ตัวฝังเสียง AJA 3G-AMA 3G-SDI OUT (BNC) · ฝังเสียงแล้ว | `lead-15` (`VID-SDI-3G`, SDI → SDI) | `enc` | `enc:sdi-in` ตัวเข้ารหัส Streaming Encoder HD SDI IN | ผู้เล่นต้องต่อ |
| `enc` | `enc:eth` ตัวเข้ารหัส Streaming Encoder HD ETHERNET (stream) | `lead-16` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net` | `net:lan-1` เกตเวย์เครือข่ายสายหลัก LAN 1 | ผู้เล่นต้องต่อ |
| `net` | `net:wan` เกตเวย์เครือข่ายสายหลัก WAN | `lead-17` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan` | `wan:wan-in` จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-XLR-LINE-BAL` ×2<br>`AUD-XLR-MIC` ×2<br>`FIB-SDI-LINK` ×1<br>`NET-CAT5E6-ENCODER` ×1<br>`NET-ROUTER-UPLINK` ×1<br>`VID-SDI-3G` ×7

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `cam2` | `power` | true |
| `cam3` | `power` | true |
| `fiberTx` | `power` | true |
| `fiberRx` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `embed` | `power` | true |
| `enc` | `power` | true |
| `net` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `sw` | `pgm` | SDI 1 |
| `sw` | `emb-audio` | OFF |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `mix` | `ch2-phantom` | true |
| `shotgun` | `windscreen` | true |
| `amb` | `windscreen` | true |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `embed` | `embed` | true |
| `enc` | `format` | 1080p50 |
| `enc` | `stream-key` | •••• (private test) |
| `enc` | `stream` | true |
| `net` | `wan-link` | Up |
| `net` | `uplink-test` | true |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `ramp` | true |
| `site` | `shelter` | true |
| `site` | `soundcheck` | true |
| `site` | `power-signoff` | true |
| `site` | `decision` | GO |

คิวสลับภาพ: ออกภาพกล้อง A → CAM A; ออกภาพกล้อง B → CAM B; ออกภาพกล้อง C → CAM C

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): `s-embed` การฝังเสียงรายการถูกปิดระหว่างซ้อม; `s-fiber-rx-power` ตัวรับใยแก้วของกล้องไกลไม่มีไฟเลี้ยง; `s-audio-bus` บัสเสียงออกอากาศถูกลดระดับ; `s-camera-framing` กล้องใกล้ยังไม่ได้จัดกรอบตามใบงาน

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-ramp` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-shelter` [physical, สำคัญ] ตรวจความพร้อม: ป้องกันสภาพอากาศ
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-power-signoff` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `safe` [physical, สำคัญ] ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย
- `mv` [signal, สำคัญ] จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง
- `input-1` [signal, สำคัญ] ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด
- `input-2` [signal, สำคัญ] ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด
- `input-3` [signal, สำคัญ] ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `embed` [signal, สำคัญ] มีภาพรายการและเสียงครบเข้าสู่ตัวเข้ารหัส
- `ingest` [delivery, สำคัญ] ผู้ชมจำลองได้รับภาพและเสียงรายการ
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `recovered` [delivery, สำคัญ] วินิจฉัยและแก้ปัญหาที่เกิดในงาน
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## SP-01 — รับกล้องสนามผ่านฐานและเราเตอร์

ห้อง: ถ่ายทอดกีฬา · ใบงาน: SP-01 · ต่อสายไฟเบอร์จาก Camera Fiber Converter ท้ายกล้อง 1 เข้า Studio Fiber Converter แล้ว Patch ผ่านเราเตอร์ไปเครื่องสลับภาพ · กราฟ: `appendix-a-xl-1-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` |
| `cfc1` | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` |
| `ccu1` | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` |
| `router` | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` |
| `sw` | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` |
| `monitor` | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องสนาม 1 · URSA Broadcast G2 12G-SDI OUT | `lead-1` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc1` | `cfc1:sdi-in` Camera Fiber Converter 1 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc1` | `cfc1:fiber` Camera Fiber Converter 1 SMPTE 304 FIBER (MALE) | `lead-2` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu1` | `ccu1:fiber` Studio Fiber Converter 1 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu1` | `ccu1:sdi-out` Studio Fiber Converter 1 12G SDI OUT 1 | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-1` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 1 | ผู้เล่นต้องต่อ |
| `router` | `router:out-1` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 1 | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 1 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K MULTIVIEW 1 (12G-SDI) | `lead-5` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพ · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `FIB-CAMERA-CCU` ×1<br>`VID-SDI-3G` ×3<br>`VID-SDI-6G-12G` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `ccu1` | `power` | true |
| `router` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `router` | `xp-1` | IN 1 |
| `sw` | `pgm` | SDI 1 |
| `sw` | `sdi-out-1` | PROGRAM |
| `sw` | `sdi-out-2` | PROGRAM |
| `sw` | `sdi-out-3` | PROGRAM |
| `sw` | `sdi-out-4` | AUX |
| `sw` | `aux` | PROGRAM |
| `sw` | `emb-audio` | OFF |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `cam-1` [signal, สำคัญ] ภาพกล้อง 1 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `mv` [signal, สำคัญ] จอรวมภาพเห็นกล้องสนาม 1
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## SP-02 — เสียงผู้บรรยายและเสียงสนาม

ห้อง: ถ่ายทอดกีฬา · ใบงาน: SP-02 · ติดตั้งไมค์หกแหล่งผ่านมัลติคอร์ และแยกเสียง PA กับเสียงรายการ · กราฟ: `appendix-a-xl-2-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `mic1` | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` |
| `mic2` | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` |
| `crowdL` | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` |
| `crowdR` | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` |
| `field` | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` |
| `lav` | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` |
| `stagebox` | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` |
| `tail` | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` |
| `mix` | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` |
| `pa` | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` |
| `sw` | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `mic1` | `mic1:xlr-out` ไมค์ผู้บรรยาย 1 SM58 XLR OUT | `lead-1` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` กล่องรับไมค์สนาม MIC IN 1 | ผู้เล่นต้องต่อ |
| `mic2` | `mic2:xlr-out` ไมค์ผู้บรรยาย 2 SM58 XLR OUT | `lead-2` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-2` กล่องรับไมค์สนาม MIC IN 2 | ผู้เล่นต้องต่อ |
| `crowdL` | `crowdL:xlr-out` ไมค์บรรยากาศซ้าย XLR OUT | `lead-3` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-3` กล่องรับไมค์สนาม MIC IN 3 | ผู้เล่นต้องต่อ |
| `crowdR` | `crowdR:xlr-out` ไมค์บรรยากาศขวา XLR OUT | `lead-4` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-4` กล่องรับไมค์สนาม MIC IN 4 | ผู้เล่นต้องต่อ |
| `field` | `field:xlr-out` ไมค์ภาคสนาม XLR OUT | `lead-5` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-5` กล่องรับไมค์สนาม MIC IN 5 | ผู้เล่นต้องต่อ |
| `lav` | `lav:out` ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | `lead-6` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์สนาม MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไมค์สนาม AUDIO OUT (XLR) | `lead-7` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-6` กล่องรับไมค์สนาม MIC IN 6 | ผู้เล่นต้องต่อ |
| `stagebox` | `stagebox:multicore` กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | `lead-8` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-1` หางสายเสียงที่คอนโซล TAIL 1 | `lead-9` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-2` หางสายเสียงที่คอนโซล TAIL 2 | `lead-10` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-3` หางสายเสียงที่คอนโซล TAIL 3 | `lead-11` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-4` หางสายเสียงที่คอนโซล TAIL 4 | `lead-12` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-4` คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-5` หางสายเสียงที่คอนโซล TAIL 5 | `lead-13` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-5` คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-6` หางสายเสียงที่คอนโซล TAIL 6 | `lead-14` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-6` คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | `lead-15` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ระบบ PA สนาม LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-l` คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | `lead-16` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 1 · balanced 1/4" TRS | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-r` คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | `lead-17` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 2 · balanced 1/4" TRS | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-XLR-MIC` ×11<br>`AUD-XLR-TRS-BAL` ×2<br>`STG-MULTICORE` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `sw` | `power` | true |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `ch4-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch4-on` | true |
| `mix` | `ch4-pa` | true |
| `mix` | `ch4-bc` | true |
| `mix` | `ch5-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch5-on` | true |
| `mix` | `ch5-pa` | true |
| `mix` | `ch5-bc` | true |
| `mix` | `ch6-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch6-on` | true |
| `mix` | `ch6-pa` | true |
| `mix` | `ch6-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `crowdL` | `windscreen` | true |
| `crowdR` | `windscreen` | true |
| `sw` | `xlr-on` | true |
| `sw` | `emb-audio` | OFF |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `site` | `power-check` | true |
| `site` | `soundcheck` | true |
| `site` | `cable-route` | true |

คิวสลับภาพ: ไม่มีคิวบังคับ

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `audio-sw` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## SP-03 — หกกล้อง ภาพซ้ำ และกราฟิก

ห้อง: ถ่ายทอดกีฬา · ใบงาน: SP-03 · Patch แหล่งภาพแปดแหล่งผ่านเราเตอร์ แล้วควบคุม Preview / Program / Multiview · กราฟ: `appendix-a-xl-3-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` |
| `cfc1` | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` |
| `ccu1` | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` |
| `cam2` | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` |
| `cfc2` | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` |
| `ccu2` | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` |
| `cam3` | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` |
| `cfc3` | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` |
| `ccu3` | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` |
| `cam4` | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` |
| `cfc4` | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` |
| `ccu4` | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` |
| `cam5` | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` |
| `cfc5` | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` |
| `ccu5` | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` |
| `cam6` | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` |
| `cfc6` | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` |
| `ccu6` | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` |
| `router` | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` |
| `sw` | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` |
| `monitor` | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` |
| `play` | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` |
| `controller` | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` |
| `gfx` | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` |
| `convHS` | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องสนาม 1 · URSA Broadcast G2 12G-SDI OUT | `lead-1` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc1` | `cfc1:sdi-in` Camera Fiber Converter 1 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc1` | `cfc1:fiber` Camera Fiber Converter 1 SMPTE 304 FIBER (MALE) | `lead-2` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu1` | `ccu1:fiber` Studio Fiber Converter 1 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu1` | `ccu1:sdi-out` Studio Fiber Converter 1 12G SDI OUT 1 | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-1` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 1 | ผู้เล่นต้องต่อ |
| `router` | `router:out-1` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 1 | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้องสนาม 2 · URSA Broadcast G2 12G-SDI OUT | `lead-5` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc2` | `cfc2:sdi-in` Camera Fiber Converter 2 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc2` | `cfc2:fiber` Camera Fiber Converter 2 SMPTE 304 FIBER (MALE) | `lead-6` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu2` | `ccu2:fiber` Studio Fiber Converter 2 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu2` | `ccu2:sdi-out` Studio Fiber Converter 2 12G SDI OUT 1 | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-2` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 2 | ผู้เล่นต้องต่อ |
| `router` | `router:out-2` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 2 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้องสนาม 3 · URSA Broadcast G2 12G-SDI OUT | `lead-9` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc3` | `cfc3:sdi-in` Camera Fiber Converter 3 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc3` | `cfc3:fiber` Camera Fiber Converter 3 SMPTE 304 FIBER (MALE) | `lead-10` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu3` | `ccu3:fiber` Studio Fiber Converter 3 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu3` | `ccu3:sdi-out` Studio Fiber Converter 3 12G SDI OUT 1 | `lead-11` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-3` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 3 | ผู้เล่นต้องต่อ |
| `router` | `router:out-3` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 3 | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 3 | ผู้เล่นต้องต่อ |
| `cam4` | `cam4:sdi-out` กล้องสนาม 4 · URSA Broadcast G2 12G-SDI OUT | `lead-13` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc4` | `cfc4:sdi-in` Camera Fiber Converter 4 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc4` | `cfc4:fiber` Camera Fiber Converter 4 SMPTE 304 FIBER (MALE) | `lead-14` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu4` | `ccu4:fiber` Studio Fiber Converter 4 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu4` | `ccu4:sdi-out` Studio Fiber Converter 4 12G SDI OUT 1 | `lead-15` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-4` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 4 | ผู้เล่นต้องต่อ |
| `router` | `router:out-4` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 4 | `lead-16` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 4 | ผู้เล่นต้องต่อ |
| `cam5` | `cam5:sdi-out` กล้องสนาม 5 · URSA Broadcast G2 12G-SDI OUT | `lead-17` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc5` | `cfc5:sdi-in` Camera Fiber Converter 5 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc5` | `cfc5:fiber` Camera Fiber Converter 5 SMPTE 304 FIBER (MALE) | `lead-18` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu5` | `ccu5:fiber` Studio Fiber Converter 5 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu5` | `ccu5:sdi-out` Studio Fiber Converter 5 12G SDI OUT 1 | `lead-19` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-5` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 5 | ผู้เล่นต้องต่อ |
| `router` | `router:out-5` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 5 | `lead-20` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 5 | ผู้เล่นต้องต่อ |
| `cam6` | `cam6:sdi-out` กล้องสนาม 6 · URSA Broadcast G2 12G-SDI OUT | `lead-21` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc6` | `cfc6:sdi-in` Camera Fiber Converter 6 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc6` | `cfc6:fiber` Camera Fiber Converter 6 SMPTE 304 FIBER (MALE) | `lead-22` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu6` | `ccu6:fiber` Studio Fiber Converter 6 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu6` | `ccu6:sdi-out` Studio Fiber Converter 6 12G SDI OUT 1 | `lead-23` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-6` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 6 | ผู้เล่นต้องต่อ |
| `router` | `router:out-6` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 6 | `lead-24` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-6` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 6 | ผู้เล่นต้องต่อ |
| `controller` | `controller:control-out` แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | `lead-25` (`CTRL-REPLAY`, CONTROL → CONTROL) | `play` | `play:control-in` เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | ลิงก์จำลอง ไม่ต้องแพ็ก |
| `play` | `play:sdi-out` เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | `lead-26` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-7` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 7 | ผู้เล่นต้องต่อ |
| `gfx` | `gfx:hdmi-out` คอมพิวเตอร์กราฟิก HDMI OUT | `lead-27` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ผู้เล่นต้องต่อ |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-28` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-8` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 8 | ผู้เล่นต้องต่อ |
| `router` | `router:out-7` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 7 | `lead-29` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-7` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 7 | ผู้เล่นต้องต่อ |
| `router` | `router:out-8` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 8 | `lead-30` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-8` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 8 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K MULTIVIEW 1 (12G-SDI) | `lead-31` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพ · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `FIB-CAMERA-CCU` ×6<br>`VID-HDMI-A-A` ×1<br>`VID-SDI-3G` ×17<br>`VID-SDI-6G-12G` ×6

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `ccu1` | `power` | true |
| `cam2` | `power` | true |
| `ccu2` | `power` | true |
| `cam3` | `power` | true |
| `ccu3` | `power` | true |
| `cam4` | `power` | true |
| `ccu4` | `power` | true |
| `cam5` | `power` | true |
| `ccu5` | `power` | true |
| `cam6` | `power` | true |
| `ccu6` | `power` | true |
| `router` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `play` | `power` | true |
| `controller` | `power` | true |
| `gfx` | `power` | true |
| `convHS` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `cam4` | `framing` | Framed for assignment |
| `cam5` | `framing` | Framed for assignment |
| `cam6` | `framing` | Framed for assignment |
| `router` | `xp-1` | IN 1 |
| `router` | `xp-2` | IN 2 |
| `router` | `xp-3` | IN 3 |
| `router` | `xp-4` | IN 4 |
| `router` | `xp-5` | IN 5 |
| `router` | `xp-6` | IN 6 |
| `sw` | `pgm` | SDI 1 |
| `sw` | `sdi-out-1` | PROGRAM |
| `sw` | `sdi-out-2` | PROGRAM |
| `sw` | `sdi-out-3` | PROGRAM |
| `sw` | `sdi-out-4` | AUX |
| `sw` | `aux` | PROGRAM |
| `sw` | `emb-audio` | OFF |
| `router` | `xp-7` | IN 7 |
| `router` | `xp-8` | IN 8 |
| `controller` | `cue` | true |
| `play` | `clip` | true |
| `play` | `play` | true |
| `gfx` | `template` | Scoreboard template (licensed) |
| `gfx` | `score` | 0–0 |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |

คิวสลับภาพ: เตรียมและออกภาพกล้อง 1 → CAM 1; เตรียมและออกภาพกล้อง 2 → CAM 2; เตรียมและออกภาพกล้อง 3 → CAM 3; เตรียมและออกภาพกล้อง 4 → CAM 4; เตรียมและออกภาพกล้อง 5 → CAM 5; เตรียมและออกภาพกล้อง 6 → CAM 6; ออกภาพซ้ำจากแผงควบคุม → REPLAY; ออกกราฟิกคะแนน → SCOREBOARD

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `cam-1` [signal, สำคัญ] ภาพกล้อง 1 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-2` [signal, สำคัญ] ภาพกล้อง 2 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-3` [signal, สำคัญ] ภาพกล้อง 3 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-4` [signal, สำคัญ] ภาพกล้อง 4 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-5` [signal, สำคัญ] ภาพกล้อง 5 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-6` [signal, สำคัญ] ภาพกล้อง 6 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `replay` [signal, สำคัญ] ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7
- `gfx` [signal, สำคัญ] กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8
- `mv` [signal, สำคัญ] จอรวมภาพเห็นทั้งหกกล้อง
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## SP-04 — ซ่อมเส้นทางภาพเสียงและชุดส่งสำรอง

ห้อง: ถ่ายทอดกีฬา · ใบงาน: SP-04 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก · กราฟ: `appendix-a-xl-4-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` |
| `cfc1` | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` |
| `ccu1` | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` |
| `cam2` | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` |
| `cfc2` | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` |
| `ccu2` | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` |
| `cam3` | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` |
| `cfc3` | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` |
| `ccu3` | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` |
| `cam4` | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` |
| `cfc4` | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` |
| `ccu4` | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` |
| `cam5` | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` |
| `cfc5` | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` |
| `ccu5` | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` |
| `cam6` | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` |
| `cfc6` | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` |
| `ccu6` | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` |
| `router` | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` |
| `sw` | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` |
| `monitor` | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` |
| `mic1` | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` |
| `mic2` | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` |
| `crowdL` | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` |
| `crowdR` | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` |
| `field` | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` |
| `lav` | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` |
| `stagebox` | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` |
| `tail` | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` |
| `mix` | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` |
| `pa` | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` |
| `play` | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` |
| `controller` | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` |
| `gfx` | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` |
| `convHS` | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |
| `enc` | ตัวเข้ารหัสหลัก · Streaming Encoder HD (XL-ENC-MAIN) | `bmd-streaming-encoder-hd` |
| `enc2` | ตัวเข้ารหัสสำรอง · Streaming Encoder HD (XL-ENC-BACKUP) | `bmd-streaming-encoder-hd` |
| `net` | เกตเวย์ / WAN ที่ตรวจสอบแล้ว (SP-NET) | `generic-gateway` |
| `net2` | เครือข่ายสำรอง (XL-NET-2) | `generic-gateway` |
| `wan` | จุดรับสตรีมทดสอบส่วนตัว (WAN) (SP-WAN) | `generic-test-ingest` |
| `wan2` | จุดรับสตรีมสำรอง (XL-WAN-2) | `generic-test-ingest` |
| `rec` | เครื่องบันทึก HyperDeck Studio HD Plus (XL-REC) | `bmd-hyperdeck-studio-hd-plus` |
| `display` | ตัวรับภาพจอสนาม (XL-DISPLAY) | `generic-sdi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องสนาม 1 · URSA Broadcast G2 12G-SDI OUT | `lead-1` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc1` | `cfc1:sdi-in` Camera Fiber Converter 1 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc1` | `cfc1:fiber` Camera Fiber Converter 1 SMPTE 304 FIBER (MALE) | `lead-2` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu1` | `ccu1:fiber` Studio Fiber Converter 1 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu1` | `ccu1:sdi-out` Studio Fiber Converter 1 12G SDI OUT 1 | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-1` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-1` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 1 | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam2` | `cam2:sdi-out` กล้องสนาม 2 · URSA Broadcast G2 12G-SDI OUT | `lead-5` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc2` | `cfc2:sdi-in` Camera Fiber Converter 2 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc2` | `cfc2:fiber` Camera Fiber Converter 2 SMPTE 304 FIBER (MALE) | `lead-6` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu2` | `ccu2:fiber` Studio Fiber Converter 2 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu2` | `ccu2:sdi-out` Studio Fiber Converter 2 12G SDI OUT 1 | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-2` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 2 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-2` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 2 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 2 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam3` | `cam3:sdi-out` กล้องสนาม 3 · URSA Broadcast G2 12G-SDI OUT | `lead-9` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc3` | `cfc3:sdi-in` Camera Fiber Converter 3 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc3` | `cfc3:fiber` Camera Fiber Converter 3 SMPTE 304 FIBER (MALE) | `lead-10` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu3` | `ccu3:fiber` Studio Fiber Converter 3 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu3` | `ccu3:sdi-out` Studio Fiber Converter 3 12G SDI OUT 1 | `lead-11` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-3` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 3 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-3` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 3 | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 3 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam4` | `cam4:sdi-out` กล้องสนาม 4 · URSA Broadcast G2 12G-SDI OUT | `lead-13` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc4` | `cfc4:sdi-in` Camera Fiber Converter 4 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc4` | `cfc4:fiber` Camera Fiber Converter 4 SMPTE 304 FIBER (MALE) | `lead-14` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu4` | `ccu4:fiber` Studio Fiber Converter 4 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu4` | `ccu4:sdi-out` Studio Fiber Converter 4 12G SDI OUT 1 | `lead-15` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-4` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 4 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-4` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 4 | `lead-16` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 4 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam5` | `cam5:sdi-out` กล้องสนาม 5 · URSA Broadcast G2 12G-SDI OUT | `lead-17` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc5` | `cfc5:sdi-in` Camera Fiber Converter 5 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc5` | `cfc5:fiber` Camera Fiber Converter 5 SMPTE 304 FIBER (MALE) | `lead-18` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu5` | `ccu5:fiber` Studio Fiber Converter 5 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu5` | `ccu5:sdi-out` Studio Fiber Converter 5 12G SDI OUT 1 | `lead-19` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-5` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 5 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-5` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 5 | `lead-20` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 5 | ต่อไว้ในฉาก (อาจมี fault) |
| `cam6` | `cam6:sdi-out` กล้องสนาม 6 · URSA Broadcast G2 12G-SDI OUT | `lead-21` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc6` | `cfc6:sdi-in` Camera Fiber Converter 6 12G SDI IN · CAMERA FEED | ต่อไว้ในฉาก (อาจมี fault) |
| `cfc6` | `cfc6:fiber` Camera Fiber Converter 6 SMPTE 304 FIBER (MALE) | `lead-22` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu6` | `ccu6:fiber` Studio Fiber Converter 6 SMPTE 304 FIBER (FEMALE) | ต่อไว้ในฉาก (อาจมี fault) |
| `ccu6` | `ccu6:sdi-out` Studio Fiber Converter 6 12G SDI OUT 1 | `lead-23` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-6` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 6 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-6` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 6 | `lead-24` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-6` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 6 | ต่อไว้ในฉาก (อาจมี fault) |
| `controller` | `controller:control-out` แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | `lead-25` (`CTRL-REPLAY`, CONTROL → CONTROL) | `play` | `play:control-in` เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | ต่อไว้ในฉาก (อาจมี fault) |
| `play` | `play:sdi-out` เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | `lead-26` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-7` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 7 | ต่อไว้ในฉาก (อาจมี fault) |
| `gfx` | `gfx:hdmi-out` คอมพิวเตอร์กราฟิก HDMI OUT | `lead-27` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-28` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-8` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 8 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-7` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 7 | `lead-29` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-7` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 7 | ต่อไว้ในฉาก (อาจมี fault) |
| `router` | `router:out-8` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 8 | `lead-30` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-8` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 8 | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K MULTIVIEW 1 (12G-SDI) | `lead-31` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพ · SmartView Duo SDI IN (จอ A) | ต่อไว้ในฉาก (อาจมี fault) |
| `mic1` | `mic1:xlr-out` ไมค์ผู้บรรยาย 1 SM58 XLR OUT | `lead-32` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` กล่องรับไมค์สนาม MIC IN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `mic2` | `mic2:xlr-out` ไมค์ผู้บรรยาย 2 SM58 XLR OUT | `lead-33` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-2` กล่องรับไมค์สนาม MIC IN 2 | ต่อไว้ในฉาก (อาจมี fault) |
| `crowdL` | `crowdL:xlr-out` ไมค์บรรยากาศซ้าย XLR OUT | `lead-34` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-3` กล่องรับไมค์สนาม MIC IN 3 | ต่อไว้ในฉาก (อาจมี fault) |
| `crowdR` | `crowdR:xlr-out` ไมค์บรรยากาศขวา XLR OUT | `lead-35` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-4` กล่องรับไมค์สนาม MIC IN 4 | ต่อไว้ในฉาก (อาจมี fault) |
| `field` | `field:xlr-out` ไมค์ภาคสนาม XLR OUT | `lead-36` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-5` กล่องรับไมค์สนาม MIC IN 5 | ต่อไว้ในฉาก (อาจมี fault) |
| `lav` | `lav:out` ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | `lead-37` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์สนาม MIC IN (3.5 mm) | ต่อไว้ในฉาก (อาจมี fault) |
| `rx` | `rx:audio-out` ตัวรับไมค์สนาม AUDIO OUT (XLR) | `lead-38` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-6` กล่องรับไมค์สนาม MIC IN 6 | ต่อไว้ในฉาก (อาจมี fault) |
| `stagebox` | `stagebox:multicore` กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | `lead-39` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-1` หางสายเสียงที่คอนโซล TAIL 1 | `lead-40` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-2` หางสายเสียงที่คอนโซล TAIL 2 | `lead-41` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-3` หางสายเสียงที่คอนโซล TAIL 3 | `lead-42` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-4` หางสายเสียงที่คอนโซล TAIL 4 | `lead-43` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-4` คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-5` หางสายเสียงที่คอนโซล TAIL 5 | `lead-44` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-5` คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `tail` | `tail:tail-6` หางสายเสียงที่คอนโซล TAIL 6 | `lead-45` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-6` คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:pa-l` คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | `lead-46` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ระบบ PA สนาม LINE IN (XLR/TRS) | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-l` คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | `lead-47` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 1 · balanced 1/4" TRS | ต่อไว้ในฉาก (อาจมี fault) |
| `mix` | `mix:bc-r` คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | `lead-48` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 2 · balanced 1/4" TRS | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:sdi-out-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 1 | `lead-49` (`VID-SDI-3G`, SDI → SDI) | `enc` | `enc:sdi-in` ตัวเข้ารหัสหลัก · Streaming Encoder HD SDI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:sdi-out-2` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 2 | `lead-50` (`VID-SDI-3G`, SDI → SDI) | `enc2` | `enc2:sdi-in` ตัวเข้ารหัสสำรอง · Streaming Encoder HD SDI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:sdi-out-3` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 3 | `lead-51` (`VID-SDI-3G`, SDI → SDI) | `rec` | `rec:sdi-in` เครื่องบันทึก HyperDeck Studio HD Plus SDI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `sw` | `sw:sdi-out-4` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 4 | `lead-52` (`VID-SDI-3G`, SDI → SDI) | `display` | `display:sdi-in` ตัวรับภาพจอสนาม SDI IN | ต่อไว้ในฉาก (อาจมี fault) |
| `enc` | `enc:eth` ตัวเข้ารหัสหลัก · Streaming Encoder HD ETHERNET (stream) | `lead-53` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net` | `net:lan-1` เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `net` | `net:wan` เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | `lead-54` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan` | `wan:wan-in` จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ต่อไว้ในฉาก (อาจมี fault) |
| `enc2` | `enc2:eth` ตัวเข้ารหัสสำรอง · Streaming Encoder HD ETHERNET (stream) | `lead-55` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net2` | `net2:lan-1` เครือข่ายสำรอง LAN 1 | ต่อไว้ในฉาก (อาจมี fault) |
| `net2` | `net2:wan` เครือข่ายสำรอง WAN | `lead-56` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan2` | `wan2:wan-in` จุดรับสตรีมสำรอง UPLINK IN | ต่อไว้ในฉาก (อาจมี fault) |

กระเป๋าสายกายภาพที่ต้องเลือก: `VID-SDI-3G` ×1

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `ccu1` | `power` | true |
| `cam2` | `power` | true |
| `ccu2` | `power` | true |
| `cam3` | `power` | true |
| `ccu3` | `power` | true |
| `cam4` | `power` | true |
| `ccu4` | `power` | true |
| `cam5` | `power` | true |
| `ccu5` | `power` | true |
| `cam6` | `power` | true |
| `ccu6` | `power` | true |
| `router` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `play` | `power` | true |
| `controller` | `power` | true |
| `gfx` | `power` | true |
| `convHS` | `power` | true |
| `enc` | `power` | true |
| `enc2` | `power` | true |
| `net` | `power` | true |
| `net2` | `power` | true |
| `rec` | `power` | true |
| `display` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `cam4` | `framing` | Framed for assignment |
| `cam5` | `framing` | Framed for assignment |
| `cam6` | `framing` | Framed for assignment |
| `router` | `xp-1` | IN 1 |
| `router` | `xp-2` | IN 2 |
| `router` | `xp-3` | IN 3 |
| `router` | `xp-4` | IN 4 |
| `router` | `xp-5` | IN 5 |
| `router` | `xp-6` | IN 6 |
| `sw` | `pgm` | SDI 1 |
| `sw` | `sdi-out-1` | PROGRAM |
| `sw` | `sdi-out-2` | PROGRAM |
| `sw` | `sdi-out-3` | PROGRAM |
| `sw` | `sdi-out-4` | AUX |
| `sw` | `aux` | PROGRAM |
| `sw` | `emb-audio` | OFF |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `ch4-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch4-on` | true |
| `mix` | `ch4-pa` | true |
| `mix` | `ch4-bc` | true |
| `mix` | `ch5-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch5-on` | true |
| `mix` | `ch5-pa` | true |
| `mix` | `ch5-bc` | true |
| `mix` | `ch6-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch6-on` | true |
| `mix` | `ch6-pa` | true |
| `mix` | `ch6-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `crowdL` | `windscreen` | true |
| `crowdR` | `windscreen` | true |
| `sw` | `xlr-on` | true |
| `sw` | `emb-audio` | OFF |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `router` | `xp-7` | IN 7 |
| `router` | `xp-8` | IN 8 |
| `controller` | `cue` | true |
| `play` | `clip` | true |
| `play` | `play` | true |
| `gfx` | `template` | Scoreboard template (licensed) |
| `gfx` | `score` | 0–0 |
| `enc` | `format` | 1080p50 |
| `enc` | `stream-key` | •••• (private test) |
| `enc` | `stream` | true |
| `enc2` | `format` | 1080p50 |
| `enc2` | `stream-key` | •••• (private test) |
| `enc2` | `stream` | true |
| `rec` | `media` | SD card mounted (512 GB free) |
| `rec` | `record` | true |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `storage` | true |
| `site` | `sightlines` | true |

คิวสลับภาพ: เตรียมและออกภาพกล้อง 1 → CAM 1; เตรียมและออกภาพกล้อง 2 → CAM 2; เตรียมและออกภาพกล้อง 3 → CAM 3; เตรียมและออกภาพกล้อง 4 → CAM 4; เตรียมและออกภาพกล้อง 5 → CAM 5; เตรียมและออกภาพกล้อง 6 → CAM 6; ออกภาพซ้ำจากแผงควบคุม → REPLAY; ออกกราฟิกคะแนน → SCOREBOARD

### Fault และการซ่อม

- `f-crosspoint` Crosspoint ของกล้อง 1 เลือกแหล่งผิด; ตั้งค่าผิด: router.xp-1 = IN 2
- `f-physical-link` สายจากระบบกล้องเข้าฝ่ายควบคุมหลุด; สายหลุด: sw:sdi-out-2 → enc2:sdi-in

Surprise fault หลังซ้อม (ถ้ามี): ไม่มี

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-storage` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-sightlines` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `cam-1` [signal, สำคัญ] ภาพกล้อง 1 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-2` [signal, สำคัญ] ภาพกล้อง 2 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-3` [signal, สำคัญ] ภาพกล้อง 3 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-4` [signal, สำคัญ] ภาพกล้อง 4 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-5` [signal, สำคัญ] ภาพกล้อง 5 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-6` [signal, สำคัญ] ภาพกล้อง 6 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `replay` [signal, สำคัญ] ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7
- `gfx` [signal, สำคัญ] กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `audio-sw` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `venue` [signal, สำคัญ] จอสนามได้รับภาพรายการสะอาดจาก AUX
- `record` [delivery, สำคัญ] เครื่องบันทึกได้รับภาพรายการและกำลังบันทึก
- `main` [delivery, สำคัญ] ผู้ชมรับภาพและเสียงผ่านเครือข่ายหลัก
- `backup` [delivery, สำคัญ] ผู้ชมสำรองรับภาพและเสียงผ่านเครือข่ายสำรอง
- `separate` [delivery, สำคัญ] สองชุดส่งใช้พอร์ตและเกตเวย์คนละเส้นทาง
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `recovered` [delivery, สำคัญ] วินิจฉัยและแก้ปัญหาที่เกิดในงาน
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---

## SP-05 — ถ่ายทอดสนามกีฬาครบระบบ

ห้อง: ถ่ายทอดกีฬา · ใบงาน: SP-05 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก · กราฟ: `appendix-a-xl-5-v1` · สถานะหลักฐาน: DESIGN_REFERENCE

### อุปกรณ์ที่ด่านใช้

| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |
|---|---|---|
| `cam1` | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` |
| `cfc1` | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` |
| `ccu1` | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` |
| `cam2` | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` |
| `cfc2` | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` |
| `ccu2` | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` |
| `cam3` | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` |
| `cfc3` | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` |
| `ccu3` | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` |
| `cam4` | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` |
| `cfc4` | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` |
| `ccu4` | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` |
| `cam5` | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` |
| `cfc5` | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` |
| `ccu5` | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` |
| `cam6` | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` |
| `cfc6` | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` |
| `ccu6` | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` |
| `router` | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` |
| `sw` | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` |
| `monitor` | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` |
| `mic1` | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` |
| `mic2` | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` |
| `crowdL` | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` |
| `crowdR` | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` |
| `field` | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` |
| `lav` | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` |
| `tx` | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` |
| `rx` | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` |
| `stagebox` | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` |
| `tail` | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` |
| `mix` | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` |
| `pa` | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` |
| `play` | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` |
| `controller` | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` |
| `gfx` | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` |
| `convHS` | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` |
| `enc` | ตัวเข้ารหัสหลัก · Streaming Encoder HD (XL-ENC-MAIN) | `bmd-streaming-encoder-hd` |
| `enc2` | ตัวเข้ารหัสสำรอง · Streaming Encoder HD (XL-ENC-BACKUP) | `bmd-streaming-encoder-hd` |
| `net` | เกตเวย์ / WAN ที่ตรวจสอบแล้ว (SP-NET) | `generic-gateway` |
| `net2` | เครือข่ายสำรอง (XL-NET-2) | `generic-gateway` |
| `wan` | จุดรับสตรีมทดสอบส่วนตัว (WAN) (SP-WAN) | `generic-test-ingest` |
| `wan2` | จุดรับสตรีมสำรอง (XL-WAN-2) | `generic-test-ingest` |
| `rec` | เครื่องบันทึก HyperDeck Studio HD Plus (XL-REC) | `bmd-hyperdeck-studio-hd-plus` |
| `display` | ตัวรับภาพจอสนาม (XL-DISPLAY) | `generic-sdi-monitor` |

### เส้นทางสายที่ต้องได้จริง

| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |
|---|---|---|---|---|---|
| `cam1` | `cam1:sdi-out` กล้องสนาม 1 · URSA Broadcast G2 12G-SDI OUT | `lead-1` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc1` | `cfc1:sdi-in` Camera Fiber Converter 1 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc1` | `cfc1:fiber` Camera Fiber Converter 1 SMPTE 304 FIBER (MALE) | `lead-2` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu1` | `ccu1:fiber` Studio Fiber Converter 1 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu1` | `ccu1:sdi-out` Studio Fiber Converter 1 12G SDI OUT 1 | `lead-3` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-1` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 1 | ผู้เล่นต้องต่อ |
| `router` | `router:out-1` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 1 | `lead-4` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 1 | ผู้เล่นต้องต่อ |
| `cam2` | `cam2:sdi-out` กล้องสนาม 2 · URSA Broadcast G2 12G-SDI OUT | `lead-5` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc2` | `cfc2:sdi-in` Camera Fiber Converter 2 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc2` | `cfc2:fiber` Camera Fiber Converter 2 SMPTE 304 FIBER (MALE) | `lead-6` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu2` | `ccu2:fiber` Studio Fiber Converter 2 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu2` | `ccu2:sdi-out` Studio Fiber Converter 2 12G SDI OUT 1 | `lead-7` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-2` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 2 | ผู้เล่นต้องต่อ |
| `router` | `router:out-2` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 2 | `lead-8` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-2` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 2 | ผู้เล่นต้องต่อ |
| `cam3` | `cam3:sdi-out` กล้องสนาม 3 · URSA Broadcast G2 12G-SDI OUT | `lead-9` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc3` | `cfc3:sdi-in` Camera Fiber Converter 3 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc3` | `cfc3:fiber` Camera Fiber Converter 3 SMPTE 304 FIBER (MALE) | `lead-10` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu3` | `ccu3:fiber` Studio Fiber Converter 3 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu3` | `ccu3:sdi-out` Studio Fiber Converter 3 12G SDI OUT 1 | `lead-11` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-3` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 3 | ผู้เล่นต้องต่อ |
| `router` | `router:out-3` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 3 | `lead-12` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-3` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 3 | ผู้เล่นต้องต่อ |
| `cam4` | `cam4:sdi-out` กล้องสนาม 4 · URSA Broadcast G2 12G-SDI OUT | `lead-13` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc4` | `cfc4:sdi-in` Camera Fiber Converter 4 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc4` | `cfc4:fiber` Camera Fiber Converter 4 SMPTE 304 FIBER (MALE) | `lead-14` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu4` | `ccu4:fiber` Studio Fiber Converter 4 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu4` | `ccu4:sdi-out` Studio Fiber Converter 4 12G SDI OUT 1 | `lead-15` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-4` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 4 | ผู้เล่นต้องต่อ |
| `router` | `router:out-4` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 4 | `lead-16` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-4` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 4 | ผู้เล่นต้องต่อ |
| `cam5` | `cam5:sdi-out` กล้องสนาม 5 · URSA Broadcast G2 12G-SDI OUT | `lead-17` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc5` | `cfc5:sdi-in` Camera Fiber Converter 5 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc5` | `cfc5:fiber` Camera Fiber Converter 5 SMPTE 304 FIBER (MALE) | `lead-18` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu5` | `ccu5:fiber` Studio Fiber Converter 5 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu5` | `ccu5:sdi-out` Studio Fiber Converter 5 12G SDI OUT 1 | `lead-19` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-5` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 5 | ผู้เล่นต้องต่อ |
| `router` | `router:out-5` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 5 | `lead-20` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-5` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 5 | ผู้เล่นต้องต่อ |
| `cam6` | `cam6:sdi-out` กล้องสนาม 6 · URSA Broadcast G2 12G-SDI OUT | `lead-21` (`VID-SDI-6G-12G`, SDI → SDI) | `cfc6` | `cfc6:sdi-in` Camera Fiber Converter 6 12G SDI IN · CAMERA FEED | ผู้เล่นต้องต่อ |
| `cfc6` | `cfc6:fiber` Camera Fiber Converter 6 SMPTE 304 FIBER (MALE) | `lead-22` (`FIB-CAMERA-CCU`, FIBER → FIBER) | `ccu6` | `ccu6:fiber` Studio Fiber Converter 6 SMPTE 304 FIBER (FEMALE) | ผู้เล่นต้องต่อ |
| `ccu6` | `ccu6:sdi-out` Studio Fiber Converter 6 12G SDI OUT 1 | `lead-23` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-6` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 6 | ผู้เล่นต้องต่อ |
| `router` | `router:out-6` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 6 | `lead-24` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-6` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 6 | ผู้เล่นต้องต่อ |
| `controller` | `controller:control-out` แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | `lead-25` (`CTRL-REPLAY`, CONTROL → CONTROL) | `play` | `play:control-in` เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | ลิงก์จำลอง ไม่ต้องแพ็ก |
| `play` | `play:sdi-out` เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | `lead-26` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-7` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 7 | ผู้เล่นต้องต่อ |
| `gfx` | `gfx:hdmi-out` คอมพิวเตอร์กราฟิก HDMI OUT | `lead-27` (`VID-HDMI-A-A`, HDMI → HDMI) | `convHS` | `convHS:hdmi-in` Micro Converter HDMI→SDI 3G HDMI IN | ผู้เล่นต้องต่อ |
| `convHS` | `convHS:sdi-out` Micro Converter HDMI→SDI 3G SDI OUT 1 | `lead-28` (`VID-SDI-3G`, SDI → SDI) | `router` | `router:in-8` เราเตอร์ภาพ Videohub 20x20 12G SDI IN 8 | ผู้เล่นต้องต่อ |
| `router` | `router:out-7` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 7 | `lead-29` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-7` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 7 | ผู้เล่นต้องต่อ |
| `router` | `router:out-8` เราเตอร์ภาพ Videohub 20x20 12G SDI OUT 8 | `lead-30` (`VID-SDI-3G`, SDI → SDI) | `sw` | `sw:sdi-in-8` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI IN 8 | ผู้เล่นต้องต่อ |
| `sw` | `sw:mv-out` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K MULTIVIEW 1 (12G-SDI) | `lead-31` (`VID-SDI-3G`, SDI → SDI) | `monitor` | `monitor:sdi-in` จอรวมภาพ · SmartView Duo SDI IN (จอ A) | ผู้เล่นต้องต่อ |
| `mic1` | `mic1:xlr-out` ไมค์ผู้บรรยาย 1 SM58 XLR OUT | `lead-32` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-1` กล่องรับไมค์สนาม MIC IN 1 | ผู้เล่นต้องต่อ |
| `mic2` | `mic2:xlr-out` ไมค์ผู้บรรยาย 2 SM58 XLR OUT | `lead-33` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-2` กล่องรับไมค์สนาม MIC IN 2 | ผู้เล่นต้องต่อ |
| `crowdL` | `crowdL:xlr-out` ไมค์บรรยากาศซ้าย XLR OUT | `lead-34` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-3` กล่องรับไมค์สนาม MIC IN 3 | ผู้เล่นต้องต่อ |
| `crowdR` | `crowdR:xlr-out` ไมค์บรรยากาศขวา XLR OUT | `lead-35` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-4` กล่องรับไมค์สนาม MIC IN 4 | ผู้เล่นต้องต่อ |
| `field` | `field:xlr-out` ไมค์ภาคสนาม XLR OUT | `lead-36` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-5` กล่องรับไมค์สนาม MIC IN 5 | ผู้เล่นต้องต่อ |
| `lav` | `lav:out` ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | `lead-37` (`AUD-LAV-TX`, 3.5mm → 3.5mm) | `tx` | `tx:mic-in` ตัวส่งไมค์สนาม MIC IN (3.5 mm) | ผู้เล่นต้องต่อ |
| `rx` | `rx:audio-out` ตัวรับไมค์สนาม AUDIO OUT (XLR) | `lead-38` (`AUD-RX-MIXER-XLR`, XLR-F → XLR-M) | `stagebox` | `stagebox:mic-in-6` กล่องรับไมค์สนาม MIC IN 6 | ผู้เล่นต้องต่อ |
| `stagebox` | `stagebox:multicore` กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | `lead-39` (`STG-MULTICORE`, MULTICORE → MULTICORE) | `tail` | `tail:multicore` หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-1` หางสายเสียงที่คอนโซล TAIL 1 | `lead-40` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-1` คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-2` หางสายเสียงที่คอนโซล TAIL 2 | `lead-41` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-2` คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-3` หางสายเสียงที่คอนโซล TAIL 3 | `lead-42` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-3` คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-4` หางสายเสียงที่คอนโซล TAIL 4 | `lead-43` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-4` คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-5` หางสายเสียงที่คอนโซล TAIL 5 | `lead-44` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-5` คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `tail` | `tail:tail-6` หางสายเสียงที่คอนโซล TAIL 6 | `lead-45` (`AUD-XLR-MIC`, XLR-F → XLR-M) | `mix` | `mix:in-6` คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | ผู้เล่นต้องต่อ |
| `mix` | `mix:pa-l` คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | `lead-46` (`AUD-PA-ACTIVE`, XLR-F → XLR-M) | `pa` | `pa:line-in` ระบบ PA สนาม LINE IN (XLR/TRS) | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-l` คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | `lead-47` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-l` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 1 · balanced 1/4" TRS | ผู้เล่นต้องต่อ |
| `mix` | `mix:bc-r` คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | `lead-48` (`AUD-XLR-TRS-BAL`, XLR-F → 6.35mm) | `sw` | `sw:xlr-r` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K ANALOG IN 2 · balanced 1/4" TRS | ผู้เล่นต้องต่อ |
| `sw` | `sw:sdi-out-1` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 1 | `lead-49` (`VID-SDI-3G`, SDI → SDI) | `enc` | `enc:sdi-in` ตัวเข้ารหัสหลัก · Streaming Encoder HD SDI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:sdi-out-2` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 2 | `lead-50` (`VID-SDI-3G`, SDI → SDI) | `enc2` | `enc2:sdi-in` ตัวเข้ารหัสสำรอง · Streaming Encoder HD SDI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:sdi-out-3` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 3 | `lead-51` (`VID-SDI-3G`, SDI → SDI) | `rec` | `rec:sdi-in` เครื่องบันทึก HyperDeck Studio HD Plus SDI IN | ผู้เล่นต้องต่อ |
| `sw` | `sw:sdi-out-4` เครื่องสลับภาพ ATEM 2 M/E Constellation 4K 12G-SDI OUT 4 | `lead-52` (`VID-SDI-3G`, SDI → SDI) | `display` | `display:sdi-in` ตัวรับภาพจอสนาม SDI IN | ผู้เล่นต้องต่อ |
| `enc` | `enc:eth` ตัวเข้ารหัสหลัก · Streaming Encoder HD ETHERNET (stream) | `lead-53` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net` | `net:lan-1` เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | ผู้เล่นต้องต่อ |
| `net` | `net:wan` เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | `lead-54` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan` | `wan:wan-in` จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ผู้เล่นต้องต่อ |
| `enc2` | `enc2:eth` ตัวเข้ารหัสสำรอง · Streaming Encoder HD ETHERNET (stream) | `lead-55` (`NET-CAT5E6-ENCODER`, ETHERNET → ETHERNET) | `net2` | `net2:lan-1` เครือข่ายสำรอง LAN 1 | ผู้เล่นต้องต่อ |
| `net2` | `net2:wan` เครือข่ายสำรอง WAN | `lead-56` (`NET-ROUTER-UPLINK`, ETHERNET → ETHERNET) | `wan2` | `wan2:wan-in` จุดรับสตรีมสำรอง UPLINK IN | ผู้เล่นต้องต่อ |

กระเป๋าสายกายภาพที่ต้องเลือก: `AUD-LAV-TX` ×1<br>`AUD-PA-ACTIVE` ×1<br>`AUD-RX-MIXER-XLR` ×1<br>`AUD-XLR-MIC` ×11<br>`AUD-XLR-TRS-BAL` ×2<br>`FIB-CAMERA-CCU` ×6<br>`NET-CAT5E6-ENCODER` ×2<br>`NET-ROUTER-UPLINK` ×2<br>`STG-MULTICORE` ×1<br>`VID-HDMI-A-A` ×1<br>`VID-SDI-3G` ×21<br>`VID-SDI-6G-12G` ×6

### การตั้งค่าและการกระทำ

| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |
|---|---|---|
| `cam1` | `power` | true |
| `ccu1` | `power` | true |
| `cam2` | `power` | true |
| `ccu2` | `power` | true |
| `cam3` | `power` | true |
| `ccu3` | `power` | true |
| `cam4` | `power` | true |
| `ccu4` | `power` | true |
| `cam5` | `power` | true |
| `ccu5` | `power` | true |
| `cam6` | `power` | true |
| `ccu6` | `power` | true |
| `router` | `power` | true |
| `sw` | `power` | true |
| `monitor` | `power` | true |
| `tx` | `power` | true |
| `rx` | `power` | true |
| `mix` | `power` | true |
| `pa` | `power` | true |
| `play` | `power` | true |
| `controller` | `power` | true |
| `gfx` | `power` | true |
| `convHS` | `power` | true |
| `enc` | `power` | true |
| `enc2` | `power` | true |
| `net` | `power` | true |
| `net2` | `power` | true |
| `rec` | `power` | true |
| `display` | `power` | true |
| `cam1` | `framing` | Framed for assignment |
| `cam2` | `framing` | Framed for assignment |
| `cam3` | `framing` | Framed for assignment |
| `cam4` | `framing` | Framed for assignment |
| `cam5` | `framing` | Framed for assignment |
| `cam6` | `framing` | Framed for assignment |
| `router` | `xp-1` | IN 1 |
| `router` | `xp-2` | IN 2 |
| `router` | `xp-3` | IN 3 |
| `router` | `xp-4` | IN 4 |
| `router` | `xp-5` | IN 5 |
| `router` | `xp-6` | IN 6 |
| `sw` | `pgm` | SDI 1 |
| `sw` | `sdi-out-1` | PROGRAM |
| `sw` | `sdi-out-2` | PROGRAM |
| `sw` | `sdi-out-3` | PROGRAM |
| `sw` | `sdi-out-4` | AUX |
| `sw` | `aux` | PROGRAM |
| `sw` | `emb-audio` | OFF |
| `mix` | `ch1-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch1-on` | true |
| `mix` | `ch1-pa` | true |
| `mix` | `ch1-bc` | true |
| `mix` | `ch2-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch2-on` | true |
| `mix` | `ch2-pa` | true |
| `mix` | `ch2-bc` | true |
| `mix` | `ch3-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch3-on` | true |
| `mix` | `ch3-pa` | true |
| `mix` | `ch3-bc` | true |
| `mix` | `ch4-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch4-on` | true |
| `mix` | `ch4-pa` | true |
| `mix` | `ch4-bc` | true |
| `mix` | `ch5-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch5-on` | true |
| `mix` | `ch5-pa` | true |
| `mix` | `ch5-bc` | true |
| `mix` | `ch6-gain` | Nominal (peaks −18 dBFS) |
| `mix` | `ch6-on` | true |
| `mix` | `ch6-pa` | true |
| `mix` | `ch6-bc` | true |
| `mix` | `pa-fader` | Unity |
| `mix` | `bc-fader` | Unity |
| `tx` | `power` | true |
| `tx` | `rf` | CH 1 |
| `rx` | `power` | true |
| `rx` | `rf` | CH 1 |
| `rx` | `pair` | Paired |
| `crowdL` | `windscreen` | true |
| `crowdR` | `windscreen` | true |
| `sw` | `xlr-on` | true |
| `sw` | `emb-audio` | OFF |
| `pa` | `level` | Nominal |
| `pa` | `aim` | In front of the mic, aimed at audience |
| `router` | `xp-7` | IN 7 |
| `router` | `xp-8` | IN 8 |
| `controller` | `cue` | true |
| `play` | `clip` | true |
| `play` | `play` | true |
| `gfx` | `template` | Scoreboard template (licensed) |
| `gfx` | `score` | 0–0 |
| `enc` | `format` | 1080p50 |
| `enc` | `stream-key` | •••• (private test) |
| `enc` | `stream` | true |
| `enc2` | `format` | 1080p50 |
| `enc2` | `stream-key` | •••• (private test) |
| `enc2` | `stream` | true |
| `rec` | `media` | SD card mounted (512 GB free) |
| `rec` | `record` | true |
| `site` | `power-check` | true |
| `site` | `cable-route` | true |
| `site` | `soundcheck` | true |
| `site` | `storage` | true |
| `site` | `sightlines` | true |

คิวสลับภาพ: เตรียมและออกภาพกล้อง 1 → CAM 1; เตรียมและออกภาพกล้อง 2 → CAM 2; เตรียมและออกภาพกล้อง 3 → CAM 3; เตรียมและออกภาพกล้อง 4 → CAM 4; เตรียมและออกภาพกล้อง 5 → CAM 5; เตรียมและออกภาพกล้อง 6 → CAM 6; ออกภาพซ้ำจากแผงควบคุม → REPLAY; ออกกราฟิกคะแนน → SCOREBOARD

### Fault และการซ่อม

- ไม่มี fault เริ่มต้น

Surprise fault หลังซ้อม (ถ้ามี): `s-broadcast` บัสเสียงรายการถูกลดลง; `s-ccu-power` Studio Fiber Converter ของกล้อง 3 ไม่มีไฟเลี้ยง กล้องจึงไม่ได้รับไฟผ่านไฟเบอร์; `s-router-crosspoint` เราเตอร์ส่งกล้องผิดเข้าช่อง 1; `s-replay-control` แผงควบคุมภาพซ้ำยังไม่ส่งคำสั่งเล่น

### เงื่อนไขตรวจรับจริง

- `installed` [physical, สำคัญ] ติดตั้งอุปกรณ์ที่จำเป็นครบจุด
- `powered` [physical, สำคัญ] อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง
- `channel-map` [physical, สำคัญ] สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก
- `pre-power-check` [physical, สำคัญ] ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้
- `pre-cable-route` [physical, สำคัญ] ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง
- `pre-soundcheck` [physical, สำคัญ] ตรวจความพร้อม: ระดับเสียง
- `pre-storage` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `pre-sightlines` [physical, สำคัญ] ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน
- `cam-1` [signal, สำคัญ] ภาพกล้อง 1 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-2` [signal, สำคัญ] ภาพกล้อง 2 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-3` [signal, สำคัญ] ภาพกล้อง 3 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-4` [signal, สำคัญ] ภาพกล้อง 4 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-5` [signal, สำคัญ] ภาพกล้อง 5 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `cam-6` [signal, สำคัญ] ภาพกล้อง 6 ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ
- `replay` [signal, สำคัญ] ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7
- `gfx` [signal, สำคัญ] กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8
- `audio-pa` [signal, สำคัญ] เสียงที่ถูกต้องถึง ระบบ PA
- `audio-sw` [signal, สำคัญ] เสียงที่ถูกต้องถึง ปลายทางรายการ
- `venue` [signal, สำคัญ] จอสนามได้รับภาพรายการสะอาดจาก AUX
- `record` [delivery, สำคัญ] เครื่องบันทึกได้รับภาพรายการและกำลังบันทึก
- `main` [delivery, สำคัญ] ผู้ชมรับภาพและเสียงผ่านเครือข่ายหลัก
- `backup` [delivery, สำคัญ] ผู้ชมสำรองรับภาพและเสียงผ่านเครือข่ายสำรอง
- `separate` [delivery, สำคัญ] สองชุดส่งใช้พอร์ตและเกตเวย์คนละเส้นทาง
- `clean-program` [signal, สำคัญ] เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview
- `framing` [signal] จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย
- `cues` [rehearsal, สำคัญ] สลับภาพออกอากาศตามคิวครบ
- `no-black` [rehearsal, สำคัญ] ไม่มีภาพดำระหว่างซ้อมรายการ
- `recovered` [delivery, สำคัญ] วินิจฉัยและแก้ปัญหาที่เกิดในงาน
- `quiz` [delivery] ตอบคำถามทบทวนก่อนตรวจรับ
- `signoff` [delivery, สำคัญ] ผู้เล่นตรวจรับระบบปัจจุบัน

---
