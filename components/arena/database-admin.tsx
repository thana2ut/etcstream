"use client";
import { useState } from "react";
import { api } from "./client-api";
export type DatabaseReport = { state:string; schemaVersion:number; requiredVersion:number; missing:string[];message:string;verifiedSliceEnabled:boolean;supportedStage:string;backend?:string };
export function DatabaseAdmin({ data }: { data: DatabaseReport }) {
  const ready = data.state === "READY";
  return <section><h3>สถานะข้อมูลของเว็บ</h3><dl className="admin-status-list"><div><dt>การเชื่อมต่อข้อมูล</dt><dd>{ready ? "เชื่อมต่อได้" : "ต้องตรวจสอบ"}</dd></div><div><dt>การรับรองผลแข่งขันอัตโนมัติ</dt><dd>{data.verifiedSliceEnabled ? "เปิดใช้งาน" : "ยังไม่เปิดใช้งาน"}</dd></div></dl>
    {!ready && <p className="arena-error" role="alert">{data.message || "ยังอ่านข้อมูลไม่ได้ กรุณาลองโหลดข้อมูลใหม่"}</p>}
    <p className="arena-note">สถานะนี้ตรวจการอ่านข้อมูลล่าสุด การดูแลผู้เล่น สินค้า และผลแข่งขันทำได้จากเมนูของแต่ละหมวด</p>
  </section>;
}
export type DemoReport = { enabled:boolean;environmentEnabled:boolean;selected:boolean;profiles:{id:string;name:string;label:string}[];label:string };
export function DemoAdmin({ data, onChange }: { data:DemoReport;onChange:()=>Promise<void> }) {
  const [reason,setReason]=useState(""),[confirm,setConfirm]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  return <section><h3>รายชื่อประกอบ</h3><p>{data.label}</p><p>การตั้งค่าระบบ: {data.environmentEnabled?"เปิด":"ปิด"} · การแสดงรายชื่อ: {data.enabled?"เปิด":"ปิด"}</p><ul>{data.profiles.map((p)=><li key={p.id}>{p.name} · {p.label} · ไม่มีเวลา/อันดับ/ผลแข่งขัน</li>)}</ul><form onSubmit={async(e)=>{e.preventDefault();if(busy)return;setBusy(true);try{await api("demo",{enabled:!data.selected,reason,confirm},true);await onChange();setError("");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><label>เหตุผล<input required minLength={5} maxLength={500} value={reason} onChange={(e)=>setReason(e.target.value)}/></label><label>พิมพ์ ข้อมูลประกอบ เพื่อยืนยัน<input required value={confirm} onChange={(e)=>setConfirm(e.target.value)}/></label><button disabled={busy||confirm!=="ข้อมูลประกอบ"}>{data.selected?"ซ่อนรายชื่อประกอบ":"แสดงรายชื่อประกอบ"}</button>{error&&<p role="alert">{error}</p>}</form></section>;
}
