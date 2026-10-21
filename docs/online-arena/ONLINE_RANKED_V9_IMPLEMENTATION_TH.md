# รายงานการแก้โค้ด V9

**CODE CHANGES MADE — AWAITING_OWNER_CONFIGURATION — NOT TESTED**

## IMPLEMENTED

- ใช้ SQLite/Node data layer เดิม ไม่เพิ่ม ORM หรือฐานข้อมูลจำลอง แก้ readiness จากดูเพียง MAX(version) เป็นตรวจ contract ตาราง/คอลัมน์/index/trigger จริง แยกสี่สถานะพร้อม error ภาษาไทยที่ไม่เผย SQL/path/secret
- เพิ่ม owner-run migration script ที่อ่าน environment ให้ตรง Next, สร้าง consistent backup ก่อน transaction, เติมสิ่งที่ขาดและรันซ้ำได้ ไม่แก้ migration 002 เดิม ไม่ลบข้อมูลหรือ auto-migrate ตอน startup
- เพิ่ม diagnostics/demo controls เฉพาะ Competition Admin หลังรหัสหลัก+รหัสแยก V8 หน้า /admin ยังเป็นหน้าหลักเดียว
- UUID/session/recovery/friend/privacy ใช้ระบบเดิม เพิ่ม NFC/duplicate-name guidance และ triggers ป้องกันชื่อใหม่ซ้ำ ไม่รวม/ลบตัวตนเก่าที่ชื่อซ้ำ ประวัติยังผูก UUID
- เพิ่ม persisted command ledger และ server replay: เริ่มจาก bag/seed/version ของ attempt รับคำสั่งที่ตรวจชนิด/เป้าหมาย เก็บ append-only/hash chain คิด penalty ฝั่งเซิร์ฟเวอร์ และ replay จากต้นก่อน finish ไม่เชื่อ snapshot/elapsed/completed ของ client
- เพิ่ม outbox เรียงลำดับ/idempotent resend ปุ่มส่งผลรอคำสั่งครบ โหลดรอบที่เริ่มแล้วจาก state/bag/seq เซิร์ฟเวอร์ ไม่รีเซ็ตเวลา
- เพิ่มทางรับรองห้องเรียน xs-1 ภายใต้ flag เจ้าของ ไม่ promote ผลเก่า อีก 24 ระดับยัง UNDER_REVIEW
- คง global/friends/nearby/season queries V6 และสูตร top-five distinct stages เพิ่มอันดับของฉัน/valid count/ข้อมูลกลุ่มเพื่อน สถานะขัดข้องไม่แทนด้วยศูนย์หรือ demo
- เพิ่ม ต้นกล้า ฟ้าใส ธารา เมฆา ขวัญข้าว ใน namespace DEMO แยก ไม่มีเวลา/อันดับ/session/result ไม่ seed ใน players/attempts เปิดได้เมื่อผ่าน environment และสิทธิ์แอดมิน แสดง panel แยก
- รักษาภาพ V5 เกม 25 ด่าน evaluator และ progression ใช้ intent methods เดิม ผล V8 preview ไม่เข้า Arena

## สาเหตุจากซอร์ส

ข้อความ V6 มาจาก requireOnlineSchema เมื่อเลข schema ต่ำกว่า 2 เดิมไม่ได้ตรวจโครงสร้างจริง สคริปต์เดิมรับเฉพาะ version 1 และไม่โหลด .env.local เอง จึงมีข้อจำกัดการรันซ้ำ/เลือกไฟล์ให้ตรง Next V9 แก้เส้นทางตั้งค่าและตรวจโครงสร้าง ไม่ได้พิสูจน์ว่าไฟล์จริงอยู่ในกรณีใด เพราะไม่รัน DB inspection/migration และไม่มี screenshot file แนบในรอบนี้

## REQUIRES CONFIGURATION

เจ้าของอ่าน ONLINE_RANKED_SETUP_TH.md: หยุด writers → สำรอง/อัปเกรดด้วยสคริปต์ใหม่ → ตั้ง persistent private path/HTTPS origin → เปิดแอป → ทำ manual checklist ก่อนเปิดรับรอง xs-1

