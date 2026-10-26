import { getPort, type TrainingState, type TrainingTarget } from "./hdmi-training";

export const CLASSROOM_REVIVE_COST = 200;
export const classroomReward = (seconds: number) => Math.max(50, Math.floor(500 * 300 / (300 + Math.max(0, seconds))));
export type ClassroomQuestion = { title: string; hint: string; options: [string, string]; correct: number; explanation: string };
export type ClassroomLearning = { mistakes: number; failed: boolean; question: ClassroomQuestion | null };
export const freshClassroomLearning = (): ClassroomLearning => ({ mistakes: 0, failed: false, question: null });

/** Questions follow the rejected port and connector, rather than an unrelated fixed quiz. */
function questionFor(state: TrainingState, target: TrainingTarget | null, detail: string): ClassroomQuestion {
  const port = target?.kind === "port" ? getPort(state, target.portId) : null;
  const id = target?.kind === "port" ? target.portId : "";
  let question: ClassroomQuestion;
  if (/ถูกใช้งาน|มีสาย|เต็ม|ครอบครอง/.test(detail)) {
    question = { title: "พอร์ตมีสายเสียบอยู่แล้ว ควรทำอย่างไร?", options: ["ตรวจสายเดิมและเลือกช่องว่างที่ถูกต้อง", "เสียบสายซ้อนลงในช่องเดิม"], correct: 0, explanation: "หนึ่งพอร์ตรับหัวสายได้ครั้งละหนึ่งหัว ตรวจสายเดิมก่อนถอดหรือเปลี่ยนช่อง" , hint: "" };
  } else if (/ทิศทาง|ส่งออก.*ส่งออก|รับเข้า.*รับเข้า/.test(detail)) {
    question = { title: "สัญญาณควรเดินทางจากช่องใดไปช่องใด?", options: ["OUTPUT ไป INPUT", "OUTPUT ไป OUTPUT"], correct: 0, explanation: "OUTPUT คือช่องส่งออก ส่วน INPUT คือช่องรับเข้า ต้องต่อจากต้นทางไปยังปลายทาง", hint: "" };
  } else if (id.startsWith("pc:") || port?.connector.startsWith("USB")) {
    question = { title: "จะส่งภาพจาก Capture Card เข้า Notebook ผ่านช่องใด?", options: ["ช่อง USB ที่รองรับของ Notebook", "ช่องเสียบไมโครโฟนของ Notebook"], correct: 0, explanation: "Capture Card รับภาพจาก HDMI แล้วส่งข้อมูลเข้า Notebook ทาง USB จากนั้นเลือกอุปกรณ์รับภาพใน OBS", hint: "" };
  } else if (id.startsWith("capture:")) {
    question = { title: "Capture Card ควรรับภาพจากอุปกรณ์ใด?", options: ["ช่อง PGM OUT ของเครื่องสลับภาพ", "ช่อง LINE OUT ของเครื่องผสมเสียง"], correct: 0, explanation: "ช่อง HDMI IN ของ Capture Card รับภาพจาก PGM OUT ส่วน LINE OUT ส่งสัญญาณเสียง", hint: "" };
  } else if (id.startsWith("monitor:")) {
    question = { title: "จอภาพควรรับสัญญาณที่ช่องใด?", options: ["HDMI INPUT ของจอภาพ", "ช่องส่งเสียงออกของ Mixer"], correct: 0, explanation: "นำสายภาพจาก OUTPUT ของ Switcher ไปยัง HDMI INPUT ของจอ พร้อมตรวจชนิดหัวสายให้ตรงกัน", hint: "" };
  } else if (id.startsWith("tx") || id.startsWith("rx:")) {
    question = { title: "ไมค์หนีบปกควรต่อเข้าจุดใดก่อน?", options: ["ช่อง MIC INPUT ของตัวส่ง TX", "ช่อง HDMI ของเครื่องสลับภาพ"], correct: 0, explanation: "ไมค์หนีบปกส่งเสียงเข้าตัวส่ง TX แล้วตัวรับ RX จึงส่งเสียงต่อไปยัง Mixer", hint: "" };
  } else if (id.startsWith("speaker:")) {
    question = { title: "ลำโพง Yamaha HS5 ควรรับเสียงแบบใด?", options: ["สัญญาณ LINE จาก Mixer ผ่านหัว XLR หรือ TRS ที่ตรงพอร์ต", "สัญญาณภาพจาก HDMI ของกล้อง"], correct: 0, explanation: "ลำโพงแอ็กทีฟรับสัญญาณ LINE ห้ามนำเอาต์พุตขยายกำลังของลำโพงมาต่อเข้าช่อง LINE", hint: "" };
  } else if (id.startsWith("mixer:") || id === "sw:line-in" || port?.connector === "XLR") {
    question = { title: "ก่อนต่อสายเสียงเข้าช่องนี้ ต้องตรวจอะไร?", options: ["ชนิดหัวสายและช่องรับ–ส่งสัญญาณเสียง", "เลือกหัวใดก็ได้ถ้าขนาดใกล้กัน"], correct: 0, explanation: "ตรวจ XLR, 3.5 mm หรือ 6.35 mm ให้ตรงช่อง หากต่างขนาดต้องใช้หัวแปลงที่รองรับ และต่อ OUTPUT ไป INPUT", hint: "" };
  } else {
    question = { title: "จะส่งภาพจากกล้องเข้า Switcher ควรต่ออย่างไร?", options: ["HDMI OUT ของกล้อง ไป HDMI INPUT ของ Switcher", "ต่อช่อง INPUT ของอุปกรณ์ทั้งสองเข้าหากัน"], correct: 0, explanation: "ตรวจหัว HDMI แล้วต่อจากช่องส่งภาพของกล้องไปยังช่องรับภาพของเครื่องสลับภาพ", hint: "" };
  }
  question.hint = `${port?.label ?? "จุดเชื่อมต่อ"}: ${detail}`;
  const swap = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2;
  if (swap) { question.options = [question.options[1], question.options[0]]; question.correct = 1; }
  return question;
}

export function settleClassroomConnection(before: TrainingState, after: TrainingState, target: TrainingTarget | null): TrainingState {
  if (before.scenarioId !== "studio-full" || !before.classroom) return after;
  const learning = before.classroom ?? freshClassroomLearning();
  if (learning.failed || learning.question || before.completed) return before;
  if (!before.held || target?.kind !== "port" || !after.invalidConnectionAttempt || after.notice?.tone !== "error" || after.notice === before.notice) return { ...after, invalidConnectionAttempt: false, classroom: learning };
  const mistakes = Math.min(3, learning.mistakes + 1);
  return { ...after, classroom: { mistakes, failed: mistakes >= 3, question: mistakes === 2 ? questionFor(before, target, after.notice?.detail ?? "ตรวจหัวสายและพอร์ตอีกครั้ง") : null } };
}

export function answerClassroomQuestion(state: TrainingState, choice: number): TrainingState {
  const learning = state.classroom;
  if (!learning?.question || learning.failed || ![0, 1].includes(choice)) return state;
  const correct = choice === learning.question.correct;
  return { ...state, classroom: { ...learning, question: null, mistakes: correct ? learning.mistakes : Math.min(3, learning.mistakes + 1), failed: !correct }, notice: { title: correct ? "ตอบถูก กลับไปฝึกต่อได้" : "คำตอบยังไม่ถูกต้อง ภารกิจล้มเหลว", detail: learning.question.explanation, tone: correct ? "info" : "error" } };
}
