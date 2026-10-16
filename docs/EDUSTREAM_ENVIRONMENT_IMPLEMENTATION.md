# EduStream — รายงานตรวจสเปกสภาพแวดล้อม

## ขอบเขตและเอกสารต้นทาง

อ่านเอกสาร `EduStream_Codex_01_Classroom.md` ถึง `EduStream_Codex_05_Football_Broadcast.md` จาก Downloads แล้ว ทั้งห้าไฟล์มีข้อกำหนดร่วมและข้อกำหนดเฉพาะสถานที่ ใช้เป็นรายละเอียดงานตามคำขอโดยตรงของผู้ใช้

ยังไม่พบไฟล์ `EduStream_Codex_Five_Levels_Realistic_Environment_Master_Prompt.md` ที่ระบุในคำขอ หลังค้นใน Downloads, attachments และ repository งานนี้ใช้เอกสารแยกทั้งห้าที่ผู้ใช้แนบ ซึ่งมีข้อกำหนดร่วมและรายละเอียดเฉพาะห้องครบในแต่ละไฟล์ จึงไม่อ้างว่าเทียบเอกสาร Master ที่ขาดแล้ว

Repository มีงานค้างก่อนเริ่มรอบนี้หลายไฟล์ รวมถึง auditorium/outdoor/stadium และ UI จึงเก็บไว้ทั้งหมด ไม่ถือว่า diff ทั้ง repository เป็นงานที่ทำใหม่ในรอบนี้ ไม่มี commit, push หรือ deployment

## Engine และฉากจริง

ใช้ **Three.js 0.186.1 + React Three Fiber 9.8.1 + Rapier 2.2.0** บน Next.js 16.3.6 ไม่ใช่ Unity/Godot/Unreal

| บท | Layout / scenario IDs | ฉากที่โหลดจริง | ขนาดพื้นที่เดิน X × Z (เมตร) | สถานะรอบนี้ |
|---|---|---|---|---|
| 01 ห้องเรียน | `classroom`, `xs-1` … `xs-5` | `components/game/environment/venue/classroom.tsx` | 16.675 × 12.76 | ปรับและตรวจภาพ 32 มุม / เดินและต่อสายกล้องจริง |
| 02 สตูดิโอ | `studioMission`, `s-1` … `s-5` | `components/game/environment/venue/studio.tsx` | 16.4 × 13.3 | ปรับสามฉาก / native ports / ตรวจภาพ 42 มุม / ต่อ–ถอดภาพจริง |
| 03 หอประชุมใหญ่ | `auditorium`, `m-1` … `m-5` | `components/game/environment/venue/auditorium.tsx` | 24.3 × 21.06 | ปรับ 126 ที่นั่ง / จุดเก็บ / LED / ตรวจภาพ 64 มุม / เดินจริง |
| 04 กลางแจ้ง | `outdoor`, `l-1` … `l-5` | `components/game/environment/venue/outdoor.tsx` | 32.4 × 29.025 | ปรับอุปกรณ์ / จอ / แสง / ตรวจภาพ 48 มุม / เดินจริง |
| 05 ฟุตบอล | `stadium`, `xl-1` … `xl-5` | `components/game/environment/venue/stadium.tsx` | 35.1 × 27.95 เฉพาะพื้นที่ช่าง | ปรับกล้อง / แร็ก / จอ / แสง / ตรวจภาพ 98 มุม / เดินจริง |

ตัวระบุบทและระดับ, HUD, input, inventory และ progression ใช้ระบบเดิม ไม่สร้างเกมหรือภาพนิ่งทดแทน

## Native environment specification / แหล่งข้อมูลเดียว

- `game/training/venue-layouts.ts`: bounds, spawn/yaw, furniture, obstacle boxes, zones, working/storage/return surfaces และ device placements ของทั้งห้าห้อง
- `game/training/venue-scenarios.ts`: registry, typed ports/cables, canonical graph, actions, prerequisites และระดับความยากทั้ง 25 ชุด
- `game/training/environment-review.ts`: bookmarks A–J และหน้า/หลังของทุก device ใช้ bounds/layout และตำแหน่ง item ปัจจุบัน ไม่สร้างฉากจำลองอีกชุด
- `game/training/monitor-feed.ts`: สถานะจอจากสายเข้าปลายทาง, source selection และ prerequisites
- แสง/วัสดุของแต่ละห้องอยู่ในไฟล์ฉากข้างต้น และ `venue/kit.tsx`, `venue/textures.ts`

