import "server-only";
import { trustedClient } from "./supabase";
import { ArenaError } from "@/server/arena/db";
import { apply } from "@/server/arena/command-replay";
import { initialTrainingState, trainingProgress, trainingTotal, type TrainingState } from "@/game/training/hdmi-training";
import { freshClassroomLearning } from "@/game/training/classroom-rules";
import { SCENARIOS } from "@/game/training/scenarios";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { checkMissionBag } from "@/game/content/mission-bag";

type Run = { id: string; seq: number; status: string; state: TrainingState; reward: number | null; balance: number };
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function classroomAction(player: string, action: string, body: Record<string, unknown>) {
  if (!uuid(body.run)) throw new ArenaError(400, "รหัสรอบฝึกไม่ถูกต้อง");
  const db = trustedClient();
  const call = async (operation: string, payload: Record<string, unknown>) => {
    const result = await db.rpc("etc_classroom", { p_player: player, action: operation, body: payload });
    if (result.error) {
      if (/INSUFFICIENT/.test(result.error.message)) throw new ArenaError(409, "หินไม่เพียงพอ ต้องใช้ 200 หินเพื่อเล่นต่อ");
      if (/REVISION|CONFLICT/.test(result.error.message)) throw new ArenaError(409, "กำลังซิงก์ข้อมูลรอบ กรุณาลองอีกครั้ง");
      console.error("Classroom operation failed", operation, result.error.code);
      throw new ArenaError(409, "ยังยืนยันข้อมูลรอบไม่ได้ กรุณาลองอีกครั้ง");
    }
    return { available: true, ...(result.data as Run) };
  };
  if (action === "start") {
    const bag = body.bag as Record<string, number>;
    if (!bag || typeof bag !== "object" || Array.isArray(bag) || Object.keys(bag).length > 16 || !Object.values(bag).every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 8) || !checkMissionBag(SCENARIOS["studio-full"], bag).ok) throw new ArenaError(400, "ชุดสายห้องฝึกไม่ครบ");
    const state = { ...initialTrainingState("studio-full", hiddenCablesFor(SCENARIOS["studio-full"], bag), packedLeadsFor(SCENARIOS["studio-full"], bag)), classroom: freshClassroomLearning() };
    return call("start", { run: body.run, state });
  }
  if (action === "get") return call("get", { run: body.run });
  const loaded = await call("get", { run: body.run });
  if (action === "revive") {
    if (!Number.isSafeInteger(body.revision) || Number(body.revision) < 1) throw new ArenaError(400, "รหัสเหตุการณ์ล้มเหลวไม่ถูกต้อง");
    return call("revive", { run: body.run, revision: body.revision });
  }
  if (action !== "command" || !Number.isSafeInteger(body.seq) || Number(body.seq) < 1 || Number(body.seq) > 5000) throw new ArenaError(400, "คำสั่งห้องฝึกไม่ถูกต้อง");
  const command = body.command as { method: string; args: unknown[] };
  if (!command || !["interact", "drop", "takeCable", "stowHeld"].includes(command.method) || !Array.isArray(command.args) || command.args.length > 3) throw new ArenaError(400, "ข้อมูลคำสั่งไม่ถูกต้อง");
  if (Number(body.seq) <= loaded.seq) return call("command", { run: body.run, seq: body.seq, command });
  if (loaded.status !== "running" || Number(body.seq) !== loaded.seq + 1) throw new ArenaError(409, "ข้อมูลรอบยังไม่ตรงกัน กรุณาลองซิงก์อีกครั้ง");
  const before = { ...loaded.state, invalidConnectionAttempt: false };
  const next = apply(before, command.method, command.args);
  const mistakes = Math.min(3, (before.classroom?.mistakes ?? 0) + (command.method === "interact" && before.held && next.invalidConnectionAttempt ? 1 : 0));
  const state = { ...next, invalidConnectionAttempt: false, classroom: { mistakes, failed: mistakes >= 3, question: null } };
  const complete = next.completed && trainingProgress(next) === trainingTotal(next);
  return call("command", { run: body.run, seq: body.seq, command, state, complete, failed: mistakes >= 3 });
}
