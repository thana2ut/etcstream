# Venue scenario matrix

> สร้างอัตโนมัติจาก `game/training/venue-scenarios.ts` ด้วย `node scripts/generate-venue-docs.mjs` — อย่าแก้ไฟล์นี้ด้วยมือ
>
> สถานะ: เขียนจากข้อมูลฉากเท่านั้น **ยังไม่ได้ทดสอบหรือเล่นจริงใน runtime**

XS / S / M / L / XL คือ **ขนาดสถานที่ / ขนาดงาน Production** ไม่ใช่ระดับความยาก

| Scale | ภารกิจ | สถานที่ | คำอธิบายสถานที่ |
|---|---|---|---|
| XS | ห้องประตูแรกแห่งภาพ | ห้องเรียน | งานขนาดเล็ก ฝึกพื้นฐาน |
| S | สะพานจันทราแห่งเสียง | ห้องสตูดิโอ | งาน Production ในสตูดิโอ |
| M | หอคอยกระจกสลับภาพ | หอประชุมอาคารกิจกรรม | งานเวที / กิจกรรมขนาดกลาง |
| L | คลังผนึกพอร์ตโบราณ | พื้นที่ภายนอกอาคาร | งาน Outdoor และระยะสายไกล |
| XL | บัลลังก์จอมถ่ายทอด | สนามกีฬาและงานถ่ายทอดสด | งานขนาดใหญ่ Full Live Production |

กติกากลางทุกฉาก: OUTPUT → INPUT เท่านั้น; ปฏิเสธ OUTPUT→OUTPUT, INPUT→INPUT, หัวต่อผิด, ชนิดสัญญาณผิด, พอร์ตที่มีสายแล้ว และเส้นทางที่ไม่อยู่ในกราฟของฉาก — การเชื่อมที่ผิดจะแจ้งเตือนและไม่เปลี่ยน state

## xs-1 — ห้องประตูแรกแห่งภาพ · ระดับ 1 · เส้นทางภาพ · Video Path

- **Venue:** XS — ห้องเรียน (งานขนาดเล็ก ฝึกพื้นฐาน)
- **Level:** 1
- **Learning goal:** Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Classroom Projector / TV | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:pgm-hdmi-out2 | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |

**Required actions (สถานะจำลอง)**

- ไม่มี

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง

## xs-2 — ห้องประตูแรกแห่งภาพ · ระดับ 2 · เส้นทางเสียง · Audio Path

- **Venue:** XS — ห้องเรียน (งานขนาดเล็ก ฝึกพื้นฐาน)
- **Level:** 2
- **Learning goal:** Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mix | Small 4-channel Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mix-program, wireless-pair

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง

## xs-3 — ห้องประตูแรกแห่งภาพ · ระดับ 3 · สลับภาพและตรวจสัญญาณ

- **Venue:** XS — ห้องเรียน (งานขนาดเล็ก ฝึกพื้นฐาน)
- **Level:** 3
- **Learning goal:** Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Classroom Projector / TV | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:pgm-hdmi-out2 | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |

**Required actions (สถานะจำลอง)**

- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-1, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง

## xs-4 — ห้องประตูแรกแห่งภาพ · ระดับ 4 · พอร์ตและการแก้ปัญหา

- **Venue:** XS — ห้องเรียน (งานขนาดเล็ก ฝึกพื้นฐาน)
- **Level:** 4
- **Learning goal:** Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mix | Small 4-channel Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Classroom Projector / TV | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:pgm-hdmi-out2 | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | HDMI → HDMI | VIDEO_HDMI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, lav-1, rx-mix, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-1, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน; สายสำรอง (HDMI, USB-A, USB-C, XLR-F, 3.5mm, 6.35mm, SDI) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ต่อไว้แล้ว 5 เส้น (บางช่วงถูกถอดออก)
- มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION
- Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง
- Capture / OBS จำลองยังไม่พร้อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง

## xs-5 — ห้องประตูแรกแห่งภาพ · ระดับ 5 · ระบบ Production ครบเส้นทาง

- **Venue:** XS — ห้องเรียน (งานขนาดเล็ก ฝึกพื้นฐาน)
- **Level:** 5
- **Learning goal:** Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mix | Small 4-channel Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Classroom Projector / TV | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:pgm-hdmi-out2 | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | HDMI → HDMI | VIDEO_HDMI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, lav-1, rx-mix, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-1, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง

## s-1 — สะพานจันทราแห่งเสียง · ระดับ 1 · เส้นทางภาพ · Video Path

- **Venue:** S — ห้องสตูดิโอ (งาน Production ในสตูดิโอ)
- **Level:** 1
- **Learning goal:** Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | fixed |
| cam1 | Camera 1 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam2 | Camera 2 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam3 | Camera 3 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | HDMI → HDMI | VIDEO_HDMI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |

**Required actions (สถานะจำลอง)**

- ไม่มี

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Camera transport: HDMI ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง
- COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน
- PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน

## s-2 — สะพานจันทราแห่งเสียง · ระดับ 2 · เส้นทางเสียง · Audio Path

