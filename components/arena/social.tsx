"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, timeText, type Profile } from "./client-api";
import { ArenaEmptyState, ArenaFriendCode } from "./shell";
import { useArenaResource } from "./use-arena-resource";
import { ProfileAvatar } from "./profile-avatar";
import { ChangeCoverButton, ProfileCover } from "./profile-cover";
import { RankBadge } from "./rank-badge";
import { SpiritStones, useEconomySummary, type EconomySummary } from "./economy";
import { selectedMission } from "./portal";
import { missionChapters } from "@/game/content/mission-catalog";

type Equipped = Partial<Record<string, { sku: string; name: string; asset: string }>>;
export type PlayerCard = { name: string; friendCode: string; isMe: boolean; relation: "self" | "friend" | "outgoing" | "incoming" | "none" | "blocked"; acceptRequests: boolean; online: boolean; equipped: Equipped; status?: string; incoming?: boolean; stats?: { verifiedStages: number; bestMs: number | null } | null };
type SocialMe = PlayerCard & { searchable: boolean; acceptRequests: boolean; pendingIn: number; challengesIn: number };
type Challenge = { id: string; stage: string; incoming: boolean; status: "pending" | "accepted" | "declined" | "cancelled" | "expired" | "completed"; created: number; expires: number; other: PlayerCard; myBestMs: number | null; otherBestMs: number | null };
type Standing = { tier: string; score: number; globalRank?: number } | null | undefined;

const SHOWCASE = [["swordSkin", "กระบี่ประจำตัว"], ["profileCompanion", "สัตว์วิญญาณ"], ["residenceDecor", "ของประดับตำหนัก"], ["profileAvatar", "ภาพโปรไฟล์"], ["profileFrame", "กรอบโปรไฟล์"]] as const;
/** Large display of equipped cosmetics (profile art only; not 3D gameplay items). */
export function Showcase({ equipped, own = false }: { equipped: Equipped; own?: boolean }) {
  const shown = SHOWCASE.filter(([slot]) => equipped[slot]);
  return <section className="arena-panel profile-showcase"><span className="arena-eyebrow">ตู้โชว์เซียน</span><h3>ของสะสมที่จัดแสดง</h3>
    {shown.length === 0 ? <ArenaEmptyState icon="trophy" title="ยังไม่ได้จัดแสดงของสะสม" href={own ? "/arena/market" : undefined} action={own ? "ไปตลาดสวรรค์" : undefined}>{own ? "ซื้อของในตลาดสวรรค์แล้วสวมใส่ในถุงเฉียนคุน จะแสดงที่นี่ให้สหายเห็น" : "ผู้ฝึกท่านนี้ยังไม่ได้สวมใส่ของสะสม"}</ArenaEmptyState>
      : <ul className="profile-showcase-grid">{shown.map(([slot, label]) => { const it = equipped[slot]!; return <li key={slot} data-slot={slot}><div className="profile-showcase-art"><Image src={it.asset} alt={it.name} fill sizes="(max-width:560px) 45vw, 220px" /></div><small>{label}</small><strong>{it.name}</strong></li>; })}</ul>}
    {own && <Link className="arena-text-link" href="/arena/bag">จัดของในถุงเฉียนคุน →</Link>}
  </section>;
}
function ShareProfile({ code }: { code: string }) {
  const [msg, setMsg] = useState("");
  return <><button type="button" className="arena-button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/arena/players/${code}`); setMsg("คัดลอกลิงก์แล้ว ส่งให้สหายเปิดดูได้"); } catch { setMsg("คัดลอกไม่ได้ กรุณาคัดลอกจากหน้าโปรไฟล์สาธารณะ"); } }}>คัดลอกลิงก์โปรไฟล์</button><span role="status" className="arena-note">{msg}</span></>;
}

const avatarOf = (e: Equipped) => (e.profileAvatar ?? e.portraitOutfit)?.asset;
export function useSocialMe(enabled = true) { return useArenaResource<SocialMe>(enabled ? "social/me" : null, 30000); }

