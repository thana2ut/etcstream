# ตรวจการรวม GitHub V12

Repository ที่เจ้าของยืนยัน: https://github.com/thana2ut/etcstream (เลข 2)

- main ในเครื่องและ origin/main เริ่มตรงกันที่ `05cbeedcd9c9e8e2e672dcccc343722ad084213a`
- remote branch `main-f16wia`: `69950ffd7e5240907a2bb52a4c2ef2d69a703a1d`
- remote branch `main-r41qpx`: `36ee2d15c1738685a1970dc16c92a6a4a7655bb7`
- สอง remote branches แตกต่างกันเฉพาะข้อความวันที่ในเอกสาร admin ซึ่งนำมาปรับใน source ปัจจุบันแล้ว
- เก็บโค้ดปัจจุบันและ cloud proposal ใน local commit `d32262df5a47a7076339446b9658ccf4d1d3ee66` ที่สาขา `codex/real-online-launch-v12`

## ประวัติที่ต้องจัดการอย่างปลอดภัย

ตรวจด้วยตาพบ hash ประตู admin แบบตรวจใน browser ในประวัติของสาขาเก่า
โค้ดใหม่ไม่ใช้ค่าเดิมและบังคับรหัสใหม่แบบ scrypt ฝั่ง server แต่การลบจากไฟล์ปัจจุบันไม่ลบประวัติ
เจ้าของยืนยันแล้วว่าสร้างรหัสใหม่และเลิกใช้รหัสเก่า จึงอนุญาตให้ scanner รับทราบการหมุนรหัสเฉพาะกรณีประวัติเก่านี้
ไม่แสดง hash ในรายงาน ไม่ rewrite history และยังต้องตั้ง hash ใหม่ใน Vercel ก่อนเปิด production
scanner ทั่วไปครั้งแรกไม่พบเพราะไม่รวมรูปแบบ hash ของ admin จึงเพิ่มตัวตรวจกรณีนี้ไว้แล้ว

## ผลจำลอง merge โดยไม่เปลี่ยน working tree

คำสั่ง `git merge-tree --write-tree HEAD origin/main-r41qpx` พบ conflicts 23 ไฟล์
ไม่มีการ merge ลง working tree ไม่มีการเลือก ours ทั้งชุด ไม่มีการลบสาขาเก่า

ไฟล์ขัดแย้ง:

```text
app/missions/admin/page.tsx
app/page.tsx
app/play/page.tsx
app/xianxia-theme.css
docs/01_MASTER_EXACT_HARDWARE_REGISTER_TH.md
docs/02_ALL_25_STAGE_BOM_AND_SIGNAL_GRAPH_TH.md
docs/ADMIN_ONLY_AUTO_CABLE_LOADOUT_TH.md
docs/MISSION_25_OWNER_MANUAL_TEST_CHECKLIST_TH.md
docs/MISSION_25_PLAYER_CONNECTION_GUIDE_TH.md
docs/generated/MODEL_UNION_GENERATED_TH.md
docs/generated/STAGE_GRAPHS_GENERATED_TH.md
docs/generated/hardware-audit.json
game/content/admin-loadout.ts
game/content/mission-catalog.ts
game/persistence/run-save.ts
game/rendering/scene-font.ts
game/training/hdmi-training.ts
game/training/sim/engine.ts
game/training/sim/equipment.ts
game/training/sim/reference-rooms.ts
game/training/sim/reference-stages.ts
game/training/venue-scenarios.ts
tests/helpers/solver.mjs
```

ตัวอย่างที่ตรวจแล้ว: สาขาเก่าใช้ browser hash และ session marker ใน admin; source ปัจจุบัน redirect ไป gate เดียว /admin ตาม V12
ข้อมูลอุปกรณ์/กราฟด่านในสาขาเก่ายังต้องตรวจทีละรายการก่อนรวม ห้ามนำกลับทั้งชุดให้ทำลายสิทธิ์หรือกติกาปัจจุบัน

หลังหมุนรหัสแล้ว อัปโหลด snapshot ไป **สาขาใหม่เท่านั้น** เพื่อรักษางานในเครื่องและสาขาเดิม
เปิด draft PR เทียบ main; ไม่อ้างว่าสองสาขาทางเลือกถูกรวมเสร็จหรืออนุมัติ production แล้ว
ยังต้องตัดสิน conflicts ของสาขาทางเลือกก่อนรวม production หากมีงานเฉพาะที่ต้องเก็บเพิ่ม

## อัปเดตตามคำขอล่าสุดให้ main เป็น source ปัจจุบัน

เจ้าของยืนยันเลิกใช้รหัสเก่าแล้ว อัปโหลดสาขา codex/real-online-launch-v12 และอัปเดต main แบบ fast-forward สำเร็จ
source commit: `a47d8bf117c62312fad5a221e07d1b1a5c93f229` ตรวจ refs บน GitHub แล้วตรงกัน
ไม่มี force push ไม่มีการลบ/เขียนทับ main-f16wia หรือ main-r41qpx และไม่ได้อ้างว่าสาขาทางเลือกถูกรวมแล้ว
ยังไม่ deploy production เพราะค่าลับ/สิทธิ์ Supabase/migration ยังไม่พร้อม การเปลี่ยน main ไม่เท่ากับเปิดระบบออนไลน์สำเร็จ
