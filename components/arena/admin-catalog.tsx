"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./client-api";
import { ADMIN_PAGE_SIZE, AdminPagination } from "./admin-pagination";
import { SLOT_LABELS, stones } from "@/game/content/economy-catalog";

type Status = "draft" | "published" | "unpublished" | "archived";
type Item = { sku: string; name: string; description: string | null; slot: string; rarity: string | null; price: number; asset: string; sort: number; status: Status; legacy: boolean; starter: boolean; created: number; updated: number; purchases: number; owners: number };
type Draft = { sku: string; name: string; description: string; slot: string; rarity: string; price: string; sort: string; asset: string };

const STATUS: Record<Status, string> = { draft: "แบบร่าง", published: "เปิดขาย", unpublished: "ซ่อน", archived: "ยุติการขาย" };
const SLOTS = Object.keys(SLOT_LABELS).filter((s) => s !== "portraitOutfit");
const PAGE = ADMIN_PAGE_SIZE;
const empty: Draft = { sku: "", name: "", description: "", slot: "profileAvatar", rarity: "", price: "100", sort: "900", asset: "" };
const toDraft = (i: Item): Draft => ({ sku: i.sku, name: i.name, description: i.description ?? "", slot: i.slot, rarity: i.rarity ?? "", price: String(i.price), sort: String(i.sort), asset: i.asset });

