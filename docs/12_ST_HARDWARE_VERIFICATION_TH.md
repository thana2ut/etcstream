# 12 · รายงานตรวจฮาร์ดแวร์ ST ขั้นสุดท้าย (Mackie ProFX12v3 + ATEM Mini Extreme ISO G2 + Yamaha HS5)

วันที่: 2026-10-20 · **ผลสรุป: ยังไม่ผูก** เพราะยังขาดข้อมูลทางการ 2 ข้อที่จำเป็นต่อการต่อสัญญาณ (ข้อ 5) · ST ในเกมยังเหมือนเดิม · ยังไม่ได้ commit

## 1. รุ่นและรุ่นปี
| อุปกรณ์ | รุ่นที่ยืนยัน | เอกสารทางการ |
|---|---|---|
| มิกเซอร์ | **Mackie ProFX12v3** (ProFXv3 ไม่ใช่ ProFXv3+ ซึ่งมีคู่มือแยกต่างหาก) | ProFXv3 Series Owner's Manual, **Part No. SW1278 Rev. F 02/24**: https://mackie.com/img/file_resources/ProFXv3_Series_OM2024July.pdf |
| สวิตเชอร์ | **Blackmagic ATEM Mini Extreme ISO G2** | techspecs https://www.blackmagicdesign.com/products/atemmini/techspecs + คู่มือ ATEM Mini https://documents.blackmagicdesign.com/UserManuals/ATEM_Mini_Manual.pdf |
| ลำโพงมอนิเตอร์ | **Yamaha HS5** | HS8/HS7/HS5/HS8S Owner's Manual: https://data.yamaha.com/files/download/other_assets/4/329474/HS8_en_om_a0.pdf |

## 2. ผลตรวจทีละข้อ
| ข้อ | สิ่งที่ตรวจ | ผล | หลักฐาน |
|---|---|---|---|
| 2 | MAIN L และ MAIN R เป็น XLR สมดุลแยกกัน | ✅ | "The male XLR connectors provide a balanced line-level signal" Pin 1 shield, 2 hot, 3 cold ต่อซ้ายและขวาแยกกัน · ระดับสูงสุด **Main Mix XLR +28 dBu** · XLR สูงกว่า TRS ~6 dB (TRS 0 dBu ที่มิเตอร์ "0") |
| 3 | MON SEND 1/4" TRS แบบ pre-fader | ✅ (สมดุลหรือไม่ ⚠) | "29. Aux Out / Mon Send… a 1/4" TRS output", "not affected by the main mix fader or the channel faders… pre-fader" ProFX12v3 มี 1 jack · ระดับสูงสุดของ "All other outputs" +22 dBu · คู่มือไม่ได้เขียนตรงๆ ว่า MON SEND เป็นสมดุล (ตาราง impedance มีทั้ง "120 Ω Unbalanced, 240 Ω Balanced" สำหรับ "All other outputs") |
| 4 | ATEM combo 2 ช่อง, ตั้ง line, gain, phantom | ✅ บางส่วน / ⛔ บางส่วน | คู่มือ: "2 combination 3 pin XLR TRS 1/4 inch jack connectors, switchable between line and mic level with support for +48V phantom power", ตั้ง mic/line ที่แท็บ Audio ใน ATEM Software Control, Fairlight มี input level (gain) และ pan ต่อช่อง · **⛔ ระดับขาเข้าสูงสุด (line) ไม่มีในสเปก G2** (+6 dBV ที่พบเป็นของ Extreme รุ่นเดิมแบบ 3.5 mm) · **⛔ วิธีปิด phantom แยกช่องไม่ระบุในคู่มือภาษาอังกฤษ** |
| 5 | ปิด phantom เมื่อรับไลน์ | ⛔ ยืนยันวิธีไม่ได้ | ยังไม่ทราบว่าสวิตช์ phantom แยกต่อช่องหรือรวมกัน และอยู่ที่ใด ในเกมจะบังคับให้ "ปิด" เมื่อรับไลน์ แต่ต้องรู้ control จริงก่อน |
| 6 | HS5 ขาเข้า และเข้ากับ MON SEND | ✅ | "one balanced XLR connector, and one balanced (TRS) phone jack… can not be used simultaneously", optimized for nominal +4 dB, input −10 dBu / 10 kΩ ขั้วเข้ากับ MON SEND 1/4" TRS ได้ ระดับ +22 dBu สูงสุดเพียงพอ (ปรับด้วย aux master mon) |
| 9 | ATEM คง L/R | ✅ | Fairlight ใน ATEM: "Each audio channel has a simple stereo pan control" → ตั้ง MIC 1 pan ซ้ายสุด, MIC 2 pan ขวาสุด |

