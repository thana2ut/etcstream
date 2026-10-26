"use client";
import { useEffect, useState } from "react";
import { api } from "./client-api";
import { AdminPagedItems } from "./admin-pagination";
import type { TrainingStatus } from "@/server/arena/training-status";

export function AdminTraining({ onPreview, launching }: { onPreview: (sceneId: string) => Promise<void>; launching: boolean }) {
  const [section, setSection] = useState("rooms"), [data, setData] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState(""), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<TrainingStatus>("training", undefined, true, controller.signal).then((value) => { if (!controller.signal.aborted) setData(value); }).catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [refresh]);
  return <section className="arena-panel">
    <div className="admin-security-heading"><div><h3>ตรวจห้องฝึก</h3><p className="arena-note">เข้าเล่นตรวจอุปกรณ์และการต่อสาย โดยไม่บันทึกคะแนนหรือรางวัล</p></div><button onClick={() => { setData(null); setError(""); setRefresh((v) => v + 1); }}>โหลดข้อมูลใหม่</button></div>
    <nav className="admin-subnav" aria-label="ส่วนห้องฝึก"><button aria-pressed={section === "rooms"} onClick={() => setSection("rooms")}>เข้าเล่นตรวจ</button><button aria-pressed={section === "equipment"} onClick={() => setSection("equipment")}>อุปกรณ์</button><button aria-pressed={section === "cables"} onClick={() => setSection("cables")}>สายเชื่อมต่อ</button></nav>
    {error && <p className="arena-error" role="alert">{error}</p>}
    {!data && !error && <p role="status">กำลังโหลดข้อมูลห้องฝึก…</p>}
    {data && (section === "rooms" ? <div className="admin-training-scenes">
      <article className="admin-training-scene"><h4>ห้องฝึกอิสระ</h4><p>ตรวจการจัดวางอุปกรณ์และต่อสัญญาณในห้องสตูดิโอ</p><button disabled={launching} onClick={() => void onPreview("studio-full").catch(() => {})}>{launching ? "กำลังเปิดห้อง…" : "เข้าเล่นตรวจ"}</button></article>
      <article className="admin-training-scene"><h4>ห้องฝึก HDMI</h4><p>ตรวจการต่อสัญญาณจากกล้อง ผ่านเครื่องสลับภาพ ไปยังจอ</p><button disabled={launching} onClick={() => void onPreview("hdmi-basic").catch(() => {})}>{launching ? "กำลังเปิดห้อง…" : "เข้าเล่นตรวจ"}</button></article>
    </div> : <>
      <dl className="admin-kpi-grid">{[["อุปกรณ์ในห้องฝึกอิสระ", data.devices.length], ["สายที่มีให้ใช้", data.cables.length], ["พอร์ตเชื่อมต่อ", data.portCount]].map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{Number(count).toLocaleString("th-TH")}</dd></div>)}</dl>
      {section === "equipment" && <AdminPagedItems items={data.devices}>{(rows) => <div className="arena-table-wrap"><table><thead><tr><th>อุปกรณ์</th><th>รุ่น</th></tr></thead><tbody>{rows.map((device) => <tr key={device.id}><td>{device.label}</td><td>{device.model}</td></tr>)}</tbody></table></div>}</AdminPagedItems>}
      {section === "cables" && <AdminPagedItems items={data.cables}>{(rows) => <div className="arena-table-wrap"><table><thead><tr><th>สาย</th><th>หัวเชื่อมต่อ</th></tr></thead><tbody>{rows.map((cable) => <tr key={cable.id}><td>{cable.label}</td><td>{cable.ends.join(" ↔ ")}</td></tr>)}</tbody></table></div>}</AdminPagedItems>}
      {data.provisionalRequirements.length > 0 && <details><summary>ข้อจำกัดของฉากที่ควรตรวจเพิ่มเติม</summary><AdminPagedItems items={data.provisionalRequirements}>{(rows) => <ul>{rows.map((item) => <li key={item}>{item}</li>)}</ul>}</AdminPagedItems></details>}
    </>)}
  </section>;
}
