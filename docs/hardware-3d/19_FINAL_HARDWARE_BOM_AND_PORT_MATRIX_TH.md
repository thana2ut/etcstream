# 19 · BOM และตารางพอร์ตของ 25 ด่าน (สุดท้าย)

วันที่: 2026-10-20 · ตารางรายสถานที่สร้างจากข้อมูลในโค้ดจริง (`MISSION_ROOMS`, `MODELS`, `MODEL_GEOMETRY`)
ตารางละเอียดรายด่าน (BOM, edge, พอร์ตที่ใช้) ดูได้ที่ `docs/generated/STAGE_GRAPHS_GENERATED_TH.md` และ `docs/generated/MODEL_UNION_GENERATED_TH.md` (สร้างใหม่ด้วย `npx tsx scripts/generate-hardware-audit.ts`)

## ความหมายของสถานะ
| สถานะ | ความหมาย |
|---|---|
| ✅ ยืนยันรุ่นจริง | ผู้ผลิตและรุ่นตรงเอกสารทางการ พอร์ตใน registry ตรงกับ techspecs |
| ⏸ PENDING (ST) | รอคำตอบ Blackmagic Support 3 ข้อ (ระดับ line สูงสุด, phantom, การแมป L/R) ดู `12_ST_HARDWARE_VERIFICATION_TH.md` |
| GENERIC / REFERENCE (ฝึก) | โปรไฟล์ฝึกที่ยังไม่มีรุ่นจริง **ต้องคงไว้ชั่วคราว** จนกว่าสถาบันจะระบุรุ่น (ดูเหตุผลรายรายการด้านล่าง) |
| 3D ✅ | มีโมเดล 3D ตามรูปทางการ (14 รุ่น) |

## ผลค้นข้อมูลรอบนี้ (Phase 02)
| อุปกรณ์ | ข้อมูลทางการที่ได้ | สิ่งที่ยังขาด |
|---|---|---|
| AJA 3G-AMA | aja.com: 147.32 × 78.74 × 25.4 mm, 0.29 kg, +5–20 VDC 5 W, SDI BNC in 1 / out 1, DB-25 ตัวเมีย 4 in / 4 out + สาย breakout XLR (ตัวเมีย 4 / ตัวผู้ 4) | ตำแหน่งหัวต่อบนตัวเครื่อง (ยังไม่ได้ดูรูปทางการ) จึงยังไม่ทำโมเดล 3D |
| Magewell USB Capture SDI Gen 2 | magewell.com tech-specs: 92.2 × 40.2 × 12.3 mm, "SD/HD/3G-SDI BNC input", USB 3.0, 5 V ~0.5 A, ~2.5 W, มีไฟ LED 4 สถานะ | ⛔ **ขัดกันเอง:** ข้อความบอกว่าขาเข้าเป็น BNC แต่ในกล่องมี "MCX to BNC cable" แปลว่าตัวเครื่องอาจเป็น MCX และไม่ได้ระบุชนิดหัว USB ฝั่งตัวเครื่อง → PENDING |
| Shure SM58 | shure.com: cardioid dynamic, 50–15,000 Hz, cartridge R59 | หน้า user guide แสดงด้วยสคริปต์ อ่านขั้วต่อ อิมพีแดนซ์ และขนาดไม่ได้ → PENDING |
| ST (ProFX12v3 + ATEM Mini Extreme ISO G2 + HS5) | ดูเอกสาร 11/12 | 3 ข้อรอ Blackmagic Support (ไม่เปลี่ยน) |

## อุปกรณ์ที่ต้องคงเป็น GENERIC ชั่วคราว (และเหตุผล)
| อุปกรณ์ | เหตุผล |
|---|---|
| คอมพิวเตอร์ OBS, โน้ตบุ๊ก, PC กราฟิก, gateway/เราเตอร์, จุดรับสตรีมทดสอบ | เป็นอุปกรณ์ทั่วไป บทเรียนไม่ขึ้นกับยี่ห้อ |
| ไมค์ไร้สาย TX/RX, ไมค์หนีบปก, handheld TX | ต้องเลือกรุ่นที่ใช้ย่านความถี่ถูกกฎหมายในไทย ให้สถาบันระบุรุ่น |
| กล้อง HDMI (ST), กล้อง PTZ SDI (AU), จอ HDMI, โปรเจกเตอร์ | สถาบันยังไม่ระบุรุ่น |
| ลำโพง PA, ไมค์บรรยากาศ, shotgun, คอนโซล 6 ช่อง, stagebox/tail | สถาบันยังไม่ระบุรุ่น |
| fiber TX/RX (OUT) | ผู้สมัคร Mini Converter Optical Fiber 12G ต้องใช้โมดูล SFP แยกที่ยังไม่ได้เลือกรุ่น |
| ระบบ replay (SP) | ยังไม่ได้เลือกระบบ |
| มิกเซอร์/สวิตเชอร์ ST | PENDING ตาม 3 คำถาม |