ARENA_VERIFIED_SLICE_ENABLED และ ARENA_DEMO_ENABLED เริ่มเป็น 0 ในไฟล์ตัวอย่าง ไม่ได้แก้ environment จริง รหัสแข่งขัน V8 ยังตั้งตามคู่มือเดิม ไม่สร้างรหัสแทนให้

ยังไม่มีหลักฐานว่า deploy หรือเพื่อนเข้าจากอินเทอร์เน็ตได้ localhost แต่ละเครื่องไม่ใช่ server ร่วม ต้องมี Node instance เดียว persistent SQLite และ HTTPS hostname ที่เจ้าของตั้ง Ephemeral serverless/multi-instance ต้องมี shared storage/grant design เพิ่ม

## UNRESOLVED

- ไม่รับรองผลครบ 25 ระดับ เส้นทาง xs-1 ยังไม่ผ่าน owner QA/default ปิด อีก 24 ระดับต้องทวนเงื่อนไขเฉพาะ/เวลา simulation/นโยบายก่อนเปิด
- Command verification ตรวจสภาวะ AV/ลำดับ/เวลา receipt ไม่พิสูจน์มนุษย์/ระยะเดิน ไม่มี anti-bot/proctoring หรือ live 1v1 ที่อ้างว่าทำงานแล้ว
- ข้อมูลเก่าซ้ำ/เสียจนเติม schema ไม่ปลอดภัยจะ rollback/เก็บ backup ต้องทำ corrective migration เพิ่มโดยเจ้าของ ไม่ reset
- ไม่ promote legacy/provisional submissions ย้อนหลัง ไม่สร้างฤดูกาลหรือสถิติจำลอง

## ไฟล์แก้ในรอบ V9

- server/arena/db.ts — readiness/connection initialization/safe errors
- server/arena/service.ts — identity/privacy และ ready/command/finish
- server/arena/ranked.ts — stage catalog, own scope/count/friends และ season attempt metadata
- app/api/arena/[...path]/route.ts — status/demo/commands/owner restore/admin boundary
- app/api/admin/[...path]/route.ts — protected diagnostics/demo
- game/stores/training-store.ts — intent observation ไม่เปลี่ยน evaluator
- components/arena/play.tsx — outbox/server restore/ready bag
- components/arena/client-api.ts — attempt/replay metadata
- components/arena/online.tsx — own scope/count/empty/demo panel
- components/arena/admin-panel.tsx — database/demo sections
- components/arena/admin-evidence.tsx (ไฟล์เพิ่ม) — ดู protocol/ลำดับคำสั่งจริงแบบแบ่งหน้าในห้องแข่งขัน
- app/arena/[section]/page.tsx — own scope ใน route เดิม
- app/arena/arena.css — demo panel ไม่เปลี่ยน artwork
- .env.example — feature flags เริ่มปิด ไม่มีรหัสลับ
- SECURITY.md และ docs/online-arena/ARENA_ONLINE_DEPLOY_TH.md — ข้อกำหนด V9

ไฟล์เพิ่ม:

- server/arena/schema-contract.json
- server/arena/migrations/003-authoritative-commands.sql
- scripts/setup-online-ranked.mjs
- server/arena/command-replay.ts
- server/arena/demo.ts
- game/training/competition-commands.ts
- components/arena/database-admin.tsx
- components/arena/demo-roster.tsx
- docs/online-arena/ONLINE_RANKED_SETUP_TH.md
- docs/online-arena/ONLINE_RANKED_MANUAL_CHECKLIST_TH.md
- docs/online-arena/ONLINE_RANKED_V9_IMPLEMENTATION_TH.md

## NOT TESTED

ไม่รัน tests/lint/build/typecheck/browser/gameplay/autosolver/seed/migration หรือ API จริง อ่านเพียงซอร์ส/Git ไม่แก้ .env.local ไม่ commit/push/deploy เก็บ working tree เดิมไว้ ไม่อ้าง PASS/ออนไลน์จริง/bug-free
