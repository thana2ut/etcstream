# Equipment inventory — selected training profiles

Current inventory reconciled against original Appendix A and handoff. Not campus ownership, not verified rear-panel replicas. Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md. Counts/ports and selected optional branches are per-stage in `MISSION_25_EQUIPMENT_PORT_CABLE_MATRIX.md` and `MISSION_25_BILL_OF_MATERIALS.json`.

## XS

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| ID | Thai label | Model/profile | Role | Status | Active levels |
| --- | --- | --- | --- | --- | --- |
| cam1 | กล้องห้องเรียน (XS-CAM-01) | generic-hdmi-camera | source | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| sw | เครื่องสลับภาพขนาดเล็ก (XS-SW-01) | generic-mini-switcher | switcher | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| monitor | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | generic-projector | display | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| lav | ไมค์หนีบปกผู้สอน (XS-LAV-01) | generic-lav-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| tx | ตัวส่งไร้สาย TX (XS-TX-01) | generic-wireless-tx | wireless-tx | GENERIC TRAINING MODEL | 2, 4, 5 |
| rx | ตัวรับไร้สาย RX (XS-RX-01) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 2, 4, 5 |
| mix | มิกเซอร์ 4 ช่อง (XS-MIX-01) | generic-4ch-mixer | mixer | GENERIC TRAINING MODEL | 2, 4, 5 |
| pa | ลำโพงแอ็กทีฟหน้าห้อง (XS-PA-01) | generic-active-pa | speaker | GENERIC TRAINING MODEL | 2, 5 |
| slides | โน้ตบุ๊กผู้สอน (XS-LAP-01) | generic-laptop | source | GENERIC TRAINING MODEL | 3, 5 |
| host | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | generic-obs-host | host | GENERIC TRAINING MODEL | 3, 4, 5 |
## S

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| ID | Thai label | Model/profile | Role | Status | Active levels |
| --- | --- | --- | --- | --- | --- |
| cam1 | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | generic-hdmi-camera | source | PROVISIONAL | 1, 3, 4, 5 |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | generic-studio-switcher | switcher | PROVISIONAL | 1, 2, 3, 4, 5 |
| monitor | ทีวีรวมภาพ (Multiview) (S-MV-01) | generic-hdmi-monitor | display | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| lav1 | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | generic-lav-mic | mic | PROVISIONAL | 2, 4, 5 |
| lav2 | ไมค์หนีบปก 2 (แขกรับเชิญ) (S-LAV-02) | generic-lav-mic | mic | PROVISIONAL | 2, 5 |
| tx1 | ตัวส่ง TX 1 (S-TX-01) | generic-wireless-tx | wireless-tx | PROVISIONAL | 2, 4, 5 |
| tx2 | ตัวส่ง TX 2 (S-TX-02) | generic-wireless-tx | wireless-tx | PROVISIONAL | 2, 5 |
| rx1 | ตัวรับ RX ช่อง 1 (S-RX-01) | generic-wireless-rx | wireless-rx | PROVISIONAL | 2, 4, 5 |
| rx2 | ตัวรับ RX ช่อง 2 (S-RX-02) | generic-wireless-rx | wireless-rx | PROVISIONAL | 2, 5 |
| mix | มิกเซอร์เสียง (S-MIX-01) | generic-4ch-mixer | mixer | PROVISIONAL | 2, 4, 5 |
| speaker | Yamaha HS5 ลำโพงมอนิเตอร์ (S-HS5-01) | yamaha-hs5 | speaker | DESIGN_REFERENCE | 2, 5 |
| cam2 | CAM2 มุมสัมภาษณ์ (S-CAM-02) | generic-hdmi-camera | source | PROVISIONAL | 3, 5 |
| cam3 | CAM3 มุมฉากเขียว (S-CAM-03) | generic-hdmi-camera | source | PROVISIONAL | 3, 5 |
| capture | Magewell USB Capture HDMI Gen 2 (S-CAP-01) | magewell-usb-capture-hdmi-gen2 | capture | DESIGN_REFERENCE | 4, 5 |
| host | โน้ตบุ๊ก OBS (จำลอง) (S-OBS-01) | generic-obs-host | host | PROVISIONAL | 4, 5 |
| mic | ไมค์สาย XLR (S-MIC-01) | generic-dynamic-mic | mic | PROVISIONAL | 5 |
## M

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| ID | Thai label | Model/profile | Role | Status | Active levels |
| --- | --- | --- | --- | --- | --- |
| cam1 | กล้อง 1 กลางหลังห้อง (M-CAM-01) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| sw | เครื่องสลับภาพ 3G-SDI (M-SW-01) | generic-sdi-switcher | switcher | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| convSH | Micro Converter SDI→HDMI 3G (M-CONV-SH) | bmd-micro-converter-sdi-hdmi-3g | converter | DESIGN_REFERENCE | 1, 3, 4, 5 |
| display | จอเวที (HDMI) (M-STAGE-01) | generic-hdmi-monitor | display | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| podium | ไมค์โพเดียม (M-MIC-POD) | generic-dynamic-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| stagebox | Stagebox อนาล็อก (M-SBX-01) | reference-stagebox-6 | stagebox | GENERIC TRAINING MODEL | 2, 4, 5 |
| tail | หางสายมัลติคอร์ FOH (M-TAIL-01) | reference-tail-6 | snake-tail | GENERIC TRAINING MODEL | 2, 4, 5 |
| mix | มิกเซอร์ FOH (M-MIX-01) | reference-console-6 | mixer | GENERIC TRAINING MODEL | 2, 4, 5 |
| paL | ลำโพง PA ซ้าย (M-PA-L) | generic-active-pa | speaker | GENERIC TRAINING MODEL | 2, 5 |
| paR | ลำโพง PA ขวา (M-PA-R) | generic-active-pa | speaker | GENERIC TRAINING MODEL | 2, 5 |
| hand1 | ไมค์ไร้สายมือถือ 1 พร้อมตัวส่ง (M-HAND-1) | reference-handheld-tx | wireless-tx | GENERIC TRAINING MODEL | 2, 5 |
| hrx1 | ตัวรับไมค์มือถือ 1 (M-HRX-1) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 2, 5 |
| cam2 | กล้อง 2 ซ้าย (M-CAM-02) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam3 | กล้อง 3 ขวา (M-CAM-03) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ptz | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | generic-sdi-ptz | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| slides | โน้ตบุ๊กนำเสนอ (M-LAP-01) | generic-laptop | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| convHS | Micro Converter HDMI→SDI 3G (M-CONV-HS) | bmd-micro-converter-hdmi-sdi-3g | converter | DESIGN_REFERENCE | 3, 4, 5 |
| monitor | จอ Multiview FOH (SDI) (M-MV-01) | generic-sdi-monitor | display | GENERIC TRAINING MODEL | 3, 4, 5 |
| capture | อุปกรณ์จับภาพ SDI → USB (M-CAP-01) | generic-sdi-usb-capture | capture | GENERIC TRAINING MODEL | 5 |
| host | คอมพิวเตอร์สตรีม OBS (จำลอง) (M-OBS-01) | generic-obs-host | host | GENERIC TRAINING MODEL | 5 |
| rec | HyperDeck Studio HD Plus (M-REC-01) | bmd-hyperdeck-studio-hd-plus | recorder | DESIGN_REFERENCE | 5 |
| hand2 | ไมค์ไร้สายมือถือ 2 พร้อมตัวส่ง (M-HAND-2) | reference-handheld-tx | wireless-tx | GENERIC TRAINING MODEL | 5 |
| hrx2 | ตัวรับไมค์มือถือ 2 (M-HRX-2) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 5 |
| lav1 | ไมค์หนีบปก 1 (M-LAV-1) | generic-lav-mic | mic | GENERIC TRAINING MODEL | 5 |
| lav2 | ไมค์หนีบปก 2 (M-LAV-2) | generic-lav-mic | mic | GENERIC TRAINING MODEL | 5 |
| tx1 | ตัวส่งไมค์หนีบปก 1 (M-TX-1) | generic-wireless-tx | wireless-tx | GENERIC TRAINING MODEL | 5 |
| tx2 | ตัวส่งไมค์หนีบปก 2 (M-TX-2) | generic-wireless-tx | wireless-tx | GENERIC TRAINING MODEL | 5 |
| rx1 | ตัวรับไมค์หนีบปก 1 (M-RX-1) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 5 |
| rx2 | ตัวรับไมค์หนีบปก 2 (M-RX-2) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 5 |
## L

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| ID | Thai label | Model/profile | Role | Status | Active levels |
| --- | --- | --- | --- | --- | --- |
| cam1 | กล้องใกล้ A (L-CAM-A) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| sw | เครื่องสลับภาพภาคสนาม (L-SW) | reference-production-switcher | switcher | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| monitor | จอรวมภาพภาคสนาม (L-MV) | generic-sdi-monitor | display | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| lav | ไมค์หนีบปกพิธีกร (L-LAV) | generic-lav-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| tx | ตัวส่งไมค์พิธีกร (L-TX) | generic-wireless-tx | wireless-tx | GENERIC TRAINING MODEL | 2, 4, 5 |
| rx | ตัวรับไมค์พิธีกร (L-RX) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 2, 4, 5 |
| shotgun | ไมค์ช็อตกัน (L-SHOT) | reference-shotgun | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| amb | ไมค์บรรยากาศ (L-AMB) | generic-ambience-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| mix | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | reference-console-6 | mixer | GENERIC TRAINING MODEL | 2, 4, 5 |
| pa | ลำโพง PA ภาคสนาม (L-PA) | generic-active-pa | speaker | GENERIC TRAINING MODEL | 2, 4, 5 |
| cam2 | กล้องใกล้ B (L-CAM-B) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam3 | กล้องไกล C (L-CAM-C) | generic-sdi-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| fiberTx | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | reference-fiber-tx | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| fiberRx | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | reference-fiber-rx | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| embed | อุปกรณ์ฝังเสียงรายการ SDI (L-EMBED) | reference-audio-embedder | embedder | GENERIC TRAINING MODEL | 4, 5 |
| enc | ตัวเข้ารหัสส่งสตรีมจำลอง (L-ENC) | reference-sdi-encoder | encoder | GENERIC TRAINING MODEL | 4, 5 |
| net | เกตเวย์เครือข่ายสายหลัก (OUT-NET) | generic-gateway | network | GENERIC TRAINING MODEL | 4, 5 |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (OUT-WAN) | generic-test-ingest | ingest | GENERIC TRAINING MODEL | 4, 5 |
## XL

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| ID | Thai label | Model/profile | Role | Status | Active levels |
| --- | --- | --- | --- | --- | --- |
| cam1 | กล้องสนาม 1 (XL-CAM-1) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| ccu1 | ฐานกล้อง CCU 1 (XL-CCU-1) | reference-ccu | converter | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| router | เราเตอร์ภาพ SDI แบบ Crosspoint (XL-ROUTER) | reference-video-router-8 | router | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| sw | เครื่องสลับภาพรายการ (XL-SW) | reference-production-switcher | switcher | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| monitor | จอรวมภาพ (XL-MV) | generic-sdi-monitor | display | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| mic1 | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | shure-sm58 | mic | DESIGN_REFERENCE | 2, 4, 5 |
| mic2 | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | shure-sm58 | mic | DESIGN_REFERENCE | 2, 4, 5 |
| crowdL | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | generic-ambience-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| crowdR | ไมค์บรรยากาศขวา (XL-CROWD-R) | generic-ambience-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| field | ไมค์ภาคสนาม (XL-FIELD) | generic-dynamic-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| lav | ไมค์พิธีกรสนาม (XL-LAV) | generic-lav-mic | mic | GENERIC TRAINING MODEL | 2, 4, 5 |
| tx | ตัวส่งไมค์สนาม (XL-TX) | generic-wireless-tx | wireless-tx | GENERIC TRAINING MODEL | 2, 4, 5 |
| rx | ตัวรับไมค์สนาม (XL-RX) | generic-wireless-rx | wireless-rx | GENERIC TRAINING MODEL | 2, 4, 5 |
| stagebox | กล่องรับไมค์สนาม (XL-STAGE) | reference-stagebox-6 | stagebox | GENERIC TRAINING MODEL | 2, 4, 5 |
| tail | หางสายเสียงที่คอนโซล (XL-TAIL) | reference-tail-6 | snake-tail | GENERIC TRAINING MODEL | 2, 4, 5 |
| mix | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | reference-console-6 | mixer | GENERIC TRAINING MODEL | 2, 4, 5 |
| pa | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | generic-active-pa | speaker | GENERIC TRAINING MODEL | 2, 4, 5 |
| cam2 | กล้องสนาม 2 (XL-CAM-2) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ccu2 | ฐานกล้อง CCU 2 (XL-CCU-2) | reference-ccu | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam3 | กล้องสนาม 3 (XL-CAM-3) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ccu3 | ฐานกล้อง CCU 3 (XL-CCU-3) | reference-ccu | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam4 | กล้องสนาม 4 (XL-CAM-4) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ccu4 | ฐานกล้อง CCU 4 (XL-CCU-4) | reference-ccu | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam5 | กล้องสนาม 5 (XL-CAM-5) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ccu5 | ฐานกล้อง CCU 5 (XL-CCU-5) | reference-ccu | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| cam6 | กล้องสนาม 6 (XL-CAM-6) | reference-fiber-camera | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| ccu6 | ฐานกล้อง CCU 6 (XL-CCU-6) | reference-ccu | converter | GENERIC TRAINING MODEL | 3, 4, 5 |
| play | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | reference-replay | recorder | GENERIC TRAINING MODEL | 3, 4, 5 |
| controller | แผงควบคุมภาพซ้ำ (XL-CTRL) | reference-replay-controller | controller | GENERIC TRAINING MODEL | 3, 4, 5 |
| gfx | คอมพิวเตอร์กราฟิก (SP-GFX) | generic-graphics-pc | source | GENERIC TRAINING MODEL | 3, 4, 5 |
| convHS | Micro Converter HDMI→SDI 3G (SP-CV-HS) | bmd-micro-converter-hdmi-sdi-3g | converter | DESIGN_REFERENCE | 3, 4, 5 |
| enc | ตัวเข้ารหัสหลัก (XL-ENC-MAIN) | reference-sdi-encoder | encoder | GENERIC TRAINING MODEL | 4, 5 |
| enc2 | ตัวเข้ารหัสสำรอง (XL-ENC-BACKUP) | reference-sdi-encoder | encoder | GENERIC TRAINING MODEL | 4, 5 |
| net | เกตเวย์ / WAN ที่ตรวจสอบแล้ว (SP-NET) | generic-gateway | network | GENERIC TRAINING MODEL | 4, 5 |
| net2 | เครือข่ายสำรอง (XL-NET-2) | generic-gateway | network | GENERIC TRAINING MODEL | 4, 5 |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (SP-WAN) | generic-test-ingest | ingest | GENERIC TRAINING MODEL | 4, 5 |
| wan2 | จุดรับสตรีมสำรอง (XL-WAN-2) | generic-test-ingest | ingest | GENERIC TRAINING MODEL | 4, 5 |
| rec | เครื่องบันทึกรายการ (XL-REC) | reference-recorder | recorder | GENERIC TRAINING MODEL | 4, 5 |
| display | ตัวรับภาพจอสนาม (XL-DISPLAY) | generic-sdi-monitor | display | GENERIC TRAINING MODEL | 4, 5 |
