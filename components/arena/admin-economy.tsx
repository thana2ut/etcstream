"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./client-api";
import { ADMIN_PAGE_SIZE, AdminPagination, AdminPagedItems } from "./admin-pagination";
import { CATALOG_SEED, SLOT_LABELS, stones, type CosmeticSlot } from "@/game/content/economy-catalog";

type Overview = { wallets: number; circulating: number; earned: number; spent: number; purchases: number; ledger: number; adjustments: number; medalStages: number; unpaidSeeded: number; suspect: { player: string; total: number; n: number }[] };
type Wallet = { player: string; name: string; friendCode: string; balance: number; earned: number; spent: number; owned: number; updated: number };
type Entry = { id: string; player: string; amount: number; kind: string; source: string; balanceAfter: number; meta: Record<string, unknown>; created: number };
type Config = { catalog: { sku: string; name: string; slot: CosmeticSlot; price: number; enabled: boolean; legacy?: boolean; asset: string }[]; rules: Record<string, number>; medals: { scenario: string; bronze_ms: number; silver_ms: number; gold_ms: number; approved: string }[] };
const tabs = [["overview", "ภาพรวมเศรษฐกิจ"], ["integrity", "ตรวจสินค้าและรูปภาพ"], ["wallets", "คลังผู้ฝึก"], ["ledger", "สมุดบัญชี"], ["config", "ราคา รางวัล และเหรียญ"], ["adjust", "ปรับยอดพร้อมเหตุผล"]] as const;

