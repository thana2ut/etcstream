"use client";
import { DemoRoster, OnlineServiceNotice } from "./demo-roster";
import {useRef,useState} from "react";
import Link from "next/link";
import {missionChapters} from "@/game/content/mission-catalog";
import {SEASON_RULES_V1} from "@/game/content/arena-ranked-rules";
import {ArenaConfirmDialog,ArenaEmptyState,ArenaIcon} from "./shell";
import {api,statusText,timeText,type AttemptView} from "./client-api";
import {useArenaResource} from "./use-arena-resource";
import { CloudRecovery } from "./cloud-lobby";

type Season={id:string;name:string;starts:number;ends:number;status:string;scoringVersion:string;revision:number};
export type SeasonStanding={name:string;friendCode:string;rank:number;globalRank:number;score:number;stages:number;provisional:boolean;tier:string;nextTier:string|null;nextThreshold:number|null;isMe:boolean};
export type RankedResponse={season:Season|null;rows:SeasonStanding[];mine:SeasonStanding|null;total:number;hasMore:boolean;nextOffset:number|null;enabled?:boolean;serverNow:number};
type Mine={validAttempts?:number;rank:number|null;globalRank:number|null;best:AttemptView|null;latest:AttemptView|null;gapMs:number|null;visibility:string};
type BoardRow=AttemptView&{rank:number;globalRank:number;name:string;friendCode:string;isMe:boolean};
type Board={friendCount?:number;rows:BoardRow[];mine:Mine;total:number;hasMore:boolean;nextOffset:number|null;enabled:boolean;serverNow:number};
const scales=["xs","s","m","l","xl"];
const stageName=(id:string)=>{const [scale,level]=id.split("-");const chapter=missionChapters[scales.indexOf(scale)];return `${chapter?.venue || scale} · ${chapter?.difficulties.find((d)=>d.level===Number(level))?.title || id}`;};
const date=(ms:number)=>new Date(ms).toLocaleString("th-TH",{timeZone:"Asia/Bangkok"});

function ConnectionNotice({error,stale,retry}:{error:string;stale:boolean;retry:()=>void}) {
  return error?<div className="arena-error" role="alert"><span>{stale?"ข้อมูลเดิม · การเชื่อมต่อขัดข้อง: ":""}{error}</span><button className="arena-button-secondary" onClick={retry}>ลองเชื่อมต่อใหม่</button></div>:null;
}
function ScopeButtons({scope,onChange}:{scope:string;onChange:(scope:string)=>void}) {
  return <div className="arena-scope-tabs" role="group" aria-label="ขอบเขตอันดับ">{[["all","ทั่วสำนัก"],["me","อันดับของฉัน"],["friends","อันดับสหาย"],["around_me","ใกล้เคียงอันดับฉัน"]].map(([value,label])=><button key={value} type="button" aria-pressed={scope===value} onClick={()=>onChange(value)}>{label}</button>)}</div>;
}
function PageButtons({offset,hasMore,onChange}:{offset:number;hasMore:boolean;onChange:(n:number)=>void}) {return offset>0||hasMore?<nav className="arena-actions" aria-label="หน้าผลอันดับ"><button disabled={!offset} onClick={()=>onChange(Math.max(0,offset-25))}>ก่อนหน้า</button><button disabled={!hasMore} onClick={()=>onChange(offset+25)}>ถัดไป</button></nav>:null;}

