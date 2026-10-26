"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArenaIcon } from "./shell";
import { api, timeText, statusText, type AttemptView } from "./client-api";
import { AdminEvidence } from "./admin-evidence";
import { DatabaseAdmin, DemoAdmin, type DatabaseReport, type DemoReport } from "./database-admin";
import {SeasonManager,ReviewManager} from "./admin-seasons";
import type {ComponentProps} from "react";
import { ADMIN_PAGE_SIZE, AdminPagination } from "./admin-pagination";

export const adminSections = ["overview", "database", "demo", "players", "competitions", "leaderboards", "matches", "friends", "settings", "audit", "seasons", "reviews"];
export const adminLabels: Record<string, string> = { database: "ฐานข้อมูลและการตั้งค่า", demo: "รายชื่อประกอบ", overview: "ภาพรวม", players: "จัดการผู้ฝึก", competitions: "รอบแข่งขัน", leaderboards: "ดูแลผลและอันดับ", matches: "ห้องประลอง", friends: "คำขอและการปิดกั้น", missions: "จัดการภารกิจ (25 ด่าน)", settings: "ตั้งค่ากติกา", audit: "ประวัติการดูแล",seasons:"ฤดูกาลและการจัดอันดับ",reviews:"ผลรอตรวจ" };
adminLabels.security = "ความปลอดภัย";
adminLabels.reviews = "ผลรอตรวจ";
adminLabels.database = "สถานะระบบ";
adminLabels.competitions = "ผลการแข่งขัน";
adminLabels.seasons = "ฤดูกาล";
type Data = { players?: Record<string, string | number>[]; attempts?: (AttemptView & { playerId: string })[]; events?: Record<string, string>[]; settings?: Record<string, number>; [key: string]: unknown };
function playerStatus(player: Record<string, string | number>) {
  const status: string[] = [];
  if (player.deletion_pending) status.push("กำลังลบบัญชี — ระงับการเข้าสู่ระบบแล้ว");
  else if (player.deleted) status.push("ลบข้อมูลระบุตัวตนแล้ว");
  else if (!player.name) status.push(player.name_locked ? "ล้างชื่อแล้ว — บัญชียังอยู่" : "ยังไม่มีชื่อแสดงผล");
  else if (player.name_locked) status.push("ล็อกชื่อแสดงผล");
  if (player.suspended) status.push("ระงับบัญชี");
  if (player.hidden) status.push("ซ่อนข้อมูลสาธารณะ");
  return status.length ? status.join(" · ") : "ปกติ";
}
export function AdminPanel({ section }: { section: string }) {
  const [result, setData] = useState<Data>({}), [error, setError] = useState(""), [loading, setLoading] = useState(true), [target, setTarget] = useState<{ id: string; action: string; label: string; friendCode?: string } | null>(null);
  const reviews = Array.isArray(result.reviews) ? result.reviews : [];
  const hasNext = Math.max(result.players?.length || 0, result.attempts?.length || 0, result.events?.length || 0, reviews.length) > ADMIN_PAGE_SIZE;
  const data: Data = { ...result, players: result.players?.slice(0, ADMIN_PAGE_SIZE), attempts: result.attempts?.slice(0, ADMIN_PAGE_SIZE), events: result.events?.slice(0, ADMIN_PAGE_SIZE), reviews: reviews.slice(0, ADMIN_PAGE_SIZE) };
  const [search, setSearch] = useState(""), [query, setQuery] = useState(""), [offset, setOffset] = useState(0);
  const requestId = useRef(0);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{ id: string; message: string } | null>(null);
  const [reason, setReason] = useState(""), [confirm, setConfirm] = useState(""), [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const moderationDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (target && !moderationDialog.current?.open) moderationDialog.current?.showModal();
  }, [target]);
  const reload = useCallback(async () => {
    const id = ++requestId.current; setLoading(true);
    try { const value = await api<Data>(`${section}?q=${encodeURIComponent(query)}&offset=${offset}`, undefined, true); if (id === requestId.current) { setData(value); setError(""); } }
    catch (e) { if (id === requestId.current) { setData({}); setError((e as Error).message); } }
    finally { if (id === requestId.current) setLoading(false); }
  }, [section, query, offset]);
  useEffect(() => { const initial = window.setTimeout(() => void reload(), 0); return () => clearTimeout(initial); }, [reload]);
  const modal = (id: string, action: string, label: string, friendCode?: string) => { setTarget({ id, action, label, friendCode }); setReason(""); setConfirm(""); setName(""); setError(""); };
  const copyPlayerCode = async (id: string, friendCode: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(friendCode);
      setCopyStatus({ id, message: "คัดลอกรหัสสหายแล้ว" });
    } catch {
      setCopyStatus({ id, message: "คัดลอกไม่สำเร็จ กรุณาเลือกรหัสแล้วคัดลอกเอง" });
    }
  };
  const expectedConfirm = target?.friendCode ?? target?.id ?? "";
  const searchable = ["players", "competitions", "leaderboards", "audit"].includes(section);
  const paged = ["players", "competitions", "leaderboards", "audit", "reviews"].includes(section);
  return <><section className="arena-panel admin-data-panel" aria-busy={loading}>
    <div className="admin-panel-toolbar"><h3>{adminLabels[section]}</h3><button type="button" disabled={loading} onClick={() => void reload()}>{loading ? "กำลังโหลด…" : "โหลดข้อมูลใหม่"}</button></div>
    {searchable && <form className="arena-form-row admin-search" onSubmit={(e) => { e.preventDefault(); setQuery(search); setOffset(0); }}><label>ค้นหาในรายการ<input type="search" maxLength={80} placeholder={section === "players" ? "ชื่อหรือรหัสสหาย" : "ชื่อ รหัส ด่าน หรือสถานะ"} value={search} onChange={(e) => setSearch(e.target.value)} /></label><button disabled={loading}>ค้นหา</button>{query && <button type="button" disabled={loading} onClick={() => { setSearch(""); setQuery(""); setOffset(0); }}>ล้างการค้นหา</button>}</form>}
    {loading && <p className="admin-loading" role="status">กำลังโหลดข้อมูล…</p>}
    {error && <p className="arena-error" role="alert">{error}</p>}
    {!loading && !error && <>
    {section === "database" && !loading && !error && <DatabaseAdmin data={data as unknown as DatabaseReport} />}
    {section === "demo" && !loading && !error && <DemoAdmin data={data as unknown as DemoReport} onChange={reload} />}
    {section==="seasons" && !loading && !error && <SeasonManager seasons={(data.seasons || []) as ComponentProps<typeof SeasonManager>["seasons"]} onChange={reload}/>}
    {section==="reviews" && !loading && !error && <ReviewManager reviews={(data.reviews || []) as ComponentProps<typeof ReviewManager>["reviews"]} onChange={reload}/>}
    {section === "players" && <><details className="admin-help"><summary>วิธีจัดการบัญชีอย่างปลอดภัย</summary><p>ล้างชื่อเก็บตัวตนและผลไว้ · ปกปิดชื่อไม่ลบคะแนน · ลบบัญชีถาวรจะลบข้อมูลเกมและไฟล์ส่วนตัวที่เชื่อมโยงทั้งหมด</p></details><div className="arena-table-wrap"><table><thead><tr><th>ผู้ฝึก/รหัส</th><th>สถานะ</th><th>หินวิญญาณ</th><th>ดำเนินการ</th></tr></thead><tbody>{data.players?.map((p) => { const pendingDelete = Boolean(p.deletion_pending); const actions = pendingDelete ? [["delete", "ดำเนินการลบต่อ"]] : [["rename", "เปลี่ยนชื่อ"], ["clear", "ล้างชื่อแสดงผล"], ["hide", "ซ่อนข้อมูลสาธารณะ"], ["suspend", "ระงับบัญชี"], ["restore", "คืนสิทธิ์/ปลดล็อกชื่อ"], ...(data.backend === "supabase" ? [["delete", "ลบบัญชีและข้อมูลทั้งหมด"]] : [])]; return <tr key={p.id}><td>{pendingDelete ? "บัญชีกำลังรอลบ" : p.name || "ไม่มีชื่อแสดงผล"}<div className="admin-player-id"><code>{pendingDelete ? "ซ่อนรหัสสหายแล้ว" : p.friend_code}</code>{!pendingDelete && <button type="button" onClick={() => void copyPlayerCode(String(p.id), String(p.friend_code))} aria-label={`คัดลอกรหัสสหายของ ${p.name || "ผู้ฝึกไม่มีชื่อแสดงผล"}`}>คัดลอกรหัสสหาย</button>}</div><details><summary>รหัสภายใน</summary><code>{p.id}</code></details>{copyStatus?.id === String(p.id) && <small role="status">{copyStatus.message}</small>}</td><td>ประวัติที่คงไว้ {p.attempt_count} รอบ<br />{playerStatus(p)}</td><td>{pendingDelete ? "ลบยอดแล้ว" : <PlayerStones id={String(p.id)} name={String(p.name || "ผู้ฝึกไม่มีชื่อแสดงผล")} initial={Number(p.balance ?? 0)} />}</td><td><details className="admin-row-actions"><summary>จัดการบัญชี</summary><div className="admin-player-actions">{actions.map(([a, l]) => <button key={a} className={a === "delete" ? "admin-danger" : undefined} disabled={Boolean(p.deleted) && !pendingDelete} onClick={() => modal(String(p.id), a, l, pendingDelete ? undefined : String(p.friend_code))}>{l}</button>)}</div></details></td></tr>; })}</tbody></table></div>{data.players?.length === 0 && <p>ยังไม่มีผู้ฝึกในฐานข้อมูลกลาง</p>}</>}
    {["competitions", "leaderboards"].includes(section) && <><details className="admin-help"><summary>การรับรองและยกเลิกผล</summary><p>ระบบตรวจหลักฐานฝั่งเซิร์ฟเวอร์ก่อนรับรองอันดับ ผู้ดูแลดูหลักฐานและยกเลิกผลพร้อมเหตุผลได้ การคืนสถานะผลไม่เปลี่ยนผลรอตรวจเป็นผลยืนยัน</p></details><div className="arena-table-wrap"><table><thead><tr><th>ด่าน/รอบ</th><th>ผล</th><th>เวลารวม</th><th>ดูแล</th></tr></thead><tbody>{data.attempts?.map((a) => <tr key={a.id}><td>{a.scenario}<br />{a.id}<br />ผู้ฝึก {a.playerId}</td><td>{statusText(a.status)}<br />{a.invalid ? "ยกเลิกผลแล้ว" : "ยังไม่ยกเลิก"}<br />กราฟ {a.graphValid ? "ผ่านการตรวจเบื้องต้น" : "ยังไม่ผ่าน"}</td><td>{timeText(a.totalMs)}</td><td><button onClick={() => setEvidenceId(a.id)}>ดูหลักฐานคำสั่ง</button><button disabled={data.backend === "supabase" && a.invalid} onClick={() => modal(a.id, a.invalid ? "reinstate" : "invalidate", a.invalid ? "คืนสถานะผล" : "ยกเลิกผล")}>{a.invalid ? "คืนสถานะผล" : "ยกเลิกผล"}</button></td></tr>)}</tbody></table></div>{data.attempts?.length === 0 && <p>ยังไม่มีรอบแข่งขัน</p>}</>}
    {section === "audit" && <div className="arena-table-wrap"><table><thead><tr><th>เวลา</th><th>ผู้ดำเนินการ/คำสั่ง</th><th>เป้าหมาย/เหตุผล</th></tr></thead><tbody>{data.events?.map((a) => <tr key={a.id}><td>{new Date(Number(a.created)).toLocaleString("th-TH")}</td><td><details><summary>{a.action === "login" ? "เข้าสู่ระบบ" : "การดำเนินการ"}</summary><p>{a.actor}</p><code>{a.action}</code></details></td><td>{a.reason}<details><summary>เป้าหมาย</summary><code>{a.target}</code></details></td></tr>)}</tbody></table></div>}
    {section === "matches" && <p>ประลองออนไลน์ปิดอยู่</p>}
    {section === "overview" && !loading && !error && <CompetitionOverview data={data} />}
    {section === "friends" && !loading && !error && <p>คำขอรอรับ {Number((data.requests as { count?: number })?.count || 0)} รายการ · การปิดกั้น {Number((data.blocks as { count?: number })?.count || 0)} รายการ</p>}
    {section === "settings" && data.settings && <RulesForm settings={data.settings} onChange={reload} />}
    </>}
    {paged && <AdminPagination page={Math.floor(offset / ADMIN_PAGE_SIZE)} onPage={(page) => setOffset(page * ADMIN_PAGE_SIZE)} hasNext={hasNext} busy={loading || Boolean(error)} />}
    </section>
    {evidenceId && <AdminEvidence id={evidenceId} onClose={() => setEvidenceId(null)} />}
    {target && <dialog ref={moderationDialog} className="admin-evidence-dialog" aria-labelledby="moderation-title" onCancel={(event) => { if (saving) event.preventDefault(); else setTarget(null); }}>
      <form className="arena-panel admin-confirm-form" onSubmit={async (e) => { e.preventDefault(); if (savingRef.current) return; savingRef.current = true; setSaving(true); try { await api("moderate", { ...target, reason, confirm, name }, true); setTarget(null); await reload(); } catch (e) { setError((e as Error).message); } finally { savingRef.current = false; setSaving(false); } }}>
        <h2 id="moderation-title">ยืนยัน{target.label}</h2>
        <p>{target.friendCode ? "รหัสสหายเป้าหมาย" : target.action === "delete" ? "รหัสภายในบัญชี" : "รหัสรอบเป้าหมาย"}: <code>{expectedConfirm}</code> <button type="button" onClick={() => void navigator.clipboard.writeText(expectedConfirm).catch(() => setError("คัดลอกรหัสไม่สำเร็จ กรุณาเลือกและคัดลอกรหัสด้านบน"))}>คัดลอกรหัส</button></p>
        <p>{target.action === "delete" ? "ลบบัญชี Supabase โปรไฟล์ ผลแข่งขัน หิน กระเป๋า ไอเท็ม เพื่อน และไฟล์ส่วนตัวของบัญชีนี้ถาวร รวมถึงบันทึกที่ระบุตัวบัญชี ไม่สามารถกู้คืนได้ หากการลบค้าง บัญชีจะถูกระงับและใช้ปุ่มดำเนินการลบต่อ" : "การดำเนินการนี้มีผลกับบัญชีหรือผลที่เลือก และบันทึกผู้ดำเนินการพร้อมเหตุผลทุกครั้ง"}</p>
        {target.action === "rename" && <label>ชื่อใหม่ <input required maxLength={20} value={name} onChange={(e) => setName(e.target.value)} /></label>}
        <label>เหตุผล (อย่างน้อย 5 ตัวอักษร) <input required minLength={5} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
        <label>วาง{target.friendCode ? "รหัสสหาย" : target.action === "delete" ? "รหัสภายในบัญชี" : "รหัสรอบ"}เพื่อยืนยัน <input required autoComplete="off" spellCheck={false} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        {confirm && confirm !== expectedConfirm && <p className="arena-error" role="status">รหัสยืนยันยังไม่ตรงกับรหัสด้านบน</p>}
        <button type="submit" disabled={saving || confirm !== expectedConfirm || reason.trim().length < 5}>{saving ? "กำลังบันทึก…" : `ยืนยัน${target.label}`}</button> <button type="button" disabled={saving} onClick={() => setTarget(null)}>ยกเลิก</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </dialog>}</>;
}
function RulesForm({ settings, onChange }: { settings: Record<string, number>; onChange: () => Promise<void> }) {
  const [values, setValues] = useState(settings), [reason, setReason] = useState(""), [message, setMessage] = useState("");
  return <form onSubmit={async (e) => { e.preventDefault(); try { await api("settings", { ...values, time_attack: Boolean(values.time_attack), board: Boolean(values.board), reason }, true); setMessage("บันทึกกติกาเวอร์ชันใหม่แล้ว"); await onChange(); } catch (e) { setMessage((e as Error).message); } }}><p><ArenaIcon name="settings" />กติกาเวอร์ชัน {settings.version} การแก้ไขสร้างเวอร์ชันใหม่ ไม่คำนวณผลเก่าด้วยกติกาใหม่</p>{[["time_attack", "เปิดฝึกจับเวลา"], ["board", "เปิดแสดงอันดับ"]].map(([k,l]) => <label key={k}><input type="checkbox" checked={Boolean(values[k])} onChange={(e) => setValues({ ...values, [k]: e.target.checked ? 1 : 0 })} />{l}</label>)}{[["connector_ms", "ต่อหัวผิด"], ["route_ms", "เส้นทางผิด"], ["hint_ms", "ขอคำแนะนำ"], ["failed_ms", "ตรวจระบบไม่ผ่าน"]].map(([k,l]) => <label key={k}>{l} (มิลลิวินาที)<input type="number" min={0} max={300000} required value={values[k]} onChange={(e) => setValues({ ...values, [k]: Number(e.target.value) })} /></label>)}<label>เหตุผล <input required minLength={5} value={reason} onChange={(e) => setReason(e.target.value)} /></label><button>บันทึกกติกาเวอร์ชันใหม่</button><p role="status">{message}</p></form>;
}

