"use client";
import { useEffect, useState } from "react";
import { api } from "./client-api";
import type { TrainingStatus } from "@/server/arena/training-status";
const sections = ["ภาพรวมการฝึก", "สถานะระบบฝึก", "ผู้ฝึกและประวัติ", "การตั้งค่าการฝึก", "บันทึกและกิจกรรม"];
export function AdminTraining({ onPreview, launching }: { onPreview: (sceneId: string) => Promise<void>; launching: boolean }) {
  const [section, setSection] = useState(0);
  const [data, setData] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<TrainingStatus>("training", undefined, true, controller.signal).then(setData).catch((e: Error) => { if (e.name !== "AbortError") { setData(null); setError(e.message); } });
    return () => controller.abort();
  }, [refresh]);
  return <><nav className="admin-subnav" aria-label="ส่วนจัดการห้องฝึก">{sections.map((s, i) => <button key={s} aria-pressed={section === i} onClick={() => setSection(i)}>{s}</button>)}</nav>
    <section className="arena-panel"><h3>{sections[section]}</h3>
    {error && <p className="arena-error" role="alert">{error}</p>}
    <button onClick={() => { setData(null); setError(""); setRefresh((v) => v + 1); }}>อ่านการตั้งค่าใหม่</button>
    {!data && !error && <p role="status">กำลังอ่านการตั้งค่าระบบฝึก…</p>}
    {data && <>
      <div className="admin-training-scenes">
        <article className="admin-training-scene"><h4>ห้องฝึกอิสระเดิม</h4><p>Studio Room 01 · ใช้ฉากและระบบเดิม หากชุดสายยังมีสมมติฐาน ระบบจะแจ้งจุดที่ต้องยืนยันก่อนเข้า</p><button disabled={launching} onClick={() => { void onPreview("studio-full").catch(() => {}); }}>เข้าสู่ห้องฝึก (ผู้ดูแล)</button></article>
        <article className="admin-training-scene"><h4>ตัวอย่างฝึก HDMI เดิม</h4><p>hdmi-basic · กล้อง → เครื่องสลับภาพ → จอ · อ่านชนิดและจำนวนสายจากข้อกำหนดจริง</p><button disabled={launching} onClick={() => { void onPreview("hdmi-basic").catch(() => {}); }}>เข้าสู่ห้องฝึก (ผู้ดูแล)</button></article>
      </div>
      {section === 0 && <><p>ห้องฝึกอิสระเดิม · {data.sceneId}</p><dl className="admin-config-stats"><div><dt>อุปกรณ์ในฉาก</dt><dd>{data.devices.length}</dd></div><div><dt>สายตามการตั้งค่า</dt><dd>{data.cables.length}</dd></div><div><dt>พอร์ต</dt><dd>{data.portCount}</dd></div><div><dt>เงื่อนไขเส้นทาง</dt><dd>{data.requirementCount}</dd></div></dl><p>แหล่งข้อมูล: <code>{data.source}</code></p><p>ยังไม่มีข้อมูลฝึกส่วนกลาง ข้อมูลนี้เป็นการตั้งค่าในโค้ด ไม่ใช่จำนวนผู้เล่นหรือผลตรวจเกมที่กำลังทำงาน</p></>}
      {section === 1 && <><p>มีการจัดวางอุปกรณ์ {data.placeableCount} รายการ และเงื่อนไขการกระทำ {data.actionCount} รายการตามโค้ดเดิม รองรับการยกวาง ต่อพอร์ต และตรวจเส้นทางสัญญาณตามระบบฝึกเดิม ยังไม่ได้ตรวจความพร้อมขณะเล่น</p><h4>อุปกรณ์</h4><div className="arena-table-wrap"><table><thead><tr><th>รหัส / อุปกรณ์</th><th>รุ่นตามการตั้งค่า</th><th>สถานะอ้างอิงในโค้ด</th></tr></thead><tbody>{data.devices.map((d) => <tr key={d.id}><td>{d.id} · {d.label}</td><td>{d.model}</td><td>{d.verified ? "ระบุว่าอ้างอิงแล้วในโค้ดเดิม" : "ยังเป็นสมมติฐาน"}</td></tr>)}</tbody></table></div><h4>สายที่ใช้ในห้องฝึกนี้</h4><ul>{data.cables.map((c) => <li key={c.id}>{c.label} · {c.ends.join(" ↔ ")}</li>)}</ul><h4>เส้นทางที่โค้ดเดิมระบุว่ายังต้องยืนยัน</h4><ul>{data.provisionalRequirements.map((r) => <li key={r}>{r}</li>)}</ul></>}
      {section === 2 && <p>ยังไม่มีข้อมูลฝึกส่วนกลาง ประวัติฝึกเดิมอยู่ในเบราว์เซอร์ของผู้เล่น จึงยังเรียกดูประวัติผู้เล่นคนอื่นจากหน้านี้ไม่ได้</p>}
      {section === 3 && <p>การตั้งค่าห้องฝึกอ่านจากโค้ดเดิม ยังไม่มีคำสั่งผู้ดูแลสำหรับแก้การตั้งค่าระหว่างใช้งาน จึงไม่มีปุ่มบันทึกหรือรีเซ็ตข้อมูลผู้เล่นในส่วนนี้</p>}
      {section === 4 && <p>ยังไม่มีบันทึกกิจกรรมการฝึกส่วนกลาง ประวัติการดูแลการแข่งขันอยู่ในห้องแข่งขันและไม่ใช่ประวัติฝึกอิสระ</p>}
    </>}
    </section></>;
}
