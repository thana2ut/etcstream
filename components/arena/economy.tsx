"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api, type AttemptView } from "./client-api";
import { ArenaEmptyState } from "./shell";
import { useArenaResource } from "./use-arena-resource";
import { COSMETIC_SLOTS, ECONOMY_ASSETS, MARKET_SLOTS, STARTER_LABELS, MEDAL_LABELS, SLOT_CONTEXT, SLOT_LABELS, stones, type CosmeticSlot, type Medal, BANNER_SLOTS, DEFAULT_NAMEPLATE_LABEL } from "@/game/content/economy-catalog";
import { ProfileAvatar } from "./profile-avatar";
import { NameplatePill, ProfileCover } from "./profile-cover";

export type EconomyItem = { sku: string; name: string; slot: CosmeticSlot; price: number; asset: string; enabled: boolean; legacy?: boolean; starter?: boolean; rarity?: string | null; description?: string | null; owned: boolean; equipped: boolean };
export type EconomySummary = { balance: number; earned: number; spent: number; equipped: Partial<Record<CosmeticSlot, EconomyItem>>; ownedCount: number; claims: number };
type Receipt = { entries: { kind: "first_clear" | "medal" | "daily"; amount: number; meta: { stage?: string; tier?: Medal; level?: number; day?: string } }[]; balance: number };

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Data-saver users also get the static fallback.
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const update = () => setReduced(query.matches || saver);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
/** Animated GIF accent with a static PNG fallback (reduced motion, data saver, or load failure). */
function Accent({ gif, still, size, className }: { gif: string; still: string; size: number; className?: string }) {
  const reduced = useReducedMotion(), [failed, setFailed] = useState(false);
  return <Image className={className} src={reduced || failed ? still : gif} alt="" width={size} height={size} unoptimized onError={() => setFailed(true)} />;
}

export function SpiritStones({ amount, size = 22 }: { amount: number; size?: number }) {
  return <span className="econ-stones"><Image src={ECONOMY_ASSETS.spiritStone} alt="หินวิญญาณ" width={size} height={size} /><strong>{stones(amount)}</strong></span>;
}
/** Wallet line for the hub. Reads the server wallet; never increments locally. */
export function WalletBadge({ summary, state }: { summary?: EconomySummary; state: "loading" | "error" | "ready" }) {
  return <div className="econ-wallet" aria-live="polite">
    <Image className="econ-wallet-stone" src={ECONOMY_ASSETS.spiritStone} alt="" width={56} height={56} />
    <div><span className="arena-eyebrow">หินวิญญาณในคลัง</span>
      {state === "ready" && summary ? <strong>{stones(summary.balance)} <small>ก้อน</small></strong> : <strong className="econ-muted">{state === "loading" ? "กำลังเปิดคลัง…" : "ยังโหลดยอดไม่ได้"}</strong>}
    </div>
  </div>;
}

/** Portrait card: real equipped avatar (clipped circle) + frame overlay, sword and companion beside it. */
export function CharacterCard({ name, equipped, compact = false }: { name: string; equipped: Partial<Record<CosmeticSlot, EconomyItem>>; compact?: boolean }) {
  const avatar = equipped.profileAvatar ?? equipped.portraitOutfit, frame = equipped.profileFrame, pet = equipped.profileCompanion, sword = equipped.swordSkin;
  return <figure className={`econ-character${compact ? " is-compact" : ""}`} aria-label={`รูปลักษณ์ของ ${name}`}>
    <ProfileAvatar avatar={avatar?.asset} frame={frame?.asset} name={name} size={compact ? 116 : 176} />
    {sword && <Image className="econ-sword" src={sword.asset} alt={sword.name} width={compact ? 56 : 88} height={compact ? 56 : 88} />}
    {pet && <Image className="econ-pet" src={pet.asset} alt={pet.name} width={compact ? 56 : 92} height={compact ? 56 : 92} />}
    {!compact && <figcaption>{[avatar?.name, frame?.name, sword?.name, pet?.name].filter(Boolean).join(" · ") || "ยังไม่ได้สวมใส่ของสะสม"}</figcaption>}
  </figure>;
}

