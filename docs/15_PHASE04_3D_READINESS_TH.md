# 15 · Phase 04: ความพร้อมทำโมเดล 3D

วันที่: 2026-10-20 · ยังไม่ได้เริ่มทำโมเดล 3D · ไม่แก้ Free Practice · ยังไม่ได้ commit

**แหล่งข้อมูล:** รูปทางการจากหน้า techspecs ของ Blackmagic Design ในโฟลเดอร์ `physical-specifications` และ `connections` อ่านทั้งรูปขนาดและรูปหัวต่อของทุกรุ่น
**ไฟล์สเปกแยกรุ่น:** `assets/specs/<model>/3D_MODELING_SPEC_TH.md`

## ✅ พร้อมทำโมเดล (ผ่านด่าน 1–3)
| รุ่น | model key | ด่าน | ขนาด | น้ำหนัก |
|---|---|---|---|---|
| ATEM Mini Pro | `bmd-atem-mini-pro` | XS | กว้าง 9.35 in ≈ 237 mm · ลึก 4.07 in ≈ 103 mm · สูง 1.38 in ≈ 35 mm | 19.4 oz ≈ 0.550 kg |
| ATEM Television Studio HD8 ISO | `bmd-atem-television-studio-hd8-iso` | AU, OUT | กว้าง 23 in ≈ 584 mm · ลึก 14.8 in ≈ 376 mm · สูง 6.35 in ≈ 161 mm | 14.9 lb ≈ 6.76 kg |
| ATEM 2 M/E Constellation 4K | `bmd-atem-2me-constellation-4k` | SP | กว้าง 19 in ≈ 483 mm · ลึก 9.22 in ≈ 234 mm · สูง 1.74 in ≈ 44 mm | 8 lb ≈ 3.63 kg |
| Videohub 20x20 12G | `bmd-videohub-20x20-12g` | SP | กว้าง 19 in ≈ 483 mm · ลึก 9.3 in ≈ 236 mm · สูง 1.74 in ≈ 44 mm | 7.87 lb ≈ 3.57 kg |
| Streaming Encoder HD | `bmd-streaming-encoder-hd` | OUT, SP | กว้าง 5.51 in ≈ 140 mm · ลึก 6.9 in ≈ 175 mm · สูง 1.75 in ≈ 44 mm | 1.66 lb ≈ 0.75 kg |
| HyperDeck Studio HD Plus | `bmd-hyperdeck-studio-hd-plus` | AU, SP | กว้าง 8.27 in ≈ 210 mm · ลึก 6.96 in ≈ 177 mm · สูง 1.74 in ≈ 44 mm | 2.53 lb ≈ 1.15 kg |
| Micro Converter HDMI to SDI 3G | `bmd-micro-converter-hdmi-sdi-3g` | หลายด่าน | ยาว 3.13 in ≈ 80 mm · กว้าง 1.8 in ≈ 46 mm · สูง 0.98 in ≈ 25 mm | 5.29 oz ≈ 0.150 kg |
| Micro Converter SDI to HDMI 3G | `bmd-micro-converter-sdi-hdmi-3g` | หลายด่าน | ยาว 3.13 in ≈ 80 mm · กว้าง 1.8 in ≈ 46 mm · สูง 0.98 in ≈ 25 mm | 5.29 oz ≈ 0.150 kg |
| SmartView Duo | `bmd-smartview-duo` | AU, OUT, SP | กว้าง 19 in ≈ 483 mm · ลึก 1.38 in ≈ 35 mm · สูง 5.24 in ≈ 133 mm | 3.15 lb ≈ 1.43 kg |
| Studio Camera 4K Plus G2 | `bmd-studio-camera-4k-plus-g2` | XS | กว้าง 10.77 in ≈ 274 mm · ลึก 6.68 in ≈ 170 mm · สูง 6.59 in ≈ 167 mm | 3 lb ≈ 1.36 kg |
| Studio Camera 4K Pro G2 | `bmd-studio-camera-4k-pro-g2` | AU, OUT | กว้าง 10.77 in ≈ 274 mm · ลึก 6.68 in ≈ 170 mm · สูง 6.59 in ≈ 167 mm | 3.71 lb ≈ 1.68 kg |
| URSA Broadcast G2 | `bmd-ursa-broadcast-g2` | SP | กว้าง 5.9 in ≈ 150 mm · ยาว 10.95 in ≈ 278 mm · สูง 9.93 in ≈ 252 mm | 7.83 lb ≈ 3.55 kg |
| Camera Fiber Converter | `bmd-camera-fiber-converter` | SP | กว้าง 5.43 in ≈ 138 mm · สูง 7.51 in ≈ 191 mm · ลึก 5.51 in ≈ 140 mm | 4.85 lb ≈ 2.20 kg |
| Studio Fiber Converter | `bmd-studio-fiber-converter` | SP | กว้าง 8.28 in ≈ 210 mm · สูง 3.48 in ≈ 88 mm · ลึก 14.64 in ≈ 372 mm | 6.17 lb ≈ 2.80 kg |