- **Venue:** S — ห้องสตูดิโอ (งาน Production ในสตูดิโอ)
- **Level:** 2
- **Learning goal:** Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | fixed |
| mix | PMX-402D-USB chassis | CONFIRMED | PMX-402D-USB chassis | fixed |
| rx | Wireless Receiver | PROVISIONAL | COMICA CVM-WM100 PLUS family / Saramonic · รอยืนยัน | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |
| lav2 | Lavalier 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx2 | Wireless TX 2 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| lav-2 | lav2:audio-out | tx2:mic-in | lead-lav-2 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1, lav-2
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, lav-2, rx-mix, mix-program, wireless-pair

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Camera transport: HDMI ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง
- COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน
- PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน

## s-3 — สะพานจันทราแห่งเสียง · ระดับ 3 · สลับภาพและตรวจสัญญาณ

- **Venue:** S — ห้องสตูดิโอ (งาน Production ในสตูดิโอ)
- **Level:** 3
- **Learning goal:** Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | fixed |
| cam1 | Camera 1 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam2 | Camera 2 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam3 | Camera 3 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | HDMI → HDMI | VIDEO_HDMI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |

**Required actions (สถานะจำลอง)**

- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Camera transport: HDMI ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง
- COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน
- PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน

## s-4 — สะพานจันทราแห่งเสียง · ระดับ 4 · พอร์ตและการแก้ปัญหา

- **Venue:** S — ห้องสตูดิโอ (งาน Production ในสตูดิโอ)
- **Level:** 4
- **Learning goal:** Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | fixed |
| mix | PMX-402D-USB chassis | CONFIRMED | PMX-402D-USB chassis | fixed |
| cam1 | Camera 1 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam2 | Camera 2 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam3 | Camera 3 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | PROVISIONAL | COMICA CVM-WM100 PLUS family / Saramonic · รอยืนยัน | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |
| lav2 | Lavalier 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx2 | Wireless TX 2 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |
| capture | Capture Card | UNKNOWN | Capture Card · รุ่นยังไม่ยืนยัน | movable |
| pc | HP Notebook / OBS | PROVISIONAL | HP 15.6-inch ตามภาพอ้างอิง · SKU รอยืนยัน | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | HDMI → HDMI | VIDEO_HDMI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| lav-2 | lav2:audio-out | tx2:mic-in | lead-lav-2 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | HDMI → HDMI | VIDEO_HDMI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1, lav-2
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, lav-2, rx-mix, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, cam-2, cam-3, lav-1, lav-2, rx-mix, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน; สายสำรอง (HDMI, USB-A, USB-C, XLR-F, 3.5mm, 6.35mm, SDI) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ต่อไว้แล้ว 6 เส้น (บางช่วงถูกถอดออก)
- มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION
- Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง
- Capture / OBS จำลองยังไม่พร้อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Camera transport: HDMI ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง
- COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน
- PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน

## s-5 — สะพานจันทราแห่งเสียง · ระดับ 5 · ระบบ Production ครบเส้นทาง

- **Venue:** S — ห้องสตูดิโอ (งาน Production ในสตูดิโอ)
- **Level:** 5
- **Learning goal:** Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | fixed |
| mix | PMX-402D-USB chassis | CONFIRMED | PMX-402D-USB chassis | fixed |
| cam1 | Camera 1 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam2 | Camera 2 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| cam3 | Camera 3 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | PROVISIONAL | COMICA CVM-WM100 PLUS family / Saramonic · รอยืนยัน | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |
| lav2 | Lavalier 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx2 | Wireless TX 2 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | movable |
| capture | Capture Card | UNKNOWN | Capture Card · รุ่นยังไม่ยืนยัน | movable |
| pc | HP Notebook / OBS | PROVISIONAL | HP 15.6-inch ตามภาพอ้างอิง · SKU รอยืนยัน | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | HDMI → HDMI | VIDEO_HDMI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | HDMI → HDMI | VIDEO_HDMI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | HDMI → HDMI | VIDEO_HDMI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| lav-2 | lav2:audio-out | tx2:mic-in | lead-lav-2 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | 3.5mm → 6.35mm | AUDIO_ANALOG |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | 6.35mm → 3.5mm | AUDIO_ANALOG |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | HDMI → HDMI | VIDEO_HDMI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1, lav-2
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, lav-2, rx-mix, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, cam-2, cam-3, lav-1, lav-2, rx-mix, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Camera transport: HDMI ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง
- COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน
- PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน

## m-1 — หอคอยกระจกสลับภาพ · ระดับ 1 · เส้นทางภาพ · Video Path

- **Venue:** M — หอประชุมอาคารกิจกรรม (งานเวที / กิจกรรมขนาดกลาง)
- **Level:** 1
- **Learning goal:** Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Camera 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Camera 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | PTZ 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| cam-4 | cam4:video-out | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |

**Required actions (สถานะจำลอง)**

- ไม่มี

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol

## m-2 — หอคอยกระจกสลับภาพ · ระดับ 2 · เส้นทางเสียง · Audio Path

