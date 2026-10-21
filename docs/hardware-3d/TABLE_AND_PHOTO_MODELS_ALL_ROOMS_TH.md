# ตรวจโต๊ะและโมเดลอุปกรณ์ทุกห้อง — ไม่ควบคุมตัวละครเล่น

## ขอบเขตที่ตรวจจริง

- 25 ด่านใน 5 ห้อง พร้อมคง Free Practice และ hdmi-basic เดิม
- ตรวจโค้ด กราฟภารกิจ สัญญาณ เซฟ จุดพอร์ต พื้นที่วาง การหยิบ/วางผ่านชุดทดสอบ และภาพเรนเดอร์ Blender แยกฉาก
- ไม่ได้เปิดควบคุมตัวละคร ไม่ได้ทดสอบ FPS หรือรับรองภาพจาก browser ทุกห้อง
- อุปกรณ์โครงสร้าง เช่น กล้องพร้อมขาตั้ง จอติดตั้ง แร็ก และชุดเวทีใหญ่ อยู่ที่จุดบริการตามงานจริง ไม่ยกทั้งชุดมาซ้อนบนโต๊ะ
- L4/ด่านที่กำหนดสายตั้งต้นยังคงสถานะเดิมเพื่อไม่เปลี่ยนโจทย์ซ่อม; อุปกรณ์พกพาและของสำรองยังอยู่ในห้องและหยิบได้

## ตารางครบทุกด่าน

| ด่าน | ห้อง | จำนวนชิ้น | หยิบได้ | เริ่มรอเตรียม | สำรองจากด่านอื่น | สายตั้งต้น |
|---|---|---:|---:|---:|---:|---:|
| XS-01 | xs | 10 | 7 | 7 | 7 | 0 |
| XS-02 | xs | 10 | 7 | 7 | 5 | 0 |
| XS-03 | xs | 10 | 7 | 6 | 5 | 0 |
| XS-04 | xs | 10 | 7 | 7 | 2 | 5 |
| XS-05 | xs | 10 | 7 | 6 | 0 | 0 |
| ST-01 | s | 16 | 11 | 10 | 13 | 0 |
| ST-02 | s | 16 | 11 | 7 | 7 | 0 |
| ST-03 | s | 16 | 11 | 10 | 11 | 0 |
| ST-04 | s | 16 | 11 | 8 | 7 | 6 |
| ST-05 | s | 16 | 11 | 6 | 0 | 0 |
| AU-01 | m | 29 | 18 | 17 | 25 | 0 |
| AU-02 | m | 29 | 18 | 14 | 20 | 0 |
| AU-03 | m | 29 | 18 | 16 | 19 | 0 |
| AU-04 | m | 29 | 18 | 15 | 15 | 14 |
| AU-05 | m | 29 | 18 | 4 | 0 | 0 |
| OUT-01 | l | 18 | 9 | 8 | 15 | 0 |
| OUT-02 | l | 18 | 9 | 8 | 11 | 0 |
| OUT-03 | l | 18 | 9 | 8 | 11 | 0 |
| OUT-04 | l | 18 | 9 | 4 | 0 | 16 |
| OUT-05 | l | 18 | 9 | 4 | 0 | 0 |
| SP-01 | xl | 45 | 9 | 8 | 39 | 0 |
| SP-02 | xl | 45 | 9 | 6 | 32 | 0 |
| SP-03 | xl | 45 | 9 | 4 | 20 | 0 |
| SP-04 | xl | 45 | 9 | 2 | 0 | 55 |
| SP-05 | xl | 45 | 9 | 2 | 0 | 0 |

## โมเดลที่ใช้งานจริง

สถานะทั้งหมดคือ mesh ที่นำไปตรวจต่อได้ ไม่ใช่คำรับรองว่ารายละเอียดทุกมุมตรงโรงงาน 100%

