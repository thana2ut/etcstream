# Mission equipment, port and cable matrix

Generated from existing authored scenario data by `node scripts/generate-mission-completeness-docs.mjs`. This is a manifest export, NOT a test, solver or runtime acceptance result.

**Manifest export only; see MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md for separate browser and automated results.** Reconciled with the original Appendix A and 2026-10-20 technical handoff preserved unmodified in `docs/references/`. Generic training profiles implement documented role-level topology, not vendor pinouts or campus inventory. S remains PROVISIONAL. Shapes/coordinates and cable run lengths are virtual design choices.

| Level | Scenario | Devices | Ports | Required leads | Spare leads | Distractors | Authoring issues | Reference status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XS-01 | xs-1 | 3 | 8 | 2 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| XS-02 | xs-2 | 5 | 10 | 3 | 0 | 1 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| XS-03 | xs-3 | 5 | 12 | 4 | 0 | 1 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| XS-04 | xs-4 | 8 | 20 | 6 | 2 | 1 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| XS-05 | xs-5 | 10 | 22 | 8 | 2 | 1 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| ST-01 | s-1 | 3 | 9 | 2 | 0 | 0 | No structural issue reported (not acceptance) | PROVISIONAL |
| ST-02 | s-2 | 9 | 21 | 6 | 0 | 0 | No structural issue reported (not acceptance) | PROVISIONAL |
| ST-03 | s-3 | 5 | 11 | 4 | 0 | 0 | No structural issue reported (not acceptance) | PROVISIONAL |
| ST-04 | s-4 | 9 | 23 | 7 | 1 | 1 | No structural issue reported (not acceptance) | PROVISIONAL |
| ST-05 | s-5 | 16 | 31 | 13 | 2 | 1 | No structural issue reported (not acceptance) | PROVISIONAL |
| AU-01 | m-1 | 4 | 18 | 3 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| AU-02 | m-2 | 9 | 41 | 9 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| AU-03 | m-3 | 10 | 26 | 9 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| AU-04 | m-4 | 14 | 51 | 14 | 4 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| AU-05 | m-5 | 29 | 68 | 29 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| OUT-01 | l-1 | 3 | 17 | 2 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| OUT-02 | l-2 | 7 | 16 | 5 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| OUT-03 | l-3 | 7 | 23 | 6 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| OUT-04 | l-4 | 18 | 49 | 17 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| OUT-05 | l-5 | 18 | 49 | 17 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| SP-01 | xl-1 | 5 | 35 | 4 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| SP-02 | xl-2 | 13 | 48 | 17 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| SP-03 | xl-3 | 19 | 57 | 25 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| SP-04 | xl-4 | 39 | 104 | 50 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |
| SP-05 | xl-5 | 39 | 104 | 50 | 0 | 0 | No structural issue reported (not acceptance) | DESIGN_REFERENCE |

## XS-01 / xs-1

Topology: `appendix-a-xs-1-v1`. Reference pointers: R01, R04, R10, R11.

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

