# 13 · ตรวจโปรไฟล์ Generic ที่เหลือ (รอบที่ 1)

วันที่: 2026-10-20 · ไม่ได้ผูกรุ่นใหม่ในรอบนี้ · ไม่แก้ด่าน · ยังไม่ได้ commit

## A. ผลตรวจพอร์ตใหม่เทียบ techspecs ทางการ
| รุ่น | ข้อความจากเว็บทางการ (ย่อ) | พอร์ตในโค้ด | ผล |
|---|---|---|---|
| Micro Converter HDMI to SDI 3G (W-CONU-11) | SDI out "2 x SD, HD or 3G-SDI", HDMI Type A in, 4.4–5.25V DC, 2 W | hdmi-in, sdi-out, sdi-out-2, usb-pwr | ✅ ตรง |
| Micro Converter SDI to HDMI 3G (W-CONU-12) | SDI in 1, "1 x SDI loop out", HDMI Type A out, 1.6 W | sdi-in, sdi-loop, hdmi-out, usb-pwr | ✅ ตรง |
| HyperDeck Studio HD Plus (W-HYS-18) | SDI Video Inputs 1, SDI Video Outputs 2, SDI Monitor Outputs 1, HDMI 2.0 in 1 / out 1, Ethernet 1Gb/s, USB-C 3.0, SD ×2, REF in/out, RS-422 in/out, Timecode in/out, headphone 6.35 mm | sdi-in, sdi-out, sdi-mon, hdmi-in, hdmi-out, eth | ⚠️ ดูหมายเหตุ |

**หมายเหตุ HyperDeck:** เว็บระบุ "SDI Video Outputs 2" แยกจาก "SDI Monitor Outputs 1" แต่คำบรรยายพูดถึง "SDI loop out" กับ "3G-SDI monitoring output" จึงไม่ชัดว่าช่อง monitor นับรวมอยู่ใน 2 ช่องหรือไม่
- **ที่ทำ:** **ถอด `sdi-out-2` ที่เพิ่มในรอบก่อนออก** (ไม่สร้างพอร์ตเกินจากที่ยืนยันได้)
- **สถานะ:** PENDING VERIFICATION
- **ยังไม่ได้ทำโมเดล:** REF, RS-422, Timecode, USB-C และหูฟัง (ไม่ใช้ในด่าน ต้องมีในโมเดล 3D ตามข้อ 14)

## B. พฤติกรรมจริงของอุปกรณ์ กับ นโยบายของเกมฝึก
| เรื่อง | อุปกรณ์จริง (เอกสาร) | ในเกม (นโยบายฝึก) |
|---|---|---|
| HyperDeck เลือกขาเข้า SDI/HDMI | **เอกสารไม่ระบุ** ว่าเลือกเองอัตโนมัติหรือไม่ ("Auto detection" ในเว็บหมายถึงรูปแบบสัญญาณ ไม่ใช่การเลือกขาเข้า) | ผู้เล่นตั้ง "ขาเข้าบันทึก" = SDI/HDMI เอง ค่าเริ่มต้น SDI **ไม่มีการเลือกอัตโนมัติ** |
| HyperDeck บันทึกกี่แหล่ง | บันทึก 1 แหล่ง ไม่มี ISO หลายช่อง | บันทึก 1 แหล่งที่เลือก |
| Micro Converter ขาออก 2 ช่อง / loop | เอกสารระบุพอร์ต | ในเกมทุกขาออกส่งภาพเดียวกัน ส่วน loop ส่งสัญญาณขาเข้าเดิม (เป็นการทำให้ง่ายขึ้นในการฝึก) |

**เทสต์ SP 3 (ไม่ได้ลดความเข้ม):**
- ตรวจว่ามีขาเข้าวิดีโอ SDI 1 + HDMI 1
- ไม่มีพอร์ตหรือตัวควบคุม ISO
- ตัวเลือกขาเข้าเป็นแบบเลือกเดียว
- บันทึกจาก SDI ได้ แต่ถ้าสลับเป็น HDMI ที่ไม่ได้ต่อจะ**ไม่บันทึก** (ไม่รวมขาเข้า)
- ยังคงข้อเดิมว่าขาออก SDI หนึ่งช่องเสียบได้ปลั๊กเดียว