export function MySeasonCapsule({resource}:{resource:ReturnType<typeof useArenaResource<RankedResponse>>}) {
  const {data,error,stale,loading,retry}=resource;
  return <section className="arena-panel arena-my-season" aria-label="ตำแหน่งของข้า"><ArenaIcon name="profile" /><div><span className="arena-eyebrow">ตำแหน่งของข้า · แรงก์ฤดูกาล</span>{loading?<p role="status">กำลังเชื่อมต่ออันดับ…</p>:data?.season?<><h2>{data.mine?.tier || "ยังไม่จัดอันดับ"}</h2><p>{data.season.name} · {data.mine?`${data.mine.score} คะแนน · อันดับทั้งหมด ${data.mine.globalRank} · ${data.mine.stages} ด่านยืนยัน`:"ยังไม่มีผลยืนยันที่เปิดเผยในฤดูกาลนี้"}</p>{data.mine?.provisional&&<span className="arena-status is-muted">อันดับชั่วคราว · กลุ่มผู้แข่งขันยังน้อยหรือด่านยังไม่ครบ</span>}</>:<h2>{error?"ยังโหลดอันดับไม่ได้":"ยังไม่มีฤดูกาลที่เปิดอยู่"}</h2>}</div><Link className="arena-text-link" href="/arena/ranked">ดูวิถีกระบี่ →</Link><ConnectionNotice error={error} stale={stale} retry={retry}/></section>;
}
export function OnlineFriendsSignal(){const source=useArenaResource<{onlineFriends:number}>("online-summary",30000);return <p className="arena-note" role="status">{source.error?"ยังเชื่อมต่อสถานะสหายไม่ได้":source.loading?"กำลังเชื่อมต่อสถานะสหาย…":`สหายที่ยินยอมแสดงออนไลน์ ${source.data?.onlineFriends ?? "—"} คน`}</p>;}
export function OnlineLeaderboard({initialScope="all",initialSeason}:{initialScope?:string;initialSeason?:string}) {
  const [stage,setStage]=useState("xs-1"),[scope,setScope]=useState(initialScope),[offset,setOffset]=useState(0),[period,setPeriod]=useState(initialSeason || "all");
  const seasons=useArenaResource<{seasons:Season[]}>("seasons",60000);
  const board=useArenaResource<Board>(`leaderboard?scenario=${stage}&scope=${scope}&offset=${offset}${period==="weekly"?"&period=weekly":period!=="all"?`&season=${encodeURIComponent(period)}`:""}`);
  const changeStage=(value:string)=>{setStage(value);setOffset(0);};
  const [scale,level]=stage.split("-");
  return <section className="arena-panel arena-ranking-hall"><div className="arena-section-heading"><h2>ทำเนียบผลยืนยันรายด่าน</h2><Link className="arena-text-link" href="/arena/ranked">แรงก์ฤดูกาล →</Link></div>
    <ScopeButtons scope={scope} onChange={(v)=>{setScope(v);setOffset(0);}}/>
    <div className="arena-filter-toolbar"><div className="arena-form-row"><label>สถานที่ประลอง<select value={scale} onChange={(e)=>changeStage(`${e.target.value}-${level}`)}>{missionChapters.map((c,i)=><option key={c.id} value={scales[i]}>{c.venue}</option>)}</select></label><label>ระดับ<select value={level} onChange={(e)=>changeStage(`${scale}-${e.target.value}`)}>{[1,2,3,4,5].map((n)=><option key={n} value={n}>ระดับ {n}</option>)}</select></label></div><label>ช่วงเวลา / กติกา<select value={period} onChange={(e)=>{setPeriod(e.target.value);setOffset(0);}}><option value="all">กติกาปัจจุบัน · ทุกเวลา</option><option value="weekly">กติกาปัจจุบัน · 7 วันล่าสุด</option>{seasons.data?.seasons.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>
    <ConnectionNotice error={board.error} stale={board.stale} retry={board.retry}/>
    {board.loading?<p className="arena-skeleton" role="status">กำลังเปิดศิลาจารึก…</p>:board.data&&<>
      <aside className="arena-pinned-standing"><span className="arena-eyebrow">อันดับของฉัน · {stageName(stage)}</span><strong>{board.data.mine.globalRank===null?"ยังไม่มีอันดับยืนยันสาธารณะ":`อันดับทั้งหมด #${board.data.mine.globalRank}${scope==="friends"?` · อันดับในกลุ่มสหาย #${board.data.mine.rank}`:""}`}</strong><div className="arena-standing-values"><span>จำนวนผลยืนยัน <b>{board.data.mine.validAttempts ?? "—"}</b></span><span>ดีที่สุดที่ยืนยัน <b>{timeText(board.data.mine.best?.totalMs??null)}</b></span><span>รอบล่าสุด <b>{board.data.mine.latest?statusText(board.data.mine.latest.status):"ยังไม่มีรอบ"}</b></span>{board.data.mine.gapMs!==null&&<span>ห่างอันดับก่อนหน้า <b>{timeText(board.data.mine.gapMs)}</b></span>}</div><small>ต้องเปิดเผยรายชื่อและยินยอมเข้าทำเนียบจึงมีอันดับสาธารณะ ผลส่วนตัวยังคงอยู่</small></aside>
      {!board.data.enabled?<ArenaEmptyState title="พักการแสดงทำเนียบชั่วคราว">ผู้ดูแลปิดการแสดงอันดับ ข้อมูลส่วนตัวยังคงอยู่</ArenaEmptyState>:board.data.rows.length===0?<ArenaEmptyState title={scope==="friends" && board.data.friendCount===0 ? "ยังไม่มีสหายที่ตอบรับ" : "ยังไม่มีผลการแข่งขันที่ยืนยันแล้ว"} href="/arena/time-attack" action="เลือกบททดสอบ">รอบที่รอตรวจ ยุติ หรือไม่ผ่านการรับรอง จะไม่ถูกนำมาเป็นอันดับ</ArenaEmptyState>:<div className="arena-table-wrap"><table><caption className="arena-table-caption">{stageName(stage)} · หนึ่งผลดีที่สุดต่อผู้เล่น · {scope==="friends"?"อันดับในกลุ่มสหาย รวมตัวฉัน":"อันดับทั้งหมด"}</caption><thead><tr><th>อันดับ</th><th>ผู้ฝึก</th><th>ทั้งหมด</th><th>เวลาจริง</th><th>บทลงโทษ</th><th>รวม</th></tr></thead><tbody>{board.data.rows.map((r)=><tr key={r.id} className={r.isMe?"is-me":""}><td data-label="อันดับ">#{r.rank}</td><td data-label="ผู้ฝึก">{r.name}{r.isMe?" · ฉัน":""}</td><td data-label="อันดับทั้งหมด">#{r.globalRank}</td><td data-label="เวลาจริง">{timeText(r.elapsedMs)}</td><td data-label="บทลงโทษ">{timeText(r.penaltyMs)}</td><td data-label="รวม">{timeText(r.totalMs)}</td></tr>)}</tbody></table></div>}
      <PageButtons offset={offset} hasMore={board.data.hasMore} onChange={setOffset}/>
    </>}
    <details className="arena-details"><summary>การจัดอันดับและการอัปเดต</summary><p>เฉพาะผล VERIFIED ที่มีเวลาและเวอร์ชันการรับรองจากเซิร์ฟเวอร์ ใช้เวลารวมน้อยก่อน เมื่อเท่ากันใช้บทลงโทษ เวลาจริง เวลารับรอง และรหัสผลตามลำดับ อัปเดตจากระบบกลางเป็นระยะเมื่อเปิดหน้านี้</p></details>
  </section>;
}
export function RankedPage({initialScope="all",initialSeason}:{initialScope?:string;initialSeason?:string}) {
  const [scope,setScope]=useState(initialScope),[offset,setOffset]=useState(0),[season,setSeason]=useState(initialSeason || "");
  const seasons=useArenaResource<{seasons:Season[]}>("seasons",60000);
  const resource=useArenaResource<RankedResponse>(`ranked?scope=${scope}&offset=${offset}${season?`&season=${encodeURIComponent(season)}`:""}`);
  const data=resource.data;
  return <><OnlineServiceNotice/><DemoRoster/><div className="arena-section-heading"><label>ฤดูกาล<select value={season} onChange={(e)=>{setSeason(e.target.value);setOffset(0);}}><option value="">ฤดูกาลที่เปิดอยู่</option>{seasons.data?.seasons.map((s)=><option value={s.id} key={s.id}>{s.name} · {({scheduled:"กำหนดการ",open:"เปิด",closed:"ปิดแล้ว",archived:"ประวัติ"}[s.status]||s.status)}</option>)}</select></label><span className="arena-status">วิถีกระบี่แห่งสายสัญญาณ</span></div>
    <MySeasonCapsule resource={resource}/>
    {data?.season&&<p className="arena-note">{date(data.season.starts)} – {date(data.season.ends)} · เวลาไทย · {data.season.scoringVersion} · {data.season.status==="closed"||data.season.status==="archived"?"อันดับที่บันทึกเมื่อปิดฤดูกาล":"อันดับเปลี่ยนตามผลยืนยันและผู้ยินยอมเข้าร่วม"}</p>}
    <div className="arena-split"><section className="arena-panel"><h2>ทำเนียบฤดูกาล</h2><ScopeButtons scope={scope} onChange={(v)=>{setScope(v);setOffset(0);}}/>
      {resource.loading?<p className="arena-skeleton" role="status">กำลังเชื่อมต่อฤดูกาล…</p>:resource.error&&!data?<p className="arena-note">ยังโหลดรายชื่อฤดูกาลไม่ได้ กรุณาลองเชื่อมต่อใหม่</p>:data?.enabled===false?<ArenaEmptyState title="พักการแสดงอันดับฤดูกาลชั่วคราว">ผู้ดูแลปิดการแสดงทำเนียบ ข้อมูลส่วนตัวยังคงอยู่</ArenaEmptyState>:data?.rows.length?<div className="arena-season-rows">{data.rows.map((p)=><article key={p.friendCode} className={`arena-season-row${p.isMe?" is-me":""}`}><strong>#{p.rank}</strong><div><b>{p.name}{p.isMe?" · ฉัน":""}</b><span>{p.tier} · {p.stages} ด่าน{scope==="friends"?` · อันดับทั้งหมด #${p.globalRank}`:""}</span>{p.provisional&&<small>อันดับชั่วคราว</small>}</div><strong>{p.score}<small>คะแนน</small></strong></article>)}</div>:<ArenaEmptyState title="ยังไม่มีผลการแข่งขันที่ยืนยันแล้ว" href="/arena/time-attack" action="ไปฝึกวิชา">ไม่ให้คะแนนจากการเปิดหน้า การส่งผลที่รอตรวจ หรือการเล่นซ้ำที่ไม่ใช่ผลดีที่สุด</ArenaEmptyState>}
      <PageButtons offset={offset} hasMore={Boolean(data?.hasMore)} onChange={setOffset}/>
    </section><aside className="arena-panel"><h2>เส้นทางวิถีกระบี่</h2><ol className="arena-tier-track">{SEASON_RULES_V1.tiers.map((tier)=><li key={tier.min} aria-current={data?.mine?.tier===tier.name?"step":undefined}><ArenaIcon name="duel"/><div><strong>{tier.name}</strong><span>{tier.min.toLocaleString("th-TH")} คะแนนขึ้นไป</span></div></li>)}</ol>{data?.mine?.nextTier&&<p className="arena-note">เป้าหมายถัดไป {data.mine.nextTier} ที่ {data.mine.nextThreshold} คะแนน</p>}</aside></div>
    <details className="arena-details"><summary>กติกาจัดแรงก์ V1</summary><p>แต่ละด่านมีผู้เล่นผลยืนยัน N คน อันดับ r ได้ round(1000 × (N − r + 1) ÷ N) คะแนน รวมเฉพาะ 5 ด่านที่มีคะแนนสูงที่สุดและเป็นคนละด่าน สูงสุด 5000 คะแนน ผลซ้ำไม่นับเพิ่ม คะแนนเท่ากันใช้จำนวนด่านยืนยันมากกว่า แล้วเวลาที่ได้ผลครบก่อน และรหัสผู้เล่นถาวร</p><p>เมื่อมีผู้ร่วมแข่งขันน้อยกว่า 3 คน ด่านที่มีผู้ยืนยันน้อย หรือผู้เล่นยืนยันยังไม่ครบ 3 ด่าน จะแสดงอันดับชั่วคราว ค่าชั้นแรงก์เป็นกติกาเกม ไม่ใช่การรับรองทักษะวิชาชีพ</p></details>
  </>;
}
export function ProfileRecords() {
  const [scale,setScale]=useState("xs");
  const source=useArenaResource<{stages:({scenario:string}&Mine)[]}>("stage-summary",60000);
  return <section className="arena-panel arena-profile-records"><h2>สถิติส่วนตัวแยกด่าน</h2><div className="arena-scope-tabs" role="group" aria-label="เลือกสถานที่ดูสถิติ">{missionChapters.map((c,i)=><button key={c.id} aria-pressed={scale===scales[i]} onClick={()=>setScale(scales[i])}>{c.venue}</button>)}</div><ConnectionNotice error={source.error} stale={source.stale} retry={source.retry}/>{source.loading?<p className="arena-skeleton" role="status">กำลังเปิดประวัติด่าน…</p>:source.data?.stages.filter((s)=>s.scenario.startsWith(scale+"-")).map((s)=><article className="arena-person-row" key={s.scenario}><div><strong>{stageName(s.scenario)}</strong><span>ดีที่สุดที่ยืนยัน {timeText(s.best?.totalMs??null)} · อันดับทั้งหมด {s.globalRank??"—"}</span><span>ล่าสุด {s.latest?statusText(s.latest.status):"ยังไม่มีรอบ"} · {s.latest?.start==null?"ยังไม่มีเวลาจับ":timeText(s.latest.totalMs)}</span></div></article>)}</section>;
}
export function FriendCompare({code}:{code:string}) {
  const [open,setOpen]=useState(false),[stage,setStage]=useState("xs-1");
  const resource=useArenaResource<{name:string;mine:Mine;friend:{rank:number|null;best:AttemptView|null};differenceMs:number|null}>(open?`compare?friend=${encodeURIComponent(code)}&scenario=${stage}`:null,60000);
  return <div className="arena-comparison"><button type="button" className="arena-button-secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>เทียบสถิติรายด่าน</button>{open&&<div className="arena-compare-drawer"><label>ภารกิจ<select value={stage} onChange={(e)=>setStage(e.target.value)}>{missionChapters.flatMap((c,i)=>c.difficulties.map((d)=><option key={`${scales[i]}-${d.level}`} value={`${scales[i]}-${d.level}`}>{c.venue} · {d.title}</option>))}</select></label><ConnectionNotice error={resource.error} stale={resource.stale} retry={resource.retry}/>{resource.loading?<p role="status">กำลังเปรียบเทียบ…</p>:resource.data&&<p>ฉัน {timeText(resource.data.mine.best?.totalMs??null)} · สหาย {timeText(resource.data.friend.best?.totalMs??null)} · อันดับทั้งหมดของสหาย {resource.data.friend.rank??"ยังไม่มีผลยืนยัน"}{resource.data.differenceMs!==null?` · ต่างกัน ${timeText(Math.abs(resource.data.differenceMs))} (${resource.data.differenceMs>0?"ฉันใช้เวลามากกว่า":resource.data.differenceMs<0?"ฉันใช้เวลาน้อยกว่า":"เวลาเท่ากัน"})`:""}</p>}</div>}</div>;
}
export function RecoveryPanel({onRecovered}:{onRecovered?:()=>Promise<void>}) {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ? <CloudRecovery onRecovered={onRecovered}/> : <LocalRecoveryPanel onRecovered={onRecovered}/>;
}
function LocalRecoveryPanel({onRecovered}:{onRecovered?:()=>Promise<void>}) {
  const [credential,setCredential]=useState(""),[generated,setGenerated]=useState<{credential:string;expires:number}|null>(null),[consent,setConsent]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);const pending=useRef(false);
  return <details className="arena-panel arena-recovery"><summary>{onRecovered?"กลับมาใช้ตัวตนเดิมด้วยรหัสกู้คืน":"รหัสกู้คืนและเปลี่ยนเครื่อง"}</summary><p className="arena-note">รหัสนี้เป็นความลับ ใช้ครั้งเดียวภายใน 30 วัน ผู้ที่มีรหัสสามารถเข้าตัวตนนี้และยกเลิกเซสชันเครื่องเดิมได้ ห้ามใช้รหัสสหายแทน</p>{onRecovered?<form onSubmit={async(e)=>{e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);try{await api("recovery/redeem",{credential});setCredential("");await onRecovered();}catch(e){setError((e as Error).message);}finally{pending.current=false;setBusy(false);}}}><label>รหัสกู้คืนส่วนตัว<input type="password" autoComplete="off" required maxLength={64} value={credential} onChange={(e)=>setCredential(e.target.value)}/></label><button disabled={busy}>{busy?"กำลังกู้คืน…":"ยืนยันใช้ตัวตนเดิม"}</button></form>:<><label className="arena-consent"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)}/>เข้าใจว่ารหัสใหม่แทนรหัสเดิม ต้องเก็บเป็นความลับ</label><button disabled={busy||!consent} onClick={async()=>{if(pending.current)return;pending.current=true;setBusy(true);try{setGenerated(await api("recovery/generate",{}));setError("");}catch(e){setError((e as Error).message);}finally{pending.current=false;setBusy(false);}}}>{busy?"กำลังสร้าง…":"สร้างรหัสกู้คืนใหม่"}</button>{generated&&<div className="arena-recovery-secret"><strong>แสดงรหัสครั้งนี้เท่านั้น โปรดเก็บในที่ปลอดภัย</strong><code>{generated.credential}</code><span>หมดอายุ {date(generated.expires)}</span><button className="arena-button-secondary" onClick={()=>setGenerated(null)}>เก็บแล้ว ซ่อนรหัส</button></div>}</>}{error&&<p role="alert">{error}</p>}</details>;
}
export function AttemptStanding({attempt}:{attempt:AttemptView}) {
  const resource=useArenaResource<Mine>(attempt.status==="VERIFIED"?`my-standing?scenario=${attempt.scenario}`:null);
  if(attempt.status!=="VERIFIED") return <p className="arena-note">รอบนี้ยังไม่ได้รับคะแนนฤดูกาลหรืออันดับยืนยัน ไม่มีการให้คะแนนจากผลที่รอตรวจหรือยุติรอบ</p>;
  return <div className="arena-pinned-standing"><ConnectionNotice error={resource.error} stale={resource.stale} retry={resource.retry}/><strong>อันดับปัจจุบันของผลดีที่สุดในด่านนี้ {resource.data?.globalRank??"—"}</strong><Link className="arena-text-link" href="/arena/ranked">ดูคะแนนฤดูกาลที่ระบบคำนวณ →</Link><small>ยังไม่มีบันทึกส่วนต่างคะแนนก่อนและหลังรอบ จึงไม่แสดงตัวเลขการเปลี่ยนแปลงที่คาดเดา</small></div>;
}
export function PlayerSessionControls({onChange}:{onChange:()=>Promise<void>}) {
  const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");const pending=useRef(false);
  return <div className="arena-actions"><button className="arena-button-secondary" onClick={()=>setConfirm(true)}>ออกจากตัวตนในเบราว์เซอร์นี้</button><ArenaConfirmDialog open={confirm} title="ออกจากตัวตนนี้หรือไม่?" busy={busy} onCancel={()=>setConfirm(false)} onConfirm={async()=>{if(pending.current)return;pending.current=true;setBusy(true);try{await api("logout",{});setConfirm(false);await onChange();}catch(e){setError((e as Error).message);}finally{pending.current=false;setBusy(false);}}}>ประวัติยังเก็บไว้ แต่ต้องมีรหัสกู้คืนที่ยังใช้ได้เพื่อกลับมาใช้ตัวตนเดิม ชื่อเล่นและรหัสสหายใช้เข้าสู่ระบบแทนไม่ได้{error&&<span role="alert">{error}</span>}</ArenaConfirmDialog></div>;
}