Work order: นำภาพจากกล้องห้องเรียนขึ้นจอหน้าห้องผ่านเครื่องสลับภาพ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | GENERIC TRAINING MODEL | กล้องผู้สอนริมหน้าต่าง; (-5.51, 0, -3.19) yaw -1.199162831290218 | Fixed | power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพขนาดเล็กสำหรับห้องเรียน (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ; (5.075, 0.76, 4.133) yaw 0 | Movable | power=true; pgm=HDMI 1 |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic Training Projector | GENERIC TRAINING MODEL | TV ห้องเรียน — เว้นทางบริการหลังจอ; (6.09, 0.98, -4.567) yaw 0 | Fixed | power=true; source=HDMI 1 |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / กล้องห้องเรียน HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-2 | sw:hdmi-pgm-out / เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | monitor:hdmi-in-1 / โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | กล้องห้องเรียน HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.6898, 1.28, -3.1199 | -6.435188323854731, 0, -2.8293896789078996 |
| sw:hdmi-in-1 | เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | INPUT | HDMI | HDMI | rear | 4.9067, 0.8225, 4.037 | 4.9067, 0, 3.237 |
| sw:hdmi-in-2 | เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | INPUT | HDMI | HDMI | rear | 4.9909, 0.8225, 4.037 | 4.9909, 0, 3.237 |
| sw:hdmi-pgm-out | เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | OUTPUT | HDMI | HDMI | rear | 5.075, 0.8225, 4.037 | 5.075, 0, 3.237 |
| sw:audio-in | เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | 5.1592, 0.8225, 4.037 | 5.1592, 0, 3.237 |
| sw:usb | เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | OUTPUT | USB-C | USB_UVC | rear | 5.2433, 0.8225, 4.037 | 5.2433, 0, 3.237 |
| monitor:hdmi-in-1 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | INPUT | HDMI | HDMI | rear | 6.045, 1.14, -4.743 | 6.045, 0, -5.543 |
| monitor:hdmi-in-2 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 2 | INPUT | HDMI | HDMI | rear | 6.135, 1.14, -4.743 | 6.135, 0, -5.543 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| front-cam | signal | จอหน้าห้องแสดงภาพจริงจากกล้อง (PROGRAM) | true |
| pgm-in1 | signal | PROGRAM เลือก HDMI 1 | false |
| tv-input | signal | จอเลือกขาเข้า HDMI ที่ต่อสายไว้ | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-power-check | physical | ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก | false |
| pre-format | physical | ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 1 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## XS-02 / xs-2

Topology: `appendix-a-xs-2-v1`. Reference pointers: R01, R04, R10, R11.

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

Work order: ให้เสียงผู้สอนจากไมค์หนีบปกดังออกลำโพงหน้าห้องอย่างชัดเจน ไม่หอน

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ไมค์หนีบปก; (1.232, 0.76, -3.915) yaw 0 | Movable |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ตัวส่งไร้สาย TX; (0.725, 0.76, -3.915) yaw 0 | Movable | power=true |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — ตัวรับไร้สาย; (4.567, 0.76, 4.422) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — มิกเซอร์; (4.205, 0.76, 4.277) yaw 0 | Movable | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-main=true; main-fader=Unity |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าห้องด้านซ้าย — ลำโพงแอ็กทีฟพร้อมทางบริการ; (-7.105, 0, -4.35) yaw 0.35 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | lav:out / ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไร้สาย TX MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-2 | rx:audio-out / ตัวรับไร้สาย RX AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-3 | mix:main-out / มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | pa:line-in / ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 20 | AUD-PA-ACTIVE |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-hdmi | HDMI 2 ม. (ไม่ใช้ในด่านนี้) | HDMI ↔ HDMI | distractor | 2 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lav:out | ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.232, 0.79, -3.82 | 1.232, 0, -3.0199999999999996 |
| tx:mic-in | ตัวส่งไร้สาย TX MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 0.725, 0.81, -3.936 | 0.725, 0, -5.486 |
| rx:audio-out | ตัวรับไร้สาย RX AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 4.567, 0.78, 4.356 | 4.567, 0, 3.306 |
| mix:in-1 | มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.07, 0.8225, 4.433 | 4.07, 0, 5.233 |
| mix:in-2 | มิกเซอร์ 4 ช่อง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.16, 0.8225, 4.433 | 4.16, 0, 5.233 |
| mix:in-3 | มิกเซอร์ 4 ช่อง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.25, 0.8225, 4.433 | 4.25, 0, 5.233 |
| mix:in-4 | มิกเซอร์ 4 ช่อง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.34, 0.8225, 4.433 | 4.34, 0, 5.233 |
| mix:main-out | มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | 4.16, 0.8225, 4.121 | 4.16, 0, 3.3210000000000006 |
| mix:aux-out | มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | 4.25, 0.8225, 4.121 | 4.25, 0, 3.3210000000000006 |
| pa:line-in | ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -7.1585, 0.275, -4.4965 | -7.432818245964361, 0, -5.247998170277903 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| paired | signal | จับคู่ TX ↔ RX ช่องเดียวกัน | true |
| meter | signal | มิเตอร์มิกเซอร์ขยับด้วยเสียงผู้สอน | true |
| pa | signal | เสียงผู้สอนออกลำโพงหน้าห้อง ไม่หอน ไม่แตก | true |
| soundcheck | rehearsal | ทดสอบพูดระดับจริงแล้ว | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| pre-mic-place | physical | ตั้งไมค์ระดับปาก หันหลบลำโพง | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## XS-03 / xs-3

Topology: `appendix-a-xs-3-v1`. Reference pointers: R01, R04.

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

Work order: สลับกล้องกับสไลด์ขึ้นจอห้องเรียน และตรวจภาพรายการเดียวกันใน OBS ผ่าน USB Webcam

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | GENERIC TRAINING MODEL | กล้องผู้สอนริมหน้าต่าง; (-5.51, 0, -3.19) yaw -1.199162831290218 | Fixed | power=true |
| slides | อุปกรณ์จำลองเพื่อฝึก · โน้ตบุ๊กนำเสนอจำลอง | GENERIC TRAINING MODEL | โต๊ะผู้สอน — โน้ตบุ๊กหันหน้าจอเข้าผู้สอน; (0.072, 0.76, -4.64) yaw 3.141592653589793 | Fixed | power=true; present=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพขนาดเล็กสำหรับห้องเรียน (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ; (5.075, 0.76, 4.133) yaw 0 | Movable | power=true; pgm=HDMI 1 |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic Training Projector | GENERIC TRAINING MODEL | TV ห้องเรียน — เว้นทางบริการหลังจอ; (6.09, 0.98, -4.567) yaw 0 | Fixed | power=true; source=HDMI 1 |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — โน้ตบุ๊กสตรีม OBS; (5.872, 0.76, 4.133) yaw -0.2 | Movable | power=true; video-src=USB video capture device; audio-src=None |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / กล้องห้องเรียน HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-2 | slides:hdmi-out / โน้ตบุ๊กผู้สอน HDMI OUT | sw:hdmi-in-2 / เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-3 | sw:hdmi-pgm-out / เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | monitor:hdmi-in-1 / โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-4 | sw:usb / เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | host:usb-1 / โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | USB-C | USB-A | USB_UVC | 10 | DATA-USB-WEBCAM |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-usb | USB-A ↔ USB-A (ไม่ใช่สายภาพ) | USB-A ↔ USB-A | distractor | 2 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | กล้องห้องเรียน HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.6898, 1.28, -3.1199 | -6.435188323854731, 0, -2.8293896789078996 |
| slides:hdmi-out | โน้ตบุ๊กผู้สอน HDMI OUT | OUTPUT | HDMI | HDMI | rear | 0.318, 0.773, -4.64 | 1.118, 0, -5.4399999999999995 |
| sw:hdmi-in-1 | เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | INPUT | HDMI | HDMI | rear | 4.9067, 0.8225, 4.037 | 4.9067, 0, 3.237 |
| sw:hdmi-in-2 | เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | INPUT | HDMI | HDMI | rear | 4.9909, 0.8225, 4.037 | 4.9909, 0, 3.237 |
| sw:hdmi-pgm-out | เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | OUTPUT | HDMI | HDMI | rear | 5.075, 0.8225, 4.037 | 5.075, 0, 3.237 |
| sw:audio-in | เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | 5.1592, 0.8225, 4.037 | 5.1592, 0, 3.237 |
| sw:usb | เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | OUTPUT | USB-C | USB_UVC | rear | 5.2433, 0.8225, 4.037 | 5.2433, 0, 3.237 |
| monitor:hdmi-in-1 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | INPUT | HDMI | HDMI | rear | 6.045, 1.14, -4.743 | 6.045, 0, -5.543 |
| monitor:hdmi-in-2 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 2 | INPUT | HDMI | HDMI | rear | 6.135, 1.14, -4.743 | 6.135, 0, -5.543 |
| host:usb-1 | โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | 5.6428, 0.773, 4.0253 | 4.938214470045031, 0, 3.474337904227454 |
| host:usb-2 | โน้ตบุ๊กสตรีม OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | 5.6309, 0.773, 4.0841 | 5.005782202363055, 0, 3.1411112730909583 |
| host:eth | โน้ตบุ๊กสตรีม OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | 5.619, 0.773, 4.1429 | 4.993882202363055, 0, 3.199911273090958 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| in1 | signal | HDMI IN1 = กล้อง | true |
| in2 | signal | HDMI IN2 = โน้ตบุ๊ก | true |
| front | signal | จอหน้าห้องแสดง PROGRAM ปัจจุบัน | true |
| both | rehearsal | ทั้งสองแหล่งภาพถูกเลือกออกอากาศได้จริง | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-cable-route | physical | เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 2 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |
| webcam-installed | physical | ติดตั้งคอมพิวเตอร์และสาย USB DEVICE → HOST | true |
| webcam-picture | signal | OBS รับภาพ PROGRAM เดียวกับจอห้องเรียน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## XS-04 / xs-4

Topology: `appendix-a-xs-4-v1`. Reference pointers: R01, R04, R10, R11.

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

Work order: คาบเรียนออนไลน์กำลังจะเริ่ม แต่ OBS ไม่มีภาพและเสียง และจอหน้าห้องผิด — หาจุดเสียแล้วซ่อมทางกายภาพ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | GENERIC TRAINING MODEL | กล้องผู้สอนริมหน้าต่าง; (-5.51, 0, -3.19) yaw -1.199162831290218 | Fixed |  |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ไมค์หนีบปก; (1.232, 0.76, -3.915) yaw 0 | Movable |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ตัวส่งไร้สาย TX; (0.725, 0.76, -3.915) yaw 0 | Movable |  |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — ตัวรับไร้สาย; (4.567, 0.76, 4.422) yaw 0 | Movable | pair=Paired |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — มิกเซอร์; (4.205, 0.76, 4.277) yaw 0 | Movable | ch1-aux=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพขนาดเล็กสำหรับห้องเรียน (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ; (5.075, 0.76, 4.133) yaw 0 | Movable |  |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — โน้ตบุ๊กสตรีม OBS; (5.872, 0.76, 4.133) yaw -0.2 | Movable |  |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic Training Projector | GENERIC TRAINING MODEL | TV ห้องเรียน — เว้นทางบริการหลังจอ; (6.09, 0.98, -4.567) yaw 0 | Fixed |  |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / กล้องห้องเรียน HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-2 | sw:hdmi-pgm-out / เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | monitor:hdmi-in-1 / โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-3 | lav:out / ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไร้สาย TX MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-4 | rx:audio-out / ตัวรับไร้สาย RX AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-5 | mix:aux-out / มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | sw:audio-in / เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | 6.35mm | 3.5mm | LINE_UNBAL | 10 | AUD-TRS-635-35 |
| lead-6 | sw:usb / เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | host:usb-1 / โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | USB-C | USB-A | USB_UVC | 10 | DATA-USB-WEBCAM |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-xlr | XLR 3 ม. (สำรอง) | XLR-F ↔ XLR-M | spare | 3 |
| x-hdmi | HDMI 2 ม. (สำรอง) | HDMI ↔ HDMI | spare | 2 |
| x-usb | USB-A ↔ USB-A (ไม่ใช่สายเว็บแคม) | USB-A ↔ USB-A | distractor | 2 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | กล้องห้องเรียน HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.6898, 1.28, -3.1199 | -6.435188323854731, 0, -2.8293896789078996 |
| lav:out | ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.232, 0.79, -3.82 | 1.232, 0, -3.0199999999999996 |
| tx:mic-in | ตัวส่งไร้สาย TX MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 0.725, 0.81, -3.936 | 0.725, 0, -5.486 |
| rx:audio-out | ตัวรับไร้สาย RX AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 4.567, 0.78, 4.356 | 4.567, 0, 3.306 |
| mix:in-1 | มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.07, 0.8225, 4.433 | 4.07, 0, 5.233 |
| mix:in-2 | มิกเซอร์ 4 ช่อง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.16, 0.8225, 4.433 | 4.16, 0, 5.233 |
| mix:in-3 | มิกเซอร์ 4 ช่อง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.25, 0.8225, 4.433 | 4.25, 0, 5.233 |
| mix:in-4 | มิกเซอร์ 4 ช่อง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.34, 0.8225, 4.433 | 4.34, 0, 5.233 |
| mix:main-out | มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | 4.16, 0.8225, 4.121 | 4.16, 0, 3.3210000000000006 |
| mix:aux-out | มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | 4.25, 0.8225, 4.121 | 4.25, 0, 3.3210000000000006 |
| sw:hdmi-in-1 | เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | INPUT | HDMI | HDMI | rear | 4.9067, 0.8225, 4.037 | 4.9067, 0, 3.237 |
| sw:hdmi-in-2 | เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | INPUT | HDMI | HDMI | rear | 4.9909, 0.8225, 4.037 | 4.9909, 0, 3.237 |
| sw:hdmi-pgm-out | เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | OUTPUT | HDMI | HDMI | rear | 5.075, 0.8225, 4.037 | 5.075, 0, 3.237 |
| sw:audio-in | เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | 5.1592, 0.8225, 4.037 | 5.1592, 0, 3.237 |
| sw:usb | เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | OUTPUT | USB-C | USB_UVC | rear | 5.2433, 0.8225, 4.037 | 5.2433, 0, 3.237 |
| host:usb-1 | โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | 5.6428, 0.773, 4.0253 | 4.938214470045031, 0, 3.474337904227454 |
| host:usb-2 | โน้ตบุ๊กสตรีม OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | 5.6309, 0.773, 4.0841 | 5.005782202363055, 0, 3.1411112730909583 |
| host:eth | โน้ตบุ๊กสตรีม OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | 5.619, 0.773, 4.1429 | 4.993882202363055, 0, 3.199911273090958 |
| monitor:hdmi-in-1 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | INPUT | HDMI | HDMI | rear | 6.045, 1.14, -4.743 | 6.045, 0, -5.543 |
| monitor:hdmi-in-2 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 2 | INPUT | HDMI | HDMI | rear | 6.135, 1.14, -4.743 | 6.135, 0, -5.543 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| front | signal | จอหน้าห้องแสดงภาพกล้อง | true |
| obs-video | signal | OBS รับเว็บแคมเป็นภาพ PROGRAM | true |
| obs-audio | signal | OBS ได้ยินเสียงผู้สอนเพียงทางเดียว | true |
| recovered | delivery | ตรวจหาและซ่อมจุดเสียครบ | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 1 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: lead-2: sw:hdmi-pgm-out → monitor:hdmi-in-1; lead-3: lav:out → tx:mic-in; lead-4: rx:audio-out → mix:in-1; lead-5: mix:aux-out → sw:audio-in; lead-1: cam1:hdmi-out → sw:hdmi-in-2. Faults: f-input, f-pair, f-aux, f-usb.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## XS-05 / xs-5

Topology: `appendix-a-xs-5-v1`. Reference pointers: R01, R04, R10, R11.

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

Work order: จัดห้องเรียนไฮบริดครบระบบ: กล้องและสไลด์ขึ้นจอหน้าห้องและ OBS, เสียงผู้สอนออกลำโพงในห้อง และส่งเข้าสตรีมแยกบัส โดยเสียงใน OBS ไม่ซ้อน

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | GENERIC TRAINING MODEL | กล้องผู้สอนริมหน้าต่าง; (-5.51, 0, -3.19) yaw -1.199162831290218 | Fixed | power=true |
| slides | อุปกรณ์จำลองเพื่อฝึก · โน้ตบุ๊กนำเสนอจำลอง | GENERIC TRAINING MODEL | โต๊ะผู้สอน — โน้ตบุ๊กหันหน้าจอเข้าผู้สอน; (0.072, 0.76, -4.64) yaw 3.141592653589793 | Fixed | power=true; present=true; mute-audio=true |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ไมค์หนีบปก; (1.232, 0.76, -3.915) yaw 0 | Movable |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะครู — ตัวส่งไร้สาย TX; (0.725, 0.76, -3.915) yaw 0 | Movable | power=true |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — ตัวรับไร้สาย; (4.567, 0.76, 4.422) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — มิกเซอร์; (4.205, 0.76, 4.277) yaw 0 | Movable | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-main=true; main-fader=Unity; ch1-aux=true; aux-master=Unity |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพขนาดเล็กสำหรับห้องเรียน (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ; (5.075, 0.76, 4.133) yaw 0 | Movable | power=true; pgm=HDMI 1; ain-on=true; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic Training Projector | GENERIC TRAINING MODEL | TV ห้องเรียน — เว้นทางบริการหลังจอ; (6.09, 0.98, -4.567) yaw 0 | Fixed | power=true; source=HDMI 1 |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าห้องด้านซ้าย — ลำโพงแอ็กทีฟพร้อมทางบริการ; (-7.105, 0, -4.35) yaw 0.35 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | GENERIC TRAINING MODEL | โต๊ะผู้ควบคุมด้านหลัง — โน้ตบุ๊กสตรีม OBS; (5.872, 0.76, 4.133) yaw -0.2 | Movable | power=true; video-src=USB video capture device; audio-src=USB capture embedded audio |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / กล้องห้องเรียน HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-2 | slides:hdmi-out / โน้ตบุ๊กผู้สอน HDMI OUT | sw:hdmi-in-2 / เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | HDMI | HDMI | HDMI | 20 | VID-HDMI-A-A |
| lead-3 | sw:hdmi-pgm-out / เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | monitor:hdmi-in-1 / โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-4 | sw:usb / เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | host:usb-1 / โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | USB-C | USB-A | USB_UVC | 10 | DATA-USB-WEBCAM |
| lead-5 | lav:out / ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไร้สาย TX MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-6 | rx:audio-out / ตัวรับไร้สาย RX AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-7 | mix:main-out / มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | pa:line-in / ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 20 | AUD-PA-ACTIVE |
| lead-8 | mix:aux-out / มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | sw:audio-in / เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | 6.35mm | 3.5mm | LINE_UNBAL | 10 | AUD-TRS-635-35 |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-hdmi | HDMI 2 ม. (สำรอง) | HDMI ↔ HDMI | spare | 2 |
| x-usb | USB-A ↔ USB-A (ไม่ใช่สายเว็บแคม) | USB-A ↔ USB-A | distractor | 2 |
| x-xlr | XLR 3 ม. (สำรอง) | XLR-F ↔ XLR-M | spare | 3 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | กล้องห้องเรียน HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.6898, 1.28, -3.1199 | -6.435188323854731, 0, -2.8293896789078996 |
| slides:hdmi-out | โน้ตบุ๊กผู้สอน HDMI OUT | OUTPUT | HDMI | HDMI | rear | 0.318, 0.773, -4.64 | 1.118, 0, -5.4399999999999995 |
| lav:out | ไมค์หนีบปกผู้สอน LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.232, 0.79, -3.82 | 1.232, 0, -3.0199999999999996 |
| tx:mic-in | ตัวส่งไร้สาย TX MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 0.725, 0.81, -3.936 | 0.725, 0, -5.486 |
| rx:audio-out | ตัวรับไร้สาย RX AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 4.567, 0.78, 4.356 | 4.567, 0, 3.306 |
| mix:in-1 | มิกเซอร์ 4 ช่อง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.07, 0.8225, 4.433 | 4.07, 0, 5.233 |
| mix:in-2 | มิกเซอร์ 4 ช่อง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.16, 0.8225, 4.433 | 4.16, 0, 5.233 |
| mix:in-3 | มิกเซอร์ 4 ช่อง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.25, 0.8225, 4.433 | 4.25, 0, 5.233 |
| mix:in-4 | มิกเซอร์ 4 ช่อง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | 4.34, 0.8225, 4.433 | 4.34, 0, 5.233 |
| mix:main-out | มิกเซอร์ 4 ช่อง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | 4.16, 0.8225, 4.121 | 4.16, 0, 3.3210000000000006 |
| mix:aux-out | มิกเซอร์ 4 ช่อง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | 4.25, 0.8225, 4.121 | 4.25, 0, 3.3210000000000006 |
| sw:hdmi-in-1 | เครื่องสลับภาพขนาดเล็ก HDMI IN 1 | INPUT | HDMI | HDMI | rear | 4.9067, 0.8225, 4.037 | 4.9067, 0, 3.237 |
| sw:hdmi-in-2 | เครื่องสลับภาพขนาดเล็ก HDMI IN 2 | INPUT | HDMI | HDMI | rear | 4.9909, 0.8225, 4.037 | 4.9909, 0, 3.237 |
| sw:hdmi-pgm-out | เครื่องสลับภาพขนาดเล็ก HDMI PROGRAM OUT | OUTPUT | HDMI | HDMI | rear | 5.075, 0.8225, 4.037 | 5.075, 0, 3.237 |
| sw:audio-in | เครื่องสลับภาพขนาดเล็ก AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | 5.1592, 0.8225, 4.037 | 5.1592, 0, 3.237 |
| sw:usb | เครื่องสลับภาพขนาดเล็ก USB WEBCAM (DEVICE) | OUTPUT | USB-C | USB_UVC | rear | 5.2433, 0.8225, 4.037 | 5.2433, 0, 3.237 |
| monitor:hdmi-in-1 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 1 | INPUT | HDMI | HDMI | rear | 6.045, 1.14, -4.743 | 6.045, 0, -5.543 |
| monitor:hdmi-in-2 | โปรเจกเตอร์/จอหน้าห้อง HDMI IN 2 | INPUT | HDMI | HDMI | rear | 6.135, 1.14, -4.743 | 6.135, 0, -5.543 |
| pa:line-in | ลำโพงแอ็กทีฟหน้าห้อง LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -7.1585, 0.275, -4.4965 | -7.432818245964361, 0, -5.247998170277903 |
| host:usb-1 | โน้ตบุ๊กสตรีม OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | 5.6428, 0.773, 4.0253 | 4.938214470045031, 0, 3.474337904227454 |
| host:usb-2 | โน้ตบุ๊กสตรีม OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | 5.6309, 0.773, 4.0841 | 5.005782202363055, 0, 3.1411112730909583 |
| host:eth | โน้ตบุ๊กสตรีม OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | 5.619, 0.773, 4.1429 | 4.993882202363055, 0, 3.199911273090958 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| front | signal | เปลี่ยนแหล่งภาพแล้วจอหน้าห้องเปลี่ยนตาม | true |
| obs-video | signal | เปลี่ยนแหล่งภาพแล้ว OBS เปลี่ยนตาม | true |
| room | signal | เสียงในห้องทำงาน ไม่หอน ไม่แตก | true |
| obs-audio | signal | OBS มีเสียงรายการตามที่ตั้งใจเท่านั้น (ไม่ซ้อน) | true |
| angles | rehearsal | ใช้ทั้งภาพผู้สอนและสไลด์ในรายการ | false |
| recovered | delivery | แก้ปัญหาที่เกิดระหว่างงานได้ | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | true |
| pre-power-check | physical | ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก | false |
| pre-cable-route | physical | เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| pre-mic-place | physical | ตั้งไมค์ระดับปาก หันหลบลำโพง | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 3 คิว | true |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## ST-01 / s-1

Topology: `appendix-a-s-1-v1`. Reference pointers: R04, R05, R08, R11.

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

Work order: ให้ภาพ CAM1 ขึ้นเป็นช่องหนึ่งในจอรวมภาพ (Multiview) ของห้องควบคุม

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง A: ภาพกว้างสองคน; (3.1, 0, 2.9) yaw -1.2882413743253092 | Fixed | power=true; framing=Framed for assignment; clean=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม; (-2.7, 0.76, 4.7) yaw 3.141592653589793 | Fixed | power=true |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | TV Multiview บนขาตั้ง; (-6.5, 0.95, 3.9) yaw 1.1284221038181514 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / CAM1 ภาพกว้าง HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-2 | sw:hdmi-mv-out / เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | monitor:hdmi-in / ทีวีรวมภาพ HDMI IN | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | CAM1 ภาพกว้าง HDMI OUT | OUTPUT | HDMI | HDMI | rear | 2.9147, 1.28, 2.9538 | 2.1464230185971003, 0, 3.1768481558911645 |
| sw:hdmi-in-1 | เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | INPUT | HDMI | HDMI | rear | -2.4804, 0.82, 4.896 | -2.4804, 0, 5.946 |
| sw:hdmi-in-2 | เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | INPUT | HDMI | HDMI | rear | -2.5683, 0.82, 4.896 | -2.5683, 0, 5.946 |
| sw:hdmi-in-3 | เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | INPUT | HDMI | HDMI | rear | -2.6561, 0.82, 4.896 | -2.6561, 0, 5.946 |
| sw:hdmi-in-4 | เครื่องสลับภาพสตูดิโอ VIDEO IN 4 (HDMI) | INPUT | HDMI | HDMI | rear | -2.7439, 0.82, 4.896 | -2.7439, 0, 5.946 |
| sw:hdmi-mv-out | เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.8318, 0.82, 4.896 | -2.8318, 0, 5.946 |
| sw:hdmi-pgm-out | เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.9196, 0.82, 4.896 | -2.9196, 0, 5.946 |
| sw:audio-in | เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | -2.7, 0.89, 4.896 | -2.7, 0, 5.946 |
| monitor:hdmi-in | ทีวีรวมภาพ HDMI IN | INPUT | HDMI | HDMI | rear | -6.5416, 1.21, 3.8803 | -7.435824809010449, 0, 3.89932605976618 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| mv-cam1 | signal | ช่อง CAM1 ปรากฏในจอรวมภาพ | true |
| in1 | signal | VIDEO IN 1 รับ CAM1 | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-power-check | physical | ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก | false |
| pre-format | physical | ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## ST-02 / s-2

Topology: `appendix-a-s-2-v1`. Reference pointers: R04, R05, R08, R11.

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

Work order: พิธีกรและแขกรับเชิญต้องปรับเสียงได้แยกกัน ส่งเข้า Broadcast และฟังตรวจที่ลำโพงมอนิเตอร์

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| lav1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผู้นำเสนอ — ไมค์หนีบปก 1; (-4.7, 0.76, -2.3) yaw 0 | Fixed |  |
| lav2 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผู้นำเสนอ — ไมค์หนีบปก 2; (-3, 0.76, -2.3) yaw 0 | Fixed |  |
| tx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะฉากเขียว: TX 1; (-4.4, 0.76, -2.3) yaw 0 | Movable | power=true |
| tx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะฉากเขียว: TX 2; (-3.3, 0.76, -2.3) yaw 0 | Movable | power=true; rf=CH 2 |
| rx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | PROVISIONAL | ข้าง Mixer: Wireless RX; (-3.7, 0.76, 4.95) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired |
| rx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะเสียง — ตัวรับ RX ช่อง 2; (-3.3, 0.76, 5.05) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired; rf=CH 2 |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต ซ้าย: Audio Mixer; (-4.45, 0.76, 4.7) yaw 0 | Fixed | power=true; main-fader=Unity; aux-master=Unity; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-main=true; ch1-aux=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-main=true; ch2-aux=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม; (-2.7, 0.76, 4.7) yaw 3.141592653589793 | Fixed | power=true; ain-on=true; emb-audio=OFF |
| speaker | Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | DESIGN_REFERENCE | Yamaha HS5 ข้างโต๊ะผลิต; (-5.95, 0, 4.9) yaw 0.4 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | lav1:out / ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | tx1:mic-in / ตัวส่ง TX 1 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-2 | lav2:out / ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | tx2:mic-in / ตัวส่ง TX 2 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-3 | rx1:audio-out / ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-4 | rx2:audio-out / ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | mix:in-2 / มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-5 | mix:aux-out / มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | sw:audio-in / เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | 6.35mm | 3.5mm | LINE_UNBAL | 10 | AUD-TRS-635-35 |
| lead-6 | mix:main-out / มิกเซอร์เสียง MAIN / PA OUT (XLR) | speaker:xlr-in / Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-PA-ACTIVE |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lav1:out | ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -4.7, 0.79, -2.205 | -4.7, 0, -1.405 |
| lav2:out | ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -3, 0.79, -2.205 | -3, 0, -1.405 |
| tx1:mic-in | ตัวส่ง TX 1 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -4.4, 0.81, -2.321 | -4.4, 0, -3.1210000000000004 |
| tx2:mic-in | ตัวส่ง TX 2 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -3.3, 0.81, -2.321 | -3.3, 0, -3.1210000000000004 |
| rx1:audio-out | ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | -3.7, 0.78, 4.884 | -3.7, 0, 3.5840000000000005 |
| rx2:audio-out | ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | -3.3, 0.78, 4.984 | -3.3, 0, 3.434 |
| mix:in-1 | มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.585, 0.8225, 4.856 | -4.585, 0, 5.906 |
| mix:in-2 | มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.495, 0.8225, 4.856 | -4.495, 0, 5.906 |
| mix:in-3 | มิกเซอร์เสียง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.405, 0.8225, 4.856 | -4.405, 0, 5.906 |
| mix:in-4 | มิกเซอร์เสียง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.315, 0.8225, 4.856 | -4.315, 0, 5.906 |
| mix:main-out | มิกเซอร์เสียง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | -4.495, 0.8225, 4.544 | -4.495, 0, 3.4939999999999998 |
| mix:aux-out | มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | -4.405, 0.8225, 4.544 | -4.405, 0, 3.4939999999999998 |
| sw:hdmi-in-1 | เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | INPUT | HDMI | HDMI | rear | -2.4804, 0.82, 4.896 | -2.4804, 0, 5.946 |
| sw:hdmi-in-2 | เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | INPUT | HDMI | HDMI | rear | -2.5683, 0.82, 4.896 | -2.5683, 0, 5.946 |
| sw:hdmi-in-3 | เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | INPUT | HDMI | HDMI | rear | -2.6561, 0.82, 4.896 | -2.6561, 0, 5.946 |
| sw:hdmi-in-4 | เครื่องสลับภาพสตูดิโอ VIDEO IN 4 (HDMI) | INPUT | HDMI | HDMI | rear | -2.7439, 0.82, 4.896 | -2.7439, 0, 5.946 |
| sw:hdmi-mv-out | เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.8318, 0.82, 4.896 | -2.8318, 0, 5.946 |
| sw:hdmi-pgm-out | เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.9196, 0.82, 4.896 | -2.9196, 0, 5.946 |
| sw:audio-in | เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | -2.7, 0.89, 4.896 | -2.7, 0, 5.946 |
| speaker:xlr-in | Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | INPUT | XLR | LINE_BAL | rear | -6.0775, 0.45, 4.714 | -6.215319447400091, 0, 3.3608533708727895 |
| speaker:trs-in | Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (TRS phone, balanced) | INPUT | 6.35mm | LINE_BAL | rear | -5.9946, 0.45, 4.6789 | -5.569285878644612, 0, 3.630516530950771 |

Wireless (no physical cable): tx1 ~RF~ rx1; tx2 ~RF~ rx2. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| separate | physical | ไมค์สองตัวเข้าช่องแยกกัน | false |
| broadcast | signal | บัส Broadcast มีเสียงทั้งสองไมค์ที่เครื่องสลับภาพ | true |
| monitor | signal | ลำโพง HS5 ได้ยินทั้งสองไมค์ | true |
| soundcheck | rehearsal | ตรวจเสียงทีละไมค์แล้ว | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| pre-mic-place | physical | ตั้งไมค์ระดับปาก หันหลบลำโพง | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## ST-03 / s-3

Topology: `appendix-a-s-3-v1`. Reference pointers: R04, R05, R08, R11.

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

Work order: ถ่ายสามมุม: โต๊ะผู้นำเสนอ มุมสัมภาษณ์ และฉากเขียว — สลับด้วยเครื่องสลับภาพ ไม่ใช่การย้ายสาย

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง A: ภาพกว้างสองคน; (3.1, 0, 2.9) yaw -1.2882413743253092 | Fixed | power=true; framing=Framed for assignment; clean=true |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง B: ภาพใกล้แขกรับเชิญ; (3.5, 0, 0.3) yaw -2.10866914326718 | Fixed | power=true; framing=Framed for assignment; clean=true |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง C: ภาพใกล้พิธีกร; (3.6, 0, 4.4) yaw -0.5838255184014529 | Fixed | power=true; framing=Framed for assignment; clean=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม; (-2.7, 0.76, 4.7) yaw 3.141592653589793 | Fixed | power=true |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | TV Multiview บนขาตั้ง; (-6.5, 0.95, 3.9) yaw 1.1284221038181514 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / CAM1 ภาพกว้าง HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-2 | cam2:hdmi-out / CAM2 มุมสัมภาษณ์ HDMI OUT | sw:hdmi-in-2 / เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-3 | cam3:hdmi-out / CAM3 มุมฉากเขียว HDMI OUT | sw:hdmi-in-3 / เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-4 | sw:hdmi-mv-out / เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | monitor:hdmi-in / ทีวีรวมภาพ HDMI IN | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | CAM1 ภาพกว้าง HDMI OUT | OUTPUT | HDMI | HDMI | rear | 2.9147, 1.28, 2.9538 | 2.1464230185971003, 0, 3.1768481558911645 |
| cam2:hdmi-out | CAM2 มุมสัมภาษณ์ HDMI OUT | OUTPUT | HDMI | HDMI | rear | 3.3343, 1.28, 0.2011 | 2.647259678699977, 0, -0.20874826083315495 |
| cam3:hdmi-out | CAM3 มุมฉากเขียว HDMI OUT | OUTPUT | HDMI | HDMI | rear | 3.4936, 1.28, 4.561 | 3.0526241422414624, 0, 5.228488046989699 |
| sw:hdmi-in-1 | เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | INPUT | HDMI | HDMI | rear | -2.4804, 0.82, 4.896 | -2.4804, 0, 5.946 |
| sw:hdmi-in-2 | เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | INPUT | HDMI | HDMI | rear | -2.5683, 0.82, 4.896 | -2.5683, 0, 5.946 |
| sw:hdmi-in-3 | เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | INPUT | HDMI | HDMI | rear | -2.6561, 0.82, 4.896 | -2.6561, 0, 5.946 |
| sw:hdmi-in-4 | เครื่องสลับภาพสตูดิโอ VIDEO IN 4 (HDMI) | INPUT | HDMI | HDMI | rear | -2.7439, 0.82, 4.896 | -2.7439, 0, 5.946 |
| sw:hdmi-mv-out | เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.8318, 0.82, 4.896 | -2.8318, 0, 5.946 |
| sw:hdmi-pgm-out | เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.9196, 0.82, 4.896 | -2.9196, 0, 5.946 |
| sw:audio-in | เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | -2.7, 0.89, 4.896 | -2.7, 0, 5.946 |
| monitor:hdmi-in | ทีวีรวมภาพ HDMI IN | INPUT | HDMI | HDMI | rear | -6.5416, 1.21, 3.8803 | -7.435824809010449, 0, 3.89932605976618 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| mv3 | signal | เห็นทั้งสามกล้องในจอรวมภาพ | true |
| cuts | rehearsal | การเลือกแหล่งภาพเปลี่ยน PGM จริง | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-cable-route | physical | เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 4 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## ST-04 / s-4

Topology: `appendix-a-s-4-v1`. Reference pointers: R04, R05, R08, R11.

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

Work order: ผู้ชมออนไลน์เห็นภาพตารางรวมภาพแทนรายการ และไม่ได้ยินเสียง — หาสาเหตุและซ่อมทางกายภาพ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง A: ภาพกว้างสองคน; (3.1, 0, 2.9) yaw -1.2882413743253092 | Fixed |  |
| lav1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผู้นำเสนอ — ไมค์หนีบปก 1; (-4.7, 0.76, -2.3) yaw 0 | Fixed |  |
| tx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะฉากเขียว: TX 1; (-4.4, 0.76, -2.3) yaw 0 | Movable |  |
| rx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | PROVISIONAL | ข้าง Mixer: Wireless RX; (-3.7, 0.76, 4.95) yaw 0 | Movable |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต ซ้าย: Audio Mixer; (-4.45, 0.76, 4.7) yaw 0 | Fixed | ch1-aux=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม; (-2.7, 0.76, 4.7) yaw 3.141592653589793 | Fixed |  |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | TV Multiview บนขาตั้ง; (-6.5, 0.95, 3.9) yaw 1.1284221038181514 | Fixed |  |
| capture | Magewell USB Capture HDMI Gen 2 | DESIGN_REFERENCE | ระหว่าง HDS7105 กับ Notebook: Magewell; (-1.65, 0.76, 4.8) yaw 0 | Movable |  |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | PROVISIONAL | โต๊ะผลิตขวา — หันพอร์ต Notebook เข้าทางบริการ; (-0.65, 0.76, 4.7) yaw 1.5707963267948966 | Movable | video-src=USB video capture device |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / CAM1 ภาพกว้าง HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-2 | sw:hdmi-mv-out / เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | monitor:hdmi-in / ทีวีรวมภาพ HDMI IN | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-3 | sw:hdmi-pgm-out / เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | capture:hdmi-in / Magewell USB Capture HDMI Gen 2 HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-4 | capture:usb / Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | host:usb-1 / โน้ตบุ๊ก OBS USB-A 1 (capture) | USB-A | USB-A | USB_UVC | 10 | DATA-USB-MAGEWELL |
| lead-5 | lav1:out / ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | tx1:mic-in / ตัวส่ง TX 1 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-6 | rx1:audio-out / ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-7 | mix:aux-out / มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | sw:audio-in / เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | 6.35mm | 3.5mm | LINE_UNBAL | 10 | AUD-TRS-635-35 |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-hdmi | HDMI 2 ม. (สำรอง) | HDMI ↔ HDMI | spare | 2 |
| x-usb | USB-A ↔ USB-A (ห้ามต่อ HOST ↔ HOST) | USB-A ↔ USB-A | distractor | 2 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | CAM1 ภาพกว้าง HDMI OUT | OUTPUT | HDMI | HDMI | rear | 2.9147, 1.28, 2.9538 | 2.1464230185971003, 0, 3.1768481558911645 |
| lav1:out | ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -4.7, 0.79, -2.205 | -4.7, 0, -1.405 |
| tx1:mic-in | ตัวส่ง TX 1 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -4.4, 0.81, -2.321 | -4.4, 0, -3.1210000000000004 |
| rx1:audio-out | ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | -3.7, 0.78, 4.884 | -3.7, 0, 3.5840000000000005 |
| mix:in-1 | มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.585, 0.8225, 4.856 | -4.585, 0, 5.906 |
| mix:in-2 | มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.495, 0.8225, 4.856 | -4.495, 0, 5.906 |
| mix:in-3 | มิกเซอร์เสียง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.405, 0.8225, 4.856 | -4.405, 0, 5.906 |
| mix:in-4 | มิกเซอร์เสียง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.315, 0.8225, 4.856 | -4.315, 0, 5.906 |
| mix:main-out | มิกเซอร์เสียง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | -4.495, 0.8225, 4.544 | -4.495, 0, 3.4939999999999998 |
| mix:aux-out | มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | -4.405, 0.8225, 4.544 | -4.405, 0, 3.4939999999999998 |
| sw:hdmi-in-1 | เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | INPUT | HDMI | HDMI | rear | -2.4804, 0.82, 4.896 | -2.4804, 0, 5.946 |
| sw:hdmi-in-2 | เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | INPUT | HDMI | HDMI | rear | -2.5683, 0.82, 4.896 | -2.5683, 0, 5.946 |
| sw:hdmi-in-3 | เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | INPUT | HDMI | HDMI | rear | -2.6561, 0.82, 4.896 | -2.6561, 0, 5.946 |
| sw:hdmi-in-4 | เครื่องสลับภาพสตูดิโอ VIDEO IN 4 (HDMI) | INPUT | HDMI | HDMI | rear | -2.7439, 0.82, 4.896 | -2.7439, 0, 5.946 |
| sw:hdmi-mv-out | เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.8318, 0.82, 4.896 | -2.8318, 0, 5.946 |
| sw:hdmi-pgm-out | เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.9196, 0.82, 4.896 | -2.9196, 0, 5.946 |
| sw:audio-in | เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | -2.7, 0.89, 4.896 | -2.7, 0, 5.946 |
| monitor:hdmi-in | ทีวีรวมภาพ HDMI IN | INPUT | HDMI | HDMI | rear | -6.5416, 1.21, 3.8803 | -7.435824809010449, 0, 3.89932605976618 |
| capture:hdmi-in | Magewell USB Capture HDMI Gen 2 HDMI IN | INPUT | HDMI | HDMI | rear | -1.695, 0.8225, 4.7268 | -1.695, 0, 3.4268 |
| capture:usb | Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | OUTPUT | USB-A | USB_UVC | rear | -1.605, 0.8225, 4.7268 | -1.605, 0, 3.4268 |
| host:usb-1 | โน้ตบุ๊ก OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | -0.71, 0.773, 4.946 | -0.71, 0, 5.7459999999999996 |
| host:usb-2 | โน้ตบุ๊ก OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | -0.65, 0.773, 4.946 | -0.65, 0, 5.7459999999999996 |
| host:eth | โน้ตบุ๊ก OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | -0.59, 0.773, 4.946 | -0.59, 0, 5.7459999999999996 |

Wireless (no physical cable): tx1 ~RF~ rx1. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| mv | signal | MULTIVIEW ไปที่ทีวีเพื่อดูตรวจ | true |
| obs-video | signal | OBS ได้ภาพ PGM ผ่าน Capture | true |
| obs-audio | signal | OBS มีเสียงรายการที่ฝังใน PGM | true |
| recovered | delivery | ตรวจหาและซ่อมจุดเสียครบ | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: lead-1: cam1:hdmi-out → sw:hdmi-in-1; lead-2: sw:hdmi-mv-out → monitor:hdmi-in; lead-5: lav1:out → tx1:mic-in; lead-6: rx1:audio-out → mix:in-1; lead-7: mix:aux-out → sw:audio-in; lead-3: sw:hdmi-mv-out → capture:hdmi-in. Faults: f-roles, f-bus, f-usb, f-obs.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## ST-05 / s-5

Topology: `appendix-a-s-5-v1`. Reference pointers: R04, R05, R08, R11.

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

Work order: ประกอบสตูดิโอครบระบบ: สามกล้องสลับได้, ไมค์ไร้สาย 2 ตัวและไมค์สาย 1 ตัวแยกช่อง, Broadcast ฝังเข้า PGM, ฟังตรวจที่ HS5, จับภาพ PGM เข้า OBS

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง A: ภาพกว้างสองคน; (3.1, 0, 2.9) yaw -1.2882413743253092 | Fixed | power=true; framing=Framed for assignment; clean=true |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง B: ภาพใกล้แขกรับเชิญ; (3.5, 0, 0.3) yaw -2.10866914326718 | Fixed | power=true; framing=Framed for assignment; clean=true |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้องฝึก HDMI 1080p50 | PROVISIONAL | กล้อง C: ภาพใกล้พิธีกร; (3.6, 0, 4.4) yaw -0.5838255184014529 | Fixed | power=true; framing=Framed for assignment; clean=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม; (-2.7, 0.76, 4.7) yaw 3.141592653589793 | Fixed | power=true; pgm=HDMI 1; ain-on=true; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | TV Multiview บนขาตั้ง; (-6.5, 0.95, 3.9) yaw 1.1284221038181514 | Fixed | power=true |
| lav1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผู้นำเสนอ — ไมค์หนีบปก 1; (-4.7, 0.76, -2.3) yaw 0 | Fixed |  |
| lav2 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผู้นำเสนอ — ไมค์หนีบปก 2; (-3, 0.76, -2.3) yaw 0 | Fixed |  |
| tx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะฉากเขียว: TX 1; (-4.4, 0.76, -2.3) yaw 0 | Movable | power=true |
| tx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะฉากเขียว: TX 2; (-3.3, 0.76, -2.3) yaw 0 | Movable | power=true; rf=CH 2 |
| rx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | PROVISIONAL | ข้าง Mixer: Wireless RX; (-3.7, 0.76, 4.95) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired |
| rx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะเสียง — ตัวรับ RX ช่อง 2; (-3.3, 0.76, 5.05) yaw 0 | Movable | power=true; rf=CH 1; pair=Paired; rf=CH 2 |
| mic | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | PROVISIONAL | ขาตั้งไมค์พิธีกร; (5.12, 1.05, 2.18) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL) | PROVISIONAL | โต๊ะผลิต ซ้าย: Audio Mixer; (-4.45, 0.76, 4.7) yaw 0 | Fixed | power=true; main-fader=Unity; aux-master=Unity; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-main=true; ch1-aux=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-main=true; ch2-aux=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-main=true; ch3-aux=true |
| speaker | Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ) | DESIGN_REFERENCE | Yamaha HS5 ข้างโต๊ะผลิต; (-5.95, 0, 4.9) yaw 0.4 | Fixed | power=true |
| capture | Magewell USB Capture HDMI Gen 2 | DESIGN_REFERENCE | ระหว่าง HDS7105 กับ Notebook: Magewell; (-1.65, 0.76, 4.8) yaw 0 | Movable |  |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | PROVISIONAL | โต๊ะผลิตขวา — หันพอร์ต Notebook เข้าทางบริการ; (-0.65, 0.76, 4.7) yaw 1.5707963267948966 | Movable | power=true; video-src=USB video capture device; audio-src=USB capture embedded audio |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:hdmi-out / CAM1 ภาพกว้าง HDMI OUT | sw:hdmi-in-1 / เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-2 | cam2:hdmi-out / CAM2 มุมสัมภาษณ์ HDMI OUT | sw:hdmi-in-2 / เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-3 | cam3:hdmi-out / CAM3 มุมฉากเขียว HDMI OUT | sw:hdmi-in-3 / เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-4 | sw:hdmi-mv-out / เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | monitor:hdmi-in / ทีวีรวมภาพ HDMI IN | HDMI | HDMI | HDMI | 15 | VID-HDMI-A-A |
| lead-5 | sw:hdmi-pgm-out / เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | capture:hdmi-in / Magewell USB Capture HDMI Gen 2 HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-6 | capture:usb / Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | host:usb-1 / โน้ตบุ๊ก OBS USB-A 1 (capture) | USB-A | USB-A | USB_UVC | 10 | DATA-USB-MAGEWELL |
| lead-7 | lav1:out / ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | tx1:mic-in / ตัวส่ง TX 1 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-8 | lav2:out / ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | tx2:mic-in / ตัวส่ง TX 2 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-9 | rx1:audio-out / ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-10 | rx2:audio-out / ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | mix:in-2 / มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-11 | mic:xlr-out / ไมค์สาย XLR XLR OUT | mix:in-3 / มิกเซอร์เสียง IN 3 MIC/LINE (XLR) | XLR-F | XLR-M | MIC | 20 | AUD-XLR-MIC |
| lead-12 | mix:aux-out / มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | sw:audio-in / เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | 6.35mm | 3.5mm | LINE_UNBAL | 10 | AUD-TRS-635-35 |
| lead-13 | mix:main-out / มิกเซอร์เสียง MAIN / PA OUT (XLR) | speaker:xlr-in / Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-PA-ACTIVE |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-hdmi | HDMI 2 ม. (สำรอง) | HDMI ↔ HDMI | spare | 2 |
| x-usb | USB-A ↔ USB-A (ห้ามต่อ HOST ↔ HOST) | USB-A ↔ USB-A | distractor | 2 |
| x-xlr | XLR 5 ม. (สำรอง) | XLR-F ↔ XLR-M | spare | 5 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:hdmi-out | CAM1 ภาพกว้าง HDMI OUT | OUTPUT | HDMI | HDMI | rear | 2.9147, 1.28, 2.9538 | 2.1464230185971003, 0, 3.1768481558911645 |
| cam2:hdmi-out | CAM2 มุมสัมภาษณ์ HDMI OUT | OUTPUT | HDMI | HDMI | rear | 3.3343, 1.28, 0.2011 | 2.647259678699977, 0, -0.20874826083315495 |
| cam3:hdmi-out | CAM3 มุมฉากเขียว HDMI OUT | OUTPUT | HDMI | HDMI | rear | 3.4936, 1.28, 4.561 | 3.0526241422414624, 0, 5.228488046989699 |
| sw:hdmi-in-1 | เครื่องสลับภาพสตูดิโอ VIDEO IN 1 (HDMI) | INPUT | HDMI | HDMI | rear | -2.4804, 0.82, 4.896 | -2.4804, 0, 5.946 |
| sw:hdmi-in-2 | เครื่องสลับภาพสตูดิโอ VIDEO IN 2 (HDMI) | INPUT | HDMI | HDMI | rear | -2.5683, 0.82, 4.896 | -2.5683, 0, 5.946 |
| sw:hdmi-in-3 | เครื่องสลับภาพสตูดิโอ VIDEO IN 3 (HDMI) | INPUT | HDMI | HDMI | rear | -2.6561, 0.82, 4.896 | -2.6561, 0, 5.946 |
| sw:hdmi-in-4 | เครื่องสลับภาพสตูดิโอ VIDEO IN 4 (HDMI) | INPUT | HDMI | HDMI | rear | -2.7439, 0.82, 4.896 | -2.7439, 0, 5.946 |
| sw:hdmi-mv-out | เครื่องสลับภาพสตูดิโอ MULTIVIEW OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.8318, 0.82, 4.896 | -2.8318, 0, 5.946 |
| sw:hdmi-pgm-out | เครื่องสลับภาพสตูดิโอ PGM OUT (HDMI) | OUTPUT | HDMI | HDMI | rear | -2.9196, 0.82, 4.896 | -2.9196, 0, 5.946 |
| sw:audio-in | เครื่องสลับภาพสตูดิโอ AUDIO IN (3.5 mm stereo, LINE) | INPUT | 3.5mm | LINE_UNBAL | rear | -2.7, 0.89, 4.896 | -2.7, 0, 5.946 |
| monitor:hdmi-in | ทีวีรวมภาพ HDMI IN | INPUT | HDMI | HDMI | rear | -6.5416, 1.21, 3.8803 | -7.435824809010449, 0, 3.89932605976618 |
| lav1:out | ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -4.7, 0.79, -2.205 | -4.7, 0, -1.405 |
| lav2:out | ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -3, 0.79, -2.205 | -3, 0, -1.405 |
| tx1:mic-in | ตัวส่ง TX 1 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -4.4, 0.81, -2.321 | -4.4, 0, -3.1210000000000004 |
| tx2:mic-in | ตัวส่ง TX 2 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -3.3, 0.81, -2.321 | -3.3, 0, -3.1210000000000004 |
| rx1:audio-out | ตัวรับ RX ช่อง 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | -3.7, 0.78, 4.884 | -3.7, 0, 3.5840000000000005 |
| rx2:audio-out | ตัวรับ RX ช่อง 2 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | -3.3, 0.78, 4.984 | -3.3, 0, 3.434 |
| mic:xlr-out | ไมค์สาย XLR XLR OUT | OUTPUT | XLR | MIC | rear | 5.12, 1.08, 2.275 | 5.12, 0, 3.075 |
| mix:in-1 | มิกเซอร์เสียง IN 1 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.585, 0.8225, 4.856 | -4.585, 0, 5.906 |
| mix:in-2 | มิกเซอร์เสียง IN 2 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.495, 0.8225, 4.856 | -4.495, 0, 5.906 |
| mix:in-3 | มิกเซอร์เสียง IN 3 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.405, 0.8225, 4.856 | -4.405, 0, 5.906 |
| mix:in-4 | มิกเซอร์เสียง IN 4 MIC/LINE (XLR) | INPUT | XLR | MIC | front | -4.315, 0.8225, 4.856 | -4.315, 0, 5.906 |
| mix:main-out | มิกเซอร์เสียง MAIN / PA OUT (XLR) | OUTPUT | XLR | LINE_BAL | rear | -4.495, 0.8225, 4.544 | -4.495, 0, 3.4939999999999998 |
| mix:aux-out | มิกเซอร์เสียง STREAM / AUX OUT (TRS stereo) | OUTPUT | 6.35mm | LINE_UNBAL | rear | -4.405, 0.8225, 4.544 | -4.405, 0, 3.4939999999999998 |
| speaker:xlr-in | Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (XLR, balanced) | INPUT | XLR | LINE_BAL | rear | -6.0775, 0.45, 4.714 | -6.215319447400091, 0, 3.3608533708727895 |
| speaker:trs-in | Yamaha HS5 ลำโพงมอนิเตอร์ INPUT (TRS phone, balanced) | INPUT | 6.35mm | LINE_BAL | rear | -5.9946, 0.45, 4.6789 | -5.569285878644612, 0, 3.630516530950771 |
| capture:hdmi-in | Magewell USB Capture HDMI Gen 2 HDMI IN | INPUT | HDMI | HDMI | rear | -1.695, 0.8225, 4.7268 | -1.695, 0, 3.4268 |
| capture:usb | Magewell USB Capture HDMI Gen 2 USB 3.0 (DEVICE → HOST) | OUTPUT | USB-A | USB_UVC | rear | -1.605, 0.8225, 4.7268 | -1.605, 0, 3.4268 |
| host:usb-1 | โน้ตบุ๊ก OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | -0.71, 0.773, 4.946 | -0.71, 0, 5.7459999999999996 |
| host:usb-2 | โน้ตบุ๊ก OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | -0.65, 0.773, 4.946 | -0.65, 0, 5.7459999999999996 |
| host:eth | โน้ตบุ๊ก OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | -0.59, 0.773, 4.946 | -0.59, 0, 5.7459999999999996 |

Wireless (no physical cable): tx1 ~RF~ rx1; tx2 ~RF~ rx2. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| mv3 | signal | สามกล้องอยู่ในจอรวมภาพ | true |
| obs-video | signal | OBS ได้ภาพ PGM ผ่าน Capture | true |
| obs-audio | signal | OBS มีเสียงทั้งสามไมค์ที่ฝังใน PGM (ไม่ซ้อน) | true |
| monitor | signal | ฟังตรวจที่ HS5 ได้ | true |
| cuts | rehearsal | ใช้ครบสามมุมกล้องในรายการ | false |
| recovered | delivery | แก้ปัญหาที่เกิดระหว่างงานได้ | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | true |
| pre-power-check | physical | ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก | false |
| pre-cable-route | physical | เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| pre-mic-place | physical | ตั้งไมค์ระดับปาก หันหลบลำโพง | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 4 คิว | true |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## AU-01 / m-1

Topology: `project-au-01-v1`. Reference pointers: R02, R08, R10, R12, R14.

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

Work order: นำภาพกล้องกลางหลังห้องขึ้นจอเวที

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กลางหลังห้อง — กล้อง 1; (0, 0.25, 5.333) yaw 0 | Fixed | power=true; framing=Framed for assignment |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Production SDI Switcher; (0.135, 0.76, 7.29) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM |
| convSH | Blackmagic Micro Converter SDI to HDMI 3G | DESIGN_REFERENCE | ข้างเวทีขวา — SDI→HDMI ไปจอเวที; (11.205, 0.55, -4.995) yaw 1.5707963267948966 | Movable | power=true |
| display | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | ข้างเวทีขวา — แผงขาเข้าจอเวที; (11.205, 0.55, -4.185) yaw 1.5707963267948966 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้อง 1 กลางหลังห้อง SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพ 3G-SDI SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-2 | sw:sdi-out-1 / เครื่องสลับภาพ 3G-SDI SDI OUT 1 | convSH:sdi-in / Micro Converter SDI→HDMI 3G SDI IN | SDI | SDI | SDI | 30 | VID-SDI-3G |
| lead-3 | convSH:hdmi-out / Micro Converter SDI→HDMI 3G HDMI OUT | display:hdmi-in / จอเวที HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้อง 1 กลางหลังห้อง SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.53, 5.526 | 0, 0, 6.326 |
| sw:sdi-in-1 | เครื่องสลับภาพ 3G-SDI SDI IN 1 | INPUT | SDI | SDI | rear | -0.0846, 0.828, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-in-2 | เครื่องสลับภาพ 3G-SDI SDI IN 2 | INPUT | SDI | SDI | rear | 0.0033, 0.828, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-in-3 | เครื่องสลับภาพ 3G-SDI SDI IN 3 | INPUT | SDI | SDI | rear | 0.0911, 0.828, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-in-4 | เครื่องสลับภาพ 3G-SDI SDI IN 4 | INPUT | SDI | SDI | rear | 0.1789, 0.828, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:sdi-in-5 | เครื่องสลับภาพ 3G-SDI SDI IN 5 | INPUT | SDI | SDI | rear | 0.2668, 0.828, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:sdi-in-6 | เครื่องสลับภาพ 3G-SDI SDI IN 6 | INPUT | SDI | SDI | rear | 0.3546, 0.828, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:ref-in | เครื่องสลับภาพ 3G-SDI REF IN (BNC) | INPUT | SDI | REF | rear | -0.0846, 0.8875, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-out-1 | เครื่องสลับภาพ 3G-SDI SDI OUT 1 | OUTPUT | SDI | SDI | rear | 0.0033, 0.8875, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-out-2 | เครื่องสลับภาพ 3G-SDI SDI OUT 2 | OUTPUT | SDI | SDI | rear | 0.0911, 0.8875, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-out-3 | เครื่องสลับภาพ 3G-SDI SDI OUT 3 | OUTPUT | SDI | SDI | rear | 0.1789, 0.8875, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:mv-out | เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 0.2668, 0.8875, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:xlr-l | เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.3546, 0.8875, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:xlr-r | เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.135, 0.947, 7.094 | 0.135, 0, 6.2940000000000005 |
| convSH:sdi-in | Micro Converter SDI→HDMI 3G SDI IN | INPUT | SDI | SDI | rear | 11.159, 0.6125, -4.905 | 10.359, 0, -4.905 |
| convSH:hdmi-out | Micro Converter SDI→HDMI 3G HDMI OUT | OUTPUT | HDMI | HDMI | rear | 11.159, 0.6125, -4.995 | 10.359, 0, -4.995 |
| convSH:usb-pwr | Micro Converter SDI→HDMI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | 11.159, 0.6125, -5.085 | 10.359, 0, -5.085 |
| display:hdmi-in | จอเวที HDMI IN | INPUT | HDMI | HDMI | rear | 11.159, 0.81, -4.185 | 10.359, 0, -4.185 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| stage | signal | จอเวทีแสดงภาพกล้อง | true |
| conv | signal | ตัวแปลง SDI→HDMI มีไฟเลี้ยง | false |
| out | signal | SDI OUT 1 กำหนดหน้าที่แล้ว | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-power-check | physical | ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก | false |
| pre-format | physical | ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 1 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## AU-02 / m-2

Topology: `appendix-a-m-2-v1`. Reference pointers: R02, R08, R10, R11, R12, R14.

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

Work order: AU-02 · ให้เสียงโพเดียมดังในห้องและเข้าระบบถ่ายทอดแยกกัน

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| podium | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Podium บนเวที; (-2.97, 1.9, -6.21) yaw 0 | Fixed |  |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | Stagebox ข้างเวทีขวา; (11.205, 0, -5.94) yaw 1.5707963267948966 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | FOH — หางสายมัลติคอร์; (-3.51, 0.76, 7.155) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | FOH Audio: Digital Mixer; (-4.388, 0.76, 7.695) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; pa-fader=Unity; bc-fader=Unity |
| paL | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าเวทีซ้าย — ลำโพง PA; (-8.64, 0.8, -6.75) yaw 0.3 | Fixed | power=true; power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| paR | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าเวทีขวา — ลำโพง PA; (8.64, 0.8, -6.75) yaw -0.3 | Fixed | power=true; power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Production SDI Switcher; (0.135, 0.76, 7.29) yaw 0 | Fixed | power=true; power=true; xlr-on=true |
| hand1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | GENERIC TRAINING MODEL | จุดไมค์มือถือข้างเวที; (6.345, 0.85, -5.4) yaw 0 | Fixed | power=true; power=true; rf=CH 1 |
| hrx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล่องตัวรับข้างเวที; (9.585, 0.85, -4.928) yaw 0 | Fixed | power=true; power=true; rf=CH 1; pair=Paired |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | podium:xlr-out / ไมค์โพเดียม XLR OUT | stagebox:mic-in-1 / Stagebox อนาล็อก MIC IN 1 | XLR-F | XLR-M | MIC | 20 | AUD-XLR-MIC |
| lead-2 | hrx1:audio-out / ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | stagebox:mic-in-2 / Stagebox อนาล็อก MIC IN 2 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-3 | stagebox:multicore / Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 35 | STG-MULTICORE |
| lead-4 | tail:tail-1 / หางสายมัลติคอร์ FOH TAIL 1 | mix:in-1 / มิกเซอร์ FOH CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-5 | tail:tail-2 / หางสายมัลติคอร์ FOH TAIL 2 | mix:in-2 / มิกเซอร์ FOH CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-6 | mix:pa-l / มิกเซอร์ FOH PA-L LINE OUT | paL:line-in / ลำโพง PA ซ้าย LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 60 | AUD-PA-ACTIVE |
| lead-7 | mix:pa-r / มิกเซอร์ FOH PA-R LINE OUT | paR:line-in / ลำโพง PA ขวา LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 40 | AUD-PA-ACTIVE |
| lead-8 | mix:bc-l / มิกเซอร์ FOH BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-9 | mix:bc-r / มิกเซอร์ FOH BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| podium:xlr-out | ไมค์โพเดียม XLR OUT | OUTPUT | XLR | MIC | rear | -2.97, 1.93, -6.115 | -2.97, 0, -5.315 |
| stagebox:mic-in-1 | Stagebox อนาล็อก MIC IN 1 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.7275 | 10.209, 0, -5.7275 |
| stagebox:mic-in-2 | Stagebox อนาล็อก MIC IN 2 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8125 | 10.209, 0, -5.8125 |
| stagebox:mic-in-3 | Stagebox อนาล็อก MIC IN 3 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8975 | 10.209, 0, -5.8975 |
| stagebox:mic-in-4 | Stagebox อนาล็อก MIC IN 4 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.9825 | 10.209, 0, -5.9825 |
| stagebox:mic-in-5 | Stagebox อนาล็อก MIC IN 5 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.0675 | 10.209, 0, -6.0675 |
| stagebox:mic-in-6 | Stagebox อนาล็อก MIC IN 6 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.1525 | 10.209, 0, -6.1525 |
| stagebox:multicore | Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 11.009, 0.1485, -5.94 | 10.209, 0, -5.94 |
| tail:multicore | หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -3.7225, 0.8315, 6.959 | -3.7225, 0, 6.159 |
| tail:tail-1 | หางสายมัลติคอร์ FOH TAIL 1 | OUTPUT | XLR | MIC | rear | -3.6375, 0.8315, 6.959 | -3.6375, 0, 6.159 |
| tail:tail-2 | หางสายมัลติคอร์ FOH TAIL 2 | OUTPUT | XLR | MIC | rear | -3.5525, 0.8315, 6.959 | -3.5525, 0, 6.159 |
| tail:tail-3 | หางสายมัลติคอร์ FOH TAIL 3 | OUTPUT | XLR | MIC | rear | -3.4675, 0.8315, 6.959 | -3.4675, 0, 6.159 |
| tail:tail-4 | หางสายมัลติคอร์ FOH TAIL 4 | OUTPUT | XLR | MIC | rear | -3.3825, 0.8315, 6.959 | -3.3825, 0, 6.159 |
| tail:tail-5 | หางสายมัลติคอร์ FOH TAIL 5 | OUTPUT | XLR | MIC | rear | -3.2975, 0.8315, 6.959 | -3.2975, 0, 6.159 |
| tail:tail-6 | หางสายมัลติคอร์ FOH TAIL 6 | OUTPUT | XLR | MIC | rear | -3.51, 0.9085, 6.959 | -3.51, 0, 6.159 |
| mix:in-1 | มิกเซอร์ FOH CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.613, 0.8413, 7.414 | -4.613, 0, 6.614 |
| mix:in-2 | มิกเซอร์ FOH CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.523, 0.8413, 7.414 | -4.523, 0, 6.614 |
| mix:in-3 | มิกเซอร์ FOH CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.433, 0.8413, 7.414 | -4.433, 0, 6.614 |
| mix:in-4 | มิกเซอร์ FOH CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.343, 0.8413, 7.414 | -4.343, 0, 6.614 |
| mix:in-5 | มิกเซอร์ FOH CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.253, 0.8413, 7.414 | -4.253, 0, 6.614 |
| mix:in-6 | มิกเซอร์ FOH CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.163, 0.8413, 7.414 | -4.163, 0, 6.614 |
| mix:pa-l | มิกเซอร์ FOH PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.523, 0.9287, 7.414 | -4.523, 0, 6.614 |
| mix:pa-r | มิกเซอร์ FOH PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.433, 0.9287, 7.414 | -4.433, 0, 6.614 |
| mix:bc-l | มิกเซอร์ FOH BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.343, 0.9287, 7.414 | -4.343, 0, 6.614 |
| mix:bc-r | มิกเซอร์ FOH BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.253, 0.9287, 7.414 | -4.253, 0, 6.614 |
| paL:line-in | ลำโพง PA ซ้าย LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -8.6861, 1.075, -6.899 | -9.76066540829489, 0, -7.665687148252815 |
| paR:line-in | ลำโพง PA ขวา LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | 8.6861, 1.075, -6.899 | 9.76066540829489, 0, -7.665687148252815 |
| sw:sdi-in-1 | เครื่องสลับภาพ 3G-SDI SDI IN 1 | INPUT | SDI | SDI | rear | -0.0846, 0.828, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-in-2 | เครื่องสลับภาพ 3G-SDI SDI IN 2 | INPUT | SDI | SDI | rear | 0.0033, 0.828, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-in-3 | เครื่องสลับภาพ 3G-SDI SDI IN 3 | INPUT | SDI | SDI | rear | 0.0911, 0.828, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-in-4 | เครื่องสลับภาพ 3G-SDI SDI IN 4 | INPUT | SDI | SDI | rear | 0.1789, 0.828, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:sdi-in-5 | เครื่องสลับภาพ 3G-SDI SDI IN 5 | INPUT | SDI | SDI | rear | 0.2668, 0.828, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:sdi-in-6 | เครื่องสลับภาพ 3G-SDI SDI IN 6 | INPUT | SDI | SDI | rear | 0.3546, 0.828, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:ref-in | เครื่องสลับภาพ 3G-SDI REF IN (BNC) | INPUT | SDI | REF | rear | -0.0846, 0.8875, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-out-1 | เครื่องสลับภาพ 3G-SDI SDI OUT 1 | OUTPUT | SDI | SDI | rear | 0.0033, 0.8875, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-out-2 | เครื่องสลับภาพ 3G-SDI SDI OUT 2 | OUTPUT | SDI | SDI | rear | 0.0911, 0.8875, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-out-3 | เครื่องสลับภาพ 3G-SDI SDI OUT 3 | OUTPUT | SDI | SDI | rear | 0.1789, 0.8875, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:mv-out | เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 0.2668, 0.8875, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:xlr-l | เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.3546, 0.8875, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:xlr-r | เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.135, 0.947, 7.094 | 0.135, 0, 6.2940000000000005 |
| hrx1:audio-out | ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 9.585, 0.87, -4.994 | 10.385000000000002, 0, -5.794 |

Wireless (no physical cable): hand1 ~RF~ hrx1. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-mic-place | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pa | signal | เสียงโพเดียมออกลำโพงในห้อง ไม่หอน | true |
| lr | physical | Broadcast เข้า L และ R ครบ | false |
| soundcheck | rehearsal | ตรวจเสียงระดับพูดจริงแล้ว | false |
| audio-paL | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| audio-paR | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| audio-sw | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## AU-03 / m-3

Topology: `project-au-03-v1`. Reference pointers: R02, R08, R10, R12, R14.

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

Work order: ห้าแหล่งภาพต้องเลือกได้ทั้งหมด จอเวทีต้องแสดงภาพ PGM ที่สะอาด ไม่ใช่ Multiview

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กลางหลังห้อง — กล้อง 1; (0, 0.25, 5.333) yaw 0 | Fixed | power=true; framing=Framed for assignment |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 2 ทางเดินซ้าย; (-10.55, 0, 1.215) yaw -0.9184654254060052 | Fixed | power=true; framing=Framed for assignment |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 3 ทางเดินขวา; (10.55, 0, 1.215) yaw 0.9184654254060052 | Fixed | power=true; framing=Framed for assignment |
| ptz | อุปกรณ์จำลองเพื่อฝึก · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | PTZ ใกล้เวทีซ้าย; (-10.55, 0, -3.915) yaw -1.348349061368955 | Fixed | power=true; framing=Framed for assignment |
| slides | อุปกรณ์จำลองเพื่อฝึก · โน้ตบุ๊กนำเสนอจำลอง | GENERIC TRAINING MODEL | โต๊ะนำเสนอ — หน้าจอหันเข้าผู้นำเสนอ; (-5.94, 0.76, -4.523) yaw 3.141592653589793 | Fixed | power=true; present=true; mute-audio=true |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะนำเสนอ — HDMI→SDI ข้างโน้ตบุ๊ก; (-5.265, 0.76, -4.455) yaw 0 | Movable | power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Production SDI Switcher; (0.135, 0.76, 7.29) yaw 0 | Fixed | power=true; sdi-out-1=AUX; aux=PROGRAM; pgm=SDI 1 |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Multiview Monitor; (-1.35, 0.76, 7.155) yaw 0 | Fixed | power=true |
| convSH | Blackmagic Micro Converter SDI to HDMI 3G | DESIGN_REFERENCE | ข้างเวทีขวา — SDI→HDMI ไปจอเวที; (11.205, 0.55, -4.995) yaw 1.5707963267948966 | Movable | power=true |
| display | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | ข้างเวทีขวา — แผงขาเข้าจอเวที; (11.205, 0.55, -4.185) yaw 1.5707963267948966 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้อง 1 กลางหลังห้อง SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพ 3G-SDI SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้อง 2 ซ้าย SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพ 3G-SDI SDI IN 2 | SDI | SDI | SDI | 50 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้อง 3 ขวา SDI OUT (3G) | sw:sdi-in-3 / เครื่องสลับภาพ 3G-SDI SDI IN 3 | SDI | SDI | SDI | 25 | VID-SDI-3G |
| lead-4 | ptz:sdi-out / กล้อง PTZ SDI OUT (3G) | sw:sdi-in-4 / เครื่องสลับภาพ 3G-SDI SDI IN 4 | SDI | SDI | SDI | 55 | VID-SDI-3G |
| lead-5 | slides:hdmi-out / โน้ตบุ๊กนำเสนอ HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-6 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | sw:sdi-in-5 / เครื่องสลับภาพ 3G-SDI SDI IN 5 | SDI | SDI | SDI | 45 | VID-SDI-3G |
| lead-7 | sw:mv-out / เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | monitor:sdi-in / จอ Multiview FOH SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-8 | sw:sdi-out-1 / เครื่องสลับภาพ 3G-SDI SDI OUT 1 | convSH:sdi-in / Micro Converter SDI→HDMI 3G SDI IN | SDI | SDI | SDI | 30 | VID-SDI-3G |
| lead-9 | convSH:hdmi-out / Micro Converter SDI→HDMI 3G HDMI OUT | display:hdmi-in / จอเวที HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้อง 1 กลางหลังห้อง SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.53, 5.526 | 0, 0, 6.326 |
| cam2:sdi-out | กล้อง 2 ซ้าย SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7034, 1.28, 1.3322 | -11.339136805913409, 0, 1.8178322822949653 |
| cam3:sdi-out | กล้อง 3 ขวา SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 10.7034, 1.28, 1.3322 | 11.339136805913409, 0, 1.8178322822949653 |
| ptz:sdi-out | กล้อง PTZ SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7382, 1.28, -3.8724 | -11.51848836934083, 0, -3.6959062021729077 |
| slides:hdmi-out | โน้ตบุ๊กนำเสนอ HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.694, 0.773, -4.523 | -4.894, 0, -4.523 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -5.355, 0.8225, -4.501 | -5.355, 0, -5.301 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -5.265, 0.8225, -4.501 | -5.265, 0, -5.301 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -5.175, 0.8225, -4.501 | -5.175, 0, -5.301 |
| sw:sdi-in-1 | เครื่องสลับภาพ 3G-SDI SDI IN 1 | INPUT | SDI | SDI | rear | -0.0846, 0.828, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-in-2 | เครื่องสลับภาพ 3G-SDI SDI IN 2 | INPUT | SDI | SDI | rear | 0.0033, 0.828, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-in-3 | เครื่องสลับภาพ 3G-SDI SDI IN 3 | INPUT | SDI | SDI | rear | 0.0911, 0.828, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-in-4 | เครื่องสลับภาพ 3G-SDI SDI IN 4 | INPUT | SDI | SDI | rear | 0.1789, 0.828, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:sdi-in-5 | เครื่องสลับภาพ 3G-SDI SDI IN 5 | INPUT | SDI | SDI | rear | 0.2668, 0.828, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:sdi-in-6 | เครื่องสลับภาพ 3G-SDI SDI IN 6 | INPUT | SDI | SDI | rear | 0.3546, 0.828, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:ref-in | เครื่องสลับภาพ 3G-SDI REF IN (BNC) | INPUT | SDI | REF | rear | -0.0846, 0.8875, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-out-1 | เครื่องสลับภาพ 3G-SDI SDI OUT 1 | OUTPUT | SDI | SDI | rear | 0.0033, 0.8875, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-out-2 | เครื่องสลับภาพ 3G-SDI SDI OUT 2 | OUTPUT | SDI | SDI | rear | 0.0911, 0.8875, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-out-3 | เครื่องสลับภาพ 3G-SDI SDI OUT 3 | OUTPUT | SDI | SDI | rear | 0.1789, 0.8875, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:mv-out | เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 0.2668, 0.8875, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:xlr-l | เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.3546, 0.8875, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:xlr-r | เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.135, 0.947, 7.094 | 0.135, 0, 6.2940000000000005 |
| monitor:sdi-in | จอ Multiview FOH SDI IN | INPUT | SDI | SDI | rear | -1.35, 1.02, 7.109 | -1.35, 0, 6.309 |
| convSH:sdi-in | Micro Converter SDI→HDMI 3G SDI IN | INPUT | SDI | SDI | rear | 11.159, 0.6125, -4.905 | 10.359, 0, -4.905 |
| convSH:hdmi-out | Micro Converter SDI→HDMI 3G HDMI OUT | OUTPUT | HDMI | HDMI | rear | 11.159, 0.6125, -4.995 | 10.359, 0, -4.995 |
| convSH:usb-pwr | Micro Converter SDI→HDMI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | 11.159, 0.6125, -5.085 | 10.359, 0, -5.085 |
| display:hdmi-in | จอเวที HDMI IN | INPUT | HDMI | HDMI | rear | 11.159, 0.81, -4.185 | 10.359, 0, -4.185 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| mv5 | signal | จอ FOH เห็นครบห้าแหล่งภาพ | true |
| stage | signal | จอเวทีแสดง PGM ที่สะอาด ไม่ใช่ Multiview | true |
| five | rehearsal | เลือกครบทั้งห้าแหล่งภาพ | false |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-cable-route | physical | เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 5 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## AU-04 / m-4

Topology: `project-au-04-v1`. Reference pointers: R02, R08, R10, R12, R14.

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

Work order: ก่อนเริ่มงาน 15 นาที: จอเวทีดำ กล้อง 2 หาย และเสียงโพเดียมไม่เข้าระบบถ่ายทอด — คืนบทบาทพอร์ตและสัญญาณให้ถูก

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กลางหลังห้อง — กล้อง 1; (0, 0.25, 5.333) yaw 0 | Fixed |  |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 2 ทางเดินซ้าย; (-10.55, 0, 1.215) yaw -0.9184654254060052 | Fixed |  |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 3 ทางเดินขวา; (10.55, 0, 1.215) yaw 0.9184654254060052 | Fixed |  |
| ptz | อุปกรณ์จำลองเพื่อฝึก · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | PTZ ใกล้เวทีซ้าย; (-10.55, 0, -3.915) yaw -1.348349061368955 | Fixed |  |
| slides | อุปกรณ์จำลองเพื่อฝึก · โน้ตบุ๊กนำเสนอจำลอง | GENERIC TRAINING MODEL | โต๊ะนำเสนอ — หน้าจอหันเข้าผู้นำเสนอ; (-5.94, 0.76, -4.523) yaw 3.141592653589793 | Fixed |  |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะนำเสนอ — HDMI→SDI ข้างโน้ตบุ๊ก; (-5.265, 0.76, -4.455) yaw 0 | Movable |  |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Production SDI Switcher; (0.135, 0.76, 7.29) yaw 0 | Fixed | aux=PROGRAM |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Multiview Monitor; (-1.35, 0.76, 7.155) yaw 0 | Fixed |  |
| convSH | Blackmagic Micro Converter SDI to HDMI 3G | DESIGN_REFERENCE | ข้างเวทีขวา — SDI→HDMI ไปจอเวที; (11.205, 0.55, -4.995) yaw 1.5707963267948966 | Movable | power=true |
| display | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | ข้างเวทีขวา — แผงขาเข้าจอเวที; (11.205, 0.55, -4.185) yaw 1.5707963267948966 | Fixed |  |
| podium | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Podium บนเวที; (-2.97, 1.9, -6.21) yaw 0 | Fixed |  |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | Stagebox ข้างเวทีขวา; (11.205, 0, -5.94) yaw 1.5707963267948966 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | FOH — หางสายมัลติคอร์; (-3.51, 0.76, 7.155) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | FOH Audio: Digital Mixer; (-4.388, 0.76, 7.695) yaw 0 | Fixed | ch1-bc=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้อง 1 กลางหลังห้อง SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพ 3G-SDI SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้อง 2 ซ้าย SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพ 3G-SDI SDI IN 2 | SDI | SDI | SDI | 50 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้อง 3 ขวา SDI OUT (3G) | sw:sdi-in-3 / เครื่องสลับภาพ 3G-SDI SDI IN 3 | SDI | SDI | SDI | 25 | VID-SDI-3G |
| lead-4 | ptz:sdi-out / กล้อง PTZ SDI OUT (3G) | sw:sdi-in-4 / เครื่องสลับภาพ 3G-SDI SDI IN 4 | SDI | SDI | SDI | 55 | VID-SDI-3G |
| lead-5 | slides:hdmi-out / โน้ตบุ๊กนำเสนอ HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-6 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | sw:sdi-in-5 / เครื่องสลับภาพ 3G-SDI SDI IN 5 | SDI | SDI | SDI | 45 | VID-SDI-3G |
| lead-7 | sw:mv-out / เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | monitor:sdi-in / จอ Multiview FOH SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-8 | sw:sdi-out-1 / เครื่องสลับภาพ 3G-SDI SDI OUT 1 | convSH:sdi-in / Micro Converter SDI→HDMI 3G SDI IN | SDI | SDI | SDI | 30 | VID-SDI-3G |
| lead-9 | convSH:hdmi-out / Micro Converter SDI→HDMI 3G HDMI OUT | display:hdmi-in / จอเวที HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-10 | podium:xlr-out / ไมค์โพเดียม XLR OUT | stagebox:mic-in-1 / Stagebox อนาล็อก MIC IN 1 | XLR-F | XLR-M | MIC | 20 | AUD-XLR-MIC |
| lead-11 | stagebox:multicore / Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 35 | STG-MULTICORE |
| lead-12 | tail:tail-1 / หางสายมัลติคอร์ FOH TAIL 1 | mix:in-1 / มิกเซอร์ FOH CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-13 | mix:bc-l / มิกเซอร์ FOH BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-14 | mix:bc-r / มิกเซอร์ FOH BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |
| x-sdi1 | 3G-SDI 10 ม. (สำรอง) | SDI ↔ SDI | spare | 10 |
| x-sdi2 | 3G-SDI 10 ม. (สำรอง) | SDI ↔ SDI | spare | 10 |
| x-hdmi | HDMI 2 ม. (สำรอง) | HDMI ↔ HDMI | spare | 2 |
| x-xlr | XLR 5 ม. (สำรอง) | XLR-F ↔ XLR-M | spare | 5 |

### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้อง 1 กลางหลังห้อง SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.53, 5.526 | 0, 0, 6.326 |
| cam2:sdi-out | กล้อง 2 ซ้าย SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7034, 1.28, 1.3322 | -11.339136805913409, 0, 1.8178322822949653 |
| cam3:sdi-out | กล้อง 3 ขวา SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 10.7034, 1.28, 1.3322 | 11.339136805913409, 0, 1.8178322822949653 |
| ptz:sdi-out | กล้อง PTZ SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7382, 1.28, -3.8724 | -11.51848836934083, 0, -3.6959062021729077 |
| slides:hdmi-out | โน้ตบุ๊กนำเสนอ HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.694, 0.773, -4.523 | -4.894, 0, -4.523 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -5.355, 0.8225, -4.501 | -5.355, 0, -5.301 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -5.265, 0.8225, -4.501 | -5.265, 0, -5.301 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -5.175, 0.8225, -4.501 | -5.175, 0, -5.301 |
| sw:sdi-in-1 | เครื่องสลับภาพ 3G-SDI SDI IN 1 | INPUT | SDI | SDI | rear | -0.0846, 0.828, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-in-2 | เครื่องสลับภาพ 3G-SDI SDI IN 2 | INPUT | SDI | SDI | rear | 0.0033, 0.828, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-in-3 | เครื่องสลับภาพ 3G-SDI SDI IN 3 | INPUT | SDI | SDI | rear | 0.0911, 0.828, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-in-4 | เครื่องสลับภาพ 3G-SDI SDI IN 4 | INPUT | SDI | SDI | rear | 0.1789, 0.828, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:sdi-in-5 | เครื่องสลับภาพ 3G-SDI SDI IN 5 | INPUT | SDI | SDI | rear | 0.2668, 0.828, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:sdi-in-6 | เครื่องสลับภาพ 3G-SDI SDI IN 6 | INPUT | SDI | SDI | rear | 0.3546, 0.828, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:ref-in | เครื่องสลับภาพ 3G-SDI REF IN (BNC) | INPUT | SDI | REF | rear | -0.0846, 0.8875, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-out-1 | เครื่องสลับภาพ 3G-SDI SDI OUT 1 | OUTPUT | SDI | SDI | rear | 0.0033, 0.8875, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-out-2 | เครื่องสลับภาพ 3G-SDI SDI OUT 2 | OUTPUT | SDI | SDI | rear | 0.0911, 0.8875, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-out-3 | เครื่องสลับภาพ 3G-SDI SDI OUT 3 | OUTPUT | SDI | SDI | rear | 0.1789, 0.8875, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:mv-out | เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 0.2668, 0.8875, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:xlr-l | เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.3546, 0.8875, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:xlr-r | เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.135, 0.947, 7.094 | 0.135, 0, 6.2940000000000005 |
| monitor:sdi-in | จอ Multiview FOH SDI IN | INPUT | SDI | SDI | rear | -1.35, 1.02, 7.109 | -1.35, 0, 6.309 |
| convSH:sdi-in | Micro Converter SDI→HDMI 3G SDI IN | INPUT | SDI | SDI | rear | 11.159, 0.6125, -4.905 | 10.359, 0, -4.905 |
| convSH:hdmi-out | Micro Converter SDI→HDMI 3G HDMI OUT | OUTPUT | HDMI | HDMI | rear | 11.159, 0.6125, -4.995 | 10.359, 0, -4.995 |
| convSH:usb-pwr | Micro Converter SDI→HDMI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | 11.159, 0.6125, -5.085 | 10.359, 0, -5.085 |
| display:hdmi-in | จอเวที HDMI IN | INPUT | HDMI | HDMI | rear | 11.159, 0.81, -4.185 | 10.359, 0, -4.185 |
| podium:xlr-out | ไมค์โพเดียม XLR OUT | OUTPUT | XLR | MIC | rear | -2.97, 1.93, -6.115 | -2.97, 0, -5.315 |
| stagebox:mic-in-1 | Stagebox อนาล็อก MIC IN 1 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.7275 | 10.209, 0, -5.7275 |
| stagebox:mic-in-2 | Stagebox อนาล็อก MIC IN 2 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8125 | 10.209, 0, -5.8125 |
| stagebox:mic-in-3 | Stagebox อนาล็อก MIC IN 3 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8975 | 10.209, 0, -5.8975 |
| stagebox:mic-in-4 | Stagebox อนาล็อก MIC IN 4 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.9825 | 10.209, 0, -5.9825 |
| stagebox:mic-in-5 | Stagebox อนาล็อก MIC IN 5 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.0675 | 10.209, 0, -6.0675 |
| stagebox:mic-in-6 | Stagebox อนาล็อก MIC IN 6 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.1525 | 10.209, 0, -6.1525 |
| stagebox:multicore | Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 11.009, 0.1485, -5.94 | 10.209, 0, -5.94 |
| tail:multicore | หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -3.7225, 0.8315, 6.959 | -3.7225, 0, 6.159 |
| tail:tail-1 | หางสายมัลติคอร์ FOH TAIL 1 | OUTPUT | XLR | MIC | rear | -3.6375, 0.8315, 6.959 | -3.6375, 0, 6.159 |
| tail:tail-2 | หางสายมัลติคอร์ FOH TAIL 2 | OUTPUT | XLR | MIC | rear | -3.5525, 0.8315, 6.959 | -3.5525, 0, 6.159 |
| tail:tail-3 | หางสายมัลติคอร์ FOH TAIL 3 | OUTPUT | XLR | MIC | rear | -3.4675, 0.8315, 6.959 | -3.4675, 0, 6.159 |
| tail:tail-4 | หางสายมัลติคอร์ FOH TAIL 4 | OUTPUT | XLR | MIC | rear | -3.3825, 0.8315, 6.959 | -3.3825, 0, 6.159 |
| tail:tail-5 | หางสายมัลติคอร์ FOH TAIL 5 | OUTPUT | XLR | MIC | rear | -3.2975, 0.8315, 6.959 | -3.2975, 0, 6.159 |
| tail:tail-6 | หางสายมัลติคอร์ FOH TAIL 6 | OUTPUT | XLR | MIC | rear | -3.51, 0.9085, 6.959 | -3.51, 0, 6.159 |
| mix:in-1 | มิกเซอร์ FOH CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.613, 0.8413, 7.414 | -4.613, 0, 6.614 |
| mix:in-2 | มิกเซอร์ FOH CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.523, 0.8413, 7.414 | -4.523, 0, 6.614 |
| mix:in-3 | มิกเซอร์ FOH CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.433, 0.8413, 7.414 | -4.433, 0, 6.614 |
| mix:in-4 | มิกเซอร์ FOH CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.343, 0.8413, 7.414 | -4.343, 0, 6.614 |
| mix:in-5 | มิกเซอร์ FOH CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.253, 0.8413, 7.414 | -4.253, 0, 6.614 |
| mix:in-6 | มิกเซอร์ FOH CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.163, 0.8413, 7.414 | -4.163, 0, 6.614 |
| mix:pa-l | มิกเซอร์ FOH PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.523, 0.9287, 7.414 | -4.523, 0, 6.614 |
| mix:pa-r | มิกเซอร์ FOH PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.433, 0.9287, 7.414 | -4.433, 0, 6.614 |
| mix:bc-l | มิกเซอร์ FOH BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.343, 0.9287, 7.414 | -4.343, 0, 6.614 |
| mix:bc-r | มิกเซอร์ FOH BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.253, 0.9287, 7.414 | -4.253, 0, 6.614 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| cam2 | signal | กล้อง 2 กลับเข้า SDI IN ที่ถูกต้อง | true |
| stage | signal | จอเวทีแสดง PGM | true |
| bc | signal | เสียงโพเดียมถึงขาเข้า Broadcast | true |
| recovered | delivery | ตรวจหาและซ่อมจุดเสียครบ | true |
| installed | physical | ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด | false |
| powered | physical | อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ | false |
| channel-map | physical | ต่อสายตรงตามผังช่องสัญญาณ | false |
| pre-soundcheck | physical | ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก | false |
| cues | rehearsal | ออกอากาศตามคิวครบ 1 คิว | false |
| no-black | rehearsal | ไม่มีภาพดำออกอากาศระหว่างซ้อม | false |
| quiz | delivery | คำถามทบทวนความเข้าใจ | false |
| signoff | delivery | ตรวจรับงานและเก็บงาน | true |

Preinstalled leads: lead-1: cam1:sdi-out → sw:sdi-in-1; lead-3: cam3:sdi-out → sw:sdi-in-3; lead-4: ptz:sdi-out → sw:sdi-in-4; lead-5: slides:hdmi-out → convHS:hdmi-in; lead-6: convHS:sdi-out → sw:sdi-in-5; lead-7: sw:mv-out → monitor:sdi-in; lead-8: sw:sdi-out-1 → convSH:sdi-in; lead-9: convSH:hdmi-out → display:hdmi-in; lead-10: podium:xlr-out → stagebox:mic-in-1; lead-11: stagebox:multicore → tail:multicore; lead-12: tail:tail-1 → mix:in-1; lead-13: mix:bc-l → sw:xlr-l; lead-14: mix:bc-r → sw:xlr-r; lead-2: cam2:sdi-out → sw:ref-in. Faults: f-ref, f-conv, f-aux, f-bus.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## AU-05 / m-5

Topology: `appendix-a-m-5-v1`. Reference pointers: R02, R08, R10, R11, R12, R14.

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

Work order: AU-05 · จัดงานเต็มระบบ: ห้าแหล่งภาพ, จอเวทีจาก AUX, Multiview ที่ FOH, PGM สะอาดไป Capture/OBS และเครื่องบันทึกแยกขาออก, เสียงสามแหล่งผ่าน Stagebox แยก PA และ Broadcast

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กลางหลังห้อง — กล้อง 1; (0, 0.25, 5.333) yaw 0 | Fixed | power=true; framing=Framed for assignment; power=true; framing=Framed for assignment |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 2 ทางเดินซ้าย; (-10.55, 0, 1.215) yaw -0.9184654254060052 | Fixed | power=true; framing=Framed for assignment; power=true; framing=Framed for assignment |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง 3 ทางเดินขวา; (10.55, 0, 1.215) yaw 0.9184654254060052 | Fixed | power=true; framing=Framed for assignment; power=true; framing=Framed for assignment |
| ptz | อุปกรณ์จำลองเพื่อฝึก · กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | PTZ ใกล้เวทีซ้าย; (-10.55, 0, -3.915) yaw -1.348349061368955 | Fixed | power=true; framing=Framed for assignment; power=true; framing=Framed for assignment |
| slides | อุปกรณ์จำลองเพื่อฝึก · โน้ตบุ๊กนำเสนอจำลอง | GENERIC TRAINING MODEL | โต๊ะนำเสนอ — หน้าจอหันเข้าผู้นำเสนอ; (-5.94, 0.76, -4.523) yaw 3.141592653589793 | Fixed | power=true; power=true; present=true; mute-audio=true |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะนำเสนอ — HDMI→SDI ข้างโน้ตบุ๊ก; (-5.265, 0.76, -4.455) yaw 0 | Movable | power=true; power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Production SDI Switcher; (0.135, 0.76, 7.29) yaw 0 | Fixed | power=true; power=true; sdi-out-1=AUX; aux=PROGRAM; pgm=SDI 1; sdi-out-2=PROGRAM; sdi-out-3=PROGRAM; xlr-on=true; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Multiview Monitor; (-1.35, 0.76, 7.155) yaw 0 | Fixed | power=true; power=true |
| convSH | Blackmagic Micro Converter SDI to HDMI 3G | DESIGN_REFERENCE | ข้างเวทีขวา — SDI→HDMI ไปจอเวที; (11.205, 0.55, -4.995) yaw 1.5707963267948966 | Movable | power=true; power=true |
| display | อุปกรณ์จำลองเพื่อฝึก · Generic HDMI Training Monitor | GENERIC TRAINING MODEL | ข้างเวทีขวา — แผงขาเข้าจอเวที; (11.205, 0.55, -4.185) yaw 1.5707963267948966 | Fixed | power=true; power=true |
| podium | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Podium บนเวที; (-2.97, 1.9, -6.21) yaw 0 | Fixed |  |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | Stagebox ข้างเวทีขวา; (11.205, 0, -5.94) yaw 1.5707963267948966 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | FOH — หางสายมัลติคอร์; (-3.51, 0.76, 7.155) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | FOH Audio: Digital Mixer; (-4.388, 0.76, 7.695) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; ch4-gain=Nominal (peaks −18 dBFS); ch4-on=true; ch4-pa=true; ch4-bc=true; ch5-gain=Nominal (peaks −18 dBFS); ch5-on=true; ch5-pa=true; ch5-bc=true; pa-fader=Unity; bc-fader=Unity |
| paL | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าเวทีซ้าย — ลำโพง PA; (-8.64, 0.8, -6.75) yaw 0.3 | Fixed | power=true; power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| paR | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | หน้าเวทีขวา — ลำโพง PA; (8.64, 0.8, -6.75) yaw -0.3 | Fixed | power=true; power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| capture | อุปกรณ์จำลองเพื่อฝึก · อุปกรณ์จับภาพ SDI → USB (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | FOH: Capture / Recorder; (1.62, 0.76, 7.425) yaw 0 | Movable |  |
| host | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์ OBS จำลอง | GENERIC TRAINING MODEL | FOH: Production Computer; (2.295, 0.76, 7.358) yaw -0.2 | Fixed | power=true; power=true; video-src=USB video capture device; audio-src=USB capture embedded audio |
| rec | Blackmagic HyperDeck Studio HD Plus | DESIGN_REFERENCE | FOH — เครื่องบันทึก; (2.7, 0.76, 7.425) yaw 0 | Movable | power=true; power=true; media=SD card mounted (512 GB free); record=true |
| hand1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | GENERIC TRAINING MODEL | จุดไมค์มือถือข้างเวที; (6.345, 0.85, -5.4) yaw 0 | Fixed | power=true; power=true; rf=CH 1 |
| hrx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล่องตัวรับข้างเวที; (9.585, 0.85, -4.928) yaw 0 | Fixed | power=true; power=true; rf=CH 1; pair=Paired |
| hand2 | อุปกรณ์จำลองเพื่อฝึก · ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก) | GENERIC TRAINING MODEL | จุดไมค์มือถือข้างเวที; (7.29, 0.85, -5.4) yaw 0 | Fixed | power=true; power=true; rf=CH 1 |
| hrx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล่องตัวรับข้างเวที; (9.585, 0.85, -4.185) yaw 0 | Fixed | power=true; power=true; rf=CH 1; pair=Paired |
| lav1 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จุดวิทยากร; (-0.945, 0.8, -6.075) yaw 0 | Fixed |  |
| lav2 | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จุดวิทยากร; (0, 0.8, -6.075) yaw 0 | Fixed |  |
| tx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวส่งไมค์วิทยากร — พอร์ตหันหาทางบริการ; (-0.945, 0.8, -5.603) yaw 3.141592653589793 | Fixed | power=true; power=true; rf=CH 1 |
| tx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวส่งไมค์วิทยากร — พอร์ตหันหาทางบริการ; (0, 0.8, -5.603) yaw 3.141592653589793 | Fixed | power=true; power=true; rf=CH 1 |
| rx1 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล่องตัวรับข้างเวที; (9.585, 0.85, -3.375) yaw 0 | Fixed | power=true; power=true; rf=CH 1; pair=Paired |
| rx2 | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล่องตัวรับข้างเวที; (9.585, 0.85, -2.7) yaw 0 | Fixed | power=true; power=true; rf=CH 1; pair=Paired |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้อง 1 กลางหลังห้อง SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพ 3G-SDI SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้อง 2 ซ้าย SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพ 3G-SDI SDI IN 2 | SDI | SDI | SDI | 50 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้อง 3 ขวา SDI OUT (3G) | sw:sdi-in-3 / เครื่องสลับภาพ 3G-SDI SDI IN 3 | SDI | SDI | SDI | 25 | VID-SDI-3G |
| lead-4 | ptz:sdi-out / กล้อง PTZ SDI OUT (3G) | sw:sdi-in-4 / เครื่องสลับภาพ 3G-SDI SDI IN 4 | SDI | SDI | SDI | 55 | VID-SDI-3G |
| lead-5 | slides:hdmi-out / โน้ตบุ๊กนำเสนอ HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-6 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | sw:sdi-in-5 / เครื่องสลับภาพ 3G-SDI SDI IN 5 | SDI | SDI | SDI | 45 | VID-SDI-3G |
| lead-7 | sw:mv-out / เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | monitor:sdi-in / จอ Multiview FOH SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-8 | sw:sdi-out-1 / เครื่องสลับภาพ 3G-SDI SDI OUT 1 | convSH:sdi-in / Micro Converter SDI→HDMI 3G SDI IN | SDI | SDI | SDI | 30 | VID-SDI-3G |
| lead-9 | convSH:hdmi-out / Micro Converter SDI→HDMI 3G HDMI OUT | display:hdmi-in / จอเวที HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-10 | sw:sdi-out-2 / เครื่องสลับภาพ 3G-SDI SDI OUT 2 | capture:sdi-in / อุปกรณ์จับภาพ SDI → USB SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-11 | capture:usb / อุปกรณ์จับภาพ SDI → USB USB 3.0 (DEVICE → HOST) | host:usb-1 / คอมพิวเตอร์สตรีม OBS USB-A 1 (capture) | USB-A | USB-A | USB_UVC | 10 | DATA-USB-MAGEWELL |
| lead-12 | sw:sdi-out-3 / เครื่องสลับภาพ 3G-SDI SDI OUT 3 | rec:sdi-in / HyperDeck Studio HD Plus SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-13 | podium:xlr-out / ไมค์โพเดียม XLR OUT | stagebox:mic-in-1 / Stagebox อนาล็อก MIC IN 1 | XLR-F | XLR-M | MIC | 20 | AUD-XLR-MIC |
| lead-14 | hrx1:audio-out / ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | stagebox:mic-in-2 / Stagebox อนาล็อก MIC IN 2 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-15 | hrx2:audio-out / ตัวรับไมค์มือถือ 2 AUDIO OUT (XLR) | stagebox:mic-in-3 / Stagebox อนาล็อก MIC IN 3 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-16 | rx1:audio-out / ตัวรับไมค์หนีบปก 1 AUDIO OUT (XLR) | stagebox:mic-in-4 / Stagebox อนาล็อก MIC IN 4 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-17 | rx2:audio-out / ตัวรับไมค์หนีบปก 2 AUDIO OUT (XLR) | stagebox:mic-in-5 / Stagebox อนาล็อก MIC IN 5 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-18 | lav1:out / ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | tx1:mic-in / ตัวส่งไมค์หนีบปก 1 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-19 | lav2:out / ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | tx2:mic-in / ตัวส่งไมค์หนีบปก 2 MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-20 | stagebox:multicore / Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 35 | STG-MULTICORE |
| lead-21 | tail:tail-1 / หางสายมัลติคอร์ FOH TAIL 1 | mix:in-1 / มิกเซอร์ FOH CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-22 | tail:tail-2 / หางสายมัลติคอร์ FOH TAIL 2 | mix:in-2 / มิกเซอร์ FOH CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-23 | tail:tail-3 / หางสายมัลติคอร์ FOH TAIL 3 | mix:in-3 / มิกเซอร์ FOH CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-24 | tail:tail-4 / หางสายมัลติคอร์ FOH TAIL 4 | mix:in-4 / มิกเซอร์ FOH CH 4 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-25 | tail:tail-5 / หางสายมัลติคอร์ FOH TAIL 5 | mix:in-5 / มิกเซอร์ FOH CH 5 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-26 | mix:pa-l / มิกเซอร์ FOH PA-L LINE OUT | paL:line-in / ลำโพง PA ซ้าย LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 60 | AUD-PA-ACTIVE |
| lead-27 | mix:pa-r / มิกเซอร์ FOH PA-R LINE OUT | paR:line-in / ลำโพง PA ขวา LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 40 | AUD-PA-ACTIVE |
| lead-28 | mix:bc-l / มิกเซอร์ FOH BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-29 | mix:bc-r / มิกเซอร์ FOH BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้อง 1 กลางหลังห้อง SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.53, 5.526 | 0, 0, 6.326 |
| cam2:sdi-out | กล้อง 2 ซ้าย SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7034, 1.28, 1.3322 | -11.339136805913409, 0, 1.8178322822949653 |
| cam3:sdi-out | กล้อง 3 ขวา SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 10.7034, 1.28, 1.3322 | 11.339136805913409, 0, 1.8178322822949653 |
| ptz:sdi-out | กล้อง PTZ SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.7382, 1.28, -3.8724 | -11.51848836934083, 0, -3.6959062021729077 |
| slides:hdmi-out | โน้ตบุ๊กนำเสนอ HDMI OUT | OUTPUT | HDMI | HDMI | rear | -5.694, 0.773, -4.523 | -4.894, 0, -4.523 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -5.355, 0.8225, -4.501 | -5.355, 0, -5.301 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -5.265, 0.8225, -4.501 | -5.265, 0, -5.301 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -5.175, 0.8225, -4.501 | -5.175, 0, -5.301 |
| sw:sdi-in-1 | เครื่องสลับภาพ 3G-SDI SDI IN 1 | INPUT | SDI | SDI | rear | -0.0846, 0.828, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-in-2 | เครื่องสลับภาพ 3G-SDI SDI IN 2 | INPUT | SDI | SDI | rear | 0.0033, 0.828, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-in-3 | เครื่องสลับภาพ 3G-SDI SDI IN 3 | INPUT | SDI | SDI | rear | 0.0911, 0.828, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-in-4 | เครื่องสลับภาพ 3G-SDI SDI IN 4 | INPUT | SDI | SDI | rear | 0.1789, 0.828, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:sdi-in-5 | เครื่องสลับภาพ 3G-SDI SDI IN 5 | INPUT | SDI | SDI | rear | 0.2668, 0.828, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:sdi-in-6 | เครื่องสลับภาพ 3G-SDI SDI IN 6 | INPUT | SDI | SDI | rear | 0.3546, 0.828, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:ref-in | เครื่องสลับภาพ 3G-SDI REF IN (BNC) | INPUT | SDI | REF | rear | -0.0846, 0.8875, 7.094 | -0.0846, 0, 6.2940000000000005 |
| sw:sdi-out-1 | เครื่องสลับภาพ 3G-SDI SDI OUT 1 | OUTPUT | SDI | SDI | rear | 0.0033, 0.8875, 7.094 | 0.0033, 0, 6.2940000000000005 |
| sw:sdi-out-2 | เครื่องสลับภาพ 3G-SDI SDI OUT 2 | OUTPUT | SDI | SDI | rear | 0.0911, 0.8875, 7.094 | 0.0911, 0, 6.2940000000000005 |
| sw:sdi-out-3 | เครื่องสลับภาพ 3G-SDI SDI OUT 3 | OUTPUT | SDI | SDI | rear | 0.1789, 0.8875, 7.094 | 0.1789, 0, 6.2940000000000005 |
| sw:mv-out | เครื่องสลับภาพ 3G-SDI MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 0.2668, 0.8875, 7.094 | 0.2668, 0, 6.2940000000000005 |
| sw:xlr-l | เครื่องสลับภาพ 3G-SDI AUDIO IN L (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.3546, 0.8875, 7.094 | 0.3546, 0, 6.2940000000000005 |
| sw:xlr-r | เครื่องสลับภาพ 3G-SDI AUDIO IN R (XLR, LINE) | INPUT | XLR | LINE_BAL | rear | 0.135, 0.947, 7.094 | 0.135, 0, 6.2940000000000005 |
| monitor:sdi-in | จอ Multiview FOH SDI IN | INPUT | SDI | SDI | rear | -1.35, 1.02, 7.109 | -1.35, 0, 6.309 |
| convSH:sdi-in | Micro Converter SDI→HDMI 3G SDI IN | INPUT | SDI | SDI | rear | 11.159, 0.6125, -4.905 | 10.359, 0, -4.905 |
| convSH:hdmi-out | Micro Converter SDI→HDMI 3G HDMI OUT | OUTPUT | HDMI | HDMI | rear | 11.159, 0.6125, -4.995 | 10.359, 0, -4.995 |
| convSH:usb-pwr | Micro Converter SDI→HDMI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | 11.159, 0.6125, -5.085 | 10.359, 0, -5.085 |
| display:hdmi-in | จอเวที HDMI IN | INPUT | HDMI | HDMI | rear | 11.159, 0.81, -4.185 | 10.359, 0, -4.185 |
| podium:xlr-out | ไมค์โพเดียม XLR OUT | OUTPUT | XLR | MIC | rear | -2.97, 1.93, -6.115 | -2.97, 0, -5.315 |
| stagebox:mic-in-1 | Stagebox อนาล็อก MIC IN 1 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.7275 | 10.209, 0, -5.7275 |
| stagebox:mic-in-2 | Stagebox อนาล็อก MIC IN 2 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8125 | 10.209, 0, -5.8125 |
| stagebox:mic-in-3 | Stagebox อนาล็อก MIC IN 3 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.8975 | 10.209, 0, -5.8975 |
| stagebox:mic-in-4 | Stagebox อนาล็อก MIC IN 4 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -5.9825 | 10.209, 0, -5.9825 |
| stagebox:mic-in-5 | Stagebox อนาล็อก MIC IN 5 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.0675 | 10.209, 0, -6.0675 |
| stagebox:mic-in-6 | Stagebox อนาล็อก MIC IN 6 | INPUT | XLR | MIC | rear | 11.009, 0.0715, -6.1525 | 10.209, 0, -6.1525 |
| stagebox:multicore | Stagebox อนาล็อก MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 11.009, 0.1485, -5.94 | 10.209, 0, -5.94 |
| tail:multicore | หางสายมัลติคอร์ FOH MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -3.7225, 0.8315, 6.959 | -3.7225, 0, 6.159 |
| tail:tail-1 | หางสายมัลติคอร์ FOH TAIL 1 | OUTPUT | XLR | MIC | rear | -3.6375, 0.8315, 6.959 | -3.6375, 0, 6.159 |
| tail:tail-2 | หางสายมัลติคอร์ FOH TAIL 2 | OUTPUT | XLR | MIC | rear | -3.5525, 0.8315, 6.959 | -3.5525, 0, 6.159 |
| tail:tail-3 | หางสายมัลติคอร์ FOH TAIL 3 | OUTPUT | XLR | MIC | rear | -3.4675, 0.8315, 6.959 | -3.4675, 0, 6.159 |
| tail:tail-4 | หางสายมัลติคอร์ FOH TAIL 4 | OUTPUT | XLR | MIC | rear | -3.3825, 0.8315, 6.959 | -3.3825, 0, 6.159 |
| tail:tail-5 | หางสายมัลติคอร์ FOH TAIL 5 | OUTPUT | XLR | MIC | rear | -3.2975, 0.8315, 6.959 | -3.2975, 0, 6.159 |
| tail:tail-6 | หางสายมัลติคอร์ FOH TAIL 6 | OUTPUT | XLR | MIC | rear | -3.51, 0.9085, 6.959 | -3.51, 0, 6.159 |
| mix:in-1 | มิกเซอร์ FOH CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.613, 0.8413, 7.414 | -4.613, 0, 6.614 |
| mix:in-2 | มิกเซอร์ FOH CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.523, 0.8413, 7.414 | -4.523, 0, 6.614 |
| mix:in-3 | มิกเซอร์ FOH CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.433, 0.8413, 7.414 | -4.433, 0, 6.614 |
| mix:in-4 | มิกเซอร์ FOH CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.343, 0.8413, 7.414 | -4.343, 0, 6.614 |
| mix:in-5 | มิกเซอร์ FOH CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.253, 0.8413, 7.414 | -4.253, 0, 6.614 |
| mix:in-6 | มิกเซอร์ FOH CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -4.163, 0.8413, 7.414 | -4.163, 0, 6.614 |
| mix:pa-l | มิกเซอร์ FOH PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.523, 0.9287, 7.414 | -4.523, 0, 6.614 |
| mix:pa-r | มิกเซอร์ FOH PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.433, 0.9287, 7.414 | -4.433, 0, 6.614 |
| mix:bc-l | มิกเซอร์ FOH BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.343, 0.9287, 7.414 | -4.343, 0, 6.614 |
| mix:bc-r | มิกเซอร์ FOH BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -4.253, 0.9287, 7.414 | -4.253, 0, 6.614 |
| paL:line-in | ลำโพง PA ซ้าย LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -8.6861, 1.075, -6.899 | -9.76066540829489, 0, -7.665687148252815 |
| paR:line-in | ลำโพง PA ขวา LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | 8.6861, 1.075, -6.899 | 9.76066540829489, 0, -7.665687148252815 |
| capture:sdi-in | อุปกรณ์จับภาพ SDI → USB SDI IN | INPUT | SDI | SDI | rear | 1.575, 0.8225, 7.369 | 1.575, 0, 6.569 |
| capture:usb | อุปกรณ์จับภาพ SDI → USB USB 3.0 (DEVICE → HOST) | OUTPUT | USB-A | USB_UVC | rear | 1.665, 0.8225, 7.369 | 1.665, 0, 6.569 |
| host:usb-1 | คอมพิวเตอร์สตรีม OBS USB-A 1 (capture) | INPUT | USB-A | USB_UVC | rear | 2.0658, 0.773, 7.2503 | 1.361214470045031, 0, 6.699337904227455 |
| host:usb-2 | คอมพิวเตอร์สตรีม OBS USB-A 2 (audio) | INPUT | USB-A | USB_UVC | rear | 2.0539, 0.773, 7.3091 | 1.3493144700450312, 0, 6.758137904227454 |
| host:eth | คอมพิวเตอร์สตรีม OBS ETHERNET | OUTPUT | ETHERNET | ETHERNET | rear | 2.042, 0.773, 7.3679 | 1.337414470045031, 0, 6.816937904227454 |
| rec:sdi-in | HyperDeck Studio HD Plus SDI IN | INPUT | SDI | SDI | rear | 2.655, 0.8225, 7.319 | 2.655, 0, 6.519 |
| rec:sdi-out | HyperDeck Studio HD Plus SDI OUT | OUTPUT | SDI | SDI | rear | 2.745, 0.8225, 7.319 | 2.745, 0, 6.519 |
| hrx1:audio-out | ตัวรับไมค์มือถือ 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 9.585, 0.87, -4.994 | 10.385000000000002, 0, -5.794 |
| hrx2:audio-out | ตัวรับไมค์มือถือ 2 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 9.585, 0.87, -4.251 | 8.785, 0, -5.051 |
| lav1:out | ไมค์หนีบปก 1 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -0.945, 0.83, -5.98 | -0.945, 0, -5.180000000000001 |
| lav2:out | ไมค์หนีบปก 2 LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 0, 0.83, -5.98 | 0, 0, -5.180000000000001 |
| tx1:mic-in | ตัวส่งไมค์หนีบปก 1 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -0.945, 0.85, -5.582 | -0.9450000000000001, 0, -4.782 |
| tx2:mic-in | ตัวส่งไมค์หนีบปก 2 MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 0, 0.85, -5.582 | -9.797174393178826e-17, 0, -4.782 |
| rx1:audio-out | ตัวรับไมค์หนีบปก 1 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 9.585, 0.87, -3.441 | 8.785, 0, -4.241 |
| rx2:audio-out | ตัวรับไมค์หนีบปก 2 AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 9.585, 0.87, -2.766 | 8.785, 0, -3.566 |

Wireless (no physical cable): hand1 ~RF~ hrx1; hand2 ~RF~ hrx2; tx1 ~RF~ rx1; tx2 ~RF~ rx2. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-mic-place | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-storage | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| mv5 | signal | Multiview FOH เห็นครบห้าแหล่งภาพ | true |
| stage | signal | จอเวทีแสดง PGM ที่สะอาด (จาก AUX) | true |
| rec | delivery | เครื่องบันทึกบันทึกจาก PGM ที่ถูกต้อง | true |
| audio-paL | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| audio-paR | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| obs-full | delivery | OBS รับภาพรายการพร้อมเสียงวิทยากรครบห้าแหล่ง | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| recovered | delivery | วินิจฉัยและแก้ปัญหาที่เกิดในงาน | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## OUT-01 / l-1

Topology: `appendix-a-l-1-v1`. Reference pointers: R06, R07, R09, R10, R11, R12, R13, R15.

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

Work order: OUT-01 · ต่อกล้องใกล้ผ่านเครื่องสลับภาพและตรวจจอรวมภาพ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง A ฝั่งตะวันออก; (9.18, 0, -7.02) yaw 1.1801892830972098 | Fixed | power=true; framing=Framed for assignment |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | เต็นท์ควบคุม: เครื่องสลับภาพ; (4.928, 0.76, 10.53) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: จอรวมภาพ; (6.21, 0.76, 10.463) yaw 0 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้องใกล้ A SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพภาคสนาม SDI IN 1 | SDI | SDI | SDI | 40 | VID-SDI-3G |
| lead-2 | sw:mv-out / เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพภาคสนาม SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้องใกล้ A SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 9.3585, 1.28, -6.9465 | 10.098242478779772, 0, -6.641900155796565 |
| sw:sdi-in-1 | เครื่องสลับภาพภาคสนาม SDI IN 1 | INPUT | SDI | SDI | rear | 4.703, 0.84, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-2 | เครื่องสลับภาพภาคสนาม SDI IN 2 | INPUT | SDI | SDI | rear | 4.793, 0.84, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-in-3 | เครื่องสลับภาพภาคสนาม SDI IN 3 | INPUT | SDI | SDI | rear | 4.883, 0.84, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-in-4 | เครื่องสลับภาพภาคสนาม SDI IN 4 | INPUT | SDI | SDI | rear | 4.973, 0.84, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-in-5 | เครื่องสลับภาพภาคสนาม SDI IN 5 | INPUT | SDI | SDI | rear | 5.063, 0.84, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-in-6 | เครื่องสลับภาพภาคสนาม SDI IN 6 | INPUT | SDI | SDI | rear | 5.153, 0.84, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:sdi-in-7 | เครื่องสลับภาพภาคสนาม SDI IN 7 | INPUT | SDI | SDI | rear | 4.703, 0.91, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-8 | เครื่องสลับภาพภาคสนาม SDI IN 8 | INPUT | SDI | SDI | rear | 4.793, 0.91, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-out-1 | เครื่องสลับภาพภาคสนาม SDI OUT 1 | OUTPUT | SDI | SDI | rear | 4.883, 0.91, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-out-2 | เครื่องสลับภาพภาคสนาม SDI OUT 2 | OUTPUT | SDI | SDI | rear | 4.973, 0.91, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-out-3 | เครื่องสลับภาพภาคสนาม SDI OUT 3 | OUTPUT | SDI | SDI | rear | 5.063, 0.91, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-out-4 | เครื่องสลับภาพภาคสนาม SDI OUT 4 | OUTPUT | SDI | SDI | rear | 5.153, 0.91, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:mv-out | เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 4.838, 0.98, 10.274 | 4.838, 0, 9.473999999999998 |
| sw:xlr-l | เครื่องสลับภาพภาคสนาม AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 4.928, 0.98, 10.274 | 4.928, 0, 9.473999999999998 |
| sw:xlr-r | เครื่องสลับภาพภาคสนาม AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 5.018, 0.98, 10.274 | 5.018, 0, 9.473999999999998 |
| monitor:sdi-in | จอรวมภาพภาคสนาม SDI IN | INPUT | SDI | SDI | rear | 6.21, 1.02, 10.417 | 5.41, 0, 9.616999999999999 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-shelter | physical | ตรวจความพร้อม: ป้องกันสภาพอากาศ | true |
| pre-power-signoff | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-ramp | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| safe | physical | ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย | true |
| mv | signal | จอรับภาพกล้อง A จากขาออกรวมภาพ | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## OUT-02 / l-2

Topology: `appendix-a-l-2-v1`. Reference pointers: R06, R07, R09, R10, R11, R12, R13, R15.

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

Work order: OUT-02 · จับคู่ไมค์พิธีกร รับเสียงเวทีและบรรยากาศ แล้วส่ง PA โดยแยกบัสรายการ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เวทีและจุดพิธีกร (ไกลด้านหน้า); (1.62, 1, -10.125) yaw 0 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวส่งพิธีกร — พอร์ตหันหาทางบริการหน้าเวที; (1.08, 1, -10.125) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: Wireless receiver; (3.24, 0.76, 11.205) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| shotgun | อุปกรณ์จำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | GENERIC TRAINING MODEL | Shotgun บนบูมหน้าเวที; (-3.51, 0, -8.168) yaw 0 | Fixed | windscreen=true |
| amb | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | Ambient mic ฝั่งผู้ชม; (-9.72, 0, 0.54) yaw 1.5707963267948966 | Fixed | windscreen=true |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | โต๊ะควบคุมเสียงในเต็นท์; (3.713, 0.76, 10.665) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; pa-fader=Unity; bc-fader=Unity; ch2-phantom=true |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | PA หน้าเวที; (-7.83, 0, -7.56) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | lav:out / ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-2 | rx:audio-out / ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-3 | shotgun:xlr-out / ไมค์ช็อตกัน MIC XLR OUT | mix:in-2 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 60 | AUD-XLR-MIC |
| lead-4 | amb:xlr-out / ไมค์บรรยากาศ XLR OUT | mix:in-3 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 55 | AUD-XLR-MIC |
| lead-5 | mix:pa-l / มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | pa:line-in / ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 60 | AUD-PA-ACTIVE |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lav:out | ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.62, 1.03, -10.03 | 1.62, 0, -9.229999999999999 |
| tx:mic-in | ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 1.08, 1.05, -10.104 | 1.08, 0, -9.303999999999998 |
| rx:audio-out | ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 3.24, 0.78, 11.139 | 2.4400000000000004, 0, 10.338999999999999 |
| shotgun:xlr-out | ไมค์ช็อตกัน MIC XLR OUT | OUTPUT | XLR | MIC | rear | -3.51, 1.39, -8.193 | -3.51, 0, -8.993 |
| amb:xlr-out | ไมค์บรรยากาศ XLR OUT | OUTPUT | XLR | MIC | side | -9.745, 1.39, 0.54 | -10.545, 0, 0.54 |
| mix:in-1 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.488, 0.8413, 10.384 | 3.488, 0, 9.584 |
| mix:in-2 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.578, 0.8413, 10.384 | 3.578, 0, 9.584 |
| mix:in-3 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.668, 0.8413, 10.384 | 3.668, 0, 9.584 |
| mix:in-4 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.758, 0.8413, 10.384 | 3.758, 0, 9.584 |
| mix:in-5 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.848, 0.8413, 10.384 | 3.848, 0, 9.584 |
| mix:in-6 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.938, 0.8413, 10.384 | 3.938, 0, 9.584 |
| mix:pa-l | มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.578, 0.9287, 10.384 | 3.578, 0, 9.584 |
| mix:pa-r | มิกเซอร์ภาคสนาม PA / BROADCAST PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.668, 0.9287, 10.384 | 3.668, 0, 9.584 |
| mix:bc-l | มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.758, 0.9287, 10.384 | 3.758, 0, 9.584 |
| mix:bc-r | มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.848, 0.9287, 10.384 | 3.848, 0, 9.584 |
| pa:line-in | ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -7.83, 0.275, -7.716 | -7.83, 0, -8.516 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-shelter | physical | ตรวจความพร้อม: ป้องกันสภาพอากาศ | true |
| pre-power-signoff | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-ramp | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| safe | physical | ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| broadcast-bus | signal | บัส Broadcast มีเสียงพร้อมนำไปฝังรายการ | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## OUT-03 / l-3

Topology: `appendix-a-l-3-v1`. Reference pointers: R06, R07, R09, R10, R11, R12, R13, R15.

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

Work order: OUT-03 · ติดตั้งคู่ Optical ของกล้อง C และสลับภาพ A/B/C ด้วย Preview ก่อน Program

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง A ฝั่งตะวันออก; (9.18, 0, -7.02) yaw 1.1801892830972098 | Fixed | power=true; framing=Framed for assignment |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง B ฝั่งตะวันตก; (-10.26, 0, -6.75) yaw -1.194835372923591 | Fixed | power=true; framing=Framed for assignment |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง C หลังกลาง (ภาพรวม); (0, 0.3, 5.805) yaw 0 | Fixed | power=true; framing=Framed for assignment |
| fiberTx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | เคสส่ง Optical ข้างกล้อง C; (1.215, 0.85, 5.805) yaw 0 | Movable | power=true |
| fiberRx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | กล่อง Fiber RX ข้างโต๊ะควบคุม; (2.093, 0.85, 11.003) yaw 0 | Movable | power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | เต็นท์ควบคุม: เครื่องสลับภาพ; (4.928, 0.76, 10.53) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: จอรวมภาพ; (6.21, 0.76, 10.463) yaw 0 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้องใกล้ A SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพภาคสนาม SDI IN 1 | SDI | SDI | SDI | 40 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้องใกล้ B SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพภาคสนาม SDI IN 2 | SDI | SDI | SDI | 60 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้องไกล C SDI OUT (3G) | fiberTx:sdi-in / ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-4 | fiberTx:optical-out / ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | fiberRx:optical-in / ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 40 | FIB-SDI-LINK |
| lead-5 | fiberRx:sdi-out / ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | sw:sdi-in-3 / เครื่องสลับภาพภาคสนาม SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | sw:mv-out / เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพภาคสนาม SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้องใกล้ A SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 9.3585, 1.28, -6.9465 | 10.098242478779772, 0, -6.641900155796565 |
| cam2:sdi-out | กล้องใกล้ B SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.4395, 1.28, -6.6791 | -11.18362417706506, 0, -6.385366772211161 |
| cam3:sdi-out | กล้องไกล C SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.58, 5.998 | 0, 0, 6.798 |
| fiberTx:sdi-in | ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | INPUT | SDI | SDI | rear | 1.17, 0.96, 5.609 | 1.17, 0, 4.809 |
| fiberTx:optical-out | ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | OUTPUT | FIBER | FIBER_VIDEO | rear | 1.26, 0.96, 5.609 | 1.26, 0, 4.809 |
| fiberRx:optical-in | ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | 2.048, 0.96, 10.807 | 2.048, 0, 10.007 |
| fiberRx:sdi-out | ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | 2.138, 0.96, 10.807 | 2.138, 0, 10.007 |
| sw:sdi-in-1 | เครื่องสลับภาพภาคสนาม SDI IN 1 | INPUT | SDI | SDI | rear | 4.703, 0.84, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-2 | เครื่องสลับภาพภาคสนาม SDI IN 2 | INPUT | SDI | SDI | rear | 4.793, 0.84, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-in-3 | เครื่องสลับภาพภาคสนาม SDI IN 3 | INPUT | SDI | SDI | rear | 4.883, 0.84, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-in-4 | เครื่องสลับภาพภาคสนาม SDI IN 4 | INPUT | SDI | SDI | rear | 4.973, 0.84, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-in-5 | เครื่องสลับภาพภาคสนาม SDI IN 5 | INPUT | SDI | SDI | rear | 5.063, 0.84, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-in-6 | เครื่องสลับภาพภาคสนาม SDI IN 6 | INPUT | SDI | SDI | rear | 5.153, 0.84, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:sdi-in-7 | เครื่องสลับภาพภาคสนาม SDI IN 7 | INPUT | SDI | SDI | rear | 4.703, 0.91, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-8 | เครื่องสลับภาพภาคสนาม SDI IN 8 | INPUT | SDI | SDI | rear | 4.793, 0.91, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-out-1 | เครื่องสลับภาพภาคสนาม SDI OUT 1 | OUTPUT | SDI | SDI | rear | 4.883, 0.91, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-out-2 | เครื่องสลับภาพภาคสนาม SDI OUT 2 | OUTPUT | SDI | SDI | rear | 4.973, 0.91, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-out-3 | เครื่องสลับภาพภาคสนาม SDI OUT 3 | OUTPUT | SDI | SDI | rear | 5.063, 0.91, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-out-4 | เครื่องสลับภาพภาคสนาม SDI OUT 4 | OUTPUT | SDI | SDI | rear | 5.153, 0.91, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:mv-out | เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 4.838, 0.98, 10.274 | 4.838, 0, 9.473999999999998 |
| sw:xlr-l | เครื่องสลับภาพภาคสนาม AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 4.928, 0.98, 10.274 | 4.928, 0, 9.473999999999998 |
| sw:xlr-r | เครื่องสลับภาพภาคสนาม AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 5.018, 0.98, 10.274 | 5.018, 0, 9.473999999999998 |
| monitor:sdi-in | จอรวมภาพภาคสนาม SDI IN | INPUT | SDI | SDI | rear | 6.21, 1.02, 10.417 | 5.41, 0, 9.616999999999999 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-shelter | physical | ตรวจความพร้อม: ป้องกันสภาพอากาศ | true |
| pre-power-signoff | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-ramp | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| safe | physical | ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย | true |
| mv | signal | จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง | true |
| input-1 | signal | ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด | true |
| input-2 | signal | ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด | true |
| input-3 | signal | ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## OUT-04 / l-4

Topology: `appendix-a-l-4-v1`. Reference pointers: R06, R07, R09, R10, R11, R12, R13, R15.

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

Work order: OUT-04 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง A ฝั่งตะวันออก; (9.18, 0, -7.02) yaw 1.1801892830972098 | Fixed | power=true; framing=Framed for assignment |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง B ฝั่งตะวันตก; (-10.26, 0, -6.75) yaw -1.194835372923591 | Fixed | power=true; framing=Framed for assignment |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง C หลังกลาง (ภาพรวม); (0, 0.3, 5.805) yaw 0 | Fixed | power=true; framing=Framed for assignment |
| fiberTx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | เคสส่ง Optical ข้างกล้อง C; (1.215, 0.85, 5.805) yaw 0 | Movable | power=true |
| fiberRx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | กล่อง Fiber RX ข้างโต๊ะควบคุม; (2.093, 0.85, 11.003) yaw 0 | Movable | power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | เต็นท์ควบคุม: เครื่องสลับภาพ; (4.928, 0.76, 10.53) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: จอรวมภาพ; (6.21, 0.76, 10.463) yaw 0 | Fixed | power=true |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เวทีและจุดพิธีกร (ไกลด้านหน้า); (1.62, 1, -10.125) yaw 0 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวส่งพิธีกร — พอร์ตหันหาทางบริการหน้าเวที; (1.08, 1, -10.125) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: Wireless receiver; (3.24, 0.76, 11.205) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| shotgun | อุปกรณ์จำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | GENERIC TRAINING MODEL | Shotgun บนบูมหน้าเวที; (-3.51, 0, -8.168) yaw 0 | Fixed | windscreen=true |
| amb | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | Ambient mic ฝั่งผู้ชม; (-9.72, 0, 0.54) yaw 1.5707963267948966 | Fixed | windscreen=true |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | โต๊ะควบคุมเสียงในเต็นท์; (3.713, 0.76, 10.665) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; pa-fader=Unity; bc-fader=Unity; ch2-phantom=true |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | PA หน้าเวที; (-7.83, 0, -7.56) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| embed | อุปกรณ์จำลองเพื่อฝึก · อุปกรณ์ฝังเสียงแอนะล็อกใน SDI | GENERIC TRAINING MODEL | โต๊ะฝังเสียงและส่งสัญญาณ; (6.48, 0.76, 9.315) yaw 0 | Fixed | power=true; embed=true |
| enc | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | โต๊ะฝังเสียงและส่งสัญญาณ; (7.695, 0.76, 9.315) yaw 0 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| net | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | โต๊ะเครือข่าย; (8.775, 0.76, 9.315) yaw 0 | Fixed | power=true; wan-link=Up; uplink-test=true |
| wan | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | จุดรับสตรีมทดสอบ; (9.113, 0, 11.61) yaw -1.5707963267948966 | Fixed |  |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้องใกล้ A SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพภาคสนาม SDI IN 1 | SDI | SDI | SDI | 40 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้องใกล้ B SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพภาคสนาม SDI IN 2 | SDI | SDI | SDI | 60 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้องไกล C SDI OUT (3G) | fiberTx:sdi-in / ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-4 | fiberTx:optical-out / ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | fiberRx:optical-in / ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 40 | FIB-SDI-LINK |
| lead-5 | fiberRx:sdi-out / ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | sw:sdi-in-3 / เครื่องสลับภาพภาคสนาม SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | sw:mv-out / เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพภาคสนาม SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-7 | lav:out / ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-8 | rx:audio-out / ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-9 | shotgun:xlr-out / ไมค์ช็อตกัน MIC XLR OUT | mix:in-2 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 60 | AUD-XLR-MIC |
| lead-10 | amb:xlr-out / ไมค์บรรยากาศ XLR OUT | mix:in-3 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 55 | AUD-XLR-MIC |
| lead-11 | mix:pa-l / มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | pa:line-in / ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 60 | AUD-PA-ACTIVE |
| lead-12 | sw:sdi-out-1 / เครื่องสลับภาพภาคสนาม SDI OUT 1 | embed:sdi-in / อุปกรณ์ฝังเสียงรายการ SDI SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-13 | mix:bc-l / มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | embed:audio-l / อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN L · BREAKOUT | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-14 | mix:bc-r / มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | embed:audio-r / อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN R · BREAKOUT | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-15 | embed:sdi-out / อุปกรณ์ฝังเสียงรายการ SDI SDI OUT · EMBEDDED AUDIO | enc:sdi-in / ตัวเข้ารหัสส่งสตรีมจำลอง PROGRAM SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-16 | enc:eth / ตัวเข้ารหัสส่งสตรีมจำลอง NETWORK · Ethernet | net:lan-1 / เกตเวย์เครือข่ายสายหลัก LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-17 | net:wan / เกตเวย์เครือข่ายสายหลัก WAN | wan:wan-in / จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้องใกล้ A SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 9.3585, 1.28, -6.9465 | 10.098242478779772, 0, -6.641900155796565 |
| cam2:sdi-out | กล้องใกล้ B SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.4395, 1.28, -6.6791 | -11.18362417706506, 0, -6.385366772211161 |
| cam3:sdi-out | กล้องไกล C SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.58, 5.998 | 0, 0, 6.798 |
| fiberTx:sdi-in | ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | INPUT | SDI | SDI | rear | 1.17, 0.96, 5.609 | 1.17, 0, 4.809 |
| fiberTx:optical-out | ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | OUTPUT | FIBER | FIBER_VIDEO | rear | 1.26, 0.96, 5.609 | 1.26, 0, 4.809 |
| fiberRx:optical-in | ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | 2.048, 0.96, 10.807 | 2.048, 0, 10.007 |
| fiberRx:sdi-out | ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | 2.138, 0.96, 10.807 | 2.138, 0, 10.007 |
| sw:sdi-in-1 | เครื่องสลับภาพภาคสนาม SDI IN 1 | INPUT | SDI | SDI | rear | 4.703, 0.84, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-2 | เครื่องสลับภาพภาคสนาม SDI IN 2 | INPUT | SDI | SDI | rear | 4.793, 0.84, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-in-3 | เครื่องสลับภาพภาคสนาม SDI IN 3 | INPUT | SDI | SDI | rear | 4.883, 0.84, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-in-4 | เครื่องสลับภาพภาคสนาม SDI IN 4 | INPUT | SDI | SDI | rear | 4.973, 0.84, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-in-5 | เครื่องสลับภาพภาคสนาม SDI IN 5 | INPUT | SDI | SDI | rear | 5.063, 0.84, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-in-6 | เครื่องสลับภาพภาคสนาม SDI IN 6 | INPUT | SDI | SDI | rear | 5.153, 0.84, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:sdi-in-7 | เครื่องสลับภาพภาคสนาม SDI IN 7 | INPUT | SDI | SDI | rear | 4.703, 0.91, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-8 | เครื่องสลับภาพภาคสนาม SDI IN 8 | INPUT | SDI | SDI | rear | 4.793, 0.91, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-out-1 | เครื่องสลับภาพภาคสนาม SDI OUT 1 | OUTPUT | SDI | SDI | rear | 4.883, 0.91, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-out-2 | เครื่องสลับภาพภาคสนาม SDI OUT 2 | OUTPUT | SDI | SDI | rear | 4.973, 0.91, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-out-3 | เครื่องสลับภาพภาคสนาม SDI OUT 3 | OUTPUT | SDI | SDI | rear | 5.063, 0.91, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-out-4 | เครื่องสลับภาพภาคสนาม SDI OUT 4 | OUTPUT | SDI | SDI | rear | 5.153, 0.91, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:mv-out | เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 4.838, 0.98, 10.274 | 4.838, 0, 9.473999999999998 |
| sw:xlr-l | เครื่องสลับภาพภาคสนาม AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 4.928, 0.98, 10.274 | 4.928, 0, 9.473999999999998 |
| sw:xlr-r | เครื่องสลับภาพภาคสนาม AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 5.018, 0.98, 10.274 | 5.018, 0, 9.473999999999998 |
| monitor:sdi-in | จอรวมภาพภาคสนาม SDI IN | INPUT | SDI | SDI | rear | 6.21, 1.02, 10.417 | 5.41, 0, 9.616999999999999 |
| lav:out | ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.62, 1.03, -10.03 | 1.62, 0, -9.229999999999999 |
| tx:mic-in | ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 1.08, 1.05, -10.104 | 1.08, 0, -9.303999999999998 |
| rx:audio-out | ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 3.24, 0.78, 11.139 | 2.4400000000000004, 0, 10.338999999999999 |
| shotgun:xlr-out | ไมค์ช็อตกัน MIC XLR OUT | OUTPUT | XLR | MIC | rear | -3.51, 1.39, -8.193 | -3.51, 0, -8.993 |
| amb:xlr-out | ไมค์บรรยากาศ XLR OUT | OUTPUT | XLR | MIC | side | -9.745, 1.39, 0.54 | -10.545, 0, 0.54 |
| mix:in-1 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.488, 0.8413, 10.384 | 3.488, 0, 9.584 |
| mix:in-2 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.578, 0.8413, 10.384 | 3.578, 0, 9.584 |
| mix:in-3 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.668, 0.8413, 10.384 | 3.668, 0, 9.584 |
| mix:in-4 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.758, 0.8413, 10.384 | 3.758, 0, 9.584 |
| mix:in-5 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.848, 0.8413, 10.384 | 3.848, 0, 9.584 |
| mix:in-6 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.938, 0.8413, 10.384 | 3.938, 0, 9.584 |
| mix:pa-l | มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.578, 0.9287, 10.384 | 3.578, 0, 9.584 |
| mix:pa-r | มิกเซอร์ภาคสนาม PA / BROADCAST PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.668, 0.9287, 10.384 | 3.668, 0, 9.584 |
| mix:bc-l | มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.758, 0.9287, 10.384 | 3.758, 0, 9.584 |
| mix:bc-r | มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.848, 0.9287, 10.384 | 3.848, 0, 9.584 |
| pa:line-in | ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -7.83, 0.275, -7.716 | -7.83, 0, -8.516 |
| embed:sdi-in | อุปกรณ์ฝังเสียงรายการ SDI SDI IN | INPUT | SDI | SDI | rear | 6.345, 0.87, 9.119 | 6.345, 0, 8.318999999999999 |
| embed:sdi-out | อุปกรณ์ฝังเสียงรายการ SDI SDI OUT · EMBEDDED AUDIO | OUTPUT | SDI | SDI | rear | 6.435, 0.87, 9.119 | 6.435, 0, 8.318999999999999 |
| embed:audio-l | อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN L · BREAKOUT | INPUT | XLR | LINE_BAL | rear | 6.525, 0.87, 9.119 | 6.525, 0, 8.318999999999999 |
| embed:audio-r | อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN R · BREAKOUT | INPUT | XLR | LINE_BAL | rear | 6.615, 0.87, 9.119 | 6.615, 0, 8.318999999999999 |
| enc:sdi-in | ตัวเข้ารหัสส่งสตรีมจำลอง PROGRAM SDI IN | INPUT | SDI | SDI | rear | 7.65, 0.87, 9.119 | 7.65, 0, 8.318999999999999 |
| enc:eth | ตัวเข้ารหัสส่งสตรีมจำลอง NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | 7.74, 0.87, 9.119 | 7.74, 0, 8.318999999999999 |
| net:lan-1 | เกตเวย์เครือข่ายสายหลัก LAN 1 | INPUT | ETHERNET | ETHERNET | rear | 8.685, 0.8225, 9.219 | 8.685, 0, 8.418999999999999 |
| net:lan-2 | เกตเวย์เครือข่ายสายหลัก LAN 2 | INPUT | ETHERNET | ETHERNET | rear | 8.775, 0.8225, 9.219 | 8.775, 0, 8.418999999999999 |
| net:wan | เกตเวย์เครือข่ายสายหลัก WAN | OUTPUT | ETHERNET | WAN | rear | 8.865, 0.8225, 9.219 | 8.865, 0, 8.418999999999999 |
| wan:wan-in | จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | INPUT | ETHERNET | WAN | rear | 9.319, 0.45, 11.61 | 10.119000000000002, 0, 11.61 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-ramp | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-shelter | physical | ตรวจความพร้อม: ป้องกันสภาพอากาศ | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-power-signoff | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| safe | physical | ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย | true |
| mv | signal | จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง | true |
| input-1 | signal | ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด | true |
| input-2 | signal | ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด | true |
| input-3 | signal | ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| embed | signal | มีภาพรายการและเสียงครบเข้าสู่ตัวเข้ารหัส | true |
| ingest | delivery | ผู้ชมจำลองได้รับภาพและเสียงรายการ | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| recovered | delivery | วินิจฉัยและแก้ปัญหาที่เกิดในงาน | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: lead-1: cam1:sdi-out → sw:sdi-in-1; lead-2: cam2:sdi-out → sw:sdi-in-2; lead-3: cam3:sdi-out → fiberTx:sdi-in; lead-4: fiberTx:optical-out → fiberRx:optical-in; lead-6: sw:mv-out → monitor:sdi-in; lead-7: lav:out → tx:mic-in; lead-8: rx:audio-out → mix:in-1; lead-9: shotgun:xlr-out → mix:in-2; lead-10: amb:xlr-out → mix:in-3; lead-11: mix:pa-l → pa:line-in; lead-12: sw:sdi-out-1 → embed:sdi-in; lead-13: mix:bc-l → embed:audio-l; lead-14: mix:bc-r → embed:audio-r; lead-15: embed:sdi-out → enc:sdi-in; lead-16: enc:eth → net:lan-1; lead-17: net:wan → wan:wan-in. Faults: f-physical-link, f-embed.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## OUT-05 / l-5

Topology: `appendix-a-l-5-v1`. Reference pointers: R06, R07, R09, R10, R11, R12, R13, R15.

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

Work order: OUT-05 · ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง A ฝั่งตะวันออก; (9.18, 0, -7.02) yaw 1.1801892830972098 | Fixed | power=true; framing=Framed for assignment |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง B ฝั่งตะวันตก; (-10.26, 0, -6.75) yaw -1.194835372923591 | Fixed | power=true; framing=Framed for assignment |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้อง SDI 1080p50 (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | กล้อง C หลังกลาง (ภาพรวม); (0, 0.3, 5.805) yaw 0 | Fixed | power=true; framing=Framed for assignment |
| fiberTx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | เคสส่ง Optical ข้างกล้อง C; (1.215, 0.85, 5.805) yaw 0 | Movable | power=true |
| fiberRx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน) | GENERIC TRAINING MODEL | กล่อง Fiber RX ข้างโต๊ะควบคุม; (2.093, 0.85, 11.003) yaw 0 | Movable | power=true |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | เต็นท์ควบคุม: เครื่องสลับภาพ; (4.928, 0.76, 10.53) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: จอรวมภาพ; (6.21, 0.76, 10.463) yaw 0 | Fixed | power=true |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เวทีและจุดพิธีกร (ไกลด้านหน้า); (1.62, 1, -10.125) yaw 0 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวส่งพิธีกร — พอร์ตหันหาทางบริการหน้าเวที; (1.08, 1, -10.125) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | เต็นท์ควบคุม: Wireless receiver; (3.24, 0.76, 11.205) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| shotgun | อุปกรณ์จำลองเพื่อฝึก · ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V) | GENERIC TRAINING MODEL | Shotgun บนบูมหน้าเวที; (-3.51, 0, -8.168) yaw 0 | Fixed | windscreen=true |
| amb | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | Ambient mic ฝั่งผู้ชม; (-9.72, 0, 0.54) yaw 1.5707963267948966 | Fixed | windscreen=true |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | โต๊ะควบคุมเสียงในเต็นท์; (3.713, 0.76, 10.665) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; pa-fader=Unity; bc-fader=Unity; ch2-phantom=true |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | PA หน้าเวที; (-7.83, 0, -7.56) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| embed | อุปกรณ์จำลองเพื่อฝึก · อุปกรณ์ฝังเสียงแอนะล็อกใน SDI | GENERIC TRAINING MODEL | โต๊ะฝังเสียงและส่งสัญญาณ; (6.48, 0.76, 9.315) yaw 0 | Fixed | power=true; embed=true |
| enc | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | โต๊ะฝังเสียงและส่งสัญญาณ; (7.695, 0.76, 9.315) yaw 0 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| net | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | โต๊ะเครือข่าย; (8.775, 0.76, 9.315) yaw 0 | Fixed | power=true; wan-link=Up; uplink-test=true |
| wan | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | จุดรับสตรีมทดสอบ; (9.113, 0, 11.61) yaw -1.5707963267948966 | Fixed |  |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:sdi-out / กล้องใกล้ A SDI OUT (3G) | sw:sdi-in-1 / เครื่องสลับภาพภาคสนาม SDI IN 1 | SDI | SDI | SDI | 40 | VID-SDI-3G |
| lead-2 | cam2:sdi-out / กล้องใกล้ B SDI OUT (3G) | sw:sdi-in-2 / เครื่องสลับภาพภาคสนาม SDI IN 2 | SDI | SDI | SDI | 60 | VID-SDI-3G |
| lead-3 | cam3:sdi-out / กล้องไกล C SDI OUT (3G) | fiberTx:sdi-in / ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-4 | fiberTx:optical-out / ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | fiberRx:optical-in / ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 40 | FIB-SDI-LINK |
| lead-5 | fiberRx:sdi-out / ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | sw:sdi-in-3 / เครื่องสลับภาพภาคสนาม SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | sw:mv-out / เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพภาคสนาม SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-7 | lav:out / ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 10 | AUD-LAV-TX |
| lead-8 | rx:audio-out / ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | mix:in-1 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-9 | shotgun:xlr-out / ไมค์ช็อตกัน MIC XLR OUT | mix:in-2 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 60 | AUD-XLR-MIC |
| lead-10 | amb:xlr-out / ไมค์บรรยากาศ XLR OUT | mix:in-3 / มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 55 | AUD-XLR-MIC |
| lead-11 | mix:pa-l / มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | pa:line-in / ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 60 | AUD-PA-ACTIVE |
| lead-12 | sw:sdi-out-1 / เครื่องสลับภาพภาคสนาม SDI OUT 1 | embed:sdi-in / อุปกรณ์ฝังเสียงรายการ SDI SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-13 | mix:bc-l / มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | embed:audio-l / อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN L · BREAKOUT | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-14 | mix:bc-r / มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | embed:audio-r / อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN R · BREAKOUT | XLR-F | XLR-M | LINE_BAL | 10 | AUD-XLR-LINE-BAL |
| lead-15 | embed:sdi-out / อุปกรณ์ฝังเสียงรายการ SDI SDI OUT · EMBEDDED AUDIO | enc:sdi-in / ตัวเข้ารหัสส่งสตรีมจำลอง PROGRAM SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-16 | enc:eth / ตัวเข้ารหัสส่งสตรีมจำลอง NETWORK · Ethernet | net:lan-1 / เกตเวย์เครือข่ายสายหลัก LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-17 | net:wan / เกตเวย์เครือข่ายสายหลัก WAN | wan:wan-in / จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:sdi-out | กล้องใกล้ A SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 9.3585, 1.28, -6.9465 | 10.098242478779772, 0, -6.641900155796565 |
| cam2:sdi-out | กล้องใกล้ B SDI OUT (3G) | OUTPUT | SDI | SDI | rear | -10.4395, 1.28, -6.6791 | -11.18362417706506, 0, -6.385366772211161 |
| cam3:sdi-out | กล้องไกล C SDI OUT (3G) | OUTPUT | SDI | SDI | rear | 0, 1.58, 5.998 | 0, 0, 6.798 |
| fiberTx:sdi-in | ตัวส่ง Optical ข้างกล้องไกล SDI IN · 75Ω | INPUT | SDI | SDI | rear | 1.17, 0.96, 5.609 | 1.17, 0, 4.809 |
| fiberTx:optical-out | ตัวส่ง Optical ข้างกล้องไกล OPTICAL OUT · สายชุดเข้าคู่ | OUTPUT | FIBER | FIBER_VIDEO | rear | 1.26, 0.96, 5.609 | 1.26, 0, 4.809 |
| fiberRx:optical-in | ตัวรับ Optical ข้างเต็นท์ OPTICAL IN · สายชุดเข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | 2.048, 0.96, 10.807 | 2.048, 0, 10.007 |
| fiberRx:sdi-out | ตัวรับ Optical ข้างเต็นท์ SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | 2.138, 0.96, 10.807 | 2.138, 0, 10.007 |
| sw:sdi-in-1 | เครื่องสลับภาพภาคสนาม SDI IN 1 | INPUT | SDI | SDI | rear | 4.703, 0.84, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-2 | เครื่องสลับภาพภาคสนาม SDI IN 2 | INPUT | SDI | SDI | rear | 4.793, 0.84, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-in-3 | เครื่องสลับภาพภาคสนาม SDI IN 3 | INPUT | SDI | SDI | rear | 4.883, 0.84, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-in-4 | เครื่องสลับภาพภาคสนาม SDI IN 4 | INPUT | SDI | SDI | rear | 4.973, 0.84, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-in-5 | เครื่องสลับภาพภาคสนาม SDI IN 5 | INPUT | SDI | SDI | rear | 5.063, 0.84, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-in-6 | เครื่องสลับภาพภาคสนาม SDI IN 6 | INPUT | SDI | SDI | rear | 5.153, 0.84, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:sdi-in-7 | เครื่องสลับภาพภาคสนาม SDI IN 7 | INPUT | SDI | SDI | rear | 4.703, 0.91, 10.274 | 4.703, 0, 9.473999999999998 |
| sw:sdi-in-8 | เครื่องสลับภาพภาคสนาม SDI IN 8 | INPUT | SDI | SDI | rear | 4.793, 0.91, 10.274 | 4.793, 0, 9.473999999999998 |
| sw:sdi-out-1 | เครื่องสลับภาพภาคสนาม SDI OUT 1 | OUTPUT | SDI | SDI | rear | 4.883, 0.91, 10.274 | 4.883, 0, 9.473999999999998 |
| sw:sdi-out-2 | เครื่องสลับภาพภาคสนาม SDI OUT 2 | OUTPUT | SDI | SDI | rear | 4.973, 0.91, 10.274 | 4.973, 0, 9.473999999999998 |
| sw:sdi-out-3 | เครื่องสลับภาพภาคสนาม SDI OUT 3 | OUTPUT | SDI | SDI | rear | 5.063, 0.91, 10.274 | 5.063, 0, 9.473999999999998 |
| sw:sdi-out-4 | เครื่องสลับภาพภาคสนาม SDI OUT 4 | OUTPUT | SDI | SDI | rear | 5.153, 0.91, 10.274 | 5.153, 0, 9.473999999999998 |
| sw:mv-out | เครื่องสลับภาพภาคสนาม MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | 4.838, 0.98, 10.274 | 4.838, 0, 9.473999999999998 |
| sw:xlr-l | เครื่องสลับภาพภาคสนาม AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 4.928, 0.98, 10.274 | 4.928, 0, 9.473999999999998 |
| sw:xlr-r | เครื่องสลับภาพภาคสนาม AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | 5.018, 0.98, 10.274 | 5.018, 0, 9.473999999999998 |
| monitor:sdi-in | จอรวมภาพภาคสนาม SDI IN | INPUT | SDI | SDI | rear | 6.21, 1.02, 10.417 | 5.41, 0, 9.616999999999999 |
| lav:out | ไมค์หนีบปกพิธีกร LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | 1.62, 1.03, -10.03 | 1.62, 0, -9.229999999999999 |
| tx:mic-in | ตัวส่งไมค์พิธีกร MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | 1.08, 1.05, -10.104 | 1.08, 0, -9.303999999999998 |
| rx:audio-out | ตัวรับไมค์พิธีกร AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 3.24, 0.78, 11.139 | 2.4400000000000004, 0, 10.338999999999999 |
| shotgun:xlr-out | ไมค์ช็อตกัน MIC XLR OUT | OUTPUT | XLR | MIC | rear | -3.51, 1.39, -8.193 | -3.51, 0, -8.993 |
| amb:xlr-out | ไมค์บรรยากาศ XLR OUT | OUTPUT | XLR | MIC | side | -9.745, 1.39, 0.54 | -10.545, 0, 0.54 |
| mix:in-1 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.488, 0.8413, 10.384 | 3.488, 0, 9.584 |
| mix:in-2 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.578, 0.8413, 10.384 | 3.578, 0, 9.584 |
| mix:in-3 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.668, 0.8413, 10.384 | 3.668, 0, 9.584 |
| mix:in-4 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.758, 0.8413, 10.384 | 3.758, 0, 9.584 |
| mix:in-5 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.848, 0.8413, 10.384 | 3.848, 0, 9.584 |
| mix:in-6 | มิกเซอร์ภาคสนาม PA / BROADCAST CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | 3.938, 0.8413, 10.384 | 3.938, 0, 9.584 |
| mix:pa-l | มิกเซอร์ภาคสนาม PA / BROADCAST PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.578, 0.9287, 10.384 | 3.578, 0, 9.584 |
| mix:pa-r | มิกเซอร์ภาคสนาม PA / BROADCAST PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.668, 0.9287, 10.384 | 3.668, 0, 9.584 |
| mix:bc-l | มิกเซอร์ภาคสนาม PA / BROADCAST BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.758, 0.9287, 10.384 | 3.758, 0, 9.584 |
| mix:bc-r | มิกเซอร์ภาคสนาม PA / BROADCAST BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | 3.848, 0.9287, 10.384 | 3.848, 0, 9.584 |
| pa:line-in | ลำโพง PA ภาคสนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | -7.83, 0.275, -7.716 | -7.83, 0, -8.516 |
| embed:sdi-in | อุปกรณ์ฝังเสียงรายการ SDI SDI IN | INPUT | SDI | SDI | rear | 6.345, 0.87, 9.119 | 6.345, 0, 8.318999999999999 |
| embed:sdi-out | อุปกรณ์ฝังเสียงรายการ SDI SDI OUT · EMBEDDED AUDIO | OUTPUT | SDI | SDI | rear | 6.435, 0.87, 9.119 | 6.435, 0, 8.318999999999999 |
| embed:audio-l | อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN L · BREAKOUT | INPUT | XLR | LINE_BAL | rear | 6.525, 0.87, 9.119 | 6.525, 0, 8.318999999999999 |
| embed:audio-r | อุปกรณ์ฝังเสียงรายการ SDI BALANCED AUDIO IN R · BREAKOUT | INPUT | XLR | LINE_BAL | rear | 6.615, 0.87, 9.119 | 6.615, 0, 8.318999999999999 |
| enc:sdi-in | ตัวเข้ารหัสส่งสตรีมจำลอง PROGRAM SDI IN | INPUT | SDI | SDI | rear | 7.65, 0.87, 9.119 | 7.65, 0, 8.318999999999999 |
| enc:eth | ตัวเข้ารหัสส่งสตรีมจำลอง NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | 7.74, 0.87, 9.119 | 7.74, 0, 8.318999999999999 |
| net:lan-1 | เกตเวย์เครือข่ายสายหลัก LAN 1 | INPUT | ETHERNET | ETHERNET | rear | 8.685, 0.8225, 9.219 | 8.685, 0, 8.418999999999999 |
| net:lan-2 | เกตเวย์เครือข่ายสายหลัก LAN 2 | INPUT | ETHERNET | ETHERNET | rear | 8.775, 0.8225, 9.219 | 8.775, 0, 8.418999999999999 |
| net:wan | เกตเวย์เครือข่ายสายหลัก WAN | OUTPUT | ETHERNET | WAN | rear | 8.865, 0.8225, 9.219 | 8.865, 0, 8.418999999999999 |
| wan:wan-in | จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | INPUT | ETHERNET | WAN | rear | 9.319, 0.45, 11.61 | 10.119000000000002, 0, 11.61 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-ramp | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-shelter | physical | ตรวจความพร้อม: ป้องกันสภาพอากาศ | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-power-signoff | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| safe | physical | ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย | true |
| mv | signal | จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง | true |
| input-1 | signal | ขาเข้าภาพ 1 มีภาพกล้องที่กำหนด | true |
| input-2 | signal | ขาเข้าภาพ 2 มีภาพกล้องที่กำหนด | true |
| input-3 | signal | ขาเข้าภาพ 3 มีภาพกล้องที่กำหนด | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| embed | signal | มีภาพรายการและเสียงครบเข้าสู่ตัวเข้ารหัส | true |
| ingest | delivery | ผู้ชมจำลองได้รับภาพและเสียงรายการ | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| recovered | delivery | วินิจฉัยและแก้ปัญหาที่เกิดในงาน | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## SP-01 / xl-1

Topology: `appendix-a-xl-1-v1`. Reference pointers: R03, R06, R09, R10, R11, R12, R13, R16, R17.

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

Work order: SP-01 · ต่อกล้อง 1 ผ่านชุด Optical เข้าฐาน CCU แล้ว Patch ผ่านเราเตอร์ไปเครื่องสลับภาพ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 1 หลักภาพกว้าง (แท่นสูง); (0, 0.3, 10.66) yaw 3.141592653589793 | Fixed | power=true; framing=Framed for assignment |
| ccu1 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| router | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์ภาพ SDI · โปรไฟล์ใช้งาน 8×8 | GENERIC TRAINING MODEL | ตู้เราเตอร์ภาพ; (-15.47, 0.8, -7.28) yaw -1.5707963267948966 | Fixed | power=true; xp-1=IN 1 |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | แถว 1: Production Switcher; (-9.1, 0.76, -6.695) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; sdi-out-2=PROGRAM; sdi-out-3=PROGRAM; sdi-out-4=AUX; aux=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จอรวมภาพ — เว้นทางบริการจากผนังหน้า; (-9.1, 1, -7.735) yaw 0 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:optical-out / กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu1:optical-in / ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 35 | FIB-CAMERA-CCU |
| lead-2 | ccu1:sdi-out / ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | router:in-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-3 | router:out-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | sw:sdi-in-1 / เครื่องสลับภาพรายการ SDI IN 1 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-4 | sw:mv-out / เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพ SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:optical-out | กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 0, 1.58, 10.467 | 1.285879139104721e-16, 0, 9.417 |
| ccu1:optical-in | ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu1:sdi-out | ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.29, -8.275 | -14.473999999999998, 0, -8.275 |
| router:in-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.415 | -14.473999999999998, 0, -7.415 |
| router:out-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.325 | -14.473999999999998, 0, -7.325 |
| router:in-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.235 | -14.473999999999998, 0, -7.235 |
| router:out-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.145 | -14.473999999999998, 0, -7.145 |
| sw:sdi-in-1 | เครื่องสลับภาพรายการ SDI IN 1 | INPUT | SDI | SDI | rear | -9.325, 0.84, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-2 | เครื่องสลับภาพรายการ SDI IN 2 | INPUT | SDI | SDI | rear | -9.235, 0.84, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-in-3 | เครื่องสลับภาพรายการ SDI IN 3 | INPUT | SDI | SDI | rear | -9.145, 0.84, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-in-4 | เครื่องสลับภาพรายการ SDI IN 4 | INPUT | SDI | SDI | rear | -9.055, 0.84, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-in-5 | เครื่องสลับภาพรายการ SDI IN 5 | INPUT | SDI | SDI | rear | -8.965, 0.84, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-in-6 | เครื่องสลับภาพรายการ SDI IN 6 | INPUT | SDI | SDI | rear | -8.875, 0.84, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:sdi-in-7 | เครื่องสลับภาพรายการ SDI IN 7 | INPUT | SDI | SDI | rear | -9.325, 0.91, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-8 | เครื่องสลับภาพรายการ SDI IN 8 | INPUT | SDI | SDI | rear | -9.235, 0.91, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-out-1 | เครื่องสลับภาพรายการ SDI OUT 1 | OUTPUT | SDI | SDI | rear | -9.145, 0.91, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-out-2 | เครื่องสลับภาพรายการ SDI OUT 2 | OUTPUT | SDI | SDI | rear | -9.055, 0.91, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-out-3 | เครื่องสลับภาพรายการ SDI OUT 3 | OUTPUT | SDI | SDI | rear | -8.965, 0.91, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-out-4 | เครื่องสลับภาพรายการ SDI OUT 4 | OUTPUT | SDI | SDI | rear | -8.875, 0.91, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:mv-out | เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | -9.19, 0.98, -6.951 | -9.99, 0, -7.7509999999999994 |
| sw:xlr-l | เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.1, 0.98, -6.951 | -9.1, 0, -8.251 |
| sw:xlr-r | เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.01, 0.98, -6.951 | -8.209999999999999, 0, -7.7509999999999994 |
| monitor:sdi-in | จอรวมภาพ SDI IN | INPUT | SDI | SDI | rear | -9.1, 1.26, -7.781 | -9.1, 0, -8.581 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| cam-1 | signal | ภาพกล้อง 1 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| mv | signal | จอรวมภาพเห็นกล้องสนาม 1 | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## SP-02 / xl-2

Topology: `appendix-a-xl-2-v1`. Reference pointers: R03, R06, R09, R10, R11, R12, R13, R16, R17.

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

Work order: SP-02 · ติดตั้งไมค์หกแหล่งผ่านมัลติคอร์ และแยกเสียง PA กับเสียงรายการ

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| mic1 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 1; (7.15, 0.76, -2.275) yaw 0 | Fixed |  |
| mic2 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 2; (8.97, 0.76, -2.275) yaw 0 | Fixed |  |
| crowdL | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมซ้าย; (-15.34, 0, 15.08) yaw 1.5707963267948966 | Fixed | windscreen=true |
| crowdR | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมขวา; (16.9, 0, 11.7) yaw -1.5707963267948966 | Fixed | windscreen=true |
| field | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Field mic ข้างสนาม; (3.9, 0, 16.9) yaw 3.141592653589793 | Fixed |  |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ZONE C ห้องควบคุม: Multiview Wall, แถวโต๊ะ Switcher / Replay / Graphics, Audio console, ตู้ Rack; (-2.6, 0, 16.77) yaw 3.141592653589793 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จุดพิธีกรข้างสนาม; (-3.12, 0, 16.77) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวรับเสียงข้างกล่องรับเวที; (10.66, 0.85, -0.65) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | จุดรับเสียงผู้บรรยายและสนาม; (10.66, 0, 0.13) yaw 0 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | ข้างคอนโซลเสียง; (-4.16, 0.76, -5.2) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | จุดเสียง: เครื่องผสมเสียงดิจิทัล; (-3.38, 0.76, -5.395) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; ch4-gain=Nominal (peaks −18 dBFS); ch4-on=true; ch4-pa=true; ch4-bc=true; ch5-gain=Nominal (peaks −18 dBFS); ch5-on=true; ch5-pa=true; ch5-bc=true; ch6-gain=Nominal (peaks −18 dBFS); ch6-on=true; ch6-pa=true; ch6-bc=true; pa-fader=Unity; bc-fader=Unity |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | ระบบ PA ฝั่งผู้ชม; (10.4, 0, 6.89) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | แถว 1: Production Switcher; (-9.1, 0.76, -6.695) yaw 0 | Fixed | power=true; xlr-on=true; emb-audio=OFF |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | mic1:xlr-out / ไมค์ผู้บรรยาย 1 SM58 XLR OUT | stagebox:mic-in-1 / กล่องรับไมค์สนาม MIC IN 1 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-2 | mic2:xlr-out / ไมค์ผู้บรรยาย 2 SM58 XLR OUT | stagebox:mic-in-2 / กล่องรับไมค์สนาม MIC IN 2 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-3 | crowdL:xlr-out / ไมค์บรรยากาศซ้าย XLR OUT | stagebox:mic-in-3 / กล่องรับไมค์สนาม MIC IN 3 | XLR-F | XLR-M | MIC | 65 | AUD-XLR-MIC |
| lead-4 | crowdR:xlr-out / ไมค์บรรยากาศขวา XLR OUT | stagebox:mic-in-4 / กล่องรับไมค์สนาม MIC IN 4 | XLR-F | XLR-M | MIC | 25 | AUD-XLR-MIC |
| lead-5 | field:xlr-out / ไมค์ภาคสนาม XLR OUT | stagebox:mic-in-5 / กล่องรับไมค์สนาม MIC IN 5 | XLR-F | XLR-M | MIC | 45 | AUD-XLR-MIC |
| lead-6 | lav:out / ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์สนาม MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 2 | AUD-LAV-TX |
| lead-7 | rx:audio-out / ตัวรับไมค์สนาม AUDIO OUT (XLR) | stagebox:mic-in-6 / กล่องรับไมค์สนาม MIC IN 6 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-8 | stagebox:multicore / กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 25 | STG-MULTICORE |
| lead-9 | tail:tail-1 / หางสายเสียงที่คอนโซล TAIL 1 | mix:in-1 / คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-10 | tail:tail-2 / หางสายเสียงที่คอนโซล TAIL 2 | mix:in-2 / คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-11 | tail:tail-3 / หางสายเสียงที่คอนโซล TAIL 3 | mix:in-3 / คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-12 | tail:tail-4 / หางสายเสียงที่คอนโซล TAIL 4 | mix:in-4 / คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-13 | tail:tail-5 / หางสายเสียงที่คอนโซล TAIL 5 | mix:in-5 / คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-14 | tail:tail-6 / หางสายเสียงที่คอนโซล TAIL 6 | mix:in-6 / คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-15 | mix:pa-l / คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | pa:line-in / ระบบ PA สนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 30 | AUD-PA-ACTIVE |
| lead-16 | mix:bc-l / คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |
| lead-17 | mix:bc-r / คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| mic1:xlr-out | ไมค์ผู้บรรยาย 1 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 7.15, 0.79, -2.18 | 7.15, 0, -1.3800000000000001 |
| mic2:xlr-out | ไมค์ผู้บรรยาย 2 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 8.97, 0.79, -2.18 | 8.97, 0, -1.3800000000000001 |
| crowdL:xlr-out | ไมค์บรรยากาศซ้าย XLR OUT | OUTPUT | XLR | MIC | side | -15.365, 1.39, 15.08 | -16.165, 0, 15.08 |
| crowdR:xlr-out | ไมค์บรรยากาศขวา XLR OUT | OUTPUT | XLR | MIC | side | 16.925, 1.39, 11.7 | 17.725, 0, 11.7 |
| field:xlr-out | ไมค์ภาคสนาม XLR OUT | OUTPUT | XLR | MIC | rear | 3.9, 1.39, 16.925 | 3.9, 0, 17.725 |
| lav:out | ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -2.6, 1.39, 16.795 | -2.6, 0, 17.595000000000002 |
| tx:mic-in | ตัวส่งไมค์สนาม MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -3.12, 0.05, 16.791 | -3.12, 0, 17.591 |
| rx:audio-out | ตัวรับไมค์สนาม AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 10.66, 0.87, -0.716 | 10.66, 0, -1.516 |
| stagebox:mic-in-1 | กล่องรับไมค์สนาม MIC IN 1 | INPUT | XLR | MIC | rear | 10.4475, 0.0715, -0.066 | 9.647499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-2 | กล่องรับไมค์สนาม MIC IN 2 | INPUT | XLR | MIC | rear | 10.5325, 0.0715, -0.066 | 9.7325, 0, -0.8660000000000001 |
| stagebox:mic-in-3 | กล่องรับไมค์สนาม MIC IN 3 | INPUT | XLR | MIC | rear | 10.6175, 0.0715, -0.066 | 9.817499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-4 | กล่องรับไมค์สนาม MIC IN 4 | INPUT | XLR | MIC | rear | 10.7025, 0.0715, -0.066 | 9.9025, 0, -0.8660000000000001 |
| stagebox:mic-in-5 | กล่องรับไมค์สนาม MIC IN 5 | INPUT | XLR | MIC | rear | 10.7875, 0.0715, -0.066 | 9.987499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-6 | กล่องรับไมค์สนาม MIC IN 6 | INPUT | XLR | MIC | rear | 10.8725, 0.0715, -0.066 | 11.672500000000001, 0, -0.8660000000000001 |
| stagebox:multicore | กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 10.66, 0.1485, -0.066 | 9.86, 0, -0.8660000000000001 |
| tail:multicore | หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -4.3725, 0.8315, -5.396 | -4.3725, 0, -6.196 |
| tail:tail-1 | หางสายเสียงที่คอนโซล TAIL 1 | OUTPUT | XLR | MIC | rear | -4.2875, 0.8315, -5.396 | -4.2875, 0, -6.196 |
| tail:tail-2 | หางสายเสียงที่คอนโซล TAIL 2 | OUTPUT | XLR | MIC | rear | -4.2025, 0.8315, -5.396 | -4.2025, 0, -6.196 |
| tail:tail-3 | หางสายเสียงที่คอนโซล TAIL 3 | OUTPUT | XLR | MIC | rear | -4.1175, 0.8315, -5.396 | -4.1175, 0, -6.196 |
| tail:tail-4 | หางสายเสียงที่คอนโซล TAIL 4 | OUTPUT | XLR | MIC | rear | -4.0325, 0.8315, -5.396 | -4.0325, 0, -6.196 |
| tail:tail-5 | หางสายเสียงที่คอนโซล TAIL 5 | OUTPUT | XLR | MIC | rear | -3.9475, 0.8315, -5.396 | -3.9475, 0, -6.196 |
| tail:tail-6 | หางสายเสียงที่คอนโซล TAIL 6 | OUTPUT | XLR | MIC | rear | -4.16, 0.9085, -5.396 | -4.16, 0, -6.196 |
| mix:in-1 | คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.605, 0.8413, -5.676 | -3.605, 0, -6.476 |
| mix:in-2 | คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.515, 0.8413, -5.676 | -3.515, 0, -6.476 |
| mix:in-3 | คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.425, 0.8413, -5.676 | -3.425, 0, -6.476 |
| mix:in-4 | คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.335, 0.8413, -5.676 | -3.335, 0, -6.476 |
| mix:in-5 | คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.245, 0.8413, -5.676 | -3.245, 0, -6.476 |
| mix:in-6 | คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.155, 0.8413, -5.676 | -3.155, 0, -6.476 |
| mix:pa-l | คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.515, 0.9287, -5.676 | -3.515, 0, -6.476 |
| mix:pa-r | คอนโซลเสียงถ่ายทอดและ PA PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.425, 0.9287, -5.676 | -3.425, 0, -6.476 |
| mix:bc-l | คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.335, 0.9287, -5.676 | -3.335, 0, -6.476 |
| mix:bc-r | คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.245, 0.9287, -5.676 | -3.245, 0, -6.476 |
| pa:line-in | ระบบ PA สนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | 10.4, 0.275, 6.734 | 10.4, 0, 5.934 |
| sw:sdi-in-1 | เครื่องสลับภาพรายการ SDI IN 1 | INPUT | SDI | SDI | rear | -9.325, 0.84, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-2 | เครื่องสลับภาพรายการ SDI IN 2 | INPUT | SDI | SDI | rear | -9.235, 0.84, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-in-3 | เครื่องสลับภาพรายการ SDI IN 3 | INPUT | SDI | SDI | rear | -9.145, 0.84, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-in-4 | เครื่องสลับภาพรายการ SDI IN 4 | INPUT | SDI | SDI | rear | -9.055, 0.84, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-in-5 | เครื่องสลับภาพรายการ SDI IN 5 | INPUT | SDI | SDI | rear | -8.965, 0.84, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-in-6 | เครื่องสลับภาพรายการ SDI IN 6 | INPUT | SDI | SDI | rear | -8.875, 0.84, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:sdi-in-7 | เครื่องสลับภาพรายการ SDI IN 7 | INPUT | SDI | SDI | rear | -9.325, 0.91, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-8 | เครื่องสลับภาพรายการ SDI IN 8 | INPUT | SDI | SDI | rear | -9.235, 0.91, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-out-1 | เครื่องสลับภาพรายการ SDI OUT 1 | OUTPUT | SDI | SDI | rear | -9.145, 0.91, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-out-2 | เครื่องสลับภาพรายการ SDI OUT 2 | OUTPUT | SDI | SDI | rear | -9.055, 0.91, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-out-3 | เครื่องสลับภาพรายการ SDI OUT 3 | OUTPUT | SDI | SDI | rear | -8.965, 0.91, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-out-4 | เครื่องสลับภาพรายการ SDI OUT 4 | OUTPUT | SDI | SDI | rear | -8.875, 0.91, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:mv-out | เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | -9.19, 0.98, -6.951 | -9.99, 0, -7.7509999999999994 |
| sw:xlr-l | เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.1, 0.98, -6.951 | -9.1, 0, -8.251 |
| sw:xlr-r | เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.01, 0.98, -6.951 | -8.209999999999999, 0, -7.7509999999999994 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| audio-sw | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## SP-03 / xl-3

Topology: `appendix-a-xl-3-v1`. Reference pointers: R03, R06, R09, R10, R11, R12, R13, R16, R17.

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

Work order: SP-03 · Patch แหล่งภาพแปดแหล่งผ่านเราเตอร์ แล้วควบคุม Preview / Program / Multiview

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 1 หลักภาพกว้าง (แท่นสูง); (0, 0.3, 10.66) yaw 3.141592653589793 | Fixed | power=true; framing=Framed for assignment |
| ccu1 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 2 ข้างสนามซ้าย; (-12.35, 0, 16.38) yaw -2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu2 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 3 ข้างสนามขวา; (12.35, 0, 16.38) yaw 2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu3 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.6799999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam4 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 4 ท้ายสนาม; (16.599999999999998, 0, 7.02) yaw 2.727765280599181 | Fixed | power=true; framing=Framed for assignment |
| ccu4 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.9299999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam5 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 5 เลนส์ระยะไกล; (-6.5, 0, 15.34) yaw -2.8008169108201733 | Fixed | power=true; framing=Framed for assignment |
| ccu5 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam6 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 6 เคลื่อนที่ในสนาม; (6.5, 0, 16.51) yaw 2.7200446968636376 | Fixed | power=true; framing=Framed for assignment |
| ccu6 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| router | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์ภาพ SDI · โปรไฟล์ใช้งาน 8×8 | GENERIC TRAINING MODEL | ตู้เราเตอร์ภาพ; (-15.47, 0.8, -7.28) yaw -1.5707963267948966 | Fixed | power=true; xp-1=IN 1; xp-2=IN 2; xp-3=IN 3; xp-4=IN 4; xp-5=IN 5; xp-6=IN 6; xp-7=IN 7; xp-8=IN 8 |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | แถว 1: Production Switcher; (-9.1, 0.76, -6.695) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; sdi-out-2=PROGRAM; sdi-out-3=PROGRAM; sdi-out-4=AUX; aux=PROGRAM; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จอรวมภาพ — เว้นทางบริการจากผนังหน้า; (-9.1, 1, -7.735) yaw 0 | Fixed | power=true |
| play | อุปกรณ์จำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | GENERIC TRAINING MODEL | แถว 2: Replay; (-9.88, 0.76, -3.965) yaw 0 | Fixed | power=true; clip=true; play=true |
| controller | อุปกรณ์จำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | GENERIC TRAINING MODEL | โต๊ะควบคุมภาพซ้ำ; (-8.45, 0.76, -3.9) yaw 0 | Fixed | power=true; cue=true |
| gfx | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | GENERIC TRAINING MODEL | แถว 3: Graphics Workstation; (-8.32, 0.76, -1.235) yaw 0 | Fixed | power=true; template=Scoreboard template (licensed); score=0–0 |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะกราฟิก — ตัวแปลง HDMI→SDI; (-7.28, 0.76, -1.235) yaw 0 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:optical-out / กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu1:optical-in / ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 35 | FIB-CAMERA-CCU |
| lead-2 | ccu1:sdi-out / ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | router:in-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-3 | router:out-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | sw:sdi-in-1 / เครื่องสลับภาพรายการ SDI IN 1 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-4 | cam2:optical-out / กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu2:optical-in / ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-5 | ccu2:sdi-out / ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | router:in-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | router:out-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | sw:sdi-in-2 / เครื่องสลับภาพรายการ SDI IN 2 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-7 | cam3:optical-out / กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu3:optical-in / ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 55 | FIB-CAMERA-CCU |
| lead-8 | ccu3:sdi-out / ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | router:in-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-9 | router:out-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | sw:sdi-in-3 / เครื่องสลับภาพรายการ SDI IN 3 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-10 | cam4:optical-out / กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu4:optical-in / ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-11 | ccu4:sdi-out / ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | router:in-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-12 | router:out-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | sw:sdi-in-4 / เครื่องสลับภาพรายการ SDI IN 4 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-13 | cam5:optical-out / กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu5:optical-in / ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 45 | FIB-CAMERA-CCU |
| lead-14 | ccu5:sdi-out / ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | router:in-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-15 | router:out-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | sw:sdi-in-5 / เครื่องสลับภาพรายการ SDI IN 5 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-16 | cam6:optical-out / กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu6:optical-in / ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-17 | ccu6:sdi-out / ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | router:in-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-18 | router:out-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | sw:sdi-in-6 / เครื่องสลับภาพรายการ SDI IN 6 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-19 | controller:control-out / แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | play:control-in / เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | CONTROL | CONTROL | CONTROL | 10 | CTRL-REPLAY |
| lead-20 | play:sdi-out / เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | router:in-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-21 | gfx:hdmi-out / คอมพิวเตอร์กราฟิก HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-22 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | router:in-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-23 | router:out-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | sw:sdi-in-7 / เครื่องสลับภาพรายการ SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-24 | router:out-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | sw:sdi-in-8 / เครื่องสลับภาพรายการ SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-25 | sw:mv-out / เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพ SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:optical-out | กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 0, 1.58, 10.467 | 1.285879139104721e-16, 0, 9.417 |
| ccu1:optical-in | ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu1:sdi-out | ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam2:optical-out | กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -12.4132, 1.28, 16.1976 | -12.675267407451674, 0, 15.441742424823595 |
| ccu2:optical-in | ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu2:sdi-out | ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.54, -8.275 | -14.473999999999998, 0, -8.275 |
| cam3:optical-out | กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 12.4132, 1.28, 16.1976 | 12.675267407451674, 0, 15.441742424823595 |
| ccu3:optical-in | ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.79, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu3:sdi-out | ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.79, -8.275 | -14.473999999999998, 0, -8.275 |
| cam4:optical-out | กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 16.6776, 1.28, 6.8433 | 16.999293250650766, 0, 6.110829213902873 |
| ccu4:optical-in | ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.04, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu4:sdi-out | ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.04, -8.275 | -14.473999999999998, 0, -8.275 |
| cam5:optical-out | กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -6.5645, 1.28, 15.1581 | -6.831874661472298, 0, 14.404103454648116 |
| ccu5:optical-in | ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu5:sdi-out | ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam6:optical-out | กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 6.579, 1.28, 16.3339 | 6.906338708904198, 0, 15.603934679143638 |
| ccu6:optical-in | ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu6:sdi-out | ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.54, -8.275 | -14.473999999999998, 0, -8.275 |
| router:in-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.415 | -14.473999999999998, 0, -7.415 |
| router:out-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.325 | -14.473999999999998, 0, -7.325 |
| router:in-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.235 | -14.473999999999998, 0, -7.235 |
| router:out-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.145 | -14.473999999999998, 0, -7.145 |
| sw:sdi-in-1 | เครื่องสลับภาพรายการ SDI IN 1 | INPUT | SDI | SDI | rear | -9.325, 0.84, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-2 | เครื่องสลับภาพรายการ SDI IN 2 | INPUT | SDI | SDI | rear | -9.235, 0.84, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-in-3 | เครื่องสลับภาพรายการ SDI IN 3 | INPUT | SDI | SDI | rear | -9.145, 0.84, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-in-4 | เครื่องสลับภาพรายการ SDI IN 4 | INPUT | SDI | SDI | rear | -9.055, 0.84, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-in-5 | เครื่องสลับภาพรายการ SDI IN 5 | INPUT | SDI | SDI | rear | -8.965, 0.84, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-in-6 | เครื่องสลับภาพรายการ SDI IN 6 | INPUT | SDI | SDI | rear | -8.875, 0.84, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:sdi-in-7 | เครื่องสลับภาพรายการ SDI IN 7 | INPUT | SDI | SDI | rear | -9.325, 0.91, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-8 | เครื่องสลับภาพรายการ SDI IN 8 | INPUT | SDI | SDI | rear | -9.235, 0.91, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-out-1 | เครื่องสลับภาพรายการ SDI OUT 1 | OUTPUT | SDI | SDI | rear | -9.145, 0.91, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-out-2 | เครื่องสลับภาพรายการ SDI OUT 2 | OUTPUT | SDI | SDI | rear | -9.055, 0.91, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-out-3 | เครื่องสลับภาพรายการ SDI OUT 3 | OUTPUT | SDI | SDI | rear | -8.965, 0.91, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-out-4 | เครื่องสลับภาพรายการ SDI OUT 4 | OUTPUT | SDI | SDI | rear | -8.875, 0.91, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:mv-out | เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | -9.19, 0.98, -6.951 | -9.99, 0, -7.7509999999999994 |
| sw:xlr-l | เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.1, 0.98, -6.951 | -9.1, 0, -8.251 |
| sw:xlr-r | เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.01, 0.98, -6.951 | -8.209999999999999, 0, -7.7509999999999994 |
| monitor:sdi-in | จอรวมภาพ SDI IN | INPUT | SDI | SDI | rear | -9.1, 1.26, -7.781 | -9.1, 0, -8.581 |
| play:sdi-out | เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | OUTPUT | SDI | SDI | rear | -9.925, 0.87, -4.161 | -9.925, 0, -4.960999999999999 |
| play:control-in | เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | INPUT | CONTROL | CONTROL | rear | -9.835, 0.87, -4.161 | -9.835, 0, -4.960999999999999 |
| controller:control-out | แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | OUTPUT | CONTROL | CONTROL | rear | -8.45, 0.87, -4.096 | -8.45, 0, -4.896 |
| gfx:hdmi-out | คอมพิวเตอร์กราฟิก HDMI OUT | OUTPUT | HDMI | HDMI | rear | -8.566, 0.773, -1.235 | -9.366000000000001, 0, -2.035 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -7.37, 0.8225, -1.281 | -7.37, 0, -2.081 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -7.28, 0.8225, -1.281 | -7.28, 0, -2.081 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -7.19, 0.8225, -1.281 | -7.19, 0, -2.081 |

Wireless (no physical cable): None authored. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| cam-1 | signal | ภาพกล้อง 1 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-2 | signal | ภาพกล้อง 2 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-3 | signal | ภาพกล้อง 3 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-4 | signal | ภาพกล้อง 4 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-5 | signal | ภาพกล้อง 5 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-6 | signal | ภาพกล้อง 6 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| replay | signal | ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7 | true |
| gfx | signal | กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8 | true |
| mv | signal | จอรวมภาพเห็นทั้งหกกล้อง | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## SP-04 / xl-4

Topology: `appendix-a-xl-4-v1`. Reference pointers: R03, R06, R09, R10, R11, R12, R13, R16, R17.

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

Work order: SP-04 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 1 หลักภาพกว้าง (แท่นสูง); (0, 0.3, 10.66) yaw 3.141592653589793 | Fixed | power=true; framing=Framed for assignment |
| ccu1 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 2 ข้างสนามซ้าย; (-12.35, 0, 16.38) yaw -2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu2 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 3 ข้างสนามขวา; (12.35, 0, 16.38) yaw 2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu3 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.6799999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam4 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 4 ท้ายสนาม; (16.599999999999998, 0, 7.02) yaw 2.727765280599181 | Fixed | power=true; framing=Framed for assignment |
| ccu4 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.9299999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam5 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 5 เลนส์ระยะไกล; (-6.5, 0, 15.34) yaw -2.8008169108201733 | Fixed | power=true; framing=Framed for assignment |
| ccu5 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam6 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 6 เคลื่อนที่ในสนาม; (6.5, 0, 16.51) yaw 2.7200446968636376 | Fixed | power=true; framing=Framed for assignment |
| ccu6 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| router | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์ภาพ SDI · โปรไฟล์ใช้งาน 8×8 | GENERIC TRAINING MODEL | ตู้เราเตอร์ภาพ; (-15.47, 0.8, -7.28) yaw -1.5707963267948966 | Fixed | power=true; xp-1=IN 1; xp-2=IN 2; xp-3=IN 3; xp-4=IN 4; xp-5=IN 5; xp-6=IN 6; xp-7=IN 7; xp-8=IN 8 |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | แถว 1: Production Switcher; (-9.1, 0.76, -6.695) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; sdi-out-2=PROGRAM; sdi-out-3=PROGRAM; sdi-out-4=AUX; aux=PROGRAM; emb-audio=OFF; xlr-on=true; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จอรวมภาพ — เว้นทางบริการจากผนังหน้า; (-9.1, 1, -7.735) yaw 0 | Fixed | power=true |
| mic1 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 1; (7.15, 0.76, -2.275) yaw 0 | Fixed |  |
| mic2 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 2; (8.97, 0.76, -2.275) yaw 0 | Fixed |  |
| crowdL | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมซ้าย; (-15.34, 0, 15.08) yaw 1.5707963267948966 | Fixed | windscreen=true |
| crowdR | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมขวา; (16.9, 0, 11.7) yaw -1.5707963267948966 | Fixed | windscreen=true |
| field | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Field mic ข้างสนาม; (3.9, 0, 16.9) yaw 3.141592653589793 | Fixed |  |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ZONE C ห้องควบคุม: Multiview Wall, แถวโต๊ะ Switcher / Replay / Graphics, Audio console, ตู้ Rack; (-2.6, 0, 16.77) yaw 3.141592653589793 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จุดพิธีกรข้างสนาม; (-3.12, 0, 16.77) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวรับเสียงข้างกล่องรับเวที; (10.66, 0.85, -0.65) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | จุดรับเสียงผู้บรรยายและสนาม; (10.66, 0, 0.13) yaw 0 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | ข้างคอนโซลเสียง; (-4.16, 0.76, -5.2) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | จุดเสียง: เครื่องผสมเสียงดิจิทัล; (-3.38, 0.76, -5.395) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; ch4-gain=Nominal (peaks −18 dBFS); ch4-on=true; ch4-pa=true; ch4-bc=true; ch5-gain=Nominal (peaks −18 dBFS); ch5-on=true; ch5-pa=true; ch5-bc=true; ch6-gain=Nominal (peaks −18 dBFS); ch6-on=true; ch6-pa=true; ch6-bc=true; pa-fader=Unity; bc-fader=Unity |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | ระบบ PA ฝั่งผู้ชม; (10.4, 0, 6.89) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| play | อุปกรณ์จำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | GENERIC TRAINING MODEL | แถว 2: Replay; (-9.88, 0.76, -3.965) yaw 0 | Fixed | power=true; clip=true; play=true |
| controller | อุปกรณ์จำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | GENERIC TRAINING MODEL | โต๊ะควบคุมภาพซ้ำ; (-8.45, 0.76, -3.9) yaw 0 | Fixed | power=true; cue=true |
| gfx | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | GENERIC TRAINING MODEL | แถว 3: Graphics Workstation; (-8.32, 0.76, -1.235) yaw 0 | Fixed | power=true; template=Scoreboard template (licensed); score=0–0 |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะกราฟิก — ตัวแปลง HDMI→SDI; (-7.28, 0.76, -1.235) yaw 0 | Fixed | power=true |
| enc | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | ตู้ตัวเข้ารหัส; (-15.47, 0, -4.94) yaw 4.71238898038469 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| enc2 | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | ตู้ส่งสำรอง; (-15.47, 0, 0.65) yaw -1.5707963267948966 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| net | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | ตู้บริการ WAN — เกตเวย์; (-15.47, 0, -3.9) yaw 4.71238898038469 | Fixed | power=true |
| net2 | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | ตู้เครือข่ายสำรอง; (-15.47, 0, 1.56) yaw -1.5707963267948966 | Fixed | power=true |
| wan | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | ตู้บริการ WAN — ทางออกจำลอง; (-15.47, 0, -2.86) yaw 4.71238898038469 | Fixed |  |
| wan2 | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | จุดรับสำรองจำลอง; (-15.47, 0, 2.405) yaw -1.5707963267948966 | Fixed |  |
| rec | อุปกรณ์จำลองเพื่อฝึก · เครื่องบันทึก PROGRAM พร้อมสื่อภายใน (จำลอง) | GENERIC TRAINING MODEL | ตู้บันทึก — HyperDeck ภาพออกอากาศ; (-15.47, 0, -0.26) yaw 4.71238898038469 | Fixed | power=true; media=SD card mounted (512 GB free); record=true |
| display | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Stadium display processor; (17.16, 0, 14.3) yaw 1.5707963267948966 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:optical-out / กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu1:optical-in / ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 35 | FIB-CAMERA-CCU |
| lead-2 | ccu1:sdi-out / ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | router:in-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-3 | router:out-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | sw:sdi-in-1 / เครื่องสลับภาพรายการ SDI IN 1 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-4 | cam2:optical-out / กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu2:optical-in / ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-5 | ccu2:sdi-out / ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | router:in-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | router:out-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | sw:sdi-in-2 / เครื่องสลับภาพรายการ SDI IN 2 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-7 | cam3:optical-out / กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu3:optical-in / ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 55 | FIB-CAMERA-CCU |
| lead-8 | ccu3:sdi-out / ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | router:in-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-9 | router:out-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | sw:sdi-in-3 / เครื่องสลับภาพรายการ SDI IN 3 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-10 | cam4:optical-out / กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu4:optical-in / ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-11 | ccu4:sdi-out / ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | router:in-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-12 | router:out-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | sw:sdi-in-4 / เครื่องสลับภาพรายการ SDI IN 4 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-13 | cam5:optical-out / กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu5:optical-in / ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 45 | FIB-CAMERA-CCU |
| lead-14 | ccu5:sdi-out / ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | router:in-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-15 | router:out-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | sw:sdi-in-5 / เครื่องสลับภาพรายการ SDI IN 5 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-16 | cam6:optical-out / กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu6:optical-in / ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-17 | ccu6:sdi-out / ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | router:in-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-18 | router:out-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | sw:sdi-in-6 / เครื่องสลับภาพรายการ SDI IN 6 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-19 | controller:control-out / แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | play:control-in / เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | CONTROL | CONTROL | CONTROL | 10 | CTRL-REPLAY |
| lead-20 | play:sdi-out / เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | router:in-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-21 | gfx:hdmi-out / คอมพิวเตอร์กราฟิก HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-22 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | router:in-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-23 | router:out-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | sw:sdi-in-7 / เครื่องสลับภาพรายการ SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-24 | router:out-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | sw:sdi-in-8 / เครื่องสลับภาพรายการ SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-25 | sw:mv-out / เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพ SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-26 | mic1:xlr-out / ไมค์ผู้บรรยาย 1 SM58 XLR OUT | stagebox:mic-in-1 / กล่องรับไมค์สนาม MIC IN 1 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-27 | mic2:xlr-out / ไมค์ผู้บรรยาย 2 SM58 XLR OUT | stagebox:mic-in-2 / กล่องรับไมค์สนาม MIC IN 2 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-28 | crowdL:xlr-out / ไมค์บรรยากาศซ้าย XLR OUT | stagebox:mic-in-3 / กล่องรับไมค์สนาม MIC IN 3 | XLR-F | XLR-M | MIC | 65 | AUD-XLR-MIC |
| lead-29 | crowdR:xlr-out / ไมค์บรรยากาศขวา XLR OUT | stagebox:mic-in-4 / กล่องรับไมค์สนาม MIC IN 4 | XLR-F | XLR-M | MIC | 25 | AUD-XLR-MIC |
| lead-30 | field:xlr-out / ไมค์ภาคสนาม XLR OUT | stagebox:mic-in-5 / กล่องรับไมค์สนาม MIC IN 5 | XLR-F | XLR-M | MIC | 45 | AUD-XLR-MIC |
| lead-31 | lav:out / ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์สนาม MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 2 | AUD-LAV-TX |
| lead-32 | rx:audio-out / ตัวรับไมค์สนาม AUDIO OUT (XLR) | stagebox:mic-in-6 / กล่องรับไมค์สนาม MIC IN 6 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-33 | stagebox:multicore / กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 25 | STG-MULTICORE |
| lead-34 | tail:tail-1 / หางสายเสียงที่คอนโซล TAIL 1 | mix:in-1 / คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-35 | tail:tail-2 / หางสายเสียงที่คอนโซล TAIL 2 | mix:in-2 / คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-36 | tail:tail-3 / หางสายเสียงที่คอนโซล TAIL 3 | mix:in-3 / คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-37 | tail:tail-4 / หางสายเสียงที่คอนโซล TAIL 4 | mix:in-4 / คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-38 | tail:tail-5 / หางสายเสียงที่คอนโซล TAIL 5 | mix:in-5 / คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-39 | tail:tail-6 / หางสายเสียงที่คอนโซล TAIL 6 | mix:in-6 / คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-40 | mix:pa-l / คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | pa:line-in / ระบบ PA สนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 30 | AUD-PA-ACTIVE |
| lead-41 | mix:bc-l / คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |
| lead-42 | mix:bc-r / คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |
| lead-43 | sw:sdi-out-1 / เครื่องสลับภาพรายการ SDI OUT 1 | enc:sdi-in / ตัวเข้ารหัสหลัก PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-44 | sw:sdi-out-2 / เครื่องสลับภาพรายการ SDI OUT 2 | enc2:sdi-in / ตัวเข้ารหัสสำรอง PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-45 | sw:sdi-out-3 / เครื่องสลับภาพรายการ SDI OUT 3 | rec:sdi-in / เครื่องบันทึกรายการ PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-46 | sw:sdi-out-4 / เครื่องสลับภาพรายการ SDI OUT 4 | display:sdi-in / ตัวรับภาพจอสนาม SDI IN | SDI | SDI | SDI | 50 | VID-SDI-3G |
| lead-47 | enc:eth / ตัวเข้ารหัสหลัก NETWORK · Ethernet | net:lan-1 / เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-48 | net:wan / เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | wan:wan-in / จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |
| lead-49 | enc2:eth / ตัวเข้ารหัสสำรอง NETWORK · Ethernet | net2:lan-1 / เครือข่ายสำรอง LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-50 | net2:wan / เครือข่ายสำรอง WAN | wan2:wan-in / จุดรับสตรีมสำรอง UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:optical-out | กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 0, 1.58, 10.467 | 1.285879139104721e-16, 0, 9.417 |
| ccu1:optical-in | ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu1:sdi-out | ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam2:optical-out | กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -12.4132, 1.28, 16.1976 | -12.675267407451674, 0, 15.441742424823595 |
| ccu2:optical-in | ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu2:sdi-out | ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.54, -8.275 | -14.473999999999998, 0, -8.275 |
| cam3:optical-out | กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 12.4132, 1.28, 16.1976 | 12.675267407451674, 0, 15.441742424823595 |
| ccu3:optical-in | ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.79, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu3:sdi-out | ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.79, -8.275 | -14.473999999999998, 0, -8.275 |
| cam4:optical-out | กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 16.6776, 1.28, 6.8433 | 16.999293250650766, 0, 6.110829213902873 |
| ccu4:optical-in | ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.04, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu4:sdi-out | ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.04, -8.275 | -14.473999999999998, 0, -8.275 |
| cam5:optical-out | กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -6.5645, 1.28, 15.1581 | -6.831874661472298, 0, 14.404103454648116 |
| ccu5:optical-in | ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu5:sdi-out | ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam6:optical-out | กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 6.579, 1.28, 16.3339 | 6.906338708904198, 0, 15.603934679143638 |
| ccu6:optical-in | ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu6:sdi-out | ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.54, -8.275 | -14.473999999999998, 0, -8.275 |
| router:in-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.415 | -14.473999999999998, 0, -7.415 |
| router:out-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.325 | -14.473999999999998, 0, -7.325 |
| router:in-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.235 | -14.473999999999998, 0, -7.235 |
| router:out-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.145 | -14.473999999999998, 0, -7.145 |
| sw:sdi-in-1 | เครื่องสลับภาพรายการ SDI IN 1 | INPUT | SDI | SDI | rear | -9.325, 0.84, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-2 | เครื่องสลับภาพรายการ SDI IN 2 | INPUT | SDI | SDI | rear | -9.235, 0.84, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-in-3 | เครื่องสลับภาพรายการ SDI IN 3 | INPUT | SDI | SDI | rear | -9.145, 0.84, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-in-4 | เครื่องสลับภาพรายการ SDI IN 4 | INPUT | SDI | SDI | rear | -9.055, 0.84, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-in-5 | เครื่องสลับภาพรายการ SDI IN 5 | INPUT | SDI | SDI | rear | -8.965, 0.84, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-in-6 | เครื่องสลับภาพรายการ SDI IN 6 | INPUT | SDI | SDI | rear | -8.875, 0.84, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:sdi-in-7 | เครื่องสลับภาพรายการ SDI IN 7 | INPUT | SDI | SDI | rear | -9.325, 0.91, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-8 | เครื่องสลับภาพรายการ SDI IN 8 | INPUT | SDI | SDI | rear | -9.235, 0.91, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-out-1 | เครื่องสลับภาพรายการ SDI OUT 1 | OUTPUT | SDI | SDI | rear | -9.145, 0.91, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-out-2 | เครื่องสลับภาพรายการ SDI OUT 2 | OUTPUT | SDI | SDI | rear | -9.055, 0.91, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-out-3 | เครื่องสลับภาพรายการ SDI OUT 3 | OUTPUT | SDI | SDI | rear | -8.965, 0.91, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-out-4 | เครื่องสลับภาพรายการ SDI OUT 4 | OUTPUT | SDI | SDI | rear | -8.875, 0.91, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:mv-out | เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | -9.19, 0.98, -6.951 | -9.99, 0, -7.7509999999999994 |
| sw:xlr-l | เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.1, 0.98, -6.951 | -9.1, 0, -8.251 |
| sw:xlr-r | เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.01, 0.98, -6.951 | -8.209999999999999, 0, -7.7509999999999994 |
| monitor:sdi-in | จอรวมภาพ SDI IN | INPUT | SDI | SDI | rear | -9.1, 1.26, -7.781 | -9.1, 0, -8.581 |
| mic1:xlr-out | ไมค์ผู้บรรยาย 1 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 7.15, 0.79, -2.18 | 7.15, 0, -1.3800000000000001 |
| mic2:xlr-out | ไมค์ผู้บรรยาย 2 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 8.97, 0.79, -2.18 | 8.97, 0, -1.3800000000000001 |
| crowdL:xlr-out | ไมค์บรรยากาศซ้าย XLR OUT | OUTPUT | XLR | MIC | side | -15.365, 1.39, 15.08 | -16.165, 0, 15.08 |
| crowdR:xlr-out | ไมค์บรรยากาศขวา XLR OUT | OUTPUT | XLR | MIC | side | 16.925, 1.39, 11.7 | 17.725, 0, 11.7 |
| field:xlr-out | ไมค์ภาคสนาม XLR OUT | OUTPUT | XLR | MIC | rear | 3.9, 1.39, 16.925 | 3.9, 0, 17.725 |
| lav:out | ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -2.6, 1.39, 16.795 | -2.6, 0, 17.595000000000002 |
| tx:mic-in | ตัวส่งไมค์สนาม MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -3.12, 0.05, 16.791 | -3.12, 0, 17.591 |
| rx:audio-out | ตัวรับไมค์สนาม AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 10.66, 0.87, -0.716 | 10.66, 0, -1.516 |
| stagebox:mic-in-1 | กล่องรับไมค์สนาม MIC IN 1 | INPUT | XLR | MIC | rear | 10.4475, 0.0715, -0.066 | 9.647499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-2 | กล่องรับไมค์สนาม MIC IN 2 | INPUT | XLR | MIC | rear | 10.5325, 0.0715, -0.066 | 9.7325, 0, -0.8660000000000001 |
| stagebox:mic-in-3 | กล่องรับไมค์สนาม MIC IN 3 | INPUT | XLR | MIC | rear | 10.6175, 0.0715, -0.066 | 9.817499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-4 | กล่องรับไมค์สนาม MIC IN 4 | INPUT | XLR | MIC | rear | 10.7025, 0.0715, -0.066 | 9.9025, 0, -0.8660000000000001 |
| stagebox:mic-in-5 | กล่องรับไมค์สนาม MIC IN 5 | INPUT | XLR | MIC | rear | 10.7875, 0.0715, -0.066 | 9.987499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-6 | กล่องรับไมค์สนาม MIC IN 6 | INPUT | XLR | MIC | rear | 10.8725, 0.0715, -0.066 | 11.672500000000001, 0, -0.8660000000000001 |
| stagebox:multicore | กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 10.66, 0.1485, -0.066 | 9.86, 0, -0.8660000000000001 |
| tail:multicore | หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -4.3725, 0.8315, -5.396 | -4.3725, 0, -6.196 |
| tail:tail-1 | หางสายเสียงที่คอนโซล TAIL 1 | OUTPUT | XLR | MIC | rear | -4.2875, 0.8315, -5.396 | -4.2875, 0, -6.196 |
| tail:tail-2 | หางสายเสียงที่คอนโซล TAIL 2 | OUTPUT | XLR | MIC | rear | -4.2025, 0.8315, -5.396 | -4.2025, 0, -6.196 |
| tail:tail-3 | หางสายเสียงที่คอนโซล TAIL 3 | OUTPUT | XLR | MIC | rear | -4.1175, 0.8315, -5.396 | -4.1175, 0, -6.196 |
| tail:tail-4 | หางสายเสียงที่คอนโซล TAIL 4 | OUTPUT | XLR | MIC | rear | -4.0325, 0.8315, -5.396 | -4.0325, 0, -6.196 |
| tail:tail-5 | หางสายเสียงที่คอนโซล TAIL 5 | OUTPUT | XLR | MIC | rear | -3.9475, 0.8315, -5.396 | -3.9475, 0, -6.196 |
| tail:tail-6 | หางสายเสียงที่คอนโซล TAIL 6 | OUTPUT | XLR | MIC | rear | -4.16, 0.9085, -5.396 | -4.16, 0, -6.196 |
| mix:in-1 | คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.605, 0.8413, -5.676 | -3.605, 0, -6.476 |
| mix:in-2 | คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.515, 0.8413, -5.676 | -3.515, 0, -6.476 |
| mix:in-3 | คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.425, 0.8413, -5.676 | -3.425, 0, -6.476 |
| mix:in-4 | คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.335, 0.8413, -5.676 | -3.335, 0, -6.476 |
| mix:in-5 | คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.245, 0.8413, -5.676 | -3.245, 0, -6.476 |
| mix:in-6 | คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.155, 0.8413, -5.676 | -3.155, 0, -6.476 |
| mix:pa-l | คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.515, 0.9287, -5.676 | -3.515, 0, -6.476 |
| mix:pa-r | คอนโซลเสียงถ่ายทอดและ PA PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.425, 0.9287, -5.676 | -3.425, 0, -6.476 |
| mix:bc-l | คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.335, 0.9287, -5.676 | -3.335, 0, -6.476 |
| mix:bc-r | คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.245, 0.9287, -5.676 | -3.245, 0, -6.476 |
| pa:line-in | ระบบ PA สนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | 10.4, 0.275, 6.734 | 10.4, 0, 5.934 |
| play:sdi-out | เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | OUTPUT | SDI | SDI | rear | -9.925, 0.87, -4.161 | -9.925, 0, -4.960999999999999 |
| play:control-in | เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | INPUT | CONTROL | CONTROL | rear | -9.835, 0.87, -4.161 | -9.835, 0, -4.960999999999999 |
| controller:control-out | แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | OUTPUT | CONTROL | CONTROL | rear | -8.45, 0.87, -4.096 | -8.45, 0, -4.896 |
| gfx:hdmi-out | คอมพิวเตอร์กราฟิก HDMI OUT | OUTPUT | HDMI | HDMI | rear | -8.566, 0.773, -1.235 | -9.366000000000001, 0, -2.035 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -7.37, 0.8225, -1.281 | -7.37, 0, -2.081 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -7.28, 0.8225, -1.281 | -7.28, 0, -2.081 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -7.19, 0.8225, -1.281 | -7.19, 0, -2.081 |
| enc:sdi-in | ตัวเข้ารหัสหลัก PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, -4.985 | -14.383999999999999, 0, -4.985 |
| enc:eth | ตัวเข้ารหัสหลัก NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -4.895 | -14.383999999999999, 0, -4.895 |
| enc2:sdi-in | ตัวเข้ารหัสสำรอง PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, 0.605 | -14.383999999999999, 0, 0.605 |
| enc2:eth | ตัวเข้ารหัสสำรอง NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 0.695 | -14.383999999999999, 0, 0.695 |
| net:lan-1 | เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -3.99 | -14.383999999999999, 0, -3.99 |
| net:lan-2 | เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 2 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -3.9 | -14.383999999999999, 0, -3.9 |
| net:wan | เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | OUTPUT | ETHERNET | WAN | rear | -15.184, 0.85, -3.81 | -14.383999999999999, 0, -3.81 |
| net2:lan-1 | เครือข่ายสำรอง LAN 1 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 1.47 | -14.383999999999999, 0, 1.47 |
| net2:lan-2 | เครือข่ายสำรอง LAN 2 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 1.56 | -14.383999999999999, 0, 1.56 |
| net2:wan | เครือข่ายสำรอง WAN | OUTPUT | ETHERNET | WAN | rear | -15.184, 0.85, 1.65 | -14.383999999999999, 0, 1.65 |
| wan:wan-in | จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | INPUT | ETHERNET | WAN | rear | -15.184, 0.85, -2.86 | -14.383999999999999, 0, -2.86 |
| wan2:wan-in | จุดรับสตรีมสำรอง UPLINK IN | INPUT | ETHERNET | WAN | rear | -15.184, 0.85, 2.405 | -14.383999999999999, 0, 2.405 |
| rec:sdi-in | เครื่องบันทึกรายการ PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, -0.26 | -14.383999999999999, 0, -0.25999999999999984 |
| display:sdi-in | ตัวรับภาพจอสนาม SDI IN | INPUT | SDI | SDI | rear | 17.114, 1.28, 14.3 | 16.314, 0, 14.3 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-storage | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-sightlines | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| cam-1 | signal | ภาพกล้อง 1 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-2 | signal | ภาพกล้อง 2 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-3 | signal | ภาพกล้อง 3 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-4 | signal | ภาพกล้อง 4 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-5 | signal | ภาพกล้อง 5 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-6 | signal | ภาพกล้อง 6 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| replay | signal | ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7 | true |
| gfx | signal | กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8 | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| audio-sw | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| venue | signal | จอสนามได้รับภาพรายการสะอาดจาก AUX | true |
| record | delivery | เครื่องบันทึกได้รับภาพรายการและกำลังบันทึก | true |
| main | delivery | ผู้ชมรับภาพและเสียงผ่านเครือข่ายหลัก | true |
| backup | delivery | ผู้ชมสำรองรับภาพและเสียงผ่านเครือข่ายสำรอง | true |
| separate | delivery | สองชุดส่งใช้พอร์ตและเกตเวย์คนละเส้นทาง | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| recovered | delivery | วินิจฉัยและแก้ปัญหาที่เกิดในงาน | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: lead-1: cam1:optical-out → ccu1:optical-in; lead-2: ccu1:sdi-out → router:in-1; lead-3: router:out-1 → sw:sdi-in-1; lead-4: cam2:optical-out → ccu2:optical-in; lead-5: ccu2:sdi-out → router:in-2; lead-6: router:out-2 → sw:sdi-in-2; lead-7: cam3:optical-out → ccu3:optical-in; lead-8: ccu3:sdi-out → router:in-3; lead-9: router:out-3 → sw:sdi-in-3; lead-10: cam4:optical-out → ccu4:optical-in; lead-11: ccu4:sdi-out → router:in-4; lead-12: router:out-4 → sw:sdi-in-4; lead-13: cam5:optical-out → ccu5:optical-in; lead-14: ccu5:sdi-out → router:in-5; lead-15: router:out-5 → sw:sdi-in-5; lead-16: cam6:optical-out → ccu6:optical-in; lead-17: ccu6:sdi-out → router:in-6; lead-18: router:out-6 → sw:sdi-in-6; lead-19: controller:control-out → play:control-in; lead-20: play:sdi-out → router:in-7; lead-21: gfx:hdmi-out → convHS:hdmi-in; lead-22: convHS:sdi-out → router:in-8; lead-23: router:out-7 → sw:sdi-in-7; lead-24: router:out-8 → sw:sdi-in-8; lead-25: sw:mv-out → monitor:sdi-in; lead-26: mic1:xlr-out → stagebox:mic-in-1; lead-27: mic2:xlr-out → stagebox:mic-in-2; lead-28: crowdL:xlr-out → stagebox:mic-in-3; lead-29: crowdR:xlr-out → stagebox:mic-in-4; lead-30: field:xlr-out → stagebox:mic-in-5; lead-31: lav:out → tx:mic-in; lead-32: rx:audio-out → stagebox:mic-in-6; lead-33: stagebox:multicore → tail:multicore; lead-34: tail:tail-1 → mix:in-1; lead-35: tail:tail-2 → mix:in-2; lead-36: tail:tail-3 → mix:in-3; lead-37: tail:tail-4 → mix:in-4; lead-38: tail:tail-5 → mix:in-5; lead-39: tail:tail-6 → mix:in-6; lead-40: mix:pa-l → pa:line-in; lead-41: mix:bc-l → sw:xlr-l; lead-42: mix:bc-r → sw:xlr-r; lead-43: sw:sdi-out-1 → enc:sdi-in; lead-45: sw:sdi-out-3 → rec:sdi-in; lead-46: sw:sdi-out-4 → display:sdi-in; lead-47: enc:eth → net:lan-1; lead-48: net:wan → wan:wan-in; lead-49: enc2:eth → net2:lan-1; lead-50: net2:wan → wan2:wan-in. Faults: f-crosspoint, f-physical-link.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.

## SP-05 / xl-5

Topology: `appendix-a-xl-5-v1`. Reference pointers: R03, R06, R09, R10, R11, R12, R13, R16, R17.

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

Work order: SP-05 · ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก

| Device | Model/profile | Evidence | Placement | Fixed/movable | Control state to demonstrate |
| --- | --- | --- | --- | --- | --- |
| cam1 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 1 หลักภาพกว้าง (แท่นสูง); (0, 0.3, 10.66) yaw 3.141592653589793 | Fixed | power=true; framing=Framed for assignment |
| ccu1 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam2 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 2 ข้างสนามซ้าย; (-12.35, 0, 16.38) yaw -2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu2 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam3 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 3 ข้างสนามขวา; (12.35, 0, 16.38) yaw 2.807847036565737 | Fixed | power=true; framing=Framed for assignment |
| ccu3 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.6799999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam4 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 4 ท้ายสนาม; (16.599999999999998, 0, 7.02) yaw 2.727765280599181 | Fixed | power=true; framing=Framed for assignment |
| ccu4 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 0.9299999999999999, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam5 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 5 เลนส์ระยะไกล; (-6.5, 0, 15.34) yaw -2.8008169108201733 | Fixed | power=true; framing=Framed for assignment |
| ccu5 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.18, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| cam6 | อุปกรณ์จำลองเพื่อฝึก · กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก) | GENERIC TRAINING MODEL | กล้อง 6 เคลื่อนที่ในสนาม; (6.5, 0, 16.51) yaw 2.7200446968636376 | Fixed | power=true; framing=Framed for assignment |
| ccu6 | อุปกรณ์จำลองเพื่อฝึก · ฐานกล้อง / CCU (คู่กล้องที่กำหนด) | GENERIC TRAINING MODEL | ตู้ฐานกล้อง — แยก 6 ยูนิต; (-15.47, 1.43, -8.32) yaw -1.5707963267948966 | Fixed | power=true |
| router | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์ภาพ SDI · โปรไฟล์ใช้งาน 8×8 | GENERIC TRAINING MODEL | ตู้เราเตอร์ภาพ; (-15.47, 0.8, -7.28) yaw -1.5707963267948966 | Fixed | power=true; xp-1=IN 1; xp-2=IN 2; xp-3=IN 3; xp-4=IN 4; xp-5=IN 5; xp-6=IN 6; xp-7=IN 7; xp-8=IN 8 |
| sw | อุปกรณ์จำลองเพื่อฝึก · เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง | GENERIC TRAINING MODEL | แถว 1: Production Switcher; (-9.1, 0.76, -6.695) yaw 0 | Fixed | power=true; pgm=SDI 1; sdi-out-1=PROGRAM; sdi-out-2=PROGRAM; sdi-out-3=PROGRAM; sdi-out-4=AUX; aux=PROGRAM; emb-audio=OFF; xlr-on=true; emb-audio=OFF |
| monitor | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จอรวมภาพ — เว้นทางบริการจากผนังหน้า; (-9.1, 1, -7.735) yaw 0 | Fixed | power=true |
| mic1 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 1; (7.15, 0.76, -2.275) yaw 0 | Fixed |  |
| mic2 | Shure SM58 | DESIGN_REFERENCE | Commentary desk: Mic 2; (8.97, 0.76, -2.275) yaw 0 | Fixed |  |
| crowdL | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมซ้าย; (-15.34, 0, 15.08) yaw 1.5707963267948966 | Fixed | windscreen=true |
| crowdR | อุปกรณ์จำลองเพื่อฝึก · ไมค์บรรยากาศไดนามิกสมดุลจำลอง | GENERIC TRAINING MODEL | ไมค์บรรยากาศผู้ชมขวา; (16.9, 0, 11.7) yaw -1.5707963267948966 | Fixed | windscreen=true |
| field | อุปกรณ์จำลองเพื่อฝึก · ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Field mic ข้างสนาม; (3.9, 0, 16.9) yaw 3.141592653589793 | Fixed |  |
| lav | อุปกรณ์จำลองเพื่อฝึก · ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ZONE C ห้องควบคุม: Multiview Wall, แถวโต๊ะ Switcher / Replay / Graphics, Audio console, ตู้ Rack; (-2.6, 0, 16.77) yaw 3.141592653589793 | Fixed |  |
| tx | อุปกรณ์จำลองเพื่อฝึก · ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | จุดพิธีกรข้างสนาม; (-3.12, 0, 16.77) yaw 3.141592653589793 | Movable | power=true; power=true; rf=CH 1 |
| rx | อุปกรณ์จำลองเพื่อฝึก · ตัวรับไร้สาย RX (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | ตัวรับเสียงข้างกล่องรับเวที; (10.66, 0.85, -0.65) yaw 0 | Movable | power=true; power=true; rf=CH 1; pair=Paired |
| stagebox | อุปกรณ์จำลองเพื่อฝึก · กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก) | GENERIC TRAINING MODEL | จุดรับเสียงผู้บรรยายและสนาม; (10.66, 0, 0.13) yaw 0 | Fixed |  |
| tail | อุปกรณ์จำลองเพื่อฝึก · หางสายมัลติคอร์ 6 ช่อง | GENERIC TRAINING MODEL | ข้างคอนโซลเสียง; (-4.16, 0.76, -5.2) yaw 0 | Fixed |  |
| mix | อุปกรณ์จำลองเพื่อฝึก · คอนโซลเสียงแยกบัส PA / BROADCAST | GENERIC TRAINING MODEL | จุดเสียง: เครื่องผสมเสียงดิจิทัล; (-3.38, 0.76, -5.395) yaw 0 | Fixed | power=true; ch1-gain=Nominal (peaks −18 dBFS); ch1-on=true; ch1-pa=true; ch1-bc=true; ch2-gain=Nominal (peaks −18 dBFS); ch2-on=true; ch2-pa=true; ch2-bc=true; ch3-gain=Nominal (peaks −18 dBFS); ch3-on=true; ch3-pa=true; ch3-bc=true; ch4-gain=Nominal (peaks −18 dBFS); ch4-on=true; ch4-pa=true; ch4-bc=true; ch5-gain=Nominal (peaks −18 dBFS); ch5-on=true; ch5-pa=true; ch5-bc=true; ch6-gain=Nominal (peaks −18 dBFS); ch6-on=true; ch6-pa=true; ch6-bc=true; pa-fader=Unity; bc-fader=Unity |
| pa | อุปกรณ์จำลองเพื่อฝึก · ลำโพงแอ็กทีฟจำลองเพื่อฝึก | GENERIC TRAINING MODEL | ระบบ PA ฝั่งผู้ชม; (10.4, 0, 6.89) yaw 0 | Fixed | power=true; level=Nominal; aim=In front of the mic, aimed at audience |
| play | อุปกรณ์จำลองเพื่อฝึก · เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง) | GENERIC TRAINING MODEL | แถว 2: Replay; (-9.88, 0.76, -3.965) yaw 0 | Fixed | power=true; clip=true; play=true |
| controller | อุปกรณ์จำลองเพื่อฝึก · แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง) | GENERIC TRAINING MODEL | โต๊ะควบคุมภาพซ้ำ; (-8.45, 0.76, -3.9) yaw 0 | Fixed | power=true; cue=true |
| gfx | อุปกรณ์จำลองเพื่อฝึก · คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง | GENERIC TRAINING MODEL | แถว 3: Graphics Workstation; (-8.32, 0.76, -1.235) yaw 0 | Fixed | power=true; template=Scoreboard template (licensed); score=0–0 |
| convHS | Blackmagic Micro Converter HDMI to SDI 3G | DESIGN_REFERENCE | โต๊ะกราฟิก — ตัวแปลง HDMI→SDI; (-7.28, 0.76, -1.235) yaw 0 | Fixed | power=true |
| enc | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | ตู้ตัวเข้ารหัส; (-15.47, 0, -4.94) yaw 4.71238898038469 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| enc2 | อุปกรณ์จำลองเพื่อฝึก · ตัวเข้ารหัส SDI / เครือข่าย (จำลอง) | GENERIC TRAINING MODEL | ตู้ส่งสำรอง; (-15.47, 0, 0.65) yaw -1.5707963267948966 | Fixed | power=true; format=1080p50; stream-key=•••• (private test); stream=true |
| net | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | ตู้บริการ WAN — เกตเวย์; (-15.47, 0, -3.9) yaw 4.71238898038469 | Fixed | power=true |
| net2 | อุปกรณ์จำลองเพื่อฝึก · เราเตอร์และเกตเวย์ GbE จำลอง | GENERIC TRAINING MODEL | ตู้เครือข่ายสำรอง; (-15.47, 0, 1.56) yaw -1.5707963267948966 | Fixed | power=true |
| wan | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | ตู้บริการ WAN — ทางออกจำลอง; (-15.47, 0, -2.86) yaw 4.71238898038469 | Fixed |  |
| wan2 | อุปกรณ์จำลองเพื่อฝึก · จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง | GENERIC TRAINING MODEL | จุดรับสำรองจำลอง; (-15.47, 0, 2.405) yaw -1.5707963267948966 | Fixed |  |
| rec | อุปกรณ์จำลองเพื่อฝึก · เครื่องบันทึก PROGRAM พร้อมสื่อภายใน (จำลอง) | GENERIC TRAINING MODEL | ตู้บันทึก — HyperDeck ภาพออกอากาศ; (-15.47, 0, -0.26) yaw 4.71238898038469 | Fixed | power=true; media=SD card mounted (512 GB free); record=true |
| display | อุปกรณ์จำลองเพื่อฝึก · จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL) | GENERIC TRAINING MODEL | Stadium display processor; (17.16, 0, 14.3) yaw 1.5707963267948966 | Fixed | power=true |