## C. โปรไฟล์ Generic ที่เหลือ 27 รายการ
| model key | ใช้ในด่าน | สถานะ / ผู้สมัคร | หลักฐาน |
|---|---|---|---|
| generic-dynamic-mic | ST-05, AU, SP | ผู้สมัคร Shure SM58: หน้าทางการยืนยัน "Cardioid dynamic", 50–15,000 Hz, R59 | ขั้วต่อ/อิมพีแดนซ์/ขนาด: **PENDING** (หน้า user guide โหลดด้วยสคริปต์ อ่านไม่ได้) |
| reference-fiber-tx / rx | OUT-03..05 | ผู้สมัคร Mini Converter Optical Fiber 12G: SDI in 1 + optical in 1, "SMPTE optical fiber SFP socket", 12V, 2 W | **SFP ขายแยก** ชนิดหัว/โหมด/ความยาวคลื่นไม่ระบุ, จำนวน SDI out ไม่ระบุ → PENDING, ยังไม่ผูก |
| generic-sdi-monitor | SP-04/05 | เสนอใช้ SmartView Duo (ยืนยันแล้วในรอบก่อน) | ต้องอนุมัติการแทน |
| generic-4ch-mixer, generic-studio-switcher | XS/ST | **ST PENDING** ตาม `12_…` (ไม่แตะ) | — |
| generic-wireless-tx/rx, reference-handheld-tx, generic-lav-mic | หลายด่าน | ต้องให้สถาบันเลือกรุ่นและย่านความถี่ที่ถูกกฎหมาย | ยังไม่ตรวจ |
| generic-hdmi-camera, generic-sdi-ptz, generic-hdmi-monitor, generic-projector | ST/AU/XS | ต้องให้สถาบันระบุรุ่น | ยังไม่ตรวจ |
| generic-active-pa, generic-ambience-mic, reference-shotgun, reference-console-6, reference-stagebox-6, reference-tail-6 | AU/OUT/SP | ต้องให้สถาบันระบุรุ่น | ยังไม่ตรวจ |
| generic-laptop, generic-obs-host, generic-graphics-pc, generic-gateway, generic-test-ingest | หลายด่าน | **คงเป็น GENERIC_EDUCATIONAL_PROFILE** (คอมพิวเตอร์ทั่วไปและบริการทดสอบ ไม่จำเป็นต้องผูกรุ่น) | — |
| reference-replay, reference-replay-controller | SP-03..05 | ต้องตัดสินใจเลือกระบบ replay จริง | ยังไม่ตรวจ |

## D. คำถามที่ต้องส่งผู้ผลิต / เจ้าของ
1. **Blackmagic (HyperDeck Studio HD Plus):**
   - "SDI Video Outputs: 2" รวม SDI Monitor Output แล้วหรือไม่?
   - การเลือกขาเข้า SDI/HDMI ทำด้วยมือหรืออัตโนมัติ?
2. **Blackmagic (ST):** คำถาม 5 ข้อใน `12_ST_HARDWARE_VERIFICATION_TH.md` (คงไว้ทั้งหมด)
3. **เจ้าของโครงการ:** ระบุรุ่นจริงของไมค์ไร้สาย กล้อง PTZ ลำโพง PA คอนโซล และระบบ replay ที่สถาบันมี

> **อัปเดต (Phase 04):** รูปแผงหลังทางการยืนยันว่า HyperDeck มี SDI OUT A/B, SDI LOOP OUT และ MONITOR OUT แยกกัน จึงเพิ่ม `sdi-out-2` และ `sdi-loop` กลับเข้ามา ดู `15_PHASE04_3D_READINESS_TH.md`