| โปรไฟล์เดิม | รุ่นภาพที่เลือก/คงเดิม | วิธีแสดงผล | พอร์ตที่มีจุดโมเดล | ห้อง |
|---|---|---|---:|---|
| bmd-studio-camera-4k-plus-g2 | Blackmagic Studio Camera 4K Plus G2 | existing hardware mesh | 4 | xs |
| bmd-atem-mini-pro | Blackmagic ATEM Mini Pro | existing native GLB | 9 | xs |
| generic-projector | Epson EB-FH52 | photo family renderer | 0 | xs |
| generic-lav-mic | Sennheiser ME 2 | selected photo mesh | 1 | xs, s, m, l, xl |
| generic-wireless-tx | Sennheiser SK 100 G4 | selected photo mesh | 1 | xs, s, m, l, xl |
| generic-wireless-rx | Sennheiser EM 100 G4 | selected photo mesh | 1 | xs, s, m, l, xl |
| generic-4ch-mixer | Yamaha MG12XU + Radial J-Iso / Hosa YPP-136 | selected photo mesh | 6 | xs, s |
| generic-active-pa | Yamaha DBR12 | photo family renderer | 0 | xs, m, l, xl |
| generic-laptop | HP ProBook 450 G10 | selected photo mesh | 1 | xs, m |
| generic-obs-host | HP ProBook 450 G10 | selected photo mesh | 3 | xs, s, m |
| generic-hdmi-camera | Panasonic HC-X2000 | reused HC-X2000 GLB | 1 | s |
| generic-studio-switcher | Blackmagic ATEM Mini Extreme | selected photo mesh | 7 | s |
| generic-hdmi-monitor | Sony LMD-A170 | selected photo mesh | 1 | s, m |
| yamaha-hs5 | Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | existing native GLB | 0 | s, studio-full |
| magewell-usb-capture-hdmi-gen2 | Magewell USB Capture HDMI Gen 2 | existing native GLB | 0 | s, studio-full |
| generic-dynamic-mic | Shure SM58 | selected photo mesh | 1 | s, m, xl |
| bmd-studio-camera-4k-pro-g2 | Blackmagic Studio Camera 4K Pro G2 | existing hardware mesh | 3 | m, l |
| bmd-atem-television-studio-hd8-iso | Blackmagic ATEM Television Studio HD8 ISO | existing hardware mesh | 19 | m, l |
| bmd-micro-converter-sdi-hdmi-3g | Blackmagic Micro Converter SDI to HDMI 3G | existing hardware mesh | 4 | m |
| reference-stagebox-6 | Whirlwind MINI 6 Elite + W1 disconnect option | selected photo mesh | 7 | m, xl |
| reference-tail-6 | Whirlwind MINI 6 Elite + W1 disconnect option | selected photo mesh | 7 | m, xl |
| reference-console-6 | Yamaha QL1 | selected photo mesh | 10 | m, l, xl |
| reference-handheld-tx | Sennheiser SKM 100 G4 / MMD 835-1 | selected photo mesh | 0 | m |
| generic-sdi-ptz | Sony SRG-X400 | photo family renderer | 0 | m |
| bmd-micro-converter-hdmi-sdi-3g | Blackmagic Micro Converter HDMI to SDI 3G | existing hardware mesh | 4 | m, xl |
| bmd-smartview-duo | Blackmagic SmartView Duo | existing hardware mesh | 4 | m, l, xl |
| magewell-usb-capture-sdi-gen2 | Magewell USB Capture SDI Gen 2 (32070) | existing hardware mesh | 2 | m |
| bmd-hyperdeck-studio-hd-plus | Blackmagic HyperDeck Studio HD Plus | existing hardware mesh | 8 | m, xl |
| reference-shotgun | Sennheiser MKE 600 | selected photo mesh | 1 | l |
| generic-ambience-mic | Shure SM58 | selected photo mesh | 1 | l, xl |
| reference-fiber-tx | Blackmagic Mini Converter Optical Fiber 12G + 12G-SDI optical SFP | selected photo mesh | 2 | l |
| reference-fiber-rx | Blackmagic Mini Converter Optical Fiber 12G + 12G-SDI optical SFP | selected photo mesh | 2 | l |
| aja-3g-ama | AJA 3G-AMA | existing hardware mesh | 4 | l |
| bmd-streaming-encoder-hd | Blackmagic Streaming Encoder HD | existing hardware mesh | 6 | l, xl |
| generic-gateway | TP-Link Omada ER605 V1 | selected photo mesh | 3 | l, xl |
| generic-test-ingest | Dell PowerEdge R250 | selected photo mesh | 1 | l, xl |
| bmd-ursa-broadcast-g2 | Blackmagic URSA Broadcast G2 | existing hardware mesh | 5 | xl |
| bmd-camera-fiber-converter | Blackmagic Camera Fiber Converter | existing hardware mesh | 2 | xl |
| bmd-studio-fiber-converter | Blackmagic Studio Fiber Converter | existing hardware mesh | 3 | xl |
| bmd-videohub-20x20-12g | Blackmagic Videohub 20x20 12G | existing hardware mesh | 40 | xl |
| bmd-atem-2me-constellation-4k | Blackmagic ATEM 2 M/E Constellation 4K | existing hardware mesh | 36 | xl |
| shure-sm58 | Shure SM58 | existing hardware mesh | 1 | xl |
| reference-replay | Dell Precision 3660 + DeckLink Duo 2 / vMix Replay | selected photo mesh | 1 | xl |
| reference-replay-controller | Contour ShuttlePRO v2 | photo family renderer | 0 | xl |
| generic-graphics-pc | HP ProBook 450 G10 | selected photo mesh | 1 | xl |
| generic-sdi-monitor | Sony LMD-A170 | selected photo mesh | 1 | xl |
| panasonic-hc-x2000 | Panasonic HC-X2000 | existing native GLB / Free Practice | 0 | studio-full |
| hp-15-6-reference | HP 15.6-inch (ตามภาพอ้างอิง) | existing native GLB / Free Practice | 0 | studio-full |
| pmx-402d-usb | PMX-402D-USB (อ้างอิงภาพเจ้าของ · ผู้ผลิตยังไม่ยืนยัน) | existing native GLB / Free Practice | 0 | studio-full |
| sennheiser-xs1 | Sennheiser XS 1 | existing native GLB / Free Practice | 0 | studio-full |
| comica-wm100-plus | COMICA WM100 PLUS RX | existing native GLB / Free Practice | 0 | studio-full |
| devicewell-hds7105 | DeviceWell HDS7105 | existing native GLB / authored room | 0 | studio-full |
| samsung-u8000f | Samsung UA85U8000FKXXT | existing native GLB / authored room | 0 | studio-full |

## ข้อจำกัดที่ห้ามรายงานเกินจริง

- จุดที่ไม่เห็นจากภาพยังประมาณจากภาพใกล้เคียง/สัดส่วน และระบุใน estimates ของแต่ละ geometry
- แผงควบคุมฝึกคงกติกาเดิม ไม่อ้างว่าเหมือน firmware สินค้าจริงทั้งหมด
- STREAM/AUX เดิมแสดงเป็นชุดภายนอก Radial J-Iso + Hosa YPP-136 พร้อมภาพทางการ ไม่ใช่ช่อง AUX stereo โรงงานบน MG12XU และไม่ใช้ PHONES แทน LINE
- CTRL-REPLAY เป็นลิงก์เชิงตรรกะ ไม่ใช่รูเสียบบน Contour
- ยังไม่มีการทดสอบภาพใน browser หรือวัดประสิทธิภาพจริงตามคำสั่งไม่ควบคุมเล่น
