# รายงานตรวจผู้ดูแลและโค้ด 25 ภารกิจ

วันที่ 20 ตุลาคม 2026; โครงการ D:/etcstream; ใช้คำสั่ง dev เดิม `npm run dev` (Next dev) ที่ localhost:3000 ไม่เปิดเซิร์ฟเวอร์ซ้ำ ผู้ดูแลเข้าผ่านฟอร์ม `/missions/admin` ตามปกติ ไม่มีการแก้ความก้าวหน้า/ปลอมผลผ่าน; ไม่มีโปรไฟล์ทดสอบแยกที่ UI รองรับ จึงใช้ผู้ฝึกเดิมโดยไม่รับรองด่านใหม่ในรอบนี้ ไม่มีข้อมูลรับรองในเอกสารนี้

รหัส XS/ST/AU/OUT/SP ในเกมเท่ากับ XS/S/M/L/XL ในคำขอ แยกทุกระดับครบ 25 แถว ด้านล่างคำว่า “ผ่าน” ในคอลัมน์กราฟเป็นการตรวจข้อมูลและตัวจำลอง ไม่ใช่การผ่านด้วยการเดินเล่น

| ด่าน | เปิดผู้ดูแล | ภาพ/หลักฐาน | ตรวจ source-data | กราฟ/สต็อก | โต้ตอบสด | ทดสอบจบด่าน | ผล | อุปสรรค/ต้องตรวจเอง | แก้โค้ด/ทดสอบซ้ำ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| XS-01 | เปิดแล้ว | [ฉาก](qa-evidence/admin-XS-01.png) + admin-browser-observations.json | xs-1; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 3 เครื่อง/2 สาย; Node ผ่าน | R เปิดกระเป๋า HDMI 2 เส้นในคลัง; ลองเดินและ E ไม่มีเป้าหมาย ยังไม่ต่อสาย | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| XS-02 | เปิดแล้ว | [ฉาก](qa-evidence/admin-XS-02.png) + admin-browser-observations.json | xs-2; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 5 เครื่อง/3 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| XS-03 | เปิดแล้ว | [ฉาก](qa-evidence/admin-XS-03.png) + admin-browser-observations.json | xs-3; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 5 เครื่อง/4 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| XS-04 | เปิดแล้ว | [ฉาก](qa-evidence/admin-XS-04.png) + admin-browser-observations.json | xs-4; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 8 เครื่อง/6 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| XS-05 | เปิดแล้ว | [ฉาก](qa-evidence/admin-XS-05.png) + admin-browser-observations.json | xs-5; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 10 เครื่อง/8 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| ST-01 | เปิดแล้ว | [ฉาก](qa-evidence/admin-ST-01.png) + admin-browser-observations.json | s-1; STAGES/MISSION_ROOMS/MODELS; PROVISIONAL | ผ่านข้อมูล 3 เครื่อง/2 สาย; Node ผ่าน | ต่อ/ถอด/ผิดพอร์ต/ไฟ/กู้คืนจริงรอบก่อน | ผ่านจริง 100/100 รอบก่อน | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | แก้สต็อก/คำแนะนำและป้าย; ST-01 ต่อครบจริง |
| ST-02 | เปิดแล้ว | [ฉาก](qa-evidence/admin-ST-02.png) + admin-browser-observations.json | s-2; STAGES/MISSION_ROOMS/MODELS; PROVISIONAL | ผ่านข้อมูล 9 เครื่อง/6 สาย; Node ผ่าน | เพดานสาย + E ค้าง RX รอบก่อน | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | แก้สต็อก/คำแนะนำและป้าย; ST-01 ต่อครบจริง |
| ST-03 | เปิดแล้ว | [ฉาก](qa-evidence/admin-ST-03.png) + admin-browser-observations.json | s-3; STAGES/MISSION_ROOMS/MODELS; PROVISIONAL | ผ่านข้อมูล 5 เครื่อง/4 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | แก้สต็อก/คำแนะนำและป้าย; ST-01 ต่อครบจริง |
| ST-04 | เปิดแล้ว | [ฉาก](qa-evidence/admin-ST-04.png) + admin-browser-observations.json | s-4; STAGES/MISSION_ROOMS/MODELS; PROVISIONAL | ผ่านข้อมูล 9 เครื่อง/7 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | แก้สต็อก/คำแนะนำและป้าย; ST-01 ต่อครบจริง |
| ST-05 | เปิดแล้ว | [ฉาก](qa-evidence/admin-ST-05.png) + admin-browser-observations.json | s-5; STAGES/MISSION_ROOMS/MODELS; PROVISIONAL | ผ่านข้อมูล 16 เครื่อง/13 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | แก้สต็อก/คำแนะนำและป้าย; ST-01 ต่อครบจริง |
| AU-01 | เปิดแล้ว | [ฉาก](qa-evidence/admin-AU-01.png) + admin-browser-observations.json | m-1; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 4 เครื่อง/3 สาย; Node ผ่าน | ทดลองเดิน/กด E แต่ไม่มีเป้าหมาย ไม่ได้ต่อครบเส้นทาง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| AU-02 | เปิดแล้ว | [ฉาก](qa-evidence/admin-AU-02.png) + admin-browser-observations.json | m-2; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 9 เครื่อง/9 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| AU-03 | เปิดแล้ว | [ฉาก](qa-evidence/admin-AU-03.png) + admin-browser-observations.json | m-3; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 10 เครื่อง/9 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| AU-04 | เปิดแล้ว | [ฉาก](qa-evidence/admin-AU-04.png) + admin-browser-observations.json | m-4; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 14 เครื่อง/14 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| AU-05 | เปิดแล้ว | [ฉาก](qa-evidence/admin-AU-05.png) + admin-browser-observations.json | m-5; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 29 เครื่อง/29 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| OUT-01 | เปิดแล้ว | [ฉาก](qa-evidence/admin-OUT-01.png) + admin-browser-observations.json | l-1; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 3 เครื่อง/2 สาย; Node ผ่าน | ส่งปุ่ม W/E แล้ว แต่ยังไม่ยืนยันผลการเดิน/เลือกเป้าหมาย | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| OUT-02 | เปิดแล้ว | [ฉาก](qa-evidence/admin-OUT-02.png) + admin-browser-observations.json | l-2; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 7 เครื่อง/5 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| OUT-03 | เปิดแล้ว | [ฉาก](qa-evidence/admin-OUT-03.png) + admin-browser-observations.json | l-3; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 7 เครื่อง/6 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| OUT-04 | เปิดแล้ว | [ฉาก](qa-evidence/admin-OUT-04.png) + admin-browser-observations.json | l-4; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 18 เครื่อง/17 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| OUT-05 | เปิดแล้ว | [ฉาก](qa-evidence/admin-OUT-05.png) + admin-browser-observations.json | l-5; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 18 เครื่อง/17 สาย; Node ผ่าน | ทดสอบ GO ขณะฟ้าผ่าถูกปฏิเสธ 1/3; NO-GO/all-clear เปลี่ยนอากาศได้ แต่ SAFETY_BYPASS ทำให้รอบนี้รับรองไม่ได้ ต้องเริ่มรอบใหม่ | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| SP-01 | เปิดแล้ว | [ฉาก](qa-evidence/admin-SP-01.png) + admin-browser-observations.json | xl-1; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 5 เครื่อง/4 สาย; Node ผ่าน | ทดลองเดิน/กด E แต่ไม่มีเป้าหมาย ไม่ได้ต่อครบเส้นทาง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| SP-02 | เปิดแล้ว | [ฉาก](qa-evidence/admin-SP-02.png) + admin-browser-observations.json | xl-2; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 13 เครื่อง/17 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| SP-03 | เปิดแล้ว | [ฉาก](qa-evidence/admin-SP-03.png) + admin-browser-observations.json | xl-3; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 19 เครื่อง/25 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| SP-04 | เปิดแล้ว | [ฉาก](qa-evidence/admin-SP-04.png) + admin-browser-observations.json | xl-4; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 39 เครื่อง/50 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |
| SP-05 | เปิดแล้ว | [ฉาก](qa-evidence/admin-SP-05.png) + admin-browser-observations.json | xl-5; STAGES/MISSION_ROOMS/MODELS; DESIGN_REFERENCE | ผ่านข้อมูล 39 เครื่อง/50 สาย; Node ผ่าน | ใช้ UI เข้าฉาก/คอนโซล ยังไม่ยืนยันต่อพอร์ตจริง | ยังไม่จบผ่าน Chrome | CODE VERIFIED; BROWSER INSPECTED; OWNER TEST REQUIRED | เข้าถึงทุกพอร์ต/เดินสาย/ความสมจริงของโมเดลยังต้องตรวจด้วยมือ | ป้ายโปรไฟล์ฝึก; แก้การจัดวาง L/XL ตรวจโครงสร้างแล้ว เดินครบยังไม่ยืนยัน |