- **Venue:** M — หอประชุมอาคารกิจกรรม (งานเวที / กิจกรรมขนาดกลาง)
- **Level:** 2
- **Learning goal:** Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| stagebox | Analog XLR Stagebox | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Podium Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Handheld Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| stage-in0 | rx:xlr-out | stagebox:input0 | lead-stage-in0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out0 | stagebox:output0 | mix:input0 | lead-stage-out0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in1 | mic1:xlr-out | stagebox:input1 | lead-stage-in1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out1 | stagebox:output1 | mix:input1 | lead-stage-out1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in2 | mic2:xlr-out | stagebox:input2 | lead-stage-in2 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out2 | stagebox:output2 | mix:input2 | lead-stage-out2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, stage-in0, stage-out0, stage-in1, stage-out1, stage-in2, stage-out2, mix-program, wireless-pair

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol

## m-3 — หอคอยกระจกสลับภาพ · ระดับ 3 · สลับภาพและตรวจสัญญาณ

- **Venue:** M — หอประชุมอาคารกิจกรรม (งานเวที / กิจกรรมขนาดกลาง)
- **Level:** 3
- **Learning goal:** Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Camera 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Camera 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | PTZ 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | LED Program Screen | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| cam-4 | cam4:video-out | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | SDI → SDI | VIDEO_SDI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-4, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-4, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-4, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol

## m-4 — หอคอยกระจกสลับภาพ · ระดับ 4 · พอร์ตและการแก้ปัญหา

- **Venue:** M — หอประชุมอาคารกิจกรรม (งานเวที / กิจกรรมขนาดกลาง)
- **Level:** 4
- **Learning goal:** Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Camera 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Camera 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | PTZ 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | LED Program Screen | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| stagebox | Analog XLR Stagebox | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Podium Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Handheld Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| cam-4 | cam4:video-out | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| stage-in0 | rx:xlr-out | stagebox:input0 | lead-stage-in0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out0 | stagebox:output0 | mix:input0 | lead-stage-out0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in1 | mic1:xlr-out | stagebox:input1 | lead-stage-in1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out1 | stagebox:output1 | mix:input1 | lead-stage-out1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in2 | mic2:xlr-out | stagebox:input2 | lead-stage-in2 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out2 | stagebox:output2 | mix:input2 | lead-stage-out2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | SDI → SDI | VIDEO_SDI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, stage-in0, stage-out0, stage-in1, stage-out1, stage-in2, stage-out2, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, lav-1, stage-in0, stage-out0, stage-in1, stage-out1, stage-in2, stage-out2, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-4, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-4, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-4, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน; สายสำรอง (HDMI, USB-A, USB-C, XLR-F, 3.5mm, 6.35mm, SDI) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ต่อไว้แล้ว 11 เส้น (บางช่วงถูกถอดออก)
- มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION
- Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง
- Capture / OBS จำลองยังไม่พร้อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol

## m-5 — หอคอยกระจกสลับภาพ · ระดับ 5 · ระบบ Production ครบเส้นทาง

- **Venue:** M — หอประชุมอาคารกิจกรรม (งานเวที / กิจกรรมขนาดกลาง)
- **Level:** 5
- **Learning goal:** Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Camera 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Camera 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | PTZ 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | LED Program Screen | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| stagebox | Analog XLR Stagebox | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Podium Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Handheld Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| cam-1 | cam1:video-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| cam-4 | cam4:video-out | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| slides | slides:hdmi-out | sw:presentation-in | lead-slides | HDMI → HDMI | VIDEO_HDMI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| stage-in0 | rx:xlr-out | stagebox:input0 | lead-stage-in0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out0 | stagebox:output0 | mix:input0 | lead-stage-out0 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in1 | mic1:xlr-out | stagebox:input1 | lead-stage-in1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out1 | stagebox:output1 | mix:input1 | lead-stage-out1 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-in2 | mic2:xlr-out | stagebox:input2 | lead-stage-in2 | XLR-F → XLR-M | AUDIO_BALANCED |
| stage-out2 | stagebox:output2 | mix:input2 | lead-stage-out2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-capture | sw:pgm-out | capture:video-in | lead-program-capture | SDI → SDI | VIDEO_SDI |
| capture-pc | capture:usb-out | pc:usb-in | lead-capture-pc | USB-C → USB-A | USB_DATA |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, stage-in0, stage-out0, stage-in1, stage-out1, stage-in2, stage-out2, mix-program, wireless-pair
- `obs-ready` — OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, lav-1, stage-in0, stage-out0, stage-in1, stage-out1, stage-in2, stage-out2, mix-program, mix-ready, program-capture, capture-pc
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: cam-2, cam-3, cam-4, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: cam-1, cam-3, cam-4, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: cam-1, cam-2, cam-4, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, monitor
- `select-slides` — เลือก Program: Presentation Laptop; ต้องครบก่อน: cam-1, cam-2, cam-3, cam-4, slides, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol

## l-1 — คลังผนึกพอร์ตโบราณ · ระดับ 1 · เส้นทางภาพ · Video Path

- **Venue:** L — พื้นที่ภายนอกอาคาร (งาน Outdoor และระยะสายไกล)
- **Level:** 1
- **Learning goal:** Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Field / ENG 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| fiber-tx | SDI Fiber TX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| fiber-rx | SDI Fiber RX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam2 | Field / ENG 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Field / ENG 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| field-tx | cam1:sdi-out | fiber-tx:sdi-in | lead-field-tx | SDI → SDI | VIDEO_SDI |
| fiber-link | fiber-tx:fiber-out | fiber-rx:fiber-in | lead-fiber-link | FIBER → FIBER | FIBER_VIDEO |
| cam-1 | fiber-rx:sdi-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |

