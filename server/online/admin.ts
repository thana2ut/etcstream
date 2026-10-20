import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { trustedClient } from "./supabase";
import { input, passwordMatches } from "@/server/arena/auth";
import { ArenaError } from "@/server/arena/db";
import { previewStart } from "@/server/arena/admin-preview";
import { trainingStatus } from "@/server/arena/training-status";
import type { AdminPreviewContext } from "@/game/security/admin-preview-types";

const cookie = "etc_cloud_admin";
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
type Admission = { token_hash: string; entry_id: string; expires: string; credential_version: string; preview: AdminPreviewContext | null };
function ownerHash() {
  const value = process.env.ADMIN_PASSWORD_HASH;
  if (process.env.ADMIN_CREDENTIAL_ROTATED !== "1" || !value || !/^scrypt\$[a-f0-9]{48}\$[a-f0-9]{128}$/.test(value)) throw new ArenaError(503, "เจ้าของต้องตั้งรหัสหลักใหม่อย่างปลอดภัยก่อนเปิดตำหนักออนไลน์");
  return value;
}
function check<T>(result: { data: T; error: unknown }): T { if (result.error) throw new ArenaError(503, "ยังเชื่อมต่อข้อมูลผู้ดูแลไม่ได้"); return result.data; }
export async function cloudAdminSession(): Promise<Admission | null> {
  const value = (await cookies()).get(cookie)?.value;
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return null;
  const db = trustedClient();
  const row = check(await db.from("etc_admin_sessions").select("*").eq("token_hash", digest(value)).gt("expires", new Date().toISOString()).maybeSingle()) as Admission | null;
  return row?.credential_version === digest(ownerHash()) ? row : null;
}
export async function cloudAdmin(request: Request, path: string[]) {
  try {
    const post = request.method === "POST", body = post ? await input(request) : {}, route = path.join("/");
    const jar = await cookies(), db = trustedClient(), url = new URL(request.url);
    const revoke = async () => {
      const token = jar.get(cookie)?.value;
      if (token && /^[a-f0-9]{64}$/.test(token)) check(await db.from("etc_admin_sessions").delete().eq("token_hash", digest(token)));
      jar.delete(cookie);
    };
    if (post && ["entry-reset", "logout"].includes(route)) { await revoke(); return reply({ ok: true }); }
    if (post && route === "login") {
      const hash = ownerHash();
      check(await db.rpc("etc_trusted_budget", { k: "owner-login", maximum: 8, seconds: 900 }));
      if (typeof body.password !== "string" || body.password.length < 14 || body.password.length > 128 || !/[A-Za-z]/.test(body.password) || !/[^A-Za-z]/.test(body.password) || !passwordMatches(body.password, hash)) throw new ArenaError(401, "รหัสผ่านไม่ถูกต้อง");
      await revoke();
      const token = randomBytes(32).toString("hex"), expires = Date.now() + 8 * 3600000;
      const admission = check(await db.from("etc_admin_sessions").insert({ token_hash: digest(token), expires: new Date(expires).toISOString(), credential_version: digest(hash) }).select("entry_id").single());
      if (!admission) throw new ArenaError(503, "ยังสร้างเซสชันผู้ดูแลไม่ได้");
      check(await db.from("etc_admin_audit").insert({ actor: "owner", action: "login", target: "admin", reason: "Owner authenticated with rotated credential" }));
      jar.set(cookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
      return reply({ ok: true, entryId: admission.entry_id, actorId: "owner", rotate: false, expires, serverNow: Date.now() });
    }
    const admission = await cloudAdminSession();
    if (!admission) throw new ArenaError(401, "กรุณากรอกรหัสหลักเพื่อเข้าตำหนักอีกครั้ง");
    const expires = Date.parse(admission.expires);
    if (route === "session" && !post) return reply({ authenticated: true, entryId: admission.entry_id, actorId: "owner", rotate: false, expires, serverNow: Date.now() });
    if (["competition-status", "competition-lock", "competition-unlock"].includes(route)) return reply({ configured: true, unlocked: true, authority: "main-admin-session" });
    if (post && route === "preview-start") {
      check(await db.rpc("etc_trusted_budget", { k: "owner-preview", maximum: 30, seconds: 60 }));
      const entry = { expires, preview: null };
      const preview = previewStart(entry, body);
      check(await db.from("etc_admin_sessions").update({ preview }).eq("token_hash", admission.token_hash));
      return reply(preview);
    }
    if (route === "preview-session" && !post) {
      const preview = admission.preview;
      if (!preview || preview.id !== url.searchParams.get("id") || preview.scenarioId !== url.searchParams.get("scenario") || preview.expires <= Date.now()) throw new ArenaError(403, "สิทธิ์เล่นตรวจสิ้นสุดแล้ว");
      return reply({ valid: true, id: preview.id, expires: preview.expires, serverNow: Date.now() });
    }
    if (route === "preview-end" && post) { check(await db.from("etc_admin_sessions").update({ preview: null }).eq("token_hash", admission.token_hash)); return reply({ ok: true }); }
    if (route === "training" && !post) return reply(trainingStatus());
    if (route === "database" && !post) return reply({ state: "READY", message: "Supabase · ข้อมูลส่วนกลาง", requiredVersion: 12, schemaVersion: 12, missing: [], backend: "supabase" });
    if (route === "demo" && !post) return reply({ enabled: false, profiles: [] });
    if (route === "seasons" && !post) return reply({ seasons: [] });
    if (post && route === "moderate") {
      const target = String(body.id || ""), reason = String(body.reason || "").trim();
      if (body.confirm !== target || reason.length < 5 || reason.length > 500 || !/^[0-9a-f-]{36}$/i.test(target)) throw new ArenaError(400, "กรอกรหัสยืนยันและเหตุผลให้ครบก่อนดำเนินการ");
      if (!["rename", "clear", "hide", "suspend", "restore"].includes(String(body.action))) throw new ArenaError(409, "การลบข้อมูลและแก้ผลอันดับยังไม่เปิดใช้งาน ต้องตรวจนโยบายเก็บรักษาและสำรองข้อมูลก่อน");
      check(await db.rpc("etc_moderate", { target_id: target, operation: body.action, new_name: String(body.name || "").normalize("NFC"), reason }));
      return reply({ ok: true });
    }
    if (post) throw new ArenaError(409, "การตั้งค่านี้ยังไม่เปิดบนระบบออนไลน์ กรุณารอการตรวจรับโครงสร้างและกติกาก่อน");
    const offset = Math.min(100000, Math.max(0, Math.floor(Number(url.searchParams.get("offset")) || 0)));
    const search = (url.searchParams.get("q") || "").slice(0, 80).toLowerCase();
    if (route === "players") {
      const players = check(await db.from("etc_profiles").select("*").order("created", { ascending: false }).range(offset, offset + 99)) || [];
      return reply({ players: players.filter((p) => !search || [p.name,p.friend_code,p.id].some((v) => String(v).toLowerCase().includes(search))).map((p) => ({ ...p, created: Date.parse(p.created), deleted: 0, attempt_count: null })) });
    }
    if (["competitions", "leaderboards", "reviews"].includes(route)) {
      let query = db.from("etc_runs").select("id,player,scenario,status,start,created,elapsed,penalty,total,graph_valid,invalid,verified_at,validation_version").order("created", { ascending: false }).range(offset, offset + 99);
      if (route === "reviews") query = query.in("status", ["UNDER_REVIEW", "REJECTED"]);
      const runs = check(await query) || [];
      if (route === "reviews") return reply({ reviews: runs.map((r) => ({ attempt: r.id, player: r.player, scenario: r.scenario, status: r.status, graph_valid: r.graph_valid, state: "pending", reason: "ยังไม่เปิดรับรองอันดับ" })), verificationAvailable: false });
      return reply({ attempts: runs.map((r) => ({ ...r, playerId: r.player, start: r.start ? Date.parse(r.start) : null, created: Date.parse(r.created), elapsedMs: r.elapsed, penaltyMs: r.penalty, totalMs: r.total, graphValid: r.graph_valid })) });
    }
    if (route === "audit") return reply({ events: (check(await db.from("etc_admin_audit").select("*").order("created", { ascending: false }).range(offset, offset + 99)) || []).map((e) => ({ ...e, created: Date.parse(e.created) })) });
    if (route === "overview" || route === "friends") {
      const count = async (table: string, filters: Record<string, unknown> = {}) => {
        let q = db.from(table).select("*", { count: "exact", head: true });
        for (const [key,value] of Object.entries(filters)) q = q.eq(key,value);
        const result = await q; if (result.error) throw result.error; return { count: result.count || 0 };
      };
      if (route === "friends") { const [requests,blocks] = await Promise.all([count("etc_friends", { status: "pending" }), count("etc_blocks")]); return reply({ requests, blocks }); }
      const [players,attempts,pending,verified] = await Promise.all([count("etc_profiles"),count("etc_runs"),count("etc_runs",{ status: "UNDER_REVIEW" }),count("etc_runs",{ status: "VERIFIED",invalid:false })]);
      return reply({ players, attempts, pending, verified, activePlayers: null, verifiedPlayers: null, online: null, eligible: null, season: null, duelEnabled: false });
    }
    throw new ArenaError(409, "ส่วนนี้ยังไม่เปิดบนระบบออนไลน์");
  } catch (error) {
    if (!(error instanceof ArenaError)) console.error("Cloud admin unavailable", error instanceof Error ? error.name : "UnknownError");
    return reply({ error: error instanceof ArenaError ? error.message : "ยังเชื่อมต่อข้อมูลผู้ดูแลไม่ได้ กรุณาตรวจการตั้งค่าฝั่งเซิร์ฟเวอร์" }, error instanceof ArenaError ? error.status : 503);
  }
}
function reply(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } }); }
