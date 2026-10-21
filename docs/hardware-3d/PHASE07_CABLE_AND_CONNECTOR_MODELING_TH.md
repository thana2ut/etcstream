# Phase 07 — สาย หัวต่อและอะแดปเตอร์

วันที่ 21 ตุลาคม 2026

## ขอบเขตและหลักฐาน

รักษาภาพเดิมใน 02_CABLES_AND_CONNECTORS ทั้งหมด ไม่ดาวน์โหลดซ้ำ ภาพรูปทรงสายกายภาพยังครบ 24/24 + อะแดปเตอร์ 2 กลุ่ม และ CTRL-REPLAY อีก 1 กลุ่มที่เป็น logical-only รวม 27 packs สาย/อะแดปเตอร์ จำนวนรูปครบไม่ใช่การยืนยัน SKU/มาตรฐานไฟฟ้าของทุกชิ้น

| pack / กลุ่ม | โมเดลที่ใช้และผลตรวจ |
|---|---|
| VID-HDMI | HDMI shell หน้าตัด trapezoid, insert และ contact; ไม่ใช้ DisplayPort แทน |
| VID-SDI / VID-SDI3G / SDI lead | BNC coupling/locking slots; แยกหัวสาย male กับ socket อุปกรณ์ female |
| AUD-XLR / XLR leads | XLR-M มี 3 pins, XLR-F มี 3 รู; ไม่รวมเพศเข้าด้วยกัน |
| AUD-3.5 / audio patch | TRS สองวงฉนวน; TRRS สามวง; ไม่เปลี่ยน signal rule |
| AUD-LAV-TX | lav capsule/clip; WM100 PLUS ใช้ locking35 มีเกลียว/น็อต ส่วน generic TX ไม่อ้างรุ่น |
| AUD-6.35 / instrument / speaker635 | แยก TS หนึ่งวงจาก TRS สองวง |
| AUD-RCA3.5 | คู่ RCA ขาว/แดงเป็น branch visual เดียว ไม่เพิ่มปลายสายเชิง logic |
| DATA-USB / DATA-USB-A-A / DATA-USB-MAGEWELL | A/USB3 blue insert; สาย A-A ไม่ใช่คำแนะนำต่อ host-to-host |
| USB-WEBCAM / USB-C / USB-B | รักษาชนิดปลายตาม definition; C มี rounded shell/insert และแก้แนว overmold ให้ติดกับหัวจริง |
| network | RJ45 8 contacts/latch; socket มี tongue/contacts ตามชนิด |
| power | IEC cable female 3 รู/อุปกรณ์ male blades; DC barrel มีรูกลาง |
| FIB-CAMERA-CCU | SMPTE hybrid 2 optical + 4 electrical contacts, coupling/red alignment band; ไม่เลือกเพศแทน owner |
| FIB-SDI-LINK | optical neutral ไม่อ้าง LC/SC, single/multimode, simplex/duplex หรือ polarity |
| STG-MULTICORE | หัว multipin กลาง ๆ และปลาย XLR; ไม่เดาจำนวนขา/ยี่ห้อ |
| CTRL-REPLAY | วงแหวนสีม่วง จุดจับลิงก์จำลอง ไม่อ้างสายจริง |
| ADAPTER-35-635 | หัวแปลงแข็ง 3.5 → 6.35 ตามภาพ Hosa-style ปลอกดำ/ช่องรับโลหะ ไม่ใส่แบรนด์เอง |
| ADAPTER-635-35 | หัวแปลงแข็งกลับทิศ ไม่แสดงสายขดปลอม |
| AJA 3G-AMA accessory | 8 curved breakout tails + round XLR barrels; นับพื้นที่สายหางในการจัดโต๊ะ |
| Magewell SDI / ACC00050 | MCX ที่เครื่องต่อสายหาง BNC; พื้นที่หางรวมใน staging bounds |

รายละเอียด mapping ของสายทุกเส้นยังอยู่ใน Scenario.cables.plugs เดิม และตรวจอัตโนมัติทุก scenario รวม Free Practice ไม่เพิ่มสายเข้าฉากนอกกระเป๋า

## จุดที่ยังไม่ยืนยัน

1. fiber LC/SC, mode, duplex และ polarity ต้องมีหลักฐานหรือ owner decision
2. SMPTE hybrid เพศหัวตามเครื่องจริงยังไม่ยืนยัน
3. ACC00050 เพศปลาย BNC ยังไม่ยืนยัน ไม่รับรอง SKU ของสายที่ owner มี
4. ขนาดบูต/ความโค้ง/ความยาว strain relief เป็น generic shape ไม่ใช่แบบผลิต

Inspect สายใช้ definition ของสายจริงในด่าน ไม่หยิบเพียงภาพตัวอย่างจาก catalog; Hold-E ส่ง cable ID แบบ UI-only ไม่เปลี่ยน save schema หรือ key สาย เดิม tap-E ยังใช้หยิบ/ต่อ อะแดปเตอร์ใช้ rigid preview โมเดลหัวสายร่วมกันระหว่างห้อง/กระเป๋า/inspect

ไฟล์หลัก: components/game/cable-plugs.tsx, components/ui/cable-model.tsx, game/rendering/socket-geometry.ts, game/content/inspect-info.ts, game/training/scenarios.ts
