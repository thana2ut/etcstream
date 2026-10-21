import { beginReplay, recordCommand, finishReplay } from "./command-replay";
import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { all, one, run, transaction, audit, limit, ArenaError, type Row } from "./db";
import { digest } from "./auth";
import { validateNickname } from "@/game/security/nickname-validation";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { initialTrainingState, simContext, type TrainingState } from "@/game/training/hdmi-training";
import { validateLevel } from "@/game/training/sim/engine";

export const anonymous = "ผู้ฝึกนิรนาม";
export const scenarioVersion = (id: string) => digest(JSON.stringify(SCENARIOS[id as ScenarioId])).slice(0, 24);
export function scenario(id: unknown) {
  if (typeof id !== "string" || !/^(xs|s|m|l|xl)-[1-5]$/.test(id) || !SCENARIOS[id as ScenarioId]?.stage) throw new ArenaError(400, "ไม่พบภารกิจที่เลือก");
  return { id: id as ScenarioId, data: SCENARIOS[id as ScenarioId] };
}
export function name(value: unknown) {
  const n = validateNickname(value);
  if (!n || /^(admin|administrator|ผู้ดูแล|ระบบ)$/i.test(n)) throw new ArenaError(400, "ใช้ชื่อภาษาไทยหรืออังกฤษ 2–20 ตัวอักษร และไม่ใช้ชื่อสงวน");
  return n.normalize("NFC");
}
export function createPlayer(value: unknown) {
  const normalized = name(value).normalize("NFC");
  if (one("SELECT 1 FROM players WHERE name=? COLLATE NOCASE AND deleted=0", normalized)) throw new ArenaError(409,"ชื่อนี้มีผู้ใช้แล้ว กรุณาเพิ่มคำหรือตัวเลข ชื่อเดียวกันไม่ทำให้เข้าถึงบัญชีเดิมได้");
  const id = randomUUID();
  run("INSERT INTO players(id,friend_code,name,created) VALUES(?,?,?,?)", id, randomBytes(8).toString("hex").toUpperCase(), normalized, Date.now());
  return one("SELECT * FROM players WHERE id=?", id)!;
}
export const displayName = (p: Row) => p.hidden || p.deleted || !p.name ? anonymous : p.name;
export function playerView(p: Row, own = false) {
  const fresh = p.presence && !p.hidden && !p.deleted && !p.suspended && one("SELECT 1 AS fresh FROM sessions WHERE role='player' AND principal=? AND seen>? AND expires>? LIMIT 1", p.id, Date.now() - 90000, Date.now());
  return { name: displayName(p), friendCode: p.friend_code, online: Boolean(fresh), ...(own ? { id: p.id, public: Boolean(p.public), ...(Object.prototype.hasOwnProperty.call(p,"rank_public")?{rankPublic:Boolean(p.rank_public)}:{}), presence: Boolean(p.presence), nameLocked: Boolean(p.name_locked) } : {}) };
}
export function friendsFor(id: string) {
  const rows = all("SELECT f.a,f.b,f.status,p.* FROM friends f JOIN players p ON p.id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE (f.a=? OR f.b=?) AND p.deleted=0 AND p.suspended=0", id, id, id);
  return rows.filter((p) => !p.hidden && !blocked(id, String(p.id))).map((p) => ({ ...playerView(p), status: p.status, incoming: p.b === id }));
}
export function blocked(a: string, b: string) { return Boolean(one("SELECT 1 FROM blocks WHERE (a=? AND b=?) OR (a=? AND b=?)", a, b, b, a)); }
export function friendAction(actor: string, body: Record<string, unknown>) {
  limit("friends:" + actor, 20);
  const target = one(body.action === "unblock" ? "SELECT * FROM players WHERE friend_code=?" : "SELECT * FROM players WHERE friend_code=? AND deleted=0 AND suspended=0 AND hidden=0", String(body.code || "").toUpperCase());
  if (!target || target.id === actor) throw new ArenaError(400, "ไม่พบรหัสสหายที่ใช้ได้");
  const b = String(target.id), action = body.action;
  return transaction(() => {
    if (action === "block") { run("INSERT OR IGNORE INTO blocks VALUES(?,?)", actor, b); run("DELETE FROM friends WHERE (a=? AND b=?) OR (a=? AND b=?)", actor, b, b, actor); return; }
    if (action === "unblock") { run("DELETE FROM blocks WHERE a=? AND b=?", actor, b); return; }
    if (blocked(actor, b)) throw new ArenaError(403, "ไม่สามารถติดต่อผู้เล่นนี้ได้");
    if (action === "request") {
      if (one("SELECT 1 FROM friends WHERE (a=? AND b=?) OR (a=? AND b=?)", actor, b, b, actor)) throw new ArenaError(409, "มีคำขอหรือเป็นสหายกันแล้ว");
      run("INSERT INTO friends VALUES(?,?,'pending',?)", actor, b, Date.now());
    } else if (action === "accept") {
      if (!run("UPDATE friends SET status='accepted' WHERE a=? AND b=? AND status='pending'", b, actor).changes) throw new ArenaError(409, "ไม่พบคำขอที่รอรับ");
    } else if (["decline", "remove", "cancel"].includes(String(action))) {
      run("DELETE FROM friends WHERE (a=? AND b=?) OR (a=? AND b=?)", actor, b, b, actor);
    } else throw new ArenaError(400, "ไม่รองรับคำสั่งนี้");
  });
}
export function settings() { return one("SELECT * FROM settings WHERE id=1")!; }
export function createAttempt(player: string, value: unknown) {
  limit("attempts:" + player, 8, 3600000);
  const { id } = scenario(value), rules = settings();
  if (!rules.time_attack) throw new ArenaError(403, "ปิดรับการแข่งขันชั่วคราว");
  const a = randomUUID(), seed = randomBytes(4).readUInt32BE();
  run("INSERT INTO attempts(id,player,scenario,scenario_version,rules_version,rules,seed,status,created) VALUES(?,?,?,?,?,?,?,'PENDING',?)", a, player, id, scenarioVersion(id), rules.version, JSON.stringify(rules), seed, Date.now());
  return attemptView(one("SELECT * FROM attempts WHERE id=?", a)!);
}
export function attemptView(a: Row) {
  return { id: a.id, scenario: a.scenario, scenarioVersion: a.scenario_version, rulesVersion: a.rules_version, seasonId:a.season_id || null, verifiedAt:a.verified_at || null,validationVersion:a.validation_version || null, status: a.status, start: a.start, elapsedMs: a.elapsed, penaltyMs: a.penalty, totalMs: a.total, mistakes: a.mistakes, graphValid: Boolean(a.graph_valid), invalid: Boolean(a.invalid), reason: a.invalid ? "ผลถูกยกเลิกโดยผู้ดูแล" : a.status === "REJECTED" ? "ผลไม่ผ่านการรับรอง กรุณาติดต่อผู้ดูแลหากต้องการรายละเอียด" : a.status === "UNDER_REVIEW" ? "ผลนี้ยังไม่ผ่านการรับรองอันดับ ต้องมีหลักฐานคำสั่งและระดับที่รองรับครบก่อน" : null, created: a.created, serverNow: Date.now() };
}
export function ownedAttempt(player: string, id: string) {
  const a = one("SELECT * FROM attempts WHERE id=? AND player=?", id, player);
  if (!a) throw new ArenaError(404, "ไม่พบรอบแข่งขันนี้");
  return a;
}
export function attemptAction(player: string, id: string, body: Record<string, unknown>) {
  return transaction(() => {
    const a = ownedAttempt(player, id), now = Date.now();
    if(a.status==="RUNNING" && now-Number(a.start)>4*3600000) {
      run("UPDATE attempts SET status='DNF',finish=?,reason=? WHERE id=?",now,"รอบหมดเวลาสูงสุด 4 ชั่วโมง",id);
      return attemptView(ownedAttempt(player,id));
    }
    if (a.scenario_version !== scenarioVersion(String(a.scenario))) throw new ArenaError(409, "ข้อมูลด่านเปลี่ยนแล้ว กรุณาเริ่มรอบใหม่");
    if (body.action === "ready") {
      if (a.status === "PENDING") { beginReplay(a, body.bag); run("UPDATE attempts SET status='RUNNING',start=? WHERE id=?", now + 3000, id); }
      return attemptView(ownedAttempt(player, id));
    }
    if (body.action === "abandon") {
      if (["PENDING", "RUNNING"].includes(String(a.status))) run("UPDATE attempts SET status='DNF',finish=? WHERE id=?", now, id);
      return attemptView(ownedAttempt(player, id));
    }
    if (a.status !== "RUNNING") return attemptView(a); // idempotent finish
    if (now < Number(a.start) || now - Number(a.start) > 4 * 3600000) throw new ArenaError(409, "รอบยังไม่เริ่มหรือหมดเวลาแล้ว");
    const rules = JSON.parse(String(a.rules));
    if (body.action === "command") { recordCommand(a, body); }
    else if (body.action === "event") {
      if (one("SELECT 1 FROM competition_replay WHERE attempt=?", id)) throw new ArenaError(409,"รอบนี้คิดบทลงโทษจากคำสั่งฝั่งเซิร์ฟเวอร์เท่านั้น");
      const seq = Number(body.seq), kind = String(body.kind);
      if (!Number.isSafeInteger(seq) || seq < 1 || seq > 5000 || !["connector", "route", "hint", "failed"].includes(kind)) throw new ArenaError(400, "ข้อมูลเหตุการณ์ไม่ถูกต้อง");
      const max = Number(one("SELECT COALESCE(MAX(seq),0) AS n FROM attempt_events WHERE attempt=?", id)!.n);
      if (seq <= max) {const previous=one("SELECT kind FROM attempt_events WHERE attempt=? AND seq=?",id,seq);if(previous?.kind!==kind) throw new ArenaError(409,"รหัสเหตุการณ์เดิมมีข้อมูลไม่ตรงกัน");return attemptView(a);}
      if (seq !== max + 1) throw new ArenaError(409, "ลำดับเหตุการณ์ไม่ต่อเนื่อง กรุณาเชื่อมต่อใหม่");
      run("INSERT INTO attempt_events VALUES(?,?,?,?)", id, seq, kind, now);
      run("UPDATE attempts SET penalty=penalty+?,mistakes=mistakes+1 WHERE id=?", Number(rules[kind + "_ms"]), id);
    } else if (body.action === "finish") {
      if (finishReplay(ownedAttempt(player,id), now)) return attemptView(ownedAttempt(player,id));
      // This independently checks a graph, but browser evidence is NOT an authoritative action replay.
      // Keep every submission unranked until a server action ledger/replay is implemented.
      let valid = false;
      try {
        const base = initialTrainingState(a.scenario as ScenarioId), evidence = body.state as Partial<TrainingState>;
        const state = { ...base, cables: evidence.cables, items: evidence.items, sim: evidence.sim, actionsDone: base.actionsDone, completed: false } as TrainingState;
        const ctx = simContext(state);
        valid = Boolean(ctx && validateLevel(ctx, "signal").every((r) => r.result.ok));
      } catch { valid = false; }
      const elapsed = now - Number(a.start);
      run("UPDATE attempts SET status='UNDER_REVIEW',finish=?,elapsed=?,total=?+penalty,graph_valid=?,evidence=?,reason=? WHERE id=?", now, elapsed, elapsed, valid ? 1 : 0, JSON.stringify(body.state || {}), "ยังไม่ผ่านการยืนยันอันดับ: หลักฐานจากเบราว์เซอร์ยังไม่ใช่บันทึกคำสั่งที่เซิร์ฟเวอร์ตรวจย้อนกลับได้", id);
    } else throw new ArenaError(400, "คำสั่งไม่ถูกต้อง");
    return attemptView(ownedAttempt(player, id));
  });
}
export function leaderboard(id: string, scope: string, viewer?: string, offset = 0) {
  scenario(id);
  if (!settings().board) return [];
  const rules = settings();
  let rows = all("SELECT a.*,p.name,p.hidden,p.deleted,p.friend_code FROM attempts a JOIN players p ON a.player=p.id WHERE a.scenario=? AND a.scenario_version=? AND a.rules_version=? AND a.status='VERIFIED' AND a.invalid=0 AND p.public=1 AND p.hidden=0 AND p.deleted=0 AND p.suspended=0 ORDER BY a.total,a.elapsed,a.mistakes,a.finish,a.id", id, scenarioVersion(id), rules.version);
  if (scope === "weekly") rows = rows.filter((a) => Number(a.finish) > Date.now() - 7 * 86400000);
  if (scope === "friends") { const friends = viewer ? all("SELECT CASE WHEN a=? THEN b ELSE a END AS id FROM friends WHERE (a=? OR b=?) AND status='accepted'", viewer, viewer, viewer).map((f) => f.id) : []; rows = rows.filter((a) => a.player === viewer || friends.includes(a.player)); }
  const seen = new Set(); rows = rows.filter((a) => { if (seen.has(a.player) || viewer && blocked(viewer, String(a.player))) return false; seen.add(a.player); return true; });
  return rows.slice(offset, offset + 25).map((a, i) => ({ rank: offset + i + 1, name: displayName(a), friendCode: a.friend_code, id: a.id, scenario: a.scenario, status: a.status, elapsedMs: a.elapsed, penaltyMs: a.penalty, totalMs: a.total, mistakes: a.mistakes, finish: a.finish }));
}
export function moderate(actor: string, body: Record<string, unknown>) {
  const id = String(body.id || ""), action = String(body.action), reason = String(body.reason || "").trim();
  if (reason.length < 5 || reason.length > 500) throw new ArenaError(400, "กรอกเหตุผลอย่างน้อย 5 ตัวอักษรและยืนยันรหัสเป้าหมายให้ตรงกัน");
  return transaction(() => {
    if (["invalidate", "reinstate"].includes(action)) {
      if (body.confirm !== id) throw new ArenaError(400, "รหัสรอบที่ยืนยันไม่ตรงกับรอบเป้าหมาย");
      const a = one("SELECT * FROM attempts WHERE id=?", id);
      if (!a) throw new ArenaError(404, "ไม่พบผลการแข่งขัน");
      run("UPDATE attempts SET invalid=?,reason=? WHERE id=?", action === "invalidate" ? 1 : 0, reason, id);
      audit(actor, action, id, reason, { previousInvalid: a.invalid }); return;
    }
    const p = one("SELECT * FROM players WHERE id=?", id);
    if (!p) throw new ArenaError(404, "ไม่พบผู้เล่น");
    if (body.confirm !== p.friend_code) throw new ArenaError(400, "รหัสสหายที่ยืนยันไม่ตรงกับบัญชีเป้าหมาย");
    if (action === "rename") run("UPDATE players SET name=?,name_locked=1 WHERE id=?", name(body.name), id);
    else if (action === "clear") run("UPDATE players SET name='',name_locked=1 WHERE id=?", id);
    else if (action === "hide") run("UPDATE players SET hidden=1,public=0,presence=0 WHERE id=?", id);
    else if (action === "restore") run("UPDATE players SET hidden=0,suspended=0,name_locked=0 WHERE id=? AND deleted=0", id);
    else if (action === "suspend") run("UPDATE players SET suspended=1,presence=0 WHERE id=?", id);
    else if (action === "anonymize") {
      run("UPDATE players SET name='',name_locked=1,hidden=1,deleted=1,public=0,presence=0 WHERE id=?", id);
      run("DELETE FROM sessions WHERE principal=? AND role='player'", id);
      run("DELETE FROM friends WHERE a=? OR b=?", id, id);
    } else throw new ArenaError(400, "ไม่รองรับการดำเนินการนี้");
    audit(actor, action, id, reason, { retainedAttempts: one("SELECT COUNT(*) AS n FROM attempts WHERE player=?", id)!.n });
  });
}
