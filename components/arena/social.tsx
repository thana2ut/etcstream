"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, timeText, type Profile } from "./client-api";
import { ArenaEmptyState, ArenaFriendCode } from "./shell";
import { useArenaResource } from "./use-arena-resource";
import { ProfileAvatar } from "./profile-avatar";
import { ChangeCoverButton, ProfileCover } from "./profile-cover";
import { RankBadge, tierForScore } from "./rank-badge";
import { useEconomySummary, type EconomySummary } from "./economy";
import { stones } from "@/game/content/economy-catalog";
import { selectedMission } from "./portal";
import { missionChapters } from "@/game/content/mission-catalog";

type Equipped = Partial<Record<string, { sku: string; name: string; asset: string; rarity?: string | null; description?: string | null }>>;
export type PlayerCard = { name: string; friendCode: string; isMe: boolean; relation: "self" | "friend" | "outgoing" | "incoming" | "none" | "blocked"; acceptRequests: boolean; online: boolean; equipped: Equipped; status?: string; incoming?: boolean; stats?: { verifiedStages: number; bestMs: number | null } | null; seasonStanding?: { score: number; globalRank: number; stages: number } | null; spiritStones?: number | null };
type SocialMe = PlayerCard & { searchable: boolean; acceptRequests: boolean; pendingIn: number; challengesIn: number };
type Challenge = { id: string; stage: string; incoming: boolean; status: "pending" | "accepted" | "declined" | "cancelled" | "expired" | "completed"; created: number; expires: number; other: PlayerCard; myBestMs: number | null; otherBestMs: number | null };
type Standing = { tier: string; score: number; globalRank?: number } | null | undefined;

const SHOWCASE = [["swordSkin", "กระบี่ประจำตัว"], ["profileCompanion", "สัตว์วิญญาณ"], ["residenceDecor", "ของประดับตำหนัก"], ["profileAvatar", "ภาพโปรไฟล์"], ["profileFrame", "กรอบโปรไฟล์"]] as const;
/** Large display of equipped cosmetics (profile art only; not 3D gameplay items). */
export function Showcase({ equipped, own = false }: { equipped: Equipped; own?: boolean }) {
  const seal = equipped.spiritSeal;
  const [sealOpen, setSealOpen] = useState(false);
  return <section className="arena-panel profile-showcase"><span className="arena-eyebrow">ตู้โชว์เซียน</span><h3>ของสะสมที่จัดแสดง</h3>
    <ul className="profile-showcase-grid">{SHOWCASE.map(([slot, label]) => { const it = equipped[slot]; return <li key={slot} data-slot={slot} className={it ? undefined : "is-empty"}><div className="profile-showcase-art">{it && <Image src={it.asset} alt={it.name} fill sizes="(max-width:560px) 45vw, 220px" />}</div><small>{label}</small><strong>{it?.name ?? "ยังไม่ได้สวมใส่"}</strong></li>; })}
      <li data-slot="spiritSeal" className={`profile-showcase-seal${seal ? "" : " is-empty"}`} role="button" tabIndex={0} aria-label={seal ? `ดูตราประทับเซียน ${seal.name}` : "ตราประทับเซียน ยังไม่ได้สวม"} onClick={() => setSealOpen(true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSealOpen(true); } }}>
        <div className="profile-showcase-art">{seal && <Image src={seal.asset} alt={seal.name} fill sizes="(max-width:560px) 45vw, 260px" />}</div>
        <small>ตราประทับเซียน{seal?.rarity ? ` · ${seal.rarity}` : ""}</small><strong>{seal ? seal.name : "ยังไม่ได้สวมใส่"}</strong></li></ul>
    {sealOpen && <div className="arena-modal" onClick={(e) => { if (e.target === e.currentTarget) setSealOpen(false); }}>
      <div className="arena-panel seal-detail" role="dialog" aria-modal="true" aria-labelledby="seal-detail-title" tabIndex={-1} ref={(el) => el?.focus()} onKeyDown={(e) => { if (e.key === "Escape") setSealOpen(false); }}>
        <span className="arena-eyebrow">ตราประทับเซียน{seal?.rarity ? ` · ระดับ${seal.rarity}` : ""}</span><h2 id="seal-detail-title">{seal ? seal.name : "ยังไม่ได้สวมตราประทับ"}</h2>
        {seal ? <><div className="seal-detail-art"><Image src={seal.asset} alt={seal.name} fill sizes="(max-width:700px) 80vw, 480px" /></div>{seal.description && <p>{seal.description}</p>}<p className="arena-note">ของสะสมเพื่อจัดแสดงเท่านั้น ไม่มีผลต่อคะแนน เวลา หรือการแข่งขัน</p></>
          : <p>{own ? "เลือกตราประทับเซียนได้จากตลาดสวรรค์ แล้วสวมใส่ในถุงเฉียนคุน" : "ผู้ฝึกท่านนี้ยังไม่ได้สวมตราประทับ"}</p>}
        <div className="arena-actions">{own && <Link className="arena-action" href={seal ? "/arena/bag" : "/arena/market"}>{seal ? "เปลี่ยนในถุงเฉียนคุน" : "ไปตลาดสวรรค์"}</Link>}<button type="button" className="arena-button-secondary" onClick={() => setSealOpen(false)}>ปิด</button></div>
      </div>
    </div>}
    {own && <Link className="arena-text-link" href="/arena/bag">จัดของในถุงเฉียนคุน →</Link>}
  </section>;
}