**Required actions (สถานะจำลอง)**

- ไม่มี

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## l-2 — คลังผนึกพอร์ตโบราณ · ระดับ 2 · เส้นทางเสียง · Audio Path

- **Venue:** L — พื้นที่ภายนอกอาคาร (งาน Outdoor และระยะสายไกล)
- **Level:** 2
- **Learning goal:** Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Field Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Shotgun Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Ambient Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mix-program, wireless-pair

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## l-3 — คลังผนึกพอร์ตโบราณ · ระดับ 3 · สลับภาพและตรวจสัญญาณ

- **Venue:** L — พื้นที่ภายนอกอาคาร (งาน Outdoor และระยะสายไกล)
- **Level:** 3
- **Learning goal:** Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Field / ENG 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| fiber-tx | SDI Fiber TX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| fiber-rx | SDI Fiber RX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam2 | Field / ENG 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Field / ENG 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| field-tx | cam1:sdi-out | fiber-tx:sdi-in | lead-field-tx | SDI → SDI | VIDEO_SDI |
| fiber-link | fiber-tx:fiber-out | fiber-rx:fiber-in | lead-fiber-link | FIBER → FIBER | FIBER_VIDEO |
| cam-1 | fiber-rx:sdi-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |

**Required actions (สถานะจำลอง)**

- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: field-tx, fiber-link, cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## l-4 — คลังผนึกพอร์ตโบราณ · ระดับ 4 · พอร์ตและการแก้ปัญหา

- **Venue:** L — พื้นที่ภายนอกอาคาร (งาน Outdoor และระยะสายไกล)
- **Level:** 4
- **Learning goal:** Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Field Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Field / ENG 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| fiber-tx | SDI Fiber TX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| fiber-rx | SDI Fiber RX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam2 | Field / ENG 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Field / ENG 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Shotgun Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Ambient Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| network | 4G / 5G Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| field-tx | cam1:sdi-out | fiber-tx:sdi-in | lead-field-tx | SDI → SDI | VIDEO_SDI |
| fiber-link | fiber-tx:fiber-out | fiber-rx:fiber-in | lead-fiber-link | FIBER → FIBER | FIBER_VIDEO |
| cam-1 | fiber-rx:sdi-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-encode | sw:pgm-out | encoder:sdi-in | lead-program-encode | SDI → SDI | VIDEO_SDI |
| network | encoder:network-out | network:lan-in | lead-network | ETHERNET → ETHERNET | NETWORK |
| destination | network:wan-out | live:network-in | lead-destination | ETHERNET → ETHERNET | NETWORK |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mix-program, wireless-pair
- `network-ready` — ตรวจเครือข่ายจำลอง / คืนการเชื่อมต่อ; ต้องครบก่อน: network, destination
- `encoder-ready` — เริ่ม Encoder จำลองและตรวจ Program; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-2, cam-3, lav-1, rx-mix, mic-0, mic-1, mix-program, mix-ready, program-encode, network-ready
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: field-tx, fiber-link, cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน; สายสำรอง (HDMI, USB-A, USB-C, XLR-F, 3.5mm, 6.35mm, SDI) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ต่อไว้แล้ว 9 เส้น (บางช่วงถูกถอดออก)
- มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION
- Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง
- Encoder / เครือข่ายจำลองยังไม่พร้อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## l-5 — คลังผนึกพอร์ตโบราณ · ระดับ 5 · ระบบ Production ครบเส้นทาง

- **Venue:** L — พื้นที่ภายนอกอาคาร (งาน Outdoor และระยะสายไกล)
- **Level:** 5
- **Learning goal:** Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Field Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Field / ENG 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| fiber-tx | SDI Fiber TX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| fiber-rx | SDI Fiber RX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| cam2 | Field / ENG 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Field / ENG 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Shotgun Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Ambient Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| network | 4G / 5G Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| field-tx | cam1:sdi-out | fiber-tx:sdi-in | lead-field-tx | SDI → SDI | VIDEO_SDI |
| fiber-link | fiber-tx:fiber-out | fiber-rx:fiber-in | lead-fiber-link | FIBER → FIBER | FIBER_VIDEO |
| cam-1 | fiber-rx:sdi-out | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| cam-2 | cam2:video-out | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| cam-3 | cam3:video-out | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-encode | sw:pgm-out | encoder:sdi-in | lead-program-encode | SDI → SDI | VIDEO_SDI |
| network | encoder:network-out | network:lan-in | lead-network | ETHERNET → ETHERNET | NETWORK |
| destination | network:wan-out | live:network-in | lead-destination | ETHERNET → ETHERNET | NETWORK |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mix-program, wireless-pair
- `network-ready` — ตรวจเครือข่ายจำลอง / คืนการเชื่อมต่อ; ต้องครบก่อน: network, destination
- `encoder-ready` — เริ่ม Encoder จำลองและตรวจ Program; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-2, cam-3, lav-1, rx-mix, mic-0, mic-1, mix-program, mix-ready, program-encode, network-ready
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: field-tx, fiber-link, cam-2, cam-3, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-3, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: field-tx, fiber-link, cam-1, cam-2, cam-3, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## xl-1 — บัลลังก์จอมถ่ายทอด · ระดับ 1 · เส้นทางภาพ · Video Path