## XS · ห้องเรียน

| อุปกรณ์ | รุ่นในโค้ด | สถานะ | 3D | ด่าน | พอร์ต (key:ทิศ:หัวต่อ) |
|---|---|---|---|---|---|
| cam1 | `bmd-studio-camera-4k-plus-g2` Blackmagic Studio Camera 4K Plus G2 | ✅ ยืนยันรุ่นจริง | ✅ | XS-01, XS-03, XS-04, XS-05 | hdmi-out:OUT:HDMI, sdi-out:OUT:SDI, sdi-ret:IN:SDI, mic-35:IN:3.5mm |
| sw | `bmd-atem-mini-pro` Blackmagic ATEM Mini Pro | ✅ ยืนยันรุ่นจริง | ✅ | XS-01, XS-03, XS-04, XS-05 | hdmi-in-1:IN:HDMI, hdmi-in-2:IN:HDMI, hdmi-in-3:IN:HDMI, hdmi-in-4:IN:HDMI, hdmi-out:OUT:HDMI, mic-1:IN:3.5mm, mic-2:IN:3.5mm, usb:OUT:USB-C, eth:OUT:ETHERNET |
| monitor | `generic-projector` Generic Training Projector | GENERIC | — | XS-01, XS-03, XS-04, XS-05 | hdmi-in-1:IN:HDMI, hdmi-in-2:IN:HDMI |
| lav | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | XS-02, XS-04, XS-05 | out:OUT:3.5mm |
| tx | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | XS-02, XS-04, XS-05 | mic-in:IN:3.5mm |
| rx | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | XS-02, XS-04, XS-05 | audio-out:OUT:XLR |
| mix | `generic-4ch-mixer` มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | GENERIC | — | XS-02, XS-04, XS-05 | in-1:IN:XLR, in-2:IN:XLR, in-3:IN:XLR, in-4:IN:XLR, main-out:OUT:XLR, aux-out:OUT:6.35mm |
| pa | `generic-active-pa` ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC | — | XS-02, XS-05 | line-in:IN:XLR |
| slides | `generic-laptop` โน้ตบุ๊กนำเสนอจำลอง | GENERIC | — | XS-03, XS-05 | hdmi-out:OUT:HDMI |
| host | `generic-obs-host` คอมพิวเตอร์ OBS จำลอง | GENERIC | — | XS-03, XS-04, XS-05 | usb-1:IN:USB-A, usb-2:IN:USB-A, eth:OUT:ETHERNET |

## ST · สตูดิโอ