### Required physical graph (one unique cable per edge)

| Cable ID | Source / real label | Destination / real label | End A | End B | Signal | Length m | Catalog group |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lead-1 | cam1:optical-out / กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu1:optical-in / ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 35 | FIB-CAMERA-CCU |
| lead-2 | ccu1:sdi-out / ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | router:in-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-3 | router:out-1 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | sw:sdi-in-1 / เครื่องสลับภาพรายการ SDI IN 1 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-4 | cam2:optical-out / กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu2:optical-in / ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-5 | ccu2:sdi-out / ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | router:in-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-6 | router:out-2 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | sw:sdi-in-2 / เครื่องสลับภาพรายการ SDI IN 2 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-7 | cam3:optical-out / กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu3:optical-in / ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 55 | FIB-CAMERA-CCU |
| lead-8 | ccu3:sdi-out / ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | router:in-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-9 | router:out-3 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | sw:sdi-in-3 / เครื่องสลับภาพรายการ SDI IN 3 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-10 | cam4:optical-out / กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu4:optical-in / ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-11 | ccu4:sdi-out / ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | router:in-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-12 | router:out-4 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | sw:sdi-in-4 / เครื่องสลับภาพรายการ SDI IN 4 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-13 | cam5:optical-out / กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu5:optical-in / ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 45 | FIB-CAMERA-CCU |
| lead-14 | ccu5:sdi-out / ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | router:in-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-15 | router:out-5 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | sw:sdi-in-5 / เครื่องสลับภาพรายการ SDI IN 5 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-16 | cam6:optical-out / กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | ccu6:optical-in / ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | FIBER | FIBER | FIBER_VIDEO | 50 | FIB-CAMERA-CCU |
| lead-17 | ccu6:sdi-out / ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | router:in-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-18 | router:out-6 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | sw:sdi-in-6 / เครื่องสลับภาพรายการ SDI IN 6 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-19 | controller:control-out / แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | play:control-in / เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | CONTROL | CONTROL | CONTROL | 10 | CTRL-REPLAY |
| lead-20 | play:sdi-out / เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | router:in-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-21 | gfx:hdmi-out / คอมพิวเตอร์กราฟิก HDMI OUT | convHS:hdmi-in / Micro Converter HDMI→SDI 3G HDMI IN | HDMI | HDMI | HDMI | 10 | VID-HDMI-A-A |
| lead-22 | convHS:sdi-out / Micro Converter HDMI→SDI 3G SDI OUT | router:in-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-23 | router:out-7 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | sw:sdi-in-7 / เครื่องสลับภาพรายการ SDI IN 7 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-24 | router:out-8 / เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | sw:sdi-in-8 / เครื่องสลับภาพรายการ SDI IN 8 | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-25 | sw:mv-out / เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | monitor:sdi-in / จอรวมภาพ SDI IN | SDI | SDI | SDI | 10 | VID-SDI-3G |
| lead-26 | mic1:xlr-out / ไมค์ผู้บรรยาย 1 SM58 XLR OUT | stagebox:mic-in-1 / กล่องรับไมค์สนาม MIC IN 1 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-27 | mic2:xlr-out / ไมค์ผู้บรรยาย 2 SM58 XLR OUT | stagebox:mic-in-2 / กล่องรับไมค์สนาม MIC IN 2 | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-28 | crowdL:xlr-out / ไมค์บรรยากาศซ้าย XLR OUT | stagebox:mic-in-3 / กล่องรับไมค์สนาม MIC IN 3 | XLR-F | XLR-M | MIC | 65 | AUD-XLR-MIC |
| lead-29 | crowdR:xlr-out / ไมค์บรรยากาศขวา XLR OUT | stagebox:mic-in-4 / กล่องรับไมค์สนาม MIC IN 4 | XLR-F | XLR-M | MIC | 25 | AUD-XLR-MIC |
| lead-30 | field:xlr-out / ไมค์ภาคสนาม XLR OUT | stagebox:mic-in-5 / กล่องรับไมค์สนาม MIC IN 5 | XLR-F | XLR-M | MIC | 45 | AUD-XLR-MIC |
| lead-31 | lav:out / ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | tx:mic-in / ตัวส่งไมค์สนาม MIC IN (3.5 mm) | 3.5mm | 3.5mm | MIC | 2 | AUD-LAV-TX |
| lead-32 | rx:audio-out / ตัวรับไมค์สนาม AUDIO OUT (XLR) | stagebox:mic-in-6 / กล่องรับไมค์สนาม MIC IN 6 | XLR-F | XLR-M | MIC | 10 | AUD-RX-MIXER-XLR |
| lead-33 | stagebox:multicore / กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | tail:multicore / หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | MULTICORE | MULTICORE | MULTICORE | 25 | STG-MULTICORE |
| lead-34 | tail:tail-1 / หางสายเสียงที่คอนโซล TAIL 1 | mix:in-1 / คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-35 | tail:tail-2 / หางสายเสียงที่คอนโซล TAIL 2 | mix:in-2 / คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-36 | tail:tail-3 / หางสายเสียงที่คอนโซล TAIL 3 | mix:in-3 / คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-37 | tail:tail-4 / หางสายเสียงที่คอนโซล TAIL 4 | mix:in-4 / คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-38 | tail:tail-5 / หางสายเสียงที่คอนโซล TAIL 5 | mix:in-5 / คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-39 | tail:tail-6 / หางสายเสียงที่คอนโซล TAIL 6 | mix:in-6 / คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | XLR-F | XLR-M | MIC | 10 | AUD-XLR-MIC |
| lead-40 | mix:pa-l / คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | pa:line-in / ระบบ PA สนาม LINE IN (XLR/TRS) | XLR-F | XLR-M | LINE_BAL | 30 | AUD-PA-ACTIVE |
| lead-41 | mix:bc-l / คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | sw:xlr-l / เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |
| lead-42 | mix:bc-r / คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | sw:xlr-r / เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | XLR-F | 6.35mm | LINE_BAL | 15 | AUD-XLR-TRS-BAL |
| lead-43 | sw:sdi-out-1 / เครื่องสลับภาพรายการ SDI OUT 1 | enc:sdi-in / ตัวเข้ารหัสหลัก PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-44 | sw:sdi-out-2 / เครื่องสลับภาพรายการ SDI OUT 2 | enc2:sdi-in / ตัวเข้ารหัสสำรอง PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-45 | sw:sdi-out-3 / เครื่องสลับภาพรายการ SDI OUT 3 | rec:sdi-in / เครื่องบันทึกรายการ PROGRAM SDI IN | SDI | SDI | SDI | 15 | VID-SDI-3G |
| lead-46 | sw:sdi-out-4 / เครื่องสลับภาพรายการ SDI OUT 4 | display:sdi-in / ตัวรับภาพจอสนาม SDI IN | SDI | SDI | SDI | 50 | VID-SDI-3G |
| lead-47 | enc:eth / ตัวเข้ารหัสหลัก NETWORK · Ethernet | net:lan-1 / เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-48 | net:wan / เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | wan:wan-in / จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |
| lead-49 | enc2:eth / ตัวเข้ารหัสสำรอง NETWORK · Ethernet | net2:lan-1 / เครือข่ายสำรอง LAN 1 | ETHERNET | ETHERNET | ETHERNET | 10 | NET-CAT5E6-ENCODER |
| lead-50 | net2:wan / เครือข่ายสำรอง WAN | wan2:wan-in / จุดรับสตรีมสำรอง UPLINK IN | ETHERNET | ETHERNET | WAN | 10 | NET-ROUTER-UPLINK |

