"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { missionChapters } from "@/game/content/mission-catalog";
import { useAcademyStore } from "@/game/stores/academy-store";
import { validateNickname } from "@/game/security/nickname-validation";
import { ArenaBanner, ArenaConfirmDialog, ArenaEmptyState, ArenaFriendCode, ArenaIcon, ArenaShell, ArenaStatsStrip, arenaAsset } from "./shell";
import { api, readCache, statusText, timeText, writeCache, type AttemptView, type PlayerView, type Profile } from "./client-api";
import {DuelArena,HallOfImmortals,OnlineLeaderboard,RankedPage,MySeasonCapsule,AdminShowcaseCard,OnlineFriendsSignal,ProfileRecords,PlayerSessionControls,RecoveryPanel,FriendCompare,type RankedResponse,type SeasonStanding} from "./online";
import {useArenaResource} from "./use-arena-resource";
import { CloudLobby } from "./cloud-lobby";
import { RankBadge } from "./rank-badge";
import { CelestialMarket, FriendPortrait, MyIdentityArt, QiankunBag, useEconomySummary, useFriendAppearance } from "./economy";
import { ChallengeSender, ChallengesPanel, FriendSearch, PlayerProfilePage, ProfileHub } from "./social";

const scales = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" };
export function selectedMission(id: string) {
  const [scale, level] = id.split("-");
  const chapter = missionChapters.find((c) => scales[c.venueId] === scale);
  return { chapter, level: chapter?.difficulties.find((d) => d.level === Number(level)) };
}
/** Mirrors the server/database canonical form of reserved display names (UI hint only; the server decides). */
const RESERVED_NAMES = new Set(["admin", "administrator", "แอดมิน", "แอดมิ้น", "ผู้ดูแล", "ผู้ดูแลระบบ", "ระบบ"]);
const isReservedName = (n: string) => RESERVED_NAMES.has(n.normalize("NFKC").replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "").replace(/[\s\p{P}\p{S}]+/gu, "").toLowerCase());
export function ScenarioPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [scale, level] = value.split("-");
  return <div className="arena-form-row arena-scenario-picker"><label>สถานที่ประลอง<select value={scale} onChange={(e) => onChange(`${e.target.value}-${level}`)}>{missionChapters.map((c) => <option value={scales[c.venueId]} key={c.id}>{c.venue}</option>)}</select></label><label>ระดับบททดสอบ<select value={level} onChange={(e) => onChange(`${scale}-${e.target.value}`)}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>ระดับ {n}</option>)}</select></label></div>;
}
const modes = [
  ["time-attack", "บททดสอบกาลเวลา", "เลือกด่านจริง เตรียมสาย แล้ววัดฝีมือด้วยเวลาเซิร์ฟเวอร์", "card-time-attack"],
  ["duel", "ศึกกระบี่สองเซียน", "ท้าดวลสหายรายด่าน เทียบเวลาที่ผ่านการยืนยันแบบตัวต่อตัว", "card-duel"],
  ["leaderboard", "ทำเนียบเซียน", "ค้นหาผลที่ผ่านการยืนยัน เปรียบเทียบภายใต้กติกาเดียวกัน", "card-leaderboard"],
  ["friends", "สหายร่วมสำนัก", "แลกรหัสสหาย ส่งคำขอ และเลือกเปิดเผยสถานะได้ด้วยตนเอง", "card-friends"],
];
const subtitles: Record<string, string> = { home: "ฝึกวิชาให้แม่นยำ แล้วก้าวสู่บททดสอบแห่งสำนัก", "time-attack": "ห้าสถานที่ ยี่สิบห้าบททดสอบ · ทุกสายต่อด้วยฝีมือของเจ้า", duel: "สองกระบี่ หนึ่งบททดสอบ · ความยุติธรรมต้องมาก่อนชัยชนะ", leaderboard: "จารึกเฉพาะผลที่ผ่านการยืนยันจากระบบกลาง", friends: "ร่วมเส้นทางกับสหาย โดยเคารพความเป็นส่วนตัว", profile: "ตัวตน ความเป็นส่วนตัว และประวัติการฝึกของเจ้า",ranked:"วิถีกระบี่แห่งสายสัญญาณ · ผลยืนยันคนละด่าน สู่การจัดอันดับประจำฤดูกาล", market: "แลกหินวิญญาณจากการประลองจริง เป็นเครื่องตกแต่งที่ไม่เพิ่มความได้เปรียบ", bag: "ถุงเฉียนคุน · เก็บและสวมใส่ของสะสม แยกจากถุงอุปกรณ์ในภารกิจ", player: "ดูโปรไฟล์ที่ผู้ฝึกยินยอมเปิดเผย ส่งคำขอเป็นสหาย หรือคำท้าทำเวลา" };
export function ArenaPortal({ section = "home",initialScope="all",initialSeason,playerCode }: { section?: string;initialScope?:string;initialSeason?:string;playerCode?:string }) {
  const [profile, setProfile] = useState<Profile | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const [register, setRegister] = useState(false), [name, setName] = useState(""), [joining, setJoining] = useState(false), [claimCode, setClaimCode] = useState("");
  const joiningRef = useRef(false);
  const [connection,setConnection]=useState<"connecting"|"connected"|"disconnected">("connecting");
  const season=useArenaResource<RankedResponse>(profile ? "ranked" : null);
  const localName = useAcademyStore((s) => s.player?.nickname);
  const localPlayer = useAcademyStore((s) => s.player), setLocalPlayer = useAcademyStore((s) => s.setPlayer);
  // One name everywhere: whenever the online profile name differs, the local trainee name follows it.
  useEffect(() => {
    const online = profile?.player.name;
    if (online && localPlayer && localPlayer.nickname !== online && validateNickname(online)) setLocalPlayer({ ...localPlayer, nickname: online });
  }, [profile?.player.name, localPlayer, setLocalPlayer]);
  const reload = useCallback(async () => {
    try { const data = await api<Profile>("profile"); writeCache("profile", data); setProfile(data); setRegister(false); setError(""); }
    catch (e) { const message = (e as Error).message; if (message === "กรุณาเข้าสู่ระบบก่อน") {setProfile(null);setRegister(true);setError("");} else setError(message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const initial = window.setTimeout(() => { const cached = readCache<Profile>("profile"); if (cached) { setProfile(cached); setLoading(false); } void reload(); }, 0); return () => clearTimeout(initial); }, [reload]);
  useEffect(() => {
    if (!profile) return;
    const beat = () => { if (!document.hidden) void api("heartbeat", {}).then(()=>setConnection("connected")).catch(() => setConnection("disconnected")); };
    const visible=()=>{if(!document.hidden)beat();else setConnection("connecting");};
    beat(); const timer = window.setInterval(beat, 30000);document.addEventListener("visibilitychange",visible); return () => {clearInterval(timer);document.removeEventListener("visibilitychange",visible);};
  }, [profile]);
  const join = async (e: FormEvent) => { e.preventDefault(); if (joiningRef.current) return; joiningRef.current = true; setJoining(true); try { const typed = name || localName || ""; if (isReservedName(typed)) { await api("owner-claim", { name: typed, code: claimCode }); setClaimCode(""); } else await api("register", { name: typed }); await reload(); } catch (e) { setError((e as Error).message); } finally { joiningRef.current = false; setJoining(false); } };
  const title = section === "home" ? "หอประลองเซียน" : section === "profile" ? "บันทึกวิถีเซียน" : section === "ranked" ? "จัดอันดับฤดูกาล" : section === "market" ? "ตลาดสวรรค์" : section === "player" ? "โปรไฟล์ผู้ฝึก" : section === "bag" ? "ถุงเฉียนคุน" : modes.find((m) => m[0] === section)?.[1] || "หอประลองเซียน";
  // Hold the loading veil until identity AND wallet/equipped look are known, so nothing renders in a placeholder state.
  const bootEconomy = useEconomySummary(true);
  const booting = loading || (Boolean(profile) && bootEconomy.loading && !bootEconomy.data);
  return <ArenaShell booting={booting} player={profile?.player} rank={season.stale ? null : season.data?.mine} rankState={season.error?"stale":season.loading?"loading":"ready"} connection={connection}>{section !== "home" && <ArenaBackButton section={section} />}<ArenaBanner file={section === "home" ? "hero-celestial-gate" : section === "friends" ? "banner-friends" : section === "profile" ? "banner-profile" : section === "ranked" ? "card-leaderboard" : modes.find((m) => m[0] === section)?.[3] || "hero-celestial-gate"} title={title} panorama={false}><p>{subtitles[section]}</p></ArenaBanner>
    {loading && <div className="arena-panel arena-skeleton" role="status" aria-live="polite">กำลังเชื่อมต่อข้อมูลผู้ฝึก…</div>}
    {error && <div className="arena-error" role="alert"><span>{error}</span><button className="arena-button-secondary" onClick={() => void reload()}>ลองอีกครั้ง</button></div>}
    {register && <form className="arena-panel arena-join" onSubmit={join}><ArenaIcon name="profile" /><h2>เข้าร่วมหอประลอง</h2><p>ตัวตนเฉพาะเบราว์เซอร์นี้ ชื่อซ้ำไม่ใช่บัญชีเดียวกัน และคะแนนฝึกเดิมไม่ถูกนำมาจัดอันดับ</p><label>ชื่อผู้ฝึก<input required minLength={2} maxLength={20} value={name || localName || ""} onChange={(e) => setName(e.target.value)} /></label>{isReservedName(name || localName || "") ? <label>รหัสยืนยันชื่อสงวน<input required type="password" inputMode="numeric" autoComplete="off" maxLength={64} value={claimCode} onChange={(e) => setClaimCode(e.target.value)} /><small className="arena-note">ชื่อนี้สงวนไว้สำหรับเจ้าของ ใส่รหัสเพื่อกลับเข้าบัญชีเดิม</small></label> : <p className="arena-note">เริ่มต้นไม่เปิดเผยรายชื่อหรือสถานะออนไลน์ ตั้งค่าเพิ่มเติมได้ภายหลัง</p>}<button type="submit" disabled={joining}>{joining ? "กำลังดำเนินการ…" : isReservedName(name || localName || "") ? "ยืนยันรหัสและเข้าบัญชี" : "สร้างตัวตนผู้ฝึก"}</button></form>}
    {register && <RecoveryPanel onRecovered={reload}/>}
    {section === "home" && <>
      {profile && <div className="arena-hub-summary"><Link className="arena-identity arena-identity-link" href="/arena/profile" aria-label={`เปิดโปรไฟล์ของ ${profile.player.name}`}><MyIdentityArt name={profile.player.name} size={72} /><div><span className="arena-eyebrow">ผู้ฝึกแห่งหอประลอง</span><strong>{profile.player.name}</strong></div></Link><div className="arena-summary-metrics"><span>ยืนยันแล้ว <strong>{profile.stats.verified ?? "—"} รอบ</strong></span><span>เวลายืนยันสั้นสุด <strong>{timeText(profile.stats.bestMs)}</strong></span></div></div>}
      <div className="arena-grid arena-mode-cards">{modes.map(([key, label, description, art]) => <section className={`arena-card arena-portal-tile`} key={key}><div className="arena-card-art"><Image src={arenaAsset(art)} alt="" fill sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 600px" /></div><div className="arena-card-body"><h2><span className="arena-mode-icon" data-arena-icon={key}><ArenaIcon name={key} /></span><span>{label}</span></h2><p>{description}</p><Link className="arena-action" href={`/arena/${key}`}>{key === "time-attack" ? "เลือกสนามประลอง" : key === "leaderboard" ? "เปิดทำเนียบ" : key === "duel" ? "เข้าสู่ลานประลอง" : "พบสหาย"}</Link></div></section>)}</div>
      <details className="arena-details arena-lobby-help"><summary>ว่าด้วยการยืนยันผลประลอง</summary><p>ผลจับเวลาที่บันทึกยังไม่เป็นอันดับ จนกว่าจะผ่านการตรวจยืนยันที่เชื่อถือได้</p></details>
    </>}
    {section === "duel" && (profile ? <DuelArena/> : !loading && <p className="arena-note">สร้างตัวตนผู้ฝึกก่อน จึงจะท้าดวลสหายได้</p>)}
    {section === "time-attack" && profile && <TimeAttack />}
    {section === "leaderboard" && <OnlineLeaderboard key={initialScope+initialSeason} initialScope={initialScope} initialSeason={initialSeason}/>}
    {section === "ranked" && <><HallOfImmortals signedIn={Boolean(profile)} mine={season}/>{profile && <><OnlineFriendsSignal/><CloudLobby/></>}</>}
    {section === "ranked" && <RankedPage key={initialScope+initialSeason} initialScope={initialScope} initialSeason={initialSeason}/>}
    {section === "friends" && profile && <><FriendSearch /><Friends ownCode={profile.player.friendCode} /><ChallengesPanel /></>}
    {section === "market" && (profile ? <CelestialMarket /> : !loading && <p className="arena-note">สร้างตัวตนผู้ฝึกก่อน จึงจะเข้าตลาดสวรรค์ได้</p>)}
    {section === "bag" && (profile ? <QiankunBag name={profile.player.name} /> : !loading && <p className="arena-note">สร้างตัวตนผู้ฝึกก่อน จึงจะเปิดถุงเฉียนคุนได้</p>)}
    {section === "player" && playerCode && (profile ? <PlayerProfilePage code={playerCode} /> : !loading && <p className="arena-note">สร้างตัวตนผู้ฝึกก่อน จึงจะดูโปรไฟล์ผู้อื่นได้</p>)}
    {section === "profile" && profile && <><ProfileHub profile={profile} standing={season.stale ? null : season.data?.mine}/><MySeasonCapsule resource={season}/>{season.data?.adminShowcase?.isMe && <AdminShowcaseCard showcase={season.data.adminShowcase}/>}<PlayerProfile profile={profile} onChange={reload}/><ProfileRecords/><RecoveryPanel/><PlayerSessionControls onChange={reload}/></>}
  </ArenaShell>;
}
function MissionSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [scale, level] = value.split("-");
  return <div className="arena-mission-selector">
    <fieldset className="arena-venue-picker"><legend>เลือกสถานที่ฝึก</legend>
      <div>{missionChapters.map((chapter, index) => <button type="button" key={chapter.id} aria-pressed={scale === scales[chapter.venueId]} onClick={() => onChange(`${scales[chapter.venueId]}-${level}`)}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{chapter.venue}</strong></button>)}</div>
    </fieldset>
    <fieldset className="arena-level-picker"><legend>เลือกระดับบททดสอบ</legend>
      <div>{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} aria-pressed={level === String(n)} aria-label={`ระดับ ${n}`} onClick={() => onChange(`${scale}-${n}`)}><span>{n}</span><small>ระดับ {n}</small></button>)}</div>
    </fieldset>
  </div>;
}
function TimeAttack() {
  const [scenario, setScenario] = useState("xs-1"), [error, setError] = useState(""), [busy, setBusy] = useState(false); const router = useRouter(); const pending = useRef(false); const requestKey=useRef<string|null>(null);
  const selected = selectedMission(scenario);
  return <div className="arena-split arena-ready-room">
    <section className="arena-panel arena-selection">
      <div className="arena-section-heading"><div><span className="arena-eyebrow">ห้าสถานที่ · ยี่สิบห้าบททดสอบ</span><h2>เลือกเส้นทางฝึกวิชา</h2></div><ArenaIcon name="time-attack" /></div>
      <MissionSelector value={scenario} onChange={(value)=>{requestKey.current=null;setScenario(value);}} />
      <div className="arena-selected-stage" aria-live="polite" aria-atomic="true"><span className="arena-eyebrow">ใบภารกิจ · {selected.chapter?.venue}</span><h3>{selected.level?.title}</h3><p>{selected.level?.objective}</p><span className="arena-note">ยังไม่เริ่มจับเวลา · เลือกด่านเพื่อเตรียมภารกิจ</span></div>
      {error && <p className="arena-error" role="alert">{error}</p>}
      <button className="arena-ready-action" disabled={busy} onClick={async () => { if (pending.current) return; pending.current = true; setBusy(true); try { requestKey.current ||= crypto.randomUUID(); const a = await api<AttemptView>("attempts", { scenario,requestId:requestKey.current }); router.push(`/arena/time-attack/${a.id}`); } catch (e) { setError((e as Error).message); pending.current = false; setBusy(false); } }}>{busy ? "กำลังเตรียมภารกิจ…" : "เตรียมภารกิจจับเวลา →"}</button>
      <p className="arena-note">ระบบตรวจความพร้อมเมื่อส่งคำขอ หากไม่พร้อมจะแจ้งสาเหตุให้ทราบ</p>
    </section>
    <aside className="arena-panel arena-readiness"><div className="arena-readiness-art" aria-hidden="true"><Image src={arenaAsset("card-time-attack")} alt="" fill sizes="(max-width:760px) 100vw, 450px" /></div><span className="arena-eyebrow">ก่อนเข้าสู่บททดสอบ</span><h2>เตรียมพร้อม จึงลงมือ</h2>
      <ol className="arena-steps"><li><strong>เลือกสนาม</strong><span>อ่านเป้าหมายของสถานที่และระดับ</span></li><li><strong>เตรียมอุปกรณ์และสาย</strong><span>รอฉากพร้อม แล้วกดเริ่มนับถอยหลัง</span></li><li><strong>ลงมือด้วยตนเอง</strong><span>เวลาเซิร์ฟเวอร์เดินต่อแม้สลับแท็บ จำกัด 4 ชั่วโมง</span></li></ol>
      <details className="arena-details"><summary>ผลจับเวลากับการยืนยันอันดับ</summary><p>ผลปัจจุบันยังไม่ผ่านการยืนยันอันดับ การตรวจการต่อจากเบราว์เซอร์เพียงอย่างเดียวยังไม่ใช่หลักฐานตรวจย้อนกลับครบทั้งรอบ</p></details>
    </aside>
  </div>;
}
type Friend = PlayerView & { status: string; incoming: boolean;seasonal?:SeasonStanding|null };
function Friends({ ownCode }: { ownCode: string }) {
  const [friends, setFriends] = useState<Friend[]>([]), [directory, setDirectory] = useState<PlayerView[]>([]), [blocks, setBlocks] = useState<{ friendCode: string }[]>([]);
  const [code, setCode] = useState(""), [message, setMessage] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(0);
  const [confirmation, setConfirmation] = useState<{ action: string; code: string } | null>(null); const pending = useRef(false);
  const appearance = useFriendAppearance(true);
  const refresh = useCallback(async () => {
    try {
      const [f, d] = await Promise.all([api<{ friends: Friend[]; blocks: { friendCode: string }[] }>("friends"), api<{ players: PlayerView[] }>("directory")]);
      setFriends(f.friends); setBlocks(f.blocks); setDirectory(d.players); setError("");
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { const visible=()=>{if(!document.hidden)void refresh();}; const initial = window.setTimeout(visible, 0); const timer = window.setInterval(visible, 30000); document.addEventListener("visibilitychange",visible); return () => { clearTimeout(initial); clearInterval(timer);document.removeEventListener("visibilitychange",visible); }; }, [refresh]);
  const action = async (action: string, targetCode: string) => {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage(""); setError("");
    try { if (action === "request") { const r = await api<{ status: string }>("social/request", { code: targetCode }); setMessage(r.status === "friend" ? "อีกฝ่ายส่งคำขอถึงเจ้าไว้แล้ว จึงเป็นสหายกันทันที" : "ส่งคำขอเป็นสหายแล้ว"); } else { await api("friends", { action, code: targetCode }); setMessage("ดำเนินการแล้ว"); } setConfirmation(null); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { pending.current = false; setBusy(false); }
  };
  const groups = [
    { title: "สหายของฉัน", list: friends.filter((f) => f.status !== "pending"), empty: "ยังไม่มีสหายร่วมเส้นทาง", help: "แลกรหัสกับสหาย แล้วส่งคำเชิญ เมื่อรับคำขอจะแสดงที่นี่" },
    { title: "คำขอที่ได้รับ", list: friends.filter((f) => f.status === "pending" && f.incoming), empty: "ยังไม่มีสาส์นถึงเจ้า", help: "แบ่งปันรหัสสหายของเจ้า เพื่อให้ผู้อื่นส่งคำขอมาได้" },
    { title: "คำขอที่ส่งแล้ว", list: friends.filter((f) => f.status === "pending" && !f.incoming), empty: "ยังไม่มีคำเชิญที่รอตอบ", help: "คำขอที่ส่งแล้วจะอยู่ที่นี่ จนกว่าสหายจะตอบรับหรือเจ้าจะยกเลิก" },
  ];
  const activeGroup = groups[group];
  return <div className="arena-companions">
    <div className="arena-split arena-invitation-row">
      <section className="arena-panel arena-invitation"><span className="arena-eyebrow">สาส์นแห่งมิตรภาพ</span><h2>ส่งคำเชิญถึงสหาย</h2>
        <form onSubmit={(e) => { e.preventDefault(); void action("request", code.trim()); }}>
          <label>รหัสสหาย<input value={code} maxLength={16} onChange={(e) => setCode(e.target.value)} required autoComplete="off" spellCheck={false} placeholder="กรอกรหัสที่สหายแบ่งปัน" /></label>
          <button disabled={busy || !code.trim()}>{busy ? "กำลังดำเนินการ…" : "ส่งคำขอสหาย →"}</button>
        </form>
        <p role="status" aria-live="polite">{message}</p>
      </section>
      <section className="arena-panel arena-code-token"><ArenaIcon name="friends" /><h2>รหัสสหายของเจ้า</h2><ArenaFriendCode code={ownCode} /><p className="arena-note">แบ่งปันรหัสนี้ให้สหาย ใช้ได้โดยไม่ต้องเปิดเผยข้อมูลเข้าสู่ระบบ</p></section>
    </div>
    {error && <div className="arena-error" role="alert"><span>{error}</span><button className="arena-button-secondary" onClick={() => void refresh()}>ลองโหลดอีกครั้ง</button></div>}
    <section className="arena-panel arena-roster">
      <div className="arena-roster-tabs" role="group" aria-label="เลือกรายการสหาย">{groups.map((item, index) => <button type="button" key={item.title} aria-pressed={group === index} aria-controls="arena-roster-list" onClick={() => setGroup(index)}>{item.title}<span>{loading || error ? "—" : item.list.length}</span></button>)}</div>
      <div id="arena-roster-list" aria-live="polite" aria-busy={loading}>
        <h2 className="arena-roster-heading">{activeGroup.title}</h2>
        {loading ? <p className="arena-skeleton" role="status">กำลังเปิดสมุดสหาย…</p> : error ? <p className="arena-note">ยังโหลดข้อมูลไม่ครบ กรุณาลองอีกครั้งก่อนดำเนินการ</p> : activeGroup.list.length === 0 ? <ArenaEmptyState icon="friends" title={activeGroup.empty}>{activeGroup.help}</ArenaEmptyState> : activeGroup.list.map((f) => <article className="arena-person-row" key={f.friendCode}>
          <Link className="arena-person-identity friend-card" href={`/arena/players/${f.friendCode}`} aria-label={`เปิดโปรไฟล์ของ ${f.name}`}>
            <FriendPortrait items={appearance.data?.friends[f.friendCode]} name={f.name} />
            <div className="friend-card-text"><strong>{f.name}</strong><code>@{f.friendCode}</code>
              <span className="friend-card-meta">{f.seasonal ? <><RankBadge tier={f.seasonal.tier} size={20} decorative />{f.seasonal.tier} · {f.seasonal.score} คะแนน · #{f.seasonal.globalRank}</> : "ยังไม่มีสถิติยืนยันที่เปิดเผย"}</span>
              <span className={`friend-card-online${f.online ? " is-online" : ""}`}><i className={`chip-dot is-${f.online ? "connected" : "offline"}`} aria-hidden="true" />{f.online ? "ออนไลน์" : "ไม่แสดงสถานะออนไลน์"}</span></div>
          </Link>
          <div className="arena-actions">{f.status === "pending" ? f.incoming ? <><button disabled={busy} onClick={() => void action("accept", f.friendCode)}>รับคำขอ</button><button className="arena-button-secondary" disabled={busy} onClick={() => void action("decline", f.friendCode)}>ปฏิเสธ</button></> : <button className="arena-button-secondary" disabled={busy} onClick={() => void action("cancel", f.friendCode)}>ยกเลิกคำขอ</button> : <button className="arena-button-secondary" disabled={busy} onClick={() => setConfirmation({ action: "remove", code: f.friendCode })}>เลิกเป็นสหาย</button>}<button className="arena-button-danger" disabled={busy} onClick={() => setConfirmation({ action: "block", code: f.friendCode })}>ปิดกั้น</button></div>
        {f.status!=="pending" && <><ChallengeSender code={f.friendCode} name={f.name}/><FriendCompare code={f.friendCode}/></>}</article>)}
      </div>
    </section>
    <details className="arena-panel arena-directory"><summary>ผู้ฝึกที่ยินยอมเปิดเผยรายชื่อ</summary>
      {loading ? <p role="status">กำลังโหลดรายชื่อ…</p> : error ? <p>ยังโหลดรายชื่อไม่ได้ กรุณาลองอีกครั้ง</p> : directory.length === 0 ? <ArenaEmptyState icon="friends" title="ยังไม่มีผู้ฝึกเปิดเผยรายชื่อ">แสดงเฉพาะผู้ที่ยินยอมในระบบกลางเท่านั้น</ArenaEmptyState> : directory.map((p) => <div className="arena-person-row" key={p.friendCode}><strong>{p.name}</strong><code>{p.friendCode}</code><span>{p.online ? "ออนไลน์" : "ไม่ได้แสดงสถานะออนไลน์"}</span></div>)}
    </details>
    {blocks.length > 0 && <details className="arena-panel arena-directory"><summary>รหัสที่ปิดกั้น ({blocks.length})</summary>{blocks.map((b) => <div className="arena-person-row" key={b.friendCode}><code>{b.friendCode}</code><button className="arena-button-secondary" disabled={busy} onClick={() => void action("unblock", b.friendCode)}>ยกเลิกการปิดกั้น</button></div>)}</details>}
    <ArenaConfirmDialog open={!!confirmation} title={confirmation?.action === "block" ? "ปิดกั้นรหัสสหายนี้?" : "เลิกเป็นสหาย?"} busy={busy} onCancel={() => setConfirmation(null)} onConfirm={() => { if (confirmation) void action(confirmation.action, confirmation.code); }}>รหัสเป้าหมาย {confirmation?.code} · การดำเนินการจะใช้สิทธิ์และกติกาจากเซิร์ฟเวอร์</ArenaConfirmDialog>
  </div>;
}
function PlayerProfile({ profile, onChange }: { profile: Profile; onChange: () => Promise<void> }) {
  const [name, setName] = useState(String(profile.player.name)), [pub, setPub] = useState(profile.player.public), [rankPublic,setRankPublic]=useState(Boolean(profile.player.rankPublic)), [presence, setPresence] = useState(profile.player.presence), [message, setMessage] = useState(""), [busy, setBusy] = useState(false); const pending = useRef(false);
  return <><section className="arena-character-sheet" aria-label="ข้อมูลผู้ฝึก"><div className="arena-profile-heading"><div className="arena-identity"><MyIdentityArt name={profile.player.name} size={88} /><div><span className="arena-eyebrow">ตัวตนในหอประลอง</span><h2>{profile.player.name}</h2></div></div><ArenaFriendCode code={profile.player.friendCode} /></div><ArenaStatsStrip stats={profile.stats} /></section><div className="arena-split arena-profile-panels"><section className="arena-panel"><h2>ข้อมูลที่แสดงต่อผู้อื่น</h2><form onSubmit={async (e) => { e.preventDefault(); if (pending.current) return; pending.current = true; setBusy(true); try { await api("profile", { name, public: pub, presence, ...(profile.player.rankPublic!==undefined?{rankPublic}: {}) }); await onChange(); setMessage("บันทึกแล้ว"); } catch (e) { setMessage((e as Error).message); } finally { pending.current = false; setBusy(false); } }}><label>ชื่อแสดงผล<input value={name} disabled={profile.player.nameLocked || busy} maxLength={20} minLength={2} required onChange={(e) => setName(e.target.value)} /></label>{profile.player.nameLocked && <p className="arena-note">ผู้ดูแลกำหนดชื่อไว้ ชื่อเดิมในเครื่องไม่สามารถเขียนทับข้อมูลกลางได้</p>}<fieldset className="arena-privacy"><legend>ความเป็นส่วนตัว</legend>{profile.player.rankPublic!==undefined && <label><input type="checkbox" checked={rankPublic} onChange={(e)=>setRankPublic(e.target.checked)}/><span>ยินยอมเข้าทำเนียบและการจัดอันดับสาธารณะ<small>ต้องเปิดเผยรายชื่อด้วย ผลส่วนตัวไม่ถูกลบเมื่อปิดสิทธิ์นี้</small></span></label>}<label><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} /><span>เปิดเผยรายชื่อและผลที่ยืนยัน<small>ผู้อื่นจึงจะพบเจ้าในรายชื่อสาธารณะ</small></span></label><label><input type="checkbox" checked={presence} onChange={(e) => setPresence(e.target.checked)} /><span>ยินยอมแสดงสถานะออนไลน์<small>อ้างอิงสัญญาณเซิร์ฟเวอร์ภายใน 90 วินาที</small></span></label></fieldset><button disabled={busy || (!profile.player.nameLocked && !validateNickname(name))}>{busy ? "กำลังบันทึก…" : "บันทึกความเป็นส่วนตัว"}</button><p role="status" aria-live="polite">{message}</p></form><details className="arena-details"><summary>การเก็บตัวตนและการกลับมาเล่น</summary><p>ชื่อเล่นไม่ใช่รหัสเข้าสู่ตัวตนเดิม หากต้องเปลี่ยนเครื่อง ให้สร้างและเก็บรหัสกู้คืนส่วนตัวก่อนล้างคุกกี้ รหัสสหายใช้กู้คืนไม่ได้</p></details></section><section className="arena-panel"><span className="arena-eyebrow">รอยจารึกแห่งการฝึก</span><h2>ประวัติครั้งล่าสุด</h2>{profile.history.length === 0 ? <ArenaEmptyState icon="time-attack" title="ยังไม่มีประวัติการแข่งขัน" href="/arena/time-attack" action="เลือกบททดสอบแรก">เริ่มฝึกเมื่อพร้อม ประวัติที่มีอยู่จริงจะแสดงที่นี่</ArenaEmptyState> : <ol className="arena-history">{profile.history.map((a) => <li key={a.id}><div><Link href={`/arena/time-attack/${a.id}`}>{selectedMission(a.scenario).level?.title ?? a.scenario}</Link><small>{new Date(a.created).toLocaleString("th-TH")}</small></div><span className={`arena-status${a.status === "DNF" ? " is-muted" : ""}`}>{statusText(a.status)}</span><strong>{a.start === null ? "ยังไม่เริ่มจับเวลา" : timeText(a.totalMs)}</strong></li>)}</ol>}</section></div></>;
}

/** Back to the previous Arena page (or the Arena home when opened directly from a link). */
/** Back goes to each page's logical parent (not browser history, which is unreliable after client navigation). */
const backTarget: Record<string, [string, string]> = { bag: ["/arena/profile", "กลับโปรไฟล์"], market: ["/arena/profile", "กลับโปรไฟล์"], player: ["/arena/friends", "กลับหน้าสหาย"] };
function ArenaBackButton({ section }: { section: string }) {
  const [href, label] = backTarget[section] ?? ["/arena", "กลับหอประลอง"];
  return <Link className="arena-back-button arena-action" href={href}>← {label}</Link>;
}