แกน Y ขึ้น ห้อง 01–04 มีด้านนำเสนออยู่ทาง −Z; ห้อง 05 สนามอยู่ทาง +Z ตามฉากเดิม ส่วนมุม C/D ใช้ X ลบ/บวก ไม่ใช่พิกัดภูมิศาสตร์จริง

## ห้อง 01: การเปลี่ยนแปลงและเหตุผล

1. ย้ายจุดควบคุมหลักมาโต๊ะผู้สอนขนาด 3.6 × 1.4 เมตร กล้องอยู่หน้าซ้ายริมหน้าต่าง ระยะราบ camera–switcher ต่ำกว่า 6 เมตร แทนการลาก HDMI จากหลังห้อง ไม่เพิ่มกฎระยะสายที่ระบบยังไม่ได้จำลอง
2. เก็บ ID อุปกรณ์/graph เดิมและอัปเดตตำแหน่งต้นทางใน layout ให้พอร์ต, action และ snap zones ถูกสร้างจากข้อมูลเดียวกัน
3. จัดเครื่องบนตู้เก็บเป็นแถวเดียวตามแนวยาว แก้การซ้อนกันของอุปกรณ์ที่เคยถูกแบ่งสองแถวบนตู้แคบ แก้การตีความคำ PA ในชื่อ Mixer เป็นขนาดลำโพงโดยใช้ ID อุปกรณ์แทน
4. แก้ลำโพงภารกิจถูกซ่อนจากเงื่อนไขของ free-practice ที่มีลำโพงอยู่ในฉากเดิม เพิ่มตัวลำโพงและแผงหลังจริงสำหรับ generic classroom speaker
5. พอร์ต generic ห้องเรียนวางบน chassis, กล้องใช้แผงหลัง, TV ใช้แผงหลัง และมีรูป socket ตรง anchor ที่ใช้เสียบจริง ไม่แก้ GLB ของอุปกรณ์ยืนยันรุ่น
6. เพิ่ม collider เก้าอี้นักเรียนให้ตรงตำแหน่ง render; ขยายโต๊ะโดย collider ใช้ layout เดียวกัน เงาห้องเรียนเปิดแล้วโดยจำกัดแผนที่เงาหนึ่งดวงและ throttle ตามระบบเดิม ปรับพื้นให้หยาบขึ้น
7. จอโปรเจกเตอร์และ TV แสดงข้อความสถานะจากเส้นทางเดิม รวมถึง NO SIGNAL/NO PROGRAM และ Program จำลอง; กล้องมี tally ตาม selected source ไม่ทำภาพวิดีโอจริง ส่วนจอโปรเจกเตอร์เป็น repeater ของ destination เดิม ไม่เพิ่ม graph output แฝง
8. สายที่เสียบครบสองด้านและยาวเกินสองเมตรในห้องเรียนลงสู่พื้นนอกขอบโต๊ะ ใช้ mesh budget เดิมเก้าช่วง รักษา endpoint จริง ไม่ใช่ cable physics/การคำนวณความยาวสาย และยังไม่รับรองเส้นทางสายทุกคู่/ฝาครอบสายครบ
9. ป้ายโซนและข้อความไวท์บอร์ดเป็น Text component ที่แก้คำและฟอนต์ได้ ไม่ฝังข้อความสอนในภาพ texture

ผังอ้างอิงห้อง 01 (ย่อ ไม่ใช่แผนที่มาตราส่วน):

```text
                         −Z / ด้านนำเสนอ
  ลำโพง / ไวท์บอร์ด     โปรเจกเตอร์ / โต๊ะผู้สอน       TV
  กล้องริมหน้าต่าง       switcher / mixer / PC
  โต๊ะใต้หน้าต่าง        โต๊ะซ้าย | ทางเดินกลาง | โต๊ะขวา
  หน้าต่าง + softbox     โต๊ะซ้าย |             | โต๊ะขวา
  รถเข็นหลังห้อง         โต๊ะซ้าย |             | ทางเดินเข้า
                         ชั้นสาย             ชั้นอุปกรณ์ / ประตู
                         +Z / หลังห้อง
```

## ฟอนต์: ปัญหาที่ตรวจพบจากภาพจริง

