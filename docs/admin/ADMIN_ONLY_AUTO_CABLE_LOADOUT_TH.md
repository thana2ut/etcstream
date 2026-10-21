> อัปเดต V8: แนวทางปัจจุบันใช้ grant ฝั่งเซิร์ฟเวอร์และเกมที่ฝังใน `/admin` ไม่ใช้ selected.admin/localStorage เพื่อข้ามหน้าสาย รายงานด้านล่างเป็นประวัติรุ่นก่อน โปรดใช้ `ETCSTREAM_ADMIN_V8_IMPLEMENTATION_TH.md` เป็นข้อมูลปัจจุบัน

# ผู้ดูแล: เข้าด่านโดยตรงพร้อมสายที่ต้องใช้ในกระเป๋า

วันที่: 2026-10-20

## 1. ไฟล์ที่แก้และการยืนยันสิทธิ์
| ไฟล์ | สิ่งที่ทำ |
|---|---|
| `game/content/admin-loadout.ts` (ใหม่) | `buildAdminLoadout(scenario)`, `hasAdminSession()`, `markAdminSession()` |
| `app/missions/admin/page.tsx` | เมื่อรหัสผ่านถูกต้อง เรียก `markAdminSession()` ก่อน `setUnlocked(true)` |
| `app/play/page.tsx` | ตัวแปร `adminLaunch`, effect ที่เตรียมสายให้ผู้ดูแล, หน้าโหลด และหน้าแจ้งข้อผิดพลาดของผู้ดูแล, ปุ่มกลับของหน้าต่างเล่นต่อพาไป `/missions/admin` |

**เงื่อนไขของการเข้าแบบผู้ดูแล:**
1. ภารกิจที่เลือกมีธง `progress.selected.admin` ซึ่งตั้งโดย `MissionHall admin` หลังผ่านหน้ารหัสผ่าน
2. แท็บนี้มี `sessionStorage["etcstream_admin_session"] = "1"` ที่ตั้งเมื่อกรอกรหัสผ่านถูก เก็บแค่เครื่องหมาย ไม่เก็บรหัสผ่าน และหายเมื่อปิดแท็บ
3. ภารกิจหรือระดับใน URL ตรงกับที่เลือกไว้ และด่านเป็นภารกิจ

ใส่ `?admin=true` หรือพิมพ์ `/play` เองจะไม่เข้าเงื่อนไข หมายเหตุ: นี่เป็นเกมฝั่งเบราว์เซอร์ที่ไม่มีเซิร์ฟเวอร์ตรวจสิทธิ์ (ดู SECURITY.md) ผู้ที่แก้ storage เองได้ก็เลี่ยงได้ ระดับการป้องกันจึงเท่ากับหน้ารหัสผ่านเดิม

## 2. ที่มาของสายที่ต้องใช้
`buildAdminLoadout` อ่าน `scenario.canonical` ของด่านที่ใช้งานอยู่ ซึ่ง `buildVenueScenario` สร้างจาก `stage.solution` ของ manifest ปัจจุบัน แต่ละเส้นทางชี้ไปที่สายจริงหนึ่งเส้น (`cableId`):
- **ข้ามสาย:** ที่ต่อไว้แล้วตั้งแต่เริ่มด่าน (`initialConnections`) หรือติดมากับอุปกรณ์ (`fixedA`)
- **ไม่สร้างสาย:** สำหรับเส้นทางไร้สายหรือเส้นทางภายในอุปกรณ์ เพราะไม่มีสายจริงในข้อมูล
- **ตรวจซ้ำ:** ชุดที่ได้ต้องเท่ากับ `requiredBag()` ซึ่งหน้าเตรียมสายของผู้เล่นใช้ตรวจ และต้องผ่าน `checkMissionBag()` ถ้าไม่ตรง จะหยุดและแจ้งปัญหา