## จำนวนที่ตรวจได้

- ตรวจ source และโครงสร้าง: 25/25
- ตัวจำลอง Node เดินผ่าน public transitions: 25/25 (ไม่ใช้แทนหลักฐานเดินจริง)
- เปิดผ่านผู้ดูแลพร้อมภาพ: 25/25
- ผ่านภารกิจจริงด้วย Chrome: ST-01 1/25 จากรอบก่อน; ด่านอื่นไม่อ้างผ่าน
- การโต้ตอบจริงบางส่วน: ST-02 จากรอบก่อน และ XS-01, AU-01, OUT-01, OUT-05, SP-01; มีผลโต้ตอบที่สังเกตได้ 6 ด่าน: XS-01, ST-01, ST-02, AU-01, OUT-05, SP-01; OUT-01 เป็นเพียงความพยายามส่งปุ่ม ไม่ยืนยันผล; การเปิดแผงไม่รวมว่าได้ต่อพอร์ต
- ต้องให้เจ้าของทดสอบครบทุกกรณี: 25/25 รวม ST-01 ที่ยังต้องตรวจ post-signoff/เส้นทางเดินอื่น

## หลักฐานและแหล่งโค้ด

- `qa-evidence/admin-code-audit.json`: ผลข้อมูลและตัวจำลอง ไม่เขียนเซฟจริง
- `qa-evidence/admin-browser-observations.json`: ข้อความ UI รายด่าน บันทึกเฉพาะหลังล็อกอิน ไม่เก็บช่องกรอกรหัส
- `game/training/sim/reference-stages.ts`: กราฟที่ reconcile จริง โดยเฉพาะ AU/OUT/SP; ORIGINAL_STAGES ไม่ใช่เฉลยปัจจุบันทั้งหมด
- `game/training/venue-scenarios.ts`: รุ่นที่ใช้ อุปกรณ์จริงในด่าน พอร์ต สต็อก สายเริ่มต้น คลังและจุดติดตั้ง
- `game/content/cable-catalog.ts`: แค็ตตาล็อก เพดานกระเป๋า สายยังอยู่ห้องเมื่อไม่แพ็ก; `components/ui/cable-lobby.tsx` แสดงจำนวนที่ยังจัดได้
- `game/training/mission-completeness.ts`: device/port/cable ID, หัวต่อ ทิศสัญญาณ การใช้สายซ้ำและค่าตั้ง
- `game/training/sim/engine.ts`: การส่งภาพ เสียง RF USB Optical และเครือข่ายตามกราฟ
- `game/training/hdmi-training.ts`: runTest/signOff/settleSim ยกเลิกผลเก่าเมื่อกราฟเสีย
- Appendix A, Research และ Handoff เดิมอยู่ `docs/references/` ไม่แก้เนื้อหาเก่า เงื่อนไขห้าม QA ของ milestone เก่าถูกคำขอล่าสุดแทนแล้ว

