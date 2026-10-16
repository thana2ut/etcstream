# วิเคราะห์รายการทดสอบเดิมที่ยังไม่ผ่าน

ผลรอบสุดท้าย: `admin-full-tests.txt` — 174 กรณี ผ่าน 155 ไม่ผ่าน 19 ไม่ใช่ 19 ภารกิจที่เล่นแล้วล้มเหลว และไม่ใช้ผลนี้อ้างว่าทุกฟีเจอร์ผ่าน

ไม่แก้พอร์ตหรือเพิ่มอุปกรณ์เพื่อให้การทดสอบที่อ้างผังเก่าผ่าน และไม่ลดเงื่อนไขตรวจรับจริง งานค้างคือปรับกรณีทดสอบเหล่านี้ตามโปรไฟล์ที่เลือก พร้อมรักษาจุดประสงค์เดิม แล้วทดสอบซ้ำ ไม่ควรนำชุดรวมไปเป็นประตูปล่อยใช้งานโดยอ้างว่าสีเขียวแล้ว

| ไฟล์ / กรณี | สาเหตุที่พบจากผลจริงและ source | สิ่งที่ยังต้องทำ |
| --- | --- | --- |
| production-sim: XS เสียงซ้ำ | คาด badge `false` แต่ settleSim ล้างเป็น `undefined`; ไม่ใช่ badge ผ่าน | ตรวจเป็นสถานะไม่ผ่านตามสัญญา Partial testsPassed และยืนยันเสียงซ้ำยังถูกปฏิเสธ |
| production-sim: XS ถอดลิงก์บังคับ | คาด `false` ได้ `undefined` หลังผลสดถูกล้าง | ใช้กราฟเสียและ signOff ถูกปฏิเสธเป็นหลักฐาน; negative regression ใหม่ตรวจครบ 25 ด่านแล้ว |
| production-sim: ST ส่ง MV เข้า capture | คาด `false` ได้ `undefined` | ปรับวิธีอ่าน badge แต่ยังตรวจว่ารูป MV ไม่ใช่รายการ |
| production-sim: OUT converter HDMI→SDI | อ้าง convHS ที่ไม่มีในผัง OUT ใหม่ ได้ UNKNOWN_PORT | ตรวจ converter ใน AU/SP ที่มีจริง และ Optical คู่ OUT แยกกัน |
| production-sim: OUT Videohub | อ้าง vh/สไลด์เก่า; ผัง OUT ใหม่ใช้กล้อง C ผ่าน Optical จึงยังเห็น CAM A ตาม PROGRAM | ย้ายกรณี crosspoint ไป SP router ที่ใช้งานจริง ไม่ใส่ vh กลับโดยเดา |
| production-sim: OUT ramp/ฟ้าผ่า | พบการคืนค่าอากาศ/ความปลอดภัยหลุดในชั้น reconcile จริงและแก้แล้ว; ตอนนี้ assertion badge คาด false แต่ถูกล้างเป็น undefined | negative regression ใหม่ผ่าน; Chrome OUT-05 ปฏิเสธ GO และ NO-GO/all-clear ทำงาน ต้องแก้ assertion ชุดเดิม |
| production-sim: OUT ม้วนสายไม่ผ่านพิกัด | อ้าง cam2 ในระดับเสียง OUT-02 และ x-weak ซึ่งไม่อยู่ในชุดสายด่านใหม่ | สร้างกรณีระยะบนเส้นทางและสายที่มีหลักฐาน ไม่เพิ่มพิกัดสินค้าสมมติ |
| production-sim: OUT WAN/SSD/converter | อ้าง SSD/pgm/convSH เก่า; ผังใหม่ใช้ embed/enc และไม่มี SSD ในด่านนี้ | ทดสอบ WAN กับภาพที่ sw/monitor และทดสอบ recorder ในด่านที่มีจริง |
| production-sim: SP Ethernet ของ switcher | พยายามย้าย lead เครือข่ายไป sw:eth ที่โปรไฟล์ใหม่ไม่มี | ตรวจ rejection แบบ atomic ว่าสายไม่ถูกเปลี่ยน; ห้ามเพิ่ม Ethernet เพื่อให้ทดสอบผ่าน |
| production-sim: SP converter/UHD | อ้าง cam1:sdi-out / convA:sdi-in เก่า; กล้องเป็น Optical และ gfx ใช้ convHS | ตรวจ HDMI→SDI จริงที่ gfx→convHS และครอบครัว Optical; ไม่อ้าง format knob ที่ไม่มี |
| production-sim: SP เสียง LINE | อ้าง sw:aud-l/r เก่า ปัจจุบัน sw:xlr-l/r | ปรับพอร์ตให้ตรง active profile แล้วตรวจเสียงหายแต่ภาพอยู่ |
| production-sim: SP WAN/media | อ้างจอ pgm ซึ่งไม่มีในชุดใหม่ | ตรวจ sw/monitor และ rec/wan ตามกราฟจริง |
| production-sim: พักหลังผิด 3 ครั้ง | เลือก lead-1 ซึ่งตอนนี้เป็น FIBER แล้วพยายามเสียบ SDI; cam1:sdi-ret ไม่อยู่ในโปรไฟล์กล้องนี้ | เลือกสาย/พอร์ตที่มีจริงและตั้งใจทำผิดซ้ำ ตรวจ review ของ concept นั้น |
| production-sim: catalog mirrors stage | คาดชื่ออังกฤษต่อท้าย แต่ catalog ใช้ชื่อไทยส่วนแรกตาม generator | ให้ assert ตามสัญญาชื่อไทย ไม่คืนข้อความอังกฤษใน UI |
| venue-scenarios: ภาพจอห้องเรียน | คาด TEACHER CAM แต่ UI แปลเป็น “กล้องผู้สอน” | ตรวจข้อความไทยและการดับเมื่อถอดต่อไป |
| venue-scenarios: ภาพจอสตูดิโอ | คาด NO PROGRAM/NOT READY/READY และ HOST VOICE แต่ UI เป็นไทยแล้ว | ปรับข้อความคาดหวัง โดยคงตรวจสถานะภาพ/เสียงจริง |
| venue-scenarios: orphan hand1 | นับเฉพาะสาย ไม่รวม RF pairing ของไมค์ตัวส่งในด้าม | รวม RF pairWith เป็นลิงก์ตรรกะที่ไม่ใช่สาย ไม่สร้างสายหลอก |
| venue-scenarios: HDMI ผ่าน converter | อ้าง lap/convHS ใน OUT-05 เดิม | ทดสอบ gfx/convHS ใน SP ที่เลือกใช้อยู่ และตรวจว่า switcher ไม่มี HDMI INPUT |
| venue-scenarios: โต๊ะกลางแจ้ง | บังคับ net อยู่โต๊ะ l-tent-desk เดิม แต่ย้ายไปโต๊ะส่งสัญญาณแยกที่มีอยู่จริง | ใช้โต๊ะรองรับจริงตามผัง; foundation regression ใหม่ตรวจขนาดรองรับแล้ว ยังต้องเดินดูพอร์ต |

การตรวจใหม่ที่แยกไว้: `admin-code-audit.json` (25/25 โครงสร้าง/ตัวจำลอง), `admin-negative-regressions.txt` (ถอดสาย/ไฟดับ/ซ่อมแล้วยังไม่ทดสอบใหม่/ฟ้าผ่า), `tests/mission-foundation-qa.test.mjs` (คลังสาย อุปกรณ์ พอร์ต และโต๊ะ) ไม่ใช้แทนการเดินเล่นหรือปิดบังรายการข้างต้น
