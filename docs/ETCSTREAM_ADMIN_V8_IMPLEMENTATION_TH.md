# ส่งมอบระบบผู้ดูแลสามห้อง V8

**CODE CHANGES MADE; NOT TESTED — OWNER TEST REQUIRED**

แก้ซอร์สจริงใน `D:\etcstream` โดยเก็บงานค้างเดิมไว้ ไม่มีการรันเทสต์ ลินต์ บิลด์ typecheck เบราว์เซอร์ automation เปิดเกม หรือคำสั่งตรวจฐานข้อมูล ไม่รัน provisioning/migration/seed ไม่เปลี่ยน `.env.local` ไม่ commit/push/deploy

## 1. ทางเข้าปัจจุบัน

`http://localhost:3000/admin` เป็นหน้าผู้ดูแลหลักเพียงหน้าเดียว คงไฟล์ redirect ของ `/admin/[section]`, `/admin/missions`, `/missions/admin` ไป `/admin` แบบปลายทางคงที่ ไม่อ่าน query เพื่อให้สิทธิ์ และไม่สร้างหน้าแอดมินย่อย

GET `/admin` ส่งประตูที่ล็อกไว้เสมอ ไม่ส่งข้อมูลผู้ดูแลจากเซสชันเก่าหรือเปิดตำหนักให้เอง เมื่อ mount จะส่ง POST `entry-reset` ภายใต้ Origin/JSON policy เดิมเพื่อเพิกถอนเซสชันครั้งก่อนก่อนเปิดปุ่มกรอกรหัส จากนั้นยืนยันรหัสหลักกับ hash เดิมในตาราง admins ฝั่งเซิร์ฟเวอร์ ผ่านแล้วจึงเปิดสามการ์ดด้วย state ในหน้าเดียว การเปลี่ยนห้องและเมนูย่อยไม่เรียกรหัสหลักซ้ำและไม่เปลี่ยน URL

รหัสหลักเดิมไม่ถูกแก้หรือแทนที่โดย agent นโยบายบังคับเปลี่ยนรหัสตั้งต้นเดิมยังอยู่ หากข้อมูลเดิมมี rotate=1 เจ้าของต้องทำขั้นตอนนั้นเองบนหน้าจอ ไม่ใส่ค่ารหัสที่เคยให้ในแชตลงซอร์สหรือ log

เซสชันหลักยังเป็น opaque HttpOnly/SameSite cookie, Secure ใน production, มีวันหมดอายุฝั่งฐานข้อมูล รหัสหลักใช้ scrypt/rate limit เดิม ปรับ cookie ผู้ดูแลเป็น session cookie ไม่ตั้ง Remember Me ส่วน cookie ผู้เล่นและระบบผู้เล่นคงเดิม

หลัง login สร้าง entry ชั่วคราวฝั่ง Node ผูกกับ hash ของ opaque session ไม่ใช้ localStorage หรือ query เป็นสิทธิ์ รีสตาร์ต process จะต้องยืนยันใหม่โดย fail closed มี entry ID แยกแต่ละครั้งเพื่อไม่ให้แท็บเก่ายืนยันตัวเองต่อด้วย entry ใหม่โดยเงียบ ๆ ข้อมูลที่ส่งหน้าจอไม่รวม token/hash

ปุ่มออก/กลับสำนักรอ POST logout เพิกถอนสิทธิ์จริงก่อนเปลี่ยนหน้า การออกซ้ำหลัง session หมดอายุทำได้ หน้าใช้ pagehide keepalive และ pageshow persisted เพื่อไม่คืนหน้าที่ปลดล็อกจาก browser cache อย่างไรก็ดี unload request เมื่อเครื่อง/เครือข่ายดับเป็น best-effort ไม่รับประกันการส่งถึงเซิร์ฟเวอร์ การเปิด `/admin` ใหม่ยังต้อง reset และยืนยันรหัสเสมอ การสลับห้องไม่ใช่การออกจากตำหนัก

## 2. ห้องแข่งขัน — รหัสแยกจริง