| อุปกรณ์ | รุ่นในโค้ด | สถานะ | 3D | ด่าน | พอร์ต (key:ทิศ:หัวต่อ) |
|---|---|---|---|---|---|
| cam1 | `generic-hdmi-camera` กล้องฝึก HDMI 1080p50 | GENERIC | — | ST-01, ST-03, ST-04, ST-05 | hdmi-out:OUT:HDMI |
| sw | `generic-studio-switcher` เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ⏸ PENDING (ST) | — | ST-01, ST-02, ST-03, ST-04, ST-05 | hdmi-in-1:IN:HDMI, hdmi-in-2:IN:HDMI, hdmi-in-3:IN:HDMI, hdmi-in-4:IN:HDMI, hdmi-mv-out:OUT:HDMI, hdmi-pgm-out:OUT:HDMI, audio-in:IN:3.5mm |
| monitor | `generic-hdmi-monitor` Generic HDMI Training Monitor | GENERIC | — | ST-01, ST-03, ST-04, ST-05 | hdmi-in:IN:HDMI |
| lav1 | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-04, ST-05 | out:OUT:3.5mm |
| lav2 | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-05 | out:OUT:3.5mm |
| tx1 | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-04, ST-05 | mic-in:IN:3.5mm |
| tx2 | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-05 | mic-in:IN:3.5mm |
| rx1 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-04, ST-05 | audio-out:OUT:XLR |
| rx2 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | ST-02, ST-05 | audio-out:OUT:XLR |
| mix | `generic-4ch-mixer` มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ⏸ PENDING (ST) | — | ST-02, ST-04, ST-05 | in-1:IN:XLR, in-2:IN:XLR, in-3:IN:XLR, in-4:IN:XLR, main-out:OUT:XLR, aux-out:OUT:6.35mm |
| speaker | `yamaha-hs5` Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | ✅ ยืนยันรุ่นจริง | — | ST-02, ST-05 | xlr-in:IN:XLR, trs-in:IN:6.35mm |
| cam2 | `generic-hdmi-camera` กล้องฝึก HDMI 1080p50 | GENERIC | — | ST-03, ST-05 | hdmi-out:OUT:HDMI |
| cam3 | `generic-hdmi-camera` กล้องฝึก HDMI 1080p50 | GENERIC | — | ST-03, ST-05 | hdmi-out:OUT:HDMI |
| capture | `magewell-usb-capture-hdmi-gen2` Magewell USB Capture HDMI Gen 2 | ✅ ยืนยันรุ่นจริง | — | ST-04, ST-05 | hdmi-in:IN:HDMI, usb:OUT:USB-A |
| host | `generic-obs-host` คอมพิวเตอร์ OBS จำลอง | GENERIC | — | ST-04, ST-05 | usb-1:IN:USB-A, usb-2:IN:USB-A, eth:OUT:ETHERNET |
| mic | `generic-dynamic-mic` ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC | — | ST-05 | xlr-out:OUT:XLR |

## AU · หอประชุม

