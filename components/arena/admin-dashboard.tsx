"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client-api";
import { stones } from "@/game/content/economy-catalog";

type Count = { count?: number } | null;
type Overview = { players?: Count; attempts?: Count; pending?: Count; verified?: Count };
type Economy = { wallets: number; circulating: number; purchases: number; ledger: number; unpaidSeeded?: number };
type Catalog = { items: { status: string; updated: number; name: string; sku: string }[] };
type Database = { state?: string; message?: string; backend?: string; verifiedSliceEnabled?: boolean };
type Loaded = { overview?: Overview; economy?: Economy; catalog?: Catalog; database?: Database; errors: string[]; at: number };

const n = (c: Count | undefined) => (typeof c?.count === "number" ? c.count.toLocaleString("th-TH") : "—");

/** Control-center overview: every number comes from an existing authorized endpoint; failures are shown, not faked. */
export function AdminDashboard({ onGo }: { onGo: (area: string, sub?: string) => void }) {
  const [data, setData] = useState<Loaded | null>(null), [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const errors: string[] = [];
    const get = async <T,>(path: string, label: string): Promise<T | undefined> => { try { return await api<T>(path, undefined, true); } catch (e) { errors.push(`${label}: ${(e as Error).message}`); return undefined; } };
    const [overview, economy, catalog, database] = await Promise.all([
      get<Overview>("overview", "ห้องแข่งขัน"), get<Economy>("economy/overview", "เศรษฐกิจ"), get<Catalog>("catalog/list", "ตลาดสวรรค์"),
      get<Database>("database", "ฐานข้อมูล"),
    ]);
    setData({ overview, economy, catalog, database, errors, at: Date.now() }); setLoading(false);
  }, []);
  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);
  const items = data?.catalog?.items ?? [];
  const count = (s: string) => items.filter((i) => i.status === s).length;
  const attentionCount = Number(data?.overview?.pending?.count ?? 0) + count("draft") + (data?.database && data.database.state !== "READY" ? 1 : 0) + (data?.errors.length ? 1 : 0);
  const kpis: [string, string, string, string?][] = [
    ["ผู้ฝึกในระบบ", n(data?.overview?.players), "competition", "players"],
    ["ผลรอตรวจ", n(data?.overview?.pending), "competition", "reviews"],
    ["สินค้าที่เปิดขาย", data?.catalog ? String(count("published")) : "—", "market"],
    ["หินวิญญาณหมุนเวียน", data?.economy ? stones(data.economy.circulating) : "—", "economy"],
  ];
  return <div className="admin-dash">
    <div className="admin-dash-bar">
      <span className={`admin-dash-env${data?.database?.state === "READY" ? " is-ok" : ""}`}>{data?.database ? data.database.state === "READY" ? "เชื่อมต่อข้อมูลเว็บแล้ว" : "การเชื่อมต่อต้องตรวจสอบ" : loading ? "กำลังตรวจสถานะ…" : "ยังตรวจสถานะไม่ได้"}</span>
      <span className="arena-note">{data ? `อัปเดตล่าสุด ${new Date(data.at).toLocaleTimeString("th-TH")}` : ""}</span>
      <button type="button" disabled={loading} onClick={() => void load()}>{loading ? "กำลังโหลด…" : "โหลดข้อมูลใหม่"}</button>
    </div>
    {data?.errors.length ? <div className="arena-error" role="alert">{data.errors.map((e) => <p key={e}>{e}</p>)}<button type="button" onClick={() => void load()}>ลองอีกครั้ง</button></div> : null}
    <dl className="admin-kpi-grid admin-dash-kpis">{kpis.map(([label, value, area, sub]) => <div key={label}><dt>{label}</dt><dd className={value.length > 12 ? "is-long-number" : undefined}>{value}</dd><button type="button" className="admin-dash-go" aria-label={`ดู${label}`} onClick={() => onGo(area, sub)}>{area === "market" ? "จัดการสินค้า" : area === "economy" ? "ดูเศรษฐกิจ" : sub === "players" ? "จัดการผู้ฝึก" : sub === "reviews" ? "ตรวจรายการ" : "ดูผลแข่งขัน"} <span aria-hidden="true">→</span></button></div>)}</dl>
    <div className="admin-dash-grid admin-overview-layout">
      <section className="arena-panel admin-dash-attention">
        <div className="admin-dash-attention-head"><div><h3>สิ่งที่ควรดูแล</h3><p>รายการที่ต้องดำเนินการจากสถานะระบบ</p></div><span className={attentionCount ? "has-items" : "is-clear"}>{!data && loading ? "กำลังตรวจสอบ" : attentionCount ? `${attentionCount} รายการ` : "เรียบร้อย"}</span></div>
        <ul className="admin-dash-alerts">
          {data?.database && data.database.state !== "READY" && <li className="is-warn">ฐานข้อมูล: {data.database.message ?? data.database.state}</li>}
          {Number(data?.overview?.pending?.count) > 0 && <li className="is-warn"><button onClick={() => onGo("competition", "reviews")}>ตรวจผลแข่งขัน {n(data?.overview?.pending)} รายการ</button></li>}
          {count("draft") > 0 && <li><button onClick={() => onGo("market")}>ตรวจสินค้าแบบร่าง {count("draft")} รายการ</button></li>}
          {!data && loading && <li>กำลังตรวจรายการที่ต้องดูแล…</li>}
          {data?.errors.length ? <li className="is-warn">ข้อมูลบางส่วนยังไม่พร้อม กรุณาโหลดข้อมูลใหม่</li> : null}
          {data && !data.errors.length && data.database?.state === "READY" && !Number(data.overview?.pending?.count) && !count("draft") && <li className="admin-dash-clear"><span aria-hidden="true">✓</span><div><strong>ไม่มีรายการที่ต้องดูแลตอนนี้</strong><p>สถานะระบบและรายการที่ตรวจสอบอยู่เรียบร้อย</p></div></li>}
        </ul>
      </section>
    </div>
  </div>;
}