export function EconomyAdmin() {
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("overview");
  const [loaded, setLoaded] = useState<{ key: string; value: Record<string, unknown> } | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(true), [message, setMessage] = useState("");
  const [player, setPlayer] = useState("");
  const [saving, setSaving] = useState(false);
  const mutationPending = useRef(false);
  const requestId = useRef(0);
  const scope = `${tab}:${tab === "ledger" ? player : ""}`;
  const [paging, setPaging] = useState({ scope, page: 0 });
  const page = paging.scope === scope ? paging.page : 0;
  const dataKey = `${scope}:${page}`;
  const activeKey = useRef(dataKey);
  const rawData = loaded?.key === dataKey ? loaded.value : null;
  const data = rawData ? { ...rawData, wallets: Array.isArray(rawData.wallets) ? rawData.wallets.slice(0, ADMIN_PAGE_SIZE) : rawData.wallets, entries: Array.isArray(rawData.entries) ? rawData.entries.slice(0, ADMIN_PAGE_SIZE) : rawData.entries } : null;
  const hasNext = (Array.isArray(rawData?.wallets) && rawData.wallets.length > ADMIN_PAGE_SIZE) || (Array.isArray(rawData?.entries) && rawData.entries.length > ADMIN_PAGE_SIZE);
  const load = useCallback(async (signal?: AbortSignal) => {
    if (activeKey.current !== dataKey) return;
    const id = ++requestId.current;
    if (tab === "adjust") { setLoading(false); return; }
    setLoading(true);
    try {
      const value = await api<Record<string, unknown>>(`economy/${tab === "integrity" ? "config" : tab}?offset=${page * ADMIN_PAGE_SIZE}${tab === "ledger" && player ? `&player=${encodeURIComponent(player)}` : ""}`, undefined, true, signal);
      if (id === requestId.current && activeKey.current === dataKey && !signal?.aborted) { setLoaded({ key: dataKey, value }); setError(""); }
    } catch (e) { if (id === requestId.current && activeKey.current === dataKey && !signal?.aborted) { setLoaded(null); setError((e as Error).message); } }
    finally { if (id === requestId.current && activeKey.current === dataKey && !signal?.aborted) setLoading(false); }
  }, [tab, player, dataKey, page]);
  useEffect(() => { activeKey.current = dataKey; const controller = new AbortController(); const t = window.setTimeout(() => void load(controller.signal), 0); return () => { activeKey.current = ""; clearTimeout(t); controller.abort(); }; }, [load, dataKey]);
  const mutate = async (op: string, body: Record<string, unknown>) => {
    if (mutationPending.current) return false;
    mutationPending.current = true; setSaving(true); setMessage("");
    try { await api(`economy/${op}`, body, true); setMessage("บันทึกแล้ว และลงประวัติการดูแลเรียบร้อย"); await load(); return true; }
    catch (e) { setMessage((e as Error).message); return false; }
    finally { mutationPending.current = false; setSaving(false); }
  };
  return <section className="arena-panel admin-economy"><h2>เศรษฐกิจหินวิญญาณ</h2>
    <p className="arena-note">ตรวจยอดและธุรกรรม ตั้งรางวัล หรือปรับยอดผู้ฝึกพร้อมเหตุผล ทุกการเปลี่ยนแปลงมีประวัติการดูแล</p>
    <nav className="admin-subnav" aria-label="ส่วนเศรษฐกิจ">{tabs.map(([k, l]) => <button key={k} aria-pressed={tab === k} onClick={() => { setTab(k); setMessage(""); }}>{l}</button>)}</nav>
    <div className="admin-panel-toolbar"><span className="arena-note">{saving ? "กำลังบันทึก…" : "ข้อมูลจากระบบ"}</span><button type="button" disabled={loading || saving} onClick={() => void load()}>โหลดข้อมูลใหม่</button></div>{loading && <p role="status">กำลังโหลดข้อมูลจริง…</p>}{error && <p className="arena-error" role="alert">{error}</p>}<p role="status" aria-live="polite">{message}</p>
    {tab === "overview" && data && <OverviewView o={data as unknown as Overview} />}
    {tab === "wallets" && data && <div className="arena-table-wrap"><table><thead><tr><th>ผู้ฝึก</th><th>คงเหลือ</th><th>ได้รับ/ใช้</th><th>ของสะสม</th><th></th></tr></thead><tbody>{(data.wallets as Wallet[]).map((w) => <tr key={w.player}><td>{w.name || "ผู้ฝึกนิรนาม"}<br /><code>{w.friendCode}</code><small><br />{w.player}</small></td><td>{stones(w.balance)}</td><td>+{stones(w.earned)} / −{stones(w.spent)}</td><td>{w.owned}</td><td><button onClick={() => { setPlayer(w.player); setTab("ledger"); }}>ดูสมุดบัญชี</button></td></tr>)}</tbody></table>{!(data.wallets as Wallet[]).length && <p>ยังไม่มีคลังของผู้ฝึก (ยังไม่มีผลยืนยันจริงที่ได้รับหิน)</p>}</div>}
    {tab === "ledger" && <><form className="arena-form-row" onSubmit={(e) => { e.preventDefault(); void load(); }}><label>กรองรหัสผู้ฝึก (UUID)<input value={player} onChange={(e) => setPlayer(e.target.value.trim())} maxLength={36} /></label><button type="button" onClick={() => setPlayer("")}>ล้างตัวกรอง</button></form>
      {data && <div className="arena-table-wrap"><table><thead><tr><th>เวลา</th><th>ผู้ฝึก</th><th>ประเภท/แหล่ง</th><th>จำนวน</th><th>คงเหลือ</th></tr></thead><tbody>{(data.entries as Entry[]).map((e) => <tr key={e.id}><td>{new Date(e.created).toLocaleString("th-TH")}</td><td><small>{e.player}</small></td><td>{e.kind}<details><summary>รายละเอียดธุรกรรม</summary><p>{e.source}</p><code>{JSON.stringify(e.meta)}</code></details></td><td>{e.amount > 0 ? "+" : ""}{stones(e.amount)}</td><td>{stones(e.balanceAfter)}</td></tr>)}</tbody></table>{!(data.entries as Entry[]).length && <p>ยังไม่มีรายการในสมุดบัญชี</p>}</div>}</>}
    {tab === "config" && data && <fieldset className="admin-mutation-fields" disabled={saving}><legend>ตั้งค่าเศรษฐกิจ</legend><ConfigView c={data as unknown as Config} mutate={mutate} /></fieldset>}
    {tab === "adjust" && <fieldset className="admin-mutation-fields" disabled={saving}><legend>ปรับยอดผู้ฝึก</legend><AdjustForm mutate={mutate} /></fieldset>}
    {tab === "integrity" && data && <IntegrityReport c={data as unknown as Config} />}
    {["wallets", "ledger"].includes(tab) && <AdminPagination page={page} onPage={(next) => setPaging({ scope, page: next })} hasNext={hasNext} busy={loading || !data || Boolean(error)} />}
  </section>;
}
function OverviewView({ o }: { o: Overview }) {
  const m: [string, string][] = [["คลังที่มีรายการ", stones(o.wallets)], ["หินหมุนเวียน", stones(o.circulating)], ["ออกจากรางวัล/ปรับยอด", stones(o.earned)], ["ใช้ในตลาด", stones(o.spent)], ["ของที่ขายแล้ว", stones(o.purchases)], ["รายการในสมุดบัญชี", stones(o.ledger)], ["การปรับยอดโดยผู้ดูแล", stones(o.adjustments)], ["ด่านที่ตั้งเวลาเหรียญ", `${o.medalStages} / 25`]];
  return <><dl className="admin-kpi-grid admin-economy-metrics">{m.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>
    <p className="arena-note">รอบที่ยังไม่มีหลักฐานผ่านการรับรองสำหรับมอบหินวิญญาณ: {stones(o.unpaidSeeded)} รอบ</p>
    <h3>รายการที่ควรตรวจ (ได้รับเกิน 1,500 ก้อนใน 24 ชั่วโมง)</h3>{o.suspect.length ? <AdminPagedItems items={o.suspect}>{(rows) => <ul>{rows.map((s) => <li key={s.player}><code>{s.player}</code> · +{stones(s.total)} ({s.n} รายการ)</li>)}</ul>}</AdminPagedItems> : <p>ไม่พบรายการผิดปกติ</p>}</>;
}
function ConfigView({ c, mutate }: { c: Config; mutate: (op: string, body: Record<string, unknown>) => Promise<boolean> }) {
  const [section, setSection] = useState("rewards");
  const [reason, setReason] = useState(""), [prices, setPrices] = useState<Record<string, number>>({}), [rules, setRules] = useState<Record<string, number>>({});
  const [medal, setMedal] = useState({ scenario: "xs-1", gold: "", silver: "", bronze: "" });
  const sec = (v: string) => Math.round(Number(v) * 1000);
  return <>
    <nav className="admin-subnav" aria-label="เลือกการตั้งค่าเศรษฐกิจ">{[["rewards", "รางวัล"], ["medals", "เกณฑ์เหรียญ"], ["prices", "ราคาสินค้า"]].map(([id, label]) => <button type="button" key={id} aria-pressed={section === id} onClick={() => setSection(id)}>{label}</button>)}</nav>
    <label className="admin-reason">เหตุผลของการแก้ไขครั้งนี้ (บังคับ)<input value={reason} minLength={5} maxLength={500} onChange={(e) => setReason(e.target.value)} /></label>
    {section === "rewards" && <>
    <h3>รางวัลจากผลยืนยัน</h3><AdminPagedItems items={Object.entries(c.rules).sort()}>{(rows) => <div className="arena-table-wrap"><table><tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td><input type="number" min={0} max={100000} value={rules[k] ?? v} onChange={(e) => setRules({ ...rules, [k]: Number(e.target.value) })} /></td><td><button disabled={reason.trim().length < 5 || (rules[k] ?? v) === v} onClick={() => void mutate("rule", { key: k, amount: rules[k], reason })}>บันทึก</button></td></tr>)}</tbody></table></div>}</AdminPagedItems>
    </>}
    {section === "medals" && <>
    <h3>เวลาเหรียญรายด่าน (อนุมัติโดยเจ้าของ)</h3><p className="arena-note">ไม่มีเกณฑ์ = ไม่มีโบนัสเหรียญ · ผูกกับเวอร์ชันด่านปัจจุบัน · ผลที่ยืนยันก่อนตั้งเกณฑ์จะไม่ได้รับย้อนหลัง</p>
    <AdminPagedItems items={c.medals}>{(rows) => <ul>{rows.map((m) => <li key={m.scenario}>{m.scenario}: ทอง ≤ {m.gold_ms / 1000}s · เงิน ≤ {m.silver_ms / 1000}s · ทองแดง ≤ {m.bronze_ms / 1000}s <button disabled={reason.trim().length < 5} onClick={() => void mutate("medal-clear", { scenario: m.scenario, reason })}>ยกเลิกเกณฑ์</button></li>)}</ul>}</AdminPagedItems>
    <form className="arena-form-row" onSubmit={(e) => { e.preventDefault(); void mutate("medal", { scenario: medal.scenario, goldMs: sec(medal.gold), silverMs: sec(medal.silver), bronzeMs: sec(medal.bronze), reason }); }}>
      <label>ด่าน<select value={medal.scenario} onChange={(e) => setMedal({ ...medal, scenario: e.target.value })}>{["xs", "s", "m", "l", "xl"].flatMap((v) => [1, 2, 3, 4, 5].map((n) => `${v}-${n}`)).map((id) => <option key={id}>{id}</option>)}</select></label>
      {(["gold", "silver", "bronze"] as const).map((k) => <label key={k}>{k === "gold" ? "ทอง" : k === "silver" ? "เงิน" : "ทองแดง"} (วินาที)<input type="number" min={1} step="0.1" required value={medal[k]} onChange={(e) => setMedal({ ...medal, [k]: e.target.value })} /></label>)}
      <button disabled={reason.trim().length < 5}>บันทึกเกณฑ์เหรียญ</button></form>
    </>}
    {section === "prices" && <>
    <h3>ราคาและการเปิดขาย</h3><AdminPagedItems items={c.catalog}>{(rows) => <div className="arena-table-wrap"><table><thead><tr><th>สินค้า</th><th>หมวด</th><th>ราคา</th><th>เปิดขาย</th></tr></thead><tbody>{rows.map((i) => <tr key={i.sku}><td>{i.name}<br /><small>{i.sku}</small></td><td>{SLOT_LABELS[i.slot]}</td><td><input type="number" min={1} max={1000000} value={prices[i.sku] ?? i.price} onChange={(e) => setPrices({ ...prices, [i.sku]: Number(e.target.value) })} /><button disabled={reason.trim().length < 5 || (prices[i.sku] ?? i.price) === i.price} onClick={() => void mutate("catalog", { sku: i.sku, price: prices[i.sku], reason })}>บันทึกราคา</button></td><td><button disabled={reason.trim().length < 5} onClick={() => void mutate("catalog", { sku: i.sku, enabled: !i.enabled, reason })}>{i.enabled ? "ปิดขาย" : "เปิดขาย"}</button></td></tr>)}</tbody></table></div>}</AdminPagedItems>
    </>}
  </>;
}
function AdjustForm({ mutate }: { mutate: (op: string, body: Record<string, unknown>) => Promise<boolean> }) {
  const [f, setF] = useState({ player: "", confirm: "", amount: "", reason: "" }), [key, setKey] = useState(() => crypto.randomUUID());
  return <form onSubmit={async (e) => { e.preventDefault(); if (await mutate("adjust", { player: f.player, confirm: f.confirm, amount: Math.trunc(Number(f.amount)), reason: f.reason, idempotencyKey: key })) { setF({ player: "", confirm: "", amount: "", reason: "" }); setKey(crypto.randomUUID()); } }}>
    <p className="arena-note">ใช้แก้ไขกรณีผิดพลาดเท่านั้น · เพิ่มเป็นรายการใหม่ในสมุดบัญชี ไม่แก้รายการเดิม · ยอดติดลบไม่ได้ · ส่งซ้ำจะไม่ปรับซ้ำ</p>
    <label>รหัสผู้ฝึก (UUID)<input required value={f.player} onChange={(e) => setF({ ...f, player: e.target.value.trim() })} /></label>
    <label>พิมพ์รหัสผู้ฝึกอีกครั้งเพื่อยืนยัน<input required value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value.trim() })} /></label>
    <label>จำนวน (บวก = เพิ่ม, ลบ = หัก)<input type="number" required min={-100000} max={100000} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
    <label>เหตุผล<input required minLength={5} maxLength={500} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></label>
    <button disabled={!f.player || f.player !== f.confirm || !Number(f.amount) || f.reason.trim().length < 5}>ปรับยอดและบันทึกตรวจสอบ</button>
  </form>;
}