| อุปกรณ์ | รุ่นในโค้ด | สถานะ | 3D | ด่าน | พอร์ต (key:ทิศ:หัวต่อ) |
|---|---|---|---|---|---|
| cam1 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | AU-01, AU-03, AU-04, AU-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| sw | `bmd-atem-television-studio-hd8-iso` Blackmagic ATEM Television Studio HD8 ISO | ✅ ยืนยันรุ่นจริง | ✅ | AU-01, AU-02, AU-03, AU-04, AU-05 | sdi-in-1:IN:SDI, sdi-in-2:IN:SDI, sdi-in-3:IN:SDI, sdi-in-4:IN:SDI, sdi-in-5:IN:SDI, sdi-in-6:IN:SDI, sdi-in-7:IN:SDI, sdi-in-8:IN:SDI, ref-in:IN:SDI, pgm-out:OUT:SDI, aux-1:OUT:SDI, aux-2:OUT:SDI, mv-out:OUT:SDI, hdmi-mv:OUT:HDMI, xlr-l:IN:XLR, xlr-r:IN:XLR, usb-1:OUT:USB-C, usb-2:OUT:USB-C, eth:OUT:ETHERNET |
| convSH | `bmd-micro-converter-sdi-hdmi-3g` Blackmagic Micro Converter SDI to HDMI 3G | ✅ ยืนยันรุ่นจริง | ✅ | AU-01, AU-03, AU-04, AU-05 | sdi-in:IN:SDI, hdmi-out:OUT:HDMI, sdi-loop:OUT:SDI, usb-pwr:IN:USB-C |
| display | `generic-hdmi-monitor` Generic HDMI Training Monitor | GENERIC | — | AU-01, AU-03, AU-04, AU-05 | hdmi-in:IN:HDMI |
| podium | `generic-dynamic-mic` ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC | — | AU-02, AU-04, AU-05 | xlr-out:OUT:XLR |
| stagebox | `reference-stagebox-6` กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC | — | AU-02, AU-04, AU-05 | mic-in-1:IN:XLR, mic-in-2:IN:XLR, mic-in-3:IN:XLR, mic-in-4:IN:XLR, mic-in-5:IN:XLR, mic-in-6:IN:XLR, multicore:OUT:MULTICORE |
| tail | `reference-tail-6` หางสายมัลติคอร์ 6 ช่อง | GENERIC | — | AU-02, AU-04, AU-05 | multicore:IN:MULTICORE, tail-1:OUT:XLR, tail-2:OUT:XLR, tail-3:OUT:XLR, tail-4:OUT:XLR, tail-5:OUT:XLR, tail-6:OUT:XLR |
| mix | `reference-console-6` คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC | — | AU-02, AU-04, AU-05 | in-1:IN:XLR, in-2:IN:XLR, in-3:IN:XLR, in-4:IN:XLR, in-5:IN:XLR, in-6:IN:XLR, pa-l:OUT:XLR, pa-r:OUT:XLR, bc-l:OUT:XLR, bc-r:OUT:XLR |
| paL | `generic-active-pa` ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC | — | AU-02, AU-05 | line-in:IN:XLR |
| paR | `generic-active-pa` ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC | — | AU-02, AU-05 | line-in:IN:XLR |
| hand1 | `reference-handheld-tx` ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | GENERIC | — | AU-02, AU-05 |  |
| hrx1 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | AU-02, AU-05 | audio-out:OUT:XLR |
| cam2 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | AU-03, AU-04, AU-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| cam3 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | AU-03, AU-04, AU-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| ptz | `generic-sdi-ptz` กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | GENERIC | — | AU-03, AU-04, AU-05 | sdi-out:OUT:SDI |
| slides | `generic-laptop` โน้ตบุ๊กนำเสนอจำลอง | GENERIC | — | AU-03, AU-04, AU-05 | hdmi-out:OUT:HDMI |
| convHS | `bmd-micro-converter-hdmi-sdi-3g` Blackmagic Micro Converter HDMI to SDI 3G | ✅ ยืนยันรุ่นจริง | ✅ | AU-03, AU-04, AU-05 | hdmi-in:IN:HDMI, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI, usb-pwr:IN:USB-C |
| monitor | `bmd-smartview-duo` Blackmagic SmartView Duo | ✅ ยืนยันรุ่นจริง | ✅ | AU-03, AU-04, AU-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-in-b:IN:SDI, sdi-loop-b:OUT:SDI |
| capture | `magewell-usb-capture-sdi-gen2` Magewell USB Capture SDI Gen 2 (32070) | ✅ ยืนยันรุ่นจริง | — | AU-05 | sdi-in:IN:SDI, usb:OUT:USB-A |
| host | `generic-obs-host` คอมพิวเตอร์ OBS จำลอง | GENERIC | — | AU-05 | usb-1:IN:USB-A, usb-2:IN:USB-A, eth:OUT:ETHERNET |
| rec | `bmd-hyperdeck-studio-hd-plus` Blackmagic HyperDeck Studio HD Plus | ✅ ยืนยันรุ่นจริง | ✅ | AU-05 | sdi-in:IN:SDI, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI, sdi-loop:OUT:SDI, sdi-mon:OUT:SDI, hdmi-in:IN:HDMI, hdmi-out:OUT:HDMI, eth:OUT:ETHERNET |
| hand2 | `reference-handheld-tx` ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | GENERIC | — | AU-05 |  |
| hrx2 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | audio-out:OUT:XLR |
| lav1 | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | out:OUT:3.5mm |
| lav2 | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | out:OUT:3.5mm |
| tx1 | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | mic-in:IN:3.5mm |
| tx2 | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | mic-in:IN:3.5mm |
| rx1 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | audio-out:OUT:XLR |
| rx2 | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | AU-05 | audio-out:OUT:XLR |

## OUT · กลางแจ้ง

