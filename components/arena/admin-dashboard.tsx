"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client-api";
import { stones } from "@/game/content/economy-catalog";

type Count = { count?: number } | null;
type Overview = { players?: Count; attempts?: Count; pending?: Count; verified?: Count };
type Economy = { wallets: number; circulating: number; purchases: number; ledger: number; unpaidSeeded?: number };
type Catalog = { items: { status: string; updated: number; name: string; sku: string }[] };
type Database = { state?: string; message?: string; backend?: string; verifiedSliceEnabled?: boolean };
type Audit = { events: { id: string; created: number; action: string; target: string; reason: string }[] };
type Loaded = { overview?: Overview; economy?: Economy; catalog?: Catalog; database?: Database; audit?: Audit; errors: string[]; at: number };

const n = (c: Count | undefined) => (typeof c?.count === "number" ? c.count.toLocaleString("th-TH") : "—");

/** Control-center overview: every number comes from an existing authorized endpoint; failures are shown, not faked. */
export function AdminDashboard({ onGo }: { onGo: (area: string, sub?: string) => void }) {
  const [data, setData] = useState<Loaded | null>(null), [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const errors: string[] = [];
    const get = async <T,>(path: string, label: string): Promise<T | undefined> => { try { return await api<T>(path, undefined, true); } catch (e) { errors.push(`${label}: ${(e as Error).message}`); return undefined; } };
    const [overview, economy, catalog, database, audit] = await Promise.all([
      get<Overview>("overview", "ห้องแข่งขัน"), get<Economy>("economy/overview", "เศรษฐกิจ"), get<Catalog>("catalog/list", "ตลาดสวรรค์"),
      get<Database>("database", "ฐานข้อมูล"), get<Audit>("audit?offset=0", "ประวัติการดำเนินการ"),
    ]);
    setData({ overview, economy, catalog, database, audit, errors, at: Date.now() }); setLoading(false);
  }, []);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  const items = data?.catalog?.items ?? [];
  const count = (s: string) => items.filter((i) => i.status === s).length;
  const kpis: [string, string, string, string?][] = [
    ["ผู้เล่นในระบบกลาง", n(data?.overview?.players), "competition", "players"],
    ["รอบแข่งขันทั้งหมด", n(data?.overview?.attempts), "competition", "competitions"],
    ["ผลรอตรวจ", n(data?.overview?.pending), "competition", "reviews"],
    ["ผลยืนยันพร้อมหลักฐาน", n(data?.overview?.verified), "competition", "leaderboards"],
    ["สินค้าที่เปิดขาย", data?.catalog ? String(count("published")) : "—", "market"],
    ["แบบร่างสินค้า", data?.catalog ? String(count("draft")) : "—", "market"],
    ["การซื้อสำเร็จทั้งหมด", data?.economy ? stones(data.economy.purchases) : "—", "economy"],
    ["หินวิญญาณหมุนเวียน", data?.economy ? stones(data.economy.circulating) : "—", "economy"],
  ];
  return <div className="admin-dash">
    <div className="admin-dash-bar">
      <span className={`admin-dash-env${data?.database?.state === "READY" ? " is-ok" : ""}`}>{data?.database ? `${data.database.backend === "supabase" ? "Supabase ออนไลน์" : "ระบบภายในเครื่อง"} · ${data.database.state ?? "ไม่ทราบสถานะ"}` : loading ? "กำลังตรวจสถานะ…" : "ยังตรวจสถานะไม่ได้"}</span>
      <span className="arena-note">{data ? `อัปเดตล่าสุด ${new Date(data.at).toLocaleTimeString("th-TH")}` : ""}</span>
      <button type="button" disabled={loading} onClick={() => void load()}>{loading ? "กำลังโหลด…" : "รีเฟรช"}</button>
    </div>
    {data?.errors.length ? <div className="arena-error" role="alert">{data.errors.map((e) => <p key={e}>{e}</p>)}<button type="button" onClick={() => void load()}>ลองอีกครั้ง</button></div> : null}
    <dl className="admin-kpi-grid admin-dash-kpis">{kpis.map(([label, value, area, sub]) => <div key={label}><dt>{label}</dt><dd>{value}</dd><button type="button" className="admin-dash-go" onClick={() => onGo(area, sub)}>เปิด →</button></div>)}</dl>
    <div className="admin-dash-grid">
      <section className="arena-panel"><h3>ทางลัด</h3><div className="admin-dash-links">
        <button type="button" onClick={() => onGo("market")}>เพิ่ม/จัดการสินค้าในตลาดสวรรค์</button>
        <button type="button" onClick={() => onGo("competition", "reviews")}>ผลแข่งขันที่รอตรวจ</button>
        <button type="button" onClick={() => onGo("training")}>ห้องฝึก · เข้าเล่นตรวจ</button>
        <button type="button" onClick={() => onGo("missions")}>ห้องภารกิจ · 25 ระดับ</button>
        <button type="button" onClick={() => onGo("economy")}>เศรษฐกิจหินวิญญาณ</button>
        <button type="button" onClick={() => onGo("system", "audit")}>ประวัติการดำเนินการ</button>
      </div></section>
      <section className="arena-panel"><h3>สิ่งที่ควรดูแล</h3><ul className="admin-dash-alerts">
        {data?.database && data.database.state !== "READY" && <li className="is-warn">ฐานข้อมูล: {data.database.message ?? data.database.state}</li>}
        {data?.database && data.database.verifiedSliceEnabled === false && <li>การรับรองผลอัตโนมัติยังปิดอยู่ (ตั้งค่าที่ Vercel)</li>}
        {Number(data?.overview?.pending?.count) > 0 && <li className="is-warn">มีผลแข่งขันรอตรวจ {n(data?.overview?.pending)} รายการ</li>}
        {count("draft") > 0 && <li>มีสินค้าแบบร่าง {count("draft")} รายการ ยังไม่เปิดขาย</li>}
        {data && !data.errors.length && data.database?.state === "READY" && !Number(data.overview?.pending?.count) && !count("draft") && <li>ไม่มีรายการที่ต้องดูแลตอนนี้</li>}
      </ul></section>
      <section className="arena-panel admin-dash-audit"><h3>กิจกรรมผู้ดูแลล่าสุด</h3>{data?.audit?.events.length ? <ol>{data.audit.events.slice(0, 8).map((e) => <li key={e.id}><time>{new Date(e.created).toLocaleString("th-TH")}</time><strong>{e.action}</strong><span>{e.target}</span></li>)}</ol> : <p className="arena-note">{loading ? "กำลังโหลด…" : "ยังไม่มีประวัติ"}</p>}</section>
    </div>
  </div>;
}