- **Venue:** XL — สนามกีฬาและงานถ่ายทอดสด (งานขนาดใหญ่ Full Live Production)
- **Level:** 1
- **Learning goal:** Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| ccu | Fiber Base Station / CCU rack | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| router | SDI Video Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Broadcast 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Broadcast 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Broadcast 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | Broadcast 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam5 | Long-lens Camera 5 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam6 | Field Camera 6 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Wall | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| fiber-1 | cam1:fiber-out | ccu:fiber-in1 | lead-fiber-1 | FIBER → FIBER | FIBER_VIDEO |
| ccu-1 | ccu:sdi-out1 | router:input1 | lead-ccu-1 | SDI → SDI | VIDEO_SDI |
| cam-1 | router:output1 | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| fiber-2 | cam2:fiber-out | ccu:fiber-in2 | lead-fiber-2 | FIBER → FIBER | FIBER_VIDEO |
| ccu-2 | ccu:sdi-out2 | router:input2 | lead-ccu-2 | SDI → SDI | VIDEO_SDI |
| cam-2 | router:output2 | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| fiber-3 | cam3:fiber-out | ccu:fiber-in3 | lead-fiber-3 | FIBER → FIBER | FIBER_VIDEO |
| ccu-3 | ccu:sdi-out3 | router:input3 | lead-ccu-3 | SDI → SDI | VIDEO_SDI |
| cam-3 | router:output3 | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| fiber-4 | cam4:fiber-out | ccu:fiber-in4 | lead-fiber-4 | FIBER → FIBER | FIBER_VIDEO |
| ccu-4 | ccu:sdi-out4 | router:input4 | lead-ccu-4 | SDI → SDI | VIDEO_SDI |
| cam-4 | router:output4 | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| fiber-5 | cam5:fiber-out | ccu:fiber-in5 | lead-fiber-5 | FIBER → FIBER | FIBER_VIDEO |
| ccu-5 | ccu:sdi-out5 | router:input5 | lead-ccu-5 | SDI → SDI | VIDEO_SDI |
| cam-5 | router:output5 | sw:input5 | lead-cam-5 | SDI → SDI | VIDEO_SDI |
| fiber-6 | cam6:fiber-out | ccu:fiber-in6 | lead-fiber-6 | FIBER → FIBER | FIBER_VIDEO |
| ccu-6 | ccu:sdi-out6 | router:input6 | lead-ccu-6 | SDI → SDI | VIDEO_SDI |
| cam-6 | router:output6 | sw:input6 | lead-cam-6 | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |

**Required actions (สถานะจำลอง)**

- ไม่มี

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## xl-2 — บัลลังก์จอมถ่ายทอด · ระดับ 2 · เส้นทางเสียง · Audio Path

- **Venue:** XL — สนามกีฬาและงานถ่ายทอดสด (งานขนาดใหญ่ Full Live Production)
- **Level:** 2
- **Learning goal:** Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Console | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Commentator Mic 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Commentator Mic 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Crowd Mic L | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic3 | Crowd Mic R | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic4 | Field Mic | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-2 | mic2:xlr-out | mix:input4 | lead-mic-2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-3 | mic3:xlr-out | mix:input5 | lead-mic-3 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-4 | mic4:xlr-out | mix:input6 | lead-mic-4 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mic-2, mic-3, mic-4, mix-program, wireless-pair

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## xl-3 — บัลลังก์จอมถ่ายทอด · ระดับ 3 · สลับภาพและตรวจสัญญาณ

- **Venue:** XL — สนามกีฬาและงานถ่ายทอดสด (งานขนาดใหญ่ Full Live Production)
- **Level:** 3
- **Learning goal:** Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| ccu | Fiber Base Station / CCU rack | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| router | SDI Video Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Broadcast 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Broadcast 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Broadcast 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | Broadcast 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam5 | Long-lens Camera 5 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam6 | Field Camera 6 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| replay | Replay Server | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| graphics | Graphics Workstation | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| preview | Preview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Wall | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | Venue Display | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| fiber-1 | cam1:fiber-out | ccu:fiber-in1 | lead-fiber-1 | FIBER → FIBER | FIBER_VIDEO |
| ccu-1 | ccu:sdi-out1 | router:input1 | lead-ccu-1 | SDI → SDI | VIDEO_SDI |
| cam-1 | router:output1 | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| fiber-2 | cam2:fiber-out | ccu:fiber-in2 | lead-fiber-2 | FIBER → FIBER | FIBER_VIDEO |
| ccu-2 | ccu:sdi-out2 | router:input2 | lead-ccu-2 | SDI → SDI | VIDEO_SDI |
| cam-2 | router:output2 | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| fiber-3 | cam3:fiber-out | ccu:fiber-in3 | lead-fiber-3 | FIBER → FIBER | FIBER_VIDEO |
| ccu-3 | ccu:sdi-out3 | router:input3 | lead-ccu-3 | SDI → SDI | VIDEO_SDI |
| cam-3 | router:output3 | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| fiber-4 | cam4:fiber-out | ccu:fiber-in4 | lead-fiber-4 | FIBER → FIBER | FIBER_VIDEO |
| ccu-4 | ccu:sdi-out4 | router:input4 | lead-ccu-4 | SDI → SDI | VIDEO_SDI |
| cam-4 | router:output4 | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| fiber-5 | cam5:fiber-out | ccu:fiber-in5 | lead-fiber-5 | FIBER → FIBER | FIBER_VIDEO |
| ccu-5 | ccu:sdi-out5 | router:input5 | lead-ccu-5 | SDI → SDI | VIDEO_SDI |
| cam-5 | router:output5 | sw:input5 | lead-cam-5 | SDI → SDI | VIDEO_SDI |
| fiber-6 | cam6:fiber-out | ccu:fiber-in6 | lead-fiber-6 | FIBER → FIBER | FIBER_VIDEO |
| ccu-6 | ccu:sdi-out6 | router:input6 | lead-ccu-6 | SDI → SDI | VIDEO_SDI |
| cam-6 | router:output6 | sw:input6 | lead-cam-6 | SDI → SDI | VIDEO_SDI |
| replay | replay:sdi-out | sw:replay-in | lead-replay | SDI → SDI | VIDEO_SDI |
| graphics | graphics:sdi-out | sw:graphics-in | lead-graphics | SDI → SDI | VIDEO_SDI |
| preview | sw:preview-out | preview:sdi-in | lead-preview | SDI → SDI | VIDEO_SDI |
| replay-record | sw:record-out | replay:record-in | lead-replay-record | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |

**Required actions (สถานะจำลอง)**

- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: fiber-1, ccu-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-4, monitor
- `select-cam-5` — เลือก Program: Camera 5; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, fiber-6, ccu-6, cam-6, cam-5, monitor
- `select-cam-6` — เลือก Program: Camera 6; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, monitor
- `select-replay` — เลือก Program: Replay Server; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, replay, monitor
- `select-graphics` — เลือก Program: Graphics Workstation; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, graphics, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## xl-4 — บัลลังก์จอมถ่ายทอด · ระดับ 4 · พอร์ตและการแก้ปัญหา

- **Venue:** XL — สนามกีฬาและงานถ่ายทอดสด (งานขนาดใหญ่ Full Live Production)
- **Level:** 4
- **Learning goal:** Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Console | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| ccu | Fiber Base Station / CCU rack | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| router | SDI Video Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Broadcast 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Broadcast 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Broadcast 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | Broadcast 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam5 | Long-lens Camera 5 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam6 | Field Camera 6 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| replay | Replay Server | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| graphics | Graphics Workstation | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| preview | Preview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Wall | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | Venue Display | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Commentator Mic 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Commentator Mic 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Crowd Mic L | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic3 | Crowd Mic R | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic4 | Field Mic | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| network | Primary Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| backup | Backup Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| backup-net | Backup Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| fiber-1 | cam1:fiber-out | ccu:fiber-in1 | lead-fiber-1 | FIBER → FIBER | FIBER_VIDEO |
| ccu-1 | ccu:sdi-out1 | router:input1 | lead-ccu-1 | SDI → SDI | VIDEO_SDI |
| cam-1 | router:output1 | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| fiber-2 | cam2:fiber-out | ccu:fiber-in2 | lead-fiber-2 | FIBER → FIBER | FIBER_VIDEO |
| ccu-2 | ccu:sdi-out2 | router:input2 | lead-ccu-2 | SDI → SDI | VIDEO_SDI |
| cam-2 | router:output2 | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| fiber-3 | cam3:fiber-out | ccu:fiber-in3 | lead-fiber-3 | FIBER → FIBER | FIBER_VIDEO |
| ccu-3 | ccu:sdi-out3 | router:input3 | lead-ccu-3 | SDI → SDI | VIDEO_SDI |
| cam-3 | router:output3 | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| fiber-4 | cam4:fiber-out | ccu:fiber-in4 | lead-fiber-4 | FIBER → FIBER | FIBER_VIDEO |
| ccu-4 | ccu:sdi-out4 | router:input4 | lead-ccu-4 | SDI → SDI | VIDEO_SDI |
| cam-4 | router:output4 | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| fiber-5 | cam5:fiber-out | ccu:fiber-in5 | lead-fiber-5 | FIBER → FIBER | FIBER_VIDEO |
| ccu-5 | ccu:sdi-out5 | router:input5 | lead-ccu-5 | SDI → SDI | VIDEO_SDI |
| cam-5 | router:output5 | sw:input5 | lead-cam-5 | SDI → SDI | VIDEO_SDI |
| fiber-6 | cam6:fiber-out | ccu:fiber-in6 | lead-fiber-6 | FIBER → FIBER | FIBER_VIDEO |
| ccu-6 | ccu:sdi-out6 | router:input6 | lead-ccu-6 | SDI → SDI | VIDEO_SDI |
| cam-6 | router:output6 | sw:input6 | lead-cam-6 | SDI → SDI | VIDEO_SDI |
| replay | replay:sdi-out | sw:replay-in | lead-replay | SDI → SDI | VIDEO_SDI |
| graphics | graphics:sdi-out | sw:graphics-in | lead-graphics | SDI → SDI | VIDEO_SDI |
| preview | sw:preview-out | preview:sdi-in | lead-preview | SDI → SDI | VIDEO_SDI |
| replay-record | sw:record-out | replay:record-in | lead-replay-record | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-2 | mic2:xlr-out | mix:input4 | lead-mic-2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-3 | mic3:xlr-out | mix:input5 | lead-mic-3 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-4 | mic4:xlr-out | mix:input6 | lead-mic-4 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-encode | sw:pgm-out | encoder:sdi-in | lead-program-encode | SDI → SDI | VIDEO_SDI |
| network | encoder:network-out | network:lan-in | lead-network | ETHERNET → ETHERNET | NETWORK |
| destination | network:wan-out | live:network-in | lead-destination | ETHERNET → ETHERNET | NETWORK |
| backup-encode | sw:backup-pgm-out | backup:sdi-in | lead-backup-encode | SDI → SDI | VIDEO_SDI |
| backup-network | backup:network-out | backup-net:lan-in | lead-backup-network | ETHERNET → ETHERNET | NETWORK |
| backup-live | backup-net:wan-out | live:backup-in | lead-backup-live | ETHERNET → ETHERNET | NETWORK |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mic-2, mic-3, mic-4, mix-program, wireless-pair
- `network-ready` — ตรวจเครือข่ายจำลอง / คืนการเชื่อมต่อ; ต้องครบก่อน: network, destination
- `encoder-ready` — เริ่ม Encoder จำลองและตรวจ Program; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, lav-1, rx-mix, mic-0, mic-1, mic-2, mic-3, mic-4, mix-program, mix-ready, program-encode, network-ready
- `backup-ready` — ตรวจเส้นทางสำรองจำลอง; ต้องครบก่อน: encoder-ready, backup-encode, backup-network, backup-live
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: fiber-1, ccu-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-4, monitor
- `select-cam-5` — เลือก Program: Camera 5; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, fiber-6, ccu-6, cam-6, cam-5, monitor
- `select-cam-6` — เลือก Program: Camera 6; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, monitor
- `select-replay` — เลือก Program: Replay Server; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, replay, monitor
- `select-graphics` — เลือก Program: Graphics Workstation; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, graphics, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน; สายสำรอง (HDMI, USB-A, USB-C, XLR-F, 3.5mm, 6.35mm, SDI) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ต่อไว้แล้ว 25 เส้น (บางช่วงถูกถอดออก)
- มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION
- Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง
- Encoder / เครือข่ายจำลองยังไม่พร้อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