จากซอร์สก่อน V8 พบ credential admins.hash หนึ่งชุด ยังไม่พบระบบรหัสแข่งขันแยกที่ใช้อยู่ในโค้ด จึงเก็บ hash หลักนั้นไว้ ไม่เดาหรือย้ายความหมายของรหัสเดิม ไม่อ่านค่าลับจากฐานข้อมูลหรือ `.env.local` เพื่อยืนยันสถานะติดตั้งจริง

เพิ่มตัวอ่าน salted hash แข่งขันจากไฟล์ส่วนตัว `.arena/competition-credential.json` (หรือเส้นทาง ARENA_COMPETITION_CREDENTIAL_FILE) เก็บนอก public และ runtime tracing ใช้ path แบบ runtime เท่านั้น ไม่มีค่า hash หรือ plaintext ฝังใน frontend

- ต้องมีเซสชันหลัก + entry ปัจจุบัน แล้วตรวจรหัสแข่งขันแยกฝั่งเซิร์ฟเวอร์
- API จัดการแข่งขันทั้งหมด เช่น players, overview, moderate, seasons, reviews, settings, audit ต้องผ่าน requireCompetition เพิ่มจาก requireSession ไม่ใช่ซ่อนเมนูอย่างเดียว
- รหัสแข่งขันต้องต่างจากรหัสหลัก ตรวจทั้งตอนตั้งค่า ตอนปลดผนึก และตอนเปลี่ยนรหัสหลัก
- ออกจากห้องแข่งขันไปห้องอื่น/หน้าเลือกห้อง จะเพิกถอน grant แข่งขัน; ออกจากระบบล้างสิทธิ์ทุกห้องและ preview
- ถ้าไม่มีไฟล์รับรองจะแสดงให้เจ้าของตั้งค่าจริง ไม่เปิดข้าม และไม่ใช้รหัสหลักแทน
- แยก error ประตูแข่งขันออกจาก main-session error กรอกรหัสแข่งขันผิดไม่ทำให้เสียสิทธิ์หลักโดยไม่จำเป็น

คงข้อมูลและคำสั่ง V6 จริง การค้นหา/แบ่งหน้า/เปลี่ยนชื่อ/ล้างชื่อ/ปกปิด/ระงับ/ทำข้อมูลนิรนาม/ยกเลิกผล/ฤดูกาล/คิวตรวจ/ประวัติ ใช้บริการเดิม เพิ่มเพียงตัวกั้นสิทธิ์และการนำเสนอ สรุปภาพรวมเปลี่ยนจากย่อหน้ายาวเป็น KPI tiles จาก response จริง ค่าไม่พร้อมแสดงว่าไม่มีข้อมูล ไม่แต่ง online หรืออันดับ ผลรอตรวจยังไม่ถูกยืนยันเป็นอันดับ Duel ยังปิด

## 3. การตั้งค่ารหัสแข่งขันโดยเจ้าของเท่านั้น

สร้าง `scripts/provision-competition-code.mjs` แต่ **ไม่ได้รัน** ผลกระทบเมื่อเจ้าของรัน: อ่านฐานข้อมูลผู้ดูแลแบบ read-only เพื่อยืนยันรหัสหลัก แล้วสร้างไฟล์ hash แข่งขันใหม่หนึ่งไฟล์ ไม่แก้ตาราง ไม่เปลี่ยนรหัสหลัก ไม่แตะข้อมูลผู้เล่น ไฟล์ที่มีอยู่แล้วจะหยุดและไม่เขียนทับ ใช้ช่องรับแบบปิดบังและ scrypt แบบเดียวกับระบบเดิม ไม่รับรหัสผ่าน command arguments

เจ้าของต้องอ่านสคริปต์ก่อน หากยังไม่มีข้อมูลรับรองแข่งขันจึงรันใน PowerShell โดยตรวจว่าเป็นโฟลเดอร์โปรเจกต์ที่ถูกต้อง:

```powershell
Set-Location D:\etcstream
node scripts/provision-competition-code.mjs
```