## 3. เส้นทางสัญญาณ 3 เส้น (ข้อ 7–8)
| # | เส้นทาง | สาย / เพศหัวต่อ | การเดินสาย | ระดับ | การตั้งค่า |
|---|---|---|---|---|---|
| 1 | Mackie **MAIN OUT L** → ATEM **Audio In 1** (combo) | XLR ตัวเมีย (เสียบมิกเซอร์ซึ่งเป็นตัวผู้) ↔ XLR ตัวผู้ (เสียบ combo) · สายไมค์/ไลน์สมดุล 3 ขา (`AUD-XLR-LINE-BAL`) | Pin 1 shield, 2 hot, 3 cold ทั้งสองปลาย | ไลน์สมดุล ~+4/+6 dBu nominal, สูงสุด +28 dBu | ATEM MIC 1 = Line, **phantom ปิด**, pan ซ้าย |
| 2 | Mackie **MAIN OUT R** → ATEM **Audio In 2** | เหมือนข้อ 1 | เหมือนข้อ 1 | เหมือนข้อ 1 | MIC 2 = Line, phantom ปิด, pan ขวา |
| 3 | Mackie **MON SEND** → Yamaha **HS5 INPUT (TRS)** | TRS 1/4" ↔ TRS 1/4" (6.35 mm) | Tip hot, Ring cold, Sleeve shield (ถ้า MON SEND เป็นสมดุล) | ไลน์, สูงสุด +22 dBu · HS5 nominal +4 | HS5 LEVEL ที่ center click และไม่เสียบ XLR พร้อมกัน |

ไม่มีอะแดปเตอร์ ไม่มีสาย Y และไม่มีพอร์ตที่คิดขึ้นเอง

## 4. พฤติกรรมในเกมที่ต้องคงไว้ (ข้อ 10)
- **บัส MAIN (post-fader สเตอริโอ):** ส่งไปสตรีม
- **บัส MON (pre-fader โมโน):** ส่งไปลำโพงในห้อง
- **การควบคุมต่อช่อง:** แยกกันอิสระ (`chN-main`, `chN-mon`) ทำให้ objective "ไม่ซ้อน/ไม่ป้อนกลับ" ยังสอนได้เหมือนเดิม
- **พร้อมเขียนแล้วแต่ยังไม่นำไปใช้:** ร่างการเปลี่ยนแปลงสำหรับ ST-02/04/05 (edge, กระเป๋า, fault, objective) อยู่ในเอกสาร 11 ข้อ 6

## 5. เหตุผลที่ยังไม่ผูก (ตามข้อ "bind only if every mission-critical connection is technically compatible")
1. **ระดับขาเข้าสูงสุดของ ATEM Mini Extreme ISO G2 (โหมด line):** ไม่มีในหน้าสเปกทางการและคู่มือ จึงพิสูจน์ไม่ได้ว่า Main XLR (+4/+6 dBu nominal, สูงสุด +28 dBu) จะไม่ทำให้เสียงแตก
2. **การควบคุม +48V phantom ของ combo แต่ละช่อง:** คู่มือไม่ระบุ จึงสร้าง control ที่ตรงกับเครื่องจริงไม่ได้
3. **(รอง) MON SEND สมดุลหรือไม่:** คู่มือไม่ได้ระบุตรงๆ แต่ไม่ขัดการใช้งาน เพราะ HS5 รับ TRS ได้ทั้งสองแบบ

