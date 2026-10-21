# Phase 07 — Checkpoint ล่าสุด

วันที่ 21 ตุลาคม 2026 · workspace D:\etcstream · branch codex/real-online-launch-v12

## อัปเดตล่าสุด: โต๊ะทุกห้องและรุ่นภาพที่เจ้าของมอบอำนาจให้เลือก

คำสั่งล่าสุดให้ทำต่อโดยไม่ควบคุมตัวละครเล่น: ดู `FINAL_TABLE_PHOTO_IMPLEMENTATION_TH.md`, `TABLE_AND_PHOTO_MODELS_ALL_ROOMS_TH.md` และ `SELECTED_PRODUCT_TARGETS_CHECKPOINT_TH.md` เป็นทางเข้าหลัก ข้อความด้านล่างหลังหัวข้อประวัติเป็นข้อมูลรอบก่อน ไม่ใช่สถานะล่าสุดของ generic 27

- 25 ด่าน / 5 ห้อง มีโต๊ะเตรียมท็อปไม้โครงดำ รองรับตัวเครื่องและสายหางครบขอบโต๊ะ โต๊ะ 4 ห้องขยายด้านสั้นเป็น 1.1 เมตร
- 53 โปรไฟล์รวม Free Practice: 27 โปรไฟล์ฝึกมีรุ่นภาพที่เลือกแล้ว (21 สินค้า/ชุดประกอบ) ผูก geometry แยกจาก simulator registry; ไม่เปลี่ยน hardware ID หรือกติกา
- เก็บภาพ/แผนผังใหม่ 58 records รวมหลักฐานอุปกรณ์ประกอบและภาพที่คัดออกว่าไม่ตรงงาน ไม่ใช่ภาพ shape-valid ทั้ง 58; ใช้ภาพคลังเดิมซ้ำเมื่อมีอยู่แล้ว
- ชุดทดสอบใหม่ตรวจพอร์ตตรงโมเดล พื้นที่วาง หยิบ/วาง 270 instance cases และเส้นทางเข้าถึงรายชิ้น พร้อมแนวเล็งไม่บังด้วยเฟอร์นิเจอร์/อุปกรณ์ชิ้นอื่น
- ตรวจ contract ของ 27 สถานการณ์ (25 ด่าน + 2 ห้องเดิม) ไม่พบการเปลี่ยน IDs, signatures, port kinds, canonical routes หรือ initial wiring
- ตรวจ SHA256: 81 packs + 455 reference files เดิมรวม 536 paths ไม่เปลี่ยน และตรวจ 58 image records ใหม่
- เรนเดอร์ geometry จริง 27 โปรไฟล์หน้า/หลัง 54 ภาพ และโต๊ะเตรียมทั้ง 5 ห้องหน้า/หลัง 10 ภาพจากตำแหน่งจริงในข้อมูล ไม่ควบคุมตัวละครและไม่อ้างว่าเป็น screenshot ใน browser
- รูปทรงส่วนที่ไม่มีภาพ/มิติครบยังประมาณจากภาพ ไม่รับรอง factory-CAD ทุกส่วนหรือ FPS จริง
- ผลล่าสุด: npm test 234/234 ผ่าน (113.13 วินาที), lint/build ผ่าน, git diff --check ผ่าน; หัว LC duplex เรนเดอร์และตรวจเพิ่มสองมุมแล้ว

ไฟล์ตรวจ: `art/qa/table-equipment/all-25-stage-readiness.json`, `contract-check.json`, `reference-integrity.json`; ภาพ `art/qa/venue-generic` และ `art/qa/table-equipment`

## ประวัติการตรวจรอบก่อนหน้า — ไม่ใช่ผลล่าสุด

รอบก่อน: รัน npm test ผ่าน220/220 (98.38วินาที) และเพิ่ม/รัน GLB integrity testแยกผ่าน1/1 (10GLB) รวม221กรณีในสองการรัน; lint/build/tsc/diff checkผ่าน ตรวจ81packs/536pathsพบครบ รายละเอียดใน PHASE07_INSPECT_AND_REGRESSION_REPORT_TH.md

## ทำต่อจากตรงนี้ ไม่เริ่มใหม่

