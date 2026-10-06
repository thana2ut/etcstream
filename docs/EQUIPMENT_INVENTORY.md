# Equipment inventory

> สร้างอัตโนมัติจาก `game/training/venue-scenarios.ts` ด้วย `node scripts/generate-venue-docs.mjs`

- **CONFIRMED** — ระบุได้จากหลักฐานเดิมของงาน (ภาพ / การสำรวจห้องจริง)
- **PROVISIONAL** — มีหลักฐานบางส่วน ต้องตรวจยืนยันเพิ่ม ห้ามถือเป็นข้อเท็จจริง
- **GENERIC TRAINING MODEL** — อุปกรณ์แบบฝึกทั่วไป ไม่ใช่รุ่นจริงของมหาวิทยาลัย
- **UNKNOWN** — ยังไม่ทราบรุ่น

โมเดล 3D ของอุปกรณ์ generic เป็น placeholder สำหรับฝึก (กล่อง/รูปทรงพื้นฐานพร้อมป้ายพอร์ต) แทนที่ด้วย GLB จาก Blender ได้ภายหลัง

| Venue | ID | Equipment | Status | Model / assumption | ใช้ในระดับ |
|---|---|---|---|---|---|
| XS | sw | Mini HDMI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| XS | cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XS | monitor | Classroom Projector / TV | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XS | mix | Small 4-channel Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XS | rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XS | lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XS | tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XS | slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| XS | capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XS | pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| S | sw | DeviceWell HDS7105 | CONFIRMED | DeviceWell HDS7105 | 1, 2, 3, 4, 5 |
| S | cam1 | Camera 1 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | 1, 3, 4, 5 |
| S | cam2 | Camera 2 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | 1, 3, 4, 5 |
| S | cam3 | Camera 3 | PROVISIONAL | Studio Camera · รุ่น/HDMI/SDI รอยืนยัน | 1, 3, 4, 5 |
| S | monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| S | mix | PMX-402D-USB chassis | CONFIRMED | PMX-402D-USB chassis | 2, 4, 5 |
| S | rx | Wireless Receiver | PROVISIONAL | COMICA CVM-WM100 PLUS family / Saramonic · รอยืนยัน | 2, 4, 5 |
| S | lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| S | tx1 | Wireless TX 1 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | 2, 4, 5 |
| S | lav2 | Lavalier 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| S | tx2 | Wireless TX 2 | PROVISIONAL | COMICA / Saramonic · รอยืนยัน | 2, 4, 5 |
| S | capture | Capture Card | UNKNOWN | Capture Card · รุ่นยังไม่ยืนยัน | 4, 5 |
| S | pc | HP Notebook / OBS | PROVISIONAL | HP 15.6-inch ตามภาพอ้างอิง · SKU รอยืนยัน | 4, 5 |
| M | sw | Production SDI Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| M | cam1 | Camera 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| M | cam2 | Camera 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| M | cam3 | Camera 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| M | cam4 | PTZ 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| M | monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| M | mix | Digital Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | stagebox | Analog XLR Stagebox | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | mic1 | Podium Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | mic2 | Handheld Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| M | slides | Presentation Laptop | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| M | display | LED Program Screen | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| M | capture | Capture Card | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| M | pc | Streaming Computer / OBS | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| L | sw | Portable Field Video Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| L | cam1 | Field / ENG 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | fiber-tx | SDI Fiber TX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | fiber-rx | SDI Fiber RX | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | cam2 | Field / ENG 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | cam3 | Field / ENG 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | monitor | Multiview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| L | mix | Field Audio Mixer | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | mic0 | Shotgun Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | mic1 | Ambient Microphone | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| L | encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| L | network | 4G / 5G Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| L | live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XL | sw | Broadcast Production Switcher | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 2, 3, 4, 5 |
| XL | ccu | Fiber Base Station / CCU rack | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | router | SDI Video Router | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam1 | Broadcast 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam2 | Broadcast 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam3 | Broadcast 3 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam4 | Broadcast 4 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam5 | Long-lens Camera 5 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | cam6 | Field Camera 6 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | monitor | Multiview Wall | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 1, 3, 4, 5 |
| XL | mix | Digital Audio Console | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | rx | Wireless Receiver | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | lav1 | Lavalier 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | tx1 | Wireless TX 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | mic0 | Commentator Mic 1 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | mic1 | Commentator Mic 2 | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | mic2 | Crowd Mic L | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | mic3 | Crowd Mic R | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | mic4 | Field Mic | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 2, 4, 5 |
| XL | replay | Replay Server | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| XL | graphics | Graphics Workstation | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| XL | preview | Preview Monitor | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| XL | display | Venue Display | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 3, 4, 5 |
| XL | encoder | Main Hardware Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XL | network | Primary Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XL | live | Live Destination (simulation) | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XL | backup | Backup Encoder | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
| XL | backup-net | Backup Network | GENERIC TRAINING MODEL | GENERIC TRAINING MODEL | 4, 5 |
