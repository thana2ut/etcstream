/**
 * Learning notes shown in the full-screen equipment inspector (hold E for 5 s).
 * `unverified` lists what has not been checked against the real unit in the studio.
 * Keys match device / placeable ids in game/training/scenarios.ts.
 */
export interface EquipmentInfo {
  name: string;
  model: string;
  role: string;
  summary: string;
  facts: string[];
  inThisRoom: string;
  unverified: string[];
}

export const EQUIPMENT_INFO: Record<string, EquipmentInfo> = {
  switcher: {
    name: "Video Switcher",
    model: "DeviceWell HDS7105",
    role: "ศูนย์กลางภาพและเสียง (อุปกรณ์กลาง)",
    summary: "รับภาพจากหลายแหล่ง แล้วให้ผู้ควบคุมเลือกว่าภาพไหนจะออกอากาศ พร้อมรวมเสียงเข้ากับภาพก่อนส่งต่อ",
    facts: [
      "INPUT ภาพ: HDMI IN1–IN4 และ DisplayPort 1 ช่อง",
      "PGM OUT (HDMI) = ภาพที่กำลังออกอากาศ ส่งต่อไปบันทึก/สตรีม",
      "MULTIVIEW OUT (HDMI) = ภาพรวมทุกช่องบนจอเดียว สำหรับผู้ควบคุมดู",
      "เสียง: LINE IN / LINE OUT / MIC IN 1–2 เป็นแจ็ค 3.5 มม.",
      "แถว PGM เลือกภาพที่ออกจริง แถว PVW เลือกภาพที่จะตัดไปถัดไป กด CUT หรือ AUTO เพื่อสลับ",
    ],
    inThisRoom: "กล้อง → HDMI IN · เสียงจาก Mixer → LINE IN · PGM OUT → Capture Card · MULTIVIEW OUT → จอ Monitor",
    unverified: ["ความสูง/รูปทรงด้านข้างของตัวเครื่อง"],
  },
  mixer: {
    name: "Audio Mixer",
    model: "YAMAHA PMX-402D-USB",
    role: "ปรับและผสมเสียงก่อนส่งต่อ (อุปกรณ์กลาง)",
    summary: "รับเสียงจากไมค์/อุปกรณ์หลายช่อง ปรับความดังและโทนแต่ละช่อง แล้วรวมเป็นเสียงหลัก (MAIN) ส่งออก",
    facts: [
      "CH1–4: MIC เป็น XLR, LINE เป็นแจ็ค 6.35 มม.",
      "TRIM ปรับความแรงสัญญาณขาเข้า · HI/LOW ปรับเสียงแหลม/ทุ้ม · PAN ปรับซ้าย-ขวา · เฟดเดอร์ปรับระดับช่อง",
      "MAIN L/R (เฟดเดอร์แดง) คุมเสียงรวมที่ออกไป",
      "MAIN OUT มีทั้งแจ็ค 6.35 มม. ด้านบน และ XLR ด้านหลัง",
      "HS5 เป็นลำโพง Active ให้ใช้ MAIN OUT ระดับไลน์ (XLR หรือ 6.35 มม. TRS) ไม่ต่อกับ SPEAKER OUTPUT ภาคขยาย",
      "PHANTOM (+48V) ใช้กับไมค์คอนเดนเซอร์ ไมค์ไดนามิกไม่ต้องเปิด",
    ],
    inThisRoom: "Wireless RX → CH LINE · ตั้ง Gain/Fader · MAIN OUT → Switcher LINE IN (ให้เสียงเดินทางพร้อมภาพ)",
    unverified: ["ขนาดจริงของตัวเครื่อง", "ช่องที่ใช้ต่อลำโพงในห้องจริง"],
  },
  capture: {
    name: "Capture Card",
    model: "Magewell USB Capture HDMI Gen 2",
    role: "ต้นทางภาพและเสียงเข้าสู่คอมพิวเตอร์",
    summary: "รับภาพและเสียงจาก Video Switcher ผ่าน HDMI แล้วส่งเข้า OBS ทาง USB เพื่อดูภาพ บันทึกวิดีโอ หรือถ่ายทอดสด",
    facts: ["HDMI IN รับภาพและเสียงจาก Video Switcher", "USB 3.0 Type-A ส่งภาพและเสียงเข้าคอมพิวเตอร์", "ใช้กับ OBS และโปรแกรม Video Capture ได้", "อุปกรณ์นี้รับสัญญาณเข้าคอมพิวเตอร์ ไม่ใช่ Video Switcher"],
    inThisRoom: "HDS7105 PGM OUT → Magewell HDMI IN → USB 3.0 → HP Notebook → OBS",
    unverified: ["ขนาดตัวเครื่องประมาณจากภาพอ้างอิง"],
  },
  computer: {
    name: "Computer (OBS)",
    model: "HP 15.6-inch (ตามภาพอ้างอิง)",
    role: "ปลายทาง: บันทึก / ถ่ายทอด",
    summary: "เปิด OBS แล้วเลือก Capture Card เป็น Video Capture Device เพื่อรับภาพและเสียงชุดเดียวกัน",
    facts: ["ต่อ Magewell เข้าช่อง USB-A ฝั่งซ้ายหรือขวาของ Notebook ได้", "ระบบสมบูรณ์เมื่อ OBS ได้ทั้งภาพและเสียง", "ถ้าไม่มีภาพ/เสียง ให้ย้อนตรวจตามเส้นทางสัญญาณทีละจุด"],
    inThisRoom: "Capture Card → USB → Computer → OBS",
    unverified: ["รหัสรุ่นย่อยและขนาดโรงงาน"],
  },
  rx: {
    name: "Wireless Microphone System · Receiver",
    model: "COMICA WM100 PLUS RX",
    role: "รับสัญญาณเสียงไร้สายเข้าสู่ระบบ Audio",
    summary: "รับเสียงจาก TX 1 และ TX 2 แบบไร้สาย แล้วส่งต่อไปยัง Audio Mixer ทางช่อง AUDIO OUTPUT",
    facts: ["รองรับตัวส่ง TX 2 ตัวเข้าสู่ตัวรับ RX เดียว", "TX กับ RX สื่อสารกันแบบไร้สาย ไม่ต้องต่อสายระหว่างกัน", "RX AUDIO OUTPUT ส่งเสียงออกไปยัง Audio Mixer"],
    inThisRoom: "Lavalier Mic 1 → TX 1 และ Lavalier Mic 2 → TX 2 → Wireless → COMICA RX → Audio Cable → Audio Mixer",
    unverified: ["ขนาดตัวเครื่องประมาณจากภาพอ้างอิง"],
  },
  tx1: {
    name: "Wireless Transmitter (TX 1)",
    model: "COMICA WM100 PLUS TX 1",
    role: "ตัวส่งเสียงไร้สายตัวที่ 1",
    summary: "รับเสียงจาก Lavalier Microphone แล้วส่งไปยัง COMICA Receiver แบบไร้สาย",
    facts: ["TX MIC INPUT รับสายไมค์ Lavalier 3.5 มม.", "ระหว่าง TX และ RX ไม่ต้องเดินสาย"],
    inThisRoom: "Lavalier Mic 1 → TX 1 → Wireless → COMICA RX",
    unverified: ["ขนาดตัวเครื่องประมาณจากภาพอ้างอิง"],
  },
  tx2: {
    name: "Wireless Transmitter (TX 2)",
    model: "COMICA WM100 PLUS TX 2",
    role: "ตัวส่งเสียงไร้สายตัวที่ 2",
    summary: "รับเสียงจาก Lavalier Microphone แล้วส่งไปยัง COMICA Receiver แบบไร้สาย",
    facts: ["TX MIC INPUT รับสายไมค์ Lavalier 3.5 มม.", "ระหว่าง TX และ RX ไม่ต้องเดินสาย"],
    inThisRoom: "Lavalier Mic 2 → TX 2 → Wireless → COMICA RX",
    unverified: ["ขนาดตัวเครื่องประมาณจากภาพอ้างอิง"],
  },
  mic: {
    name: "Microphone",
    model: "Sennheiser XS 1",
    role: "ต้นทางเสียงเข้าสู่ระบบ Audio",
    summary: "ไมโครโฟนไดนามิกแบบมีสายสำหรับรับเสียงพูดหรือเสียงร้อง แล้วส่งเข้า Audio Mixer ผ่านสาย XLR",
    facts: ["XLR OUTPUT เป็นขั้วต่อ XLR 3-pin", "เหมาะกับงานพูด งานพิธี งานเวที และงานบันทึกเสียง", "ต้องต่อเข้า Audio Mixer หรือระบบเสียงก่อนใช้งาน", "ไม่ส่งสัญญาณแบบไร้สาย"],
    inThisRoom: "Sennheiser XS 1 → XLR Cable → Audio Mixer",
    unverified: ["ขนาดตัวเครื่องประมาณจากภาพอ้างอิง"],
  },
  speaker: {
    name: "Studio Monitor Speaker",
    model: "Yamaha HS5",
    role: "ปลายทางเสียงสำหรับตรวจฟังระบบ Audio",
    summary: "ลำโพงมอนิเตอร์แบบ Active มีแอมป์ในตัว ใช้ฟังคุณภาพและระดับเสียงจาก Audio Mixer ก่อนบันทึกหรือถ่ายทอดสด",
    facts: ["รับสัญญาณ Balanced ได้ทาง XLR INPUT และ 6.35 mm TRS INPUT", "รับสัญญาณจาก MAIN OUT ระดับไลน์ของ Audio Mixer", "ไม่ต่อกับ SPEAKER OUTPUT ที่ผ่านภาคขยายของ Mixer", "ใช้ตรวจฟังเสียง ไม่ใช่ไมโครโฟน"],
    inThisRoom: "Audio Mixer MAIN OUT → XLR หรือ 6.35 mm TRS Cable → Yamaha HS5",
    unverified: ["โมเดลขยายเพื่อให้เห็นชัดในห้องฝึก ขนาดจริงไม่ได้วัดจากเครื่อง"],
  },
  monitor: {
    name: "TV / Production Monitor",
    model: "Samsung 43\" Crystal UHD U8000F · UA43U8000FKXXT",
    role: "ปลายทางภาพสำหรับตรวจดู Program และ Multi View",
    summary: "ทีวี 4K ขนาด 43 นิ้ว รับภาพจาก Video Switcher เพื่อให้ผู้ควบคุมตรวจภาพก่อนบันทึกหรือถ่ายทอดสด",
    facts: ["HDMI INPUT มี 3 ช่องสำหรับรับภาพและเสียง", "รับได้ทั้ง PGM OUT และ MULTIVIEW OUT ของ HDS7105", "จอแสดงภาพจำลองตามเส้นทางสัญญาณที่ต่อจริงในห้องฝึก", "ทีวีแสดงภาพ ไม่ได้ทำหน้าที่สลับกล้อง"],
    inThisRoom: "HDS7105 MULTIVIEW หรือ PGM HDMI OUT → HDMI Cable → Samsung TV HDMI IN",
    unverified: ["ตำแหน่งช่อง HDMI ด้านหลังประมาณจากภาพอ้างอิง"],
  },
  cam1: {
    name: "Camera",
    model: "Panasonic HC-X2000",
    role: "ต้นทางภาพ",
    summary: "กล้องวิดีโอ 4K บนขาตั้งแบบ fluid head ส่งภาพออกทางสายไปยัง Video Switcher",
    facts: ["บนตัวกล้องมีมือจับด้านบนพร้อมชุดรับเสียง XLR", "ขาตั้งมีด้ามแพนสำหรับหมุนกล้องอย่างนุ่มนวล"],
    inThisRoom: "Camera VIDEO OUT → Switcher HDMI IN",
    unverified: ["ตำแหน่งช่องออกภาพด้านหลัง และใช้ HDMI หรือ SDI ในห้องจริง", "ขนาดจริง (โมเดลขยาย 1.6 เท่า)"],
  },
};
