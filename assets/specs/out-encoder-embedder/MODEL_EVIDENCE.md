# MODEL_EVIDENCE · OUT: Blackmagic Streaming Encoder HD + AJA 3G-AMA

**สถานะ:** ทั้งสองรุ่น `LOCKED_EXACT_REVISION` (ระดับพอร์ตและเส้นทาง) · asset 3D ยังไม่เริ่ม · วันที่ตรวจ 2026-10-20

## Blackmagic Streaming Encoder HD (`bmd-streaming-encoder-hd`)
- **แหล่ง:** https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs
- **พอร์ตตามสเปก:**
  - SDI: Video input 1, Loop output 1, Monitor output 1 (1.5G–12G, เสียงฝัง 16 ช่อง)
  - HDMI Monitor output 1 · Ethernet "for live streaming"
  - "1 x USB-C up to 1080p60" (webcam) · ไม่มีขาเข้าเสียงแอนะล็อก
  - ไฟ AC ภายใน + 4-pin XLR 12V
- **หมายเหตุ:** **Web Presenter HD ไม่อยู่ในหน้าสเปกปัจจุบัน** จึงใช้ Streaming Encoder HD ตามที่เจ้าของโครงการกำหนด
- **โปรไฟล์ในโค้ด:** แก้โปรไฟล์ `bmd-streaming-encoder-hd` เดิม ซึ่งยังไม่ถูกใช้ในด่านใด ให้มีพอร์ตครบตามสเปก (เพิ่ม SDI LOOP, SDI MONITOR, USB-C) SDI LOOP และ MONITOR ส่งภาพขาเข้าต่อออกไป
- **ด่านที่ใช้:** OUT-04, OUT-05 (แทน `reference-sdi-encoder`)
- **ส่วนที่ยังไม่เปลี่ยน:** ตัวเข้ารหัสหลักและสำรองของ SP ยังเป็น reference

## AJA 3G-AMA (`aja-3g-ama`)
- **แหล่ง:** https://www.aja.com/products/3g-ama
- **พอร์ตตามสเปก:**
  - 1× 3G-SDI BNC in / 1× out
  - **DB-25 ตัวเมีย 1 ขั้วบนตัวเครื่อง** + สาย breakout ที่แถมมา (XLR ตัวเมีย 4 เข้า / XLR ตัวผู้ 4 ออก)
  - ไฟ +5–20 VDC (มีอะแดปเตอร์ 5 W) · USB สำหรับ Mini-Config · DIP switch
- **ในเกม:**
  - XLR ขาเข้าที่ใช้ระบุว่าเป็น `BREAKOUT XLR IN 1/2 (DB-25)` อยู่บนสาย breakout ไม่ใช่บนตัวเครื่อง
  - asset ต้องแสดงตัวเครื่องเล็กที่มี BNC 2 ตัว + DB-25 และสาย breakout แยกชิ้น
  - ยังไม่ได้ทำให้ผู้เล่นต้องต่อ DB-25 เอง (รอคำตอบเจ้าของ ข้อ 4 ในเอกสาร 03)
- **ด่านที่ใช้:** OUT-04, OUT-05 (แทน `reference-audio-embedder`)

## เส้นทางและผลการจำลอง
- **เส้นทาง:** สวิตเชอร์ SDI OUT 1 → 3G-AMA SDI IN · คอนโซล BC L/R (XLR ไลน์สมดุล) → breakout XLR IN 1/2 · 3G-AMA SDI OUT → Encoder SDI IN · Encoder Ethernet → เกตเวย์
- **ผลการจำลอง (OUT-05):**
  - ตัวฝังเสียง: "ฝังเสียงรายการใน SDI แล้ว"
  - ตัวเข้ารหัส: "กำลังเข้ารหัสและสตรีม" มีเสียง PRESENTER + STAGE + CROWD และจุดรับปลายทางได้ภาพ CAM A
  - ถ้าปิดการฝังเสียง ตัวเข้ารหัสจะไม่มีเสียง และขึ้นปัญหา NO_EMBED
- **กระเป๋าสายไม่เปลี่ยน**

## ยังไม่ยืนยัน
ขนาดตัวเครื่องจริง และภาพด้านหน้า/หลังสำหรับทำโมเดล
