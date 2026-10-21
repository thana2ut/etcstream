# Phase 07 — การเชื่อมโมเดลกับโต๊ะทั้ง25ด่าน

วันที่ 21 ตุลาคม 2026 · สร้างจาก Scenario ปัจจุบันด้วย scripts/phase07-table-report.mjs

คง union stock ของ5ระดับต่อvenue; จำนวนรวมเท่ากัน แต่บางบทเรียนเริ่มติดตั้งเครื่องที่สถานีตามกติกาเดิม จึงไม่ใช่ว่าทุกชิ้นต้องเริ่มบนโต๊ะทุกระดับ สายยังอยู่ในกระเป๋า ไม่เพิ่มเป็นของตกแต่งบนโต๊ะ

| ด่าน | สถานที่ | รวมเครื่อง | ยกได้ทั้งหมด | เริ่มโต๊ะ | ยกได้แต่เริ่มติดตั้ง | fixed | สาย/adapter |
|---|---|---:|---:|---:|---:|---:|---:|
| XS-01 | ห้องเรียน | 10 | 7 | 7 | 0 | 3 | 2 |
| XS-02 | ห้องเรียน | 10 | 7 | 7 | 0 | 3 | 4 |
| XS-03 | ห้องเรียน | 10 | 7 | 6 | 1 | 3 | 5 |
| XS-04 | ห้องเรียน | 10 | 7 | 7 | 0 | 3 | 9 |
| XS-05 | ห้องเรียน | 10 | 7 | 6 | 1 | 3 | 11 |
| ST-01 | สตูดิโอ | 16 | 11 | 10 | 1 | 5 | 2 |
| ST-02 | สตูดิโอ | 16 | 11 | 7 | 4 | 5 | 6 |
| ST-03 | สตูดิโอ | 16 | 11 | 10 | 1 | 5 | 4 |
| ST-04 | สตูดิโอ | 16 | 11 | 8 | 3 | 5 | 9 |
| ST-05 | สตูดิโอ | 16 | 11 | 6 | 5 | 5 | 16 |
| AU-01 | หอประชุม | 29 | 18 | 17 | 1 | 11 | 3 |
| AU-02 | หอประชุม | 29 | 18 | 14 | 4 | 11 | 9 |
| AU-03 | หอประชุม | 29 | 18 | 16 | 2 | 11 | 9 |
| AU-04 | หอประชุม | 29 | 18 | 15 | 3 | 11 | 18 |
| AU-05 | หอประชุม | 29 | 18 | 4 | 14 | 11 | 29 |
| OUT-01 | กลางแจ้ง | 18 | 9 | 8 | 1 | 9 | 2 |
| OUT-02 | กลางแจ้ง | 18 | 9 | 8 | 1 | 9 | 5 |
| OUT-03 | กลางแจ้ง | 18 | 9 | 8 | 1 | 9 | 6 |
| OUT-04 | กลางแจ้ง | 18 | 9 | 4 | 5 | 9 | 17 |
| OUT-05 | กลางแจ้ง | 18 | 9 | 4 | 5 | 9 | 17 |
| SP-01 | สนามกีฬา | 45 | 9 | 8 | 1 | 36 | 5 |
| SP-02 | สนามกีฬา | 45 | 9 | 6 | 3 | 36 | 17 |
| SP-03 | สนามกีฬา | 45 | 9 | 4 | 5 | 36 | 31 |
| SP-04 | สนามกีฬา | 45 | 9 | 2 | 7 | 36 | 56 |
| SP-05 | สนามกีฬา | 45 | 9 | 2 | 7 | 36 | 56 |

## รายการต่อสถานที่

### ห้องเรียน

ยกได้ (7): sw [bmd-atem-mini-pro], lav [generic-lav-mic], tx [generic-wireless-tx], rx [generic-wireless-rx], mix [generic-4ch-mixer], slides [generic-laptop], host [generic-obs-host]

ติดตั้งประจำ (3): cam1 [bmd-studio-camera-4k-plus-g2], monitor [generic-projector], pa [generic-active-pa]

### สตูดิโอ

ยกได้ (11): sw [generic-studio-switcher], lav1 [generic-lav-mic], lav2 [generic-lav-mic], tx1 [generic-wireless-tx], tx2 [generic-wireless-tx], rx1 [generic-wireless-rx], rx2 [generic-wireless-rx], mix [generic-4ch-mixer], capture [magewell-usb-capture-hdmi-gen2], host [generic-obs-host], mic [generic-dynamic-mic]

ติดตั้งประจำ (5): cam1 [generic-hdmi-camera], monitor [generic-hdmi-monitor], speaker [yamaha-hs5], cam2 [generic-hdmi-camera], cam3 [generic-hdmi-camera]

### หอประชุม

