# กราฟและ BOM ทั้ง 25 ด่าน (สร้างอัตโนมัติจากโค้ด)

สร้างโดย `npx tsx scripts/generate-hardware-audit.ts` · ห้ามแก้มือ

## XS · ห้องประตูแรกแห่งภาพ (ห้องเรียน · ระบบสอนและห้องเรียนแบบไฮบริด)

### XS-01 · เส้นทางภาพ · Video Path

- รูปแบบด่าน: `guided` · ใบงาน: นำภาพจากกล้องห้องเรียนขึ้นจอหน้าห้องผ่านเครื่องสลับภาพ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `XS-01`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xs`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Plus G2 | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` | Blackmagic Design · Blackmagic ATEM Mini Pro | ไม่ | boxed→carry |
| monitor | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` | Generic Training Device · Generic Training Projector | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| XS-01-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| XS-01-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-out` | `monitor:hdmi-in-1` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 4 | hdmi-out |
| sw | 2 / 9 | hdmi-in-1, hdmi-out |
| monitor | 1 / 2 | hdmi-in-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · sw.power=true · monitor.power=true · sw.pgm=HDMI 1 · sw.hdmi-out=PROGRAM · monitor.source=HDMI 1 · site.power-check=true · site.format=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: front-cam, pgm-in1, tv-input, hdmi-out-pgm, installed, powered, channel-map, pre-power-check, pre-format, cues, no-black, quiz, signoff

### XS-02 · เส้นทางเสียง · Audio Path

- รูปแบบด่าน: `partial` · ใบงาน: ให้เสียงผู้สอนจากไมค์หนีบปกดังออกลำโพงหน้าห้องอย่างชัดเจน ไม่หอน
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `XS-02`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xs`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| lav | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| tx | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mix | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| pa | ลำโพงแอ็กทีฟหน้าห้อง (XS-PA-01) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| XS-02-E01 | lead-1 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| XS-02-E02 | lead-2 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` |  |
| XS-02-E03 | lead-3 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:main-out` | `pa:line-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| mix | 2 / 6 | in-1, main-out |
| pa | 1 / 1 | line-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-PA-ACTIVE×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): tx.power=true · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · mix.power=true · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-main=true · mix.main-fader=Unity · pa.power=true · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · site.soundcheck=true · site.mic-place=true
- fault: ไม่มี
- สาย distractor/spare: x-hdmi (VID-HDMI-A-A)
- objective ids: paired, meter, pa, soundcheck, installed, powered, channel-map, pre-soundcheck, pre-mic-place, quiz, signoff

### XS-03 · สลับสองแหล่งภาพ · Two-Source Switching

- รูปแบบด่าน: `scenario` · ใบงาน: สลับกล้องกับสไลด์ขึ้นจอห้องเรียน และตรวจภาพรายการเดียวกันใน OBS ผ่าน USB Webcam
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `XS-03`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xs`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Plus G2 | ไม่ | fixed |
| slides | โน้ตบุ๊กผู้สอน (XS-LAP-01) | `generic-laptop` | Generic Training Device · โน้ตบุ๊กนำเสนอจำลอง | ใช่ | installed·liftable |
| sw | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` | Blackmagic Design · Blackmagic ATEM Mini Pro | ไม่ | boxed→carry |
| monitor | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` | Generic Training Device · Generic Training Projector | ใช่ | fixed |
| host | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | boxed→carry |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| XS-03-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| XS-03-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `slides:hdmi-out` | `sw:hdmi-in-2` |  |
| XS-03-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-out` | `monitor:hdmi-in-1` |  |
| XS-03-E04 | lead-4 | DATA-USB-WEBCAM | USB-C→USB-A | `sw:usb` | `host:usb-1` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 4 | hdmi-out |
| slides | 1 / 1 | hdmi-out |
| sw | 4 / 9 | hdmi-in-1, hdmi-in-2, hdmi-out, usb |
| monitor | 1 / 2 | hdmi-in-1 |
| host | 1 / 3 | usb-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×3, DATA-USB-WEBCAM×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · slides.power=true · sw.power=true · monitor.power=true · slides.present=true · monitor.source=HDMI 1 · sw.pgm=HDMI 1 · sw.hdmi-out=PROGRAM · site.cable-route=true · host.power=true · host.video-src=USB video capture device · host.audio-src=None
- fault: ไม่มี
- สาย distractor/spare: x-usb (DATA-USB-A-A)
- objective ids: in1, in2, front, hdmi-out-pgm, both, installed, powered, channel-map, pre-cable-route, cues, no-black, quiz, signoff, webcam-installed, webcam-picture

### XS-04 · ซ่อมพอร์ตและการจับภาพ · Port and Capture Repair

- รูปแบบด่าน: `disruption` · ใบงาน: คาบเรียนออนไลน์กำลังจะเริ่ม แต่ OBS ไม่มีภาพและเสียง และจอหน้าห้องผิด — หาจุดเสียแล้วซ่อมทางกายภาพ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `XS-04`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xs`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Plus G2 | ไม่ | fixed |
| lav | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| tx | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mix | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` | Blackmagic Design · Blackmagic ATEM Mini Pro | ไม่ | boxed→carry |
| host | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | boxed→carry |
| monitor | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` | Generic Training Device · Generic Training Projector | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| XS-04-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` | ต่อไว้แล้ว |
| XS-04-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-out` | `monitor:hdmi-in-1` | ต่อไว้แล้ว |
| XS-04-E03 | lead-3 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` | ต่อไว้แล้ว |
| XS-04-E04 | lead-4 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` | ต่อไว้แล้ว |
| XS-04-E05 | lead-5 | AUD-TRS-635-35 | 6.35mm→3.5mm | `mix:aux-out` | `sw:mic-1` | ต่อไว้แล้ว |
| XS-04-E06 | lead-6 | DATA-USB-WEBCAM | USB-C→USB-A | `sw:usb` | `host:usb-1` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 4 | hdmi-out |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| mix | 2 / 6 | in-1, aux-out |
| sw | 4 / 9 | hdmi-in-1, hdmi-out, mic-1, usb |
| host | 1 / 3 | usb-1 |
| monitor | 1 / 2 | hdmi-in-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): DATA-USB-WEBCAM×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): rx.pair=Paired · mix.ch1-aux=true · site.soundcheck=true
- fault: f-input: กล้องถูกเสียบเข้า HDMI IN2 แทน IN1 · f-pair: ตัวรับไม่ได้จับคู่กับตัวส่ง · f-aux: เสียงผู้สอนส่งเข้า MAIN เท่านั้น ไม่ได้ส่งเข้า STREAM/AUX · f-usb: สาย USB เว็บแคมหลุด
- สาย distractor/spare: x-xlr (AUD-XLR-MIC), x-hdmi (VID-HDMI-A-A), x-usb (DATA-USB-A-A)
- objective ids: front, obs-video, obs-audio, recovered, installed, powered, channel-map, pre-soundcheck, cues, no-black, quiz, signoff

### XS-05 · ห้องเรียนไฮบริดครบระบบ · Full Hybrid Classroom

- รูปแบบด่าน: `certification` · ใบงาน: จัดห้องเรียนไฮบริดครบระบบ: กล้องและสไลด์ขึ้นจอหน้าห้องและ OBS, เสียงผู้สอนออกลำโพงในห้อง และส่งเข้าสตรีมแยกบัส โดยเสียงใน OBS ไม่ซ้อน
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `XS-05`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xs`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องห้องเรียน · Studio Camera 4K Plus G2 (XS-CAM-01) | `bmd-studio-camera-4k-plus-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Plus G2 | ไม่ | fixed |
| slides | โน้ตบุ๊กผู้สอน (XS-LAP-01) | `generic-laptop` | Generic Training Device · โน้ตบุ๊กนำเสนอจำลอง | ใช่ | installed·liftable |
| lav | ไมค์หนีบปกผู้สอน (XS-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| tx | ตัวส่งไร้สาย TX (XS-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไร้สาย RX (XS-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mix | มิกเซอร์ 4 ช่อง (XS-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Mini Pro (XS-SW-01) | `bmd-atem-mini-pro` | Blackmagic Design · Blackmagic ATEM Mini Pro | ไม่ | boxed→carry |
| monitor | โปรเจกเตอร์/จอหน้าห้อง (XS-DIS-01) | `generic-projector` | Generic Training Device · Generic Training Projector | ใช่ | fixed |
| pa | ลำโพงแอ็กทีฟหน้าห้อง (XS-PA-01) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| host | โน้ตบุ๊กสตรีม OBS (จำลอง) (XS-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | boxed→carry |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| XS-05-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| XS-05-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `slides:hdmi-out` | `sw:hdmi-in-2` |  |
| XS-05-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-out` | `monitor:hdmi-in-1` |  |
| XS-05-E04 | lead-4 | DATA-USB-WEBCAM | USB-C→USB-A | `sw:usb` | `host:usb-1` |  |
| XS-05-E05 | lead-5 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| XS-05-E06 | lead-6 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` |  |
| XS-05-E07 | lead-7 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:main-out` | `pa:line-in` |  |
| XS-05-E08 | lead-8 | AUD-TRS-635-35 | 6.35mm→3.5mm | `mix:aux-out` | `sw:mic-1` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 4 | hdmi-out |
| slides | 1 / 1 | hdmi-out |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| mix | 3 / 6 | in-1, main-out, aux-out |
| sw | 5 / 9 | hdmi-in-1, hdmi-in-2, hdmi-out, usb, mic-1 |
| monitor | 1 / 2 | hdmi-in-1 |
| pa | 1 / 1 | line-in |
| host | 1 / 3 | usb-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×3, DATA-USB-WEBCAM×1, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-PA-ACTIVE×1, AUD-TRS-635-35×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · slides.power=true · sw.power=true · monitor.power=true · host.power=true · tx.power=true · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · mix.power=true · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-main=true · mix.main-fader=Unity · mix.ch1-aux=true · mix.aux-master=Unity · slides.present=true · slides.mute-audio=true · sw.pgm=HDMI 1 · sw.hdmi-out=PROGRAM · sw.mic1-on=true · sw.mic1-mode=LINE · sw.emb-audio=OFF · monitor.source=HDMI 1 · pa.power=true · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · host.video-src=USB video capture device · host.audio-src=USB capture embedded audio · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.mic-place=true
- fault: s-rf: ตัวรับเปลี่ยนช่องความถี่ RF · s-mute: ช่องไมค์ในมิกเซอร์ถูก Mute · s-ain: ปิด MIC 1 ที่เครื่องสลับภาพ · s-usb: สาย USB เว็บแคมหลุด
- สาย distractor/spare: x-hdmi (VID-HDMI-A-A), x-usb (DATA-USB-A-A), x-xlr (AUD-XLR-MIC)
- objective ids: front, hdmi-out-pgm, obs-video, room, obs-audio, angles, recovered, installed, powered, channel-map, pre-power-check, pre-cable-route, pre-soundcheck, pre-mic-place, cues, no-black, quiz, signoff

## ST · สะพานจันทราแห่งเสียง (สตูดิโอ · ถ่ายทอดหลายกล้อง เสียงหลายไมค์ และจับภาพเข้า OBS)

### ST-01 · ภาพสตูดิโอ · Studio Video

- รูปแบบด่าน: `guided` · ใบงาน: ให้ภาพ CAM1 ขึ้นเป็นช่องหนึ่งในจอรวมภาพ (Multiview) ของห้องควบคุม
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `ST-01`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`s`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` | Generic Training Device · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| monitor | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| ST-01-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| ST-01-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-mv-out` | `monitor:hdmi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 1 | hdmi-out |
| sw | 2 / 7 | hdmi-in-1, hdmi-mv-out |
| monitor | 1 / 1 | hdmi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam1.framing=Framed for assignment · cam1.clean=true · sw.power=true · monitor.power=true · site.power-check=true · site.format=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: mv-cam1, in1, installed, powered, channel-map, pre-power-check, pre-format, quiz, signoff

### ST-02 · เสียงหลายไมค์ · Multi-Microphone Audio

- รูปแบบด่าน: `partial` · ใบงาน: พิธีกรและแขกรับเชิญต้องปรับเสียงได้แยกกัน ส่งเข้า Broadcast และฟังตรวจที่ลำโพงมอนิเตอร์
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `ST-02`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`s`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| lav1 | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| lav2 | ไมค์หนีบปก 2 (แขกรับเชิญ) (S-LAV-02) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx1 | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| tx2 | ตัวส่ง TX 2 (S-TX-02) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx1 | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx2 | ตัวรับ RX ช่อง 2 (S-RX-02) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mix | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` | Generic Training Device · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| speaker | Yamaha HS5 ลำโพงมอนิเตอร์ (S-HS5-01) | `yamaha-hs5` | Yamaha · Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | ไม่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| ST-02-E01 | lead-1 | AUD-LAV-TX | 3.5mm→3.5mm | `lav1:out` | `tx1:mic-in` |  |
| ST-02-E02 | lead-2 | AUD-LAV-TX | 3.5mm→3.5mm | `lav2:out` | `tx2:mic-in` |  |
| ST-02-E03 | lead-3 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx1:audio-out` | `mix:in-1` |  |
| ST-02-E04 | lead-4 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx2:audio-out` | `mix:in-2` |  |
| ST-02-E05 | lead-5 | AUD-TRS-635-35 | 6.35mm→3.5mm | `mix:aux-out` | `sw:audio-in` |  |
| ST-02-E06 | lead-6 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:main-out` | `speaker:xlr-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| lav1 | 1 / 1 | out |
| lav2 | 1 / 1 | out |
| tx1 | 1 / 1 | mic-in |
| tx2 | 1 / 1 | mic-in |
| rx1 | 1 / 1 | audio-out |
| rx2 | 1 / 1 | audio-out |
| mix | 4 / 6 | in-1, in-2, aux-out, main-out |
| sw | 1 / 7 | audio-in |
| speaker | 1 / 2 | xlr-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): AUD-LAV-TX×2, AUD-RX-MIXER-XLR×2, AUD-TRS-635-35×1, AUD-PA-ACTIVE×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): tx1.power=true · rx1.power=true · rx1.rf=CH 1 · rx1.pair=Paired · tx2.power=true · rx2.power=true · rx2.rf=CH 1 · rx2.pair=Paired · tx2.rf=CH 2 · rx2.rf=CH 2 · mix.power=true · mix.main-fader=Unity · mix.aux-master=Unity · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-main=true · mix.ch1-aux=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-main=true · mix.ch2-aux=true · sw.power=true · sw.ain-on=true · sw.emb-audio=OFF · speaker.power=true · site.soundcheck=true · site.mic-place=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: separate, broadcast, monitor, soundcheck, installed, powered, channel-map, pre-soundcheck, pre-mic-place, quiz, signoff