## 3. สายแต่ละเส้นอยู่ที่เดียว
- **เริ่มด่าน:** เรียก `resetTraining(scenarioId, [], leads)` ซึ่งเป็นทางเดิมของ store สายใน `leads` เริ่มอยู่ในกระเป๋า (`bagged`) ไม่แสดงในห้อง และไม่ได้เสียบพอร์ตใด
- **สายที่เหลือ:** อยู่ที่จุดเก็บสายในห้องตามกฎเดิม (สต็อกภารกิจไม่ถูกซ่อน)
- **ระหว่างเล่น:** ใช้ระบบเดิมทั้งหมด หยิบจากกระเป๋า (R) เสียบ ถอด ตรวจสัญญาณ ทดสอบ และส่งงาน ไม่มีการต่อสาย ทดสอบ หรือผ่านด่านให้อัตโนมัติ

## 4. สายชนิดเดียวกันหลายเส้น และด่านที่ใช้สายมาก
`leads` เก็บรหัสสายแต่ละเส้นแยกกัน ชนิดเดียวกันหลายเส้นจึงยังเป็นสายคนละเส้น กระเป๋าในห้องภารกิจ (`MissionStockPanel`) จัดกลุ่มตามชนิดพร้อมจำนวน จึงแสดงด่านใหญ่ได้ (เช่น SP-05 50 เส้น) โดยไม่ต้องขยายกระเป๋าของผู้เล่นทั่วไป

## 5. เริ่มใหม่ / เล่นต่อ
- บันทึกของผู้ดูแลใช้ key `:mission-admin:` ที่แยกจากผู้เล่นอยู่แล้ว
- **มีบันทึกค้าง:** หน้าต่าง "พบการฝึกที่ยังดำเนินอยู่" แสดงก่อน
  - เล่นต่อ: ใช้กระเป๋าและห้องจากบันทึก ไม่เติมสายซ้ำ
  - เริ่มใหม่ (ยืนยันแล้ว): ลบเฉพาะบันทึกนั้น แล้วจึงเตรียมสายใหม่
- **การเตรียมสายอัตโนมัติ:** ทำเฉพาะตอน `resumeOffer === null` (ตรวจแล้วไม่มีบันทึก หรือผู้ดูแลเลือกเริ่มใหม่) และ `bag === null`
- **ปุ่ม "เล่นใหม่" หลังจบด่าน:** ลบบันทึกแล้วเตรียมสายใหม่หนึ่งครั้ง

## 6. ผู้เล่นทั่วไปและห้องฝึกอิสระ
- **ผู้เล่นทั่วไป:** ไม่ได้แก้ขั้นตอนใดเลย บรีฟ → เลือกสายเอง → ตรวจกระเป๋า → เข้าห้อง
- **ห้องฝึกอิสระ:** `routeMode` ไม่ใช่ `mission` จึงไม่เข้าเงื่อนไข
- **ข้อมูลภารกิจ:** ไม่ได้แก้ข้อมูลภารกิจ พอร์ต ตัวตรวจกระเป๋า หรือความคืบหน้า

## 7. ปัญหาข้อมูลและผลการตรวจ
- รัน `buildAdminLoadout` กับทั้ง 25 ด่านด้วย `npx tsx` (อ่านข้อมูลเท่านั้น ไม่ได้เล่นเกม) **สร้างได้ครบทั้ง 25 ด่าน ไม่มีปัญหาข้อมูล**
- **AU-04:** ไม่ต้องใช้สายเพิ่ม ระบบต่อไว้ครบแล้ว กระเป๋าจึงว่างและเข้าห้องได้ทันที
- `tsc --noEmit` ผ่าน