กรอกรหัสบนเครื่องผ่านช่องปิดบังเท่านั้น ไม่ส่งในแชต กำหนดรหัสแข่งขันอย่างน้อย 14 ตัวอักษร ผสมตัวอักษรกับตัวเลข/สัญลักษณ์ และต่างจากรหัสหลัก ต้องจำกัดสิทธิ์โฟลเดอร์ `.arena` ด้วย Windows ACL ของเครื่องจริง โหมด 0600 ใน Node ไม่ใช่สิ่งทดแทน ACL บน Windows

หากมีไฟล์รหัสแข่งขันเดิมที่ตั้งค่าไว้นอกค่า default ให้กำหนดเส้นทาง runtime ที่ถูกต้องแทนการสร้างทับ ไม่ได้ตรวจค่าลับจริงในรอบนี้

## 4. รูปแบบสามห้องและหอภารกิจ

หน้าแรกมีสามการ์ดภาพขนาดเท่ากัน ห้องแข่งขัน/ห้องฝึก/ห้องภารกิจ ใช้ asset ภายในเดิม พื้นหลังตำหนักเดิม ชุดสีกรมท่า หยก ทอง ฟอนต์ไทยและ focus state คงหน้าตาผู้เล่นภายนอก Header ไม่แสดง UUID ยาว เมนูแข่งขันอยู่เฉพาะห้องนั้นเป็น sidebar เมื่อมีพื้นที่และปรับตามความกว้าง ไม่มีแถวลิงก์ทั้งระบบอยู่ทุกห้อง

หลักฐานสาเหตุจากซอร์ส: `app/arena/arena.css` ใช้ `.arena-shell button` กำหนด display/align/justify/background/padding ครอบปุ่มทั้งหมด ทำให้ `MissionHall` ที่นำมาฝังสูญเสียรูปแบบพื้นหลังภาพและการจัดแนวของ plaque เดิม เพิ่ม override เฉพาะ `.admin-unified .mission-hall-embedded` เพื่อคืนภาพ chapter, แนวตั้ง, กรอบทอง, typography และสัดส่วนการ์ด ไม่แก้กติกาผู้เล่น

คง `missionChapters.map` ห้าบทและ `selectedMission.difficulties.map` ห้าระดับในคอมโพเนนต์เดิม ใช้ภาพ card-1 ถึง card-5 และ bg-missions เดิม รูปแบบกว้างเป็น 3+2 กึ่งกลาง ขนาดกลาง 2 คอลัมน์ ขนาดเล็ก 1 คอลัมน์ เนื้อหายาวเลื่อนได้ตามหน้า รายละเอียดห้าระดับยังใช้หน้ารายละเอียดและปุ่มย้อนกลับเดิม ไม่เปลี่ยนเป็นตารางห้าด่าน

Admin preview ไม่ต้องสร้างโปรไฟล์ผู้เล่น: แสดงตัวตนผู้ดูแลชั่วคราวเฉพาะ UI ไม่ hydrate โปรไฟล์ ไม่เขียน selectedMission ลง save ไม่ปลดล็อกให้ผู้เล่น และแสดงชัดว่าตรวจได้ทุกระดับโดยไม่บันทึกผล การเปิด/ปิดเกมยังอยู่ใน `/admin` ทำให้กลับมาระดับเดิมในห้องเดิมได้โดยไม่ขอรหัสหลักอีกครั้ง

**ภาพอ้างอิง:** คำขอรอบนี้อ้างถึงภาพสองภาพ แต่ไม่มีไฟล์ภาพสองภาพแนบให้เปิดดูจริง จึงใช้รายละเอียดใน V8 และ artwork/layout เดิมของ repository เป็นฐาน ไม่อ้างว่าตรวจภาพสองภาพหรือเปรียบเทียบภาพจริงแล้ว

## 5. การเล่นตรวจและสายอัตโนมัติ

