import "server-only";
import { trustedClient } from "./supabase";
import { ArenaError } from "@/server/arena/db";
import { apply } from "@/server/arena/command-replay";
import { initialTrainingState, trainingProgress, trainingTotal, type TrainingState, type TrainingTarget } from "@/game/training/hdmi-training";
import { SCENARIOS } from "@/game/training/scenarios";
import { hiddenCablesFor, packedLeadsFor, packableCatalogIds } from "@/game/content/cable-catalog";
import { checkMissionBag } from "@/game/content/mission-bag";
import { answerClassroomQuestion, freshClassroomLearning, settleClassroomConnection } from "@/game/training/classroom-rules";

type Run = { id: string; player: string; seq: number; status: string; state: TrainingState; reward: number | null; balance?: number };
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const unavailable = "ระบบหินของห้องฝึกยังไม่พร้อม สามารถฝึกได้ แต่ยังรับหินหรือจ่ายหินเพื่อเล่นต่อไม่ได้";

/** Only server-replayed intents may change classroom state or authorize currency. */
export async function classroomAction(player: string, action: string, body: Record<string, unknown>) {
  const db = trustedClient();
  const call = async (op: string, payload: Record<string, unknown>) => {
    const result = await db.rpc("etc_classroom", { p_player: player, action: op, body: payload });
    if (result.error) {
      if (result.error.code === "PGRST202" || /does not exist|schema cache/i.test(result.error.message)) {
        if (action === "start") return { available: false, message: unavailable };
        throw new ArenaError(503, unavailable);
      }
      if (/INSUFFICIENT/.test(result.error.message)) throw new ArenaError(409, "หินวิญญาณไม่เพียงพอ ต้องใช้ 200 หินเพื่อเล่นต่อ");
      if (/REVISION|CONFLICT/.test(result.error.message)) throw new ArenaError(409, "ข้อมูลรอบไม่ตรงกัน กรุณาโหลดสถานะรอบอีกครั้ง");
      console.error("Classroom operation failed", op, result.error.code);
      throw new ArenaError(409, "ยังบันทึกรอบฝึกไม่ได้ กรุณาลองอีกครั้ง");
    }
    return { available: true, ...(result.data as Run) };
  };
  if (!uuid(body.run)) throw new ArenaError(400, "รหัสรอบฝึกไม่ถูกต้อง");
  if (action === "start") {
    const bag = body.bag as Record<string, number>;
    const scenario = SCENARIOS["studio-full"], allowed = packableCatalogIds(scenario);
    if (!bag || typeof bag !== "object" || Array.isArray(bag) || Object.keys(bag).length > 60 || !Object.keys(bag).every((id) => allowed.includes(id)) || !Object.values(bag).every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 100) || !Object.values(bag).some((n) => n > 0)) throw new ArenaError(400, "ชุดสายสำหรับห้องฝึกไม่ถูกต้อง");
    if (!checkMissionBag(scenario, bag).ok) throw new ArenaError(400, "ชุดสายห้องฝึกต้องครบ 8 เส้นตามรายการปัจจุบัน");
    const state = { ...initialTrainingState("studio-full", hiddenCablesFor(scenario, bag), packedLeadsFor(scenario, bag)), classroom: freshClassroomLearning() };
    return call("start", { run: body.run, state });
  }
  if (action === "get") return call("get", { run: body.run });
  const loaded = await call("get", { run: body.run }) as { available: boolean } & Run;
  if (action === "revive") {
    if (!Number.isSafeInteger(body.revision) || Number(body.revision) < 1) throw new ArenaError(400, "รหัสเหตุการณ์ล้มเหลวไม่ถูกต้อง");
    return call("revive", { run: body.run, revision: body.revision });
  }
  if (action !== "command" || !Number.isSafeInteger(body.seq) || Number(body.seq) < 1 || Number(body.seq) > 5000) throw new ArenaError(400, "คำสั่งห้องฝึกไม่ถูกต้อง");
  const command = body.command as { method: string; args: unknown[] };
  if (!command || !["interact", "drop", "takeCable", "stowHeld", "review"].includes(command.method) || !Array.isArray(command.args) || command.args.length > 3) throw new ArenaError(400, "ข้อมูลคำสั่งห้องฝึกไม่ครบ");
  // Retry of an already committed command is resolved against the immutable ledger by SQL.
  if (Number(body.seq) <= loaded.seq) return call("command", { run: body.run, seq: body.seq, command });
  if (Number(body.seq) !== loaded.seq + 1 || loaded.status !== "running") throw new ArenaError(409, "รอบนี้ยังไม่พร้อมรับคำสั่ง กรุณาโหลดสถานะอีกครั้ง");
  const before = { ...loaded.state, invalidConnectionAttempt: false };
  if (before.classroom?.question && command.method !== "review") throw new ArenaError(409, "ตอบคำถามทบทวนก่อนฝึกต่อ");
  const next = command.method === "review"
    ? answerClassroomQuestion(before, Number(command.args[0]))
    : command.method === "interact"
      ? settleClassroomConnection(before, apply(before, command.method, command.args), command.args[0] as TrainingTarget | null)
      : apply(before, command.method, command.args);
  const complete = next.completed && trainingProgress(next) === trainingTotal(next);
  return call("command", { run: body.run, seq: body.seq, command, state: { ...next, invalidConnectionAttempt: false }, complete, failed: Boolean(next.classroom?.failed) });
}