Kart ต้นฉบับมี cmap สำหรับ A–Z/a–z แต่ glyph ทั้ง 52 ตัวไม่มีเส้นรูป ทำให้การทดสอบแบบเช็กเฉพาะ glyph index ผ่าน ทั้งที่ตัวอังกฤษหายจากป้าย 3D

เพิ่ม `scene-thai-latin.ttf` โดยคงเส้นตัวไทยและ shaping tables ของ Kart แล้วเติมเฉพาะเส้นตัวอักษรอังกฤษที่ว่างจาก Geist ซึ่งมีใน repository อยู่แล้ว ไม่แก้ต้นฉบับทั้งสองไฟล์ ชื่อฟอนต์รวมและ provenance แยกไว้ใน `public/fonts/scene-thai-latin.txt` ทดสอบ outline จริงแล้ว ไม่พึ่ง remote fallback

`scripts/build-scene-font.py` ใช้ fonttools เฉพาะเวลาสร้าง asset ใหม่ ไม่เพิ่ม runtime/package dependency ในเกม การสร้างครั้งนี้ใช้ fonttools 4.67.0 ใน temporary tool directory

## การตรวจจริงและหลักฐาน

เปิดผ่าน admin selection เดิม → prep lobby → ห้องเรียนระดับ 5 ไม่แก้ localStorage หรือปลดล็อกผ่านโค้ด

- เดินจริงด้วย WASD + drag-to-look fallback จาก spawn `(7.395, 0.799, 2.827)` → ทางเดินขวา `(5.301, 0.799, 1.041)` → หน้าห้อง `(3.612, 0.799, -3.720)` → หน้าโต๊ะฝั่งกล้อง `(-2.071, 0.799, -3.028)`
- เดินชนขาตั้งหยุดที่ `(-4.950, 0.799, -3.043)` กดเดินต่ออีกช่วงแล้วตำแหน่งไม่เปลี่ยน อ้อมขาตั้งได้ถึง `(-6.464, 0.799, -3.038)`
- เปิดกระเป๋าด้วย R, หยิบ HDMI แล้วเล็งพอร์ตหลังกล้องจากตำแหน่งที่เดินถึงจริง กด E ได้ข้อความ `เชื่อมต่อสำเร็จ: Classroom HDMI Camera HDMI OUT`
- เปิดเมนูหยุดเกม → ฝึกต่อได้ แล้วใช้เมนูออกจากห้องฝึกกลับโถงตามระบบเดิม
- ภาพ A–H/J และ I หน้า/หลังทุกเครื่องรวม 32 bookmarks อยู่ที่ `art/review/venues/classroom-spec/` พร้อม `captures.json` ไม่อ้างว่ามุมกล้องเท่ากับการทดสอบเดินทุกจุด
- `walk-camera-stop.png`, `connected-camera-port.png` เป็นหลักฐานการเดิน/ต่อสายช่วงที่ตรวจ ไม่ใช่ภาพระบบครบวงจร
- Pure-state tests ครบ canonical solutions ทั้ง 25 ชุด รวมการถอด/ต่อกลับ สายผิด/พอร์ตผิด การคง inventory/progression และกรณีจอดับเมื่อ source ที่เลือกถูกถอดแม้ source อื่นยังต่ออยู่

## วิธีตรวจซ้ำ

1. รัน development server ของ repository ตามปกติใน PowerShell ด้วย `npm run dev` (ไม่ต้องรันซ้ำถ้ามีอยู่แล้ว)
2. เข้า admin ด้วยช่องทางเดิม เลือกบท/ระดับ → เริ่มภารกิจตามปกติ ไม่ใส่รหัสผ่านใน URL หรือไฟล์
3. เพิ่ม `&review=environment` ใน URL `/play?...` เฉพาะเครื่องพัฒนา เข้า prep lobby ตามเดิม เลือกมุมตรวจจากแผงขวา
4. เลือก `กลับไปเดินตรวจ` เพื่อกลับตัวละครจริง โหมดกล้องไม่ teleport ตัวละคร ไม่ต่อสาย/ผ่านด่าน/ให้คะแนน และไม่เปิดใน production
5. F เป็นมุมเฉียงใต้เพดานจริงสำหรับห้องในอาคาร ส่วนกลางแจ้งใช้มุมสูงจริง มีแปลน SVG พร้อมชื่อ furniture / camera / gear และ logical graph ของทั้งห้าห้องที่ `art/review/venues/plans/` สร้างซ้ำด้วย `node scripts/export-environment-plans.mjs` เส้นใน SVG เป็น logical graph ไม่ใช่รูปสายจริงบนพื้น