/** Relation-aware friend action for another genuine player (server decides the real outcome). */
export function RelationButton({ card, onChange }: { card: PlayerCard; onChange?: () => void }) {
  const [state, setState] = useState(card.relation), [busy, setBusy] = useState(false), [error, setError] = useState(""); const pending = useRef(false);
  const run = async (path: string, body: Record<string, unknown>, next: PlayerCard["relation"]) => {
    if (pending.current) return; pending.current = true; setBusy(true); setError("");
    try { const r = await api<{ status?: PlayerCard["relation"] }>(path, body); setState(r.status ?? next); onChange?.(); }
    catch (e) { setError((e as Error).message); } finally { pending.current = false; setBusy(false); }
  };
  if (state === "self" || state === "blocked") return null;
  return <span className="social-relation">
    {state === "friend" ? <span className="econ-tag">สหายแล้ว</span>
      : state === "outgoing" ? <><span className="econ-tag">ส่งคำขอแล้ว</span><button className="arena-button-secondary" disabled={busy} onClick={() => void run("friends", { action: "cancel", code: card.friendCode }, "none")}>ยกเลิกคำขอ</button></>
      : state === "incoming" ? <><button disabled={busy} onClick={() => void run("friends", { action: "accept", code: card.friendCode }, "friend")}>ยอมรับ</button><button className="arena-button-secondary" disabled={busy} onClick={() => void run("friends", { action: "decline", code: card.friendCode }, "none")}>ปฏิเสธ</button></>
      : !card.acceptRequests ? <span className="arena-note">ปิดรับคำขอเป็นสหาย</span>
      : <button disabled={busy} onClick={() => void run("social/request", { code: card.friendCode }, "outgoing")}>{busy ? "กำลังส่ง…" : "ส่งคำขอเป็นสหาย"}</button>}
    {error && <span className="arena-error" role="alert">{error}</span>}
  </span>;
}

export function PlayerRow({ card, onChange, children }: { card: PlayerCard; onChange?: () => void; children?: React.ReactNode }) {
  return <article className="arena-person-row social-row">
    <Link className="arena-person-identity" href={`/arena/players/${card.friendCode}`}>
      <ProfileAvatar avatar={avatarOf(card.equipped)} frame={card.equipped.profileFrame?.asset} name={card.name} size={72} />
      <div><strong>{card.name}</strong><code>@{card.friendCode}</code><span>{card.online ? "ออนไลน์ (ผู้ฝึกยินยอมแสดง)" : "ไม่ได้แสดงสถานะออนไลน์"}</span></div>
    </Link>
    <div className="arena-actions"><RelationButton card={card} onChange={onChange} />{children}</div>
  </article>;
}

export function FriendSearch({ onChange }: { onChange?: () => void }) {
  const [q, setQ] = useState(""), [results, setResults] = useState<PlayerCard[] | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  return <section className="arena-panel social-search"><span className="arena-eyebrow">ค้นหาผู้ฝึก</span><h2>ค้นหาและส่งคำขอเป็นสหาย</h2>
    <form className="arena-form-row" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { setResults((await api<{ players: PlayerCard[] }>(`social/search?q=${encodeURIComponent(q.trim())}`)).players); } catch (err) { setError((err as Error).message); setResults(null); } finally { setBusy(false); } }}>
      <label>ชื่อผู้ฝึก หรือรหัสสหาย<input value={q} minLength={2} maxLength={20} required onChange={(e) => setQ(e.target.value)} placeholder="เช่น ชื่อเล่น หรือรหัส 16 ตัว" /></label>
      <button disabled={busy || q.trim().length < 2}>{busy ? "กำลังค้นหา…" : "ค้นหา"}</button>
    </form>
    <p className="arena-note">ค้นด้วยชื่อได้เฉพาะผู้ที่เปิด “อนุญาตให้ค้นหาโปรไฟล์” · ค้นด้วยรหัสสหายที่ได้รับมาโดยตรงได้เสมอ ชื่ออาจซ้ำกันได้ ให้ดูรหัส @ ก่อนส่งคำขอ</p>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {results && (results.length === 0 ? <ArenaEmptyState icon="friends" title="ไม่พบผู้ฝึก">ลองตรวจตัวสะกด หรือขอรหัสสหายจากอีกฝ่าย</ArenaEmptyState> : results.map((c) => <PlayerRow key={c.friendCode} card={c} onChange={onChange} />))}
  </section>;
}

