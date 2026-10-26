"use client";
import { createPortal } from "react-dom";
import type { AdminPreviewContext } from "@/game/security/admin-preview-types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArenaIcon, ArenaShell } from "./shell";
import { AdminPanel, adminLabels } from "./admin-panel";
import { AdminTraining } from "./admin-training";
import { EconomyAdmin } from "./admin-economy";
import { CatalogManager } from "./admin-catalog";
import { AdminDashboard } from "./admin-dashboard";
import { AdminSecurity } from "./admin-security";
import { api } from "./client-api";

const MissionHall = dynamic(() => import("@/components/ui/mission-hall").then((m) => m.MissionHall), { ssr: false, loading: () => <p role="status">กำลังเปิดหอภารกิจเดิม…</p> });
const AdminPreview = dynamic(() => import("./admin-preview").then((m) => m.AdminPreview), { ssr: false });

/** V27 control-center navigation. Sub-sections reuse the existing, server-backed admin panels. */
const areas = [
  { id: "overview", title: "ภาพรวม", icon: "trophy", note: "สรุประบบและสิ่งที่ต้องดูแล" },
  { id: "competition", title: "ผู้ฝึกและการแข่งขัน", icon: "arena", note: "จัดการบัญชี ผลแข่งขัน และฤดูกาล", subs: ["players", "competitions", "reviews", "seasons"] },
  { id: "training", title: "ห้องฝึก", icon: "settings", note: "สถานะห้องฝึกและการเข้าเล่นตรวจ" },
  { id: "missions", title: "ห้องภารกิจ", icon: "trophy", note: "เลือกสถานที่และระดับเพื่อเข้าเล่นตรวจ" },
  { id: "market", title: "ตลาดสวรรค์", icon: "trophy", note: "จัดการสินค้า อัปโหลดรูป เปิด/ปิดขาย" },
  { id: "economy", title: "เศรษฐกิจหินวิญญาณ", icon: "trophy", note: "คลัง ธุรกรรม รางวัล เกณฑ์เหรียญ ปรับยอด" },
  { id: "system", title: "ระบบและประวัติ", icon: "settings", note: "เหตุการณ์ความปลอดภัยและการดำเนินการ", subs: ["security", "audit", "database"] },
] as const;
type Area = typeof areas[number]["id"];
type AdminSession = { entryId: string; actorId: string; rotate: boolean; expires: number; serverNow: number };

