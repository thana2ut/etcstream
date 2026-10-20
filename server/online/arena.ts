import "server-only";
import { NextResponse } from "next/server";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { playerClient, trustedClient } from "./supabase";
import { input } from "@/server/arena/auth";
import { ArenaError } from "@/server/arena/db";
import { apply, commandCost } from "@/server/arena/command-replay";
import { validateNickname } from "@/game/security/nickname-validation";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { initialTrainingState, initSim, simContext, type TrainingState } from "@/game/training/hdmi-training";
import { checkMissionBag } from "@/game/content/mission-bag";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { validateLevel } from "@/game/training/sim/engine";
import type { Json } from "./types";
import { cloudAdminSession } from "./admin";

const rules = { connector_ms: 5000, route_ms: 10000, hint_ms: 15000, failed_ms: 10000, version: 1, board: 1, time_attack: 1 };
const protocol = "server-command-v1";
type Run = {
  id: string; player: string; scenario: ScenarioId; scenario_version: string; seed: number; status: string;
  created: string; start: string | null; elapsed: number | null; penalty: number; total: number | null;
  mistakes: number; graph_valid: boolean; invalid: boolean; seq: number; revision: number;
  state: TrainingState | null; bag: Record<string, number> | null; verified_at: string | null; validation_version: string | null;
};
const ms = (s: string | null) => s ? Date.parse(s) : null;
const stages = Object.keys(SCENARIOS).filter((s) => /^(xs|s|m|l|xl)-[1-5]$/.test(s)) as ScenarioId[];
const version = (id: ScenarioId) => createHash("sha256").update(JSON.stringify(SCENARIOS[id])).digest("hex").slice(0, 24);
function view(r: Run, replay = false) {
  return { id: r.id, scenario: r.scenario, scenarioVersion: r.scenario_version, rulesVersion: 1, status: r.status,
    start: ms(r.start), elapsedMs: r.elapsed, penaltyMs: r.penalty, totalMs: r.total, mistakes: r.mistakes,
    graphValid: r.graph_valid, invalid: r.invalid, created: ms(r.created), serverNow: Date.now(), seed: r.seed,
    protocol, commandSeq: r.seq, verificationEnabled: false, verifiedAt: ms(r.verified_at), validationVersion: r.validation_version,
    reason: r.status === "UNDER_REVIEW" ? "บันทึกคำสั่งและตรวจกราฟฝั่งเซิร์ฟเวอร์แล้ว แต่ยังไม่เปิดรับรองอันดับของด่านนี้" : null,
    ...(replay ? { replay: r.state ? { state: r.state, bag: r.bag, seq: r.seq, protocol } : null } : {}),
  };
}
function checked<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
const json = (value: unknown) => value as Json;
const uuid = (s: unknown) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function cloudArena(request: Request, path: string[]) {
  try {
    const post = request.method === "POST", body = post ? await input(request) : {};
    const route = path.join("/"), url = new URL(request.url);
    if (route === "demo") return response({ enabled: false, profiles: [] });
    const client = await playerClient();
    if (route === "status" && !post) {
      const result = await client.rpc("etc_can_join_lobby");
      return response({ state: result.error ? "MIGRATION_OR_CONNECTION_REQUIRED" : "READY", available: !result.error,
        message: result.error ? "ยังเชื่อมต่อโครงสร้างข้อมูลออนไลน์ไม่ได้ กรุณาติดต่อผู้ดูแล" : "เชื่อมต่อ Supabase แล้ว · ยังไม่ผ่านการทดสอบการเล่น", serverNow: Date.now() });
    }
    let { data: { user } } = await client.auth.getUser();
    if (post && route === "register") {
      const name = validateNickname(body.name);
      if (!name || /^(admin|administrator|ผู้ดูแล|ระบบ)$/i.test(name)) throw new ArenaError(400, "ใช้ชื่อภาษาไทยหรืออังกฤษ 2–20 ตัวอักษร และไม่ใช้ชื่อสงวน");
      if (!user) {
        const result = await client.auth.signInAnonymously();
        if (result.error || !result.data.user) throw new ArenaError(503, "ยังสร้างตัวตนไม่ได้ กรุณาตรวจว่าเปิดการเข้าสู่ระบบแบบไม่ใช้อีเมลและข้อจำกัดการสมัครแล้ว");
        user = result.data.user;
      }
      return response(checked(await client.rpc("etc_player", { action: "register", body: { name: name.normalize("NFC") } })));
    }
    if (!user) throw new ArenaError(401, "กรุณาเข้าสู่ระบบก่อน");
    const player = checked(await client.rpc("etc_player", { action: "get" })) as { id: string; rankPublic: boolean };
    const rpc = async (action: string, value: unknown = {}) => checked(await client.rpc("etc_player", { action, body: json(value) }));
    if (route === "profile" && post) return response(await rpc("profile", body));
    if (route === "heartbeat" && post) return response(await rpc("heartbeat"));
    if (route === "logout" && post) { await rpc("offline"); const result = await client.auth.signOut(); if (result.error) throw result.error; return response({ ok: true }); }
    if (route === "friends") return response(await rpc(post ? "friends" : "friend-list", body));
    if (route === "directory" && !post) return response(await rpc("directory"));
    if (route === "online-summary" && !post) {
      const list = await rpc("friend-list") as { friends: { online: boolean; status: string }[] };
      return response({ onlineFriends: list.friends.filter((f) => f.online && f.status === "accepted").length, serverNow: Date.now() });
    }
    if (route.startsWith("recovery/")) throw new ArenaError(409, "บัญชีออนไลน์ใช้การผูกอีเมลเพื่อกู้คืน กรุณาใช้หัวข้อผูกอีเมลในหน้าข้อมูลส่วนตัว");
    const db = trustedClient();
    if (route === "profile" && !post) {
      const runs = checked(await db.from("etc_runs").select("*").eq("player", user.id).order("created", { ascending: false }).limit(50)) as Run[];
      return response({ player, stats: { starts: runs.length, finishes: runs.filter((r) => !["PENDING", "RUNNING"].includes(r.status)).length,
        verified: runs.filter((r) => r.status === "VERIFIED" && !r.invalid).length, bestMs: null }, history: runs.map((r) => view(r)), rules, duelEnabled: false });
    }
    if (route === "seasons" && !post) return response({ seasons: [], unavailableReason: "ยังไม่เปิดฤดูกาลจนกว่าระบบรับรองผลครบและเจ้าของตรวจรับ" });
    if (route === "ranked" && !post) return response({ season: null, rows: [], mine: null, total: 0, hasMore: false, nextOffset: null, enabled: false, serverNow: Date.now() });
    const scenario = (url.searchParams.get("scenario") || "xs-1") as ScenarioId;
    if (["leaderboard", "my-standing", "stage-summary", "compare"].includes(route) && !post) {
      // Remain explicit about eligibility. No unverified times are exposed as rankings.
      if (route === "compare") throw new ArenaError(409, "ยังไม่มีผลที่รับรองสำหรับเปรียบเทียบอันดับออนไลน์");
      const history = checked(await db.from("etc_runs").select("*").eq("player", user.id).order("created", { ascending: false }).limit(250)) as Run[];
      const mineFor = (id: string) => ({ rank: null, globalRank: null, best: null, latest: history.find((r) => r.scenario === id) ? view(history.find((r) => r.scenario === id)!) : null, gapMs: null, visibility: player.rankPublic ? "public" : "private", validAttempts: 0 });
      if (route === "stage-summary") return response({ stages: stages.map((id) => ({ scenario: id, ...mineFor(id) })) });
      if (!stages.includes(scenario)) throw new ArenaError(400, "ไม่พบภารกิจที่เลือก");
      if (url.searchParams.get("season")) throw new ArenaError(409, "ยังไม่เปิดฤดูกาลออนไลน์");
      const board = checked(await client.rpc("etc_stage_board", { stage: scenario, stage_version: version(scenario),
        scope: url.searchParams.get("scope") || "all", page_offset: Math.min(100000,Math.max(0,Math.floor(Number(url.searchParams.get("offset"))||0))),
        weekly: url.searchParams.get("period") === "weekly" })) as { mine: unknown };
      return response(route === "my-standing" ? board.mine : board);
    }
    if (path[0] === "attempts") {
      if (post && await cloudAdminSession()) throw new ArenaError(403, "กรุณาออกจากโหมดผู้ดูแลก่อนเริ่มหรือส่งคำสั่งการแข่งขันจริง");
      if (post && path.length === 1) {
        if (!stages.includes(body.scenario as ScenarioId) || !uuid(body.requestId)) throw new ArenaError(400, "ข้อมูลรอบหรือภารกิจไม่ถูกต้อง");
        const old = checked(await db.from("etc_runs").select("*").eq("player", user.id).eq("request_id", body.requestId).maybeSingle()) as Run | null;
        if (old) { if (old.scenario !== body.scenario) throw new ArenaError(409, "รหัสรอบนี้ใช้กับด่านอื่นแล้ว"); return response(view(old)); }
        checked(await db.rpc("etc_trusted_budget", { k: "run:" + user.id, maximum: 8, seconds: 3600 }));
        const id = body.scenario as ScenarioId;
        const result = await db.from("etc_runs").insert({ id: randomUUID(), player: user.id, request_id: body.requestId,
          scenario: id, scenario_version: version(id), seed: randomBytes(4).readUInt32BE() }).select("*").single();
        if (result.error?.code === "23505") {
          const retry = checked(await db.from("etc_runs").select("*").eq("player", user.id).eq("request_id", body.requestId).single()) as Run;
          if (retry.scenario !== id) throw new ArenaError(409, "รหัสรอบนี้ใช้กับด่านอื่นแล้ว");
          return response(view(retry));
        }
        return response(view(checked(result) as Run));
      }
      if (path.length !== 2 || !uuid(path[1])) throw new ArenaError(404, "ไม่พบรอบแข่งขันนี้");
      const r = checked(await db.from("etc_runs").select("*").eq("id", path[1]).eq("player", user.id).maybeSingle()) as Run | null;
      if (!r) throw new ArenaError(404, "ไม่พบรอบแข่งขันนี้");
      if (!post) return response(view(r, true));
      if (!['PENDING', 'RUNNING'].includes(r.status)) return response(view(r));
      if (version(r.scenario) !== r.scenario_version) throw new ArenaError(409, "ข้อมูลด่านเปลี่ยนแล้ว กรุณาเริ่มรอบใหม่");
      const patch: Record<string, unknown> = { action: body.action };
      let command: { method: string; args: unknown[] } | null = null;
      if (body.action === "ready") {
        if (r.status === "RUNNING") return response(view(r));
        const bag = body.bag as Record<string, number>;
        if (!bag || typeof bag !== "object" || Array.isArray(bag) || !Object.values(bag).every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 100) || !checkMissionBag(SCENARIOS[r.scenario], bag).ok) throw new ArenaError(400, "ชุดสายไม่ตรงกับภารกิจจริง");
        const state = initialTrainingState(r.scenario, hiddenCablesFor(SCENARIOS[r.scenario], bag), packedLeadsFor(SCENARIOS[r.scenario], bag));
        state.sim = initSim(SCENARIOS[r.scenario], r.seed); patch.state = state; patch.bag = bag;
      } else if (body.action === "command") {
        checked(await db.rpc("etc_trusted_budget", { k: "command:" + user.id, maximum: 600, seconds: 60 }));
        command = body.command as { method: string; args: unknown[] };
        if (!command || typeof command.method !== "string" || !Array.isArray(command.args) || command.args.length > 3 || JSON.stringify(command).length > 8000 || !Number.isSafeInteger(body.seq)) throw new ArenaError(400, "คำสั่งเกมไม่ถูกต้อง");
        if (Number(body.seq) <= r.seq) {
          const old = checked(await db.from("etc_commands").select("payload").eq("run_id", r.id).eq("seq", body.seq).maybeSingle());
          if (!old || JSON.stringify(old.payload) !== JSON.stringify(json(command))) {
            // jsonb object key order is canonicalized; compare parsed semantic payload below.
            if (!old || !sameCommand(old.payload, command)) throw new ArenaError(409, "คำสั่งลำดับเดิมมีข้อมูลไม่ตรงกัน");
          }
          return response(view(r));
        }
        if (Number(body.seq) !== r.seq + 1 || !r.state) throw new ArenaError(409, "ลำดับคำสั่งไม่ต่อเนื่อง กรุณาส่งคำสั่งที่ค้างก่อน");
        const after = apply(r.state, command.method, command.args), cost = commandCost(r.state, after, command.method, rules);
        Object.assign(patch, { state: after, penalty: cost.penalty, mistakes: cost.mistakes });
      } else if (body.action === "finish") {
        const ctx = r.state && simContext(r.state);
        patch.valid = Boolean(ctx && r.state?.completed && r.seq >= 2 && !SCENARIOS[r.scenario].designIssues?.length && validateLevel(ctx).every((v) => v.result.ok));
      } else if (body.action !== "abandon") throw new ArenaError(400, "ไม่รองรับคำสั่งนี้");
      const saved = checked(await db.rpc("etc_save_run", { run_id: r.id, expected_revision: r.revision, patch: json(patch), command: json(command) })) as Run;
      return response(view(saved));
    }
    throw new ArenaError(404, "ไม่พบรายการนี้");
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (error instanceof ArenaError) return response({ error: error.message }, error.status);
    if (/PROFILE_REQUIRED|AUTH_REQUIRED/.test(code)) return response({ error: "กรุณาเข้าสู่ระบบก่อน" }, 401);
    if (/RATE_LIMIT/.test(code)) return response({ error: "ทำรายการบ่อยเกินไป กรุณารอสักครู่" }, 429);
    if (/SUSPENDED/.test(code)) return response({ error: "บัญชีถูกระงับ กรุณาติดต่อผู้ดูแล" }, 403);
    if (/REVISION_CONFLICT/.test(code)) return response({ error: "ข้อมูลรอบเปลี่ยนระหว่างส่งคำสั่ง กรุณาลองส่งคำสั่งเดิมอีกครั้ง" }, 409);
    if (/FRIEND_NOT_FOUND|REQUEST_NOT_FOUND|duplicate key/.test(code)) return response({ error: "ไม่พบคำขอที่ใช้ได้ หรือมีคำขอถึงสหายนี้แล้ว" }, 409);
    if (/INVALID_NAME/.test(code)) return response({ error: "ใช้ชื่อภาษาไทยหรืออังกฤษ 2–20 ตัวอักษร และไม่ใช้ชื่อสงวน" }, 400);
    if (/RUN_NOT_STARTED|COMMAND_LIMIT/.test(code)) return response({ error: "รอบยังไม่เริ่มหรือเกินข้อจำกัด กรุณาตรวจสถานะรอบ" }, 409);
    console.error("Online request unavailable", error instanceof Error ? error.name : "UnknownError");
    return response({ error: "ยังเชื่อมต่อระบบออนไลน์ไม่ได้ กรุณาติดต่อผู้ดูแลเพื่อตรวจสิทธิ์โครงการและการตั้งค่า" }, 503);
  }
}
function sameCommand(a: unknown, b: { method: string; args: unknown[] }) {
  const value = a as { method?: string; args?: unknown[] };
  const stable = (x: unknown): string => x === null || typeof x !== "object" ? JSON.stringify(x) : Array.isArray(x) ? `[${x.map(stable).join(",")}]` : `{${Object.entries(x).sort(([a], [b]) => a.localeCompare(b)).map(([k,v]) => JSON.stringify(k)+":"+stable(v)).join(",")}}`;
  return value.method === b.method && stable(value.args) === stable(b.args);
}
function response(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } }); }
