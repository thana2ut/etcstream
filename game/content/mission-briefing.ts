import type { Scenario } from "@/game/training/scenarios";
import type { StageManifest } from "@/game/training/sim/types";

/**
 * Mission-mode briefing (shown before cable selection): what the level is, its goal, what to do in general and
 * what to watch for. Deliberately never lists cables, quantities, port pairs or the solved topology.
 */
export interface BriefingCard { id: "identity" | "goal" | "task" | "watch"; icon: string; title: string; lines: string[] }

const MEANING: Record<StageManifest["guidance"], string> = {
  guided: "ด่านเปิดประตูวิชา ฝึกรากฐานของเส้นทางสัญญาณในสถานที่นี้ ภายในห้องมีบันทึกแนวทางช่วยประคองทุกก้าว",
  partial: "ด่านขัดเกลาฝีมือ คำชี้แนะในห้องเหลือเพียงบางส่วน เจ้าต้องอ่านอุปกรณ์และตัดสินใจเองมากขึ้น",
  scenario: "ด่านโจทย์สถานการณ์จริง ไม่มีรายการเส้นทางให้ดู ต้องวางระบบด้วยความเข้าใจของตนเองจากใบงาน",
  disruption: "ด่านกู้ค่ายกล ระบบถูกจัดวางไว้แล้วแต่มีบางสิ่งผิดเพี้ยน ต้องสืบหาต้นเหตุและคืนระบบให้ใช้งานได้",
  certification: "ด่านสอบผ่านสำนัก รวมทุกวิชาของสถานที่นี้ไว้ในงานเดียว และไม่มีคำใบ้ระหว่างทาง",
};

const TASK: Record<StageManifest["guidance"], string[]> = {
  guided: [
    "อ่านใบงานให้เข้าใจว่าสัญญาณต้องเริ่มจากที่ใดและไปปรากฏที่ใด",
    "ในห้องเตรียมสาย เลือกชนิดและจำนวนสายด้วยตนเอง ระบบจะตรวจกระเป๋าก่อนเปิดประตูด่าน",
    "เข้าห้อง ติดตั้งอุปกรณ์ ต่อสาย แล้วตรวจผลบนจอหรือเสียงจริงด้วยตนเอง",
  ],
  partial: [
    "แยกให้ออกว่าอุปกรณ์ใดเป็นต้นทาง ตัวประมวลผล และปลายทาง",
    "เตรียมสายให้พอดีกับงาน ไม่ขาดและไม่เกิน ระบบจะตรวจกระเป๋าก่อนเข้าด่าน",
    "ลงมือต่อระบบ ตั้งค่าที่จำเป็น และยืนยันผลก่อนส่งงาน",
  ],
  scenario: [
    "ตีความใบงานเป็นภาพรวมของระบบด้วยตนเอง",
    "วางแผนว่าต้องใช้สายแบบใดและกี่เส้น ก่อนจัดลงกระเป๋า",
    "ประกอบระบบ ทดสอบทุกเส้นทาง และแก้ไขจนงานพร้อมใช้",
  ],
  disruption: [
    "สังเกตอาการที่ผิดปกติก่อนลงมือแก้",
    "เตรียมเฉพาะสายที่จำเป็นต่อการแก้ไข ระบบจะตรวจกระเป๋าก่อนเข้าด่าน",
    "ไล่ตรวจทีละช่วงของเส้นทาง หาจุดที่ผิด แล้วยืนยันว่าระบบกลับมาสมบูรณ์",
  ],
  certification: [
    "รวบรวมทุกวิชาที่ฝึกมาในสถานที่นี้มาใช้ในงานเดียว",
    "เตรียมสายให้ครบและพอดี ระบบจะตรวจกระเป๋าก่อนเปิดประตูด่าน",
    "ประกอบ ทดสอบ และตรวจรับงานให้ผ่านทุกเงื่อนไขด้วยตนเอง",
  ],
};

export function missionBriefing(scenario: Scenario, venue: string, objective?: string): BriefingCard[] {
  const stage = scenario.stage!;
  const ends = new Set(scenario.cables.flatMap((c) => c.ends as string[]));
  const has = (...names: string[]) => names.some((n) => ends.has(n));
  const watch = ["ทิศทางของสัญญาณ: OUTPUT ของต้นทางต้องไปพบ INPUT ของปลายทาง", "หัวต่อทั้งสองปลายของสายต้องตรงกับพอร์ตจริงของอุปกรณ์"];
  if (has("HDMI", "SDI") && has("XLR-F", "XLR-M", "3.5mm", "6.35mm")) watch.push("งานนี้มีทั้งภาพและเสียง จงแยกเส้นทางของแต่ละชนิดให้ชัด");
  if (has("FIBER", "ETHERNET")) watch.push("ระยะทางและชนิดของสายส่งสัญญาณไกลมีผลต่อความสำเร็จ");
  if (stage.weather) watch.push("ความปลอดภัยของพื้นที่และสภาพอากาศต้องผ่านการประเมินก่อนเริ่มงาน");
  watch.push("สายในกระเป๋าต้องพอดีกับงาน ขาดหรือเกินแม้เส้นเดียวจะเข้าด่านไม่ได้");
  return [
    { id: "identity", icon: "☯", title: "ระดับนี้คือ", lines: [`${venue} · ${stage.id} · ${stage.title.split(" · ")[0]}`, MEANING[stage.guidance]] },
    { id: "goal", icon: "◎", title: "เป้าหมาย", lines: [objective ?? stage.ticket] },
    { id: "task", icon: "✦", title: "สิ่งที่ต้องทำ", lines: TASK[stage.guidance] },
    { id: "watch", icon: "👁", title: "สิ่งที่ควรสังเกต", lines: watch.slice(0, 4) },
  ];
}