function CompetitionOverview({ data }: { data: Data }) {
  const count = (key: string) => {
    const value = (data[key] as { count?: unknown } | null)?.count;
    return typeof value === "number" ? value.toLocaleString("th-TH") : "ยังไม่มีข้อมูล";
  };
  const metrics = [["ผู้ฝึกในระบบ", "players"], ["รอบแข่งขันทั้งหมด", "attempts"], ["ผลรอตรวจ", "pending"], ["ผลยืนยันแล้ว", "verified"]];
  const season = (data.season as { name?: string } | null)?.name;
  return <><dl className="admin-kpi-grid">{metrics.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{count(key)}</dd></div>)}</dl><div className="admin-season-status">{season && <><h3>ฤดูกาลปัจจุบัน</h3><p>{season}</p></>}<p className="arena-note">ผลที่รอตรวจยังไม่เป็นอันดับทางการ เลือกเมนูผู้ฝึก ผลแข่งขัน หรือฤดูกาลเพื่อดูแลรายการ</p></div></>;
}

/** Admin only: a player's current Spirit Stones, a live re-check, and setting a new balance (audited ledger adjustment). */
function PlayerStones({ id, name, initial }: { id: string; name: string; initial: number }) {
  const [balance, setBalance] = useState(initial), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false), [target, setTarget] = useState(""), [reason, setReason] = useState("");
  const fresh = async () => (await api<{ balance: number }>(`player-balance?id=${encodeURIComponent(id)}`, undefined, true)).balance;
  const checkNow = async () => {
    setBusy(true); setMessage("");
    try { const b = await fresh(); setBalance(b); setMessage(`ตรวจแล้ว ${new Date().toLocaleTimeString("th-TH")}`); }
    catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  const save = async () => {
    const want = Math.trunc(Number(target));
    if (!Number.isSafeInteger(want) || want < 0) { setMessage("ใส่จำนวนหินเป็นเลขจำนวนเต็มตั้งแต่ 0 ขึ้นไป"); return; }
    if (reason.trim().length < 5) { setMessage("ใส่เหตุผลอย่างน้อย 5 ตัวอักษร"); return; }
    setBusy(true); setMessage("");
    try {
      const current = await fresh(), delta = want - current;
      if (delta === 0) { setBalance(current); setEditing(false); setMessage("ยอดเท่าเดิม ไม่มีการเปลี่ยนแปลง"); return; }
      const r = await api<{ balance: number }>("economy/adjust", { player: id, confirm: id, amount: delta, reason: reason.trim(), idempotencyKey: crypto.randomUUID() }, true);
      setBalance(Number(r.balance)); setEditing(false); setTarget(""); setReason("");
      setMessage(`บันทึกแล้ว (${delta > 0 ? "+" : ""}${delta.toLocaleString("th-TH")})`);
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  return <div className="admin-player-stones">
    <strong>{balance.toLocaleString("th-TH")}</strong>
    <div className="arena-actions">
      <button type="button" disabled={busy} onClick={() => void checkNow()}>เช็คหิน</button>
      <button type="button" disabled={busy} onClick={() => { setEditing(!editing); setTarget(String(balance)); setMessage(""); }}>{editing ? "ยกเลิก" : "แก้หิน"}</button>
    </div>
    {editing && <form onSubmit={(e) => { e.preventDefault(); void save(); }} aria-label={`แก้หินวิญญาณของ ${name}`}>
      <label>ยอดใหม่<input type="number" min={0} step={1} required value={target} onChange={(e) => setTarget(e.target.value)} /></label>
      <label>เหตุผล<input required minLength={5} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      <button disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึกยอดใหม่"}</button>
    </form>}
    {message && <small role="status">{message}</small>}
  </div>;
}
