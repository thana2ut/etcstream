import { safeArenaError } from "@/server/arena/db";
import { databaseDiagnostic } from "@/server/arena/db";
import { demoView, setDemo } from "@/server/arena/demo";
import { adminEntry } from "@/server/arena/admin-entry";
import { previewStart } from "@/server/arena/admin-preview";
import { trainingStatus } from "@/server/arena/training-status";
import { NextResponse } from "next/server";
import { input, issueSession, loginLimit, logout, passwordHash, passwordMatches, requireSession } from "@/server/arena/auth";
import { all, one, run, transaction, audit, onlineSchemaReady, requireOnlineSchema, ArenaError, limit } from "@/server/arena/db";
import { moderate, settings, attemptView } from "@/server/arena/service";
import {seasonAdmin,seasonView,activeSeason} from "@/server/arena/ranked";
import { cloudEnabled } from "@/server/online/supabase";
import { cloudAdmin } from "@/server/online/admin";
import { catalogUpload } from "@/server/online/admin-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function respond(request: Request, context: Context) {
  // Vercel must never fall back to the legacy SQLite owner credential.
  if (cloudEnabled() || process.env.VERCEL === "1") {
    const path = (await context.params).path;
    // Multipart image upload for the live market CMS (JSON body parser in cloudAdmin must not consume it).
    if (path.join("/") === "catalog/upload") return catalogUpload(request);
    return cloudAdmin(request, path);
  }
  try {
    const { path } = await context.params, route = path.join("/"), post = request.method === "POST";
    const body = post ? await input(request) : {};
    const url = new URL(request.url), offset = Math.max(0, Math.min(100000, Math.floor(Number(url.searchParams.get("offset")) || 0)));
    const search = "%" + (url.searchParams.get("q") || "").slice(0, 80) + "%";
    if (["entry-reset", "logout"].includes(route) && post) { await logout("admin"); return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } }); }
    if (route === "login" && post) {
      loginLimit();
      const secret = typeof body.password === "string" && body.password.length <= 512 ? body.password : "";
      const admin = one("SELECT * FROM admins WHERE active=1 LIMIT 1");
      if (!admin || !passwordMatches(secret, String(admin.hash))) throw new ArenaError(401, "รหัสผ่านไม่ถูกต้อง");
      await logout("admin");
      await issueSession(String(admin.id), "admin"); audit(String(admin.id), "login", String(admin.id), "Owner authenticated");
      const admitted = await requireSession("admin", true);
      return NextResponse.json({ entryId: adminEntry(String(admitted.entryKey)).id, ok: true, rotate: Boolean(admin.rotate), actorId: String(admin.id), expires: Date.now() + 8 * 3600000, serverNow: Date.now() }, { headers: { "Cache-Control": "no-store" } });
    }
    const actor = await requireSession("admin", ["session", "rotate", "logout"].includes(route)), id = String(actor.id);
    const entry = adminEntry(String(actor.entryKey));
    // All privileged reads and mutations require the MAIN session above.
    let data: unknown;
    if (route === "session" && !post) data = { authenticated: true, entryId: entry.id, rotate: Boolean(actor.rotate), actorId: id, expires: Number(actor.sessionExpires), serverNow: Date.now() };
    else if (route === "evidence" && !post) {
      requireOnlineSchema();
      const target = (url.searchParams.get("id") || "").slice(0,80);
      const attempt = one("SELECT * FROM attempts WHERE id=?",target);
      if (!attempt) throw new ArenaError(404,"ไม่พบรอบแข่งขันนี้");
      data = { attempt: attemptView(attempt), replay: one("SELECT protocol,seq,last_hash FROM competition_replay WHERE attempt=?",target) || null, commands: all("SELECT seq,payload,received,command_hash FROM competition_commands WHERE attempt=? ORDER BY seq LIMIT 100 OFFSET ?",target,offset) };
    }
    else if (route === "database" && !post) data = { ...databaseDiagnostic(), verifiedSliceEnabled: process.env.ARENA_VERIFIED_SLICE_ENABLED === "1", supportedStage: "xs-1" };
    else if (route === "demo" && !post) data = demoView(true);
    else if (route === "demo" && post) data = setDemo(id, body);
    // Legacy endpoints remain MAIN-session protected; no separate secret is read.
    else if (route === "competition-status" && !post) data = { configured: true, unlocked: true, authority: "main-admin-session" };
    else if (route === "competition-unlock" && post) { limit(`competition-enter:${actor.entryKey}`, 8, 900000); audit(id, "competition-enter", id, "Main administrator session authorized"); data = { ok: true }; }
    else if (route === "competition-lock" && post) data = { ok: true, authority: "main-admin-session" };
    else if (route === "preview-start" && post) {
      limit(`preview:${actor.entryKey}`, 30, 60000);
      const preview = previewStart(entry, body); audit(id, "preview-start", preview.scenarioId, "Isolated admin preview; no player results", { chamber: preview.chamber }); data = preview;
    }
    else if (route === "preview-session" && !post) {
      if (!entry.preview || url.searchParams.get("id") !== entry.preview.id || url.searchParams.get("scenario") !== entry.preview.scenarioId || entry.preview.expires <= Date.now()) throw new ArenaError(403, "สิทธิ์เล่นตรวจสิ้นสุดแล้ว");
      data = { valid: true, id: entry.preview.id, expires: Number(actor.sessionExpires), serverNow: Date.now() };
    }
    else if (route === "preview-end" && post) { if (entry.preview?.id === body.id) entry.preview = null; data = { ok: true }; }
    else if (route === "training" && !post) data = trainingStatus();
    else if (route === "logout" && post) { await logout("admin"); data = { ok: true }; }
    else if (route === "rotate" && post) {
      const secret = String(body.password || ""), current = String(body.current || "");
      const admin = one("SELECT * FROM admins WHERE id=?", id)!;
      if (secret.length < 14 || secret.length > 128 || !/[A-Za-z]/.test(secret) || !/[^A-Za-z]/.test(secret) || !passwordMatches(current, String(admin.hash)) || passwordMatches(secret, String(admin.hash))) throw new ArenaError(400, "รหัสเดิมต้องถูกต้อง และรหัสใหม่อย่างน้อย 14 ตัวอักษร ผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์ และต่างจากเดิม");
      transaction(() => { run("UPDATE admins SET hash=?,rotate=0 WHERE id=?", passwordHash(secret), id); run("DELETE FROM sessions WHERE role='admin' AND principal=?", id); audit(id, "rotate", id, "Owner rotated credential"); });
      await issueSession(id, "admin");
      const admitted = await requireSession("admin");
      data = { entryId: adminEntry(String(admitted.entryKey)).id, ok: true, actorId: id, rotate: false, expires: Date.now() + 8 * 3600000, serverNow: Date.now() };
    } else if (route === "seasons" && post) data=seasonAdmin(id,body);
    else if (route === "seasons" && !post) { requireOnlineSchema();data={seasons:all("SELECT * FROM seasons ORDER BY starts DESC LIMIT 100").map(seasonView)}; }
    else if (route === "reviews" && !post) {requireOnlineSchema();data={reviews:all("SELECT a.id AS attempt,a.player,a.scenario,a.status,a.graph_valid,COALESCE(r.state,CASE WHEN a.status='REJECTED' THEN 'rejected' ELSE 'pending' END) AS state,COALESCE(r.reason,'ผลเดิมจากเบราว์เซอร์ ยังไม่มีหลักฐานตรวจย้อนกลับที่รับรองได้') AS reason FROM attempts a LEFT JOIN competition_reviews r ON r.attempt=a.id WHERE a.status IN ('UNDER_REVIEW','REJECTED') ORDER BY a.created DESC LIMIT 100 OFFSET ?",offset),verificationAvailable:false};}
    else if (route === "reviews" && post) {
      requireOnlineSchema(); const target=String(body.id||""),reason=String(body.reason||"").trim();
      if(body.action!=="reject" || body.confirm!==target || reason.length<5 || reason.length>500) throw new ArenaError(400,"ปฏิเสธผลได้เมื่อระบุรหัสยืนยันและเหตุผลครบเท่านั้น ไม่มีคำสั่งยืนยันผลที่ไร้หลักฐาน");
      transaction(()=>{if(!one("SELECT 1 FROM attempts WHERE id=? AND status='UNDER_REVIEW'",target)) throw new ArenaError(409,"ไม่พบผลรอตรวจนี้");run("UPDATE attempts SET status='REJECTED',reason=? WHERE id=?",reason,target);run("UPDATE competition_reviews SET state='rejected',reason=?,updated=? WHERE attempt=?",reason,Date.now(),target);audit(id,"review-reject",target,reason);});data={ok:true};
    } else if (route === "moderate" && post) { moderate(id, body); data = { ok: true }; }
    else if (route === "settings" && post) {
      if(onlineSchemaReady() && activeSeason()) throw new ArenaError(409,"มีกติกาฤดูกาลที่เปิดอยู่ ต้องคงกติกาจนฤดูกาลสิ้นสุดก่อนเปลี่ยนเวอร์ชัน");
      const values = ["connector_ms", "route_ms", "hint_ms", "failed_ms"].map((k) => Number(body[k]));
      if (!values.every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 300000) || String(body.reason || "").trim().length < 5) throw new ArenaError(400, "ตรวจค่าบทลงโทษและกรอกเหตุผล");
      transaction(() => { const previous = settings().version; run("UPDATE settings SET version=version+1,time_attack=?,board=?,connector_ms=?,route_ms=?,hint_ms=?,failed_ms=? WHERE id=1", body.time_attack === true ? 1 : 0, body.board === true ? 1 : 0, ...values); audit(id, "rules-version", "settings", String(body.reason), { previous }); }); data = { ok: true };
    } else if (!post && route === "players") data = { players: all("SELECT id,friend_code,name,name_locked,public,presence,hidden,suspended,deleted,created,(SELECT COUNT(*) FROM attempts WHERE player=players.id) AS attempt_count FROM players WHERE name LIKE ? OR friend_code LIKE ? OR id LIKE ? ORDER BY created DESC LIMIT 100 OFFSET ?", search, search, search, offset) };
    else if (!post && ["competitions", "leaderboards"].includes(route)) data = { attempts: all("SELECT * FROM attempts WHERE id LIKE ? OR scenario LIKE ? OR player LIKE ? OR status LIKE ? ORDER BY created DESC LIMIT 100 OFFSET ?", search, search, search, search, offset).map((a) => ({ ...attemptView(a), playerId: a.player })) };
    else if (!post && route === "audit") data = { events: all("SELECT * FROM audit WHERE action LIKE ? OR target LIKE ? OR actor LIKE ? ORDER BY created DESC LIMIT 100 OFFSET ?", search, search, search, offset) };
    else if (!post && route === "settings") data = { settings: settings(), duelEnabled: false };
    else if (!post && route === "friends") data = { requests: one("SELECT COUNT(*) AS count FROM friends WHERE status='pending'"), blocks: one("SELECT COUNT(*) AS count FROM blocks") };
    else if (!post && route === "matches") data = { enabled: false, matches: [], reason: "ยังไม่เปิดใช้งาน: ต้องเพิ่มการตรวจย้อนกลับคำสั่งฝั่งเซิร์ฟเวอร์และทดสอบการเริ่มพร้อมกัน/หลุดเชื่อมต่อก่อน" };
    else if (!post && route === "overview") data = { players: one("SELECT COUNT(*) AS count FROM players"), activePlayers: one("SELECT COUNT(*) AS count FROM players WHERE deleted=0 AND suspended=0"), verifiedPlayers: onlineSchemaReady()?one("SELECT COUNT(DISTINCT a.player) AS count FROM attempts a JOIN players p ON p.id=a.player WHERE a.status='VERIFIED' AND a.invalid=0 AND a.verified_at IS NOT NULL AND a.validation_version IS NOT NULL AND p.deleted=0 AND p.suspended=0"):null, attempts: one("SELECT COUNT(*) AS count FROM attempts"), pending: one("SELECT COUNT(*) AS count FROM attempts WHERE status='UNDER_REVIEW'"),online:one("SELECT COUNT(DISTINCT p.id) AS count FROM players p JOIN sessions s ON s.principal=p.id AND s.role='player' WHERE p.presence=1 AND p.public=1 AND p.hidden=0 AND p.suspended=0 AND p.deleted=0 AND s.seen>? AND s.expires>?",Date.now()-90000,Date.now()),eligible:onlineSchemaReady()?one("SELECT COUNT(*) AS count FROM players WHERE public=1 AND rank_public=1 AND hidden=0 AND suspended=0 AND deleted=0"):null,verified:onlineSchemaReady()?one("SELECT COUNT(*) AS count FROM attempts WHERE status='VERIFIED' AND invalid=0 AND verified_at IS NOT NULL AND validation_version IS NOT NULL"):null,season:onlineSchemaReady()?activeSeason():null,duelEnabled:false };
    else throw new ArenaError(404, "ไม่พบรายการนี้");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const failure = safeArenaError(e);
    if (!(e instanceof ArenaError)) console.error("Admin operation failed", e instanceof Error ? e.name : "UnknownError");
    return NextResponse.json({ error: failure.message, code: failure.code }, { status: failure.status, headers: { "Cache-Control": "no-store" } });
  }
}
export const GET = respond;
export const POST = respond;
