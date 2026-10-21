# 11 · ST: มิกเซอร์ที่เสนอ (รอการอนุมัติ ยังไม่ผูก)

วันที่: 2026-10-20 · **ยังไม่แก้โค้ด ST** · ไม่ใช้สาย Y · ยังไม่ได้ commit

## 1. โปรไฟล์ปัจจุบัน (คงไว้ตามเดิม)
`generic-4ch-mixer` (`game/training/sim/equipment.ts`)
- **ขาเข้า:** IN 1–4 MIC/LINE (XLR)
- **ขาออก:**
  - `main-out` MAIN/PA OUT (XLR, ไลน์สมดุล, 1 ช่อง)
  - `aux-out` STREAM/AUX OUT (**TRS 6.35 สเตอริโอไม่สมดุล −10 dBV**)
- **การควบคุม:** ต่อช่อง (Gain, On, →MAIN, →STREAM/AUX) และ Master สองบัสแยกกัน

**สิ่งที่ ST ต้องใช้:**
- **ช่องไมค์:** ใช้ช่อง 1–3 (ST-05 ใช้ RX1, RX2 และไมค์สาย)
- **สองบัสอิสระ:** บัสลำโพงห้อง (HS5) กับบัสสตรีม (เข้าสวิตเชอร์) ต้องแยกกัน เพราะ objective เรื่องไม่ป้อนกลับและไม่ซ้อน ต้องควบคุมได้แยกต่อช่อง