const challengeStatus: Record<Challenge["status"], string> = { pending: "รอตอบรับ", accepted: "กำลังแข่งทำเวลา", declined: "ปฏิเสธแล้ว", cancelled: "ยกเลิกแล้ว", expired: "หมดอายุ", completed: "ปิดคำท้าแล้ว" };
const stageName = (id: string) => { const m = selectedMission(id); return `${m.chapter?.venue ?? ""} · ระดับ ${id.split("-")[1]}`; };
function verdict(c: Challenge) {
  if (c.status !== "accepted" && c.status !== "completed") return null;
  if (c.myBestMs === null && c.otherBestMs === null) return "ยังไม่มีผลที่เซิร์ฟเวอร์รับรองจากทั้งสองฝ่าย";
  if (c.myBestMs === null) return "อีกฝ่ายมีผลรับรองแล้ว · เจ้ายังไม่มี";
  if (c.otherBestMs === null) return "เจ้ามีผลรับรองแล้ว · อีกฝ่ายยังไม่มี";
  return c.myBestMs === c.otherBestMs ? "เวลาเท่ากัน" : c.myBestMs < c.otherBestMs ? "เวลาของเจ้าดีกว่า" : "เวลาของอีกฝ่ายดีกว่า";
}
/** Asynchronous time-trial challenges between friends. Not a live 1v1 duel. */
export function ChallengesPanel() {
  const list = useArenaResource<{ challenges: Challenge[] }>("social/challenges", 30000);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const respond = async (id: string, decision: string) => { setBusy(true); setError(""); try { await api("social/challenge-respond", { id, decision }); list.retry(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } };
  const items = list.data?.challenges ?? [];
  return <section className="arena-panel social-challenges"><span className="arena-eyebrow">คำท้าทำเวลา · ไม่ใช่การดวลสด</span><h2>คำท้าทำเวลา</h2>
    <p className="arena-note">ต่างคนต่างเล่นด่านเดียวกันภายใน 7 วันหลังตอบรับ เทียบเฉพาะเวลาที่เซิร์ฟเวอร์รับรองแล้ว ไม่มีรางวัลหรือคะแนนอันดับเพิ่ม · ดวลสด 1v1 ยังไม่เปิดใช้งาน</p>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {list.loading ? <p role="status">กำลังโหลดคำท้า…</p> : list.error && !list.data ? <p className="arena-error">{list.error} <button onClick={list.retry}>ลองอีกครั้ง</button></p>
      : items.length === 0 ? <ArenaEmptyState icon="time-attack" title="ยังไม่มีคำท้า">ส่งคำท้าได้จากรายชื่อสหายหรือโปรไฟล์ของสหาย</ArenaEmptyState>
      : <ul className="social-challenge-list">{items.map((c) => <li key={c.id}>
          <ProfileAvatar avatar={avatarOf(c.other.equipped)} frame={c.other.equipped.profileFrame?.asset} size={44} />
          <div><strong>{c.incoming ? `${c.other.name} ท้าเจ้า` : `เจ้าท้า ${c.other.name}`}</strong><span>{stageName(c.stage)} · {challengeStatus[c.status]}</span>
            {(c.status === "accepted" || c.status === "completed") && <span>เจ้า {timeText(c.myBestMs)} · อีกฝ่าย {timeText(c.otherBestMs)} — {verdict(c)}</span>}</div>
          <div className="arena-actions">
            {c.status === "pending" && c.incoming && <><button disabled={busy} onClick={() => void respond(c.id, "accept")}>รับคำท้า</button><button className="arena-button-secondary" disabled={busy} onClick={() => void respond(c.id, "decline")}>ปฏิเสธ</button></>}
            {c.status === "pending" && !c.incoming && <button className="arena-button-secondary" disabled={busy} onClick={() => void respond(c.id, "cancel")}>ยกเลิก</button>}
            {c.status === "accepted" && <Link className="arena-action" href="/arena/time-attack">ไปทำเวลา</Link>}
          </div></li>)}</ul>}
  </section>;
}

export function ChallengeSender({ code, name }: { code: string; name: string }) {
  const [open, setOpen] = useState(false), [stage, setStage] = useState("xs-1"), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const scales = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" } as const;
  if (!open) return <button className="arena-button-secondary" onClick={() => setOpen(true)}>ส่งคำท้าทำเวลา</button>;
  return <form className="social-challenge-form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setMsg(""); try { await api("social/challenge", { code, stage }); setMsg(`ส่งคำท้าถึง ${name} แล้ว`); setOpen(false); } catch (err) { setMsg((err as Error).message); } finally { setBusy(false); } }}>
    <label>ด่านที่ท้า<select value={stage} onChange={(e) => setStage(e.target.value)}>{missionChapters.flatMap((c) => [1, 2, 3, 4, 5].map((n) => <option key={`${c.id}-${n}`} value={`${scales[c.venueId as keyof typeof scales]}-${n}`}>{c.venue} · ระดับ {n}</option>))}</select></label>
    <button disabled={busy}>{busy ? "กำลังส่ง…" : "ส่งคำท้า"}</button><button type="button" className="arena-button-secondary" onClick={() => setOpen(false)}>ยกเลิก</button>
    <span role="status">{msg}</span>
  </form>;
}

function PrivacySettings({ me, onChange }: { me: SocialMe; onChange: () => void }) {
  const [searchable, setSearchable] = useState(me.searchable), [accept, setAccept] = useState(me.acceptRequests), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  return <form className="arena-privacy" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await api("social/settings", { searchable, acceptRequests: accept }); setMsg("บันทึกแล้ว"); onChange(); } catch (err) { setMsg((err as Error).message); } finally { setBusy(false); } }}>
    <label><input type="checkbox" checked={searchable} onChange={(e) => setSearchable(e.target.checked)} /><span>อนุญาตให้ค้นหาโปรไฟล์ด้วยชื่อ<small>ปิดไว้ ผู้อื่นยังเพิ่มสหายด้วยรหัสที่เจ้าแบ่งปันได้</small></span></label>
    <label><input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} /><span>รับคำขอเป็นสหาย<small>ปิดไว้ จะไม่มีคำขอใหม่เข้ามา</small></span></label>
    <button disabled={busy}>บันทึกการค้นหาและคำขอ</button><span role="status">{msg}</span>
  </form>;
}