## xl-5 — บัลลังก์จอมถ่ายทอด · ระดับ 5 · ระบบ Production ครบเส้นทาง

- **Venue:** XL — สนามกีฬาและงานถ่ายทอดสด (งานขนาดใหญ่ Full Live Production)
- **Level:** 5
- **Learning goal:** Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
| sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mix | Digital Audio Console | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| ccu | Fiber Base Station / CCU rack | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| router | SDI Video Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam1 | Broadcast 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam2 | Broadcast 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam3 | Broadcast 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam4 | Broadcast 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam5 | Long-lens Camera 5 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| cam6 | Field Camera 6 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| replay | Replay Server | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| graphics | Graphics Workstation | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| preview | Preview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| monitor | Multiview Wall | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| display | Venue Display | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | movable |
| mic0 | Commentator Mic 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic1 | Commentator Mic 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic2 | Crowd Mic L | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic3 | Crowd Mic R | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| mic4 | Field Mic | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| network | Primary Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| backup | Backup Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |
| backup-net | Backup Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | fixed |

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
| fiber-1 | cam1:fiber-out | ccu:fiber-in1 | lead-fiber-1 | FIBER → FIBER | FIBER_VIDEO |
| ccu-1 | ccu:sdi-out1 | router:input1 | lead-ccu-1 | SDI → SDI | VIDEO_SDI |
| cam-1 | router:output1 | sw:input1 | lead-cam-1 | SDI → SDI | VIDEO_SDI |
| fiber-2 | cam2:fiber-out | ccu:fiber-in2 | lead-fiber-2 | FIBER → FIBER | FIBER_VIDEO |
| ccu-2 | ccu:sdi-out2 | router:input2 | lead-ccu-2 | SDI → SDI | VIDEO_SDI |
| cam-2 | router:output2 | sw:input2 | lead-cam-2 | SDI → SDI | VIDEO_SDI |
| fiber-3 | cam3:fiber-out | ccu:fiber-in3 | lead-fiber-3 | FIBER → FIBER | FIBER_VIDEO |
| ccu-3 | ccu:sdi-out3 | router:input3 | lead-ccu-3 | SDI → SDI | VIDEO_SDI |
| cam-3 | router:output3 | sw:input3 | lead-cam-3 | SDI → SDI | VIDEO_SDI |
| fiber-4 | cam4:fiber-out | ccu:fiber-in4 | lead-fiber-4 | FIBER → FIBER | FIBER_VIDEO |
| ccu-4 | ccu:sdi-out4 | router:input4 | lead-ccu-4 | SDI → SDI | VIDEO_SDI |
| cam-4 | router:output4 | sw:input4 | lead-cam-4 | SDI → SDI | VIDEO_SDI |
| fiber-5 | cam5:fiber-out | ccu:fiber-in5 | lead-fiber-5 | FIBER → FIBER | FIBER_VIDEO |
| ccu-5 | ccu:sdi-out5 | router:input5 | lead-ccu-5 | SDI → SDI | VIDEO_SDI |
| cam-5 | router:output5 | sw:input5 | lead-cam-5 | SDI → SDI | VIDEO_SDI |
| fiber-6 | cam6:fiber-out | ccu:fiber-in6 | lead-fiber-6 | FIBER → FIBER | FIBER_VIDEO |
| ccu-6 | ccu:sdi-out6 | router:input6 | lead-ccu-6 | SDI → SDI | VIDEO_SDI |
| cam-6 | router:output6 | sw:input6 | lead-cam-6 | SDI → SDI | VIDEO_SDI |
| replay | replay:sdi-out | sw:replay-in | lead-replay | SDI → SDI | VIDEO_SDI |
| graphics | graphics:sdi-out | sw:graphics-in | lead-graphics | SDI → SDI | VIDEO_SDI |
| preview | sw:preview-out | preview:sdi-in | lead-preview | SDI → SDI | VIDEO_SDI |
| replay-record | sw:record-out | replay:record-in | lead-replay-record | SDI → SDI | VIDEO_SDI |
| monitor | sw:multiview-out | monitor:video-in | lead-monitor | SDI → SDI | VIDEO_SDI |
| display | sw:aux-out | display:sdi-in | lead-display | SDI → SDI | VIDEO_SDI |
| lav-1 | lav1:audio-out | tx1:mic-in | lead-lav-1 | 3.5mm → 3.5mm | AUDIO_ANALOG |
| rx-mix | rx:audio-out | mix:input1 | lead-rx-mix | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-0 | mic0:xlr-out | mix:input2 | lead-mic-0 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-1 | mic1:xlr-out | mix:input3 | lead-mic-1 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-2 | mic2:xlr-out | mix:input4 | lead-mic-2 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-3 | mic3:xlr-out | mix:input5 | lead-mic-3 | XLR-F → XLR-M | AUDIO_BALANCED |
| mic-4 | mic4:xlr-out | mix:input6 | lead-mic-4 | XLR-F → XLR-M | AUDIO_BALANCED |
| mix-program | mix:program-out | sw:audio-in | lead-mix-program | XLR-F → XLR-M | AUDIO_BALANCED |
| program-encode | sw:pgm-out | encoder:sdi-in | lead-program-encode | SDI → SDI | VIDEO_SDI |
| network | encoder:network-out | network:lan-in | lead-network | ETHERNET → ETHERNET | NETWORK |
| destination | network:wan-out | live:network-in | lead-destination | ETHERNET → ETHERNET | NETWORK |
| backup-encode | sw:backup-pgm-out | backup:sdi-in | lead-backup-encode | SDI → SDI | VIDEO_SDI |
| backup-network | backup:network-out | backup-net:lan-in | lead-backup-network | ETHERNET → ETHERNET | NETWORK |
| backup-live | backup-net:wan-out | live:backup-in | lead-backup-live | ETHERNET → ETHERNET | NETWORK |