## ห้อง 02–05: งานที่ดำเนินการต่อจนจบรอบ

| บท | พื้นที่และอุปกรณ์ที่ปรับ | เส้นทางจำลองเดิมที่รักษาและทดสอบ | ภาพจริง / สถานะการเดินตรวจ |
|---|---|---|---|
| 02 | ฉากเขียวซ้าย, ข่าวกลางคืนขวา, สัมภาษณ์ด้านข้าง; กล้องสามทิศ, teleprompter, โครงไฟ/สาย safety, softbox ถ่วงทราย, โต๊ะผลิต, จุดคืนของ, TV/HS5 | Camera HDMI → HDS7105 → Magewell → USB/OBS; COMICA/XS1 → mixer → Program และ HS5 | 42 bookmarks; เดินอ้อมโต๊ะและต่อ CAM1→switcher→TV จริง จอ CAM1 READY; ถอด TV แล้ว NO SIGNAL |
| 03 | หอประชุมใหญ่ 126 ที่ สามบล็อก/สองทางเดิน, วัสดุไม้/ผนังซับเสียง/ฝ้า coffer, FOH, โต๊ะเสียง, กล้องบน riser, flight case รับจอข้างเวที, จุดคืนของหลังห้อง | SDI cameras/slides converter → switcher → AUX Program → converter → LED; ไมค์/RX → analog stagebox → mixer → PA/Broadcast แยก; recorder/OBS | 64 bookmarks; เดินจาก spawn ผ่านหลังห้อง อ้อม FOH ตามทางเดินผู้ชมถึงหน้าเวที |
| 04 | ลานกิจกรรม, เวที truss, เต็นท์ถ่วงน้ำหนัก, ที่นั่ง, fiber case, จุดเก็บกว้างขึ้น, จอ FOH ตามสถานะ, กล้องหลังบน riser | กล้องไกล → SDI/Fiber TX/RX → switcher; กล้องใกล้ SDI; ไมค์/PA/Embedder → encoder → network/ingest จำลอง | 48 bookmarks; เดินจุดเก็บ → ใต้เต็นท์/หลังโต๊ะ → ช่องกลางผู้ชม → หน้าเวที |
| 05 | สนามกลางคืน/อัฒจันทร์แบบ instancing, ห้องควบคุม, โต๊ะ replay/graphics/audio, แร็กเปิดเห็นอุปกรณ์, ช่องบริการหลังแร็ก >0.9m พร้อมไฟ, โต๊ะผู้บรรยาย, กล้องหกทิศหันเข้าการแข่งขัน, จอสนามตามสถานะ | Camera Fiber → CCU → SDI Router → switcher; replay/graphics; stagebox/mixer/intercom; embedder/DA → main+backup encoder/network; AUX → จอสนาม | 98 bookmarks; เดินเข้าห้องควบคุม อ้อมแร็กด้านหลัง ออกประตูเดิม แล้วถึงกล้องข้างสนาม |

### พอร์ตและสัญญาณ

