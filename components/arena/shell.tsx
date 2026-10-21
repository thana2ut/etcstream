"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { PlayerView, Profile } from "./client-api";
import { timeText } from "./client-api";
import { RankBadge } from "./rank-badge";
import { ProfileAvatar } from "./profile-avatar";
import { useArenaResource } from "./use-arena-resource";

type ChipEquipped = { equipped?: Partial<Record<string, { asset: string }>> };
type Inbox = { pendingIn: number; challengesIn: number };

export const arenaAsset = (file: string) => `/assets/arena/${file}.png`;
export const arenaDestinations = [
  // Top menu keeps four destinations; other modes stay reachable from the home cards.
  ["home", "/arena", "หน้าหลัก"], ["ranked", "/arena/ranked", "จัดอันดับ"],
  ["friends", "/arena/friends", "สหาย"], ["profile", "/arena/profile", "โปรไฟล์"],
] as const;
export function ArenaIcon({ name }: { name: string }) { return <Image src={arenaAsset(`icon-${name}`)} alt="" width={44} height={44} className="arena-icon" />; }
export function ArenaShell({ children, admin = false, adminHeader, player,rank,connection,rankState }: { children: React.ReactNode; admin?: boolean; adminHeader?: React.ReactNode; player?: PlayerView;rank?:{tier:string;score:number}|null;connection?:"connecting"|"connected"|"disconnected";rankState?:"loading"|"stale"|"ready" }) {
  const pathname = usePathname();
  const current = arenaDestinations.find(([, href]) => href !== "/arena" && pathname.startsWith(href))?.[0] ?? "home";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  // Live identity art and inbox count (polled only while visible; no fake presence).
  const chip = useArenaResource<ChipEquipped>(player && !admin ? "economy" : null, 60000), inbox = useArenaResource<Inbox>(player && !admin ? "social/me" : null, 30000);
  const unread = (inbox.data?.pendingIn ?? 0) + (inbox.data?.challengesIn ?? 0), eq = chip.data?.equipped ?? {};
  return <main className={`arena-shell${admin ? " is-admin" : " arena-public"}`} data-arena-scene={admin ? undefined : current}>
    <Image src={arenaAsset(admin ? "bg-admin-command-hall" : "bg-arena-hub")} alt="" fill sizes="100vw" className="arena-backdrop" />
    <div className="arena-scrim" />
    <div className="arena-content">
      {admin ? adminHeader ?? <header className="arena-top"><Link href="/">กลับหน้าต้อนรับ</Link><Link href="/academy">กลับสำนัก</Link><Link href="/admin">บัญชาการสำนัก</Link></header> : <header className="arena-header" onKeyDown={(e) => { if (e.key === "Escape" && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } }}>
        <Link className="arena-brand" href="/academy"><ArenaIcon name="arena" /><span>หอประลองเซียน<small>กลับสำนัก ↗</small></span></Link>
        <button ref={menuButton} type="button" className="arena-menu-toggle" aria-expanded={menuOpen} aria-controls="arena-navigation" onClick={() => setMenuOpen(!menuOpen)}>เมนู {menuOpen ? "−" : "+"}</button>
        <nav id="arena-navigation" className={`arena-navigation${menuOpen ? " is-open" : ""}`} aria-label="เมนูหอประลอง">{arenaDestinations.map(([key, href, label]) => <Link key={key} href={href} aria-current={current === key ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}{key === "friends" && unread > 0 && <span className="arena-nav-badge" aria-label={`มีรายการรอตอบ ${unread} รายการ`}>{unread}</span>}</Link>)}</nav>
        {player && <Link href="/arena/profile" className={`arena-player-chip${eq.profileNameplate ? " has-nameplate" : ""}`} style={eq.profileNameplate ? ({ "--nameplate": `url("${eq.profileNameplate.asset}")` } as React.CSSProperties) : undefined} title={`เปิดโปรไฟล์ของ ${player.name}`} aria-label={`เปิดโปรไฟล์ของ ${player.name}`}>
          <span className="chip-avatar"><ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} size={46} />{eq.profileCompanion && <Image className="chip-pet" src={eq.profileCompanion.asset} alt="" width={28} height={28} />}{rank && rankState!=="stale" && <span className="chip-rank"><RankBadge tier={rank.tier} size={20} decorative /></span>}</span>
          <span className="chip-text"><small className="chip-label">โปรไฟล์</small><strong>{player.name}</strong>
            <small className="chip-status"><i className={`chip-dot is-${connection ?? "connecting"}`} aria-hidden="true" />{connection==="connected"?"ออนไลน์":connection==="disconnected"?"ขาดการเชื่อมต่อ":"กำลังเชื่อมต่อ"} · {rankState==="stale"?"อันดับยังโหลดไม่ได้":rankState==="loading"?"กำลังโหลด":rank?`${rank.tier} ${rank.score}`:"ยังไม่จัดอันดับ"}</small></span>
        </Link>}
      </header>}
      {children}
      {!admin && <footer className="arena-footer"><span>etcstream · ฝึกวิชา ประลองด้วยความเข้าใจ</span><Link href="/">กลับหน้าต้อนรับ</Link></footer>}
    </div>
  </main>;
}
/** Full-width panorama art for specific banners (art spans the whole banner, title over a soft left fade). */
const bannerPanoramas: Record<string, string> = { "card-friends": "/assets/arena/banner-friends-panorama.webp" };
export function ArenaBanner({ file, title, children, panorama = false }: { file: string; title: string; children?: React.ReactNode; panorama?: boolean }) {
  const isHub = file === "hero-celestial-gate", wide = panorama ? bannerPanoramas[file] : undefined;
  return <section className={`arena-banner${isHub ? " is-hub" : ""}${wide ? " is-panorama" : ""}`}>{wide ? <Image className="arena-banner-panorama" src={wide} alt="" fill priority sizes="100vw" /> : !isHub && <Image src={arenaAsset(file)} alt="" fill sizes="(max-width: 700px) 55vw, 480px" />}<div><p className="arena-eyebrow">สำนักวิถีแห่งสายสัญญาณ · หอประลอง</p><h1>{title}</h1>{children}</div></section>;
}
export function ArenaEmptyState({ icon = "trophy", title, children, href, action }: { icon?: string; title: string; children?: React.ReactNode; href?: string; action?: string }) {
  return <div className="arena-empty"><ArenaIcon name={icon} /><div><h3>{title}</h3>{children && <p>{children}</p>}{href && <Link className="arena-text-link" href={href}>{action} →</Link>}</div></div>;
}
export function ArenaStatsStrip({ stats }: { stats: Profile["stats"] }) {
  return <dl className="arena-stats">{[["เริ่มรอบ", stats.starts], ["ส่งผลแล้ว", stats.finishes ?? "—"], ["ผลที่ยืนยัน", stats.verified ?? "—"], ["เวลายืนยันสั้นสุดจากด่านที่เคยเล่น", timeText(stats.bestMs)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
export function ArenaFriendCode({ code }: { code: string }) {
  const [message, setMessage] = useState("");
  return <div className="arena-friend-code"><span>รหัสสหาย <code>{code || "ยังไม่มีรหัส"}</code></span><button type="button" disabled={!code} className="arena-button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(code); setMessage("คัดลอกรหัสแล้ว"); } catch { setMessage("คัดลอกไม่ได้ กรุณาเลือกรหัสแล้วคัดลอกด้วยตนเอง"); } }}>คัดลอก</button><span role="status" className="arena-note">{message}</span></div>;
}
export function ArenaConfirmDialog({ open, title, children, busy = false, onCancel, onConfirm }: { open: boolean; title: string; children: React.ReactNode; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  const labelId = useId();
  const descriptionId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancel.current?.focus();
    return () => previous?.focus();
  }, [open]);
  useEffect(() => { if (open && busy) dialog.current?.focus(); }, [open, busy]);
  if (!open) return null;
  return <div className="arena-modal" onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
    <div ref={dialog} tabIndex={-1} className="arena-panel arena-confirm" role="dialog" aria-modal="true" aria-labelledby={labelId} aria-describedby={descriptionId} aria-busy={busy} onKeyDown={(e) => {
      if (e.key === "Escape" && !busy) { e.preventDefault(); onCancel(); }
      if (e.key !== "Tab") return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!buttons?.length) { e.preventDefault(); return; }
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}><h2 id={labelId}>{title}</h2><p id={descriptionId}>{children}</p><div className="arena-actions"><button ref={cancel} type="button" disabled={busy} className="arena-button-secondary" onClick={onCancel}>กลับไปก่อน</button><button type="button" className="arena-button-danger" disabled={busy} onClick={onConfirm}>{busy ? "กำลังดำเนินการ…" : "ยืนยัน"}</button></div></div>
  </div>;
}
