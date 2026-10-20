import { verifiableStage } from "./command-replay";
import "server-only";
import { randomUUID } from "node:crypto";
import { db, one, run, transaction, audit, limit, requireOnlineSchema, ArenaError, type Row } from "./db";
import { scenario, scenarioVersion, settings, attemptView, createAttempt } from "./service";
import { SEASON_RULES_V1 } from "@/game/content/arena-ranked-rules";

const pageSize = 25;
export const stageIds = ["xs", "s", "m", "l", "xl"].flatMap((s) => [1,2,3,4,5].map((n) => `${s}-${n}`));
export function pageOffset(value: string | null) {
  const n = Number(value || 0);
  if (!Number.isSafeInteger(n) || n < 0 || n > 100000) throw new ArenaError(400, "เลขหน้าข้อมูลไม่ถูกต้อง");
  return n;
}
function scopeName(scope: string) { if (!["all","friends","around_me","weekly","me"].includes(scope)) throw new ArenaError(400,"ขอบเขตอันดับไม่ถูกต้อง"); return scope; }
export function activeSeason() { requireOnlineSchema(); return one("SELECT * FROM seasons WHERE status='open' AND starts<=? AND ends>? ORDER BY starts DESC LIMIT 1", Date.now(), Date.now()); }
export function seasonView(s: Row) { return { id: String(s.id), name: String(s.name), starts: Number(s.starts), ends: Number(s.ends), status: String(s.status), scoringVersion: String(s.scoring_version), revision: Number(s.revision), rules: JSON.parse(String(s.rules)), serverNow: Date.now() }; }
function resolveSeason(id?: string) { requireOnlineSchema(); if (!id) return activeSeason(); const s = one("SELECT * FROM seasons WHERE id=?", id); if (!s) throw new ArenaError(404,"ไม่พบฤดูกาลนี้"); return s; }
const tieOrder = "total,penalty,elapsed,verified_at,id";
const eligibility = "a.status='VERIFIED' AND a.invalid=0 AND a.total IS NOT NULL AND a.total>=0 AND a.elapsed>=0 AND a.penalty>=0 AND a.total=a.elapsed+a.penalty AND a.verified_at IS NOT NULL AND a.validation_version IS NOT NULL AND a.validation_version<>''";
const publicEligible = "p.public=1 AND p.rank_public=1 AND p.hidden=0 AND p.deleted=0 AND p.suspended=0";
const notBlocked = "NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.a=:viewer AND b.b=g.player) OR (b.b=:viewer AND b.a=g.player))";
const friendsPredicate = "(g.player=:viewer OR EXISTS(SELECT 1 FROM friends f WHERE f.status='accepted' AND ((f.a=:viewer AND f.b=g.player) OR (f.b=:viewer AND f.a=g.player))))";

// Bind names in one place; no query input is interpolated into SQL fragments.
function named(sql: string, values: Record<string, string | number | null>) {
  // node:sqlite permits extra parameters only when explicitly enabled.
  // Keep the public wrapper small and pass only placeholders referenced by this query.
  const args = Object.fromEntries(Object.entries(values).filter(([key]) => sql.includes(`:${key}`)).map(([k,v]) => [`:${k}`,v]));
  return { sql, args };
}
function rows(sql: string, values: Record<string, string | number | null>) { const q = named(sql, values); return db().prepare(q.sql).all(q.args) as Row[]; }
function row(sql: string, values: Record<string, string | number | null>) { return rows(sql,values)[0]; }

