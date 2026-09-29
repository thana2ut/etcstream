/** Content foundation for the future result overlay; no scoring or grade UI is enabled here. */
export const resultCopy = {
  heading: "บททดสอบสำเร็จ", player: (name: string) => `ผู้ฝึก ${name}`,
  metrics: { completion: "ความสำเร็จภารกิจ", correct: "เชื่อมต่อถูกต้อง", incorrect: "เชื่อมต่อผิด", hints: "ใช้คำใบ้", duration: "เวลาที่ใช้", accuracy: "ความแม่นยำ" },
  training: { strengths: "สิ่งที่เจ้าทำได้ดี", review: "วิชาที่ควรทบทวน", examples: ["เลือกสาย HDMI ถูกต้อง", "เข้าใจเส้นทาง OUTPUT → INPUT", "ตรวจสอบพอร์ตปลายทางก่อนเชื่อมต่อ", "วิเคราะห์เส้นทางทั้งหมดก่อนหยิบสาย"] },
  actions: { return: "กลับสู่สำนัก", retry: "ฝึกอีกครั้ง", next: "รับภารกิจใหม่" },
  grades: [
    { min: 85, label: "ดีเยี่ยม", narrative: "ปราณสัญญาณไหลเวียนอย่างมั่นคง เจ้าเริ่มมองเห็นระบบเป็นเส้นทางเดียวกันแล้ว" },
    { min: 70, label: "ใช้ได้", narrative: "พื้นฐานของเจ้ามั่นคง ยังมีบางจุดที่ควรตรวจสอบให้รอบคอบก่อนเชื่อมต่อ" },
    { min: 50, label: "พอใช้", narrative: "เจ้าเดินมาถูกเส้นทางแล้ว แต่ยังลังเลในการเลือกพอร์ตและทิศทางของสัญญาณ" },
    { min: 0, label: "ควรปรับปรุง", narrative: "ค่ายกลยังตอบสนองต่อเจ้าไม่เต็มที่ จงกลับไปฝึก INPUT, OUTPUT และเส้นทางของสัญญาณอีกครั้ง" },
  ],
} as const;