| อุปกรณ์ | รุ่นในโค้ด | สถานะ | 3D | ด่าน | พอร์ต (key:ทิศ:หัวต่อ) |
|---|---|---|---|---|---|
| cam1 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | OUT-01, OUT-03, OUT-04, OUT-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| sw | `bmd-atem-television-studio-hd8-iso` Blackmagic ATEM Television Studio HD8 ISO | ✅ ยืนยันรุ่นจริง | ✅ | OUT-01, OUT-03, OUT-04, OUT-05 | sdi-in-1:IN:SDI, sdi-in-2:IN:SDI, sdi-in-3:IN:SDI, sdi-in-4:IN:SDI, sdi-in-5:IN:SDI, sdi-in-6:IN:SDI, sdi-in-7:IN:SDI, sdi-in-8:IN:SDI, ref-in:IN:SDI, pgm-out:OUT:SDI, aux-1:OUT:SDI, aux-2:OUT:SDI, mv-out:OUT:SDI, hdmi-mv:OUT:HDMI, xlr-l:IN:XLR, xlr-r:IN:XLR, usb-1:OUT:USB-C, usb-2:OUT:USB-C, eth:OUT:ETHERNET |
| monitor | `bmd-smartview-duo` Blackmagic SmartView Duo | ✅ ยืนยันรุ่นจริง | ✅ | OUT-01, OUT-03, OUT-04, OUT-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-in-b:IN:SDI, sdi-loop-b:OUT:SDI |
| lav | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | OUT-02, OUT-04, OUT-05 | out:OUT:3.5mm |
| tx | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | OUT-02, OUT-04, OUT-05 | mic-in:IN:3.5mm |
| rx | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | OUT-02, OUT-04, OUT-05 | audio-out:OUT:XLR |
| shotgun | `reference-shotgun` ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | GENERIC | — | OUT-02, OUT-04, OUT-05 | xlr-out:OUT:XLR |
| amb | `generic-ambience-mic` ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC | — | OUT-02, OUT-04, OUT-05 | xlr-out:OUT:XLR |
| mix | `reference-console-6` คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC | — | OUT-02, OUT-04, OUT-05 | in-1:IN:XLR, in-2:IN:XLR, in-3:IN:XLR, in-4:IN:XLR, in-5:IN:XLR, in-6:IN:XLR, pa-l:OUT:XLR, pa-r:OUT:XLR, bc-l:OUT:XLR, bc-r:OUT:XLR |
| pa | `generic-active-pa` ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC | — | OUT-02, OUT-04, OUT-05 | line-in:IN:XLR |
| cam2 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | OUT-03, OUT-04, OUT-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| cam3 | `bmd-studio-camera-4k-pro-g2` Blackmagic Studio Camera 4K Pro G2 | ✅ ยืนยันรุ่นจริง | ✅ | OUT-03, OUT-04, OUT-05 | sdi-out:OUT:SDI, sdi-ret:IN:SDI, hdmi-out:OUT:HDMI |
| fiberTx | `reference-fiber-tx` ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | GENERIC | — | OUT-03, OUT-04, OUT-05 | sdi-in:IN:SDI, optical-out:OUT:FIBER |
| fiberRx | `reference-fiber-rx` ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | GENERIC | — | OUT-03, OUT-04, OUT-05 | optical-in:IN:FIBER, sdi-out:OUT:SDI |
| embed | `aja-3g-ama` AJA 3G-AMA | ✅ ยืนยันรุ่นจริง | — | OUT-04, OUT-05 | sdi-in:IN:SDI, sdi-out:OUT:SDI, audio-l:IN:XLR, audio-r:IN:XLR |
| enc | `bmd-streaming-encoder-hd` Blackmagic Streaming Encoder HD | ✅ ยืนยันรุ่นจริง | ✅ | OUT-04, OUT-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-mon:OUT:SDI, hdmi-mon:OUT:HDMI, eth:OUT:ETHERNET, usb:OUT:USB-C |
| net | `generic-gateway` เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC | — | OUT-04, OUT-05 | lan-1:IN:ETHERNET, lan-2:IN:ETHERNET, wan:OUT:ETHERNET |
| wan | `generic-test-ingest` จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC | — | OUT-04, OUT-05 | wan-in:IN:ETHERNET |

## SP · กีฬา

