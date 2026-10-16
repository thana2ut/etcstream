/** Thai feedback for live cable training. */
export const feedbackCopy = {
  training: {
    pickedUp: { title: "หยิบปลายสาย HDMI แล้ว", detail: "เล็งพอร์ตที่ต้องการแล้วกด E เพื่อต่อสาย" },
    dropped: { title: "วางปลายสายแล้ว", detail: "กด E ที่ปลายสายเพื่อหยิบใหม่ได้" },
    disconnected: { title: "ถอดสายออกแล้ว", detail: "ปลายสายอยู่ในมือ กด F เพื่อวาง" },
    invalidTarget: { title: "ยังไม่พบจุดที่โต้ตอบได้", detail: "เล็งปลายสายหรือพอร์ต HDMI ให้ตรงกลางจอ" },
    alreadyHolding: { title: "กำลังถือปลายสายอยู่", detail: "ต่อเข้าพอร์ตหรือกด F เพื่อวางก่อน" },
    pickUpFirst: { title: "ยังไม่มีสายอยู่ในมือ", detail: "เล็งปลายสาย HDMI แล้วกด E เพื่อหยิบ" },
    aimHint: "เล็งปลายสายหรือพอร์ต HDMI แล้วกด E",
    pickUpHint: "E · หยิบปลายสาย HDMI",
    disconnectHint: "E · ถอดปลายสาย HDMI",
  },
  connection: {
    success: { title: "ปราณสัญญาณตอบสนอง", detail: "เชื่อมต่อสำเร็จ", technical: "HDMI OUT → HDMI IN" },
    invalidDirection: { title: "เส้นทางปราณย้อนทิศ", detail: "การเชื่อมต่อนี้ไม่ถูกต้อง", technical: "สัญญาณควรเดินทางจาก OUTPUT → INPUT" },
    connectorMismatch: { title: "หัวต่อไม่สอดคล้องกับพอร์ตนี้", detail: "ตรวจสอบชนิดของสายอีกครั้ง" },
    portOccupied: { title: "ประตูสัญญาณถูกใช้งานอยู่แล้ว", detail: "พอร์ตนี้มีการเชื่อมต่ออยู่" },
    invalidRoute: { title: "เส้นทางนี้ยังไม่ตรงกับภารกิจ", detail: "ลองวิเคราะห์ต้นทางและปลายทางอีกครั้ง" },
  },
  signalTest: { action: "ตรวจค่ายกลสัญญาณ", incomplete: { title: "ค่ายกลยังไม่สมบูรณ์", detail: "มีอย่างน้อยหนึ่งเส้นทางที่ยังไม่สามารถส่งสัญญาณได้" }, complete: { title: "ค่ายกลสัญญาณสมบูรณ์", detail: "พลังของระบบเริ่มไหลเวียน...", status: "SIGNAL ACTIVE" } },
} as const;