## ข้อบกพร่องที่ยืนยันและการแก้

1. ข้อความคลังสายขัดกัน/กระเป๋าว่าง: แก้ mission-only ให้สอดคล้องกับสายที่ยังอยู่คลังและทบทวนเมื่อผิด 3 ครั้ง ทดสอบ Chrome ST-01 เข้าว่าง หยิบสองเส้นจนผ่านจริง
2. ปุ่มจัดสายเกินสต็อกกดแล้วเงียบ: เพิ่มจำนวนคงเหลือ เพดานตัวเลือก และปิดปุ่มเมื่อจัดครบ ST-02 เคยทดลอง 2 เส้นแล้วเพิ่มไม่ได้; ย้ายข้อความสถานะออกจากแถวปุ่มเพื่อแก้ไทยบีบแนวตั้ง
3. พอร์ตมีเป้าทะลุวัตถุ: mission controller ตรวจสิ่งบังและทิศหน้าพอร์ต เก็บ legacy/free practice เดิม; ST-01 เดินเข้าหลัง TV ต่อจริงแล้ว แต่ยังต้องเดินตรวจทุกพอร์ตทุกฉาก
4. สายชุดเล็กหลบอยู่ชั้นล่าง: จัดไว้กึ่งกลางชั้นบน ST-01 หยิบสองเส้นจากคลังจริงได้
5. คำแนะนำเริ่มต้นบอก HDMI ในด่านเสียง: ใช้คำแนะนำทั่วไปตามเป้าจริง Chrome ST-02 เห็นข้อความแก้แล้ว
6. ป้ายอุปกรณ์จำลองมีข้อความอังกฤษและใช้คำว่า “พอร์ตที่ตรวจสอบแล้ว” กว้างเกินหลักฐาน: แปล model/notes ผ่าน simThai และแยกป้ายพอร์ตตามโปรไฟล์ฝึกจากข้อมูลรุ่นอ้างอิง ตรวจซ้ำ Chrome SP-05 เห็น “พอร์ตตามโปรไฟล์ฝึก” แล้ว ภาพ retest-profile-label-SP-05.png
7. โต๊ะ OUT และจอ SP: แก้พิกัดให้รองรับเครื่องบนโต๊ะตามขนาดฉาก ตรวจ regression เชิงโครงสร้างแล้ว ต้องเดินเข้าแต่ละพอร์ตจริง
8. ผลทดสอบล้าสมัยหลังถอดสาย: Chrome ST-01 เห็นภาพหายและ badge ถูกล้าง ต่อคืนแล้วรับรองไม่ได้จนกดทดสอบใหม่ครบ