/** The signed-in player's live look (equipped avatar + frame, companion beside it); refreshes after purchase/equip. */
export function MyIdentityArt({ name, size = 72 }: { name: string; size?: number }) {
  const summary = useEconomySummary(true), eq = summary.data?.equipped ?? {};
  const pet = eq.profileCompanion;
  return <span className="my-identity-art" style={{ paddingRight: pet ? Math.round(size * 0.42) : 0 }}>
    <ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} name={name} size={size} />
    {pet && <Image className="my-identity-pet" src={pet.asset} alt={pet.name} width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} />}
  </span>;
}

export function useEconomySummary(enabled: boolean) {
  return useArenaResource<EconomySummary>(enabled ? "economy" : null, 30000);
}

/** Hub summary: wallet + appearance + two gateways. */
export function EconomyHubPanel({ name }: { name: string }) {
  const summary = useEconomySummary(true);
  return <section className="arena-panel econ-hub" aria-label="หินวิญญาณและของสะสม">
    <CharacterCard name={name} equipped={summary.data?.equipped || {}} compact />
    <WalletBadge summary={summary.data} state={summary.loading ? "loading" : summary.error && !summary.data ? "error" : "ready"} />
    <div className="econ-gateways">
      <Link className="arena-action" href="/arena/market">ตลาดสวรรค์ →</Link>
      <Link className="arena-action econ-secondary" href="/arena/bag">ถุงเฉียนคุน{summary.data ? ` · ${summary.data.ownedCount} ชิ้น` : ""}</Link>
    </div>
    <p className="arena-note econ-rule">หินวิญญาณได้จากผลรอบที่เซิร์ฟเวอร์ยืนยันแล้วเท่านั้น · ของในตลาดเป็นเครื่องตกแต่ง ไม่เพิ่มความได้เปรียบในการแข่งขัน</p>
  </section>;
}

