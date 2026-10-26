import "server-only";
import { all, one, run, ArenaError, type Row } from "./db";
import { digest } from "./auth";
import { SCENARIOS, type ScenarioId, type Point3 } from "@/game/training/scenarios";
import { checkMissionBag } from "@/game/content/mission-bag";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { initialTrainingState, initSim, interactWithTarget, placeHeldOnCenterTable, stowHeldCable, setControl, answerReview, simContext, getPort, type TrainingState, type TrainingTarget } from "@/game/training/hdmi-training";
import type { ControlValue } from "@/game/training/sim/types";
export const REPLAY_PROTOCOL = "server-command-v1";
// Start with the real classroom video slice. Other levels retain ordered evidence but remain provisional.
export const verifiableStage = (id: string) => /^(xs|s|m|l|xl)-[1-5]$/.test(id);
export function beginReplay(attempt: Row, value: unknown) {
  const scenario = SCENARIOS[attempt.scenario as ScenarioId];
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ArenaError(400,"กรุณายืนยันชุดสายก่อนเริ่มจับเวลา");
  const bag = value as Record<string, number>;
  if (!Object.values(bag).every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 100) || !checkMissionBag(scenario, bag).ok) throw new ArenaError(400,"ชุดสายไม่ตรงกับข้อกำหนดด่านจริง");
  const state = initialTrainingState(scenario.id, hiddenCablesFor(scenario, bag), packedLeadsFor(scenario, bag));
  state.sim = initSim(scenario, Number(attempt.seed));
  run("INSERT INTO competition_replay(attempt,protocol,state,bag,created) VALUES(?,?,?,?,?)",attempt.id,REPLAY_PROTOCOL,JSON.stringify(state),JSON.stringify(bag),Date.now());
}
function text(value: unknown) { if (typeof value !== "string" || value.length > 160) throw new ArenaError(400,"ข้อมูลคำสั่งไม่ถูกต้อง"); return value; }
function integer(value: unknown, max = 100) { if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > max) throw new ArenaError(400,"ค่าคำสั่งไม่ถูกต้อง"); return Number(value); }
export function apply(state: TrainingState, method: string, args: unknown[]): TrainingState {
  const scenario = SCENARIOS[state.scenarioId];
  switch (method) {
    case "interact": {
      const target = args[0] as TrainingTarget | null;
      if (!target || typeof target !== "object") return state;
      const mode = args[1]; if (!["whole", "a", "b"].includes(String(mode))) throw new ArenaError(400,"รูปแบบหยิบสายไม่ถูกต้อง");
      if (target.kind === "end") { if (!scenario.cables.some((c) => c.id === target.cableId) || !["a","b"].includes(target.end)) throw new ArenaError(400,"ไม่พบหัวสายนี้"); }
      else if (target.kind === "port") { const id=text(target.portId); if ((!id.startsWith("sock:") && !Object.hasOwn(scenario.ports,id)) || !getPort(state,id)) throw new ArenaError(400,"ไม่พบพอร์ตนี้"); }
      else if (target.kind === "item") { if (!scenario.placeables.some((p) => p.id === target.itemId)) throw new ArenaError(400,"ไม่พบอุปกรณ์ที่ยกวางได้"); }
      else if (target.kind === "action") { if (!scenario.actions.some((a) => a.id === target.actionId)) throw new ArenaError(400,"ไม่พบการกระทำนี้"); }
      else if (target.kind === "device") { if (!scenario.devices.some((d) => d.id === target.deviceId)) throw new ArenaError(400,"ไม่พบอุปกรณ์นี้"); }
      else throw new ArenaError(400,"ชนิดเป้าหมายไม่ถูกต้อง");
      const next = interactWithTarget({ ...state, invalidConnectionAttempt: false },target,mode as "whole" | "a" | "b");
      return next.invalidConnectionAttempt
        ? { ...next, connectionMistakes: (state.connectionMistakes ?? 0) + 1 }
        : next;
    }
    case "takeCable": {
      const id = text(args[0]), cable = state.cables[id];
      if (!cable || !state.bagged?.includes(id) || state.hiddenCables?.includes(id) || state.held || state.heldItem || cable.a.portId || cable.b.portId) return state;
      return { ...state, held: { cableId: id, end: "a" }, bagged: state.bagged.filter((c) => c !== id) };
    }
    case "stowHeld": return stowHeldCable(state);
    case "drop": {
      const position = args[0];
      if (!Array.isArray(position) || position.length !== 3 || !position.every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 500)) throw new ArenaError(400,"ตำแหน่งวางอุปกรณ์ไม่ถูกต้อง");
      const facing = Number(args[1]), turn = Number(args[2]);
      if (!Number.isFinite(facing) || !Number.isFinite(turn) || Math.abs(facing) > 1000 || Math.abs(turn) > 1000) throw new ArenaError(400,"มุมอุปกรณ์ไม่ถูกต้อง");
      return placeHeldOnCenterTable(state,position as Point3,facing + turn);
    }
    case "control": {
      const value = args[2]; if (typeof value !== "string" && typeof value !== "boolean") throw new ArenaError(400,"ค่าตั้งอุปกรณ์ไม่ถูกต้อง");
      if (typeof value === "string" && value.length > 160) throw new ArenaError(400,"ค่าตั้งยาวเกินไป");
      const device=text(args[0]);
      if (device !== "site" && !Object.hasOwn(scenario.simDevices || {},device)) throw new ArenaError(400,"ไม่พบอุปกรณ์ควบคุมนี้");
      return setControl(state,device,text(args[1]),value as ControlValue);
    }
    case "review": return answerReview(state,integer(args[0]));
    default: throw new ArenaError(400,"ไม่รองรับคำสั่งเกมนี้");
  }
}
export function recordCommand(attempt: Row, body: Record<string, unknown>) {
  const replay = one("SELECT * FROM competition_replay WHERE attempt=?",attempt.id);
  if (!replay || replay.protocol !== REPLAY_PROTOCOL) throw new ArenaError(409,"รอบนี้ไม่มีบันทึกคำสั่งที่รองรับ กรุณาเริ่มรอบใหม่");
  const sequence = integer(body.seq,5000);
  const command = body.command as { method?: unknown; args?: unknown };
  if (!command || typeof command !== "object" || !Array.isArray(command.args) || command.args.length > 3) throw new ArenaError(400,"ข้อมูลคำสั่งเกมไม่ครบ");
  const payload = JSON.stringify({ method: text(command.method), args: command.args });
  if (payload.length > 8000) throw new ArenaError(413,"คำสั่งเกมยาวเกินไป");
  if (sequence <= Number(replay.seq)) {
    const previous = one("SELECT payload FROM competition_commands WHERE attempt=? AND seq=?",attempt.id,sequence);
    if (previous?.payload !== payload) throw new ArenaError(409,"คำสั่งลำดับเดิมมีเนื้อหาไม่ตรงกัน");
    return;
  }
  if (sequence !== Number(replay.seq) + 1) throw new ArenaError(409,"ลำดับคำสั่งไม่ต่อเนื่อง ต้องส่งคำสั่งที่ค้างก่อน");
  const before = JSON.parse(String(replay.state)) as TrainingState;
  const after = apply(before,text(command.method),command.args);
  const rules = JSON.parse(String(attempt.rules));
  const { penalty, mistakes } = commandCost(before,after,command.method as string,rules);
  const received = Date.now(), hash = digest(`${replay.last_hash}:${attempt.id}:${sequence}:${received}:${payload}`);
  run("INSERT INTO competition_commands VALUES(?,?,?,?,?,?)",attempt.id,sequence,payload,received,replay.last_hash,hash);
  run("UPDATE competition_replay SET state=?,seq=?,last_hash=? WHERE attempt=?",JSON.stringify(after),sequence,hash,attempt.id);
  run("UPDATE attempts SET penalty=penalty+?,mistakes=mistakes+? WHERE id=?",penalty,mistakes,attempt.id);
}
export function commandCost(before: TrainingState, after: TrainingState, method: string, rules: Record<string, number>) {
  const errors = Math.max(0,(after.sim?.errors || 0) - (before.sim?.errors || 0));
  const connectionErrors = Math.max(0, (after.connectionMistakes ?? 0) - (before.connectionMistakes ?? 0));
  const failed = method === "test" && after.notice?.tone === "error";
  const connector = /หัวต่อ|ชนิดสาย|ขั้ว/.test(after.notice?.detail || "");
  return { penalty: errors * Number(connector ? rules.connector_ms : rules.route_ms) + connectionErrors * Number(connector ? rules.connector_ms : rules.route_ms) + (failed ? Number(rules.failed_ms) : 0) + (method === "trace" ? Number(rules.hint_ms) : 0), mistakes: errors + connectionErrors + (failed ? 1 : 0) };
}
export function finishReplay(attempt: Row, now: number): boolean {
  const replay=one("SELECT * FROM competition_replay WHERE attempt=?",attempt.id);
  if (!replay || replay.protocol !== REPLAY_PROTOCOL) return false;
  const scenario=SCENARIOS[attempt.scenario as ScenarioId];
  const bag=JSON.parse(String(replay.bag)) as Record<string,number>;
  let state=initialTrainingState(scenario.id,hiddenCablesFor(scenario,bag),packedLeadsFor(scenario,bag));
  state.sim=initSim(scenario,Number(attempt.seed));
  let lastHash="", lastReceived=Number(attempt.start), penalty=0, sequence=0;
  const rules=JSON.parse(String(attempt.rules));
  for (const event of all("SELECT * FROM competition_commands WHERE attempt=? ORDER BY seq",attempt.id)) {
    sequence++;
    const expected=digest(`${lastHash}:${attempt.id}:${sequence}:${event.received}:${event.payload}`);
    if (Number(event.seq)!==sequence || event.previous_hash!==lastHash || event.command_hash!==expected || Number(event.received)<lastReceived || Number(event.received)>now) throw new ArenaError(409,"หลักฐานคำสั่งขาดช่วงหรือไม่สอดคล้องกัน ผลนี้ยังรับรองไม่ได้");
    const command=JSON.parse(String(event.payload));
    const next=apply(state,command.method,command.args);
    penalty+=commandCost(state,next,command.method,rules).penalty;
    state=next;lastHash=expected;lastReceived=Number(event.received);
  }
  if (sequence!==Number(replay.seq) || lastHash!==replay.last_hash || penalty!==Number(attempt.penalty)) throw new ArenaError(409,"จำนวนคำสั่งหรือบทลงโทษไม่ตรงกับหลักฐานฝั่งเซิร์ฟเวอร์");
  const context=simContext(state);
  const valid=Boolean(context && state.completed && !scenario.designIssues?.length);
  const elapsed=now-Number(attempt.start);
  if (elapsed < 1000 || Number(replay.seq) < 2) throw new ArenaError(409,"เวลา/หลักฐานคำสั่งยังไม่เพียงพอให้รับรองผล");
  const official=valid && verifiableStage(String(attempt.scenario)) && process.env.ARENA_VERIFIED_SLICE_ENABLED === "1";
  run("UPDATE attempts SET status=?,finish=?,elapsed=?,total=?+penalty,graph_valid=?,verified_at=?,validation_version=?,reason=?,evidence=? WHERE id=?",official?"VERIFIED":"UNDER_REVIEW",now,elapsed,elapsed,valid?1:0,official?now:null,official?REPLAY_PROTOCOL:null,official?null:valid?"มีบันทึกคำสั่ง แต่ระดับนี้ยังไม่เปิดการรับรองอันดับทางการ":"สถานะที่เซิร์ฟเวอร์คำนวณยังไม่ผ่านเงื่อนไขด่านทั้งหมด",JSON.stringify({protocol:REPLAY_PROTOCOL,commands:replay.seq,hash:replay.last_hash}),attempt.id);
  return true;
}
export function replayForOwner(attempt: string) {
  const row=one("SELECT state,bag,seq,protocol FROM competition_replay WHERE attempt=?",attempt);
  return row?{ state:JSON.parse(String(row.state)) as TrainingState,bag:JSON.parse(String(row.bag)) as Record<string,number>,seq:Number(row.seq),protocol:String(row.protocol) }:null;
}