- สตูดิโอใช้ anchor จาก GLB เดิมจริง 22 พอร์ต (HC-X2000, HDS7105, mixer, Samsung, HS5, Magewell, HP, COMICA, XS1) มี test อ่าน GLB อิสระตรวจ scale/rotation/offset ±1mm ไม่สร้างพอร์ตสมมติให้สินค้า confirmed
- `studio-mission-ports.json` ระบุ asset/node/normal/scale/offset/local ไว้ตรวจย้อนกลับ การใช้รุ่น provisional ยังต้องยืนยันจากอุปกรณ์จริง
- พอร์ต generic ห้อง 03–05 ย้ายจากลอยเหนือเครื่องมาแผงจริง มี socket mesh, outward normal, ทิศหัวสาย และความสูงรวม riser/โต๊ะ ใช้ physical hit target เดียวกับที่มองเห็น
- ป้ายชื่อพอร์ตและขั้นตอนอุปกรณ์แสดงเฉพาะที่เล็งเพื่อไม่ซ้อนทับกันเมื่อถือสาย ส่วนวงสีเขียวบอกจุดที่หัวสายเข้ากันยังอยู่
- จอหลัก/จอทวนใช้สถานะสายและ source จาก store เดิม ไม่มีภาพสำเร็จสำเร็จรูปบนจอควบคุม ไฟ link ของ rack แบบฝึกขึ้นตาม route ที่ต่อได้ ไม่อ้างเป็นไฟ AC power
- สายที่ต่อสองด้านแล้วและระยะห่าง >2m ลงพื้น; ห้องใหญ่ใช้แนวบริการริมขวาสำหรับช่วงยาวตาม Z รักษา mesh เก้าช่วงเดิม ไม่ใช่สายฟิสิกส์/การตรวจระยะสูงสุดจริง
- พื้น/ราง/ฝาครอบเดิมคงไว้ เปิดเงาหลักหนึ่งดวงของแต่ละฉาก โดยใช้ ShadowThrottle ทุกแปดเฟรมและ adaptive DPR เดิม

### หลักฐานการเดินห้อง 03–05 (ตำแหน่งตัวละคร ไม่ใช่มุมกล้อง review)

- 03: จาก `(-10.665,0.799,11.07)` → หลังจุดเก็บ `(2.649,0.799,11.871)` → หลังโต๊ะ FOH หยุดชนที่ `(2.650,0.799,8.289)` → อ้อมข้างโต๊ะและเดินถึงหน้าเวที `(3.647,0.799,-3.879)`
- 04: จาก `(-14.58,0.799,14.31)` → ลาน `(1.024,0.799,10.514)` → ใต้เต็นท์ `(5.285,0.799,12.270)` → อ้อม fiber case/เสาเต็นท์ → หน้าเวที `(1.102,0.799,-6.047)`
- 05: จาก `(1.56,0.799,1.56)` → ผ่านประตู `(-3.547,0.799,-2.154)` → หน้าห้อง `(-5.491,0.799,-8.514)` → หลังแร็ก `(-16.357,0.799,-1.425)` → ออกประตู `(2.154,0.799,-0.277)` → กล้องข้างสนาม `(7.688,0.799,15.535)`
- `walk-*.png` อยู่ในโฟลเดอร์ของแต่ละห้อง ใช้ WASD/drag-to-look และ HUD/hands/inventory เดิม ไม่แก้คะแนนหรือเซฟให้ผ่าน
- ตรวจ spatial reach อัตโนมัติแยกจากภาพ: flood-fill บนกริด 0.25m จาก spawn ใช้ layout blockers ขยายด้วยรัศมีตัวละคร 0.29m ทุก port station ต้องอยู่ภายใน reach 2.6m ของพื้นที่ที่เดินต่อเนื่องถึงได้ เป็นการตรวจ footprint โดยประมาณ ไม่แทน mesh raycast ทุกกรณี

## ภาพและผังที่ส่งมอบ

- `art/review/venues/classroom-spec/` — 32 bookmarks + ภาพเดิน/ต่อกล้อง
- `art/review/venues/studio-spec/` — 42 bookmarks + `video-connected-front.png`, `video-disconnected-front.png`
- `art/review/venues/auditorium-spec/` — 64 bookmarks + ภาพเดิน
- `art/review/venues/outdoor-spec/` — 48 bookmarks + ภาพเดิน
- `art/review/venues/stadium-spec/` — 98 bookmarks + ภาพเดิน
- แต่ละชุดมี `captures.json` จับคู่หมายเลขภาพกับมุม A–J และหน้า/หลังของอุปกรณ์ทุกตัว ตัว portable อยู่ใน storage ตอนเริ่มงาน จึงมีบางภาพมองที่ storage แทน operating station
- `art/review/venues/plans/{classroom,studioMission,auditorium,outdoor,stadium}.svg` และ `inventory.json` สร้างจากข้อมูล canonical จริง เพื่อดู footprint, จุดเกิด, furniture, กล้อง, gear และเส้นทางสัญญาณ
- `art/review/venues/five-levels-overview.jpg` — รวมภาพจากเกมจริงทั้งห้า ไม่มีภาพสร้าง AI หรือ mockup

## ไฟล์ที่แก้และสร้าง