/** Catalog integrity: server catalog vs the SHA-256-checked registries, plus live image reachability. */
function IntegrityReport({ c }: { c: Config }) {
  const [broken, setBroken] = useState<string[] | null>(null);
  useEffect(() => {
    let live = true;
    void Promise.all(c.catalog.map(async (i) => { try { const r = await fetch(i.asset, { method: "HEAD", cache: "no-store" }); return r.ok ? null : i.sku; } catch { return i.sku; } }))
      .then((r) => { if (live) setBroken(r.filter((x): x is string => Boolean(x))); });
    return () => { live = false; };
  }, [c.catalog]);
  const server = new Map(c.catalog.map((i) => [i.sku, i]));
  const mismatches = CATALOG_SEED.flatMap((s) => { const i = server.get(s.sku); if (!i) return [`${s.sku}: ไม่มีในฐานข้อมูล`]; const d = [i.name !== s.name && "ชื่อ", i.slot !== s.slot && "หมวด", i.asset !== s.asset && "ไฟล์ภาพ", i.price !== s.price && `ราคา (ทะเบียน ${s.price} · ปัจจุบัน ${i.price})`].filter(Boolean); return d.length ? [`${s.sku}: ${d.join(", ")}`] : []; });
  const bySlot = CATALOG_SEED.reduce<Record<string, number>>((a, s) => ({ ...a, [s.slot]: (a[s.slot] || 0) + 1 }), {});
  const legacy = c.catalog.filter((i) => i.legacy);
  return <div className="admin-integrity">
    <dl className="admin-kpi-grid">{[["SKU ในทะเบียนตลาด", String(CATALOG_SEED.length)], ["เปิดขายอยู่", String(c.catalog.filter((i) => i.enabled).length)], ["ของรุ่นก่อน (ปิดขาย เก็บสิทธิ์ผู้ซื้อ)", String(legacy.length)], ["ภาพที่โหลดไม่ได้", broken === null ? "กำลังตรวจ…" : String(broken.length)]].map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>
    <p>แยกหมวด: {Object.entries(bySlot).map(([slot, n]) => `${SLOT_LABELS[slot as CosmeticSlot]} ${n}`).join(" · ")}</p>
    <p className="arena-note">ตรวจชื่อ หมวด ราคา และรูปภาพเทียบกับรายการสินค้าอ้างอิง ความแตกต่างของราคาอาจเกิดจากการปรับราคาโดยผู้ดูแล</p>
    <h3>ความต่างจากทะเบียน</h3>{mismatches.length ? <AdminPagedItems items={mismatches}>{(rows) => <ul>{rows.map((m) => <li key={m}>{m}</li>)}</ul>}</AdminPagedItems> : <p>ไม่พบความต่าง ทุก SKU ตรงชื่อ หมวด ภาพ และราคาตามทะเบียน</p>}
    {broken && broken.length > 0 && <><h3>ภาพที่โหลดไม่ได้</h3><AdminPagedItems items={broken}>{(rows) => <ul>{rows.map((sku) => <li key={sku}>{sku}</li>)}</ul>}</AdminPagedItems></>}
  </div>;
}