| อุปกรณ์ | รุ่นในโค้ด | สถานะ | 3D | ด่าน | พอร์ต (key:ทิศ:หัวต่อ) |
|---|---|---|---|---|---|
| cam1 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc1 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu1 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| router | `bmd-videohub-20x20-12g` Blackmagic Videohub 20x20 12G | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-03, SP-04, SP-05 | in-1:IN:SDI, out-1:OUT:SDI, in-2:IN:SDI, out-2:OUT:SDI, in-3:IN:SDI, out-3:OUT:SDI, in-4:IN:SDI, out-4:OUT:SDI, in-5:IN:SDI, out-5:OUT:SDI, in-6:IN:SDI, out-6:OUT:SDI, in-7:IN:SDI, out-7:OUT:SDI, in-8:IN:SDI, out-8:OUT:SDI, in-9:IN:SDI, out-9:OUT:SDI, in-10:IN:SDI, out-10:OUT:SDI, in-11:IN:SDI, out-11:OUT:SDI, in-12:IN:SDI, out-12:OUT:SDI, in-13:IN:SDI, out-13:OUT:SDI, in-14:IN:SDI, out-14:OUT:SDI, in-15:IN:SDI, out-15:OUT:SDI, in-16:IN:SDI, out-16:OUT:SDI, in-17:IN:SDI, out-17:OUT:SDI, in-18:IN:SDI, out-18:OUT:SDI, in-19:IN:SDI, out-19:OUT:SDI, in-20:IN:SDI, out-20:OUT:SDI |
| sw | `bmd-atem-2me-constellation-4k` Blackmagic ATEM 2 M/E Constellation 4K | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-02, SP-03, SP-04, SP-05 | sdi-in-1:IN:SDI, sdi-in-2:IN:SDI, sdi-in-3:IN:SDI, sdi-in-4:IN:SDI, sdi-in-5:IN:SDI, sdi-in-6:IN:SDI, sdi-in-7:IN:SDI, sdi-in-8:IN:SDI, sdi-in-9:IN:SDI, sdi-in-10:IN:SDI, sdi-in-11:IN:SDI, sdi-in-12:IN:SDI, sdi-in-13:IN:SDI, sdi-in-14:IN:SDI, sdi-in-15:IN:SDI, sdi-in-16:IN:SDI, sdi-in-17:IN:SDI, sdi-in-18:IN:SDI, sdi-in-19:IN:SDI, sdi-in-20:IN:SDI, sdi-out-1:OUT:SDI, sdi-out-2:OUT:SDI, sdi-out-3:OUT:SDI, sdi-out-4:OUT:SDI, sdi-out-5:OUT:SDI, sdi-out-6:OUT:SDI, sdi-out-7:OUT:SDI, sdi-out-8:OUT:SDI, sdi-out-9:OUT:SDI, sdi-out-10:OUT:SDI, sdi-out-11:OUT:SDI, sdi-out-12:OUT:SDI, mv-out:OUT:SDI, mv-out-2:OUT:SDI, xlr-l:IN:6.35mm, xlr-r:IN:6.35mm |
| monitor | `bmd-smartview-duo` Blackmagic SmartView Duo | ✅ ยืนยันรุ่นจริง | ✅ | SP-01, SP-03, SP-04, SP-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-in-b:IN:SDI, sdi-loop-b:OUT:SDI |
| mic1 | `shure-sm58` Shure SM58 | ✅ ยืนยันรุ่นจริง | — | SP-02, SP-04, SP-05 | xlr-out:OUT:XLR |
| mic2 | `shure-sm58` Shure SM58 | ✅ ยืนยันรุ่นจริง | — | SP-02, SP-04, SP-05 | xlr-out:OUT:XLR |
| crowdL | `generic-ambience-mic` ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC | — | SP-02, SP-04, SP-05 | xlr-out:OUT:XLR |
| crowdR | `generic-ambience-mic` ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC | — | SP-02, SP-04, SP-05 | xlr-out:OUT:XLR |
| field | `generic-dynamic-mic` ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC | — | SP-02, SP-04, SP-05 | xlr-out:OUT:XLR |
| lav | `generic-lav-mic` ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC | — | SP-02, SP-04, SP-05 | out:OUT:3.5mm |
| tx | `generic-wireless-tx` ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC | — | SP-02, SP-04, SP-05 | mic-in:IN:3.5mm |
| rx | `generic-wireless-rx` ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC | — | SP-02, SP-04, SP-05 | audio-out:OUT:XLR |
| stagebox | `reference-stagebox-6` กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC | — | SP-02, SP-04, SP-05 | mic-in-1:IN:XLR, mic-in-2:IN:XLR, mic-in-3:IN:XLR, mic-in-4:IN:XLR, mic-in-5:IN:XLR, mic-in-6:IN:XLR, multicore:OUT:MULTICORE |
| tail | `reference-tail-6` หางสายมัลติคอร์ 6 ช่อง | GENERIC | — | SP-02, SP-04, SP-05 | multicore:IN:MULTICORE, tail-1:OUT:XLR, tail-2:OUT:XLR, tail-3:OUT:XLR, tail-4:OUT:XLR, tail-5:OUT:XLR, tail-6:OUT:XLR |
| mix | `reference-console-6` คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC | — | SP-02, SP-04, SP-05 | in-1:IN:XLR, in-2:IN:XLR, in-3:IN:XLR, in-4:IN:XLR, in-5:IN:XLR, in-6:IN:XLR, pa-l:OUT:XLR, pa-r:OUT:XLR, bc-l:OUT:XLR, bc-r:OUT:XLR |
| pa | `generic-active-pa` ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC | — | SP-02, SP-04, SP-05 | line-in:IN:XLR |
| cam2 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc2 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu2 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| cam3 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc3 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu3 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| cam4 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc4 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu4 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| cam5 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc5 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu5 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| cam6 | `bmd-ursa-broadcast-g2` Blackmagic URSA Broadcast G2 | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, sdi-mon:OUT:SDI, sdi-ret:IN:SDI, xlr-1:IN:XLR, xlr-2:IN:XLR |
| cfc6 | `bmd-camera-fiber-converter` Blackmagic Camera Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | sdi-in:IN:SDI, fiber:OUT:FIBER |
| ccu6 | `bmd-studio-fiber-converter` Blackmagic Studio Fiber Converter | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | fiber:IN:FIBER, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI |
| play | `reference-replay` เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | GENERIC | — | SP-03, SP-04, SP-05 | sdi-out:OUT:SDI, control-in:IN:CONTROL |
| controller | `reference-replay-controller` แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | GENERIC | — | SP-03, SP-04, SP-05 | control-out:OUT:CONTROL |
| gfx | `generic-graphics-pc` คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | GENERIC | — | SP-03, SP-04, SP-05 | hdmi-out:OUT:HDMI |
| convHS | `bmd-micro-converter-hdmi-sdi-3g` Blackmagic Micro Converter HDMI to SDI 3G | ✅ ยืนยันรุ่นจริง | ✅ | SP-03, SP-04, SP-05 | hdmi-in:IN:HDMI, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI, usb-pwr:IN:USB-C |
| enc | `bmd-streaming-encoder-hd` Blackmagic Streaming Encoder HD | ✅ ยืนยันรุ่นจริง | ✅ | SP-04, SP-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-mon:OUT:SDI, hdmi-mon:OUT:HDMI, eth:OUT:ETHERNET, usb:OUT:USB-C |
| enc2 | `bmd-streaming-encoder-hd` Blackmagic Streaming Encoder HD | ✅ ยืนยันรุ่นจริง | ✅ | SP-04, SP-05 | sdi-in:IN:SDI, sdi-loop:OUT:SDI, sdi-mon:OUT:SDI, hdmi-mon:OUT:HDMI, eth:OUT:ETHERNET, usb:OUT:USB-C |
| net | `generic-gateway` เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC | — | SP-04, SP-05 | lan-1:IN:ETHERNET, lan-2:IN:ETHERNET, wan:OUT:ETHERNET |
| net2 | `generic-gateway` เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC | — | SP-04, SP-05 | lan-1:IN:ETHERNET, lan-2:IN:ETHERNET, wan:OUT:ETHERNET |
| wan | `generic-test-ingest` จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC | — | SP-04, SP-05 | wan-in:IN:ETHERNET |
| wan2 | `generic-test-ingest` จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC | — | SP-04, SP-05 | wan-in:IN:ETHERNET |
| rec | `bmd-hyperdeck-studio-hd-plus` Blackmagic HyperDeck Studio HD Plus | ✅ ยืนยันรุ่นจริง | ✅ | SP-04, SP-05 | sdi-in:IN:SDI, sdi-out:OUT:SDI, sdi-out-2:OUT:SDI, sdi-loop:OUT:SDI, sdi-mon:OUT:SDI, hdmi-in:IN:HDMI, hdmi-out:OUT:HDMI, eth:OUT:ETHERNET |
| display | `generic-sdi-monitor` จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC | — | SP-04, SP-05 | sdi-in:IN:SDI |