/** Small line icons for the profile card (decorative; labels carry the meaning). */
const HUB_ICON_PATHS: Record<string, string> = {
  market: "M3 10h18l-1.5-5h-15L3 10Zm1 0v9h16v-9M8 19v-5h4v5M5 10c0 1.4 1.1 2.5 2.5 2.5S10 11.4 10 10m0 0c0 1.4.9 2.5 2 2.5s2-1.1 2-2.5m0 0c0 1.4 1.1 2.5 2.5 2.5S19 11.4 19 10",
  bag: "M9 4h6l-1 3h-4L9 4Zm1 3c-3 2-5 5-5 8a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5c0-3-2-6-5-8m-2 5v6m-2-4c0-1 1-2 2-2s2 .6 2 1.5S10 13 10 14s1 1.5 2 1.5 2-.7 2-1.5",
  friends: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a2.5 2.5 0 1 0 0-5M17.5 14c2 .6 3.5 2.6 3.5 5",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H5c0 3 1.3 4.5 3 5m8-5h3c0 3-1.3 4.5-3 5m-4 2v4m-4 3h8l-1-3H9l-1 3Z",
  eye: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  hourglass: "M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9",
};
function HubIcon({ name }: { name: keyof typeof HUB_ICON_PATHS }) {
  return <svg className="hub-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d={HUB_ICON_PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CloudOrnament() {
  return <svg className="hub-cloud" viewBox="0 0 64 20" width="64" height="20" aria-hidden="true" focusable="false"><path d="M2 12h14c2 0 3-2 2-3.5S14 7 13.5 9M18 12c1-4 6-5 8-2 1-3 6-3 7 0 3-1 5 1 4 3s-4 1-4-1M37 12h25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function ShareProfile({ code }: { code: string }) {
  const [msg, setMsg] = useState("");
  return <><button type="button" className="arena-button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/arena/players/${code}`); setMsg("คัดลอกลิงก์แล้ว ส่งให้สหายเปิดดูได้"); } catch { setMsg("คัดลอกไม่ได้ กรุณาคัดลอกจากหน้าโปรไฟล์สาธารณะ"); } }}><HubIcon name="link" />คัดลอกลิงก์</button><span role="status" className="arena-note">{msg}</span></>;
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
  return <section className="arena-panel social-challenges"><span className="arena-eyebrow">คำท้าทำเวลา</span><h2>คำท้าทำเวลา</h2>
    <p className="arena-note">ต่างคนต่างเล่นด่านเดียวกันภายใน 7 วันหลังตอบรับ เทียบเฉพาะเวลาที่เซิร์ฟเวอร์รับรองแล้ว ไม่มีรางวัลหรือคะแนนอันดับเพิ่ม</p>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {list.loading ? <p role="status">กำลังโหลดคำท้า…</p> : list.error && !list.data ? <p className="arena-error">{list.error} <button onClick={list.retry}>ลองอีกครั้ง</button></p>
      : items.length === 0 ? <ArenaEmptyState icon="time-attack" title="ยังไม่มีคำท้า">ส่งคำท้าได้จากรายชื่อสหายหรือโปรไฟล์ของสหาย</ArenaEmptyState>
      : <ul className="social-challenge-list">{items.map((c) => <li key={c.id}>
          <ProfileAvatar avatar={avatarOf(c.other.equipped)} frame={c.other.equipped.profileFrame?.asset} size={44} />
          <div><strong>{c.incoming ? `${c.other.name} ท้าเจ้า` : `เจ้าท้า ${c.other.name}`}</strong><span>{stageName(c.stage)} · {challengeStatus[c.status]}</span>
            {(c.status === "accepted" || c.status === "completed") && <span>เจ้า {timeText(c.myBestMs)} · อีกฝ่าย {timeText(c.otherBestMs)} — {verdict(c)}</span>}</div>
          <div className="arena-actions">
            {c.status === "pending" && c.incoming && <><button disabled={busy} onClick={() => void respond(c.id, "accept")}><ActIcon name="check" />รับคำท้า</button><button className="arena-button-secondary" disabled={busy} onClick={() => void respond(c.id, "decline")}><ActIcon name="x" />ปฏิเสธ</button></>}
            {c.status === "pending" && !c.incoming && <button className="arena-button-secondary" disabled={busy} onClick={() => void respond(c.id, "cancel")}><ActIcon name="x" />ยกเลิก</button>}
            {c.status === "accepted" && <><Link className="arena-action" href="/arena/time-attack"><ActIcon name="arrow" />ไปทำเวลา</Link><button className="arena-button-secondary" disabled={busy} onClick={() => void respond(c.id, "withdraw")}><ActIcon name="x" />ปฏิเสธคำท้า</button></>}
          </div></li>)}</ul>}
  </section>;
}

