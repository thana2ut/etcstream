"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "./client-api";
import { ArenaShell, ArenaIcon } from "./shell";
import { UnifiedAdmin } from "./unified-admin";
type Admission = { entryId: string; actorId: string; expires: number; serverNow: number; rotate?: boolean };
export function AdminEntryGate() {
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [ready, setReady] = useState(false), [rotate, setRotate] = useState(false);
  const [password, setPassword] = useState(""), [current, setCurrent] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    api("entry-reset", {}, true).then(() => { if (live) { setReady(true); setError(""); } }).catch((e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [attempt]);
  useEffect(() => {
    const fresh = (e: PageTransitionEvent) => { if (e.persisted) { setAdmission(null); setReady(false); setAttempt((v) => v + 1); } };
    window.addEventListener("pageshow", fresh);
    return () => window.removeEventListener("pageshow", fresh);
  }, []);
  if (admission) return <UnifiedAdmin {...admission} onExit={() => { setAdmission(null); setPassword(""); setCurrent(""); setRotate(false); }} />;
  return <ArenaShell admin adminHeader={<header className="admin-gate-header"><Link href="/academy"><span aria-hidden="true">←</span> กลับสำนัก</Link><span className="admin-gate-seal" aria-hidden="true">ETCSTREAM · COMMAND GATE</span></header>}><section className="admin-master-gate admin-celestial-gate arena-panel" aria-labelledby="admin-gate-title"><div className="admin-gate-emblem" aria-hidden="true"><ArenaIcon name="admin" /></div><p className="arena-eyebrow">ศูนย์ควบคุม ETCSTREAM</p><h1 id="admin-gate-title">ผนึกตำหนักบัญชาการ</h1><p className="admin-gate-description">ยืนยันรหัสหลักเพื่อเข้าสู่ศูนย์ดูแลสำนัก</p><div className="admin-gate-divider" aria-hidden="true"><span>✦</span></div><form aria-busy={busy || !ready} onSubmit={async (e) => {
    e.preventDefault(); if (busy || !ready) return; setBusy(true); setError("");
    try {
      const result = await api<Admission>(rotate ? "rotate" : "login", { password, current }, true);
      setPassword(""); setCurrent("");
      if (result.rotate) setRotate(true); else setAdmission(result);
    } catch (e) { setError((e as Error).message); setPassword(""); }
    finally { setBusy(false); }
  }}>{rotate && <><p className="admin-gate-rotation-note">เปลี่ยนรหัสตั้งต้นก่อนเข้าตำหนัก · อย่างน้อย 14 ตัวอักษร ผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์</p><label>รหัสตั้งต้นเดิม<input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} disabled={!ready || busy} /></label></>}<label>{rotate ? "รหัสหลักใหม่" : "รหัสหลักเข้าตำหนัก"}<input type="password" autoComplete={rotate ? "new-password" : "current-password"} required maxLength={128} minLength={rotate ? 14 : 1} value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready || busy} aria-describedby="admin-gate-help" /></label><button className="admin-gate-submit" disabled={!ready || busy}>{busy ? "กำลังยืนยันรหัส…" : !ready ? "กำลังเตรียมประตู…" : rotate ? "เปลี่ยนรหัสและเข้าตำหนัก" : "เปิดผนึกตำหนัก"}<span aria-hidden="true">{busy || !ready ? " ···" : " →"}</span></button></form>{error && <p className="arena-error" role="alert">{error}</p>}{!ready && error && <button className="admin-gate-retry" onClick={() => setAttempt((v) => v + 1)}>เชื่อมต่อประตูอีกครั้ง</button>}<p id="admin-gate-help" className="arena-note admin-gate-helper">เฉพาะผู้ดูแลที่ได้รับอนุญาต · ยืนยันรหัสใหม่ทุกครั้งที่เข้า</p></section></ArenaShell>;
}
