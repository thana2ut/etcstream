# Phase 07 — Inspect และ regression

วันที่ 21 ตุลาคม 2026

## ตรวจซ้ำตามคำสั่งล่าสุด

รอบตรวจซ้ำนี้รันคำสั่งจริงใหม่ ไม่อ้างเฉพาะผลครั้งก่อน: `npm test` ผ่าน220/220 (98.38วินาที), lint/build/TypeScript ผ่าน และ diff check ไม่มี error เพิ่ม `tests/phase07-glb-integrity.test.mjs` แล้วรันแยกผ่าน1/1 รวมเป็น221กรณีที่ตรวจผ่านในสองการรัน ไม่ใช่การอ้างว่ารัน suite221พร้อมกัน

ตรวจ GLB ที่ส่งให้เกมทั้ง10ไฟล์: header/chunk length, bufferView/accessor bounds, float finite, material/mesh/node references, transforms และ embedded image references ผ่าน ไม่มีไฟล์ชำรุดที่ตรวจพบ นี่ไม่ใช่การรับรอง manifold/UVคุณภาพหรือประสิทธิภาพ GPU

ตรวจ pathอ้างอิงจากmetadataทั้ง81packs รวม536เส้นทาง พบครบ ไม่มีไฟล์หาย ไม่เขียนทับauditก่อนเริ่มและไม่เปลี่ยนรูปใน archive รอบนี้เพิ่มเฉพาะ automated integrity guard และอัปเดตเอกสาร ไม่แก้โมเดลซ้ำโดยไม่มีข้อผิดพลาดรองรับ ผลการตรวจครั้งก่อนด้านล่างเก็บไว้เป็นประวัติ

## ผลที่ตรวจแล้ว

| การตรวจ | ผล |
|---|---|
| npm test | 220 ผ่าน / 220 ทั้งหมด, 0 fail, 0 skipped; 114.38 วินาที |
| npm run lint | ผ่าน ไม่มี error |
| npm run build | ผ่าน Next.js16.3.8 production build |
| npx tsc --noEmit | ผ่าน |
| git diff --check | ผ่าน; LF/CRLF warning ปกติบน Windows ไม่ใช่ error |
| หลักฐาน | 81 packs + manifests ตรวจ path ในเครื่อง; ไม่ recollect |
| inspect | 53 active equipment profiles รวม exact/pending/generic; ทุกสายใน scenarios และ adapter2 มีข้อมูลหรือ safe fallback |
| โมเดล | socket21ชนิด finite geometry/normals, shared cache ≤5 material groups; 44 runtime previews +10 GLB =54ภาพนอกเกม |
| ทั้ง25ด่าน | end-to-end simulator สำเร็จ; mandatory disconnect/config/power/fault/signoff ยังบังคับ |
| โต๊ะ | union stock ครบ5venue×5levels, rotated full footprint รวมสายหางไม่ซ้อน/ไม่เกินโต๊ะ; slot ของ unit คงที่ข้ามระดับ |
| save | signature ไม่รวม presentation pose/stock; baseline load/resume/command replay tests ผ่าน |

## สิ่งที่แก้จากผลตรวจ

1. รูปทรง socket รวม box/cylinder/extrude แล้วบางชนิดไม่เกิด mesh เพราะ index รูปแบบต่างกัน: normalize เป็น non-indexed ก่อน merge และเพิ่ม test ตรวจ buffer finite
2. ขนาดโต๊ะเดิมคิดเพียง host/unrotated body: คำนวณ footprint หมุนจริงพร้อม AJA breakout/Magewell tail และจัดช่องจาก pool เต็มทุกระดับ ไม่ทำให้ของเปลี่ยนช่องเมื่อบางชิ้นเริ่มติดตั้งแล้ว
3. ภาพ render พบปลอก USB-C หมุนผิดแกน: แก้แกนแล้ว render ซ้ำเพื่อยืนยันประกอบต่อเนื่อง
4. inspect เดิมบางด่านแสดง Samsung แทน generic monitor และข้อมูลสายเป็นเพียง catalog: แสดง DeviceVisual/CableDef ของชิ้นจริง พร้อม safe fallback ภาษาไทย
5. ลบ manufacturer claim ที่ยังไม่ยืนยันของ PMX และ fake marking/ความถี่ที่ไม่มีหลักฐาน

## วิธี inspect

กด E ค้าง 2 วินาทีที่ equipment/cable end/adapter เพื่อดูรายละเอียด แตะ E ยังหยิบ/ต่อเหมือนเดิม แผงภารกิจมีปุ่มเปิด 3D หมุนดูชิ้นจริง แสดงชื่อ รุ่น/ชนิด หน้าที่ พอร์ตและสถานะหลักฐาน UI identifier @cable: ใช้เฉพาะเลือก inspect ไม่เปลี่ยน cable keys หรือ save format

## ขอบเขตการรับรอง

ทดสอบอัตโนมัติไม่แทนการเดิน/หยิบ/ต่อด้วยมือใน browser จริง ภาพ Blender นำ actual mesh buffer/GLB ไปตรวจ silhouette และ assembly แต่ไม่ได้จำลอง shader, text, active feed และ GPU performance ของเกมครบถ้วน ไม่ได้วัด FPS บนอุปกรณ์ต้า ยังต้อง final manual playtest ตาม checklist

ไม่ได้เพิ่ม dependency, credential, network download, migration หรือ seed; ไม่อ่านค่า .env.local; ไม่แก้ mission pass rules, hardware IDs, port/cable keys, save schema, arena logic หรือ mapping ด้วยงาน Phase07 ไม่ commit/push/deploy มีงานเดิม/งานอื่นค้างใน working tree เก็บไว้ไม่ลบทับ

## กลุ่มไฟล์ที่สร้าง/แก้ในรอบนี้

- geometry/วัสดุ: game/rendering/socket-geometry.ts, game/training/sim/{model-geometry,hardware-geometry}.ts, components/game/equipment/{hardware-model,atem-mini-pro,generic-device,port-socket,samsung-tv}.tsx
- inspect: game/content/{inspect-info,reference-evidence}.ts, local-reference-evidence.json, equipment-info.ts, sim-equipment-info.ts, components/game/{equipment-inspector,first-person-controller,training-room}.tsx
- สาย: components/game/cable-plugs.tsx, components/ui/cable-model.tsx, game/training/scenarios.ts
- โต๊ะ/anchor: game/training/venue-scenarios.ts, studio-room-layout.data.json, pmx402d-ports.json (ชื่อรุ่น ไม่เปลี่ยน keys/ตำแหน่ง)
- native assets: art/blender/build_{comica_wm100_plus,magewell_capture,pmx402d,samsung_u8000f,sennheiser_xs1,yamaha_hs5}.py และ .blend/.glb ที่สร้างใหม่ใน path เดิม
- ตรวจ: tests/phase07-reference-modeling.test.mjs, tests/phase05-venue-stock.test.mjs, tests/venue-scenarios.test.mjs; scripts/phase07-{reference-audit,export-review,review-sheets}.mjs; art/blender/review_phase07.py; art/qa/phase07

รายงาน audit, exact, cables, pending, table integration, regression, owner checklist และ checkpoint เก็บใน docs/PHASE07_*_TH.md