const ACT_ICON: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  arrow: "M5 12h13m-5-5 5 5-5 5",
  userMinus: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11h6",
  ban: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM5.6 5.6l12.8 12.8",
};
export function ActIcon({ name }: { name: keyof typeof ACT_ICON }) {
  return <svg className="act-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d={ACT_ICON[name]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ChallengeSender({ code, name }: { code: string; name: string }) {
  const [open, setOpen] = useState(false), [stage, setStage] = useState("xs-1"), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const scales = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" } as const;
  if (!open) return <button className="arena-button-secondary" onClick={() => setOpen(true)}><ActIcon name="flag" />ส่งคำท้าทำเวลา</button>;
  return <form className="social-challenge-form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setMsg(""); try { await api("social/challenge", { code, stage }); setMsg(`ส่งคำท้าถึง ${name} แล้ว`); setOpen(false); } catch (err) { setMsg((err as Error).message); } finally { setBusy(false); } }}>
    <label className="social-challenge-stage"><span className="visually-hidden">ด่านที่ท้า</span><ActIcon name="flag" /><select aria-label="ด่านที่ท้า" value={stage} onChange={(e) => setStage(e.target.value)}>{missionChapters.flatMap((c) => [1, 2, 3, 4, 5].map((n) => <option key={`${c.id}-${n}`} value={`${scales[c.venueId as keyof typeof scales]}-${n}`}>{c.venue} · ระดับ {n}</option>))}</select></label>
    <button disabled={busy}><ActIcon name="arrow" />{busy ? "กำลังส่ง…" : "ส่งคำท้า"}</button><button type="button" className="arena-button-secondary" onClick={() => setOpen(false)}><ActIcon name="x" />ยกเลิก</button>
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
    <nav className="profile-hub-actions profile-hub-menu" aria-label="ทางลัดโปรไฟล์">
        <Link className="arena-action" href="/arena/market"><HubIcon name="market" />ตลาดสวรรค์</Link>
        <Link className="arena-action econ-secondary" href="/arena/bag"><HubIcon name="bag" />ถุงเฉียนคุน{economy.data ? ` · ${economy.data.ownedCount}` : ""}</Link>
        <Link className="arena-action econ-secondary" href="/arena/friends"><HubIcon name="friends" />สหาย{me.data && me.data.pendingIn > 0 ? ` · ${me.data.pendingIn}` : ""}</Link>
        <Link className="arena-action econ-secondary" href="/arena/ranked"><HubIcon name="trophy" />อันดับ</Link>
        <Link className="arena-action econ-secondary" href={`/arena/players/${profile.player.friendCode}`}><HubIcon name="eye" />มุมมองผู้อื่น</Link>
        <ShareProfile code={profile.player.friendCode} />
      </nav>
    {economy.data && <div className="profile-hub-cover-tools" aria-label="ปรับแต่งภาพโปรไฟล์">
      <ChangeCoverButton onChanged={economy.retry} />
      <ChangeCoverButton slot="profileNameplate" onChanged={economy.retry} />
    </div>}
    <ProfileCover cover={eq.profileCover?.asset} className="arena-panel profile-hub-card" bodyClassName="profile-hub-header">
      <div className="profile-hub-portrait">
        <ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} name={name} size={168} />
        {eq.profileCompanion && <Image className="profile-hub-pet" src={eq.profileCompanion.asset} alt={eq.profileCompanion.name} width={96} height={96} />}
      </div>
      <div className="profile-hub-identity">
        <span className="arena-eyebrow">ข้อมูลเซียน</span><h2>{name}<CloudOrnament /></h2>
        <ArenaFriendCode code={profile.player.friendCode} />
        <div className="profile-hub-rank">{standing ? <><RankBadge tier={standing.tier} size={48} current /><span><strong>{standing.tier}</strong> · {standing.score} คะแนนฤดูกาล</span></> : <span className="arena-note">ยังไม่จัดอันดับ (ต้องมีผลที่เซิร์ฟเวอร์รับรอง)</span>}</div>
        <dl className="profile-hub-stats has-icons">
          <div><span className="stat-icon">{standing ? <RankBadge tier={standing.tier} size={34} decorative /> : <Image src="/assets/arena/ranks/rank-01-novice.png" alt="" width={34} height={34} />}</span><span><dt>ผลที่รับรอง</dt><dd>{profile.stats.verified ?? "—"}</dd></span></div>
          <div><span className="stat-icon"><Image src="/arena/economy/currencies/hourglass-v1.webp" alt="" width={34} height={34} /></span><span><dt>เวลารับรองดีที่สุด</dt><dd>{timeText(profile.stats.bestMs)}</dd></span></div>
          <div><span className="stat-icon"><Image src="/arena/economy/currencies/spirit-stone-v2.webp" alt="" width={34} height={34} /></span><span><dt>หินวิญญาณ</dt><dd>{economy.data ? stones(economy.data.balance) : economy.error ? "โหลดไม่ได้" : "…"}</dd></span></div>
        </dl>
      </div>
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
  // Action buttons sit above the cover, separate from the artwork.
  return <div className="profile-hub"><div className="profile-hub-actions is-above-cover">{card.isMe ? null : <><RelationButton card={card} onChange={() => void load()} />{card.relation === "friend" && <ChallengeSender code={card.friendCode} name={card.name} />}</>}{!card.isMe && <Link className="arena-text-link" href="/arena/friends">กลับหน้าสหาย →</Link>}</div><ProfileCover cover={eq.profileCover?.asset} className="arena-panel profile-hub-card" bodyClassName="profile-hub-header is-public">
    <div className="profile-hub-portrait"><ProfileAvatar avatar={avatarOf(eq)} frame={eq.profileFrame?.asset} name={card.name} size={168} />{eq.profileCompanion && <Image className="profile-hub-pet" src={eq.profileCompanion.asset} alt={eq.profileCompanion.name} width={96} height={96} />}</div>
    <div className="profile-hub-identity"><span className="arena-eyebrow">{card.isMe ? "โปรไฟล์ของเจ้า (มุมมองผู้อื่น)" : card.relation === "friend" ? "สหายร่วมสำนัก" : "ผู้ฝึกในหอประลอง"}</span><h2>{card.name}</h2><ArenaFriendCode code={card.friendCode} />
      <p>{card.online ? "ออนไลน์ (ผู้ฝึกยินยอมแสดง)" : "ไม่ได้แสดงสถานะออนไลน์"}</p>
      {card.seasonStanding && <div className="profile-hub-rank"><RankBadge tier={tierForScore(card.seasonStanding.score)} size={48} current /><span><strong>{tierForScore(card.seasonStanding.score)}</strong> · {card.seasonStanding.score.toLocaleString("th-TH")} คะแนนฤดูกาล</span></div>}
      {card.stats ? <dl className="profile-hub-stats has-icons">
        <div><span className="stat-icon">{card.seasonStanding ? <RankBadge tier={tierForScore(card.seasonStanding.score)} size={34} decorative /> : <Image src="/assets/arena/ranks/rank-01-novice.png" alt="" width={34} height={34} />}</span><span><dt>ผลที่รับรอง</dt><dd>{card.stats.verifiedStages}</dd></span></div>
        <div><span className="stat-icon"><Image src="/arena/economy/currencies/hourglass-v1.webp" alt="" width={34} height={34} /></span><span><dt>เวลารับรองดีที่สุด</dt><dd>{timeText(card.stats.bestMs)}</dd></span></div>
        {card.spiritStones !== null && card.spiritStones !== undefined && <div><span className="stat-icon"><Image src="/arena/economy/currencies/spirit-stone-v2.webp" alt="" width={34} height={34} /></span><span><dt>หินวิญญาณ</dt><dd>{stones(card.spiritStones)}</dd></span></div>}
      </dl> : <p className="arena-note">ผู้ฝึกท่านนี้ไม่ได้เปิดเผยสถิติ</p>}
    </div>
  </ProfileCover><Showcase equipped={eq} own={card.isMe} /></div>;
}