9. เงื่อนไขฟ้าผ่าหายจาก active OUT เมื่อ reconcile: คืนอากาศเดิมของแต่ละระดับ พร้อมคำสั่ง GO/NO-GO และ safety predicate; กลางแจ้งทุกระดับต้องมีที่กำบัง รับรองไฟ และรางครอบสาย ทดสอบ Chrome OUT-05 กดเริ่มขณะฟ้าผ่าแล้วถูกปฏิเสธ และหยุดรอจนปลอดภัยได้ (รอบที่ลองฝ่าฝืนยังถูกตัดสิทธิ์รับรองตาม SAFETY_BYPASS ไม่อ้างว่ากู้แล้วจบได้) ภาพ retest-OUT-05-lightning-rejected.png / retest-OUT-05-all-clear.png

## ข้อจำกัดที่ไม่ใช่ผลผ่าน

- Chrome extension จับเมาส์ pointer lock ไม่เสถียร ใช้ลากมุมมองเป็นทางเลือก การต่อแบบถือสายเดินทั้งหมดนอก ST-01 ยังไม่ได้รับรอง
- ฉากเก็บพร็อพเดิมไว้ อุปกรณ์ตกแต่งอาจคล้ายเครื่องที่โต้ตอบได้ ให้ดูชื่ออุปกรณ์ใน C และจุดเป้าหมายจริง
- ไม่ได้วัด FPS/เวลาต่อเฟรม จึงไม่รับรองประสิทธิภาพ; ไม่อ้างว่าสแกนทุก asset แล้วไม่มีปัญหา
- ความยาว/พิกัดสายเป็นค่าฉาก ไม่รับรองว่า HDMI พาสซีฟยาวเท่าค่าในฉากใช้ได้จริงทุกเส้น ต้องยืนยันชนิดสาย/การขยายก่อนอ้างสเปกฮาร์ดแวร์
- สตูดิโอเป็น PROVISIONAL: รุ่นกล้อง, HDS7105 revision/พอร์ต, RX และปลาย USB capture ต้องยืนยันจริง
- Optical/Replay: รูปขั้วต่อ โปรโตคอล ความยาวคลื่น และรุ่นยัง UNKNOWN ในส่วนที่หลักฐานไม่ระบุ; Tally/Intercom/PTZ control ไม่เพิ่มพอร์ตโดยเดา
- SP เป็นสำรองบางส่วน แหล่งผลิตและไฟร่วม ไม่ใช่ระบบสำรองอิสระทั้งระบบ
- ภาพ 13-st01-* เดิมที่เป็นภาพว่างไม่ใช้เป็นหลักฐานผลผ่าน ใช้ข้อความผลที่สังเกตและภาพ 14 การปลด ST-02 แทน

## Console และขอบเขตหลักฐาน

ดู qa-evidence/admin-console-warnings.json: พบ THREE.Clock deprecated และ Rapier init deprecated parameters; ในรายการ warn/error ที่ดึงมารอบนี้ไม่มี error แต่ไม่ใช่หลักฐานว่าทุก asset ถูกสแกนครบ ไม่ได้ปรับ dependency เพื่อกลบคำเตือน ไม่มีการวัด FPS

ภาพรวมครบ 25 ด่าน: [ภาพย่อรวม](qa-evidence/admin-25-contact-sheet.jpg) เป็นการย่อสำเนาภาพจริงเพื่อเทียบฉาก ไม่ใช้แทนภาพต้นฉบับรายด่าน

10. ข้อความการ์ดสตูดิโออ้าง SDI ทั้งที่ active profile เดิมใช้ HDMI: แก้เป็นกล้องตามโปรไฟล์ฝึกและระบุว่าพอร์ตสินค้าจริงรอยืนยัน ตรวจซ้ำหน้าหอภารกิจแล้ว ความก้าวหน้ายัง 1/5 (admin-final-progress-preserved.png)

## ผลคำสั่งตรวจ

ดู `qa-evidence/admin-final-checks.md` และ [วิเคราะห์ 19 กรณีทดสอบเดิมที่ยังไม่ผ่าน](qa-evidence/admin-regression-triage.md) ซึ่งบันทึกผลจริงหลังแก้ ไม่ตีความ lint/build ว่าเล่นผ่าน และยังแยกชุดทดสอบเดิมที่ผูก topology เก่าออกจากผล active-manifest
