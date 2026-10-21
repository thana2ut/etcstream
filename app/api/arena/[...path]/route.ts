import { safeArenaError } from "@/server/arena/db";
import { databaseDiagnostic } from "@/server/arena/db";
import { demoView } from "@/server/arena/demo";
import { replayForOwner } from "@/server/arena/command-replay";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { all, one, run, transaction, limit, onlineSchemaReady, requireOnlineSchema, ArenaError } from "@/server/arena/db";
import { cookieName, digest, input, issueSession, logout, requireSession, session } from "@/server/arena/auth";
import * as arena from "@/server/arena/service";
import * as ranked from "@/server/arena/ranked";
import {generateRecovery,recoverPlayer} from "@/server/arena/recovery";
import { cloudEnabled } from "@/server/online/supabase";
import { cloudArena } from "@/server/online/arena";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  const { path } = await context.params, route = path[0], url = new URL(request.url);
  const post = request.method === "POST", body = post ? await input(request) : {};
  if (!post && route === "status") {
    const status = databaseDiagnostic();
    return { state: status.state, available: status.state === "READY", message: status.state === "READY" ? "เชื่อมต่อข้อมูลส่วนกลางแล้ว" : "ไม่สามารถโหลดข้อมูลออนไลน์ได้", serverNow: Date.now() };
  }
  if (!post && route === "demo") return demoView();
  if (["economy","market","social"].includes(route)) throw new ArenaError(503, "ตลาดสวรรค์และหินวิญญาณใช้ได้เฉพาะระบบออนไลน์ (ARENA_BACKEND=supabase)", "ONLINE_NOT_CONFIGURED");
  if (!post && route === "public") throw new ArenaError(503, "ทำเนียบเซียนออนไลน์ยังไม่ได้ตั้งค่า (ARENA_BACKEND ไม่ใช่ supabase)", "ONLINE_NOT_CONFIGURED");
  if (post && path.join("/") === "recovery/redeem") return recoverPlayer(body.credential);
  if (post && route === "register") {
    if (await session("player")) throw new ArenaError(409, "มีบัญชีผู้เล่นในเบราว์เซอร์นี้แล้ว ใช้หน้าข้อมูลส่วนตัวเพื่อแก้ไข");
    limit("registration", 30, 3600000);
    const player = arena.createPlayer(body.name); await issueSession(String(player.id), "player");
    return arena.playerView(player, true);
  }
  if (!post && route === "leaderboard") {
    const viewer = await session("player");
    if (viewer?.suspended) throw new ArenaError(403,"บัญชีถูกระงับ กรุณาติดต่อผู้ดูแล");
    limit("boards:"+(viewer?.id || "public"),120);
    return ranked.stageBoard(url.searchParams.get("scenario") || "xs-1",url.searchParams.get("scope") || "all",viewer ? String(viewer.id) : "",ranked.pageOffset(url.searchParams.get("offset")),url.searchParams.get("season") || undefined,url.searchParams.get("period") || "all");
  }
  if (!post && route === "ranked") {
    const viewer=await session("player"); if(viewer?.suspended) throw new ArenaError(403,"บัญชีถูกระงับ");
    limit("ranked:"+(viewer?.id || "public"),120);
    return ranked.rankedBoard(url.searchParams.get("scope") || "all",viewer ? String(viewer.id) : "",ranked.pageOffset(url.searchParams.get("offset")),url.searchParams.get("season") || undefined);
  }
  if (!post && path.join("/") === "seasons") { requireOnlineSchema(); return {seasons:all("SELECT * FROM seasons ORDER BY starts DESC LIMIT 50").map(ranked.seasonView)}; }
  const player = await requireSession("player"), id = String(player.id);
  if (!post && route === "tester") return {
    tester: false,
    missionAccess: String(player.friend_code).toUpperCase() === "2E0BF31644734BCB",
    account: id,
  };
  if (!post && route === "my-standing") return ranked.stageBoard(url.searchParams.get("scenario") || "xs-1","all",id).mine;
  if (!post && route === "stage-summary") {limit("stage-summary:"+id,6);return {stages:ranked.stageSummary(id)};}
  if (!post && route === "compare") {limit("compare:"+id,20);return ranked.friendComparison(id,url.searchParams.get("friend") || "",url.searchParams.get("scenario") || "xs-1");}
  if (post && path.join("/") === "recovery/generate") return generateRecovery(id);
  if (!post && route === "profile") {
    const verified=onlineSchemaReady()?"status='VERIFIED' AND invalid=0 AND verified_at IS NOT NULL AND validation_version IS NOT NULL":"0";
    return { player: arena.playerView(player, true), stats: one(`SELECT COUNT(*) AS starts, SUM(CASE WHEN status IN ('VERIFIED','UNDER_REVIEW','REJECTED','UNRANKED') THEN 1 ELSE 0 END) AS finishes, SUM(CASE WHEN ${verified} THEN 1 ELSE 0 END) AS verified, MIN(CASE WHEN ${verified} THEN total END) AS bestMs FROM attempts WHERE player=?`, id), history: all("SELECT * FROM attempts WHERE player=? ORDER BY created DESC LIMIT 50", id).map(arena.attemptView), rules: arena.settings(), duelEnabled: false };
  }
  if (post && route === "profile") {
    const nextName = typeof body.name === "string" && !player.name_locked ? arena.name(body.name) : player.name;
    if (nextName !== player.name && one("SELECT 1 FROM players WHERE name=? COLLATE NOCASE AND id<>? AND deleted=0",nextName,id)) throw new ArenaError(409,"ชื่อนี้มีผู้ใช้แล้ว กรุณาเลือกชื่อที่ต่างออกไป ประวัติของคุณยังคงเดิม");
    if (body.rankPublic !== undefined) requireOnlineSchema();
    transaction(()=>{run("UPDATE players SET name=?,public=?,presence=? WHERE id=?", nextName, body.public === true ? 1 : 0, body.presence === true ? 1 : 0, id);
    if (body.rankPublic !== undefined) run("UPDATE players SET rank_public=? WHERE id=?",body.rankPublic===true ? 1 : 0,id);});
    return arena.playerView(one("SELECT * FROM players WHERE id=?", id)!, true);
  }
  if (post && route === "heartbeat") {
    limit("presence:" + id, 6);
    const token = (await cookies()).get(cookieName("player"))?.value;
    if (token) {
      run("UPDATE sessions SET seen=?,expires=? WHERE token_hash=?", Date.now(), Date.now() + 30 * 86400000, digest(token));
      (await cookies()).set(cookieName("player"), token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 86400 });
    }
    return { ok: true,serverNow:Date.now() };
  }
  if (post && route === "logout") { await logout("player"); return { ok: true }; }
  if (route === "friends") {
    if (post) { arena.friendAction(id, body); return { ok: true }; }
    const seasonal=new Map(onlineSchemaReady()?ranked.friendSeasonalRanks(id).map((p)=>[p.friendCode,p]):[]);
    const friends=arena.friendsFor(id).map((f)=>({ ...f, seasonal:seasonal.get(String(f.friendCode)) || null }));
    return { friends, blocks: all("SELECT p.friend_code AS friendCode FROM blocks b JOIN players p ON p.id=b.b WHERE b.a=?", id) };
  }
  if (route === "directory" && !post) {
    limit("directory:" + id, 20);
    return { players: all("SELECT * FROM players WHERE public=1 AND hidden=0 AND suspended=0 AND deleted=0 ORDER BY created DESC LIMIT 50").filter((p) => !arena.blocked(id, String(p.id))).map((p) => arena.playerView(p)) };
  }
  if(route==="online-summary" && !post){limit("online-summary:"+id,10);return {onlineFriends:arena.friendsFor(id).filter((f)=>f.status==="accepted"&&f.online).length,serverNow:Date.now()};}
  if (route === "attempts") {
    requireOnlineSchema();
    if (post && await session("admin")) throw new ArenaError(403,"กรุณาออกจากโหมดผู้ดูแลก่อนเริ่มหรือส่งคำสั่งการแข่งขันจริง");
    if (path.length === 1 && post) return ranked.createOnlineAttempt(id, body.scenario,body.requestId);
    if (path.length === 2 && post) {
      limit("attempt-actions:"+id,600);
      const a=arena.attemptAction(id,path[1],body);
      if(onlineSchemaReady() && body.action==="finish" && a.status==="UNDER_REVIEW") run("INSERT INTO competition_reviews(attempt,state,validation_version,reason,updated) VALUES(?,'pending','server-command-v1',?,?) ON CONFLICT(attempt) DO NOTHING",path[1],"ต้องตรวจสถานะที่คำนวณบนเซิร์ฟเวอร์และนโยบายรับรองของระดับนี้ก่อน",Date.now());
      const replay = one("SELECT protocol,seq FROM competition_replay WHERE attempt=?",path[1]);
      return { ...a, verificationEnabled: process.env.ARENA_VERIFIED_SLICE_ENABLED === "1", protocol: replay?.protocol, commandSeq: Number(replay?.seq || 0) };
    }
    if (path.length === 2) { const a = arena.ownedAttempt(id, path[1]); return { ...arena.attemptView(a), verificationEnabled: process.env.ARENA_VERIFIED_SLICE_ENABLED === "1", replay: replayForOwner(path[1]), seed: a.seed,eventSeq:Number(one("SELECT COALESCE(MAX(seq),0) AS n FROM attempt_events WHERE attempt=?",path[1])!.n) }; }
  }
  throw new ArenaError(404, "ไม่พบรายการนี้");
}
async function respond(request: Request, context: Context) {
  if (cloudEnabled()) return cloudArena(request, (await context.params).path);
  try { return NextResponse.json(await handle(request, context), { headers: { "Cache-Control": "no-store" } }); }
  catch (e) {
    const failure = safeArenaError(e);
    if (!(e instanceof ArenaError)) console.error("Arena request failed", e instanceof Error ? e.name : "UnknownError");
    return NextResponse.json({ error: failure.message, code: failure.code }, { status: failure.status, headers: { "Cache-Control": "no-store" } });
  }
}
export const GET = respond;
export const POST = respond;
