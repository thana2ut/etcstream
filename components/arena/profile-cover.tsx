"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "./client-api";
import { DEFAULT_COVER_LABEL } from "@/game/content/economy-catalog";

/**
 * Large profile card with the equipped 3:1 cover as its background art (never cropped: the card keeps 3:1 on wide
 * screens; narrower screens show the art as a full-width 3:1 banner above the content). Missing/broken cover =
 * the free default navy card. Content sits on a translucent panel so text stays readable.
 */
export function ProfileCover({ cover, className = "", bodyClassName = "", tools, children }: { cover?: string | null; className?: string; bodyClassName?: string; tools?: React.ReactNode; children: React.ReactNode }) {
  const [broken, setBroken] = useState<string | null>(null);
  const art = cover && cover !== broken ? cover : null;
  return <div className={`profile-cover${art ? " has-cover" : ""} ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- original 2172x724 PNG must render uncropped at native ratio */}
    {art && <img className="profile-cover-art" src={art} alt="" width={2172} height={724} decoding="async" onError={() => setBroken(art)} />}
    <div className={`profile-cover-body ${bodyClassName}`}>{children}</div>
    {tools && <div className="profile-cover-tools">{tools}</div>}
  </div>;
}

type Owned = { sku: string; name: string; asset: string; equipped: boolean };
/** Owner-only cover switcher: free default + covers the player actually owns (server checks ownership on equip). */
export function ChangeCoverButton({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false), [items, setItems] = useState<Owned[] | null>(null), [pick, setPick] = useState<string | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null), opener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    api<{ items: (Owned & { slot: string; owned: boolean })[] }>("market").then((r) => {
      const owned = r.items.filter((i) => i.slot === "profileCover" && i.owned);
      setItems(owned); setPick(owned.find((i) => i.equipped)?.sku ?? "");
    }).catch((e) => setError((e as Error).message));
    dialog.current?.focus();
    const back = opener.current;
    return () => back?.focus();
  }, [open]);
  const confirm = async () => {
    if (pick === null || busy) return; setBusy(true); setError("");
    try { await api(pick ? "economy/equip" : "economy/unequip", pick ? { sku: pick } : { slot: "profileCover" }); setOpen(false); onChanged(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const preview = items?.find((i) => i.sku === pick)?.asset;
  return <>
    <button ref={opener} type="button" className="profile-cover-change" onClick={() => setOpen(true)}>เปลี่ยนปก</button>
    {open && <div className="arena-modal" onClick={(e) => { if (e.target === e.currentTarget && !busy) setOpen(false); }}>
      <div ref={dialog} tabIndex={-1} className="arena-panel cover-picker" role="dialog" aria-modal="true" aria-labelledby="cover-picker-title" onKeyDown={(e) => { if (e.key === "Escape" && !busy) setOpen(false); }}>
        <h2 id="cover-picker-title">เปลี่ยนปกโปรไฟล์</h2>
        <div className={`cover-picker-preview${preview ? "" : " is-default"}`}>{/* eslint-disable-next-line @next/next/no-img-element */}{preview ? <img src={preview} alt="" /> : <span>{DEFAULT_COVER_LABEL}</span>}</div>
        {error && <p className="arena-error" role="alert">{error}</p>}
        {items === null && !error ? <p role="status">กำลังโหลดปกที่เจ้ามี…</p> : <ul className="cover-picker-list">
          <li><button type="button" aria-pressed={pick === ""} onClick={() => setPick("")}><span className="cover-thumb is-default" /><span>{DEFAULT_COVER_LABEL}</span></button></li>
          {items?.map((i) => <li key={i.sku}><button type="button" aria-pressed={pick === i.sku} onClick={() => setPick(i.sku)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="cover-thumb" src={i.asset} alt="" loading="lazy" /><span>{i.name}{i.equipped ? " · กำลังใช้งาน" : ""}</span></button></li>)}
        </ul>}
        {items?.length === 0 && <p className="arena-note">ยังไม่มีปกที่ซื้อไว้ <Link href="/arena/market">ไปเลือกซื้อในตลาดสวรรค์ →</Link></p>}
        <div className="arena-actions"><button type="button" className="arena-button-secondary" disabled={busy} onClick={() => setOpen(false)}>ยกเลิก</button><button type="button" disabled={busy || pick === null} onClick={() => void confirm()}>{busy ? "กำลังบันทึก…" : "ใช้ปกนี้"}</button></div>
        <Link className="arena-text-link" href="/arena/market">ซื้อปกเพิ่มในตลาดสวรรค์ →</Link>
      </div>
    </div>}
  </>;
}