### Additional stock

| ID | Label | Ends | Role | Length m |
| --- | --- | --- | --- | --- |


### All selectable ports (capacity: one physical cable per port)

| Port | Label | Direction | Connector | Signal | Panel | Anchor | Service position candidate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cam1:optical-out | กล้องสนาม 1 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 0, 1.58, 10.467 | 1.285879139104721e-16, 0, 9.417 |
| ccu1:optical-in | ฐานกล้อง CCU 1 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu1:sdi-out | ฐานกล้อง CCU 1 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam2:optical-out | กล้องสนาม 2 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -12.4132, 1.28, 16.1976 | -12.675267407451674, 0, 15.441742424823595 |
| ccu2:optical-in | ฐานกล้อง CCU 2 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu2:sdi-out | ฐานกล้อง CCU 2 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.54, -8.275 | -14.473999999999998, 0, -8.275 |
| cam3:optical-out | กล้องสนาม 3 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 12.4132, 1.28, 16.1976 | 12.675267407451674, 0, 15.441742424823595 |
| ccu3:optical-in | ฐานกล้อง CCU 3 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 0.79, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu3:sdi-out | ฐานกล้อง CCU 3 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 0.79, -8.275 | -14.473999999999998, 0, -8.275 |
| cam4:optical-out | กล้องสนาม 4 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 16.6776, 1.28, 6.8433 | 16.999293250650766, 0, 6.110829213902873 |
| ccu4:optical-in | ฐานกล้อง CCU 4 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.04, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu4:sdi-out | ฐานกล้อง CCU 4 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.04, -8.275 | -14.473999999999998, 0, -8.275 |
| cam5:optical-out | กล้องสนาม 5 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | -6.5645, 1.28, 15.1581 | -6.831874661472298, 0, 14.404103454648116 |
| ccu5:optical-in | ฐานกล้อง CCU 5 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.29, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu5:sdi-out | ฐานกล้อง CCU 5 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.29, -8.275 | -14.473999999999998, 0, -8.275 |
| cam6:optical-out | กล้องสนาม 6 CAMERA OPTICAL OUT · เข้าฐานคู่กัน | OUTPUT | FIBER | FIBER_VIDEO | rear | 6.579, 1.28, 16.3339 | 6.906338708904198, 0, 15.603934679143638 |
| ccu6:optical-in | ฐานกล้อง CCU 6 CAMERA OPTICAL IN · เข้าคู่ | INPUT | FIBER | FIBER_VIDEO | rear | -15.274, 1.54, -8.365 | -14.473999999999998, 0, -8.365 |
| ccu6:sdi-out | ฐานกล้อง CCU 6 VIDEO SDI OUT · 75Ω | OUTPUT | SDI | SDI | rear | -15.274, 1.54, -8.275 | -14.473999999999998, 0, -8.275 |
| router:in-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 1 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-1 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 1 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 2 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-2 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 2 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 3 | INPUT | SDI | SDI | rear | -15.274, 0.868, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-3 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 3 | OUTPUT | SDI | SDI | rear | -15.274, 0.868, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 4 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4925 | -14.473999999999998, 0, -7.4925 |
| router:out-4 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 4 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.4075 | -14.473999999999998, 0, -7.4075 |
| router:in-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 5 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.3225 | -14.473999999999998, 0, -7.3225 |
| router:out-5 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 5 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.2375 | -14.473999999999998, 0, -7.2375 |
| router:in-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 6 | INPUT | SDI | SDI | rear | -15.274, 0.9275, -7.1525 | -14.473999999999998, 0, -7.1525 |
| router:out-6 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 6 | OUTPUT | SDI | SDI | rear | -15.274, 0.9275, -7.0675 | -14.473999999999998, 0, -7.0675 |
| router:in-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 7 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.415 | -14.473999999999998, 0, -7.415 |
| router:out-7 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 7 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.325 | -14.473999999999998, 0, -7.325 |
| router:in-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI IN 8 | INPUT | SDI | SDI | rear | -15.274, 0.987, -7.235 | -14.473999999999998, 0, -7.235 |
| router:out-8 | เราเตอร์ภาพ SDI แบบ Crosspoint SDI OUT 8 | OUTPUT | SDI | SDI | rear | -15.274, 0.987, -7.145 | -14.473999999999998, 0, -7.145 |
| sw:sdi-in-1 | เครื่องสลับภาพรายการ SDI IN 1 | INPUT | SDI | SDI | rear | -9.325, 0.84, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-2 | เครื่องสลับภาพรายการ SDI IN 2 | INPUT | SDI | SDI | rear | -9.235, 0.84, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-in-3 | เครื่องสลับภาพรายการ SDI IN 3 | INPUT | SDI | SDI | rear | -9.145, 0.84, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-in-4 | เครื่องสลับภาพรายการ SDI IN 4 | INPUT | SDI | SDI | rear | -9.055, 0.84, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-in-5 | เครื่องสลับภาพรายการ SDI IN 5 | INPUT | SDI | SDI | rear | -8.965, 0.84, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-in-6 | เครื่องสลับภาพรายการ SDI IN 6 | INPUT | SDI | SDI | rear | -8.875, 0.84, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:sdi-in-7 | เครื่องสลับภาพรายการ SDI IN 7 | INPUT | SDI | SDI | rear | -9.325, 0.91, -6.951 | -10.125, 0, -7.7509999999999994 |
| sw:sdi-in-8 | เครื่องสลับภาพรายการ SDI IN 8 | INPUT | SDI | SDI | rear | -9.235, 0.91, -6.951 | -10.035, 0, -7.7509999999999994 |
| sw:sdi-out-1 | เครื่องสลับภาพรายการ SDI OUT 1 | OUTPUT | SDI | SDI | rear | -9.145, 0.91, -6.951 | -9.145, 0, -8.251 |
| sw:sdi-out-2 | เครื่องสลับภาพรายการ SDI OUT 2 | OUTPUT | SDI | SDI | rear | -9.055, 0.91, -6.951 | -9.055, 0, -8.251 |
| sw:sdi-out-3 | เครื่องสลับภาพรายการ SDI OUT 3 | OUTPUT | SDI | SDI | rear | -8.965, 0.91, -6.951 | -8.165, 0, -7.7509999999999994 |
| sw:sdi-out-4 | เครื่องสลับภาพรายการ SDI OUT 4 | OUTPUT | SDI | SDI | rear | -8.875, 0.91, -6.951 | -8.075, 0, -7.7509999999999994 |
| sw:mv-out | เครื่องสลับภาพรายการ MULTIVIEW SDI OUT | OUTPUT | SDI | SDI | rear | -9.19, 0.98, -6.951 | -9.99, 0, -7.7509999999999994 |
| sw:xlr-l | เครื่องสลับภาพรายการ AUDIO IN L · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.1, 0.98, -6.951 | -9.1, 0, -8.251 |
| sw:xlr-r | เครื่องสลับภาพรายการ AUDIO IN R · BALANCED TRS | INPUT | 6.35mm | LINE_BAL | rear | -9.01, 0.98, -6.951 | -8.209999999999999, 0, -7.7509999999999994 |
| monitor:sdi-in | จอรวมภาพ SDI IN | INPUT | SDI | SDI | rear | -9.1, 1.26, -7.781 | -9.1, 0, -8.581 |
| mic1:xlr-out | ไมค์ผู้บรรยาย 1 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 7.15, 0.79, -2.18 | 7.15, 0, -1.3800000000000001 |
| mic2:xlr-out | ไมค์ผู้บรรยาย 2 SM58 XLR OUT | OUTPUT | XLR | MIC | side | 8.97, 0.79, -2.18 | 8.97, 0, -1.3800000000000001 |
| crowdL:xlr-out | ไมค์บรรยากาศซ้าย XLR OUT | OUTPUT | XLR | MIC | side | -15.365, 1.39, 15.08 | -16.165, 0, 15.08 |
| crowdR:xlr-out | ไมค์บรรยากาศขวา XLR OUT | OUTPUT | XLR | MIC | side | 16.925, 1.39, 11.7 | 17.725, 0, 11.7 |
| field:xlr-out | ไมค์ภาคสนาม XLR OUT | OUTPUT | XLR | MIC | rear | 3.9, 1.39, 16.925 | 3.9, 0, 17.725 |
| lav:out | ไมค์พิธีกรสนาม LAV PLUG (3.5 mm) | OUTPUT | 3.5mm | MIC | rear | -2.6, 1.39, 16.795 | -2.6, 0, 17.595000000000002 |
| tx:mic-in | ตัวส่งไมค์สนาม MIC IN (3.5 mm) | INPUT | 3.5mm | MIC | rear | -3.12, 0.05, 16.791 | -3.12, 0, 17.591 |
| rx:audio-out | ตัวรับไมค์สนาม AUDIO OUT (XLR) | OUTPUT | XLR | MIC | rear | 10.66, 0.87, -0.716 | 10.66, 0, -1.516 |
| stagebox:mic-in-1 | กล่องรับไมค์สนาม MIC IN 1 | INPUT | XLR | MIC | rear | 10.4475, 0.0715, -0.066 | 9.647499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-2 | กล่องรับไมค์สนาม MIC IN 2 | INPUT | XLR | MIC | rear | 10.5325, 0.0715, -0.066 | 9.7325, 0, -0.8660000000000001 |
| stagebox:mic-in-3 | กล่องรับไมค์สนาม MIC IN 3 | INPUT | XLR | MIC | rear | 10.6175, 0.0715, -0.066 | 9.817499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-4 | กล่องรับไมค์สนาม MIC IN 4 | INPUT | XLR | MIC | rear | 10.7025, 0.0715, -0.066 | 9.9025, 0, -0.8660000000000001 |
| stagebox:mic-in-5 | กล่องรับไมค์สนาม MIC IN 5 | INPUT | XLR | MIC | rear | 10.7875, 0.0715, -0.066 | 9.987499999999999, 0, -0.8660000000000001 |
| stagebox:mic-in-6 | กล่องรับไมค์สนาม MIC IN 6 | INPUT | XLR | MIC | rear | 10.8725, 0.0715, -0.066 | 11.672500000000001, 0, -0.8660000000000001 |
| stagebox:multicore | กล่องรับไมค์สนาม MULTICORE OUT · ช่อง 1–6 | OUTPUT | MULTICORE | MULTICORE | rear | 10.66, 0.1485, -0.066 | 9.86, 0, -0.8660000000000001 |
| tail:multicore | หางสายเสียงที่คอนโซล MULTICORE IN · ช่อง 1–6 | INPUT | MULTICORE | MULTICORE | rear | -4.3725, 0.8315, -5.396 | -4.3725, 0, -6.196 |
| tail:tail-1 | หางสายเสียงที่คอนโซล TAIL 1 | OUTPUT | XLR | MIC | rear | -4.2875, 0.8315, -5.396 | -4.2875, 0, -6.196 |
| tail:tail-2 | หางสายเสียงที่คอนโซล TAIL 2 | OUTPUT | XLR | MIC | rear | -4.2025, 0.8315, -5.396 | -4.2025, 0, -6.196 |
| tail:tail-3 | หางสายเสียงที่คอนโซล TAIL 3 | OUTPUT | XLR | MIC | rear | -4.1175, 0.8315, -5.396 | -4.1175, 0, -6.196 |
| tail:tail-4 | หางสายเสียงที่คอนโซล TAIL 4 | OUTPUT | XLR | MIC | rear | -4.0325, 0.8315, -5.396 | -4.0325, 0, -6.196 |
| tail:tail-5 | หางสายเสียงที่คอนโซล TAIL 5 | OUTPUT | XLR | MIC | rear | -3.9475, 0.8315, -5.396 | -3.9475, 0, -6.196 |
| tail:tail-6 | หางสายเสียงที่คอนโซล TAIL 6 | OUTPUT | XLR | MIC | rear | -4.16, 0.9085, -5.396 | -4.16, 0, -6.196 |
| mix:in-1 | คอนโซลเสียงถ่ายทอดและ PA CH 1 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.605, 0.8413, -5.676 | -3.605, 0, -6.476 |
| mix:in-2 | คอนโซลเสียงถ่ายทอดและ PA CH 2 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.515, 0.8413, -5.676 | -3.515, 0, -6.476 |
| mix:in-3 | คอนโซลเสียงถ่ายทอดและ PA CH 3 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.425, 0.8413, -5.676 | -3.425, 0, -6.476 |
| mix:in-4 | คอนโซลเสียงถ่ายทอดและ PA CH 4 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.335, 0.8413, -5.676 | -3.335, 0, -6.476 |
| mix:in-5 | คอนโซลเสียงถ่ายทอดและ PA CH 5 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.245, 0.8413, -5.676 | -3.245, 0, -6.476 |
| mix:in-6 | คอนโซลเสียงถ่ายทอดและ PA CH 6 MIC/LINE IN | INPUT | XLR | MIC | rear | -3.155, 0.8413, -5.676 | -3.155, 0, -6.476 |
| mix:pa-l | คอนโซลเสียงถ่ายทอดและ PA PA-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.515, 0.9287, -5.676 | -3.515, 0, -6.476 |
| mix:pa-r | คอนโซลเสียงถ่ายทอดและ PA PA-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.425, 0.9287, -5.676 | -3.425, 0, -6.476 |
| mix:bc-l | คอนโซลเสียงถ่ายทอดและ PA BC-L LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.335, 0.9287, -5.676 | -3.335, 0, -6.476 |
| mix:bc-r | คอนโซลเสียงถ่ายทอดและ PA BC-R LINE OUT | OUTPUT | XLR | LINE_BAL | rear | -3.245, 0.9287, -5.676 | -3.245, 0, -6.476 |
| pa:line-in | ระบบ PA สนาม LINE IN (XLR/TRS) | INPUT | XLR | LINE_BAL | rear | 10.4, 0.275, 6.734 | 10.4, 0, 5.934 |
| play:sdi-out | เซิร์ฟเวอร์ภาพซ้ำ VIDEO SDI OUT | OUTPUT | SDI | SDI | rear | -9.925, 0.87, -4.161 | -9.925, 0, -4.960999999999999 |
| play:control-in | เซิร์ฟเวอร์ภาพซ้ำ CONTROL IN · โปรไฟล์ฝึกเข้าคู่ | INPUT | CONTROL | CONTROL | rear | -9.835, 0.87, -4.161 | -9.835, 0, -4.960999999999999 |
| controller:control-out | แผงควบคุมภาพซ้ำ CONTROL OUT · โปรไฟล์ฝึกเข้าคู่ | OUTPUT | CONTROL | CONTROL | rear | -8.45, 0.87, -4.096 | -8.45, 0, -4.896 |
| gfx:hdmi-out | คอมพิวเตอร์กราฟิก HDMI OUT | OUTPUT | HDMI | HDMI | rear | -8.566, 0.773, -1.235 | -9.366000000000001, 0, -2.035 |
| convHS:hdmi-in | Micro Converter HDMI→SDI 3G HDMI IN | INPUT | HDMI | HDMI | rear | -7.37, 0.8225, -1.281 | -7.37, 0, -2.081 |
| convHS:sdi-out | Micro Converter HDMI→SDI 3G SDI OUT | OUTPUT | SDI | SDI | rear | -7.28, 0.8225, -1.281 | -7.28, 0, -2.081 |
| convHS:usb-pwr | Micro Converter HDMI→SDI 3G USB-C POWER | INPUT | USB-C | USB_POWER | rear | -7.19, 0.8225, -1.281 | -7.19, 0, -2.081 |
| enc:sdi-in | ตัวเข้ารหัสหลัก PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, -4.985 | -14.383999999999999, 0, -4.985 |
| enc:eth | ตัวเข้ารหัสหลัก NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -4.895 | -14.383999999999999, 0, -4.895 |
| enc2:sdi-in | ตัวเข้ารหัสสำรอง PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, 0.605 | -14.383999999999999, 0, 0.605 |
| enc2:eth | ตัวเข้ารหัสสำรอง NETWORK · Ethernet | OUTPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 0.695 | -14.383999999999999, 0, 0.695 |
| net:lan-1 | เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 1 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -3.99 | -14.383999999999999, 0, -3.99 |
| net:lan-2 | เกตเวย์ / WAN ที่ตรวจสอบแล้ว LAN 2 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, -3.9 | -14.383999999999999, 0, -3.9 |
| net:wan | เกตเวย์ / WAN ที่ตรวจสอบแล้ว WAN | OUTPUT | ETHERNET | WAN | rear | -15.184, 0.85, -3.81 | -14.383999999999999, 0, -3.81 |
| net2:lan-1 | เครือข่ายสำรอง LAN 1 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 1.47 | -14.383999999999999, 0, 1.47 |
| net2:lan-2 | เครือข่ายสำรอง LAN 2 | INPUT | ETHERNET | ETHERNET | rear | -15.184, 0.85, 1.56 | -14.383999999999999, 0, 1.56 |
| net2:wan | เครือข่ายสำรอง WAN | OUTPUT | ETHERNET | WAN | rear | -15.184, 0.85, 1.65 | -14.383999999999999, 0, 1.65 |
| wan:wan-in | จุดรับสตรีมทดสอบส่วนตัว UPLINK IN | INPUT | ETHERNET | WAN | rear | -15.184, 0.85, -2.86 | -14.383999999999999, 0, -2.86 |
| wan2:wan-in | จุดรับสตรีมสำรอง UPLINK IN | INPUT | ETHERNET | WAN | rear | -15.184, 0.85, 2.405 | -14.383999999999999, 0, 2.405 |
| rec:sdi-in | เครื่องบันทึกรายการ PROGRAM SDI IN | INPUT | SDI | SDI | rear | -15.184, 0.85, -0.26 | -14.383999999999999, 0, -0.25999999999999984 |
| display:sdi-in | ตัวรับภาพจอสนาม SDI IN | INPUT | SDI | SDI | rear | 17.114, 1.28, 14.3 | 16.314, 0, 14.3 |