/** Personal hub: identity, rank, wallet, showcase and social shortcuts — all from live server data. */
export function ProfileHub({ profile, standing }: { profile: Profile; standing: Standing }) {
  const economy = useEconomySummary(true), me = useSocialMe(true);
  const eq = (economy.data?.equipped || {}) as EconomySummary["equipped"];
  const name = profile.player.name;
  return <section className="profile-hub" aria-label="โปรไฟล์ของข้า">
    <ProfileCover cover={eq.profileCover?.asset} className="arena-panel profile-hub-card" bodyClassName="profile-hub-header" tools={economy.data ? <ChangeCoverButton onChanged={economy.retry} /> : null}>
      <div className="profile-hub-portrait">
        <ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} name={name} size={168} />
        {eq.profileCompanion && <Image className="profile-hub-pet" src={eq.profileCompanion.asset} alt={eq.profileCompanion.name} width={96} height={96} />}
      </div>
      <div className="profile-hub-identity">
        <span className="arena-eyebrow">ข้อมูลเซียน</span><h2>{name}</h2>
        <ArenaFriendCode code={profile.player.friendCode} />
        <div className="profile-hub-rank">{standing ? <><RankBadge tier={standing.tier} size={48} current /><span><strong>{standing.tier}</strong> · {standing.score} คะแนนฤดูกาล</span></> : <span className="arena-note">ยังไม่จัดอันดับ (ต้องมีผลที่เซิร์ฟเวอร์รับรอง)</span>}</div>
        <dl className="profile-hub-stats"><div><dt>ผลที่รับรอง</dt><dd>{profile.stats.verified ?? "—"}</dd></div><div><dt>เวลารับรองดีที่สุด</dt><dd>{timeText(profile.stats.bestMs)}</dd></div><div><dt>หินวิญญาณ</dt><dd>{economy.data ? <SpiritStones amount={economy.data.balance} /> : economy.error ? "โหลดไม่ได้" : "…"}</dd></div></dl>
      </div>
      <nav className="profile-hub-actions" aria-label="ทางลัดโปรไฟล์">
        <Link className="arena-action" href="/arena/market">ตลาดสวรรค์</Link>
        <Link className="arena-action econ-secondary" href="/arena/bag">ถุงเฉียนคุน{economy.data ? ` · ${economy.data.ownedCount}` : ""}</Link>
        <Link className="arena-action econ-secondary" href="/arena/friends">สหาย{me.data && me.data.pendingIn > 0 ? ` · คำขอใหม่ ${me.data.pendingIn}` : ""}</Link>
        <Link className="arena-action econ-secondary" href="/arena/ranked">อันดับ</Link>
        <Link className="arena-action econ-secondary" href={`/arena/players/${profile.player.friendCode}`}>ดูโปรไฟล์แบบที่ผู้อื่นเห็น</Link>
        <ShareProfile code={profile.player.friendCode} />
      </nav>
    </ProfileCover>
    <div className="profile-hub-grid">
      <Showcase equipped={eq as Equipped} own />
      <section className="arena-panel profile-activity"><span className="arena-eyebrow">สหายและการแจ้งเตือน</span><h3>ความเคลื่อนไหว</h3>
        {me.loading ? <p role="status">กำลังโหลด…</p> : me.error && !me.data ? <p className="arena-error">{me.error} <button onClick={me.retry}>ลองอีกครั้ง</button></p> : me.data && <>
          <p>คำขอเป็นสหายที่รอเจ้าตอบ: <strong>{me.data.pendingIn}</strong> · คำท้าทำเวลาที่รอตอบ: <strong>{me.data.challengesIn}</strong></p>
          <Link className="arena-text-link" href="/arena/friends">เปิดหน้าสหายเพื่อตอบรับหรือปฏิเสธ →</Link>
          <PrivacySettings me={me.data} onChange={me.retry} />
        </>}
      </section>
    </div>
  </section>;
}

