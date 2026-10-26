"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client-api";
import { ADMIN_PAGE_SIZE, AdminPagination } from "./admin-pagination";

type Event = { id: string; created: string; status: number; method: string; path: string; kind: string; ip: string | null; country: string; region: string; city: string; browser: string; requestId: string };
type Report = { available: boolean; events: Event[]; since?: string; checkedAt: string };
const labels: Record<string, string> = { "login-failed": "เข้าสู่ระบบไม่สำเร็จ", "authentication-required": "ยังไม่มีสิทธิ์หรือเซสชันหมดอายุ", "rate-limited": "ส่งคำขอถี่เกินกำหนด", "request-blocked": "คำขอถูกปฏิเสธ" };

export function AdminSecurity() {
  const [report, setReport] = useState<Report | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true); setError("");
    try { const result = await api<Report>("security", undefined, true, signal); if (!signal?.aborted) setReport(result); }
    catch (e) { if (!signal?.aborted) setError((e as Error).message); }
    finally { if (!signal?.aborted) setBusy(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 0); return () => { clearTimeout(timer); controller.abort(); }; }, [load]);
  const events = report?.events ?? [];
  const visible = events.filter((event) => !filter || event.kind === filter);
  const pages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE)), currentPage = Math.min(page, pages - 1);
  const shown = visible.slice(currentPage * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE + ADMIN_PAGE_SIZE);
  return <section className="arena-panel admin-security" aria-busy={busy}>
    <div className="admin-security-heading"><div><h3>ตรวจสอบความปลอดภัย</h3><p className="arena-note">บันทึกคำขอที่ระบบแอดมินปฏิเสธ · ล่าสุดไม่เกิน 100 รายการใน 7 วัน</p></div><button disabled={busy} onClick={() => void load()}>{busy ? "กำลังตรวจ…" : "โหลดข้อมูลใหม่"}</button></div>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {report && !report.available && <p role="status">บันทึกถาวรเปิดใช้เฉพาะระบบออนไลน์ ขณะนี้ยังไม่มีแหล่งข้อมูลให้ตรวจสอบ</p>}
    {report?.available && <>
      <dl className="admin-kpi-grid">{[["เหตุการณ์ในรายการล่าสุด", events.length], ["เข้าสู่ระบบไม่สำเร็จ", events.filter((e) => e.kind === "login-failed").length], ["คำขอถี่เกินกำหนด", events.filter((e) => e.kind === "rate-limited").length]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Number(value).toLocaleString("th-TH")}</dd></div>)}</dl>
      <label>แสดงเหตุการณ์<select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}><option value="">ทั้งหมด</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <p className="arena-note">ตรวจล่าสุด {new Date(report.checkedAt).toLocaleString("th-TH")} · เหตุการณ์ชนิดเดียวกันจาก IP เดิมอาจบันทึกเพียงครั้งต่อนาที และอาจถูกจำกัดเมื่อมีคำขอจำนวนมาก</p>
      {visible.length ? <div className="arena-table-wrap"><table><thead><tr><th>เวลา / เหตุการณ์</th><th>IP / พื้นที่โดยประมาณ</th><th>คำขอ / ข้อมูลเบราว์เซอร์</th></tr></thead><tbody>{shown.map((event) => <tr key={event.id}>
        <td><time dateTime={event.created}>{new Date(event.created).toLocaleString("th-TH")}</time><strong className="admin-security-kind">{labels[event.kind] || "คำขอถูกปฏิเสธ"}</strong><small>สถานะ {event.status}</small></td>
        <td><code>{event.ip || "ไม่พบ IP ที่ยืนยันแหล่งที่มาได้"}</code><p>{[event.city, event.region, event.country].filter(Boolean).join(" · ") || "ไม่มีข้อมูลพื้นที่"}</p></td>
        <td><code>{event.method} {event.path}</code><details><summary>รายละเอียดคำขอ</summary><p>ข้อมูลเบราว์เซอร์ที่ผู้ส่งแจ้ง (ปลอมแปลงได้): {event.browser || "ไม่มีข้อมูล"}</p><p>รหัสคำขอ: <code>{event.requestId || "ไม่มีข้อมูล"}</code></p></details></td>
      </tr>)}</tbody></table></div> : <p role="status">ยังไม่พบเหตุการณ์ตามตัวกรองนี้ในรายการล่าสุด</p>}
      <AdminPagination page={currentPage} totalPages={pages} onPage={setPage} hasNext={currentPage < pages - 1} busy={busy} />
    </>}
    <details className="admin-security-note"><summary>ขอบเขตข้อมูลที่ตรวจสอบได้</summary><ul>
      <li>เริ่มเก็บเหตุการณ์จาก API ผู้ดูแลหลังเปิดใช้ระบบนี้ ไม่รวมคำขอที่ถูกบล็อกก่อนถึงแอปหรือการเข้าชมหน้าเว็บทั่วไป</li>
      <li>IP คือที่อยู่เครือข่าย อาจใช้ร่วมกันหรือผ่าน VPN ส่วนพื้นที่เป็นข้อมูลโดยประมาณ ไม่ใช่เลขเครื่องหรือที่อยู่บ้าน</li>
      <li>การไม่มีสิทธิ์หรือเซสชันหมดอายุก็สร้างเหตุการณ์ได้ จึงยังสรุปไม่ได้ว่าผู้ส่งเป็นผู้บุกรุก</li>
      <li>เว็บไม่สามารถยืนยันว่าใครคัดลอกเนื้อหาหรือจับภาพหน้าจอได้ หน้านี้จึงไม่แสดงรายชื่อผู้คัดลอกจากการคาดเดา</li>
    </ul></details>
  </section>;
}
