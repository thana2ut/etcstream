import "server-only";
import { createHash } from "node:crypto";
import { trustedClient } from "./supabase";
import { apply, commandCost } from "@/server/arena/command-replay";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { initialTrainingState, initSim, simContext } from "@/game/training/hdmi-training";
import { checkMissionBag } from "@/game/content/mission-bag";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { validateLevel } from "@/game/training/sim/engine";
import { ArenaError } from "@/server/arena/db";

export type ReplayRun = {
  id: string; scenario: ScenarioId; seed: number; start: string | null;
  bag: Record<string, number> | null; seq: number; penalty: number; mistakes: number;
  rules: Record<string, number>;
};
// Rebuild from the immutable ordered ledger, never the submitted/cached final state.
// This verifies game rules, not physical mouse movement or human identity.
export async function replayCloudRun(run: ReplayRun) {
  const scenario = SCENARIOS[run.scenario];
  if (!run.start || !run.bag || !checkMissionBag(scenario, run.bag).ok) throw new ArenaError(409, "หลักฐานชุดสายหรือเวลาเริ่มไม่ครบ");
  let state = initialTrainingState(run.scenario, hiddenCablesFor(scenario, run.bag), packedLeadsFor(scenario, run.bag));
  state.sim = initSim(scenario, run.seed);
  let sequence = 0, penalty = 0, mistakes = 0, previousTime = Date.parse(run.start), hash = "";
  const db = trustedClient();
  for (let offset = 0; offset < run.seq; offset += 500) {
    const result = await db.from("etc_commands").select("seq,payload,received").eq("run_id", run.id).order("seq").range(offset, Math.min(offset + 499, run.seq - 1));
    if (result.error) throw new ArenaError(503, "ยังอ่านหลักฐานการแข่งขันไม่ครบ กรุณาลองใหม่");
    for (const event of result.data) {
      const stamp = Date.parse(event.received);
      if (event.seq !== ++sequence || !Number.isFinite(stamp) || stamp < previousTime) throw new ArenaError(409, "หลักฐานคำสั่งขาดช่วงหรือเวลาไม่ต่อเนื่อง");
      const command = event.payload as { method: string; args: unknown[] };
      const next = apply(state, command.method, command.args), cost = commandCost(state, next, command.method, run.rules);
      penalty += cost.penalty; mistakes += cost.mistakes; state = next; previousTime = stamp;
      hash = createHash("sha256").update(JSON.stringify([hash, run.id, sequence, event.received, command])).digest("hex");
    }
  }
  if (sequence !== run.seq || penalty !== run.penalty || mistakes !== run.mistakes) throw new ArenaError(409, "หลักฐานจำนวนคำสั่งหรือบทลงโทษไม่ตรงกัน จึงยังรับรองไม่ได้");
  const ctx = simContext(state);
  const valid = Boolean(sequence >= 2 && state.completed && ctx && !scenario.designIssues?.length);
  return { valid, hash, commands: sequence, penalty, mistakes, protocol: "cloud-independent-replay-v1" };
}
