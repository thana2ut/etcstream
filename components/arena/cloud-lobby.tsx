"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { onlineBrowser } from "@/game/online/supabase-browser";
import { api, type PlayerView } from "./client-api";

export function CloudLobby() {
  const [players, setPlayers] = useState<PlayerView[] | null>(null), [error, setError] = useState("");
  const [transport, setTransport] = useState("กำลังเชื่อมต่อ");
  const lastRefresh = useRef(0);
  const refresh = useCallback(async () => {
    if (Date.now() - lastRefresh.current < 3000) return;
    lastRefresh.current = Date.now();
    try { const value = await api<{ players: PlayerView[] }>("directory"); setPlayers(value.players); setError(""); }
    catch { setError("รายชื่อขาดการเชื่อมต่อ ข้อมูลที่ค้างอยู่ไม่ยืนยันสถานะออนไลน์ปัจจุบัน"); setPlayers(null); }
  }, []);
  useEffect(() => {
    const client = onlineBrowser();
    if (!client) return;
    let active = true;
    const channel = client.channel("etcstream-lobby", { config: { private: true, broadcast: { self: true } } });
    channel.on("broadcast", { event: "roster-changed" }, () => { if (active) void refresh(); });
    channel.subscribe((status) => {
      if (!active) return;
      setTransport(status === "SUBSCRIBED" ? "เชื่อมต่อข้อมูลสดแล้ว" : "ข้อมูลสดขาดการเชื่อมต่อ · กำลังเรียกข้อมูลทุก 30 วินาที");
    });
    void refresh();
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const notify = () => { if (!document.hidden) { void refresh(); void channel.send({ type: "broadcast", event: "roster-changed", payload: {} }); } };
    window.addEventListener("etc-profile-updated", notify);
    return () => { active = false; clearInterval(timer); window.removeEventListener("etc-profile-updated", notify); void client.removeChannel(channel); };
  }, [refresh]);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return <section className="arena-panel" aria-label="ผู้ฝึกที่เชื่อมต่อจริง"><h2>ผู้ฝึกที่ยินยอมแสดงออนไลน์</h2><p role="status">{transport}</p>
    <p className="arena-note">นับหนึ่งตัวตนต่อผู้ฝึก · สถานะหมดอายุภายใน 90 วินาที · แสดงสูงสุด 100 รายชื่อ · เปิดหรือปิดการแสดงได้ในข้อมูลส่วนตัว</p>
    {error ? <p role="alert">{error}</p> : players === null ? <p>กำลังโหลดรายชื่อ…</p> : players.length === 0 ? <p>ยังไม่มีผู้ฝึกที่เปิดเผยสถานะออนไลน์</p> : <ul>{players.map((p) => <li key={p.friendCode}><strong>{p.name}</strong> · รหัสสหาย {p.friendCode}</li>)}</ul>}
  </section>;
}

export function CloudRecovery({ onRecovered }: { onRecovered?: () => Promise<void> }) {
  const [email, setEmail] = useState(""), [token, setToken] = useState(""), [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const pending = useRef(false);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  async function submit(e: FormEvent) {
    e.preventDefault(); if (pending.current) return; pending.current = true; setBusy(true); setMessage("");
    try {
      const client = onlineBrowser(); if (!client) throw Error();
      const result = sent ? await client.auth.verifyOtp({ email, token, type: onRecovered ? "email" : "email_change" }) : onRecovered
        ? await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        : await client.auth.updateUser({ email });
      if (result.error) throw Error();
      if (sent) { setMessage("ยืนยันอีเมลแล้ว"); if (onRecovered) await onRecovered(); }
      else { setSent(true); setMessage("ส่งคำขอแล้ว หากอีเมลใช้ได้ กรุณาตรวจจดหมายและกรอกรหัสยืนยัน"); }
    } catch { setMessage("ยังยืนยันอีเมลไม่ได้ กรุณาตรวจรหัส การตั้งค่าอีเมล และลองใหม่ภายหลัง"); }
    finally { setBusy(false); pending.current = false; }
  }
  return <details className="arena-panel"><summary>{onRecovered ? "กลับมาใช้บัญชีที่ผูกอีเมลไว้" : "ผูกอีเมลเพื่อกู้คืนบัญชี"}</summary>
    <p>บัญชีไม่ใช้อีเมลจะกู้คืนข้ามเครื่องไม่ได้เมื่อออกจากระบบหรือล้างข้อมูลเบราว์เซอร์ ชื่อเล่นและรหัสสหายใช้กู้คืนไม่ได้ กรุณาผูกและยืนยันอีเมลก่อนเก็บอันดับถาวร</p>
    <form onSubmit={submit}><label>อีเมล<input type="email" autoComplete="email" required value={email} disabled={sent || busy} onChange={(e) => setEmail(e.target.value)} /></label>
      {sent && <label>รหัสยืนยันจากอีเมล<input autoComplete="one-time-code" inputMode="numeric" required minLength={6} maxLength={10} value={token} onChange={(e) => setToken(e.target.value)} /></label>}
      <button disabled={busy}>{busy ? "กำลังดำเนินการ…" : sent ? "ยืนยันรหัส" : "ส่งรหัสยืนยัน"}</button><p role="status">{message}</p>
    </form><p className="arena-note">ผู้ดูแลต้องตั้งแม่แบบอีเมล Supabase ให้แสดงรหัสยืนยันก่อนใช้ขั้นตอนนี้</p></details>;
}
