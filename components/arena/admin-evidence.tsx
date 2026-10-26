"use client";
import { useEffect, useRef, useState } from "react";
import { api, statusText, type AttemptView } from "./client-api";
import { ADMIN_PAGE_SIZE, AdminPagination } from "./admin-pagination";

type Evidence = { attempt: AttemptView; replay: { protocol: string; seq: number; last_hash: string } | null; commands: { seq: number; payload: string; received: number; command_hash: string }[] };
export function AdminEvidence({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<Evidence | null>(null), [error, setError] = useState(""), [offset, setOffset] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    api<Evidence>(`evidence?id=${encodeURIComponent(id)}&offset=${offset}`, undefined, true, controller.signal).then((value) => { if (!controller.signal.aborted) { setData(value); setError(""); } }).catch((e: Error) => { if (!controller.signal.aborted) { setData(null); setError(e.message); } });
    return () => controller.abort();
  }, [id, offset]);
  return <dialog ref={dialog} className="admin-evidence-dialog" aria-labelledby="admin-evidence-title" onCancel={() => onClose()}><section className="arena-panel"><div className="admin-panel-toolbar"><h3 id="admin-evidence-title">หลักฐานการแข่งขัน</h3><button type="button" onClick={onClose}>ปิดหลักฐาน</button></div><details><summary>รหัสรอบ</summary><code>{id}</code></details>
    {error && <p role="alert">{error}</p>}{!data && !error && <p role="status">กำลังอ่านหลักฐานจริง…</p>}
    {data && <><p>{data.attempt.scenario} · {statusText(data.attempt.status)}</p>
      {data.replay ? <p>Protocol {data.replay.protocol} · {data.replay.seq} คำสั่ง · hash สุดท้าย <code>{data.replay.last_hash}</code></p> : <p>รอบนี้ไม่มีประวัติคำสั่งสำหรับตรวจย้อนหลัง</p>}
      <div className="arena-table-wrap"><table><thead><tr><th>ลำดับ/เวลารับ</th><th>คำสั่งจริง</th></tr></thead><tbody>{data.commands.slice(0, ADMIN_PAGE_SIZE).map((command) => <tr key={command.seq}><td>{command.seq}<br />{new Date(command.received).toLocaleString("th-TH")}</td><td><code>{command.payload}</code></td></tr>)}</tbody></table></div>
    </>}
    <AdminPagination page={Math.floor(offset / ADMIN_PAGE_SIZE)} hasNext={Boolean(data && data.commands.length > ADMIN_PAGE_SIZE)} busy={!data || Boolean(error)} onPage={(page) => { setData(null); setError(""); setOffset(page * ADMIN_PAGE_SIZE); }} />
  </section></dialog>;
}
