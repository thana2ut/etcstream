# ผลตรวจหลังแก้รอบผู้ดูแล 25 ด่าน

วันที่ 20 ตุลาคม 2026 — คำสั่งรันใน PowerShell ที่ `D:\etcstream` บน branch `main` ไม่ commit/push ไม่เปลี่ยน `.env.local` ไม่รัน migration/seed และไม่แก้เซฟผ่านเครื่องมือภายใน

| การตรวจ | ผลจริง | หลักฐาน |
| --- | --- | --- |
| `node scripts/generate-mission-completeness-docs.mjs` | ส่งออกข้อมูล active 25 ด่านสำเร็จ; ไม่ใช่ผลเล่น | BOM / port matrix / source matrix |
| `node scripts/generate-mission-player-audit.mjs` | โครงสร้าง 25/25; เส้นทางผ่าน public transitions ในหน่วยความจำ 25/25; ไม่มีการเขียนความก้าวหน้าผู้เล่น | admin-code-audit.json |
| ตรวจโครงเอกสาร | คู่มือ 25 หัวข้อ; checklist 25 หัวข้อ; matrix 25 แถว; ภาพรายด่านครบ 25 | admin-document-validation.json |
| ตรวจ Chrome ผู้ดูแล | เปิดจริงครบ 25/25; มีหลักฐานผลโต้ตอบบางส่วน 6 ด่าน; OUT-01 เป็นเพียงความพยายามส่งปุ่มที่ยังไม่ยืนยันผล | admin-browser-observations.json และ admin-*.png |
| เล่นจบผ่าน Chrome | ST-01 1/25 จากรอบก่อน; รอบนี้ไม่รับรองด่านใหม่ | ภาพ 04–12, 14 และความก้าวหน้าคงเดิมท้ายรอบ |
| `node --test tests/mission-admin-audit.test.mjs` | 3/3 ผ่าน; สองกรณีวนตรวจทุกด่านเรื่องถอดสาย/ไฟดับ/รับรองซ้ำไม่ได้ อีกกรณีตรวจ safety ของ OUT | admin-negative-regressions.txt |
| `npm run lint` | ผ่าน exit 0 | admin-lint.txt |
| `npm run build` | ผ่าน exit 0; สร้าง route รวม /missions/admin และ /play ได้ | admin-build.txt |
| `npm test` | **ยังไม่ผ่าน**: 174 กรณี ผ่าน 155 ไม่ผ่าน 19 | admin-full-tests.txt; admin-regression-triage.md |
| `git diff --check` | ผ่าน exit 0 | admin-diff-check.txt |
| `git status --short` | มีงานเดิมและงานใหม่ค้างอยู่ตามจริง ไม่ commit/push | admin-git-status.txt |

19 กรณีของชุดรวมยังอ้าง topology/ID เก่า ข้อความอังกฤษเดิม หรือคาด badge ที่ล้างแล้วเป็น false แทน undefined; เงื่อนไข safety ที่หลุดเป็นข้อผิดพลาดจริงซึ่งคืนแล้วและตรวจ Chrome แล้ว ไม่ลดเกณฑ์เกมเพื่อให้ชุดเก่าผ่าน รายงานแยกทุกกรณีไว้ใน `admin-regression-triage.md` ห้ามอ้างว่าชุดทดสอบรวมผ่านทั้งหมด

คำเตือน LF/CRLF เป็นคำเตือนรูปแบบจบบรรทัดปกติบน Windows ไม่ใช่ build error ไม่มีการแปลงทั้ง repository เพื่อกลบคำเตือน

## ไฟล์แก้/สร้างเฉพาะรอบผู้ดูแล

- แก้ `game/training/sim/reference-stages.ts`: สืบทอด weather ของ OUT และคืนเกณฑ์ GO/ที่กำบัง/รับรองไฟ/รางครอบสาย โดยใช้กลไกเดิม ไม่เพิ่มฮาร์ดแวร์
- แก้ `game/content/sim-equipment-info.ts`: แปลชื่อ/หมายเหตุโปรไฟล์ฝึก และใช้คำอธิบายพอร์ตตามหลักฐาน
- แก้ `game/content/sim-thai.ts`: แปลคำอธิบายลำโพง OBS กราฟิก และปลายทางสตรีมจำลองที่ยังเป็นประโยคอังกฤษ
- แก้ `components/game/operator-console.tsx`: แยกป้ายพอร์ตโปรไฟล์ฝึกกับข้อมูลอ้างอิง แปลสถานะภาพ/เสียงที่ยังหลุดภาษาอังกฤษ
- แก้ `game/content/mission-catalog.ts`: คำอธิบายสตูดิโอไม่ยืนยัน SDI ขัดกับ active training profile
- แก้ `scripts/generate-mission-completeness-docs.mjs` และส่งออกเอกสารประกอบใหม่: เปลี่ยนข้อความสถานะเก่าที่บอกว่ายังไม่มี QA ให้ชี้รายงานแยกชั้นล่าสุด โดยไม่แก้ต้นฉบับวิจัย
- สร้าง `scripts/generate-mission-player-audit.mjs`: ส่งออกคู่มือ/รายงาน/checklist จากนิยาม active และทดสอบในหน่วยความจำ
- สร้าง `tests/mission-admin-audit.test.mjs`: ตรวจ failure/retest ทั้ง 25 ด่านและการรักษา safety กลางแจ้ง
- สร้างเอกสารไทย 3 ไฟล์ตามคำขอ, `docs/LIVE_CHROME_GAMEPLAY_QA.md`, ภาพและบันทึกตรวจใน `docs/qa-evidence/`; เชื่อมสถานะในรายงาน milestone เก่า

การแก้คลังสาย ชั้นเก็บสาย การบังพอร์ต และข้อความ E/HDMI เกิดในรอบ Chrome QA ก่อนหน้า และตรวจซ้ำเฉพาะกรณีที่ระบุในรายงาน ไม่อ้างว่าทั้ง diff ของ repository เป็นงานที่เพิ่งสร้างรอบนี้

## สิ่งที่เจ้าของทำต่อ

ใช้ `MISSION_25_PLAYER_CONNECTION_GUIDE_TH.md` คู่กับ `MISSION_25_OWNER_MANUAL_TEST_CHECKLIST_TH.md` เดินต่อสายและรับรองจริงทุกด่าน ตรวจทุกพอร์ต/เส้นทางเดิน การถือวางหมุน อุปกรณ์ชุดใหญ่ ทุก fault variant และการเข้าซ้ำ ตรวจรุ่น/แผงจริงที่ยัง PROVISIONAL/UNKNOWN ก่อนแทน placeholder ด้วยโมเดลสินค้า ไม่ต้องรัน migration หรือแก้ environment เพื่อใช้คู่มือ
