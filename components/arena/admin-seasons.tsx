"use client";
import {useRef,useState} from "react";
import {api, statusText} from "./client-api";
import { ADMIN_PAGE_SIZE, AdminPagination } from "./admin-pagination";

type Season={id:string;name:string;starts:number;ends:number;status:string;scoringVersion:string};
type Review={attempt:string;scenario:string;player:string;state:string;status:string;reason:string};
export function SeasonManager({seasons: allSeasons,onChange}:{seasons:Season[];onChange:()=>Promise<void>}) {
  const [pageIndex, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const pages = Math.max(1, Math.ceil(allSeasons.length / ADMIN_PAGE_SIZE)), page = Math.min(pageIndex, pages - 1);
  const seasons = allSeasons.slice(page * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE + ADMIN_PAGE_SIZE);
  const [name,setName]=useState(""),[starts,setStarts]=useState(""),[ends,setEnds]=useState(""),[reason,setReason]=useState(""),[confirm,setConfirm]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[target,setTarget]=useState<{id:string;action:string}|null>(null);const pending=useRef(false);
  const submit=async(action:string,id?:string)=>{if(pending.current)return;pending.current=true;setBusy(true);try{await api("seasons",{action,id,name,starts:new Date(starts).getTime(),ends:new Date(ends).getTime(),reason,confirm},true);setMessage("บันทึกฤดูกาลและประวัติการดูแลแล้ว");setTarget(null);setCreating(false);setConfirm("");await onChange();}catch(e){setMessage((e as Error).message);}finally{pending.current=false;setBusy(false);}};
  return <><p>กำหนดชื่อและช่วงเวลาแข่งขัน ระบบนับเฉพาะผลที่ผ่านการรับรอง ปิดฤดูกาลได้เมื่อถึงเวลาสิ้นสุด และทุกการเปลี่ยนแปลงต้องระบุเหตุผล</p>
    <div className="admin-panel-toolbar"><h3>รายการฤดูกาล</h3><button type="button" disabled={busy} onClick={()=>{setTarget(null);setCreating(true);setReason("");setConfirm("");}}>+ เพิ่มฤดูกาล</button></div>
    {(creating || target) && <form onSubmit={(e)=>{e.preventDefault();void submit(target?.action || "create",target?.id);}} className="arena-season-admin-form"><h3>{target?`ยืนยันการดำเนินการ · ${target.id}`:"กำหนดฤดูกาลใหม่"}</h3>{!target&&<><label>ชื่อฤดูกาล<input required minLength={2} maxLength={80} value={name} onChange={(e)=>setName(e.target.value)}/></label><label>เริ่ม (เวลาท้องถิ่นของเครื่อง)<input type="datetime-local" required value={starts} onChange={(e)=>setStarts(e.target.value)}/></label><label>สิ้นสุด (เวลาท้องถิ่นของเครื่อง)<input type="datetime-local" required value={ends} onChange={(e)=>setEnds(e.target.value)}/></label></>}<label>เหตุผลที่บันทึกในประวัติ<input required minLength={5} maxLength={500} value={reason} onChange={(e)=>setReason(e.target.value)}/></label><label>พิมพ์ {target?.id || "CREATE"} เพื่อยืนยัน<input required value={confirm} onChange={(e)=>setConfirm(e.target.value)} autoComplete="off"/></label><button disabled={busy||confirm!==(target?.id || "CREATE")}>{busy?"กำลังบันทึก…":"ยืนยันดำเนินการ"}</button><button type="button" disabled={busy} onClick={()=>{setTarget(null);setCreating(false);}}>ยกเลิก</button></form>}<p role="status">{message}</p>
    {seasons.length===0?<p>ยังไม่มีฤดูกาลจริง</p>:seasons.map((s)=><article className="arena-panel" key={s.id}><h3>{s.name}</h3><details><summary>รหัสและกติกา</summary><code>{s.id}</code><p>{s.scoringVersion}</p></details><p>{new Date(s.starts).toLocaleString("th-TH")} – {new Date(s.ends).toLocaleString("th-TH")} · {({scheduled:"รอเปิดฤดูกาล",open:"กำลังแข่งขัน",closed:"ปิดฤดูกาล",archived:"เก็บเข้าประวัติ"} as Record<string,string>)[s.status] ?? s.status}</p>{(s.status==="scheduled"?["open","recompute"]:s.status==="open"?["close","recompute"]:s.status==="closed"?["archive"]:[]).map((action)=><button key={action} disabled={busy} onClick={()=>{setTarget({id:s.id,action});setReason("");setConfirm("");}}>{({open:"เปิดรับตามกำหนด",close:"ปิดและบันทึกอันดับ",recompute:"คำนวณอันดับปัจจุบัน",archive:"เก็บเข้าประวัติ"}[action])}</button>)}</article>)}
    <AdminPagination page={page} totalPages={pages} totalItems={allSeasons.length} onPage={setPage} hasNext={page < pages - 1} busy={busy} />
  </>;
}
export function ReviewManager({ reviews, onChange }: { reviews: Review[]; onChange: () => Promise<void> }) {
  const [target, setTarget] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  return <>
    <details className="admin-help"><summary>ผลรอตรวจคืออะไร และทำอะไรได้บ้าง?</summary><p>ระบบตรวจหลักฐานการเล่นก่อนรับรองผลและจัดอันดับ ผู้ดูแลอ่านรายละเอียดและปฏิเสธผลที่ไม่ถูกต้องพร้อมระบุเหตุผลได้</p></details>
    {reviews.length === 0 ? <div className="admin-empty" role="status"><span aria-hidden="true">✓</span><h4>ไม่มีผลการแข่งขันรอตรวจ</h4><p>เมื่อมีผลรอตรวจ รายการจะแสดงที่นี่</p></div> : <div className="admin-record-list">{reviews.map((r) => <article className="admin-record" key={r.attempt}><div><span className="admin-status-badge">{statusText(r.status)}</span><h4>{r.scenario}</h4><p>{r.reason === "ยังไม่เปิดรับรองอันดับ" ? "รอระบบตรวจหลักฐานก่อนนำผลไปจัดอันดับ" : r.reason}</p><details><summary>รายละเอียดรอบ</summary><p>รอบ <code>{r.attempt}</code></p><p>ผู้ฝึก <code>{r.player}</code></p><p>สถานะจากระบบ: {r.status}</p></details></div>{r.state === "pending" && <button type="button" disabled={busy} onClick={() => { setTarget(r.attempt); setConfirm(""); setReason(""); setMessage(""); }}>พิจารณาปฏิเสธผล</button>}</article>)}</div>}
    {target && <form className="admin-confirm-form" onSubmit={async (e) => {
      e.preventDefault(); if (pending.current) return;
      pending.current = true; setBusy(true); setMessage("");
      try { await api("reviews", { id: target, action: "reject", confirm, reason }, true); setTarget(""); await onChange(); }
      catch (e) { setMessage((e as Error).message); }
      finally { pending.current = false; setBusy(false); }
    }}><h3>ยืนยันปฏิเสธผล</h3><p>รหัสรอบ: <code>{target}</code></p><label>เหตุผล<input required minLength={5} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label><label>พิมพ์รหัสรอบเพื่อยืนยัน<input required autoComplete="off" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label><div className="admin-form-actions"><button className="admin-danger" disabled={busy || confirm !== target || reason.trim().length < 5}>{busy ? "กำลังบันทึก…" : "ยืนยันปฏิเสธผล"}</button><button type="button" disabled={busy} onClick={() => setTarget("")}>ยกเลิก</button></div>{message && <p className="arena-error" role="alert">{message}</p>}</form>}
  </>;
}