POST `preview-start` ต้องผ่าน main auth, Origin/JSON, validate chamber/slug/level/scene, rate limit และสร้าง audit การเริ่มตรวจ Resolver ฝั่งเซิร์ฟเวอร์เลือกจาก catalogue จริง ไม่รับจำนวนสายจาก client สร้าง preview ID ชั่วคราวผูกกับ session entry, scenario และห้อง มีอายุไม่เกิน 30 นาที/เซสชันหลัก

Mission แต่ละระดับใช้ `scenario.canonical` ที่ได้จาก stage solution ของด่านนั้น อ่าน cable ID, ชนิดและ connector จาก cable definitions เดิม ตัด pre-installed/factory-attached ออกจากของที่ต้องใส่กระเป๋า ตรวจพอร์ตที่อ้างถึง ไม่ยอมให้ใช้ cable ID ซ้ำ และเทียบ multiset กับ requiredBag/checkMissionBag เดิม ไม่ใช้กองสายเดียวกันทุกระดับ ถ้าข้อมูลไม่ครบให้ diagnostic ไม่สร้างสายหรือพอร์ตปลอม

Training ที่ไม่ใช่ production stage อ่าน requirement และ candidate cables จริง ต้อง resolve เป็นชนิดที่ชัดเจนต่อข้อกำหนด หากมี TS/TRS/TRRS หรือชนิด/จำนวนที่กำกวมจะแจ้ง blocker ไม่สุ่มตัดสินใจ

`AdminPreview` ใช้ GameCanvas, FirstPersonController ผ่าน canvas เดิม, TrainingHud, FirstPersonHands, EquipmentInspector, BagPanel, OperatorConsole, ReviewOverlay และ TouchControls เดิม ไม่มีระบบจำลองภาพนิ่งแทนเกม เริ่มฉากใหม่พร้อมสายที่ต้องใช้ใน bag ก่อนเปิดฉากให้โต้ตอบ ไม่ผ่าน CableLobby ไม่เสียบสายคำตอบ ไม่กรอก logical settings และไม่เปลี่ยนตัวตรวจสัญญาณ เก็บ infrastructure/factory links ตามข้อมูลเดิมเท่านั้น

มีปุ่มพัก/กลับตำหนัก, กระเป๋า R, คอนโซล C ใน production stage และเริ่มตรวจใหม่พร้อมกระเป๋าสะอาด ตรวจ grant ตอนเริ่ม ทุก 15 วินาที เมื่อกลับเข้าแท็บ และเมื่อครบเวลา ฝั่งเซิร์ฟเวอร์ยืนยัน ID+scenario+expiry ก่อนตอบ สิทธิ์หมดอายุ/เครือข่ายยืนยันไม่ได้จะปิดฉาก ไม่ใช้ browser query หรือ selected.admin เป็นสิทธิ์

## 6. การแยกข้อมูลผู้เล่น

- Wrapper preview ไม่มี useAcademyStore, selectMission, startMission, completeMission, run autosave, loadRun/deleteRun หรือ API ส่งผล Arena
- ถ่ายและคืนเฉพาะ transient TrainingStore state เมื่อออกจาก preview ไม่อ่าน/เขียน nickname, completed, merit, rank, achievement หรือ public run key
- สถานะ completed ภายใน simulation เป็นผลตรวจในฉากเท่านั้น แสดงข้อความไม่มอบผลผู้เล่น ไม่มีการส่งเวลาหรือผลเข้า leaderboard
- UI preference ของคอนโซลเดิม เช่นขนาดตัวอักษร ยังเป็น preference ทั่วไปของเครื่องตามคอมโพเนนต์เดิม ไม่ใช่ save ภารกิจ
- ถอด shortcut เดิมจาก `/play` ที่ใช้ saved selected.admin + main session เพื่อเติมสาย ให้การเติมสายใช้ preview grant ฝั่งเซิร์ฟเวอร์ภายในตำหนักเท่านั้น ผู้เล่นปกติยังผ่าน briefing/เลือกสาย/ตรวจ bag และบันทึกผลตามเดิม
- คง guard เก่าที่ไม่มอบผลแก่ legacy saved admin selection ไม่ย้ายหรือเปลี่ยน persistence keys

