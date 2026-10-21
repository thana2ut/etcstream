# รอบปั้นเทียบรูปจริงจากคลังทั้งหมด

วันที่ 21 ตุลาคม 2026 · ต่อจาก Phase07/Hold-E · D:\etcstream

## ผลงานและความหมายของคำว่า “ครบ”

สำรวจและจัดบัญชีครบ81packs: อุปกรณ์ที่ใช้งานและมีรูป26โปรไฟล์ (exact20 + owner-selected2 + owner-specific4), generic27ที่ไม่มีรูปสินค้าเฉพาะรุ่น, WM300เก็บแยก1 และสาย/adapter/logical27 ไม่รวมรูปคนละรุ่นเข้าด้วยกัน ไม่อ้างว่าภาพครบหรือrendererครบแปลว่าถอดแบบสินค้า100%

เปิด contact sheets ของอุปกรณ์มีรูปทั้ง26โปรไฟล์เพื่อเทียบส่วนที่เห็น ตรวจpackและไฟล์455รายการพร้อม SHA-256 รวมpack81เป็น536เส้นทางอ้างอิง บัญชีรายชิ้นพร้อมข้อจำกัดอยู่ที่ [PHOTO_MODELING_ALL_ITEMS_LEDGER_TH.md](PHOTO_MODELING_ALL_ITEMS_LEDGER_TH.md); machine-readableพร้อมsource/derived hashesอยู่ที่ art/qa/photo-modeling/source-model-ledger.json

## สิ่งที่ปั้น/ปรับใหม่จริง

1. Studio Camera Plus/Pro G2: ตัวกล้องเปลี่ยนจากกล่องกว้างทึบเป็น loft ที่แคบตรงเบ้าเลนส์และกว้างไปทางจอหลัง มือจับสองข้างเป็นช่องเปิด เบ้าเลนส์เป็นวงแหวนกลวงพร้อมsensorลึก และsunshadeเปิดด้านมองจอ อ้างอิงภาพหน้า/หลัง/ข้างในpackเดิม รูปทรงย่อยและมุมtaperยังประมาณ ไม่อ้างCAD
2. URSA Broadcast G2: มือจับสองรางเปิด ชุดปุ่ม/knobด้านซ้ายและรอยต่อpanelตามภาพ side view เบ้าหน้าไม่เป็นฝาเลนส์ทึบสีฟ้า ไม่เพิ่มเลนส์ยี่ห้อหรือSKUที่ไม่มีหลักฐาน
3. Camera Fiber Converter: ตัวเรือนมีไหล่ลาดตามภาพ side view แทนกล่องเหลี่ยม ใช้หน้าขั้วเต็มตามตำแหน่งเดิม เพิ่มแถวknobที่เห็นในภาพ ไม่เพิ่มพอร์ตเชิงlogic
4. Studio Fiber Converter: ถ้วยเก็บdust-capเป็นโพรง ไม่ใช่แท่งตัน
5. Panasonic HC-X2000 reference: regenerate .blend/GLBจากbuilderเดิม hoodทรงแปดเหลี่ยมลาดเป็นช่องเปิดและเห็นเลนส์ลึก แทนแผ่นกระจกสี่เหลี่ยมทึบ เพิ่มvisual-only XLR insertที่handle จุดVIDEO_OUTยัง [0.048,1.3,0.168] เท่าเดิม; เครื่องowner/มิติโรงงานและrearตำแหน่งจริงยังรอยืนยัน
6. อุปกรณ์procedural16รุ่น: ขอบตัวเรือน/ปุ่มแบบbevelและknobแบบlatheร่วมกัน ใช้cached buffersไม่สร้างgeometryซ้ำต่อเครื่อง ลดความเงาpainted metal; AJAใช้สีข้อความฟ้าตามรูป ไม่สร้างโลโก้กราฟิกใหม่
7. หัวสายHDMI/DP/USB-A/USB3/USB-B/RJ45/IEC: overmoldขอบมนและstrain-relief ribsแบบgenericตามshape family ไม่ผูกยี่ห้อ/SKU; หัวอื่นและadapterคงรูปร่าง/ขั้วที่ตรวจจากpackไว้แล้ว
8. คงGLBของSamsung85, WM100 RX/TX, PMX, HDS, HP, MagewellHDMI, XS1, HS5ที่มีอยู่ ตรวจรูปและโครงสร้างซ้ำ ไม่อ้างว่าปั้นไฟล์เหล่านี้ใหม่ในรอบนี้ WM300ไม่ถูกนำมาแทนWM100

