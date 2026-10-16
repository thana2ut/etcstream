/** Display labels only. Keep the original simulator values when saving a selection. */
const LABELS: Record<string, string> = {
  guided: "ฝึกพร้อมคำแนะนำ", partial: "คำแนะนำบางส่วน", scenario: "สถานการณ์ฝึก", disruption: "แก้เหตุขัดข้อง", certification: "ประเมินทักษะปฏิบัติ",
  CERTIFIED: "ผ่านการประเมิน", PASS: "ผ่าน", FAIL: "ไม่ผ่าน", RETRY: "ลองใหม่",
  physical: "การติดตั้ง", signal: "สัญญาณ", rehearsal: "ซ้อมงาน", delivery: "ส่งมอบงาน", config: "การตั้งค่า", quality: "คุณภาพ", safety: "ความปลอดภัย", diagnostics: "วินิจฉัยปัญหา", evidence: "หลักฐาน",
  "(undecided)": "ยังไม่ตัดสินใจ", GO: "เริ่มงาน", "NO-GO (hold)": "หยุดรอความปลอดภัย",
  "At talker's mouth": "หันเข้าหาปากผู้พูด", "Toward PA loudspeaker": "หันเข้าหาลำโพง",
  Minimum: "ต่ำสุด", "Nominal (peaks −18 dBFS)": "ระดับเหมาะสม (ยอดเสียง −18 dBFS)", "Too hot (clips)": "สูงเกินไป (เสียงแตก)",
  Down: "ลดลงสุด", Unity: "ระดับอ้างอิง", "Not framed": "ยังไม่จัดกรอบภาพ", "Framed for assignment": "จัดกรอบภาพตามใบงานแล้ว",
  Black: "ภาพดำ", BLACK: "ภาพดำ", PROGRAM: "ภาพออกอากาศ (PROGRAM)", MULTIVIEW: "จอรวมภาพ (MULTIVIEW)", PREVIEW: "ภาพเตรียม (PREVIEW)",
  "CLEAN FEED": "ภาพสะอาดไม่มีกราฟิก", "CAM RETURN": "ภาพส่งกลับกล้อง", "AUX (clean)": "ภาพเสริมสะอาด (AUX)", AUX: "ภาพเสริม (AUX)",
  ON: "เปิด", OFF: "ปิด", AFV: "เสียงตามภาพ (AFV)", MIC: "ระดับไมค์ (MIC)", LINE: "ระดับไลน์ (LINE)",
  "Webcam output": "ส่งภาพแบบเว็บแคม", "Record to disk": "บันทึกลงดิสก์", "(none)": "ยังไม่มี", None: "ไม่มี",
  "•••••••• (private test key)": "•••••••• (รหัสทดสอบส่วนตัว)",
  "No media": "ไม่มีสื่อบันทึก", "SD card mounted (512 GB free)": "เชื่อมต่อการ์ด SD แล้ว (ว่าง 512 GB)", "SD card mounted · FULL (0 GB)": "เชื่อมต่อการ์ด SD แล้ว · เต็ม (ว่าง 0 GB)",
  "Book page framed, no shadow": "จัดกรอบหน้าเอกสาร ไม่มีเงาบัง", "Test pattern": "ภาพทดสอบ", "Scoreboard template (licensed)": "แม่แบบคะแนนที่มีสิทธิ์ใช้", "Holding slate (back shortly)": "ภาพพักรายการ (กลับมาในสักครู่)",
  Off: "ปิด", Nominal: "ระดับเหมาะสม", Hot: "ระดับสูงเกินไป", "In front of the mic, aimed at audience": "หน้าตำแหน่งไมค์ หันเข้าหาผู้ชม", "Behind/aimed at the podium mic": "อยู่หลังหรือหันเข้าหาไมค์โพเดียม",
  "Not mounted": "ยังไม่เชื่อมต่อ", "Mounted · 412 GB free": "เชื่อมต่อแล้ว · ว่าง 412 GB", "Mounted · FULL (0 GB free)": "เชื่อมต่อแล้ว · เต็ม (ว่าง 0 GB)",
  Up: "เชื่อมต่อได้", "Down (ISP outage)": "ขัดข้อง (ผู้ให้บริการอินเทอร์เน็ต)", "25 Mbps stable": "25 Mbps คงที่", "3 Mbps unstable": "3 Mbps ไม่คงที่",
  "USB video capture device": "อุปกรณ์รับภาพ USB", "Built-in laptop mic": "ไมค์ในโน้ตบุ๊ก", "USB capture embedded audio": "เสียงฝังจากอุปกรณ์รับภาพ USB", "USB audio interface (mixer)": "เสียง USB จากเครื่องผสมเสียง", "0 dB (bypass)": "0 dB (ไม่ลดระดับ)",
  "Generic Training Device": "อุปกรณ์จำลองเพื่อฝึก", CONFIRMED: "ตรวจสอบข้อมูลแล้ว", "GENERIC TRAINING MODEL": "อุปกรณ์จำลองเพื่อฝึก",
};