## 6. สิ่งที่ต้องการเพื่อปิดงาน
- **เอกสารจาก Blackmagic:** spec sheet หรือ PDF tech specs ของ ATEM Mini Extreme ISO G2 ที่ระบุระดับขาเข้า analog สูงสุดและการเปิด/ปิด phantom (ปุ่ม "Print PDF" บนหน้า techspecs) หรือเจ้าของส่งภาพเมนู Audio จากเครื่องจริง
- **เอกสารจาก Mackie:** spec sheet ProFX12v3 ยืนยัน MON SEND ว่าเป็น balanced หรือ impedance-balanced
- เมื่อได้ครบ ผมจะผูก ProFX12v3 + ATEM Mini Extreme ISO G2 + เส้นทาง 3 เส้นนี้ใน ST-02/04/05 พร้อมแก้กระเป๋า fault objective ข้อความย้ายข้อมูลบันทึกเล่นต่อ และตรวจกราฟทั้ง 331 เส้นใหม่

## 7. สถานะไฟล์
- **โค้ด:** ไม่ได้แก้ในรอบนี้ ST ยังใช้ `generic-studio-switcher` + `generic-4ch-mixer` และเส้นทางเดิมที่ผ่านการตรวจแล้ว
- **สถานที่อื่น:** ไม่มีการเปลี่ยน
- **โมเดล 3D:** ยังไม่เริ่ม

---
## อัปเดต: ตรวจ Print PDF ทางการของ ATEM Mini Extreme ISO G2 (W-APS-44)
- **แหล่ง:** `https://www.blackmagicdesign.com/api/print/to-pdf/products/atemmini/techspecs/W-APS-44?filename=atem-mini-extreme-iso-g2-techspecs.pdf` (ลิงก์ "Print PDF" ของรุ่น G2 บนหน้า techspecs ทางการ) เปิดเมื่อ 2026-10-20 ใช้เอกสารของรุ่น G2 เท่านั้น
- **ข้อความที่ยืนยันได้:**
  - Total Audio Inputs: "2 x XLR Combo with phantom power."
  - Analog Input: "Balanced stereo XLR combo connectors"
  - Mic Plug In Power: "+48V phantom power on XLR combo inputs"
  - Audio Mixer: "26 input x 2 channel mixer (8 HDMI+16MADI+XLR+Thunderbolt)… separate gain control per channel"
  - Audio Recording: "Including 1 x analog 2 channel audio input"
- **ข้อสรุปใหม่ (ยืนยันแล้ว):**
  - combo ทั้งสองช่องเป็น **ขาเข้าแอนะล็อกสเตอริโอ 1 ชุด (2 ช่อง)** ใน mixer ดังนั้น **combo 1 = L และ combo 2 = R** ตรงกับเส้นทางที่เสนอ (MAIN L → In 1, MAIN R → In 2) โดยไม่ต้องตั้ง pan เพิ่ม
  - mixer มี gain แยกต่อช่อง
  - การสลับ mic/line ยืนยันจากคู่มือทางการ ATEM Mini ส่วนที่เขียนถึง "ATEM Mini Extreme ISO G2"

### สองข้อที่ยังขาด
| ข้อ | ผลใน PDF ทางการ G2 | สถานะ |
|---|---|---|
| ระดับขาเข้าแอนะล็อกสูงสุด (โหมด line) | **ไม่มีระบุ** ใน PDF ไม่มีตัวเลข dBu/dBV เลย (+6 dBV ที่เคยพบเป็นของรุ่นเก่า ไม่นำมาใช้) | **PENDING VERIFICATION** |
| วิธีควบคุม +48V phantom (แยกต่อช่องหรือรวม และอยู่ที่เมนูใด) | ระบุแค่ "+48V phantom power on XLR combo inputs" ไม่บอกวิธีควบคุม | **PENDING VERIFICATION** |

