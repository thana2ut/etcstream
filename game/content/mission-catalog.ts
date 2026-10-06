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
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพจากกล้องผ่านระบบของสถานที่ไปยังจอตรวจสัญญาณ" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อไมค์ผ่านระบบรับเสียงและ Mixer เข้าสายงาน Program" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เลือกแหล่งภาพและตรวจ Program / Monitoring" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไล่เส้นทางสัญญาณเพื่อแก้จุดขาดและตั้งค่าที่ไม่พร้อม" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพ เสียง และปลายทางให้ครบทุกเงื่อนไขของสถานที่" },
    ],
  },
  {
    id: "mission_02", slug: "moonbridge-of-echoes", title: "สะพานจันทราแห่งเสียง", subtitle: "วิถีประสานคลื่นและจังหวะ",
    description: "สะพานแห่งนี้สอนให้ผู้ฝึกเข้าใจจังหวะของสัญญาณและความต่อเนื่องของเส้นทาง ณ ห้องสตูดิโอ ภารกิจจะเน้นความนิ่ง ความถูกต้อง และการอ่านทางให้แม่น",
    themeHint: "สะพานแสงจันทรา หมอกสีฟ้า และลมหายใจของคลื่นสัญญาณ",
    venueId: "studio", venue: "ห้องสตูดิโอ", venueConcept: "งาน Production ในสตูดิโอ",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพจากกล้องผ่านระบบของสถานที่ไปยังจอตรวจสัญญาณ" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อไมค์ผ่านระบบรับเสียงและ Mixer เข้าสายงาน Program" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เลือกแหล่งภาพและตรวจ Program / Monitoring" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไล่เส้นทางสัญญาณเพื่อแก้จุดขาดและตั้งค่าที่ไม่พร้อม" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพ เสียง และปลายทางให้ครบทุกเงื่อนไขของสถานที่" },
    ],
  },
  {
    id: "mission_03", slug: "mirror-tower-of-switching", title: "หอคอยกระจกสลับภาพ", subtitle: "วิถีควบคุมจังหวะและการสลับสัญญาณ",
    description: "หอคอยแห่งนี้คือบททดสอบของผู้ที่เริ่มเข้าใจแก่นของสวิตเชอร์ ไม่ใช่แค่เชื่อมให้ติด แต่ต้องอ่านทางและคุมจังหวะของการส่งภาพให้ถูกต้อง",
    themeHint: "หอคอยกระจก วงแสงสีคราม และแท่นควบคุมกลางห้อง",
    venueId: "auditorium", venue: "หอประชุมอาคารกิจกรรม", venueConcept: "งานเวที / กิจกรรมขนาดกลาง",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพจากกล้องผ่านระบบของสถานที่ไปยังจอตรวจสัญญาณ" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อไมค์ผ่านระบบรับเสียงและ Mixer เข้าสายงาน Program" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เลือกแหล่งภาพและตรวจ Program / Monitoring" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไล่เส้นทางสัญญาณเพื่อแก้จุดขาดและตั้งค่าที่ไม่พร้อม" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพ เสียง และปลายทางให้ครบทุกเงื่อนไขของสถานที่" },
    ],
  },
  {
    id: "mission_04", slug: "archive-of-ancient-ports", title: "คลังผนึกพอร์ตโบราณ", subtitle: "วิถีอ่านตราแห่ง INPUT และ OUTPUT",
    description: "ที่นี่คือคลังความรู้ของผู้ฝึกสายสัญญาณ บททดสอบหลักคือความเข้าใจ INPUT, OUTPUT และการจับคู่พอร์ตให้ถูกต้อง",
    themeHint: "ห้องสมุดโบราณ ตราประทับเรืองแสง และผนึกพอร์ตโบราณ",
    venueId: "outdoor", venue: "พื้นที่ภายนอกอาคาร", venueConcept: "งาน Outdoor และระยะสายไกล",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพจากกล้องผ่านระบบของสถานที่ไปยังจอตรวจสัญญาณ" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อไมค์ผ่านระบบรับเสียงและ Mixer เข้าสายงาน Program" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เลือกแหล่งภาพและตรวจ Program / Monitoring" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไล่เส้นทางสัญญาณเพื่อแก้จุดขาดและตั้งค่าที่ไม่พร้อม" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพ เสียง และปลายทางให้ครบทุกเงื่อนไขของสถานที่" },
    ],
  },
  {
    id: "mission_05", slug: "throne-of-the-grand-transmission", title: "บัลลังก์จอมถ่ายทอด", subtitle: "วิถีแห่งผู้ควบคุมการถ่ายทอด",
    description: "ภารกิจสูงสุดของสำนัก ผู้ฝึกจะต้องพิสูจน์ว่าตนเข้าใจโครงสร้างของการส่งภาพอย่างแท้จริง นี่คือด่านพิธีการที่รวมสิ่งที่เรียนมาทั้งหมด",
    themeHint: "บัลลังก์ทอง หอพิธีถ่ายทอด และรัศมีแห่งการควบคุม",
    venueId: "stadium", venue: "สนามกีฬาและงานถ่ายทอดสด", venueConcept: "งานขนาดใหญ่ Full Live Production",
    difficulties: [
      { level: 1, title: "เส้นทางภาพ · Video Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพจากกล้องผ่านระบบของสถานที่ไปยังจอตรวจสัญญาณ" },
      { level: 2, title: "เส้นทางเสียง · Audio Path", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อไมค์ผ่านระบบรับเสียงและ Mixer เข้าสายงาน Program" },
      { level: 3, title: "สลับภาพและตรวจสัญญาณ", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "เลือกแหล่งภาพและตรวจ Program / Monitoring" },
      { level: 4, title: "พอร์ตและการแก้ปัญหา", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ไล่เส้นทางสัญญาณเพื่อแก้จุดขาดและตั้งค่าที่ไม่พร้อม" },
      { level: 5, title: "ระบบ Production ครบเส้นทาง", flavor: "ฝึกตามขนาดงานและอุปกรณ์ของสถานที่", objective: "ต่อภาพ เสียง และปลายทางให้ครบทุกเงื่อนไขของสถานที่" },
    ],
  },
];

export const getMissionBySlug = (slug: string | null | undefined) => missionChapters.find((mission) => mission.slug === slug) ?? null;
export const getDifficultyMeta = (mission: MissionChapter, level: number) => mission.difficulties.find((difficulty) => difficulty.level === level) ?? null;
export const getMissionDifficultyLabel = (mission: MissionChapter, level: number) => {
  const difficulty = getDifficultyMeta(mission, level);
  return difficulty ? `ระดับ ${level} · ${difficulty.title}` : "";
};
