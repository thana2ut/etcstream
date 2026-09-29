export interface MissionDifficulty {
  level: number;
  title: string;
  flavor: string;
  objective: string;
}

export interface MissionChapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themeHint: string;
  difficulties: readonly MissionDifficulty[];
}

export const missionChapters: readonly MissionChapter[] = [
  {
    id: "mission_01", slug: "gate-of-first-light", title: "ประตูแรกแห่งภาพ", subtitle: "วิถีเปิดทางสัญญาณภาพ",
    description: "ภารกิจแรกของผู้ฝึก เจ้ามีหน้าที่ปลุกเส้นทางภาพจากต้นทางไปยังปลายทาง ให้สัญญาณเดินทางอย่างถูกต้องและนิ่งพอสำหรับการใช้งาน",
    themeHint: "ประตูหินเรืองแสง วงแหวนแสงสีฟ้า และแท่นสัญญาณแรกเริ่ม",
    difficulties: [
      { level: 1, title: "จารึกสายแรก", flavor: "เริ่มต้นเชื่อมโยงภาพจากต้นทางสู่จุดกลาง", objective: "เชื่อม Camera ไปยัง Video Switcher ให้ถูกต้อง" },
      { level: 2, title: "เปิดม่านสัญญาณ", flavor: "สัญญาณเริ่มไหล แต่ยังไม่ถึงปลายทาง", objective: "เชื่อม Video Switcher ไปยัง Monitor ให้สมบูรณ์" },
      { level: 3, title: "ผสานแสงสามจุด", flavor: "ต้องตรวจทั้งเส้นทาง ไม่ใช่แค่เสียบให้ครบ", objective: "ตรวจเส้นทาง Camera → Switcher → Monitor ให้ครบทุกช่วง" },
      { level: 4, title: "คลายรอยรั่วแห่งภาพ", flavor: "ภาพจะสมบูรณ์ได้ เมื่อไม่มีจุดเชื่อมผิดทิศ", objective: "หลีกเลี่ยงการเชื่อมผิด INPUT / OUTPUT" },
      { level: 5, title: "ผนึกทางภาพสมบูรณ์", flavor: "เจ้าต้องปิดภารกิจอย่างแม่นยำและไร้ข้อผิดพลาด", objective: "จบภารกิจภาพโดยเชื่อมครบและไม่มีจุดผิด" },
    ],
  },
  {
    id: "mission_02", slug: "moonbridge-of-echoes", title: "สะพานจันทราแห่งเสียง", subtitle: "วิถีประสานคลื่นและจังหวะ",
    description: "สะพานแห่งนี้สอนให้ผู้ฝึกเข้าใจจังหวะของสัญญาณและความต่อเนื่องของเส้นทาง แม้ยังใช้ห้องฝึกเดียวกัน แต่ภารกิจจะเน้นความนิ่ง ความถูกต้อง และการอ่านทางให้แม่น",
    themeHint: "สะพานแสงจันทรา หมอกสีฟ้า และลมหายใจของคลื่นสัญญาณ",
    difficulties: [
      { level: 1, title: "เคาะระฆังรับคลื่น", flavor: "รับรู้ทิศทางของสัญญาณให้ถูกต้อง", objective: "เลือกจุดเริ่มต้นของสัญญาณได้ถูก" },
      { level: 2, title: "ผูกสายแห่งเสียง", flavor: "เส้นทางที่ดีต้องมีลำดับที่ดี", objective: "ต่อเส้นทางตามลำดับที่ระบบกำหนด" },
      { level: 3, title: "ข้ามสะพานคลื่น", flavor: "ความแม่นยำสำคัญกว่าความเร็ว", objective: "เชื่อมครบโดยผิดพลาดให้น้อยที่สุด" },
      { level: 4, title: "ลบหมอกรบกวน", flavor: "ผู้ฝึกต้องแยกของจริงออกจากความสับสน", objective: "หลีกเลี่ยงการเลือกพอร์ตผิด" },
      { level: 5, title: "ปลุกบทเพลงจันทรา", flavor: "เมื่อคลื่นนิ่ง สะพานจะเปิดรับเจ้า", objective: "จบภารกิจด้วยเส้นทางสมบูรณ์และไม่มีข้อผิดพลาดสำคัญ" },
    ],
  },
  {
    id: "mission_03", slug: "mirror-tower-of-switching", title: "หอคอยกระจกสลับภาพ", subtitle: "วิถีควบคุมจังหวะและการสลับสัญญาณ",
    description: "หอคอยแห่งนี้คือบททดสอบของผู้ที่เริ่มเข้าใจแก่นของสวิตเชอร์ ไม่ใช่แค่เชื่อมให้ติด แต่ต้องอ่านทางและคุมจังหวะของการส่งภาพให้ถูกต้อง",
    themeHint: "หอคอยกระจก วงแสงสีคราม และแท่นควบคุมกลางห้อง",
    difficulties: [
      { level: 1, title: "จุดแสงแห่งเลนส์", flavor: "ปลุกต้นทางให้ตอบสนอง", objective: "ระบุ Camera เป็นจุดเริ่มต้นให้ถูกต้อง" },
      { level: 2, title: "หมุนวงล้อสวิตเชอร์", flavor: "จุดกลางคือหัวใจของการควบคุม", objective: "เชื่อมเข้าสวิตเชอร์ได้ถูกพอร์ต" },
      { level: 3, title: "สลับภาพสามทิศ", flavor: "ผู้ฝึกต้องเข้าใจบทบาทของทุกจุดเชื่อม", objective: "เชื่อมทั้งต้นทาง กลางทาง และปลายทางให้ครบ" },
      { level: 4, title: "คลายภาพเงาซ้อน", flavor: "ผิดเพียงทิศเดียว ภาพทั้งระบบย่อมเสีย", objective: "จัดการเส้นทางอย่างถูกต้องโดยไม่มีการไขว้ผิด" },
      { level: 5, title: "รวมศูนย์จอภาพ", flavor: "ผู้ฝึกที่ผ่านขั้นนี้ เริ่มคุมทางภาพได้จริง", objective: "จบด้วยเส้นทางสมบูรณ์และตรวจครบทุกขั้น" },
    ],
  },
  {
    id: "mission_04", slug: "archive-of-ancient-ports", title: "คลังผนึกพอร์ตโบราณ", subtitle: "วิถีอ่านตราแห่ง INPUT และ OUTPUT",
    description: "ที่นี่คือคลังความรู้ของผู้ฝึกสายสัญญาณ บททดสอบหลักคือความเข้าใจ INPUT, OUTPUT และการจับคู่พอร์ตให้ถูกต้อง",
    themeHint: "ห้องสมุดโบราณ ตราประทับเรืองแสง และผนึกพอร์ตโบราณ",
    difficulties: [
      { level: 1, title: "เปิดผนึกขาเข้า", flavor: "เริ่มเรียนรู้ความหมายของทางรับ", objective: "ระบุ INPUT ให้ถูกต้อง" },
      { level: 2, title: "เปิดทางขาออก", flavor: "เมื่อเข้าใจทางรับ ต้องเข้าใจทางส่งต่อ", objective: "ระบุ OUTPUT ให้ถูกต้อง" },
      { level: 3, title: "จับคู่พอร์ตต้องห้าม", flavor: "พอร์ตที่คล้ายกันอาจมีหน้าที่ต่างกัน", objective: "เชื่อมพอร์ตให้ตรงบทบาท" },
      { level: 4, title: "แก้ตราประทับผิดพลาด", flavor: "เจ้ามีหน้าที่แก้การเชื่อมที่ไม่สมดุล", objective: "ตรวจจับและแก้การเชื่อมผิด" },
      { level: 5, title: "ฟื้นคลังเชื่อมต่อ", flavor: "ผู้ที่อ่านตราได้ครบ ย่อมผ่านผนึกแห่งคลัง", objective: "ปิดภารกิจโดยเชื่อมครบและถูกทุกเงื่อนไขหลัก" },
    ],
  },
  {
    id: "mission_05", slug: "throne-of-the-grand-transmission", title: "บัลลังก์จอมถ่ายทอด", subtitle: "วิถีแห่งผู้ควบคุมการถ่ายทอด",
    description: "ภารกิจสูงสุดของสำนัก ผู้ฝึกจะต้องพิสูจน์ว่าตนเข้าใจโครงสร้างของการส่งภาพอย่างแท้จริง นี่คือด่านพิธีการที่รวมสิ่งที่เรียนมาทั้งหมด",
    themeHint: "บัลลังก์ทอง หอพิธีถ่ายทอด และรัศมีแห่งการควบคุม",
    difficulties: [
      { level: 1, title: "เรียกภาพเข้าสู่พิธี", flavor: "เริ่มพิธีด้วยการเชื่อมทางภาพแรก", objective: "เริ่มต้นเส้นทางสัญญาณได้ถูก" },
      { level: 2, title: "จัดสมดุลแสงและสัญญาณ", flavor: "ทุกส่วนต้องทำงานสอดคล้องกัน", objective: "เชื่อมต้นทางและกลางทางได้ถูกต้อง" },
      { level: 3, title: "คุมเส้นทางหลายชั้น", flavor: "อย่ามองแค่จุดเดียว จงมองทั้งระบบ", objective: "เชื่อมครบทุกจุดและตรวจทั้งเส้นทาง" },
      { level: 4, title: "ต้านคลื่นแตกพราย", flavor: "ผ่านความสับสนให้ได้", objective: "ลดความผิดพลาดให้ต่ำที่สุด" },
      { level: 5, title: "พิชิตพิธีถ่ายทอดสูงสุด", flavor: "นี่คือบทพิสูจน์ของผู้ฝึกที่พร้อมก้าวต่อ", objective: "จบภารกิจขั้นสูงสุดอย่างสมบูรณ์" },
    ],
  },
];

export const getMissionBySlug = (slug: string | null | undefined) => missionChapters.find((mission) => mission.slug === slug) ?? null;
export const getDifficultyMeta = (mission: MissionChapter, level: number) => mission.difficulties.find((difficulty) => difficulty.level === level) ?? null;
export const getMissionDifficultyLabel = (mission: MissionChapter, level: number) => {
  const difficulty = getDifficultyMeta(mission, level);
  return difficulty ? `ระดับ ${level} · ${difficulty.title}` : "";
};