/** Permitted view of another player's profile (friends, or players who opted into discovery/public listing). */
export function PlayerProfilePage({ code }: { code: string }) {
  const [card, setCard] = useState<PlayerCard | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { setCard(await api<PlayerCard>(`social/card?code=${encodeURIComponent(code)}`)); setError(""); } catch (e) { setError((e as Error).message); } finally { setLoading(false); } }, [code]);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  if (loading) return <p className="arena-panel arena-skeleton" role="status">กำลังเปิดโปรไฟล์…</p>;
  if (error || !card) return <div className="arena-panel"><ArenaEmptyState icon="profile" title="เปิดโปรไฟล์นี้ไม่ได้" href="/arena/friends" action="กลับหน้าสหาย">{error || "ผู้ฝึกท่านนี้ไม่ได้เปิดเผยโปรไฟล์ หรือไม่พบรหัสนี้"}</ArenaEmptyState></div>;
  const eq = card.equipped;
  return <div className="profile-hub"><ProfileCover cover={eq.profileCover?.asset} className="arena-panel profile-hub-card" bodyClassName="profile-hub-header is-public">
    <div className="profile-hub-portrait"><ProfileAvatar avatar={avatarOf(eq)} frame={eq.profileFrame?.asset} name={card.name} size={168} />{eq.profileCompanion && <Image className="profile-hub-pet" src={eq.profileCompanion.asset} alt={eq.profileCompanion.name} width={96} height={96} />}</div>
    <div className="profile-hub-identity"><span className="arena-eyebrow">{card.isMe ? "โปรไฟล์ของเจ้า (มุมมองผู้อื่น)" : card.relation === "friend" ? "สหายร่วมสำนัก" : "ผู้ฝึกในหอประลอง"}</span><h2>{card.name}</h2><code>@{card.friendCode}</code>
      <p>{card.online ? "ออนไลน์ (ผู้ฝึกยินยอมแสดง)" : "ไม่ได้แสดงสถานะออนไลน์"}</p>
      {card.stats ? <dl className="profile-hub-stats"><div><dt>ด่านที่รับรองแล้ว</dt><dd>{card.stats.verifiedStages}</dd></div><div><dt>เวลารับรองดีที่สุด</dt><dd>{timeText(card.stats.bestMs)}</dd></div></dl> : <p className="arena-note">ผู้ฝึกท่านนี้ไม่ได้เปิดเผยสถิติ</p>}
    </div>
    <div className="profile-hub-actions">{card.isMe ? <Link className="arena-action" href="/arena/profile">กลับโปรไฟล์ของข้า</Link> : <><RelationButton card={card} onChange={() => void load()} />{card.relation === "friend" && <ChallengeSender code={card.friendCode} name={card.name} />}</>}<Link className="arena-text-link" href="/arena/friends">กลับหน้าสหาย →</Link></div>
  </ProfileCover><Showcase equipped={eq} own={card.isMe} /></div>;
}