Wireless (no physical cable): tx ~RF~ rx. Network and capture software remain local simulation only.

### Signal and commissioning gates

| ID | Layer | Predicate label | Critical |
| --- | --- | --- | --- |
| installed | physical | ติดตั้งอุปกรณ์ที่จำเป็นครบจุด | true |
| powered | physical | อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง | true |
| channel-map | physical | สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก | true |
| pre-power-check | physical | ตรวจความพร้อม: แหล่งจ่ายที่ช่างเตรียมไว้ | true |
| pre-cable-route | physical | ตรวจความพร้อม: เส้นทางสายไม่กีดขวาง | true |
| pre-soundcheck | physical | ตรวจความพร้อม: ระดับเสียง | true |
| pre-storage | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| pre-sightlines | physical | ตรวจความพร้อม: ความปลอดภัยก่อนเริ่มงาน | true |
| cam-1 | signal | ภาพกล้อง 1 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-2 | signal | ภาพกล้อง 2 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-3 | signal | ภาพกล้อง 3 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-4 | signal | ภาพกล้อง 4 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-5 | signal | ภาพกล้อง 5 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| cam-6 | signal | ภาพกล้อง 6 ผ่านฐานและ Crosspoint ถึงเครื่องสลับภาพ | true |
| replay | signal | ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7 | true |
| gfx | signal | กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8 | true |
| audio-pa | signal | เสียงที่ถูกต้องถึง ระบบ PA | true |
| audio-sw | signal | เสียงที่ถูกต้องถึง ปลายทางรายการ | true |
| venue | signal | จอสนามได้รับภาพรายการสะอาดจาก AUX | true |
| record | delivery | เครื่องบันทึกได้รับภาพรายการและกำลังบันทึก | true |
| main | delivery | ผู้ชมรับภาพและเสียงผ่านเครือข่ายหลัก | true |
| backup | delivery | ผู้ชมสำรองรับภาพและเสียงผ่านเครือข่ายสำรอง | true |
| separate | delivery | สองชุดส่งใช้พอร์ตและเกตเวย์คนละเส้นทาง | true |
| clean-program | signal | เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview | true |
| framing | signal | จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย | false |
| cues | rehearsal | สลับภาพออกอากาศตามคิวครบ | true |
| no-black | rehearsal | ไม่มีภาพดำระหว่างซ้อมรายการ | true |
| recovered | delivery | วินิจฉัยและแก้ปัญหาที่เกิดในงาน | true |
| quiz | delivery | ตอบคำถามทบทวนก่อนตรวจรับ | false |
| signoff | delivery | ผู้เล่นตรวจรับระบบปัจจุบัน | true |

Preinstalled leads: None. Faults: None.

Success requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.
