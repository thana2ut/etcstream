# Phase 05 · รายงานการทำงานและผลทดสอบถดถอย

## ไฟล์ที่แก้
| ไฟล์ | สิ่งที่เปลี่ยน |
|---|---|
| `game/training/sim/hardware-geometry.ts` | เพิ่ม `aja3gAma()`, `magewellSdiGen2()`, `shureSm58()` |
| `game/training/sim/model-geometry.ts` | เพิ่มชนิด socket `mcx`, `usba` และธง `lead` (socket ที่อยู่บนสายที่ติดมากับเครื่อง) |
| `components/game/equipment/hardware-model.tsx` | วาด socket แบบ `usba` และ `mcx` |
| `game/training/sim/equipment.ts` | แก้เฉพาะ notes ของ Magewell SDI (ระบุ MCX + ACC00050, USB Type-A ตัวเมีย) · ไม่ได้แก้ชื่อหรือคีย์พอร์ต |
| `tests/phase04-hardware-models.test.mjs` | ขยายเป็น 14 + 3 รุ่น และเพิ่มเทสต์ Phase 05 |
| `tests/venue-scenarios.test.mjs` | ตรวจว่า socket ไม่ลอย โดยยกเว้นเฉพาะ socket ที่มีธง `lead` |

**ไฟล์ที่แก้ค้างอยู่ก่อนเริ่มงานนี้ (ไม่ได้แตะ):** `layout-furniture.tsx`, `equipment-info.ts`, `venue-layouts.ts`, `venue-scenarios.ts`, `tests/venue-scenarios.test.mjs` (ส่วนเดิม)

## ผลทดสอบ
| ขั้น | ก่อนเริ่ม | หลังเสร็จ |
|---|---|---|
| `npm test` | 203/203 ตามรายงานก่อนหน้า (รอบ baseline ของผมรันพร้อมช่วงที่กำลังแก้ไฟล์ จึงไม่ใช้ตัวเลขนั้นอ้างอิง) | **204/204 ผ่าน** |
| `npm run lint` | — | ผ่าน ไม่มี error |
| `npm run build` | — | ผ่าน |
| `tsc --noEmit` | — | ผ่าน |
| `git diff --check` | — | ไม่มี whitespace error (มีเพียงคำเตือน LF/CRLF) |

## สิ่งที่ไม่ได้ทำ (ต้องรายงานตรง ๆ)
- **ไม่ได้เล่นจริงในเบราว์เซอร์และไม่ได้ดูภาพของโมเดลใหม่:** อาจมีชิ้นส่วนซ้อนกันหรือสัดส่วนดูแปลกที่เทสต์จับไม่ได้
- **ไม่ได้ปั้นหัวสาย 3D ใหม่แยกครบ 24 กลุ่ม:** ยังใช้ระบบสายเดิม
- **โปรไฟล์ GENERIC 27 รายการยังใช้ `generic-device.tsx`:** เป็นการตั้งใจ เพราะไม่มีรุ่นจริงให้ผูก
- **ไม่ได้แตะ:** Free Practice, Arena, เซฟ และ ID ทั้งหมด

ไม่มีการ commit หรือ push

## รอบที่ 2: หัวสาย 3D

**ไฟล์ที่แก้**
| ไฟล์ | สิ่งที่เปลี่ยน |
|---|---|
| `components/game/cable-plugs.tsx` | เขียนใหม่ทั้งไฟล์ |
| `game/training/scenarios.ts` | เพิ่ม PlugStyle: smpte, optical, usbb, speakon, logical |
| `game/training/venue-scenarios.ts` | แมปชนิดหัวสายใหม่ และ `plugsFor` แยก SMPTE ออกจาก optical |
| `components/game/hdmi-cables.tsx` | วาดลิงก์ CTRL-REPLAY เป็นเส้นโปร่งแสง |
| `tests/phase05-cable-connectors.test.mjs` (ใหม่) | ทดสอบ 3 ชุด |

**ผลทดสอบ**
- `npm test` ผ่าน 207/207
- `tsc`, `lint`, `build` ผ่าน
- `git diff --check` ไม่มี error

**ไม่ได้ตรวจในเบราว์เซอร์:** เจ้าของสั่งให้ข้าม และจะทดสอบรวมเองครั้งเดียว ยังไม่มีใครเห็นภาพหัวสายใหม่ในเกม