## ไฟล์โค้ด/โมเดล

- เพิ่ม game/rendering/hardware-detail-geometry.ts: cached rounded box, control knob, photo loft
- แก้ game/training/sim/model-geometry.ts และ hardware-geometry.ts: รูปทรงอุปกรณ์ตามภาพ ไม่เปลี่ยนport keys/registrydimensions
- แก้ components/game/equipment/hardware-model.tsx และ components/game/cable-plugs.tsx: แสดงmeshและวัสดุใหม่
- แก้ art/blender/build_hc_x2000.py, hc-x2000.blend, hc-x2000-manifest.json, public/models/equipment/hc-x2000.glb และภาพreviewของกล้อง
- ปรับ scripts/phase07-export-review.mjs และ art/blender/review_phase07.py: actual mesh buffersพร้อมnormals; แปลงสีsRGB→linearถูกต้องและเพิ่มมุมกลับหลัง; MiniProใช้source componentจริงพร้อมpresentation-only hook stubs ไม่คัดลอกแบบโมเดลอีกรุ่น
- เพิ่ม scripts/photo-modeling-ledger.mjs และ tests/photo-modeling-detail.test.mjs

## ผลตรวจ

- `npm test`: 225/225 ผ่าน, 0 fail/skip; รอบเต็มล่าสุด84.26วินาที
- หลังregenerate Panasonic: targeted GLB/ports/control/inspect/table tests17/17ผ่าน และเพิ่มassert hoodไม่ถูกปิดด้วยแผ่นทึบ/anchorคงเดิมผ่านอีกครั้ง
- `npm run lint`, `npm run build`, `npx tsc --noEmit`, `git diff --check`: ผ่าน (LF/CRLF warningปกติWindows)
- ภาพตรวจ110ภาพ = actual runtime geometry45แบบ (procedural17 + plug styles28) และGLB10ไฟล์ ×2มุม ครอบคลุมอุปกรณ์มีรูป26โปรไฟล์ โดยCOMICAมี2ชิ้นแยกRX/TX; ตรวจภาพรวม13sheetsใน art/qa/phase07
- ภาพDCCตรวจsilhouette/assembly/material-group แต่text, livefeedและproceduralgrille shaderไม่ได้ถูกถอดครบ จึงไม่ใช่browser screenshotและไม่ใช้รับรองFPSหรือhigh-fidelity100%
- Hold-Eยังเปิดหมุน/ซูมทันทีทุก25ด่านและFree Practice; ทดสอบcomponent outputผ่าน ไม่ได้ทำmanual browser playtestรอบนี้

## สิ่งที่ยังทำให้ตรงรูปเฉพาะรุ่นไม่ได้

generic27packไม่มีรูปสินค้า การปั้นจากรูปจริงทุกชิ้นจึงยังติดที่ข้อมูล ไม่ใช่แค่การมีrenderer ในเกมคงโมเดลฝึกที่แยกประเภทชัดและไม่มีแบรนด์ปลอม ส่วนowner-specificยังต้องหลักฐานPMXผู้ผลิต/มิติ, HP SKU, HDSรุ่นย่อย/ผู้ผลิต, Panasonicฉลากเครื่องจริง; fiber LC/SC/mode/polarity, SMPTEsex, ACC00050BNCsexและSM58variantยังไม่เดา ทุกข้อมีบันทึกรายชิ้นในledger

## รักษางานเดิม

ไม่ดาวน์โหลดรูปซ้ำ ไม่แก้ไฟล์รูป/packในarchive ไม่เปลี่ยนmission/save/IDs/port/cable keys ไม่commit/push/deploy ไม่แก้.env.localหรือรันmigration/seed ทักษะcreate-game-assetsทำให้แยกภาพอ้างอิง/derived model/ข้อประมาณและเก็บhashได้ตรวจสอบย้อนกลับ
