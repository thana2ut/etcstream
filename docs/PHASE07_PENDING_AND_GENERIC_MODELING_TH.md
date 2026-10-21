# Phase 07 — Owner-specific, pending และ generic

วันที่ 21 ตุลาคม 2026 · ไม่เปลี่ยนสถานะหลักฐานให้สูงกว่าความจริง

| โปรไฟล์ | หลักฐาน/การปรับ | ข้อจำกัดและสิ่งที่ต้องยืนยัน |
|---|---|---|
| Samsung U8000F | ใช้ UA85U8000FKXXT 85 นิ้วตาม owner decision; GLB เก็บ SKU และมิติจริง 1889.9×1083.5×77 มม.; display width 1 ม.สำหรับห้องฝึก, rib หลัง/VESA400×300 | ไม่ยืนยันเครื่อง owner; HDMI service anchor บางตำแหน่งเป็นประมาณไม่ใช่ drawing85; ขาตั้งห้องไม่ใช่ขาตั้งแถมสินค้า |
| COMICA WM100 PLUS | คง 2TX+1RX; เพิ่ม visual jack รองตามภาพ, neutral LCD ไม่แสดงความถี่ที่เดา | มิติ RX/TX บางส่วนประมาณ; ยังไม่ยืนยันเครื่อง owner; WM300 archive แยกและไม่ใช้แทน |
| PMX-402D-USB | ใช้รูป owner; ลบคำอ้าง Yamaha ทั้งป้ายโมเดลและชื่อข้อมูล | ผู้ผลิต/ขนาด/SKU ยังไม่ยืนยัน ไม่เลือกแบรนด์ให้ |
| HDS7105 | คง owner-photo silhouette/ปุ่ม/port anchors เดิม; inspect แสดง partial | ป้ายผู้ผลิต/รหัสย่อย/มิติโรงงานต้องหลักฐานเพิ่ม |
| HP 15.6 reference | reuse GLB จากภาพ owner ทุกมุม ไม่เปลี่ยนรุ่นเอง | ต้อง product number/SKU จึงยืนยัน exact ได้ |
| Panasonic HC-X2000 reference | คง model/support และระบุรุ่นอ้างอิงตาม pack | ต้องภาพฉลากเครื่อง owner เพื่อยืนยันว่าคือรุ่นนี้จริง |

สองรายการแรกเป็น owner-selected target สำหรับเกม ไม่ใช่ verified physical owner unit ทั้ง 6 ใช้งานได้โดยติดป้ายหลักฐานตามจริง; ไม่ยกเป็น exact แม้โมเดลโหลดสำเร็จ

## Generic 27 โปรไฟล์

ใช้ profile และ connector logic ของ registry เดิม ไม่เพิ่มโลโก้หรือ SKU: mixer 4/6 ช่องมี knob/fader, controller มี jog wheel, bodypack มี LCD/ปุ่ม/belt clip, projector เป็นตัวเครื่องพร้อม lens/vent ไม่ใช่จอแบน ส่วน camera/PA/laptop/rack silhouette เดิมยังใช้ร่วมกัน พอร์ตชนิดที่รู้ใช้ socket กลางเดียวกับ exact; COMBO มีช่องกลางและ XLR แยกเพศตาม direction; optical/multipin ไม่รู้รุ่นใช้ neutral fallback

รายการครบรายโปรไฟล์และ path pack ดู PHASE07_LOCAL_REFERENCE_MODELING_AUDIT_TH.md และ game/content/local-reference-evidence.json

## รายการรอยืนยันรวม

ไม่ต้องเลือกใหม่สิ่งที่เลือกแล้ว (Samsung85/WM100 PLUS) สิ่งที่ยังต้องหลักฐาน: PMX ผู้ผลิต/มิติ, Panasonic ฉลากเครื่องจริง, HDS ผู้ผลิต/รุ่นย่อย, HP SKU, fiber family/mode/polarity, SM58 LC/S, SMPTE sex และ ACC00050 BNC sex คง conservative geometry ระหว่างรอ ไม่มีการตัดสินใจ variant ที่ไร้หลักฐานแทนต้า

## ความครบสามด้าน

- ภาพสายรูปทรง: 24/24 ไม่ถอยหลังและไม่ดาวน์โหลดซ้ำ
- อุปกรณ์ใช้งานพร้อม inspect/fallback: 53/53 โปรไฟล์; exact identity 20/53 ไม่ใช่ 53/53
- high-fidelity 3D: ยังไม่อ้าง 100% เพราะมีมุมขาด/จุดยึด/รุ่นย่อย/รายละเอียดภายในโดยประมาณ โมเดลรอบนี้เป็น runtime reference-driven refinement พร้อม owner playtest ไม่ใช่ digital twin ระดับวัดผลิต