## 8. รายการตรวจ 25 ด่าน (*ผลตามที่โค้ดคาดไว้ ยังไม่ได้ทดสอบในเกม*)
| ด่าน | สายที่เตรียม (ชนิด × จำนวน) | เข้าแบบผู้ดูแลได้หรือไม่ (เจ้าของโครงการตรวจ) |
|---|---|---|
| XS-01 | VID-HDMI-A-A×2 (2 เส้น) | ☐ |
| XS-02 | AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-PA-ACTIVE×1 (3) | ☐ |
| XS-03 | VID-HDMI-A-A×3, DATA-USB-WEBCAM×1 (4) | ☐ |
| XS-04 | DATA-USB-WEBCAM×1 (1) | ☐ |
| XS-05 | VID-HDMI-A-A×3, DATA-USB-WEBCAM×1, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-PA-ACTIVE×1, AUD-TRS-635-35×1 (8) | ☐ |
| ST-01 | VID-HDMI-A-A×2 (2) | ☐ |
| ST-02 | AUD-LAV-TX×2, AUD-RX-MIXER-XLR×2, AUD-TRS-635-35×1, AUD-PA-ACTIVE×1 (6) | ☐ |
| ST-03 | VID-HDMI-A-A×4 (4) | ☐ |
| ST-04 | DATA-USB-MAGEWELL×1 (1) | ☐ |
| ST-05 | VID-HDMI-A-A×5, DATA-USB-MAGEWELL×1, AUD-LAV-TX×2, AUD-RX-MIXER-XLR×2, AUD-XLR-MIC×1, AUD-TRS-635-35×1, AUD-PA-ACTIVE×1 (13) | ☐ |
| AU-01 | VID-SDI-3G×2, VID-HDMI-A-A×1 (3) | ☐ |
| AU-02 | AUD-XLR-MIC×3, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×2, AUD-XLR-LINE-BAL×2 (9) | ☐ |
| AU-03 | VID-SDI-3G×7, VID-HDMI-A-A×2 (9) | ☐ |
| AU-04 | ไม่ต้องใช้สาย (0) | ☐ |
| AU-05 | VID-SDI-3G×9, VID-HDMI-A-A×2, DATA-USB-MAGEWELL×1, AUD-XLR-MIC×6, AUD-RX-MIXER-XLR×4, AUD-LAV-TX×2, STG-MULTICORE×1, AUD-PA-ACTIVE×2, AUD-XLR-LINE-BAL×2 (29) | ☐ |
| OUT-01 | VID-SDI-3G×2 (2) | ☐ |
| OUT-02 | AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-XLR-MIC×2, AUD-PA-ACTIVE×1 (5) | ☐ |
| OUT-03 | VID-SDI-3G×5, FIB-SDI-LINK×1 (6) | ☐ |
| OUT-04 | VID-SDI-3G×1 (1) | ☐ |
| OUT-05 | VID-SDI-3G×7, FIB-SDI-LINK×1, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, AUD-XLR-MIC×2, AUD-PA-ACTIVE×1, AUD-XLR-LINE-BAL×2, NET-CAT5E6-ENCODER×1, NET-ROUTER-UPLINK×1 (17) | ☐ |
| SP-01 | VID-SDI-6G-12G×1, FIB-CAMERA-CCU×1, VID-SDI-3G×3 (5) | ☐ |
| SP-02 | AUD-XLR-MIC×11, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×1, AUD-XLR-TRS-BAL×2 (17) | ☐ |
| SP-03 | VID-SDI-6G-12G×6, FIB-CAMERA-CCU×6, VID-SDI-3G×17, CTRL-REPLAY×1, VID-HDMI-A-A×1 (31) | ☐ |
| SP-04 | VID-SDI-3G×1 (1) | ☐ |
| SP-05 | VID-SDI-6G-12G×6, FIB-CAMERA-CCU×6, VID-SDI-3G×21, CTRL-REPLAY×1, VID-HDMI-A-A×1, AUD-XLR-MIC×11, AUD-LAV-TX×1, AUD-RX-MIXER-XLR×1, STG-MULTICORE×1, AUD-PA-ACTIVE×1, AUD-XLR-TRS-BAL×2, NET-CAT5E6-ENCODER×2, NET-ROUTER-UPLINK×2 (56) | ☐ |

**ควรดูเมื่อทดสอบ:**
- เลือกด่านจาก `/missions/admin` แล้วต้องเข้าห้องทันที ไม่เห็นหน้าบรีฟหรือหน้าเตรียมสาย
- มีข้อความ "จัดเตรียมสายสำหรับทดสอบเรียบร้อยแล้ว"
- กด R แล้วเห็นสายครบตามตาราง
- ไม่มีสายใดเสียบอยู่เอง

> อัปเดต 2026-10-20: SP ใช้ระบบไฟเบอร์ Blackmagic (ตัวเลือก B) จึงมีสาย 12G SDI สั้นกล้อง→Camera Fiber Converter เพิ่ม