### ST-03 · สลับสามกล้อง · Three-Camera Switch

- รูปแบบด่าน: `scenario` · ใบงาน: ถ่ายสามมุม: โต๊ะผู้นำเสนอ มุมสัมภาษณ์ และฉากเขียว — สลับด้วยเครื่องสลับภาพ ไม่ใช่การย้ายสาย
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `ST-03`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`s`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| cam2 | CAM2 มุมสัมภาษณ์ (S-CAM-02) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| cam3 | CAM3 มุมฉากเขียว (S-CAM-03) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` | Generic Training Device · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| monitor | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| ST-03-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| ST-03-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `cam2:hdmi-out` | `sw:hdmi-in-2` |  |
| ST-03-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `cam3:hdmi-out` | `sw:hdmi-in-3` |  |
| ST-03-E04 | lead-4 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-mv-out` | `monitor:hdmi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 1 | hdmi-out |
| cam2 | 1 / 1 | hdmi-out |
| cam3 | 1 / 1 | hdmi-out |
| sw | 4 / 7 | hdmi-in-1, hdmi-in-2, hdmi-in-3, hdmi-mv-out |
| monitor | 1 / 1 | hdmi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×4
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam1.framing=Framed for assignment · cam1.clean=true · cam2.power=true · cam2.framing=Framed for assignment · cam2.clean=true · cam3.power=true · cam3.framing=Framed for assignment · cam3.clean=true · sw.power=true · monitor.power=true · site.cable-route=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: mv3, cuts, installed, powered, channel-map, pre-cable-route, cues, no-black, quiz, signoff

### ST-04 · แก้ปัญหาการจับภาพ · Capture Troubleshooting

- รูปแบบด่าน: `disruption` · ใบงาน: ผู้ชมออนไลน์เห็นภาพตารางรวมภาพแทนรายการ และไม่ได้ยินเสียง — หาสาเหตุและซ่อมทางกายภาพ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `ST-04`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`s`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| lav1 | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx1 | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx1 | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mix | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` | Generic Training Device · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| monitor | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |
| capture | Magewell USB Capture HDMI Gen 2 (S-CAP-01) | `magewell-usb-capture-hdmi-gen2` | Magewell · Magewell USB Capture HDMI Gen 2 | ไม่ | boxed→carry |
| host | โน้ตบุ๊ก OBS (จำลอง) (S-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | boxed→carry |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| ST-04-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` | ต่อไว้แล้ว |
| ST-04-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-mv-out` | `monitor:hdmi-in` | ต่อไว้แล้ว |
| ST-04-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-pgm-out` | `capture:hdmi-in` | ต่อไว้แล้ว |
| ST-04-E04 | lead-4 | DATA-USB-MAGEWELL | USB-A→USB-A | `capture:usb` | `host:usb-1` |  |
| ST-04-E05 | lead-5 | AUD-LAV-TX | 3.5mm→3.5mm | `lav1:out` | `tx1:mic-in` | ต่อไว้แล้ว |
| ST-04-E06 | lead-6 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx1:audio-out` | `mix:in-1` | ต่อไว้แล้ว |
| ST-04-E07 | lead-7 | AUD-TRS-635-35 | 6.35mm→3.5mm | `mix:aux-out` | `sw:audio-in` | ต่อไว้แล้ว |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 1 | hdmi-out |
| lav1 | 1 / 1 | out |
| tx1 | 1 / 1 | mic-in |
| rx1 | 1 / 1 | audio-out |
| mix | 2 / 6 | in-1, aux-out |
| sw | 4 / 7 | hdmi-in-1, hdmi-mv-out, hdmi-pgm-out, audio-in |
| monitor | 1 / 1 | hdmi-in |
| capture | 2 / 2 | hdmi-in, usb |
| host | 1 / 3 | usb-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): DATA-USB-MAGEWELL×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): mix.ch1-aux=true · host.video-src=USB video capture device · site.soundcheck=true
- fault: f-roles: สาย Capture ต่อจาก MULTIVIEW OUT แทน PGM OUT · f-bus: เสียงไมค์ไม่ได้ส่งเข้าบัส Broadcast · f-usb: สาย USB ของ Capture หลุด · f-obs: OBS ไม่ได้เลือก Video Capture Device
- สาย distractor/spare: x-hdmi (VID-HDMI-A-A), x-usb (DATA-USB-A-A)
- objective ids: mv, obs-video, obs-audio, recovered, installed, powered, channel-map, pre-soundcheck, quiz, signoff

### ST-05 · สตูดิโอครบระบบ · Full Studio