export function simThai(value: string): string {
  if (LABELS[value]) return LABELS[value];
  return value.replace(/TEACHER VOICE|HOST VOICE|GUEST VOICE|PRESENTER VOICE|COMMENTATOR [12]|CROWD AMBIENCE|LAPTOP SYSTEM SOUNDS|WIND NOISE|TEACHER CAM|KEYNOTE SLIDES|FIELD SLIDES|DOC CAM|BOOK PAGE|SCOREBOARD|HOLDING SLATE|GFX TEST PATTERN|CAM MIC|ROOM SOUND|NO PROGRAM AUDIO|NO PROGRAM|NO INPUT|NO SIGNAL|POWER OFF|NOT READY|STREAM LIVE|STUDIO SIM|\bOFFLINE\b|\bREADY\b|\bSLIDES\b|\bBLACK\b|\bINPUTS\b|\bSIM\b/g, (text) => ({
    "TEACHER VOICE": "เสียงผู้สอน", "HOST VOICE": "เสียงพิธีกร", "GUEST VOICE": "เสียงแขก", "PRESENTER VOICE": "เสียงผู้บรรยาย", "COMMENTATOR 1": "ผู้บรรยาย 1", "COMMENTATOR 2": "ผู้บรรยาย 2", "CROWD AMBIENCE": "บรรยากาศผู้ชม", "LAPTOP SYSTEM SOUNDS": "เสียงระบบโน้ตบุ๊ก", "WIND NOISE": "เสียงลม", "TEACHER CAM": "กล้องผู้สอน", "KEYNOTE SLIDES": "สไลด์บรรยาย", "FIELD SLIDES": "สไลด์ภาคสนาม", "DOC CAM": "กล้องเอกสาร", "BOOK PAGE": "หน้าเอกสาร", SCOREBOARD: "คะแนน", "HOLDING SLATE": "ภาพพักรายการ", "GFX TEST PATTERN": "ภาพทดสอบกราฟิก", "CAM MIC": "ไมค์กล้อง", "ROOM SOUND": "เสียงในห้อง", "NO PROGRAM AUDIO": "ไม่มีเสียงออกอากาศ", "NO PROGRAM": "ไม่มีภาพออกอากาศ", "NO INPUT": "ไม่มีขาเข้า", "NO SIGNAL": "ไม่มีสัญญาณ", "POWER OFF": "ยังไม่เปิดไฟ", "NOT READY": "ยังไม่พร้อม", "STREAM LIVE": "กำลังถ่ายทอด", "STUDIO SIM": "สตูดิโอจำลอง", OFFLINE: "ออฟไลน์", READY: "พร้อม", SLIDES: "สไลด์", BLACK: "ภาพดำ", INPUTS: "ขาเข้า", SIM: "จำลอง",
  } as Record<string, string>)[text] ?? text);
}
