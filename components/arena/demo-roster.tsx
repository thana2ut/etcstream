"use client";
import { useState } from "react";
import { useArenaResource } from "./use-arena-resource";
export function DemoRoster() {
  const [open,setOpen]=useState(false);
  const source=useArenaResource<{enabled:boolean;profiles:{id:string;name:string;label:string}[];label:string}>("demo",60000);
  if (!source.data?.enabled || source.error) return null;
  return <section className="arena-panel arena-demo-roster"><button aria-expanded={open} onClick={()=>setOpen((v)=>!v)}>รายชื่อประกอบ</button>{open&&<><h2>รายชื่อประกอบ</h2><p>{source.data.label} ไม่มีเวลา ไม่มีอันดับ ไม่มีสถานะผู้เล่นออนไลน์ และไม่นับในสถิติจริง</p><ul>{source.data.profiles.map((p)=><li key={p.id}><strong>{p.name}</strong><span>{p.label}</span><small>ไม่มีผลการแข่งขัน</small></li>)}</ul></>}</section>;
}
export function OnlineServiceNotice() {
  const source=useArenaResource<{state:string;available:boolean;message:string}>("status",30000);
  if (!source.error && (source.loading || source.data?.available)) return null;
  return <aside className="arena-panel arena-online-unavailable" role="status"><h3>เชื่อมต่อข้อมูลออนไลน์ไม่สำเร็จ</h3><p>{source.error||source.data?.message}</p><p>จำนวนผู้เล่นและอันดับออนไลน์: —</p><button onClick={source.retry}>เชื่อมต่อข้อมูลอีกครั้ง</button></aside>;
}