ยกได้ (18): sw [bmd-atem-television-studio-hd8-iso], convSH [bmd-micro-converter-sdi-hdmi-3g], podium [generic-dynamic-mic], hand1 [reference-handheld-tx], hrx1 [generic-wireless-rx], slides [generic-laptop], convHS [bmd-micro-converter-hdmi-sdi-3g], capture [magewell-usb-capture-sdi-gen2], host [generic-obs-host], rec [bmd-hyperdeck-studio-hd-plus], hand2 [reference-handheld-tx], hrx2 [generic-wireless-rx], lav1 [generic-lav-mic], lav2 [generic-lav-mic], tx1 [generic-wireless-tx], tx2 [generic-wireless-tx], rx1 [generic-wireless-rx], rx2 [generic-wireless-rx]

ติดตั้งประจำ (11): cam1 [bmd-studio-camera-4k-pro-g2], display [generic-hdmi-monitor], stagebox [reference-stagebox-6], tail [reference-tail-6], mix [reference-console-6], paL [generic-active-pa], paR [generic-active-pa], cam2 [bmd-studio-camera-4k-pro-g2], cam3 [bmd-studio-camera-4k-pro-g2], ptz [generic-sdi-ptz], monitor [bmd-smartview-duo]

### กลางแจ้ง

ยกได้ (9): sw [bmd-atem-television-studio-hd8-iso], lav [generic-lav-mic], tx [generic-wireless-tx], rx [generic-wireless-rx], fiberTx [reference-fiber-tx], fiberRx [reference-fiber-rx], embed [aja-3g-ama], enc [bmd-streaming-encoder-hd], net [generic-gateway]

ติดตั้งประจำ (9): cam1 [bmd-studio-camera-4k-pro-g2], monitor [bmd-smartview-duo], shotgun [reference-shotgun], amb [generic-ambience-mic], mix [reference-console-6], pa [generic-active-pa], cam2 [bmd-studio-camera-4k-pro-g2], cam3 [bmd-studio-camera-4k-pro-g2], wan [generic-test-ingest]

### สนามกีฬา

ยกได้ (9): sw [bmd-atem-2me-constellation-4k], mic1 [shure-sm58], mic2 [shure-sm58], tx [generic-wireless-tx], rx [generic-wireless-rx], play [reference-replay], controller [reference-replay-controller], gfx [generic-graphics-pc], convHS [bmd-micro-converter-hdmi-sdi-3g]

ติดตั้งประจำ (36): cam1 [bmd-ursa-broadcast-g2], cfc1 [bmd-camera-fiber-converter], ccu1 [bmd-studio-fiber-converter], router [bmd-videohub-20x20-12g], monitor [bmd-smartview-duo], crowdL [generic-ambience-mic], crowdR [generic-ambience-mic], field [generic-dynamic-mic], lav [generic-lav-mic], stagebox [reference-stagebox-6], tail [reference-tail-6], mix [reference-console-6], pa [generic-active-pa], cam2 [bmd-ursa-broadcast-g2], cfc2 [bmd-camera-fiber-converter], ccu2 [bmd-studio-fiber-converter], cam3 [bmd-ursa-broadcast-g2], cfc3 [bmd-camera-fiber-converter], ccu3 [bmd-studio-fiber-converter], cam4 [bmd-ursa-broadcast-g2], cfc4 [bmd-camera-fiber-converter], ccu4 [bmd-studio-fiber-converter], cam5 [bmd-ursa-broadcast-g2], cfc5 [bmd-camera-fiber-converter], ccu5 [bmd-studio-fiber-converter], cam6 [bmd-ursa-broadcast-g2], cfc6 [bmd-camera-fiber-converter], ccu6 [bmd-studio-fiber-converter], enc [bmd-streaming-encoder-hd], enc2 [bmd-streaming-encoder-hd], net [generic-gateway], net2 [generic-gateway], wan [generic-test-ingest], wan2 [generic-test-ingest], rec [bmd-hyperdeck-studio-hd-plus], display [generic-sdi-monitor]

## การจัดและผลตรวจ

รักษาโต๊ะ/ตำแหน่งสถานที่และธีมจีนเซียนเดิม ใช้ลำดับหมวดจากระบบเดิม จัด shelf slot ด้วยขนาด footprint หมุนจริง รวม stagingBounds ของ breakout/tail ระยะคั่น35มม.และขอบ40มม. จัด poolเต็มก่อนเลือกของที่เริ่มบนโต๊ะเพื่อให้ slot ไม่เลื่อนข้ามระดับ

เครื่องบน tripod/rack/camera mount อยู่สถานีเดิม สถานีใหญ่/จอ/PA มีฐานรองเดิม ไม่ย้าย fixed-install ไปกองบนโต๊ะ อุปกรณ์ stockOnly ไม่เข้า objective, canonical wiring หรือ initial connections; ไม่แตะเกณฑ์ผ่านเพื่อเลี่ยงปัญหาโมเดล

Automated tests ตรวจทั้ง25: roster union, fixed station, stable portable slot, full-footprint fit/no overlap, tabletop height, reachability และไม่ผ่านทันทีจาก stock เพิ่ม; end-to-end logicทุกด่านผ่าน ต้องให้ ownerเดินตรวจภาพ/การหยิบจริงครั้งสุดท้าย ไม่อ้างว่าการตรวจเชิงเรขาคณิตแทน manual playtest
