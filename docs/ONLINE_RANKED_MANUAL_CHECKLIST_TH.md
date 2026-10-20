# เจ้าของตรวจออนไลน์และอันดับ V9 ด้วยตนเอง

**NOT TESTED — Agent ไม่ได้ดำเนินรายการนี้**

ทำบนสำเนาหรือระบบที่ตั้งค่าตาม ONLINE_RANKED_SETUP_TH.md แล้ว เก็บ backup ส่วนตัวก่อน migration ไม่ reset ข้อมูลจริงเพื่อให้ผ่าน checklist

## ฐานข้อมูลและ network

1. อ่าน migration 002/003, schema contract และสคริปต์ setup หยุด writer แล้วเจ้าของรันขั้นตอนสำรอง/อัปเกรดเอง เปิดแอปใหม่ ตรวจ READY ที่ Competition Admin หลังผ่านรหัสหลักและรหัสแข่งขัน
2. รัน setup ซ้ำโดยหยุด writer อีกครั้ง ต้องไม่ duplicate/delete ผู้เล่น เพื่อน คะแนน ฤดูกาล หรือรหัสเดิม ต้องมี backup ใหม่ก่อนเปลี่ยนโครงสร้าง
3. ทดสอบ path ผิด/ไม่มีไฟล์บนระบบทดสอบ ต้อง NOT_CONFIGURED ไม่มี DB ว่างสร้างแทน ลองไฟล์ schema เก่า/partial ต้อง MIGRATION_REQUIRED พร้อมรายการที่ขาดเฉพาะแอดมิน
4. ทดสอบ storage lock/สิทธิ์อ่านไม่ได้ในระบบทดสอบ ต้อง CONNECTIVITY_ERROR/Public โหลดไม่ได้ ไม่เป็น READY+EMPTY หรือ 0 คน กด retry ต้องเรียกข้อมูลจริง เมื่อคืน storage แล้วต้องโหลดใหม่ได้
5. สอง browser profile ใช้ Node instance และไฟล์เดียวกัน อุปกรณ์ LAN ใช้ IP เครื่องเซิร์ฟเวอร์ คนบนอินเทอร์เน็ตใช้ HTTPS hostname จริง ห้ามใช้ localhost ของอุปกรณ์อื่นแทนเซิร์ฟเวอร์ ตรวจ cookies/origin หลัง reverse proxy

## ตัวตนจริงสองคน

1. Browser A สมัครชื่อภาษาไทยและตั้ง consent ตามต้องการ Browser B สมัครชื่ออื่น ต้องเป็นคนละตัวตน ประวัติไม่รวมกัน รีเฟรชแล้วยังเป็นบัญชีเดิม
2. B ลองชื่อเดียวกับ A ต้องมีคำแนะนำชื่อซ้ำ ไม่ได้สิทธิ์ของ A ทดสอบไทย NFC/ชื่ออังกฤษต่าง case ชื่อซ้ำเก่าที่มีอยู่ต้องรักษาประวัติแต่ละ UUID
3. ลองแก้ player ID ในคำขอ profile/friend/attempt ต้องไม่แก้บัญชีอื่น การพิมพ์ nickname หรือใส่ localStorage เดิมใน browser ใหม่ไม่ควรยึดบัญชีออนไลน์ได้
4. A สร้าง recovery credential เก็บเองแบบส่วนตัว ออกจากบัญชีใน B ก่อน redeem เมื่อกู้คืนต้องกลับตัวตน A และ revoke session เก่า รหัสเดิมใช้ซ้ำ/หมดอายุต้องปฏิเสธ ไม่ใช้ friend code เป็น recovery
5. มีโปรไฟล์ฝึก local เดิมแต่ไม่เคยสมัครออนไลน์ ต้องสมัคร/กู้คืนอย่างชัดเจน ไม่มีการ auto-claim remote จากชื่อ

## สหายและ presence

