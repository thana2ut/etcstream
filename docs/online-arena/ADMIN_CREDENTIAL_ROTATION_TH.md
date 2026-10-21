# เปลี่ยนรหัสแอดมินหลักอย่างปลอดภัย

สถานะ: เตรียม source แล้ว ยังไม่รับรหัสจากเจ้าของ ไม่ได้ตั้ง Vercel env, ไม่ได้ยกเลิก session จริง และยังไม่ deploy
การเชื่อมต่อ Vercel ที่ตรวจครั้งล่าสุดแสดง project ว่าง จึงยังยืนยัน target Production ไม่ได้
ไม่รันเกม, browser playtest, automated test, lint หรือ build สำหรับงานเปลี่ยนรหัสนี้

## สิ่งที่เจ้าของต้องทำ

1. เลือกรหัสใหม่ที่ไม่เคยส่งในแชต อย่างน้อย 14 และไม่เกิน 128 ตัวอักษร ผสมตัวอักษรอังกฤษกับตัวเลขหรือสัญลักษณ์
2. เปิด PowerShell และรันทีละบรรทัด โดยตรวจว่าอยู่ในโปรเจกต์ถูกต้อง:

```powershell
cd D:\etcstream
node scripts/create-cloud-admin-hash.mjs
```

กรอกและยืนยันรหัสผ่านหน้ารับข้อมูลแบบซ่อน ไม่มีตัวอักษรแสดง สคริปต์ไม่รับรหัสเป็น command argument
สคริปต์สร้างไฟล์ `.arena/cloud-admin-<ค่าที่ไม่ซ้ำ>.env` และแจ้ง path เท่านั้น ไม่พิมพ์ hash
บน Windows จำกัดสิทธิ์ไฟล์ด้วย ACL ก่อนเขียน hash; ถ้าจำกัดสิทธิ์ไม่ได้จะไม่เขียนค่า
ไฟล์เดิมและข้อมูลอื่นไม่ถูกเขียนทับ ไม่มีการแก้ `.env.local` หรือฐานข้อมูล

3. เข้าบัญชี Vercel ที่มี ETCSTREAM และเชื่อม project/สิทธิ์ให้ตรงกับ repository `thana2ut/etcstream`
   ใน **Project → Settings → Environment Variables → Production**:
   - เปิดไฟล์ hash ที่สคริปต์แจ้งเป็นการส่วนตัว คัดลอกเฉพาะค่าหลัง `ADMIN_PASSWORD_HASH=`
   - บันทึกเป็น `ADMIN_PASSWORD_HASH` ชนิด Secret/Sensitive ก่อน
   - เมื่อบันทึกสำเร็จแล้ว จึงตั้ง `ADMIN_CREDENTIAL_ROTATED=1`
   - อย่าส่ง password, hash หรือไฟล์นี้ในแชต/GitHub/ภาพหน้าจอ
   - ตั้ง Preview เฉพาะเมื่อใช้จริง และใช้รหัสแยกจาก Production
4. แจ้งเพียงว่าตั้งค่าแล้วและชื่อ project/workspace ที่ถูกต้อง เพื่อให้ตรวจ metadata และ deploy ต่อ

## การปิดรหัสและ session เก่า

ทางเข้า admin บน Vercel ใช้ตัวตรวจ cloud ที่อ่าน `ADMIN_PASSWORD_HASH` ฝั่ง server เท่านั้น
ถ้าค่าไม่ครบจะปฏิเสธการเข้า ไม่ย้อนกลับไปใช้ SQLite หรือ hash เก่าใน browser
session บน cloud ผูกกับ digest ของ hash ปัจจุบัน เมื่อ deployment โหลด hash ใหม่ session ที่ผูก hash เก่าจะถูกปฏิเสธ
ยังไม่อ้างว่า session จริงถูกยกเลิก เพราะ env ใหม่ยังไม่ถูกบันทึก/นำขึ้น production
หากมี deployment เก่าที่เปิด URL แยก ต้องตรวจและป้องกันการเข้าถึง deployment เหล่านั้นด้วยก่อนเปิดสาธารณะ
ประวัติ Git ไม่ถูกลบหรือเขียนใหม่ รหัสเก่าต้องเลิกใช้ แม้ hash เก่ายังอยู่ในประวัติ

หลัง deploy ให้เจ้าของทดลอง `/admin` เอง: รหัสเก่าต้องใช้ไม่ได้ รหัสใหม่เข้าได้ และใช้ gate เดียวสำหรับสามห้อง
การ build ของ Vercel อนุญาตเฉพาะส่วนที่จำเป็นต่อ deploy ตามงาน V12; ไม่ถือเป็นการทดสอบการเข้าสู่ระบบหรือเกม