**Required actions (สถานะจำลอง)**

- `wireless-pair` — จับคู่ TX / RX จำลอง; ต้องครบก่อน: lav-1
- `mix-ready` — ตั้ง Gain / Fader และยกเลิก Mute; ต้องครบก่อน: lav-1, rx-mix, mic-0, mic-1, mic-2, mic-3, mic-4, mix-program, wireless-pair
- `network-ready` — ตรวจเครือข่ายจำลอง / คืนการเชื่อมต่อ; ต้องครบก่อน: network, destination
- `encoder-ready` — เริ่ม Encoder จำลองและตรวจ Program; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, lav-1, rx-mix, mic-0, mic-1, mic-2, mic-3, mic-4, mix-program, mix-ready, program-encode, network-ready
- `backup-ready` — ตรวจเส้นทางสำรองจำลอง; ต้องครบก่อน: encoder-ready, backup-encode, backup-network, backup-live
- `select-cam-1` — เลือก Program: Camera 1; ต้องครบก่อน: fiber-1, ccu-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-1, monitor
- `select-cam-2` — เลือก Program: Camera 2; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-2, monitor
- `select-cam-3` — เลือก Program: Camera 3; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-3, monitor
- `select-cam-4` — เลือก Program: Camera 4; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, cam-4, monitor
- `select-cam-5` — เลือก Program: Camera 5; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, fiber-6, ccu-6, cam-6, cam-5, monitor
- `select-cam-6` — เลือก Program: Camera 6; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, monitor
- `select-replay` — เลือก Program: Replay Server; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, replay, monitor
- `select-graphics` — เลือก Program: Graphics Workstation; ต้องครบก่อน: fiber-1, ccu-1, cam-1, fiber-2, ccu-2, cam-2, fiber-3, ccu-3, cam-3, fiber-4, ccu-4, cam-4, fiber-5, ccu-5, cam-5, fiber-6, ccu-6, cam-6, graphics, monitor

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (`isComplete`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** เริ่มด้วยสายยังไม่เชื่อม

**Provisional assumptions**

- อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย
- OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง
- ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power

