# Phase 08 — คู่มือต่อสายห้องฝึกอิสระ

ห้องฝึกอิสระเป็น sandbox แยกจากสตูดิโอภารกิจ 5 ด่าน: `hdmi-basic` และ `studio-full` ใช้ข้อมูล `game/training/scenarios.ts` / `game/training/hdmi-training.ts`

ไม่มี `stage` จึงไม่ใช้กฎกระเป๋าแบบตรงทุกเส้นของ 25 ด่าน และไม่เปลี่ยนรหัสเซฟ/ความคืบหน้า

## hdmi-basic

อุปกรณ์ 0 ตัว · สาย 2 เส้น · เงื่อนไข 2 ข้อ

| เงื่อนไข | ต้นทางที่รองรับ | ปลายทางที่รองรับ |
|---|---|---|
| Camera → Switcher | `camera:hdmi-out` | `switcher:hdmi-in` |
| Switcher → Samsung TV | `switcher:hdmi-out` | `monitor:hdmi-in`, `monitor:hdmi-in2`, `monitor:hdmi-in3` |

### สายและหัวแปลงในห้องฝึก

- `cable-1` สาย HDMI: HDMI → HDMI
- `cable-2` สาย HDMI: HDMI → HDMI

## studio-full

อุปกรณ์ 9 ตัว · สาย 17 เส้น · เงื่อนไข 10 ข้อ

| เงื่อนไข | ต้นทางที่รองรับ | ปลายทางที่รองรับ |
|---|---|---|
| Camera → Switcher | `cam1:video-out` | `sw:in1`, `sw:in2`, `sw:in3`, `sw:in4` |
| Lavalier 1 → TX 1 | `lav1:mic` | `tx1:mic-in` |
| Lavalier 2 → TX 2 | `lav2:mic` | `tx2:mic-in` |
| Receiver → Mixer | `rx:audio-out` | `mixer:ch1`, `mixer:ch2`, `mixer:ch3`, `mixer:ch4` |
| Sennheiser XS 1 → Audio Mixer | `mic:xlr-out` | `mixer:ch2-mic`, `mixer:ch3-mic`, `mixer:ch4-mic` |
| Mixer → Switcher LINE IN | `mixer:main-l`, `mixer:main-r`, `mixer:rec-l`, `mixer:rec-r` | `sw:line-in` |
| HDS7105 PGM OUT → Magewell HDMI IN | `sw:pgm` | `capture:hdmi-in` |
| Magewell USB 3.0 → HP Notebook | `capture:usb-out` | `pc:usb-in`, `pc:usb-in-right` |
| HDS7105 MULTIVIEW หรือ PGM → Samsung TV | `sw:multiview`, `sw:pgm` | `monitor:hdmi-in`, `monitor:hdmi-in2`, `monitor:hdmi-in3` |
| Audio Mixer LINE OUT → Yamaha HS5 | `mixer:main-r`, `mixer:xlr-out-l`, `mixer:xlr-out-r` | `speaker:trs-in`, `speaker:xlr-in` |

### สายและหัวแปลงในห้องฝึก

- `hdmi-1` สาย HDMI Type-A: HDMI → HDMI
- `hdmi-2` สาย HDMI Type-A: HDMI → HDMI
- `hdmi-3` สาย HDMI Type-A: HDMI → HDMI
- `hdmi-patch` สาย HDMI Patch สั้น: HDMI → HDMI
- `trs35-1` สาย 3.5 mm TRS: 3.5mm → 3.5mm
- `trrs35-1` สาย 3.5 mm TRRS: 3.5mm → 3.5mm
- `ts635-1` สาย 6.35 mm TS (โมโน): 6.35mm → 6.35mm
- `trs635-1` สาย 6.35 mm TRS (สเตอริโอ): 6.35mm → 6.35mm
- `adapter-35-635` หัวแปลง 3.5 mm → 6.35 mm: 6.35mm → 3.5mm; หัวแปลง ช่องรับ 3.5mm
- `adapter-635-35` หัวแปลง 6.35 mm → 3.5 mm: 3.5mm → 6.35mm; หัวแปลง ช่องรับ 6.35mm
- `rca-35` สาย RCA L/R → 3.5 mm: RCA → 3.5mm
- `usb-ac` สาย USB 3.0 Type-A ↔ Type-A: USB-A → USB-A
- `speaker-trs` สายสัญญาณ Balanced 6.35 mm TRS: 6.35mm → 6.35mm
- `xs1-xlr` สายไมโครโฟน XLR 3-pin: XLR-F → XLR-M
- `speaker-xlr` สายสัญญาณ Balanced XLR: XLR-F → XLR-M
- `lav-1` สายไมค์หนีบปก 1 (3.5 mm): 3.5mm → 3.5mm; ติดกับอุปกรณ์
- `lav-2` สายไมค์หนีบปก 2 (3.5 mm): 3.5mm → 3.5mm; ติดกับอุปกรณ์

เส้นทางพื้นฐาน: Camera HDMI OUT → สาย HDMI → Switcher HDMI IN; Switcher HDMI OUT ที่ตั้งบทบาทถูกต้อง → สาย HDMI → Monitor HDMI IN แล้วเลือกต้นทาง/โหมดเอาต์พุตให้ตรง

COMICA WM100 PLUS เป็นเป้าหมายในเกม แยกจากภาพอ้างอิง WM300/WM300-TX ที่เก็บใน archive; ไม่สลับรุ่น

หัวต่อ/การดูรายละเอียดใช้โมเดลร่วมกับภารกิจ แต่กฎทดลองอิสระและสถานะเซฟไม่ถูกแทนที่