/** V27 live marketplace CMS: create/edit/upload/publish without a redeploy. Never deletes rows or touches ownership. */
export function CatalogManager() {
  const [items, setItems] = useState<Item[] | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [q, setQ] = useState(""), [slot, setSlot] = useState("all"), [status, setStatus] = useState("all"), [order, setOrder] = useState("updated"), [pageIndex, setPage] = useState(0);
  const [form, setForm] = useState<Draft | null>(null), [origin, setOrigin] = useState(""), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const load = useCallback(async () => {
    setError("");
    try { setItems((await api<{ items: Item[] }>("catalog/list", undefined, true)).items); } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  const dirty = form !== null && JSON.stringify(form) !== origin;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const open = (d: Draft) => { if (dirty && !confirm("มีการแก้ไขที่ยังไม่บันทึก ต้องการทิ้งหรือไม่?")) return; setForm(d); setOrigin(JSON.stringify(d)); setNotice(""); setError(""); };
  const close = () => { if (dirty && !confirm("มีการแก้ไขที่ยังไม่บันทึก ต้องการทิ้งหรือไม่?")) return; setForm(null); };
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const rows = (items ?? []).filter((i) => (slot === "all" || i.slot === slot) && (status === "all" || i.status === status) && (!term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term)));
    const by: Record<string, (a: Item, b: Item) => number> = { updated: (a, b) => b.updated - a.updated, price: (a, b) => a.price - b.price, sort: (a, b) => a.sort - b.sort, purchases: (a, b) => b.purchases - a.purchases, name: (a, b) => a.name.localeCompare(b.name, "th") };
    return rows.sort(by[order]);
  }, [items, q, slot, status, order]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE)), page = Math.min(pageIndex, pages - 1), shown = list.slice(page * PAGE, page * PAGE + PAGE);
  const current = form?.sku ? items?.find((i) => i.sku === form.sku) : undefined;
  const locked = !!current && (current.legacy || current.starter);

  async function upload(file: File) {
    if (uploading) return;
    if (file.size > 4 * 1024 * 1024) { setError("ไฟล์ใหญ่เกิน 4 MB"); return; }
    setUploading(true); setError("");
    try {
      const body = new FormData(); body.append("file", file);
      const r = await fetch("/api/admin/catalog/upload", { method: "POST", credentials: "same-origin", body });
      const v = await r.json().catch(() => ({}));
      if (r.status === 401) window.dispatchEvent(new Event("etc-admin-session-lost"));
      if (!r.ok) throw new Error(v.error || "อัปโหลดไม่สำเร็จ");
      setForm((f) => f && { ...f, asset: v.url }); setNotice(`อัปโหลดรูปแล้ว (${v.width}×${v.height})`);
    } catch (e) { setError((e as Error).message); } finally { setUploading(false); }
  }
  async function save(next: Status) {
    if (!form || busy || locked) return;
    if (next === "published" && !confirm(`เปิดขาย “${form.name}” ราคา ${stones(Number(form.price))} หินวิญญาณ ให้ผู้เล่นทุกคนเห็นทันที?`)) return;
    setBusy(true); setError("");
    try {
      const r = await api<{ sku: string; status: Status }>("catalog/save", { ...form, price: Number(form.price), sort: Number(form.sort), status: next }, true);
      const saved = { ...form, sku: r.sku }; setForm(saved); setOrigin(JSON.stringify(saved));
      setNotice(`บันทึกแล้ว · ${r.sku} · ${STATUS[r.status]}`); await load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function setItemStatus(item: Item, next: Status) {
    if (busy) return;
    let reason = "";
    if (next === "unpublished" || next === "archived") {
      reason = prompt(`เหตุผลที่${next === "archived" ? "ยุติการขาย" : "ซ่อน"} “${item.name}” (อย่างน้อย 5 ตัวอักษร) — ผู้ที่ซื้อแล้วยังคงเป็นเจ้าของ`)?.trim() ?? "";
      if (!reason) return;
    } else if (!confirm(`เปลี่ยน “${item.name}” เป็น “${STATUS[next]}”?`)) return;
    setBusy(true); setError("");
    try { await api("catalog/status", { sku: item.sku, status: next, reason }, true); setNotice(`${item.name} → ${STATUS[next]}`); await load(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const duplicate = (i: Item) => open({ ...toDraft(i), sku: "", name: `${i.name} (สำเนา)`.slice(0, 60) });

  return <div className="admin-market">
    <div className="admin-market-bar">
      <input type="search" placeholder="ค้นหาชื่อหรือรหัสสินค้า" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label="ค้นหาสินค้า" />
      <select value={slot} onChange={(e) => { setSlot(e.target.value); setPage(0); }} aria-label="หมวดหมู่"><option value="all">ทุกหมวด</option>{Object.entries(SLOT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="สถานะ"><option value="all">ทุกสถานะ</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <select value={order} onChange={(e) => setOrder(e.target.value)} aria-label="เรียงตาม"><option value="updated">แก้ไขล่าสุด</option><option value="sort">ลำดับร้าน</option><option value="price">ราคา</option><option value="purchases">ยอดขาย</option><option value="name">ชื่อ</option></select>
      <button type="button" onClick={() => open({ ...empty })}>+ เพิ่มสินค้า</button>
      <button type="button" className="arena-button-secondary" onClick={() => void load()}>โหลดข้อมูลใหม่</button>
    </div>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {notice && <p className="arena-note" role="status">{notice}</p>}
    {form && <section className="arena-panel admin-market-form" aria-label="แก้ไขสินค้า">
      <h3>{form.sku ? `แก้ไข ${form.sku}` : "สินค้าใหม่"}{current && <small> · {STATUS[current.status]} · ซื้อแล้ว {current.purchases} · ผู้ครอบครอง {current.owners}</small>}</h3>
      {locked && <p className="arena-note">สินค้ารุ่นก่อน/ของเริ่มต้นฟรี — ดูได้อย่างเดียว ใช้ “ทำสำเนา” เพื่อสร้างสินค้าใหม่</p>}
      <div className="admin-market-edit">
        <fieldset disabled={locked || busy}>
          <label>ชื่อสินค้า (2–60 ตัวอักษร)<input value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>คำอธิบาย (ไม่เกิน 500 ตัวอักษร)<textarea value={form.description} maxLength={500} rows={3} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>หมวดหมู่<select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>{SLOTS.map((s) => <option key={s} value={s}>{SLOT_LABELS[s as keyof typeof SLOT_LABELS]}</option>)}</select></label>
          <label>ความหายาก<input value={form.rarity} maxLength={30} placeholder="เช่น หายาก, ตำนาน" onChange={(e) => setForm({ ...form, rarity: e.target.value })} /></label>
          <label>ราคา (หินวิญญาณ)<input type="number" min={1} max={1000000} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label>ลำดับในร้าน<input type="number" step={1} value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} /></label>
          <label>รูปสินค้า (PNG/JPEG/WebP/GIF ≤ 4 MB)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} /></label>
          {uploading && <p role="status">กำลังอัปโหลด…</p>}
        </fieldset>
        <div className="admin-market-preview" aria-label="การแสดงผลในร้าน">
          <div className="admin-market-card">{form.asset && <img src={form.asset} alt="" />}<strong>{form.name}</strong><small>{SLOT_LABELS[form.slot as keyof typeof SLOT_LABELS]}{form.rarity && ` · ${form.rarity}`}</small><em>{stones(Number(form.price) || 0)} หินวิญญาณ</em></div>
          {form.description && <p>{form.description}</p>}
        </div>
      </div>
      <div className="admin-market-actions">
        {!locked && <>
          <button type="button" disabled={busy || uploading} onClick={() => void save(current?.status === "published" ? "published" : "draft")}>{busy ? "กำลังบันทึก…" : current?.status === "published" ? "บันทึกการแก้ไข (ยังเปิดขาย)" : "บันทึกแบบร่าง"}</button>
          {current?.status !== "published" && <button type="button" disabled={busy || uploading || !form.asset} onClick={() => void save("published")}>บันทึกและเปิดขาย</button>}
        </>}
        <button type="button" className="arena-button-secondary" onClick={close}>{dirty ? "ยกเลิกการแก้ไข" : "ปิด"}</button>
        {dirty && <span className="arena-note">มีการแก้ไขที่ยังไม่บันทึก</span>}
      </div>
    </section>}
    {!items ? <p role="status">{error ? "" : "กำลังโหลดสินค้า…"}</p> : <>
      <p className="arena-note">ทั้งหมด {list.length} รายการ · เปิดขาย {items.filter((i) => i.status === "published").length}</p>
      <div className="admin-market-table" role="list" aria-label="รายการสินค้า">
        {shown.map((i) => <div key={i.sku} role="listitem" className={`admin-market-row is-${i.status}`}>
          <img src={i.asset} alt="" loading="lazy" />
          <div><strong>{i.name}</strong><small>{i.sku} · {SLOT_LABELS[i.slot as keyof typeof SLOT_LABELS] ?? i.slot}{i.rarity && ` · ${i.rarity}`}</small></div>
          <span>{stones(i.price)}</span>
          <span className="admin-market-status">{STATUS[i.status]}{i.starter ? " · เริ่มต้น" : i.legacy ? " · รุ่นก่อน" : ""}</span>
          <small>ขาย {i.purchases} · ครอง {i.owners} · ลำดับ {i.sort}<br />{new Date(i.updated).toLocaleString("th-TH")}</small>
          <div className="admin-market-row-actions">
            <button type="button" onClick={() => open(toDraft(i))}>{i.legacy || i.starter ? "ดู" : "แก้ไข"}</button>
            <button type="button" onClick={() => duplicate(i)}>ทำสำเนา</button>
            {!i.legacy && !i.starter && i.status !== "published" && <button type="button" disabled={busy} onClick={() => void setItemStatus(i, "published")}>เปิดขาย</button>}
            {i.status === "published" && <button type="button" disabled={busy} onClick={() => void setItemStatus(i, "unpublished")}>ซ่อน</button>}
            {i.status !== "archived" && !i.starter && <button type="button" disabled={busy} onClick={() => void setItemStatus(i, "archived")}>ยุติการขาย</button>}
          </div>
        </div>)}
      </div>
      <AdminPagination page={page} totalPages={pages} totalItems={list.length} onPage={setPage} hasNext={page < pages - 1} busy={busy} />
    </>}
  </div>;
}