- รูปแบบด่าน: `certification` · ใบงาน: ประกอบสตูดิโอครบระบบ: สามกล้องสลับได้, ไมค์ไร้สาย 2 ตัวและไมค์สาย 1 ตัวแยกช่อง, Broadcast ฝังเข้า PGM, ฟังตรวจที่ HS5, จับภาพ PGM เข้า OBS
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `ST-05`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`s`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ) (S-CAM-01) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| cam2 | CAM2 มุมสัมภาษณ์ (S-CAM-02) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| cam3 | CAM3 มุมฉากเขียว (S-CAM-03) | `generic-hdmi-camera` | Generic Training Device · กล้องฝึก HDMI 1080p50 | ใช่ | fixed |
| sw | เครื่องสลับภาพสตูดิโอ (S-SW-01) | `generic-studio-switcher` | Generic Training Device · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| monitor | ทีวีรวมภาพ (Multiview) (S-MV-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |
| lav1 | ไมค์หนีบปก 1 (พิธีกร) (S-LAV-01) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| lav2 | ไมค์หนีบปก 2 (แขกรับเชิญ) (S-LAV-02) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx1 | ตัวส่ง TX 1 (S-TX-01) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| tx2 | ตัวส่ง TX 2 (S-TX-02) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx1 | ตัวรับ RX ช่อง 1 (S-RX-01) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx2 | ตัวรับ RX ช่อง 2 (S-RX-02) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| mic | ไมค์สาย XLR (S-MIC-01) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| mix | มิกเซอร์เสียง (S-MIX-01) | `generic-4ch-mixer` | Generic Training Device · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| speaker | Yamaha HS5 ลำโพงมอนิเตอร์ (S-HS5-01) | `yamaha-hs5` | Yamaha · Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | ไม่ | fixed |
| capture | Magewell USB Capture HDMI Gen 2 (S-CAP-01) | `magewell-usb-capture-hdmi-gen2` | Magewell · Magewell USB Capture HDMI Gen 2 | ไม่ | boxed→carry |
| host | โน้ตบุ๊ก OBS (จำลอง) (S-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | boxed→carry |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| ST-05-E01 | lead-1 | VID-HDMI-A-A | HDMI→HDMI | `cam1:hdmi-out` | `sw:hdmi-in-1` |  |
| ST-05-E02 | lead-2 | VID-HDMI-A-A | HDMI→HDMI | `cam2:hdmi-out` | `sw:hdmi-in-2` |  |
| ST-05-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `cam3:hdmi-out` | `sw:hdmi-in-3` |  |
| ST-05-E04 | lead-4 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-mv-out` | `monitor:hdmi-in` |  |
| ST-05-E05 | lead-5 | VID-HDMI-A-A | HDMI→HDMI | `sw:hdmi-pgm-out` | `capture:hdmi-in` |  |
| ST-05-E06 | lead-6 | DATA-USB-MAGEWELL | USB-A→USB-A | `capture:usb` | `host:usb-1` |  |
| ST-05-E07 | lead-7 | AUD-LAV-TX | 3.5mm→3.5mm | `lav1:out` | `tx1:mic-in` |  |
| ST-05-E08 | lead-8 | AUD-LAV-TX | 3.5mm→3.5mm | `lav2:out` | `tx2:mic-in` |  |
| ST-05-E09 | lead-9 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx1:audio-out` | `mix:in-1` |  |
| ST-05-E10 | lead-10 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx2:audio-out` | `mix:in-2` |  |
| ST-05-E11 | lead-11 | AUD-XLR-MIC | XLR-F→XLR-M | `mic:xlr-out` | `mix:in-3` |  |
| ST-05-E12 | lead-12 | AUD-TRS-635-35 | 6.35mm→3.5mm | `mix:aux-out` | `sw:audio-in` |  |
| ST-05-E13 | lead-13 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:main-out` | `speaker:xlr-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 1 | hdmi-out |
| cam2 | 1 / 1 | hdmi-out |
| cam3 | 1 / 1 | hdmi-out |
| sw | 6 / 7 | hdmi-in-1, hdmi-in-2, hdmi-in-3, hdmi-mv-out, hdmi-pgm-out, audio-in |
| monitor | 1 / 1 | hdmi-in |
| lav1 | 1 / 1 | out |
| lav2 | 1 / 1 | out |
| tx1 | 1 / 1 | mic-in |
| tx2 | 1 / 1 | mic-in |
| rx1 | 1 / 1 | audio-out |
| rx2 | 1 / 1 | audio-out |
| mic | 1 / 1 | xlr-out |
| mix | 5 / 6 | in-1, in-2, in-3, aux-out, main-out |
| speaker | 1 / 2 | xlr-in |
| capture | 2 / 2 | hdmi-in, usb |
| host | 1 / 3 | usb-1 |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-HDMI-A-A×5, DATA-USB-MAGEWELL×1, AUD-LAV-TX×2, AUD-RX-MIXER-XLR×2, AUD-XLR-MIC×1, AUD-TRS-635-35×1, AUD-PA-ACTIVE×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam1.framing=Framed for assignment · cam1.clean=true · cam2.power=true · cam2.framing=Framed for assignment · cam2.clean=true · cam3.power=true · cam3.framing=Framed for assignment · cam3.clean=true · tx1.power=true · rx1.power=true · rx1.rf=CH 1 · rx1.pair=Paired · tx2.power=true · rx2.power=true · rx2.rf=CH 1 · rx2.pair=Paired · tx2.rf=CH 2 · rx2.rf=CH 2 · mix.power=true · mix.main-fader=Unity · mix.aux-master=Unity · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-main=true · mix.ch1-aux=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-main=true · mix.ch2-aux=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-main=true · mix.ch3-aux=true · sw.power=true · sw.pgm=HDMI 1 · sw.ain-on=true · sw.emb-audio=OFF · monitor.power=true · speaker.power=true · host.power=true · host.video-src=USB video capture device · host.audio-src=USB capture embedded audio · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.mic-place=true
- fault: s-pair: ตัวรับ RX ช่อง 2 หลุดการจับคู่ · s-mute: ช่องไมค์สายถูก Mute · s-usb: สาย USB ของ Capture หลุด · s-ain: ปิด AUDIO IN ที่เครื่องสลับภาพ
- สาย distractor/spare: x-hdmi (VID-HDMI-A-A), x-usb (DATA-USB-A-A), x-xlr (AUD-XLR-MIC)
- objective ids: mv3, obs-video, obs-audio, monitor, cuts, recovered, installed, powered, channel-map, pre-power-check, pre-cable-route, pre-soundcheck, pre-mic-place, cues, no-black, quiz, signoff

## AU · หอคอยกระจกสลับภาพ (หอประชุมใหญ่ · กล้อง SDI สไลด์ เวที และเสียง PA/Broadcast แยกกัน)

### AU-01 · กล้องหลักสู่จอเวที · Main Camera to Stage Display

- รูปแบบด่าน: `guided` · ใบงาน: นำภาพกล้องกลางหลังห้องขึ้นจอเวที
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `AU-01`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`m`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| convSH | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` | Blackmagic Design · Blackmagic Micro Converter SDI to HDMI 3G | ไม่ | boxed→carry |
| display | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| AU-01-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| AU-01-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `sw:aux-1` | `convSH:sdi-in` |  |
| AU-01-E03 | lead-3 | VID-HDMI-A-A | HDMI→HDMI | `convSH:hdmi-out` | `display:hdmi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| sw | 2 / 19 | sdi-in-1, aux-1 |
| convSH | 2 / 4 | sdi-in, hdmi-out |
| display | 1 / 1 | hdmi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×2, VID-HDMI-A-A×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam1.framing=Framed for assignment · sw.power=true · sw.pgm=SDI 1 · sw.aux-1=PROGRAM · convSH.power=true · display.power=true · site.power-check=true · site.format=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: stage, conv, out, installed, powered, channel-map, pre-power-check, pre-format, cues, no-black, quiz, signoff

### AU-02 · ไมค์เวทีผ่านมัลติคอร์และสองบัส

- รูปแบบด่าน: `partial` · ใบงาน: AU-02 · ให้เสียงโพเดียมดังในห้องและเข้าระบบถ่ายทอดแยกกัน
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `AU-02`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`m`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| podium | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| stagebox | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| paL | ลำโพง PA ซ้าย (M-PA-L) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| paR | ลำโพง PA ขวา (M-PA-R) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| hand1 | ไมค์ไร้สายมือถือ 1 พร้อมตัวส่ง (M-HAND-1) | `reference-handheld-tx` | โมเดลจำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | ใช่ | installed·liftable |
| hrx1 | ตัวรับไมค์มือถือ 1 (M-HRX-1) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| AU-02-E01 | lead-1 | AUD-XLR-MIC | XLR-F→XLR-M | `podium:xlr-out` | `stagebox:mic-in-1` |  |
| AU-02-E02 | lead-2 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `hrx1:audio-out` | `stagebox:mic-in-2` |  |
| AU-02-E03 | lead-3 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` |  |
| AU-02-E04 | lead-4 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` |  |
| AU-02-E05 | lead-5 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-2` | `mix:in-2` |  |
| AU-02-E06 | lead-6 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `paL:line-in` |  |
| AU-02-E07 | lead-7 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-r` | `paR:line-in` |  |
| AU-02-E08 | lead-8 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-l` | `sw:xlr-l` |  |
| AU-02-E09 | lead-9 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-r` | `sw:xlr-r` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| podium | 1 / 1 | xlr-out |
| stagebox | 3 / 7 | mic-in-1, mic-in-2, multicore |
| tail | 3 / 7 | multicore, tail-1, tail-2 |
| mix | 6 / 10 | in-1, in-2, pa-l, pa-r, bc-l, bc-r |
| paL | 1 / 1 | line-in |
| paR | 1 / 1 | line-in |
| sw | 2 / 19 | xlr-l, xlr-r |
| hand1 | 0 / 0 | — |
| hrx1 | 1 / 1 | audio-out |

- กระเป๋าที่ต้องใช้ (คำนวณ): AUD-XLR-MIC×3, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×2, AUD-XLR-LINE-BAL×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): mix.power=true · paL.power=true · paR.power=true · sw.power=true · hand1.power=true · hrx1.power=true · paL.power=true · paL.level=Nominal · paL.aim=In front of the mic, aimed at audience · paR.power=true · paR.level=Nominal · paR.aim=In front of the mic, aimed at audience · sw.power=true · sw.xlr-on=true · site.soundcheck=true · site.mic-place=true · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · hand1.power=true · hand1.rf=CH 1 · hrx1.power=true · hrx1.rf=CH 1 · hrx1.pair=Paired · site.soundcheck=true · site.mic-place=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-soundcheck, pre-mic-place, pa, lr, soundcheck, audio-paL, audio-paR, audio-sw, quiz, signoff

### AU-03 · กล้องและสไลด์ · Cameras and Slides

- รูปแบบด่าน: `scenario` · ใบงาน: ห้าแหล่งภาพต้องเลือกได้ทั้งหมด จอเวทีต้องแสดงภาพ PGM ที่สะอาด ไม่ใช่ Multiview
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `AU-03`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`m`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| ptz | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` | Generic Training Device · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | ใช่ | fixed |
| slides | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` | Generic Training Device · โน้ตบุ๊กนำเสนอจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| convSH | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` | Blackmagic Design · Blackmagic Micro Converter SDI to HDMI 3G | ไม่ | boxed→carry |
| display | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| AU-03-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| AU-03-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` |  |
| AU-03-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `sw:sdi-in-3` |  |
| AU-03-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `ptz:sdi-out` | `sw:sdi-in-4` |  |
| AU-03-E05 | lead-5 | VID-HDMI-A-A | HDMI→HDMI | `slides:hdmi-out` | `convHS:hdmi-in` |  |
| AU-03-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `sw:sdi-in-5` |  |
| AU-03-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |
| AU-03-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `sw:aux-1` | `convSH:sdi-in` |  |
| AU-03-E09 | lead-9 | VID-HDMI-A-A | HDMI→HDMI | `convSH:hdmi-out` | `display:hdmi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| ptz | 1 / 1 | sdi-out |
| slides | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |
| sw | 7 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, mv-out, aux-1 |
| monitor | 1 / 4 | sdi-in |
| convSH | 2 / 4 | sdi-in, hdmi-out |
| display | 1 / 1 | hdmi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×7, VID-HDMI-A-A×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam1.framing=Framed for assignment · cam2.power=true · cam2.framing=Framed for assignment · cam3.power=true · cam3.framing=Framed for assignment · ptz.power=true · ptz.framing=Framed for assignment · slides.power=true · slides.present=true · slides.mute-audio=true · convHS.power=true · convSH.power=true · sw.power=true · sw.aux-1=PROGRAM · sw.pgm=SDI 1 · monitor.power=true · display.power=true · site.cable-route=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: mv5, stage, five, installed, powered, channel-map, pre-cable-route, cues, no-black, quiz, signoff

### AU-04 · ซ่อมระบบหอประชุม · Auditorium Fault Repair

- รูปแบบด่าน: `disruption` · ใบงาน: ก่อนเริ่มงาน 15 นาที: จอเวทีดำ กล้อง 2 หาย และเสียงโพเดียมไม่เข้าระบบถ่ายทอด — คืนบทบาทพอร์ตและสัญญาณให้ถูก
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `AU-04`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`m`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| ptz | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` | Generic Training Device · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | ใช่ | fixed |
| slides | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` | Generic Training Device · โน้ตบุ๊กนำเสนอจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| convSH | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` | Blackmagic Design · Blackmagic Micro Converter SDI to HDMI 3G | ไม่ | boxed→carry |
| display | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |
| podium | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| stagebox | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| AU-04-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` | ต่อไว้แล้ว |
| AU-04-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` | ต่อไว้แล้ว |
| AU-04-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `sw:sdi-in-3` | ต่อไว้แล้ว |
| AU-04-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `ptz:sdi-out` | `sw:sdi-in-4` | ต่อไว้แล้ว |
| AU-04-E05 | lead-5 | VID-HDMI-A-A | HDMI→HDMI | `slides:hdmi-out` | `convHS:hdmi-in` | ต่อไว้แล้ว |
| AU-04-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `sw:sdi-in-5` | ต่อไว้แล้ว |
| AU-04-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` | ต่อไว้แล้ว |
| AU-04-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `sw:aux-1` | `convSH:sdi-in` | ต่อไว้แล้ว |
| AU-04-E09 | lead-9 | VID-HDMI-A-A | HDMI→HDMI | `convSH:hdmi-out` | `display:hdmi-in` | ต่อไว้แล้ว |
| AU-04-E10 | lead-10 | AUD-XLR-MIC | XLR-F→XLR-M | `podium:xlr-out` | `stagebox:mic-in-1` | ต่อไว้แล้ว |
| AU-04-E11 | lead-11 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` | ต่อไว้แล้ว |
| AU-04-E12 | lead-12 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` | ต่อไว้แล้ว |
| AU-04-E13 | lead-13 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-l` | `sw:xlr-l` | ต่อไว้แล้ว |
| AU-04-E14 | lead-14 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-r` | `sw:xlr-r` | ต่อไว้แล้ว |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| ptz | 1 / 1 | sdi-out |
| slides | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |
| sw | 9 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, mv-out, aux-1, xlr-l, xlr-r |
| monitor | 1 / 4 | sdi-in |
| convSH | 2 / 4 | sdi-in, hdmi-out |
| display | 1 / 1 | hdmi-in |
| podium | 1 / 1 | xlr-out |
| stagebox | 2 / 7 | mic-in-1, multicore |
| tail | 2 / 7 | multicore, tail-1 |
| mix | 3 / 10 | in-1, bc-l, bc-r |

- กระเป๋าที่ต้องใช้ (คำนวณ): ไม่มี
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): convSH.power=true · sw.aux-1=PROGRAM · mix.ch1-bc=true · site.soundcheck=true
- fault: f-ref: กล้อง 2 เสียบเข้า REF IN แทน SDI IN · f-conv: ตัวแปลง SDI→HDMI ไม่มีไฟเลี้ยง · f-aux: AUX 1 เลือกแหล่งภาพผิด (กล้อง 3 แทน PROGRAM) · f-bus: ไมค์โพเดียมส่งเข้า PA แทน Broadcast
- สาย distractor/spare: x-sdi1 (VID-SDI-3G), x-sdi2 (VID-SDI-3G), x-hdmi (VID-HDMI-A-A), x-xlr (AUD-XLR-MIC)
- objective ids: cam2, stage, bc, recovered, installed, powered, channel-map, pre-soundcheck, cues, no-black, quiz, signoff

### AU-05 · หอประชุมพร้อมภาพเสียงและบันทึกครบระบบ

- รูปแบบด่าน: `certification` · ใบงาน: AU-05 · จัดงานเต็มระบบ: ห้าแหล่งภาพ, จอเวทีจาก AUX, Multiview ที่ FOH, PGM สะอาดไป Capture/OBS และเครื่องบันทึกแยกขาออก, เสียงสามแหล่งผ่าน Stagebox แยก PA และ Broadcast
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `AU-05`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`m`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้อง 1 กลางหลังห้อง · Studio Camera 4K Pro G2 (M-CAM-01) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้อง 2 ซ้าย · Studio Camera 4K Pro G2 (M-CAM-02) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้อง 3 ขวา · Studio Camera 4K Pro G2 (M-CAM-03) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| ptz | กล้อง PTZ (ติดตั้งถาวร) (M-PTZ-01) | `generic-sdi-ptz` | Generic Training Device · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | ใช่ | fixed |
| slides | โน้ตบุ๊กนำเสนอ (M-LAP-01) | `generic-laptop` | Generic Training Device · โน้ตบุ๊กนำเสนอจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (M-CONV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (M-SW-01) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอ Multiview FOH (SDI) · SmartView Duo (M-MV-01) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| convSH | Micro Converter SDI→HDMI 3G (M-CONV-SH) | `bmd-micro-converter-sdi-hdmi-3g` | Blackmagic Design · Blackmagic Micro Converter SDI to HDMI 3G | ไม่ | boxed→carry |
| display | จอเวที (HDMI) (M-STAGE-01) | `generic-hdmi-monitor` | Generic Training Device · Generic HDMI Training Monitor | ใช่ | fixed |
| podium | ไมค์โพเดียม (M-MIC-POD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| stagebox | Stagebox อนาล็อก (M-SBX-01) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายมัลติคอร์ FOH (M-TAIL-01) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | มิกเซอร์ FOH (M-MIX-01) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| paL | ลำโพง PA ซ้าย (M-PA-L) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| paR | ลำโพง PA ขวา (M-PA-R) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| capture | Magewell USB Capture SDI Gen 2 (M-CAP-01) | `magewell-usb-capture-sdi-gen2` | Magewell · Magewell USB Capture SDI Gen 2 (32070) | ไม่ | boxed→carry |
| host | คอมพิวเตอร์สตรีม OBS (จำลอง) (M-OBS-01) | `generic-obs-host` | Generic Training Device · คอมพิวเตอร์ OBS จำลอง | ใช่ | installed·liftable |
| rec | HyperDeck Studio HD Plus (M-REC-01) | `bmd-hyperdeck-studio-hd-plus` | Blackmagic Design · Blackmagic HyperDeck Studio HD Plus | ไม่ | boxed→carry |
| hand1 | ไมค์ไร้สายมือถือ 1 พร้อมตัวส่ง (M-HAND-1) | `reference-handheld-tx` | โมเดลจำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | ใช่ | installed·liftable |
| hrx1 | ตัวรับไมค์มือถือ 1 (M-HRX-1) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| hand2 | ไมค์ไร้สายมือถือ 2 พร้อมตัวส่ง (M-HAND-2) | `reference-handheld-tx` | โมเดลจำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | ใช่ | installed·liftable |
| hrx2 | ตัวรับไมค์มือถือ 2 (M-HRX-2) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| lav1 | ไมค์หนีบปก 1 (M-LAV-1) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| lav2 | ไมค์หนีบปก 2 (M-LAV-2) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx1 | ตัวส่งไมค์หนีบปก 1 (M-TX-1) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx2 | ตัวส่งไมค์หนีบปก 2 (M-TX-2) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| rx1 | ตัวรับไมค์หนีบปก 1 (M-RX-1) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| rx2 | ตัวรับไมค์หนีบปก 2 (M-RX-2) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| AU-05-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| AU-05-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` |  |
| AU-05-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `sw:sdi-in-3` |  |
| AU-05-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `ptz:sdi-out` | `sw:sdi-in-4` |  |
| AU-05-E05 | lead-5 | VID-HDMI-A-A | HDMI→HDMI | `slides:hdmi-out` | `convHS:hdmi-in` |  |
| AU-05-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `sw:sdi-in-5` |  |
| AU-05-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |
| AU-05-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `sw:aux-1` | `convSH:sdi-in` |  |
| AU-05-E09 | lead-9 | VID-HDMI-A-A | HDMI→HDMI | `convSH:hdmi-out` | `display:hdmi-in` |  |
| AU-05-E10 | lead-10 | VID-SDI-3G | SDI→SDI | `sw:aux-2` | `capture:sdi-in` |  |
| AU-05-E11 | lead-11 | DATA-USB-MAGEWELL | USB-A→USB-A | `capture:usb` | `host:usb-1` |  |
| AU-05-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `sw:pgm-out` | `rec:sdi-in` |  |
| AU-05-E13 | lead-13 | AUD-XLR-MIC | XLR-F→XLR-M | `podium:xlr-out` | `stagebox:mic-in-1` |  |
| AU-05-E14 | lead-14 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `hrx1:audio-out` | `stagebox:mic-in-2` |  |
| AU-05-E15 | lead-15 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `hrx2:audio-out` | `stagebox:mic-in-3` |  |
| AU-05-E16 | lead-16 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx1:audio-out` | `stagebox:mic-in-4` |  |
| AU-05-E17 | lead-17 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx2:audio-out` | `stagebox:mic-in-5` |  |
| AU-05-E18 | lead-18 | AUD-LAV-TX | 3.5mm→3.5mm | `lav1:out` | `tx1:mic-in` |  |
| AU-05-E19 | lead-19 | AUD-LAV-TX | 3.5mm→3.5mm | `lav2:out` | `tx2:mic-in` |  |
| AU-05-E20 | lead-20 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` |  |
| AU-05-E21 | lead-21 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` |  |
| AU-05-E22 | lead-22 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-2` | `mix:in-2` |  |
| AU-05-E23 | lead-23 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-3` | `mix:in-3` |  |
| AU-05-E24 | lead-24 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-4` | `mix:in-4` |  |
| AU-05-E25 | lead-25 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-5` | `mix:in-5` |  |
| AU-05-E26 | lead-26 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `paL:line-in` |  |
| AU-05-E27 | lead-27 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-r` | `paR:line-in` |  |
| AU-05-E28 | lead-28 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-l` | `sw:xlr-l` |  |
| AU-05-E29 | lead-29 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-r` | `sw:xlr-r` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| ptz | 1 / 1 | sdi-out |
| slides | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |
| sw | 11 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, mv-out, aux-1, aux-2, pgm-out, xlr-l, xlr-r |
| monitor | 1 / 4 | sdi-in |
| convSH | 2 / 4 | sdi-in, hdmi-out |
| display | 1 / 1 | hdmi-in |
| podium | 1 / 1 | xlr-out |
| stagebox | 6 / 7 | mic-in-1, mic-in-2, mic-in-3, mic-in-4, mic-in-5, multicore |
| tail | 6 / 7 | multicore, tail-1, tail-2, tail-3, tail-4, tail-5 |
| mix | 9 / 10 | in-1, in-2, in-3, in-4, in-5, pa-l, pa-r, bc-l, bc-r |
| paL | 1 / 1 | line-in |
| paR | 1 / 1 | line-in |
| capture | 2 / 2 | sdi-in, usb |
| host | 1 / 3 | usb-1 |
| rec | 1 / 8 | sdi-in |
| hand1 | 0 / 0 | — |
| hrx1 | 1 / 1 | audio-out |
| hand2 | 0 / 0 | — |
| hrx2 | 1 / 1 | audio-out |
| lav1 | 1 / 1 | out |
| lav2 | 1 / 1 | out |
| tx1 | 1 / 1 | mic-in |
| tx2 | 1 / 1 | mic-in |
| rx1 | 1 / 1 | audio-out |
| rx2 | 1 / 1 | audio-out |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×9, VID-HDMI-A-A×2, DATA-USB-MAGEWELL×1, AUD-XLR-MIC×6, AUD-RX-MIXER-XLR×4, AUD-LAV-TX×2, STG-MULTICORE×1, AUD-PA-ACTIVE×2, AUD-XLR-LINE-BAL×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam2.power=true · cam3.power=true · ptz.power=true · slides.power=true · convHS.power=true · sw.power=true · monitor.power=true · convSH.power=true · display.power=true · mix.power=true · paL.power=true · paR.power=true · host.power=true · rec.power=true · hand1.power=true · hrx1.power=true · hand2.power=true · hrx2.power=true · tx1.power=true · tx2.power=true · rx1.power=true · rx2.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · ptz.framing=Framed for assignment · cam1.power=true · cam1.framing=Framed for assignment · cam2.power=true · cam2.framing=Framed for assignment · cam3.power=true · cam3.framing=Framed for assignment · ptz.power=true · ptz.framing=Framed for assignment · slides.power=true · slides.present=true · slides.mute-audio=true · convHS.power=true · convSH.power=true · sw.power=true · sw.aux-1=PROGRAM · sw.pgm=SDI 1 · monitor.power=true · display.power=true · sw.aux-2=PROGRAM · sw.xlr-on=true · sw.emb-audio=OFF · paL.power=true · paL.level=Nominal · paL.aim=In front of the mic, aimed at audience · paR.power=true · paR.level=Nominal · paR.aim=In front of the mic, aimed at audience · host.power=true · host.video-src=USB video capture device · host.audio-src=USB capture embedded audio · rec.power=true · rec.media=SD card mounted (512 GB free) · rec.record=true · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.mic-place=true · site.storage=true · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.ch4-gain=Nominal (peaks −18 dBFS) · mix.ch4-on=true · mix.ch4-pa=true · mix.ch4-bc=true · mix.ch5-gain=Nominal (peaks −18 dBFS) · mix.ch5-on=true · mix.ch5-pa=true · mix.ch5-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · hand1.power=true · hand1.rf=CH 1 · hrx1.power=true · hrx1.rf=CH 1 · hrx1.pair=Paired · hand2.power=true · hand2.rf=CH 1 · hrx2.power=true · hrx2.rf=CH 1 · hrx2.pair=Paired · tx1.power=true · tx1.rf=CH 1 · rx1.power=true · rx1.rf=CH 1 · rx1.pair=Paired · tx2.power=true · tx2.rf=CH 1 · rx2.power=true · rx2.rf=CH 1 · rx2.pair=Paired · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.mic-place=true · site.storage=true
- fault: s-mv: AUX 1 ไปจอเวทีถูกเปลี่ยนเป็นภาพกล้อง 3 · s-conv: ตัวแปลงไปจอเวทีไฟดับ · s-bc: บัส Broadcast ถูกลดลง · s-full: สื่อบันทึกเต็ม · s-usb: สาย USB ของ Capture หลุด
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-soundcheck, pre-mic-place, pre-storage, mv5, stage, rec, audio-paL, audio-paR, obs-full, clean-program, framing, cues, no-black, recovered, quiz, signoff

## OUT · คลังตราพอร์ตโบราณ (พื้นที่ถ่ายทอดกลางแจ้ง · พอร์ต ตัวแปลง การต่อสาย และความปลอดภัย)

### OUT-01 · เส้นทางภาพภาคสนาม

- รูปแบบด่าน: `guided` · ใบงาน: OUT-01 · ต่อกล้องใกล้ผ่านเครื่องสลับภาพและตรวจจอรวมภาพ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `OUT-01`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`l`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| OUT-01-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| OUT-01-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| sw | 2 / 19 | sdi-in-1, mv-out |
| monitor | 1 / 4 | sdi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · sw.power=true · monitor.power=true · cam1.framing=Framed for assignment · sw.pgm=SDI 1 · sw.emb-audio=OFF · site.power-check=true · site.cable-route=true · site.shelter=true · site.power-signoff=true · site.ramp=true · site.decision=GO
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-shelter, pre-power-signoff, pre-ramp, safe, mv, clean-program, framing, quiz, signoff

### OUT-02 · เส้นทางเสียงภาคสนาม

- รูปแบบด่าน: `partial` · ใบงาน: OUT-02 · จับคู่ไมค์พิธีกร รับเสียงเวทีและบรรยากาศ แล้วส่ง PA โดยแยกบัสรายการ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `OUT-02`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`l`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| lav | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| shotgun | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` | โมเดลจำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | ใช่ | fixed |
| amb | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| mix | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| OUT-02-E01 | lead-1 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| OUT-02-E02 | lead-2 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` |  |
| OUT-02-E03 | lead-3 | AUD-XLR-MIC | XLR-F→XLR-M | `shotgun:xlr-out` | `mix:in-2` |  |
| OUT-02-E04 | lead-4 | AUD-XLR-MIC | XLR-F→XLR-M | `amb:xlr-out` | `mix:in-3` |  |
| OUT-02-E05 | lead-5 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| shotgun | 1 / 1 | xlr-out |
| amb | 1 / 1 | xlr-out |
| mix | 4 / 10 | in-1, in-2, in-3, pa-l |
| pa | 1 / 1 | line-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-XLR-MIC×2, AUD-PA-ACTIVE×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): tx.power=true · rx.power=true · mix.power=true · pa.power=true · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · mix.ch2-phantom=true · shotgun.windscreen=true · amb.windscreen=true · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · site.power-check=true · site.soundcheck=true · site.cable-route=true · site.shelter=true · site.power-signoff=true · site.ramp=true · site.decision=GO
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-soundcheck, pre-cable-route, pre-shelter, pre-power-signoff, pre-ramp, safe, audio-pa, broadcast-bus, quiz, signoff

### OUT-03 · กล้องไกลและการสลับภาพ

- รูปแบบด่าน: `scenario` · ใบงาน: OUT-03 · ติดตั้งคู่ Optical ของกล้อง C และสลับภาพ A/B/C ด้วย Preview ก่อน Program
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `OUT-03`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`l`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| fiberTx | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` | โมเดลจำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| fiberRx | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` | โมเดลจำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| OUT-03-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| OUT-03-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` |  |
| OUT-03-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `fiberTx:sdi-in` |  |
| OUT-03-E04 | lead-4 | FIB-SDI-LINK | FIBER→FIBER | `fiberTx:optical-out` | `fiberRx:optical-in` |  |
| OUT-03-E05 | lead-5 | VID-SDI-3G | SDI→SDI | `fiberRx:sdi-out` | `sw:sdi-in-3` |  |
| OUT-03-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| fiberTx | 2 / 2 | sdi-in, optical-out |
| fiberRx | 2 / 2 | optical-in, sdi-out |
| sw | 4 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, mv-out |
| monitor | 1 / 4 | sdi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×5, FIB-SDI-LINK×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam2.power=true · cam3.power=true · fiberTx.power=true · fiberRx.power=true · sw.power=true · monitor.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · sw.pgm=SDI 1 · sw.emb-audio=OFF · site.power-check=true · site.cable-route=true · site.shelter=true · site.power-signoff=true · site.ramp=true · site.decision=GO
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-shelter, pre-power-signoff, pre-ramp, safe, mv, input-1, input-2, input-3, clean-program, framing, cues, no-black, quiz, signoff

### OUT-04 · ซ่อมระบบส่งภาพและเสียงกลางแจ้ง

- รูปแบบด่าน: `disruption` · ใบงาน: OUT-04 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `OUT-04`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`l`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| fiberTx | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` | โมเดลจำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| fiberRx | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` | โมเดลจำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| lav | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| shotgun | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` | โมเดลจำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | ใช่ | fixed |
| amb | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| mix | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| embed | ตัวฝังเสียง AJA 3G-AMA (พร้อมสาย breakout) (L-EMBED) | `aja-3g-ama` | AJA Video Systems · AJA 3G-AMA | ไม่ | installed·liftable |
| enc | ตัวเข้ารหัส Streaming Encoder HD (L-ENC) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | installed·liftable |
| net | เกตเวย์เครือข่ายสายหลัก (OUT-NET) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | installed·liftable |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (OUT-WAN) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| OUT-04-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` | ต่อไว้แล้ว |
| OUT-04-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` | ต่อไว้แล้ว |
| OUT-04-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `fiberTx:sdi-in` | ต่อไว้แล้ว |
| OUT-04-E04 | lead-4 | FIB-SDI-LINK | FIBER→FIBER | `fiberTx:optical-out` | `fiberRx:optical-in` | ต่อไว้แล้ว |
| OUT-04-E05 | lead-5 | VID-SDI-3G | SDI→SDI | `fiberRx:sdi-out` | `sw:sdi-in-3` |  |
| OUT-04-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` | ต่อไว้แล้ว |
| OUT-04-E07 | lead-7 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` | ต่อไว้แล้ว |
| OUT-04-E08 | lead-8 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` | ต่อไว้แล้ว |
| OUT-04-E09 | lead-9 | AUD-XLR-MIC | XLR-F→XLR-M | `shotgun:xlr-out` | `mix:in-2` | ต่อไว้แล้ว |
| OUT-04-E10 | lead-10 | AUD-XLR-MIC | XLR-F→XLR-M | `amb:xlr-out` | `mix:in-3` | ต่อไว้แล้ว |
| OUT-04-E11 | lead-11 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` | ต่อไว้แล้ว |
| OUT-04-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `sw:pgm-out` | `embed:sdi-in` | ต่อไว้แล้ว |
| OUT-04-E13 | lead-13 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-l` | `embed:audio-l` | ต่อไว้แล้ว |
| OUT-04-E14 | lead-14 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-r` | `embed:audio-r` | ต่อไว้แล้ว |
| OUT-04-E15 | lead-15 | VID-SDI-3G | SDI→SDI | `embed:sdi-out` | `enc:sdi-in` | ต่อไว้แล้ว |
| OUT-04-E16 | lead-16 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc:eth` | `net:lan-1` | ต่อไว้แล้ว |
| OUT-04-E17 | lead-17 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net:wan` | `wan:wan-in` | ต่อไว้แล้ว |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| fiberTx | 2 / 2 | sdi-in, optical-out |
| fiberRx | 2 / 2 | optical-in, sdi-out |
| sw | 5 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, mv-out, pgm-out |
| monitor | 1 / 4 | sdi-in |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| shotgun | 1 / 1 | xlr-out |
| amb | 1 / 1 | xlr-out |
| mix | 6 / 10 | in-1, in-2, in-3, pa-l, bc-l, bc-r |
| pa | 1 / 1 | line-in |
| embed | 4 / 4 | sdi-in, audio-l, audio-r, sdi-out |
| enc | 2 / 6 | sdi-in, eth |
| net | 2 / 3 | lan-1, wan |
| wan | 1 / 1 | wan-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam2.power=true · cam3.power=true · fiberTx.power=true · fiberRx.power=true · sw.power=true · monitor.power=true · tx.power=true · rx.power=true · mix.power=true · pa.power=true · embed.power=true · enc.power=true · net.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · sw.pgm=SDI 1 · sw.emb-audio=OFF · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · mix.ch2-phantom=true · shotgun.windscreen=true · amb.windscreen=true · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · embed.embed=true · enc.format=1080p50 · enc.stream-key=•••• (private test) · enc.stream=true · net.wan-link=Up · net.uplink-test=true · site.power-check=true · site.cable-route=true · site.ramp=true · site.shelter=true · site.soundcheck=true · site.power-signoff=true · site.decision=GO
- fault: f-physical-link: สายจากระบบกล้องเข้าฝ่ายควบคุมหลุด · f-embed: อุปกรณ์ฝังเสียงยังไม่เปิดการฝังรายการ
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-ramp, pre-shelter, pre-soundcheck, pre-power-signoff, safe, mv, input-1, input-2, input-3, audio-pa, embed, ingest, clean-program, framing, cues, no-black, recovered, quiz, signoff

### OUT-05 · ถ่ายทอดภาคสนามครบเส้นทาง

- รูปแบบด่าน: `certification` · ใบงาน: OUT-05 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `OUT-05`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`l`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องใกล้ A · Studio Camera 4K Pro G2 (L-CAM-A) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam2 | กล้องใกล้ B · Studio Camera 4K Pro G2 (L-CAM-B) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| cam3 | กล้องไกล C · Studio Camera 4K Pro G2 (L-CAM-C) | `bmd-studio-camera-4k-pro-g2` | Blackmagic Design · Blackmagic Studio Camera 4K Pro G2 | ไม่ | fixed |
| fiberTx | ตัวส่ง Optical ข้างกล้องไกล (L-FIB-TX) | `reference-fiber-tx` | โมเดลจำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| fiberRx | ตัวรับ Optical ข้างเต็นท์ (L-FIB-RX) | `reference-fiber-rx` | โมเดลจำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | ใช่ | boxed→carry |
| sw | เครื่องสลับภาพ ATEM Television Studio HD8 ISO (L-SW) | `bmd-atem-television-studio-hd8-iso` | Blackmagic Design · Blackmagic ATEM Television Studio HD8 ISO | ไม่ | installed·liftable |
| monitor | จอรวมภาพภาคสนาม · SmartView Duo (L-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| lav | ไมค์หนีบปกพิธีกร (L-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | installed·liftable |
| tx | ตัวส่งไมค์พิธีกร (L-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์พิธีกร (L-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| shotgun | ไมค์ช็อตกัน (L-SHOT) | `reference-shotgun` | โมเดลจำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | ใช่ | fixed |
| amb | ไมค์บรรยากาศ (L-AMB) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| mix | มิกเซอร์ภาคสนาม PA / BROADCAST (L-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ลำโพง PA ภาคสนาม (L-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| embed | ตัวฝังเสียง AJA 3G-AMA (พร้อมสาย breakout) (L-EMBED) | `aja-3g-ama` | AJA Video Systems · AJA 3G-AMA | ไม่ | installed·liftable |
| enc | ตัวเข้ารหัส Streaming Encoder HD (L-ENC) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | installed·liftable |
| net | เกตเวย์เครือข่ายสายหลัก (OUT-NET) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | installed·liftable |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (OUT-WAN) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| OUT-05-E01 | lead-1 | VID-SDI-3G | SDI→SDI | `cam1:sdi-out` | `sw:sdi-in-1` |  |
| OUT-05-E02 | lead-2 | VID-SDI-3G | SDI→SDI | `cam2:sdi-out` | `sw:sdi-in-2` |  |
| OUT-05-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `cam3:sdi-out` | `fiberTx:sdi-in` |  |
| OUT-05-E04 | lead-4 | FIB-SDI-LINK | FIBER→FIBER | `fiberTx:optical-out` | `fiberRx:optical-in` |  |
| OUT-05-E05 | lead-5 | VID-SDI-3G | SDI→SDI | `fiberRx:sdi-out` | `sw:sdi-in-3` |  |
| OUT-05-E06 | lead-6 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |
| OUT-05-E07 | lead-7 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| OUT-05-E08 | lead-8 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `mix:in-1` |  |
| OUT-05-E09 | lead-9 | AUD-XLR-MIC | XLR-F→XLR-M | `shotgun:xlr-out` | `mix:in-2` |  |
| OUT-05-E10 | lead-10 | AUD-XLR-MIC | XLR-F→XLR-M | `amb:xlr-out` | `mix:in-3` |  |
| OUT-05-E11 | lead-11 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` |  |
| OUT-05-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `sw:pgm-out` | `embed:sdi-in` |  |
| OUT-05-E13 | lead-13 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-l` | `embed:audio-l` |  |
| OUT-05-E14 | lead-14 | AUD-XLR-LINE-BAL | XLR-F→XLR-M | `mix:bc-r` | `embed:audio-r` |  |
| OUT-05-E15 | lead-15 | VID-SDI-3G | SDI→SDI | `embed:sdi-out` | `enc:sdi-in` |  |
| OUT-05-E16 | lead-16 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc:eth` | `net:lan-1` |  |
| OUT-05-E17 | lead-17 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net:wan` | `wan:wan-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 3 | sdi-out |
| cam2 | 1 / 3 | sdi-out |
| cam3 | 1 / 3 | sdi-out |
| fiberTx | 2 / 2 | sdi-in, optical-out |
| fiberRx | 2 / 2 | optical-in, sdi-out |
| sw | 5 / 19 | sdi-in-1, sdi-in-2, sdi-in-3, mv-out, pgm-out |
| monitor | 1 / 4 | sdi-in |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| shotgun | 1 / 1 | xlr-out |
| amb | 1 / 1 | xlr-out |
| mix | 6 / 10 | in-1, in-2, in-3, pa-l, bc-l, bc-r |
| pa | 1 / 1 | line-in |
| embed | 4 / 4 | sdi-in, audio-l, audio-r, sdi-out |
| enc | 2 / 6 | sdi-in, eth |
| net | 2 / 3 | lan-1, wan |
| wan | 1 / 1 | wan-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×7, FIB-SDI-LINK×1, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-XLR-MIC×2, AUD-PA-ACTIVE×1, AUD-XLR-LINE-BAL×2, NET-CAT5E6-ENCODER×1, NET-ROUTER-UPLINK×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · cam2.power=true · cam3.power=true · fiberTx.power=true · fiberRx.power=true · sw.power=true · monitor.power=true · tx.power=true · rx.power=true · mix.power=true · pa.power=true · embed.power=true · enc.power=true · net.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · sw.pgm=SDI 1 · sw.emb-audio=OFF · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · mix.ch2-phantom=true · shotgun.windscreen=true · amb.windscreen=true · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · embed.embed=true · enc.format=1080p50 · enc.stream-key=•••• (private test) · enc.stream=true · net.wan-link=Up · net.uplink-test=true · site.power-check=true · site.cable-route=true · site.ramp=true · site.shelter=true · site.soundcheck=true · site.power-signoff=true · site.decision=GO
- fault: s-embed: การฝังเสียงรายการถูกปิดระหว่างซ้อม · s-fiber-rx-power: ตัวรับใยแก้วของกล้องไกลไม่มีไฟเลี้ยง · s-audio-bus: บัสเสียงออกอากาศถูกลดระดับ · s-camera-framing: กล้องใกล้ยังไม่ได้จัดกรอบตามใบงาน
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-ramp, pre-shelter, pre-soundcheck, pre-power-signoff, safe, mv, input-1, input-2, input-3, audio-pa, embed, ingest, clean-program, framing, cues, no-black, recovered, quiz, signoff

## SP · บัลลังก์จอมถ่ายทอด (สนามกีฬา · ถ่ายทอดนอกสถานที่ด้วยหลายกล้อง)

### SP-01 · รับกล้องสนามผ่านฐานและเราเตอร์

- รูปแบบด่าน: `guided` · ใบงาน: SP-01 · ต่อสายไฟเบอร์จาก Camera Fiber Converter ท้ายกล้อง 1 เข้า Studio Fiber Converter แล้ว Patch ผ่านเราเตอร์ไปเครื่องสลับภาพ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `SP-01`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xl`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc1 | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu1 | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| router | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` | Blackmagic Design · Blackmagic Videohub 20x20 12G | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` | Blackmagic Design · Blackmagic ATEM 2 M/E Constellation 4K | ไม่ | installed·liftable |
| monitor | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| SP-01-E01 | lead-1 | VID-SDI-6G-12G | SDI→SDI | `cam1:sdi-out` | `cfc1:sdi-in` |  |
| SP-01-E02 | lead-2 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc1:fiber` | `ccu1:fiber` |  |
| SP-01-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `ccu1:sdi-out` | `router:in-1` |  |
| SP-01-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `router:out-1` | `sw:sdi-in-1` |  |
| SP-01-E05 | lead-5 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 5 | sdi-out |
| cfc1 | 2 / 2 | sdi-in, fiber |
| ccu1 | 2 / 3 | fiber, sdi-out |
| router | 2 / 40 | in-1, out-1 |
| sw | 2 / 36 | sdi-in-1, mv-out |
| monitor | 1 / 4 | sdi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-6G-12G×1, FIB-CAMERA-CCU×1, VID-SDI-3G×3
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · ccu1.power=true · router.power=true · sw.power=true · monitor.power=true · cam1.framing=Framed for assignment · router.xp-1=IN 1 · sw.pgm=SDI 1 · sw.sdi-out-1=PROGRAM · sw.sdi-out-2=PROGRAM · sw.sdi-out-3=PROGRAM · sw.sdi-out-4=AUX · sw.aux=PROGRAM · sw.emb-audio=OFF · site.power-check=true · site.cable-route=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, cam-1, mv, clean-program, framing, quiz, signoff

### SP-02 · เสียงผู้บรรยายและเสียงสนาม

- รูปแบบด่าน: `partial` · ใบงาน: SP-02 · ติดตั้งไมค์หกแหล่งผ่านมัลติคอร์ และแยกเสียง PA กับเสียงรายการ
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `SP-02`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xl`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| mic1 | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| mic2 | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| crowdL | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| crowdR | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| field | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | fixed |
| lav | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | fixed |
| tx | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| stagebox | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| sw | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` | Blackmagic Design · Blackmagic ATEM 2 M/E Constellation 4K | ไม่ | installed·liftable |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| SP-02-E01 | lead-1 | AUD-XLR-MIC | XLR-F→XLR-M | `mic1:xlr-out` | `stagebox:mic-in-1` |  |
| SP-02-E02 | lead-2 | AUD-XLR-MIC | XLR-F→XLR-M | `mic2:xlr-out` | `stagebox:mic-in-2` |  |
| SP-02-E03 | lead-3 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdL:xlr-out` | `stagebox:mic-in-3` |  |
| SP-02-E04 | lead-4 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdR:xlr-out` | `stagebox:mic-in-4` |  |
| SP-02-E05 | lead-5 | AUD-XLR-MIC | XLR-F→XLR-M | `field:xlr-out` | `stagebox:mic-in-5` |  |
| SP-02-E06 | lead-6 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| SP-02-E07 | lead-7 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `stagebox:mic-in-6` |  |
| SP-02-E08 | lead-8 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` |  |
| SP-02-E09 | lead-9 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` |  |
| SP-02-E10 | lead-10 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-2` | `mix:in-2` |  |
| SP-02-E11 | lead-11 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-3` | `mix:in-3` |  |
| SP-02-E12 | lead-12 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-4` | `mix:in-4` |  |
| SP-02-E13 | lead-13 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-5` | `mix:in-5` |  |
| SP-02-E14 | lead-14 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-6` | `mix:in-6` |  |
| SP-02-E15 | lead-15 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` |  |
| SP-02-E16 | lead-16 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-l` | `sw:xlr-l` |  |
| SP-02-E17 | lead-17 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-r` | `sw:xlr-r` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| mic1 | 1 / 1 | xlr-out |
| mic2 | 1 / 1 | xlr-out |
| crowdL | 1 / 1 | xlr-out |
| crowdR | 1 / 1 | xlr-out |
| field | 1 / 1 | xlr-out |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| stagebox | 7 / 7 | mic-in-1, mic-in-2, mic-in-3, mic-in-4, mic-in-5, mic-in-6, multicore |
| tail | 7 / 7 | multicore, tail-1, tail-2, tail-3, tail-4, tail-5, tail-6 |
| mix | 9 / 10 | in-1, in-2, in-3, in-4, in-5, in-6, pa-l, bc-l, bc-r |
| pa | 1 / 1 | line-in |
| sw | 2 / 36 | xlr-l, xlr-r |

- กระเป๋าที่ต้องใช้ (คำนวณ): AUD-XLR-MIC×11, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×1, AUD-XLR-TRS-BAL×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): tx.power=true · rx.power=true · mix.power=true · pa.power=true · sw.power=true · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.ch4-gain=Nominal (peaks −18 dBFS) · mix.ch4-on=true · mix.ch4-pa=true · mix.ch4-bc=true · mix.ch5-gain=Nominal (peaks −18 dBFS) · mix.ch5-on=true · mix.ch5-pa=true · mix.ch5-bc=true · mix.ch6-gain=Nominal (peaks −18 dBFS) · mix.ch6-on=true · mix.ch6-pa=true · mix.ch6-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · crowdL.windscreen=true · crowdR.windscreen=true · sw.xlr-on=true · sw.emb-audio=OFF · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · site.power-check=true · site.soundcheck=true · site.cable-route=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-soundcheck, pre-cable-route, audio-pa, audio-sw, quiz, signoff

### SP-03 · หกกล้อง ภาพซ้ำ และกราฟิก

- รูปแบบด่าน: `scenario` · ใบงาน: SP-03 · Patch แหล่งภาพแปดแหล่งผ่านเราเตอร์ แล้วควบคุม Preview / Program / Multiview
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `SP-03`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xl`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc1 | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu1 | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam2 | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc2 | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu2 | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam3 | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc3 | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu3 | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam4 | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc4 | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu4 | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam5 | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc5 | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu5 | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam6 | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc6 | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu6 | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| router | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` | Blackmagic Design · Blackmagic Videohub 20x20 12G | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` | Blackmagic Design · Blackmagic ATEM 2 M/E Constellation 4K | ไม่ | installed·liftable |
| monitor | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| play | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` | โมเดลจำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | ใช่ | installed·liftable |
| controller | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` | โมเดลจำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | ใช่ | installed·liftable |
| gfx | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` | Generic Training Device · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | installed·liftable |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| SP-03-E01 | lead-1 | VID-SDI-6G-12G | SDI→SDI | `cam1:sdi-out` | `cfc1:sdi-in` |  |
| SP-03-E02 | lead-2 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc1:fiber` | `ccu1:fiber` |  |
| SP-03-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `ccu1:sdi-out` | `router:in-1` |  |
| SP-03-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `router:out-1` | `sw:sdi-in-1` |  |
| SP-03-E05 | lead-5 | VID-SDI-6G-12G | SDI→SDI | `cam2:sdi-out` | `cfc2:sdi-in` |  |
| SP-03-E06 | lead-6 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc2:fiber` | `ccu2:fiber` |  |
| SP-03-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `ccu2:sdi-out` | `router:in-2` |  |
| SP-03-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `router:out-2` | `sw:sdi-in-2` |  |
| SP-03-E09 | lead-9 | VID-SDI-6G-12G | SDI→SDI | `cam3:sdi-out` | `cfc3:sdi-in` |  |
| SP-03-E10 | lead-10 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc3:fiber` | `ccu3:fiber` |  |
| SP-03-E11 | lead-11 | VID-SDI-3G | SDI→SDI | `ccu3:sdi-out` | `router:in-3` |  |
| SP-03-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `router:out-3` | `sw:sdi-in-3` |  |
| SP-03-E13 | lead-13 | VID-SDI-6G-12G | SDI→SDI | `cam4:sdi-out` | `cfc4:sdi-in` |  |
| SP-03-E14 | lead-14 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc4:fiber` | `ccu4:fiber` |  |
| SP-03-E15 | lead-15 | VID-SDI-3G | SDI→SDI | `ccu4:sdi-out` | `router:in-4` |  |
| SP-03-E16 | lead-16 | VID-SDI-3G | SDI→SDI | `router:out-4` | `sw:sdi-in-4` |  |
| SP-03-E17 | lead-17 | VID-SDI-6G-12G | SDI→SDI | `cam5:sdi-out` | `cfc5:sdi-in` |  |
| SP-03-E18 | lead-18 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc5:fiber` | `ccu5:fiber` |  |
| SP-03-E19 | lead-19 | VID-SDI-3G | SDI→SDI | `ccu5:sdi-out` | `router:in-5` |  |
| SP-03-E20 | lead-20 | VID-SDI-3G | SDI→SDI | `router:out-5` | `sw:sdi-in-5` |  |
| SP-03-E21 | lead-21 | VID-SDI-6G-12G | SDI→SDI | `cam6:sdi-out` | `cfc6:sdi-in` |  |
| SP-03-E22 | lead-22 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc6:fiber` | `ccu6:fiber` |  |
| SP-03-E23 | lead-23 | VID-SDI-3G | SDI→SDI | `ccu6:sdi-out` | `router:in-6` |  |
| SP-03-E24 | lead-24 | VID-SDI-3G | SDI→SDI | `router:out-6` | `sw:sdi-in-6` |  |
| SP-03-E25 | lead-25 | CTRL-REPLAY | CONTROL→CONTROL | `controller:control-out` | `play:control-in` |  |
| SP-03-E26 | lead-26 | VID-SDI-3G | SDI→SDI | `play:sdi-out` | `router:in-7` |  |
| SP-03-E27 | lead-27 | VID-HDMI-A-A | HDMI→HDMI | `gfx:hdmi-out` | `convHS:hdmi-in` |  |
| SP-03-E28 | lead-28 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `router:in-8` |  |
| SP-03-E29 | lead-29 | VID-SDI-3G | SDI→SDI | `router:out-7` | `sw:sdi-in-7` |  |
| SP-03-E30 | lead-30 | VID-SDI-3G | SDI→SDI | `router:out-8` | `sw:sdi-in-8` |  |
| SP-03-E31 | lead-31 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 5 | sdi-out |
| cfc1 | 2 / 2 | sdi-in, fiber |
| ccu1 | 2 / 3 | fiber, sdi-out |
| cam2 | 1 / 5 | sdi-out |
| cfc2 | 2 / 2 | sdi-in, fiber |
| ccu2 | 2 / 3 | fiber, sdi-out |
| cam3 | 1 / 5 | sdi-out |
| cfc3 | 2 / 2 | sdi-in, fiber |
| ccu3 | 2 / 3 | fiber, sdi-out |
| cam4 | 1 / 5 | sdi-out |
| cfc4 | 2 / 2 | sdi-in, fiber |
| ccu4 | 2 / 3 | fiber, sdi-out |
| cam5 | 1 / 5 | sdi-out |
| cfc5 | 2 / 2 | sdi-in, fiber |
| ccu5 | 2 / 3 | fiber, sdi-out |
| cam6 | 1 / 5 | sdi-out |
| cfc6 | 2 / 2 | sdi-in, fiber |
| ccu6 | 2 / 3 | fiber, sdi-out |
| router | 16 / 40 | in-1, out-1, in-2, out-2, in-3, out-3, in-4, out-4, in-5, out-5, in-6, out-6, in-7, in-8, out-7, out-8 |
| sw | 9 / 36 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, sdi-in-6, sdi-in-7, sdi-in-8, mv-out |
| monitor | 1 / 4 | sdi-in |
| play | 2 / 2 | control-in, sdi-out |
| controller | 1 / 1 | control-out |
| gfx | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-6G-12G×6, FIB-CAMERA-CCU×6, VID-SDI-3G×17, CTRL-REPLAY×1, VID-HDMI-A-A×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · ccu1.power=true · cam2.power=true · ccu2.power=true · cam3.power=true · ccu3.power=true · cam4.power=true · ccu4.power=true · cam5.power=true · ccu5.power=true · cam6.power=true · ccu6.power=true · router.power=true · sw.power=true · monitor.power=true · play.power=true · controller.power=true · gfx.power=true · convHS.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · cam4.framing=Framed for assignment · cam5.framing=Framed for assignment · cam6.framing=Framed for assignment · router.xp-1=IN 1 · router.xp-2=IN 2 · router.xp-3=IN 3 · router.xp-4=IN 4 · router.xp-5=IN 5 · router.xp-6=IN 6 · sw.pgm=SDI 1 · sw.sdi-out-1=PROGRAM · sw.sdi-out-2=PROGRAM · sw.sdi-out-3=PROGRAM · sw.sdi-out-4=AUX · sw.aux=PROGRAM · sw.emb-audio=OFF · router.xp-7=IN 7 · router.xp-8=IN 8 · controller.cue=true · play.clip=true · play.play=true · gfx.template=Scoreboard template (licensed) · gfx.score=0–0 · site.power-check=true · site.cable-route=true
- fault: ไม่มี
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, cam-1, cam-2, cam-3, cam-4, cam-5, cam-6, replay, gfx, mv, clean-program, framing, cues, no-black, quiz, signoff

### SP-04 · ซ่อมเส้นทางภาพเสียงและชุดส่งสำรอง

- รูปแบบด่าน: `disruption` · ใบงาน: SP-04 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `SP-04`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xl`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc1 | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu1 | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam2 | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc2 | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu2 | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam3 | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc3 | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu3 | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam4 | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc4 | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu4 | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam5 | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc5 | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu5 | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam6 | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc6 | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu6 | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| router | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` | Blackmagic Design · Blackmagic Videohub 20x20 12G | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` | Blackmagic Design · Blackmagic ATEM 2 M/E Constellation 4K | ไม่ | installed·liftable |
| monitor | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| mic1 | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| mic2 | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| crowdL | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| crowdR | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| field | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | fixed |
| lav | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | fixed |
| tx | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| stagebox | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| play | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` | โมเดลจำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | ใช่ | installed·liftable |
| controller | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` | โมเดลจำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | ใช่ | installed·liftable |
| gfx | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` | Generic Training Device · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | installed·liftable |
| enc | ตัวเข้ารหัสหลัก · Streaming Encoder HD (XL-ENC-MAIN) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | fixed |
| enc2 | ตัวเข้ารหัสสำรอง · Streaming Encoder HD (XL-ENC-BACKUP) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | fixed |
| net | เกตเวย์ / WAN ที่ตรวจสอบแล้ว (SP-NET) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | fixed |
| net2 | เครือข่ายสำรอง (XL-NET-2) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | fixed |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (SP-WAN) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |
| wan2 | จุดรับสตรีมสำรอง (XL-WAN-2) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |
| rec | เครื่องบันทึก HyperDeck Studio HD Plus (XL-REC) | `bmd-hyperdeck-studio-hd-plus` | Blackmagic Design · Blackmagic HyperDeck Studio HD Plus | ไม่ | fixed |
| display | ตัวรับภาพจอสนาม (XL-DISPLAY) | `generic-sdi-monitor` | Generic Training Device · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| SP-04-E01 | lead-1 | VID-SDI-6G-12G | SDI→SDI | `cam1:sdi-out` | `cfc1:sdi-in` | ต่อไว้แล้ว |
| SP-04-E02 | lead-2 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc1:fiber` | `ccu1:fiber` | ต่อไว้แล้ว |
| SP-04-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `ccu1:sdi-out` | `router:in-1` | ต่อไว้แล้ว |
| SP-04-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `router:out-1` | `sw:sdi-in-1` | ต่อไว้แล้ว |
| SP-04-E05 | lead-5 | VID-SDI-6G-12G | SDI→SDI | `cam2:sdi-out` | `cfc2:sdi-in` | ต่อไว้แล้ว |
| SP-04-E06 | lead-6 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc2:fiber` | `ccu2:fiber` | ต่อไว้แล้ว |
| SP-04-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `ccu2:sdi-out` | `router:in-2` | ต่อไว้แล้ว |
| SP-04-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `router:out-2` | `sw:sdi-in-2` | ต่อไว้แล้ว |
| SP-04-E09 | lead-9 | VID-SDI-6G-12G | SDI→SDI | `cam3:sdi-out` | `cfc3:sdi-in` | ต่อไว้แล้ว |
| SP-04-E10 | lead-10 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc3:fiber` | `ccu3:fiber` | ต่อไว้แล้ว |
| SP-04-E11 | lead-11 | VID-SDI-3G | SDI→SDI | `ccu3:sdi-out` | `router:in-3` | ต่อไว้แล้ว |
| SP-04-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `router:out-3` | `sw:sdi-in-3` | ต่อไว้แล้ว |
| SP-04-E13 | lead-13 | VID-SDI-6G-12G | SDI→SDI | `cam4:sdi-out` | `cfc4:sdi-in` | ต่อไว้แล้ว |
| SP-04-E14 | lead-14 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc4:fiber` | `ccu4:fiber` | ต่อไว้แล้ว |
| SP-04-E15 | lead-15 | VID-SDI-3G | SDI→SDI | `ccu4:sdi-out` | `router:in-4` | ต่อไว้แล้ว |
| SP-04-E16 | lead-16 | VID-SDI-3G | SDI→SDI | `router:out-4` | `sw:sdi-in-4` | ต่อไว้แล้ว |
| SP-04-E17 | lead-17 | VID-SDI-6G-12G | SDI→SDI | `cam5:sdi-out` | `cfc5:sdi-in` | ต่อไว้แล้ว |
| SP-04-E18 | lead-18 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc5:fiber` | `ccu5:fiber` | ต่อไว้แล้ว |
| SP-04-E19 | lead-19 | VID-SDI-3G | SDI→SDI | `ccu5:sdi-out` | `router:in-5` | ต่อไว้แล้ว |
| SP-04-E20 | lead-20 | VID-SDI-3G | SDI→SDI | `router:out-5` | `sw:sdi-in-5` | ต่อไว้แล้ว |
| SP-04-E21 | lead-21 | VID-SDI-6G-12G | SDI→SDI | `cam6:sdi-out` | `cfc6:sdi-in` | ต่อไว้แล้ว |
| SP-04-E22 | lead-22 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc6:fiber` | `ccu6:fiber` | ต่อไว้แล้ว |
| SP-04-E23 | lead-23 | VID-SDI-3G | SDI→SDI | `ccu6:sdi-out` | `router:in-6` | ต่อไว้แล้ว |
| SP-04-E24 | lead-24 | VID-SDI-3G | SDI→SDI | `router:out-6` | `sw:sdi-in-6` | ต่อไว้แล้ว |
| SP-04-E25 | lead-25 | CTRL-REPLAY | CONTROL→CONTROL | `controller:control-out` | `play:control-in` | ต่อไว้แล้ว |
| SP-04-E26 | lead-26 | VID-SDI-3G | SDI→SDI | `play:sdi-out` | `router:in-7` | ต่อไว้แล้ว |
| SP-04-E27 | lead-27 | VID-HDMI-A-A | HDMI→HDMI | `gfx:hdmi-out` | `convHS:hdmi-in` | ต่อไว้แล้ว |
| SP-04-E28 | lead-28 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `router:in-8` | ต่อไว้แล้ว |
| SP-04-E29 | lead-29 | VID-SDI-3G | SDI→SDI | `router:out-7` | `sw:sdi-in-7` | ต่อไว้แล้ว |
| SP-04-E30 | lead-30 | VID-SDI-3G | SDI→SDI | `router:out-8` | `sw:sdi-in-8` | ต่อไว้แล้ว |
| SP-04-E31 | lead-31 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` | ต่อไว้แล้ว |
| SP-04-E32 | lead-32 | AUD-XLR-MIC | XLR-F→XLR-M | `mic1:xlr-out` | `stagebox:mic-in-1` | ต่อไว้แล้ว |
| SP-04-E33 | lead-33 | AUD-XLR-MIC | XLR-F→XLR-M | `mic2:xlr-out` | `stagebox:mic-in-2` | ต่อไว้แล้ว |
| SP-04-E34 | lead-34 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdL:xlr-out` | `stagebox:mic-in-3` | ต่อไว้แล้ว |
| SP-04-E35 | lead-35 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdR:xlr-out` | `stagebox:mic-in-4` | ต่อไว้แล้ว |
| SP-04-E36 | lead-36 | AUD-XLR-MIC | XLR-F→XLR-M | `field:xlr-out` | `stagebox:mic-in-5` | ต่อไว้แล้ว |
| SP-04-E37 | lead-37 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` | ต่อไว้แล้ว |
| SP-04-E38 | lead-38 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `stagebox:mic-in-6` | ต่อไว้แล้ว |
| SP-04-E39 | lead-39 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` | ต่อไว้แล้ว |
| SP-04-E40 | lead-40 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` | ต่อไว้แล้ว |
| SP-04-E41 | lead-41 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-2` | `mix:in-2` | ต่อไว้แล้ว |
| SP-04-E42 | lead-42 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-3` | `mix:in-3` | ต่อไว้แล้ว |
| SP-04-E43 | lead-43 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-4` | `mix:in-4` | ต่อไว้แล้ว |
| SP-04-E44 | lead-44 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-5` | `mix:in-5` | ต่อไว้แล้ว |
| SP-04-E45 | lead-45 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-6` | `mix:in-6` | ต่อไว้แล้ว |
| SP-04-E46 | lead-46 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` | ต่อไว้แล้ว |
| SP-04-E47 | lead-47 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-l` | `sw:xlr-l` | ต่อไว้แล้ว |
| SP-04-E48 | lead-48 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-r` | `sw:xlr-r` | ต่อไว้แล้ว |
| SP-04-E49 | lead-49 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-1` | `enc:sdi-in` | ต่อไว้แล้ว |
| SP-04-E50 | lead-50 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-2` | `enc2:sdi-in` |  |
| SP-04-E51 | lead-51 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-3` | `rec:sdi-in` | ต่อไว้แล้ว |
| SP-04-E52 | lead-52 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-4` | `display:sdi-in` | ต่อไว้แล้ว |
| SP-04-E53 | lead-53 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc:eth` | `net:lan-1` | ต่อไว้แล้ว |
| SP-04-E54 | lead-54 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net:wan` | `wan:wan-in` | ต่อไว้แล้ว |
| SP-04-E55 | lead-55 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc2:eth` | `net2:lan-1` | ต่อไว้แล้ว |
| SP-04-E56 | lead-56 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net2:wan` | `wan2:wan-in` | ต่อไว้แล้ว |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 5 | sdi-out |
| cfc1 | 2 / 2 | sdi-in, fiber |
| ccu1 | 2 / 3 | fiber, sdi-out |
| cam2 | 1 / 5 | sdi-out |
| cfc2 | 2 / 2 | sdi-in, fiber |
| ccu2 | 2 / 3 | fiber, sdi-out |
| cam3 | 1 / 5 | sdi-out |
| cfc3 | 2 / 2 | sdi-in, fiber |
| ccu3 | 2 / 3 | fiber, sdi-out |
| cam4 | 1 / 5 | sdi-out |
| cfc4 | 2 / 2 | sdi-in, fiber |
| ccu4 | 2 / 3 | fiber, sdi-out |
| cam5 | 1 / 5 | sdi-out |
| cfc5 | 2 / 2 | sdi-in, fiber |
| ccu5 | 2 / 3 | fiber, sdi-out |
| cam6 | 1 / 5 | sdi-out |
| cfc6 | 2 / 2 | sdi-in, fiber |
| ccu6 | 2 / 3 | fiber, sdi-out |
| router | 16 / 40 | in-1, out-1, in-2, out-2, in-3, out-3, in-4, out-4, in-5, out-5, in-6, out-6, in-7, in-8, out-7, out-8 |
| sw | 15 / 36 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, sdi-in-6, sdi-in-7, sdi-in-8, mv-out, xlr-l, xlr-r, sdi-out-1, sdi-out-2, sdi-out-3, sdi-out-4 |
| monitor | 1 / 4 | sdi-in |
| mic1 | 1 / 1 | xlr-out |
| mic2 | 1 / 1 | xlr-out |
| crowdL | 1 / 1 | xlr-out |
| crowdR | 1 / 1 | xlr-out |
| field | 1 / 1 | xlr-out |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| stagebox | 7 / 7 | mic-in-1, mic-in-2, mic-in-3, mic-in-4, mic-in-5, mic-in-6, multicore |
| tail | 7 / 7 | multicore, tail-1, tail-2, tail-3, tail-4, tail-5, tail-6 |
| mix | 9 / 10 | in-1, in-2, in-3, in-4, in-5, in-6, pa-l, bc-l, bc-r |
| pa | 1 / 1 | line-in |
| play | 2 / 2 | control-in, sdi-out |
| controller | 1 / 1 | control-out |
| gfx | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |
| enc | 2 / 6 | sdi-in, eth |
| enc2 | 2 / 6 | sdi-in, eth |
| net | 2 / 3 | lan-1, wan |
| net2 | 2 / 3 | lan-1, wan |
| wan | 1 / 1 | wan-in |
| wan2 | 1 / 1 | wan-in |
| rec | 1 / 8 | sdi-in |
| display | 1 / 1 | sdi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-3G×1
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · ccu1.power=true · cam2.power=true · ccu2.power=true · cam3.power=true · ccu3.power=true · cam4.power=true · ccu4.power=true · cam5.power=true · ccu5.power=true · cam6.power=true · ccu6.power=true · router.power=true · sw.power=true · monitor.power=true · tx.power=true · rx.power=true · mix.power=true · pa.power=true · play.power=true · controller.power=true · gfx.power=true · convHS.power=true · enc.power=true · enc2.power=true · net.power=true · net2.power=true · rec.power=true · display.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · cam4.framing=Framed for assignment · cam5.framing=Framed for assignment · cam6.framing=Framed for assignment · router.xp-1=IN 1 · router.xp-2=IN 2 · router.xp-3=IN 3 · router.xp-4=IN 4 · router.xp-5=IN 5 · router.xp-6=IN 6 · sw.pgm=SDI 1 · sw.sdi-out-1=PROGRAM · sw.sdi-out-2=PROGRAM · sw.sdi-out-3=PROGRAM · sw.sdi-out-4=AUX · sw.aux=PROGRAM · sw.emb-audio=OFF · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.ch4-gain=Nominal (peaks −18 dBFS) · mix.ch4-on=true · mix.ch4-pa=true · mix.ch4-bc=true · mix.ch5-gain=Nominal (peaks −18 dBFS) · mix.ch5-on=true · mix.ch5-pa=true · mix.ch5-bc=true · mix.ch6-gain=Nominal (peaks −18 dBFS) · mix.ch6-on=true · mix.ch6-pa=true · mix.ch6-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · crowdL.windscreen=true · crowdR.windscreen=true · sw.xlr-on=true · sw.emb-audio=OFF · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · router.xp-7=IN 7 · router.xp-8=IN 8 · controller.cue=true · play.clip=true · play.play=true · gfx.template=Scoreboard template (licensed) · gfx.score=0–0 · enc.format=1080p50 · enc.stream-key=•••• (private test) · enc.stream=true · enc2.format=1080p50 · enc2.stream-key=•••• (private test) · enc2.stream=true · rec.media=SD card mounted (512 GB free) · rec.record=true · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.storage=true · site.sightlines=true
- fault: f-crosspoint: Crosspoint ของกล้อง 1 เลือกแหล่งผิด · f-physical-link: สายจากระบบกล้องเข้าฝ่ายควบคุมหลุด
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-soundcheck, pre-storage, pre-sightlines, cam-1, cam-2, cam-3, cam-4, cam-5, cam-6, replay, gfx, audio-pa, audio-sw, venue, record, main, backup, separate, clean-program, framing, cues, no-black, recovered, quiz, signoff

### SP-05 · ถ่ายทอดสนามกีฬาครบระบบ

- รูปแบบด่าน: `certification` · ใบงาน: SP-05 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก
- แหล่งในโค้ด: `game/training/sim/stages.ts` / `reference-stages.ts` (stage `SP-05`), ห้อง `game/training/sim/rooms.ts` + `reference-rooms.ts` (`xl`), ประกอบฉาก `game/training/venue-scenarios.ts`

| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |
|---|---|---|---|---|---|
| cam1 | กล้องสนาม 1 · URSA Broadcast G2 (XL-CAM-1) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc1 | Camera Fiber Converter 1 (ท้ายกล้อง 1) (XL-CFC-1) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu1 | Studio Fiber Converter 1 (ฐานรับกล้อง 1) (XL-CCU-1) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam2 | กล้องสนาม 2 · URSA Broadcast G2 (XL-CAM-2) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc2 | Camera Fiber Converter 2 (ท้ายกล้อง 2) (XL-CFC-2) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu2 | Studio Fiber Converter 2 (ฐานรับกล้อง 2) (XL-CCU-2) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam3 | กล้องสนาม 3 · URSA Broadcast G2 (XL-CAM-3) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc3 | Camera Fiber Converter 3 (ท้ายกล้อง 3) (XL-CFC-3) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu3 | Studio Fiber Converter 3 (ฐานรับกล้อง 3) (XL-CCU-3) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam4 | กล้องสนาม 4 · URSA Broadcast G2 (XL-CAM-4) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc4 | Camera Fiber Converter 4 (ท้ายกล้อง 4) (XL-CFC-4) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu4 | Studio Fiber Converter 4 (ฐานรับกล้อง 4) (XL-CCU-4) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam5 | กล้องสนาม 5 · URSA Broadcast G2 (XL-CAM-5) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc5 | Camera Fiber Converter 5 (ท้ายกล้อง 5) (XL-CFC-5) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu5 | Studio Fiber Converter 5 (ฐานรับกล้อง 5) (XL-CCU-5) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| cam6 | กล้องสนาม 6 · URSA Broadcast G2 (XL-CAM-6) | `bmd-ursa-broadcast-g2` | Blackmagic Design · Blackmagic URSA Broadcast G2 | ไม่ | fixed |
| cfc6 | Camera Fiber Converter 6 (ท้ายกล้อง 6) (XL-CFC-6) | `bmd-camera-fiber-converter` | Blackmagic Design · Blackmagic Camera Fiber Converter | ไม่ | fixed |
| ccu6 | Studio Fiber Converter 6 (ฐานรับกล้อง 6) (XL-CCU-6) | `bmd-studio-fiber-converter` | Blackmagic Design · Blackmagic Studio Fiber Converter | ไม่ | fixed |
| router | เราเตอร์ภาพ Videohub 20x20 12G (XL-ROUTER) | `bmd-videohub-20x20-12g` | Blackmagic Design · Blackmagic Videohub 20x20 12G | ไม่ | fixed |
| sw | เครื่องสลับภาพ ATEM 2 M/E Constellation 4K (XL-SW) | `bmd-atem-2me-constellation-4k` | Blackmagic Design · Blackmagic ATEM 2 M/E Constellation 4K | ไม่ | installed·liftable |
| monitor | จอรวมภาพ · SmartView Duo (XL-MV) | `bmd-smartview-duo` | Blackmagic Design · Blackmagic SmartView Duo | ไม่ | fixed |
| mic1 | ไมค์ผู้บรรยาย 1 SM58 (SP-MIC1) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| mic2 | ไมค์ผู้บรรยาย 2 SM58 (SP-MIC2) | `shure-sm58` | Shure · Shure SM58 | ไม่ | installed·liftable |
| crowdL | ไมค์บรรยากาศซ้าย (XL-CROWD-L) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| crowdR | ไมค์บรรยากาศขวา (XL-CROWD-R) | `generic-ambience-mic` | Generic Training Device · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | ใช่ | fixed |
| field | ไมค์ภาคสนาม (XL-FIELD) | `generic-dynamic-mic` | Generic Training Device · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | ใช่ | fixed |
| lav | ไมค์พิธีกรสนาม (XL-LAV) | `generic-lav-mic` | Generic Training Device · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | ใช่ | fixed |
| tx | ตัวส่งไมค์สนาม (XL-TX) | `generic-wireless-tx` | Generic Training Device · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| rx | ตัวรับไมค์สนาม (XL-RX) | `generic-wireless-rx` | Generic Training Device · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | ใช่ | boxed→carry |
| stagebox | กล่องรับไมค์สนาม (XL-STAGE) | `reference-stagebox-6` | โมเดลจำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | ใช่ | fixed |
| tail | หางสายเสียงที่คอนโซล (XL-TAIL) | `reference-tail-6` | โมเดลจำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | ใช่ | fixed |
| mix | คอนโซลเสียงถ่ายทอดและ PA (XL-MIX) | `reference-console-6` | โมเดลจำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | ใช่ | fixed |
| pa | ระบบ PA สนาม (แบบฝึกแอ็กทีฟ) (XL-PA) | `generic-active-pa` | Generic Training Device · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | ใช่ | fixed |
| play | เซิร์ฟเวอร์ภาพซ้ำ (XL-REPLAY) | `reference-replay` | โมเดลจำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | ใช่ | installed·liftable |
| controller | แผงควบคุมภาพซ้ำ (XL-CTRL) | `reference-replay-controller` | โมเดลจำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | ใช่ | installed·liftable |
| gfx | คอมพิวเตอร์กราฟิก (SP-GFX) | `generic-graphics-pc` | Generic Training Device · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | ใช่ | installed·liftable |
| convHS | Micro Converter HDMI→SDI 3G (SP-CV-HS) | `bmd-micro-converter-hdmi-sdi-3g` | Blackmagic Design · Blackmagic Micro Converter HDMI to SDI 3G | ไม่ | installed·liftable |
| enc | ตัวเข้ารหัสหลัก · Streaming Encoder HD (XL-ENC-MAIN) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | fixed |
| enc2 | ตัวเข้ารหัสสำรอง · Streaming Encoder HD (XL-ENC-BACKUP) | `bmd-streaming-encoder-hd` | Blackmagic Design · Blackmagic Streaming Encoder HD | ไม่ | fixed |
| net | เกตเวย์ / WAN ที่ตรวจสอบแล้ว (SP-NET) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | fixed |
| net2 | เครือข่ายสำรอง (XL-NET-2) | `generic-gateway` | Generic Training Device · เราเตอร์และเกตเวย์ GbE จำลอง | ใช่ | fixed |
| wan | จุดรับสตรีมทดสอบส่วนตัว (WAN) (SP-WAN) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |
| wan2 | จุดรับสตรีมสำรอง (XL-WAN-2) | `generic-test-ingest` | Generic Training Device · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | ใช่ | fixed |
| rec | เครื่องบันทึก HyperDeck Studio HD Plus (XL-REC) | `bmd-hyperdeck-studio-hd-plus` | Blackmagic Design · Blackmagic HyperDeck Studio HD Plus | ไม่ | fixed |
| display | ตัวรับภาพจอสนาม (XL-DISPLAY) | `generic-sdi-monitor` | Generic Training Device · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | ใช่ | fixed |

| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |
|---|---|---|---|---|---|---|
| SP-05-E01 | lead-1 | VID-SDI-6G-12G | SDI→SDI | `cam1:sdi-out` | `cfc1:sdi-in` |  |
| SP-05-E02 | lead-2 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc1:fiber` | `ccu1:fiber` |  |
| SP-05-E03 | lead-3 | VID-SDI-3G | SDI→SDI | `ccu1:sdi-out` | `router:in-1` |  |
| SP-05-E04 | lead-4 | VID-SDI-3G | SDI→SDI | `router:out-1` | `sw:sdi-in-1` |  |
| SP-05-E05 | lead-5 | VID-SDI-6G-12G | SDI→SDI | `cam2:sdi-out` | `cfc2:sdi-in` |  |
| SP-05-E06 | lead-6 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc2:fiber` | `ccu2:fiber` |  |
| SP-05-E07 | lead-7 | VID-SDI-3G | SDI→SDI | `ccu2:sdi-out` | `router:in-2` |  |
| SP-05-E08 | lead-8 | VID-SDI-3G | SDI→SDI | `router:out-2` | `sw:sdi-in-2` |  |
| SP-05-E09 | lead-9 | VID-SDI-6G-12G | SDI→SDI | `cam3:sdi-out` | `cfc3:sdi-in` |  |
| SP-05-E10 | lead-10 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc3:fiber` | `ccu3:fiber` |  |
| SP-05-E11 | lead-11 | VID-SDI-3G | SDI→SDI | `ccu3:sdi-out` | `router:in-3` |  |
| SP-05-E12 | lead-12 | VID-SDI-3G | SDI→SDI | `router:out-3` | `sw:sdi-in-3` |  |
| SP-05-E13 | lead-13 | VID-SDI-6G-12G | SDI→SDI | `cam4:sdi-out` | `cfc4:sdi-in` |  |
| SP-05-E14 | lead-14 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc4:fiber` | `ccu4:fiber` |  |
| SP-05-E15 | lead-15 | VID-SDI-3G | SDI→SDI | `ccu4:sdi-out` | `router:in-4` |  |
| SP-05-E16 | lead-16 | VID-SDI-3G | SDI→SDI | `router:out-4` | `sw:sdi-in-4` |  |
| SP-05-E17 | lead-17 | VID-SDI-6G-12G | SDI→SDI | `cam5:sdi-out` | `cfc5:sdi-in` |  |
| SP-05-E18 | lead-18 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc5:fiber` | `ccu5:fiber` |  |
| SP-05-E19 | lead-19 | VID-SDI-3G | SDI→SDI | `ccu5:sdi-out` | `router:in-5` |  |
| SP-05-E20 | lead-20 | VID-SDI-3G | SDI→SDI | `router:out-5` | `sw:sdi-in-5` |  |
| SP-05-E21 | lead-21 | VID-SDI-6G-12G | SDI→SDI | `cam6:sdi-out` | `cfc6:sdi-in` |  |
| SP-05-E22 | lead-22 | FIB-CAMERA-CCU | FIBER→FIBER | `cfc6:fiber` | `ccu6:fiber` |  |
| SP-05-E23 | lead-23 | VID-SDI-3G | SDI→SDI | `ccu6:sdi-out` | `router:in-6` |  |
| SP-05-E24 | lead-24 | VID-SDI-3G | SDI→SDI | `router:out-6` | `sw:sdi-in-6` |  |
| SP-05-E25 | lead-25 | CTRL-REPLAY | CONTROL→CONTROL | `controller:control-out` | `play:control-in` |  |
| SP-05-E26 | lead-26 | VID-SDI-3G | SDI→SDI | `play:sdi-out` | `router:in-7` |  |
| SP-05-E27 | lead-27 | VID-HDMI-A-A | HDMI→HDMI | `gfx:hdmi-out` | `convHS:hdmi-in` |  |
| SP-05-E28 | lead-28 | VID-SDI-3G | SDI→SDI | `convHS:sdi-out` | `router:in-8` |  |
| SP-05-E29 | lead-29 | VID-SDI-3G | SDI→SDI | `router:out-7` | `sw:sdi-in-7` |  |
| SP-05-E30 | lead-30 | VID-SDI-3G | SDI→SDI | `router:out-8` | `sw:sdi-in-8` |  |
| SP-05-E31 | lead-31 | VID-SDI-3G | SDI→SDI | `sw:mv-out` | `monitor:sdi-in` |  |
| SP-05-E32 | lead-32 | AUD-XLR-MIC | XLR-F→XLR-M | `mic1:xlr-out` | `stagebox:mic-in-1` |  |
| SP-05-E33 | lead-33 | AUD-XLR-MIC | XLR-F→XLR-M | `mic2:xlr-out` | `stagebox:mic-in-2` |  |
| SP-05-E34 | lead-34 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdL:xlr-out` | `stagebox:mic-in-3` |  |
| SP-05-E35 | lead-35 | AUD-XLR-MIC | XLR-F→XLR-M | `crowdR:xlr-out` | `stagebox:mic-in-4` |  |
| SP-05-E36 | lead-36 | AUD-XLR-MIC | XLR-F→XLR-M | `field:xlr-out` | `stagebox:mic-in-5` |  |
| SP-05-E37 | lead-37 | AUD-LAV-TX | 3.5mm→3.5mm | `lav:out` | `tx:mic-in` |  |
| SP-05-E38 | lead-38 | AUD-RX-MIXER-XLR | XLR-F→XLR-M | `rx:audio-out` | `stagebox:mic-in-6` |  |
| SP-05-E39 | lead-39 | STG-MULTICORE | MULTICORE→MULTICORE | `stagebox:multicore` | `tail:multicore` |  |
| SP-05-E40 | lead-40 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-1` | `mix:in-1` |  |
| SP-05-E41 | lead-41 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-2` | `mix:in-2` |  |
| SP-05-E42 | lead-42 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-3` | `mix:in-3` |  |
| SP-05-E43 | lead-43 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-4` | `mix:in-4` |  |
| SP-05-E44 | lead-44 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-5` | `mix:in-5` |  |
| SP-05-E45 | lead-45 | AUD-XLR-MIC | XLR-F→XLR-M | `tail:tail-6` | `mix:in-6` |  |
| SP-05-E46 | lead-46 | AUD-PA-ACTIVE | XLR-F→XLR-M | `mix:pa-l` | `pa:line-in` |  |
| SP-05-E47 | lead-47 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-l` | `sw:xlr-l` |  |
| SP-05-E48 | lead-48 | AUD-XLR-TRS-BAL | XLR-F→6.35mm | `mix:bc-r` | `sw:xlr-r` |  |
| SP-05-E49 | lead-49 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-1` | `enc:sdi-in` |  |
| SP-05-E50 | lead-50 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-2` | `enc2:sdi-in` |  |
| SP-05-E51 | lead-51 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-3` | `rec:sdi-in` |  |
| SP-05-E52 | lead-52 | VID-SDI-3G | SDI→SDI | `sw:sdi-out-4` | `display:sdi-in` |  |
| SP-05-E53 | lead-53 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc:eth` | `net:lan-1` |  |
| SP-05-E54 | lead-54 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net:wan` | `wan:wan-in` |  |
| SP-05-E55 | lead-55 | NET-CAT5E6-ENCODER | ETHERNET→ETHERNET | `enc2:eth` | `net2:lan-1` |  |
| SP-05-E56 | lead-56 | NET-ROUTER-UPLINK | ETHERNET→ETHERNET | `net2:wan` | `wan2:wan-in` |  |

| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |
|---|---|---|
| cam1 | 1 / 5 | sdi-out |
| cfc1 | 2 / 2 | sdi-in, fiber |
| ccu1 | 2 / 3 | fiber, sdi-out |
| cam2 | 1 / 5 | sdi-out |
| cfc2 | 2 / 2 | sdi-in, fiber |
| ccu2 | 2 / 3 | fiber, sdi-out |
| cam3 | 1 / 5 | sdi-out |
| cfc3 | 2 / 2 | sdi-in, fiber |
| ccu3 | 2 / 3 | fiber, sdi-out |
| cam4 | 1 / 5 | sdi-out |
| cfc4 | 2 / 2 | sdi-in, fiber |
| ccu4 | 2 / 3 | fiber, sdi-out |
| cam5 | 1 / 5 | sdi-out |
| cfc5 | 2 / 2 | sdi-in, fiber |
| ccu5 | 2 / 3 | fiber, sdi-out |
| cam6 | 1 / 5 | sdi-out |
| cfc6 | 2 / 2 | sdi-in, fiber |
| ccu6 | 2 / 3 | fiber, sdi-out |
| router | 16 / 40 | in-1, out-1, in-2, out-2, in-3, out-3, in-4, out-4, in-5, out-5, in-6, out-6, in-7, in-8, out-7, out-8 |
| sw | 15 / 36 | sdi-in-1, sdi-in-2, sdi-in-3, sdi-in-4, sdi-in-5, sdi-in-6, sdi-in-7, sdi-in-8, mv-out, xlr-l, xlr-r, sdi-out-1, sdi-out-2, sdi-out-3, sdi-out-4 |
| monitor | 1 / 4 | sdi-in |
| mic1 | 1 / 1 | xlr-out |
| mic2 | 1 / 1 | xlr-out |
| crowdL | 1 / 1 | xlr-out |
| crowdR | 1 / 1 | xlr-out |
| field | 1 / 1 | xlr-out |
| lav | 1 / 1 | out |
| tx | 1 / 1 | mic-in |
| rx | 1 / 1 | audio-out |
| stagebox | 7 / 7 | mic-in-1, mic-in-2, mic-in-3, mic-in-4, mic-in-5, mic-in-6, multicore |
| tail | 7 / 7 | multicore, tail-1, tail-2, tail-3, tail-4, tail-5, tail-6 |
| mix | 9 / 10 | in-1, in-2, in-3, in-4, in-5, in-6, pa-l, bc-l, bc-r |
| pa | 1 / 1 | line-in |
| play | 2 / 2 | control-in, sdi-out |
| controller | 1 / 1 | control-out |
| gfx | 1 / 1 | hdmi-out |
| convHS | 2 / 4 | hdmi-in, sdi-out |
| enc | 2 / 6 | sdi-in, eth |
| enc2 | 2 / 6 | sdi-in, eth |
| net | 2 / 3 | lan-1, wan |
| net2 | 2 / 3 | lan-1, wan |
| wan | 1 / 1 | wan-in |
| wan2 | 1 / 1 | wan-in |
| rec | 1 / 8 | sdi-in |
| display | 1 / 1 | sdi-in |

- กระเป๋าที่ต้องใช้ (คำนวณ): VID-SDI-6G-12G×6, FIB-CAMERA-CCU×6, VID-SDI-3G×21, CTRL-REPLAY×1, VID-HDMI-A-A×1, AUD-XLR-MIC×11, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×1, AUD-XLR-TRS-BAL×2, NET-CAT5E6-ENCODER×2, NET-ROUTER-UPLINK×2
- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): cam1.power=true · ccu1.power=true · cam2.power=true · ccu2.power=true · cam3.power=true · ccu3.power=true · cam4.power=true · ccu4.power=true · cam5.power=true · ccu5.power=true · cam6.power=true · ccu6.power=true · router.power=true · sw.power=true · monitor.power=true · tx.power=true · rx.power=true · mix.power=true · pa.power=true · play.power=true · controller.power=true · gfx.power=true · convHS.power=true · enc.power=true · enc2.power=true · net.power=true · net2.power=true · rec.power=true · display.power=true · cam1.framing=Framed for assignment · cam2.framing=Framed for assignment · cam3.framing=Framed for assignment · cam4.framing=Framed for assignment · cam5.framing=Framed for assignment · cam6.framing=Framed for assignment · router.xp-1=IN 1 · router.xp-2=IN 2 · router.xp-3=IN 3 · router.xp-4=IN 4 · router.xp-5=IN 5 · router.xp-6=IN 6 · sw.pgm=SDI 1 · sw.sdi-out-1=PROGRAM · sw.sdi-out-2=PROGRAM · sw.sdi-out-3=PROGRAM · sw.sdi-out-4=AUX · sw.aux=PROGRAM · sw.emb-audio=OFF · mix.ch1-gain=Nominal (peaks −18 dBFS) · mix.ch1-on=true · mix.ch1-pa=true · mix.ch1-bc=true · mix.ch2-gain=Nominal (peaks −18 dBFS) · mix.ch2-on=true · mix.ch2-pa=true · mix.ch2-bc=true · mix.ch3-gain=Nominal (peaks −18 dBFS) · mix.ch3-on=true · mix.ch3-pa=true · mix.ch3-bc=true · mix.ch4-gain=Nominal (peaks −18 dBFS) · mix.ch4-on=true · mix.ch4-pa=true · mix.ch4-bc=true · mix.ch5-gain=Nominal (peaks −18 dBFS) · mix.ch5-on=true · mix.ch5-pa=true · mix.ch5-bc=true · mix.ch6-gain=Nominal (peaks −18 dBFS) · mix.ch6-on=true · mix.ch6-pa=true · mix.ch6-bc=true · mix.pa-fader=Unity · mix.bc-fader=Unity · tx.power=true · tx.rf=CH 1 · rx.power=true · rx.rf=CH 1 · rx.pair=Paired · crowdL.windscreen=true · crowdR.windscreen=true · sw.xlr-on=true · sw.emb-audio=OFF · pa.level=Nominal · pa.aim=In front of the mic, aimed at audience · router.xp-7=IN 7 · router.xp-8=IN 8 · controller.cue=true · play.clip=true · play.play=true · gfx.template=Scoreboard template (licensed) · gfx.score=0–0 · enc.format=1080p50 · enc.stream-key=•••• (private test) · enc.stream=true · enc2.format=1080p50 · enc2.stream-key=•••• (private test) · enc2.stream=true · rec.media=SD card mounted (512 GB free) · rec.record=true · site.power-check=true · site.cable-route=true · site.soundcheck=true · site.storage=true · site.sightlines=true
- fault: s-broadcast: บัสเสียงรายการถูกลดลง · s-ccu-power: Studio Fiber Converter ของกล้อง 3 ไม่มีไฟเลี้ยง กล้องจึงไม่ได้รับไฟผ่านไฟเบอร์ · s-router-crosspoint: เราเตอร์ส่งกล้องผิดเข้าช่อง 1 · s-replay-control: แผงควบคุมภาพซ้ำยังไม่ส่งคำสั่งเล่น
- สาย distractor/spare: ไม่มี
- objective ids: installed, powered, channel-map, pre-power-check, pre-cable-route, pre-soundcheck, pre-storage, pre-sightlines, cam-1, cam-2, cam-3, cam-4, cam-5, cam-6, replay, gfx, audio-pa, audio-sw, venue, record, main, backup, separate, clean-program, framing, cues, no-black, recovered, quiz, signoff