const categories: (CosmeticSlot | "all")[] = ["all", ...MARKET_SLOTS];
type PurchaseReceipt = { sku: string; name: string; asset: string; price: number; balance: number; ledgerId: string };
type PurchaseResult = { status: string; retry: boolean; sku: string; price: number; balance: number; ledgerId: string };
export function CelestialMarket() {
  const [data, setData] = useState<{ items: EconomyItem[]; balance: number } | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CosmeticSlot | "all" | "legacy">("all"), [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
  const pending = useRef(false), purchaseKey = useRef<{ sku: string; key: string } | null>(null);
  const load = useCallback(async () => {
    try { const value = await api<{ items: EconomyItem[]; balance: number }>("market"); setData(value); setError(""); return value; }
    catch (e) { setError((e as Error).message); return null; } finally { setLoading(false); }
  }, []);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  useEconomyChanged(load);
  // Legacy (closed) V19 items appear only for their owners, under their own category.
  const hasLegacy = Boolean(data?.items.some((i) => i.legacy && i.owned));
  const items = useMemo(() => (data?.items || []).filter((i) => !i.starter).filter((i) => category === "all" ? !i.legacy : category === "legacy" ? i.legacy : i.slot === category && !i.legacy), [data, category]);
  const item = items.find((i) => i.sku === selected) || items[0];
  const balance = data?.balance ?? 0;
  const buy = async () => {
    if (!item || pending.current) return; pending.current = true; setBusy(true); setMessage("");
    // One request id per intended purchase: a retry after a lost response is recognised by the server, never charged twice.
    if (purchaseKey.current?.sku !== item.sku) purchaseKey.current = { sku: item.sku, key: crypto.randomUUID() };
    const target = item;
    try {
      const r = await api<PurchaseResult>("market/purchase", { sku: target.sku, idempotencyKey: purchaseKey.current.key });
      purchaseKey.current = null; setConfirming(false);
      setReceipt({ sku: target.sku, name: target.name, asset: target.asset, price: r.price, balance: r.balance, ledgerId: r.ledgerId });
      notifyEconomyChanged(); await load();
    } catch (e) {
      const msg = (e as Error).message; setConfirming(false);
      if (/การเชื่อมต่อขัดข้อง|ตอบกลับไม่ครบ|ยังเชื่อมต่อระบบออนไลน์ไม่ได้/.test(msg)) {
        // Outcome unknown: reconcile from the server; keep the same request id so a manual retry cannot double-charge.
        setMessage("ยังไม่ทราบผลการแลก กำลังตรวจสอบกับเซิร์ฟเวอร์…");
        const fresh = await load(), now = fresh?.items.find((i) => i.sku === target.sku);
        setMessage(now?.owned ? `ตรวจแล้ว: ได้รับ ${target.name} เรียบร้อย ยอดหินวิญญาณเป็นตามเซิร์ฟเวอร์` : "ยังไม่ได้แลก ไม่มีการหักหินวิญญาณ กดแลกอีกครั้งได้อย่างปลอดภัย");
        if (now?.owned) { purchaseKey.current = null; notifyEconomyChanged(); }
      } else {
        purchaseKey.current = null;
        const fresh = await load();
        setMessage(/หินวิญญาณไม่พอ/.test(msg) && fresh ? `หินวิญญาณไม่เพียงพอ · ขาดอีก ${stones(Math.max(0, target.price - fresh.balance))} ก้อน · ไม่มีการหักหินหรือเพิ่มของ` : msg);
      }
    } finally { pending.current = false; setBusy(false); }
  };
  const equip = async (sku: string) => {
    if (pending.current) return; pending.current = true; setBusy(true);
    try { await api("economy/equip", { sku }); setMessage("สวมใส่แล้ว · เปิดโปรไฟล์เพื่อดูภาพลักษณ์ใหม่ได้เลย"); setReceipt(null); notifyEconomyChanged(); await load(); } catch (e) { setMessage((e as Error).message); } finally { pending.current = false; setBusy(false); }
  };
  return <div className="econ-market">
    <div className="econ-market-header" style={{ backgroundImage: `linear-gradient(90deg,#0b1424f2 0%,#0b1424b8 55%,#0b142466 100%),url(${ECONOMY_ASSETS.marketBackdrop})` }}>
      <div><span className="arena-eyebrow">ลานการค้าเหนือเมฆ</span><h2>ตลาดสวรรค์</h2><p>แลกหินวิญญาณที่ได้จากการประลองจริงเป็นเครื่องตกแต่งตัวตน ทุกรายการไม่มีผลต่อเวลา สาย หรือคะแนนอันดับ</p></div>
      <WalletBadge summary={data ? { balance, earned: 0, spent: 0, equipped: {}, ownedCount: 0, claims: 0 } : undefined} state={loading ? "loading" : error && !data ? "error" : "ready"} />
    </div>
    {error && <div className="arena-error" role="alert"><span>{error}</span><button className="arena-button-secondary" onClick={() => void load()}>ลองอีกครั้ง</button></div>}
    <div className="econ-tabs" role="group" aria-label="หมวดสินค้า">{categories.map((c) => <button type="button" key={c} aria-pressed={category === c} onClick={() => { setCategory(c); setSelected(null); }}>{c === "all" ? "ทั้งหมด" : SLOT_LABELS[c]}</button>)}{hasLegacy && <button type="button" aria-pressed={category === "legacy"} onClick={() => { setCategory("legacy"); setSelected(null); }}>ของสะสมรุ่นก่อน</button>}</div>
    <p role="status" aria-live="polite" className="econ-message">{message}</p>
    {loading ? <p className="arena-panel arena-skeleton" role="status">กำลังเปิดแผงสินค้า…</p> : !data || data.items.length === 0 ? <ArenaEmptyState icon="trophy" title="ตลาดยังไม่มีสินค้าเปิดขาย">เมื่อผู้ดูแลเปิดรายการ สินค้าจริงจะแสดงที่นี่</ArenaEmptyState> :
    <div className="econ-market-body">
      <ul className="econ-grid" aria-label="รายการสินค้า">{items.map((i) => <li key={i.sku}><button type="button" className={`econ-item${i.owned ? " is-owned" : ""}`} aria-pressed={item?.sku === i.sku} onClick={() => setSelected(i.sku)}>
        {i.slot === "profileNameplate" ? <Image className="econ-nameplate-thumb" src={i.asset} alt="" width={380} height={67} sizes="380px" loading="lazy" /> : i.slot === "profileCover" ? <Image className="econ-cover-thumb" src={i.asset} alt="" width={360} height={120} sizes="360px" loading="lazy" /> : <Image src={i.asset} alt="" width={120} height={120} sizes="160px" loading="lazy" />}
        <strong>{i.name}</strong><small>{SLOT_LABELS[i.slot]}{i.rarity ? ` · ${i.rarity}` : ""} · {i.sku}</small>
        {i.owned ? <span className="econ-tag">{i.equipped ? "สวมใส่อยู่" : "มีแล้ว"}</span> : <SpiritStones amount={i.price} size={18} />}
      </button></li>)}</ul>
      {item && <aside className="arena-panel econ-detail" aria-label={`รายละเอียด ${item.name}`}>
        {item.slot === "profileNameplate" ? <NameplatePreview plate={item.asset} name={item.name} /> : item.slot === "profileCover" ? <CoverPreview cover={item.asset} name={item.name} /> : <div className="econ-detail-art"><Image src={item.asset} alt={item.name} fill sizes="(max-width:900px) 70vw, 320px" /></div>}
        <span className="arena-eyebrow">{SLOT_LABELS[item.slot]} · {item.sku}</span><h3>{item.name}</h3>
        {item.rarity && <p className="econ-rarity">ระดับ {item.rarity} <small>(ระดับความหายากของภาพ ไม่ใช่ค่าพลัง)</small></p>}{item.description && <p>{item.description}</p>}
        <p className="arena-note">ใช้งานจริงที่: {SLOT_CONTEXT[item.slot]}</p>
        <dl className="econ-price"><div><dt>ราคา</dt><dd><SpiritStones amount={item.price} /></dd></div><div><dt>หินวิญญาณของเจ้า</dt><dd><SpiritStones amount={balance} /></dd></div><div><dt>สต็อก</dt><dd>ไม่จำกัด</dd></div></dl>
        {item.owned ? item.equipped ? <p className="econ-tag econ-owned-state">{item.slot === "profileCover" ? "กำลังใช้งาน" : item.slot === "profileNameplate" || item.slot === "spiritSeal" ? "กำลังใช้" : "สวมใส่อยู่"}</p> : <><p className="econ-tag econ-owned-state">มีแล้ว · อยู่ในถุงเฉียนคุน</p><button disabled={busy} onClick={() => void equip(item.sku)}>{item.slot === "profileCover" ? "ใช้เป็นปกโปรไฟล์" : "สวมใส่"}</button></>
          : <button disabled={busy || !item.enabled || balance < item.price} onClick={() => setConfirming(true)}>{busy ? "กำลังแลก…" : balance < item.price ? `หินวิญญาณไม่เพียงพอ (ขาด ${stones(item.price - balance)})` : "แลกด้วยหินวิญญาณ"}</button>}
        {item.owned && <Link className="arena-text-link" href="/arena/bag">ไปที่ถุงเฉียนคุน →</Link>}
      </aside>}
    </div>}
    {confirming && item && <PurchaseConfirm item={item} balance={balance} busy={busy} onCancel={() => setConfirming(false)} onConfirm={() => void buy()} />}
    {receipt && <PurchaseSuccess receipt={receipt} owned={data?.items.find((i) => i.sku === receipt.sku)} busy={busy} onEquip={() => void equip(receipt.sku)} onClose={() => setReceipt(null)} />}
  </div>;
}

/** Shared modal shell: focus first action, Escape closes (unless busy), focus returns afterwards. */
function EconModal({ label, busy, onClose, children, className }: { label: string; busy?: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; box.current?.querySelector<HTMLElement>("button")?.focus(); return () => previous?.focus(); }, []);
  return <div className="arena-modal econ-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
    <div ref={box} className={`arena-panel econ-modal ${className ?? ""}`} role="dialog" aria-modal="true" aria-label={label} onKeyDown={(e) => {
      if (e.key === "Escape" && !busy) { e.preventDefault(); onClose(); }
      if (e.key !== "Tab") return;
      const f = box.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]"); if (!f?.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }}>{children}</div>
  </div>;
}
function PurchaseConfirm({ item, balance, busy, onCancel, onConfirm }: { item: EconomyItem; balance: number; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <EconModal label={`ยืนยันการแลก ${item.name}`} busy={busy} onClose={onCancel}>
    <div className="econ-modal-art"><Image src={item.asset} alt={item.name} fill sizes="200px" /></div>
    <span className="arena-eyebrow">ยืนยันการแลก · {item.sku}</span><h2>{item.name}</h2>
    <dl className="econ-modal-sums"><div><dt>ราคา</dt><dd><SpiritStones amount={item.price} /></dd></div><div><dt>หินวิญญาณของเจ้า</dt><dd><SpiritStones amount={balance} /></dd></div><div><dt>คงเหลือโดยประมาณ</dt><dd><SpiritStones amount={Math.max(0, balance - item.price)} /></dd></div></dl>
    <p className="arena-note">เซิร์ฟเวอร์ตรวจราคาและยอดอีกครั้งตอนทำรายการ · ของสะสมขายคืนหรือโอนไม่ได้</p>
    <div className="arena-actions"><button type="button" className="arena-button-secondary" disabled={busy} onClick={onCancel}>ยกเลิก</button><button type="button" disabled={busy} onClick={onConfirm}>{busy ? "กำลังแลก…" : "ยืนยันการแลก"}</button></div>
  </EconModal>;
}
function PurchaseSuccess({ receipt, owned, busy, onEquip, onClose }: { receipt: PurchaseReceipt; owned?: EconomyItem; busy: boolean; onEquip: () => void; onClose: () => void }) {
  return <EconModal label={`แลกสำเร็จ ${receipt.name}`} busy={busy} onClose={onClose} className="is-success">
    <div className="econ-modal-art is-glow"><Image src={receipt.asset} alt={receipt.name} fill sizes="200px" /></div>
    <span className="arena-eyebrow">แลกสำเร็จ · บันทึกในสมุดบัญชีแล้ว</span><h2>{receipt.name}</h2>
    <p className="econ-modal-debit">หินวิญญาณ −{stones(receipt.price)}</p>
    <p>คงเหลือ <SpiritStones amount={receipt.balance} /> · เก็บเข้าถุงเฉียนคุนแล้ว</p>
    <p className="arena-note">เลขที่รายการ {receipt.ledgerId.slice(0, 8).toUpperCase()}</p>
    <div className="arena-actions">{owned && !owned.equipped && <button type="button" disabled={busy} onClick={onEquip}>สวมใส่เลย</button>}<Link className="arena-action econ-secondary" href="/arena/bag">ดูในถุงเฉียนคุน</Link><button type="button" className="arena-button-secondary" onClick={onClose}>ปิด</button></div>
  </EconModal>;
}

/** Cross-surface/tab refresh after a confirmed economy change (data always re-read from the server). */
const ECONOMY_EVENT = "etc-economy-changed";
export function notifyEconomyChanged() {
  window.dispatchEvent(new Event(ECONOMY_EVENT));
  try { const c = new BroadcastChannel(ECONOMY_EVENT); c.postMessage(Date.now()); c.close(); } catch {}
}
export function useEconomyChanged(reload: () => unknown) {
  useEffect(() => {
    const run = () => { void reload(); };
    window.addEventListener(ECONOMY_EVENT, run);
    let channel: BroadcastChannel | null = null;
    try { channel = new BroadcastChannel(ECONOMY_EVENT); channel.onmessage = run; } catch {}
    return () => { window.removeEventListener(ECONOMY_EVENT, run); channel?.close(); };
  }, [reload]);
}

export function QiankunBag({ name }: { name: string }) {
  const [data, setData] = useState<{ items: EconomyItem[]; balance: number } | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""); const pending = useRef(false);
  const load = useCallback(async () => {
    try { setData(await api<{ items: EconomyItem[]; balance: number }>("market")); setError(""); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  useEconomyChanged(load);
  const owned = (data?.items || []).filter((i) => i.owned);
  const equipped = Object.fromEntries(owned.filter((i) => i.equipped).map((i) => [i.slot, i])) as Partial<Record<CosmeticSlot, EconomyItem>>;
  const act = async (path: string, body: Record<string, string>, done: string) => {
    if (pending.current) return; pending.current = true; setBusy(true);
    try { await api(path, body); setMessage(done); notifyEconomyChanged(); await load(); } catch (e) { setMessage((e as Error).message); } finally { pending.current = false; setBusy(false); }
  };
  return <div className="econ-bag">
    <div className="arena-split">
      <section className="arena-panel econ-bag-preview"><span className="arena-eyebrow">ภาพตัวตน (ภาพประกอบ ไม่ใช่โมเดล 3 มิติ)</span><h2>{name}</h2><CharacterCard name={name} equipped={equipped} />
        {equipped.residenceDecor && <div className="econ-residence"><Image src={equipped.residenceDecor.asset} alt={equipped.residenceDecor.name} width={220} height={220} /><span>แผงตำหนัก · {equipped.residenceDecor.name}</span></div>}
      </section>
      <section className="arena-panel"><span className="arena-eyebrow">ถุงเฉียนคุน · แยกจากถุงอุปกรณ์และสายสัญญาณ</span><h2>ของสะสมของข้า</h2>
        {data && <p>หินวิญญาณคงเหลือ <SpiritStones amount={data.balance} /></p>}
        <p role="status" aria-live="polite" className="econ-message">{message}</p>
        {loading ? <p className="arena-skeleton" role="status">กำลังเปิดถุง…</p> : error ? <div className="arena-error" role="alert"><span>{error}</span><button className="arena-button-secondary" onClick={() => void load()}>ลองอีกครั้ง</button></div>
          : owned.length === 0 ? <ArenaEmptyState icon="trophy" title="ถุงเฉียนคุนยังว่าง" href="/arena/market" action="ไปตลาดสวรรค์">ของที่แลกจากตลาดจะเก็บไว้ที่นี่ และสวมใส่ได้ทันที</ArenaEmptyState>
          : COSMETIC_SLOTS.map((slot) => { const list = owned.filter((i) => i.slot === slot); if (!list.length) return null;
            return <fieldset key={slot} className="econ-slot"><legend>{SLOT_LABELS[slot]} <small>{SLOT_CONTEXT[slot]}</small></legend>
              {BANNER_SLOTS.includes(slot) && (() => { const free = slot === "profileCover" ? "ปกเริ่มต้น (ฟรี)" : DEFAULT_NAMEPLATE_LABEL; return <p className="econ-cover-default">{list.some((i) => i.equipped) ? <button className="arena-button-secondary" disabled={busy} onClick={() => void act("economy/unequip", { slot }, `กลับไปใช้${free}แล้ว`)}>ใช้{free}</button> : <span className="econ-tag">{free} · กำลังใช้งาน</span>}</p>; })()}
              <ul className={BANNER_SLOTS.includes(slot) ? "econ-cover-list" : undefined}>{list.map((i) => <li key={i.sku} className={i.equipped ? "is-equipped" : undefined}>{slot === "profileNameplate" ? <Image className="econ-nameplate-thumb" src={i.asset} alt="" width={300} height={53} loading="lazy" /> : slot === "profileCover" ? <Image className="econ-cover-thumb" src={i.asset} alt="" width={300} height={100} loading="lazy" /> : <Image src={i.asset} alt="" width={72} height={72} loading="lazy" />}<strong>{i.name}</strong>{i.starter && <small className="econ-starter-note">{STARTER_LABELS.availability}{i.equipped ? ` · ${STARTER_LABELS.equipped}` : ""}</small>}
                {BANNER_SLOTS.includes(slot) ? i.equipped ? <span className="econ-tag">{slot === "profileNameplate" ? "กำลังใช้" : "กำลังใช้งาน"}</span> : <button disabled={busy} onClick={() => void act("economy/equip", { sku: i.sku }, `ใช้${i.name}แล้ว`)}>{slot === "profileNameplate" ? "สวมใส่" : "ใช้เป็นปกโปรไฟล์"}</button>
                  : i.equipped ? <button className="arena-button-secondary" disabled={busy} onClick={() => void act("economy/unequip", { slot }, `ถอด${i.name}แล้ว`)}>ถอดออก</button> : <button disabled={busy} onClick={() => void act("economy/equip", { sku: i.sku }, `สวมใส่${i.name}แล้ว`)}>สวมใส่</button>}</li>)}</ul></fieldset>; })}
      </section>
    </div>
    <LedgerHistory />
  </div>;
}

const kindLabel: Record<string, string> = { first_clear: "ผ่านด่านครั้งแรก", medal: "เหรียญความเร็ว", daily: "ภารกิจประจำวัน", purchase: "แลกของในตลาด", admin_adjust: "ผู้ดูแลปรับยอด" };
function LedgerHistory() {
  const ledger = useArenaResource<{ entries: { id: string; amount: number; kind: string; balanceAfter: number; meta: Record<string, string>; created: number }[] }>("economy/ledger", 60000);
  return <details className="arena-panel econ-ledger"><summary>บันทึกหินวิญญาณ (จากสมุดบัญชีเซิร์ฟเวอร์)</summary>
    {ledger.loading ? <p role="status">กำลังโหลด…</p> : ledger.error && !ledger.data ? <p className="arena-error">{ledger.error}</p> : !ledger.data?.entries.length ? <p>ยังไม่มีรายการ หินวิญญาณจะเข้าเมื่อผลรอบได้รับการยืนยันจากเซิร์ฟเวอร์</p> :
      <div className="arena-table-wrap"><table><thead><tr><th>เวลา</th><th>รายการ</th><th>จำนวน</th><th>คงเหลือ</th><th>เลขที่</th></tr></thead><tbody>{ledger.data.entries.map((e) => <tr key={e.id}><td>{new Date(e.created).toLocaleString("th-TH")}</td><td>{kindLabel[e.kind] || e.kind}{e.meta.stage ? ` · ${e.meta.stage}` : ""}{e.meta.name ? ` · ${e.meta.name}` : ""}</td><td className={e.amount > 0 ? "econ-plus" : "econ-minus"}>{e.amount > 0 ? "+" : ""}{stones(e.amount)}</td><td>{stones(e.balanceAfter)}</td><td><code>{e.id.slice(0, 8).toUpperCase()}</code></td></tr>)}</tbody></table></div>}
  </details>;
}

/** End-of-stage receipt. Only a server VERIFIED run is looked up; amounts come from ledger rows of that run. */
export function RewardReceipt({ attempt }: { attempt: AttemptView }) {
  const verified = attempt.status === "VERIFIED" && !attempt.invalid;
  const receipt = useArenaResource<Receipt>(verified ? `economy/receipt?run=${attempt.id}` : null, 60000);
  if (attempt.status === "UNDER_REVIEW") return <div className="econ-receipt is-pending" role="status"><Image src={ECONOMY_ASSETS.spiritStone} alt="" width={36} height={36} /><div><strong>ผลการแข่งขันกำลังรอตรวจสอบ</strong><p>หินวิญญาณและเหรียญจะมอบให้หลังเซิร์ฟเวอร์ยืนยันผลเท่านั้น</p></div></div>;
  if (!verified) return <p className="arena-note econ-receipt-none">รอบนี้ไม่ได้รับหินวิญญาณ (ได้เฉพาะผลที่เซิร์ฟเวอร์ยืนยันแล้ว)</p>;
  if (receipt.loading) return <p className="econ-receipt" role="status">กำลังอ่านใบรับรางวัลจากสมุดบัญชี…</p>;
  if (receipt.error && !receipt.data) return <p className="arena-error" role="alert">ยังอ่านใบรับรางวัลไม่ได้ · ยอดในคลังไม่สูญหาย ลองเปิดหน้านี้ใหม่ภายหลัง</p>;
  const entries = receipt.data?.entries || [], total = entries.reduce((sum, e) => sum + e.amount, 0);
  if (!entries.length) return <p className="arena-note econ-receipt-none">ด่านนี้รับรางวัลผ่านด่านครั้งแรกและเหรียญระดับนี้ไปแล้ว จึงไม่มีหินวิญญาณเพิ่มในรอบนี้</p>;
  return <section className="econ-receipt is-earned" aria-label="ใบรับรางวัล">
    <Accent className="econ-receipt-art" gif={ECONOMY_ASSETS.rewardAcquired} still={ECONOMY_ASSETS.rewardAcquiredStatic} size={112} />
    <div><span className="arena-eyebrow">ได้รับรางวัลจากผลที่ยืนยันแล้ว</span>
      <ul>{entries.map((e, i) => <li key={i}><span>{e.kind === "first_clear" ? `ผ่านด่านครั้งแรก · ระดับ ${e.meta.level}` : e.kind === "medal" ? `${MEDAL_LABELS[e.meta.tier as Medal] || "เหรียญ"} (ส่วนเพิ่ม)` : "ภารกิจประจำวัน · สามด่านต่างกัน"}</span><SpiritStones amount={e.amount} size={18} /></li>)}</ul>
      <p className="econ-receipt-total">รวม <SpiritStones amount={total} /> · คงเหลือในคลัง <SpiritStones amount={receipt.data!.balance} /></p>
    </div>
  </section>;
}

/** Equipped avatar/frame/companion of accepted friends (privacy: no balances). */
export function useFriendAppearance(enabled: boolean) {
  return useArenaResource<{ friends: Record<string, Partial<Record<"profileAvatar" | "profileFrame" | "profileCompanion", string>>> }>(enabled ? "economy/friends" : null, 60000);
}
export function FriendPortrait({ items, name }: { items?: Partial<Record<"profileAvatar" | "profileFrame" | "profileCompanion", string>>; name?: string }) {
  return <span className="econ-friend-portrait"><ProfileAvatar avatar={items?.profileAvatar} frame={items?.profileFrame} name={name} size={72} />{items?.profileCompanion && <Image src={items.profileCompanion} alt="" width={36} height={36} />}</span>;
}

/** Market preview of a cover: the full 3:1 art plus a mock profile card using the player's real equipped avatar/frame. */
function CoverPreview({ cover, name }: { cover: string; name: string }) {
  const summary = useEconomySummary(true), eq = summary.data?.equipped ?? {};
  return <div className="econ-cover-preview">
    <Image className="econ-cover-thumb" src={cover} alt={name} width={720} height={240} sizes="(max-width:900px) 90vw, 340px" />
    <span className="arena-note">ตัวอย่างบนการ์ดโปรไฟล์ของเจ้า</span>
    <ProfileCover cover={cover} className="econ-cover-mock" bodyClassName="econ-cover-mock-body">
      <ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} size={56} />
      <span><strong>โปรไฟล์ของเจ้า</strong><small>ชื่อ · อันดับ · สถิติ</small></span>
    </ProfileCover>
  </div>;
}

/** Market preview of a nameplate: the full strip plus the header pill as it will look with the real avatar/frame. */
function NameplatePreview({ plate, name }: { plate: string; name: string }) {
  const summary = useEconomySummary(true), eq = summary.data?.equipped ?? {};
  return <div className="econ-cover-preview">
    <Image className="econ-nameplate-thumb" src={plate} alt={name} width={760} height={134} sizes="(max-width:900px) 90vw, 340px" />
    <span className="arena-note">ตัวอย่างแถบโปรไฟล์ด้านบนเกม</span>
    <NameplatePill plate={plate} className="econ-nameplate-mock"><ProfileAvatar avatar={(eq.profileAvatar ?? eq.portraitOutfit)?.asset} frame={eq.profileFrame?.asset} size={40} /><span>โปรไฟล์<small>ชื่อของเจ้า · ออนไลน์</small></span></NameplatePill>
  </div>;
}