## ⛔ ยังต้องหาข้อมูลอ้างอิงเพิ่ม
| รุ่น | สถานะ | ที่ยังขาด |
|---|---|---|
| AJA 3G-AMA (`aja-3g-ama`) | พอร์ตยืนยันแล้ว (ด่าน 1–2) | ยังไม่ได้ดึงรูปขนาดและแผงหัวต่อจาก aja.com และกล่อง breakout DB-25 |
| Magewell USB Capture SDI Gen 2 | พอร์ตยืนยันแล้ว | ยังไม่ได้ดึงรูปทางการ และชนิดหัว USB ฝั่งอุปกรณ์ยัง PENDING |
| ST: Mackie ProFX12v3 + ATEM Mini Extreme ISO G2 + Yamaha HS5 | **ST PENDING** (ไม่ได้ผูก) | ระดับขาเข้า line สูงสุด, การควบคุม phantom, การแมป L/R (รอ Blackmagic Support) |
| โปรไฟล์ GENERIC และ reference-* ทั้ง 27 รายการ | ไม่เปลี่ยน | ยังไม่มีรุ่นจริง (ดู `13_GENERIC_PROFILE_VERIFICATION_TH.md`) |

## สิ่งที่เปลี่ยนในรอบนี้ (ตามหลักฐานจากรูป)
### HyperDeck Studio HD Plus
- **ปัญหาเดิม:** ข้อความใน techspecs กำกวม
- **รูปแผงหลังทางการแสดง:** **SDI OUT A, SDI OUT B, SDI LOOP OUT และ MONITOR OUT (3G)** แยกกันชัดเจน
- **registry:**
  - เพิ่ม `sdi-out-2` (B) กลับเข้ามา
  - เพิ่ม `sdi-loop`
  - เปลี่ยนชื่อ `sdi-out` เป็น "SDI OUT A" (key เดิม edge จึงไม่เปลี่ยน)
- **ซิม:** B ส่งภาพเดียวกับ A ส่วน LOOP ส่งต่อ SDI IN
- **การเลือกขาเข้า:** หน้าเครื่องจริงมีปุ่ม **INPUT** ซึ่งตรงกับตัวควบคุม `rec-input` แต่ยังไม่มีเอกสารยืนยันว่าเลือกอัตโนมัติได้ จึงคงเป็นนโยบายฝึก (ผู้เล่นเลือกเอง)

### รุ่นอื่น
- **ไม่แก้พอร์ตซิม**
- **หัวต่อที่เห็นในรูปแต่ไม่มีในซิม:** บันทึกไว้ในสเปกให้ปั้นเป็นแบบเสียบไม่ได้ เช่น SDI OUTPUTS 1–8, MADI และ TALKBACK ของ TVS HD8 ISO
- **ไม่พบ:** พอร์ตใน registry ที่ไม่ปรากฏในรูป

**ข้อสังเกต:** ขนาด `size` ในโค้ดปัจจุบันบางรุ่นต่างจากขนาดจริง เช่น HyperDeck ในโค้ดกว้าง 0.48 m แต่จริงกว้าง 210 mm
- **ยังไม่แก้:** เพราะกระทบตำแหน่งในฉากและ Free Practice
- **จะแก้เมื่อไร:** พร้อมกับการทำโมเดลแต่ละรุ่น

## ผลตรวจ
- **edge:** ใช้ได้ 331/331
- **admin loadout:** ครบ 25 ด่าน ไม่มีข้อผิดพลาด
- **typecheck:** `tsc` ทั้งโปรเจกต์ผ่าน (exit 0) ณ เวลาตรวจ
- **`npm test`:**
  - **ข้อล้มเหลวที่มีอยู่เดิม:** 19 ข้อ ตรงกับ baseline (รายการเดียวกับรอบก่อน)
  - **ข้อล้มเหลวใหม่:** **0**
  - **ข้อที่ผ่านแล้ว:** "three meaningful errors pause the mission…" (เคยล้มเหลวใน baseline)
- **ตรรกะด่าน สาย และ save:** ไม่เปลี่ยน