รอบปั้นเทียบรูปทุกอุปกรณ์ล่าสุด: ดู PHOTO_MODELING_IMPLEMENTATION_TH.md และ PHOTO_MODELING_ALL_ITEMS_LEDGER_TH.md ครบ81รายการ ปรับStudioCamera/URSA/FiberConverter/HC-X2000และshared surfaces/head moldsเพิ่ม ภาพreview110ภาพ/13sheets ผลเต็ม225/225; หลังregenerateHC-X2000ตรวจtarget17/17และanchorเดิมผ่าน ยังมีgeneric27ไม่มีรูปสินค้าเฉพาะรุ่น ไม่อ้างphoto-exact100%

อัปเดต Hold-E ตามคำขอต้า: ทุก25ด่านเปิด full-screen orbit/zoom viewer ทันทีเหมือน Free Practice เอา compact-card gate และปุ่มเปิด3Dซ้ำออก แต่คงคำแนะนำสายไว้ในแผงเต็ม ไม่แก้ timer/tap-E/gameplay/save เพิ่ม tests/equipment-inspector-view.test.mjs ตรวจ component outputทุกอุปกรณ์ใน25ด่านและFree Practice รวมเส้นทาง cable inspector; targeted tests6/6, build/tscผ่าน ยังไม่ได้ทดสอบด้วยเมาส์ในbrowserจริงรอบนี้

Phase A–E และการเชื่อม stock/inspect เสร็จในขอบเขตหลักฐานที่มี ใช้คลัง C:\Users\asus\Downloads\อุปกรณ์ เดิมโดยไม่ดาวน์โหลดหรือเปลี่ยนรูป 81 packs; active53 = exact20 + owner-selected2 + owner-specific4 + generic27; WM300แยก archive

งานเด่น: socket/connector shared geometry, curved breakout/tail bounds, grille/material/vent/support, Samsung85 dimensions/SKU, WM100 neutral evidence, PMX manufacturer correction, generic silhouettes, actual-model inspect/safe fallback, fixed stable shelf allocation ทั้ง25ด่าน

ผลตรวจ: npm test220/220; lint/build/TypeScript/diff check ผ่าน; 54 offline mesh/GLB previews ตรวจรวม6sheets, USB-Cแก้และrenderซ้ำ ไม่ได้ทำ browser owner playtest หรืออ้าง FPS

## เอกสารทางเข้า

1. PHASE07_LOCAL_REFERENCE_MODELING_AUDIT_TH.md — before-state53 profiles/ที่มารูป
2. PHASE07_EXACT_MODELING_IMPLEMENTATION_TH.md — exact20 และข้อประมาณ
3. PHASE07_CABLE_AND_CONNECTOR_MODELING_TH.md — physical24+adapters2/logical1
4. PHASE07_PENDING_AND_GENERIC_MODELING_TH.md — owner decisions/ข้อจำกัด
5. PHASE07_ALL_25_LEVEL_TABLE_INTEGRATION_TH.md — จำนวนจริงทุกระดับ
6. PHASE07_INSPECT_AND_REGRESSION_REPORT_TH.md — tests/ไฟล์/ขอบเขตการรับรอง
7. PHASE07_OWNER_FINAL_PLAYTEST_READY_TH.md — ต้าทดสอบรอบสุดท้าย

## งานต่อไป

รอผล final manual playtest และหลักฐานรุ่นที่ยังไม่ยืนยัน ห้ามเดา variant ห้ามลดสถานะข้อจำกัดเพียงเพราะ GLB โหลดได้ หากต้อง renderซ้ำใช้ scripts/phase07-export-review.mjs → art/blender/review_phase07.py → scripts/phase07-review-sheets.mjs; ต้อง Blender5.2และdepsเดิม ไม่ต้อง recollectรูป

ไม่มี commit/push/deploy/migration/seed เก็บงานเดิมใน dirty working tree รวมไฟล์ที่ไม่ใช่งานนี้ไว้; ไม่ใช้ git reset/checkout ทับ รายงาน Phase05เป็นประวัติ ส่วน Phase07ฉบับนี้เป็น checkpointใหม่