1. A ส่งคำขอรหัสสหาย B ต้องยังไม่เป็น accepted จน B ยอมรับ สถานะ incoming/outgoing ถูกต้อง ไม่ส่งคำขอ demo อัตโนมัติ
2. ยอมรับ/ปฏิเสธ/ยกเลิก/ลบ/block/unblock ตรวจทั้งสอง browser ข้อมูลอยู่ใน DB ร่วม rate limit ยังทำงาน
3. เปิด consent presence แล้ว heartbeat ต้องแสดงตามข้อมูลจริง ปิดแท็บ/หยุด heartbeat เกิน 90 วินาทีต้องไม่ค้างออนไลน์ถาวร ปิด consent/ซ่อน/ระงับ/block ต้องไม่รั่วกิจกรรม
4. อันดับสหาย: ยังไม่มีเพื่อนต้องแยกจากมีเพื่อนแต่ยังไม่มีผลยืนยันหรือไม่ยินยอมแสดง และต้องมีแถบข้อมูลของฉันเสมอ ไม่ดึงคนที่ไม่ตอบรับมาเป็นสหาย

## เส้นทางคำสั่งและผลยืนยันห้องเรียนระดับ 1

1. ออกจาก main admin/preview ก่อนใช้บัญชีผู้เล่นจริง เลือก Time Attack xs-1 ผ่านใบงานและเลือกสายตามกติกาเดิม ready ต้องตรวจ bag ซ้ำ เริ่ม countdown/เวลาเซิร์ฟเวอร์ ไม่ให้ browser ส่งเวลาจบเอง
2. ทำงานด้วยมือจริง: หยิบ วาง ต่อสาย ตั้งค่า ทดสอบทุกชั้น และ signOff ตาม evaluator เดิม ห้ามใช้ autosolver/synthetic run เพื่อสร้างอันดับ
3. ช่วงแรกให้ ARENA_VERIFIED_SLICE_ENABLED=0 ตรวจคำสั่งก่อน ผลต้องยังรอตรวจแม้กราฟครบ หลังเจ้าของเห็นว่าเส้นทางรับรองเหมาะสม จึงเปิด flag และ restart แล้วเริ่มรอบใหม่ ผลเก่าไม่เปลี่ยน VERIFIED เอง
4. เมื่อเปิด flag แล้ว รอบ xs-1 ต้อง VERIFIED ได้เฉพาะเมื่อ server replay/signOff/validateLevel ผ่านทั้งหมด คะแนนเวลาต้องตรง finish-start+versioned penalties แยก elapsed/penalty/total ไม่เชื่อเวลาหน้าจอ
5. ทดสอบสายผิด การทดสอบไม่ผ่าน trace hint และ review ให้บทลงโทษเกิดจากผลคำนวณเซิร์ฟเวอร์ตามกติกา frozen ไม่ใช่ event/ค่าที่ client กรอก จำนวนและลำดับคำสั่งต้องอยู่ใน ledger ต่อเนื่อง
6. ตัดเครือข่ายระหว่างคำสั่ง ต้องไม่ทำทีว่าส่งครบ ปุ่มส่งผลต้องรอ outbox คืนเครือข่ายแล้วส่งคำสั่งเดิมซ้ำได้ ไม่เพิ่ม penalty ซ้ำ เปลี่ยน payload ที่ seq เดิม/ข้าม seq ต้องปฏิเสธ
7. รีเฟรชรอบที่เริ่มแล้ว ต้องกลับ state/bag/seq ล่าสุดจากเซิร์ฟเวอร์ เวลาไม่เริ่มใหม่ ลอง stale stage version, attempt ID ของ B, replay finish, finished=true หรือแก้ snapshot/elapsed/completed ใน client ต้องไม่สร้าง VERIFIED ปลอม
8. ส่งผลก่อน countdown/ไม่มีหลักฐาน/เร็วกว่า sanity bound/หลังครบ 4 ชั่วโมง ต้องปฏิเสธหรือ DNF ตามกติกา ตรวจคำสั่งที่ไม่รู้จัก/พอร์ตปลอม/ค่า control ไม่รองรับโดยไม่กระทบข้อมูลคนอื่น
9. ระดับอื่นใน 25 ด่านต้องยัง UNDER_REVIEW แม้มี log ไม่เรียก verified ครบทุกด่าน ทดสอบว่า simulation stream/weather ไม่ถูกใช้สร้างผลทางการของระดับที่ยังไม่รับรอง
10. นี่ไม่ใช่ anti-bot/พิสูจน์ตัวคนหรือระยะเดินจริง หากต้องการ proctored exam ต้องเพิ่ม threat model และตรวจภายนอกก่อนใช้จริง