function stageCTE(season?: Row) {
  if(season && ["closed","archived"].includes(String(season.status))) return `WITH global_board AS (
    SELECT a.*,p.name,p.friend_code,s.rank AS global_rank,s.cohort,NULL AS previous_total FROM season_stage_snapshots s JOIN attempts a ON a.id=s.attempt JOIN players p ON p.id=s.player
    WHERE s.season=:season AND s.scenario=:stage AND ${eligibility} AND ${publicEligible}
  ), visible AS (SELECT g.* FROM global_board g WHERE ${notBlocked}), scoped AS (SELECT g.*,ROW_NUMBER() OVER(ORDER BY global_rank) AS scope_rank FROM visible g WHERE (:scope<>'friends' OR ${friendsPredicate}) AND (:scope<>'me' OR g.player=:viewer))`;
  return `WITH eligible AS (
    SELECT a.*,p.name,p.friend_code,ROW_NUMBER() OVER(PARTITION BY a.player ORDER BY a.total,a.penalty,a.elapsed,a.verified_at,a.id) AS own_best
    FROM attempts a JOIN players p ON p.id=a.player
    ${season ? "JOIN season_stages ss ON ss.season=:season AND ss.scenario=a.scenario AND ss.scenario_version=a.scenario_version AND ss.rules_version=a.rules_version" : ""}
    WHERE ${eligibility} AND ${publicEligible} AND a.scenario=:stage
    ${season ? "AND a.season_id=:season AND a.created>=:starts AND a.finish<:ends AND a.verified_at<=:ends" : "AND a.scenario_version=:version AND a.rules_version=:rules"}
    AND (:since=0 OR a.finish>=:since)
  ), bests AS (SELECT * FROM eligible WHERE own_best=1),
  global_board AS (SELECT *,ROW_NUMBER() OVER(ORDER BY ${tieOrder}) AS global_rank,COUNT(*) OVER() AS cohort,LAG(total) OVER(ORDER BY ${tieOrder}) AS previous_total FROM bests),
  visible AS (SELECT g.* FROM global_board g WHERE ${notBlocked}),
  scoped AS (SELECT g.*,ROW_NUMBER() OVER(ORDER BY global_rank) AS scope_rank FROM visible g WHERE (:scope<>'friends' OR ${friendsPredicate}) AND (:scope<>'me' OR g.player=:viewer))`;
}
function stageRow(a: Row, viewer: string, scope:string) { return { id: String(a.id), scenario: String(a.scenario), name: String(a.name || "ผู้ฝึกนิรนาม"), friendCode: String(a.friend_code), status: "VERIFIED", rank: Number(scope==="friends"?a.scope_rank:a.global_rank), globalRank: Number(a.global_rank), isMe: a.player === viewer, elapsedMs: Number(a.elapsed), penaltyMs: Number(a.penalty), totalMs: Number(a.total), created: Number(a.created), verifiedAt: Number(a.verified_at) }; }
export function stageBoard(stage: string, scope = "all", viewer = "", offset = 0, seasonId?: string, period="all") {
  requireOnlineSchema(); scenario(stage); scopeName(scope);
  if(!["all","weekly"].includes(period) || seasonId && period!=="all") throw new ArenaError(400,"ช่วงเวลาอันดับไม่ถูกต้อง");
  if ((["friends","around_me","me"].includes(scope)) && !viewer) throw new ArenaError(401,"กรุณาเข้าสู่ระบบก่อนดูอันดับส่วนตัว");
  const season = seasonId ? resolveSeason(seasonId) : undefined;
  const stageRule=season ? one("SELECT * FROM season_stages WHERE season=? AND scenario=?",season.id,stage) : undefined;
  const values = { viewer, stage, version: String(stageRule?.scenario_version || scenarioVersion(stage)), rules: Number(stageRule?.rules_version || settings().version), since: scope === "weekly" || period==="weekly" ? Date.now()-7*86400000 : 0, scope, offset, season: season ? String(season.id) : "", starts: Number(season?.starts || 0), ends: Number(season?.ends || 0) };
  const cte = stageCTE(season);
  const enabled = Boolean(settings().board);
  const mine = enabled && viewer ? row(cte+" SELECT * FROM scoped WHERE player=:viewer",values) : undefined;
  const around = scope === "around_me" ? " AND global_rank BETWEEN COALESCE((SELECT global_rank FROM global_board WHERE player=:viewer),-10)-3 AND COALESCE((SELECT global_rank FROM global_board WHERE player=:viewer),-10)+3" : "";
  const list = enabled ? rows(cte+` SELECT * FROM scoped WHERE 1=1 ${around} ORDER BY global_rank LIMIT 26 OFFSET :offset`, values) : [];
  const total = enabled ? Number(row(cte+" SELECT COUNT(*) AS n FROM scoped",values)?.n || 0) : 0;
  const personal = viewer ? row(`SELECT a.* FROM attempts a WHERE a.player=:viewer AND a.scenario=:stage AND a.scenario_version=:version AND a.rules_version=:rules AND ${eligibility} AND (:since=0 OR a.finish>=:since) ${season ? "AND a.season_id=:season AND a.created>=:starts AND a.finish<:ends AND a.verified_at<=:ends" : ""} ORDER BY a.total,a.penalty,a.elapsed,a.verified_at,a.id LIMIT 1`,values) : undefined;
  const latest = viewer ? one("SELECT * FROM attempts WHERE player=? AND scenario=? ORDER BY created DESC,id DESC LIMIT 1",viewer,stage) : undefined;
  const validAttempts = viewer ? Number(row(`SELECT COUNT(*) AS count FROM attempts a WHERE a.player=:viewer AND a.scenario=:stage AND a.scenario_version=:version AND a.rules_version=:rules AND ${eligibility} AND (:since=0 OR a.finish>=:since) ${season ? "AND a.season_id=:season AND a.created>=:starts AND a.finish<:ends AND a.verified_at<=:ends" : ""}`,values)?.count || 0) : 0;
  const friendCount = viewer ? Number(one("SELECT COUNT(*) AS count FROM friends f JOIN players p ON p.id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE (f.a=? OR f.b=?) AND f.status='accepted' AND p.hidden=0 AND p.deleted=0 AND p.suspended=0 AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.a=? AND b.b=p.id) OR (b.b=? AND b.a=p.id))",viewer,viewer,viewer,viewer,viewer)?.count || 0) : 0;
  return { friendCount, rows: list.slice(0,pageSize).map((a)=>stageRow(a,viewer,scope)), total, hasMore: list.length>pageSize, nextOffset: list.length>pageSize ? offset+pageSize : null, scope, enabled, season: season ? seasonView(season) : null,
    mine: { validAttempts, rank: mine ? Number(scope==="friends"?mine.scope_rank:mine.global_rank) : null, globalRank: mine ? Number(mine.global_rank) : null, best: personal ? attemptView(personal) : null, latest: latest ? attemptView(latest) : null, gapMs: mine && mine.previous_total !== null ? Number(mine.total)-Number(mine.previous_total) : null, visibility: mine ? "ranked" : "unranked_or_private" }, serverNow: Date.now() };
}

