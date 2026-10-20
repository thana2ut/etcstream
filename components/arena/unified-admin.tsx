"use client";
import { createPortal } from "react-dom";
import { CompetitionChamber } from "./admin-competition-gate";
import type { AdminPreviewContext } from "@/game/security/admin-preview-types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArenaIcon, ArenaShell } from "./shell";

import { AdminTraining } from "./admin-training";
import { api } from "./client-api";
const MissionHall = dynamic(() => import("@/components/ui/mission-hall").then((m) => m.MissionHall), { ssr: false, loading: () => <p role="status">กำลังเปิดหอภารกิจเดิม…</p> });
const rooms = [
  { id: "competition", title: "ห้องแข่งขัน", subtitle: "จัดการการแข่งขันและทำเนียบเซียน", icon: "arena", note: "ข้อมูลผู้เล่น ผลแข่งขัน ฤดูกาล และประวัติการดูแลจากระบบกลาง" },
  { id: "training", title: "ห้องฝึก", subtitle: "ดูแลระบบฝึกอิสระและสถานะการฝึก", icon: "settings", note: "อ่านการตั้งค่าห้องฝึกจริง · ยังไม่มีข้อมูลฝึกส่วนกลาง" },
  { id: "missions", title: "ห้องภารกิจ", subtitle: "จัดการภารกิจทั้ง 5 สถานที่ 25 ระดับ", icon: "trophy", note: "ใช้หอภารกิจและการเลือกระดับเดิมของสำนัก" },
] as const;
type Room = typeof rooms[number]["id"];
const AdminPreview = dynamic(() => import("./admin-preview").then((m) => m.AdminPreview), { ssr: false });
type AdminSession = { entryId: string; actorId: string; rotate: boolean; expires: number; serverNow: number };
export function UnifiedAdmin({ actorId, expires, serverNow, entryId, onExit }: { entryId: string; actorId: string; expires: number; serverNow: number; onExit: () => void }) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [visited, setVisited] = useState<Room[]>([]);
  const [preview, setPreview] = useState<AdminPreviewContext | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [launching, setLaunching] = useState(false);
  const [locked, setLocked] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const deadline = useRef(Date.now() + Math.max(0, expires - serverNow));
  const heading = useRef<HTMLHeadingElement>(null);
  const check = useCallback(async (signal?: AbortSignal) => {
    setChecking(true);
    try {
      const session = await api<AdminSession>("session", undefined, true, signal);
      if (session.entryId !== entryId || session.rotate || session.actorId !== actorId || session.expires <= session.serverNow) throw new Error("สิทธิ์ผู้ดูแลเปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่");
      deadline.current = Date.now() + session.expires - session.serverNow;
    } catch (e) { if ((e as Error).name !== "AbortError") setLocked((e as Error).message); }
    finally { if (!signal?.aborted) setChecking(false); }
  }, [actorId, entryId]);
  useEffect(() => {
    const controller = new AbortController();
    const lost = () => setLocked("สิทธิ์ผู้ดูแลหมดอายุหรือเปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่");
    const visible = () => { if (document.visibilityState === "visible") void check(controller.signal); };
    const timer = window.setInterval(() => {
      if (Date.now() >= deadline.current) lost();
      else if (!locked) void check(controller.signal);
    }, 15000);
    const expiry = window.setTimeout(lost, Math.max(0, deadline.current - Date.now()));
    window.addEventListener("etc-admin-session-lost", lost);
    document.addEventListener("visibilitychange", visible);
    return () => { controller.abort(); clearInterval(timer); clearTimeout(expiry); window.removeEventListener("etc-admin-session-lost", lost); document.removeEventListener("visibilitychange", visible); };
  }, [check, locked]);
  const choose = (next: Room | null) => {
    setRoom(next);
    if (next) setVisited((old) => old.includes(next) ? old : [...old, next]);
    requestAnimationFrame(() => heading.current?.focus());
  };
  async function logout(destination?: string) {
    if (busy) return;
    setBusy(true);
    setLocked("กำลังออกจากระบบ ข้อมูลผู้ดูแลถูกปิดแล้ว");
    try { await api("logout", {}, true); onExit(); if (destination) router.push(destination); }
    catch (e) { setLocked(`ออกจากระบบยังไม่สำเร็จ: ${(e as Error).message}`); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    const leave = () => { void fetch("/api/admin/logout", { method: "POST", credentials: "same-origin", keepalive: true, headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {}); };
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
  }, []);
  async function launch(body: Record<string, unknown>) {
    if (launching) return;
    setLaunching(true); setPreviewError("");
    try { setPreview(await api<AdminPreviewContext>("preview-start", body, true)); }
    catch (e) { setPreviewError((e as Error).message); throw e; }
    finally { setLaunching(false); }
  }
  async function endPreview() {
    if (!preview) return;
    const id = preview.id;
    setPreview(null);
    try { await api("preview-end", { id }, true); }
    catch (e) { setLocked((e as Error).message); }
  }
  const current = rooms.find((r) => r.id === room);
  const header = room === "missions" && !locked ? <header className="admin-mission-command"><div><h1 ref={heading} tabIndex={-1}>บัญชาการสำนัก / ห้องภารกิจ</h1><span className="admin-command-badge">{checking ? "กำลังตรวจสิทธิ์…" : "ผู้ดูแลหลัก"}</span></div><nav aria-label="คำสั่งห้องภารกิจ"><button onClick={() => choose(null)}>กลับสามห้อง</button><button disabled={busy} onClick={() => void logout("/academy")}>ออกและกลับสำนัก</button><button disabled={busy} onClick={() => void logout()}>ออกจากระบบ</button></nav></header> : <header className="admin-masthead"><div><p className="arena-eyebrow">ศูนย์ควบคุม ETCSTREAM</p><h1>ตำหนักบัญชาการเซียน</h1><p className="arena-note">{locked ? "ปิดข้อมูลผู้ดูแลไว้ชั่วคราว" : "ยืนยันรหัสหลักแล้ว · สิทธิ์ผู้ดูแลฝั่งเซิร์ฟเวอร์"}</p><p className="arena-note">{checking ? "กำลังตรวจสิทธิ์…" : locked ? "ต้องตรวจสิทธิ์อีกครั้ง" : "ตรวจสิทธิ์เป็นระยะ · ข้อมูลแต่ละส่วนโหลดจากแหล่งจริง"}</p></div><div className="admin-header-actions"><button disabled={busy} onClick={() => void logout("/academy")}>ออกและกลับสำนัก</button><button disabled={busy} onClick={() => void logout()}>ออกจากระบบ</button></div></header>;
  return <ArenaShell admin adminHeader={header}><div className="admin-unified" data-room={room ?? "lobby"}>
    {locked ? <section className="arena-panel" role="alert"><h2>ปิดพื้นที่ผู้ดูแล</h2><p>{locked}</p><button disabled={busy || checking} onClick={() => void logout()}>ออกและกรอกรหัสหลักใหม่</button><p>หากออกจากระบบไม่สำเร็จ กรุณากดออกจากระบบอีกครั้งเมื่อเครือข่ายพร้อม</p></section> : <>
      {room && room !== "missions" && <><nav className="admin-room-nav" aria-label="เลือกห้องผู้ดูแล"><button onClick={() => choose(null)}>กลับหน้าหลักแอดมิน</button>{rooms.map((r) => <button key={r.id} aria-pressed={room === r.id} onClick={() => choose(r.id)}>{r.title}</button>)}</nav><h2 ref={heading} tabIndex={-1} className="admin-workspace-title">{current?.title}<small>{current?.subtitle}</small></h2></>}
      {!room && <><h2 ref={heading} tabIndex={-1}>เลือกห้องดูแลระบบ</h2><p className="arena-note">ยืนยันรหัสหลักครั้งเดียว · เข้าจัดการได้ครบทั้งสามห้อง</p><div className="admin-room-grid">{rooms.map((r) => <button className={`admin-room-card admin-room-${r.id}`} key={r.id} onClick={() => choose(r.id)}><ArenaIcon name={r.icon} /><strong>{r.title}</strong><span>{r.subtitle}</span><small>{r.note}</small><span className="admin-room-enter">เข้าสู่ห้อง →</span></button>)}</div></>}
      {previewError && <p className="arena-error" role="alert">{previewError}</p>}
      {room === "competition" && <CompetitionChamber />}
      {visited.includes("training") && <div hidden={room !== "training"}><AdminTraining launching={launching} onPreview={(sceneId) => launch({ chamber: "training", sceneId })} /></div>}
      {visited.includes("missions") && <div hidden={room !== "missions"}><MissionHall admin embedded active={room === "missions" && !preview} onPreview={(slug, level) => launch({ chamber: "missions", slug, level })} /></div>}
      {preview && createPortal(<AdminPreview key={preview.id} context={preview} onExit={() => void endPreview()} />, document.body)}
    </>}
  </div></ArenaShell>;
}