## ทำเนียบและฤดูกาล

1. ก่อนมีผลจริงต้องแสดง “ยังไม่มีผลการแข่งขันที่ยืนยันแล้ว” ไม่มีห้าตัวอย่างเป็นอันดับจริง DB outage ต้องต่างจาก no-result
2. A/B เปิด profile+rank consent และได้ผลจริง ตรวจ global ต่อด่าน, อันดับของฉัน, accepted friends, nearby rank โดยไม่นำเวลาต่าง stage/version มารวมกัน
3. ตรวจ Best Time, Latest Attempt, จำนวน valid attempts, penalty, gap แยกกัน อันดับตัวเองนอกหน้าแรกยังเห็น ปิด consent ยังคงข้อมูลส่วนตัวแต่ไม่มีอันดับสาธารณะ
4. เล่นด่านเดิมซ้ำไม่สะสมคะแนนเพิ่ม ใช้ best ต่อ UUID เท่านั้น ผล DNF/UNDER_REVIEW/invalid/admin/demo ไม่เข้าอันดับ
5. Competition Admin สร้างฤดูกาลจริงด้วยเหตุผล/confirmation ไม่มีฤดูกาล seeded ตรวจสูตร V1 top-five distinct stages, deterministic ties และ provisional เมื่อกลุ่มน้อย
6. ปิดฤดูกาลเมื่อครบเวลา ตรวจ snapshots/frozen history ไม่ rescore อดีตเมื่อเปลี่ยนกติกา ตรวจ moderation ยกเลิกผล/ซ่อน/ระงับถอนการแสดงตามนโยบายเดิม

## DEMO และขอบเขตแอดมิน

1. ไม่มีไฟล์ seed ลง players ตาราง demo ตั้งค่าได้เมื่อ environment เปิดและผ่าน Competition Admin เท่านั้น
2. เปิดตัวอย่างด้วย reason/ยืนยัน DEMO ต้องเห็น ต้นกล้า ฟ้าใส ธารา เมฆา ขวัญข้าว พร้อมป้ายตัวอย่างชัด ไม่มีเวลา rank presence session friend request หรือผลผ่าน
3. ก่อน/หลังเปิด demo จำนวน registered/online/participants/verified/season points ต้องเท่าเดิม ปิด admin toggle หรือ environment แล้วต้องซ่อน demo ไม่มีแถวตัวอย่างใน API leaderboard/ranked จริง
4. /admin ต้อง fresh master entry สามห้อง Competition ต้องรหัสแยก Legacy URLs redirect เท่านั้น API วินิจฉัย/ควบคุม DEMO ต้องผ่านทั้งสองประตู ไม่รั่ว path/SQL/token/hash
5. เข้า admin Training/Mission previews กระเป๋าอัตโนมัติยังทำงานตาม V8 ผล preview ไม่แก้ player progression/run save/merit/rank หรือส่ง event เข้าแข่งขัน API เขียนแข่งขันต้องปฏิเสธเมื่อมี admin session
6. ตรวจ UI V5/ภาพ/ฟอนต์/keyboard/focus และ desktop/tablet/mobile ด้วยตนเอง ไม่ให้ตารางล้นโดยซ่อนข้อมูลหรือแสดง mock success

บันทึกผลที่เจ้าของตรวจจริงแยกจากรายงาน source implementation ไม่มีเครื่องหมาย PASS จาก agent
