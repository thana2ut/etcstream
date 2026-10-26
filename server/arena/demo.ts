import "server-only";
import { one, run, audit, transaction, requireOnlineSchema, ArenaError } from "./db";
export const demoRoster = ["ต้นกล้า", "ฟ้าใส", "ธารา", "เมฆา", "ขวัญข้าว"].map((name, index) => ({ id: `demo-thai-${index + 1}`, name, label: "รายชื่อประกอบ", rank: null, bestMs: null, online: false }));
export function demoView(admin = false) {
  requireOnlineSchema();
  const environmentEnabled = process.env.ARENA_DEMO_ENABLED === "1";
  const selected = Boolean(one("SELECT enabled FROM arena_demo_settings WHERE id=1")?.enabled);
  return { enabled: environmentEnabled && selected, ...(admin ? { environmentEnabled, selected } : {}), profiles: admin || environmentEnabled && selected ? demoRoster : [], label: "รายชื่อประกอบ ไม่นับเป็นผู้เล่นหรือผลแข่งขันจริง" };
}
export function setDemo(actor: string, body: Record<string, unknown>) {
  requireOnlineSchema();
  if (typeof body.enabled !== "boolean" || body.confirm !== "ข้อมูลประกอบ" || String(body.reason || "").trim().length < 5 || String(body.reason || "").length > 500) throw new ArenaError(400,"กรอกเหตุผล 5–500 ตัวอักษรและยืนยันข้อมูลประกอบก่อนเปลี่ยนการแสดงรายชื่อ");
  if (body.enabled && process.env.ARENA_DEMO_ENABLED !== "1") throw new ArenaError(409,"ผู้ดูแลระบบต้องเปิด ARENA_DEMO_ENABLED=1 บนเซิร์ฟเวอร์ก่อน ไม่มีการเปลี่ยน environment ให้โดยอัตโนมัติ");
  return transaction(() => {
  run("UPDATE arena_demo_settings SET enabled=? WHERE id=1",body.enabled ? 1 : 0);
  audit(actor,"demo-visibility","sample-roster",String(body.reason));
  return demoView(true);
  });
}
