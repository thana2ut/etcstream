"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArenaIcon } from "./shell";
import { api, timeText, statusText, type AttemptView } from "./client-api";
import { AdminEvidence } from "./admin-evidence";
import { DatabaseAdmin, DemoAdmin, type DatabaseReport, type DemoReport } from "./database-admin";
import {SeasonManager,ReviewManager} from "./admin-seasons";
import type {ComponentProps} from "react";

export const adminSections = ["overview", "database", "demo", "players", "competitions", "leaderboards", "matches", "friends", "settings", "audit", "seasons", "reviews"];
export const adminLabels: Record<string, string> = { database: "ฐานข้อมูลและการตั้งค่า", demo: "ตัวอย่างข้อมูล DEMO", overview: "ภาพรวม", players: "จัดการผู้ฝึก", competitions: "รอบแข่งขัน", leaderboards: "ดูแลผลและอันดับ", matches: "ห้องประลอง", friends: "คำขอและการปิดกั้น", missions: "จัดการภารกิจ (25 ด่าน)", settings: "ตั้งค่ากติกา", audit: "ประวัติการดูแล",seasons:"ฤดูกาลและแรงก์",reviews:"คิวตรวจผล V6" };
type Data = { players?: Record<string, string | number>[]; attempts?: (AttemptView & { playerId: string })[]; events?: Record<string, string>[]; settings?: Record<string, number>; [key: string]: unknown };
export function AdminPanel({ section }: { section: string }) {
  const [data, setData] = useState<Data>({}), [error, setError] = useState(""), [loading, setLoading] = useState(true), [target, setTarget] = useState<{ id: string; action: string; label: string } | null>(null);
  const [search, setSearch] = useState(""), [query, setQuery] = useState(""), [offset, setOffset] = useState(0);
  const requestId = useRef(0);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [reason, setReason] = useState(""), [confirm, setConfirm] = useState(""), [name, setName] = useState("");
  const reload = useCallback(async () => {
    const id = ++requestId.current; setLoading(true);
    try { const value = await api<Data>(`${section}?q=${encodeURIComponent(query)}&offset=${offset}`, undefined, true); if (id === requestId.current) { setData(value); setError(""); } }
    catch (e) { if (id === requestId.current) { setData({}); setError((e as Error).message); } }
    finally { if (id === requestId.current) setLoading(false); }
  }, [section, query, offset]);
  useEffect(() => { const initial = window.setTimeout(() => void reload(), 0); return () => clearTimeout(initial); }, [reload]);
  const modal = (id: string, action: string, label: string) => { setTarget({ id, action, label }); setReason(""); setConfirm(""); setName(""); };
  return <><section className="arena-panel"><h2>{adminLabels[section]}</h2>{["players", "competitions", "leaderboards", "audit"].includes(section) && <form className="arena-form-row" onSubmit={(e) => { e.preventDefault(); setQuery(search); setOffset(0); }}><label>ค้นชื่อ รหัส ด่าน หรือสถานะ <input maxLength={80} value={search} onChange={(e) => setSearch(e.target.value)} /></label><button>ค้นหา/กรอง</button></form>}{loading && <p>กำลังโหลดข้อมูลจริง…</p>}{error && <p className="arena-error" role="alert">{error}</p>}<button onClick={() => void reload()}>โหลดข้อมูลใหม่</button>
    {section === "database" && !loading && !error && <DatabaseAdmin data={data as unknown as DatabaseReport} />}
    {section === "demo" && !loading && !error && <DemoAdmin data={data as unknown as DemoReport} onChange={reload} />}
    {section==="seasons" && !loading && !error && <SeasonManager seasons={(data.seasons || []) as ComponentProps<typeof SeasonManager>["seasons"]} onChange={reload}/>}
    {section==="reviews" && !loading && !error && <ReviewManager reviews={(data.reviews || []) as ComponentProps<typeof ReviewManager>["reviews"]} onChange={reload}/>}
    {section === "players" && <><p>ล้างชื่อเก็บตัวตนและผลไว้ · ปกปิดชื่อไม่ลบคะแนน · ลบข้อมูลเป็นการทำให้ไม่ระบุตัวตน ไม่ลบประวัติแข่งขันถาวร</p><div className="arena-table-wrap"><table><thead><tr><th>ผู้ฝึก/รหัส</th><th>สถานะ</th><th>ดำเนินการ</th></tr></thead><tbody>{data.players?.map((p) => <tr key={p.id}><td>{p.name || "ผู้ฝึกนิรนาม"}<br />{p.friend_code}<small><br />{p.id}</small></td><td>ประวัติที่คงไว้ {p.attempt_count} รอบ<br />{p.deleted ? "ไม่ระบุตัวตนแล้ว" : p.suspended ? "ระงับ" : p.hidden ? "ซ่อน" : "ปกติ"}</td><td>{[["rename", "เปลี่ยนชื่อ"], ["clear", "ล้างชื่อแสดงผล"], ["hide", "ซ่อนข้อมูลสาธารณะ"], ["suspend", "ระงับบัญชี"], ["restore", "คืนสิทธิ์/ปลดล็อกชื่อ"], ["anonymize", "ลบข้อมูลระบุตัวตน"]].map(([a, l]) => <button key={a} disabled={Boolean(p.deleted)} onClick={() => modal(String(p.id), a, l)}>{l}</button>)}</td></tr>)}</tbody></table></div>{data.players?.length === 0 && <p>ยังไม่มีผู้ฝึกในฐานข้อมูลกลาง</p>}</>}
    {["competitions", "leaderboards"].includes(section) && <><p>ผลรอตรวจจะไม่ถูกยืนยันเป็นอันดับด้วยปุ่มผู้ดูแล ระบบยังต้องเพิ่มบันทึกคำสั่งที่ตรวจย้อนกลับได้ก่อน การคืนผลยกเลิกไม่เปลี่ยนผลรอตรวจให้เป็นผลยืนยัน</p><div className="arena-table-wrap"><table><thead><tr><th>ด่าน/รอบ</th><th>ผล</th><th>เวลารวม</th><th>ดูแล</th></tr></thead><tbody>{data.attempts?.map((a) => <tr key={a.id}><td>{a.scenario}<br />{a.id}<br />ผู้ฝึก {a.playerId}</td><td>{statusText(a.status)}<br />{a.invalid ? "ยกเลิกผลแล้ว" : "ยังไม่ยกเลิก"}<br />กราฟ {a.graphValid ? "ผ่านการตรวจเบื้องต้น" : "ยังไม่ผ่าน"}</td><td>{timeText(a.totalMs)}</td><td><button onClick={() => setEvidenceId(a.id)}>ดูหลักฐานคำสั่ง</button><button onClick={() => modal(a.id, a.invalid ? "reinstate" : "invalidate", a.invalid ? "คืนสถานะผล" : "ยกเลิกผล")}>{a.invalid ? "คืนสถานะผล" : "ยกเลิกผล"}</button></td></tr>)}</tbody></table></div>{data.attempts?.length === 0 && <p>ยังไม่มีรอบแข่งขัน</p>}</>}
    {section === "audit" && <div className="arena-table-wrap"><table><thead><tr><th>เวลา</th><th>ผู้ดำเนินการ/คำสั่ง</th><th>เป้าหมาย/เหตุผล</th></tr></thead><tbody>{data.events?.map((a) => <tr key={a.id}><td>{new Date(Number(a.created)).toLocaleString("th-TH")}</td><td>{a.actor}<br />{a.action}</td><td>{a.target}<br />{a.reason}</td></tr>)}</tbody></table></div>}
    {section === "matches" && <p>ยังไม่เปิดใช้งานประลองออนไลน์ ไม่มีห้องจำลองหรือคู่แข่งสมมติ</p>}
    {section === "overview" && !loading && !error && <CompetitionOverview data={data} />}
    {section === "friends" && !loading && !error && <p>คำขอรอรับ {Number((data.requests as { count?: number })?.count || 0)} รายการ · การปิดกั้น {Number((data.blocks as { count?: number })?.count || 0)} รายการ</p>}
    {section === "settings" && data.settings && <RulesForm settings={data.settings} onChange={reload} />}
    {["players", "competitions", "leaderboards", "audit"].includes(section) && <p><button disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - 100))}>ก่อนหน้า</button> หน้า {Math.floor(offset / 100) + 1} <button disabled={loading || Math.max(data.players?.length || 0, data.attempts?.length || 0, data.events?.length || 0) < 100} onClick={() => setOffset(offset + 100)}>ถัดไป</button></p>}
    </section>{evidenceId && <AdminEvidence id={evidenceId} onClose={() => setEvidenceId(null)} />}{target && <div className="arena-modal" role="dialog" aria-modal="true" aria-labelledby="moderation-title"><form className="arena-panel" onSubmit={async (e) => { e.preventDefault(); try { await api("moderate", { ...target, reason, confirm, name }, true); setTarget(null); await reload(); } catch (e) { setError((e as Error).message); } }}><h2 id="moderation-title">ยืนยัน{target.label}</h2><p>เป้าหมาย: {target.id}</p><p>{target.action === "anonymize" ? "จะล้างชื่อ ซ่อนโปรไฟล์ ถอนเซสชัน และเลิกเชื่อมโยงสหาย เก็บประวัติแข่งขันแบบไม่ระบุตัวตน ไม่สามารถกู้ชื่อผ่านหน้าจอนี้" : "การเปลี่ยนชื่อไม่ลบตัวตนหรือประวัติแข่งขัน และมีบันทึกตรวจสอบทุกครั้ง"}</p>{target.action === "rename" && <label>ชื่อใหม่ <input required maxLength={20} value={name} onChange={(e) => setName(e.target.value)} /></label>}<label>เหตุผล <input required minLength={5} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label><label>พิมพ์รหัสเป้าหมายยืนยัน <input required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label><button disabled={confirm !== target.id}>ยืนยัน{target.label}</button> <button type="button" onClick={() => setTarget(null)}>ยกเลิก</button>{error && <p role="alert">{error}</p>}</form></div>}</>;
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
  const metrics = [["ผู้ฝึกในระบบกลาง", count("players")], ["บัญชีที่ยังใช้งานได้", count("activePlayers")], ["ผู้เล่นที่มีผลยืนยัน", count("verifiedPlayers")], ["รอบแข่งขันทั้งหมด", count("attempts")], ["ผลรอตรวจ", count("pending")], ["ผลยืนยันพร้อมหลักฐาน", count("verified")], ["ผู้ยินยอมแสดงออนไลน์", count("online")], ["ผู้มีสิทธิ์ร่วมอันดับ", count("eligible")]];
  return <><dl className="admin-kpi-grid">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="admin-season-status"><h3>ฤดูกาลปัจจุบัน</h3><p>{(data.season as { name?: string } | null)?.name || "ยังไม่มีฤดูกาลเปิด"}</p><p>ผลที่รอตรวจยังไม่เป็นอันดับทางการ · การประลองสองเซียนยังไม่เปิดใช้งาน</p><p>สถานะออนไลน์ใช้ความยินยอมและการติดต่อเซิร์ฟเวอร์ล่าสุดตามกติกาเดิม ไม่ใช่การติดตามสดตลอดเวลา</p></div></>;
}