export function UnifiedAdmin({ actorId, expires, serverNow, entryId, onExit }: { entryId: string; actorId: string; expires: number; serverNow: number; onExit: () => void }) {
  const router = useRouter();
  const [area, setArea] = useState<Area>("overview");
  const [sub, setSub] = useState<Record<string, string>>({ competition: "players", system: "security" });
  const [visited, setVisited] = useState<Area[]>(["overview"]);
  const [preview, setPreview] = useState<AdminPreviewContext | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [launching, setLaunching] = useState(false);
  const [locked, setLocked] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const deadline = useRef(0);
  useEffect(() => { deadline.current = Date.now() + Math.max(0, expires - serverNow); }, [expires, serverNow]);
  const heading = useRef<HTMLHeadingElement>(null);
  const check = useCallback(async (signal?: AbortSignal) => {
    setChecking(true);
    try {
      const session = await api<AdminSession>("session", undefined, true, signal);
      if (session.entryId !== entryId || session.rotate || session.actorId !== actorId || session.expires <= session.serverNow) throw new Error("สิทธิ์ผู้ดูแลเปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่");
      deadline.current = Date.now() + session.expires - session.serverNow;
      setCheckedAt(Date.now());
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
  const choose = (next: Area, nextSub?: string) => {
    setArea(next);
    if (nextSub) setSub((s) => ({ ...s, [next]: nextSub === "leaderboards" ? "competitions" : nextSub }));
    setVisited((old) => old.includes(next) ? old : [...old, next]);
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
  const current = areas.find((a) => a.id === area)!;
  const currentSub = "subs" in current ? sub[area] : undefined;
  const header = <header className="admin-cc-top">
    <div className="admin-cc-brand"><strong>ETCSTREAM</strong><span>ศูนย์ควบคุม</span></div>
    <nav className="admin-cc-crumb" aria-label="ตำแหน่งปัจจุบัน"><span>ศูนย์ควบคุม</span><span aria-hidden="true">›</span><span>{current.title}</span>{currentSub && <><span aria-hidden="true">›</span><span>{adminLabels[currentSub] ?? currentSub}</span></>}</nav>
    <span className={`admin-cc-status${locked ? " is-locked" : ""}`} title={checkedAt ? `ตรวจสิทธิ์ล่าสุด ${new Date(checkedAt).toLocaleTimeString("th-TH")}` : undefined}>{locked ? "ปิดพื้นที่" : checking ? "กำลังตรวจสิทธิ์…" : "ผู้ดูแลหลัก · พร้อมใช้งาน"}</span>
    <div className="admin-cc-actions"><button type="button" disabled={busy} onClick={() => void logout("/academy")}>ออกจากโหมดผู้ดูแล</button></div>
  </header>;
  return <ArenaShell admin adminHeader={header}><div className="admin-unified admin-cc" data-room={area}>
    <a className="admin-skip-link" href="#admin-cc-title">ข้ามไปเนื้อหา</a>
    {locked ? <section className="arena-panel" role="alert"><h2>ปิดพื้นที่ผู้ดูแล</h2><p>{locked}</p><button disabled={busy || checking} onClick={() => void logout()}>ออกและกรอกรหัสหลักใหม่</button><p>หากออกจากระบบไม่สำเร็จ กรุณากดออกจากระบบอีกครั้งเมื่อเครือข่ายพร้อม</p></section> : <>
      <nav id="admin-cc-nav" className="admin-cc-nav" aria-label="ส่วนของศูนย์ควบคุม">
        <div className="admin-nav-caption">พื้นที่ทำงาน</div>
        {areas.map((a) => <div key={a.id} className="admin-cc-group">
          <button type="button" className="admin-cc-link" aria-current={area === a.id ? "page" : undefined} onClick={() => choose(a.id)}><ArenaIcon name={a.icon} /><span>{a.title}</span></button>
        </div>)}
      </nav>
      <section className="admin-cc-main" aria-labelledby="admin-cc-title">
        <header className="admin-page-heading"><div><p className="admin-eyebrow">ศูนย์ดูแลสำนัก</p><h2 id="admin-cc-title" ref={heading} tabIndex={-1} className="admin-cc-title">{current.title}</h2><p className="arena-note">{current.note}</p></div></header>
        {"subs" in current && <nav className="admin-subnav admin-page-tabs" aria-label={`ส่วน${current.title}`}>{current.subs.map((s) => <button type="button" key={s} aria-pressed={currentSub === s} onClick={() => choose(area, s)}>{adminLabels[s] ?? s}</button>)}</nav>}
        {previewError && <p className="arena-error" role="alert">{previewError}</p>}
        {area === "overview" && <AdminDashboard onGo={(a, s) => choose(a as Area, s)} />}
        {area === "competition" && <AdminPanel key={sub.competition} section={sub.competition} />}
        {visited.includes("training") && <div hidden={area !== "training"}><AdminTraining launching={launching} onPreview={(sceneId) => launch({ chamber: "training", sceneId })} /></div>}
        {visited.includes("missions") && <div hidden={area !== "missions"}><MissionHall admin embedded active={area === "missions" && !preview} onPreview={(slug, level) => launch({ chamber: "missions", slug, level })} /></div>}
        {area === "market" && <CatalogManager />}
        {area === "economy" && <EconomyAdmin />}
        {area === "system" && (sub.system === "security" ? <AdminSecurity /> : <AdminPanel key={sub.system} section={sub.system} />)}
      </section>
      {preview && createPortal(<AdminPreview key={preview.id} context={preview} onExit={() => void endPreview()} />, document.body)}
    </>}
  </div></ArenaShell>;
}