// Window queries derive points from distinct verified bests, never from local/client scores.
function seasonCTE(season: Row) {
  if(season.scoring_version!==SEASON_RULES_V1.version || season.rules!==JSON.stringify(SEASON_RULES_V1)) throw new ArenaError(503,"กติกาฤดูกาลนี้ต้องใช้ตัวคำนวณเวอร์ชันที่ตรงกัน");
  if (["closed","archived"].includes(String(season.status))) return `WITH season_board AS (SELECT s.*,p.name,p.friend_code FROM season_snapshots s JOIN players p ON p.id=s.player WHERE s.season=:season AND ${publicEligible} AND NOT EXISTS(SELECT 1 FROM json_each(s.contributions) c JOIN attempts a ON a.id=json_extract(c.value,'$.attemptId') WHERE a.invalid=1 OR a.status<>'VERIFIED')), global_board AS (SELECT *,rank AS global_rank FROM season_board)`;
  return `WITH eligible AS (
    SELECT a.*,p.name,p.friend_code,ROW_NUMBER() OVER(PARTITION BY a.scenario,a.player ORDER BY a.total,a.penalty,a.elapsed,a.verified_at,a.id) AS own_best
    FROM attempts a JOIN players p ON p.id=a.player JOIN season_stages ss ON ss.season=:season AND ss.scenario=a.scenario AND ss.scenario_version=a.scenario_version AND ss.rules_version=a.rules_version
    WHERE ${eligibility} AND ${publicEligible} AND a.season_id=:season AND a.created>=:starts AND a.finish<:ends AND a.verified_at<=:ends
  ), stage_places AS (SELECT *,ROW_NUMBER() OVER(PARTITION BY scenario ORDER BY ${tieOrder}) AS stage_rank,COUNT(*) OVER(PARTITION BY scenario) AS cohort FROM eligible WHERE own_best=1),
  points AS (SELECT *,CAST(ROUND(${SEASON_RULES_V1.stagePointCap}.0*(cohort-stage_rank+1)/cohort) AS INTEGER) AS points FROM stage_places),
  contributions AS (SELECT *,ROW_NUMBER() OVER(PARTITION BY player ORDER BY points DESC,scenario) AS contribution_order FROM points),
  scores AS (SELECT player,MAX(name) AS name,MAX(friend_code) AS friend_code,SUM(CASE WHEN contribution_order<=${SEASON_RULES_V1.maxStages} THEN points ELSE 0 END) AS score,COUNT(*) AS stages,MAX(verified_at) AS achieved,MIN(cohort) AS smallest_cohort FROM contributions GROUP BY player),
  global_board AS (SELECT *,ROW_NUMBER() OVER(ORDER BY score DESC,stages DESC,achieved,player) AS global_rank,CASE WHEN stages<${SEASON_RULES_V1.provisionalStages} OR (SELECT COUNT(*) FROM scores)<${SEASON_RULES_V1.provisionalPlayers} OR smallest_cohort<${SEASON_RULES_V1.provisionalPlayers} THEN 1 ELSE 0 END AS provisional FROM scores)`;
}
function seasonStanding(a: Row, viewer: string,scope="all") {
  const score=Number(a.score); const tier=[...SEASON_RULES_V1.tiers].reverse().find((t)=>score>=t.min)!; const next=SEASON_RULES_V1.tiers.find((t)=>t.min>score);
  return { name:String(a.name || "ผู้ฝึกนิรนาม"),friendCode:String(a.friend_code),rank:Number(scope==="friends"?a.scope_rank:a.global_rank),globalRank:Number(a.global_rank),score,stages:Number(a.stages),provisional:Boolean(a.provisional),tier:tier.name,nextTier:next?.name || null,nextThreshold:next?.min || null,isMe:a.player===viewer };
}
export function rankedBoard(scope="all",viewer="",offset=0,seasonId?:string) {
  requireOnlineSchema(); scopeName(scope);
  if(scope==="weekly") throw new ArenaError(400,"ฤดูกาลใช้ช่วงเวลาที่กำหนดไว้ ไม่ใช้ตัวกรองรายสัปดาห์");
  if (["friends","around_me","me"].includes(scope) && !viewer) throw new ArenaError(401,"กรุณาเข้าสู่ระบบก่อน");
  const season=resolveSeason(seasonId);
  if (!season) return { season:null,rows:[],mine:null,total:0,hasMore:false,nextOffset:null,rules:SEASON_RULES_V1,serverNow:Date.now() };
  const values={season:String(season.id),starts:Number(season.starts),ends:Number(season.ends),viewer,scope,offset};
  const cte=seasonCTE(season)+`, visible AS (SELECT g.* FROM global_board g WHERE ${notBlocked}), scoped AS (SELECT g.*,ROW_NUMBER() OVER(ORDER BY global_rank) AS scope_rank FROM visible g WHERE (:scope<>'friends' OR ${friendsPredicate}) AND (:scope<>'me' OR g.player=:viewer))`;
  const enabled=Boolean(settings().board);
  const mine=enabled && viewer ? row(cte+" SELECT * FROM scoped WHERE player=:viewer",values) : undefined;
  const around=scope==="around_me" ? " AND global_rank BETWEEN COALESCE((SELECT global_rank FROM global_board WHERE player=:viewer),-10)-3 AND COALESCE((SELECT global_rank FROM global_board WHERE player=:viewer),-10)+3" : "";
  const list=enabled ? rows(cte+` SELECT * FROM scoped WHERE 1=1 ${around} ORDER BY global_rank LIMIT 26 OFFSET :offset`,values) : [];
  const total=enabled ? Number(row(cte+" SELECT COUNT(*) AS n FROM scoped",values)?.n || 0) : 0;
  return {season:seasonView(season),rows:list.slice(0,25).map((a)=>seasonStanding(a,viewer,scope)),mine:mine ? seasonStanding(mine,viewer,scope) : null,total,enabled,hasMore:list.length>25,nextOffset:list.length>25 ? offset+25 : null,rules:SEASON_RULES_V1,serverNow:Date.now()};
}
export function stageSummary(viewer:string) { requireOnlineSchema(); return stageIds.map((id)=>({scenario:id,...stageBoard(id,"all",viewer).mine})); }
export function friendSeasonalRanks(viewer:string) {
  const season=activeSeason();if(!season || !settings().board)return [];
  const data=rows(seasonCTE(season)+` SELECT g.* FROM global_board g WHERE ${friendsPredicate} AND ${notBlocked}`,{season:String(season.id),starts:Number(season.starts),ends:Number(season.ends),viewer});
  return data.map((a)=>seasonStanding(a,viewer));
}
export function friendComparison(viewer:string,code:string,stage:string) {
  requireOnlineSchema(); scenario(stage);
  const target=one("SELECT * FROM players WHERE friend_code=? AND public=1 AND rank_public=1 AND hidden=0 AND suspended=0 AND deleted=0",code);
  if (!target || !one("SELECT 1 FROM friends WHERE status='accepted' AND ((a=? AND b=?) OR (b=? AND a=?))",viewer,target.id,viewer,target.id) || one("SELECT 1 FROM blocks WHERE (a=? AND b=?) OR (b=? AND a=?)",viewer,target.id,viewer,target.id)) throw new ArenaError(404,"ไม่พบข้อมูลสหายที่อนุญาตให้เปรียบเทียบ");
  const mine=stageBoard(stage,"all",viewer).mine, friend=stageBoard(stage,"all",String(target.id)).mine;
  return {name:String(target.name),scenario:stage,mine,friend:{rank:friend.globalRank,best:friend.best},differenceMs:mine.best?.totalMs!=null && friend.best?.totalMs!=null ? Number(mine.best.totalMs)-Number(friend.best.totalMs) : null};
}
export function createOnlineAttempt(player:string,value:unknown,key:unknown) {
  requireOnlineSchema(); if(typeof key!=="string" || !/^[a-f0-9-]{36}$/i.test(key)) throw new ArenaError(400,"รหัสคำขอสร้างรอบไม่ถูกต้อง");
  return transaction(()=>{
    const prior=one("SELECT a.* FROM attempt_requests r JOIN attempts a ON a.id=r.attempt WHERE r.player=? AND r.request_key=?",player,key);
    if(prior) { if(prior.scenario!==value) throw new ArenaError(409,"รหัสคำขอนี้ใช้กับด่านอื่นแล้ว"); return attemptView(prior); }
    for (const stage of stageIds) run("INSERT OR IGNORE INTO competition_stage_catalog VALUES(?,?,?,?)",stage,scenarioVersion(stage),verifiableStage(stage)?"AUTHORITATIVE_SLICE":"PROVISIONAL",Date.now());
    const a=createAttempt(player,value); const season=activeSeason();
    if(season && one("SELECT 1 FROM season_stages WHERE season=? AND scenario=? AND scenario_version=? AND rules_version=?",season.id,String(value),scenarioVersion(String(value)),settings().version)) run("UPDATE attempts SET season_id=? WHERE id=?",season.id,String(a.id));
    run("INSERT INTO attempt_requests VALUES(?,?,?)",player,key,String(a.id));return attemptView(one("SELECT * FROM attempts WHERE id=?",String(a.id))!);
  });
}
export function seasonAdmin(actor:string,body:Record<string,unknown>) {
  requireOnlineSchema();limit("season-admin:"+actor,10);
  const action=String(body.action),reason=String(body.reason||"").trim(),id=String(body.id||"");
  if(reason.length<5 || reason.length>500 || body.confirm!==(action==="create" ? "CREATE" : id)) throw new ArenaError(400,"กรอกเหตุผลและรหัสยืนยันให้ตรงกับรายการ");
  return transaction(()=>{
    if(action==="create") {
      const name=String(body.name||"").trim(), starts=Number(body.starts), ends=Number(body.ends), now=Date.now();
      if(name.length<2 || name.length>80 || !Number.isSafeInteger(starts) || !Number.isSafeInteger(ends) || starts<now-60000 || ends<=starts || ends-starts>366*86400000) throw new ArenaError(400,"ตรวจชื่อและช่วงเวลาฤดูกาล ต้องไม่ย้อนอดีตและไม่เกิน 366 วัน");
      if(one("SELECT 1 FROM seasons WHERE status IN ('scheduled','open') AND starts<? AND ends>?",ends,starts)) throw new ArenaError(409,"ช่วงเวลาทับกับฤดูกาลอื่น");
      const newId=randomUUID();run("INSERT INTO seasons(id,name,starts,ends,status,scoring_version,rules,created) VALUES(?,?,?,?,'scheduled',?,?,?)",newId,name,starts,ends,SEASON_RULES_V1.version,JSON.stringify(SEASON_RULES_V1),now);
      for(const stage of stageIds) run("INSERT INTO season_stages VALUES(?,?,?,?)",newId,stage,scenarioVersion(stage),settings().version);
      audit(actor,"season-create",newId,reason);return {id:newId};
    }
    const season=resolveSeason(id)!;
    if(action==="open") { if(season.status!=="scheduled" || Date.now()>=Number(season.ends)) throw new ArenaError(409,"ฤดูกาลนี้เปิดไม่ได้");run("UPDATE seasons SET status='open',revision=revision+1 WHERE id=?",id); }
    else if(action==="close") {
      if(season.status!=="open" || Date.now()<Number(season.ends)) throw new ArenaError(409,"ปิดได้เมื่อฤดูกาลเปิดอยู่และถึงเวลาสิ้นสุดแล้วเท่านั้น");
      const snapshot=rows(seasonCTE(season)+" SELECT * FROM global_board ORDER BY global_rank",{season:id,starts:Number(season.starts),ends:Number(season.ends)});
      for(const p of snapshot) {
        const contributions=rows(seasonCTE(season)+" SELECT id AS attemptId,scenario,points,stage_rank AS rank,cohort,player FROM contributions WHERE player=:viewer ORDER BY contribution_order",{season:id,starts:Number(season.starts),ends:Number(season.ends),viewer:String(p.player)});
        run("INSERT INTO season_snapshots VALUES(?,?,?,?,?,?,?,?)",id,p.player,p.global_rank,p.score,p.stages,p.provisional,p.achieved,JSON.stringify(contributions));
        for(const c of contributions) run("INSERT INTO season_stage_snapshots VALUES(?,?,?,?,?,?)",id,c.scenario,c.player,c.attemptId,c.rank,c.cohort);
      }
      run("UPDATE seasons SET status='closed',closed_at=?,revision=revision+1 WHERE id=?",Date.now(),id);
    } else if(action==="archive") {if(season.status!=="closed") throw new ArenaError(409,"เก็บได้เฉพาะฤดูกาลที่ปิดและบันทึกอันดับแล้ว");run("UPDATE seasons SET status='archived',revision=revision+1 WHERE id=?",id);}
    else if(action==="recompute") {if(["closed","archived"].includes(String(season.status))) throw new ArenaError(409,"ไม่คำนวณประวัติฤดูกาลที่ปิดแล้วใหม่");rankedBoard("all","",0,id);run("UPDATE seasons SET revision=revision+1 WHERE id=?",id);}
    else throw new ArenaError(400,"คำสั่งฤดูกาลไม่ถูกต้อง");
    audit(actor,"season-"+action,id,reason);return {ok:true};
  });
}