## 7. สิ่งที่ยังติดจริง

1. **Studio Room 01 แบบเต็ม (`studio-full`)**: ข้อมูลเดิมระบุ requirement บางเส้นเป็น verified=false และมีทางเลือก/adapter/ชนิดสายกำกวม Resolver จึงปิดการเข้าแบบชุดสายอัตโนมัติพร้อม diagnostic ต้องยืนยันเส้นทางและชุดสายที่ยอมรับก่อน จึงยังไม่อ้างว่าการเล่นตรวจห้องฝึกเต็มเสร็จใช้งานได้ ส่วนฉาก `hdmi-basic` เดิมมีสองเส้น HDMI ที่ resolve จาก requirement ได้โดยซอร์ส แต่ยังไม่ได้เปิดเกมทดสอบ
2. ห้องแข่งขันต้องมี hash รหัสแยกจริง จึงจะเปิดข้อมูลจัดการได้ Agent เตรียมช่องทางและสคริปต์ไว้ แต่ไม่ตั้งรหัสให้ ไม่เปลี่ยนรหัสเดิม และไม่ได้อ่านฐานข้อมูลเพื่อยืนยันว่าติดตั้งแล้วหรือไม่
3. Grant ชั่วคราวใช้ memory ของ Node instance เดียว เหมาะกับเส้นทาง SQLite เดิม รีสตาร์ตจะล็อกใหม่ Multi-instance/serverless ต้องมี shared grant store และโครงสร้างข้อมูลร่วมที่เหมาะสม ไม่อ้างว่ารองรับแล้ว
4. ระบบแข่งขัน V6 ยังต้องตั้ง schema/ผู้ดูแล/origin/persistent storage ตามเอกสารเดิม ไม่มีการ deploy หรือ migrate ในรอบนี้ ข้อจำกัด authoritative replay, ผลรอตรวจและ Duel เดิมยังอยู่
5. ไม่มีภาพอ้างอิงสองไฟล์ในข้อความรอบนี้ และห้ามเปิด browser จึงไม่มีหลักฐานภาพก่อน/หลังหรือการยืนยันความสวยงามขณะทำงานจริง
6. ไม่ได้คอมไพล์หรือรันทดสอบ จึงอาจมีปัญหาที่ต้องพบจาก owner QA ไม่อ้างว่า bug-free

## 8. ไฟล์แก้ในรอบ V8

- `app/admin/page.tsx` — fresh-entry gate เสมอ
- `app/admin/admin.css` — lobby/KPI/competition navigation, คืน Mission plaques, preview overlay และ responsive
- `app/api/admin/[...path]/route.ts` — reset/logout, entry metadata, competition gate, preview grant และ API protection
- `app/play/page.tsx` — ถอด bypass จาก saved admin selection บนเส้นทางผู้เล่น
- `components/arena/unified-admin.tsx` — สามห้อง, exit lifecycle, competition chamber และ preview portal ภายในหน้า
- `components/arena/admin-panel.tsx` — ภาพรวมเป็น tiles, คงเครื่องมือแข่งขันเดิม
- `components/arena/admin-training.tsx` — การ์ดฉากฝึกจริงและคำสั่ง preview
- `components/arena/client-api.ts` — แยกการแข่งขันล็อกจาก master session lost
- `components/ui/mission-hall.tsx` — ใช้ callback preview ไม่แตะโปรไฟล์จริง คงห้าบทห้าระดับ
- `game/content/admin-loadout.ts` — ใช้ canonical ต่อระดับ + resolver/diagnostic สำหรับ training
- `server/arena/auth.ts` — ผูก admin session กับ entry ชั่วคราวและ revoke ทุก grant
- `server/arena/db.ts` — optional error code เพื่อแยกประตูสองชั้น
- `SECURITY.md`, `docs/ARENA_ONLINE_DEPLOY_TH.md`, `docs/ADMIN_ONLY_AUTO_CABLE_LOADOUT_TH.md` — ข้อกำหนด V8 ปัจจุบัน