แก้ด้านฉาก/เครื่อง: `components/game/environment/venue/{classroom,studio,auditorium,outdoor,stadium,kit,layout-furniture}.tsx`, `components/game/equipment/{device-visual,generic-device}.tsx`

แก้ระบบร่วม: `components/game/{training-room,game-canvas,first-person-controller,hdmi-cables,render-performance}.tsx`, `game/training/{scenarios,venue-layouts,venue-scenarios,monitor-feed}.ts`, `game/content/mission-catalog.ts`, `tests/{venue-scenarios,studio-equipment-alignment}.test.mjs`

สร้าง: `components/game/environment/venue/signal-screen.tsx`, `components/game/equipment/port-socket.tsx`, `game/training/{environment-review,cable-route}.ts`, `game/training/studio-mission-ports.json`, `game/rendering/scene-font.ts`, `scripts/{build-scene-font.py,export-environment-plans.mjs}`, `public/fonts/scene-thai-latin.{ttf,txt}`, รายงานนี้ และภาพ/ผังใน `art/review/venues/`

ไฟล์ UI/CSS/asset preload บางส่วนมี diff ค้างมาก่อนรอบนี้ ไม่อ้างว่าเป็นงานใหม่ทั้งหมด ไม่เพิ่ม dependency ใน package.json ไม่แก้ secret/auth/database

## ผลการตรวจ

- `npm test`: **97/97 ผ่าน** รวม canonical solution ทั้ง 25 ระดับ, ถอด/ต่อคืน, ทิศและชนิดหัวสาย/route ผิด, source switching, inventory, save progression, local font outlines, native GLB anchors, panel normals, camera risers, ช่องทางเดินและการเข้าถึง station
- `npm run lint`: ผ่าน; `npm run build`: ผ่าน (TypeScript + static generation 10/10); `git diff --check`: ผ่าน; ตรวจ `git status` แล้ว ไฟล์ยัง uncommitted ตามคำสั่งผู้ใช้ มี LF/CRLF warning ปกติของ Windows
- เปิดผ่าน admin selection → prep → intro → playable room จริงครบห้า ไม่เปลี่ยน controls/HUD/hands/mission IDs/progression ไม่มี hidden solve หรือ reward bypass
- เปรียบเทียบภาพ front/back/corners/floor/overhead ในฉากจริงเดียวกัน รายการและ geometry ไม่ได้สร้างแยกตามมุม

## ข้อจำกัดที่ระบุไว้ชัดเจน

1. ไม่มี Master file ตามชื่อที่ระบุ จึงรับรองได้เฉพาะงานตามเอกสารแยกทั้งห้าที่มีอยู่ ยังมี generic/provisional training hardware; ไม่อ้างความตรงรุ่นของเครื่องที่ยังไม่ได้ตรวจจริง
2. ภาพกล้อง/Program เป็นข้อความและสถานะจำลอง ไม่ render กล้องสด, OBS จริง หรือส่ง stream/network จริง; ไฟ AC, bandwidth, format negotiation, cable length, physical sag/strain และการครอบสายทุกจุดยังไม่ได้จำลองครบ
3. Unit tests เดิน canonical graph ครบ 25 ระดับ แต่ **ไม่ได้เล่นภารกิจทั้ง 25 ระดับด้วยมือจนครบทุกขั้นใน browser** การเดินจริงเป็นเส้นทางหลักตามที่บันทึก และสตูดิโอมีหลักฐานต่อ/ถอดวิดีโอ จึงไม่ตีความว่า screenshots แทนการจบ full mission ทุกห้อง
4. เป้าหมายเป็นฉาก realtime ใน engine เดิม อุปกรณ์ generic/ต้นไม้/พื้นหลังบางส่วนยังใช้ทรงประหยัด ไม่มี FPS benchmark หรือทดสอบ GPU/mobile ครบชุด ไม่อ้าง photoreal offline หรือผลผ่านบนมือถือ
5. มุม F ในอาคารถ่ายใต้เพดานจริง แปลน annotated เต็มห้องส่งเป็น SVG แยกสำหรับนักพัฒนา ไม่วางทับในเกมจริง
6. ทั้งหมดอยู่ในเครื่อง ยังไม่ commit/push/deploy/seed/migration และไม่แก้ `.env.local` ผู้ใช้สามารถตรวจเกม/ภาพก่อนสั่งขั้นตอน Git หรือ Netlify แยกต่างหาก