## 2. ขาเข้าเสียงของสวิตเชอร์ที่เสนอ (ATEM Mini Extreme ISO G2)
- **หน้า techspecs:** "2 x XLR Combo with phantom power", "Balanced stereo XLR combo connectors" และ "+48V phantom power" แต่ไม่ระบุระดับขาเข้าสูงสุด
- **คู่มือ ATEM Mini (ทางการ):** "ATEM Mini Extreme ISO G2 features 2 combination 3 pin XLR TRS 1/4 inch jack connectors, switchable between line and mic level with support for +48V phantom power… via the audio tab of the settings menu in ATEM Software Control"
- **การตีความ:** ขั้ว combo แต่ละช่อง (XLR 3 ขา หรือ TRS 1/4") เป็นขาเข้า **สมดุลโมโน** สเตอริโอจึงต้องใช้ 2 ช่อง (L → combo 1, R → combo 2) และต้องตั้งเป็น **line**
- **ห้ามเสียบตรง:** ขาออก TRS สเตอริโอไม่สมดุลของโปรไฟล์ปัจจุบัน ห้ามเสียบตรงเข้าขาเข้าสมดุลโมโน (L/R จะหักล้างกัน)

## 3. มิกเซอร์ที่ตรวจ
| รุ่น | หลักฐาน | ผล |
|---|---|---|
| **Mackie ProFX12v3** | คู่มือทางการ ProFXv3 Series (https://mackie.com/img/file_resources/ProFXv3_Series_OM2024July.pdf) | ✅ **ผู้สมัครที่ใช้ได้** (ดูข้อ 4) |
| Mackie ProFX10v3 | คู่มือเดียวกัน | ❌ ไม่มี Aux Out/Mon Send (เฉพาะ 12v3 ขึ้นไป) มีแค่ FX Send แบบ post-fader ที่ป้อน FX ภายในด้วย ใช้เป็นบัสลำโพงอิสระไม่เหมาะ |
| Mackie ProFX6v3 | หน้าผลิตภัณฑ์ | ❌ ไมค์ 2 ช่อง ไม่มี AUX |
| Soundcraft Notepad-12FX | หน้าผลิตภัณฑ์ | ⛔ ไม่ระบุชนิดหัวต่อและสมดุลของ Master Out / Aux Out |
| Allen & Heath ZEDi-10FX, Yamaha MG | — | ⛔ เว็บผู้ผลิต 403 |

## 4. Mackie ProFX12v3: ข้อมูลจากคู่มือ
- **Main outputs:** "The male XLR connectors provide a balanced line-level signal" (Pin 1 shield, Pin 2 hot, Pin 3 cold) ช่องซ้ายและขวาแยกกัน ("connect these to the left and right inputs") อยู่หน้าเครื่องในรุ่น 6v3/10v3/12v3 ขา XLR สูงกว่า TRS ประมาณ 6 dB (TRS = 0 dBu เมื่อมิเตอร์อ่าน "0")
- **29. Aux Out / Mon Send** (ProFX12v3 มี 1 jack): "a 1/4" TRS output… to feed… powered stage monitors", "not affected by the main mix fader or the channel faders… pre-fader" ส่วนผสมแยกต่อช่องด้วยปุ่ม aux mon
- **ช่องไมค์:** ProFX12v3 ช่อง 1–4 เป็นช่องโมโนรับไมค์ ใช้ได้กับ 3 ช่องที่ ST ต้องใช้
- **ยังไม่ได้ข้อมูล:** ระดับขาออกสูงสุดของ Main XLR, Mon Send เป็นสมดุลหรือไม่ (คู่มือเขียนแค่ "1/4" TRS output"), ขนาดและน้ำหนัก (ต้องดู spec sheet)

## 5. เส้นทางที่เสนอ (2 การเชื่อมต่อแยกกัน ไม่มีสาย Y)
| edge ใหม่ | ต้นทาง | ปลายทาง | สาย | ระดับ / การตั้งค่า |
|---|---|---|---|---|
| `mix:main-l → sw:combo-1` | ProFX12v3 MAIN OUT L (XLR ตัวผู้ สมดุล ไลน์) | ATEM COMBO IN 1 (XLR ตัวเมีย) | XLR–XLR ไลน์สมดุล (`AUD-XLR-LINE-BAL` เดิม) | ตั้ง ATEM MIC 1 = **Line** และปิด phantom |
| `mix:main-r → sw:combo-2` | ProFX12v3 MAIN OUT R | ATEM COMBO IN 2 | เดียวกัน | ตั้ง ATEM MIC 2 = **Line** |
| `mix:mon-send → speaker:trs-in` | ProFX12v3 MON SEND (1/4" TRS, pre-fader) | Yamaha HS5 INPUT (TRS phone, balanced) | TRS–TRS | ระดับ aux master mon |

**แทนที่ edge เดิม (ยังไม่เปลี่ยน รอการอนุมัติ):**
- `mix:aux-out → sw:audio-in` (`AUD-TRS-635-35`) ใน ST-02/04/05 → เปลี่ยนเป็น 2 edge แรกในตาราง
- `mix:main-out → speaker:xlr-in` (`AUD-PA-ACTIVE`) ใน ST-02/05 → เปลี่ยนเป็น edge ที่ 3

## 6. ผลต่อด่านถ้าอนุมัติ (ต้องการการตัดสินใจ)
1. **หน้าที่บัสสลับกัน:**
   - **ตอนนี้:** MAIN → ลำโพงห้อง, AUX → สตรีม
   - **ProFX12v3:** MAIN L/R (post-fader สเตอริโอ) → สตรีม, MON (pre-fader) → ลำโพงห้อง
   - **ผล:** ชื่อการตั้งค่าใน ST-02/04/05 (`chN-main`, `chN-aux`, `main-fader`, `aux-master`) ต้องเปลี่ยนเป็น `chN-mon` / master ของรุ่นจริง แต่หลักการเรียนรู้ยังเหมือนเดิม (สองบัสแยกกัน)
2. **กระเป๋าสาย ST-02/05:**
   - `AUD-TRS-635-35` ×1 → `AUD-XLR-LINE-BAL` ×2
   - `AUD-PA-ACTIVE` (XLR) ×1 → สาย TRS–TRS ×1 (ต้องเพิ่มชนิดสายในแคตตาล็อก)
   - ST-04 เปลี่ยนแค่ฝั่งสตรีม
3. **fault ใน ST-04/05 ที่อ้างถึงบัส AUX:** ต้องแมปไปที่บัสใหม่ ความหมายเดิมคือ "เสียงไม่เข้าสตรีม"
4. **สวิตเชอร์และมิกเซอร์ต้องเปลี่ยนพร้อมกัน:** เพราะขาเข้า 3.5 mm ของสวิตเชอร์ generic รับ L/R สมดุลสองเส้นไม่ได้
5. **ข้อมูลที่ยังขาด:** ระดับขาออกสูงสุดของ Mackie Main และระดับขาเข้าสูงสุดของ ATEM (ต้องใช้ spec sheet) ต้องยืนยันก่อนผูก เพื่อไม่ให้เสียงแตก

## 7. สถานะ
- **ST ในเกม:** **ไม่เปลี่ยน** ทั้งสวิตเชอร์ generic, มิกเซอร์ generic, edge และ objective เดิม (ข้อ 1 และ 8 ของคำสั่ง)
- **รอเจ้าของอนุมัติ:**
  - (1) ใช้ Mackie ProFX12v3 + ATEM Mini Extreme ISO G2 และยอมรับการสลับหน้าที่บัสตามข้อ 6
  - (2) ให้ตรวจ spec sheet ระดับสัญญาณก่อน
  - (3) ถ้าสถาบันมีมิกเซอร์รุ่นอื่น ให้ส่งรุ่นมา

---
## อัปเดต: ผลตรวจขั้นสุดท้าย
ดู `docs/hardware-3d/12_ST_HARDWARE_VERIFICATION_TH.md`: ProFX12v3 (SW1278 Rev. F), HS5 และเส้นทาง L/R ผ่าน แต่ **ยังไม่ผูก** เพราะยังไม่มีระดับขาเข้าสูงสุดของ ATEM Mini Extreme ISO G2 และวิธีควบคุม phantom แยกช่องในเอกสารทางการ