ไฟล์ใหม่:

- `components/arena/admin-entry-gate.tsx`
- `components/arena/admin-competition-gate.tsx`
- `components/arena/admin-preview.tsx`
- `server/arena/admin-entry.ts`
- `server/arena/admin-preview.ts`
- `game/security/admin-preview-types.ts`
- `scripts/provision-competition-code.mjs`
- `docs/ETCSTREAM_ADMIN_V8_IMPLEMENTATION_TH.md` (ฉบับนี้)

ไฟล์ redirect/layout/theme assets เดิมคงอยู่และไม่ได้สร้างหน้าแอดมินแยก ไม่เพิ่ม dependency มีไฟล์ untracked/modified จากงานเดิมจำนวนมากอยู่ก่อนรอบนี้ ซึ่งเก็บไว้

## 9. รายการเจ้าของตรวจด้วยตนเอง — agent ไม่ได้ดำเนินการ

1. เข้า `/admin` จากสำนัก/URL ตรง/รีเฟรช/กลับผ่าน history ทุกครั้งต้องล็อก รหัสผิดไม่เปิดข้อมูล ลอง API ตรงโดยไม่มีสิทธิ์ต้องปฏิเสธ
2. รหัสหลักถูกต้องเห็นสามการ์ด สลับในหน้าโดย URL เดิม เข้าห้องแข่งขันต้องรหัสแยก รหัสหลักใช้แทนไม่ได้ ไม่มี config ต้องแจ้งจริง
3. ห้องแข่งขันทวนข้อมูลจริง KPI/ค้นหา/แบ่งหน้า/moderation/ความเป็นส่วนตัว/เหตุผลยืนยัน/ฤดูกาลและ audit ตรวจว่าชื่อซ้ำไม่รวมตัวตนและผลรอตรวจไม่ขึ้นเป็น verified
4. ออกจากห้องแข่งขันแล้วลอง API จัดการ ต้องถูกล็อก สองห้องอื่นไม่ถามรหัสแข่งขัน Public `/arena` ยังใช้สิทธิ์ผู้เล่นตามเดิม
5. หอภารกิจครบห้าบทห้าระดับ ภาพ/ตัวอักษร/กรอบ/กึ่งกลาง 3+2 ไม่ทับกัน เข้าตรวจทั้ง 25 ระดับตรวจชนิด/จำนวน/ขั้วสายเฉพาะด่าน ไม่มีหน้าเลือกสาย ไม่มีการเสียบคำตอบเอง
6. ทดสอบเดิน/หยิบวาง/เสียบถอด/คอนโซล/ตรวจสัญญาณ/ผิดพลาด/เริ่มใหม่/กระเป๋า R/คอนโซล C กลับตำหนักต้องอยู่ห้องและระดับเดิม ไม่ขอรหัสหลักซ้ำระหว่างยังอยู่ภายใน
7. ฝึก HDMI เดิมเข้าตรวจพร้อมสองเส้นตามข้อมูล; ห้องฝึกเต็มที่ยังคลุมเครือต้องปฏิเสธพร้อมข้อมูลที่ต้องแก้ ไม่ใส่สายเดา
8. เปรียบเทียบ save/progression/ชื่อ/บุญ/แรงก์/ผลออนไลน์ของผู้เล่นก่อนและหลังการตรวจ ต้องไม่ถูกแก้ ไม่โหลด run ของผู้เล่นมาทับ preview ผู้เล่นปกติยังต้องเตรียมสายเดิม
9. ออกผ่านปุ่มต้องเพิกถอน main/competition/preview ทดสอบ expiry, network failure, แท็บเก่าและ restart ต้อง fail closed และล็อกใหม่
10. Legacy URLs ลง `/admin` เท่านั้น ตรวจ desktop 1366×768 ถึง 1920×1080, tablet/mobile และ keyboard/focus/contrast ด้วยตนเอง

**CODE CHANGES MADE; NOT TESTED — OWNER TEST REQUIRED**