**ผล:** ยังไม่ผูก ST ตามเงื่อนไขเดิม ไม่ได้ใส่ค่าหรือ control ที่คิดขึ้นเอง และงานวิจัย ST เดิมยังอยู่ครบ (เอกสาร 11, 12)

### ทางที่จะปิดสองข้อนี้ได้
1. เจ้าของส่งภาพหน้าเมนู Audio / Analog Input ของ ATEM Software Control หรือแผงหน้าเครื่อง G2 จริง จะยืนยันวิธีควบคุม phantom ได้
2. ถาม Blackmagic Support เรื่องระดับขาเข้าสูงสุดของ combo ในโหมด line
3. **ทางเลือกทางเทคนิค (รอการอนุมัติ):** ถ้ายืนยันได้แค่ข้อ phantom ให้ตั้งระดับขาออก MAIN ของ Mackie จากเฟดเดอร์และมิเตอร์ (TRS 0 dBu) แต่การยืนยันว่าไม่แตกยังต้องใช้ตัวเลขจากผู้ผลิต

---
## แก้ไขข้อสรุป: การแมป Analog Input 1/2 เป็นซ้าย/ขวา (เพิ่มเป็นข้อตรวจแยก)
**ข้อสรุปในหัวข้อ "ข้อสรุปใหม่ (ยืนยันแล้ว)" ด้านบนเรื่อง "combo 1 = L, combo 2 = R โดยไม่ต้องตั้ง pan" ขอถอนกลับเป็น PENDING** เหตุผล: PDF ทางการระบุแค่ว่าเป็น "Balanced stereo XLR combo connectors" และ "1 x analog 2 channel audio input" ซึ่งไม่ได้บอกว่าขาเข้า 1 แมปไปซ้ายและขาเข้า 2 แมปไปขวาโดยอัตโนมัติ ส่วนคู่มือ ATEM Mini มีการปรับ pan/balance ใน Fairlight แต่ไม่มีข้อความยืนยันการแมปของ combo บน G2 (ตรวจแล้ว ไม่พบ)

## สถานะข้อที่ยังเปิด (ST)
| # | ข้อที่ต้องยืนยัน | สถานะ |
|---|---|---|
| 1 | ระดับขาเข้าแอนะล็อกสูงสุดของ combo ในโหมด line (G2) | **PENDING VERIFICATION** |
| 2 | วิธีควบคุม +48V phantom (แยกต่อช่องหรือรวม, อยู่ที่ใด, ค่าเริ่มต้น) | **PENDING VERIFICATION** |
| 3 | Analog Input 1/2 แมปเป็นซ้าย/ขวาโดยอัตโนมัติ หรือต้อง pan ใน Fairlight เอง | **PENDING VERIFICATION** |

## คำถามสำหรับ Blackmagic Design Support (รุ่น ATEM Mini Extreme ISO G2, W-APS-44)
1. What is the maximum analog input level (dBu) of the two XLR/TRS combo inputs when set to line level, and the nominal line level they are designed for?
2. How is +48V phantom power controlled on the two combo inputs: independently per input or together? Where is it switched (ATEM Software Control audio settings, front panel), and what is the factory default?
3. Are combo input 1 and combo input 2 presented to the Fairlight mixer as the left and right channels of a single stereo analog input by default, or as two mono channels that must be panned manually? If they can be split, what is the default after a factory reset?
4. When an input is set to line level, is phantom power automatically disabled, or must it be turned off separately?
5. Is there a documented input impedance for the combo inputs in mic and line modes?

(ส่งคำถามเป็นภาษาอังกฤษตามช่องทาง Support ของผู้ผลิต และแนบเลขรุ่นกับเวอร์ชันซอฟต์แวร์ที่ใช้)

ST ยังไม่ผูก โค้ด ST ไม่เปลี่ยน
