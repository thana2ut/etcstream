export interface MissionDifficulty {
  level: number;
  title: string;
  flavor: string;
  objective: string;
}

export type VenueId = "classroom" | "studio" | "auditorium" | "outdoor" | "stadium";

export interface MissionChapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themeHint: string;
  venueId: VenueId;
  venue: string;
  venueConcept: string;
  difficulties: readonly MissionDifficulty[];
}

export const missionChapters: readonly MissionChapter[] = [
  {
    id: "mission_01", slug: "gate-of-first-light", title: "ห้องประตูแรกแห่งภาพ", subtitle: "วิถีเปิดทางสัญญาณภาพ",
    description: "ภารกิจแรกของผู้ฝึก เจ้ามีหน้าที่ปลุกเส้นทางภาพจากต้นทางไปยังปลายทาง ให้สัญญาณเดินทางอย่างถูกต้องและนิ่งพอสำหรับการใช้งาน",
    themeHint: "ประตูหินเรืองแสง วงแหวนแสงสีฟ้า และแท่นสัญญาณแรกเริ่ม",
    venueId: "classroom", venue: "ห้องเรียน", venueConcept: "งานขนาดเล็ก ฝึกพื้นฐาน",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ตั้งกล้องบนขาตั้งหลังห้อง ต่อ Camera HDMI OUT → Mini Switcher HDMI IN 1 และ HDMI OUT (Program) → TV หน้าห้อง" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อ Lavalier → TX, Pair กับ RX แล้ว RX → Mixer CH1 และ Mixer MAIN (PA) → ลำโพง Active หน้าห้อง" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เพิ่ม Laptop ผู้สอน → HDMI IN 2 แล้วสลับ Program ระหว่าง Camera กับ Presentation โดย TV ยังได้ Program" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ระบบห้องเรียนถูกต่อไว้บางส่วนและมีสายผิดจุด ไล่ตรวจแล้วแก้สาย Pair และการตั้งค่าให้ถูก" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ห้องเรียน Hybrid ครบ: ภาพกล้อง+สไลด์ → Switcher → TV, เสียงแยก PA/STREAM, USB Webcam → Notebook → OBS" },
    ],
  },
  {
    id: "mission_02", slug: "moonbridge-of-echoes", title: "สะพานจันทราแห่งเสียง", subtitle: "วิถีประสานคลื่นและจังหวะ",
    description: "สะพานแห่งนี้สอนให้ผู้ฝึกเข้าใจจังหวะของสัญญาณและความต่อเนื่องของเส้นทาง ณ ห้องสตูดิโอ ภารกิจจะเน้นความนิ่ง ความถูกต้อง และการอ่านทางให้แม่น",
    themeHint: "สะพานแสงจันทรา หมอกสีฟ้า และลมหายใจของคลื่นสัญญาณ",
    venueId: "studio", venue: "ห้องสตูดิโอ", venueConcept: "งาน Production ในสตูดิโอ",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อ Studio Camera 1 → HDS7105 VIDEO IN 1 และ MULTIVIEW OUT → Samsung TV" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "Pair Lav 1/2 กับ RX, RX + XS 1 → Mixer, MAIN → HDS7105 LINE IN และ MONITOR → HS5" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อกล้อง 3 มุมเข้าอินพุตแยกกัน ตรวจ Multiview และเลือก Program ทีละกล้อง" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "สตูดิโอมีสายหาย/ต่อจอจาก PGM ผิด แก้ให้ TV เป็น Multiview และเส้นเสียง/Capture ครบ" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "สตูดิโอครบ: 3 กล้อง, เสียง Mixer → HDS7105, PGM → Magewell → HP Notebook → OBS, Multiview → TV, MONITOR → HS5" },
    ],
  },
  {
    id: "mission_03", slug: "mirror-tower-of-switching", title: "หอคอยกระจกสลับภาพ", subtitle: "วิถีควบคุมจังหวะและการสลับสัญญาณ",
    description: "หอคอยแห่งนี้คือบททดสอบของผู้ที่เริ่มเข้าใจแก่นของสวิตเชอร์ ไม่ใช่แค่เชื่อมให้ติด แต่ต้องอ่านทางและคุมจังหวะของการส่งภาพให้ถูกต้อง",
    themeHint: "หอคอยกระจก วงแสงสีคราม และแท่นควบคุมกลางห้อง",
    venueId: "auditorium", venue: "หอประชุมอาคารกิจกรรม", venueConcept: "งานเวที / กิจกรรมขนาดกลาง",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อกล้อง C SDI → Switcher SDI IN 1 แล้วตั้ง AUX = Program → SDI→HDMI → จอเวที" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไมค์ Podium → Stagebox → Multicore → FOH Mixer แยก PA BUS → ลำโพง และ BROADCAST BUS → Switcher AUDIO IN" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เพิ่มกล้อง L/R, PTZ และสไลด์ผ่าน HDMI→SDI ดู Multiview ที่ FOH แล้วสลับ Program" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "งานเวทีถูกต่อไว้บางส่วน จอเวทีต่อจาก PGM ผิดช่อง แก้สาย Converter และบัสเสียงให้ถูก" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "งานเวทีครบ: 5 แหล่งภาพ, จอเวทีรับ Program, ไมค์ทุกตัวผ่าน Stagebox, PA/Broadcast แยก, Recorder และ OBS" },
    ],
  },
  {
    id: "mission_04", slug: "archive-of-ancient-ports", title: "คลังผนึกพอร์ตโบราณ", subtitle: "วิถีอ่านตราแห่ง INPUT และ OUTPUT",
    description: "ที่นี่คือคลังความรู้ของผู้ฝึกสายสัญญาณ บททดสอบหลักคือความเข้าใจ INPUT, OUTPUT และการจับคู่พอร์ตให้ถูกต้อง",
    themeHint: "ห้องสมุดโบราณ ตราประทับเรืองแสง และผนึกพอร์ตโบราณ",
    venueId: "outdoor", venue: "พื้นที่ภายนอกอาคาร", venueConcept: "งาน Outdoor และระยะสายไกล",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อกล้องไกลผ่าน Fiber TX → Fiber RX และกล้องใกล้ด้วย SDI เข้า Field Switcher ดูผลที่จอ Multiview" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไมค์พิธีกร (ไร้สาย), Shotgun (+48V เฉพาะช่องนี้), Ambient → Field Mixer และ PA BUS → ลำโพง" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "รับ 3 กล้องจากระยะต่างกัน ตรวจ Multiview และเลือก Program รวมกล้อง Fiber" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ระบบภาคสนามมีสายหายและ Embedder ได้ Multiview แทน Program แก้ให้สตรีมถูกต้อง" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ภาคสนามครบ: Fiber + SDI → Switcher, เสียงแยก PA/Broadcast, PGM → Embedder → Encoder → Router → Ingest" },
    ],
  },
  {
    id: "mission_05", slug: "throne-of-the-grand-transmission", title: "บัลลังก์จอมถ่ายทอด", subtitle: "วิถีแห่งผู้ควบคุมการถ่ายทอด",
    description: "ภารกิจสูงสุดของสำนัก ผู้ฝึกจะต้องพิสูจน์ว่าตนเข้าใจโครงสร้างของการส่งภาพอย่างแท้จริง นี่คือด่านพิธีการที่รวมสิ่งที่เรียนมาทั้งหมด",
    themeHint: "บัลลังก์ทอง หอพิธีถ่ายทอด และรัศมีแห่งการควบคุม",
    venueId: "stadium", venue: "สนามกีฬาและงานถ่ายทอดสด", venueConcept: "งานขนาดใหญ่ Full Live Production",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อกล้อง 1–2 → Camera Fiber → CCU → Router → Switcher ตั้ง Crosspoint แล้วเลือก Program ดู Multiview Wall" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไมค์ผู้บรรยาย 2 + Crowd L/R + Field → Stagebox → Multicore → Console แยก Broadcast กับ VENUE PA" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เพิ่มกล้อง 3–6, Replay (มี Controller) และ Graphics ผ่าน Router แล้วสลับ Program" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ระบบถ่ายทอดมีสายหายและ Embedder ได้ Multiview แก้ Crosspoint, เสียง, Main/Backup ให้ถูก" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ถ่ายทอดสดเต็มระบบ: 6 กล้อง, Router 8 เส้น, เสียงฝังผ่าน Embedder → DA → Main/Backup/Recorder, จอสนาม, Intercom, Tally" },
    ],
  },
];

export const getMissionBySlug = (slug: string | null | undefined) => missionChapters.find((mission) => mission.slug === slug) ?? null;
export const getDifficultyMeta = (mission: MissionChapter, level: number) => mission.difficulties.find((difficulty) => difficulty.level === level) ?? null;
export const getMissionDifficultyLabel = (mission: MissionChapter, level: number) => {
  const difficulty = getDifficultyMeta(mission, level);
  return difficulty ? `ระดับ ${level} · ${difficulty.title}` : "";
};
